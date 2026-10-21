import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  // Use same-origin /api proxy in dev and prod to guarantee reliable routing without CORS or IPv6 glitches
  return '/api';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('casa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Only clear storage when the token validation check itself is rejected
      if (url.includes('/auth/me')) {
        localStorage.removeItem('casa_token');
        localStorage.removeItem('casa_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
