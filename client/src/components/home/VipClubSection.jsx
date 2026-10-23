import React, { useState } from 'react';
import { Sparkles, Mail, Check, Copy, Gift, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const VipClubSection = () => {
  const [email, setEmail] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success, error } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Please enter a valid email address.');
      return;
    }
    setClaimed(true);
    success('🎉 Congratulations! You have joined CASA VIP Club. Your code is CASA250.');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('CASA250');
    setCopied(true);
    success('📋 Coupon code CASA250 copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section style={{ padding: '40px 0 20px', background: 'transparent' }}>
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
        <div className="vip-club-card">
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
              <Sparkles size={14} color="#fde047" /> CASA VIP INSIDER CLUB
            </div>

            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.025em' }}>
              Unlock Instant <span style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹250 OFF</span> on Your Next Order
            </h2>

            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.55, margin: '0 auto 24px', maxWidth: '520px' }}>
              Join our private circle to receive secret weekend flash drops, festival priority passes, and exclusive curated launches.
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
                    <span>Claim ₹250</span>
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
                  <strong style={{ fontSize: '1.35rem', color: '#fbbf24', letterSpacing: '0.06em' }}>CASA250</strong>
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
                <Gift size={14} color="#f59e0b" /> Instant ₹250 Welcome Voucher
              </span>
              <span>•</span>
              <span>⚡ VIP Early Access to Sales</span>
              <span>•</span>
              <span>🔒 Zero Spam Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VipClubSection;
