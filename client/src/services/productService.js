import api from './api';

export const productService = {
  // Get products with query parameters (category, subcategory, brand, price, rating, sort, page, limit, search)
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product by slug or id
  getProduct: async (slugOrId) => {
    const response = await api.get(`/products/${slugOrId}`);
    return response.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    const response = await api.get('/products/search/suggestions', {
      params: { q: query },
    });
    return response.data.suggestions;
  },

  // Add review
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Get promotional banners
  getBanners: async () => {
    const response = await api.get('/banners', {
      params: { _t: Date.now() },
    });
    return response.data.data;
  },
};
