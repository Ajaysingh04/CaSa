import React, { useState } from 'react';
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
  Globe,
  Percent,
  Save,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ProfessionalVendorProfile = ({ user, onProfileUpdated }) => {
  const { success, error } = useToast();

  // Active Merchant Sub-Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'legal' | 'warehouse' | 'payouts'

  // Store Live Status (Accepting Orders vs Holiday Mode)
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

  // Merchant Details State (with rich defaults for Aarav Handlooms)
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

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle Store Active / Vacation Mode
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
          ? 'Store status updated: Store is now OPEN and accepting customer orders!'
          : 'Store status updated: Vacation Mode activated. Catalog items marked as temporarily away.'
      );
    } catch (err) {
      error('Failed to update store status. Please try again.');
    }
  };

  // Save Modal Form Changes
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
        success('Merchant store credentials & operational profile saved successfully!');
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
        .vendor-hero-banner {
          background: linear-gradient(135deg, #09101d 0%, #0f1c30 50%, #172847 100%);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(15, 28, 48, 0.5);
          color: #ffffff;
        }
        .vendor-hero-glow {
          position: absolute;
          top: -80px;
          right: -80px;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(234, 88, 12, 0.22) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .vendor-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .vendor-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }
        .vendor-subtab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .vendor-info-tile {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .vendor-info-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .vendor-info-value {
          font-size: 0.94rem;
          font-weight: 700;
          color: #0f172a;
          word-break: break-word;
        }
        @media (max-width: 768px) {
          .vendor-hero-banner {
            padding: 20px;
          }
          .vendor-hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .vendor-hero-actions > * {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* 1. EXECUTIVE BRAND STOREFRONT HERO BANNER */}
      <div className="vendor-hero-banner">
        <div className="vendor-hero-glow" />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
          {/* Brand Identity with Avatar & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                alt={savedData.storeName}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '3px solid #f97316',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: '#22c55e',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #09101d',
                }}
                title="Verified Merchant"
              >
                <Check size={11} color="#ffffff" strokeWidth={3} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  {savedData.storeName}
                </h1>
                <span
                  style={{
                    background: 'rgba(234, 88, 12, 0.25)',
                    color: '#fdba74',
                    border: '1px solid rgba(249, 115, 22, 0.5)',
                    borderRadius: '9999px',
                    padding: '2px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Award size={12} color="#fdba74" /> {savedData.sellerTier}
                </span>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#86efac',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '9999px',
                    padding: '2px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={12} color="#86efac" /> GST VERIFIED
                </span>
              </div>

              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.84rem', maxWidth: '640px', lineHeight: 1.45 }}>
                {savedData.tagline}
              </p>

              {/* Badges Bar: ID, Status, Hub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(savedData.merchantId, 'merchantId')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '3px 9px',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  title="Click to copy Merchant ID"
                >
                  <span>ID: {savedData.merchantId}</span>
                  {copiedKey === 'merchantId' ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                </button>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: isStoreActive ? '#4ade80' : '#f87171',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isStoreActive ? '#22c55e' : '#ef4444',
                      display: 'inline-block',
                      boxShadow: isStoreActive ? '0 0 10px #22c55e' : 'none',
                    }}
                  />
                  <span>{isStoreActive ? 'STORE OPEN (ACCEPTING ORDERS)' : 'STORE PAUSED (HOLIDAY MODE)'}</span>
                </div>

                <span style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#f97316" /> {savedData.warehouseCity}, {savedData.warehouseState}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header CTA Action Buttons */}
          <div className="vendor-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleToggleStoreStatus}
              style={{
                background: isStoreActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                border: isStoreActive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
                color: isStoreActive ? '#fca5a5' : '#86efac',
                padding: '9px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              title="Toggle Store Active / Holiday Mode"
            >
              <Sliders size={13} />
              <span>{isStoreActive ? 'Set Vacation Mode' : 'Open Store Now'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({ ...savedData });
                setIsEditModalOpen(true);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '9px 15px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Edit3 size={14} color="#fdba74" />
              <span>Edit Store Profile</span>
            </button>

            <Link
              to="/vendor"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
              }}
            >
              <Store size={15} color="#ffffff" />
              <span>Launch Vendor Hub</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI SCORECARD (4 STATS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="vendor-kpi-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Star size={20} color="#b45309" fill="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>SELLER RATING</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>4.9 / 5.0 ⭐</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>1,280+ Verified Buyer Reviews</div>
          </div>
        </div>

        <div className="vendor-kpi-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={20} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DISPATCH COMPLIANCE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>99.4% SLA</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>On-time handover to courier</div>
          </div>
        </div>

        <div className="vendor-kpi-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>AVG SHIPPING SPEED</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>&lt; 24 Hours</div>
            <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>Same / Next-Day Dispatch</div>
          </div>
        </div>

        <div className="vendor-kpi-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RefreshCw size={20} color="#ea580c" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>LOW RETURN RATE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>1.8% RTO</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Category benchmark 8.2%</div>
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED TABS NAVIGATION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className="vendor-subtab-btn"
          style={{
            background: activeTab === 'overview' ? '#ea580c' : '#f1f5f9',
            color: activeTab === 'overview' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'overview' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
          }}
        >
          <Building2 size={16} />
          <span>Store & Brand Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className="vendor-subtab-btn"
          style={{
            background: activeTab === 'legal' ? '#ea580c' : '#f1f5f9',
            color: activeTab === 'legal' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'legal' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
          }}
        >
          <FileText size={16} />
          <span>GSTIN & Statutory Compliance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouse')}
          className="vendor-subtab-btn"
          style={{
            background: activeTab === 'warehouse' ? '#ea580c' : '#f1f5f9',
            color: activeTab === 'warehouse' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'warehouse' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
          }}
        >
          <MapPin size={16} />
          <span>Warehouse & Dispatch Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className="vendor-subtab-btn"
          style={{
            background: activeTab === 'payouts' ? '#ea580c' : '#f1f5f9',
            color: activeTab === 'payouts' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'payouts' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
          }}
        >
          <CreditCard size={16} />
          <span>Bank & Settlement Payouts</span>
        </button>
      </div>

      {/* 4. ACTIVE SUB-TAB CONTENT PANELS */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
        {/* TAB 1: STORE & BRAND IDENTITY */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={19} color="#ea580c" />
                  Storefront & Merchant Profile
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Official brand credentials visible on CASA product pages and seller storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...savedData });
                  setIsEditModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff7ed',
                  border: '1.5px solid #fed7aa',
                  color: '#ea580c',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={13} /> Edit Brand Info
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Store size={12} /> Merchant Store Name</span>
                <span className="vendor-info-value">{savedData.storeName}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Sparkles size={12} /> Brand Tagline / Slogan</span>
                <span className="vendor-info-value">{savedData.tagline}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Building2 size={12} /> Legal Entity Name</span>
                <span className="vendor-info-value">{savedData.legalEntityName}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Layers size={12} /> Primary Product Specialization</span>
                <span className="vendor-info-value">{savedData.primaryCategory}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Phone size={12} /> Direct Merchant Phone</span>
                <span className="vendor-info-value">+91 {savedData.businessPhone}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Mail size={12} /> Verified Business Email</span>
                <span className="vendor-info-value">{savedData.businessEmail}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Truck size={12} /> Fulfillment Channel</span>
                <span className="vendor-info-value" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} color="#059669" /> CASA Direct Express Logistics Hub Pickup
                </span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Award size={12} /> Platform Partnership</span>
                <span className="vendor-info-value">Certified Merchant Agreement 2026-2027</span>
              </div>
            </div>

            {/* Brand Story Callout */}
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Sparkles size={20} color="#9333ea" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#581c87' }}>
                  Authentic Handloom Certified Seller
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#6b21a8', lineHeight: 1.5 }}>
                  Aarav Luxury Handlooms is directly integrated with weaver clusters across Chanderi, Maheshwar, and Varanasi. Every product dispatched includes a verified Silk Mark certificate and tamper-proof CASA security tag.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEGAL, GST & STATUTORY COMPLIANCE */}
        {activeTab === 'legal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={19} color="#ea580c" />
                GSTIN & Statutory Tax Compliance
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Verified tax identities, GST filings, and legal business classification under Government of India guidelines.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="vendor-info-tile" style={{ borderLeft: '4px solid #22c55e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="vendor-info-label"><FileText size={12} /> GSTIN (Active Verified)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.gstin, 'gstin')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    title="Copy GSTIN"
                  >
                    {copiedKey === 'gstin' ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="vendor-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#0f172a' }}>
                  {savedData.gstin}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                  State Code: 23 (Madhya Pradesh) | Regular Taxpayer
                </span>
              </div>

              <div className="vendor-info-tile" style={{ borderLeft: '4px solid #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="vendor-info-label"><ShieldCheck size={12} /> Permanent Account Number (PAN)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.pan, 'pan')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    title="Copy PAN"
                  >
                    {copiedKey === 'pan' ? <Check size={14} color="#2563eb" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="vendor-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#0f172a' }}>
                  {savedData.pan}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>
                  Corporate Entity PAN | Verified
                </span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Award size={12} /> MSME / Udyam Registration</span>
                <span className="vendor-info-value" style={{ fontFamily: 'monospace', fontSize: '0.92rem' }}>
                  {savedData.msmeReg}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Enterprise: Micro, Small & Medium Enterprise</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Building2 size={12} /> Business Constitution</span>
                <span className="vendor-info-value">{savedData.businessType}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Incorporation: Ministry of Corporate Affairs</span>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#166534' }}>
                  Statutory Invoicing & TDS Compliance Active
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#15803d' }}>
                  All orders fulfilled by your store automatically generate compliant GST B2C and B2B invoices with digital HSN codes (5007 / 5208) and Section 194-O TDS deductions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WAREHOUSE & PICKUP HUB */}
        {activeTab === 'warehouse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={19} color="#ea580c" />
                  Primary Dispatch Warehouse & Courier Pickup Location
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Location where delivery partners (Delhivery, BlueDart, CASA Fleet) arrive to collect packed consignments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...savedData });
                  setIsEditModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff7ed',
                  border: '1.5px solid #fed7aa',
                  color: '#ea580c',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={13} /> Update Warehouse Address
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="vendor-info-tile" style={{ gridColumn: 'span 2' }}>
                <span className="vendor-info-label"><Building2 size={12} /> Facility Name & Full Address</span>
                <span className="vendor-info-value" style={{ fontSize: '1rem', color: '#0f172a' }}>
                  {savedData.warehouseName}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#475569', marginTop: '3px', fontWeight: 500 }}>
                  {savedData.warehouseStreet}, {savedData.warehouseCity}, {savedData.warehouseState} - {savedData.warehousePincode}
                </span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Clock size={12} /> Daily Pickup Cutoff Time</span>
                <span className="vendor-info-value" style={{ color: '#ea580c' }}>{savedData.dispatchCutoff}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Orders packed before 3:30 PM dispatched same day</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Phone size={12} /> Warehouse In-Charge / Dispatch Phone</span>
                <span className="vendor-info-value">{savedData.dispatchManager}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Direct Line: +91 {savedData.businessPhone}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Truck size={12} /> Integrated Courier Fleets</span>
                <span className="vendor-info-value" style={{ fontSize: '0.88rem' }}>Delhivery Surface, BlueDart Air & CASA Express</span>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Auto-manifesting enabled</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><RefreshCw size={12} /> RTO & Customer Returns Hub</span>
                <span className="vendor-info-value" style={{ fontSize: '0.88rem' }}>Returns inspected at Indore Central Hub before restock</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>48h quality audit guarantee</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BANK & SETTLEMENT PAYOUTS */}
        {activeTab === 'payouts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={19} color="#ea580c" />
                  Bank Account & Settlement Payout Credentials
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Designated commercial bank account where sales revenues are deposited on a rolling T+2 schedule.
                </p>
              </div>

              <Link
                to="/vendor"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                <span>View Payout History & UTR</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="vendor-info-tile" style={{ borderLeft: '4px solid #059669' }}>
                <span className="vendor-info-label"><Building2 size={12} /> Settlement Bank</span>
                <span className="vendor-info-value">{savedData.bankName}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{savedData.bankBranch}</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Award size={12} /> Beneficiary Account Name</span>
                <span className="vendor-info-value">{savedData.accountHolder}</span>
              </div>

              <div className="vendor-info-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="vendor-info-label"><CreditCard size={12} /> Account Number</span>
                  <button
                    type="button"
                    onClick={() => setShowAccountNo(!showAccountNo)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                  >
                    {showAccountNo ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showAccountNo ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <span className="vendor-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
                  {showAccountNo ? savedData.accountNumber : `•••• •••• •••• ${savedData.accountNumber.slice(-4)}`}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Direct IMPS / NEFT Auto-Credit</span>
              </div>

              <div className="vendor-info-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="vendor-info-label"><FileText size={12} /> IFSC Routing Code</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.ifscCode, 'ifsc')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    title="Copy IFSC Code"
                  >
                    {copiedKey === 'ifsc' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="vendor-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#0f172a' }}>
                  {savedData.ifscCode}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RTGS / NEFT / IMPS Enabled</span>
              </div>

              <div className="vendor-info-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="vendor-info-label"><Sparkles size={12} /> Business UPI VPA</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.upiId, 'upi')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    title="Copy UPI ID"
                  >
                    {copiedKey === 'upi' ? <Check size={14} color="#ea580c" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="vendor-info-value" style={{ color: '#ea580c', fontFamily: 'monospace' }}>
                  {savedData.upiId}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Instant Merchant QR & Settlement ID</span>
              </div>

              <div className="vendor-info-tile">
                <span className="vendor-info-label"><Percent size={12} /> Platform Commission Slab</span>
                <span className="vendor-info-value" style={{ color: '#2563eb' }}>{savedData.commissionRate}% Flat Rate</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Gold Merchant Tier privileged rate (Standard: 12%)</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="#2563eb" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    Rolling Settlement Schedule: T+2 Working Days
                  </h4>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Payments for delivered orders are credited directly into your verified HDFC account within 48 hours of successful delivery confirmation.
                  </p>
                </div>
              </div>

              <Link
                to="/vendor"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                View Financial Ledger
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 5. DIRECT ACTION BANNER TO VENDOR DASHBOARD */}
      <div
        style={{
          background: 'linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1.5px solid #fed7aa',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
            <Store size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#9a3412' }}>
              Looking for Order Fulfillment & Catalog Management?
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#c2410c' }}>
              Pack customer orders, generate shipping labels, add new inventory, and review daily sales earnings in the Vendor Hub.
            </p>
          </div>
        </div>

        <Link
          to="/vendor"
          style={{
            background: '#ea580c',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 800,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
          }}
        >
          <span>Open Full Vendor Hub</span>
          <ChevronRight size={15} />
        </Link>
      </div>

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
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <Edit3 size={19} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    Edit Merchant Store Profile
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
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

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Store & Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  1. Store Branding & Identity
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Merchant Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Authorized Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Brand Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Direct Phone Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.businessPhone}
                      onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value.replace(/\D/g, '') })}
                      maxLength={10}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Primary Operating Categories
                    </label>
                    <input
                      type="text"
                      value={formData.primaryCategory}
                      onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Statutory & Warehouse */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Warehouse & GST Details
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      GSTIN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Business PAN *
                    </label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Warehouse Facility / Dispatch Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.warehouseStreet}
                    onChange={(e) => setFormData({ ...formData, warehouseStreet: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>City *</label>
                    <input
                      type="text"
                      required
                      value={formData.warehouseCity}
                      onChange={(e) => setFormData({ ...formData, warehouseCity: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>State *</label>
                    <input
                      type="text"
                      required
                      value={formData.warehouseState}
                      onChange={(e) => setFormData({ ...formData, warehouseState: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.warehousePincode}
                      onChange={(e) => setFormData({ ...formData, warehousePincode: e.target.value.replace(/\D/g, '') })}
                      maxLength={6}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '9px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '9px',
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                  }}
                >
                  <Save size={15} />
                  <span>{isSaving ? 'Saving...' : 'Save Merchant Profile'}</span>
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
