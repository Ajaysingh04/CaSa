const express = require('express');
const router = express.Router();
const {
  getDeliveryStats,
  getAvailableDeliveries,
  getMyDeliveries,
  acceptDeliveryOrder,
  updateDeliveryStatus
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDeliveryStats);
router.get('/available', getAvailableDeliveries);
router.get('/my-deliveries', getMyDeliveries);
router.put('/orders/:id/accept', acceptDeliveryOrder);
router.put('/orders/:id/status', updateDeliveryStatus);

module.exports = router;
