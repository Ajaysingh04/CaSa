const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  applyCoupon,
  removeCoupon,
  mergeGuestCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:itemId', updateQuantity);
router.delete('/items/:itemId', removeItem);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.post('/merge', mergeGuestCart);

module.exports = router;
