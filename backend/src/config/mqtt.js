const mqtt = require('mqtt');
const env = require('./env');
const logger = require('./logger');

// Create random client ID for the backend consumer
const clientId = `backend_consumer_${Math.random().toString(16).slice(3)}`;

// Construct WSS/MQTT URL
// Because it's TLS 8883, we use mqtts protocol
const connectUrl = `mqtts://${env.MQTT_HOST}:${env.MQTT_PORT}`;

logger.info(`Initializing MQTT connection to ${env.MQTT_HOST}...`);

const mqttClient = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 5000,
  username: env.MQTT_USERNAME,
  password: env.MQTT_PASSWORD,
  reconnectPeriod: 2000,
});

mqttClient.on('connect', () => {
  logger.info('SUCCESS: Backend attached to HiveMQ Cloud via MQTT');
});

mqttClient.on('reconnect', () => {
  logger.warn('Reconnecting to HiveMQ broker...');
});

mqttClient.on('error', (error) => {
  logger.error(`MQTT Client Error: ${error.message}`);
});

mqttClient.on('offline', () => {
  logger.warn('MQTT Client went offline.');
});

module.exports = mqttClient;
