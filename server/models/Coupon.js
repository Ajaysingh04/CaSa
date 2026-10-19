const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountAmount: {
      type: Number,
      required: [true, 'Discount amount is required'],
      min: 1
    },
    minOrderAmount: {
      type: Number,
      default: 0
    },
    maxDiscountAmount: {
      type: Number,
      default: null
    },
    description: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000)
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: 1000
    },
    usedCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
