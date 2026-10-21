const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'casa_super_secret_jwt_key_2026_dev_secure',
    { expiresIn: '30d' }
  );
};

const sendTokenResponse = (user, statusCode, res) => {
  const userObj = user && typeof user.toObject === 'function' ? user.toObject() : { ...user };
  const token = generateToken(userObj._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  const { password, ...safeUser } = userObj;

  res
    .status(statusCode)
    .cookie('casa_token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: safeUser
    });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (getDBStatus()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const validRoles = ['user', 'vendor', 'delivery'];
      const assignedRole = validRoles.includes(req.body.role) ? req.body.role : 'user';

      const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        role: assignedRole,
        vendorStoreName: req.body.vendorStoreName || '',
        vehicleType: req.body.vehicleType || 'Bike'
      });

      return sendTokenResponse(user.toObject(), 201, res);
    } else {
      const userExists = dataStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const validRoles = ['user', 'vendor', 'delivery'];
      const assignedRole = validRoles.includes(req.body.role) ? req.body.role : 'user';

      const newUser = {
        _id: dataStore.generateId(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || '',
        role: assignedRole,
        vendorStoreName: req.body.vendorStoreName || '',
        vehicleType: req.body.vehicleType || 'Bike',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      };

      dataStore.users.push(newUser);
      return sendTokenResponse(newUser, 201, res);
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Switch User Role (Instant Demo & Portal Testing: user, vendor, delivery, admin)
// @route   POST /api/auth/switch-role
// @access  Private
exports.switchRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ['user', 'vendor', 'delivery', 'admin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role: ${role}` });
    }

    if (getDBStatus()) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.role = role;
      await user.save();
      return sendTokenResponse(user.toObject(), 200, res);
    } else {
      const user = dataStore.users.find(u => u._id === req.user._id);
      if (user) {
        user.role = role;
      }
      return sendTokenResponse({ ...req.user, role }, 200, res);
    }
  } catch (err) {
    next(err);
  }
};

const DEMO_ACCOUNTS = {
  'admin@casa.in': {
    name: 'CASA Executive Admin',
    password: 'Admin@Casa2026',
    role: 'admin',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  'vendor@casa.in': {
    name: 'Aarav Fashion & Handlooms',
    password: 'Vendor@Casa2026',
    role: 'vendor',
    phone: '+91 98765 24680',
    vendorStoreName: 'Aarav Luxury Handlooms & Apparel',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  'delivery@casa.in': {
    name: 'Vikram Singh (Express Rider)',
    password: 'Delivery@Casa2026',
    role: 'delivery',
    phone: '+91 98765 13579',
    vehicleType: 'Bike',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  'rajesh@casa.in': {
    name: 'Rajesh Sharma',
    password: 'User@Casa2026',
    role: 'user',
    phone: '+91 91234 56789',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const demoProfile = DEMO_ACCOUNTS[cleanEmail];

    if (getDBStatus()) {
      let user = await User.findOne({ email: cleanEmail }).select('+password');

      // Auto-provision demo account if not exists
      if (!user && demoProfile && password === demoProfile.password) {
        user = await User.create({
          name: demoProfile.name,
          email: cleanEmail,
          password: demoProfile.password,
          role: demoProfile.role,
          phone: demoProfile.phone || '',
          vendorStoreName: demoProfile.vendorStoreName || '',
          vehicleType: demoProfile.vehicleType || 'Bike',
          avatar: demoProfile.avatar || ''
        });
        return sendTokenResponse(user.toObject(), 200, res);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        if (demoProfile && password === demoProfile.password) {
          user.password = password;
          await user.save();
          return sendTokenResponse(user.toObject(), 200, res);
        }
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return sendTokenResponse(user.toObject(), 200, res);
    } else {
      let user = dataStore.users.find(u => u.email.toLowerCase() === cleanEmail);

      // Auto-provision demo account in memory if missing
      if (!user && demoProfile && password === demoProfile.password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        user = {
          _id: dataStore.generateId(),
          name: demoProfile.name,
          email: cleanEmail,
          password: hash,
          role: demoProfile.role,
          phone: demoProfile.phone || '',
          vendorStoreName: demoProfile.vendorStoreName || '',
          vehicleType: demoProfile.vehicleType || 'Bike',
          avatar: demoProfile.avatar || '',
          createdAt: new Date().toISOString()
        };
        dataStore.users.push(user);
        return sendTokenResponse(user, 200, res);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        if (demoProfile && password === demoProfile.password) {
          return sendTokenResponse(user, 200, res);
        }
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return sendTokenResponse(user, 200, res);
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, preferredLanguage } = req.body;

    if (getDBStatus()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (avatar) user.avatar = avatar;
      if (preferredLanguage) user.preferredLanguage = preferredLanguage;

      await user.save();
      return res.status(200).json({ success: true, user });
    } else {
      const userIndex = dataStore.users.findIndex(u => u._id === req.user._id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) dataStore.users[userIndex].name = name;
      if (phone !== undefined) dataStore.users[userIndex].phone = phone;
      if (avatar) dataStore.users[userIndex].avatar = avatar;
      if (preferredLanguage) dataStore.users[userIndex].preferredLanguage = preferredLanguage;

      const { password, ...safeUser } = dataStore.users[userIndex];
      return res.status(200).json({ success: true, user: safeUser });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Log out user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  res.cookie('casa_token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};
