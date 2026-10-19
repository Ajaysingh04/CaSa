const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// Helper to validate status transitions
const validTransitions = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Packed', 'Cancelled'],
  Packed: ['Shipped', 'Cancelled'],
  Shipped: ['Out for delivery'],
  'Out for delivery': ['Delivered'],
  Delivered: ['Return requested'],
  'Return requested': ['Refunded', 'Delivered'],
  Cancelled: [],
  Refunded: []
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { items, shippingAddress, paymentMethod = 'razorpay', couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    if (getDBStatus()) {
      // Validate stock and compute real price server-side
      const validatedItems = [];
      let itemsPrice = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId || item.product);
        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.name || ''} is no longer available.`
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}.`
          });
        }

        const unitPrice = product.discountPrice || product.price;
        const subtotal = unitPrice * item.quantity;
        itemsPrice += subtotal;

        validatedItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images[0],
          price: unitPrice,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant || {},
          subtotal
        });
      }

      // Shipping calculation
      const shippingPrice = itemsPrice >= 499 ? 0 : 49;
      let discountPrice = 0;

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (coupon && itemsPrice >= (coupon.minOrderAmount || 0)) {
          if (coupon.discountType === 'percentage') {
            discountPrice = Math.round((itemsPrice * coupon.discountAmount) / 100);
            if (coupon.maxDiscountAmount && discountPrice > coupon.maxDiscountAmount) {
              discountPrice = coupon.maxDiscountAmount;
            }
          } else if (coupon.discountType === 'fixed') {
            discountPrice = coupon.discountAmount;
          }
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      }

      const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);
      const orderNumber = `CASA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Initial status
      const initialStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

      const order = await Order.create({
        orderNumber,
        user: userId,
        items: validatedItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: 'pending',
        itemsPrice,
        shippingPrice,
        taxPrice: 0,
        discountPrice,
        couponCode: couponCode || null,
        totalPrice,
        orderStatus: initialStatus,
        statusHistory: [
          {
            status: initialStatus,
            note: paymentMethod === 'cod' ? 'Order confirmed with Cash on Delivery' : 'Order created, awaiting payment verification'
          }
        ],
        estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      });

      // Deduct inventory
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

      // Clear user cart
      await Cart.findOneAndUpdate({ user: userId }, { items: [], coupon: null });

      return res.status(201).json({ success: true, data: order });
    } else {
      // In-Memory store
      const validatedItems = [];
      let itemsPrice = 0;

      for (const item of items) {
        const prodId = item.productId || item.product || item._id;
        const product = dataStore.products.find(p => p._id === prodId || p.slug === prodId);
        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.name || ''} is no longer available.`
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}.`
          });
        }

        const unitPrice = product.discountPrice || product.price;
        const subtotal = unitPrice * item.quantity;
        itemsPrice += subtotal;

        validatedItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images[0],
          price: unitPrice,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant || {},
          subtotal
        });
      }

      const shippingPrice = itemsPrice >= 499 ? 0 : 49;
      let discountPrice = 0;

      if (couponCode) {
        const coupon = dataStore.coupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);
        if (coupon && itemsPrice >= (coupon.minOrderAmount || 0)) {
          if (coupon.discountType === 'percentage') {
            discountPrice = Math.round((itemsPrice * coupon.discountAmount) / 100);
            if (coupon.maxDiscountAmount && discountPrice > coupon.maxDiscountAmount) {
              discountPrice = coupon.maxDiscountAmount;
            }
          } else if (coupon.discountType === 'fixed') {
            discountPrice = coupon.discountAmount;
          }
          coupon.usedCount = (coupon.usedCount || 0) + 1;
        }
      }

      const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);
      const orderNumber = `CASA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const initialStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

      const newOrder = {
        _id: dataStore.generateId(),
        orderNumber,
        user: userId,
        items: validatedItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: 'pending',
        itemsPrice,
        shippingPrice,
        taxPrice: 0,
        discountPrice,
        couponCode: couponCode || null,
        totalPrice,
        orderStatus: initialStatus,
        statusHistory: [
          {
            status: initialStatus,
            timestamp: new Date().toISOString(),
            note: paymentMethod === 'cod' ? 'Order confirmed with Cash on Delivery' : 'Order created, awaiting payment verification'
          }
        ],
        estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };

      // Deduct stock
      for (const item of validatedItems) {
        const prod = dataStore.products.find(p => p._id === item.product);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }

      dataStore.orders.unshift(newOrder);

      // Clear user cart
      dataStore.carts.set(userId, { items: [], coupon: null });

      return res.status(201).json({ success: true, data: newOrder });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } else {
      const orders = dataStore.orders.filter(o => o.user === userId);
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const order = await Order.findById(id).populate('user', 'name email phone');
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Check permission: owner or admin
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }

      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.user !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order (if not already shipped)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
      }

      const nonCancellable = ['Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'Refunded'];
      if (nonCancellable.includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled because it is already '${order.orderStatus}'`
        });
      }

      order.orderStatus = 'Cancelled';
      order.cancellationReason = reason;
      order.statusHistory.push({
        status: 'Cancelled',
        note: reason,
        updatedBy: req.user.name
      });

      // Restore inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.user !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
      }

      const nonCancellable = ['Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'Refunded'];
      if (nonCancellable.includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled because it is already '${order.orderStatus}'`
        });
      }

      order.orderStatus = 'Cancelled';
      order.cancellationReason = reason;
      order.statusHistory.push({
        status: 'Cancelled',
        timestamp: new Date().toISOString(),
        note: reason,
        updatedBy: req.user.name
      });

      // Restore stock
      for (const item of order.items) {
        const prod = dataStore.products.find(p => p._id === item.product);
        if (prod) {
          prod.stock += item.quantity;
        }
      }

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};
