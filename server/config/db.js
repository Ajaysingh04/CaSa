const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/casa';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ [MongoDB Warning]: Could not connect to MongoDB at "${uri}".`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`   ℹ️ CASA Server is running with the built-in resilient In-Memory Data Store fallback.`);
    console.warn(`   To connect to MongoDB Atlas, update MONGODB_URI in server/.env with your connection string.`);
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
