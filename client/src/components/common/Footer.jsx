import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Store,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const Footer = () => {
  const { storeName, storeTagline, supportPhone, supportEmail, primaryColor } = useStore();
  const [policyModal, setPolicyModal] = useState(null); // 'privacy' | 'terms' | null
  return (
    <footer style={footerWrapperStyle}>
      <style>{`
        .footer-features-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .footer-features-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .footer-features-container {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .footer-main-grid {
          padding: 48px 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .footer-main-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .footer-main-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
        }
      `}</style>
      {/* Value Propositions Bar */}
      <div style={featuresBarStyle}>
        <div className="container footer-features-container">
          <div style={featureBoxStyle}>
            <div style={featureIconBox}>
              <ShieldCheck size={24} color="#1d4ed8" />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>100% Genuine Products</strong>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Sourced directly from verified brands</p>
            </div>
          </div>

          <div style={featureBoxStyle}>
            <div style={featureIconBox}>
              <Truck size={24} color="#1d4ed8" />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Free Fast Shipping</strong>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>On all orders above ₹499 across India</p>
            </div>
          </div>

          <div style={featureBoxStyle}>
            <div style={featureIconBox}>
              <RotateCcw size={24} color="#1d4ed8" />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>7-Day Easy Returns</strong>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Hassle-free doorstep pickup & refunds</p>
            </div>
          </div>

          <div style={featureBoxStyle}>
            <div style={featureIconBox}>
              <Headphones size={24} color="#1d4ed8" />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>24/7 Dedicated Support</strong>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Instant assistance for all your orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container footer-main-grid">
        {/* Brand Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ ...footerLogoMark, background: primaryColor || '#1d4ed8' }}>
              {(storeName || 'C')[0]?.toUpperCase()}
            </div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>{storeName || 'CASA'}</span>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#93c5fa', fontWeight: 700, letterSpacing: '0.1em' }}>
                {storeTagline || 'INDIA MARKETPLACE'}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
            {storeName || 'CASA'} is an Indian multi-category online shopping destination offering authentic Sarees, designer Kurtis, Electronics, Footwear, Home essentials, and more.
          </p>
          <div style={contactListStyle}>
            <div style={contactItem}>
              <MapPin size={16} color="#60a5fa" />
              <span>Indiranagar, Bengaluru, Karnataka, 560038</span>
            </div>
            <div style={contactItem}>
              <Phone size={16} color="#60a5fa" />
              <span>{supportPhone || '+91 9876543210'}</span>
            </div>
            <div style={contactItem}>
              <Mail size={16} color="#60a5fa" />
              <span>{supportEmail || 'support@casa.in'}</span>
            </div>
          </div>
        </div>

        {/* Categories Column 1 */}
        <div style={footerColStyle}>
          <h4 style={footerColTitle}>Top Categories</h4>
          <ul style={footerListStyle}>
            <li><Link to="/category/womens-fashion" style={footerLink}>Women's Fashion & Sarees</Link></li>
            <li><Link to="/category/electronics" style={footerLink}>Electronics & Gadgets</Link></li>
            <li><Link to="/category/mens-fashion" style={footerLink}>Men's Fashion</Link></li>
            <li><Link to="/category/home-and-kitchen" style={footerLink}>Home & Kitchen</Link></li>
            <li><Link to="/category/footwear" style={footerLink}>Footwear</Link></li>
            <li><Link to="/category/beauty-and-personal-care" style={footerLink}>Beauty & Skincare</Link></li>
          </ul>
        </div>

        {/* Categories Column 2 */}
        <div style={footerColStyle}>
          <h4 style={footerColTitle}>More Collections</h4>
          <ul style={footerListStyle}>
            <li><Link to="/category/kids-and-baby" style={footerLink}>Kids & Baby Products</Link></li>
            <li><Link to="/category/grocery-and-daily-essentials" style={footerLink}>Grocery & Essentials</Link></li>
            <li><Link to="/category/sports-and-fitness" style={footerLink}>Sports & Fitness</Link></li>
            <li><Link to="/category/books-and-stationery" style={footerLink}>Books & Stationery</Link></li>
            <li><Link to="/category/furniture" style={footerLink}>Furniture</Link></li>
            <li><Link to="/category/watches-and-jewellery" style={footerLink}>Watches & Fine Jewellery</Link></li>
          </ul>
        </div>

        {/* Customer Care & Policies */}
        <div style={footerColStyle}>
          <h4 style={footerColTitle}>Customer Care & Support</h4>
          <ul style={footerListStyle}>
            <li>
              <Link to="/track-order" style={{ ...footerLink, color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>🚚 Track Your Order</span>
              </Link>
            </li>
            <li><Link to="/orders" style={footerLink}>My Order History</Link></li>
            <li><Link to="/profile" style={footerLink}>Manage Account & Addresses</Link></li>
            <li><Link to="/wishlist" style={footerLink}>My Wishlist</Link></li>
            <li>
              <button
                type="button"
                onClick={() => setPolicyModal('privacy')}
                style={{ ...footerLinkBtn }}
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setPolicyModal('terms')}
                style={{ ...footerLinkBtn }}
              >
                Terms & Conditions
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment Methods & Copyright */}
      <div style={bottomBarStyle}>
        <div className="container" style={bottomContainerStyle}>
          <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
            © {new Date().getFullYear()} CASA E-Commerce Marketplace. Handcrafted with modern MERN architecture for India.
          </div>
          <div style={paymentBadgesGroup}>
            <span style={payBadge}>Razorpay</span>
            <span style={payBadge}>UPI</span>
            <span style={payBadge}>Visa</span>
            <span style={payBadge}>Mastercard</span>
            <span style={payBadge}>RuPay</span>
            <span style={payBadge}>NetBanking</span>
            <span style={payBadge}>Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Legal & Policy Interactive Modal */}
      {policyModal && (
        <div
          onClick={() => setPolicyModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#1d4ed8" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {policyModal === 'privacy' ? 'CASA Privacy & Data Protection Policy' : 'CASA Terms & Conditions of Service'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', fontSize: '0.9rem', lineHeight: 1.7, color: '#334155' }}>
              {policyModal === 'privacy' ? (
                <>
                  <p><strong>1. Information Collection:</strong> At CASA, we value your privacy. We collect customer information including name, delivery addresses, phone number, and transaction identifiers solely to process and deliver your marketplace orders securely.</p>
                  <p><strong>2. Payment Security:</strong> CASA does NOT store your raw debit/credit card numbers or UPI MPINs. All digital transactions are processed through PCI-DSS Level 1 certified gateways (Razorpay) using AES-256 bank-grade encryption.</p>
                  <p><strong>3. Data Protection & Sharing:</strong> Your personal details are strictly shared with verified logistics and delivery partners solely for the purpose of shipping and package tracking. We never sell or rent your personal information to third-party advertisers.</p>
                  <p><strong>4. Cookie Usage:</strong> Session cookies are utilized solely to keep your authentication session intact, maintain your shopping cart items, and provide personalized language preferences.</p>
                  <p><strong>5. User Rights:</strong> You have full rights to inspect, update, or request deletion of your account and personal data at any time via your Account Profile.</p>
                </>
              ) : (
                <>
                  <p><strong>1. Acceptance of Terms:</strong> By accessing CASA or placing orders, you agree to comply with our commercial terms, buyer guarantees, and marketplace guidelines.</p>
                  <p><strong>2. Pricing & Catalog:</strong> All prices listed on CASA include applicable Goods and Services Tax (GST) within India. While we strive for 100% price accuracy, discrepancies caused by technological errors will be promptly resolved with order cancellation and full refund.</p>
                  <p><strong>3. Order Cancellation & Returns:</strong> Orders can be cancelled anytime before dispatch from the Order Detail dashboard. CASA provides a 7-day hassle-free return window on eligible consumer products for doorstep pickup and instant refund.</p>
                  <p><strong>4. Multi-Vendor Platform:</strong> Products are listed by certified regional Indian merchants and artisans. Each merchant undergoes GSTIN and KYC verification prior to listing products on CASA.</p>
                  <p><strong>5. Dispute Resolution:</strong> Any queries or disputes can be raised 24/7 with our customer care desk at {supportEmail || 'support@casa.in'} or {supportPhone || '+91 9876543210'}.</p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#f8fafc',
              }}
            >
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 22px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Close & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

const footerWrapperStyle = {
  background: '#0a192f',
  color: '#e2e8f0',
  marginTop: 'auto',
};

const featuresBarStyle = {
  background: '#ffffff',
  borderTop: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0',
  padding: '24px 0',
};

const featureBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const featureIconBox = {
  width: '46px',
  height: '46px',
  borderRadius: '10px',
  background: '#eff6ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const footerLogoMark = {
  width: '36px',
  height: '36px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  color: '#ffffff',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '1.25rem',
};

const contactListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '8px',
  fontSize: '0.825rem',
  color: '#94a3b8',
};

const contactItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const footerColStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const footerColTitle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: '#ffffff',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const footerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const footerLink = {
  fontSize: '0.85rem',
  color: '#94a3b8',
  textDecoration: 'none',
  transition: 'color 0.15s',
};

const footerLinkBtn = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: '0.85rem',
  color: '#94a3b8',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'color 0.15s',
  fontFamily: 'inherit',
};

const bottomBarStyle = {
  borderTop: '1px solid rgba(255,255,255,0.08)',
  padding: '16px 0',
  background: '#071222',
};

const bottomContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
};

const paymentBadgesGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexWrap: 'wrap',
};

const payBadge = {
  background: 'rgba(255,255,255,0.08)',
  color: '#cbd5e1',
  fontSize: '0.7rem',
  fontWeight: '700',
  padding: '4px 8px',
  borderRadius: '4px',
};

export default Footer;
