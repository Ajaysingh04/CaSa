import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { success, info } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const items = await authService.getWishlist();
          setWishlistItems(items || []);
        } catch (err) {
          console.error('Failed to load wishlist:', err);
        }
      } else {
        try {
          const local = localStorage.getItem('casa_guest_wishlist');
          setWishlistItems(local ? JSON.parse(local) : []);
        } catch {
          setWishlistItems([]);
        }
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product) => {
    if (user) {
      try {
        const res = await authService.toggleWishlist(product._id);
        setWishlistItems(res.data || []);
        if (res.inWishlist) {
          success(`Added to wishlist!`);
        } else {
          info(`Removed from wishlist.`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const exists = wishlistItems.some((p) => p._id === product._id);
      let updated;
      if (exists) {
        updated = wishlistItems.filter((p) => p._id !== product._id);
        info('Removed from wishlist.');
      } else {
        updated = [...wishlistItems, product];
        success('Added to wishlist!');
      }
      setWishlistItems(updated);
      localStorage.setItem('casa_guest_wishlist', JSON.stringify(updated));
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((p) => p._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
