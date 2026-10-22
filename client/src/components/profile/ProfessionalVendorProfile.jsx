import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Store,
  ShieldCheck,
  Award,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  Truck,
  CreditCard,
  Copy,
  Check,
  Edit3,
  Clock,
  Star,
  Sparkles,
  Package,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  Percent,
  Save,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  TrendingUp,
  Printer,
  Boxes,
  Plus,
  ExternalLink,
  Flame,
  Zap,
  ShoppingBag,
  Bell,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { vendorService } from '../../services/vendorService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import VendorStoreSettings from './VendorStoreSettings';

const ProfessionalVendorProfile = ({ user, onProfileUpdated }) => {
  const { success, error } = useToast();

  // 3-Lines Hamburger Left Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active Page View: 'overview' | 'orders' | 'inventory' | 'payouts' | 'kyc' | 'settings'
  const [activePage, setActivePage] = useState('overview');

  // Live Store Status (Accepting Orders vs Vacation Mode)
  const [isStoreActive, setIsStoreActive] = useState(
    user?.vendorDetails?.storeStatus !== 'vacation'
  );

  // Copied State Tracker
  const [copiedKey, setCopiedKey] = useState(null);

  // Reveal Account Number
  const [showAccountNo, setShowAccountNo] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Live Backend Data
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');

  // Tax Invoice modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Merchant Details State
  const initialDetails = {
    storeName: user?.vendorStoreName || 'Aarav Luxury Handlooms & Apparel',
    tagline:
      user?.vendorDetails?.tagline ||
      'Authentic Chanderi, Maheshwari & Banarasi Silk Heritage Crafted for Modern India',
    legalEntityName:
      user?.vendorDetails?.legalEntityName || 'Aarav Handlooms & Textiles Private Limited',
    merchantId: user?.vendorDetails?.merchantId || 'VND-MP-4520',
    contactPerson: user?.name || 'Aarav Fashion & Handlooms',
    businessEmail: user?.email || 'vendor@casa.in',
    businessPhone: user?.phone || '9876524680',
    gstin: user?.vendorDetails?.gstin || '23AAACA9876Q1Z5',
    pan: user?.vendorDetails?.pan || 'AAACA9876Q',
    msmeReg: user?.vendorDetails?.msmeReg || 'UDYAM-MP-26-0048123',
    businessType: user?.vendorDetails?.businessType || 'Private Limited / Manufacturer',
    primaryCategory: user?.vendorDetails?.primaryCategory || "Women's Ethnic Wear & Handloom Sarees",
    warehouseName:
      user?.vendorDetails?.warehouseName || 'Indore Central Logistics & Textile Hub #14',
    warehouseStreet:
      user?.vendorDetails?.warehouseStreet || 'Plot 14-B, Sector C, Sanwer Road Industrial Area',
    warehouseCity: user?.vendorDetails?.warehouseCity || 'Indore',
    warehouseState: user?.vendorDetails?.warehouseState || 'Madhya Pradesh',
    warehousePincode: user?.vendorDetails?.warehousePincode || '452015',
    dispatchCutoff: user?.vendorDetails?.dispatchCutoff || '4:30 PM IST (Mon - Sat)',
    dispatchManager: user?.vendorDetails?.dispatchManager || 'Rajesh Verma (Dispatch In-Charge)',
    bankName: user?.vendorDetails?.bankName || 'HDFC Bank Ltd',
    bankBranch: user?.vendorDetails?.bankBranch || 'Commercial Banking Branch, MG Road, Indore',
    accountHolder:
      user?.vendorDetails?.accountHolder || 'Aarav Luxury Handlooms & Apparel Pvt Ltd',
    accountNumber: user?.vendorDetails?.accountNumber || '50200084920194',
    ifscCode: user?.vendorDetails?.ifscCode || 'HDFC0000412',
    upiId: user?.vendorDetails?.upiId || 'aaravhandlooms@hdfcbank',
    settlementCycle: user?.vendorDetails?.settlementCycle || 'T+2 Daily Rolling Settlements',
    commissionRate: user?.vendorDetails?.commissionRate || 8.0,
    sellerTier: user?.vendorDetails?.sellerTier || 'Gold Merchant Tier',
  };

  const [formData, setFormData] = useState(initialDetails);
  const [savedData, setSavedData] = useState(initialDetails);

  // Load backend data for real dashboard metrics
  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
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
      console.warn('Could not load vendor metrics:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleStoreStatus = async () => {
    const nextStatus = isStoreActive ? 'vacation' : 'active';
    try {
      await api.put('/auth/profile', {
        vendorDetails: {
          ...savedData,
          storeStatus: nextStatus,
        },
      });
      setIsStoreActive(!isStoreActive);
      success(
        !isStoreActive
          ? 'Store is now LIVE on marketplace and receiving customer orders!'
          : 'Vacation Mode activated. Catalog items marked temporarily away.'
      );
    } catch (err) {
      error('Failed to update store status. Please try again.');
    }
  };

  const handleQuickBoostStock = async (product, addUnits = 10) => {
    try {
      const nextStock = (product.stock || 0) + addUnits;
      await vendorService.updateProduct(product._id, { stock: nextStock });
      success(`Added +${addUnits} units to ${product.name}! Stock is now ${nextStock}.`);
      loadDashboardData();
    } catch (err) {
      error('Could not boost inventory stock.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await vendorService.updateOrderStatus(orderId, newStatus, `Vendor handled milestone: ${newStatus}`);
      success(`Order updated to ${newStatus}! Dispatch SLA confirmed.`);
      loadDashboardData();
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
          storeStatus: isStoreActive ? 'active' : 'vacation',
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        setSavedData({ ...formData });
        setIsEditModalOpen(false);
        success('Seller Hub credentials & store profile saved successfully!');
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

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
    { id: 'orders', label: 'Order Management', icon: Package, badge: orders.length || '8' },
    { id: 'inventory', label: 'Products & Inventory', icon: Boxes, badge: products.length || '28' },
    { id: 'payouts', label: 'Payments & Payouts', icon: CreditCard, badge: 'T+2' },
    { id: 'kyc', label: 'Seller KYC & Hub', icon: Building2, badge: 'Verified' },
    { id: 'settings', label: 'Store Automations', icon: Sliders, badge: null },
  ];

  const filteredOrders = orders.filter((o) =>
    orderFilter === 'ALL' ? true : o.orderStatus === orderFilter
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '80vh' }}>
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(40, 116, 240, 0.45); }
          70% { box-shadow: 0 0 0 10px rgba(40, 116, 240, 0); }
          100% { box-shadow: 0 0 0 0 rgba(40, 116, 240, 0); }
        }
        @keyframes greenPing {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 1; }
        }

        .dash-layout-container {
          display: flex;
          gap: 20px;
          position: relative;
          align-items: flex-start;
        }

        /* 3-Lines Left Sidebar Panel */
        .dash-sidebar {
          width: 270px;
          flex-shrink: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dash-sidebar.collapsed {
          width: 0;
          margin-left: -20px;
          opacity: 0;
          pointer-events: none;
          visibility: hidden;
        }

        /* Sidebar Nav Item Button */
        .dash-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: #475569;
          font-weight: 700;
          font-size: 0.86rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: left;
        }
        .dash-nav-item:hover {
          background: #f1f5f9;
          color: #0f172a;
          transform: translateX(3px);
        }
        .dash-nav-item.active {
          background: linear-gradient(135deg, #2874f0 0%, #1a5dc7 100%);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(40, 116, 240, 0.35);
        }

        /* Main Dynamic Content Area */
        .dash-content-area {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hamburger-btn {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
        }
        .hamburger-btn:hover {
          background: #f8fafc;
          border-color: #2874f0;
          color: #2874f0;
          transform: scale(1.04);
        }

        .fk-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
          transition: all 0.22s ease;
        }
        .fk-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px -6px rgba(15, 23, 42, 0.1);
        }

        .fk-cta-primary {
          background: linear-gradient(135deg, #fb641b 0%, #e65510 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          box-shadow: 0 4px 12px rgba(251, 100, 27, 0.35);
          transition: all 0.18s ease;
        }
        .fk-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(251, 100, 27, 0.45);
        }

        @media (max-width: 900px) {
          .dash-layout-container {
            flex-direction: column;
          }
          .dash-sidebar {
            width: 100%;
          }
          .dash-sidebar.collapsed {
            display: none;
          }
        }
      `}</style>

      {/* TOP COMMAND BAR WITH 3-LINES HAMBURGER TOGGLE */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Left: 3-Lines Button + Current Active Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* 3-Lines Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hamburger-btn"
            title={isSidebarOpen ? 'Hide Left Dashboard Menu' : 'Open 3-Lines Left Dashboard'}
          >
            {isSidebarOpen ? <X size={22} color="#0f172a" /> : <Menu size={22} color="#2874f0" />}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                SELLER DASHBOARD
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 900 }}>
                {menuItems.find((m) => m.id === activePage)?.label || 'Dashboard Overview'}
              </strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Click ☰ 3-lines menu on the left to navigate between orders, catalog, payouts, and store credentials.
            </div>
          </div>
        </div>

        {/* Right: Badges & Launch button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: '#2874f0',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 900,
              fontStyle: 'italic',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>CaSa Assured</span>
            <span style={{ color: '#ffe500', fontStyle: 'normal' }}>★</span>
          </span>

          <span
            style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Award size={13} color="#059669" /> Gold Tier 4.9★
          </span>

          <Link
            to="/vendor"
            className="fk-cta-primary"
            style={{ textDecoration: 'none' }}
          >
            <Zap size={14} fill="#ffffff" /> Launch Full Hub
          </Link>
        </div>
      </div>

      {/* DASHBOARD LAYOUT: LEFT SIDEBAR + RIGHT DYNAMIC CONTENT AREA */}
      <div className="dash-layout-container">
        {/* LEFT SIDEBAR (OPENS FROM LEFT VIA 3-LINES HAMBURGER) */}
        <div className={`dash-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
          {/* Sidebar Top: Seller Hub Branding */}
          <div style={{ background: 'linear-gradient(135deg, #072352 0%, #2874f0 100%)', padding: '20px', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'}
                  alt={savedData.storeName}
                  style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #ffe500' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #072352',
                    boxShadow: '0 0 6px #22c55e',
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.94rem', fontWeight: 900, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {savedData.storeName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#ffe500', fontWeight: 800 }}>
                  ID: {savedData.merchantId}
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>Status:</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: isStoreActive ? '#ffe500' : '#fca5a5' }}>
                {isStoreActive ? '● STORE LIVE' : '○ VACATION'}
              </span>
            </div>
          </div>

          {/* Sidebar Menu Items List (Bari Bari Jisme Click Karenge O Page Khulega) */}
          <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActivePage(item.id);
                  }}
                  className={`dash-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={18} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: isActive ? '#ffffff' : '#e2e8f0',
                        color: isActive ? '#2874f0' : '#475569',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Bottom Controls */}
          <div style={{ padding: '14px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={handleToggleStoreStatus}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: isStoreActive ? '#fff1f2' : '#f0fdf4',
                border: isStoreActive ? '1px solid #fecdd3' : '1px solid #bbf7d0',
                color: isStoreActive ? '#e11d48' : '#16a34a',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={13} />
              <span>{isStoreActive ? 'Switch to Vacation Mode' : 'Open Store Live'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({ ...savedData });
                setIsEditModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Edit3 size={13} />
              <span>Edit Store Credentials</span>
            </button>
          </div>
        </div>

        {/* RIGHT DYNAMIC CONTENT AREA (LOADS CORRESPONDING PAGE ON CLICK) */}
        <div className="dash-content-area">
          {/* ================= PAGE 1: DASHBOARD OVERVIEW ================= */}
          {activePage === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Executive Hero Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #072352 0%, #0d3882 45%, #2874f0 100%)',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  color: '#ffffff',
                  boxShadow: '0 12px 28px -6px rgba(11, 49, 119, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#ffe500', color: '#072352', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>
                        COMMAND CENTER
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#dbeafe' }}>Marketplace Performance Analytics</span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '6px 0 2px' }}>
                      Welcome back, {savedData.storeName}!
                    </h2>
                    <p style={{ margin: 0, color: '#dbeafe', fontSize: '0.84rem' }}>
                      {savedData.tagline}
                    </p>
                  </div>

                  <button
                    onClick={() => setActivePage('orders')}
                    className="fk-cta-primary"
                  >
                    View Active Orders ({orders.length}) →
                  </button>
                </div>

                {/* 4 Hero Stats Strip */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.18)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 800 }}>TODAY'S REVENUE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>₹ 48,920</div>
                    <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700 }}>▲ +18.4% today</span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 800 }}>PENDING SHIPMENTS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffe500', marginTop: '2px' }}>{stats?.pendingToPack || 8} Orders</div>
                    <span style={{ fontSize: '0.7rem', color: '#ffffff', fontWeight: 600 }}>Cutoff: 4:30 PM SLA</span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 800 }}>NEXT SETTLEMENT</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>{financials?.summary?.nextSettlementDate || 'Upcoming Friday'}</div>
                    <span style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 700 }}>Direct IMPS HDFC</span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 800 }}>COURIER HANDOVER</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>Delhivery Express</div>
                    <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700 }}>Daily 4:30 PM Van</span>
                  </div>
                </div>
              </div>

              {/* 4 KPI Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                <div className="fk-stat-card" style={{ borderTop: '4px solid #2874f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>LIFETIME GROSS GMV</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                    {formatINR(stats?.totalRevenue || 842650)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>▲ +14.2% MoM Verified Payouts</span>
                </div>

                <div className="fk-stat-card" style={{ borderTop: '4px solid #16a34a' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>SELLER QUALITY SCORE</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>4.9 / 5.0</span>
                    <Star size={18} fill="#16a34a" color="#16a34a" />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>99.4% On-time Dispatch SLA</span>
                </div>

                <div className="fk-stat-card" style={{ borderTop: '4px solid #fb641b' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>AWAITING PACKING</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fb641b', marginTop: '4px' }}>
                    {stats?.pendingToPack || 8} Orders
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>⚡ Pack before 4:30 PM cutoff</span>
                </div>

                <div className="fk-stat-card" style={{ borderTop: '4px solid #7c3aed' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>LIVE CATALOG SKUS</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed', marginTop: '4px' }}>
                    {stats?.productsCount || products.length || 28} Items
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>3 Low Stock Alerts</span>
                </div>
              </div>

              {/* Fast Orders Queue Preview */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                    Live Recent Shipments
                  </h3>
                  <button
                    onClick={() => setActivePage('orders')}
                    style={{ background: 'none', border: 'none', color: '#2874f0', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Open Full Order Management →
                  </button>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', fontWeight: 800 }}>
                        <th style={{ padding: '10px 14px' }}>ORDER #</th>
                        <th style={{ padding: '10px 14px' }}>CUSTOMER</th>
                        <th style={{ padding: '10px 14px' }}>TOTAL</th>
                        <th style={{ padding: '10px 14px' }}>STATUS</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 3).map((ord) => (
                        <tr key={ord._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 800, color: '#2874f0' }}>#{ord.orderNumber}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{ord.shippingAddress?.fullName || 'Customer'}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 800 }}>{formatINR(ord.totalPrice)}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, background: '#eff6ff', color: '#2874f0' }}>
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              style={{ padding: '4px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Packing Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAGE 2: ORDER MANAGEMENT ================= */}
          {activePage === 'orders' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                    Order Fulfillment & Logistics Handover
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Pipeline of customer shipments booked across India. Confirm, pack, and generate certified shipping slips.
                  </p>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['ALL', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: orderFilter === st ? '1.5px solid #2874f0' : '1px solid #cbd5e1',
                      background: orderFilter === st ? '#2874f0' : '#ffffff',
                      color: orderFilter === st ? '#ffffff' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {st === 'ALL' ? 'All Orders' : st}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredOrders.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No orders under "{orderFilter}".
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div key={ord._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ background: '#f8fafc', padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <strong style={{ color: '#2874f0', fontSize: '0.94rem' }}>#{ord.orderNumber}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '10px' }}>{formatDateTime(ord.createdAt)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 900 }}>{formatINR(ord.totalPrice)}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: '#eff6ff', color: '#2874f0' }}>
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          {ord.items?.map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <img src={it.image} alt={it.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                              <div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{it.name}</div>
                                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Qty: {it.quantity} • {formatINR(it.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ minWidth: '220px', background: '#fafbfc', borderRadius: '8px', padding: '10px 14px', fontSize: '0.78rem' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{ord.shippingAddress?.fullName || 'Customer'}</div>
                          <div style={{ color: '#555' }}>{ord.shippingAddress?.street}, {ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}</div>
                          <div style={{ color: '#2874f0', fontWeight: 700, marginTop: '2px' }}>Phone: {ord.shippingAddress?.phone || 'Verified'}</div>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '10px 18px', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(ord)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Printer size={12} style={{ display: 'inline', marginRight: '4px' }} /> Packing Slip
                        </button>

                        {ord.orderStatus === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'Processing')}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: '#2874f0', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            📦 Pack Order
                          </button>
                        )}

                        {['Confirmed', 'Processing'].includes(ord.orderStatus) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'Packed')}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: '#7c3aed', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🏷️ Mark Ready for Courier
                          </button>
                        )}

                        {ord.orderStatus === 'Packed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'Shipped')}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: '#16a34a', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🚚 Hand Over to Logistics
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= PAGE 3: PRODUCTS & INVENTORY ================= */}
          {activePage === 'inventory' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                    Merchant Catalog & Stock Health
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Manage available units and boost fast-selling inventory with 1-click.
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Filter listings by name or brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '240px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {filteredProducts.map((p) => {
                  const isLow = (p.stock || 0) < 5;
                  return (
                    <div key={p._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff', display: 'flex', gap: '12px' }}>
                      <img src={p.image || p.images?.[0]} alt={p.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2874f0', marginTop: '2px' }}>
                          {formatINR(p.discountPrice || p.price)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: isLow ? '#fee2e2' : '#dcfce7',
                              color: isLow ? '#dc2626' : '#15803d',
                            }}
                          >
                            {isLow ? `⚠️ Low: ${p.stock || 0}` : `Stock: ${p.stock || 0}`}
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleQuickBoostStock(p, 10)}
                              style={{ padding: '3px 8px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2874f0', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                              +10 Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickBoostStock(p, 25)}
                              style={{ padding: '3px 8px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
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

          {/* ================= PAGE 4: PAYMENTS & SETTLEMENTS ================= */}
          {activePage === 'payouts' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Settlements Ledger & Verified Bank Account
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Direct rolling IMPS/NEFT transfers deposited on rolling T+2 schedule.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>BANK ACCOUNT</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px' }}>{savedData.bankName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{savedData.bankBranch}</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>ACCOUNT NO</span>
                    <button type="button" onClick={() => setShowAccountNo(!showAccountNo)} style={{ background: 'none', border: 'none', color: '#2874f0', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      {showAccountNo ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>
                    {showAccountNo ? savedData.accountNumber : `•••• •••• •••• ${savedData.accountNumber.slice(-4)}`}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>Direct IMPS Auto-Credit Active</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>IFSC ROUTING CODE</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>{savedData.ifscCode}</div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>RTGS / NEFT / IMPS Enabled</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>COMMISSION RATE</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#2874f0', marginTop: '3px' }}>{savedData.commissionRate}% Flat Rate</div>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>Gold Merchant Tier Privileged Slab</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAGE 5: STORE KYC & WAREHOUSE HUB ================= */}
          {activePage === 'kyc' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    Flipkart Verified Seller Credentials & Dispatch Hub
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Statutory business constitution, GSTIN, PAN, and courier pickup location.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...savedData });
                    setIsEditModalOpen(true);
                  }}
                  className="fk-cta-primary"
                >
                  <Edit3 size={14} /> Update Credentials
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>GSTIN NUMBER</span>
                    <button type="button" onClick={() => handleCopy(savedData.gstin, 'gstin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      {copiedKey === 'gstin' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>
                    {savedData.gstin}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>Active Verified Regular Taxpayer</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #2874f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>PERMANENT ACCOUNT NUMBER (PAN)</span>
                    <button type="button" onClick={() => handleCopy(savedData.pan, 'pan')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      {copiedKey === 'pan' ? <Check size={14} color="#2874f0" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>
                    {savedData.pan}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#2874f0', fontWeight: 700 }}>Corporate Entity Verified</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>PRIMARY PICKUP WAREHOUSE</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px' }}>
                    {savedData.warehouseName}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
                    {savedData.warehouseStreet}, {savedData.warehouseCity}, {savedData.warehouseState} - {savedData.warehousePincode}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700, marginTop: '6px' }}>
                    Daily Cutoff: {savedData.dispatchCutoff} • Dispatch In-Charge: {savedData.dispatchManager} (+91 {savedData.businessPhone})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAGE 6: STORE AUTOMATION SETTINGS ================= */}
          {activePage === 'settings' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <VendorStoreSettings user={user} onSettingsSaved={onProfileUpdated} />
            </div>
          )}
        </div>
      </div>

      {/* TAX INVOICE & PACKING SLIP MODAL */}
      {selectedInvoiceOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
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
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                Tax Invoice & Packing Slip (Flipkart Certified)
              </h3>
              <button type="button" onClick={() => setSelectedInvoiceOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '18px', background: '#fafbfc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>SOLD BY (SELLER):</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0f172a' }}>{savedData.storeName}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>GSTIN: {savedData.gstin}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Hub: {savedData.warehouseCity} - {savedData.warehousePincode}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>ORDER ID:</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2874f0' }}>#{selectedInvoiceOrder.orderNumber}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Date: {formatDateTime(selectedInvoiceOrder.createdAt)}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>
                    {selectedInvoiceOrder.paymentMethod?.toUpperCase()} ({selectedInvoiceOrder.isPaid ? 'PAID' : 'COD'})
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>SHIP TO (CUSTOMER):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{selectedInvoiceOrder.shippingAddress?.fullName || 'Customer'}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  {selectedInvoiceOrder.shippingAddress?.street}, {selectedInvoiceOrder.shippingAddress?.city} - {selectedInvoiceOrder.shippingAddress?.pincode}
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Product</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoiceOrder.items?.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: 700 }}>{it.name}</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800 }}>{it.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatINR(it.price)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>{formatINR(it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 800 }}>Total:</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>
                        {formatINR(selectedInvoiceOrder.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button type="button" onClick={() => setSelectedInvoiceOrder(null)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 700 }}>
                Close
              </button>
              <button type="button" onClick={() => window.print()} className="fk-cta-primary" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                <Printer size={15} /> Print Packing Slip
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
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2874f0' }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    Edit Merchant Store Profile
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Update your business credentials, warehouse location, and statutory details.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Store Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Authorized Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Brand Slogan / Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>GSTIN *</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>PAN *</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Warehouse Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.warehouseStreet}
                  onChange={(e) => setFormData({ ...formData, warehouseStreet: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={formData.warehouseCity}
                    onChange={(e) => setFormData({ ...formData, warehouseCity: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>State *</label>
                  <input
                    type="text"
                    required
                    value={formData.warehouseState}
                    onChange={(e) => setFormData({ ...formData, warehouseState: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.warehousePincode}
                    onChange={(e) => setFormData({ ...formData, warehousePincode: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="fk-cta-primary"
                  style={{ padding: '9px 20px', fontSize: '0.82rem' }}
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
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
