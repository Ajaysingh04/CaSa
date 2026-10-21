const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientRole: {
      type: String,
      enum: ['user', 'vendor', 'delivery', 'admin'],
      default: 'user'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'order_status',
        'payment_event',
        'shipment_dispatch',
        'delivery_alert',
        'return_update',
        'vendor_approval',
        'inventory_alert',
        'system_alert'
      ],
      default: 'order_status'
    },
    data: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      orderNumber: String,
      link: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
