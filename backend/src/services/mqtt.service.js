const mqttClient = require('../config/mqtt');
const logger = require('../config/logger');
const cacheService = require('./cache.service'); // for legacy servo data
const { telemetrySchema } = require('../schemas/telemetry.schema');

const Device = require('../models/device.model');
const DynamicTelemetry = require('../models/dynamicTelemetry.model');
const { componentsConfig, COMPONENT_KEYS } = require('../config/components');

let io = null;

// In-memory cache for dynamic devices to avoid DB hits on every message
// format: { "dev123": { components: ["temp", "hum"], lastSeenUpdated: 1612... } }
const deviceCache = {};

// Throttle interval for lastSeen updates (milliseconds)
const LAST_SEEN_THROTTLE_MS = 30000;

// Helper to validate and filter dynamic payload based on allowed components
const processDynamicPayload = (rawPayload, allowedComponents) => {
  const filteredData = {};
  let hasValidData = false;

  allowedComponents.forEach(comp => {
    if (rawPayload.hasOwnProperty(comp)) {
      const val = rawPayload[comp];
      const conf = componentsConfig[comp];
      
      if (conf) {
        // Enforce type and min/max logic
        if (conf.type === 'Number' && typeof val === 'number') {
          if (val >= conf.min && val <= conf.max) {
             filteredData[comp] = val;
             hasValidData = true;
          }
        } else if (conf.type === 'Boolean' && typeof val === 'boolean') {
          filteredData[comp] = val;
          hasValidData = true;
        } else if (conf.type === 'Boolean' && typeof val === 'number') {
           // Allow 0/1 as boolean
           filteredData[comp] = val !== 0;
           hasValidData = true;
        }
      }
    }
  });

  return { isValid: hasValidData, filteredData };
};


const initMqttService = (socketIoInstance) => {
  io = socketIoInstance;

  mqttClient.on('connect', () => {
    const legacyTopic = 'devices/+/telemetry';     // Old hardware
    const servoTopic = 'devices/servo/+/telemetry';  // New servo architecture routing
    const dynamicTopic = 'devices/dynamic/+/telemetry';

    mqttClient.subscribe([legacyTopic, servoTopic, dynamicTopic], (err) => {
      if (err) {
        logger.error(`MQTT Subscription Error: ${err.message}`);
      } else {
        logger.info(`SUCCESS: Subscribed to topics: ${legacyTopic}, ${servoTopic}, ${dynamicTopic}`);
      }
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const payloadString = message.toString();
      logger.info(`INCOMING MQTT: Topic=[${topic}] Payload=[${payloadString}]`);
      
      let rawPayload;
      try {
        rawPayload = JSON.parse(payloadString);
      } catch (parseErr) {
        logger.error(`MQTT JSON Parse Error on topic ${topic}: ${parseErr.message}`);
        return;
      }

      // --- LEGACY SERVO PIPELINE ---
      // Matches both 3-level 'devices/esp32_01/telemetry' and 4-level 'devices/servo/...'
      if (topic.startsWith('devices/servo/') || topic.split('/').length === 3) {
        const validateResult = telemetrySchema.safeParse(rawPayload);

        if (!validateResult.success) {
          logger.warn(`Invalid servo payload on topic ${topic}: ${validateResult.error.message}`);
          return;
        }

        const payload = validateResult.data;
        payload.timestamp = new Date().toISOString(); 
        
        // Ingest to in-memory cache and background aggregation buffer
        cacheService.ingestData(payload.device_id, payload);

        // Broadcast live data to Dashboard clients
        if (io) {
          io.emit('telemetry', payload);
        }
        return;
      }

      // --- DYNAMIC CONTROLLED PIPELINE ---
      if (topic.startsWith('devices/dynamic/')) {
        const parts = topic.split('/');
        const deviceId = parts[2]; // devices/dynamic/{deviceId}/telemetry

        // Fetch from cache or DB
        let deviceConfig = deviceCache[deviceId];
        if (!deviceConfig) {
          const dbDev = await Device.findOne({ deviceId });
          if (!dbDev) {
             logger.warn(`Unknown dynamic device received data: ${deviceId}`);
             return;
          }
          deviceCache[deviceId] = {
            components: dbDev.components,
            lastSeenUpdated: 0
          };
          deviceConfig = deviceCache[deviceId];
        }

        // Validate & Filter Data
        const { isValid, filteredData } = processDynamicPayload(rawPayload, deviceConfig.components);

        if (!isValid) {
           logger.warn(`No valid configured components found in payload for ${deviceId}`);
           return;
        }

        const now = Date.now();
        
        // Update lastSeen throttled
        if (now - deviceConfig.lastSeenUpdated > LAST_SEEN_THROTTLE_MS) {
           await Device.updateOne({ deviceId }, { $set: { lastSeen: new Date(now) } });
           deviceConfig.lastSeenUpdated = now;
        }

        // Store exactly the filtered fields
        const record = new DynamicTelemetry({
           deviceId,
           timestamp: new Date(now),
           data: filteredData
        });
        await record.save();

        if (io) {
           // Emit specialized event for dynamic dashboard
           io.emit(`dynamic_telemetry_${deviceId}`, {
             deviceId,
             timestamp: new Date(now).toISOString(),
             data: filteredData
           });
        }
      }

    } catch (err) {
      logger.error(`Failed to completely process message on ${topic}: ${err.message}`);
    }
  });
};
const publishControlCommand = (deviceId, commandPayload) => {
  if (!mqttClient.connected) {
    logger.error('Cannot publish command, MQTT is disconnected.');
    throw new Error('MQTT broker is disconnected');
  }
  const topic = `devices/${deviceId}/control`;
  const payloadStr = JSON.stringify(commandPayload);
  
  logger.info(`OUTGOING MQTT: Topic=[${topic}] Payload=[${payloadStr}]`);
  
  mqttClient.publish(topic, payloadStr, { qos: 1, retain: false }, (err) => {
    if (err) {
      logger.error(`Failed to publish control command to ${topic}: ${err.message}`);
    } else {
      logger.info(`Successfully dispatched control command to broker.`);
    }
  });
};

module.exports = { initMqttService, publishControlCommand };