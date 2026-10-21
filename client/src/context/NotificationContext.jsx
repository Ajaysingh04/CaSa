import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getSocket, initSocket, disconnectSocket } from '../services/socketService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { info, success } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch persisted notifications from MongoDB (Source of Truth)
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=30');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Non-blocking fallback
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      success('All notifications marked as read');
    } catch (err) {
      console.warn('Failed to mark all read:', err.message);
    }
  };

  // Connect Socket.IO on authentication and listen for real-time events
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    fetchNotifications();

    const socket = initSocket();

    const handleNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      info(`🔔 ${notif.title}: ${notif.message}`);
    };

    const handleNewOrder = (data) => {
      info(`🛍️ New Order Received: #${data.orderNumber} (₹${data.totalPrice || 0})`);
      fetchNotifications();
    };

    const handleOrderStatusUpdate = (data) => {
      info(`📦 Order #${data.orderNumber} status changed to ${data.orderStatus}`);
      fetchNotifications();
    };

    const handleDeliveryTask = (data) => {
      info(`🚀 New Delivery Task Assigned: #${data.orderNumber} in ${data.shippingAddress?.city || 'your zone'}`);
      fetchNotifications();
    };

    const handleDeliveryMilestone = (data) => {
      info(`📍 Shipment Update: #${data.orderNumber} - ${data.status} (${data.note || ''})`);
      fetchNotifications();
    };

    // Reconnection recovery: Re-sync state from MongoDB
    const handleReconnect = () => {
      fetchNotifications();
    };

    socket.on('notification', handleNotification);
    socket.on('role_notification', handleNotification);
    socket.on('new_order', handleNewOrder);
    socket.on('vendor_new_order', handleNewOrder);
    socket.on('order_status_update', handleOrderStatusUpdate);
    socket.on('delivery_task_assigned', handleDeliveryTask);
    socket.on('delivery_milestone', handleDeliveryMilestone);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('role_notification', handleNotification);
      socket.off('new_order', handleNewOrder);
      socket.off('vendor_new_order', handleNewOrder);
      socket.off('order_status_update', handleOrderStatusUpdate);
      socket.off('delivery_task_assigned', handleDeliveryTask);
      socket.off('delivery_milestone', handleDeliveryMilestone);
      socket.off('reconnect', handleReconnect);
    };
  }, [user, fetchNotifications, info, success]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
