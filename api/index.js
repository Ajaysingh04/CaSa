const app = require('../server/app');
const { connectDB, getDBStatus } = require('../server/config/db');

module.exports = async (req, res) => {
  if (!getDBStatus()) {
    try {
      await connectDB();
    } catch (e) {
      console.warn('DB connect warning in serverless handler:', e.message);
    }
  }
  return app(req, res);
};
