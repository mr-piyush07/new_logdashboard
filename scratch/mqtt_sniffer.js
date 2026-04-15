const mqtt = require('mqtt');
require('dotenv').config({ path: '../backend/.env' });

const connectUrl = `mqtts://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`;
const clientId = `debug_sniffer_${Math.random().toString(16).slice(3)}`;

console.log(`Connecting to ${connectUrl}...`);

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

client.on('connect', () => {
  console.log('Connected! Subscribing to #');
  client.subscribe('#', (err) => {
    if (err) console.error('Sub error:', err);
  });
});

client.on('message', (topic, message) => {
  console.log(`[${topic}] ${message.toString()}`);
});

client.on('error', (err) => {
  console.error('MQTT Error:', err);
});

// Run for 30 seconds then exit
setTimeout(() => {
  console.log('Closing sniffer...');
  client.end();
  process.exit(0);
}, 30000);
