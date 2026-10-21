import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Gift,
  Truck,
  Star,
  Zap,
  BadgeCheck,
  Shield,
  LogIn,
  UserPlus,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, register, user, logout, switchRole } = useAuth();
  const { success, error } = useToast();

  const redirect = searchParams.get('redirect') || '/';

  // If already logged in, redirect away from signin/signup
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [user, navigate]);

  // Active Tab: 'signin' or 'signup'
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginRole, setLoginRole] = useState('customer');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);

  // Sync tab with URL if changed externally
  useEffect(() => {
    if (searchParams.get('tab') === 'signup') {
      setActiveTab('signup');
    } else if (searchParams.get('tab') === 'signin') {
      setActiveTab('signin');
    }
  }, [searchParams]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'signup' ? { tab: 'signup', redirect } : { redirect });
  };

  // Password Strength Evaluation for Sign Up
  const passwordStrength = useMemo(() => {
    if (!signUpPassword) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (signUpPassword.length >= 6) score++;
    if (signUpPassword.length >= 8) score++;
    if (/[A-Z]/.test(signUpPassword) && /[a-z]/.test(signUpPassword)) score++;
    if (/[0-9]/.test(signUpPassword) || /[^A-Za-z0-9]/.test(signUpPassword)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 3, label: 'Good', color: '#3b82f6' };
    return { score: 4, label: 'Strong & Secure', color: '#10b981' };
  }, [signUpPassword]);

  // Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login({ email: signInEmail, password: signInPassword });
    setLoading(false);

    if (res.success) {
      if (!localStorage.getItem('casa_language_prompted_once')) {
        sessionStorage.setItem('casa_prompt_language_modal', 'true');
      }
      success(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'admin' && (redirect === '/' || redirect === '/login')) {
        navigate('/admin');
      } else if (res.user.role === 'vendor' && (redirect === '/' || redirect === '/login')) {
        navigate('/vendor');
      } else if (res.user.role === 'delivery' && (redirect === '/' || redirect === '/login')) {
        navigate('/delivery');
      } else {
        navigate(redirect);
      }
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      error('Please accept the Terms of Service to create your account.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: signUpName,
      email: signUpEmail,
      phone: signUpPhone,
      password: signUpPassword,
    });
    setLoading(false);

    if (res.success) {
      if (!localStorage.getItem('casa_language_prompted_once')) {
        sessionStorage.setItem('casa_prompt_language_modal', 'true');
      }
      success('Welcome to CASA! Your account was created successfully.');
      navigate(redirect);
    }
  };

  // 1-Click Demo Fill & Instant Launch
  const handleSelectRole = async (role, instantLaunch = false) => {
    setLoginRole(role);
    let email = 'rajesh@casa.in';
    let password = 'User@Casa2026';
    let target = '/';

    if (role === 'customer') {
      email = 'rajesh@casa.in';
      password = 'User@Casa2026';
      target = '/';
    } else if (role === 'vendor') {
      email = 'vendor@casa.in';
      password = 'Vendor@Casa2026';
      target = '/vendor';
    } else if (role === 'delivery') {
      email = 'delivery@casa.in';
      password = 'Delivery@Casa2026';
      target = '/delivery';
    } else {
      email = 'admin@casa.in';
      password = 'Admin@Casa2026';
      target = '/admin';
    }

    setSignInEmail(email);
    setSignInPassword(password);

    if (instantLaunch) {
      setLoading(true);
      const res = await login({ email, password });
      setLoading(false);
      if (res.success) {
        success(`Logged in as ${res.user.name || role}!`);
        navigate(target);
      }
    }
  };

  if (user) {
    return (
      <div style={pageWrapperStyle}>
        <div
          className="card"
          style={{
            maxWidth: '520px',
            width: '100%',
            padding: '36px 30px',
            borderRadius: '24px',
            textAlign: 'center',
            background: '#ffffff',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Already Signed In
          </h2>
          <p style={{ color: '#475569', fontSize: '0.925rem', marginTop: '8px', lineHeight: 1.5 }}>
            You are logged in as <strong>{user.name}</strong> ({user.email}) with role: <strong style={{ color: '#2563eb', textTransform: 'uppercase' }}>{user.role}</strong>.
          </p>

          {/* Quick 1-Click Persona & Portal Switcher */}
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
              ⚡ Quick Switch & Open Demo Portals:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={async () => {
                  if (user.role !== 'delivery') await switchRole('delivery');
                  navigate('/delivery');
                }}
                className="btn"
                style={{
                  padding: '10px 12px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                }}
              >
                <Truck size={15} /> Delivery Portal
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (user.role !== 'vendor') await switchRole('vendor');
                  navigate('/vendor');
                }}
                className="btn"
                style={{
                  padding: '10px 12px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                }}
              >
                <Store size={15} /> Vendor Hub
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (user.role !== 'admin') await switchRole('admin');
                  navigate('/admin');
                }}
                className="btn"
                style={{
                  padding: '10px 12px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                }}
              >
                <Shield size={15} /> Admin Console
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (user.role !== 'user') await switchRole('user');
                  navigate('/');
                }}
                className="btn"
                style={{
                  padding: '10px 12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                }}
              >
                <User size={15} /> Customer Store
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : user.role === 'delivery' ? '/delivery' : '/')}
              className="btn btn-outline"
              style={{ flex: 1, padding: '11px', borderRadius: '10px', fontWeight: 700 }}
            >
              Continue Dashboard
            </button>
            <button
              onClick={async () => {
                await logout();
              }}
              className="btn"
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
              }}
            >
              Log Out Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      {/* Decorative ambient background glows */}
      <div style={ambientGlowPrimary} />
      <div style={ambientGlowSecondary} />

      <style>{`
        .auth-split-card {
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
          .auth-split-card {
            grid-template-columns: 1fr;
            max-width: 520px;
          }
          .auth-hero-side {
            display: none !important;
          }
        }
        @media (max-width: 580px) {
          .auth-form-side {
            padding: 26px 18px !important;
          }
          .auth-split-card {
            border-radius: 20px !important;
          }
          .auth-trust-strip {
            flex-wrap: wrap !important;
            gap: 10px !important;
            justify-content: center !important;
          }
          .auth-title {
            font-size: 1.3rem !important;
          }
          .demo-buttons-row {
            flex-direction: column !important;
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

      <div className="auth-split-card animate-slide-up">
        {/* Left Column: Brand & VIP Shopping Privileges Showcase */}
        <div className="auth-hero-side" style={heroSideStyle}>
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
              {activeTab === 'signin' ? 'Welcome Back.' : 'Join CASA VIP.'} <br />
              <span style={{ color: '#93c5fd' }}>India's Premier</span> Shopping Platform.
            </h2>
            <p style={heroSubtextStyle}>
              {activeTab === 'signin'
                ? 'Sign in to access your orders, track shipments, check saved addresses, and claim member discounts.'
                : 'Create your account to unlock curated designer collections, authentic sarees, verified electronics, and member-only pricing.'}
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

          {/* Social Proof Review Quote */}
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

        {/* Right Column: Interactive Form Card */}
        <div className="auth-form-side" style={formSideStyle}>
          {/* Dual Tab Switcher */}
          <div style={tabSwitcherWrapper}>
            <button
              type="button"
              onClick={() => handleTabSwitch('signin')}
              style={activeTab === 'signin' ? activeTabStyle : inactiveTabStyle}
            >
              <LogIn size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              style={activeTab === 'signup' ? activeTabStyle : inactiveTabStyle}
            >
              <UserPlus size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Create Account
            </button>
          </div>

          {/* Header Title */}
          <div style={{ marginBottom: '20px' }}>
            <h1 className="auth-title" style={formTitleStyle}>
              {activeTab === 'signin' ? 'Sign In to CASA' : 'Create CASA Account'}
            </h1>
            <p style={formSubtitleStyle}>
              {activeTab === 'signin'
                ? 'Access your orders, saved addresses, and personalized shopping benefits.'
                : 'Join thousands of shoppers for exclusive deals, rewards, and fast tracking.'}
            </p>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' ? (
            <div>
              {/* 1-Click Instant Demo Launch Buttons */}
              <div style={demoFillContainer}>
                <span style={demoLabel}>
                  <Sparkles size={12} color="#2563eb" /> 1-Click Instant Demo Launch:
                </span>
                <div className="demo-buttons-row" style={demoButtonsRow}>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('customer', true)}
                    disabled={loading}
                    title="1-Click Instant Login as Customer"
                    style={{
                      ...demoBtn,
                      background: loginRole === 'customer' ? '#eff6ff' : '#ffffff',
                      borderColor: loginRole === 'customer' ? '#2563eb' : '#e2e8f0',
                      color: loginRole === 'customer' ? '#2563eb' : '#475569',
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    <User size={13} /> Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('vendor', true)}
                    disabled={loading}
                    title="1-Click Instant Login as Vendor Hub"
                    style={{
                      ...demoBtn,
                      background: loginRole === 'vendor' ? '#f0fdf4' : '#ffffff',
                      borderColor: loginRole === 'vendor' ? '#16a34a' : '#e2e8f0',
                      color: loginRole === 'vendor' ? '#15803d' : '#475569',
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    <Store size={13} /> Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('delivery', true)}
                    disabled={loading}
                    title="1-Click Instant Login as Delivery Partner"
                    style={{
                      ...demoBtn,
                      background: loginRole === 'delivery' ? '#e0f2fe' : '#ffffff',
                      borderColor: loginRole === 'delivery' ? '#0284c7' : '#e2e8f0',
                      color: loginRole === 'delivery' ? '#0369a1' : '#475569',
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    <Truck size={13} /> Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('admin', true)}
                    disabled={loading}
                    title="1-Click Instant Login as Admin Console"
                    style={{
                      ...demoBtn,
                      background: loginRole === 'admin' ? '#f5f3ff' : '#ffffff',
                      borderColor: loginRole === 'admin' ? '#7c3aed' : '#e2e8f0',
                      color: loginRole === 'admin' ? '#6d28d9' : '#475569',
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    <ShieldCheck size={13} /> Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} style={formContainerStyle}>
                <div style={fieldGroup}>
                  <label htmlFor="signin-email" style={labelStyle}>Email Address *</label>
                  <div
                    className="custom-auth-input"
                    style={inputBoxStyle}
                    onClick={() => document.getElementById('signin-email')?.focus()}
                  >
                    <Mail size={17} color="#94a3b8" />
                    <input
                      id="signin-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      style={nativeInputStyle}
                    />
                  </div>
                </div>

                <div style={fieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="signin-password" style={labelStyle}>Password *</label>
                    <span style={forgotLink}>Forgot password?</span>
                  </div>
                  <div
                    className="custom-auth-input"
                    style={inputBoxStyle}
                    onClick={(e) => {
                      if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                        document.getElementById('signin-password')?.focus();
                      }
                    }}
                  >
                    <Lock size={17} color="#94a3b8" />
                    <input
                      id="signin-password"
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      style={nativeInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      style={eyeButtonStyle}
                      title={showSignInPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignInPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                <div style={rememberRow}>
                  <label style={rememberLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...submitButtonStyle,
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to CASA'}</span>
                  <ArrowRight size={17} />
                </button>
              </form>

              <div style={footerRowStyle}>
                <span>New to CASA?</span>{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signup')}
                  style={switchTabButton}
                >
                  Create account here →
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: SIGN UP */
            <div>
              <form onSubmit={handleSignUpSubmit} style={formContainerStyle}>
                <div style={fieldGroup}>
                  <label htmlFor="signup-name" style={labelStyle}>Full Name *</label>
                  <div
                    className="custom-auth-input"
                    style={inputBoxStyle}
                    onClick={() => document.getElementById('signup-name')?.focus()}
                  >
                    <User size={17} color="#94a3b8" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      style={nativeInputStyle}
                    />
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label htmlFor="signup-email" style={labelStyle}>Email Address *</label>
                  <div
                    className="custom-auth-input"
                    style={inputBoxStyle}
                    onClick={() => document.getElementById('signup-email')?.focus()}
                  >
                    <Mail size={17} color="#94a3b8" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      placeholder="priya@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      style={nativeInputStyle}
                    />
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label htmlFor="signup-phone" style={labelStyle}>Mobile Number *</label>
                  <div
                    className="custom-auth-input"
                    style={inputBoxStyle}
                    onClick={() => document.getElementById('signup-phone')?.focus()}
                  >
                    <div style={phonePrefixBadge}>
                      <span style={{ fontSize: '1rem' }}>🇮🇳</span>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>+91</span>
                    </div>
                    <input
                      id="signup-phone"
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="9876543210"
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value.replace(/\D/g, ''))}
                      style={nativeInputStyle}
                    />
                  </div>
                </div>

                <div style={fieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="signup-password" style={labelStyle}>Create Password *</label>
                    {signUpPassword && (
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
                        document.getElementById('signup-password')?.focus();
                      }
                    }}
                  >
                    <Lock size={17} color="#94a3b8" />
                    <input
                      id="signup-password"
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      style={nativeInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      style={eyeButtonStyle}
                      title={showSignUpPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>

                  {signUpPassword && (
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

                <label style={termsCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer', marginTop: '2px' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    I agree to CASA's Terms of Service and Privacy Policy.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...submitButtonStyle,
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>{loading ? 'Creating Account...' : 'Agree & Create Account'}</span>
                  <ArrowRight size={17} />
                </button>
              </form>

              <div style={footerRowStyle}>
                <span>Already have an account?</span>{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signin')}
                  style={switchTabButton}
                >
                  Sign In here →
                </button>
              </div>
            </div>
          )}

          {/* Trust Guarantees Micro Strip */}
          <div className="auth-trust-strip" style={trustStripStyle}>
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
  padding: '40px 36px',
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
  marginBottom: '20px',
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s ease',
};

const formTitleStyle = {
  fontSize: '1.45rem',
  fontWeight: 900,
  color: '#0f172a',
  letterSpacing: '-0.025em',
  margin: 0,
};

const formSubtitleStyle = {
  fontSize: '0.825rem',
  color: '#64748b',
  marginTop: '4px',
  margin: '4px 0 0 0',
  lineHeight: 1.45,
};

const demoFillContainer = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '10px 12px',
  marginBottom: '16px',
};

const demoLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#475569',
  marginBottom: '8px',
};

const demoButtonsRow = {
  display: 'flex',
  gap: '8px',
};

const demoBtn = {
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: 700,
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const formContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
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
  padding: '9px 13px',
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

const forgotLink = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#2563eb',
  cursor: 'pointer',
};

const rememberRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '2px 0',
};

const rememberLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.78rem',
  color: '#64748b',
  cursor: 'pointer',
};

const termsCheckboxLabel = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  cursor: 'pointer',
  marginTop: '2px',
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
  fontSize: '0.88rem',
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
  marginTop: '14px',
  fontSize: '0.825rem',
  color: '#64748b',
};

const switchTabButton = {
  background: 'none',
  border: 'none',
  color: '#2563eb',
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
  marginLeft: '4px',
};

export default LoginPage;
