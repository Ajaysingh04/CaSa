import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  addItem: async (productId, quantity = 1, selectedVariant = {}) => {
    const response = await api.post('/cart/items', {
      productId,
      quantity,
      selectedVariant,
    });
    return response.data.data;
  },

  updateQuantity: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data.data;
  },

  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data.data;
  },

  applyCoupon: async (code) => {
    const response = await api.post('/cart/coupon', { code });
    return response.data.data;
  },

  removeCoupon: async () => {
    const response = await api.delete('/cart/coupon');
    return response.data.data;
  },

  mergeGuestCart: async (guestItems) => {
    const response = await api.post('/cart/merge', { guestItems });
    return response.data.data;
  },
};
