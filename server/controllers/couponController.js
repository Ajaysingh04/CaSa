const Coupon = require('../models/Coupon');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
exports.getCoupons = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const coupons = await Coupon.find({ isActive: true });
      return res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } else {
      const coupons = dataStore.coupons.filter(c => c.isActive);
      return res.status(200).json({ success: true, count: coupons.length, data: coupons });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();

    let coupon;
    if (getDBStatus()) {
      coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    } else {
      coupon = dataStore.coupons.find(c => c.code === cleanCode && c.isActive);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Coupon requires minimum order value of ₹${coupon.minOrderAmount}.`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderAmount * coupon.discountAmount) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountAmount;
    }

    return res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        calculatedDiscount: discount,
        description: coupon.description
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountAmount, minOrderAmount, maxDiscountAmount, description } = req.body;

    if (getDBStatus()) {
      const coupon = await Coupon.create({
        code: code.trim().toUpperCase(),
        discountType,
        discountAmount,
        minOrderAmount: minOrderAmount || 0,
        maxDiscountAmount: maxDiscountAmount || null,
        description
      });
      return res.status(201).json({ success: true, data: coupon });
    } else {
      const newCoupon = {
        _id: dataStore.generateId(),
        code: code.trim().toUpperCase(),
        discountType,
        discountAmount,
        minOrderAmount: minOrderAmount || 0,
        maxDiscountAmount: maxDiscountAmount || null,
        description,
        isActive: true,
        usedCount: 0,
        createdAt: new Date().toISOString()
      };
      dataStore.coupons.push(newCoupon);
      return res.status(201).json({ success: true, data: newCoupon });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all coupons including inactive (Admin)
// @route   GET /api/coupons/all
// @access  Private/Admin
exports.getAllCouponsAdmin = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } else {
      return res.status(200).json({ success: true, count: dataStore.coupons.length, data: dataStore.coupons });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.body.code) {
      req.body.code = req.body.code.trim().toUpperCase();
    }

    if (getDBStatus()) {
      const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.status(200).json({ success: true, data: coupon });
    } else {
      const index = dataStore.coupons.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      dataStore.coupons[index] = { ...dataStore.coupons[index], ...req.body, updatedAt: new Date().toISOString() };
      return res.status(200).json({ success: true, data: dataStore.coupons[index] });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } else {
      const index = dataStore.coupons.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      dataStore.coupons.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};
