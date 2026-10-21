import api from './api';

export const adminService = {
  // Stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  // Orders & Shipments
  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (id, status, note = '', reason = '') => {
    const response = await api.put(`/admin/orders/${id}/status`, { status, note, reason });
    return response.data.data;
  },

  assignDeliveryPartner: async (id, partnerId, reason = '') => {
    const response = await api.put(`/admin/orders/${id}/assign-delivery`, { partnerId, reason });
    return response.data.data;
  },

  overrideOrderStatus: async (id, status, reason, note = '') => {
    const response = await api.put(`/admin/orders/${id}/override`, { status, reason, note });
    return response.data.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/admin/orders/${id}`);
    return response.data;
  },

  // Returns & Refunds
  getReturns: async () => {
    const response = await api.get('/admin/returns');
    return response.data.data;
  },

  handleReturnAction: async (id, action, reason = '') => {
    const response = await api.put(`/admin/orders/${id}/return-action`, { action, reason });
    return response.data.data;
  },

  // Products
  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data.data;
  },

  manageProductApproval: async (id, approvalData) => {
    const response = await api.put(`/admin/products/${id}/approval`, approvalData);
    return response.data.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Users & Vendors
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  manageUserStatus: async (id, isActive, suspensionReason = '') => {
    const response = await api.put(`/admin/users/${id}/status`, { isActive, suspensionReason });
    return response.data.data;
  },

  manageVendorStatus: async (id, vendorApprovalStatus, note = '') => {
    const response = await api.put(`/admin/vendors/${id}/status`, { vendorApprovalStatus, note });
    return response.data.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Coupons
  getCoupons: async () => {
    const response = await api.get('/coupons');
    return response.data.data;
  },

  getAllCouponsAdmin: async () => {
    const response = await api.get('/coupons/all');
    return response.data.data;
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data.data;
  },

  updateCoupon: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data.data;
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.put('/admin/settings', settingsData);
    return response.data.data;
  },

  // Banners
  getAllBannersAdmin: async () => {
    const response = await api.get('/banners/all');
    return response.data.data;
  },

  createBanner: async (bannerData) => {
    const response = await api.post('/banners', bannerData);
    return response.data.data;
  },

  updateBanner: async (id, bannerData) => {
    const response = await api.put(`/banners/${id}`, bannerData);
    return response.data.data;
  },

  deleteBanner: async (id) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },
};
