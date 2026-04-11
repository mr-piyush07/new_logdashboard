const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  components: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: null
  }
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
