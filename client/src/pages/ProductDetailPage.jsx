import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  Check,
  Star,
  Share2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Breadcrumbs from '../components/common/Breadcrumbs';
import RatingStars from '../components/common/RatingStars';
import ProductCard from '../components/product/ProductCard';
import { formatINR, calculateDiscount, formatDate } from '../utils/formatters';
import { PIN_CODES_DATA } from '../utils/constants';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Delivery check state
  const [pincode, setPincode] = useState('560038');
  const [deliveryResult, setDeliveryResult] = useState(PIN_CODES_DATA['560038']);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProduct(slug);
        const prod = res.data;
        setProduct(prod);
        setSelectedImage(prod.images?.[0] || '');

        // Set default variants
        const defaultVars = {};
        if (prod.variants && prod.variants.length > 0) {
          prod.variants.forEach((v) => {
            if (v.options?.length > 0) {
              defaultVars[v.name] = v.options[0];
            }
          });
        }
        setSelectedVariants(defaultVars);
        setQuantity(1);

        // Fetch related products
        if (prod.categorySlug) {
          const relatedRes = await productService.getProducts({
            category: prod.categorySlug,
            limit: 5,
          });
          setRelatedProducts(
            (relatedRes.data || []).filter((p) => p._id !== prod._id).slice(0, 4)
          );
        }

        // Save to recently viewed
        try {
          const recents = JSON.parse(localStorage.getItem('casa_recently_viewed') || '[]');
          const filtered = recents.filter((p) => p._id !== prod._id);
          filtered.unshift({
            _id: prod._id,
            name: prod.name,
            slug: prod.slug,
            brand: prod.brand,
            images: prod.images,
            price: prod.price,
            discountPrice: prod.discountPrice,
            rating: prod.rating,
            numReviews: prod.numReviews,
            stock: prod.stock,
          });
          localStorage.setItem('casa_recently_viewed', JSON.stringify(filtered.slice(0, 10)));
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="skeleton" style={{ height: '480px', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ width: '40%', height: '20px' }} />
            <div className="skeleton" style={{ width: '90%', height: '36px' }} />
            <div className="skeleton" style={{ width: '50%', height: '32px' }} />
            <div className="skeleton" style={{ height: '100px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          The product you are looking for might have been moved or is no longer available.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Browse All Products
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const discountPercent = calculateDiscount(product.price, product.discountPrice);
  const finalPrice = product.discountPrice || product.price;

  const handleVariantSelect = (variantName, option) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addItem(product, quantity, selectedVariants);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (!user) {
      info('Please sign in to place an order.');
      await addItem(product, quantity, selectedVariants);
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
      error(`Orders can only be placed from a Customer account. You are currently logged in with a ${user.role || 'partner'} account.`);
      return;
    }

    await addItem(product, quantity, selectedVariants);
    navigate('/checkout');
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      error('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    const match = PIN_CODES_DATA[pincode];
    if (match) {
      setDeliveryResult(match);
    } else {
      setDeliveryResult({
        city: 'Verified Location',
        days: '3-4 Business Days',
        free: true,
      });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      info('Please sign in to submit your product review.');
      navigate('/login');
      return;
    }

    if (!reviewTitle.trim() || !reviewComment.trim()) {
      error('Please provide a title and detailed comment for your review.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await productService.addReview(product._id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      success('Thank you! Your review has been submitted.');
      // Refresh reviews in state
      setProduct((prev) => ({
        ...prev,
        reviews: [res.data, ...(prev.reviews || [])],
        numReviews: (prev.numReviews || 0) + 1,
      }));
      setReviewTitle('');
      setReviewComment('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const breadcrumbs = [
    { label: product.categorySlug ? product.categorySlug.replace('-', ' ') : 'Products', link: `/category/${product.categorySlug}` },
    { label: product.subcategory || 'Item', link: `/category/${product.categorySlug}?subcategory=${encodeURIComponent(product.subcategory)}` },
    { label: product.name },
  ];

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <style>{`
        .pdp-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-top: 16px;
        }
        @media (min-width: 1024px) {
          .pdp-main-grid {
            grid-template-columns: 1.1fr 1.3fr;
            gap: 36px;
          }
        }
        @media (max-width: 640px) {
          .pdp-cta-group {
            flex-direction: column !important;
          }
          .pdp-title {
            font-size: 1.35rem !important;
          }
        }
      `}</style>
      <Breadcrumbs items={breadcrumbs} />

      {/* Main Product Layout */}
      <div className="pdp-main-grid">
        {/* Left: Gallery */}
        <div style={gallerySection}>
          <div style={mainImgWrapper}>
            <img
              src={selectedImage}
              alt={product.name}
              style={mainImgStyle}
            />

            {/* Wishlist floating button */}
            <button
              onClick={() => toggleWishlist(product)}
              style={wishlistFloatingBtn}
              aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart
                size={22}
                color={inWishlist ? '#ef4444' : '#64748b'}
                fill={inWishlist ? '#ef4444' : 'none'}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={thumbnailsContainer}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    ...thumbnailBtn,
                    borderColor: selectedImage === img ? '#1d4ed8' : '#e2e8f0',
                  }}
                >
                  <img src={img} alt="" style={thumbnailImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase */}
        <div style={detailsSection}>
          {/* Brand & Category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={brandPillStyle}>{product.brand}</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              • {product.subcategory}
            </span>
          </div>

          {/* Title */}
          <h1 className="pdp-title" style={productTitleStyle}>{product.name}</h1>

          {/* Rating */}
          <div style={ratingRowStyle}>
            <RatingStars rating={product.rating} numReviews={product.numReviews} size={18} />
            <span style={ratingDivider}>|</span>
            <span style={verifiedPurchasesText}>
              <ShieldCheck size={16} color="#059669" /> 100% Verified Quality
            </span>
          </div>

          {/* Price Box */}
          <div style={priceBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={finalPriceStyle}>{formatINR(finalPrice)}</span>
              {product.discountPrice && (
                <>
                  <span style={originalPriceStyle}>{formatINR(product.price)}</span>
                  <span style={saveBadgeStyle}>
                    Save {discountPercent}% ({formatINR(product.price - product.discountPrice)})
                  </span>
                </>
              )}
            </div>
            <div style={taxInfoStyle}>Inclusive of all applicable taxes & GST</div>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p style={shortDescStyle}>{product.shortDescription}</p>
          )}

          {/* Variants Selectors */}
          {product.variants && product.variants.length > 0 && (
            <div style={variantsContainer}>
              {product.variants.map((v) => (
                <div key={v.name} style={variantGroup}>
                  <label style={variantLabel}>
                    Select {v.name}:{' '}
                    <strong style={{ color: '#0f172a' }}>
                      {selectedVariants[v.name] || 'Choose'}
                    </strong>
                  </label>
                  <div style={variantOptionsRow}>
                    {v.options.map((opt) => {
                      const isSelected = selectedVariants[v.name] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleVariantSelect(v.name, opt)}
                          style={{
                            ...variantOptionBtn,
                            borderColor: isSelected ? '#1d4ed8' : '#cbd5e1',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#1d4ed8' : '#334155',
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {isSelected && <Check size={14} />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Stock Status */}
          <div style={qtyStockRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Quantity:
              </label>
              <div style={qtySelectorBox}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={qtyBtn}
                >
                  -
                </button>
                <span style={qtyDisplay}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  style={qtyBtn}
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock indicator */}
            <div>
              {product.stock > 0 ? (
                product.stock <= 10 ? (
                  <span style={stockUrgencyBadge}>
                    Only {product.stock} left in stock - order soon!
                  </span>
                ) : (
                  <span style={inStockBadge}>
                    <Check size={14} /> In Stock ({product.stock} units ready to ship)
                  </span>
                )
              ) : (
                <span style={outOfStockBadge}>Currently Out of Stock</span>
              )}
            </div>
          </div>

          {/* Action CTAs: Add to Cart & Buy Now */}
          <div className="pdp-cta-group" style={ctaButtonsGroup}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className="btn btn-outline btn-lg"
              style={{ flex: 1, borderColor: '#1d4ed8', color: '#1d4ed8' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn btn-primary btn-lg"
              style={{ flex: 1.2 }}
            >
              <Zap size={18} /> Buy Now
            </button>
          </div>

          {/* PIN code delivery estimator check */}
          <div style={deliveryCheckCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={18} color="#1d4ed8" />
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                Delivery PIN Code Availability
              </strong>
            </div>

            <form onSubmit={handleCheckPincode} style={pincodeForm}>
              <input
                type="text"
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                style={pincodeInput}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Check
              </button>
            </form>

            {deliveryResult && (
              <div style={deliveryResultBox}>
                <div style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={16} /> Free Delivery by {deliveryResult.days}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Standard delivery to <strong>{deliveryResult.city} ({pincode})</strong>
                </div>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div style={trustGrid}>
            <div style={trustItem}>
              <ShieldCheck size={20} color="#1d4ed8" />
              <div>
                <strong>100% Genuine</strong>
                <span>Direct brand assurance</span>
              </div>
            </div>
            <div style={trustItem}>
              <RotateCcw size={20} color="#1d4ed8" />
              <div>
                <strong>7-Day Returns</strong>
                <span>Doorstep return & exchange</span>
              </div>
            </div>
            <div style={trustItem}>
              <Truck size={20} color="#1d4ed8" />
              <div>
                <strong>Free Delivery</strong>
                <span>On orders above ₹499</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description & Specifications Tabs */}
      <section style={detailsTabSection}>
        <div style={sectionBox}>
          <h2 style={sectionHeaderTitle}>Product Details & Description</h2>
          <div style={descriptionTextStyle}>{product.description}</div>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
                Specifications
              </h3>
              <div style={specsTable}>
                {product.specifications.map((spec, i) => (
                  <div
                    key={i}
                    style={{
                      ...specRow,
                      background: i % 2 === 0 ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <span style={specKey}>{spec.key}</span>
                    <span style={specValue}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={reviewsSection}>
        <div style={sectionBox}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={sectionHeaderTitle}>Customer Ratings & Reviews</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>
                  {product.rating > 0 ? product.rating : '5.0'}
                </span>
                <div>
                  <RatingStars rating={product.rating || 5} size={20} showScore={false} />
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Based on {product.numReviews || 0} customer ratings
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Review Form */}
          <div style={addReviewCard}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
              Write a Product Review
            </h3>
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Rating:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <Star
                        size={24}
                        fill={star <= reviewRating ? '#f59e0b' : '#e2e8f0'}
                        color={star <= reviewRating ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Review Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Magnificent silk and authentic weave!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Detailed Comments:
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your experience regarding material, fitting, battery life or overall quality..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="btn btn-primary"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Reviews List */}
          <div style={reviewsListStyle}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev._id} style={reviewItemCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                        {rev.userName}
                      </strong>
                      {rev.isVerifiedPurchase && (
                        <span style={verifiedBadge}>
                          <Check size={12} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>

                  <RatingStars rating={rev.rating} size={14} showScore={false} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: '6px 0 4px' }}>
                    {rev.title}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 0', color: '#64748b', fontSize: '0.9rem' }}>
                No customer reviews yet. Be the first to review this product!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <div className="section-header">
            <h2 className="section-title">Customers Also Viewed</h2>
          </div>
          <div className="grid-products">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const productMainGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '36px',
  marginTop: '16px',
};

const gallerySection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const mainImgWrapper = {
  position: 'relative',
  width: '100%',
  paddingTop: '90%',
  background: '#f8fafc',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
};

const mainImgStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const wishlistFloatingBtn = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.95)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

const thumbnailsContainer = {
  display: 'flex',
  gap: '10px',
  overflowX: 'auto',
  padding: '4px 0',
};

const thumbnailBtn = {
  width: '74px',
  height: '74px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '2px solid',
  padding: 0,
  cursor: 'pointer',
  flexShrink: 0,
};

const thumbnailImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const detailsSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const brandPillStyle = {
  background: '#eff6ff',
  color: '#1d4ed8',
  fontWeight: '700',
  fontSize: '0.8rem',
  padding: '3px 8px',
  borderRadius: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const productTitleStyle = {
  fontSize: '1.6rem',
  fontWeight: '800',
  color: '#0f172a',
  lineHeight: 1.3,
  letterSpacing: '-0.02em',
};

const ratingRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const ratingDivider = {
  color: '#cbd5e1',
};

const verifiedPurchasesText = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '0.825rem',
  color: '#059669',
  fontWeight: '600',
};

const priceBoxStyle = {
  background: '#f8fafc',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const finalPriceStyle = {
  fontSize: '1.8rem',
  fontWeight: '800',
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const originalPriceStyle = {
  fontSize: '1.05rem',
  color: '#94a3b8',
  textDecoration: 'line-through',
};

const saveBadgeStyle = {
  background: '#fee2e2',
  color: '#dc2626',
  padding: '3px 8px',
  borderRadius: '4px',
  fontSize: '0.78rem',
  fontWeight: '700',
};

const taxInfoStyle = {
  fontSize: '0.75rem',
  color: '#64748b',
  marginTop: '4px',
};

const shortDescStyle = {
  fontSize: '0.925rem',
  color: '#475569',
  lineHeight: 1.5,
};

const variantsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const variantGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const variantLabel = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#475569',
};

const variantOptionsRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const variantOptionBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '8px',
  border: '1.5px solid',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const qtyStockRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
  padding: '12px 0',
  borderTop: '1px solid #f1f5f9',
  borderBottom: '1px solid #f1f5f9',
};

const qtySelectorBox = {
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  background: '#ffffff',
};

const qtyBtn = {
  padding: '6px 12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 700,
  color: '#0f172a',
};

const qtyDisplay = {
  padding: '0 12px',
  fontWeight: 700,
  fontSize: '0.95rem',
};

const inStockBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#059669',
  fontWeight: '700',
  fontSize: '0.85rem',
};

const stockUrgencyBadge = {
  color: '#ea580c',
  fontWeight: '700',
  fontSize: '0.85rem',
};

const outOfStockBadge = {
  color: '#dc2626',
  fontWeight: '700',
  fontSize: '0.85rem',
};

const ctaButtonsGroup = {
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
};

const deliveryCheckCard = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '14px 16px',
};

const pincodeForm = {
  display: 'flex',
  gap: '8px',
};

const pincodeInput = {
  flex: 1,
  padding: '6px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '0.85rem',
};

const deliveryResultBox = {
  marginTop: '8px',
  padding: '8px 12px',
  background: '#f0fdf4',
  borderRadius: '6px',
  border: '1px solid #bbf7d0',
};

const trustGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px',
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '12px',
};

const trustItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.78rem',
  color: '#475569',
};

const detailsTabSection = {
  marginTop: '40px',
};

const sectionBox = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '32px',
};

const sectionHeaderTitle = {
  fontSize: '1.35rem',
  fontWeight: '800',
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const descriptionTextStyle = {
  fontSize: '0.95rem',
  color: '#334155',
  lineHeight: 1.7,
  marginTop: '12px',
};

const specsTable = {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  overflow: 'hidden',
};

const specRow = {
  display: 'flex',
  padding: '10px 16px',
  borderBottom: '1px solid #f1f5f9',
};

const specKey = {
  width: '35%',
  fontWeight: '600',
  fontSize: '0.875rem',
  color: '#475569',
};

const specValue = {
  width: '65%',
  fontSize: '0.875rem',
  color: '#0f172a',
};

const reviewsSection = {
  marginTop: '40px',
};

const addReviewCard = {
  background: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  marginBottom: '24px',
};

const reviewsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const reviewItemCard = {
  padding: '16px',
  borderRadius: '10px',
  border: '1px solid #f1f5f9',
  background: '#ffffff',
};

const verifiedBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  fontSize: '0.72rem',
  fontWeight: '700',
  color: '#059669',
  background: '#d1fae5',
  padding: '2px 6px',
  borderRadius: '4px',
};

export default ProductDetailPage;
