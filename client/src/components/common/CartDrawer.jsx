import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  Lock,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { info, error } = useToast();
  const { items, totals, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();

  // Close on ESC key and prevent body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeDrawer();
      };
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleCheckoutClick = () => {
    if (!user) {
      closeDrawer();
      info('Please sign in to proceed with checkout.');
      navigate('/login?redirect=/checkout');
      return;
    }

    const isNonCustomer =
      user.role === 'vendor' ||
      user.role === 'delivery' ||
      user.role === 'delivery_partner' ||
      user.role === 'admin' ||
      user.role === 'super_admin' ||
      user.email === 'vendor@casa.in' ||
      user.email === 'delivery@casa.in' ||
      user.email === 'admin@casa.in';

    if (isNonCustomer) {
      closeDrawer();
      error(`Orders can only be placed from a Customer account. You are currently signed in as ${user.role || 'partner'}.`);
      return;
    }

    closeDrawer();
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    closeDrawer();
    navigate('/cart');
  };

  // Free delivery calculations
  const freeShippingThreshold = 499;
  const currentTotal = totals.itemsPrice || 0;
  const isFreeShipping = currentTotal >= freeShippingThreshold;
  const progressPercent = Math.min(100, Math.round((currentTotal / freeShippingThreshold) * 100));
  const remainingForFree = Math.max(0, freeShippingThreshold - currentTotal);

  // Total Savings Calculation
  const totalOriginalPrice = items.reduce((acc, item) => {
    const orig = item.product?.price || item.product?.discountPrice || 0;
    return acc + orig * item.quantity;
  }, 0);
  const totalSavings = Math.max(0, totalOriginalPrice - currentTotal);
  const totalSavingsPercent = totalOriginalPrice > 0 ? Math.round((totalSavings / totalOriginalPrice) * 100) : 0;

  return (
    <div style={overlayStyle}>
      {/* Dynamic Keyframes & CSS Animations */}
      <style>{`
        @keyframes cartDrawerSlide {
          0% {
            transform: translateX(100%);
            opacity: 0.6;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes backdropFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes itemEntrance {
          0% {
            transform: translateY(16px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes trashShake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-12deg) scale(1.1); color: #dc2626; }
          75% { transform: rotate(12deg) scale(1.1); color: #dc2626; }
        }

        @keyframes shimmerBtn {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        @keyframes pulseSuccess {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        .cart-item-card {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.25s ease, 
                      border-color 0.25s ease;
        }

        .cart-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -4px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1 !important;
        }

        .cart-trash-btn {
          transition: all 0.2s ease;
        }

        .cart-trash-btn:hover {
          color: #dc2626 !important;
          background: #fee2e2 !important;
          animation: trashShake 0.4s ease;
        }

        .checkout-shimmer-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
        }

        .checkout-shimmer-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          transform: skewX(-20deg);
          animation: shimmerBtn 2.5s infinite;
        }

        .checkout-shimmer-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -4px rgba(37, 99, 235, 0.45);
        }

        .close-cart-btn {
          transition: all 0.2s ease;
        }

        .close-cart-btn:hover {
          transform: rotate(90deg);
          background: #f1f5f9;
          color: #0f172a;
        }
      `}</style>

      {/* Backdrop */}
      <div style={backdropStyle} onClick={closeDrawer} />

      {/* Drawer Container */}
      <div style={drawerStyle}>
        {/* Header */}
        <div style={drawerHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={headerIconCircle}>
              <ShoppingBag size={20} color="#2563eb" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={headerTitleStyle}>Shopping Cart</h3>
                <span style={itemCountBadge}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div style={headerSubtext}>
                <Truck size={12} color="#16a34a" />
                <span>Fast & Reliable India Delivery</span>
              </div>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            style={closeBtnStyle}
            className="close-cart-btn"
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gamified Free Delivery Progress Bar */}
        <div style={deliveryProgressBox}>
          <div style={deliveryProgressHeader}>
            {isFreeShipping ? (
              <span style={{ color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                🎉 You've Unlocked <strong>FREE Express Delivery!</strong>
              </span>
            ) : (
              <span style={{ color: '#1e40af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} color="#2563eb" />
                Add <strong>{formatINR(remainingForFree)}</strong> more for <strong>FREE Delivery</strong>
              </span>
            )}
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isFreeShipping ? '#16a34a' : '#2563eb' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div style={progressTrackStyle}>
            <div
              style={{
                ...progressBarStyle,
                width: `${progressPercent}%`,
                background: isFreeShipping
                  ? 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)'
                  : 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
              }}
            />
          </div>
        </div>

        {/* Savings Announcement Banner (if any savings) */}
        {totalSavings > 0 && (
          <div style={savingsBannerStyle}>
            <Sparkles size={15} color="#ea580c" />
            <span>
              Congratulations! You are saving <strong>{formatINR(totalSavings)}</strong> ({totalSavingsPercent}% OFF) on this order!
            </span>
          </div>
        )}

        {/* Items List */}
        <div style={itemsListStyle}>
          {items.length === 0 ? (
            <div style={emptyCartStyle}>
              <div style={emptyIconCircle}>
                <ShoppingBag size={42} color="#94a3b8" />
              </div>
              <h4 style={{ fontWeight: 800, color: '#0f172a', marginTop: '14px', fontSize: '1.1rem' }}>
                Your CASA Cart is empty
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '280px', marginTop: '6px' }}>
                Explore trending gadgets, sarees, footwear, and festive deals!
              </p>
              <Link
                to="/products"
                onClick={closeDrawer}
                className="btn btn-primary"
                style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '10px', fontSize: '0.875rem' }}
              >
                Start Shopping Now
              </Link>
            </div>
          ) : (
            items.map((item, idx) => {
              const product = item.product || {};
              const unitPrice = product.discountPrice || product.price || 0;
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;
              const itemDiscountPct = hasDiscount
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;

              return (
                <div
                  key={item._id}
                  className="cart-item-card"
                  style={{
                    ...cartItemCardStyle,
                    animation: `itemEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`,
                    animationDelay: `${idx * 60}ms`,
                  }}
                >
                  {/* Product Image Thumbnail */}
                  <Link
                    to={`/product/${product.slug || product._id}`}
                    onClick={closeDrawer}
                    style={imgWrapperStyle}
                  >
                    <img
                      src={product.images?.[0] || product.image || 'https://placehold.co/100'}
                      alt={product.name}
                      style={cartItemImg}
                    />
                    {hasDiscount && (
                      <span style={imgDiscountBadge}>
                        {itemDiscountPct}% OFF
                      </span>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        onClick={closeDrawer}
                        style={itemNameStyle}
                        title={product.name}
                      >
                        {product.name}
                      </Link>

                      {/* Trash Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="cart-trash-btn"
                        style={removeBtnStyle}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Variant Badge */}
                    {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                      <div style={variantBadgeStyle}>
                        <Tag size={10} color="#475569" />
                        <span>
                          {Object.entries(item.selectedVariant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </span>
                      </div>
                    )}

                    {/* Price & Savings Row */}
                    <div style={priceRowStyle}>
                      <span style={currentPriceStyle}>
                        {formatINR(unitPrice)}
                      </span>
                      {hasDiscount && (
                        <span style={originalPriceStyle}>
                          {formatINR(product.price)}
                        </span>
                      )}
                      {hasDiscount && (
                        <span style={saveTagStyle}>
                          Save {formatINR(product.price - product.discountPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper & Stock Tag */}
                    <div style={qtyRowStyle}>
                      <div style={qtyBoxStyle}>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          style={{
                            ...qtyBtnStyle,
                            opacity: item.quantity <= 1 ? 0.4 : 1,
                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          }}
                          disabled={item.quantity <= 1}
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span style={qtyTextStyle}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          style={{
                            ...qtyBtnStyle,
                            opacity: item.quantity >= (product.stock || 99) ? 0.4 : 1,
                            cursor: item.quantity >= (product.stock || 99) ? 'not-allowed' : 'pointer',
                          }}
                          disabled={item.quantity >= (product.stock || 99)}
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <span style={subtotalItemText}>
                        Total: <strong>{formatINR(unitPrice * item.quantity)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & High-Conversion CTA */}
        {items.length > 0 && (
          <div style={drawerFooterStyle}>
            {/* Price Breakdown */}
            <div style={summaryRowsContainer}>
              <div style={summaryRowStyle}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Items Subtotal</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {formatINR(currentTotal)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div style={summaryRowStyle}>
                  <span style={{ color: '#16a34a', fontSize: '0.825rem', fontWeight: 600 }}>Total Discount Savings</span>
                  <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
                    - {formatINR(totalSavings)}
                  </span>
                </div>
              )}

              <div style={summaryRowStyle}>
                <span style={{ color: '#64748b', fontSize: '0.825rem' }}>Estimated Delivery</span>
                <span style={{ fontWeight: 700, fontSize: '0.825rem', color: isFreeShipping ? '#16a34a' : '#0f172a' }}>
                  {isFreeShipping ? 'FREE' : formatINR(49)}
                </span>
              </div>

              <div style={dividerFooter} />

              <div style={{ ...summaryRowStyle, marginBottom: 0 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>Estimated Total</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Inclusive of all taxes</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.35rem', color: '#1d4ed8' }}>
                    {formatINR(totals.totalPrice || currentTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={actionButtonGroup}>
              <button
                onClick={handleViewCartClick}
                className="btn btn-outline"
                style={viewCartBtnStyle}
              >
                View Full Cart
              </button>
              <button
                onClick={handleCheckoutClick}
                className="btn btn-primary checkout-shimmer-btn"
                style={checkoutBtnStyle}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Trust Badges */}
            <div style={trustBadgesRow}>
              <div style={trustItem}>
                <ShieldCheck size={14} color="#16a34a" />
                <span>100% Genuine</span>
              </div>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <div style={trustItem}>
                <Truck size={14} color="#2563eb" />
                <span>Express Dispatch</span>
              </div>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <div style={trustItem}>
                <Lock size={14} color="#0f172a" />
                <span>256-Bit SSL</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Styles */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'flex-end',
};

const backdropStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(6px)',
  animation: 'backdropFadeIn 0.3s ease-out',
};

const drawerStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '460px',
  height: '100%',
  background: '#ffffff',
  boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1,
  animation: 'cartDrawerSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
};

const drawerHeaderStyle = {
  padding: '18px 20px',
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#ffffff',
  flexShrink: 0,
};

const headerIconCircle = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: '#eff6ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const headerTitleStyle = {
  fontSize: '1.15rem',
  fontWeight: '800',
  color: '#0f172a',
  margin: 0,
  letterSpacing: '-0.015em',
};

const itemCountBadge = {
  background: '#eff6ff',
  color: '#2563eb',
  fontSize: '0.72rem',
  fontWeight: 800,
  padding: '2px 8px',
  borderRadius: '9999px',
  border: '1px solid #bfdbfe',
};

const headerSubtext = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.72rem',
  color: '#64748b',
  marginTop: '2px',
  fontWeight: 600,
};

const closeBtnStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: 'none',
  background: '#f8fafc',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const deliveryProgressBox = {
  padding: '12px 20px',
  background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
  borderBottom: '1px solid #e2e8f0',
  flexShrink: 0,
};

const deliveryProgressHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.78rem',
  marginBottom: '8px',
};

const progressTrackStyle = {
  width: '100%',
  height: '7px',
  borderRadius: '9999px',
  background: '#e2e8f0',
  overflow: 'hidden',
};

const progressBarStyle = {
  height: '100%',
  borderRadius: '9999px',
  transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
};

const savingsBannerStyle = {
  padding: '8px 20px',
  background: '#fff7ed',
  borderBottom: '1px solid #ffedd5',
  color: '#c2410c',
  fontSize: '0.76rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
};

const itemsListStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const emptyCartStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  textAlign: 'center',
  margin: 'auto 0',
};

const emptyIconCircle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: '#f8fafc',
  border: '2px dashed #cbd5e1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cartItemCardStyle = {
  display: 'flex',
  gap: '14px',
  padding: '14px',
  background: '#ffffff',
  borderRadius: '14px',
  border: '1.5px solid #f1f5f9',
};

const imgWrapperStyle = {
  position: 'relative',
  width: '82px',
  height: '82px',
  borderRadius: '12px',
  overflow: 'hidden',
  flexShrink: 0,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  display: 'block',
};

const cartItemImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const imgDiscountBadge = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(220, 38, 38, 0.9)',
  color: '#ffffff',
  fontSize: '0.62rem',
  fontWeight: 800,
  textAlign: 'center',
  padding: '1px 0',
  letterSpacing: '0.02em',
};

const itemNameStyle = {
  fontSize: '0.88rem',
  fontWeight: 700,
  color: '#0f172a',
  textDecoration: 'none',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.35,
};

const variantBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#f1f5f9',
  color: '#475569',
  padding: '2px 8px',
  borderRadius: '6px',
  fontSize: '0.7rem',
  fontWeight: 600,
  marginTop: '5px',
};

const priceRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '6px',
  flexWrap: 'wrap',
};

const currentPriceStyle = {
  fontSize: '1rem',
  fontWeight: 800,
  color: '#0f172a',
};

const originalPriceStyle = {
  textDecoration: 'line-through',
  color: '#94a3b8',
  fontSize: '0.8rem',
  fontWeight: 500,
};

const saveTagStyle = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#16a34a',
  background: '#f0fdf4',
  padding: '1px 6px',
  borderRadius: '4px',
};

const qtyRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '10px',
};

const qtyBoxStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  background: '#f8fafc',
  overflow: 'hidden',
};

const qtyBtnStyle = {
  width: '28px',
  height: '28px',
  border: 'none',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#334155',
  transition: 'background 0.15s',
};

const qtyTextStyle = {
  width: '28px',
  textAlign: 'center',
  fontSize: '0.85rem',
  fontWeight: 800,
  color: '#0f172a',
};

const subtotalItemText = {
  fontSize: '0.78rem',
  color: '#64748b',
};

const removeBtnStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  border: 'none',
  background: '#f8fafc',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const drawerFooterStyle = {
  padding: '18px 20px',
  borderTop: '1px solid #e2e8f0',
  background: '#ffffff',
  boxShadow: '0 -10px 25px -5px rgba(15, 23, 42, 0.06)',
  flexShrink: 0,
};

const summaryRowsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '14px',
};

const summaryRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const dividerFooter = {
  height: '1px',
  background: '#f1f5f9',
  margin: '6px 0',
};

const actionButtonGroup = {
  display: 'flex',
  gap: '10px',
  marginBottom: '12px',
};

const viewCartBtnStyle = {
  flex: 1,
  padding: '12px 14px',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.875rem',
  textAlign: 'center',
};

const checkoutBtnStyle = {
  flex: 1.6,
  padding: '12px 16px',
  borderRadius: '12px',
  fontWeight: 800,
  fontSize: '0.9rem',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
};

const trustBadgesRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  paddingTop: '6px',
};

const trustItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: '#64748b',
};

export default CartDrawer;
