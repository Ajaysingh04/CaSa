const rateLimit = require('express-rate-limit');

// Serverless-safe client IP extractor for Vercel, proxies, and localhost
const getClientIp = (req) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return (
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  } catch (e) {
    return '127.0.0.1';
  }
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { xForwardedForHeader: false, default: false },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Strict limiter for authentication routes (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // 60 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { xForwardedForHeader: false, default: false },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

module.exports = { apiLimiter, authLimiter };
