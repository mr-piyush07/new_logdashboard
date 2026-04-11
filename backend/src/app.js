// Main Server App
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Configs - Ensure .env is handled immediately
const env = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/db');

// Router
const authRoutes = require('./routes/auth.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const deviceRoutes = require('./routes/device.routes');

// Services
const { initMqttService } = require('./services/mqtt.service');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket with CORS setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api', telemetryRoutes);
app.use('/api', deviceRoutes);

// Health check definition (ideal for AWS target groups / render checks)
app.get('/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));

// Initialize MongoDB
connectDB();

// Initialize MQTT and pass the socket instance inside
initMqttService(io);

// WebSocket lifecycle monitoring
io.on('connection', (socket) => {
  logger.info(`WSS: Frontend Dashboard Client Connected [${socket.id}]`);
  
  socket.on('disconnect', () => {
    logger.info(`WSS: Client Disconnected [${socket.id}]`);
  });
});

// Server boot-up
server.listen(env.PORT, () => {
  logger.info(`SERVER: Start success! API listening on http://localhost:${env.PORT}`);
  logger.info('WSS: WebSocket Server is attached and active.');
});
