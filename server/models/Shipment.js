const mongoose = require('mongoose');

const shipmentEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Hub'
  },
  description: {
    type: String,
    default: ''
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scannedByRole: {
    type: String,
    default: 'delivery'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const shipmentSchema = new mongoose.Schema(
  {
    shipmentNumber: {
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
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        sku: String,
        quantity: Number,
        price: Number,
        subtotal: Number
      }
    ],
    pickupAddress: {
      storeName: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      locality: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true }
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true
    },
    barcode: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'Manifested',
        'Packed',
        'Ready for pickup',
        'Picked up',
        'In transit',
        'Shipped',
        'Out for delivery',
        'Delivered',
        'Delivery Attempt Failed',
        'RTO - Return to Hub',
        'RTO Completed',
        'Cancelled'
      ],
      default: 'Manifested'
    },
    proofOtp: {
      type: String,
      default: ''
    },
    deliveryAttempts: {
      type: Number,
      default: 0
    },
    failedReason: {
      type: String,
      default: ''
    },
    reattemptDate: {
      type: Date
    },
    pickedUpAt: Date,
    deliveredAt: Date,
    events: [shipmentEventSchema]
  },
  {
    timestamps: true
  }
);

shipmentSchema.index({ order: 1 });
shipmentSchema.index({ vendor: 1 });
shipmentSchema.index({ deliveryPartner: 1 });
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ shipmentNumber: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
