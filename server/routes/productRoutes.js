const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getSearchSuggestions,
  createProductReview
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/search/suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:slugOrId', getProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
