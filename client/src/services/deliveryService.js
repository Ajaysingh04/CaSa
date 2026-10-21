import api from './api';

export const deliveryService = {
  getStats: async () => {
    const res = await api.get('/delivery/stats');
    return res.data.data;
  },

  getAvailableDeliveries: async () => {
    const res = await api.get('/delivery/available');
    return res.data.data;
  },

  getMyDeliveries: async () => {
    const res = await api.get('/delivery/my-deliveries');
    return res.data.data;
  },

  acceptDelivery: async (orderId) => {
    const res = await api.put(`/delivery/orders/${orderId}/accept`);
    return res.data.data;
  },

  updateDeliveryStatus: async (orderId, status, note = '') => {
    const res = await api.put(`/delivery/orders/${orderId}/status`, {
      status,
      note
    });
    return res.data.data;
  }
};
