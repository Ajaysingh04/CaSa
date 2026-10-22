import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { StoreProvider } from './context/StoreContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Customer Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Multi-Portal Hubs: Vendor & Delivery
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';

// Route guard: Accessible ONLY when logged out. If already logged in, redirect away.
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '400px', height: '300px', borderRadius: '16px' }} />
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <StoreProvider>
                <Routes>
                  {/* Storefront Layout Routes */}
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="category/:slug" element={<ProductsPage />} />
                    <Route path="category/:slug/:subcategory" element={<ProductsPage />} />
                    <Route path="search" element={<ProductsPage />} />
                    <Route path="product/:slug" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="order-success/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="orders" element={<OrderHistoryPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route
                      path="login"
                      element={
                        <GuestRoute>
                          <LoginPage />
                        </GuestRoute>
                      }
                    />
                    <Route
                      path="register"
                      element={
                        <GuestRoute>
                          <RegisterPage />
                        </GuestRoute>
                      }
                    />
                    <Route path="vendor" element={<VendorDashboardPage />} />
                    <Route path="vendor/:tab" element={<VendorDashboardPage />} />
                    <Route path="delivery" element={<DeliveryDashboardPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin Console Protected Layout Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="banners" element={<Navigate to="/admin/settings?tab=banners" replace />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>
                </Routes>
              </StoreProvider>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
