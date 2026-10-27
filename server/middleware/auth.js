const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

const DEMO_PROFILES = {
  'casa@admin.com': {
    name: 'CASA Super Admin',
    email: 'casa@admin.com',
    role: 'super_admin',
    phone: '+91 99999 88888',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
  },
  'admin@casa.in': {
    name: 'CASA Demo Admin',
    email: 'admin@casa.in',
    role: 'admin',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  'vendor@casa.in': {
    name: 'Aarav Fashion & Handlooms',
    email: 'vendor@casa.in',
    role: 'vendor',
    phone: '+91 98765 24680',
    vendorStoreName: 'Aarav Luxury Handlooms & Apparel',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  'delivery@casa.in': {
    name: 'Vikram Singh (Express Rider)',
    email: 'delivery@casa.in',
    role: 'delivery',
    phone: '+91 98765 13579',
    vehicleType: 'Bike',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  'rajesh@casa.in': {
    name: 'Rajesh Sharma',
    email: 'rajesh@casa.in',
    role: 'user',
    phone: '+91 91234 56789',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  }
};

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

    const tokenEmail = decoded.email ? decoded.email.toLowerCase().trim() : null;

    if (getDBStatus()) {
      if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        req.user = await User.findById(decoded.id).select('-password');
      }

      // Fallback 1: Lookup by email in MongoDB
      if (!req.user && tokenEmail) {
        req.user = await User.findOne({ email: tokenEmail }).select('-password');
      }

      // Fallback 2: Check in-memory store
      if (!req.user) {
        const memUser = dataStore.users.find(
          u => u._id === decoded.id || (tokenEmail && u.email?.toLowerCase() === tokenEmail)
        );
        if (memUser) {
          const { password, ...safeUser } = memUser;
          req.user = safeUser;
        }
      }

      // Fallback 3: Auto-provision demo account if token belongs to demo profile
      if (!req.user && (tokenEmail && DEMO_PROFILES[tokenEmail])) {
        const demo = DEMO_PROFILES[tokenEmail];
        try {
          req.user = await User.create({
            name: demo.name,
            email: demo.email,
            password: 'Demo@Casa2026',
            role: demo.role,
            phone: demo.phone || '',
            vendorStoreName: demo.vendorStoreName || '',
            vehicleType: demo.vehicleType || 'Bike',
            avatar: demo.avatar || ''
          });
        } catch (e) {
          req.user = await User.findOne({ email: demo.email }).select('-password');
        }
      }

      // Fallback 4: If token was demo admin (e.g. from seed with custom ID)
      if (!req.user && (decoded.id === 'demo-admin-id' || decoded.id === 'usr-admin-1' || decoded.role === 'admin')) {
        req.user = await User.findOne({ email: 'admin@casa.in' }).select('-password');
      }
    } else {
      let user = dataStore.users.find(
        u => u._id === decoded.id || (tokenEmail && u.email?.toLowerCase() === tokenEmail)
      );

      if (!user && tokenEmail && DEMO_PROFILES[tokenEmail]) {
        const demo = DEMO_PROFILES[tokenEmail];
        user = {
          _id: decoded.id || dataStore.generateId(),
          name: demo.name,
          email: demo.email,
          role: demo.role,
          phone: demo.phone || '',
          vendorStoreName: demo.vendorStoreName || '',
          vehicleType: demo.vehicleType || 'Bike',
          avatar: demo.avatar || '',
          createdAt: new Date().toISOString()
        };
        dataStore.users.push(user);
      }

      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    }

    // Fallback 5: Resilient recovery for known demo tokens so demo admin/vendor is never blocked
    if (!req.user && (tokenEmail || decoded.role)) {
      const isDemoAdminToken = tokenEmail === 'admin@casa.in' || decoded.role === 'admin';
      const isDemoVendorToken = tokenEmail === 'vendor@casa.in' || decoded.role === 'vendor';
      if (isDemoAdminToken || isDemoVendorToken) {
        req.user = {
          _id: decoded.id || (isDemoAdminToken ? 'demo-admin-id' : 'demo-vendor-id'),
          name: isDemoAdminToken ? 'CASA Demo Admin' : 'Aarav Fashion & Handlooms',
          email: tokenEmail || (isDemoAdminToken ? 'admin@casa.in' : 'vendor@casa.in'),
          role: decoded.role || (isDemoAdminToken ? 'admin' : 'vendor'),
          isActive: true,
          status: 'active'
        };
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

// Full mutation access granted to Demo Admin as requested: allows add, update, delete across the platform
const forbidDemoAdminMutations = (req, res, next) => {
  next();
};

// Administrator permission level: allows both super_admin and admin (including demo admin)
const requireSuperAdmin = (req, res, next) => {
  const isAuthorized =
    req.user &&
    (req.user.role === 'super_admin' ||
      req.user.role === 'admin' ||
      req.user.email === 'casa@admin.com' ||
      req.user.email === 'admin@casa.in');

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: This operation requires elevated administrator privileges.'
    });
  }
  next();
};

module.exports = { protect, authorize, requireSuperAdmin, forbidDemoAdminMutations };
