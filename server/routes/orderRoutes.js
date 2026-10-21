const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateItemShipmentStatus,
  cancelOrder,
  requestReturn
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/items/:itemId/shipment', updateItemShipmentStatus);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/return', requestReturn);

module.exports = router;
