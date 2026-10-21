const Order = require('../models/Order');
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

      const myActive = myAssigned.filter(o => ['Packed', 'Shipped', 'Out for delivery'].includes(o.orderStatus)).length;
      const myCompleted = myAssigned.filter(o => o.orderStatus === 'Delivered').length;
      const earnings = myCompleted * 65; // ₹65 payout per successful delivery

      return res.status(200).json({
        success: true,
        data: {
          availablePool,
          myActive,
          myCompleted,
          earnings,
          totalAssigned: myAssigned.length
        }
      });
    } else {
      const allOrders = dataStore.orders || [];
      const availablePool = allOrders.filter(o => ['Packed', 'Shipped'].includes(o.orderStatus)).length;
      const myAssigned = allOrders.filter(o => o.assignedDeliveryPartner === userId);
      const myActive = myAssigned.filter(o => ['Packed', 'Shipped', 'Out for delivery'].includes(o.orderStatus)).length;
      const myCompleted = myAssigned.filter(o => o.orderStatus === 'Delivered').length;

      return res.status(200).json({
        success: true,
        data: {
          availablePool,
          myActive,
          myCompleted,
          earnings: myCompleted * 65,
          totalAssigned: myAssigned.length
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
      // Find orders assigned to this rider, or all active if none assigned yet
      let orders = await Order.find({
        $or: [
          { assignedDeliveryPartner: userId },
          { orderStatus: { $in: ['Packed', 'Shipped', 'Out for delivery'] } }
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
        ['Packed', 'Shipped', 'Out for delivery'].includes(o.orderStatus)
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

// @desc    Update Delivery Status (Shipped -> Out for delivery -> Delivered)
// @route   PUT /api/delivery/orders/:id/status
// @access  Private (Delivery / Admin)
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, otp } = req.body;

    const allowed = ['Shipped', 'Out for delivery', 'Delivered'];
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

      order.orderStatus = status;

      order.statusHistory.push({
        status,
        note: note || (status === 'Delivered' && order.paymentMethod === 'cod' ? 'Delivered & Cash on Delivery collected at doorstep' : `Delivery milestone: ${status}`),
        updatedAt: new Date()
      });

      await order.save();
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

      order.orderStatus = status;

      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        note: note || (status === 'Delivered' && order.paymentMethod === 'cod' ? 'Delivered & Cash on Delivery collected at doorstep' : `Delivery milestone: ${status}`),
        updatedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};
