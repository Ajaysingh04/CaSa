import React from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const Footer = () => {
  const { storeName, storeTagline, supportPhone, supportEmail, primaryColor } = useStore();
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
          <h4 style={footerColTitle}>Customer Care</h4>
          <ul style={footerListStyle}>
            <li><Link to="/orders" style={footerLink}>Track Your Order</Link></li>
            <li><Link to="/profile" style={footerLink}>Manage Account & Addresses</Link></li>
            <li><Link to="/wishlist" style={footerLink}>My Wishlist</Link></li>
            <li><Link to="/products" style={footerLink}>Festival Deals & Coupons</Link></li>
            <li><span style={{ ...footerLink, color: '#64748b' }}>Privacy Policy</span></li>
            <li><span style={{ ...footerLink, color: '#64748b' }}>Terms & Conditions</span></li>
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
