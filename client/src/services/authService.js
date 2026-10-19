import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('casa_token', response.data.token);
      localStorage.setItem('casa_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('casa_token', response.data.token);
      localStorage.setItem('casa_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('casa_token');
      localStorage.removeItem('casa_user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('casa_user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  // Addresses
  getAddresses: async () => {
    const response = await api.get('/user/addresses');
    return response.data.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/user/addresses', addressData);
    return response.data.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(`/user/addresses/${id}`);
    return response.data;
  },

  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/user/wishlist');
    return response.data.data;
  },

  toggleWishlist: async (productId) => {
    const response = await api.post('/user/wishlist/toggle', { productId });
    return response.data;
  },
};
