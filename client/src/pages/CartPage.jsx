import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { info, error } = useToast();
  const {
    items,
    totals,
    coupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setApplying(true);

    const res = await applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
    setApplying(false);
  };

  const handleQuickApply = (code) => {
    setCouponInput(code);
    applyCoupon(code);
  };

  if (items.length === 0) {
    return (
      <div className="container" style={emptyWrapper}>
        <ShoppingBag size={64} color="#94a3b8" />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '16px' }}>
          Your CASA Cart is Empty
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '420px', marginTop: '8px' }}>
          Looks like you haven't added anything to your cart yet. Explore thousands of authentic products across our 15 departments!
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Shopping Deals
          </Link>
          <Link to="/orders" className="btn btn-outline btn-lg">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 16px 60px' }}>
      <style>{`
        .cart-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .cart-layout-grid {
            grid-template-columns: 2fr 1fr;
          }
        }
        @media (max-width: 640px) {
          .cart-item-row-responsive {
            gap: 12px !important;
          }
          .cart-item-img-responsive {
            width: 72px !important;
            height: 72px !important;
          }
          .cart-title-responsive {
            font-size: 1.35rem !important;
          }
        }
      `}</style>
      <h1 className="cart-title-responsive" style={cartTitleStyle}>Shopping Cart ({items.length} items)</h1>

      <div className="cart-layout-grid">
        {/* Left: Cart Items List */}
        <div style={cartItemsColumn}>
          {/* Free Shipping Alert Banner */}
          <div style={freeShippingNotice}>
            <Truck size={18} color="#1d4ed8" />
            {totals.itemsPrice >= 499 ? (
              <span style={{ color: '#059669', fontWeight: 600 }}>
                You have unlocked <strong>FREE Delivery</strong> for this order!
              </span>
            ) : (
              <span>
                Add <strong>{formatINR(499 - totals.itemsPrice)}</strong> more of eligible items to get <strong>FREE Delivery</strong>
              </span>
            )}
          </div>

          <div style={itemsContainerCard}>
            {items.map((item) => {
              const product = item.product;
              const unitPrice = product.discountPrice || product.price;

              return (
                <div key={item._id} className="cart-item-row-responsive" style={cartItemRow}>
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="cart-item-img-responsive"
                      style={itemImgStyle}
                    />
                  </Link>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <span style={itemBrandStyle}>{product.brand}</span>
                        <Link to={`/product/${product.slug}`} style={itemTitleLink}>
                          <h3 style={itemTitleStyle}>{product.name}</h3>
                        </Link>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        style={deleteBtnStyle}
                        title="Remove from cart"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Variant badge */}
                    {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                      <div style={variantTagStyle}>
                        {Object.entries(item.selectedVariant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' | ')}
                      </div>
                    )}

                    {/* Price & Quantity Selector */}
                    <div style={priceAndQtyRow}>
                      <div style={itemPriceGroup}>
                        <span style={unitPriceStyle}>{formatINR(unitPrice)}</span>
                        {product.discountPrice && (
                          <span style={originalPriceStyle}>{formatINR(product.price)}</span>
                        )}
                      </div>

                      <div style={qtySelector}>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={qtyBtn}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={qtyValue}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          style={qtyBtn}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={subtotalGroup}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Item Total:</span>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                          {formatINR(unitPrice * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px' }}>
            <Link to="/products" style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div style={summaryColumn}>
          {/* Coupon Code Card */}
          <div style={summaryCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Tag size={18} color="#1d4ed8" />
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                Apply Promo / Coupon Code
              </strong>
            </div>

            {coupon ? (
              <div style={appliedCouponBox}>
                <div>
                  <div style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={16} /> Coupon '{coupon.code}' Applied!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    {coupon.description || `Discount: ${formatINR(totals.discountPrice)}`}
                  </div>
                </div>
                <button onClick={removeCoupon} style={removeCouponBtn}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={couponForm}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  style={couponInputStyle}
                />
                <button
                  type="submit"
                  disabled={applying || !couponInput.trim()}
                  className="btn btn-secondary btn-sm"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px' }}>
                {couponError}
              </div>
            )}

            {/* Quick Suggestions */}
            {!coupon && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Available Coupons:
                </span>
                <div style={quickCouponsRow}>
                  <button onClick={() => handleQuickApply('CASA200')} style={quickCouponChip}>
                    CASA200 (₹200 Off)
                  </button>
                  <button onClick={() => handleQuickApply('FESTIVE15')} style={quickCouponChip}>
                    FESTIVE15 (15% Off)
                  </button>
                  <button onClick={() => handleQuickApply('WELCOME10')} style={quickCouponChip}>
                    WELCOME10 (10% Off)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div style={summaryCard}>
            <h3 style={summaryTitle}>Order Summary</h3>

            <div style={summaryRowsList}>
              <div style={summaryRow}>
                <span style={{ color: '#475569' }}>Items Subtotal</span>
                <span>{formatINR(totals.itemsPrice)}</span>
              </div>

              <div style={summaryRow}>
                <span style={{ color: '#475569' }}>Delivery Fee</span>
                <span>
                  {totals.shippingPrice === 0 ? (
                    <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
                  ) : (
                    formatINR(totals.shippingPrice)
                  )}
                </span>
              </div>

              {totals.discountPrice > 0 && (
                <div style={{ ...summaryRow, color: '#059669', fontWeight: 600 }}>
                  <span>Coupon Discount</span>
                  <span>- {formatINR(totals.discountPrice)}</span>
                </div>
              )}

              <div style={{ ...summaryRow, borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '6px' }}>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Total Amount</strong>
                <strong style={{ fontSize: '1.25rem', color: '#1d4ed8' }}>
                  {formatINR(totals.totalPrice)}
                </strong>
              </div>
            </div>

            {/* Non-customer account alert */}
            {user && user.email !== 'rajesh@casa.in' && (
              user.role === 'vendor' ||
              user.role === 'delivery' ||
              user.role === 'delivery_partner' ||
              user.role === 'admin' ||
              user.role === 'super_admin' ||
              user.email === 'vendor@casa.in' ||
              user.email === 'delivery@casa.in' ||
              user.email === 'admin@casa.in'
            ) && (
              <div
                style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '10px',
                  padding: '12px',
                  marginTop: '16px',
                  fontSize: '0.82rem',
                  color: '#9f1239',
                  lineHeight: 1.4
                }}
              >
                <strong>⚠️ Customer Login Required:</strong> You are currently signed in with a {user.role || 'partner'} account ({user.email}). Orders can only be placed from Customer accounts.
              </div>
            )}

            <button
              onClick={() => {
                if (!user) {
                  info('Please sign in to proceed with checkout.');
                  navigate('/login?redirect=/checkout');
                  return;
                }

                const isNonCustomer =
                  user.email !== 'rajesh@casa.in' && (
                    user.role === 'vendor' ||
                    user.role === 'delivery' ||
                    user.role === 'delivery_partner' ||
                    user.role === 'admin' ||
                    user.role === 'super_admin' ||
                    user.email === 'vendor@casa.in' ||
                    user.email === 'delivery@casa.in' ||
                    user.email === 'admin@casa.in'
                  );

                if (isNonCustomer) {
                  error(`Orders can only be placed from a Customer account. You are currently signed in as ${user.role || 'partner'}.`);
                  return;
                }

                navigate('/checkout');
              }}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '20px' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={secureGuaranteeRow}>
              <ShieldCheck size={18} color="#059669" />
              <span>Safe & Secure 256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const emptyWrapper = {
  padding: '80px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

const cartTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  color: '#0f172a',
  letterSpacing: '-0.02em',
  marginBottom: '20px',
};

const cartLayoutGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
};


const cartItemsColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const freeShippingNotice = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  background: '#eff6ff',
  borderRadius: '10px',
  border: '1px solid #bfdbfe',
  fontSize: '0.85rem',
  color: '#1e40af',
};

const itemsContainerCard = {
  background: '#ffffff',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  padding: '16px 20px',
};

const cartItemRow = {
  display: 'flex',
  gap: '16px',
  padding: '16px 0',
  borderBottom: '1px solid #f1f5f9',
};

const itemImgStyle = {
  width: '90px',
  height: '90px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const itemBrandStyle = {
  fontSize: '0.72rem',
  fontWeight: '700',
  color: '#1d4ed8',
  textTransform: 'uppercase',
  display: 'block',
};

const itemTitleLink = {
  textDecoration: 'none',
  color: 'inherit',
};

const itemTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#0f172a',
  lineHeight: 1.3,
  marginTop: '2px',
};

const deleteBtnStyle = {
  color: '#94a3b8',
  padding: '6px',
  cursor: 'pointer',
  transition: 'color 0.15s',
};

const variantTagStyle = {
  display: 'inline-block',
  background: '#f1f5f9',
  color: '#475569',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  marginTop: '6px',
};

const priceAndQtyRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '12px',
};

const itemPriceGroup = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
};

const unitPriceStyle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#0f172a',
};

const originalPriceStyle = {
  fontSize: '0.85rem',
  color: '#94a3b8',
  textDecoration: 'line-through',
};

const qtySelector = {
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  background: '#f8fafc',
};

const qtyBtn = {
  padding: '4px 10px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#0f172a',
};

const qtyValue = {
  padding: '0 10px',
  fontSize: '0.9rem',
  fontWeight: 700,
};

const subtotalGroup = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
};

const summaryColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const summaryCard = {
  background: '#ffffff',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  padding: '20px',
};

const couponForm = {
  display: 'flex',
  gap: '8px',
};

const couponInputStyle = {
  flex: 1,
  padding: '8px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  fontWeight: '600',
};

const appliedCouponBox = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  background: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
};

const removeCouponBtn = {
  color: '#dc2626',
  padding: '4px',
  cursor: 'pointer',
};

const quickCouponsRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  marginTop: '6px',
};

const quickCouponChip = {
  fontSize: '0.72rem',
  fontWeight: '700',
  color: '#1d4ed8',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  padding: '3px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
};

const summaryTitle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#0f172a',
  marginBottom: '16px',
};

const summaryRowsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const summaryRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.925rem',
};

const secureGuaranteeRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontSize: '0.78rem',
  color: '#64748b',
  marginTop: '16px',
};

export default CartPage;
