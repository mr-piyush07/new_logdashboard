const Device = require('../models/device.model');
const DynamicTelemetry = require('../models/dynamicTelemetry.model');
const { componentsConfig, COMPONENT_KEYS } = require('../config/components');

// Get components configuration list
exports.getComponentsConfig = (req, res) => {
  res.json({ success: true, components: componentsConfig });
};

// Create a new dynamic device
exports.createDevice = async (req, res) => {
  try {
    const { deviceId, components } = req.body;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid device ID' });
    }

    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one component is required' });
    }

    if (components.length > 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 components allowed per device' });
    }

    // Validate component selection strictly against components config
    const invalidComponents = components.filter(c => !COMPONENT_KEYS.includes(c));
    if (invalidComponents.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid components selected: ${invalidComponents.join(', ')}` 
      });
    }

    // Check if device already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(409).json({ success: false, message: 'Device ID already exists' });
    }

    const device = new Device({ deviceId, components });
    await device.save();

    res.status(201).json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all dynamic devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get telemetry historical data for a specific device
exports.getDeviceTelemetry = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const data = await DynamicTelemetry.find({ deviceId: id })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ success: true, data: data.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a dynamic device and all its associated telemetry data
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from the device registry
    const deviceResult = await Device.deleteOne({ deviceId: id });
    if (deviceResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    // Wipe all historical data for this device cleanly
    await DynamicTelemetry.deleteMany({ deviceId: id });

    res.json({ success: true, message: `Device ${id} and all associated data deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
