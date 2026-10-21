const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema(
  {
    returnRequestNumber: {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number,
        reason: String
      }
    ],
    type: {
      type: String,
      enum: ['refund', 'replacement'],
      default: 'refund'
    },
    reason: {
      type: String,
      required: true
    },
    customerComments: {
      type: String,
      default: ''
    },
    images: [{
      type: String
    }],
    status: {
      type: String,
      enum: [
        'requested',
        'approved',
        'rejected',
        'picked_up',
        'received_at_hub',
        'refund_processed',
        'replacement_dispatched',
        'closed'
      ],
      default: 'requested'
    },
    pickupAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    assignedPickupRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decidedAt: Date
  },
  {
    timestamps: true
  }
);

returnRequestSchema.index({ order: 1 });
returnRequestSchema.index({ user: 1 });
returnRequestSchema.index({ status: 1 });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
