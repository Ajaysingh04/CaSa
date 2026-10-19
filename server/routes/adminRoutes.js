const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSettings,
  updateSettings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Admin Dashboard stats
router.get('/stats', getDashboardStats);

// Admin Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Admin Products CRUD
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Admin Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Store Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
