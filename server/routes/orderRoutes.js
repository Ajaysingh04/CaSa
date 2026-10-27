const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  publicTrackOrder,
  updateOrderStatus,
  updateItemShipmentStatus,
  cancelOrder,
  requestReturn,
  submitDeliveryFeedback
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Public tracking endpoint (accessible to guests and authenticated users)
router.get('/public/track/:query', publicTrackOrder);

router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/items/:itemId/shipment', updateItemShipmentStatus);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/return', requestReturn);
router.post('/:id/delivery-feedback', submitDeliveryFeedback);

module.exports = router;
