import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/common/RatingStars';
import { formatINR } from '../utils/formatters';

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = async (product) => {
    await addItem(product, 1);
    toggleWishlist(product);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container" style={emptyWrapper}>
        <div style={emptyHeartCircle}>
          <Heart size={44} color="#94a3b8" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '16px' }}>
          Your Wishlist is Empty
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '380px', marginTop: '6px' }}>
          Save items you love by tapping the heart icon on any product card, and find them here anytime!
        </p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Explore Trending Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            My Wishlist ({wishlistItems.length})
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Products saved for later consideration
          </p>
        </div>
      </div>

      <div className="grid-products">
        {wishlistItems.map((product) => (
          <div key={product._id} style={cardWrapper} className="card">
            <Link to={`/product/${product.slug}`} style={imgWrapper}>
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                alt={product.name}
                style={imgStyle}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product);
                }}
                style={removeBtn}
                title="Remove from wishlist"
              >
                <Trash2 size={16} color="#ef4444" />
              </button>
            </Link>

            <div style={cardContent}>
              <span style={brandText}>{product.brand}</span>
              <Link to={`/product/${product.slug}`} style={titleLink}>
                <h3 style={titleText}>{product.name}</h3>
              </Link>

              <RatingStars rating={product.rating} numReviews={product.numReviews} size={13} />

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatINR(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatINR(product.price)}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleMoveToCart(product)}
                disabled={product.stock === 0}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                <ShoppingCart size={15} /> Move to Cart
              </button>
            </div>
          </div>
        ))}
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

const emptyHeartCircle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardWrapper = {
  display: 'flex',
  flexDirection: 'column',
  background: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
};

const imgWrapper = {
  position: 'relative',
  paddingTop: '90%',
  background: '#f8fafc',
  overflow: 'hidden',
};

const imgStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const removeBtn = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
};

const cardContent = {
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const brandText = {
  fontSize: '0.72rem',
  fontWeight: '700',
  color: '#1d4ed8',
  textTransform: 'uppercase',
};

const titleLink = {
  textDecoration: 'none',
  color: 'inherit',
};

const titleText = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#0f172a',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.3,
  margin: '4px 0 6px',
};

export default WishlistPage;
