const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      default: ''
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    movementType: {
      type: String,
      enum: [
        'order_placed',
        'order_cancelled',
        'return_restock',
        'manual_adjustment',
        'restock_inward',
        'damaged_writeoff'
      ],
      required: true
    },
    quantityChanged: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderNumber: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },
    actor: {
      type: String,
      default: 'System'
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

inventorySchema.index({ product: 1, createdAt: -1 });
inventorySchema.index({ vendor: 1 });
inventorySchema.index({ movementType: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
