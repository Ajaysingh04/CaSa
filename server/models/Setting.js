const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'CASA',
      trim: true
    },
    storeTagline: {
      type: String,
      default: 'INDIA MARKETPLACE',
      trim: true
    },
    primaryColor: {
      type: String,
      default: '#2563eb',
      trim: true
    },
    defaultLanguage: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'hinglish']
    },
    supportEmail: {
      type: String,
      default: 'support@casa.in',
      trim: true
    },
    supportPhone: {
      type: String,
      default: '+91 9876543210',
      trim: true
    },
    freeShippingThreshold: {
      type: Number,
      default: 499
    },
    standardDeliveryFee: {
      type: Number,
      default: 49
    },
    codEnabled: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    festivalSaleActive: {
      type: Boolean,
      default: true
    },
    festivalSaleBannerText: {
      type: String,
      default: '🎉 FESTIVAL SALE IS LIVE: Up to 70% Off + Flat ₹200 OFF with code CASA200'
    },
    gstRate: {
      type: Number,
      default: 18
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Setting', settingSchema);
