const express = require('express');
const router = express.Router();
const {
  getVendorStats,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorProducts,
  updateVendorProduct
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getVendorStats);
router.get('/orders', getVendorOrders);
router.put('/orders/:id/status', updateVendorOrderStatus);
router.get('/products', getVendorProducts);
router.put('/products/:id', updateVendorProduct);

module.exports = router;
