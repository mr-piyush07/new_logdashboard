const Telemetry = require('../models/telemetry.model');
const logger = require('../config/logger');

/**
 * In-memory cache to hold the live values for GET /api/telemetry/latest
 * and to buffer high-frequency 2-second values for 5-minute aggregation logic.
 */
class CacheService {
  constructor() {
    this.liveCache = new Map(); // device_id => latest payload
    this.aggregationBuffer = new Map(); // device_id => array of payloads
    
    // Changed to 10 seconds for testing/development visibility.
    // In production, you may want to increase this back to 5 minutes (5 * 60 * 1000)
    this.FLUSH_INTERVAL = 10 * 1000; 

    // Start background flusher
    setInterval(() => this.flushToDatabase(), this.FLUSH_INTERVAL);
  }

  // Update latest value and push to aggregation buffer
  ingestData(device_id, payload) {
    this.liveCache.set(device_id, payload);

    if (!this.aggregationBuffer.has(device_id)) {
      this.aggregationBuffer.set(device_id, []);
    }
    this.aggregationBuffer.get(device_id).push(payload);
  }

  // Retrieve the live value for a device
  getLatest(device_id) {
    return this.liveCache.get(device_id) || null;
  }

  // Retrieve all connected devices
  getDevices() {
    return Array.from(this.liveCache.keys());
  }

  // Aggregate and save to MongoDB
  async flushToDatabase() {
    logger.debug('SYSTEM: Running aggregation flush to MongoDB...');
    
    if (this.aggregationBuffer.size === 0) return;

    const documentsToInsert = [];
    const now = new Date();

    for (const [device_id, payloads] of this.aggregationBuffer.entries()) {
      if (payloads.length === 0) continue;

      // Calculate averages & extract latest state
      const count = payloads.length;
      const avg_servo = payloads.reduce((sum, p) => sum + p.servo_angle, 0) / count;
      const latest_status = payloads[count - 1].status;
      const latest_uptime = payloads[count - 1].uptime;

      documentsToInsert.push({
        timestamp: now,
        device_id,
        servo_angle: Math.round(avg_servo),
        status: latest_status,
        uptime: latest_uptime
      });
    }

    // Clear buffer for next cycle
    this.aggregationBuffer.clear();

    if (documentsToInsert.length > 0) {
      try {
        await Telemetry.insertMany(documentsToInsert);
        logger.info(`DB WRITE: Flushed ${documentsToInsert.length} aggregated records to MongoDB.`);
      } catch (error) {
        logger.error(`Error flushing telemetry to MongoDB: ${error.message}`);
      }
    }
  }
}

module.exports = new CacheService();
