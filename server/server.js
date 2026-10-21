require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO Real-Time Engine
initSocket(server);

// Connect to MongoDB
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CASA E-Commerce Server running on port ${PORT}`);
    console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Real-Time WebSockets: Active (Socket.IO)`);
    console.log(`🛒 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection]: ${err.message}`);
  });
});
