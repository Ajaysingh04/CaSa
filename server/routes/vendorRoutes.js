const express = require('express');
const router = express.Router();
const {
  getVendorStats,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorProducts,
  updateVendorProduct,
  createVendorProduct,
  getVendorFinancials
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getVendorStats);
router.get('/orders', getVendorOrders);
router.put('/orders/:id/status', updateVendorOrderStatus);
router.get('/products', getVendorProducts);
router.post('/products', createVendorProduct);
router.put('/products/:id', updateVendorProduct);
router.get('/financials', getVendorFinancials);

module.exports = router;
