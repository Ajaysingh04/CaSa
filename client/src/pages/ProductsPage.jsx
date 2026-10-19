import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Search as SearchIcon,
  ShoppingBag,
  Truck,
  Sparkles,
  Check,
  Tag,
  Filter,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { formatINR } from '../utils/formatters';

const ProductsPage = () => {
  const { slug, subcategory: routeSubcategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Filter States
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get('brand') ? searchParams.get('brand').split(',') : []
  );
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [isBestSellerOnly, setIsBestSellerOnly] = useState(searchParams.get('bestseller') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const searchQuery = searchParams.get('search') || '';

  // Slide-over Filter Drawer State (replaces bulky static sidebar)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    categoryService.getCategories().then((data) => {
      setCategories(data || []);
      if (slug) {
        const found = (data || []).find((c) => c.slug === slug);
        setCurrentCategory(found || null);
      } else {
        setCurrentCategory(null);
      }
    });
  }, [slug]);

  // Sync subcategory param from URL or query
  useEffect(() => {
    if (routeSubcategory) {
      setSelectedSubcategory(routeSubcategory);
    } else {
      setSelectedSubcategory(searchParams.get('subcategory') || '');
    }
  }, [routeSubcategory, searchParams]);

  // Reset pagination and stale filters when search query changes
  useEffect(() => {
    setCurrentPage(1);
    if (!searchParams.get('subcategory')) {
      setSelectedSubcategory('');
    }
    if (!searchParams.get('brand')) {
      setSelectedBrands([]);
    }
  }, [searchQuery]);

  // Fetch Products based on all active parameters
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 16,
          sort: sortBy,
        };

        if (slug) params.category = slug;
        if (selectedSubcategory) params.subcategory = selectedSubcategory;
        if (searchQuery) params.search = searchQuery;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.rating = minRating;
        if (inStockOnly) params.inStock = 'true';
        if (isBestSellerOnly) params.bestseller = 'true';
        if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');

        const res = await productService.getProducts(params);
        setProducts(res.data || []);
        setTotal(res.total || 0);
        setPages(res.pages || 1);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [
    slug,
    selectedSubcategory,
    searchQuery,
    minPrice,
    maxPrice,
    selectedBrands,
    minRating,
    inStockOnly,
    isBestSellerOnly,
    sortBy,
    currentPage,
    searchParams,
  ]);

  const allBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  const handleBrandToggle = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrands([]);
    setMinRating('');
    setInStockOnly(false);
    setIsBestSellerOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Active filter count for badge
  const activeFiltersCount = [
    selectedSubcategory,
    minPrice,
    maxPrice,
    selectedBrands.length > 0,
    minRating,
    inStockOnly,
    isBestSellerOnly,
  ].filter(Boolean).length;

  const breadcrumbItems = [];
  if (slug && currentCategory) {
    breadcrumbItems.push({
      label: currentCategory.name,
      link: selectedSubcategory ? `/category/${slug}` : null,
    });
    if (selectedSubcategory) {
      breadcrumbItems.push({ label: selectedSubcategory });
    }
  } else if (searchQuery) {
    breadcrumbItems.push({ label: `Search: "${searchQuery}"` });
  } else {
    breadcrumbItems.push({ label: 'All Products' });
  }

  return (
    <div style={pageBackground}>
      {/* Component Specific Animations & Styling */}
      <style>{`
        @keyframes cardEntrance {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes drawerSlideRight {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }

        .filter-pill-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .filter-pill-btn:hover {
          transform: translateY(-1px);
          border-color: #2563eb !important;
          color: #2563eb !important;
        }

        .active-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .grid-products-full {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 640px) {
          .grid-products-full {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }

        @media (min-width: 840px) {
          .grid-products-full {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        @media (min-width: 1200px) {
          .grid-products-full {
            grid-template-columns: repeat(4, 1fr);
            gap: 22px;
          }
        }
      `}</style>

      <div className="container" style={{ paddingBottom: '60px' }}>
        <Breadcrumbs items={breadcrumbItems} />

        {/* Category Hero Banner (When in Category) OR Hero Header Bar (When in All Products / Search) */}
        {currentCategory ? (
          <div
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              marginBottom: '20px',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '36px 36px 28px',
              background: `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.92) 100%), url(${currentCategory.bannerImage || currentCategory.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600'}) center/cover no-repeat`,
              boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '9999px', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                <Sparkles size={13} color="#fde047" /> Curated CASA Department
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.025em' }}>
                    {currentCategory.name}
                  </h1>
                  <p style={{ color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '680px', marginTop: '6px', lineHeight: 1.4 }}>
                    {currentCategory.description}
                  </p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.25)', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem' }}>
                  {total} Verified Products
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={heroHeaderCard}>
            <div style={heroTitleGroup}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={pageTitleStyle}>
                  {searchQuery ? `Search: "${searchQuery}"` : 'Marketplace Collection'}
                </h1>
                <span style={resultsBadge}>
                  {total} Products Available
                </span>
              </div>
              <p style={heroSubtext}>
                Explore authentic Indian craftsmanship, trending electronics, designer apparel, and top-rated essentials.
              </p>
            </div>

            {/* Controls: Filter Button & Sort */}
            <div style={controlsRow}>
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                style={filterToggleBtn}
                className="filter-pill-btn"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span style={filterActiveCountBadge}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div style={sortContainerStyle}>
                <span style={sortLabelStyle}>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={sortSelectStyle}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Customer Rating</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories Tabs Strip (When in category) */}
        {currentCategory?.subcategories?.length > 0 && (
          <div style={subcategoriesRow}>
            <button
              onClick={() => {
                setSelectedSubcategory('');
                setCurrentPage(1);
              }}
              style={{
                ...subcategoryBtn,
                background: !selectedSubcategory ? '#2563eb' : '#ffffff',
                color: !selectedSubcategory ? '#ffffff' : '#334155',
                borderColor: !selectedSubcategory ? '#2563eb' : '#e2e8f0',
              }}
            >
              All {currentCategory.name}
            </button>
            {currentCategory.subcategories.map((sub) => {
              const subName = typeof sub === 'string' ? sub : (sub.name || '');
              const subSlug = typeof sub === 'string' ? sub : (sub.slug || sub.name || '');
              const isSelected = selectedSubcategory === subName || selectedSubcategory === subSlug;

              return (
                <button
                  key={subSlug || subName}
                  onClick={() => {
                    setSelectedSubcategory(isSelected ? '' : subName);
                    setCurrentPage(1);
                  }}
                  style={{
                    ...subcategoryBtn,
                    background: isSelected ? '#2563eb' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                  }}
                >
                  {subName}
                </button>
              );
            })}
          </div>
        )}

        {/* Horizontal Quick Filter Pills & Controls Strip */}
        <div style={quickPillsStrip}>
          {/* In Category Mode: Show Filter Button & Sort here */}
          {currentCategory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '6px' }}>
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                style={filterToggleBtn}
                className="filter-pill-btn"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span style={filterActiveCountBadge}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div style={sortContainerStyle}>
                <span style={sortLabelStyle}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={sortSelectStyle}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setInStockOnly(!inStockOnly);
              setCurrentPage(1);
            }}
            style={{
              ...quickFilterPill,
              background: inStockOnly ? '#2563eb' : '#ffffff',
              color: inStockOnly ? '#ffffff' : '#475569',
              borderColor: inStockOnly ? '#2563eb' : '#e2e8f0',
            }}
          >
            {inStockOnly && <Check size={13} />} In Stock
          </button>

          <button
            onClick={() => {
              setMinRating(minRating === '4' ? '' : '4');
              setCurrentPage(1);
            }}
            style={{
              ...quickFilterPill,
              background: minRating === '4' ? '#2563eb' : '#ffffff',
              color: minRating === '4' ? '#ffffff' : '#475569',
              borderColor: minRating === '4' ? '#2563eb' : '#e2e8f0',
            }}
          >
            <Star size={13} fill={minRating === '4' ? '#ffffff' : '#f59e0b'} color={minRating === '4' ? '#ffffff' : '#f59e0b'} />
            4★ & Above
          </button>

          <button
            onClick={() => {
              if (maxPrice === '999') {
                setMinPrice('');
                setMaxPrice('');
              } else {
                setMinPrice('0');
                setMaxPrice('999');
              }
              setCurrentPage(1);
            }}
            style={{
              ...quickFilterPill,
              background: maxPrice === '999' ? '#2563eb' : '#ffffff',
              color: maxPrice === '999' ? '#ffffff' : '#475569',
              borderColor: maxPrice === '999' ? '#2563eb' : '#e2e8f0',
            }}
          >
            Under ₹999
          </button>

          <button
            onClick={() => {
              setIsBestSellerOnly(!isBestSellerOnly);
              setCurrentPage(1);
            }}
            style={{
              ...quickFilterPill,
              background: isBestSellerOnly ? '#2563eb' : '#ffffff',
              color: isBestSellerOnly ? '#ffffff' : '#475569',
              borderColor: isBestSellerOnly ? '#2563eb' : '#e2e8f0',
            }}
          >
            <Sparkles size={13} /> Best Sellers
          </button>

          {activeFiltersCount > 0 && (
            <button onClick={resetFilters} style={clearAllFiltersBtn}>
              <RotateCcw size={12} /> Clear ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Products Grid (Full Width, No Cramped Sidebar) */}
        <main style={{ marginTop: '20px' }}>
          {loading ? (
            <div className="grid-products-full">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={skeletonCardStyle}>
                  <div className="skeleton" style={{ height: '220px', width: '100%' }} />
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '14px', width: '50%', marginBottom: '10px' }} />
                    <div className="skeleton" style={{ height: '18px', width: '85%', marginBottom: '12px' }} />
                    <div className="skeleton" style={{ height: '16px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconCircle}>
                <ShoppingBag size={48} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '16px', color: '#0f172a' }}>
                No matching products found
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '380px', marginTop: '6px' }}>
                We couldn't find items matching your active criteria. Try clearing filters or exploring another category.
              </p>
              <button
                onClick={resetFilters}
                className="btn btn-primary"
                style={{ marginTop: '20px', borderRadius: '10px', padding: '10px 24px' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid-products-full">
                {products.map((product, idx) => (
                  <div
                    key={product._id}
                    style={{
                      animation: `cardEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`,
                      animationDelay: `${Math.min(idx * 40, 360)}ms`,
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div style={paginationStyle}>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    style={{
                      ...pageBtnStyle,
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <div style={pageNumbersGroup}>
                    {[...Array(pages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          style={{
                            ...pageNumStyle,
                            background: currentPage === pageNum ? '#2563eb' : '#ffffff',
                            color: currentPage === pageNum ? '#ffffff' : '#0f172a',
                            borderColor: currentPage === pageNum ? '#2563eb' : '#e2e8f0',
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(pages, p + 1));
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === pages}
                    style={{
                      ...pageBtnStyle,
                      opacity: currentPage === pages ? 0.5 : 1,
                      cursor: currentPage === pages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Slide-over Filter Drawer (Opens cleanly when user clicks "Filters") */}
      {isFilterDrawerOpen && (
        <div style={drawerOverlayStyle} onClick={() => setIsFilterDrawerOpen(false)}>
          <div style={drawerContainerStyle} onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={drawerHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Filter Products
                </h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                style={drawerCloseBtn}
                aria-label="Close filters"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={drawerBodyStyle}>
              {/* Price Range Filter */}
              <div style={drawerSection}>
                <h4 style={drawerSectionTitle}>Price Range (₹)</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={drawerInput}
                  />
                  <span style={{ color: '#94a3b8' }}>—</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={drawerInput}
                  />
                </div>
              </div>

              {/* Star Rating Filter */}
              <div style={drawerSection}>
                <h4 style={drawerSectionTitle}>Minimum Customer Rating</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[4, 3, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === String(r) ? '' : String(r))}
                      style={{
                        ...ratingBtn,
                        background: minRating === String(r) ? '#eff6ff' : '#ffffff',
                        borderColor: minRating === String(r) ? '#2563eb' : '#e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < r ? '#f59e0b' : '#e2e8f0'}
                            color={i < r ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                        {r} Stars & up
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              {allBrands.length > 0 && (
                <div style={drawerSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={drawerSectionTitle}>Brands</h4>
                    {selectedBrands.length > 0 && (
                      <button onClick={() => setSelectedBrands([])} style={drawerClearLink}>
                        Reset
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {allBrands.map((brand) => (
                      <label key={brand} style={checkboxRow}>
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div style={drawerFooterStyle}>
              <button
                onClick={() => {
                  resetFilters();
                  setIsFilterDrawerOpen(false);
                }}
                style={drawerResetBtn}
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="btn btn-primary"
                style={drawerApplyBtn}
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Styles */
const pageBackground = {
  background: '#f8fafc',
  minHeight: '85vh',
  paddingTop: '20px',
};

const heroHeaderCard = {
  background: '#ffffff',
  borderRadius: '20px',
  border: '1.5px solid #e2e8f0',
  padding: '24px 28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
  marginTop: '8px',
};

const heroTitleGroup = {
  maxWidth: '650px',
};

const pageTitleStyle = {
  fontSize: '1.65rem',
  fontWeight: '900',
  color: '#0f172a',
  margin: 0,
  letterSpacing: '-0.025em',
};

const resultsBadge = {
  fontSize: '0.75rem',
  fontWeight: '800',
  background: '#eff6ff',
  color: '#2563eb',
  padding: '4px 10px',
  borderRadius: '9999px',
  border: '1px solid #bfdbfe',
};

const heroSubtext = {
  fontSize: '0.85rem',
  color: '#64748b',
  margin: '6px 0 0',
  lineHeight: 1.45,
};

const controlsRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const filterToggleBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 18px',
  borderRadius: '12px',
  border: '1.5px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '0.875rem',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
};

const filterActiveCountBadge = {
  background: '#2563eb',
  color: '#ffffff',
  borderRadius: '50%',
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.68rem',
  fontWeight: '800',
};

const sortContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#ffffff',
  padding: '8px 14px',
  borderRadius: '12px',
  border: '1.5px solid #cbd5e1',
};

const sortLabelStyle = {
  fontSize: '0.78rem',
  color: '#64748b',
  fontWeight: 700,
};

const sortSelectStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '0.85rem',
  fontWeight: '800',
  color: '#0f172a',
  outline: 'none',
  cursor: 'pointer',
};

const quickPillsStrip = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  overflowX: 'auto',
  padding: '16px 0 6px',
};

const quickFilterPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '9999px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.78rem',
  fontWeight: '700',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
};

const clearAllFiltersBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '9999px',
  border: '1px dashed #f87171',
  background: '#fef2f2',
  color: '#dc2626',
  fontSize: '0.75rem',
  fontWeight: '700',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const subcategoriesRow = {
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  padding: '8px 0 14px',
};

const subcategoryBtn = {
  padding: '6px 14px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.78rem',
  fontWeight: '700',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
};

const skeletonCardStyle = {
  background: '#ffffff',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1.5px solid #f1f5f9',
};

const emptyStateStyle = {
  background: '#ffffff',
  borderRadius: '24px',
  border: '1.5px solid #e2e8f0',
  padding: '60px 24px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '20px 0',
};

const emptyIconCircle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const paginationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '44px',
};

const pageBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '8px 16px',
  borderRadius: '9999px',
  border: '1.5px solid #e2e8f0',
  background: '#ffffff',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#0f172a',
};

const pageNumbersGroup = {
  display: 'flex',
  gap: '6px',
};

const pageNumStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '1.5px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem',
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

/* Drawer Styles */
const drawerOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(5px)',
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'flex-end',
};

const drawerContainerStyle = {
  width: '100%',
  maxWidth: '380px',
  height: '100%',
  background: '#ffffff',
  boxShadow: '-8px 0 30px rgba(15, 23, 42, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  animation: 'drawerSlideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

const drawerHeaderStyle = {
  padding: '18px 20px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const drawerCloseBtn = {
  background: '#f1f5f9',
  border: 'none',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const drawerBodyStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const drawerSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const drawerSectionTitle = {
  fontSize: '0.85rem',
  fontWeight: 800,
  color: '#0f172a',
  margin: 0,
};

const drawerInput = {
  flex: 1,
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.85rem',
  outline: 'none',
};

const ratingBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const drawerClearLink = {
  background: 'none',
  border: 'none',
  color: '#2563eb',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const checkboxRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
};

const drawerFooterStyle = {
  padding: '16px 20px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  gap: '12px',
};

const drawerResetBtn = {
  flex: 1,
  padding: '12px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  background: '#ffffff',
  color: '#475569',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const drawerApplyBtn = {
  flex: 1.5,
  padding: '12px',
  borderRadius: '10px',
  fontWeight: 800,
  fontSize: '0.85rem',
};

export default ProductsPage;
