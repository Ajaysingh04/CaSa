import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Phone,
  MessageCircle,
  Menu,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import VendorStoreSettings from './VendorStoreSettings';

const ProfessionalVendorProfile = ({ user, onProfileUpdated }) => {
  const { switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  // Active Sidebar Tab: 'dashboard' | 'products' | 'orders' | 'transactions' | 'settings' | 'kyc'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Add Product Modal & Form State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    category: 'Apparel & Sarees',
    stock: 50,
    description: '',
    image: '',
  });

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

  const prevOrdersCountRef = useRef(null);

  const playNewOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext blocked
    }
  };

  const loadData = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const [statsRes, ordersRes, productsRes, finRes] = await Promise.all([
        vendorService.getStats().catch(() => null),
        vendorService.getOrders('ALL').catch(() => []),
        vendorService.getProducts().catch(() => []),
        vendorService.getFinancials().catch(() => null),
      ]);
      setStats(statsRes);

      // Check if new customer bookings arrived
      if (prevOrdersCountRef.current !== null && ordersRes && ordersRes.length > prevOrdersCountRef.current) {
        playNewOrderChime();
        const latest = ordersRes[0];
        const buyer = latest?.shippingAddress?.fullName || latest?.user?.name || 'Customer';
        success(`🔔 New Customer Booking! Order #${latest?.orderNumber || 'New'} received from ${buyer}. Ready to pack!`);
      }
      prevOrdersCountRef.current = ordersRes ? ordersRes.length : 0;

      setOrders(ordersRes || []);
      setProducts(productsRes || []);
      setFinancials(finRes);
    } catch (err) {
      console.warn('Failed to load vendor metrics:', err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-polling every 6 seconds so user bookings instantly reach the vendor
    const interval = setInterval(() => {
      loadData(true);
    }, 6000);
    return () => clearInterval(interval);
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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.price) {
      error('Please enter product name and price.');
      return;
    }
    try {
      setIsCreatingProduct(true);
      const payload = {
        name: newProductData.name,
        price: Number(newProductData.price),
        discountPrice: newProductData.discountPrice ? Number(newProductData.discountPrice) : Number(newProductData.price),
        category: newProductData.category,
        stock: Number(newProductData.stock) || 1,
        description: newProductData.description || `${newProductData.name} - Official listing by ${savedData.storeName}`,
        image: newProductData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
      };
      const created = await vendorService.createProduct(payload);
      if (created) {
        setProducts((prev) => [created, ...prev]);
        success(`"${payload.name}" published to CaSa Marketplace!`);
        setIsAddProductModalOpen(false);
        setNewProductData({
          name: '',
          price: '',
          discountPrice: '',
          category: 'Apparel & Sarees',
          stock: 50,
          description: '',
          image: '',
        });
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to publish new product.');
    } finally {
      setIsCreatingProduct(false);
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
          background: #f8fafc;
          width: 100%;
          min-height: 100vh;
          position: relative;
          box-sizing: border-box;
          display: flex;
        }

        /* Fixed Sidebar on Desktop - Extends full 100vh viewport, never leaves any empty gap! */
        .myshop-sidebar {
          width: 260px;
          min-width: 260px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          height: 100vh;
          background: #f8fafc;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          flex-shrink: 0;
          border-right: 1px solid #e2e8f0;
          z-index: 50;
          overflow-y: auto;
          box-sizing: border-box;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .myshop-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .myshop-sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
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
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .myshop-nav-item.active {
          background: #1e1e24;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(30, 30, 36, 0.25);
        }

        /* Main Body Area - Seamlessly offset beside the fixed sidebar */
        .myshop-main {
          margin-left: 260px;
          width: calc(100% - 260px);
          min-width: 0;
          padding: 28px 40px 60px;
          display: flex;
          flex-direction: column;
          gap: 26px;
          background: #ffffff;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* Mobile Top Header Bar - Visible only on mobile/tablet */
        .myshop-mobile-topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 45;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .myshop-mobile-backdrop {
          display: none;
        }

        .mobile-sidebar-close-btn {
          display: none;
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
          justify-content: space-between;
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

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .myshop-container {
            display: block;
          }
          .myshop-sidebar {
            width: 280px !important;
            max-width: 85vw !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            background: #ffffff !important;
            box-shadow: none;
          }
          .myshop-sidebar.mobile-open {
            transform: translateX(0) !important;
            box-shadow: 10px 0 36px rgba(15, 23, 42, 0.25) !important;
          }
          .mobile-sidebar-close-btn {
            display: flex !important;
          }
          .myshop-main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 18px 16px 60px !important;
          }
          .myshop-mobile-topbar {
            display: flex !important;
          }
          .myshop-mobile-backdrop {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            backdrop-filter: blur(4px);
            z-index: 990;
          }
          .cream-banner-card {
            padding: 18px 16px !important;
          }
        }

        @media (max-width: 640px) {
          .myshop-main {
            padding: 14px 12px 60px !important;
            gap: 18px !important;
          }
        }
      `}</style>

      {/* MOBILE TOP HEADER BAR */}
      <div className="myshop-mobile-topbar">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#1e1e24',
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.95rem',
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e1e24', letterSpacing: '-0.02em' }}>
            CaSa <span style={{ color: '#2563eb' }}>Vendor</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={14} /> Add
          </button>
          <img
            src={savedData.avatar || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
            alt=""
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* BACKDROP FOR MOBILE DRAWER */}
      {isMobileSidebarOpen && (
        <div
          className="myshop-mobile-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* COMPLETE MYSHOP DASHBOARD CONTAINER */}
      <div className="myshop-container">
        {/* ================= LEFT SIDEBAR (CASA VENDOR SELLER HUB) ================= */}
        <aside className={`myshop-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div>
            {/* Logo & Mobile Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #f59e0b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '1.15rem',
                  }}
                >
                  ⚡
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e1e24', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    CaSa <span style={{ color: '#2563eb' }}>Vendor</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Merchant Center
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mobile-sidebar-close-btn"
                onClick={() => setIsMobileSidebarOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#64748b',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Menu Items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
                className={`myshop-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('products');
                  setIsMobileSidebarOpen(false);
                }}
                className={`myshop-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              >
                <Boxes size={18} />
                <span>Products & Stock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setIsMobileSidebarOpen(false);
                }}
                className={`myshop-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>Orders & Shipping</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('transactions');
                  setIsMobileSidebarOpen(false);
                }}
                className={`myshop-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              >
                <CreditCard size={18} />
                <span>Payouts & Finances</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsMobileSidebarOpen(false);
                }}
                className={`myshop-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Sliders size={18} />
                <span>CaSa Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('kyc');
                  setIsMobileSidebarOpen(false);
                }}
                className={`myshop-nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
              >
                <Building2 size={18} />
                <span>Store & KYC Info</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  navigate('/');
                }}
                className="myshop-nav-item"
                style={{ marginTop: '12px', color: '#6366f1' }}
              >
                <ShoppingBag size={18} />
                <span>View Storefront</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="myshop-nav-item"
                style={{ color: '#ef4444' }}
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </nav>
          </div>

          {/* Bottom Upgrade to Pro Promo Card */}
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
              CaSa Gold Merchant Tier
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
                {savedData.storeName} • CaSa Verified Seller Center
              </span>
            </div>

            {/* Header Right Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* + Add New Product Button */}
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#1e1e24',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 30, 36, 0.2)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Plus size={15} />
                <span>Add Product</span>
              </button>

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
                    {/* Card 3: Top Delivery Hubs (India) */}
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
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e1e24' }}>
                            Top Delivery Hubs (India)
                          </h3>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Express Courier Handover
                          </span>
                        </div>
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

                      {/* India Logistics Network Nodes */}
                      <div style={{ margin: '14px 0', textAlign: 'center', position: 'relative' }}>
                        <svg viewBox="0 0 280 120" style={{ width: '100%', height: 'auto', opacity: 0.85 }}>
                          {/* India Map stylized geometry */}
                          <path
                            d="M 130 15 L 150 25 L 170 30 L 165 55 L 185 65 L 175 80 L 150 110 L 135 112 L 125 90 L 105 70 L 115 45 L 120 25 Z"
                            fill="#f1f5f9"
                            stroke="#e2e8f0"
                            strokeWidth="1.5"
                          />
                          {/* Courier Routing Lines */}
                          <line x1="138" y1="35" x2="118" y2="60" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                          <line x1="118" y1="60" x2="135" y2="88" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                          <line x1="138" y1="35" x2="165" y2="62" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />

                          {/* Pulsing Hub Pins */}
                          <circle cx="138" cy="35" r="5" fill="#2563eb" />
                          <circle cx="138" cy="35" r="9" fill="#2563eb" opacity="0.2" />

                          <circle cx="118" cy="60" r="5" fill="#f59e0b" />
                          <circle cx="118" cy="60" r="9" fill="#f59e0b" opacity="0.2" />

                          <circle cx="135" cy="88" r="5" fill="#10b981" />
                          <circle cx="135" cy="88" r="9" fill="#10b981" opacity="0.2" />

                          <circle cx="165" cy="62" r="5" fill="#ec4899" />
                          <circle cx="165" cy="62" r="9" fill="#ec4899" opacity="0.2" />
                        </svg>
                      </div>
                    </div>

                    {/* Regional breakdown legend */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                        34% North (Delhi NCR & UP)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                        28% West (Mumbai & MP)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        22% South (Bengaluru)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
                        16% East (Kolkata)
                      </span>
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>
                      <span>⚡ BlueDart • Delhivery • Shadowfax</span>
                      <span>100% Insured</span>
                    </div>
                  </div>                  </div>
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
                      padding: '18px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.98rem', color: '#1e1e24' }}>
                          #{ord.orderNumber}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: ord.orderStatus === 'Delivered' ? '#ecfdf5' : ord.orderStatus === 'Shipped' ? '#eff6ff' : '#fffbeb',
                            color: ord.orderStatus === 'Delivered' ? '#10b981' : ord.orderStatus === 'Shipped' ? '#2563eb' : '#d97706',
                          }}
                        >
                          {ord.orderStatus}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {formatDateTime(ord.createdAt)}
                        </span>
                      </div>

                      {/* Buyer Details & Direct Contact */}
                      <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>Buyer: <strong>{ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</strong></span>
                          {(ord.shippingAddress?.phone || ord.user?.phone) && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <a
                                href={`tel:${ord.shippingAddress?.phone || ord.user?.phone}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}
                                title="Call Buyer"
                              >
                                <Phone size={11} />
                                <span>{ord.shippingAddress?.phone || ord.user?.phone}</span>
                              </a>
                              <a
                                href={`https://wa.me/91${(ord.shippingAddress?.phone || ord.user?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${ord.shippingAddress?.fullName || 'Customer'}, regarding your CaSa order #${ord.orderNumber}...`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}
                                title="WhatsApp Buyer"
                              >
                                <MessageCircle size={11} />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                          📍 Ship To: {ord.shippingAddress?.street}, {ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          📦 Items: {ord.items?.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right', minWidth: '90px' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e1e24' }}>
                          {formatINR(ord.totalPrice)}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: ord.isPaid ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                          {ord.paymentMethod?.toUpperCase()} ({ord.isPaid ? 'PAID' : 'COD'})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        style={{
                          background: '#f4f6fa',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          color: '#1e1e24',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Printer size={13} />
                        Slip
                      </button>

                      {['Confirmed', 'Processing', 'Pending'].includes(ord.orderStatus) && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(ord._id, 'Packed')}
                          style={{
                            background: '#1e1e24',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Pack Order
                        </button>
                      )}

                      {ord.orderStatus === 'Packed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(ord._id, 'Shipped')}
                          style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Dispatch / Ship
                        </button>
                      )}

                      {ord.orderStatus === 'Shipped' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(ord._id, 'Delivered')}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Delivered
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

      {/* ADD NEW PRODUCT MODAL */}
      {isAddProductModalOpen && (
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
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e1e24' }}>
                  Add Product to CaSa Catalog
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Create and publish a verified merchant listing to marketplace.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handcrafted Chanderi Silk Saree"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    Listing Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2999"
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    Discount / Special Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2499"
                    value={newProductData.discountPrice}
                    onChange={(e) => setNewProductData({ ...newProductData, discountPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', background: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Apparel & Sarees">Apparel & Sarees</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Handicrafts & Decor">Handicrafts & Decor</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    Initial Stock Inventory (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProductData.stock}
                    onChange={(e) => setNewProductData({ ...newProductData, stock: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProductData.image}
                  onChange={(e) => setNewProductData({ ...newProductData, image: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Product Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Material, weave origin, care instructions, warranty..."
                  value={newProductData.description}
                  onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '10px', background: '#f4f6fa', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProduct}
                  style={{ padding: '9px 22px', borderRadius: '10px', background: '#1e1e24', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.84rem' }}
                >
                  {isCreatingProduct ? 'Publishing...' : 'Publish to Marketplace'}
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
