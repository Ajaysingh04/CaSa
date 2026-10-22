import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  TrendingUp,
  Boxes,
  Edit3,
  Check,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  ShoppingBag,
  RotateCw,
  AlertCircle,
  DollarSign,
  Printer,
  FileText,
  Plus,
  X,
  Star,
  Award,
  Calendar,
  Building2,
  MapPin,
  CreditCard,
  ChevronRight,
  Sliders,
  HelpCircle,
  Copy,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { vendorService } from '../../services/vendorService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const VendorDashboardPage = () => {
  const { user, switchRole, login } = useAuth();
  const { success, error, info } = useToast();

  // Flipkart Seller Hub Tabs: 'dashboard' | 'orders' | 'inventory' | 'financials' | 'profile'
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Invoice / Packing slip modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Add Product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brand: user?.vendorStoreName || 'CASA Merchant',
    categorySlug: 'electronics',
    subcategory: 'Accessories',
    price: '',
    discountPrice: '',
    stock: 25,
    sku: `FSN-${Date.now().toString().slice(-6)}`,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: '',
  });

  // Editing product stock modal/inline
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsData, ordersData, productsData, finData] = await Promise.all([
        vendorService.getStats().catch(() => null),
        vendorService.getOrders(orderFilter).catch(() => []),
        vendorService.getProducts().catch(() => []),
        vendorService.getFinancials().catch(() => null),
      ]);
      setStats(statsData);
      setOrders(ordersData || []);
      setProducts(productsData || []);
      setFinancials(finData);
    } catch (err) {
      console.error('Failed to load vendor data:', err);
      error('Failed to load vendor records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderFilter, user]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      error('Please provide at least product name and price.');
      return;
    }
    setCreatingProduct(true);
    try {
      await vendorService.createProduct({
        ...newProd,
        price: Number(newProd.price),
        discountPrice: newProd.discountPrice ? Number(newProd.discountPrice) : null,
        stock: Number(newProd.stock || 10),
        images: [newProd.image],
      });
      success(`Product "${newProd.name}" added to Flipkart-style catalog successfully!`);
      setShowAddProductModal(false);
      setNewProd({
        name: '',
        brand: user?.vendorStoreName || 'CASA Merchant',
        categorySlug: 'electronics',
        subcategory: 'Accessories',
        price: '',
        discountPrice: '',
        stock: 25,
        sku: `FSN-${Date.now().toString().slice(-6)}`,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        description: '',
      });
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Could not create product.');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await vendorService.updateOrderStatus(orderId, newStatus, `Vendor handled milestone: ${newStatus}`);
      success(`Order updated to ${newStatus}! Dispatch SLA recorded.`);
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveProductStock = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await vendorService.updateProduct(editingProduct._id, {
        stock: Number(newStock),
        price: Number(newPrice),
      });
      success(`Updated stock & price for ${editingProduct.name}!`);
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update product.');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Flipkart Seller Hub Landing when not logged in
  if (!user) {
    return (
      <div style={{ background: '#f1f3f6', minHeight: '85vh', padding: '40px 16px 80px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Flipkart Seller Hub Brand Header */}
          <div
            style={{
              background: '#2874f0',
              borderRadius: '12px 12px 0 0',
              padding: '28px 32px',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(40, 116, 240, 0.2)',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  background: '#ffe500',
                  color: '#2874f0',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                ⚡
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  CaSa <span style={{ color: '#ffe500' }}>Seller Hub</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#dbeafe', fontWeight: 600 }}>
                  GROW YOUR BUSINESS WITH 50 CRORE+ REGISTERED BUYERS
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: '0 0 12px 12px',
              padding: '36px 32px',
              border: '1px solid #dfe3e8',
              borderTop: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#e8f0fe',
                color: '#1a73e8',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              <Award size={14} /> Flipkart Certified Merchant Ecosystem
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#212121', margin: '0 0 10px' }}>
              Welcome to CaSa Seller Hub
            </h2>
            <p style={{ color: '#878787', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 24px' }}>
              Access fast order fulfillment pipelines, automated packing slips, instant inventory stock replenishment, and regular T+2 direct bank settlements.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={async () => {
                  const res = await login({ email: 'vendor@casa.in', password: 'Vendor@Casa2026' });
                  if (res.success) {
                    success('Welcome to CaSa Seller Hub! Partner Merchant session active.');
                  }
                }}
                style={{
                  padding: '14px 20px',
                  borderRadius: '4px',
                  background: '#fb641b',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(251, 100, 27, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Sparkles size={18} /> ⚡ Launch 1-Click Vendor Demo Portal
              </button>

              <Link
                to="/login?redirect=/vendor"
                style={{
                  padding: '12px 20px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  color: '#2874f0',
                  border: '1.5px solid #2874f0',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                Sign In With Existing Seller Account
              </Link>
            </div>

            {/* Flipkart Seller Perks Grid */}
            <div
              style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #f1f3f6',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: '#388e3c', fontSize: '1rem' }}>T+2</div>
                <div style={{ fontSize: '0.72rem', color: '#878787', marginTop: '2px' }}>Rolling Payouts</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#2874f0', fontSize: '1rem' }}>0%</div>
                <div style={{ fontSize: '0.72rem', color: '#878787', marginTop: '2px' }}>Listing Fee</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#fb641b', fontSize: '1rem' }}>50 Cr+</div>
                <div style={{ fontSize: '0.72rem', color: '#878787', marginTop: '2px' }}>Pan-India Reach</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f3f6', minHeight: '92vh', paddingBottom: '60px' }}>
      <style>{`
        .fk-seller-header {
          background: #2874f0;
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .fk-subnav {
          background: #ffffff;
          border-bottom: 1px solid #dfe3e8;
        }
        .fk-tab-btn {
          padding: 14px 20px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #212121;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .fk-tab-btn:hover {
          color: #2874f0;
          background: #f9fbfd;
        }
        .fk-tab-btn.active {
          color: #2874f0;
          border-bottom: 3px solid #2874f0;
          font-weight: 800;
        }
        .fk-card {
          background: #ffffff;
          border: 1px solid #dfe3e8;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .fk-btn-primary {
          background: #fb641b;
          color: #ffffff;
          border: none;
          border-radius: 2px;
          padding: 9px 18px;
          font-weight: 700;
          font-size: 0.84rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          transition: all 0.15s ease;
        }
        .fk-btn-primary:hover {
          background: #e65510;
        }
        .fk-btn-outline {
          background: #ffffff;
          color: #2874f0;
          border: 1.5px solid #2874f0;
          border-radius: 2px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 0.84rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .fk-btn-outline:hover {
          background: #f1f7ff;
        }
        .fk-assured-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #2874f0;
          color: #ffffff;
          padding: 2px 7px;
          border-radius: 3px;
          font-size: 0.68rem;
          font-weight: 900;
          font-style: italic;
          letter-spacing: 0.02em;
        }
        .fk-assured-star {
          color: #ffe500;
          font-size: 0.72rem;
        }
        .fk-rating-badge {
          background: #388e3c;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 2px 7px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .fk-filter-pill {
          padding: 6px 14px;
          border-radius: 2px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid #dfe3e8;
          background: #ffffff;
          color: #212121;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .fk-filter-pill:hover {
          border-color: #2874f0;
        }
        .fk-filter-pill.active {
          background: #2874f0;
          color: #ffffff;
          border-color: #2874f0;
        }
      `}</style>

      {/* TOP BRAND HEADER - FLIPKART SELLER HUB STYLE */}
      <div className="fk-seller-header">
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Logo & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/vendor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: '#ffe500',
                  color: '#2874f0',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    CaSa
                  </span>
                  <span
                    style={{
                      background: '#ffe500',
                      color: '#2874f0',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Seller Hub
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#dbeafe', letterSpacing: '0.02em', fontWeight: 600 }}>
                  PARTNER MERCHANT PORTAL
                </div>
              </div>
            </Link>

            {/* Flipkart Assured Badge */}
            <div className="fk-assured-tag" style={{ marginLeft: '6px' }}>
              <span>CaSa Assured</span>
              <span className="fk-assured-star">★</span>
            </div>
          </div>

          {/* Center: Search Orders & SKU */}
          <div style={{ position: 'relative', minWidth: '280px', maxWidth: '380px', flex: 1, display: 'none', md: 'block' }}>
            <input
              type="text"
              placeholder="Search by Order ID, SKU, or Title..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                if (activeTab !== 'inventory') setActiveTab('inventory');
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '3px',
                border: 'none',
                fontSize: '0.82rem',
                outline: 'none',
                background: '#ffffff',
                color: '#212121',
              }}
            />
            <Search size={15} color="#878787" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          {/* Right: Seller Profile & Switchers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* SLA Badge */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '4px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Clock size={13} color="#ffe500" />
              <span>SLA Cutoff: 4:30 PM (99.4% On-Time)</span>
            </div>

            {/* Seller Rating */}
            <div className="fk-rating-badge" title="Seller Performance Rating">
              <span>4.8</span>
              <Star size={11} fill="#ffffff" color="#ffffff" />
            </div>

            {/* Store Name Dropdown Pill */}
            <div
              style={{
                background: '#ffffff',
                color: '#212121',
                borderRadius: '3px',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
              }}
            >
              <Store size={14} color="#2874f0" />
              <span>{user?.vendorStoreName || user?.name || 'Verified Merchant'}</span>
            </div>

            {/* Quick Switch Button to User / Delivery */}
            <button
              onClick={() => switchRole('user')}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Switch to customer marketplace"
            >
              🛒 Buyer Store
            </button>

            <button
              onClick={loadData}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Refresh Seller Hub Data"
            >
              <RotateCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* FLIPKART SELLER HUB SUB-NAVBAR TABS */}
      <div className="fk-subnav">
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`fk-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <TrendingUp size={16} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`fk-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Package size={16} />
              <span>
                Orders & Fulfillment ({orders.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`fk-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            >
              <Boxes size={16} />
              <span>
                Listings & Catalog ({products.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`fk-tab-btn ${activeTab === 'financials' ? 'active' : ''}`}
            >
              <DollarSign size={16} />
              <span>Payments & Settlements</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`fk-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <Building2 size={16} />
              <span>Store KYC & Business Profile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            className="fk-btn-primary"
            style={{ margin: '8px 0', flexShrink: 0 }}
          >
            <Plus size={15} /> + Add Single Listing
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: '1360px', margin: '20px auto 0', padding: '0 20px' }}>
        {/* NON-VENDOR ROLE WARNING BANNER */}
        {user.role !== 'vendor' && user.role !== 'admin' && (
          <div
            style={{
              background: '#fff9e6',
              border: '1px solid #ffe599',
              borderRadius: '4px',
              padding: '12px 18px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#d97706" />
              <div>
                <strong style={{ color: '#8c5800', fontSize: '0.86rem' }}>
                  Viewing with: {user.name} ({user.role.toUpperCase()})
                </strong>
                <div style={{ color: '#a66a00', fontSize: '0.78rem' }}>
                  Switch your account persona to Vendor Partner to update order dispatches and manage catalog inventory.
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                await switchRole('vendor');
                success('Switched to Flipkart Vendor Partner mode!');
              }}
              className="fk-btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.78rem' }}
            >
              ⚡ Switch to Vendor Partner
            </button>
          </div>
        )}

        {/* FLIPKART FESTIVE / SELLER NOTICE ANNOUNCEMENT */}
        <div
          style={{
            background: 'linear-gradient(90deg, #e8f0fe 0%, #fef3c7 100%)',
            border: '1px solid #c2dbfe',
            borderRadius: '4px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#2874f0',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              📢
            </div>
            <div>
              <strong style={{ fontSize: '0.86rem', color: '#1a73e8' }}>
                Festive Mega Sale Season Readiness: Keep your listings in stock!
              </strong>
              <div style={{ fontSize: '0.76rem', color: '#4b5563', marginTop: '2px' }}>
                Maintain 99%+ SLA on-time dispatch and at least 15 units stock to stay eligible for Flipkart-style <strong>CaSa Assured</strong> badge and 3x organic impressions.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#388e3c' }}>
              ✓ Current SLA: 99.4% (Tier 1 Gold)
            </span>
          </div>
        </div>

        {/* FLIPKART SELLER SCORECARD (KPI METRICS ROW) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
          }}
        >
          {/* Card 1: Revenue */}
          <div className="fk-card" style={{ padding: '18px 20px', borderLeft: '4px solid #2874f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800, letterSpacing: '0.04em' }}>
                  GROSS REVENUE (LIFETIME)
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#212121', marginTop: '6px' }}>
                  {formatINR(stats?.totalRevenue || 0)}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '4px', background: '#e8f0fe', color: '#2874f0' }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.74rem' }}>
              <span style={{ color: '#388e3c', fontWeight: 800 }}>▲ +14.8%</span>
              <span style={{ color: '#878787' }}>vs last settlement period</span>
            </div>
          </div>

          {/* Card 2: Pending Dispatch */}
          <div className="fk-card" style={{ padding: '18px 20px', borderLeft: '4px solid #fb641b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800, letterSpacing: '0.04em' }}>
                  PENDING TO PACK & DISPATCH
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fb641b', marginTop: '6px' }}>
                  {stats?.pendingToPack || 0}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '4px', background: '#fff0e8', color: '#fb641b' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.74rem' }}>
              <span style={{ color: '#fb641b', fontWeight: 700 }}>⚡ SLA Cutoff 4:30 PM</span>
              <span style={{ color: '#878787' }}>• Pack & label now</span>
            </div>
          </div>

          {/* Card 3: Ready for Courier Pickup */}
          <div className="fk-card" style={{ padding: '18px 20px', borderLeft: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800, letterSpacing: '0.04em' }}>
                  PACKED & AWAITING COURIER
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#7c3aed', marginTop: '6px' }}>
                  {stats?.packedOrders || 0}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '4px', background: '#f5f3ff', color: '#7c3aed' }}>
                <Truck size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.74rem' }}>
              <span style={{ color: '#7c3aed', fontWeight: 700 }}>Courier Partner:</span>
              <span style={{ color: '#878787' }}>Delhivery Express</span>
            </div>
          </div>

          {/* Card 4: Catalog Listings */}
          <div className="fk-card" style={{ padding: '18px 20px', borderLeft: '4px solid #388e3c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800, letterSpacing: '0.04em' }}>
                  ACTIVE LIVE LISTINGS
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#388e3c', marginTop: '6px' }}>
                  {stats?.productsCount || products.length}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '4px', background: '#eafaf1', color: '#388e3c' }}>
                <Boxes size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.74rem' }}>
              <span style={{ color: '#388e3c', fontWeight: 700 }}>100% Live</span>
              <span style={{ color: '#878787' }}>on Marketplace</span>
            </div>
          </div>
        </div>

        {/* TAB CONTENT: 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Action Bar */}
            <div className="fk-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#212121' }}>
                  Seller Performance & Operations Center
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#878787' }}>
                  Manage listings health, track daily order dispatch speed, and review rolling weekly financial settlements.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="fk-btn-primary"
                >
                  <Package size={15} /> View Active Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="fk-btn-outline"
                >
                  <Plus size={15} /> Add Product
                </button>
              </div>
            </div>

            {/* Seller Scorecard & Growth Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Box 1: SLA and Tier */}
              <div className="fk-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f1f3f6', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="#2874f0" />
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#212121' }}>Seller Tier & Compliance</span>
                  </div>
                  <span className="fk-rating-badge">
                    4.8 <Star size={11} fill="#ffffff" color="#ffffff" />
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#878787' }}>Tier Status:</span>
                    <strong style={{ color: '#b45309' }}>Gold Tier (Tier 1 Seller)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#878787' }}>On-Time Dispatch SLA:</span>
                    <strong style={{ color: '#388e3c' }}>99.4% (Exceeds Target 98%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#878787' }}>Cancellation Rate:</span>
                    <strong style={{ color: '#388e3c' }}>0.18% (Benchmark &lt; 1.0%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#878787' }}>Return / RTO Rate:</span>
                    <strong style={{ color: '#2874f0' }}>1.8% (Healthy)</strong>
                  </div>
                </div>
              </div>

              {/* Box 2: Next Settlement Snapshot */}
              <div className="fk-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f1f3f6', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="#388e3c" />
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#212121' }}>Next Bank Settlement</span>
                  </div>
                  <span style={{ background: '#eafaf1', color: '#388e3c', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '3px' }}>
                    T+2 CYCLE
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#388e3c' }}>
                    {formatINR(financials?.summary?.netPayoutEarned || 0)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#878787' }}>
                    Scheduled Direct Deposit to HDFC Bank (**** 9081) on <strong>{financials?.summary?.nextSettlementDate || 'Upcoming Friday'}</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('financials')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#2874f0',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      marginTop: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View detailed statements & deductions <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 2. ORDERS & FULFILLMENT */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Pipeline Header */}
            <div className="fk-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#878787', marginRight: '4px' }}>
                  FILTER BY PIPELINE:
                </span>
                {[
                  { key: 'ALL', label: 'All Orders' },
                  { key: 'Confirmed', label: 'New / To Pack' },
                  { key: 'Processing', label: 'In Progress' },
                  { key: 'Packed', label: 'Ready for Courier' },
                  { key: 'Shipped', label: 'Dispatched (In Transit)' },
                  { key: 'Delivered', label: 'Delivered' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setOrderFilter(st.key)}
                    className={`fk-filter-pill ${orderFilter === st.key ? 'active' : ''}`}
                  >
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#878787' }}>
                Showing <strong>{orders.length}</strong> customer shipments
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="fk-card" style={{ height: '140px', background: '#ffffff', opacity: 0.7 }} />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="fk-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Package size={52} color="#878787" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#212121', margin: '0 0 6px' }}>
                  No Orders in this Status
                </h3>
                <p style={{ color: '#878787', fontSize: '0.88rem', margin: '0 0 16px' }}>
                  There are currently no customer orders matching "{orderFilter}".
                </p>
                <button onClick={() => setOrderFilter('ALL')} className="fk-btn-primary">
                  View All Orders
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {orders.map((order) => {
                  const isUpdating = updatingOrderId === order._id;
                  const isReadyToPack = ['Confirmed', 'Processing'].includes(order.orderStatus);

                  return (
                    <div key={order._id} className="fk-card" style={{ overflow: 'hidden' }}>
                      {/* Order Strip Top */}
                      <div
                        style={{
                          background: '#f9fbfd',
                          borderBottom: '1px solid #dfe3e8',
                          padding: '12px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#878787', fontWeight: 800 }}>ORDER ID:</span>{' '}
                            <strong style={{ fontSize: '0.92rem', color: '#2874f0', letterSpacing: '0.02em' }}>
                              #{order.orderNumber}
                            </strong>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: '#878787' }}>
                            Placed on: <strong>{formatDate(order.createdAt)}</strong>
                          </div>

                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '3px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background:
                                order.orderStatus === 'Delivered'
                                  ? '#eafaf1'
                                  : order.orderStatus === 'Packed'
                                  ? '#f5f3ff'
                                  : order.orderStatus === 'Shipped'
                                  ? '#e8f0fe'
                                  : '#fff0e8',
                              color:
                                order.orderStatus === 'Delivered'
                                  ? '#388e3c'
                                  : order.orderStatus === 'Packed'
                                  ? '#7c3aed'
                                  : order.orderStatus === 'Shipped'
                                  ? '#2874f0'
                                  : '#fb641b',
                            }}
                          >
                            ● {order.orderStatus?.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#212121' }}>
                            {formatINR(order.totalPrice)}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#878787', fontWeight: 700 }}>
                            {order.paymentMethod?.toUpperCase()} ({order.isPaid ? 'PREPAID' : 'COD'})
                          </span>
                        </div>
                      </div>

                      {/* Items + Buyer Information */}
                      <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        {/* Items Column */}
                        <div style={{ flex: 1, minWidth: '280px' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#878787', marginBottom: '8px', letterSpacing: '0.04em' }}>
                            ORDERED ITEMS ({order.items?.length || 0}):
                          </div>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #dfe3e8' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#212121', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.name}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#878787', marginTop: '2px' }}>
                                  SKU: <strong>{item.sku || `FSN-${item.product?.slice(-6) || 'STD'}`}</strong> • Qty: <strong>{item.quantity}</strong> • {formatINR(item.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Customer & Shipping Destination */}
                        <div
                          style={{
                            minWidth: '240px',
                            maxWidth: '320px',
                            background: '#f9fbfd',
                            border: '1px solid #eef2f6',
                            borderRadius: '4px',
                            padding: '12px 14px',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div style={{ fontSize: '0.7rem', color: '#878787', fontWeight: 800, marginBottom: '4px' }}>
                            DELIVERY DESTINATION:
                          </div>
                          <div style={{ fontWeight: 800, color: '#212121' }}>
                            {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                          </div>
                          <div style={{ color: '#555', marginTop: '2px', lineHeight: 1.4 }}>
                            {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                          </div>
                          <div style={{ marginTop: '4px', color: '#2874f0', fontWeight: 700 }}>
                            Phone: {order.shippingAddress?.phone || order.user?.phone || 'Provided at Dispatch'}
                          </div>
                          {order.deliveryPartnerName && (
                            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #dfe3e8', fontSize: '0.74rem', color: '#388e3c', fontWeight: 700 }}>
                              🚚 Assigned Courier: {order.deliveryPartnerName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions: Step-by-Step Vendor Fulfillment */}
                      <div
                        style={{
                          background: '#f9fbfd',
                          borderTop: '1px solid #dfe3e8',
                          padding: '10px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#878787' }}>
                            SLA Compliance: <strong style={{ color: '#388e3c' }}>Within 24h Window</strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="fk-btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          >
                            <Printer size={13} /> Packing Slip / Invoice
                          </button>

                          {order.orderStatus === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Processing')}
                              disabled={isUpdating}
                              className="fk-btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                            >
                              📦 Confirm & Pack
                            </button>
                          )}

                          {['Confirmed', 'Processing'].includes(order.orderStatus) && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Packed')}
                              disabled={isUpdating}
                              className="fk-btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.78rem', background: '#7c3aed' }}
                            >
                              🏷️ Mark Ready for Courier
                            </button>
                          )}

                          {order.orderStatus === 'Packed' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                              disabled={isUpdating}
                              className="fk-btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.78rem', background: '#388e3c' }}
                            >
                              🚚 Hand Over to Logistics (Dispatch)
                            </button>
                          )}

                          <Link
                            to={`/orders/${order._id}`}
                            className="fk-btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: 3. LISTINGS & INVENTORY */}
        {activeTab === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top Toolbar */}
            <div className="fk-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                <input
                  type="text"
                  placeholder="Search listings by title, brand, or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '3px',
                    border: '1px solid #dfe3e8',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
                <Search size={16} color="#878787" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '0.82rem', color: '#878787' }}>
                  Showing <strong>{filteredProducts.length}</strong> active SKUs
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="fk-btn-primary"
                >
                  <Plus size={15} /> + Add Single Listing
                </button>
              </div>
            </div>

            {/* Flipkart Style Product Table / Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '14px',
              }}
            >
              {filteredProducts.map((p) => {
                const isLowStock = (p.stock || 0) < 5;

                return (
                  <div
                    key={p._id}
                    className="fk-card"
                    style={{
                      padding: '14px',
                      display: 'flex',
                      gap: '12px',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={p.image || p.images?.[0]}
                      alt={p.name}
                      style={{
                        width: '74px',
                        height: '74px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #dfe3e8',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="fk-assured-tag" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                          CaSa Assured
                        </span>
                        {p.brand && (
                          <span style={{ fontSize: '0.7rem', color: '#878787', fontWeight: 700 }}>
                            {p.brand}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#212121',
                          marginTop: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={p.name}
                      >
                        {p.name}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#212121' }}>
                          {formatINR(p.discountPrice || p.price)}
                        </span>
                        {p.discountPrice && (
                          <span style={{ fontSize: '0.76rem', color: '#878787', textDecoration: 'line-through' }}>
                            {formatINR(p.price)}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isLowStock ? '#fee2e2' : '#eafaf1',
                            color: isLowStock ? '#dc2626' : '#388e3c',
                          }}
                        >
                          {isLowStock ? `⚠️ Low Stock: ${p.stock || 0}` : `In Stock: ${p.stock || 0} units`}
                        </span>

                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setNewStock(String(p.stock || 0));
                            setNewPrice(String(p.price || 0));
                          }}
                          className="fk-btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          <Edit3 size={11} /> Update Stock
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 4. PAYMENTS & SETTLEMENTS */}
        {activeTab === 'financials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Financial Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
              }}
            >
              <div className="fk-card" style={{ padding: '18px 20px', borderTop: '4px solid #2874f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800 }}>
                  GROSS MERCHANDISE VALUE (GMV)
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#212121', marginTop: '6px' }}>
                  {formatINR(financials?.summary?.totalGrossSales || 0)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#878787' }}>
                  From {financials?.summary?.deliveredOrdersCount || 0} fulfilled customer deliveries
                </span>
              </div>

              <div className="fk-card" style={{ padding: '18px 20px', borderTop: '4px solid #dc2626' }}>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800 }}>
                  MARKETPLACE COMMISSION ({financials?.summary?.commissionRate || 8}%)
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626', marginTop: '6px' }}>
                  - {formatINR(financials?.summary?.platformCommission || 0)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#878787' }}>
                  Payment gateway, technology, & logistics fee
                </span>
              </div>

              <div className="fk-card" style={{ padding: '18px 20px', borderTop: '4px solid #388e3c' }}>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800 }}>
                  NET PAYOUT CLEARED
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#388e3c', marginTop: '6px' }}>
                  {formatINR(financials?.summary?.netPayoutEarned || 0)}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#388e3c', fontWeight: 700 }}>
                  92% Net Merchant Disbursement
                </span>
              </div>

              <div className="fk-card" style={{ padding: '18px 20px', borderTop: '4px solid #7c3aed' }}>
                <span style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 800 }}>
                  NEXT DISBURSEMENT CYCLE
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7c3aed', marginTop: '6px' }}>
                  {financials?.summary?.nextSettlementDate || 'Upcoming Friday'}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#878787' }}>
                  Direct NEFT/IMPS Bank Transfer
                </span>
              </div>
            </div>

            {/* Bank Verification Strip */}
            <div
              className="fk-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#f9fbfd',
              }}
            >
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#212121' }}>
                  Disbursement Account: {user?.vendorStoreName || user?.businessName || 'CASA Merchant Hub'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#878787', marginTop: '3px' }}>
                  Bank: <strong>HDFC Bank Ltd</strong> • Account: <strong>50200084920194</strong> • IFSC: <strong>HDFC0000412</strong> • GSTIN: <strong>{user?.gstNumber || '23AAACA9876Q1Z5'}</strong>
                </div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '3px', background: '#eafaf1', color: '#388e3c', fontSize: '0.75rem', fontWeight: 800 }}>
                ✓ Bank Account Verified & Active
              </span>
            </div>

            {/* Settlement Ledger Table */}
            <div className="fk-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #dfe3e8' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#212121', margin: 0 }}>
                  Flipkart Seller Settlement Ledger
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#878787', margin: '4px 0 0' }}>
                  Record of weekly automated bank payouts processed to your registered merchant account.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fbfd', borderBottom: '1px solid #dfe3e8', color: '#878787', fontSize: '0.74rem', fontWeight: 800 }}>
                      <th style={{ padding: '12px 16px' }}>SETTLEMENT ID</th>
                      <th style={{ padding: '12px 16px' }}>SETTLEMENT DATE</th>
                      <th style={{ padding: '12px 16px' }}>GROSS SALES</th>
                      <th style={{ padding: '12px 16px' }}>PLATFORM FEE (8%)</th>
                      <th style={{ padding: '12px 16px' }}>NET DISBURSED</th>
                      <th style={{ padding: '12px 16px' }}>BANK UTR</th>
                      <th style={{ padding: '12px 16px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!financials?.settlementHistory || financials.settlementHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#878787' }}>
                          No settlement records found yet. First payout occurs following your initial completed order delivery.
                        </td>
                      </tr>
                    ) : (
                      financials.settlementHistory.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f3f6' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#2874f0' }}>{s.id}</td>
                          <td style={{ padding: '12px 16px', color: '#555' }}>{s.date}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>{formatINR(s.gross)}</td>
                          <td style={{ padding: '12px 16px', color: '#dc2626' }}>- {formatINR(s.commission)}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 900, color: '#388e3c' }}>{formatINR(s.net)}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#555' }}>{s.utr}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: s.status === 'Completed' ? '#eafaf1' : '#fff0e8',
                                color: s.status === 'Completed' ? '#388e3c' : '#fb641b',
                              }}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 5. STORE KYC & BUSINESS PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="fk-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #dfe3e8', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#212121', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={20} color="#2874f0" /> Flipkart Verified Seller Profile
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#878787' }}>
                    Statutory business identification, tax registrations, and dispatch hub address.
                  </p>
                </div>
                <Link to="/profile" className="fk-btn-outline" style={{ textDecoration: 'none' }}>
                  <Edit3 size={14} /> Manage Store Profile
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                <div style={{ background: '#f9fbfd', border: '1px solid #dfe3e8', borderRadius: '4px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#878787', textTransform: 'uppercase' }}>REGISTERED STORE NAME</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#212121', marginTop: '4px' }}>
                    {user?.vendorStoreName || 'Aarav Luxury Handlooms & Apparel'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#878787', marginTop: '4px' }}>
                    Merchant ID: <strong style={{ color: '#2874f0' }}>VND-MP-4520</strong>
                  </div>
                </div>

                <div style={{ background: '#f9fbfd', border: '1px solid #dfe3e8', borderRadius: '4px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#878787', textTransform: 'uppercase' }}>TAX & STATUTORY REGISTRATIONS</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#212121', marginTop: '4px' }}>
                    GSTIN: <strong>23AAACA9876Q1Z5</strong> (Verified)
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#555', marginTop: '3px' }}>
                    PAN: <strong>AAACA9876Q</strong> • MSME: <strong>UDYAM-MP-26-0048123</strong>
                  </div>
                </div>

                <div style={{ background: '#f9fbfd', border: '1px solid #dfe3e8', borderRadius: '4px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#878787', textTransform: 'uppercase' }}>PRIMARY LOGISTICS PICKUP HUB</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#212121', marginTop: '4px' }}>
                    Indore Central Logistics & Textile Hub #14
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '3px' }}>
                    Plot 14-B, Sector C, Sanwer Road Industrial Area, Indore, MP - 452015
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: FLIPKART TAX INVOICE & PACKING SLIP */}
      {selectedInvoiceOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '16px',
          }}
        >
          <div
            className="fk-card"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dfe3e8', paddingBottom: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#2874f0" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#212121' }}>
                  TAX INVOICE & SHIPPING SLIP (FLIPKART FORMAT)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#878787' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Slip Paper Box */}
            <div style={{ border: '1.5px solid #212121', padding: '20px', background: '#ffffff' }}>
              {/* Top Seller Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #212121', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#878787', fontWeight: 800 }}>SOLD BY (REGISTERED SELLER):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#212121' }}>
                    {user?.vendorStoreName || 'Aarav Luxury Handlooms & Apparel Pvt Ltd'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#555' }}>
                    GSTIN: <strong>{user?.gstNumber || '23AAACA9876Q1Z5'}</strong> • PAN: <strong>AAACA9876Q</strong>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#555' }}>
                    Hub: Plot 14-B, Sector C, Sanwer Road Industrial Area, Indore - 452015
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="fk-assured-tag" style={{ marginBottom: '4px' }}>
                    <span>CaSa Assured</span> ★
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#878787', fontWeight: 800 }}>ORDER ID:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#2874f0' }}>
                    #{selectedInvoiceOrder.orderNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#555' }}>
                    Date: {formatDateTime(selectedInvoiceOrder.createdAt)}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#388e3c' }}>
                    {selectedInvoiceOrder.paymentMethod?.toUpperCase()} ({selectedInvoiceOrder.isPaid ? 'PAID' : 'COD'})
                  </div>
                </div>
              </div>

              {/* Barcode & Courier Routing Placeholder */}
              <div style={{ background: '#f9fbfd', borderBottom: '1px solid #dfe3e8', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#878787', fontWeight: 800 }}>COURIER AWB / TRACKING:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.92rem', color: '#212121' }}>
                    AWB-FK-{selectedInvoiceOrder.orderNumber?.replace(/[^0-9]/g, '') || '987213'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#878787' }}>
                  Routing Code: <strong>MP-IND-EXPR-D2D</strong>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ padding: '12px 0', borderBottom: '1px solid #dfe3e8' }}>
                <div style={{ fontSize: '0.7rem', color: '#878787', fontWeight: 800 }}>SHIP TO (CUSTOMER):</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#212121', marginTop: '2px' }}>
                  {selectedInvoiceOrder.shippingAddress?.fullName || selectedInvoiceOrder.user?.name || 'Customer'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#444', lineHeight: 1.4 }}>
                  {selectedInvoiceOrder.shippingAddress?.street}, {selectedInvoiceOrder.shippingAddress?.city}, {selectedInvoiceOrder.shippingAddress?.state} - {selectedInvoiceOrder.shippingAddress?.pincode}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#2874f0', fontWeight: 700, marginTop: '3px' }}>
                  Contact: {selectedInvoiceOrder.shippingAddress?.phone || selectedInvoiceOrder.user?.phone || 'Verified'}
                </div>
              </div>

              {/* Itemized Table */}
              <div style={{ marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f3f6', borderBottom: '1px solid #dfe3e8', textAlign: 'left', color: '#555' }}>
                      <th style={{ padding: '8px' }}>Product Description</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoiceOrder.items?.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f3f6' }}>
                        <td style={{ padding: '8px' }}>
                          <strong style={{ color: '#212121' }}>{item.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#878787' }}>
                            SKU: {item.sku || `FSN-${item.product?.slice(-6) || 'PROD'}`}
                          </div>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800 }}>{item.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatINR(item.price)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>{formatINR(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '1.5px solid #212121' }}>
                      <td colSpan="3" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.9rem' }}>
                        Total Amount Payable:
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 900, fontSize: '1.05rem', color: '#212121' }}>
                        {formatINR(selectedInvoiceOrder.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="fk-btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="fk-btn-primary"
              >
                <Printer size={15} /> Print Packing Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SINGLE PRODUCT (FLIPKART STYLE) */}
      {showAddProductModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '16px',
          }}
        >
          <div
            className="fk-card"
            style={{
              maxWidth: '640px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dfe3e8', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#212121' }}>
                  Create Single Catalog Listing
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#878787' }}>
                  Publish your product with FSN code, pricing, and fulfillment inventory
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#878787' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Silk Banarasi Saree with Zari Border"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    FSN / SKU Code
                  </label>
                  <input
                    type="text"
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Marketplace Category
                  </label>
                  <select
                    value={newProd.categorySlug}
                    onChange={(e) => setNewProd({ ...newProd, categorySlug: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="home">Home & Furniture</option>
                    <option value="beauty">Beauty & Grooming</option>
                    <option value="sports">Sports & Fitness</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Subcategory / Vertical
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handloom Sarees"
                    value={newProd.subcategory}
                    onChange={(e) => setNewProd({ ...newProd, subcategory: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Maximum Retail Price (MRP ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4999"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Flipkart Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2499"
                    value={newProd.discountPrice}
                    onChange={(e) => setNewProd({ ...newProd, discountPrice: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Initial Inventory Units Available
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    High-Resolution Image URL
                  </label>
                  <input
                    type="url"
                    value={newProd.image}
                    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                    Key Product Highlights & Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Fabric details, weave type, wash care instructions, pack contains..."
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="fk-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="fk-btn-primary"
                >
                  {creatingProduct ? 'Publishing...' : 'Publish Listing to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT STOCK & PRICE */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '16px',
          }}
        >
          <div
            className="fk-card"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '22px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#212121', margin: '0 0 6px' }}>
              Update Stock & Listing Price
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#878787', margin: '0 0 16px' }}>
              {editingProduct.name}
            </p>

            <form onSubmit={handleSaveProductStock}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                  Available Inventory (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#212121', marginBottom: '4px' }}>
                  Listing Selling Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #dfe3e8', borderRadius: '3px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="fk-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fk-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;
