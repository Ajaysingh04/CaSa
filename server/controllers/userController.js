const Address = require('../models/Address');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// ================= ADDRESSES =================

// @desc    Get all user addresses
// @route   GET /api/user/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
      return res.status(200).json({ success: true, count: addresses.length, data: addresses });
    } else {
      const addresses = dataStore.addresses.filter(a => a.user === userId);
      return res.status(200).json({ success: true, count: addresses.length, data: addresses });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Add new address
// @route   POST /api/user/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, street, locality, city, state, pincode, addressType, isDefault } = req.body;

    if (getDBStatus()) {
      if (isDefault) {
        await Address.updateMany({ user: userId }, { isDefault: false });
      }

      const address = await Address.create({
        user: userId,
        fullName,
        phone,
        street,
        locality: locality || '',
        city,
        state,
        pincode,
        addressType: addressType || 'home',
        isDefault: Boolean(isDefault)
      });

      return res.status(201).json({ success: true, data: address });
    } else {
      if (isDefault) {
        dataStore.addresses.forEach(a => {
          if (a.user === userId) a.isDefault = false;
        });
      }

      const newAddress = {
        _id: dataStore.generateId(),
        user: userId,
        fullName,
        phone,
        street,
        locality: locality || '',
        city,
        state,
        pincode,
        addressType: addressType || 'home',
        isDefault: Boolean(isDefault),
        createdAt: new Date().toISOString()
      };

      dataStore.addresses.unshift(newAddress);
      return res.status(201).json({ success: true, data: newAddress });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an address
// @route   DELETE /api/user/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (getDBStatus()) {
      const address = await Address.findOneAndDelete({ _id: id, user: userId });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      return res.status(200).json({ success: true, message: 'Address deleted' });
    } else {
      const index = dataStore.addresses.findIndex(a => a._id === id && a.user === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      dataStore.addresses.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Address deleted' });
    }
  } catch (err) {
    next(err);
  }
};

// ================= WISHLIST =================

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
      }
      return res.status(200).json({ success: true, data: wishlist.products });
    } else {
      let productIds = dataStore.wishlists.get(userId);
      if (!productIds) {
        productIds = new Set();
        dataStore.wishlists.set(userId, productIds);
      }
      const products = Array.from(productIds)
        .map(id => dataStore.products.find(p => p._id === id))
        .filter(Boolean);
      return res.status(200).json({ success: true, data: products });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/user/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (getDBStatus()) {
      let wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, products: [] });
      }

      const index = wishlist.products.findIndex(id => id.toString() === productId);
      let inWishlist = false;

      if (index > -1) {
        wishlist.products.splice(index, 1);
        inWishlist = false;
      } else {
        wishlist.products.push(productId);
        inWishlist = true;
      }

      await wishlist.save();
      await wishlist.populate('products');

      return res.status(200).json({
        success: true,
        inWishlist,
        message: inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
        data: wishlist.products
      });
    } else {
      let productIds = dataStore.wishlists.get(userId);
      if (!productIds) {
        productIds = new Set();
        dataStore.wishlists.set(userId, productIds);
      }

      let inWishlist = false;
      if (productIds.has(productId)) {
        productIds.delete(productId);
        inWishlist = false;
      } else {
        productIds.add(productId);
        inWishlist = true;
      }

      const products = Array.from(productIds)
        .map(id => dataStore.products.find(p => p._id === id))
        .filter(Boolean);

      return res.status(200).json({
        success: true,
        inWishlist,
        message: inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
        data: products
      });
    }
  } catch (err) {
    next(err);
  }
};
