import React, { useState } from 'react';
import { Sparkles, Mail, Check, Copy, Gift, ArrowRight, Edit2, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEFAULT_VIP_CONFIG = {
  badge: 'CASA VIP INSIDER CLUB',
  headline: 'Unlock Instant ₹250 OFF on Your Next Order',
  discountHighlight: '₹250 OFF',
  promoCode: 'CASA250',
  subtitle: 'Join our private circle to receive secret weekend flash drops, festival priority passes, and exclusive curated launches.',
  perk1: 'Instant ₹250 Welcome Voucher',
  perk2: 'VIP Early Access to Sales',
  perk3: 'Zero Spam Guarantee',
  isVisible: true,
};

const VipClubSection = () => {
  const { isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('casa_vip_club_settings');
      if (saved) {
        return { ...DEFAULT_VIP_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_VIP_CONFIG;
  });

  const [email, setEmail] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...config });

  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('casa_vip_club_settings', JSON.stringify(newConfig));
      window.dispatchEvent(new Event('casa_vip_config_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Please enter a valid email address.');
      return;
    }
    setClaimed(true);
    success(`🎉 Congratulations! You have joined CASA VIP Club. Your code is ${config.promoCode}.`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(config.promoCode);
    setCopied(true);
    success(`📋 Coupon code ${config.promoCode} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenEdit = () => {
    setFormData({ ...config });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.promoCode.trim()) {
      error('Promo code cannot be empty.');
      return;
    }
    saveConfig(formData);
    setIsModalOpen(false);
    success('👑 VIP Club offer settings updated successfully.');
  };

  // If hidden by Super Admin and viewer is not Super Admin, do not render
  if (!config.isVisible && !isSuperAdmin) {
    return null;
  }

  return (
    <section style={{ padding: '36px 0 20px', background: 'transparent' }}>
      <style>{`
        .vip-club-card {
          background: linear-gradient(135deg, #09101d 0%, #0f172a 45%, #1e1b4b 100%);
          border-radius: 24px;
          padding: 44px 36px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.45);
          color: #ffffff;
        }
        @media (max-width: 768px) {
          .vip-club-card {
            padding: 28px 20px !important;
            border-radius: 18px !important;
          }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.08); }
        }
        .vip-glowing-orb {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(99, 102, 241, 0) 70%);
          filter: blur(40px);
          pointer-events: none;
          animation: floatOrb 7s ease-in-out infinite;
        }
        .vip-input-wrap {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          padding: 5px 6px 5px 16px;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          width: 100%;
          max-width: 480px;
        }
        .vip-input-wrap:focus-within {
          background: rgba(255, 255, 255, 0.12);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.25);
        }
        @media (max-width: 640px) {
          .vip-input-wrap {
            flex-direction: column;
            border-radius: 14px;
            padding: 10px;
            gap: 10px;
          }
          .vip-input-wrap input {
            width: 100%;
            text-align: center;
          }
          .vip-input-wrap button {
            width: 100%;
          }
        }
      `}</style>
      <div className="container">
        {/* Super Admin Control Strip */}
        {isSuperAdmin && (
          <div
            style={{
              background: '#0f172a',
              border: '1.5px solid #334155',
              borderRadius: '12px',
              padding: '8px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a', fontSize: '0.82rem', fontWeight: 800 }}>
              <span>👑</span>
              <span>SUPER ADMIN: VIP Club Offer & Promo Code Manager</span>
              {!config.isVisible && (
                <span style={{ background: '#7f1d1d', color: '#fecaca', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                  Hidden from Customers
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleOpenEdit}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Edit2 size={13} />
              <span>Edit VIP Offer & Code</span>
            </button>
          </div>
        )}

        <div className="vip-club-card" style={{ opacity: !config.isVisible ? 0.6 : 1 }}>
          {/* Animated Ambient Orbs */}
          <div className="vip-glowing-orb" style={{ top: '-80px', right: '-60px' }} />
          <div className="vip-glowing-orb" style={{ bottom: '-100px', left: '-60px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(0,0,0,0) 70%)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
            {/* VIP Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(251, 191, 36, 0.15)',
                color: '#fde047',
                border: '1.5px solid rgba(251, 191, 36, 0.35)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                marginBottom: '14px',
              }}
            >
              <Sparkles size={14} color="#fde047" /> {config.badge || 'CASA VIP INSIDER CLUB'}
            </div>

            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.025em' }}>
              {config.headline.includes(config.discountHighlight) ? (
                <>
                  {config.headline.split(config.discountHighlight)[0]}
                  <span style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {config.discountHighlight}
                  </span>
                  {config.headline.split(config.discountHighlight)[1]}
                </>
              ) : (
                config.headline
              )}
            </h2>

            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.55, margin: '0 auto 24px', maxWidth: '520px' }}>
              {config.subtitle}
            </p>

            {/* Claimed View or Form */}
            {!claimed ? (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className="vip-input-wrap">
                  <Mail size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your personal email address..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      padding: '8px 12px',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '10px 22px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <span>Claim Voucher</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  maxWidth: '440px',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Exclusive Promo Code</div>
                  <strong style={{ fontSize: '1.35rem', color: '#fbbf24', letterSpacing: '0.06em' }}>{config.promoCode}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    background: copied ? '#059669' : '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            )}

            {/* Perks Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#94a3b8' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Gift size={14} color="#f59e0b" /> {config.perk1}
              </span>
              <span>•</span>
              <span>⚡ {config.perk2}</span>
              <span>•</span>
              <span>🔒 {config.perk3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>👑</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Edit VIP Club Offer Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    VIP Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. CASA250"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Discount Highlight
                  </label>
                  <input
                    type="text"
                    value={formData.discountHighlight}
                    onChange={(e) => setFormData({ ...formData, discountHighlight: e.target.value })}
                    placeholder="e.g. ₹250 OFF"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Headline Title
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Unlock Instant ₹250 OFF on Your Next Order"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  VIP Perks List
                </label>
                <input
                  type="text"
                  value={formData.perk1}
                  onChange={(e) => setFormData({ ...formData, perk1: e.target.value })}
                  placeholder="Perk 1"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  value={formData.perk2}
                  onChange={(e) => setFormData({ ...formData, perk2: e.target.value })}
                  placeholder="Perk 2"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  value={formData.perk3}
                  onChange={(e) => setFormData({ ...formData, perk3: e.target.value })}
                  placeholder="Perk 3"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              {/* Visibility toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Show on Customer Storefront:
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                  style={{
                    background: formData.isVisible ? '#059669' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '5px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {formData.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                  <span>{formData.isVisible ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                >
                  Save VIP Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default VipClubSection;
