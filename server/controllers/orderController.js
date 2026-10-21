const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');
const {
  applyStatusTransition,
  canTransition,
  isAuthorizedForTransition,
  recalculateMultiVendorOrderStatus
} = require('../services/orderLifecycleService');
const AuditService = require('../services/auditService');
const socketService = require('../services/socketService');

// @desc    Create new order with idempotency check
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      items,
      shippingAddress,
      paymentMethod = 'razorpay',
      couponCode,
      idempotencyKey
    } = req.body;

    const key = idempotencyKey || req.headers['x-idempotency-key'];

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    if (getDBStatus()) {
      // Idempotency: Return existing order if already submitted
      if (key) {
        const existingOrder = await Order.findOne({ user: userId, idempotencyKey: key });
        if (existingOrder) {
          return res.status(200).json({
            success: true,
            message: 'Order already created (idempotent response)',
            data: existingOrder
          });
        }
      }

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
          sku: product.sku || product.slug,
          image: product.images[0],
          price: unitPrice,
          discountPrice: product.discountPrice || 0,
          taxPrice: 0,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant || {},
          subtotal,
          vendor: product.vendor || undefined,
          shipmentStatus: 'Confirmed'
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

      // Initial status: online orders start in Pending (awaiting payment verification); COD is Confirmed
      const initialStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

      const order = await Order.create({
        orderNumber,
        idempotencyKey: key || undefined,
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
        deliveryProofOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        statusHistory: [
          {
            fromStatus: '',
            status: initialStatus,
            timestamp: new Date(),
            note: paymentMethod === 'cod' ? 'Order confirmed with Cash on Delivery' : 'Order created, awaiting payment verification',
            updatedBy: `${req.user.name} (Customer)`
          }
        ],
        estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      });

      // Deduct inventory and record movements in MongoDB
      for (const item of validatedItems) {
        const prod = await Product.findById(item.product);
        const prevStock = prod ? prod.stock : 0;
        const newStock = Math.max(0, prevStock - item.quantity);
        if (prod) {
          prod.stock = newStock;
          await prod.save();
        }

        await AuditService.recordInventoryMovement({
          product: item.product,
          productName: item.name,
          sku: item.sku,
          vendor: item.vendor,
          movementType: 'order_placed',
          quantityChanged: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          order: order._id,
          orderNumber: order.orderNumber,
          reason: `Purchased in order #${order.orderNumber}`,
          actor: req.user.name,
          actorId: userId
        });

        if (item.vendor) {
          await AuditService.recordCommission({
            order: order._id,
            orderNumber: order.orderNumber,
            vendor: item.vendor,
            grossAmount: item.subtotal,
            commissionRate: 10.0
          });
        }
      }

      // Record business audit event
      await AuditService.logEvent({
        action: 'ORDER_CREATED',
        entityType: 'Order',
        entityId: order._id,
        performedBy: userId,
        performedByName: req.user.name,
        performedByRole: req.user.role || 'user',
        newState: { orderNumber: order.orderNumber, total: order.totalPrice, status: initialStatus, paymentMethod },
        reason: 'Customer placed order'
      });

      // Send customer notification
      await AuditService.createNotification({
        recipient: userId,
        recipientRole: 'user',
        title: `Order ${order.orderNumber} Placed`,
        message: `Your order of ₹${order.totalPrice} has been placed successfully.`,
        type: 'order_status',
        data: { orderId: order._id, orderNumber: order.orderNumber }
      });

      // Clear user cart
      await Cart.findOneAndUpdate({ user: userId }, { items: [], coupon: null });

      // Real-time broadcast
      try {
        socketService.emitNewOrder(order);
        socketService.emitOrderStatusUpdate(order);
      } catch (e) {}

      return res.status(201).json({ success: true, data: order });
    } else {
      // In-Memory store
      if (key) {
        const existingOrder = (dataStore.orders || []).find(o => o.user === userId && o.idempotencyKey === key);
        if (existingOrder) {
          return res.status(200).json({
            success: true,
            message: 'Order already created (idempotent response)',
            data: existingOrder
          });
        }
      }

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
          subtotal,
          vendor: product.vendor,
          shipmentStatus: 'Confirmed'
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
        }
      }

      const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);
      const orderNumber = `CASA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const initialStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

      const newOrder = {
        _id: dataStore.generateId(),
        orderNumber,
        idempotencyKey: key,
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
        deliveryProofOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        statusHistory: [
          {
            fromStatus: '',
            status: initialStatus,
            timestamp: new Date().toISOString(),
            note: paymentMethod === 'cod' ? 'Order confirmed with Cash on Delivery' : 'Order created, awaiting payment verification',
            updatedBy: `${req.user.name} (Customer)`
          }
        ],
        estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };

      // Deduct stock in memory
      for (const item of validatedItems) {
        const p = dataStore.products.find(prod => prod._id === item.product);
        if (p) p.stock -= item.quantity;
      }

      dataStore.orders.unshift(newOrder);
      return res.status(201).json({ success: true, data: newOrder });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } else {
      const orders = (dataStore.orders || []).filter(o => o.user === userId);
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

      // Check permission: owner, admin, or assigned delivery/vendor
      const orderUserId = order.user?._id ? order.user._id.toString() : (order.user ? order.user.toString() : null);
      const isOwner = orderUserId && req.user?._id && orderUserId === req.user._id.toString();
      const isPrivileged = ['admin', 'super_admin', 'vendor', 'delivery'].includes(req.user?.role);
      if (!isOwner && !isPrivileged) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }

      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const isOwner = order.user === req.user._id;
      const isPrivileged = ['admin', 'vendor', 'delivery'].includes(req.user.role);
      if (!isOwner && !isPrivileged) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status through central state machine
// @route   PUT /api/orders/:id/status
// @access  Private (Admin / Vendor / Delivery / Customer)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note = '', reason = '' } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Target status is required.' });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      try {
        applyStatusTransition(order, status, req.user.name, req.user.role, note, reason);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      try {
        applyStatusTransition(order, status, req.user.name, req.user.role, note, reason);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update individual item shipment status (multi-vendor partial shipments)
// @route   PUT /api/orders/:id/items/:itemId/shipment
// @access  Private (Vendor / Admin)
exports.updateItemShipmentStatus = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const { shipmentStatus, trackingNumber } = req.body;

    if (!shipmentStatus) {
      return res.status(400).json({ success: false, message: 'Shipment status is required.' });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const item = order.items.id(itemId) || order.items.find(i => i._id.toString() === itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found in order' });
      }

      // Check vendor authorization if actor is vendor
      if (req.user.role === 'vendor' && item.vendor && item.vendor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify another vendor shipment' });
      }

      item.shipmentStatus = shipmentStatus;
      if (trackingNumber) item.trackingNumber = trackingNumber;

      // Recalculate root order status
      const newOrderStatus = recalculateMultiVendorOrderStatus(order);
      if (newOrderStatus !== order.orderStatus) {
        applyStatusTransition(
          order,
          newOrderStatus,
          req.user.name,
          req.user.role,
          `Item "${item.name}" updated to ${shipmentStatus}`
        );
      }

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const item = order.items.find(i => i._id === itemId || i.product === itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found in order' });
      }

      item.shipmentStatus = shipmentStatus;
      if (trackingNumber) item.trackingNumber = trackingNumber;

      const newOrderStatus = recalculateMultiVendorOrderStatus(order);
      if (newOrderStatus !== order.orderStatus) {
        applyStatusTransition(
          order,
          newOrderStatus,
          req.user.name,
          req.user.role,
          `Item "${item.name}" updated to ${shipmentStatus}`
        );
      }

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order (if permitted by lifecycle rules)
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

      applyStatusTransition(
        order,
        'Cancelled',
        req.user.name,
        req.user.role,
        reason,
        reason
      );

      // Restore inventory and record movement
      for (const item of order.items) {
        const prod = await Product.findById(item.product);
        const prevStock = prod ? prod.stock : 0;
        const newStock = prevStock + item.quantity;
        if (prod) {
          prod.stock = newStock;
          await prod.save();
        }

        await AuditService.recordInventoryMovement({
          product: item.product,
          productName: item.name,
          sku: item.sku,
          vendor: item.vendor,
          movementType: 'order_cancelled',
          quantityChanged: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          order: order._id,
          orderNumber: order.orderNumber,
          reason: `Stock restored upon cancellation of order #${order.orderNumber}: ${reason}`,
          actor: req.user.name,
          actorId: req.user._id
        });
      }

      await AuditService.logEvent({
        action: 'ORDER_CANCELLED',
        entityType: 'Order',
        entityId: order._id,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: req.user.role || 'user',
        previousState: { status: order.statusHistory?.slice(-2)[0]?.status || 'Active' },
        newState: { status: 'Cancelled' },
        reason
      });

      await order.save();
      try { socketService.emitOrderStatusUpdate(order); } catch (e) {}
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
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

      applyStatusTransition(
        order,
        'Cancelled',
        req.user.name,
        req.user.role,
        reason,
        reason
      );

      for (const item of order.items) {
        const prod = (dataStore.products || []).find(p => p._id === item.product);
        if (prod) prod.stock += item.quantity;
      }

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Request return or replacement (only for delivered orders within 7-day window)
// @route   PUT /api/orders/:id/return
// @access  Private
exports.requestReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Defective or unsatisfactory product', returnType = 'refund' } = req.body;

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to request return for this order' });
      }

      if (order.orderStatus !== 'Delivered') {
        return res.status(400).json({
          success: false,
          message: `Returns can only be requested for Delivered orders. Current status: ${order.orderStatus}`
        });
      }

      // Check 7-day return policy
      const deliveryDate = order.deliveredAt || order.updatedAt;
      const daysSinceDelivery = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 7) {
        return res.status(400).json({
          success: false,
          message: 'Return window expired. CASA allows 7-day hassle-free doorstep returns.'
        });
      }

      order.returnType = returnType;
      applyStatusTransition(
        order,
        'Return requested',
        req.user.name,
        req.user.role,
        `Customer requested ${returnType}: ${reason}`,
        reason
      );

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.user !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to request return for this order' });
      }

      if (order.orderStatus !== 'Delivered') {
        return res.status(400).json({
          success: false,
          message: `Returns can only be requested for Delivered orders. Current status: ${order.orderStatus}`
        });
      }

      order.returnType = returnType;
      applyStatusTransition(
        order,
        'Return requested',
        req.user.name,
        req.user.role,
        `Customer requested ${returnType}: ${reason}`,
        reason
      );

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};
