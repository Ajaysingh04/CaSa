import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const StoreContext = createContext();

// Multilingual dictionary for English, Hindi, Hinglish and major regional languages
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
    welcomeToStore: 'Welcome to CASA',
    chooseYourLanguage: 'Choose Your Language',
    selectLanguageSubtitle: 'Select your preferred language to enjoy personalized shopping experience.',
    saveAndContinue: 'Save & Continue',
    skipForNow: 'Skip for now',
    languageUpdated: 'Language preference saved!',
    changeLanguage: 'Change Language',
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
    welcomeToStore: 'CASA में आपका स्वागत है',
    chooseYourLanguage: 'अपनी पसंदीदा भाषा चुनें',
    selectLanguageSubtitle: 'खरीदारी को आसान और व्यक्तिगत बनाने के लिए अपनी भाषा चुनें।',
    saveAndContinue: 'सहेजें और आगे बढ़ें',
    skipForNow: 'अभी छोड़ें',
    languageUpdated: 'भाषा सफलतापूर्वक बदल दी गई है!',
    changeLanguage: 'भाषा बदलें',
  },
  hinglish: {
    allCategories: 'All Categories',
    deals: 'Deals & Offers',
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
    welcomeToStore: 'Welcome to CASA',
    chooseYourLanguage: 'Choose Your Language',
    selectLanguageSubtitle: 'Select your preferred language to personalize your shopping experience.',
    saveAndContinue: 'Save & Continue',
    skipForNow: 'Skip for now',
    languageUpdated: 'Language preference saved!',
    changeLanguage: 'Change Language',
  },
  bn: {
    allCategories: 'সকল বিভাগ',
    deals: 'সেরা ডিল ও অফার',
    wishlist: 'পছন্দের তালিকা',
    orders: 'অর্ডার সমূহ',
    cart: 'কার্ট',
    deliverTo: 'ডেলিভারি ঠিকানা',
    searchPlaceholder: 'শাড়ি, স্মার্টফোন, ল্যাপটপ, জুতো অনুসন্ধান করুন...',
    login: 'লগইন করুন',
    logout: 'লগআউট',
    account: 'অ্যাকাউন্ট',
    adminConsole: 'অ্যাডমিন প্যানেল',
    freeShippingNotice: '₹৪৯৯-এর উপরে বিনামূল্যে দ্রুত ডেলিভারি',
    authenticGuarantee: '১০০% আসল ও খাঁটি পণ্য গ্যারান্টি',
    shopByCategory: 'বিভাগ অনুযায়ী কেনাকাটা',
    exploreAllDepartments: 'সকল বিভাগ দেখুন',
    todaysBestDeals: 'আজকের সেরা ধামাকা অফার',
    shopNow: 'এখনই কিনুন',
    exploreCollection: 'কালেকশন দেখুন',
    addToCart: 'কার্টে যোগ করুন',
    buyNow: 'সরাসরি কিনুন',
    reviews: 'রিভিউ',
    inStock: 'স্টকে আছে',
    outOfStock: 'স্টক নেই',
    totalPrice: 'মোট দাম',
    welcomeToStore: 'CASA-তে আপনাকে স্বাগতম',
    chooseYourLanguage: 'আপনার পছন্দের ভাষা বেছে নিন',
    selectLanguageSubtitle: 'কেনাকাটার সেরা অভিজ্ঞতা পেতে নিজের ভাষা নির্বাচন করুন।',
    saveAndContinue: 'সংরক্ষণ করুন ও এগিয়ে যান',
    skipForNow: 'আপাতত এড়িয়ে যান',
    languageUpdated: 'ভাষা সফলভাবে পরিবর্তন করা হয়েছে!',
    changeLanguage: 'ভাষা পরিবর্তন করুন',
  },
  mr: {
    allCategories: 'सर्व श्रेणी',
    deals: 'उत्तम ऑफर्स',
    wishlist: 'आवडती यादी',
    orders: 'ऑर्डर्स',
    cart: 'कार्ट',
    deliverTo: 'पत्ता',
    searchPlaceholder: 'साड्या, स्मार्टफोन्स, लॅपटॉप, शूज शोधा...',
    login: 'लॉगिन करा',
    logout: 'लॉगआउट',
    account: 'खाते',
    adminConsole: 'प्रशासक पॅनेल',
    freeShippingNotice: '₹४९९ वर मोफत सुपरफास्ट डिलिव्हरी',
    authenticGuarantee: '१००% खरी आणि खात्रीशीर उत्पादने',
    shopByCategory: 'श्रेणीनुसार खरेदी',
    exploreAllDepartments: 'सर्व विभाग पहा',
    todaysBestDeals: 'आजच्या टॉप ऑफर्स',
    shopNow: 'आता खरेदी करा',
    exploreCollection: 'संग्रह पहा',
    addToCart: 'कार्टमध्ये जोडा',
    buyNow: 'त्वरित खरेदी करा',
    reviews: 'समीक्षा',
    inStock: 'उपलब्ध आहे',
    outOfStock: 'स्टॉक संपला',
    totalPrice: 'एकूण रक्कम',
    welcomeToStore: 'CASA मध्ये आपले स्वागत आहे',
    chooseYourLanguage: 'आपली भाषा निवडा',
    selectLanguageSubtitle: 'आपल्या सोयीसाठी योग्य भाषा निवडा.',
    saveAndContinue: 'जतन करा आणि पुढे जा',
    skipForNow: 'नंतर निवडा',
    languageUpdated: 'भाषा यशस्वीरित्या निवडली गेली!',
    changeLanguage: 'भाषा बदला',
  },
  ta: {
    allCategories: 'அனைத்து பிரிவுகள்',
    deals: 'சிறப்பு சலுகைகள்',
    wishlist: 'விருப்பப்பட்டியல்',
    orders: 'ஆர்டர்கள்',
    cart: 'கார்ட்',
    deliverTo: 'டெலிவரி முகவரி',
    searchPlaceholder: 'புடவைகள், மொபைல்கள், மடிக்கணினிகள் தேடுங்கள்...',
    login: 'உள்நுழைக',
    logout: 'வெளியேறு',
    account: 'சுயவிவரம்',
    adminConsole: 'நிர்வாக மையம்',
    freeShippingNotice: '₹499 க்கு மேல் இலவச விரைவு டெலிவரி',
    authenticGuarantee: '100% உண்மையான தயாரிப்புகள்',
    shopByCategory: 'பிரிவு வாரியாக வாங்குக',
    exploreAllDepartments: 'அனைத்து பிரிவுகளையும் காண்க',
    todaysBestDeals: 'இன்றைய சிறந்த சலுகைகள்',
    shopNow: 'இப்போதே வாங்குக',
    exploreCollection: 'தொகுப்பை காண்க',
    addToCart: 'கார்ட்டில் சேர்',
    buyNow: 'உடனே வாங்குக',
    reviews: 'மதிப்புரைகள்',
    inStock: 'இருப்பில் உள்ளது',
    outOfStock: 'இருப்பில் இல்லை',
    totalPrice: 'மொத்த விலை',
    welcomeToStore: 'CASA-விற்கு உங்களை வரவேற்கிறோம்',
    chooseYourLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    selectLanguageSubtitle: 'உங்கள் வசதிக்கேற்ப மொழியை தேர்வு செய்து மகிழுங்கள்.',
    saveAndContinue: 'சேமித்து தொடர்க',
    skipForNow: 'தவிர்க்கவும்',
    languageUpdated: 'மொழி வெற்றிகரமாக மாற்றப்பட்டது!',
    changeLanguage: 'மொழியை மாற்றுக',
  },
  te: {
    allCategories: 'అన్ని విభాగాలు',
    deals: 'బెస్ట్ ఆఫర్లు',
    wishlist: 'కోరికల జాబితా',
    orders: 'ఆర్డర్లు',
    cart: 'కార్ట్',
    deliverTo: 'డెలివరీ అడ్రస్',
    searchPlaceholder: 'చీరలు, మొబైల్స్, ల్యాప్‌టాప్‌లు వెతకండి...',
    login: 'లాగిన్ అవ్వండి',
    logout: 'లాగౌట్',
    account: 'ఖాతా',
    adminConsole: 'అడ్మిన్ ప్యానెల్',
    freeShippingNotice: '₹499 పైన ఉచిత ఫాస్ట్ డెలివరీ',
    authenticGuarantee: '100% ఒరిజినల్ ఉత్పత్తులు',
    shopByCategory: 'విభాగం వారిగా షాపింగ్',
    exploreAllDepartments: 'అన్ని విభాగాలు చూడండి',
    todaysBestDeals: 'ఈరోజు బెస్ట్ డీల్స్',
    shopNow: 'ఇప్పుడే కొనండి',
    exploreCollection: 'కలెక్షన్ చూడండి',
    addToCart: 'కార్ట్‌కు జోడించు',
    buyNow: 'వెంటనే కొనండి',
    reviews: 'రివ్యూలు',
    inStock: 'స్టాక్ ఉంది',
    outOfStock: 'స్టాక్ అయిపోయింది',
    totalPrice: 'మొత్తం ధర',
    welcomeToStore: 'CASA కు స్వాగతం',
    chooseYourLanguage: 'మీ భాషను ఎంచుకోండి',
    selectLanguageSubtitle: 'మీ షాపింగ్ అనుభవాన్ని మరింత సులభం చేసుకోవడానికి భాషను ఎంచుకోండి.',
    saveAndContinue: 'సేవ్ చేసి కొనసాగించండి',
    skipForNow: 'ఇప్పుడు దాటవేయి',
    languageUpdated: 'భాష విజయవంతంగా మార్చబడింది!',
    changeLanguage: 'భాషను మార్చండి',
  },
  gu: {
    allCategories: 'બધી શ્રેણીઓ',
    deals: 'શ્રેષ્ઠ ઓફર્સ',
    wishlist: 'પસંદીદા યાદી',
    orders: 'ઓર્ડર્સ',
    cart: 'કાર્ટ',
    deliverTo: 'ડિલિવરી સરનામું',
    searchPlaceholder: 'સાડીઓ, સ્માર્ટફોન, લેપટોપ શોધો...',
    login: 'લોગિન કરો',
    logout: 'લોગઆઉટ',
    account: 'ખાતું',
    adminConsole: 'એડમિન પેનલ',
    freeShippingNotice: '₹૪૯૯ થી વધુ પર મફત સુપરફાસ્ટ ડિલિવરી',
    authenticGuarantee: '૧૦૦% અસલી ઉત્પાદનોની ખાતરી',
    shopByCategory: 'શ્રેણી મુજબ ખરીદી',
    exploreAllDepartments: 'બધા વિભાગો જુઓ',
    todaysBestDeals: 'આજની શ્રેષ્ઠ ડીલ્સ',
    shopNow: 'હવે ખરીદો',
    exploreCollection: 'કલેક્શન જુઓ',
    addToCart: 'કાર્ટમાં ઉમેરો',
    buyNow: 'તરત ખરીદો',
    reviews: 'સમીક્ષાઓ',
    inStock: 'ઉપલબ્ધ છે',
    outOfStock: 'સ્ટોક સમાપ્ત',
    totalPrice: 'કુલ કિંમત',
    welcomeToStore: 'CASA માં આપનું સ્વાગત છે',
    chooseYourLanguage: 'તમારી ભાષા પસંદ કરો',
    selectLanguageSubtitle: 'ખરીદીને વધુ સરળ બનાવવા માટે તમારી ભાષા પસંદ કરો.',
    saveAndContinue: 'સાચવો અને આગળ વધો',
    skipForNow: 'હમણાં છોડો',
    languageUpdated: 'ભાષા સફળતાપૂર્વક અપડેટ થઈ ગઈ!',
    changeLanguage: 'ભાષા બદલો',
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

  // Language state initialized from localStorage, defaulting to 'en'
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('casa_preferred_language') || 'en';
    } catch {
      return 'en';
    }
  });

  // Language Selection Modal visibility state
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const openLanguageModal = useCallback(() => {
    setIsLanguageModalOpen(true);
  }, []);

  const closeLanguageModal = useCallback(() => {
    setIsLanguageModalOpen(false);
  }, []);

  // Update language state and persist to localStorage
  const setLanguage = useCallback((newLang) => {
    if (!newLang) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem('casa_preferred_language', newLang);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
  }, []);

  // Apply Brand Theme Color dynamically to document root CSS variables
  const applyThemeColor = useCallback((colorHex) => {
    if (!colorHex || typeof colorHex !== 'string') return;
    const root = document.documentElement;
    const hoverColor = adjustColorBrightness(colorHex, -15);
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

          // Only set store default if user has not chosen any language
          const savedUserLang = localStorage.getItem('casa_preferred_language');
          if (data.defaultLanguage && !savedUserLang) {
            setLanguageState(data.defaultLanguage);
          }
          if (data.primaryColor) {
            applyThemeColor(data.primaryColor);
          }
        }
      } catch (err) {
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
      if (newSettings.defaultLanguage && !localStorage.getItem('casa_preferred_language')) {
        setLanguageState(newSettings.defaultLanguage);
      }
      return merged;
    });
  }, [applyThemeColor]);

  // Translation helper function with fallback to English
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
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        openLanguageModal,
        closeLanguageModal,
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
