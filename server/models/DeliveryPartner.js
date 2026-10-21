const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Van', 'Scooter', 'EV', 'Truck'],
      default: 'Bike'
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: ''
    },
    drivingLicenseNumber: {
      type: String,
      trim: true,
      default: ''
    },
    assignedHub: {
      type: String,
      default: 'Main Hub - Bangalore'
    },
    assignedZones: [{
      type: String
    }],
    onDuty: {
      type: Boolean,
      default: true
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'approved'
    },
    currentLocation: {
      lat: Number,
      lng: Number,
      lastUpdated: Date
    },
    metrics: {
      totalAssignedShipments: { type: Number, default: 0 },
      successfulDeliveries: { type: Number, default: 0 },
      failedDeliveries: { type: Number, default: 0 },
      codCollectedTotal: { type: Number, default: 0 },
      codRemittedTotal: { type: Number, default: 0 },
      pendingCodInHand: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

deliveryPartnerSchema.index({ user: 1 });
deliveryPartnerSchema.index({ onDuty: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
