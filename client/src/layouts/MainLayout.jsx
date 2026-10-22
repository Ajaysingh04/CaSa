import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/common/AnnouncementBar';
import Header from '../components/common/Header';
import CategoryNavbar from '../components/common/CategoryNavbar';
import CartDrawer from '../components/common/CartDrawer';
import MobileCategoryDrawer from '../components/common/MobileCategoryDrawer';
import LanguageModal from '../components/common/LanguageModal';
import Footer from '../components/common/Footer';
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
  const isVendorPortal = location.pathname === '/vendor' || (location.pathname === '/profile' && user?.role === 'vendor');

  if (isVendorPortal) {
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
      <CategoryNavbar categories={categories} />

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
    </div>
  );
};

export default MainLayout;
