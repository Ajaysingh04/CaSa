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
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  const { password, ...safeUser } = user;

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

      // Security rule: never let user assign admin role
      const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        role: 'user'
      });

      return sendTokenResponse(user.toObject(), 201, res);
    } else {
      const userExists = dataStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: dataStore.generateId(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || '',
        role: 'user',
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (getDBStatus()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return sendTokenResponse(user.toObject(), 200, res);
    } else {
      const user = dataStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
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
    const { name, phone, avatar } = req.body;

    if (getDBStatus()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (avatar) user.avatar = avatar;

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
