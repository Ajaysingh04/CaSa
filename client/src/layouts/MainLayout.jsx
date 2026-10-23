import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import AnnouncementBar from '../components/common/AnnouncementBar';
import Header from '../components/common/Header';
import CategoryNavbar from '../components/common/CategoryNavbar';
import CartDrawer from '../components/common/CartDrawer';
import MobileCategoryDrawer from '../components/common/MobileCategoryDrawer';
import LanguageModal from '../components/common/LanguageModal';
import Footer from '../components/common/Footer';
import FloatingDock from '../components/common/FloatingDock';
import SuperAdminStoreToolbar from '../components/common/SuperAdminStoreToolbar';
import { categoryService } from '../services/categoryService';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLanguageModalOpen, openLanguageModal, closeLanguageModal } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Language modal should ONLY prompt ONCE ever across the application
  useEffect(() => {
    // If already prompted once in this browser, never auto-popup again
    if (localStorage.getItem('casa_language_prompted_once')) {
      sessionStorage.removeItem('casa_prompt_language_modal');
      return;
    }

    const promptFlag = sessionStorage.getItem('casa_prompt_language_modal') === 'true';
    const userLangKey = user ? `casa_lang_selected_${user._id || user.id}` : null;
    const hasSelected = userLangKey ? localStorage.getItem(userLangKey) : null;

    if (promptFlag || (user && !hasSelected)) {
      sessionStorage.removeItem('casa_prompt_language_modal');
      localStorage.setItem('casa_language_prompted_once', 'true');
      if (userLangKey) {
        localStorage.setItem(userLangKey, 'true');
      }

      const timer = setTimeout(() => {
        openLanguageModal();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [user, openLanguageModal]);

  const location = useLocation();
  const isPersonalProfile = location.pathname === '/profile' && new URLSearchParams(location.search).get('personal') === 'true';
  const isVendorUser = user && (user.role === 'vendor' || user.email === 'vendor@casa.in');
  const isVendorPortal = location.pathname.startsWith('/vendor') || (location.pathname === '/profile' && isVendorUser && !isPersonalProfile);
  
  const isDeliveryUser = Boolean(
    user && (user.role === 'delivery' || user.role === 'delivery_partner' || user.email === 'delivery@casa.in')
  );
  const isDeliveryPortal = location.pathname.startsWith('/delivery') || (location.pathname === '/profile' && isDeliveryUser && !isPersonalProfile);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Delivery partner only needs the delivery dashboard — never the customer store
  if (isDeliveryUser && !location.pathname.startsWith('/delivery') && !isAuthPage) {
    return <Navigate to="/delivery" replace />;
  }

  // Standalone dedicated portal layout for Vendor & Delivery (No store header, No CategoryNavbar, No store Footer, No store Cart)
  if (isVendorPortal || isDeliveryPortal) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', background: '#f4f6fa', overflowX: 'hidden' }}>
        <Outlet context={{ categories }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <AnnouncementBar />
      <Header onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
      {!isAuthPage && <CategoryNavbar categories={categories} />}

      <main style={{ flex: 1, minHeight: '60vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <Outlet context={{ categories }} />
      </main>

      <Footer />
      <CartDrawer />
      <MobileCategoryDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
      />
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={closeLanguageModal}
      />
      <FloatingDock />
      <SuperAdminStoreToolbar />
    </div>
  );
};

export default MainLayout;
