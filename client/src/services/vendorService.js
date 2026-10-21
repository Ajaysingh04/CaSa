import api from './api';

export const vendorService = {
  getStats: async () => {
    const res = await api.get('/vendor/stats');
    return res.data.data;
  },

  getOrders: async (status = 'ALL') => {
    const res = await api.get('/vendor/orders', {
      params: { status: status !== 'ALL' ? status : undefined }
    });
    return res.data.data;
  },

  updateOrderStatus: async (orderId, status, vendorNotes = '') => {
    const res = await api.put(`/vendor/orders/${orderId}/status`, {
      status,
      vendorNotes
    });
    return res.data.data;
  },

  getProducts: async () => {
    const res = await api.get('/vendor/products');
    return res.data.data;
  },

  updateProduct: async (productId, data) => {
    const res = await api.put(`/vendor/products/${productId}`, data);
    return res.data.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/vendor/products', productData);
    return res.data.data;
  },

  getFinancials: async () => {
    const res = await api.get('/vendor/financials');
    return res.data.data;
  }
};
