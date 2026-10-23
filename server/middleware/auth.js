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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super Admin inherits full operational access across administrative endpoints
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};

// Middleware to block Demo Admin from modifying anything (read-only mode)
const forbidDemoAdminMutations = (req, res, next) => {
  const isDemo = req.user?.email === 'admin@casa.in' || req.user?.isDemoAdmin;
  if (isDemo && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(403).json({
      success: false,
      message: 'Demo Admin is in READ-ONLY mode. Changes cannot be made. To add, edit, or delete data across vendors, users, delivery, or website, please login as Super Admin (casa@admin.com).'
    });
  }
  next();
};

// Dedicated super-admin permission level for root administrative operations
const requireSuperAdmin = (req, res, next) => {
  const isSuper = req.user && (req.user.role === 'super_admin' || req.user.email === 'casa@admin.com');
  if (!isSuper) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: This operation requires dedicated Super Admin privileges (casa@admin.com).'
    });
  }
  next();
};

module.exports = { protect, authorize, requireSuperAdmin, forbidDemoAdminMutations };
