const { z } = require('zod');
const dotenv = require('dotenv');
const logger = require('./logger');

// Load environment variables
dotenv.config();

// Define schema for environment variables to ensure backend fails fast if properly are missing
const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().url(),
  MQTT_HOST: z.string(),
  MQTT_PORT: z.string().regex(/^\d+$/).transform(Number),
  MQTT_USERNAME: z.string(),
  MQTT_PASSWORD: z.string(),
  JWT_SECRET: z.string()
});

// Execute Zod validation
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error('CRITICAL: Invalid or missing environment variables!');
  logger.error(parsedEnv.error.format());
  process.exit(1); // Stop server immediately
}

module.exports = parsedEnv.data;
