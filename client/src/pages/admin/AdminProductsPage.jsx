import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Search,
  Package,
  Layers,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  SlidersHorizontal,
  X,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  Tag,
  DollarSign,
  ArrowUpDown,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  Edit2,
  Check,
  Flame,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';

const PRESET_SAMPLE_IMAGES = [
  { label: 'Denim Jeans', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Casual T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
  { label: 'Wireless Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
  { label: 'Home Living', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80' },
];

const AdminProductsPage = () => {
  const { success, error } = useToast();
  const { isDemoAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal Editing & File Upload States
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [imagePreview, setImagePreview] = useState('');
  const [imageFileInfo, setImageFileInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Filter States (Migrated & supercharged for Admin)
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockStatus, setStockStatus] = useState('all'); // 'all', 'instock', 'lowstock', 'outofstock'
  const [approvalFilter, setApprovalFilter] = useState('all'); // 'all', 'approved', 'pending', 'rejected'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hovered graph bar state for tooltip
  const [hoveredBar, setHoveredBar] = useState(null);

  // New Product Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categorySlug: 'electronics',
    subcategory: 'Laptops',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    stock: '',
    imageUrl: '',
    isFeatured: false,
    isBestSeller: false,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ limit: 200 });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    categoryService.getCategories().then((data) => setCategories(data || []));
  }, []);

  // Distinct Brands
  const allBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
  }, [products]);

  // Overall Inventory Analytics Computations
  const stats = useMemo(() => {
    const totalCount = products.length;
    let totalStockUnits = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalDiscountPercent = 0;
    let discountItemsCount = 0;

    // Category Distribution Map
    const catMap = {};

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.discountPrice || p.price) || 0;
      const origPrice = Number(p.price) || 0;

      totalStockUnits += stock;
      totalValuation += stock * price;

      if (stock === 0) outOfStockCount++;
      else if (stock <= 15) lowStockCount++;

      if (p.discountPrice && p.discountPrice < p.price) {
        totalDiscountPercent += ((origPrice - price) / origPrice) * 100;
        discountItemsCount++;
      }

      const catKey = p.categorySlug || 'general';
      if (!catMap[catKey]) {
        catMap[catKey] = { name: catKey, count: 0, totalValue: 0 };
      }
      catMap[catKey].count++;
      catMap[catKey].totalValue += stock * price;
    });

    const categoryDistribution = Object.values(catMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const optimalStockCount = totalCount - lowStockCount - outOfStockCount;

    return {
      totalCount,
      totalStockUnits,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      optimalStockCount,
      avgDiscount: discountItemsCount > 0 ? Math.round(totalDiscountPercent / discountItemsCount) : 0,
      categoryDistribution,
    };
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchSku = (p.slug || '').toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchSku) return false;
        }

        // Category filter
        if (selectedCategory && p.categorySlug !== selectedCategory) {
          return false;
        }

        // Brand filter
        if (selectedBrand && p.brand !== selectedBrand) {
          return false;
        }

        // Stock status filter
        if (stockStatus === 'instock' && (p.stock || 0) <= 0) return false;
        if (stockStatus === 'lowstock' && ((p.stock || 0) <= 0 || (p.stock || 0) > 15)) return false;
        if (stockStatus === 'outofstock' && (p.stock || 0) > 0) return false;

        // Approval status filter
        if (approvalFilter !== 'all') {
          const status = p.approvalStatus || 'approved';
          if (status !== approvalFilter) return false;
        }

        // Price filter
        const finalPrice = p.discountPrice || p.price || 0;
        if (minPrice && finalPrice < Number(minPrice)) return false;
        if (maxPrice && finalPrice > Number(maxPrice)) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.price || 0;
        const priceB = b.discountPrice || b.price || 0;
        const stockA = a.stock || 0;
        const stockB = b.stock || 0;

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'stock_asc') return stockA - stockB;
        if (sortBy === 'stock_desc') return stockB - stockA;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, search, selectedCategory, selectedBrand, stockStatus, approvalFilter, minPrice, maxPrice, sortBy]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setStockStatus('all');
    setApprovalFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    search,
    selectedCategory,
    selectedBrand,
    stockStatus !== 'all',
    approvalFilter !== 'all',
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const handleApprovalChange = async (productId, status) => {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = window.prompt('Enter reason for rejecting this product listing:') || 'Content/listing policy rejection';
    }

    try {
      await adminService.manageProductApproval(productId, {
        approvalStatus: status,
        rejectionReason,
      });
      success(`Product listing set to ${status.toUpperCase()}`);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, approvalStatus: status, rejectionReason } : p
        )
      );
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update product approval status');
    }
  };

  const currentCategorySubcategories = useMemo(() => {
    const cat = categories.find((c) => c.slug === formData.categorySlug);
    return cat?.subcategories || [];
  }, [categories, formData.categorySlug]);

  const handleCategoryChange = (slug) => {
    const matchedCat = categories.find((c) => c.slug === slug);
    const firstSub = matchedCat?.subcategories?.[0]?.name || 'General';
    setFormData((prev) => ({
      ...prev,
      categorySlug: slug,
      subcategory: firstSub,
    }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    const initialCat = categories[0];
    const initialSub = initialCat?.subcategories?.[0]?.name || 'General';
    setFormData({
      name: '',
      brand: '',
      categorySlug: initialCat?.slug || 'electronics',
      subcategory: initialSub,
      description: '',
      shortDescription: '',
      price: '',
      discountPrice: '',
      stock: '',
      imageUrl: '',
      isFeatured: false,
      isBestSeller: false,
    });
    setImagePreview('');
    setImageFileInfo(null);
    setImageMode('upload');
    setShowAddModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    const existingImg = (p.images && p.images[0]) || p.imageUrl || '';
    const catSlug = p.categorySlug || p.category?.slug || categories[0]?.slug || 'electronics';
    const matchedCat = categories.find((c) => c.slug === catSlug);
    const fallbackSub = p.subcategory || matchedCat?.subcategories?.[0]?.name || 'General';

    setFormData({
      name: p.name || '',
      brand: p.brand || '',
      categorySlug: catSlug,
      subcategory: fallbackSub,
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      price: p.price || '',
      discountPrice: p.discountPrice || '',
      stock: p.stock ?? '',
      imageUrl: existingImg,
      isFeatured: Boolean(p.isFeatured),
      isBestSeller: Boolean(p.isBestSeller),
    });
    setImagePreview(existingImg);
    setImageFileInfo(null);
    setImageMode(existingImg.startsWith('data:') ? 'upload' : 'url');
    setShowAddModal(true);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      error('Image size exceeds 8MB limit. Please upload a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
      setImageFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImageFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPresetImage = (url) => {
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImageFileInfo(null);
  };

  const discountInfo = useMemo(() => {
    const mrp = Number(formData.price) || 0;
    const discount = Number(formData.discountPrice) || 0;
    if (mrp > 0 && discount > 0 && discount < mrp) {
      const saved = mrp - discount;
      const pct = Math.round((saved / mrp) * 100);
      return { isValid: true, saved, pct, isInvalid: false };
    }
    if (mrp > 0 && discount > mrp) {
      return { isValid: false, isInvalid: true };
    }
    return { isValid: false, isInvalid: false };
  }, [formData.price, formData.discountPrice]);

  const stockIndicator = useMemo(() => {
    const stockVal = Number(formData.stock);
    if (formData.stock === '' || isNaN(stockVal)) return null;
    if (stockVal === 0) return { label: 'Out of Stock', color: '#ef4444', bg: '#fef2f2' };
    if (stockVal <= 10) return { label: 'Low Stock Alert', color: '#f59e0b', bg: '#fffbeb' };
    return { label: 'Healthy Stock Level', color: '#10b981', bg: '#f0fdf4' };
  }, [formData.stock]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      error('Product title is required');
      return;
    }
    if (!formData.brand.trim()) {
      error('Brand name is required');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      error('Please enter a valid MRP price');
      return;
    }

    const mrp = Number(formData.price);
    const disc = formData.discountPrice ? Number(formData.discountPrice) : null;
    if (disc && disc > mrp) {
      error('Discounted price cannot be higher than MRP price');
      return;
    }

    setIsSubmitting(true);
    const finalImage =
      formData.imageUrl ||
      imagePreview ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

    const finalSub =
      (formData.subcategory && formData.subcategory.trim()) ||
      currentCategorySubcategories[0]?.name ||
      categories.find((c) => c.slug === formData.categorySlug)?.name ||
      'General';

    const payload = {
      ...formData,
      subcategory: finalSub,
      price: mrp,
      discountPrice: disc,
      stock: Number(formData.stock) || 0,
      images: [finalImage],
    };

    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, payload);
        success(`Product "${formData.name}" updated successfully!`);
      } else {
        await adminService.createProduct(payload);
        success('Product added to catalog successfully!');
      }
      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) return;
    try {
      await adminService.deleteProduct(id);
      success('Product removed successfully.');
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      error('Failed to delete product.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Dynamic Keyframes & CSS Rules */}
      <style>{`
        @keyframes fadeInSlide {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalScaleIn {
          0% { opacity: 0; transform: scale(0.96) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .admin-modal-card-box {
          animation: modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .admin-dropzone {
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
          border-radius: 12px;
          padding: 22px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-dropzone:hover, .admin-dropzone.dragging {
          border-color: #2563eb !important;
          background: #eff6ff !important;
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .admin-form-col-2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .admin-form-col-3 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .admin-modal-card-box {
            padding: 16px !important;
            margin: 8px !important;
            max-height: 94vh !important;
          }
          .admin-modal-footer-btns {
            flex-direction: column-reverse !important;
            width: 100% !important;
          }
          .admin-modal-footer-btns button {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        .admin-stat-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .admin-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.08);
        }

        .admin-table-row {
          transition: background 0.15s ease;
        }

        .admin-table-row:hover {
          background: #f8fafc !important;
        }

        .admin-filter-pill {
          transition: all 0.15s ease;
        }

        .admin-filter-pill:hover {
          border-color: #2563eb !important;
        }

        .chart-bar-hover {
          transition: opacity 0.2s, transform 0.2s;
        }

        .chart-bar-hover:hover {
          opacity: 0.85;
          transform: scaleY(1.03);
        }
      `}</style>

      {/* 1. Header Title & Actions */}
      <div style={headerRow}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={pageTitleStyle}>Products & Inventory Catalog</h1>
            <span style={activeCountPill}>{filteredProducts.length} Items</span>
          </div>
          <p style={pageSubtitleStyle}>
            Live stock tracking, merchandising management, pricing curves, and inventory valuation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
            style={addProductBtn}
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <div style={kpiGrid}>
        <div style={kpiCard} className="card admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Total Catalog Items</span>
              <div style={kpiValue}>{stats.totalCount}</div>
              <span style={kpiSub}>{stats.totalStockUnits} Total Units In Stock</span>
            </div>
            <div style={{ ...kpiIconBox, background: '#eff6ff', color: '#2563eb' }}>
              <Package size={22} />
            </div>
          </div>
        </div>

        <div style={kpiCard} className="card admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Inventory Valuation</span>
              <div style={{ ...kpiValue, color: '#16a34a' }}>{formatINR(stats.totalValuation)}</div>
              <span style={kpiSub}>Based on active selling prices</span>
            </div>
            <div style={{ ...kpiIconBox, background: '#f0fdf4', color: '#16a34a' }}>
              <DollarSign size={22} />
            </div>
          </div>
        </div>

        <div style={kpiCard} className="card admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Low Stock Alerts</span>
              <div style={{ ...kpiValue, color: stats.lowStockCount > 0 ? '#ea580c' : '#0f172a' }}>
                {stats.lowStockCount}
              </div>
              <span style={{ ...kpiSub, color: stats.lowStockCount > 0 ? '#ea580c' : '#64748b' }}>
                {stats.lowStockCount} items have ≤ 15 units left
              </span>
            </div>
            <div style={{ ...kpiIconBox, background: '#fff7ed', color: '#ea580c' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        <div style={kpiCard} className="card admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Avg Catalog Discount</span>
              <div style={{ ...kpiValue, color: '#9333ea' }}>{stats.avgDiscount}%</div>
              <span style={kpiSub}>{stats.outOfStockCount} items currently out of stock</span>
            </div>
            <div style={{ ...kpiIconBox, background: '#faf5ff', color: '#9333ea' }}>
              <TrendingUp size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Analytics & Charts Row */}
      <div style={chartsRow}>
        {/* Chart 1: Department Product Distribution & Valuation */}
        <div style={chartCard} className="card">
          <div style={chartHeader}>
            <div>
              <h3 style={chartTitle}>
                <BarChart3 size={18} color="#2563eb" /> Catalog Distribution by Department
              </h3>
              <p style={chartSubtitle}>Active product count and inventory density by category</p>
            </div>
            <span style={chartPillBadge}>{stats.categoryDistribution.length} Active Departments</span>
          </div>

          <div style={barsContainer}>
            {stats.categoryDistribution.map((cat, i) => {
              const maxCount = Math.max(...stats.categoryDistribution.map((c) => c.count), 1);
              const heightPct = Math.round((cat.count / maxCount) * 100);
              const isHovered = hoveredBar === cat.name;

              return (
                <div
                  key={cat.name}
                  style={barColumn}
                  onMouseEnter={() => setHoveredBar(cat.name)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div style={barTooltip}>
                      <strong>{cat.name}</strong>
                      <div>{cat.count} Products</div>
                      <div style={{ color: '#93c5fd' }}>{formatINR(cat.totalValue)}</div>
                    </div>
                  )}

                  <div style={barTrack}>
                    <div
                      className="chart-bar-hover"
                      style={{
                        ...barFill,
                        height: `${heightPct}%`,
                        background:
                          i === 0
                            ? 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)'
                            : i % 2 === 0
                            ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)'
                            : 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
                      }}
                    />
                  </div>
                  <span style={barLabel}>{cat.name.replace(/-/g, ' ').slice(0, 8)}</span>
                  <span style={barValueText}>{cat.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Stock Health Distribution Gauge */}
        <div style={{ ...chartCard, width: '380px', flexShrink: 0 }} className="card">
          <div style={chartHeader}>
            <div>
              <h3 style={chartTitle}>
                <PieChart size={18} color="#16a34a" /> Inventory Stock Health
              </h3>
              <p style={chartSubtitle}>Fulfillment readiness breakdown</p>
            </div>
          </div>

          {/* Progress Breakdown Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {/* Optimal Stock */}
            <div>
              <div style={gaugeRow}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#16a34a' }}>
                  🟢 Optimal Stock (&gt;15 units)
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                  {stats.optimalStockCount} items (
                  {Math.round((stats.optimalStockCount / (stats.totalCount || 1)) * 100)}%)
                </strong>
              </div>
              <div style={gaugeTrack}>
                <div
                  style={{
                    ...gaugeFill,
                    width: `${Math.round((stats.optimalStockCount / (stats.totalCount || 1)) * 100)}%`,
                    background: '#16a34a',
                  }}
                />
              </div>
            </div>

            {/* Low Stock */}
            <div>
              <div style={gaugeRow}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ea580c' }}>
                  🟡 Low Stock (1 - 15 units)
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                  {stats.lowStockCount} items (
                  {Math.round((stats.lowStockCount / (stats.totalCount || 1)) * 100)}%)
                </strong>
              </div>
              <div style={gaugeTrack}>
                <div
                  style={{
                    ...gaugeFill,
                    width: `${Math.round((stats.lowStockCount / (stats.totalCount || 1)) * 100)}%`,
                    background: '#ea580c',
                  }}
                />
              </div>
            </div>

            {/* Out of Stock */}
            <div>
              <div style={gaugeRow}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#dc2626' }}>
                  🔴 Out of Stock (0 units)
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                  {stats.outOfStockCount} items (
                  {Math.round((stats.outOfStockCount / (stats.totalCount || 1)) * 100)}%)
                </strong>
              </div>
              <div style={gaugeTrack}>
                <div
                  style={{
                    ...gaugeFill,
                    width: `${Math.round((stats.outOfStockCount / (stats.totalCount || 1)) * 100)}%`,
                    background: '#dc2626',
                  }}
                />
              </div>
            </div>

            {/* Price Distribution Wave Graphic (The migrated curve filter) */}
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                  Catalog Price Curve Histogram
                </span>
                <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>
                  ₹100 — ₹2,42,990
                </span>
              </div>
              <svg viewBox="0 0 200 45" style={{ width: '100%', height: '36px', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="adminPriceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 40 Q 20 28 45 35 T 85 16 T 125 8 T 165 24 T 200 40 L 200 45 L 0 45 Z"
                  fill="url(#adminPriceGrad)"
                />
                <path
                  d="M 0 40 Q 20 28 45 35 T 85 16 T 125 8 T 165 24 T 200 40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar Suite (The Supercharged Filters) */}
      <div style={filterCard} className="card">
        {/* Search & Select Row */}
        <div style={filterTopRow}>
          {/* Search Box */}
          <div style={searchBoxWrapper}>
            <Search size={16} color="#94a3b8" style={{ marginLeft: '12px' }} />
            <input
              type="text"
              placeholder="Search product title, brand, or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={searchInputStyle}
            />
            {search && (
              <button onClick={() => setSearch('')} style={clearIconBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div style={selectBox}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={selectDropdown}
            >
              <option value="">All Departments</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div style={selectBox}>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              style={selectDropdown}
            >
              <option value="">All Brands</option>
              {allBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Moderation / Approval Filter */}
          <div style={selectBox}>
            <select
              value={approvalFilter}
              onChange={(e) => {
                setApprovalFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={selectDropdown}
            >
              <option value="all">Moderation: All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={selectBox}>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={selectDropdown}
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
            </select>
          </div>
        </div>

        {/* Stock Status Filter Tabs & Price Controls */}
        <div style={filterBottomRow}>
          {/* Status Tabs */}
          <div style={statusTabsGroup}>
            <button
              onClick={() => {
                setStockStatus('all');
                setCurrentPage(1);
              }}
              style={{
                ...statusTabBtn,
                background: stockStatus === 'all' ? '#0f172a' : '#ffffff',
                color: stockStatus === 'all' ? '#ffffff' : '#475569',
                borderColor: stockStatus === 'all' ? '#0f172a' : '#e2e8f0',
              }}
            >
              All Products ({products.length})
            </button>

            <button
              onClick={() => {
                setStockStatus('instock');
                setCurrentPage(1);
              }}
              style={{
                ...statusTabBtn,
                background: stockStatus === 'instock' ? '#16a34a' : '#ffffff',
                color: stockStatus === 'instock' ? '#ffffff' : '#15803d',
                borderColor: stockStatus === 'instock' ? '#16a34a' : '#e2e8f0',
              }}
            >
              🟢 In Stock ({stats.optimalStockCount})
            </button>

            <button
              onClick={() => {
                setStockStatus('lowstock');
                setCurrentPage(1);
              }}
              style={{
                ...statusTabBtn,
                background: stockStatus === 'lowstock' ? '#ea580c' : '#ffffff',
                color: stockStatus === 'lowstock' ? '#ffffff' : '#c2410c',
                borderColor: stockStatus === 'lowstock' ? '#ea580c' : '#e2e8f0',
              }}
            >
              🟡 Low Stock ({stats.lowStockCount})
            </button>

            <button
              onClick={() => {
                setStockStatus('outofstock');
                setCurrentPage(1);
              }}
              style={{
                ...statusTabBtn,
                background: stockStatus === 'outofstock' ? '#dc2626' : '#ffffff',
                color: stockStatus === 'outofstock' ? '#ffffff' : '#b91c1c',
                borderColor: stockStatus === 'outofstock' ? '#dc2626' : '#e2e8f0',
              }}
            >
              🔴 Out of Stock ({stats.outOfStockCount})
            </button>
          </div>

          {/* Min / Max Price Filter Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Price:</span>
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              style={priceInputStyle}
            />
            <span style={{ color: '#cbd5e1' }}>—</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              style={priceInputStyle}
            />

            {activeFiltersCount > 0 && (
              <button onClick={resetAllFilters} style={clearAllBtn}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Products Table */}
      <div style={tableContainerCard} className="card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <div className="skeleton" style={{ width: '60px', height: '60px', margin: '0 auto 16px', borderRadius: '50%' }} />
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>Loading Inventory Catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={emptyTableState}>
            <Package size={48} color="#94a3b8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '12px', color: '#0f172a' }}>
              No products found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '360px', marginTop: '4px' }}>
              No items match your active filters. Try clearing search keywords or resetting status filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '16px' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Product Details</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Brand</th>
                  <th style={thStyle}>Pricing</th>
                  <th style={thStyle}>Inventory Level</th>
                  <th style={thStyle}>Approval Status</th>
                  <th style={thStyle}>Merchandising</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => {
                  const finalPrice = p.discountPrice || p.price;
                  const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                  const discountPct = hasDiscount
                    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                    : 0;

                  return (
                    <tr key={p._id} className="admin-table-row" style={trStyle}>
                      {/* Product details */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={p.name}
                            style={prodThumbnail}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                            }}
                          />
                          <div style={{ maxWidth: '280px' }}>
                            <strong style={prodNameText} title={p.name}>
                              {p.name}
                            </strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={skuBadge}>SKU: {p.slug}</span>
                              <Link
                                to={`/product/${p.slug}`}
                                target="_blank"
                                style={liveLinkIcon}
                                title="View in live storefront"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td style={tdStyle}>
                        <span style={categoryPill}>{p.categorySlug}</span>
                        {p.subcategory && (
                          <span style={subcategoryText}>{p.subcategory}</span>
                        )}
                      </td>

                      {/* Brand */}
                      <td style={tdStyle}>
                        <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                          {p.brand || 'CASA Basics'}
                        </strong>
                      </td>

                      {/* Pricing */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '0.92rem', color: '#1d4ed8' }}>
                            {formatINR(finalPrice)}
                          </strong>
                          {hasDiscount && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={originalStrikethrough}>{formatINR(p.price)}</span>
                              <span style={discountPillBadge}>-{discountPct}%</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock Level & Visual Bar */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '100px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: 800,
                                color:
                                  p.stock === 0
                                    ? '#dc2626'
                                    : p.stock <= 15
                                    ? '#ea580c'
                                    : '#16a34a',
                              }}
                            >
                              {p.stock === 0
                                ? 'Out of Stock'
                                : p.stock <= 15
                                ? `${p.stock} units (Low)`
                                : `${p.stock} in stock`}
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div style={stockBarTrack}>
                            <div
                              style={{
                                ...stockBarFill,
                                width: `${Math.min(100, Math.round((p.stock / 60) * 100))}%`,
                                background:
                                  p.stock === 0
                                    ? '#dc2626'
                                    : p.stock <= 15
                                    ? '#ea580c'
                                    : '#16a34a',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                (p.approvalStatus || 'approved') === 'approved'
                                  ? '#f0fdf4'
                                  : (p.approvalStatus === 'rejected')
                                  ? '#fef2f2'
                                  : '#fffbeb',
                              color:
                                (p.approvalStatus || 'approved') === 'approved'
                                  ? '#15803d'
                                  : (p.approvalStatus === 'rejected')
                                  ? '#b91c1c'
                                  : '#b45309',
                              border: `1px solid ${
                                (p.approvalStatus || 'approved') === 'approved'
                                  ? '#bbf7d0'
                                  : (p.approvalStatus === 'rejected')
                                  ? '#fecaca'
                                  : '#fde68a'
                              }`,
                            }}
                          >
                            {(p.approvalStatus || 'approved') === 'approved' && '✓ Approved'}
                            {p.approvalStatus === 'pending' && '⏳ In Review'}
                            {p.approvalStatus === 'rejected' && '✕ Rejected'}
                          </span>
                          {p.rejectionReason && (
                            <span style={{ fontSize: '0.68rem', color: '#b91c1c', maxWidth: '120px' }}>
                              {p.rejectionReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Merchandising Badges */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {p.isBestSeller && (
                            <span style={badgeBestSeller}>★ Best Seller</span>
                          )}
                          {p.isFeatured && (
                            <span style={badgeFeatured}>Featured</span>
                          )}
                          {!p.isBestSeller && !p.isFeatured && (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {p.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprovalChange(p._id, 'approved')}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  color: '#16a34a',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Approve Listing"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApprovalChange(p._id, 'rejected')}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#fef2f2',
                                  border: '1px solid #fee2e2',
                                  color: '#dc2626',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Reject Listing"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {p.approvalStatus === 'rejected' && (
                            <button
                              onClick={() => handleApprovalChange(p._id, 'approved')}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#2563eb',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Re-Approve Listing"
                            >
                              Re-Approve
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(p)}
                            style={{
                              padding: '6px',
                              borderRadius: '8px',
                              border: '1.5px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#2563eb',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                            title="Edit product SKU"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            style={deleteBtnStyle}
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        {filteredProducts.length > 0 && (
          <div style={paginationFooter}>
            <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of{' '}
              <strong>{filteredProducts.length}</strong> items
            </span>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...paginationNavBtn,
                    opacity: currentPage === 1 ? 0.4 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      style={{
                        ...pageNumberBtn,
                        background: currentPage === pNum ? '#2563eb' : '#ffffff',
                        color: currentPage === pNum ? '#ffffff' : '#0f172a',
                        borderColor: currentPage === pNum ? '#2563eb' : '#e2e8f0',
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    ...paginationNavBtn,
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Executive Add/Edit Product Modal */}
      {showAddModal && (
        <div style={modalOverlay}>
          <div style={modalBackdrop} onClick={() => !isSubmitting && setShowAddModal(false)} />
          <div
            className="admin-modal-card-box"
            style={{
              ...modalBox,
              maxWidth: '680px',
              padding: '28px',
              borderRadius: '20px',
              overflowY: 'auto',
              maxHeight: '90vh',
            }}
          >
            {/* Header */}
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    flexShrink: 0,
                  }}
                >
                  {editingProduct ? <Edit2 size={22} /> : <Plus size={22} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add Product to Catalog'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                    {editingProduct
                      ? 'Update listing specs, pricing margins, and catalog merchandising'
                      : 'Publish a new SKU directly to the CASA marketplace catalog'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowAddModal(false)}
                style={modalCloseBtn}
                title="Close"
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* SECTION 1: ESSENTIAL DETAILS */}
              <div>
                <label style={formLabel}>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jara Comfort Stretch Denim Jeans"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={formInput}
                />
              </div>

              <div className="admin-form-col-2" style={formTwoCol}>
                <div>
                  <label style={formLabel}>Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jara"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={formInput}
                  />
                </div>
                <div>
                  <label style={formLabel}>Department / Category *</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    style={formInput}
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={formLabel}>Subcategory Taxonomy *</label>
                {currentCategorySubcategories.length > 0 ? (
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    style={formInput}
                  >
                    {currentCategorySubcategories.map((s, idx) => (
                      <option key={s.slug || idx} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Jeans, Casual Wear"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    style={formInput}
                  />
                )}
              </div>

              {/* SECTION 2: PRICING & INVENTORY */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Pricing & Inventory Stock
                  </span>
                  {discountInfo.isValid && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#059669',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      ✓ Save ₹{discountInfo.saved} ({discountInfo.pct}% OFF)
                    </span>
                  )}
                  {discountInfo.isInvalid && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#dc2626',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      ⚠ Discount price cannot exceed MRP
                    </span>
                  )}
                </div>

                <div className="admin-form-col-3" style={formThreeCol}>
                  <div>
                    <label style={formLabel}>MRP Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="2499"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      style={formInput}
                    />
                  </div>
                  <div>
                    <label style={formLabel}>Discounted Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="1999"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      style={formInput}
                    />
                  </div>
                  <div>
                    <label style={formLabel}>Initial Stock *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="50"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      style={formInput}
                    />
                    {stockIndicator && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: stockIndicator.color,
                          background: stockIndicator.bg,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {stockIndicator.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: IMAGE UPLOAD & MEDIA */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <label style={{ ...formLabel, margin: 0 }}>Product Imagery & Photo *</label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Upload directly from your device or paste an image URL
                    </span>
                  </div>

                  {/* Mode switcher tabs */}
                  <div
                    style={{
                      display: 'inline-flex',
                      background: '#f1f5f9',
                      borderRadius: '8px',
                      padding: '3px',
                      gap: '4px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      style={{
                        border: 'none',
                        background: imageMode === 'upload' ? '#ffffff' : 'transparent',
                        color: imageMode === 'upload' ? '#2563eb' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        boxShadow: imageMode === 'upload' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <UploadCloud size={14} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      style={{
                        border: 'none',
                        background: imageMode === 'url' ? '#ffffff' : 'transparent',
                        color: imageMode === 'url' ? '#2563eb' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        boxShadow: imageMode === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ImageIcon size={14} />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* UPLOAD MODE */}
                {imageMode === 'upload' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      style={{ display: 'none' }}
                    />

                    {!imagePreview ? (
                      <div
                        className={`admin-dropzone ${isDragging ? 'dragging' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '14px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 10px',
                          }}
                        >
                          <UploadCloud size={26} />
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                          Drag & drop product photo here, or <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Browse from Computer</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                          Supports high-res PNG, JPG, JPEG, WEBP up to 8MB
                        </div>
                      </div>
                    ) : (
                      /* Preview Card */
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1.5px solid #bfdbfe',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={imagePreview}
                            alt="Uploaded preview"
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                              {imageFileInfo?.name || 'Product Photo Uploaded'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              {imageFileInfo?.size && (
                                <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                                  {imageFileInfo.size}
                                </span>
                              )}
                              <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Check size={11} /> Ready to publish
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* URL MODE */}
                {imageMode === 'url' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formData.imageUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, imageUrl: val });
                          setImagePreview(val);
                        }}
                        style={{ ...formInput, flex: 1 }}
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Thumbnail preview"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                          }}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '1px solid #e2e8f0',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>

                    {/* Quick Preset Buttons */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Quick 1-Click Sample Photos:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {PRESET_SAMPLE_IMAGES.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectPresetImage(p.url)}
                            style={{
                              fontSize: '0.7rem',
                              background: formData.imageUrl === p.url ? '#eff6ff' : '#f8fafc',
                              color: formData.imageUrl === p.url ? '#2563eb' : '#475569',
                              border: formData.imageUrl === p.url ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: PRODUCT DESCRIPTION */}
              <div>
                <label style={formLabel}>Product Description & Highlights</label>
                <textarea
                  rows={3}
                  placeholder="Key product highlights, material specs, fabric care, and premium features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...formInput, minHeight: '75px', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* SECTION 5: MERCHANDISING FLAGS */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: formData.isBestSeller ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: formData.isBestSeller ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    style={{ width: '17px', height: '17px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={14} color="#f97316" />
                      <span>Best Seller Badge</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                      Boosts listing in Best Sellers shelves
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: formData.isFeatured ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: formData.isFeatured ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    style={{ width: '17px', height: '17px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={14} color="#eab308" />
                      <span>Featured Showcase</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                      Highlights on homepage showcases
                    </div>
                  </div>
                </label>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="admin-modal-footer-btns" style={modalActions}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  style={modalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving & Publishing SKU...</span>
                    </>
                  ) : editingProduct ? (
                    <>
                      <Check size={16} />
                      <span>Save Product Changes</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Save & Publish Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* Styles */
const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '14px',
};

const pageTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: '900',
  color: '#0f172a',
  margin: 0,
  letterSpacing: '-0.025em',
};

const activeCountPill = {
  background: '#eff6ff',
  color: '#2563eb',
  fontSize: '0.75rem',
  fontWeight: '800',
  padding: '4px 10px',
  borderRadius: '9999px',
  border: '1px solid #bfdbfe',
};

const pageSubtitleStyle = {
  color: '#64748b',
  fontSize: '0.875rem',
  margin: '4px 0 0',
};

const addProductBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '11px 20px',
  borderRadius: '12px',
  fontWeight: 800,
  fontSize: '0.875rem',
  boxShadow: '0 8px 18px -4px rgba(37, 99, 235, 0.4)',
};

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
};

const kpiCard = {
  background: '#ffffff',
  borderRadius: '18px',
  padding: '20px',
  border: '1.5px solid #e2e8f0',
};

const kpiLabel = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const kpiValue = {
  fontSize: '1.65rem',
  fontWeight: 900,
  color: '#0f172a',
  margin: '4px 0 2px',
  letterSpacing: '-0.02em',
};

const kpiSub = {
  fontSize: '0.72rem',
  color: '#64748b',
  fontWeight: 600,
};

const kpiIconBox = {
  width: '46px',
  height: '46px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const chartsRow = {
  display: 'flex',
  gap: '18px',
  alignItems: 'stretch',
  flexWrap: 'wrap',
};

const chartCard = {
  flex: 1,
  minWidth: '320px',
  background: '#ffffff',
  borderRadius: '20px',
  border: '1.5px solid #e2e8f0',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const chartHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const chartTitle = {
  fontSize: '0.98rem',
  fontWeight: 800,
  color: '#0f172a',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const chartSubtitle = {
  fontSize: '0.74rem',
  color: '#64748b',
  margin: '2px 0 0',
};

const chartPillBadge = {
  fontSize: '0.7rem',
  fontWeight: 800,
  background: '#eff6ff',
  color: '#2563eb',
  padding: '3px 8px',
  borderRadius: '6px',
};

const barsContainer = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  height: '140px',
  paddingTop: '20px',
  gap: '12px',
};

const barColumn = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  position: 'relative',
  cursor: 'pointer',
};

const barTooltip = {
  position: 'absolute',
  top: '-35px',
  background: '#0f172a',
  color: '#ffffff',
  fontSize: '0.65rem',
  padding: '4px 8px',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
  zIndex: 10,
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  textAlign: 'center',
};

const barTrack = {
  flex: 1,
  width: '100%',
  maxHeight: '90px',
  display: 'flex',
  alignItems: 'flex-end',
  background: '#f1f5f9',
  borderRadius: '6px',
  overflow: 'hidden',
};

const barFill = {
  width: '100%',
  borderRadius: '6px 6px 0 0',
  transition: 'height 0.4s ease',
};

const barLabel = {
  fontSize: '0.65rem',
  color: '#64748b',
  fontWeight: 700,
  marginTop: '6px',
  textTransform: 'capitalize',
};

const barValueText = {
  fontSize: '0.72rem',
  fontWeight: 800,
  color: '#0f172a',
};

const gaugeRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
};

const gaugeTrack = {
  width: '100%',
  height: '8px',
  borderRadius: '9999px',
  background: '#f1f5f9',
  overflow: 'hidden',
};

const gaugeFill = {
  height: '100%',
  borderRadius: '9999px',
  transition: 'width 0.4s ease',
};

const filterCard = {
  background: '#ffffff',
  borderRadius: '18px',
  border: '1.5px solid #e2e8f0',
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const filterTopRow = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

const searchBoxWrapper = {
  flex: 1,
  minWidth: '240px',
  display: 'flex',
  alignItems: 'center',
  background: '#f8fafc',
  border: '1.5px solid #cbd5e1',
  borderRadius: '10px',
  overflow: 'hidden',
};

const searchInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '9px 12px',
  fontSize: '0.85rem',
  color: '#0f172a',
};

const clearIconBtn = {
  background: 'none',
  border: 'none',
  padding: '6px 10px',
  cursor: 'pointer',
  color: '#94a3b8',
};

const selectBox = {
  minWidth: '150px',
  border: '1.5px solid #cbd5e1',
  borderRadius: '10px',
  background: '#f8fafc',
  overflow: 'hidden',
};

const selectDropdown = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '9px 12px',
  fontSize: '0.825rem',
  fontWeight: 700,
  color: '#0f172a',
  cursor: 'pointer',
};

const filterBottomRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  paddingTop: '6px',
  borderTop: '1px solid #f1f5f9',
};

const statusTabsGroup = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const statusTabBtn = {
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const priceInputStyle = {
  width: '78px',
  padding: '6px 8px',
  borderRadius: '8px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.78rem',
  fontWeight: 700,
  outline: 'none',
};

const clearAllBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1px dashed #f87171',
  background: '#fef2f2',
  color: '#dc2626',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const tableContainerCard = {
  background: '#ffffff',
  borderRadius: '20px',
  border: '1.5px solid #e2e8f0',
  overflow: 'hidden',
  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
};

const emptyTableState = {
  padding: '60px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const productTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const thStyle = {
  padding: '14px 18px',
  background: '#f8fafc',
  fontSize: '0.72rem',
  fontWeight: 800,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '1.5px solid #e2e8f0',
};

const trStyle = {
  borderBottom: '1px solid #f1f5f9',
};

const tdStyle = {
  padding: '14px 18px',
  verticalAlign: 'middle',
};

const prodThumbnail = {
  width: '52px',
  height: '52px',
  borderRadius: '10px',
  objectFit: 'cover',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  flexShrink: 0,
};

const prodNameText = {
  fontSize: '0.875rem',
  color: '#0f172a',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.35,
};

const skuBadge = {
  fontSize: '0.68rem',
  color: '#64748b',
  fontFamily: 'monospace',
};

const liveLinkIcon = {
  color: '#2563eb',
  display: 'inline-flex',
  alignItems: 'center',
};

const categoryPill = {
  display: 'inline-block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#1e40af',
  background: '#eff6ff',
  padding: '3px 8px',
  borderRadius: '6px',
  textTransform: 'capitalize',
};

const subcategoryText = {
  display: 'block',
  fontSize: '0.7rem',
  color: '#64748b',
  marginTop: '2px',
};

const originalStrikethrough = {
  fontSize: '0.72rem',
  textDecoration: 'line-through',
  color: '#94a3b8',
};

const discountPillBadge = {
  fontSize: '0.65rem',
  fontWeight: 800,
  color: '#15803d',
  background: '#dcfce7',
  padding: '1px 5px',
  borderRadius: '4px',
};

const stockBarTrack = {
  width: '100%',
  height: '5px',
  borderRadius: '9999px',
  background: '#f1f5f9',
  overflow: 'hidden',
};

const stockBarFill = {
  height: '100%',
  borderRadius: '9999px',
};

const badgeBestSeller = {
  fontSize: '0.65rem',
  fontWeight: 800,
  color: '#b45309',
  background: '#fef3c7',
  padding: '2px 6px',
  borderRadius: '4px',
};

const badgeFeatured = {
  fontSize: '0.65rem',
  fontWeight: 800,
  color: '#4338ca',
  background: '#e0e7ff',
  padding: '2px 6px',
  borderRadius: '4px',
};

const deleteBtnStyle = {
  background: '#fef2f2',
  color: '#dc2626',
  border: '1px solid #fee2e2',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const paginationFooter = {
  padding: '14px 20px',
  background: '#ffffff',
  borderTop: '1px solid #f1f5f9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
};

const paginationNavBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  background: '#ffffff',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#0f172a',
};

const pageNumberBtn = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.78rem',
  fontWeight: 800,
  cursor: 'pointer',
};

/* Modal Styles */
const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const modalBackdrop = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(5px)',
};

const modalBox = {
  position: 'relative',
  background: '#ffffff',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '560px',
  padding: '24px',
  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  border: '1.5px solid #e2e8f0',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: 1,
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '20px',
  paddingBottom: '14px',
  borderBottom: '1px solid #f1f5f9',
};

const modalIconCircle = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: '#eff6ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const modalCloseBtn = {
  background: '#f8fafc',
  border: 'none',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const modalForm = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const formLabel = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '4px',
};

const formInput = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.85rem',
  color: '#0f172a',
  outline: 'none',
};

const formTwoCol = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
};

const formThreeCol = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
};

const modalActions = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '10px',
  paddingTop: '14px',
  borderTop: '1px solid #f1f5f9',
};

const modalCancelBtn = {
  padding: '10px 18px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  background: '#ffffff',
  color: '#475569',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

export default AdminProductsPage;
