const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetry.controller');

router.get('/telemetry/latest', telemetryController.getLatest);
router.get('/telemetry/history', telemetryController.getHistory);
router.post('/telemetry/control', telemetryController.postControl);
router.get('/legacy-devices', telemetryController.getDevices);

module.exports = router;
