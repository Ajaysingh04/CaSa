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
          setUser(currentUser);
          localStorage.setItem('casa_user', JSON.stringify(currentUser));
        } catch {
          setUser(null);
          localStorage.removeItem('casa_token');
          localStorage.removeItem('casa_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      success(`Welcome back, ${data.user.name}!`);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error details:', err);
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE')
          ? 'API returned HTML instead of JSON. Check Vercel backend routing.'
          : err.message || 'Login failed. Please check credentials.');
      error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      success(`Account created successfully! Welcome to CASA, ${data.user.name}.`);
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

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
