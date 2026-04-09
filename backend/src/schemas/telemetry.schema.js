const { z } = require('zod');

// Schema for ESP32 incoming JSON packets
// Validates types and strictly rejects invalid data before MongoDB insertion
const telemetrySchema = z.object({
  device_id: z.string().min(1, "Device ID is required"),
  servo_angle: z.number().min(0).max(180),
  status: z.enum(["active", "inactive"]),
  uptime: z.number().nonnegative(),
});

module.exports = {
  telemetrySchema,
};
