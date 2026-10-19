import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Truck,
  Star,
  Zap,
  BadgeCheck,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  // Interactive Password Strength Evaluation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 3, label: 'Good', color: '#3b82f6' };
    return { score: 4, label: 'Strong & Secure', color: '#10b981' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      error('Please agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    const res = await register({ name, email, phone, password });
    setLoading(false);

    if (res.success) {
      success('Welcome to CASA! Your account was created successfully.');
      navigate(redirect);
    } else {
      error(res.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div style={pageWrapperStyle}>
      {/* Background Decorative Ambient Gradients */}
      <div style={ambientGlowPrimary} />
      <div style={ambientGlowSecondary} />

      <style>{`
        .register-split-card {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          width: 100%;
          max-width: 1040px;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 920px) {
          .register-split-card {
            grid-template-columns: 1fr;
            max-width: 520px;
          }
          .register-hero-side {
            display: none !important;
          }
        }
        @media (max-width: 580px) {
          .register-form-side {
            padding: 26px 18px !important;
          }
          .register-split-card {
            border-radius: 20px !important;
          }
          .register-trust-strip {
            flex-wrap: wrap !important;
            gap: 10px !important;
            justify-content: center !important;
          }
          .register-title {
            font-size: 1.3rem !important;
          }
        }
        .custom-auth-input:focus-within {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }
        .custom-auth-input input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
      `}</style>

      <div className="register-split-card animate-slide-up">
        {/* Left Column: Brand & VIP Shopping Privileges Showcase */}
        <div className="register-hero-side" style={heroSideStyle}>
          {/* Brand Logo & Festive Badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={brandBadgeIcon}>
                <span>C</span>
              </div>
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', display: 'block' }}>
                  CASA
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#93c5fd', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  India Marketplace
                </span>
              </div>
            </div>

            <div style={festiveOfferPill}>
              <Sparkles size={13} color="#fbbf24" />
              <span>FESTIVE SALE PRIVILEGES ACTIVE</span>
            </div>

            <h2 style={heroHeadingStyle}>
              Join CASA VIP. <br />
              <span style={{ color: '#93c5fd' }}>Experience India's</span> Finest Shopping.
            </h2>
            <p style={heroSubtextStyle}>
              Create your account to unlock curated designer collections, authentic sarees, verified electronics, and member-only pricing.
            </p>
          </div>

          {/* 4 Value Propositions / Perks Grid */}
          <div style={perksGridStyle}>
            <div style={perkItemStyle}>
              <div style={{ ...perkIconBox, background: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24' }}>
                <Gift size={18} />
              </div>
              <div>
                <strong style={perkTitle}>Flat ₹200 Welcome Gift</strong>
                <span style={perkDesc}>Use code CASA200 on your first purchase</span>
              </div>
            </div>

            <div style={perkItemStyle}>
              <div style={{ ...perkIconBox, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                <Truck size={18} />
              </div>
              <div>
                <strong style={perkTitle}>Free Express Shipping</strong>
                <span style={perkDesc}>Fast doorstep delivery on orders above ₹499</span>
              </div>
            </div>

            <div style={perkItemStyle}>
              <div style={{ ...perkIconBox, background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                <Zap size={18} />
              </div>
              <div>
                <strong style={perkTitle}>VIP Early Access</strong>
                <span style={perkDesc}>24hr early access to flash sales & festival drops</span>
              </div>
            </div>

            <div style={perkItemStyle}>
              <div style={{ ...perkIconBox, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong style={perkTitle}>100% Genuine Brands</strong>
                <span style={perkDesc}>Direct verified sourcing & 7-day easy returns</span>
              </div>
            </div>
          </div>

          {/* Social Proof Review Quote & Avatar Stack */}
          <div style={socialProofContainer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#fbbf24" />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>4.9 / 5</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• 50,000+ Verified Buyers</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
              "The smoothest checkout and most authentic Indian ethnic wear collection online!"
            </p>
          </div>
        </div>

        {/* Right Column: Seamless Interactive Form */}
        <div className="register-form-side" style={formSideStyle}>
          {/* Dual Tab Mode Switcher (Sign In vs Create Account) */}
          <div style={tabSwitcherWrapper}>
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              style={inactiveTabStyle}
            >
              Sign In
            </Link>
            <button
              type="button"
              style={activeTabStyle}
            >
              Create Account
            </button>
          </div>

          {/* Header Title */}
          <div style={{ marginBottom: '22px' }}>
            <h1 className="register-title" style={formTitleStyle}>Create CASA Account</h1>
            <p style={formSubtitleStyle}>
              Join thousands of shoppers for exclusive deals, rewards, and fast tracking.
            </p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} style={formContainerStyle}>
            {/* Full Name */}
            <div style={fieldGroup}>
              <label htmlFor="reg-name" style={labelStyle}>Full Name *</label>
              <div
                className="custom-auth-input"
                style={inputBoxStyle}
                onClick={() => document.getElementById('reg-name')?.focus()}
              >
                <User size={17} color="#94a3b8" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={nativeInputStyle}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={fieldGroup}>
              <label htmlFor="reg-email" style={labelStyle}>Email Address *</label>
              <div
                className="custom-auth-input"
                style={inputBoxStyle}
                onClick={() => document.getElementById('reg-email')?.focus()}
              >
                <Mail size={17} color="#94a3b8" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={nativeInputStyle}
                />
              </div>
            </div>

            {/* Mobile Number with India Flag & Prefix */}
            <div style={fieldGroup}>
              <label htmlFor="reg-phone" style={labelStyle}>Mobile Number *</label>
              <div
                className="custom-auth-input"
                style={inputBoxStyle}
                onClick={() => document.getElementById('reg-phone')?.focus()}
              >
                <div style={phonePrefixBadge}>
                  <span style={{ fontSize: '1rem' }}>🇮🇳</span>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>+91</span>
                </div>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={nativeInputStyle}
                />
              </div>
            </div>

            {/* Password Field with Show/Hide & Strength Meter */}
            <div style={fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="reg-password" style={labelStyle}>Create Password *</label>
                {password && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <div
                className="custom-auth-input"
                style={inputBoxStyle}
                onClick={(e) => {
                  if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                    document.getElementById('reg-password')?.focus();
                  }
                }}
              >
                <Lock size={17} color="#94a3b8" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={nativeInputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>

              {/* Dynamic 4-Segment Password Strength Bar */}
              {password && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '999px',
                        background: bar <= passwordStrength.score ? passwordStrength.color : '#e2e8f0',
                        transition: 'background 0.25s ease',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Terms of Service Checkbox */}
            <label style={termsCheckboxLabel}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer', marginTop: '2px' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                I agree to CASA's{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} style={inlinePolicyLink}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} style={inlinePolicyLink}>
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...submitButtonStyle,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{loading ? 'Setting Up Account...' : 'Agree & Create Account'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Trust Guarantees Micro Strip */}
          <div className="register-trust-strip" style={trustStripStyle}>
            <span style={trustBadgeItem}>
              <Shield size={13} color="#059669" /> 256-Bit SSL
            </span>
            <span style={trustBadgeItem}>
              <BadgeCheck size={13} color="#2563eb" /> 100% Genuine
            </span>
            <span style={trustBadgeItem}>
              <Truck size={13} color="#7c3aed" /> Doorstep Returns
            </span>
          </div>

          {/* Footer Navigation */}
          <div style={footerRowStyle}>
            <span>Already have an account?</span>{' '}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              style={footerSignInLink}
            >
              Sign In Here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Styles */
const pageWrapperStyle = {
  minHeight: '88vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 16px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eff6ff 100%)',
  position: 'relative',
  overflow: 'hidden',
};

const ambientGlowPrimary = {
  position: 'absolute',
  width: '600px',
  height: '600px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
  top: '-100px',
  right: '-100px',
  pointerEvents: 'none',
};

const ambientGlowSecondary = {
  position: 'absolute',
  width: '600px',
  height: '600px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
  bottom: '-100px',
  left: '-100px',
  pointerEvents: 'none',
};

const heroSideStyle = {
  background: 'linear-gradient(155deg, #0f172a 0%, #1e1b4b 60%, #172554 100%)',
  padding: '44px 36px',
  color: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
};

const brandBadgeIcon = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  fontSize: '1.25rem',
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
};

const festiveOfferPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '999px',
  background: 'rgba(251, 191, 36, 0.12)',
  border: '1px solid rgba(251, 191, 36, 0.3)',
  color: '#fbbf24',
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.04em',
  marginBottom: '16px',
};

const heroHeadingStyle = {
  fontSize: '1.75rem',
  fontWeight: 900,
  lineHeight: 1.25,
  letterSpacing: '-0.025em',
  margin: '0 0 10px 0',
};

const heroSubtextStyle = {
  fontSize: '0.85rem',
  color: '#94a3b8',
  lineHeight: 1.5,
  margin: 0,
};

const perksGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  margin: '28px 0',
};

const perkItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const perkIconBox = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const perkTitle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#ffffff',
};

const perkDesc = {
  display: 'block',
  fontSize: '0.75rem',
  color: '#94a3b8',
  marginTop: '1px',
};

const socialProofContainer = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '14px 16px',
  backdropFilter: 'blur(8px)',
};

const formSideStyle = {
  padding: '44px 40px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: '#ffffff',
};

const tabSwitcherWrapper = {
  display: 'flex',
  background: '#f1f5f9',
  borderRadius: '12px',
  padding: '4px',
  marginBottom: '24px',
  border: '1px solid #e2e8f0',
};

const activeTabStyle = {
  flex: 1,
  padding: '8px 14px',
  borderRadius: '9px',
  background: '#ffffff',
  border: 'none',
  color: '#0f172a',
  fontSize: '0.825rem',
  fontWeight: 700,
  cursor: 'default',
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
};

const inactiveTabStyle = {
  flex: 1,
  padding: '8px 14px',
  borderRadius: '9px',
  background: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: '0.825rem',
  fontWeight: 600,
  textAlign: 'center',
  textDecoration: 'none',
  transition: 'color 0.15s ease',
};

const formTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 900,
  color: '#0f172a',
  letterSpacing: '-0.025em',
  margin: 0,
};

const formSubtitleStyle = {
  fontSize: '0.85rem',
  color: '#64748b',
  marginTop: '5px',
  margin: '5px 0 0 0',
  lineHeight: 1.45,
};

const formContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#334155',
};

const inputBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1.5px solid #cbd5e1',
  background: '#ffffff',
  transition: 'all 0.15s ease',
  cursor: 'text',
};

const nativeInputStyle = {
  border: 'none',
  outline: 'none',
  width: '100%',
  fontSize: '0.875rem',
  color: '#0f172a',
  background: 'transparent',
};

const phonePrefixBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  paddingRight: '8px',
  borderRight: '1.5px solid #e2e8f0',
  flexShrink: 0,
};

const eyeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '2px',
};

const termsCheckboxLabel = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  cursor: 'pointer',
  marginTop: '2px',
};

const inlinePolicyLink = {
  color: '#2563eb',
  fontWeight: 600,
  textDecoration: 'underline',
};

const submitButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '12px 18px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#ffffff',
  fontSize: '0.9rem',
  fontWeight: 700,
  border: 'none',
  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
  transition: 'all 0.15s ease',
  marginTop: '4px',
};

const trustStripStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0 0 0',
  borderTop: '1px solid #f1f5f9',
  marginTop: '16px',
};

const trustBadgeItem = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#64748b',
};

const footerRowStyle = {
  textAlign: 'center',
  marginTop: '16px',
  fontSize: '0.825rem',
  color: '#64748b',
};

const footerSignInLink = {
  color: '#2563eb',
  fontWeight: 700,
  textDecoration: 'none',
  marginLeft: '4px',
};

export default RegisterPage;
