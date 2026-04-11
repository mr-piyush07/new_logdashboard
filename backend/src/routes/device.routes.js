const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

// GET /api/components-config -> get valid components
router.get('/components-config', deviceController.getComponentsConfig);

// POST /api/devices -> Create device
router.post('/devices', deviceController.createDevice);

// GET /api/devices -> Get all devices
router.get('/devices', deviceController.getAllDevices);

// GET /api/devices/:id/telemetry -> Get historical data for device
router.get('/devices/:id/telemetry', deviceController.getDeviceTelemetry);

// DELETE /api/devices/:id -> Delete a device and its data
router.delete('/devices/:id', deviceController.deleteDevice);

module.exports = router;
