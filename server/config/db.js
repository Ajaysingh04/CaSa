const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse connection
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  const isVercelOrProd = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI || (!isVercelOrProd ? 'mongodb://127.0.0.1:27017/casa' : null);

  if (!uri) {
    isConnected = false;
    console.log('ℹ️ Running in resilient In-Memory Store mode (no MONGODB_URI specified for serverless environment).');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ [MongoDB Warning]: Could not connect to MongoDB at "${uri.split('@')[1] || uri}".`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`   ℹ️ CASA Server is running with the built-in resilient In-Memory Data Store fallback.`);
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
