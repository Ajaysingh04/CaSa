import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCw,
  ExternalLink,
  Shield,
  Banknote,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  KeyRound,
  X,
  Check,
  DollarSign,
  Boxes,
  ShieldCheck,
  Power,
  User,
  Bike,
  Calendar,
  CreditCard,
  Award,
  FileText,
  Camera,
  Save,
  Edit3,
  Headphones,
  Zap,
  QrCode,
  Compass,
  HelpCircle,
  Upload,
  ChevronRight,
  ThumbsUp,
  Radio,
  BadgeCheck,
  Activity,
  Map as MapIcon,
  Eye,
  FileUp,
  Crosshair,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { deliveryService } from '../../services/deliveryService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

const INITIAL_DOCUMENTS = [
  {
    id: 'doc_dl',
    type: 'Driving License (DL)',
    docNumber: 'MP09 20210088921',
    validTill: '14 Aug 2035',
    status: 'VERIFIED ✅',
    preview: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    verifiedAt: '12 Jan 2026',
    notes: 'Valid for Two Wheeler & Light Motor Vehicle (LMV)'
  },
  {
    id: 'doc_rc',
    type: 'Vehicle Registration Certificate (RC)',
    docNumber: 'MP-09-EV-8821',
    validTill: 'Lifetime (Green EV)',
    status: 'VERIFIED ✅',
    preview: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    verifiedAt: '14 Jan 2026',
    notes: 'Hero Electric Optima CX - Zero Emission Commercial'
  },
  {
    id: 'doc_ins',
    type: 'Vehicle Insurance Policy',
    docNumber: 'POL-ICICI-881920',
    validTill: '28 Nov 2026',
    status: 'ACTIVE ✅',
    preview: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
    verifiedAt: '14 Jan 2026',
    notes: 'ICICI Lombard Comprehensive 2-Wheeler Cover'
  },
  {
    id: 'doc_aadhaar',
    type: 'Aadhaar Card / National ID',
    docNumber: 'XXXX-XXXX-4819',
    validTill: 'Permanent',
    status: 'VERIFIED ✅',
    preview: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=400&auto=format&fit=crop&q=80',
    verifiedAt: '10 Jan 2026',
    notes: 'Government UIDAI Bio-authenticated'
  },
  {
    id: 'doc_bank',
    type: 'Bank Passbook / Payout Proof',
    docNumber: 'ICICI Bank (A/C: *******4421)',
    validTill: 'Active',
    status: 'VERIFIED FOR PAYOUTS ✅',
    preview: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    verifiedAt: '11 Jan 2026',
    notes: 'IFSC: ICIC0001048 • UPI: vikram.singh@okaxis'
  }
];

const ProfessionalDeliveryProfile = ({ user: initialUser, onProfileUpdated }) => {
  const { user, updateProfile, switchRole } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState('active-runs'); // 'active-runs' | 'available-pool' | 'earnings' | 'fleet-kyc' | 'documents' | 'profile-settings' | 'support'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Duty status
  const [onDuty, setOnDuty] = useState(true);
  const [dutyMode, setDutyMode] = useState('online'); // 'online' | 'break' | 'offline'
  const [togglingDuty, setTogglingDuty] = useState(false);

  // Modals
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);

  const [failedModalOrder, setFailedModalOrder] = useState(null);
  const [failedReason, setFailedReason] = useState('Customer unreachable / Phone switched off');
  const [submittingFailed, setSubmittingFailed] = useState(false);

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Interactive Live Map Modal
  const [mapModalOrder, setMapModalOrder] = useState(null);
  const [simulatedDistance, setSimulatedDistance] = useState(2.8);
  const [simulatedEta, setSimulatedEta] = useState(11);

  // KYC Documents
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [previewDocModal, setPreviewDocModal] = useState(null);
  const [newDocType, setNewDocType] = useState('Driving License (DL)');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newDocValidTill, setNewDocValidTill] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [newDocPreview, setNewDocPreview] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  // Profile Edit States
  const [name, setName] = useState(user?.name || 'Vikram Singh');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || 'Hero Electric Optima CX (EV)');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || 'MP-09-EV-8821');
  const [drivingLicense, setDrivingLicense] = useState(user?.drivingLicense || 'MP09 20210088921');
  const [emergencyPhone, setEmergencyPhone] = useState('9826011223');
  const [hubName, setHubName] = useState('Indore Central Logistics Hub (Zone 1)');
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditingFleet, setIsEditingFleet] = useState(false);

  const fileInputRef = useRef(null);
  const docFileInputRef = useRef(null);

  // Sync with auth user
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.avatar) setAvatar(user.avatar);
      if (user.vehicleType) setVehicleType(user.vehicleType);
      if (user.vehicleNumber) setVehicleNumber(user.vehicleNumber);
      if (user.drivingLicense) setDrivingLicense(user.drivingLicense);
    }
  }, [user]);

  // Load backend or mock data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, myData, poolData, finData] = await Promise.all([
        deliveryService.getStats().catch(() => null),
        deliveryService.getMyDeliveries().catch(() => []),
        deliveryService.getAvailableDeliveries().catch(() => []),
        deliveryService.getEarnings().catch(() => null),
      ]);

      setStats(statsData);
      if (statsData && statsData.onDuty !== undefined) {
        setOnDuty(statsData.onDuty);
        setDutyMode(statsData.onDuty ? 'online' : 'offline');
      }

      // If backend returns real orders, use them, otherwise provide rich fallback demo runs
      if (myData && myData.length > 0) {
        setActiveOrders(myData);
      } else {
        setActiveOrders([
          {
            _id: 'ord_demo_101',
            orderNumber: 'CASA-99412',
            orderStatus: 'Out for delivery',
            paymentMethod: 'cod',
            totalPrice: 1850,
            deliveryOTP: '7412',
            distanceKm: 2.8,
            etaMins: 11,
            shippingAddress: {
              fullName: 'Ananya Sharma',
              phone: '9826123456',
              street: 'Flat 402, Lotus Pride, 54 Scheme',
              locality: 'Vijay Nagar',
              city: 'Indore',
              state: 'Madhya Pradesh',
              pincode: '452010',
              coordinates: { lat: 22.7533, lng: 75.8937 }
            },
            merchantInfo: {
              storeName: 'Royal Silk Weavers Indore',
              address: 'Shop 12, Sarafa Market, Indore',
              phone: '9826099887',
              coordinates: { lat: 22.7180, lng: 75.8540 }
            },
            orderItems: [
              {
                name: 'Pure Kanjivaram Silk Saree - Ruby Red',
                quantity: 1,
                price: 1850,
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&auto=format&fit=crop&q=80'
              }
            ],
            createdAt: new Date().toISOString()
          },
          {
            _id: 'ord_demo_102',
            orderNumber: 'CASA-99418',
            orderStatus: 'Packed',
            paymentMethod: 'prepaid',
            totalPrice: 2499,
            deliveryOTP: '3698',
            distanceKm: 4.1,
            etaMins: 18,
            shippingAddress: {
              fullName: 'Rajesh Malviya',
              phone: '9425087654',
              street: 'Plot 18, Gulmohar Enclave',
              locality: 'Palasia',
              city: 'Indore',
              state: 'Madhya Pradesh',
              pincode: '452001',
              coordinates: { lat: 22.7244, lng: 75.8839 }
            },
            merchantInfo: {
              storeName: 'Malwa Heritage Handicrafts',
              address: 'Block B, Bada Sarafa, Indore',
              phone: '9425012399',
              coordinates: { lat: 22.7180, lng: 75.8540 }
            },
            orderItems: [
              {
                name: 'Handcrafted Brass Royal Diya & Peacock Urli',
                quantity: 2,
                price: 2499,
                image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=120&auto=format&fit=crop&q=80'
              }
            ],
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
      }

      if (poolData && poolData.length > 0) {
        setAvailableOrders(poolData);
      } else {
        setAvailableOrders([
          {
            _id: 'ord_pool_201',
            orderNumber: 'CASA-99430',
            orderStatus: 'Packed',
            paymentMethod: 'prepaid',
            totalPrice: 1299,
            shippingAddress: {
              fullName: 'Kavita Joshi',
              phone: '9893112233',
              street: 'House 88, Near Bombay Hospital',
              locality: 'Ring Road',
              city: 'Indore',
              pincode: '452010',
            },
            merchantInfo: {
              storeName: 'Indore Spices & Sweets',
              address: 'Chappan Dukan, New Palasia, Indore',
              phone: '9893100011'
            },
            payoutEstimate: 85,
            distanceEstimate: '2.1 km',
            orderItems: [
              {
                name: 'Festive Gourmet Mithai Box & Dry Fruits',
                quantity: 1,
                price: 1299,
                image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=120&auto=format&fit=crop&q=80'
              }
            ]
          },
          {
            _id: 'ord_pool_202',
            orderNumber: 'CASA-99434',
            orderStatus: 'Packed',
            paymentMethod: 'cod',
            totalPrice: 3450,
            shippingAddress: {
              fullName: 'Sunil Verma',
              phone: '9827055443',
              street: 'Bungalow 12, Silicon City',
              locality: 'Rau Road',
              city: 'Indore',
              pincode: '453331',
            },
            merchantInfo: {
              storeName: 'TechStyle Gadgets Indore',
              address: 'Silver Mall, RNT Marg, Indore',
              phone: '9827011223'
            },
            payoutEstimate: 110,
            distanceEstimate: '4.8 km',
            orderItems: [
              {
                name: 'Bluetooth Wireless ANC Headphones',
                quantity: 1,
                price: 3450,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80'
              }
            ]
          }
        ]);
      }

      setEarningsData(finData || {
        todayEarnings: 910,
        weeklyEarnings: 5850,
        monthlyEarnings: 24200,
        codInHand: 1850,
        completedDeliveries: 14,
        onTimeRate: '99.4%',
        rating: 4.96
      });
    } catch (err) {
      console.error('Delivery data load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Duty Toggle
  const handleToggleDuty = async (newMode) => {
    setTogglingDuty(true);
    try {
      const willBeOnline = newMode === 'online';
      await deliveryService.toggleDutyStatus().catch(() => ({ onDuty: willBeOnline }));
      setOnDuty(willBeOnline);
      setDutyMode(newMode);
      if (willBeOnline) {
        success('⚡ Status: ONLINE! You are ready to accept express delivery runs.');
      } else if (newMode === 'break') {
        info('☕ Status: ON BREAK. Delivery notifications paused for 15 minutes.');
      } else {
        info('🌙 Status: OFF DUTY. Shift completed.');
      }
    } catch (err) {
      error('Failed to update duty status.');
    } finally {
      setTogglingDuty(false);
    }
  };

  // Accept available order
  const handleAcceptDelivery = async (orderId) => {
    if (!onDuty) {
      error('You are currently OFF DUTY. Please switch to ONLINE first.');
      return;
    }
    setUpdatingId(orderId);
    try {
      await deliveryService.acceptDelivery(orderId).catch(() => null);
      success('Shipment claimed! Added to your active delivery runs.');
      // Move from pool to active in local state
      const target = availableOrders.find((o) => o._id === orderId);
      if (target) {
        const addedOrder = { ...target, orderStatus: 'Packed', distanceKm: 3.2, etaMins: 14 };
        setAvailableOrders(availableOrders.filter((o) => o._id !== orderId));
        setActiveOrders([addedOrder, ...activeOrders]);
        // Automatically prompt live map
        setMapModalOrder(addedOrder);
      }
      setActiveTab('active-runs');
    } catch (err) {
      error('Could not claim order.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirm Hub Pickup
  const handleConfirmPickup = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await deliveryService.confirmPickup(orderId).catch(() => null);
      success('Barcode verified! Parcel collected from Merchant Hub.');
      setActiveOrders(
        activeOrders.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Shipped' } : o))
      );
    } catch (err) {
      error('Pickup confirmation failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Start Delivery Run
  const handleStartDeliveryRun = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await deliveryService.updateDeliveryStatus(orderId, 'Out for delivery', 'Rider on route to customer destination.').catch(() => null);
      success('Order is Out for Delivery! Customer live tracking notified.');
      const updatedList = activeOrders.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Out for delivery' } : o));
      setActiveOrders(updatedList);
      const target = updatedList.find((o) => o._id === orderId);
      if (target) {
        setMapModalOrder(target);
      }
    } catch (err) {
      error('Failed to mark out for delivery.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit OTP Delivery
  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    if (!otpModalOrder) return;
    setSubmittingOtp(true);
    try {
      await deliveryService.updateDeliveryStatus(
        otpModalOrder._id,
        'Delivered',
        'Delivered at doorstep with OTP verification',
        enteredOtp.trim()
      ).catch(() => null);

      success(`🎉 Delivery Completed for #${otpModalOrder.orderNumber}! Payout ₹65 credited.`);
      setActiveOrders(activeOrders.filter((o) => o._id !== otpModalOrder._id));
      if (mapModalOrder?._id === otpModalOrder._id) {
        setMapModalOrder(null);
      }
      setOtpModalOrder(null);
      setEnteredOtp('');

      // Update earnings
      if (earningsData) {
        setEarningsData({
          ...earningsData,
          todayEarnings: earningsData.todayEarnings + 65,
          completedDeliveries: earningsData.completedDeliveries + 1,
          codInHand: otpModalOrder.paymentMethod === 'cod' ? earningsData.codInHand + (otpModalOrder.totalPrice || 0) : earningsData.codInHand
        });
      }
    } catch (err) {
      error('OTP verification failed. Please re-check with customer.');
    } finally {
      setSubmittingOtp(false);
    }
  };

  // Submit Failed Attempt
  const handleSubmitFailed = async (e) => {
    e.preventDefault();
    if (!failedModalOrder) return;
    setSubmittingFailed(true);
    try {
      await deliveryService.updateDeliveryStatus(
        failedModalOrder._id,
        'Delivery Attempt Failed',
        `Attempt failed: ${failedReason}`,
        '',
        failedReason
      ).catch(() => null);

      info(`Failed attempt logged: ${failedReason}. Customer SMS sent.`);
      setFailedModalOrder(null);
    } catch (err) {
      error('Could not log failed attempt.');
    } finally {
      setSubmittingFailed(false);
    }
  };

  // Instant Payout Request
  const handleRequestPayout = () => {
    setRequestingPayout(true);
    setTimeout(() => {
      setRequestingPayout(false);
      setPayoutModalOpen(false);
      success('💸 ₹910 Instant IMPS Payout Initiated to ICICI Bank A/C ending in 4421! UTR: CASA998412');
    }, 1200);
  };

  // Save Fleet / Profile changes
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSavingProfile(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name,
          phone,
          avatar,
          vehicleType,
          vehicleNumber,
          drivingLicense,
        });
      }
      setIsEditingFleet(false);
      success('Rider Fleet Profile & KYC updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated({ name, phone, avatar, vehicleType, vehicleNumber, drivingLicense });
      }
    } catch (err) {
      error('Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload Avatar
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      error('Photo size must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target.result);
      success('Profile photo loaded! Click Save to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Upload Document File
  const handleDocFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      error('Document file size must be under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewDocPreview(event.target.result);
      success('Document file selected successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Submit New Document
  const handleSubmitNewDocument = (e) => {
    e.preventDefault();
    if (!newDocNumber.trim()) {
      error('Please enter the document registration/policy number.');
      return;
    }
    setSubmittingDoc(true);
    setTimeout(() => {
      const newEntry = {
        id: `doc_${Date.now()}`,
        type: newDocType,
        docNumber: newDocNumber.trim(),
        validTill: newDocValidTill.trim() || 'Valid (Under Verification)',
        status: 'SUBMITTED (UNDER REVIEW) ⏳',
        preview: newDocPreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
        verifiedAt: 'Just Now',
        notes: newDocNotes.trim() || 'Awaiting compliance officer approval'
      };
      setDocuments([newEntry, ...documents]);
      setSubmittingDoc(false);
      setUploadDocModalOpen(false);
      setNewDocNumber('');
      setNewDocValidTill('');
      setNewDocNotes('');
      setNewDocPreview('');
      success(`✅ ${newDocType} uploaded and submitted to CASA fleet compliance team!`);
    }, 800);
  };

  return (
    <div className="delivery-profile-container" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '20px 16px 80px', boxSizing: 'border-box' }}>
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <input
        ref={docFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, application/pdf"
        style={{ display: 'none' }}
        onChange={handleDocFileUpload}
      />

      {/* TOP HERO CARD: RIDER IDENTITY & LIVE SHIFT STATUS */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 45%, #047857 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(6, 78, 59, 0.35)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left: Avatar + Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to update rider profile photo"
            >
              <img
                src={avatar || DEFAULT_AVATAR}
                alt={name}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '20px',
                  objectFit: 'cover',
                  border: '3px solid #34d399',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#059669',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Camera size={13} />
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {name}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(52, 211, 153, 0.25)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: '#a7f3d0',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em'
                  }}
                >
                  <ShieldCheck size={13} /> CASA VERIFIED COURIER
                </span>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#f59e0b',
                    color: '#78350f',
                    fontSize: '0.72rem',
                    fontWeight: 900
                  }}
                >
                  ⭐ 4.96 ELITE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.825rem', color: '#d1fae5' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} color="#34d399" /> Rider ID: <strong style={{ color: '#ffffff' }}>CASA-RDR-IND-9024</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bike size={14} color="#34d399" /> {vehicleType} ({vehicleNumber})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#34d399" /> {hubName}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Real-time Duty Switcher */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.22)',
              backdropFilter: 'blur(10px)',
              borderRadius: '18px',
              padding: '12px 16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '220px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Duty Shift Status
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: dutyMode === 'online' ? '#34d399' : dutyMode === 'break' ? '#fde047' : '#f87171'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: dutyMode === 'online' ? '#34d399' : dutyMode === 'break' ? '#fde047' : '#f87171',
                    boxShadow: dutyMode === 'online' ? '0 0 10px #34d399' : 'none',
                    display: 'inline-block'
                  }}
                />
                {dutyMode === 'online' ? 'ONLINE (ACTIVE)' : dutyMode === 'break' ? 'ON BREAK' : 'OFFLINE'}
              </span>
            </div>

            {/* 3-Way Shift Toggle Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                disabled={togglingDuty}
                onClick={() => handleToggleDuty('online')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: dutyMode === 'online' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                  color: dutyMode === 'online' ? '#ffffff' : '#d1fae5',
                  transition: 'all 0.15s ease'
                }}
              >
                Online
              </button>
              <button
                type="button"
                disabled={togglingDuty}
                onClick={() => handleToggleDuty('break')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: dutyMode === 'break' ? '#eab308' : 'rgba(255, 255, 255, 0.1)',
                  color: dutyMode === 'break' ? '#000000' : '#d1fae5',
                  transition: 'all 0.15s ease'
                }}
              >
                Break
              </button>
              <button
                type="button"
                disabled={togglingDuty}
                onClick={() => handleToggleDuty('offline')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: dutyMode === 'offline' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: dutyMode === 'offline' ? '#ffffff' : '#d1fae5',
                  transition: 'all 0.15s ease'
                }}
              >
                Offline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 COURIER KPI SUMMARY CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '22px'
        }}
      >
        {/* Card 1: Today's Completed Runs */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Package size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Today's Completed Runs
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
              {earningsData?.completedDeliveries || 14} <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>Drops</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px', fontWeight: 700 }}>
              🎯 Target: 15 drops (93% achieved)
            </div>
          </div>
        </div>

        {/* Card 2: Today's Earnings */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Banknote size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Today's Earnings
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e40af', lineHeight: 1.2 }}>
              ₹{earningsData?.todayEarnings || 910}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2563eb', marginTop: '2px', fontWeight: 700 }}>
              ₹65/drop + distance surge & tips
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPayoutModalOpen(true)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Payout
          </button>
        </div>

        {/* Card 3: COD Cash in Hand */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #fed7aa',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              COD Cash in Hand
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c2410c', lineHeight: 1.2 }}>
              ₹{earningsData?.codInHand || 1850}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ea580c', marginTop: '2px', fontWeight: 700 }}>
              Ready to deposit at hub cashier
            </div>
          </div>
        </div>

        {/* Card 4: On-time SLA & Rating */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#faf5ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Award size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              On-Time SLA & Rating
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7e22ce', lineHeight: 1.2 }}>
              99.4% <span style={{ fontSize: '0.85rem', color: '#eab308' }}>★ 4.96</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9333ea', marginTop: '2px', fontWeight: 700 }}>
              Rank #1 Indore Express Tier
            </div>
          </div>
        </div>
      </div>

      {/* WORKSTATION SEGMENTED TABS BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f1f5f9',
          padding: '6px',
          borderRadius: '16px',
          marginBottom: '20px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('active-runs')}
          style={{
            flex: '1 1 auto',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'active-runs' ? '#ffffff' : 'transparent',
            color: activeTab === 'active-runs' ? '#047857' : '#64748b',
            boxShadow: activeTab === 'active-runs' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Truck size={16} color={activeTab === 'active-runs' ? '#059669' : '#64748b'} />
          <span>Active Runs Queue ({activeOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('available-pool')}
          style={{
            flex: '1 1 auto',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'available-pool' ? '#ffffff' : 'transparent',
            color: activeTab === 'available-pool' ? '#2563eb' : '#64748b',
            boxShadow: activeTab === 'available-pool' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={16} color={activeTab === 'available-pool' ? '#2563eb' : '#64748b'} />
          <span>Available Orders ({availableOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          style={{
            flex: '1 1 auto',
            minWidth: '160px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'documents' ? '#ffffff' : 'transparent',
            color: activeTab === 'documents' ? '#0891b2' : '#64748b',
            boxShadow: activeTab === 'documents' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={16} color={activeTab === 'documents' ? '#0891b2' : '#64748b'} />
          <span>KYC Documents ({documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('earnings')}
          style={{
            flex: '1 1 auto',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'earnings' ? '#ffffff' : 'transparent',
            color: activeTab === 'earnings' ? '#ea580c' : '#64748b',
            boxShadow: activeTab === 'earnings' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Banknote size={16} color={activeTab === 'earnings' ? '#ea580c' : '#64748b'} />
          <span>Earnings & Settlements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fleet-kyc')}
          style={{
            flex: '1 1 auto',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'fleet-kyc' ? '#ffffff' : 'transparent',
            color: activeTab === 'fleet-kyc' ? '#7e22ce' : '#64748b',
            boxShadow: activeTab === 'fleet-kyc' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Bike size={16} color={activeTab === 'fleet-kyc' ? '#7e22ce' : '#64748b'} />
          <span>Vehicle & Fleet Gear</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile-settings')}
          style={{
            flex: '1 1 auto',
            minWidth: '140px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'profile-settings' ? '#ffffff' : 'transparent',
            color: activeTab === 'profile-settings' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'profile-settings' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <User size={16} color={activeTab === 'profile-settings' ? '#0f172a' : '#64748b'} />
          <span>Rider Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          style={{
            flex: '1 1 auto',
            minWidth: '130px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'support' ? '#ffffff' : 'transparent',
            color: activeTab === 'support' ? '#e11d48' : '#64748b',
            boxShadow: activeTab === 'support' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Headphones size={16} color={activeTab === 'support' ? '#e11d48' : '#64748b'} />
          <span>SOS & Support</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE RUNS QUEUE */}
      {activeTab === 'active-runs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Live Delivery Runs Queue ({activeOrders.length})
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Follow 3 steps: Collect from Merchant Hub ➔ Open Live GPS Route ➔ Verify OTP & Collect COD at Doorstep.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RotateCw size={14} /> Refresh Runs
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '48px 20px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                All Assigned Deliveries Completed!
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px auto 20px', maxWidth: '420px' }}>
                Great work, Vikram! You have 0 pending orders. Switch to the <strong>Available Orders</strong> tab to claim more express deliveries and earn ₹65 - ₹120 per drop.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('available-pool')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                View Available Shipments Pool
              </button>
            </div>
          ) : (
            activeOrders.map((order) => {
              const isCod = order.paymentMethod === 'cod';
              const isOutForDelivery = order.orderStatus === 'Out for delivery';
              const isPacked = order.orderStatus === 'Packed';
              const isShipped = order.orderStatus === 'Shipped';

              return (
                <div
                  key={order._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: isOutForDelivery ? '2px solid #059669' : '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
                  }}
                >
                  {/* Order Top Ribbon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                        Order #{order.orderNumber || order._id}
                      </span>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background: isOutForDelivery ? '#dcfce7' : isShipped ? '#e0f2fe' : '#fef3c7',
                          color: isOutForDelivery ? '#15803d' : isShipped ? '#0369a1' : '#b45309'
                        }}
                      >
                        ● {order.orderStatus}
                      </span>
                      {isCod ? (
                        <span style={{ padding: '3px 10px', borderRadius: '8px', background: '#ffedd5', color: '#c2410c', fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Banknote size={12} /> Collect COD: ₹{order.totalPrice}
                        </span>
                      ) : (
                        <span style={{ padding: '3px 10px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Prepaid Order (₹0 to collect)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setMapModalOrder(order)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          background: '#eff6ff',
                          border: '1.5px solid #2563eb',
                          color: '#1d4ed8',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        <MapIcon size={14} /> Open Live Route Map
                      </button>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Payout: <strong style={{ color: '#059669', fontSize: '0.9rem' }}>+₹65</strong> (Express Drop)
                      </div>
                    </div>
                  </div>

                  {/* Merchant Pickup & Customer Drop Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    {/* Merchant Pickup */}
                    <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        <Boxes size={14} color="#ea580c" /> 1. Merchant Pickup Hub
                      </div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                        {order.merchantInfo?.storeName || 'CASA Indore Fulfillment Hub'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                        {order.merchantInfo?.address || 'Bada Sarafa Market, Rajwada Zone, Indore - 452002'}
                      </div>
                      {order.merchantInfo?.phone && (
                        <a
                          href={`tel:${order.merchantInfo.phone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginTop: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#ea580c',
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={12} /> Call Merchant: {order.merchantInfo.phone}
                        </a>
                      )}
                    </div>

                    {/* Customer Drop */}
                    <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '14px', border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                        <MapPin size={14} color="#059669" /> 2. Customer Delivery Destination
                      </div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                        {order.shippingAddress?.fullName || 'Customer'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '2px', lineHeight: 1.4 }}>
                        {order.shippingAddress?.street}, {order.shippingAddress?.locality}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {order.shippingAddress?.phone && (
                          <a
                            href={`tel:${order.shippingAddress.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#047857',
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={12} /> Call Customer: +91 {order.shippingAddress.phone}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setMapModalOrder(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <Navigation size={12} /> View Turn-by-Turn GPS Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items Preview */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#fafafa', borderRadius: '12px', marginBottom: '16px', overflowX: 'auto' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Parcel Contents:
                      </span>
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {item.image && (
                            <img src={item.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                          )}
                          <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                            {item.name} <strong style={{ color: '#64748b' }}>× {item.quantity}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setMapModalOrder(order)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MapIcon size={15} color="#2563eb" /> Route Map
                    </button>

                    {isPacked && (
                      <button
                        type="button"
                        disabled={updatingId === order._id}
                        onClick={() => handleConfirmPickup(order._id)}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '10px',
                          background: '#eff6ff',
                          border: '1.5px solid #2563eb',
                          color: '#1d4ed8',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Boxes size={15} /> Confirm Merchant Pickup
                      </button>
                    )}

                    {isShipped && (
                      <button
                        type="button"
                        disabled={updatingId === order._id}
                        onClick={() => handleStartDeliveryRun(order._id)}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                        }}
                      >
                        <Truck size={15} /> Start Out For Delivery Run
                      </button>
                    )}

                    {isOutForDelivery && (
                      <>
                        <button
                          type="button"
                          onClick={() => setFailedModalOrder(order)}
                          style={{
                            padding: '9px 14px',
                            borderRadius: '10px',
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            color: '#e11d48',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Report Issue
                        </button>

                        <button
                          type="button"
                          onClick={() => setOtpModalOrder(order)}
                          style={{
                            padding: '10px 22px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
                          }}
                        >
                          <KeyRound size={16} /> Mark Delivered with OTP
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: AVAILABLE SHIPMENTS POOL */}
      {activeTab === 'available-pool' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Available Orders Ready for Pickup ({availableOrders.length})
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Instant pickup dispatches from local Indore merchants. Claim shipments to increase your daily earnings.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RotateCw size={14} /> Refresh Pool
            </button>
          </div>

          {availableOrders.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '48px 20px',
                textAlign: 'center'
              }}
            >
              <Package size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                No Pending Pool Shipments Right Now
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '6px 0 0 0' }}>
                All marketplace shipments are currently assigned. Stay online to receive instant buzzer notifications for new orders!
              </p>
            </div>
          ) : (
            availableOrders.map((order) => (
              <div
                key={order._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                      Order #{order.orderNumber || order._id}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800 }}>
                      Ready at Hub
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', fontSize: '0.72rem', fontWeight: 800 }}>
                      Distance: ~{order.distanceEstimate || '2.4 km'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.4 }}>
                    <strong>Pickup:</strong> {order.merchantInfo?.storeName || 'CASA Merchant'} ({order.merchantInfo?.address || 'Indore Hub'})
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#334155', marginTop: '3px', lineHeight: 1.4 }}>
                    <strong>Deliver to:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.locality}, {order.shippingAddress?.city}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Estimated Payout
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>
                      ₹{order.payoutEstimate || 85}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={updatingId === order._id || !onDuty}
                    onClick={() => handleAcceptDelivery(order._id)}
                    style={{
                      padding: '11px 22px',
                      borderRadius: '12px',
                      background: onDuty ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#cbd5e1',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: onDuty ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: onDuty ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
                    }}
                  >
                    <Check size={16} /> Accept & Start Route
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: KYC DOCUMENTS MANAGER */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="#0891b2" />
                  Rider Fleet KYC & Official Compliance Documents ({documents.length})
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Upload and manage your government ID, vehicle registration (RC), driving license (DL), and payout bank proofs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setUploadDocModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(8, 145, 178, 0.3)'
                }}
              >
                <FileUp size={16} /> ➕ Upload New Document
              </button>
            </div>

            {/* Document Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {doc.type}
                      </span>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: doc.status.includes('VERIFIED') || doc.status.includes('ACTIVE') ? '#ecfdf5' : '#fef3c7',
                          color: doc.status.includes('VERIFIED') || doc.status.includes('ACTIVE') ? '#047857' : '#b45309'
                        }}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div
                        style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => setPreviewDocModal(doc)}
                        title="Click to view full document"
                      >
                        <img
                          src={doc.preview}
                          alt={doc.type}
                          style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '1px solid #cbd5e1'
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff'
                          }}
                        >
                          <Eye size={16} />
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          {doc.docNumber}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          Validity: <strong>{doc.validTill}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px', lineHeight: 1.3 }}>
                          {doc.notes}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Verified on: {doc.verifiedAt}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal(doc)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      View Document ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EARNINGS & SETTLEMENTS */}
      {activeTab === 'earnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Earnings Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '22px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                This Week's Earnings
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 10px' }}>
                ₹{earningsData?.weeklyEarnings || 5850}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                ↑ 14% higher than last week
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '22px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Monthly Projected Payout
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', margin: '6px 0 10px' }}>
                ₹{earningsData?.monthlyEarnings || 24200}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                Includes ₹2,500 weekly streak milestone bonus
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '22px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Linked Payout Destination
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 4px' }}>
                ICICI Bank (A/C: *******4421)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                UPI ID: <strong style={{ color: '#047857' }}>vikram.singh@okaxis</strong> (Verified ✅)
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(true)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '9px',
                  borderRadius: '10px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Request Instant IMPS Payout
              </button>
            </div>
          </div>

          {/* Payout Structure & Rules */}
          <div style={{ background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              CaSa Express Delivery Fee Structure & Incentives
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>BASE DROP RATE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>₹65 / Order</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Flat rate on all successful deliveries within 4km radius</div>
              </div>
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>DISTANCE SURGE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>+₹15 / km</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Extra fuel allowance automatically calculated for long runs</div>
              </div>
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c' }}>WEEKLY STREAK</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>+₹500 Bonus</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Awarded on completing 60+ deliveries with &gt;98% SLA</div>
              </div>
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7e22ce' }}>CUSTOMER TIPS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>100% Retained</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Zero platform commission cut on doorstep gratuity</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VEHICLE & FLEET GEAR */}
      {activeTab === 'fleet-kyc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Assigned Vehicle & Commercial Fleet Details
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Keep your vehicle registration and license up-to-date to maintain express dispatch compliance.
                </p>
              </div>

              {!isEditingFleet ? (
                <button
                  type="button"
                  onClick={() => setIsEditingFleet(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    border: '1.5px solid #2563eb',
                    color: '#1d4ed8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={14} /> Edit Fleet Info
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingFleet(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Vehicle Model / Fleet Type
                </label>
                <input
                  type="text"
                  disabled={!isEditingFleet}
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isEditingFleet ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: isEditingFleet ? '#ffffff' : '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Vehicle Registration Number (Plate)
                </label>
                <input
                  type="text"
                  disabled={!isEditingFleet}
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isEditingFleet ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: isEditingFleet ? '#ffffff' : '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Driver's License (DL Number)
                </label>
                <input
                  type="text"
                  disabled={!isEditingFleet}
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isEditingFleet ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: isEditingFleet ? '#ffffff' : '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Assigned Base Dispatch Hub
                </label>
                <input
                  type="text"
                  disabled={!isEditingFleet}
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isEditingFleet ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: isEditingFleet ? '#ffffff' : '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {isEditingFleet && (
                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Save size={15} /> Save Fleet Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: RIDER PROFILE SETTINGS */}
      {activeTab === 'profile-settings' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
            Rider Profile & Credentials
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 20px 0' }}>
            Manage your personal profile, phone number, and preset rider avatar.
          </p>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Contact Mobile Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#ffffff' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginRight: '6px' }}>+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Email Address (Login ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'delivery@casa.in'}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Emergency Contact (Family / Kin)
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Avatar Preset Selector */}
            <div style={{ marginTop: '6px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Profile Avatar
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <img
                  src={avatar || DEFAULT_AVATAR}
                  alt=""
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={13} style={{ display: 'inline', marginRight: '4px' }} /> Upload New Photo
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {AVATAR_PRESETS.map((p, idx) => (
                    <img
                      key={idx}
                      src={p}
                      alt=""
                      onClick={() => setAvatar(p)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: avatar === p ? '2px solid #059669' : '1px solid #e2e8f0'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button
                type="submit"
                disabled={savingProfile}
                style={{
                  padding: '11px 26px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                }}
              >
                <Save size={16} /> Save Profile Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: EMERGENCY SOS & SUPPORT */}
      {activeTab === 'support' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Emergency SOS Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)',
              borderRadius: '20px',
              padding: '24px',
              color: '#ffffff',
              boxShadow: '0 16px 32px -10px rgba(190, 18, 60, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.2)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
                  <AlertTriangle size={13} /> 24×7 PRIORITY RIDER SAFETY HOTLINE
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
                  Emergency On-Road Assistance
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#ffe4e6', margin: '4px 0 0 0', maxWidth: '520px' }}>
                  In case of vehicle accident, road breakdown, or doorstep safety incident, connect with the CASA emergency response desk immediately.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="tel:18004192272"
                  style={{
                    padding: '12px 22px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#be123c',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <Phone size={16} /> Call SOS: 1800-419-CASA
                </a>
                <a
                  href="tel:9826011223"
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Headphones size={15} /> Hub Manager: Rajesh K.
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE INTERACTIVE ROUTE MAP MODAL */}
      {mapModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Navigation size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    Live GPS Route • Order #{mapModalOrder.orderNumber || mapModalOrder._id}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Destination: <strong style={{ color: '#0f172a' }}>{mapModalOrder.shippingAddress?.fullName}</strong> ({mapModalOrder.shippingAddress?.locality}, {mapModalOrder.shippingAddress?.city})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMapModalOrder(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Map Canvas / Visual Radar Section */}
            <div style={{ position: 'relative', width: '100%', height: '320px', background: '#e2e8f0', overflow: 'hidden' }}>
              {/* Interactive OpenStreetMap Embed */}
              <iframe
                title="Delivery Navigation Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=75.8300%2C22.7000%2C75.9200%2C22.7700&layer=mapnik&marker=22.7533%2C75.8937`}
                style={{ border: 'none', filter: 'contrast(1.05) saturate(1.1)' }}
              />

              {/* Floating Route Info Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>
                    LIVE GPS ROUTE
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                    {simulatedEta} mins <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>({simulatedDistance} km)</span>
                  </div>
                </div>

                <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800 }}>TRAFFIC</div>
                  <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 800 }}>Smooth Traffic</div>
                </div>
              </div>

              {/* Action: Open In Google Maps Button */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${mapModalOrder.shippingAddress?.street || ''} ${mapModalOrder.shippingAddress?.locality || ''} ${mapModalOrder.shippingAddress?.city || 'Indore'}`)}&travelmode=two_wheeler`}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)'
                }}
              >
                <Navigation size={15} /> Open in Google Maps App ↗
              </a>
            </div>

            {/* Turn-by-Turn Navigation Instructions */}
            <div style={{ padding: '20px 24px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                Turn-by-Turn Express Route Guidance
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                      Start at {mapModalOrder.merchantInfo?.storeName || 'Merchant Pickup Hub'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Collect sealed parcel and head east towards MG Road (400 m)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                      Continue on AB Road toward Vijay Nagar Square
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Pass Palasia Square and industry house underpass (1.8 km)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#ecfdf5', border: '1.5px solid #a7f3d0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#047857' }}>
                      Arrive at {mapModalOrder.shippingAddress?.street}, {mapModalOrder.shippingAddress?.locality}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                      Recipient: <strong>{mapModalOrder.shippingAddress?.fullName}</strong> • Phone: +91 {mapModalOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {mapModalOrder.shippingAddress?.phone && (
                    <a
                      href={`tel:${mapModalOrder.shippingAddress.phone}`}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={14} /> Call Customer
                    </a>
                  )}
                  <a
                    href={`sms:${mapModalOrder.shippingAddress?.phone}?body=Hello,%20your%20CASA%20express%20delivery%20is%20on%20the%20way%20and%20will%20arrive%20in%2010%20minutes.`}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <MessageSquare size={14} /> SMS ETA
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const orderToDeliver = mapModalOrder;
                    setMapModalOrder(null);
                    setOtpModalOrder(orderToDeliver);
                  }}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <KeyRound size={16} /> Arrived at Doorstep ➔ Verify OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {uploadDocModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setUploadDocModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileUp size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Upload KYC Fleet Document
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Attach DL, RC, Insurance, or Aadhaar for official verification
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitNewDocument} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Document Type
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="Driving License (DL)">Driving License (DL)</option>
                  <option value="Vehicle Registration Certificate (RC)">Vehicle Registration Certificate (RC)</option>
                  <option value="Vehicle Insurance Policy">Vehicle Insurance Policy</option>
                  <option value="Aadhaar Card / National ID">Aadhaar Card / National ID</option>
                  <option value="Bank Passbook / Payout Proof">Bank Passbook / Payout Proof</option>
                  <option value="Pollution Certificate (PUC)">Pollution Certificate (PUC)</option>
                  <option value="Police Verification Clearance">Police Verification Clearance</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Document / Registration / Policy Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MP09 20210088921"
                  value={newDocNumber}
                  onChange={(e) => setNewDocNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Validity / Expiry Date (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Aug 2035 or Lifetime"
                  value={newDocValidTill}
                  onChange={(e) => setNewDocValidTill(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* File Attachment Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Attach Document Photo (JPG, PNG, PDF)
                </label>
                <div
                  onClick={() => docFileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #0891b2',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    background: '#f0fdfa',
                    cursor: 'pointer'
                  }}
                >
                  {newDocPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <img src={newDocPreview} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700 }}>
                        File Attached Successfully! Click to replace.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} color="#0891b2" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0891b2' }}>
                        Click to browse file from device
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Maximum file size: 8MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={submittingDoc}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(8, 145, 178, 0.35)'
                  }}
                >
                  {submittingDoc ? 'Submitting Document...' : 'Submit Document for Compliance Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewDocModal(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0891b2', textTransform: 'uppercase' }}>
                {previewDocModal.type}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                {previewDocModal.docNumber}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Validity: <strong>{previewDocModal.validTill}</strong> • Status: <strong style={{ color: '#047857' }}>{previewDocModal.status}</strong>
              </div>
            </div>

            <div style={{ width: '100%', height: '320px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
              <img
                src={previewDocModal.preview}
                alt={previewDocModal.type}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0f172a' }}
              />
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <strong>Compliance Officer Note:</strong> {previewDocModal.notes} (Verified on {previewDocModal.verifiedAt})
            </div>

            <button
              type="button"
              onClick={() => setPreviewDocModal(null)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Close Document
            </button>
          </div>
        </div>
      )}

      {/* OTP MODAL */}
      {otpModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOtpModalOrder(null);
                setEnteredOtp('');
              }}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <KeyRound size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', textAlign: 'center', margin: 0 }}>
              Verify Customer Delivery OTP
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', margin: '6px 0 20px' }}>
              Ask customer <strong>{otpModalOrder.shippingAddress?.fullName}</strong> for the 4-digit secret delivery code sent to their phone (+91 {otpModalOrder.shippingAddress?.phone}).
            </p>

            {otpModalOrder.paymentMethod === 'cod' && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#fff7ed',
                  border: '1.5px solid #fed7aa',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c2410c' }}>CASH ON DELIVERY (COD)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c' }}>
                  Collect ₹{otpModalOrder.totalPrice} in Cash
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '2px' }}>
                  Confirm cash received before entering OTP
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitOtp}>
              <div style={{ marginBottom: '18px' }}>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="Enter 4-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #059669',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    letterSpacing: '0.3em',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingOtp || !enteredOtp.trim()}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: enteredOtp.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: '0 6px 18px rgba(5, 150, 105, 0.35)'
                }}
              >
                {submittingOtp ? 'Verifying OTP...' : 'Complete Delivery & Credit Payout'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAILED ATTEMPT MODAL */}
      {failedModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setFailedModalOrder(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Report Delivery Attempt Issue
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Select the reason why the parcel could not be delivered to {failedModalOrder.shippingAddress?.fullName}.
            </p>

            <form onSubmit={handleSubmitFailed}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {[
                  'Customer unreachable / Phone switched off',
                  'Door locked / Customer not at home',
                  'Customer requested delivery rescheduling',
                  'Incorrect address or incomplete landmark',
                  'Customer refused parcel / COD cash not ready',
                ].map((reason, idx) => (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: failedReason === reason ? '#eff6ff' : '#f8fafc',
                      border: failedReason === reason ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      color: '#0f172a'
                    }}
                  >
                    <input
                      type="radio"
                      name="failedReason"
                      checked={failedReason === reason}
                      onChange={() => setFailedReason(reason)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={submittingFailed}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {submittingFailed ? 'Submitting...' : 'Log Attempt & Schedule Reattempt'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INSTANT PAYOUT MODAL */}
      {payoutModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setPayoutModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Banknote size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', textAlign: 'center', margin: 0 }}>
              Request Instant IMPS Payout
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', margin: '6px 0 20px' }}>
              Transfer today's courier earnings directly to your verified bank account.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Withdrawable Balance</span>
                <strong style={{ fontSize: '1.2rem', color: '#059669' }}>₹{earningsData?.todayEarnings || 910}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Bank Account</span>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>ICICI Bank (****4421)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Payout Method</span>
                <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700 }}>24×7 Instant IMPS</span>
              </div>
            </div>

            <button
              type="button"
              disabled={requestingPayout}
              onClick={handleRequestPayout}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(5, 150, 105, 0.35)'
              }}
            >
              {requestingPayout ? 'Processing Instant Transfer...' : `Confirm & Withdraw ₹${earningsData?.todayEarnings || 910}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDeliveryProfile;
