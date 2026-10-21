const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    refundNumber: {
      type: String,
      required: true,
      unique: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    orderNumber: {
      type: String,
      required: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    gatewayRefundId: {
      type: String,
      default: ''
    },
    method: {
      type: String,
      enum: ['original_payment_method', 'store_credit', 'manual_bank_transfer', 'cod_cash_return'],
      default: 'original_payment_method'
    },
    status: {
      type: String,
      enum: ['initiated', 'processed', 'failed'],
      default: 'processed'
    },
    reason: {
      type: String,
      required: true
    },
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    authorizedByName: {
      type: String,
      default: 'Admin'
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

refundSchema.index({ order: 1 });
refundSchema.index({ user: 1 });
refundSchema.index({ refundNumber: 1 });

module.exports = mongoose.model('Refund', refundSchema);
