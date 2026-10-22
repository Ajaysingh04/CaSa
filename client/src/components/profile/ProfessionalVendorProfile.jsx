import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
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
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  TrendingUp,
  Printer,
  Boxes,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Flame,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { vendorService } from '../../services/vendorService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import VendorStoreSettings from './VendorStoreSettings';

const ProfessionalVendorProfile = ({ user, onProfileUpdated }) => {
  const { success, error } = useToast();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'inventory' | 'payouts' | 'legal' | 'settings'

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

  // Live Data from Backend Vendor Service
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Tax Invoice modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Inline Quick Stock Edit
  const [editingProduct, setEditingProduct] = useState(null);
  const [editStockVal, setEditStockVal] = useState('');
  const [editPriceVal, setEditPriceVal] = useState('');

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
          ? 'Store status updated: Store is OPEN on Flipkart marketplace & receiving customer orders!'
          : 'Store status updated: Vacation Mode activated. Catalog items marked temporarily away.'
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
    setUpdatingOrderId(orderId);
    try {
      await vendorService.updateOrderStatus(orderId, newStatus, `Vendor handled milestone: ${newStatus}`);
      success(`Order updated to ${newStatus}! Dispatch SLA confirmed.`);
      loadDashboardData();
    } catch (err) {
      error('Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
        @keyframes shimmerGlow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .fk-dashboard-hero {
          background: linear-gradient(135deg, #072352 0%, #0d3882 40%, #154fb3 75%, #2874f0 100%);
          border-radius: 16px;
          padding: 28px 32px;
          color: #ffffff;
          box-shadow: 0 16px 36px -10px rgba(11, 49, 119, 0.35);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .fk-dashboard-hero::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -80px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 229, 0, 0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .fk-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .fk-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px -6px rgba(15, 23, 42, 0.1);
          border-color: #cbd5e1;
        }

        .fk-nav-pill {
          padding: 10px 18px;
          font-size: 0.86rem;
          font-weight: 700;
          border-radius: 10px;
          border: none;
          background: #f1f5f9;
          color: #475569;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .fk-nav-pill:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
        .fk-nav-pill.active {
          background: #2874f0;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(40, 116, 240, 0.3);
        }

        .fk-cta-primary {
          background: linear-gradient(135deg, #fb641b 0%, #e65510 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 800;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          box-shadow: 0 4px 14px rgba(251, 100, 27, 0.35);
          transition: all 0.18s ease;
        }
        .fk-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(251, 100, 27, 0.45);
        }

        .fk-badge-assured {
          background: #ffffff;
          color: #2874f0;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 900;
          font-style: italic;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }

        .fk-glass-tile {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
        }

        .order-row-hover {
          transition: all 0.18s ease;
        }
        .order-row-hover:hover {
          background-color: #f8fafc;
        }
      `}</style>

      {/* 1. ULTRA-SLEEK FLIPKART SELLER HUB EXECUTIVE HERO BANNER */}
      <div className="fk-dashboard-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 2 }}>
          {/* Store Brand Identity & Live Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'}
                alt={savedData.storeName}
                style={{
                  width: '82px',
                  height: '82px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '3px solid #ffe500',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: '#22c55e',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2.5px solid #072352',
                  boxShadow: '0 0 10px #22c55e',
                }}
                title="Verified Flipkart Merchant"
              >
                <Check size={12} color="#ffffff" strokeWidth={3.5} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.025em' }}>
                  {savedData.storeName}
                </h1>

                {/* CaSa Assured Official Tag */}
                <span className="fk-badge-assured">
                  <span>CaSa Assured</span>
                  <span style={{ color: '#fb641b', fontStyle: 'normal' }}>★</span>
                </span>

                {/* Seller Tier */}
                <span
                  style={{
                    background: '#ffe500',
                    color: '#072352',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Award size={13} color="#072352" /> {savedData.sellerTier}
                </span>

                {/* GST Badge */}
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={13} color="#ffe500" /> GST VERIFIED
                </span>
              </div>

              <p style={{ margin: 0, color: '#dbeafe', fontSize: '0.88rem', maxWidth: '680px', lineHeight: 1.5 }}>
                {savedData.tagline}
              </p>

              {/* Sub-bar with Live Pulse, Merchant ID & Warehouse */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(savedData.merchantId, 'merchantId')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Click to copy Merchant ID"
                >
                  <span>SELLER ID: {savedData.merchantId}</span>
                  {copiedKey === 'merchantId' ? <Check size={12} color="#ffe500" /> : <Copy size={12} />}
                </button>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: isStoreActive ? '#ffe500' : '#fca5a5',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isStoreActive ? '#22c55e' : '#ef4444',
                      display: 'inline-block',
                      animation: isStoreActive ? 'greenPing 2s infinite' : 'none',
                    }}
                  />
                  <span>{isStoreActive ? 'LIVE & RECEIVING ORDERS' : 'VACATION MODE ACTIVE'}</span>
                </div>

                <span style={{ fontSize: '0.78rem', color: '#e0e7ff', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={13} color="#ffe500" /> {savedData.warehouseCity}, {savedData.warehouseState} (Hub #14)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Right CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleToggleStoreStatus}
              style={{
                background: isStoreActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                border: isStoreActive ? '1px solid rgba(248, 113, 113, 0.5)' : '1px solid rgba(74, 222, 128, 0.5)',
                color: '#ffffff',
                padding: '9px 15px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={14} />
              <span>{isStoreActive ? 'Set Vacation Mode' : 'Open Store Now'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({ ...savedData });
                setIsEditModalOpen(true);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '9px 15px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Edit3 size={14} color="#ffe500" />
              <span>Edit Store Profile</span>
            </button>

            <Link
              to="/vendor"
              className="fk-cta-primary"
              style={{ textDecoration: 'none' }}
            >
              <Zap size={16} fill="#ffffff" />
              <span>Launch Full Seller Hub</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Executive Quick Stats Strip */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.16)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <div className="fk-glass-tile">
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase' }}>TODAY'S ESTIMATED GMV</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>₹ 48,920</span>
            <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>▲ +18.4% vs yesterday</span>
          </div>

          <div className="fk-glass-tile">
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase' }}>ORDERS TO PACK TODAY</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffe500', marginTop: '2px' }}>
              {stats?.pendingToPack || 8} Orders
            </span>
            <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600 }}>SLA Dispatch Cutoff 4:30 PM</span>
          </div>

          <div className="fk-glass-tile">
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase' }}>NEXT BANK SETTLEMENT</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              {financials?.summary?.nextSettlementDate || 'Upcoming Friday'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 700 }}>Direct IMPS to HDFC Bank</span>
          </div>

          <div className="fk-glass-tile">
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase' }}>ASSIGNED LOGISTICS</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>Delhivery Express</span>
            <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>Daily 4:30 PM Van Handover</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC OPERATIONAL KPI CARDS WITH LIVE METRICS & GAUGES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total Revenue */}
        <div className="fk-stat-card" style={{ borderTop: '4px solid #2874f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.04em' }}>
                LIFETIME GROSS SALES (GMV)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
                {formatINR(stats?.totalRevenue || 842650)}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2874f0' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 800 }}>
              ▲ +14.2% MoM
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Marketplace Settlements</span>
          </div>
        </div>

        {/* Card 2: Rating Scorecard */}
        <div className="fk-stat-card" style={{ borderTop: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.04em' }}>
                SELLER QUALITY SCORE
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>4.9 / 5.0</span>
                <Star size={20} fill="#16a34a" color="#16a34a" />
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
              <span>On-Time Dispatch SLA</span>
              <span style={{ color: '#16a34a' }}>99.4% (Target: 98%)</span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ width: '99.4%', height: '100%', background: '#16a34a', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="fk-stat-card" style={{ borderTop: '4px solid #fb641b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.04em' }}>
                ORDERS TO PACK & DISPATCH
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fb641b', marginTop: '6px' }}>
                {stats?.pendingToPack || 8} Orders
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb641b' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
              ⚡ Handover cutoff at 4:30 PM
            </span>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2874f0',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              Pack Now <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 4: Active Listings */}
        <div className="fk-stat-card" style={{ borderTop: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.04em' }}>
                LIVE MARKETPLACE CATALOG
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7c3aed', marginTop: '6px' }}>
                {stats?.productsCount || products.length || 28} SKUs
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <Boxes size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800 }}>
              3 Low Stock Alerts
            </span>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2874f0',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Restock <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODERN SEGMENTED DASHBOARD NAVIGATION TABS */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`fk-nav-pill ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <TrendingUp size={16} />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`fk-nav-pill ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <Package size={16} />
          <span>
            Orders & Dispatch ({orders.length || '8'})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`fk-nav-pill ${activeTab === 'inventory' ? 'active' : ''}`}
        >
          <Boxes size={16} />
          <span>
            Catalog & Live Stock ({products.length || '28'})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`fk-nav-pill ${activeTab === 'payouts' ? 'active' : ''}`}
        >
          <CreditCard size={16} />
          <span>Settlements & Bank Payouts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`fk-nav-pill ${activeTab === 'legal' ? 'active' : ''}`}
        >
          <Building2 size={16} />
          <span>Store KYC & Pickup Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`fk-nav-pill ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Sliders size={16} />
          <span>Automation Settings</span>
        </button>
      </div>

      {/* 4. ACTIVE TAB CONTENT PANELS */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
        {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Urgent Orders Needing Immediate Action */}
            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fbbf24', color: '#78350f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#92400e' }}>
                    Orders Ready for Immediate Packing (Cutoff: 4:30 PM)
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#b45309' }}>
                    Pack and affix shipping labels before the courier rider arrives to preserve your 99.4% Gold Tier SLA rating.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="fk-cta-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Open Order Dispatch Queue →
              </button>
            </div>

            {/* Quick Live Orders Table Preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    Recent Orders & Fulfillment Status
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Real-time customer transactions booked across India.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', color: '#2874f0', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  View All Orders ({orders.length}) →
                </button>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', fontWeight: 800 }}>
                      <th style={{ padding: '12px 16px' }}>ORDER ID</th>
                      <th style={{ padding: '12px 16px' }}>CUSTOMER / DESTINATION</th>
                      <th style={{ padding: '12px 16px' }}>ITEMS</th>
                      <th style={{ padding: '12px 16px' }}>TOTAL AMOUNT</th>
                      <th style={{ padding: '12px 16px' }}>STATUS</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>QUICK ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                          No active orders currently. New orders will appear here automatically with live alerts.
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 4).map((ord) => (
                        <tr key={ord._id} className="order-row-hover" style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#2874f0' }}>
                            #{ord.orderNumber}
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                              {formatDate(ord.createdAt)}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <strong style={{ color: '#0f172a' }}>{ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>
                            {ord.items?.length || 1} Item(s)
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                            {formatINR(ord.totalPrice)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: ord.orderStatus === 'Delivered' ? '#dcfce7' : ord.orderStatus === 'Packed' ? '#f3e8ff' : '#eff6ff',
                                color: ord.orderStatus === 'Delivered' ? '#15803d' : ord.orderStatus === 'Packed' ? '#7e22ce' : '#2874f0',
                              }}
                            >
                              ● {ord.orderStatus}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Printer size={12} /> Packing Slip
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Catalog Items & Stock Health */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    Fast Moving Catalog Products & Stock Health
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Quick-boost inventory to avoid Flipkart Out-of-Stock penalties.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  style={{ background: 'none', border: 'none', color: '#2874f0', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Manage All Products →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {products.slice(0, 4).map((p) => {
                  const isLow = (p.stock || 0) < 5;
                  return (
                    <div
                      key={p._id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#fafbfc',
                      }}
                    >
                      <img
                        src={p.image || p.images?.[0]}
                        alt={p.name}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Price: <strong>{formatINR(p.discountPrice || p.price)}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              background: isLow ? '#fee2e2' : '#dcfce7',
                              color: isLow ? '#dc2626' : '#15803d',
                            }}
                          >
                            {isLow ? `⚠️ Low: ${p.stock || 0}` : `Stock: ${p.stock || 0}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickBoostStock(p, 10)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#2874f0',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            title="Add +10 inventory stock"
                          >
                            <Plus size={11} /> +10 Stock
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL ORDERS & DISPATCH QUEUE */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  Live Order Dispatch & Packing Pipeline
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Pack customer orders, print digital packing slips, and confirm logistics handovers.
                </p>
              </div>
              <Link to="/vendor" className="fk-cta-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.8rem' }}>
                Open Standalone Order Hub <ExternalLink size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                  <Package size={44} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>No Orders Found</h4>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0' }}>All customer shipments are up-to-date.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord._id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                    }}
                  >
                    {/* Top strip */}
                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800 }}>ORDER:</span>
                        <strong style={{ fontSize: '0.94rem', color: '#2874f0' }}>#{ord.orderNumber}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(ord.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>{formatINR(ord.totalPrice)}</span>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: ord.orderStatus === 'Delivered' ? '#dcfce7' : ord.orderStatus === 'Packed' ? '#f3e8ff' : '#eff6ff',
                            color: ord.orderStatus === 'Delivered' ? '#15803d' : ord.orderStatus === 'Packed' ? '#7e22ce' : '#2874f0',
                          }}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items & Shipping */}
                    <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        {ord.items?.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <img src={it.image} alt={it.name} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{it.name}</div>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Qty: <strong>{it.quantity}</strong> • {formatINR(it.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ minWidth: '220px', background: '#fafbfc', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</div>
                        <div>{ord.shippingAddress?.street}, {ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}</div>
                        <div style={{ color: '#2874f0', fontWeight: 700, marginTop: '2px' }}>Phone: {ord.shippingAddress?.phone || 'Verified'}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '10px 18px', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Printer size={13} style={{ display: 'inline', marginRight: '4px' }} /> Packing Slip
                      </button>

                      {ord.orderStatus === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(ord._id, 'Processing')}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#2874f0', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          📦 Confirm & Pack
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
                          🚚 Dispatch to Delhivery
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CATALOG & LIVE STOCK BOOSTER */}
        {activeTab === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  Merchant Catalog & Stock Replenishment
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Boost inventory stock with 1-click to prevent low stock penalty flags.
                </p>
              </div>
              <Link to="/vendor" className="fk-cta-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add New Listing
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {products.map((p) => {
                const isLow = (p.stock || 0) < 5;
                return (
                  <div key={p._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff', display: 'flex', gap: '12px' }}>
                    <img src={p.image || p.images?.[0]} alt={p.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                            +10
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

        {/* TAB 4: SETTLEMENTS & BANK PAYOUTS */}
        {activeTab === 'payouts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#2874f0" />
                Verified Bank Credentials & Weekly Rolling Disbursements
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Direct NEFT/IMPS rolling transfers credited every T+2 working days.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #16a34a' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>SETTLEMENT BANK</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px' }}>{savedData.bankName}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{savedData.bankBranch}</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ACCOUNT NUMBER</span>
                  <button
                    type="button"
                    onClick={() => setShowAccountNo(!showAccountNo)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2874f0', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    {showAccountNo ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>
                  {showAccountNo ? savedData.accountNumber : `•••• •••• •••• ${savedData.accountNumber.slice(-4)}`}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>Direct IMPS Auto-Credit Active</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>IFSC ROUTING CODE</span>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>{savedData.ifscCode}</div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>RTGS / NEFT / IMPS Enabled</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>PLATFORM COMMISSION SLAB</span>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#2874f0', marginTop: '3px' }}>{savedData.commissionRate}% Flat Rate</div>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>Gold Merchant Tier Privileged Rate</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STORE KYC & PICKUP HUB */}
        {activeTab === 'legal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} color="#2874f0" />
                  Statutory Registrations & Logistics Dispatch Hub
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Official business constitution and courier collection warehouse details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...savedData });
                  setIsEditModalOpen(true);
                }}
                className="fk-cta-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <Edit3 size={13} /> Update Credentials
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>GSTIN NUMBER</span>
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
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>PERMANENT ACCOUNT NUMBER (PAN)</span>
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
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>WAREHOUSE & PICKUP LOCATION</span>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '3px' }}>
                  {savedData.warehouseName}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
                  {savedData.warehouseStreet}, {savedData.warehouseCity}, {savedData.warehouseState} - {savedData.warehousePincode}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700, marginTop: '6px' }}>
                  Pickup Cutoff: {savedData.dispatchCutoff} • In-Charge: {savedData.dispatchManager} (+91 {savedData.businessPhone})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: STORE AUTOMATION SETTINGS */}
        {activeTab === 'settings' && (
          <VendorStoreSettings user={user} onSettingsSaved={onProfileUpdated} />
        )}
      </div>

      {/* 5. TAX INVOICE & PACKING SLIP MODAL */}
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
              maxWidth: '700px',
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

      {/* 6. EDIT STORE PROFILE MODAL */}
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
