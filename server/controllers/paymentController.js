const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/paymentService');
const AuditService = require('../services/auditService');

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

      // Centralized audit and event persistence
      await AuditService.logEvent({
        action: 'PAYMENT_CAPTURED',
        entityType: 'Payment',
        entityId: order._id,
        performedBy: req.user._id,
        performedByName: req.user.name || 'Customer',
        performedByRole: 'user',
        previousState: { paymentStatus: 'pending' },
        newState: { paymentStatus: 'paid', razorpayPaymentId, amount: order.totalPrice },
        reason: 'Payment captured and verified via Razorpay gateway'
      });

      await AuditService.createNotification({
        recipient: order.user,
        recipientRole: 'user',
        title: 'Payment Confirmed',
        message: `Your payment of ₹${order.totalPrice} for Order #${order.orderNumber} has been received.`,
        type: 'payment',
        data: { orderId: order._id, orderNumber: order.orderNumber, paymentId: razorpayPaymentId }
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

// @desc    Handle Razorpay Payment Gateway Webhook
// @route   POST /api/payments/webhook
// @access  Public (Signature-Verified)
exports.handlePaymentWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature && webhookSecret && !webhookSecret.includes('placeholder')) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay signature header' });
    }

    if (webhookSecret && !webhookSecret.includes('placeholder') && signature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity || {};
      const rzpOrderId = paymentEntity.order_id;
      const rzpPaymentId = paymentEntity.id;
      const orderId = paymentEntity.notes?.orderId;

      if (getDBStatus()) {
        const query = orderId ? { _id: orderId } : { 'paymentDetails.razorpayOrderId': rzpOrderId };
        const order = await Order.findOne(query);

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.orderStatus = 'Confirmed';
          order.paymentDetails = {
            razorpayOrderId: rzpOrderId,
            razorpayPaymentId: rzpPaymentId,
            paidAt: new Date()
          };
          order.statusHistory.push({
            fromStatus: 'Pending',
            status: 'Confirmed',
            timestamp: new Date(),
            note: `Payment verified via webhook '${event}' (Ref: ${rzpPaymentId})`,
            updatedBy: 'Razorpay Webhook',
            reason: 'Webhook event payment.captured'
          });
          await order.save();

          await Payment.findOneAndUpdate(
            { razorpayOrderId: rzpOrderId },
            {
              order: order._id,
              user: order.user,
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: rzpPaymentId,
              amount: order.totalPrice,
              status: 'captured'
            },
            { upsert: true }
          );

          await AuditService.logEvent({
            action: 'WEBHOOK_PAYMENT_CAPTURED',
            entityType: 'Payment',
            entityId: order._id,
            performedByName: 'Razorpay Webhook Engine',
            performedByRole: 'system',
            newState: { paymentStatus: 'paid', razorpayPaymentId: rzpPaymentId },
            reason: `Webhook confirmed payment event '${event}'`
          });

          await AuditService.createNotification({
            recipient: order.user,
            recipientRole: 'user',
            title: 'Payment Confirmed',
            message: `Your payment for Order #${order.orderNumber} was confirmed via payment gateway webhook.`,
            type: 'payment_event',
            data: { orderId: order._id, orderNumber: order.orderNumber }
          });
        }
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};

