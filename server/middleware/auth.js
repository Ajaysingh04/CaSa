const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.casa_token) {
    token = req.cookies.casa_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'casa_super_secret_jwt_key_2026_dev_secure'
    );

    if (getDBStatus()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      const user = dataStore.users.find(u => u._id === decoded.id);
      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Server-side check for suspended or deactivated accounts
    if (req.user.isActive === false || req.user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: req.user.suspensionReason
          ? `Your account has been suspended: ${req.user.suspensionReason}`
          : 'Your account has been suspended by administration. Please contact support.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed. Please login again.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthorized'}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
