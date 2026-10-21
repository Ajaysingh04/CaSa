const app = require('../server/app');
const { connectDB, getDBStatus } = require('../server/config/db');

module.exports = async (req, res) => {
  // Normalize URL from Vercel rewrites if needed
  const vercelOriginal =
    req.headers['x-vercel-original-uri'] ||
    req.headers['x-matched-path'] ||
    req.headers['x-rewrite-url'];

  if (vercelOriginal && vercelOriginal.startsWith('/api') && req.url.startsWith('/api/index.js')) {
    req.url = vercelOriginal;
  }

  // Ensure DB connection is established before processing request
  if (!getDBStatus()) {
    try {
      await connectDB();
    } catch (e) {
      console.warn('DB connect warning in serverless handler:', e.message);
    }
  }

  // Ensure Express completes full response lifecycle before serverless function exits
  return new Promise((resolve) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    app(req, res);
  });
};
