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
const { protect, authorize, forbidDemoAdminMutations } = require('../middleware/auth');

router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.get('/all', protect, authorize('admin', 'super_admin'), getAllCouponsAdmin);
router.post('/', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, createCoupon);
router.put('/:id', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, updateCoupon);
router.delete('/:id', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, deleteCoupon);

module.exports = router;
