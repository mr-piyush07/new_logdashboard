const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetry.controller');

router.get('/telemetry/latest', telemetryController.getLatest);
router.get('/telemetry/history', telemetryController.getHistory);
router.get('/devices', telemetryController.getDevices);

module.exports = router;
