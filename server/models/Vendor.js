const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true
    },
    businessEmail: {
      type: String,
      trim: true,
      default: ''
    },
    businessPhone: {
      type: String,
      trim: true,
      default: ''
    },
    gstin: {
      type: String,
      trim: true,
      default: ''
    },
    pan: {
      type: String,
      trim: true,
      default: ''
    },
    pickupAddress: {
      street: { type: String, default: '' },
      locality: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      upiId: { type: String, default: '' }
    },
    commissionRate: {
      type: Number,
      default: 10.0 // 10% platform commission
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'approved'
    },
    metrics: {
      totalOrders: { type: Number, default: 0 },
      grossSales: { type: Number, default: 0 },
      totalCommissionPaid: { type: Number, default: 0 },
      settledAmount: { type: Number, default: 0 },
      pendingSettlement: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

vendorSchema.index({ user: 1 });
vendorSchema.index({ storeName: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
