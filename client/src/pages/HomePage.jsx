import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import HeroCarousel from '../components/home/HeroCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import DealsSection from '../components/home/DealsSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import ProductCard from '../components/product/ProductCard';
import { productService } from '../services/productService';
import { Sparkles, TrendingUp, Award, Clock } from 'lucide-react';

const HomePage = () => {
  const { categories = [] } = useOutletContext() || {};
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersData, productsRes] = await Promise.all([
          productService.getBanners().catch(() => []),
          productService.getProducts({ limit: 100 }),
        ]);

        setBanners(bannersData || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load recently viewed products from localStorage
    try {
      const stored = localStorage.getItem('casa_recently_viewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored).slice(0, 4));
      }
    } catch {
      // ignore
    }
  }, []);

  // Filter category products
  const womensProducts = products.filter((p) => p.categorySlug === 'womens-fashion');
  const electronicsProducts = products.filter((p) => p.categorySlug === 'electronics');
  const mensProducts = products.filter((p) => p.categorySlug === 'mens-fashion');
  const homeProducts = products.filter((p) => p.categorySlug === 'home-and-kitchen');
  const beautyProducts = products.filter((p) => p.categorySlug === 'beauty-and-personal-care');
  const footwearProducts = products.filter((p) => p.categorySlug === 'footwear');
  const groceryProducts = products.filter((p) => p.categorySlug === 'grocery-and-daily-essentials');
  const kidsProducts = products.filter((p) => p.categorySlug === 'kids-and-baby');
  const sportsBooksFurniture = products.filter((p) =>
    ['sports-and-fitness', 'books-and-stationery', 'furniture', 'bags-and-luggage', 'watches-and-jewellery'].includes(p.categorySlug)
  );

  const bestsellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const trending = products.filter((p) => p.isTrending).slice(0, 8);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. Large Hero Carousel */}
      <HeroCarousel banners={banners} />

      {/* 2. Shop by Category Grid (All 15 Categories) */}
      <CategoryGrid categories={categories} />

      {/* 3. Today's Best Deals with Live Countdown */}
      <DealsSection products={products} />

      {/* 4. Women's Fashion & Sarees Showcase */}
      <CategoryShowcase
        title="Royal Ethnic Wear & Sarees"
        subtitle="Pure Kanjivaram silk, Banarasi weaves, Anarkali suits & bridal lehengas"
        categorySlug="womens-fashion"
        products={womensProducts}
        allProducts={products}
      />

      {/* 5. Electronics & Gadgets Showcase */}
      <CategoryShowcase
        title="Electronics & Cutting-Edge Gadgets"
        subtitle="M3 MacBooks, Sony ANC headphones, OLED TVs & Galaxy flagships"
        categorySlug="electronics"
        products={electronicsProducts}
        allProducts={products}
      />

      {/* 6. Promotional Mid-Page Banner */}
      <div className="container" style={{ margin: '24px auto' }}>
        <div style={promoBannerStyle}>
          <div style={{ maxWidth: '520px', zIndex: 2 }}>
            <span style={promoBadgeStyle}>
              <Sparkles size={14} color="#f59e0b" /> FESTIVE EXCLUSIVE COUPON
            </span>
            <h3 style={promoTitleStyle}>
              Flat ₹200 OFF on Orders Above ₹1,499
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '16px' }}>
              Use coupon code <strong style={{ color: '#fbbf24', fontSize: '1rem' }}>CASA200</strong> at checkout to redeem instant discount on top of festive sales.
            </p>
            <Link to="/products" className="btn btn-gold btn-sm">
              Claim Offer & Shop Now
            </Link>
          </div>
          <div style={promoBgAccent} />
        </div>
      </div>

      {/* 7. Men's Fashion Showcase */}
      <CategoryShowcase
        title="Men's Wardrobe & Essentials"
        subtitle="100% European linen shirts, Levi's stretch denim & Manyavar festive wear"
        categorySlug="mens-fashion"
        products={mensProducts}
        allProducts={products}
      />

      {/* 8. Home & Kitchen Showcase */}
      <CategoryShowcase
        title="Home, Kitchen & Modern Living"
        subtitle="Prestige mixer grinders, tri-ply stainless cookware & Egyptian cotton sheets"
        categorySlug="home-and-kitchen"
        products={homeProducts}
        allProducts={products}
      />

      {/* 9. Bestsellers Across Multiple Categories */}
      {bestsellers.length > 0 && (
        <section style={curatedSectionStyle}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <Award size={22} color="#f59e0b" /> CASA Bestsellers
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  Most loved and highest-rated products across India
                </p>
              </div>
              <Link to="/products?bestseller=true" className="section-link">
                View All Bestsellers →
              </Link>
            </div>
            <div className="grid-products">
              {bestsellers.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Beauty and Personal Care Showcase */}
      <CategoryShowcase
        title="Beauty & Luxury Personal Care"
        subtitle="Niacinamide serums, Ayurvedic Soundarya cream & Philips precision grooming"
        categorySlug="beauty-and-personal-care"
        products={beautyProducts}
        allProducts={products}
      />

      {/* 11. Footwear & Accessories Showcase */}
      <CategoryShowcase
        title="Footwear & Sneakers"
        subtitle="Nike Air Jordans, handcrafted leather oxfords & Bata block heels"
        categorySlug="footwear"
        products={footwearProducts}
        allProducts={products}
      />

      {/* 12. Grocery and Daily Essentials */}
      <CategoryShowcase
        title="Gourmet Grocery & Daily Essentials"
        subtitle="Unpolished organic pulses, Blue Tokai roast coffee & California dry fruits"
        categorySlug="grocery-and-daily-essentials"
        products={groceryProducts}
        allProducts={products}
      />

      {/* 13. Kids, Toys & Baby Products */}
      <CategoryShowcase
        title="Kids, Toys & Baby Care"
        subtitle="LEGO classic building boxes, European safety strollers & organic sleepsuits"
        categorySlug="kids-and-baby"
        products={kidsProducts}
        allProducts={products}
      />

      {/* 14. Trending Products */}
      {trending.length > 0 && (
        <section style={curatedSectionStyle}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <TrendingUp size={22} color="#1d4ed8" /> Trending Right Now
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  What shoppers in your region are currently buying
                </p>
              </div>
              <Link to="/products?trending=true" className="section-link">
                View All Trending →
              </Link>
            </div>
            <div className="grid-products">
              {trending.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 15. More Categories Showcase (Sports, Books, Furniture, Bags, Watches) */}
      <CategoryShowcase
        title="Sports, Books, Furniture & Travel"
        subtitle="Hex dumbbells, James Clear's Atomic Habits, ergonomic chairs & travel luggage"
        categorySlug="furniture"
        products={sportsBooksFurniture}
        allProducts={products}
      />

      {/* 16. Recently Viewed Products (if any) */}
      {recentlyViewed.length > 0 && (
        <section style={{ ...curatedSectionStyle, background: '#f8fafc' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <Clock size={20} color="#64748b" /> Recently Viewed by You
                </h2>
              </div>
            </div>
            <div className="grid-products">
              {recentlyViewed.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const promoBannerStyle = {
  position: 'relative',
  background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
  color: '#ffffff',
  borderRadius: '16px',
  padding: '36px 32px',
  overflow: 'hidden',
  boxShadow: '0 10px 25px -5px rgba(29, 78, 216, 0.2)',
};

const promoBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(245, 158, 11, 0.2)',
  color: '#fbbf24',
  border: '1px solid rgba(245, 158, 11, 0.4)',
  padding: '4px 10px',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: '800',
  letterSpacing: '0.04em',
  marginBottom: '10px',
};

const promoTitleStyle = {
  fontSize: '1.6rem',
  fontWeight: '800',
  letterSpacing: '-0.02em',
  marginBottom: '8px',
};

const promoBgAccent = {
  position: 'absolute',
  top: '-50px',
  right: '-50px',
  width: '260px',
  height: '260px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)',
};

const curatedSectionStyle = {
  padding: '36px 0',
};

export default HomePage;
