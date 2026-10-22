import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Volume2,
  MessageSquare,
  Package,
  Truck,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Save,
  RotateCcw,
  AlertTriangle,
  Globe,
  Printer,
  Sparkles,
  Store,
  Check,
  Info,
  Play,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

const VendorStoreSettings = ({ user, onSettingsSaved }) => {
  const { success, error } = useToast();
  const { language } = useStore();

  const userSettings = user?.vendorDetails?.settings || {};

  // Merchant Operational & Automation Settings State
  const [settings, setSettings] = useState({
    autoConfirmOrders: userSettings.autoConfirmOrders !== false,
    newOrderSoundAlert: userSettings.newOrderSoundAlert !== false,
    whatsappAlerts: userSettings.whatsappAlerts !== false,
    lowStockThreshold: userSettings.lowStockThreshold || 5,
    dailyDigestEmail: userSettings.dailyDigestEmail !== false,
    preferredCourier: userSettings.preferredCourier || 'Delhivery Express Air & Surface',
    dispatchCutoffTime: userSettings.dispatchCutoffTime || '4:30 PM IST (Mon - Sat)',
    invoicePrefix: userSettings.invoicePrefix || 'CASA-AARAV/2026/',
    taxInclusive: userSettings.taxInclusive !== false,
    returnWindowDays: userSettings.returnWindowDays || 7,
    autoAcceptReturns: userSettings.autoAcceptReturns !== false,
    vacationMode: user?.vendorDetails?.storeStatus === 'vacation',
    portalLanguage: user?.preferredLanguage || language || 'en',
    packagingBagType: userSettings.packagingBagType || 'Official CaSa Eco-Shield Packaging (500g)',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);

  // Toggle helper
  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Play test audio chime
  const handleTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: E5 (659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: A5 (880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);

      success('Playing CaSa order notification chime!');
    } catch {
      // Audio context error or user interaction needed
    }
  };

  // Save Settings to Backend API
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        preferredLanguage: settings.portalLanguage,
        vendorDetails: {
          ...(user?.vendorDetails || {}),
          storeStatus: settings.vacationMode ? 'vacation' : 'active',
          settings: {
            ...settings,
          },
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        success('CaSa store settings and automation rules updated successfully!');
        setSavedRecently(true);
        setTimeout(() => setSavedRecently(false), 3000);
        if (onSettingsSaved) {
          onSettingsSaved(res.data.user);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save CaSa settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <style>{`
        .casa-settings-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 18px -4px rgba(15, 23, 42, 0.05);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .casa-settings-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.07);
        }
        .casa-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
          gap: 18px;
          flex-wrap: wrap;
        }
        .casa-setting-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .casa-toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 0;
        }
        .casa-toggle-track {
          position: absolute;
          inset: 0;
          background-color: #cbd5e1;
          border-radius: 9999px;
          transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .casa-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 4px;
          width: 22px;
          height: 22px;
          background-color: #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .casa-toggle-switch.active .casa-toggle-track {
          background-color: #2563eb;
        }
        .casa-toggle-switch.active .casa-toggle-thumb {
          transform: translateX(20px);
        }
        .casa-toggle-switch.emerald.active .casa-toggle-track {
          background-color: #10b981;
        }
        .casa-toggle-switch.danger.active .casa-toggle-track {
          background-color: #ef4444;
        }
        .casa-save-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 12px 26px;
          font-weight: 800;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.01em;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .casa-save-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45);
        }
        .casa-save-btn:active {
          transform: translateY(0);
        }
        .casa-select-input {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.84rem;
          font-weight: 700;
          color: #0f172a;
          background: #f8fafc;
          cursor: pointer;
          outline: none;
          transition: all 0.15s ease;
        }
        .casa-select-input:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        @media (max-width: 768px) {
          .casa-settings-card {
            padding: 16px 14px !important;
            border-radius: 14px !important;
          }
          .casa-setting-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .casa-select-input {
            width: 100% !important;
            max-width: 100% !important;
          }
          .casa-save-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Top Banner: CaSa Executive Merchant Engine */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 10px 28px -4px rgba(15, 23, 42, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Sliders size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                }}
              >
                CaSa Verified Seller Hub
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              CaSa Store Settings & Automation
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
              Fine-tune live buyer order alerts, express fulfillment dispatch, statutory GST invoices, and return policies.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="casa-save-btn"
          style={{ background: savedRecently ? '#10b981' : '#2563eb' }}
        >
          {savedRecently ? <Check size={18} /> : <Save size={18} />}
          <span>{isSaving ? 'Updating...' : savedRecently ? 'Saved to CaSa!' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* SECTION 1: CASA EXPRESS LOGISTICS & DISPATCH SLA */}
      <div className="casa-settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Truck size={20} color="#2563eb" />
            CaSa Express Logistics & Dispatch SLA
          </h3>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: '9999px' }}>
            Automated Handover
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 18px 0' }}>
          Automate customer order acceptance and daily courier pickup manifests with integrated CaSa Express Logistics fleet.
        </p>

        {/* Auto Confirm Orders */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Auto-Confirm Incoming Customer Orders
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Immediately switch new user bookings to "Confirmed" status so warehouse pickers can begin packing without delay.
            </span>
          </div>
          <button
            type="button"
            className={`casa-toggle-switch ${settings.autoConfirmOrders ? 'active' : ''}`}
            onClick={() => handleToggle('autoConfirmOrders')}
            aria-label="Toggle Auto Confirm"
          >
            <div className="casa-toggle-track" />
            <div className="casa-toggle-thumb" />
          </button>
        </div>

        {/* Preferred Courier Fleet */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Preferred Express Courier Partner
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Default delivery network assigned for automatic pickup manifests and airway bill (AWB) generation.
            </span>
          </div>
          <select
            value={settings.preferredCourier}
            onChange={(e) => setSettings({ ...settings, preferredCourier: e.target.value })}
            className="casa-select-input"
          >
            <option value="Delhivery Express Air & Surface">Delhivery Express Air & Surface (Recommended)</option>
            <option value="BlueDart Air Express Cargo">BlueDart Air Express Cargo</option>
            <option value="CaSa Dedicated Express Logistics">CaSa Dedicated Express Logistics</option>
            <option value="Smart Auto-Routing (Fastest Available)">Smart Auto-Routing (Fastest Available)</option>
          </select>
        </div>

        {/* Daily Courier Cutoff */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Daily Courier Handover Cutoff Window
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Scheduled time when CaSa delivery riders arrive at your workshop hub for daily parcel collection.
            </span>
          </div>
          <select
            value={settings.dispatchCutoffTime}
            onChange={(e) => setSettings({ ...settings, dispatchCutoffTime: e.target.value })}
            className="casa-select-input"
          >
            <option value="4:30 PM IST (Mon - Sat)">Evening Cutoff: 4:30 PM IST (Mon - Sat)</option>
            <option value="11:30 AM IST (Mon - Sat)">Morning Cutoff: 11:30 AM IST (Mon - Sat)</option>
            <option value="Twice Daily (11:30 AM & 4:30 PM)">Twice Daily Dispatch (11:30 AM & 4:30 PM)</option>
          </select>
        </div>

        {/* Standard Packaging Type */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Standard Dispatch Packaging Tier
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Official CaSa branded packaging tier used for calculating courier volumetric weight.
            </span>
          </div>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#2563eb',
              background: '#eff6ff',
              padding: '6px 14px',
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
            }}
          >
            Official CaSa Eco-Shield Packaging (500g)
          </span>
        </div>
      </div>

      {/* SECTION 2: REAL-TIME USER BOOKING ALERTS & NOTIFICATIONS */}
      <div className="casa-settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Bell size={20} color="#2563eb" />
            Real-Time Customer Booking Alerts & Channels
          </h3>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px' }}>
            Live Sync Active
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 18px 0' }}>
          Never miss a customer booking with instant sound alerts, WhatsApp triggers, and low-inventory warnings.
        </p>

        {/* New Order Audio Chime */}
        <div className="casa-setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Volume2 size={20} color="#2563eb" />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
                New Customer Booking Audio Chime
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Play a distinctive notification bell on the vendor workstation whenever a customer places an order.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleTestSound}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Test the chime sound"
            >
              <Play size={12} color="#2563eb" /> Test Sound
            </button>
            <button
              type="button"
              className={`casa-toggle-switch ${settings.newOrderSoundAlert ? 'active' : ''}`}
              onClick={() => handleToggle('newOrderSoundAlert')}
              aria-label="Toggle Audio Chime"
            >
              <div className="casa-toggle-track" />
              <div className="casa-toggle-thumb" />
            </button>
          </div>
        </div>

        {/* WhatsApp Alerts */}
        <div className="casa-setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} color="#10b981" />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
                WhatsApp Direct Order Notifications
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Send instant order summary, buyer address, and packing slip links to registered phone (+91 {user?.phone || '9876524680'}).
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`casa-toggle-switch emerald ${settings.whatsappAlerts ? 'active' : ''}`}
            onClick={() => handleToggle('whatsappAlerts')}
            aria-label="Toggle WhatsApp Alerts"
          >
            <div className="casa-toggle-track" />
            <div className="casa-toggle-thumb" />
          </button>
        </div>

        {/* Low Stock Alert Threshold */}
        <div className="casa-setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
                Low Inventory Restock Threshold
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Trigger automatic red warning badges and restock priority alerts when catalog stock falls below this quantity.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                background: '#f8fafc',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setSettings((p) => ({ ...p, lowStockThreshold: Math.max(1, p.lowStockThreshold - 1) }))}
                style={{
                  width: '32px',
                  height: '34px',
                  background: '#ffffff',
                  border: 'none',
                  borderRight: '1px solid #e2e8f0',
                  fontWeight: 900,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) || 1 })}
                style={{
                  width: '46px',
                  height: '34px',
                  border: 'none',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  background: 'transparent',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setSettings((p) => ({ ...p, lowStockThreshold: Math.min(100, p.lowStockThreshold + 1) }))}
                style={{
                  width: '32px',
                  height: '34px',
                  background: '#ffffff',
                  border: 'none',
                  borderLeft: '1px solid #e2e8f0',
                  fontWeight: 900,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Units remaining</span>
          </div>
        </div>

        {/* Daily Sales Digest */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              End-of-Day 9:00 PM Financial Digest Email
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Daily automated email summarizing total gross sales, commission deductions, packed volume, and rolling settlement projection.
            </span>
          </div>
          <button
            type="button"
            className={`casa-toggle-switch ${settings.dailyDigestEmail ? 'active' : ''}`}
            onClick={() => handleToggle('dailyDigestEmail')}
            aria-label="Toggle Daily Digest"
          >
            <div className="casa-toggle-track" />
            <div className="casa-toggle-thumb" />
          </button>
        </div>
      </div>

      {/* SECTION 3: GST INVOICING & STATUTORY COMPLIANCE */}
      <div className="casa-settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '9px' }}>
            <FileText size={20} color="#2563eb" />
            Statutory GST Invoicing & Compliance
          </h3>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', background: '#f0f9ff', padding: '3px 10px', borderRadius: '9999px' }}>
            Govt. Rule 194-O
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 18px 0' }}>
          Digital invoices generated for customers adhere strictly to Government of India GST standards.
        </p>

        {/* Tax Inclusive Pricing */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Tax-Inclusive Catalog Pricing
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Listed product prices on CaSa marketplace already include applicable Handloom GST (5% / 12%).
            </span>
          </div>
          <button
            type="button"
            className={`casa-toggle-switch emerald ${settings.taxInclusive ? 'active' : ''}`}
            onClick={() => handleToggle('taxInclusive')}
            aria-label="Toggle Tax Inclusive"
          >
            <div className="casa-toggle-track" />
            <div className="casa-toggle-thumb" />
          </button>
        </div>

        {/* Custom Invoice Series Prefix */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Official Tax Invoice Series Prefix
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Unique sequential prefix printed on customer tax invoices generated by your CaSa merchant store.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value.toUpperCase() })}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.86rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                maxWidth: '220px',
                outline: 'none',
                background: '#f8fafc',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
              Preview: <span style={{ color: '#0f172a', fontFamily: 'monospace' }}>{settings.invoicePrefix}INV-0042</span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: CUSTOMER RETURNS & REVERSE LOGISTICS */}
      <div className="casa-settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '9px' }}>
            <RotateCcw size={20} color="#2563eb" />
            Customer Returns & RTO Restocking Rules
          </h3>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: '9999px' }}>
            Reverse Pickup
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 18px 0' }}>
          Define window for customer doorstep returns and reverse courier handover procedures.
        </p>

        {/* Return Window */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Customer Return Eligibility Window
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Number of days from delivery date during which buyers may request a return or size exchange.
            </span>
          </div>
          <select
            value={settings.returnWindowDays}
            onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
            className="casa-select-input"
          >
            <option value={7}>7 Days Easy Return (CaSa Standard Policy)</option>
            <option value={10}>10 Days Extended Return Window</option>
            <option value={14}>14 Days Premium Handloom Privilege</option>
          </select>
        </div>

        {/* Auto Accept RTO */}
        <div className="casa-setting-row">
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>
              Automated RTO (Return to Origin) Inbound Acceptance
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Automatically log undelivered RTO packages upon arrival at your workshop hub for quality audit before restocking.
            </span>
          </div>
          <button
            type="button"
            className={`casa-toggle-switch ${settings.autoAcceptReturns ? 'active' : ''}`}
            onClick={() => handleToggle('autoAcceptReturns')}
            aria-label="Toggle Auto Accept RTO"
          >
            <div className="casa-toggle-track" />
            <div className="casa-toggle-thumb" />
          </button>
        </div>
      </div>

      {/* SECTION 5: VACATION / HOLIDAY MODE */}
      <div
        className="casa-settings-card"
        style={{
          border: settings.vacationMode ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
          background: settings.vacationMode ? '#fef2f2' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                color: settings.vacationMode ? '#991b1b' : '#0f172a',
                margin: '0 0 4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Store size={20} color={settings.vacationMode ? '#ef4444' : '#2563eb'} />
              Temporary Workshop Vacation / Holiday Mode
            </h3>
            <p style={{ fontSize: '0.8rem', color: settings.vacationMode ? '#b91c1c' : '#64748b', margin: 0, maxWidth: '640px' }}>
              Enable this when your workshop is closed for festivals, inventory audits, or holidays. Your products will be temporarily paused on CaSa marketplace search so dispatch SLA is not impacted.
            </p>
          </div>

          <button
            type="button"
            className={`casa-toggle-switch danger ${settings.vacationMode ? 'active' : ''}`}
            onClick={() => handleToggle('vacationMode')}
            aria-label="Toggle Vacation Mode"
          >
            <div className="casa-toggle-track" />
            <div className="casa-toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Bottom Sticky-style Action Strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>All settings are securely synced across CaSa fulfillment nodes and courier gateways.</span>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="casa-save-btn"
          style={{ background: savedRecently ? '#10b981' : '#2563eb' }}
        >
          {savedRecently ? <Check size={18} /> : <Save size={18} />}
          <span>{isSaving ? 'Saving Changes...' : savedRecently ? 'Settings Saved Successfully!' : 'Save All Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default VendorStoreSettings;
