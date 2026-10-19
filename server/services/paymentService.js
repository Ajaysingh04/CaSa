const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');

const createRazorpayOrder = async (orderId, amountINR) => {
  const razorpay = getRazorpayInstance();
  const amountPaisa = Math.round(amountINR * 100);

  if (razorpay) {
    const options = {
      amount: amountPaisa,
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      notes: { orderId }
    };
    const order = await razorpay.orders.create(options);
    return {
      success: true,
      mode: 'razorpay_live_test',
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    };
  }

  // Resilient Sandbox Simulator when Razorpay test keys are pending configuration
  const mockRzpOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  return {
    success: true,
    mode: 'simulated_test_mode',
    message: 'Running in CASA Simulated Payment Sandbox (Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in server/.env for live test gateway)',
    razorpayOrderId: mockRzpOrderId,
    amount: amountPaisa,
    currency: 'INR',
    keyId: 'rzp_test_placeholder_key'
  };
};

const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // If using simulation mode:
  if (razorpayOrderId.startsWith('order_sim_') || !keySecret || keySecret.includes('placeholder')) {
    return {
      verified: true,
      mode: 'simulated_test_mode'
    };
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const verified = generatedSignature === razorpaySignature;
  return {
    verified,
    mode: 'razorpay_verified'
  };
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature
};
