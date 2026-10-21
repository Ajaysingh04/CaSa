import { io } from 'socket.io-client';

let socket = null;

const getSocketURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    if (import.meta.env.PROD && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return window.location.origin;
    }
    return envUrl.replace(/\/api\/?$/, '');
  }
  return import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';
};

/**
 * Initialize or get active Socket.IO connection
 */
export const initSocket = () => {
  const token = localStorage.getItem('casa_token');

  if (!socket) {
    const socketURL = getSocketURL();
    socket = io(socketURL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('connect_error', (err) => {
      console.warn('Real-time socket connection warning:', err.message);
    });
  }

  return socket;
};

/**
 * Get active socket instance
 */
export const getSocket = () => {
  return socket || initSocket();
};

/**
 * Disconnect socket on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join an order room for truthful milestone tracking
 */
export const joinOrderRoom = (orderId) => {
  const s = getSocket();
  if (s && orderId) {
    s.emit('join_order', orderId);
  }
};

/**
 * Leave an order tracking room
 */
export const leaveOrderRoom = (orderId) => {
  const s = getSocket();
  if (s && orderId) {
    s.emit('leave_order', orderId);
  }
};
