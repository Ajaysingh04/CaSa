const Order = require('../models/Order');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const AuditService = require('../services/auditService');
const socketService = require('../services/socketService');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// @desc    Get Delivery Partner Dashboard Stats
// @route   GET /api/delivery/stats
// @access  Private (Delivery / Admin)
exports.getDeliveryStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      const allOrders = await Order.find();
      const availablePool = allOrders.filter(o => ['Packed', 'Shipped'].includes(o.orderStatus)).length;

      const myAssigned = allOrders.filter(o =>
        o.assignedDeliveryPartner && o.assignedDeliveryPartner.toString() === userId.toString()
      );

      const myActive = myAssigned.filter(o => ['Packed', 'Shipped', 'Out for delivery', 'Delivery Attempt Failed'].includes(o.orderStatus)).length;
      const myCompleted = myAssigned.filter(o => o.orderStatus === 'Delivered').length;
      const earnings = myCompleted * 65; // ₹65 payout per successful delivery

      // COD cash collection reconciliation
      const codCashInHand = myAssigned
        .filter(o => o.orderStatus === 'Delivered' && o.paymentMethod === 'cod')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const userDoc = await User.findById(userId);

      return res.status(200).json({
        success: true,
        data: {
          availablePool,
          myActive,
          myCompleted,
          earnings,
          codCashInHand,
          totalAssigned: myAssigned.length,
          onDuty: userDoc?.onDuty !== false,
          assignedZone: userDoc?.assignedZone || 'Central Hub - Zone 1'
        }
      });
    } else {
      const allOrders = dataStore.orders || [];
      const availablePool = allOrders.filter(o => ['Packed', 'Shipped'].includes(o.orderStatus)).length;
      const myAssigned = allOrders.filter(o => o.assignedDeliveryPartner === userId);
      const myActive = myAssigned.filter(o => ['Packed', 'Shipped', 'Out for delivery', 'Delivery Attempt Failed'].includes(o.orderStatus)).length;
      const myCompleted = myAssigned.filter(o => o.orderStatus === 'Delivered').length;

      const codCashInHand = myAssigned
        .filter(o => o.orderStatus === 'Delivered' && o.paymentMethod === 'cod')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          availablePool,
          myActive,
          myCompleted,
          earnings: myCompleted * 65,
          codCashInHand,
          totalAssigned: myAssigned.length,
          onDuty: req.user.onDuty !== false,
          assignedZone: req.user.assignedZone || 'Central Hub - Zone 1'
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Delivery Partner On-Duty / Off-Duty Status
// @route   PUT /api/delivery/duty-status
// @access  Private (Delivery / Admin)
exports.toggleDutyStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.onDuty = !user.onDuty;
      await user.save();

      return res.status(200).json({
        success: true,
        data: {
          onDuty: user.onDuty,
          message: user.onDuty ? 'You are now ONLINE & ready for delivery tasks.' : 'You are now OFF DUTY.'
        }
      });
    } else {
      req.user.onDuty = !req.user.onDuty;
      return res.status(200).json({
        success: true,
        data: {
          onDuty: req.user.onDuty,
          message: req.user.onDuty ? 'You are now ONLINE & ready for delivery tasks.' : 'You are now OFF DUTY.'
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Available Orders Ready for Pickup (Packed or Shipped)
// @route   GET /api/delivery/available
// @access  Private (Delivery / Admin)
exports.getAvailableDeliveries = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const orders = await Order.find({
        orderStatus: { $in: ['Packed', 'Shipped', 'Confirmed'] }
      })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } else {
      const orders = (dataStore.orders || []).filter(o =>
        ['Packed', 'Shipped', 'Confirmed'].includes(o.orderStatus)
      );
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

// @desc    Get Active Deliveries Assigned to Current Partner
// @route   GET /api/delivery/my-deliveries
// @access  Private (Delivery / Admin)
exports.getMyDeliveries = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      let orders = await Order.find({
        $or: [
          { assignedDeliveryPartner: userId },
          { orderStatus: { $in: ['Packed', 'Shipped', 'Out for delivery', 'Delivery Attempt Failed', 'RTO - Return to Hub'] } }
        ]
      })
        .populate('user', 'name email phone')
        .sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } else {
      const orders = (dataStore.orders || []).filter(o =>
        o.assignedDeliveryPartner === userId ||
        ['Packed', 'Shipped', 'Out for delivery', 'Delivery Attempt Failed', 'RTO - Return to Hub'].includes(o.orderStatus)
      );
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

// @desc    Accept / Assign Order to Delivery Partner
// @route   PUT /api/delivery/orders/:id/accept
// @access  Private (Delivery / Admin)
exports.acceptDeliveryOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partnerId = req.user._id;
    const partnerName = req.user.name || 'CASA Express Courier';
    const partnerPhone = req.user.phone || '+91 98765 43210';

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.assignedDeliveryPartner = partnerId;
      order.deliveryPartnerName = partnerName;
      order.deliveryPartnerPhone = partnerPhone;
      if (order.orderStatus === 'Confirmed' || order.orderStatus === 'Packed') {
        order.orderStatus = 'Shipped';
      }

      order.statusHistory.push({
        status: order.orderStatus,
        note: `Delivery assigned to partner ${partnerName} (${partnerPhone})`,
        updatedAt: new Date()
      });

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.assignedDeliveryPartner = partnerId;
      order.deliveryPartnerName = partnerName;
      order.deliveryPartnerPhone = partnerPhone;
      if (order.orderStatus === 'Confirmed' || order.orderStatus === 'Packed') {
        order.orderStatus = 'Shipped';
      }

      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: order.orderStatus,
        note: `Delivery assigned to partner ${partnerName} (${partnerPhone})`,
        updatedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Pickup Confirmation with Scan Timestamp
// @route   PUT /api/delivery/orders/:id/pickup
// @access  Private (Delivery / Admin)
exports.confirmPickup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.pickupConfirmedAt = now;
      order.orderStatus = 'Shipped';
      order.statusHistory.push({
        status: 'Shipped',
        note: `Barcode scanned & package picked up from Merchant Hub at ${now.toLocaleTimeString()}`,
        updatedAt: now
      });

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.pickupConfirmedAt = now.toISOString();
      order.orderStatus = 'Shipped';
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: 'Shipped',
        note: `Barcode scanned & package picked up from Merchant Hub at ${now.toLocaleTimeString()}`,
        updatedAt: now.toISOString()
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update Delivery Status (In-Transit -> Out for Delivery -> Delivered / Failed / RTO)
// @route   PUT /api/delivery/orders/:id/status
// @access  Private (Delivery / Admin)
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, otp, failedReason } = req.body;

    const allowed = [
      'Shipped',
      'Out for delivery',
      'Delivered',
      'Delivery Attempt Failed',
      'RTO - Return to Hub'
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery status. Allowed: ${allowed.join(', ')}`
      });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Authorization & object ownership: Only assigned delivery partner or admin can update
      if (req.user.role === 'delivery' || req.user.role === 'delivery_partner') {
        if (
          order.assignedDeliveryPartner &&
          order.assignedDeliveryPartner.toString() !== req.user._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized: You are not the assigned delivery partner for this parcel.'
          });
        }
      }

      if (status === 'Delivered') {
        if (order.deliveryProofOtp && otp && otp.trim() !== order.deliveryProofOtp.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Incorrect 4-digit Delivery Verification OTP. Please ask customer for the correct code.'
          });
        }
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
          order.paymentDetails = {
            paidAt: new Date()
          };
        }
      }

      if (status === 'Delivery Attempt Failed') {
        order.failedAttemptReason = failedReason || 'Customer unavailable at delivery location';
        order.reattemptDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // scheduled for next day
      }

      const prevStatus = order.orderStatus;
      order.orderStatus = status;

      let historyNote = note;
      if (!historyNote) {
        if (status === 'Delivered') {
          historyNote = order.paymentMethod === 'cod'
            ? 'Delivered & Cash on Delivery collected at doorstep'
            : 'Delivered securely to recipient';
        } else if (status === 'Delivery Attempt Failed') {
          historyNote = `Delivery Attempt Failed: ${order.failedAttemptReason}. Reattempt scheduled.`;
        } else if (status === 'RTO - Return to Hub') {
          historyNote = 'RTO Initiated: Shipment being returned to Merchant Fulfillment Hub.';
        } else {
          historyNote = `Delivery milestone: ${status}`;
        }
      }

      order.statusHistory.push({
        status,
        note: historyNote,
        updatedAt: new Date()
      });

      await order.save();

      // Sync canonical Shipment document
      try {
        const shipmentStatusMap = {
          'Shipped': 'IN_TRANSIT',
          'Out for delivery': 'OUT_FOR_DELIVERY',
          'Delivered': 'DELIVERED',
          'Delivery Attempt Failed': 'DELIVERY_FAILED',
          'RTO - Return to Hub': 'RTO_INITIATED'
        };
        const mappedStatus = shipmentStatusMap[status] || 'IN_TRANSIT';

        await Shipment.findOneAndUpdate(
          { order: order._id },
          {
            $set: { status: mappedStatus },
            $push: {
              events: {
                status: mappedStatus,
                timestamp: new Date(),
                location: req.user.assignedZone || 'Central Delivery Hub',
                remarks: historyNote,
                scannedBy: req.user._id
              }
            }
          }
        );
      } catch (err) {
        console.warn('Shipment sync warning:', err.message);
      }

      // Record business event in AuditLog
      await AuditService.logEvent({
        action: `DELIVERY_STATUS_${status.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
        entityType: 'Shipment',
        entityId: order._id,
        performedBy: req.user._id,
        performedByName: req.user.name || 'Delivery Partner',
        performedByRole: req.user.role,
        previousState: { orderStatus: prevStatus },
        newState: { orderStatus: status },
        reason: historyNote
      });

      // Notify customer of delivery updates
      await AuditService.createNotification({
        recipient: order.user,
        recipientRole: 'user',
        title: status === 'Delivered' ? 'Parcel Delivered! 🎉' : `Order Update: ${status}`,
        message: historyNote,
        type: status === 'Delivered' ? 'delivery_alert' : 'order_status',
        data: { orderId: order._id, orderNumber: order.orderNumber }
      });

      // Real-time WebSocket milestone update
      try {
        socketService.emitDeliveryMilestone(order, { status, note: historyNote });
        socketService.emitOrderStatusUpdate(order);
      } catch (e) {}

      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (status === 'Delivered') {
        if (order.deliveryProofOtp && otp && otp.trim() !== order.deliveryProofOtp.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Incorrect 4-digit Delivery Verification OTP. Please ask customer for the correct code.'
          });
        }
        order.deliveredAt = new Date().toISOString();
        if (order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
          order.paymentDetails = {
            paidAt: new Date().toISOString()
          };
        }
      }

      if (status === 'Delivery Attempt Failed') {
        order.failedAttemptReason = failedReason || 'Customer unavailable at delivery location';
        order.reattemptDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      order.orderStatus = status;

      let historyNote = note;
      if (!historyNote) {
        if (status === 'Delivered') {
          historyNote = order.paymentMethod === 'cod'
            ? 'Delivered & Cash on Delivery collected at doorstep'
            : 'Delivered securely to recipient';
        } else if (status === 'Delivery Attempt Failed') {
          historyNote = `Delivery Attempt Failed: ${order.failedAttemptReason}. Reattempt scheduled.`;
        } else if (status === 'RTO - Return to Hub') {
          historyNote = 'RTO Initiated: Shipment being returned to Merchant Fulfillment Hub.';
        } else {
          historyNote = `Delivery milestone: ${status}`;
        }
      }

      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        note: historyNote,
        updatedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Delivery Partner Earnings & Reconciliation Ledger
// @route   GET /api/delivery/earnings
// @access  Private (Delivery / Admin)
exports.getDeliveryEarnings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let myOrders = [];

    if (getDBStatus()) {
      myOrders = await Order.find({
        $or: [
          { assignedDeliveryPartner: userId },
          { orderStatus: 'Delivered' }
        ]
      }).sort({ updatedAt: -1 });
    } else {
      myOrders = (dataStore.orders || []).filter(o =>
        o.assignedDeliveryPartner === userId || o.orderStatus === 'Delivered'
      );
    }

    const deliveredOrders = myOrders.filter(o => o.orderStatus === 'Delivered');
    const totalDeliveries = deliveredOrders.length;
    const baseEarnings = totalDeliveries * 65; // ₹65 per delivery
    const incentives = totalDeliveries > 5 ? 250 : 0;
    const totalEarnings = baseEarnings + incentives;

    const codCollected = deliveredOrders
      .filter(o => o.paymentMethod === 'cod')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const runHistory = deliveredOrders.map(o => ({
      orderNumber: o.orderNumber,
      customerName: o.shippingAddress?.fullName || 'Customer',
      city: o.shippingAddress?.city || 'Mumbai',
      paymentMethod: (o.paymentMethod || 'razorpay').toUpperCase(),
      codAmount: o.paymentMethod === 'cod' ? o.totalPrice : 0,
      payout: 65,
      date: o.deliveredAt || o.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDeliveries,
          baseEarnings,
          incentives,
          totalEarnings,
          codCollected,
          codDepositStatus: codCollected > 0 ? 'Pending Shift Deposit at Hub' : 'Reconciled',
          nextPayoutDate: 'Tuesday, 28 Oct 2026',
          bankAccount: 'Kotak Mahindra Bank ••••2201'
        },
        runHistory
      }
    });
  } catch (err) {
    next(err);
  }
};
