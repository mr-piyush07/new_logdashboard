const cacheService = require('../services/cache.service');
const telemetryService = require('../services/telemetry.service');
const { publishControlCommand } = require('../services/mqtt.service');
const logger = require('../config/logger');

const getLatest = (req, res) => {
  const { device_id } = req.query;

  if (!device_id) {
    return res.status(400).json({ error: 'device_id query parameter is required' });
  }

  const data = cacheService.getLatest(device_id);
  
  if (!data) {
    return res.status(404).json({ error: 'No live data found for this device in cache.' });
  }

  return res.json(data);
};

const getHistory = async (req, res) => {
  const { device_id, limit } = req.query;

  const pLimit = limit ? parseInt(limit, 10) : 50;

  try {
    const data = await telemetryService.getHistory(device_id, pLimit);
    return res.json(data);
  } catch (err) {
    logger.error(`API Fetch Error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch historical data from database' });
  }
};

const getDevices = (req, res) => {
  const devices = cacheService.getDevices();
  return res.json({ devices });
};

const postControl = (req, res) => {
  const { device_id, command, state } = req.body;
  if (!device_id || !command || !state) {
    return res.status(400).json({ error: 'device_id, command, and state are required fields in the payload.' });
  }

  try {
    publishControlCommand(device_id, { command, state });
    return res.json({ success: true, message: `Command successfully dispatched to ${device_id}.` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to dispatch command to broker.'});
  }
};

module.exports = {
  getLatest,
  getHistory,
  getDevices,
  postControl
};
