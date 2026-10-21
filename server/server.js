require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO Real-Time Engine
initSocket(server);

// Start HTTP server immediately so port 5000 is never unavailable during DB connection or reload
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CASA E-Commerce Server running on port ${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Real-Time WebSockets: Active (Socket.IO)`);
  console.log(`🛒 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Connect to MongoDB asynchronously
connectDB().catch((err) => {
  console.error(`[MongoDB Connection Error]: ${err.message}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});
