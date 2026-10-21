const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
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
    grossAmount: {
      type: Number,
      required: true
    },
    commissionRate: {
      type: Number,
      default: 10.0 // 10%
    },
    commissionAmount: {
      type: Number,
      required: true
    },
    netPayableToVendor: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['accrued', 'eligible_for_settlement', 'settled', 'reversed'],
      default: 'accrued'
    },
    settlement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Settlement'
    }
  },
  {
    timestamps: true
  }
);

commissionSchema.index({ vendor: 1, status: 1 });
commissionSchema.index({ order: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
