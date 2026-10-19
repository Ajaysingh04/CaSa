import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Safety guard: in production on Vercel, ignore any localhost configuration
    if (import.meta.env.PROD && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return '/api';
    }
    return envUrl;
  }
  return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
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
      // If token expired, clear localStorage
      if (localStorage.getItem('casa_token')) {
        localStorage.removeItem('casa_token');
        localStorage.removeItem('casa_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
