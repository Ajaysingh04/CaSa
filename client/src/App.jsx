import React, { lazy, Suspense } from 'react';
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
import ScrollToTop from './components/common/ScrollToTop';

// Immediate Storefront Landing Page
import HomePage from './pages/HomePage';

// Lazy Loaded Routes for Instant Initial Bundle Delivery
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Multi-Portal Hubs: Vendor & Delivery
const VendorDashboardPage = lazy(() => import('./pages/vendor/VendorDashboardPage'));
const DeliveryDashboardPage = lazy(() => import('./pages/delivery/DeliveryDashboardPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

// Lightweight Route Transition Loader
const RouteLoadingFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid #f1f5f9',
      borderTopColor: '#ff6b00',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite'
    }} />
  </div>
);

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

// Route guard: Checkout requires user authentication. Directs guest users to /login?redirect=/checkout.
const CustomerCheckoutRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '400px', height: '300px', borderRadius: '16px' }} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <StoreProvider>
                  <Suspense fallback={<RouteLoadingFallback />}>
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
                        <Route
                          path="checkout"
                          element={
                            <CustomerCheckoutRoute>
                              <CheckoutPage />
                            </CustomerCheckoutRoute>
                          }
                        />
                        <Route path="order-success/:orderId" element={<OrderConfirmationPage />} />
                        <Route path="orders" element={<OrderHistoryPage />} />
                        <Route path="orders/:id" element={<OrderDetailPage />} />
                        <Route path="track-order" element={<TrackOrderPage />} />
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
                  </Suspense>
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
