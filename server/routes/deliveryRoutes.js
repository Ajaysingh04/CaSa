const express = require('express');
const router = express.Router();
const {
  getDeliveryStats,
  toggleDutyStatus,
  getAvailableDeliveries,
  getMyDeliveries,
  acceptDeliveryOrder,
  confirmPickup,
  updateDeliveryStatus,
  getDeliveryEarnings
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('delivery', 'delivery_partner', 'admin'));

router.get('/stats', getDeliveryStats);
router.put('/duty-status', toggleDutyStatus);
router.get('/available', getAvailableDeliveries);
router.get('/my-deliveries', getMyDeliveries);
router.put('/orders/:id/accept', acceptDeliveryOrder);
router.put('/orders/:id/pickup', confirmPickup);
router.put('/orders/:id/status', updateDeliveryStatus);
router.get('/earnings', getDeliveryEarnings);

module.exports = router;
