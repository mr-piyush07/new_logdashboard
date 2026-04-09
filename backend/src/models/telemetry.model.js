const mongoose = require('mongoose');

// Mongoose Schema using native MongoDB Time Series configuration
const telemetrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
  },
  device_id: {
    type: String,
    required: true,
  },
  servo_angle: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  uptime: {
    type: Number,
    required: true,
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'device_id',
    granularity: 'minutes' // Optimized for 5-minute intervals
  }
});

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;
