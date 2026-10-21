import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('casa_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('casa_token');
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem('casa_user', JSON.stringify(currentUser));
          }
        } catch (err) {
          // Only clear session if server explicitly returns 401 Unauthorized (token expired/invalid)
          if (err.response && err.response.status === 401) {
            setUser(null);
            localStorage.removeItem('casa_token');
            localStorage.removeItem('casa_user');
          } else {
            console.warn('Auth validation server latency: maintaining persistent local session.');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      if (!data || !data.user) {
        throw new Error(data?.message || 'Invalid login response from server.');
      }
      setUser(data.user);
      success(`Welcome back, ${data.user.name || 'User'}!`);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        code: err.code
      });
      let msg = err.response?.data?.message;
      if (!msg) {
        if (typeof err.response?.data === 'string' && err.response.data.trim() && !err.response.data.includes('<!DOCTYPE')) {
          msg = err.response.data.replace(/<[^>]+>/g, '').slice(0, 120);
        } else if (err.response?.status === 401) {
          msg = 'Invalid email or password. Please check your credentials.';
        } else if (err.response?.status === 500) {
          msg = 'Internal server error. Please try again.';
        } else if (err.code === 'ERR_NETWORK') {
          msg = 'Cannot connect to backend server. Please check your connection.';
        } else {
          msg = err.message || 'Login failed. Please try again.';
        }
      }
      error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      if (!data || !data.user) {
        throw new Error(data?.message || 'Invalid registration response from server.');
      }
      setUser(data.user);
      success(`Account created successfully! Welcome to CASA, ${data.user.name || 'User'}.`);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Registration error details:', err);
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE')
          ? 'API returned HTML instead of JSON. Check Vercel backend routing.'
          : err.message || 'Registration failed.');
      error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      success('Logged out successfully.');
    } catch {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      success('Profile updated successfully.');
      return { success: true, user: updatedUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const switchRole = async (newRole) => {
    try {
      const data = await authService.switchRole(newRole);
      if (data.user) {
        setUser(data.user);
        success(`Active persona switched to ${newRole.toUpperCase()} mode!`);
        return { success: true, user: data.user };
      }
      return { success: false };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to switch role.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isVendor = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'super_admin';
  const isDelivery = user?.role === 'delivery' || user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSuperAdmin,
        isAdmin,
        isVendor,
        isDelivery,
        login,
        register,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
