const mongoose = require('mongoose');

const dynamicTelemetrySchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true // Index for fast retrieval by device ID
  },
  timestamp: {
    type: Date,
    required: true,
    index: true // Index for time-series queries
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed // Allow both Numbers and Booleans depending on config
  }
}, {
  // Configured as Native TimeSeries if Mongoose 6+ and MongoDB 5.0+ 
  // We mirror the original telemetry structure here for maximum storage efficiency
  timeseries: {
    timeField: 'timestamp',
    metaField: 'deviceId',
    granularity: 'minutes'
  }
});

// Since timeseries collections auto-index timestamp and metaField, explicit indexes might be redundant,
// but they act as a fallback if the DB doesn't support timeseries fully. We rely on the native timeseries creation.

const DynamicTelemetry = mongoose.model('DynamicTelemetry', dynamicTelemetrySchema);

module.exports = DynamicTelemetry;
