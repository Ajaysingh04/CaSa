import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const StoreContext = createContext();

// Multilingual dictionary for English, Hindi, and Hinglish
const DICTIONARY = {
  en: {
    allCategories: 'All Categories',
    deals: 'Deals',
    wishlist: 'Wishlist',
    orders: 'Orders',
    cart: 'Cart',
    deliverTo: 'Deliver to',
    searchPlaceholder: 'Search for sarees, smartphones, laptops, shoes, cookware...',
    login: 'Login',
    logout: 'Logout',
    account: 'Account',
    adminConsole: 'Admin Console',
    freeShippingNotice: 'Free Express Delivery Over ₹499',
    authenticGuarantee: '100% Authentic Guarantee',
    shopByCategory: 'Shop by Category',
    exploreAllDepartments: 'Explore All Departments',
    todaysBestDeals: "Today's Best Lightning Deals",
    shopNow: 'Shop Now',
    exploreCollection: 'Explore Collection',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    reviews: 'Reviews',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    totalPrice: 'Total Price',
  },
  hi: {
    allCategories: 'सभी श्रेणियां',
    deals: 'ऑफ़र व छूट',
    wishlist: 'पसंदीदा',
    orders: 'ऑर्डर्स',
    cart: 'कार्ट',
    deliverTo: 'डिलीवरी पता',
    searchPlaceholder: 'साड़ियां, स्मार्टफोन, लैपटॉप, जूते, बर्तन खोजें...',
    login: 'लॉग इन',
    logout: 'लॉग आउट',
    account: 'अकाउंट',
    adminConsole: 'एडमिन कंसोल',
    freeShippingNotice: '₹499 से अधिक पर मुफ़्त सुपरफास्ट डिलीवरी',
    authenticGuarantee: '100% असली व प्रमाणित उत्पाद',
    shopByCategory: 'श्रेणी अनुसार खरीदारी',
    exploreAllDepartments: 'सभी विभाग देखें',
    todaysBestDeals: 'आज के धमाकेदार बेस्ट ऑफर्स',
    shopNow: 'अभी खरीदें',
    exploreCollection: 'कलेक्शन देखें',
    addToCart: 'कार्ट में जोड़ें',
    buyNow: 'तुरंत खरीदें',
    reviews: 'समीक्षाएं',
    inStock: 'उपलब्ध है',
    outOfStock: 'स्टॉक समाप्त',
    totalPrice: 'कुल कीमत',
  },
  hinglish: {
    allCategories: 'Saari Categories',
    deals: 'Best Deals & Offers',
    wishlist: 'Wishlist',
    orders: 'Mera Orders',
    cart: 'Cart',
    deliverTo: 'Deliver Karein',
    searchPlaceholder: 'Sarees, mobiles, gadgets, kitchen items search karein...',
    login: 'Login Karein',
    logout: 'Logout',
    account: 'Profile',
    adminConsole: 'Admin Panel',
    freeShippingNotice: 'Flat ₹499 se upar Free Fast Delivery',
    authenticGuarantee: '100% Asli Guaranteed Brands',
    shopByCategory: 'Category wise Shopping',
    exploreAllDepartments: 'Saari Categories Dekhein',
    todaysBestDeals: 'Aaj ki Top Mega Deals',
    shopNow: 'Abhi Kharidein',
    exploreCollection: 'Collection Dekhein',
    addToCart: 'Cart me Daalein',
    buyNow: 'Direct Buy Karein',
    reviews: 'Customer Reviews',
    inStock: 'In Stock Available',
    outOfStock: 'Out of Stock',
    totalPrice: 'Total Amount',
  },
};

// Helper: adjust brightness for hover/gradient colors
function adjustColorBrightness(hex, percent) {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  } catch {
    return hex;
  }
}

export const StoreProvider = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'CASA',
    storeTagline: 'INDIA MARKETPLACE',
    primaryColor: '#2563eb',
    defaultLanguage: 'en',
    supportEmail: 'support@casa.in',
    supportPhone: '+91 9876543210',
    festivalSaleActive: true,
    festivalSaleBannerText: '🎉 FESTIVAL SALE IS LIVE: Up to 70% Off + Flat ₹200 OFF with code CASA200',
    freeShippingThreshold: 499,
    standardDeliveryFee: 49,
    codEnabled: true,
  });

  const [language, setLanguage] = useState('en');

  // Apply Brand Theme Color dynamically to document root CSS variables
  const applyThemeColor = useCallback((colorHex) => {
    if (!colorHex || typeof colorHex !== 'string') return;
    const root = document.documentElement;
    const hoverColor = adjustColorBrightness(colorHex, -15);
    const lightColor = adjustColorBrightness(colorHex, 85);
    const gradient = `linear-gradient(135deg, ${colorHex} 0%, ${hoverColor} 100%)`;

    root.style.setProperty('--casa-primary', colorHex);
    root.style.setProperty('--casa-primary-hover', hoverColor);
    root.style.setProperty('--casa-primary-gradient', gradient);
    root.style.setProperty('--border-focus', colorHex);
    root.style.setProperty('--shadow-hover', `0 16px 32px -4px ${colorHex}25`);
  }, []);

  // Fetch Public Store Settings from Backend on mount
  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const response = await api.get('/settings/public');
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          setStoreSettings((prev) => ({ ...prev, ...data }));

          if (data.defaultLanguage) {
            setLanguage(data.defaultLanguage);
          }
          if (data.primaryColor) {
            applyThemeColor(data.primaryColor);
          }
        }
      } catch (err) {
        // Fallback to defaults gracefully
        console.warn('Could not fetch public store settings, using defaults:', err.message);
      }
    };

    fetchPublicSettings();
  }, [applyThemeColor]);

  // Update store settings in local context immediately and apply color
  const updateStoreSettingsLocally = useCallback((newSettings) => {
    setStoreSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (newSettings.primaryColor) {
        applyThemeColor(newSettings.primaryColor);
      }
      if (newSettings.defaultLanguage) {
        setLanguage(newSettings.defaultLanguage);
      }
      return merged;
    });
  }, [applyThemeColor]);

  // Translation helper function
  const t = useCallback(
    (key) => {
      const langDict = DICTIONARY[language] || DICTIONARY.en;
      return langDict[key] || DICTIONARY.en[key] || key;
    },
    [language]
  );

  return (
    <StoreContext.Provider
      value={{
        ...storeSettings,
        language,
        setLanguage,
        t,
        updateStoreSettingsLocally,
        applyThemeColor,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;
