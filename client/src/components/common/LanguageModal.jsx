import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Flame,
  Truck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Supported Indian & Global Languages
export const LANGUAGE_OPTIONS = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    badge: 'Default / Standard',
    badgeColor: '#2563eb',
    description: 'Shop with full catalog, international support & clear specs',
    previewGreeting: 'Welcome to CASA Marketplace',
    previewPills: ['Best Deals', 'All Categories', 'Fast Delivery'],
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    badge: 'सर्वाधिक लोकप्रिय (Most Popular)',
    badgeColor: '#ea580c',
    description: 'अपनी राष्ट्रभाषा में आसान, भरोसेमंद व सुरक्षित ऑनलाइन खरीदारी',
    previewGreeting: 'CASA में आपका स्वागत है',
    previewPills: ['धमाकेदार डील्स', 'सभी श्रेणियां', 'मुफ़्त डिलीवरी'],
  },
  {
    id: 'hinglish',
    name: 'Hinglish',
    nativeName: 'Hinglish',
    flag: '🇮🇳',
    badge: 'Trending & Desi',
    badgeColor: '#8b5cf6',
    description: 'Hindi aur English ka smart mix – simple, fast and conversational',
    previewGreeting: 'CASA me aapka swagat hai',
    previewPills: ['Top Deals', 'Saari Categories', 'Free Delivery'],
  },
  {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    badge: 'পূর্ব ভারত (East India)',
    badgeColor: '#059669',
    description: 'আপনার পছন্দের মাতৃভাষায় সেরা কেনাকাটার অভিজ্ঞতা উপভোগ করুন',
    previewGreeting: 'CASA-তে আপনাকে স্বাগতম',
    previewPills: ['সেরা অফার', 'সকল বিভাগ', 'দ্রুত ডেলিভারি'],
  },
  {
    id: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    badge: 'महाराष्ट्र (Maharashtra)',
    badgeColor: '#d97706',
    description: 'आपल्या मायबोलीत खरेदी करा आणि विशेष सवलतींचा आनंद घ्या',
    previewGreeting: 'CASA मध्ये आपले स्वागत आहे',
    previewPills: ['टॉप ऑफर्स', 'सर्व श्रेणी', 'जलद डिलिव्हरी'],
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    badge: 'தமிழ்நாடு (Tamil Nadu)',
    badgeColor: '#db2777',
    description: 'உங்கள் சொந்த மொழியில் சுலபமாகவும் வேகமாகவும் ஷாப்பிங் செய்யுங்கள்',
    previewGreeting: 'CASA-விற்கு உங்களை வரவேற்கிறோம்',
    previewPills: ['சிறப்பு சலுகைகள்', 'அனைத்து பிரிவுகள்', 'இலவச டெலிவரி'],
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    badge: 'తెలుగు రాష్ట్రాలు (AP & Telangana)',
    badgeColor: '#0284c7',
    description: 'మీ సొంత తెలుగు భాషలో సౌకర్యవంతమైన ఆన్‌లైన్ షాపింగ్',
    previewGreeting: 'CASA కు స్వాగతం',
    previewPills: ['బెస్ట్ ఆఫర్లు', 'అన్ని విభాగాలు', 'ఫాస్ట్ డెలివరీ'],
  },
  {
    id: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    badge: 'ગુજરાત (Gujarat)',
    badgeColor: '#16a34a',
    description: 'તમારી પોતાની ભાષામાં સરળ અને વિશ્વસનીય ખરીદીનો આનંદ માણો',
    previewGreeting: 'CASA માં આપનું સ્વાગત છે',
    previewPills: ['શ્રેષ્ઠ ઓફર્સ', 'બધી શ્રેણીઓ', 'ઝડપી ડિલિવરી'],
  },
];

export const LanguageModal = ({ isOpen, onClose }) => {
  const { language, setLanguage, primaryColor, t } = useStore();
  const { user, updateProfile } = useAuth();
  const { success } = useToast();

  const [selectedLang, setSelectedLang] = useState(language || 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync state whenever modal opens or current language changes
  useEffect(() => {
    if (isOpen) {
      setSelectedLang(language || 'en');
      setSearchQuery('');
    }
  }, [isOpen, language]);

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGE_OPTIONS;
    const q = searchQuery.toLowerCase().trim();
    return LANGUAGE_OPTIONS.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        opt.nativeName.toLowerCase().includes(q) ||
        opt.id.toLowerCase().includes(q) ||
        opt.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeOption = useMemo(() => {
    return (
      LANGUAGE_OPTIONS.find((opt) => opt.id === selectedLang) ||
      LANGUAGE_OPTIONS[0]
    );
  }, [selectedLang]);

  const handleSkip = () => {
    // If skipped, still mark as acknowledged for this user so it won't keep popping up every navigation
    if (user) {
      localStorage.setItem(`casa_lang_selected_${user._id || user.id}`, 'skipped');
    } else {
      localStorage.setItem('casa_guest_lang_selected', 'skipped');
    }
    onClose();
  };

  // Keyboard shortcut: Escape to skip/dismiss (must be declared BEFORE early return)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, user]);

  // Handle language confirmation and persistence
  const handleApply = async () => {
    setSaving(true);
    try {
      // 1. Update in StoreContext (which persists in localStorage)
      setLanguage(selectedLang);

      // 2. Mark user preference in localStorage so modal doesn't re-trigger unnecessarily
      if (user) {
        const userKey = `casa_lang_selected_${user._id || user.id}`;
        localStorage.setItem(userKey, 'true');

        // 3. Sync to backend user profile if possible
        try {
          if (updateProfile) {
            await updateProfile({ preferredLanguage: selectedLang });
          }
        } catch {
          // Non-blocking if offline/backend fails
        }
      } else {
        localStorage.setItem('casa_guest_lang_selected', 'true');
      }

      // 4. Trigger celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: [primaryColor || '#2563eb', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Confetti optional
      }

      const opt = LANGUAGE_OPTIONS.find((l) => l.id === selectedLang);
      success(
        `Language preference set to ${opt?.nativeName || selectedLang} (${opt?.name || ''})!`
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleSkip}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Decorative Top Accent Bar */}
        <div
          style={{
            height: '5px',
            width: '100%',
            background: `linear-gradient(90deg, ${primaryColor || '#2563eb'}, #8b5cf6, #ec4899, #f59e0b)`,
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
          }}
        />

        {/* Modal Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                ...iconBadgeStyle,
                background: `${primaryColor || '#2563eb'}18`,
                color: primaryColor || '#2563eb',
              }}
            >
              <Globe size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={titleStyle}>
                  {user ? `Namaste, ${user.name ? user.name.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Shopper')}!` : 'Welcome to CASA!'}
                </h2>
                <span style={pillBadgeStyle}>
                  <Sparkles size={11} color="#f59e0b" />
                  <span>Choose Your Language</span>
                </span>
              </div>
              <p style={subtitleStyle}>
                अपनी पसंदीदा भाषा चुनें / Select your preferred language to personalize your shopping experience.
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            style={closeBtnStyle}
            title="Close / बाद में चुनें"
            aria-label="Close modal"
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Search Bar for Languages */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={searchWrapStyle}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search language (e.g. Hindi, English, বাংলা, தமிழ்)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Languages Selection Grid */}
        <div style={cardsContainerStyle}>
          <div style={gridStyle}>
            {filteredLanguages.map((opt) => {
              const isSelected = selectedLang === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedLang(opt.id)}
                  style={{
                    ...cardStyle,
                    borderColor: isSelected ? (primaryColor || '#2563eb') : '#e2e8f0',
                    background: isSelected ? '#f0f7ff' : '#ffffff',
                    boxShadow: isSelected
                      ? `0 8px 24px -4px ${primaryColor || '#2563eb'}25`
                      : '0 1px 3px rgba(0,0,0,0.04)',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  }}
                  className="language-card-item"
                >
                  {/* Top row: Flag + Native name + Radio Check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{opt.flag}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={nativeNameStyle}>{opt.nativeName}</span>
                          {opt.nativeName !== opt.name && (
                            <span style={englishNameStyle}>({opt.name})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        ...checkCircleStyle,
                        borderColor: isSelected ? (primaryColor || '#2563eb') : '#cbd5e1',
                        background: isSelected ? (primaryColor || '#2563eb') : '#ffffff',
                      }}
                    >
                      {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        ...tagBadgeStyle,
                        background: `${opt.badgeColor}15`,
                        color: opt.badgeColor,
                        borderColor: `${opt.badgeColor}30`,
                      }}
                    >
                      {opt.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={cardDescriptionStyle}>{opt.description}</p>
                </div>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div style={emptyStateStyle}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                No languages found matching "{searchQuery}".
              </p>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        <div style={previewBoxStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color={primaryColor || '#2563eb'} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Live Experience Preview ({activeOption.nativeName})
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Instant Realtime Translation
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
              "{activeOption.previewGreeting}"
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(activeOption?.previewPills || []).map((pill, idx) => (
                <span key={idx} style={previewPillStyle}>
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={footerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>You can change your language anytime from the top bar</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleSkip}
              style={skipBtnStyle}
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={saving}
              style={{
                ...applyBtnStyle,
                background: primaryColor || '#2563eb',
              }}
            >
              <span>{saving ? 'Saving...' : 'Apply & Continue'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 99999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  animation: 'fadeIn 0.2s ease-out',
};

const modalCardStyle = {
  background: '#ffffff',
  borderRadius: '20px',
  maxWidth: '720px',
  width: '100%',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
  overflow: 'hidden',
  position: 'relative',
  animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const headerStyle = {
  padding: '20px 24px 14px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
};

const iconBadgeStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const titleStyle = {
  fontSize: '1.2rem',
  fontWeight: 800,
  color: '#0f172a',
  margin: 0,
  letterSpacing: '-0.3px',
};

const subtitleStyle = {
  fontSize: '0.8rem',
  color: '#64748b',
  margin: '4px 0 0 0',
  lineHeight: 1.4,
};

const pillBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#fef3c7',
  color: '#92400e',
  fontSize: '0.68rem',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '999px',
};

const closeBtnStyle = {
  border: 'none',
  background: '#f1f5f9',
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  flexShrink: 0,
};

const searchWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '8px 12px',
};

const searchInputStyle = {
  border: 'none',
  background: 'transparent',
  outline: 'none',
  width: '100%',
  fontSize: '0.84rem',
  color: '#0f172a',
};

const cardsContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '0 24px 16px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
  gap: '12px',
};

const cardStyle = {
  border: '2px solid #e2e8f0',
  borderRadius: '14px',
  padding: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const nativeNameStyle = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#0f172a',
};

const englishNameStyle = {
  fontSize: '0.78rem',
  color: '#64748b',
  fontWeight: 500,
};

const checkCircleStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  border: '2px solid #cbd5e1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
  flexShrink: 0,
};

const tagBadgeStyle = {
  fontSize: '0.65rem',
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: '6px',
  border: '1px solid transparent',
};

const cardDescriptionStyle = {
  fontSize: '0.75rem',
  color: '#64748b',
  margin: '8px 0 0 0',
  lineHeight: 1.4,
};

const emptyStateStyle = {
  padding: '30px',
  textAlign: 'center',
  background: '#f8fafc',
  borderRadius: '12px',
};

const previewBoxStyle = {
  margin: '0 24px 16px',
  padding: '12px 16px',
  background: '#f8fafc',
  border: '1px dashed #cbd5e1',
  borderRadius: '12px',
};

const previewPillStyle = {
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#1e293b',
  background: '#ffffff',
  padding: '3px 8px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
};

const footerStyle = {
  padding: '14px 24px',
  borderTop: '1px solid #f1f5f9',
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
};

const skipBtnStyle = {
  border: 'none',
  background: 'transparent',
  color: '#64748b',
  fontSize: '0.825rem',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: '8px',
  transition: 'background 0.15s',
};

const applyBtnStyle = {
  border: 'none',
  color: '#ffffff',
  fontSize: '0.85rem',
  fontWeight: 700,
  padding: '10px 20px',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
  transition: 'all 0.15s ease',
};

export default LanguageModal;
