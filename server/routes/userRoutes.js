const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addressSchema } = require('../validators/authValidator');

router.use(protect);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressSchema), addAddress);
router.delete('/addresses/:id', deleteAddress);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

module.exports = router;
