const express = require('express');
const router = express.Router();
const {
  getCoupons,
  validateCoupon,
  createCoupon,
  getAllCouponsAdmin,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.get('/all', protect, authorize('admin'), getAllCouponsAdmin);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
