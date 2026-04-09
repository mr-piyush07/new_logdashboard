const mqttClient = require('../config/mqtt');
const logger = require('../config/logger');
const cacheService = require('./cache.service');
const { telemetrySchema } = require('../schemas/telemetry.schema');

let io = null;

const initMqttService = (socketIoInstance) => {
  io = socketIoInstance;

  mqttClient.on('connect', () => {
    const topic = 'devices/+/telemetry';

    mqttClient.subscribe(topic, (err) => {
      if (err) {
        logger.error(`MQTT Subscription Error: ${err.message}`);
      } else {
        logger.info(`SUCCESS: Subscribed to topic: ${topic}`);
      }
    });
  });

  mqttClient.on('message', (topic, message) => {
    try {
      const payloadString = message.toString();
      const rawPayload = JSON.parse(payloadString);

      // Validate incoming data against our Zod schema
      const validateResult = telemetrySchema.safeParse(rawPayload);

      if (!validateResult.success) {
        logger.warn(`Invalid payload on topic ${topic}: ${validateResult.error.message}`);
        return;
      }

      const payload = validateResult.data;
      payload.timestamp = new Date().toISOString(); // Inject backend time
      
      // Ingest to in-memory cache and background aggregation buffer
      cacheService.ingestData(payload.device_id, payload);

      // Log success to terminal
      logger.info(`MQTT Rx -> ${topic}: device_id=${payload.device_id}, servo=${payload.servo_angle}, status=${payload.status}`);

      // Broadcast live data to Dashboard clients
      if (io) {
        io.emit('telemetry', payload);
      }

    } catch (err) {
      logger.error(`Failed to completely process message on ${topic}: ${err.message}`);
    }
  });
};

module.exports = { initMqttService };