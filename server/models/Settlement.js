const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    settlementNumber: {
      type: String,
      required: true,
      unique: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientType: {
      type: String,
      enum: ['vendor', 'delivery_partner'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed'
    },
    utrNumber: {
      type: String,
      default: ''
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' }
    },
    periodStart: Date,
    periodEnd: Date,
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    orderCount: {
      type: Number,
      default: 0
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

settlementSchema.index({ recipient: 1, status: 1 });
settlementSchema.index({ settlementNumber: 1 });

module.exports = mongoose.model('Settlement', settlementSchema);
