const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  assignDeliveryPartner,
  adminOverrideOrderStatus,
  updateOrderStatus,
  deleteOrder,
  getReturnsAndRefunds,
  handleReturnAction,
  createProduct,
  updateProduct,
  manageProductApproval,
  deleteProduct,
  getAllUsers,
  manageUserStatus,
  manageVendorStatus,
  updateUserRole,
  deleteUser,
  getSettings,
  updateSettings,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Admin Dashboard stats & Audit trail
router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

// Admin Orders & Shipments
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/assign-delivery', assignDeliveryPartner);
router.put('/orders/:id/override', adminOverrideOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Returns & Refunds
router.get('/returns', getReturnsAndRefunds);
router.put('/orders/:id/return-action', handleReturnAction);

// Admin Products CRUD & Approval
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.put('/products/:id/approval', manageProductApproval);
router.delete('/products/:id', deleteProduct);

// Admin Users & Vendors
router.get('/users', getAllUsers);
router.put('/users/:id/status', manageUserStatus);
router.put('/vendors/:id/status', manageVendorStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Store Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
