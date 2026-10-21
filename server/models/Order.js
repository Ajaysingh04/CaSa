const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedVariant: { type: Map, of: String, default: {} },
  subtotal: { type: Number, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: String, default: 'System' }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      locality: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      addressType: { type: String, default: 'home' }
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      default: 'razorpay'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    couponCode: {
      type: String,
      default: null
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for delivery',
        'Delivered',
        'Cancelled',
        'Return requested',
        'Refunded'
      ],
      default: 'Confirmed'
    },
    statusHistory: [statusHistorySchema],
    estimatedDeliveryDate: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    assignedDeliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveryPartnerName: {
      type: String,
      default: ''
    },
    deliveryPartnerPhone: {
      type: String,
      default: ''
    },
    vendorNotes: {
      type: String,
      default: ''
    },
    deliveryProofOtp: {
      type: String,
      default: ''
    },
    returnReason: {
      type: String,
      default: ''
    },
    returnType: {
      type: String,
      enum: ['refund', 'replacement', 'none'],
      default: 'none'
    },
    refundStatus: {
      type: String,
      enum: ['none', 'initiated', 'processed', 'refunded'],
      default: 'none'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
