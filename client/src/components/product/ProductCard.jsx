import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Star, Edit3 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, calculateDiscount } from '../../utils/formatters';

const CATEGORY_FALLBACK_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  'womens-fashion': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  'mens-fashion': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
  'home-and-kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  'beauty-and-personal-care': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  'grocery-and-daily-essentials': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  'sports-and-fitness': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
};

const getFallbackImage = (categorySlug) => CATEGORY_FALLBACK_IMAGES[categorySlug] || CATEGORY_FALLBACK_IMAGES.default;

const ProductCard = ({ product: initialProduct }) => {
  const { isSuperAdmin } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(initialProduct);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setProduct(initialProduct);
    setIsDeleted(false);
  }, [initialProduct]);

  useEffect(() => {
    const onUpdated = (e) => {
      if (e.detail && product && (e.detail._id === product._id || e.detail.slug === product.slug)) {
        setProduct((prev) => ({ ...prev, ...e.detail }));
      }
    };
    const onDeleted = (e) => {
      if (e.detail && product && (e.detail === product._id || e.detail === product.slug)) {
        setIsDeleted(true);
      }
    };
    window.addEventListener('casa:product-updated', onUpdated);
    window.addEventListener('casa:product-deleted', onDeleted);
    return () => {
      window.removeEventListener('casa:product-updated', onUpdated);
      window.removeEventListener('casa:product-deleted', onDeleted);
    };
  }, [product?._id, product?.slug]);

  if (!product || isDeleted) return null;

  const inWishlist = isInWishlist(product._id);
  const discountPercent = calculateDiscount(product.price, product.discountPrice);
  const finalPrice = product.discountPrice || product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    const defaultVariant = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          defaultVariant[v.name] = v.options[0];
        }
      });
    }

    await addItem(product, 1, defaultVariant);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div style={cardWrapperStyle} className="card card-hover-interactive">
      <style>{`
        @media (max-width: 640px) {
          .card-img-wrap {
            height: 180px !important;
          }
          .card-content-wrap {
            padding: 10px 12px !important;
          }
          .card-title-text {
            font-size: 0.82rem !important;
            height: 2.3em !important;
          }
          .card-price-text {
            font-size: 0.92rem !important;
          }
          .card-add-btn {
            padding: 5px 9px !important;
            font-size: 0.72rem !important;
          }
        }
      `}</style>
      {/* Top Image Container */}
      <Link to={`/product/${product.slug}`} className="card-img-wrap" style={imageContainerStyle}>
        <img
          src={product.images?.[0] || getFallbackImage(product.categorySlug)}
          alt={product.name}
          className="card-img-zoom"
          style={imageStyle}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getFallbackImage(product.categorySlug);
          }}
        />

        {/* Badges Overlay */}
        <div style={badgesContainerStyle}>
          {product.isBestSeller && (
            <span style={topItemBadge} className="badge-animated-pulse">
              ★ Top Pick
            </span>
          )}
          {discountPercent > 0 && (
            <span style={discountBadgeStyle} className="badge-animated-pulse">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Super Admin Instant Live Edit Button */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('casa:open-product-editor', { detail: product }));
            }}
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              zIndex: 15,
              background: '#0f172a',
              color: '#f59e0b',
              border: '1.5px solid #f59e0b',
              padding: '4px 9px',
              borderRadius: '7px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)',
            }}
            title="Super Admin: Edit this product live on store"
          >
            <Edit3 size={12} color="#f59e0b" />
            <span>Edit</span>
          </button>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="wishlist-heart-btn"
          style={wishlistBtnStyle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            color={inWishlist ? '#ef4444' : '#64748b'}
            fill={inWishlist ? '#ef4444' : 'none'}
          />
        </button>
      </Link>

      {/* Content Details */}
      <div className="card-content-wrap" style={contentStyle}>
        {/* Brand & Subcategory */}
        <div style={brandRowStyle}>
          <span style={brandTextStyle}>{product.brand}</span>
          {product.subcategory && (
            <span style={subcategoryTextStyle}>• {product.subcategory}</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`} style={titleLinkStyle}>
          <h3 className="card-title-text" style={titleStyle} title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars */}
        <div style={ratingRowStyle}>
          <div style={starBox}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
              {product.rating?.toFixed(1) || '4.5'}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            ({product.numReviews || 38})
          </span>
        </div>

        {/* Price & Add to Cart Action Row */}
        <div style={priceAndActionRow}>
          <div style={priceBox}>
            <span className="card-price-text" style={currentPriceStyle}>
              {formatINR(finalPrice)}
            </span>
            {product.discountPrice && (
              <span style={originalPriceStyle}>
                {formatINR(product.price)}
              </span>
            )}
          </div>

          {/* Quick Add Pill Button (MLC / Storexio Style) */}
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="card-add-btn card-quick-add-btn"
              style={{
                ...cartPillBtn,
                background: justAdded ? '#10b981' : '#eff6ff',
                color: justAdded ? '#ffffff' : '#2563eb',
                borderColor: justAdded ? '#10b981' : '#dbeafe',
              }}
              title="Add to cart"
            >
              {justAdded ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : (
                <>
                  <ShoppingCart size={14} /> Add
                </>
              )}
            </button>
          ) : (
            <span style={outOfStockChip}>
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* Styles */
const cardWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  background: '#ffffff',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1.5px solid #f1f5f9',
  boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.05)',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const imageContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '240px',
  background: '#f8fafc',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
};

const badgesContainerStyle = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  zIndex: 2,
};

const topItemBadge = {
  background: '#fef3c7',
  color: '#b45309',
  fontSize: '0.65rem',
  fontWeight: '800',
  padding: '3px 8px',
  borderRadius: '9999px',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
};

const discountBadgeStyle = {
  background: '#fee2e2',
  color: '#dc2626',
  fontSize: '0.65rem',
  fontWeight: '800',
  padding: '3px 8px',
  borderRadius: '9999px',
  letterSpacing: '0.02em',
};

const wishlistBtnStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(6px)',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 3,
  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.08)',
  transition: 'transform 0.2s',
};

const contentStyle = {
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const brandRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '4px',
};

const brandTextStyle = {
  fontSize: '0.72rem',
  fontWeight: '700',
  color: '#2563eb',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const subcategoryTextStyle = {
  fontSize: '0.72rem',
  color: '#94a3b8',
};

const titleLinkStyle = {
  textDecoration: 'none',
};

const titleStyle = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#0f172a',
  lineHeight: '1.35',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  height: '2.4em',
  marginBottom: '8px',
};

const ratingRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '12px',
};

const starBox = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  background: '#fef3c7',
  padding: '2px 6px',
  borderRadius: '6px',
};

const priceAndActionRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 'auto',
  paddingTop: '8px',
  borderTop: '1px solid #f8fafc',
};

const priceBox = {
  display: 'flex',
  flexDirection: 'column',
};

const currentPriceStyle = {
  fontSize: '1rem',
  fontWeight: '800',
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const originalPriceStyle = {
  fontSize: '0.75rem',
  color: '#94a3b8',
  textDecoration: 'line-through',
};

const cartPillBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '6px 14px',
  borderRadius: '9999px',
  border: '1.5px solid #dbeafe',
  fontSize: '0.775rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const outOfStockChip = {
  fontSize: '0.72rem',
  fontWeight: '700',
  color: '#94a3b8',
  background: '#f1f5f9',
  padding: '4px 10px',
  borderRadius: '9999px',
};

export default ProductCard;
