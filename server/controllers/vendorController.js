const Order = require('../models/Order');
const Product = require('../models/Product');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// @desc    Get Vendor Dashboard Stats
// @route   GET /api/vendor/stats
// @access  Private (Vendor / Admin)
exports.getVendorStats = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const allOrders = await Order.find();
      const totalOrders = allOrders.length;
      const pendingToPack = allOrders.filter(o => ['Confirmed', 'Processing'].includes(o.orderStatus)).length;
      const packedOrders = allOrders.filter(o => o.orderStatus === 'Packed').length;
      const shippedOrders = allOrders.filter(o => ['Shipped', 'Out for delivery'].includes(o.orderStatus)).length;
      const deliveredOrders = allOrders.filter(o => o.orderStatus === 'Delivered').length;

      const totalRevenue = allOrders
        .filter(o => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const productsCount = await Product.countDocuments();

      return res.status(200).json({
        success: true,
        data: {
          totalOrders,
          pendingToPack,
          packedOrders,
          shippedOrders,
          deliveredOrders,
          totalRevenue,
          productsCount
        }
      });
    } else {
      const allOrders = dataStore.orders || [];
      const totalOrders = allOrders.length;
      const pendingToPack = allOrders.filter(o => ['Confirmed', 'Processing'].includes(o.orderStatus)).length;
      const packedOrders = allOrders.filter(o => o.orderStatus === 'Packed').length;
      const shippedOrders = allOrders.filter(o => ['Shipped', 'Out for delivery'].includes(o.orderStatus)).length;
      const deliveredOrders = allOrders.filter(o => o.orderStatus === 'Delivered').length;

      const totalRevenue = allOrders
        .filter(o => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          totalOrders,
          pendingToPack,
          packedOrders,
          shippedOrders,
          deliveredOrders,
          totalRevenue,
          productsCount: dataStore.products.length
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor Orders (Fulfillment List)
// @route   GET /api/vendor/orders
// @access  Private (Vendor / Admin)
exports.getVendorOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (getDBStatus()) {
      const query = {};
      if (status && status !== 'ALL') {
        query.orderStatus = status;
      }

      const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } else {
      let orders = [...(dataStore.orders || [])];
      if (status && status !== 'ALL') {
        orders = orders.filter(o => o.orderStatus === status);
      }
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update Order Status by Vendor (e.g. Processing -> Packed -> Handed to Courier)
// @route   PUT /api/vendor/orders/:id/status
// @access  Private (Vendor / Admin)
exports.updateVendorOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, vendorNotes } = req.body;

    const allowedVendorStatuses = ['Processing', 'Packed', 'Shipped'];
    if (!allowedVendorStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Vendor can only update order to Processing, Packed, or Shipped. Received: ${status}`
      });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.orderStatus = status;
      if (vendorNotes) {
        order.vendorNotes = vendorNotes;
      }

      order.statusHistory.push({
        status,
        note: `Updated by Vendor: ${vendorNotes || status}`,
        updatedAt: new Date()
      });

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.orderStatus = status;
      if (vendorNotes) {
        order.vendorNotes = vendorNotes;
      }
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        note: `Updated by Vendor: ${vendorNotes || status}`,
        updatedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor Products
// @route   GET /api/vendor/products
// @access  Private (Vendor / Admin)
exports.getVendorProducts = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: products.length, data: products });
    } else {
      return res.status(200).json({
        success: true,
        count: dataStore.products.length,
        data: dataStore.products
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update Product Stock & Price
// @route   PUT /api/vendor/products/:id
// @access  Private (Vendor / Admin)
exports.updateVendorProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock, price, discountPrice } = req.body;

    if (getDBStatus()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (stock !== undefined) product.stock = Number(stock);
      if (price !== undefined) product.price = Number(price);
      if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);

      await product.save();
      return res.status(200).json({ success: true, data: product });
    } else {
      const product = dataStore.products.find(p => p._id === id || p.slug === id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (stock !== undefined) product.stock = Number(stock);
      if (price !== undefined) product.price = Number(price);
      if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);

      return res.status(200).json({ success: true, data: product });
    }
  } catch (err) {
    next(err);
  }
};
