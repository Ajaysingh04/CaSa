const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create-order', createPayment);
router.post('/verify', verifyPayment);

module.exports = router;
