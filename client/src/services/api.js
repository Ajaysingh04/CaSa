import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return '/api';
  }
  // When running locally on dev server, connect directly to Express (port 5000)
  // Matching the active browser hostname (localhost or 127.0.0.1) guarantees reliable connections
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:5000/api`;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

// Response interceptor with resilient local dev fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Dev fallback if direct host or proxy drops
    if (config && !config._retry && !import.meta.env.PROD) {
      config._retry = true;
      const current = config.baseURL || API_BASE_URL;
      let nextBase = null;
      if (current.includes('localhost:5000')) {
        nextBase = 'http://127.0.0.1:5000/api';
      } else if (current.includes('127.0.0.1:5000')) {
        nextBase = '/api';
      } else if (current === '/api') {
        nextBase = 'http://localhost:5000/api';
      }

      if (nextBase && (error.response?.status === 500 || !error.response || error.code === 'ERR_NETWORK')) {
        config.baseURL = nextBase;
        return api(config);
      }
    }

    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const message = error.response.data?.message || '';
      if (
        url.includes('/auth/me') ||
        message.includes('no longer exists') ||
        message.includes('Token verification failed')
      ) {
        localStorage.removeItem('casa_token');
        localStorage.removeItem('casa_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
