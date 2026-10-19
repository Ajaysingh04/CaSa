import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [totals, setTotals] = useState({
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    discountPrice: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Helper for guest cart calculation
  const calculateGuestTotals = (cartItems, appliedCoupon = null) => {
    const itemsPrice = cartItems.reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + price * item.quantity;
    }, 0);

    const shippingPrice = itemsPrice >= 499 || itemsPrice === 0 ? 0 : 49;
    let discountPrice = 0;

    if (appliedCoupon && appliedCoupon.isActive) {
      if (itemsPrice >= (appliedCoupon.minOrderAmount || 0)) {
        if (appliedCoupon.discountType === 'percentage') {
          discountPrice = Math.round((itemsPrice * appliedCoupon.discountAmount) / 100);
          if (appliedCoupon.maxDiscountAmount && discountPrice > appliedCoupon.maxDiscountAmount) {
            discountPrice = appliedCoupon.maxDiscountAmount;
          }
        } else {
          discountPrice = appliedCoupon.discountAmount;
        }
      }
    }

    const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);
    return {
      itemsPrice,
      shippingPrice,
      taxPrice: 0,
      discountPrice,
      totalPrice,
    };
  };

  // Fetch or sync cart
  const refreshCart = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        // Check if there was a guest cart to merge
        const guestData = localStorage.getItem('casa_guest_cart');
        if (guestData) {
          try {
            const parsedGuest = JSON.parse(guestData);
            if (parsedGuest.length > 0) {
              const mergePayload = parsedGuest.map((i) => ({
                productId: i.product._id,
                quantity: i.quantity,
                selectedVariant: i.selectedVariant,
              }));
              await cartService.mergeGuestCart(mergePayload);
              localStorage.removeItem('casa_guest_cart');
            }
          } catch (e) {
            console.error('Error merging guest cart:', e);
          }
        }

        const data = await cartService.getCart();
        setItems(data.items || []);
        setCoupon(data.coupon || null);
        setTotals(data.totals || { itemsPrice: 0, shippingPrice: 0, totalPrice: 0 });
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Load guest cart from localStorage
      try {
        const guestCart = localStorage.getItem('casa_guest_cart');
        if (guestCart) {
          const parsed = JSON.parse(guestCart);
          setItems(parsed);
          setTotals(calculateGuestTotals(parsed, coupon));
        } else {
          setItems([]);
          setTotals({ itemsPrice: 0, shippingPrice: 0, taxPrice: 0, discountPrice: 0, totalPrice: 0 });
        }
      } catch {
        setItems([]);
      }
    }
  }, [user, coupon]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Add Item
  const addItem = async (product, quantity = 1, selectedVariant = {}) => {
    if (user) {
      try {
        setLoading(true);
        const data = await cartService.addItem(product._id, quantity, selectedVariant);
        setItems(data.items || []);
        setCoupon(data.coupon || null);
        setTotals(data.totals || {});
        success(`Added "${product.name.slice(0, 30)}..." to your cart!`);
        setIsDrawerOpen(true);
      } catch (err) {
        error(err.response?.data?.message || 'Could not add item to cart.');
      } finally {
        setLoading(false);
      }
    } else {
      // Guest Cart
      const updated = [...items];
      const existingIdx = updated.findIndex(
        (i) =>
          i.product._id === product._id &&
          JSON.stringify(i.selectedVariant) === JSON.stringify(selectedVariant)
      );

      if (existingIdx > -1) {
        updated[existingIdx].quantity += quantity;
      } else {
        updated.push({
          _id: `guest_item_${Date.now()}_${Math.random()}`,
          product,
          selectedVariant,
          quantity,
          priceAtAddition: product.discountPrice || product.price,
        });
      }

      setItems(updated);
      setTotals(calculateGuestTotals(updated, coupon));
      localStorage.setItem('casa_guest_cart', JSON.stringify(updated));
      success(`Added "${product.name.slice(0, 30)}..." to your cart!`);
      setIsDrawerOpen(true);
    }
  };

  // Update Quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeItem(itemId);

    if (user) {
      try {
        setLoading(true);
        const data = await cartService.updateQuantity(itemId, quantity);
        setItems(data.items || []);
        setTotals(data.totals || {});
      } catch (err) {
        error(err.response?.data?.message || 'Could not update quantity.');
      } finally {
        setLoading(false);
      }
    } else {
      const updated = items.map((i) =>
        i._id === itemId ? { ...i, quantity: Number(quantity) } : i
      );
      setItems(updated);
      setTotals(calculateGuestTotals(updated, coupon));
      localStorage.setItem('casa_guest_cart', JSON.stringify(updated));
    }
  };

  // Remove Item
  const removeItem = async (itemId) => {
    if (user) {
      try {
        setLoading(true);
        const data = await cartService.removeItem(itemId);
        setItems(data.items || []);
        setTotals(data.totals || {});
        info('Item removed from cart.');
      } catch (err) {
        error(err.response?.data?.message || 'Could not remove item.');
      } finally {
        setLoading(false);
      }
    } else {
      const updated = items.filter((i) => i._id !== itemId);
      setItems(updated);
      setTotals(calculateGuestTotals(updated, coupon));
      localStorage.setItem('casa_guest_cart', JSON.stringify(updated));
      info('Item removed from cart.');
    }
  };

  // Apply Coupon
  const applyCoupon = async (code) => {
    if (user) {
      try {
        setLoading(true);
        const data = await cartService.applyCoupon(code);
        setCoupon(data.coupon);
        setTotals(data.totals);
        success(`Coupon "${code.toUpperCase()}" applied successfully!`);
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || 'Invalid coupon code';
        error(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    } else {
      info('Please login to apply coupon discounts on your order.');
      return { success: false, message: 'Please login to apply coupon' };
    }
  };

  // Remove Coupon
  const removeCoupon = async () => {
    if (user) {
      try {
        setLoading(true);
        const data = await cartService.removeCoupon();
        setCoupon(null);
        setTotals(data.totals);
        info('Coupon removed.');
      } catch (err) {
        error('Could not remove coupon.');
      } finally {
        setLoading(false);
      }
    } else {
      setCoupon(null);
      setTotals(calculateGuestTotals(items, null));
    }
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        coupon,
        totals,
        loading,
        cartCount,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
