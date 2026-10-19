const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      required: true
    },
    mobileImage: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: '/products'
    },
    buttonText: {
      type: String,
      default: 'Shop Now'
    },
    badge: {
      type: String,
      default: ''
    },
    accentColor: {
      type: String,
      default: '#1e3a8a'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
