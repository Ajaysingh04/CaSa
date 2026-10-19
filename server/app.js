const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { connectDB, getDBStatus } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const { getPublicSettings } = require('./controllers/adminController');

const app = express();

// Enable trust proxy for Vercel, reverse proxies, and rate limiters
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local and production deployment
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  })
);

// Handle preflight OPTIONS requests across all routes
app.options('*', cors());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serverless DB connection middleware (ensures connection is established if MONGODB_URI is provided)
let isDbConnecting = false;
app.use(async (req, res, next) => {
  if (!getDBStatus() && !isDbConnecting && process.env.MONGODB_URI) {
    isDbConnecting = true;
    try {
      await connectDB();
    } catch (e) {
      console.warn('DB connect error:', e.message);
    } finally {
      isDbConnecting = false;
    }
  }
  next();
});

// Helper to register all routes under both `/api` and root `` (for Vercel rewrites compatibility)
const registerRoutes = (prefix = '') => {
  // Rate limiter for general routes
  app.use(`${prefix}/`, apiLimiter);

  // Health check endpoint
  app.get(`${prefix}/health`, (req, res) => {
    res.status(200).json({
      status: 'online',
      appName: 'CASA E-Commerce API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: getDBStatus() ? 'MongoDB Connected' : 'In-Memory Resilient Store',
      environment: process.env.NODE_ENV || 'production'
    });
  });

  // Public settings route for Store Name, Brand Color, Tagline & Language
  app.get(`${prefix}/settings/public`, getPublicSettings);

  // Main API Endpoints
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/cart`, cartRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
  app.use(`${prefix}/user`, userRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/banners`, bannerRoutes);
};

// Register for standard `/api` prefix
registerRoutes('/api');

// Also register without `/api` prefix in case Vercel rewrites forward as `/auth/login`
registerRoutes('');

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl || req.url}`
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
