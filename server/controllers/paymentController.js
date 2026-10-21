const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/paymentService');

// @desc    Create Razorpay Payment Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    let order;
    if (getDBStatus()) {
      order = await Order.findById(orderId);
    } else {
      order = dataStore.orders.find(o => o._id === orderId || o.orderNumber === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This order is already marked as paid' });
    }

    const rzpOrder = await createRazorpayOrder(order._id, order.totalPrice);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        razorpayOrderId: rzpOrder.razorpayOrderId,
        keyId: rzpOrder.keyId,
        mode: rzpOrder.mode,
        user: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone || '9999999999'
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment signature & confirm order
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification details'
      });
    }

    const { verified, mode } = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature.'
      });
    }

    if (getDBStatus()) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Idempotency: If order is already verified and marked as paid, return early
      if (order.paymentStatus === 'paid') {
        return res.status(200).json({
          success: true,
          message: 'Payment already verified (idempotent)',
          data: order
        });
      }

      order.paymentStatus = 'paid';
      order.orderStatus = 'Confirmed';
      order.paymentDetails = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date()
      };
      order.statusHistory.push({
        fromStatus: 'Pending',
        status: 'Confirmed',
        timestamp: new Date(),
        note: `Payment verified successfully via ${mode === 'simulated_test_mode' ? 'Razorpay Simulated Sandbox' : 'Razorpay Gateway'} (Ref: ${razorpayPaymentId})`,
        updatedBy: 'Payment Gateway',
        reason: 'Payment verified and captured'
      });

      await order.save();

      await Payment.create({
        order: order._id,
        user: req.user._id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: order.totalPrice,
        status: 'captured'
      });

      return res.status(200).json({
        success: true,
        message: 'Payment successfully verified and order confirmed',
        data: order
      });
    } else {
      const order = dataStore.orders.find(o => o._id === orderId || o.orderNumber === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.paymentStatus === 'paid') {
        return res.status(200).json({
          success: true,
          message: 'Payment already verified (idempotent)',
          data: order
        });
      }

      order.paymentStatus = 'paid';
      order.orderStatus = 'Confirmed';
      order.paymentDetails = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date().toISOString()
      };
      order.statusHistory.push({
        status: 'Confirmed',
        timestamp: new Date().toISOString(),
        note: `Payment verified successfully (Ref: ${razorpayPaymentId})`,
        updatedBy: 'Payment Gateway'
      });

      return res.status(200).json({
        success: true,
        message: 'Payment successfully verified and order confirmed',
        data: order
      });
    }
  } catch (err) {
    next(err);
  }
};
