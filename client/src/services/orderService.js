import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  publicTrackOrder: async (query) => {
    const response = await api.get(`/orders/public/track/${encodeURIComponent(query)}`);
    return response.data.data;
  },

  cancelOrder: async (id, reason) => {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data.data;
  },

  requestReturn: async (id, reason, returnType = 'refund') => {
    const response = await api.put(`/orders/${id}/return`, { reason, returnType });
    return response.data.data;
  },

  // Payment
  createPaymentOrder: async (orderId) => {
    const response = await api.post('/payments/create-order', { orderId });
    return response.data.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  submitDeliveryFeedback: async (orderId, feedbackData) => {
    const response = await api.post(`/orders/${orderId}/delivery-feedback`, feedbackData);
    return response.data.data;
  },
};
