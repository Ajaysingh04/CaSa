import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext();

const sanitizeUserRole = (rawUser) => {
  if (!rawUser) return rawUser;
  const isSpecialStaff =
    rawUser.email === 'vendor@casa.in' ||
    rawUser.email === 'delivery@casa.in' ||
    rawUser.email === 'admin@casa.in';

  if (!isSpecialStaff) {
    if (rawUser.role === 'vendor' || rawUser.role === 'delivery' || rawUser.role === 'delivery_partner' || rawUser.role === 'admin') {
      return { ...rawUser, role: 'user' };
    }
  }
  return rawUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('casa_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const sanitized = sanitizeUserRole(parsed);
        if (sanitized && sanitized.role !== parsed?.role) {
          localStorage.setItem('casa_user', JSON.stringify(sanitized));
        }
        return sanitized;
      }
      return null;
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
            const sanitized = sanitizeUserRole(currentUser);
            setUser(sanitized);
            localStorage.setItem('casa_user', JSON.stringify(sanitized));
            if (sanitized && sanitized.role !== currentUser.role) {
              authService.switchRole('user').catch(() => {});
            }
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
      const sanitized = sanitizeUserRole(data.user);
      setUser(sanitized);
      localStorage.setItem('casa_user', JSON.stringify(sanitized));
      if (sanitized && sanitized.role !== data.user.role) {
        authService.switchRole('user').catch(() => {});
      }
      success(`Welcome back, ${sanitized.name || 'User'}!`);
      return { success: true, user: sanitized };
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
      const sanitized = sanitizeUserRole(data.user);
      setUser(sanitized);
      localStorage.setItem('casa_user', JSON.stringify(sanitized));
      success(`Account created successfully! Welcome to CASA, ${sanitized.name || 'User'}.`);
      return { success: true, user: sanitized };
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
      const sanitized = sanitizeUserRole(updatedUser);
      setUser(sanitized);
      localStorage.setItem('casa_user', JSON.stringify(sanitized));
      success('Profile updated successfully.');
      return { success: true, user: sanitized };
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
        const sanitized = sanitizeUserRole(data.user);
        setUser(sanitized);
        localStorage.setItem('casa_user', JSON.stringify(sanitized));
        success(`Active persona switched to ${newRole.toUpperCase()} mode!`);
        return { success: true, user: sanitized };
      }
      return { success: false };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to switch role.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const isSuperAdmin = user?.email === 'admin@casa.in' || user?.role === 'super_admin';
  const isAdmin = user?.email === 'admin@casa.in' || user?.role === 'admin' || user?.role === 'super_admin';
  const isVendor = user?.email === 'vendor@casa.in';
  const isDelivery = user?.email === 'delivery@casa.in' || (user?.role === 'delivery' && user?.email !== 'ajaysinghbanafer1@gmail.com');

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
