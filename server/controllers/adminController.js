const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Setting = require('../models/Setting');
const Refund = require('../models/Refund');
const ReturnRequest = require('../models/ReturnRequest');
const Shipment = require('../models/Shipment');
const Vendor = require('../models/Vendor');
const AuditLog = require('../models/AuditLog');
const AuditService = require('../services/auditService');
const socketService = require('../services/socketService');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');
const {
  applyStatusTransition,
  canTransition
} = require('../services/orderLifecycleService');

// @desc    Get Admin Dashboard Stats & Complete Operational Analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalCustomers = await User.countDocuments({ role: 'user' });
      const totalVendors = await User.countDocuments({ role: 'vendor' });
      const totalDeliveryPartners = await User.countDocuments({ role: 'delivery' });

      const allOrders = await Order.find();

      // Today's orders
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfToday).length;

      // Status breakdown
      const pendingOrders = allOrders.filter(o => ['Pending', 'Confirmed', 'Processing'].includes(o.orderStatus)).length;
      const successfulDeliveries = allOrders.filter(o => o.orderStatus === 'Delivered').length;
      const failedDeliveries = allOrders.filter(o => ['Delivery Attempt Failed', 'RTO - Return to Hub'].includes(o.orderStatus)).length;
      const cancellations = allOrders.filter(o => o.orderStatus === 'Cancelled').length;
      const returnsCount = allOrders.filter(o => ['Return requested', 'Return approved', 'Return picked up', 'Refund pending', 'Refunded'].includes(o.orderStatus)).length;

      // Financial figures
      const grossGMV = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const actualRevenue = allOrders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const refundedAmount = allOrders
        .filter(o => o.orderStatus === 'Refunded')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const platformCommissions = Math.round(actualRevenue * 0.10);
      const deliveryFeesTotal = successfulDeliveries * 65;
      const netSettlementDisbursed = Math.max(0, actualRevenue - platformCommissions);

      const validOrdersCount = allOrders.filter(o => !['Cancelled', 'Refunded'].includes(o.orderStatus)).length;
      const avgOrderValue = validOrdersCount > 0 ? Math.round(actualRevenue / validOrdersCount) : 0;

      // Low stock products (< 15 units)
      const lowStockProducts = await Product.find({ stock: { $lte: 15 }, isActive: true })
        .select('name slug stock price discountPrice images brand categorySlug vendorName')
        .limit(10);

      // Recent 15 orders
      const rawRecentOrders = await Order.find()
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(15);

      const recentOrders = rawRecentOrders.map(o => {
        const orderObj = o.toObject ? o.toObject() : { ...o };
        if (!orderObj.user || !orderObj.user.name) {
          orderObj.user = {
            name: orderObj.shippingAddress?.fullName || 'Customer',
            email: orderObj.shippingAddress?.email || 'N/A'
          };
        }
        return orderObj;
      });

      // Orders by status
      const ordersByStatus = allOrders.reduce((acc, o) => {
        acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
        return acc;
      }, {});

      // Category breakdown
      const categoryAgg = await Product.aggregate([
        { $group: { _id: '$categorySlug', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]);

      // Monthly sales agg
      const monthlySalesAgg = await Order.aggregate([
        { $match: { orderStatus: { $nin: ['Cancelled', 'Refunded'] } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalOrders,
          totalUsers: totalCustomers,
          totalCustomers,
          totalVendors,
          totalDeliveryPartners,
          totalRevenue: actualRevenue,
          grossGMV,
          actualRevenue,
          refundedAmount,
          platformCommissions,
          deliveryFeesTotal,
          netSettlementDisbursed,
          avgOrderValue,
          todayOrders,
          pendingOrders,
          successfulDeliveries,
          failedDeliveries,
          cancellations,
          returnsCount,
          lowStockProducts,
          recentOrders,
          categoryBreakdown: categoryAgg,
          monthlySales: monthlySalesAgg,
          ordersByStatus
        }
      });
    } else {
      const allOrders = dataStore.orders || [];
      const totalProducts = dataStore.products.length;
      const totalOrders = allOrders.length;
      const totalCustomers = dataStore.users.filter(u => u.role === 'user').length;
      const totalVendors = dataStore.users.filter(u => u.role === 'vendor').length;
      const totalDeliveryPartners = dataStore.users.filter(u => u.role === 'delivery').length;

      const grossGMV = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const actualRevenue = allOrders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const refundedAmount = allOrders
        .filter(o => o.orderStatus === 'Refunded')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const successfulDeliveries = allOrders.filter(o => o.orderStatus === 'Delivered').length;
      const pendingOrders = allOrders.filter(o => ['Pending', 'Confirmed', 'Processing'].includes(o.orderStatus)).length;
      const failedDeliveries = allOrders.filter(o => ['Delivery Attempt Failed', 'RTO - Return to Hub'].includes(o.orderStatus)).length;
      const cancellations = allOrders.filter(o => o.orderStatus === 'Cancelled').length;
      const returnsCount = allOrders.filter(o => ['Return requested', 'Refund pending', 'Refunded'].includes(o.orderStatus)).length;

      const platformCommissions = Math.round(actualRevenue * 0.10);
      const deliveryFeesTotal = successfulDeliveries * 65;
      const netSettlementDisbursed = Math.max(0, actualRevenue - platformCommissions);

      const lowStockProducts = dataStore.products.filter(p => p.stock <= 20).slice(0, 10);
      const ordersByStatus = {};
      allOrders.forEach(o => {
        ordersByStatus[o.orderStatus] = (ordersByStatus[o.orderStatus] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalOrders,
          totalUsers: totalCustomers,
          totalCustomers,
          totalVendors,
          totalDeliveryPartners,
          totalRevenue: actualRevenue,
          grossGMV,
          actualRevenue,
          refundedAmount,
          platformCommissions,
          deliveryFeesTotal,
          netSettlementDisbursed,
          avgOrderValue: totalOrders > 0 ? Math.round(actualRevenue / totalOrders) : 0,
          todayOrders: Math.min(allOrders.length, 3),
          pendingOrders,
          successfulDeliveries,
          failedDeliveries,
          cancellations,
          returnsCount,
          lowStockProducts,
          recentOrders: allOrders.slice(0, 10),
          categoryBreakdown: [],
          monthlySales: [],
          ordersByStatus
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin with Search & Status Filters)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (getDBStatus()) {
      const query = {};
      if (status && status !== 'ALL') {
        query.orderStatus = status;
      }
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
          { 'shippingAddress.city': { $regex: search, $options: 'i' } }
        ];
      }

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('assignedDeliveryPartner', 'name phone')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: orders
      });
    } else {
      let orders = [...(dataStore.orders || [])];
      if (status && status !== 'ALL') {
        orders = orders.filter(o => o.orderStatus === status);
      }
      if (search) {
        const s = search.toLowerCase();
        orders = orders.filter(o =>
          (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) ||
          (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(s)) ||
          (o.shippingAddress?.city && o.shippingAddress.city.toLowerCase().includes(s))
        );
      }

      const total = orders.length;
      const paginated = orders.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: paginated
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Assign or Reassign Delivery Partner to Order
// @route   PUT /api/admin/orders/:id/assign-delivery
// @access  Private/Admin
exports.assignDeliveryPartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { partnerId, reason = 'Assigned by Operations Admin' } = req.body;

      const partnerUser = partnerId || req.body.deliveryPartnerId;
      if (!partnerUser) {
        return res.status(400).json({ success: false, message: 'Delivery partner ID is required.' });
      }

      const [order, partner] = await Promise.all([
        Order.findById(id),
        User.findById(partnerUser)
      ]);

      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (!partner || partner.role !== 'delivery') {
        return res.status(400).json({ success: false, message: 'Selected user is not an approved Delivery Partner' });
      }

      order.assignedDeliveryPartner = partner._id;
      order.deliveryPartnerName = partner.name;
      order.deliveryPartnerPhone = partner.phone || '+91 98765 43210';

      order.statusHistory.push({
        status: order.orderStatus,
        timestamp: new Date(),
        note: `Dispatched & Assigned to Delivery Partner ${partner.name} (${partner.phone || 'Phone verified'}). Reason: ${reason}`,
        updatedBy: `${req.user.name} (Admin)`,
        reason
      });

      // Upsert canonical Shipment document
      let shipment = await Shipment.findOne({ order: order._id });
      if (!shipment) {
        const shipmentNumber = `SHP-${order.orderNumber.replace('CASA-', '')}`;
        shipment = await Shipment.create({
          shipmentNumber,
          order: order._id,
          orderNumber: order.orderNumber,
          vendor: order.items[0]?.vendor || req.user._id,
          deliveryPartner: partner._id,
          items: order.items.map(i => ({
            product: i.product,
            name: i.name,
            sku: i.sku || i.slug,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.subtotal
          })),
          deliveryAddress: order.shippingAddress,
          trackingNumber: `TRK-${order._id.toString().slice(-8).toUpperCase()}`,
          barcode: `BAR-${order.orderNumber}`,
          proofOtp: order.deliveryProofOtp || '1234',
          status: 'Manifested',
          events: [
            {
              status: 'Assigned',
              location: 'Hub',
              description: `Assigned to delivery partner ${partner.name}. Reason: ${reason}`,
              scannedBy: req.user._id,
              scannedByRole: 'admin',
              timestamp: new Date()
            }
          ]
        });
        order.shipments = order.shipments || [];
        order.shipments.push(shipment._id);
      } else {
        shipment.deliveryPartner = partner._id;
        shipment.events.push({
          status: 'Reassigned',
          location: 'Hub',
          description: `Reassigned to delivery partner ${partner.name}. Reason: ${reason}`,
          scannedBy: req.user._id,
          scannedByRole: 'admin',
          timestamp: new Date()
        });
        await shipment.save();
      }

      await AuditService.logEvent({
        action: 'DELIVERY_PARTNER_ASSIGNED',
        entityType: 'Order',
        entityId: order._id,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: 'admin',
        newState: { assignedDeliveryPartner: partner._id, partnerName: partner.name },
        reason
      });

      await AuditService.createNotification({
        recipient: partner._id,
        recipientRole: 'delivery',
        title: `New Shipment Assigned: ${order.orderNumber}`,
        message: `Order #${order.orderNumber} has been assigned to you for delivery.`,
        type: 'shipment_dispatch',
        data: { orderId: order._id, orderNumber: order.orderNumber }
      });

      await order.save();

      // Real-time dispatch to delivery partner and admin
      try {
        socketService.emitDeliveryTaskAssigned(order, partner._id);
        socketService.emitOrderStatusUpdate(order);
      } catch (e) {}

      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      const partner = dataStore.users.find(u => u._id === partnerId);

      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (!partner) return res.status(400).json({ success: false, message: 'Partner not found' });

      order.assignedDeliveryPartner = partner._id;
      order.deliveryPartnerName = partner.name;
      order.deliveryPartnerPhone = partner.phone || '+91 98765 43210';

      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: order.orderStatus,
        timestamp: new Date().toISOString(),
        note: `Dispatched & Assigned to Delivery Partner ${partner.name}. Reason: ${reason}`,
        updatedBy: `${req.user.name} (Admin)`,
        reason
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Manual Order Status Override
// @route   PUT /api/admin/orders/:id/override
// @access  Private/Admin
exports.adminOverrideOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason, note } = req.body;

    if (!status || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Both new status and an explicit administrative override reason are required.'
      });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      applyStatusTransition(
        order,
        status,
        req.user.name,
        'admin',
        note || `Admin manual override to ${status}`,
        reason
      );

      await AuditService.logEvent({
        action: 'ADMIN_ORDER_OVERRIDE',
        entityType: 'Order',
        entityId: order._id,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: 'admin',
        newState: { orderStatus: status },
        reason
      });

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      applyStatusTransition(
        order,
        status,
        req.user.name,
        'admin',
        note || `Admin manual override to ${status}`,
        reason
      );

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status standard
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note = '', reason = '' } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      applyStatusTransition(order, status, req.user.name, 'admin', note, reason);

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      applyStatusTransition(order, status, req.user.name, 'admin', note, reason);

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Returns and Refunds List
// @route   GET /api/admin/returns
// @access  Private/Admin
exports.getReturnsAndRefunds = async (req, res, next) => {
  try {
    const returnStatuses = [
      'Return requested',
      'Return approved',
      'Return picked up',
      'Return received',
      'Refund pending',
      'Refunded'
    ];

    if (getDBStatus()) {
      const orders = await Order.find({ orderStatus: { $in: returnStatuses } })
        .populate('user', 'name email phone')
        .sort({ updatedAt: -1 });

      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } else {
      const orders = (dataStore.orders || []).filter(o => returnStatuses.includes(o.orderStatus));
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Handle Return / Refund Action (Approve, Receive, Refund, Reject)
// @route   PUT /api/admin/orders/:id/return-action
// @access  Private/Admin
exports.handleReturnAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason = '', refundAmount } = req.body;

    if (!['approve', 'receive', 'refund', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Valid actions: approve, receive, refund, reject' });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (action === 'approve') {
        applyStatusTransition(order, 'Return approved', req.user.name, 'admin', 'Return authorized. Doorstep courier pickup dispatch scheduled.', reason);

        // Upsert ReturnRequest in MongoDB
        await ReturnRequest.findOneAndUpdate(
          { order: order._id },
          {
            returnRequestNumber: `RET-${order.orderNumber.replace('CASA-', '')}`,
            order: order._id,
            orderNumber: order.orderNumber,
            user: order.user,
            type: 'refund',
            reason: reason || 'Customer return approved',
            status: 'approved',
            pickupAddress: order.shippingAddress,
            adminNotes: 'Return pickup authorized',
            decidedBy: req.user._id,
            decidedAt: new Date()
          },
          { upsert: true, new: true }
        );
      } else if (action === 'receive') {
        applyStatusTransition(order, 'Return received', req.user.name, 'admin', 'Returned item received and inspected at Central Fulfillment Hub.', reason);

        await ReturnRequest.findOneAndUpdate(
          { order: order._id },
          { status: 'received_at_hub' }
        );
      } else if (action === 'refund') {
        const amountToRefund = refundAmount ? Number(refundAmount) : order.totalPrice;
        applyStatusTransition(order, 'Refunded', req.user.name, 'admin', `Refund of ₹${amountToRefund} processed back to original source payment method.`, reason);
        order.refundStatus = 'refunded';

        // Persist canonical Refund document
        const refundNumber = `REF-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        await Refund.create({
          refundNumber,
          order: order._id,
          orderNumber: order.orderNumber,
          user: order.user,
          amount: amountToRefund,
          gatewayRefundId: `RFND_${Date.now()}`,
          reason: reason || 'Customer return processed and approved',
          authorizedBy: req.user._id,
          authorizedByName: req.user.name,
          status: 'processed'
        });

        await ReturnRequest.findOneAndUpdate(
          { order: order._id },
          { status: 'refund_processed' }
        );
      } else if (action === 'reject') {
        applyStatusTransition(order, 'Delivered', req.user.name, 'admin', `Return request rejected: ${reason || 'Does not satisfy return criteria'}.`, reason);
        order.refundStatus = 'none';

        await ReturnRequest.findOneAndUpdate(
          { order: order._id },
          { status: 'rejected', adminNotes: reason }
        );
      }

      await AuditService.logEvent({
        action: 'RETURN_ACTION_PROCESSED',
        entityType: 'Order',
        entityId: order._id,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: 'admin',
        newState: { orderStatus: order.orderStatus, returnAction: action },
        reason
      });

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = (dataStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (action === 'approve') {
        applyStatusTransition(order, 'Return approved', req.user.name, 'admin', 'Return authorized. Doorstep courier pickup dispatch scheduled.', reason);
      } else if (action === 'receive') {
        applyStatusTransition(order, 'Return received', req.user.name, 'admin', 'Returned item received and inspected at Central Fulfillment Hub.', reason);
      } else if (action === 'refund') {
        applyStatusTransition(order, 'Refunded', req.user.name, 'admin', `Refund of ₹${order.totalPrice} processed back to original source payment method.`, reason);
        order.refundStatus = 'refunded';
      } else if (action === 'reject') {
        applyStatusTransition(order, 'Delivered', req.user.name, 'admin', `Return request rejected: ${reason || 'Does not satisfy return criteria'}.`, reason);
        order.refundStatus = 'none';
      }

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      categorySlug,
      subcategory,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      images,
      variants,
      specifications,
      isFeatured,
      isBestSeller,
      isTrending
    } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-4)}`;

    if (getDBStatus()) {
      let category = await Category.findOne({ slug: categorySlug });
      if (!category) {
        category = await Category.findOne();
      }

      const product = await Product.create({
        name,
        slug,
        brand,
        category: category?._id,
        categorySlug: category?.slug || categorySlug,
        subcategory,
        description,
        shortDescription: shortDescription || '',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        variants: variants || [],
        specifications: specifications || [],
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isTrending: Boolean(isTrending),
        isActive: true,
        approvalStatus: 'approved'
      });

      return res.status(201).json({ success: true, data: product });
    } else {
      const newProduct = {
        _id: dataStore.generateId(),
        name,
        slug,
        brand,
        categorySlug,
        subcategory,
        description,
        shortDescription: shortDescription || '',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        variants: variants || [],
        specifications: specifications || [],
        rating: 5.0,
        numReviews: 1,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isTrending: Boolean(isTrending),
        isActive: true,
        approvalStatus: 'approved',
        createdAt: new Date().toISOString()
      };

      dataStore.products.unshift(newProduct);
      return res.status(201).json({ success: true, data: newProduct });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, data: product });
    } else {
      const index = dataStore.products.findIndex(p => p._id === id || p.slug === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      dataStore.products[index] = {
        ...dataStore.products[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json({ success: true, data: dataStore.products[index] });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Product Approval / Visibility Control
// @route   PUT /api/admin/products/:id/approval
// @access  Private/Admin
exports.manageProductApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason, isActive } = req.body;

    if (getDBStatus()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      if (approvalStatus) product.approvalStatus = approvalStatus;
      if (rejectionReason !== undefined) product.rejectionReason = rejectionReason;
      if (isActive !== undefined) product.isActive = Boolean(isActive);

      await product.save();

      await AuditService.logEvent({
        action: 'PRODUCT_APPROVAL_STATUS',
        entityType: 'Product',
        entityId: product._id,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: 'admin',
        newState: { approvalStatus: product.approvalStatus, isActive: product.isActive },
        reason: rejectionReason || `Product status set to ${approvalStatus}`
      });

      return res.status(200).json({ success: true, data: product });
    } else {
      const product = dataStore.products.find(p => p._id === id || p.slug === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      if (approvalStatus) product.approvalStatus = approvalStatus;
      if (rejectionReason !== undefined) product.rejectionReason = rejectionReason;
      if (isActive !== undefined) product.isActive = Boolean(isActive);

      return res.status(200).json({ success: true, data: product });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product removed' });
    } else {
      const index = dataStore.products.findIndex(p => p._id === id || p.slug === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      dataStore.products.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Product removed' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users with role, search filter and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (getDBStatus()) {
      const query = {};
      if (role && role !== 'ALL') {
        query.role = role;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: users.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        data: users
      });
    } else {
      let users = dataStore.users.map(u => {
        const { password, ...safe } = u;
        return safe;
      });

      if (role && role !== 'ALL') {
        users = users.filter(u => u.role === role);
      }
      if (search) {
        const s = search.toLowerCase();
        users = users.filter(u =>
          (u.name && u.name.toLowerCase().includes(s)) ||
          (u.email && u.email.toLowerCase().includes(s))
        );
      }

      const total = users.length;
      const paginated = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        data: paginated
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get system audit logs with pagination and filtering
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, search, page = 1, limit = 25 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (getDBStatus()) {
      const query = {};
      if (action && action !== 'ALL') {
        query.action = action;
      }
      if (entityType && entityType !== 'ALL') {
        query.entityType = entityType;
      }
      if (search) {
        query.$or = [
          { entityId: { $regex: search, $options: 'i' } },
          { performedByName: { $regex: search, $options: 'i' } },
          { reason: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: logs.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        data: logs
      });
    } else {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page: 1,
        pages: 1,
        data: []
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Suspend or Reactivate user account with recorded reason
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.manageUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, suspensionReason = '' } = req.body;

    if (getDBStatus()) {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.isActive = Boolean(isActive);
      if (suspensionReason) user.suspensionReason = suspensionReason;

      await user.save();

      await AuditService.logEvent({
        action: isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED',
        entityType: 'User',
        entityId: user._id,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: 'admin',
        newState: { isActive: user.isActive, suspensionReason: user.suspensionReason },
        reason: suspensionReason || (isActive ? 'Reactivated by admin' : 'Suspended by admin')
      });

      return res.status(200).json({ success: true, data: user });
    } else {
      const user = dataStore.users.find(u => u._id === id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.isActive = Boolean(isActive);
      if (suspensionReason) user.suspensionReason = suspensionReason;

      const { password, ...safe } = user;
      return res.status(200).json({ success: true, data: safe });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Approve / Reject / Suspend Vendor Account
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
exports.manageVendorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vendorApprovalStatus, note = '' } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(vendorApprovalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor status' });
    }

    if (getDBStatus()) {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'Vendor account not found' });

      user.vendorApprovalStatus = vendorApprovalStatus;
      if (vendorApprovalStatus === 'suspended') {
        user.isActive = false;
        user.suspensionReason = note || 'Vendor account suspended by marketplace admin';
      } else if (vendorApprovalStatus === 'approved') {
        user.isActive = true;
      }

      await user.save();

      // Upsert Vendor profile document
      await Vendor.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          storeName: user.vendorStoreName || `${user.name}'s Store`,
          businessEmail: user.email,
          businessPhone: user.phone,
          status: vendorApprovalStatus,
          isVerified: vendorApprovalStatus === 'approved'
        },
        { upsert: true, new: true }
      );

      await AuditService.logEvent({
        action: 'VENDOR_APPROVAL_STATUS',
        entityType: 'User',
        entityId: user._id,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: 'admin',
        newState: { vendorApprovalStatus, isActive: user.isActive },
        reason: note || `Vendor status set to ${vendorApprovalStatus}`
      });

      return res.status(200).json({ success: true, data: user });
    } else {
      const user = dataStore.users.find(u => u._id === id);
      if (!user) return res.status(404).json({ success: false, message: 'Vendor account not found' });

      user.vendorApprovalStatus = vendorApprovalStatus;
      if (vendorApprovalStatus === 'suspended') {
        user.isActive = false;
        user.suspensionReason = note;
      } else if (vendorApprovalStatus === 'approved') {
        user.isActive = true;
      }

      const { password, ...safe } = user;
      return res.status(200).json({ success: true, data: safe });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'vendor', 'delivery'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role' });
    }

    if (req.user._id && req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin access' });
    }

    if (getDBStatus()) {
      const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, data: user });
    } else {
      const userIndex = dataStore.users.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      dataStore.users[userIndex].role = role;
      const { password, ...safe } = dataStore.users[userIndex];
      return res.status(200).json({ success: true, data: safe });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id && req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    if (getDBStatus()) {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } else {
      const userIndex = dataStore.users.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      dataStore.users.splice(userIndex, 1);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } else {
      const index = dataStore.orders.findIndex(o => o._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      dataStore.orders.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Order deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get store settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create({});
      }
      return res.status(200).json({ success: true, data: settings });
    } else {
      if (!dataStore.settings) {
        dataStore.settings = {
          storeName: 'CASA India Marketplace',
          supportEmail: 'support@casa.in',
          supportPhone: '+91 9876543210',
          freeShippingThreshold: 499,
          standardDeliveryFee: 49,
          codEnabled: true,
          maintenanceMode: false,
          festivalSaleActive: true,
          festivalSaleBannerText: '🎉 FESTIVAL SALE IS LIVE: Up to 70% Off + Flat ₹200 OFF with code CASA200',
          gstRate: 18,
          vendorCommissionRate: 10,
          riderDropFee: 65
        };
      }
      return res.status(200).json({ success: true, data: dataStore.settings });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create(req.body);
      } else {
        Object.assign(settings, req.body);
        await settings.save();
      }
      return res.status(200).json({ success: true, data: settings });
    } else {
      dataStore.settings = { ...(dataStore.settings || {}), ...req.body };
      return res.status(200).json({ success: true, data: dataStore.settings });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get public store settings
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create({});
      }
      return res.status(200).json({
        success: true,
        data: {
          storeName: settings.storeName || 'CASA',
          storeTagline: settings.storeTagline || 'INDIA MARKETPLACE',
          primaryColor: settings.primaryColor || '#2563eb',
          defaultLanguage: settings.defaultLanguage || 'en',
          supportEmail: settings.supportEmail || 'support@casa.in',
          supportPhone: settings.supportPhone || '+91 9876543210',
          festivalSaleActive: settings.festivalSaleActive !== false,
          festivalSaleBannerText: settings.festivalSaleBannerText || '',
          freeShippingThreshold: settings.freeShippingThreshold || 499,
          standardDeliveryFee: settings.standardDeliveryFee || 49,
          codEnabled: settings.codEnabled !== false
        }
      });
    } else {
      const s = dataStore.settings || {};
      return res.status(200).json({
        success: true,
        data: {
          storeName: s.storeName || 'CASA',
          storeTagline: s.storeTagline || 'INDIA MARKETPLACE',
          primaryColor: s.primaryColor || '#2563eb',
          defaultLanguage: s.defaultLanguage || 'en',
          supportEmail: s.supportEmail || 'support@casa.in',
          supportPhone: s.supportPhone || '+91 9876543210',
          festivalSaleActive: s.festivalSaleActive !== false,
          festivalSaleBannerText: s.festivalSaleBannerText || '',
          freeShippingThreshold: s.freeShippingThreshold || 499,
          standardDeliveryFee: s.standardDeliveryFee || 49,
          codEnabled: s.codEnabled !== false
        }
      });
    }
  } catch (err) {
    next(err);
  }
};
