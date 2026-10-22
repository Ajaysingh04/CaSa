import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Mail,
  Bell,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShoppingBag,
  Eye,
  CheckCircle,
  Clock,
  Printer,
  Plus,
  X,
  Edit3,
  Copy,
  Check,
  Building2,
  Sliders,
  Award,
  ShieldCheck,
  MapPin,
  ExternalLink,
  ChevronRight,
  Rocket,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import VendorStoreSettings from './VendorStoreSettings';

const ProfessionalVendorProfile = ({ user, onProfileUpdated }) => {
  const { switchRole } = useAuth();
  const { success, error } = useToast();

  // Active Sidebar Tab: 'dashboard' | 'products' | 'orders' | 'transactions' | 'settings' | 'kyc'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Backend Data
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & UI States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('Weekly');

  // Merchant Store Details
  const initialDetails = {
    storeName: user?.vendorStoreName || 'Aarav Luxury Handlooms',
    tagline: user?.vendorDetails?.tagline || 'Authentic Handloom & Apparel Heritage Crafted for Modern India',
    legalEntityName: user?.vendorDetails?.legalEntityName || 'Aarav Handlooms & Textiles Pvt Ltd',
    merchantId: user?.vendorDetails?.merchantId || 'VND-MP-4520',
    contactPerson: user?.name || 'Aarav Sharma',
    businessEmail: user?.email || 'vendor@casa.in',
    businessPhone: user?.phone || '9876524680',
    gstin: user?.vendorDetails?.gstin || '23AAACA9876Q1Z5',
    pan: user?.vendorDetails?.pan || 'AAACA9876Q',
    warehouseName: user?.vendorDetails?.warehouseName || 'Indore Central Logistics & Textile Hub #14',
    warehouseStreet: user?.vendorDetails?.warehouseStreet || 'Plot 14-B, Sector C, Sanwer Road Industrial Area',
    warehouseCity: user?.vendorDetails?.warehouseCity || 'Indore',
    warehouseState: user?.vendorDetails?.warehouseState || 'Madhya Pradesh',
    warehousePincode: user?.vendorDetails?.warehousePincode || '452015',
    dispatchCutoff: user?.vendorDetails?.dispatchCutoff || '4:30 PM IST (Mon - Sat)',
    bankName: user?.vendorDetails?.bankName || 'HDFC Bank Ltd',
    accountNumber: user?.vendorDetails?.accountNumber || '50200084920194',
    ifscCode: user?.vendorDetails?.ifscCode || 'HDFC0000412',
    storeStatus: user?.vendorDetails?.storeStatus || 'active',
  };

  const [formData, setFormData] = useState(initialDetails);
  const [savedData, setSavedData] = useState(initialDetails);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, finRes] = await Promise.all([
        vendorService.getStats().catch(() => null),
        vendorService.getOrders('ALL').catch(() => []),
        vendorService.getProducts().catch(() => []),
        vendorService.getFinancials().catch(() => null),
      ]);
      setStats(statsRes);
      setOrders(ordersRes || []);
      setProducts(productsRes || []);
      setFinancials(finRes);
    } catch (err) {
      console.warn('Failed to load vendor metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickBoostStock = async (product, addUnits = 10) => {
    try {
      const nextStock = (product.stock || 0) + addUnits;
      await vendorService.updateProduct(product._id, { stock: nextStock });
      success(`Added +${addUnits} units to ${product.name}! Stock is now ${nextStock}.`);
      loadData();
    } catch (err) {
      error('Could not boost inventory stock.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await vendorService.updateOrderStatus(orderId, newStatus, `Vendor handled milestone: ${newStatus}`);
      success(`Order updated to ${newStatus}! Dispatch SLA confirmed.`);
      loadData();
    } catch (err) {
      error('Could not update order status.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.contactPerson,
        phone: formData.businessPhone,
        vendorStoreName: formData.storeName,
        vendorDetails: {
          ...formData,
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        setSavedData({ ...formData });
        setIsEditModalOpen(false);
        success('Store profile credentials saved successfully!');
        if (onProfileUpdated) {
          onProfileUpdated(res.data.user);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update merchant profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Static mock fallbacks for nice display matching Dribbble design
  const defaultRecentOrders = [
    {
      _id: 'ord-1',
      customer: 'Courtney Henry',
      itemsCount: 12,
      price: 234,
      status: 'Complete',
      statusColor: '#10b981',
      statusBg: '#ecfdf5',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      _id: 'ord-2',
      customer: 'Jerome Bell',
      itemsCount: 46,
      price: 2834,
      status: 'Processing',
      statusColor: '#6366f1',
      statusBg: '#eff6ff',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      _id: 'ord-3',
      customer: 'Alexander Pierce',
      itemsCount: 5,
      price: 128,
      status: 'Pending',
      statusColor: '#f59e0b',
      statusBg: '#fffbeb',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    {
      _id: 'ord-4',
      customer: 'Dianne Russell',
      itemsCount: 16,
      price: 566,
      status: 'Complete',
      statusColor: '#10b981',
      statusBg: '#ecfdf5',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const displayOrders = orders.length > 0
    ? orders.slice(0, 4).map((o, idx) => ({
        _id: o._id,
        rawOrder: o,
        customer: o.shippingAddress?.fullName || o.user?.name || `Customer #${idx + 1}`,
        itemsCount: o.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1,
        price: o.totalPrice || 240,
        status: o.orderStatus === 'Delivered' ? 'Complete' : o.orderStatus === 'Packed' ? 'Processing' : 'Pending',
        statusColor: o.orderStatus === 'Delivered' ? '#10b981' : o.orderStatus === 'Packed' ? '#6366f1' : '#f59e0b',
        avatar: defaultRecentOrders[idx % defaultRecentOrders.length].avatar,
      }))
    : defaultRecentOrders;

  const filteredOrdersList = orders.filter((o) =>
    orderFilter === 'ALL' ? true : o.orderStatus === orderFilter
  );

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif", color: '#1e1e24' }}>
      <style>{`
        .myshop-container {
          background: #ffffff;
          width: 100%;
          min-height: 100vh;
          display: flex;
          border-radius: 0;
          border: none;
          box-shadow: none;
          overflow: visible;
        }

        /* Sidebar Styling */
        .myshop-sidebar {
          width: 250px;
          min-width: 250px;
          background: #f4f6fa;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          flex-shrink: 0;
          border-right: 1px solid #edf0f5;
          min-height: 100vh;
          position: sticky;
          top: 0;
          align-self: flex-start;
          height: 100vh;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .myshop-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: left;
        }
        .myshop-nav-item:hover {
          color: #1e1e24;
          background: rgba(255, 255, 255, 0.7);
        }
        .myshop-nav-item.active {
          background: #1e1e24;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(30, 30, 36, 0.25);
        }

        /* Main Body Area */
        .myshop-main {
          flex: 1;
          min-width: 0;
          padding: 28px 40px 60px;
          display: flex;
          flex-direction: column;
          gap: 26px;
          background: #ffffff;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* Metric Pill Card */
        .metric-pill-card {
          border-radius: 18px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-pill-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.06);
        }

        /* Cream Banner Card with Radial Meters */
        .cream-banner-card {
          background: #fdf5ee;
          border: 1px solid #fed7aa;
          border-radius: 22px;
          padding: 22px 30px;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        /* Circular SVG Radial Meter */
        .radial-meter-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        /* Rounded Chart Bar */
        .chart-bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .chart-bar-pillar {
          width: 14px;
          border-radius: 9999px;
          transition: height 0.3s ease;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .myshop-container {
            flex-direction: column;
          }
          .myshop-sidebar {
            width: 100%;
            height: auto;
            position: relative;
          }
          .myshop-main {
            padding: 20px;
          }
        }
      `}</style>

      {/* COMPLETE MYSHOP DASHBOARD CONTAINER */}
      <div className="myshop-container">
        {/* ================= LEFT SIDEBAR (MYSHOP STYLE) ================= */}
        <aside className="myshop-sidebar">
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 28px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.35)',
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffffff' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e1e24', letterSpacing: '-0.02em' }}>
                My<span style={{ color: '#6366f1' }}>SHOP</span>
              </span>
            </div>

            {/* Nav Menu Items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`myshop-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`myshop-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              >
                <Boxes size={18} />
                <span>Products</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`myshop-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Users size={18} />
                <span>Customers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className={`myshop-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              >
                <CreditCard size={18} />
                <span>Transactions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`myshop-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kyc')}
                className={`myshop-nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
              >
                <Building2 size={18} />
                <span>Store Profile</span>
              </button>

              <button
                type="button"
                onClick={() => switchRole('user')}
                className="myshop-nav-item"
                style={{ marginTop: '12px', color: '#94a3b8' }}
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </nav>
          </div>

          {/* Bottom Upgrade to Pro Promo Card (Matching Dribbble Illustration) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
              borderRadius: '20px',
              padding: '18px 16px',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 8px 24px -4px rgba(129, 140, 248, 0.45)',
              marginTop: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.25)',
                margin: '0 auto 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Rocket size={22} color="#ffffff" />
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800 }}>
              Gold Merchant Tier
            </h4>
            <p style={{ margin: '0 0 14px', fontSize: '0.72rem', color: '#e0e7ff', lineHeight: 1.4 }}>
              99.4% On-time SLA. Enjoy T+2 daily rolling settlements & 0% listing fee.
            </p>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...savedData });
                setIsEditModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: '10px',
                background: '#ff6b4a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 107, 74, 0.35)',
              }}
            >
              Verified Pro Active
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="myshop-main">
          {/* TOP HEADER: GREETING & ICONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e1e24', margin: 0, letterSpacing: '-0.025em' }}>
                  Hello, {savedData.contactPerson?.split(' ')[0] || user?.name || 'Aarav'}
                </h1>
                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  🟢 Live • 99.4% SLA
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                {savedData.storeName} • Marketplace Seller Center
              </span>
            </div>

            {/* Header Right Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Quick Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search orders, SKUs..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{
                    padding: '8px 14px 8px 34px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '0.82rem',
                    color: '#1e1e24',
                    width: '180px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* View Storefront Pill Button */}
              <button
                type="button"
                onClick={() => switchRole('user')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f4f6fa',
                  border: '1px solid #e2e8f0',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="View customer marketplace view"
              >
                <ShoppingBag size={14} color="#6366f1" />
                <span>Storefront View</span>
              </button>

              <button
                type="button"
                onClick={() => success('All merchant messages up-to-date.')}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#f4f6fa',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
                title="Messages"
              >
                <Mail size={17} />
              </button>

              <button
                type="button"
                onClick={() => success('No unread policy alerts.')}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#f4f6fa',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  position: 'relative',
                }}
                title="Notifications"
              >
                <Bell size={17} />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '9px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#ef4444',
                  }}
                />
              </button>

              {/* User Avatar with mint ring */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '2.5px solid #2dd4bf',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTab('kyc')}
                title="View Store Profile"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>

          {/* ================= TAB 1: MAIN DASHBOARD VIEW ================= */}
          {activeTab === 'dashboard' && (
            <>
              {/* TOP ROW: 3 PASTEL METRIC PILL CARDS + LAST ORDERS CARD */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
                {/* Left 8 Columns: 3 Pastel Stat Cards + Cream Radial Banner */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Row of 3 Pastel Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {/* Card 1: Views / Impressions (Lavender) */}
                    <div className="metric-pill-card" style={{ background: '#f5f3ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '12px',
                            background: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                          }}
                        >
                          <Eye size={18} />
                        </div>
                        <MoreVertical size={16} color="#94a3b8" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Views</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e1e24' }}>1696</span>
                          <span style={{ fontSize: '0.74rem', color: '#06b6d4', fontWeight: 800 }}>+45%</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Visits / Traffic (Mint Green) */}
                    <div className="metric-pill-card" style={{ background: '#f0fdf4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '12px',
                            background: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                          }}
                        >
                          <Users size={18} />
                        </div>
                        <MoreVertical size={16} color="#94a3b8" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Visits</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e1e24' }}>3490</span>
                          <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800 }}>+32%</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Orders (Soft Peach / Coral) */}
                    <div className="metric-pill-card" style={{ background: '#fff1f2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '12px',
                            background: '#f97316',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                          }}
                        >
                          <Package size={18} />
                        </div>
                        <MoreVertical size={16} color="#94a3b8" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Orders</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e1e24' }}>{orders.length ? `${orders.length}20` : '4860'}</span>
                          <span style={{ fontSize: '0.74rem', color: '#f43f5e', fontWeight: 800 }}>24%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wide Cream/Peach Banner Card with 3 Radial Progress Rings */}
                  <div className="cream-banner-card">
                    {/* Ring 1: Income Today */}
                    <div className="radial-meter-box">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e1e24' }}>Income</span>
                          <ArrowUpRight size={14} color="#10b981" />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Today</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e1e24', marginTop: '4px' }}>
                          {formatINR(stats?.totalRevenue || 126000)}
                        </div>
                      </div>

                      {/* Radial Progress Ring SVG */}
                      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                        <svg width="56" height="56" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#f3e8ff"
                            strokeWidth="3.5"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#7c3aed"
                            strokeWidth="3.5"
                            strokeDasharray="65, 100"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#1e1e24' }}>
                          65%
                        </span>
                      </div>
                    </div>

                    {/* Ring 2: Sales Per hour */}
                    <div className="radial-meter-box">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e1e24' }}>Sales</span>
                          <ArrowDownRight size={14} color="#f97316" />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Per hour</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e1e24', marginTop: '4px' }}>
                          ₹1,400
                        </div>
                      </div>

                      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                        <svg width="56" height="56" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#ffedd5"
                            strokeWidth="3.5"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="3.5"
                            strokeDasharray="40, 100"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#1e1e24' }}>
                          40%
                        </span>
                      </div>
                    </div>

                    {/* Ring 3: Visits Total today */}
                    <div className="radial-meter-box">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e1e24' }}>Visits</span>
                          <ArrowUpRight size={14} color="#06b6d4" />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Total today</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e1e24', marginTop: '4px' }}>
                          2600
                        </div>
                      </div>

                      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                        <svg width="56" height="56" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#fce7f3"
                            strokeWidth="3.5"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="3.5"
                            strokeDasharray="75, 100"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#1e1e24' }}>
                          75%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 4 Columns: "Last orders" Card (Matching Design Right Box) */}
                <div
                  style={{
                    gridColumn: 'span 4',
                    background: '#ffffff',
                    border: '1px solid #eef2f6',
                    borderRadius: '22px',
                    padding: '22px 20px',
                    boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#1e1e24' }}>
                        Last orders
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        View all
                      </button>
                    </div>

                    {/* Order Row items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {displayOrders.map((ord, idx) => (
                        <div
                          key={ord._id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            padding: '4px 0',
                          }}
                          onClick={() => {
                            if (ord.rawOrder) setSelectedInvoiceOrder(ord.rawOrder);
                            else setActiveTab('orders');
                          }}
                          title="Click to view details or print slip"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={ord.avatar}
                              alt={ord.customer}
                              style={{ width: '38px', height: '38px', borderRadius: '12px', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e1e24' }}>
                                {ord.customer}
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                items: {ord.itemsCount}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1e1e24' }}>
                              {formatINR(ord.price)}
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: ord.statusColor }}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Dispatch SLA: 99.4%</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      style={{ background: '#f4f6fa', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, color: '#1e1e24', cursor: 'pointer' }}
                    >
                      Fulfill Orders
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: "Top category" / Analytics (3 Cards) */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e1e24', margin: '0 0 16px' }}>
                  Top category
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {/* Card 1: Products sold (Bar chart visualization) */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eef2f6',
                      borderRadius: '22px',
                      padding: '22px 20px',
                      boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e1e24' }}>
                        Products sold
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                        900 Products
                      </div>
                    </div>

                    {/* Bar Chart Visualization with active Black Tooltip Bubble */}
                    <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px 0 0' }}>
                      {[
                        { day: 'sun', height: '40px', bg: '#fcd34d' },
                        { day: 'mon', height: '65px', bg: '#fdba74' },
                        { day: 'tue', height: '50px', bg: '#fca5a5' },
                        { day: 'wed', height: '95px', bg: '#fb7185', active: true },
                        { day: 'thu', height: '70px', bg: '#fdba74' },
                        { day: 'fri', height: '85px', bg: '#fcd34d' },
                        { day: 'sat', height: '45px', bg: '#fde68a' },
                      ].map((bar, idx) => (
                        <div key={idx} className="chart-bar-col">
                          {bar.active && (
                            <div
                              style={{
                                background: '#1e1e24',
                                color: '#ffffff',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                marginBottom: '4px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              }}
                            >
                              900
                            </div>
                          )}
                          <div
                            className="chart-bar-pillar"
                            style={{
                              height: bar.height,
                              background: bar.bg,
                            }}
                          />
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Sold today list */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eef2f6',
                      borderRadius: '22px',
                      padding: '22px 20px',
                      boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e1e24' }}>
                        Sold today
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('products')}
                        style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        View all
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👟
                          </div>
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e1e24' }}>Men's shoes</div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>items: 150</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e1e24' }}>₹10,000</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🧥
                          </div>
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e1e24' }}>Men's clothing</div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>items: 200</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e1e24' }}>₹4,000</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👠
                          </div>
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e1e24' }}>Women's shoes</div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>items: 290</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e1e24' }}>₹20,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Top countries / Logistics Distribution Map */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eef2f6',
                      borderRadius: '22px',
                      padding: '22px 20px',
                      boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e1e24' }}>
                          Top countries
                        </h3>
                        <select
                          value={regionFilter}
                          onChange={(e) => setRegionFilter(e.target.value)}
                          style={{
                            background: '#f4f6fa',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#64748b',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Lifetime">Lifetime</option>
                        </select>
                      </div>

                      {/* World Map SVG Mockup with Regional Dots */}
                      <div style={{ margin: '14px 0', textAlign: 'center', position: 'relative' }}>
                        <svg viewBox="0 0 280 120" style={{ width: '100%', height: 'auto', opacity: 0.75 }}>
                          <path
                            d="M 20 40 Q 30 20 60 30 T 90 45 Q 80 70 50 65 T 20 40 Z"
                            fill="#e2e8f0"
                          />
                          <path
                            d="M 110 30 Q 140 10 180 25 T 220 50 Q 200 80 150 70 T 110 30 Z"
                            fill="#e2e8f0"
                          />
                          <path
                            d="M 50 75 Q 70 80 80 110 T 55 105 Z"
                            fill="#cbd5e1"
                          />
                          <path
                            d="M 200 75 Q 240 85 250 110 T 210 105 Z"
                            fill="#cbd5e1"
                          />
                          {/* Colored Location Pulsing Dots */}
                          <circle cx="55" cy="45" r="4.5" fill="#f43f5e" />
                          <circle cx="150" cy="35" r="3.5" fill="#38bdf8" />
                          <circle cx="170" cy="50" r="3" fill="#818cf8" />
                          <circle cx="225" cy="95" r="3.5" fill="#10b981" />
                        </svg>
                      </div>
                    </div>

                    {/* Regional breakdown legend */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e' }} /> 34% USA
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} /> 15% Canada
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8' }} /> 13% Italy
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} /> 18% UK
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> 12% India
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} /> 8% UAE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ================= TAB 2: PRODUCTS VIEW ================= */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e1e24', margin: 0 }}>
                    My Products & Catalog
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Boost inventory units or edit pricing for active marketplace listings.
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    background: '#f8fafc',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {products
                  .filter((p) => p.name?.toLowerCase().includes(productSearch.toLowerCase()))
                  .map((prod) => {
                    const isLow = (prod.stock || 0) < 5;
                    return (
                      <div
                        key={prod._id}
                        style={{
                          border: '1px solid #eef2f6',
                          borderRadius: '18px',
                          padding: '16px',
                          display: 'flex',
                          gap: '14px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        <img
                          src={prod.image || prod.images?.[0]}
                          alt={prod.name}
                          style={{ width: '68px', height: '68px', borderRadius: '12px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e1e24', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.name}
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#6366f1', marginTop: '2px' }}>
                            {formatINR(prod.discountPrice || prod.price)}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: isLow ? '#fee2e2' : '#ecfdf5',
                                color: isLow ? '#dc2626' : '#10b981',
                              }}
                            >
                              {isLow ? `Low: ${prod.stock}` : `Stock: ${prod.stock}`}
                            </span>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleQuickBoostStock(prod, 10)}
                                style={{
                                  background: '#f4f6fa',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  color: '#1e1e24',
                                }}
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickBoostStock(prod, 25)}
                                style={{
                                  background: '#10b981',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  color: '#ffffff',
                                }}
                              >
                                +25
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: CUSTOMERS & ORDERS VIEW ================= */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e1e24', margin: 0 }}>
                    Customer Shipments & Orders
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Process pending dispatches and print verified packing slips.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {['ALL', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderFilter(st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: orderFilter === st ? '#1e1e24' : '#f4f6fa',
                        color: orderFilter === st ? '#ffffff' : '#64748b',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredOrdersList.map((ord) => (
                  <div
                    key={ord._id}
                    style={{
                      border: '1px solid #eef2f6',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.94rem', color: '#1e1e24' }}>
                          #{ord.orderNumber}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: ord.orderStatus === 'Delivered' ? '#ecfdf5' : '#eff6ff',
                            color: ord.orderStatus === 'Delivered' ? '#10b981' : '#6366f1',
                          }}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                        Customer: <strong>{ord.shippingAddress?.fullName || 'Buyer'}</strong> • {ord.shippingAddress?.city} • {formatDateTime(ord.createdAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e1e24' }}>
                        {formatINR(ord.totalPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        style={{
                          background: '#f4f6fa',
                          border: 'none',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          color: '#1e1e24',
                        }}
                      >
                        <Printer size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        Slip
                      </button>

                      {['Confirmed', 'Processing'].includes(ord.orderStatus) && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(ord._id, 'Packed')}
                          style={{
                            background: '#1e1e24',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Pack
                        </button>
                      )}

                      {ord.orderStatus === 'Packed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(ord._id, 'Shipped')}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: TRANSACTIONS & PAYOUTS ================= */}
          {activeTab === 'transactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e1e24', margin: 0 }}>
                  Transactions & Payout Ledger
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Direct rolling IMPS settlements deposited into your verified bank account.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#f4f6fa', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800 }}>LIFETIME GMV</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e1e24', marginTop: '4px' }}>
                    {formatINR(stats?.totalRevenue || 126000)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Settled to HDFC Bank</span>
                </div>

                <div style={{ background: '#f4f6fa', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800 }}>COMMISSION (8%)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f43f5e', marginTop: '4px' }}>
                    - {formatINR(stats?.totalRevenue ? stats.totalRevenue * 0.08 : 10080)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Platform facilitation</span>
                </div>

                <div style={{ background: '#f4f6fa', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800 }}>NEXT SETTLEMENT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366f1', marginTop: '4px' }}>
                    {financials?.summary?.nextSettlementDate || 'Upcoming Friday'}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Rolling T+2 Cycle</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <VendorStoreSettings user={user} onSettingsSaved={onProfileUpdated} />
          )}

          {/* ================= TAB 6: STORE PROFILE & KYC ================= */}
          {activeTab === 'kyc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e1e24', margin: 0 }}>
                    Store Credentials & Pickup Hub
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Statutory business constitution, GSTIN, PAN, and dispatch warehouse.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...savedData });
                    setIsEditModalOpen(true);
                  }}
                  style={{
                    background: '#1e1e24',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Edit3 size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Edit Credentials
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>GSTIN NUMBER</span>
                    <button type="button" onClick={() => handleCopy(savedData.gstin, 'gstin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      {copiedKey === 'gstin' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e1e24', marginTop: '4px', fontFamily: 'monospace' }}>
                    {savedData.gstin}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Regular Taxpayer Verified</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>PAN CARD</span>
                    <button type="button" onClick={() => handleCopy(savedData.pan, 'pan')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      {copiedKey === 'pan' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e1e24', marginTop: '4px', fontFamily: 'monospace' }}>
                    {savedData.pan}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700 }}>Corporate Entity</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: '16px', padding: '18px', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>WAREHOUSE & PICKUP HUB</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e1e24', marginTop: '4px' }}>
                    {savedData.warehouseName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    {savedData.warehouseStreet}, {savedData.warehouseCity}, {savedData.warehouseState} - {savedData.warehousePincode}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TAX INVOICE & PACKING SLIP MODAL */}
      {selectedInvoiceOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30, 30, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eef2f6', paddingBottom: '14px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e1e24' }}>
                Tax Invoice & Packing Slip
              </h3>
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '20px', background: '#fafbfc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eef2f6', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>SOLD BY:</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#1e1e24' }}>{savedData.storeName}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>GSTIN: {savedData.gstin}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>ORDER ID:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#6366f1' }}>#{selectedInvoiceOrder.orderNumber}</div>
                  <div style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 800 }}>
                    {selectedInvoiceOrder.paymentMethod?.toUpperCase()} ({selectedInvoiceOrder.isPaid ? 'PAID' : 'COD'})
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 0', borderBottom: '1px solid #eef2f6' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>SHIP TO:</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e1e24' }}>{selectedInvoiceOrder.shippingAddress?.fullName || 'Customer'}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedInvoiceOrder.shippingAddress?.street}, {selectedInvoiceOrder.shippingAddress?.city} - {selectedInvoiceOrder.shippingAddress?.pincode}
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '6px' }}>Item</th>
                      <th style={{ padding: '6px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoiceOrder.items?.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 6px', fontWeight: 700 }}>{it.name}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 800 }}>{it.quantity}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 800 }}>{formatINR(it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 800 }}>Grand Total:</td>
                      <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 900, color: '#1e1e24', fontSize: '0.95rem' }}>
                        {formatINR(selectedInvoiceOrder.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                style={{ padding: '8px 16px', borderRadius: '10px', background: '#f4f6fa', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: '8px 18px', borderRadius: '10px', background: '#1e1e24', border: 'none', color: '#ffffff', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}
              >
                <Printer size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STORE PROFILE MODAL */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30, 30, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eef2f6', paddingBottom: '14px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e1e24' }}>
                Edit Store Profile Credentials
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Contact Person</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>GSTIN</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>PAN</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Warehouse Address</label>
                <input
                  type="text"
                  value={formData.warehouseStreet}
                  onChange={(e) => setFormData({ ...formData, warehouseStreet: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '10px', background: '#f4f6fa', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '8px 20px', borderRadius: '10px', background: '#1e1e24', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalVendorProfile;
