const mongoose = require('mongoose');

const DEFAULT_ATLAS_URI = 'mongodb+srv://ajayworkon04_db_user:Rajmishra%40321@cluster0.8annony.mongodb.net/casa?retryWrites=true&w=majority&appName=Cluster0';

// Global cache for serverless environments (prevents connection storms)
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  // If connection is already open, reuse it immediately
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`✅ [MongoDB Atlas Connected]: ${mongooseInstance.connection.host}`);
      return mongooseInstance.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.warn(`⚠️ [MongoDB Warning]: Could not connect to Atlas at "${uri.split('@')[1] || uri}".`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`   ℹ️ CASA Server is running with the built-in resilient In-Memory Data Store fallback.`);
    return null;
  }
};

const getDBStatus = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, getDBStatus };

