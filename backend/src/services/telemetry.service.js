const Telemetry = require('../models/telemetry.model');

class TelemetryService {
  // Fetch historical data from MongoDB (Aggregated 5-minute values)
  async getHistory(device_id, limit = 50) {
    const query = device_id ? { device_id } : {};
    return await Telemetry.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}

module.exports = new TelemetryService();
