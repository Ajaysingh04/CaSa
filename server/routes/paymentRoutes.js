const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, handlePaymentWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public Webhook with signature verification
router.post('/webhook', handlePaymentWebhook);

// Protected routes
router.use(protect);

router.post('/create-order', createPayment);
router.post('/verify', verifyPayment);

module.exports = router;
