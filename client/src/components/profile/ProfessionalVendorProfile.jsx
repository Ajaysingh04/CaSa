import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
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
  Truck,
  BarChart3,
  Activity,
  Zap,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  ChevronLeft,
  Grid,
  List,
  ArrowUpDown,
  Filter,
  Trash2,
  AlertTriangle,
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
  const location = useLocation();
  const { tab: routeTab } = useParams();
  const { success, error } = useToast();

  // Helper to normalize and map route/search tabs cleanly
  const getNormalizedTab = (raw) => {
    if (!raw) return 'dashboard';
    const clean = raw.toLowerCase().trim();
    const map = {
      dashboard: 'dashboard',
      orders: 'orders',
      shipping: 'orders',
      shipments: 'orders',
      products: 'products',
      stock: 'products',
      catalog: 'products',
      transactions: 'transactions',
      payouts: 'transactions',
      finances: 'transactions',
      settings: 'settings',
      kyc: 'kyc',
      store: 'kyc',
    };
    return map[clean] || 'dashboard';
  };

  // Active Sidebar Tab: 'dashboard' | 'products' | 'orders' | 'transactions' | 'settings' | 'kyc'
  const [activeTab, setActiveTab] = useState(() => {
    const qTab = new URLSearchParams(window.location.search).get('tab');
    return getNormalizedTab(routeTab || qTab);
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync tab with URL updates or browser history navigation
  useEffect(() => {
    const qTab = new URLSearchParams(location.search).get('tab');
    const matched = getNormalizedTab(routeTab || qTab);
    if (matched && matched !== activeTab) {
      setActiveTab(matched);
    }
  }, [routeTab, location.pathname, location.search]);

  // Synchronize document.title so browser tabs and links shared to Sir/team clearly state the Vendor Hub & Tab
  useEffect(() => {
    const tabTitles = {
      dashboard: 'CaSa Vendor Hub • Merchant Dashboard & Metrics',
      orders: 'CaSa Vendor Hub • Customer Shipments & Orders',
      products: 'CaSa Vendor Hub • Products & Stock Catalog',
      transactions: 'CaSa Vendor Hub • Payouts & Finances Ledger',
      settings: 'CaSa Vendor Hub • Store & Operations Settings',
      kyc: 'CaSa Vendor Hub • Verified Merchant KYC & Hub Info',
    };
    document.title = tabTitles[activeTab] || 'CaSa Vendor Merchant Center';
  }, [activeTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setIsMobileSidebarOpen(false);
    navigate(`/vendor/${newTab}`, { replace: true });
  };

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

  // Product & Inventory Tab States (Pagination, Filters, View Mode)
  const [productPage, setProductPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [productStatusFilter, setProductStatusFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productSortBy, setProductSortBy] = useState('NEWEST');
  const [productViewMode, setProductViewMode] = useState('grid'); // 'grid' | 'table'

  // Reset to page 1 when filtering or search changes
  useEffect(() => {
    setProductPage(1);
  }, [productSearch, productStatusFilter, productCategoryFilter, productSortBy, productsPerPage]);

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

  const defaultCatalog = [
    {
      _id: 'prod-demo-1',
      name: 'Chanderi Pure Silk Handloom Saree with Zari Pallu',
      category: 'Sarees & Handlooms',
      price: 6499,
      discountPrice: 4899,
      stock: 45,
      sku: 'CS-CHN-001',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-18T10:00:00Z',
    },
    {
      _id: 'prod-demo-2',
      name: 'Maheshwari Handcrafted Zari Border Cotton Dupatta',
      category: 'Dupattas & Shawls',
      price: 2499,
      discountPrice: 1899,
      stock: 32,
      sku: 'CS-MSH-002',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-19T11:00:00Z',
    },
    {
      _id: 'prod-demo-3',
      name: 'Traditional Royal Banarasi Katan Silk Saree',
      category: 'Sarees & Handlooms',
      price: 12999,
      discountPrice: 9999,
      stock: 8,
      sku: 'CS-BNR-003',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-19T14:00:00Z',
    },
    {
      _id: 'prod-demo-4',
      name: 'Handcrafted Indigo Block Print Pure Cotton Kurta',
      category: 'Mens Ethnic',
      price: 2999,
      discountPrice: 2199,
      stock: 64,
      sku: 'CS-KRT-004',
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-20T09:00:00Z',
    },
    {
      _id: 'prod-demo-5',
      name: 'Pure Tussar Silk Hand-Embroidered Stole',
      category: 'Dupattas & Shawls',
      price: 3499,
      discountPrice: 2699,
      stock: 4,
      sku: 'CS-TSR-005',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-20T12:00:00Z',
    },
    {
      _id: 'prod-demo-6',
      name: 'Kashmiri Hand-Woven Pashmina Woolen Shawl',
      category: 'Dupattas & Shawls',
      price: 15499,
      discountPrice: 11999,
      stock: 12,
      sku: 'CS-KSH-006',
      image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-21T08:00:00Z',
    },
    {
      _id: 'prod-demo-7',
      name: 'Handcrafted Mojari Leather Jutti with Brass Inlay',
      category: 'Footwear',
      price: 3299,
      discountPrice: 2499,
      stock: 0,
      sku: 'CS-MJR-007',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-21T10:00:00Z',
    },
    {
      _id: 'prod-demo-8',
      name: 'Bandhani Georgette Saree with Gota Patti Work',
      category: 'Sarees & Handlooms',
      price: 5999,
      discountPrice: 4299,
      stock: 22,
      sku: 'CS-BND-008',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-21T14:00:00Z',
    },
    {
      _id: 'prod-demo-9',
      name: 'Artisan Embroidered Silk Nehru Jacket / Waistcoat',
      category: 'Mens Ethnic',
      price: 4999,
      discountPrice: 3599,
      stock: 18,
      sku: 'CS-WST-009',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-21T16:00:00Z',
    },
    {
      _id: 'prod-demo-10',
      name: 'Kanjeevaram Gold Temple Border Silk Saree',
      category: 'Sarees & Handlooms',
      price: 18999,
      discountPrice: 14499,
      stock: 3,
      sku: 'CS-KNJ-010',
      image: 'https://images.unsplash.com/photo-1610030469668-935cb101f301?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-22T08:00:00Z',
    },
    {
      _id: 'prod-demo-11',
      name: 'Organic Khadi Cotton Short Kurta - Off White',
      category: 'Mens Ethnic',
      price: 1899,
      discountPrice: 1499,
      stock: 50,
      sku: 'CS-KHD-011',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-22T09:00:00Z',
    },
    {
      _id: 'prod-demo-12',
      name: 'Phulkari Hand-Embroidered Georgette Dupatta',
      category: 'Dupattas & Shawls',
      price: 3199,
      discountPrice: 2399,
      stock: 28,
      sku: 'CS-PHL-012',
      image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-22T10:00:00Z',
    },
    {
      _id: 'prod-demo-13',
      name: 'Handcrafted Kolhapuri Leather Chappal - Tan Brown',
      category: 'Footwear',
      price: 2499,
      discountPrice: 1799,
      stock: 0,
      sku: 'CS-KLP-013',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-22T11:00:00Z',
    },
    {
      _id: 'prod-demo-14',
      name: 'Kota Doria Pure Zari Handloom Saree',
      category: 'Sarees & Handlooms',
      price: 4599,
      discountPrice: 3499,
      stock: 19,
      sku: 'CS-KTA-014',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-10-22T12:00:00Z',
    },
  ];

  const allCatalogProducts = products.length > 0 ? products : defaultCatalog;

  // Extract unique categories
  const availableProductCategories = ['ALL', ...Array.from(new Set(allCatalogProducts.map((p) => p.category).filter(Boolean)))];

  // Filtering
  const filteredProducts = allCatalogProducts.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    const matchesSearch = q
      ? (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      : true;

    const stock = Number(p.stock || 0);
    let matchesStatus = true;
    if (productStatusFilter === 'IN_STOCK') matchesStatus = stock >= 10;
    else if (productStatusFilter === 'LOW_STOCK') matchesStatus = stock > 0 && stock < 10;
    else if (productStatusFilter === 'OUT_OF_STOCK') matchesStatus = stock === 0;

    let matchesCategory = true;
    if (productCategoryFilter !== 'ALL') {
      matchesCategory = p.category === productCategoryFilter;
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (productSortBy === 'PRICE_LOW_HIGH') {
      return (a.discountPrice || a.price) - (b.discountPrice || b.price);
    }
    if (productSortBy === 'PRICE_HIGH_LOW') {
      return (b.discountPrice || b.price) - (a.discountPrice || a.price);
    }
    if (productSortBy === 'STOCK_LOW_HIGH') {
      return (a.stock || 0) - (b.stock || 0);
    }
    if (productSortBy === 'STOCK_HIGH_LOW') {
      return (b.stock || 0) - (a.stock || 0);
    }
    if (productSortBy === 'NAME_AZ') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Pagination calculation
  const totalProductsCount = sortedProducts.length;
  const totalProductPages = Math.ceil(totalProductsCount / productsPerPage) || 1;
  const safeCurrentProductPage = Math.min(Math.max(productPage, 1), totalProductPages);
  const startProductIndex = (safeCurrentProductPage - 1) * productsPerPage;
  const endProductIndex = Math.min(startProductIndex + productsPerPage, totalProductsCount);
  const paginatedProducts = sortedProducts.slice(startProductIndex, endProductIndex);

  const handleProductPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalProductPages) {
      setProductPage(newPage);
      const targetHeader = document.getElementById('catalog-top-anchor');
      if (targetHeader) {
        targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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

        /* Enterprise Pro KPI Cards */
        .pro-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          position: relative;
          overflow: hidden;
        }
        .pro-kpi-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08);
        }
        .pro-kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: transparent;
          transition: background 0.2s ease;
        }
        .pro-kpi-card:hover::before {
          background: linear-gradient(90deg, #2563eb, #38bdf8);
        }

        /* Pro Panel Container */
        .pro-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: border-color 0.2s ease;
        }
        .pro-card:hover {
          border-color: #cbd5e1;
        }

        /* Pro Order Item Row */
        .pro-order-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .pro-order-row:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        /* Velocity Chart Bars */
        .velocity-bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          height: 100%;
          justify-content: flex-end;
          cursor: pointer;
          position: relative;
        }
        .velocity-bar-col:hover .velocity-bar-pillar {
          opacity: 0.9;
          transform: scaleY(1.02);
        }
        .velocity-bar-pillar {
          width: 100%;
          max-width: 24px;
          border-radius: 6px 6px 2px 2px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: bottom;
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
                onClick={() => handleTabChange('dashboard')}
                className={`myshop-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('products')}
                className={`myshop-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              >
                <Boxes size={18} />
                <span>Products & Stock</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('orders')}
                className={`myshop-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>Orders & Shipping</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('transactions')}
                className={`myshop-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              >
                <CreditCard size={18} />
                <span>Payouts & Finances</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('settings')}
                className={`myshop-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Sliders size={18} />
                <span>CaSa Settings</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('kyc')}
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

          {/* Executive Merchant Status Card */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: '16px',
              padding: '16px 14px',
              color: '#ffffff',
              marginTop: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                  CaSa Verified Merchant
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Live SLA: 99.4%
                </div>
              </div>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Tier 1 Merchant status active with T+2 daily automatic bank settlements.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Merchant KYC & Hub Details →
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="myshop-main">
          {/* Guest / Reviewer Mode Top Alert for external stakeholders / Sir */}
          {!user && (
            <div
              style={{
                background: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 100%)',
                borderRadius: '12px',
                padding: '10px 16px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.8rem',
                border: '1px solid #1e293b',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>🛡️</span>
                <span>
                  <strong>CaSa Vendor Portal (Reviewer Mode):</strong> Viewing verified merchant metrics for <strong>{savedData.storeName}</strong>.
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                Live Storefront Verified
              </span>
            </div>
          )}

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
                <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
                  CaSa Vendor Merchant
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span>{savedData.storeName} • CaSa Verified Seller Center</span>
                <span>•</span>
                <span style={{ color: '#0f172a' }}>Portal URL:</span>
                <code style={{ color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  /vendor/{activeTab}
                </code>
              </div>
            </div>

            {/* Header Right Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Share Vendor Portal Link */}
              <button
                type="button"
                onClick={() => {
                  const fullUrl = `${window.location.origin}/vendor/${activeTab}`;
                  navigator.clipboard.writeText(fullUrl);
                  success(`📋 Vendor Link Copied: ${fullUrl}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #bfdbfe',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.08)',
                }}
                title="Copy official CaSa Vendor link to send to Sir/Team"
              >
                <Share2 size={14} color="#2563eb" />
                <span>Share Vendor Link</span>
              </button>

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
                onClick={() => navigate('/')}
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

          {/* ================= TAB 1: ENTERPRISE MERCHANT COMMAND CENTER ================= */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* SECTION 1: EXECUTIVE FINTECH & PERFORMANCE KPI METRIC CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                {/* KPI 1: Gross Sales MTD */}
                <div className="pro-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Gross Sales MTD</div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <ArrowUpRight size={13} /> +18.4% vs last cycle
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      Live MTD
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      {formatINR(stats?.totalRevenue || 184650)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>Net Payout: <strong style={{ color: '#0f172a' }}>{formatINR(Math.round((stats?.totalRevenue || 184650) * 0.93))}</strong></span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>T+1 Rolling</span>
                    </div>
                  </div>
                </div>

                {/* KPI 2: Customer Bookings & Orders */}
                <div className="pro-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        <Package size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Customer Orders</div>
                        <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <CheckCircle2 size={13} /> Real-time Sync
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Manage
                    </button>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      {orders.length ? `${orders.length}` : '48'} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Bookings</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>Average Order Value:</span>
                      <strong style={{ color: '#0f172a' }}>{formatINR(Math.round((stats?.totalRevenue || 184650) / (orders.length || 48)))}</strong>
                    </div>
                  </div>
                </div>

                {/* KPI 3: Storefront Traffic & Conversion */}
                <div className="pro-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        <Activity size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Marketplace Reach</div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <ArrowUpRight size={13} /> +32.8% visits
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', background: '#f5f3ff', color: '#7c3aed', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      4.2% CVR
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      18,490 <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>Visits</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>Catalog Impressions:</span>
                      <strong style={{ color: '#0f172a' }}>84,210 views</strong>
                    </div>
                  </div>
                </div>

                {/* KPI 4: Fulfillment SLA & Dispatch Rate */}
                <div className="pro-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        <Truck size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Logistics SLA</div>
                        <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <CheckCircle2 size={13} /> Zero Breach
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      Priority Courier
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      99.4% <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#059669' }}>On-Time</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>Avg Dispatch Time:</span>
                      <strong style={{ color: '#0f172a' }}>14.2 Hours</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 2-COLUMN ENTERPRISE ANALYTICS & LIVE CUSTOMER BOOKINGS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
                {/* Left 8 Cols: Sales Velocity & Operations Chart */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="pro-card">
                    {/* Header with Title and Period Filter */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            Sales & Dispatch Velocity
                          </h3>
                          <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            Updated Live
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                          Daily confirmed merchant revenue vs completed logistics handovers
                        </div>
                      </div>

                      {/* Period Switcher */}
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {['7 Days', '30 Days', 'Quarterly'].map((period, idx) => (
                          <button
                            key={period}
                            type="button"
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: idx === 0 ? 800 : 600,
                              background: idx === 0 ? '#ffffff' : 'transparent',
                              color: idx === 0 ? '#0f172a' : '#64748b',
                              boxShadow: idx === 0 ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clean SVG Area & Bar Chart Visualization */}
                    <div style={{ position: 'relative', height: '190px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '16px 8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      {/* Grid Lines */}
                      <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '1px', background: '#f8fafc', borderBottom: '1px dashed #e2e8f0' }} />
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#f8fafc', borderBottom: '1px dashed #e2e8f0' }} />
                      
                      {[
                        { day: 'Mon', revenue: '₹18,400', heightPct: 45, units: 14, date: 'Oct 16' },
                        { day: 'Tue', revenue: '₹28,600', heightPct: 68, units: 22, date: 'Oct 17' },
                        { day: 'Wed', revenue: '₹22,100', heightPct: 54, units: 18, date: 'Oct 18' },
                        { day: 'Thu', revenue: '₹42,800', heightPct: 92, units: 31, date: 'Oct 19', active: true },
                        { day: 'Fri', revenue: '₹34,500', heightPct: 76, units: 26, date: 'Oct 20' },
                        { day: 'Sat', revenue: '₹39,200', heightPct: 84, units: 29, date: 'Oct 21' },
                        { day: 'Sun', revenue: '₹26,750', heightPct: 60, units: 20, date: 'Today' },
                      ].map((item, idx) => (
                        <div key={idx} className="velocity-bar-col" title={`${item.date}: ${item.revenue} (${item.units} units)`}>
                          {item.active && (
                            <div
                              style={{
                                background: '#0f172a',
                                color: '#ffffff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                marginBottom: '6px',
                                boxShadow: '0 4px 12px rgba(15,23,42,0.25)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.revenue}
                            </div>
                          )}
                          <div
                            className="velocity-bar-pillar"
                            style={{
                              height: `${item.heightPct}%`,
                              background: item.active
                                ? 'linear-gradient(180deg, #2563eb 0%, #1e40af 100%)'
                                : 'linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%)',
                            }}
                          />
                          <span style={{ fontSize: '0.72rem', color: item.active ? '#0f172a' : '#64748b', fontWeight: item.active ? 800 : 600 }}>
                            {item.day}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Operational Strip Below Chart */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '18px', paddingTop: '16px' }}>
                      <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '12px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Today's Dispatch</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>₹65,575</div>
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>18 Shipments</div>
                      </div>

                      <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '12px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>COD In-Transit</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>₹24,800</div>
                        <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>Auto-Remitted T+2</div>
                      </div>

                      <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '12px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Return / RTO Ratio</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginTop: '3px' }}>0.4%</div>
                        <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>Best in Class</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Next Courier Cutoff</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>4:30 PM</div>
                        <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700, marginTop: '2px' }}>1h 24m remaining</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Live Customer Bookings Queue (Real-Time Feed) */}
                <div style={{ gridColumn: 'span 4' }}>
                  <div className="pro-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                    <div>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                            Customer Bookings
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          View All ({orders.length || '48'})
                        </button>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '16px' }}>
                        Live orders placed by CaSa buyers synced in real time
                      </div>

                      {/* Orders List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {displayOrders.slice(0, 4).map((ord, idx) => (
                          <div
                            key={ord._id || idx}
                            className="pro-order-row"
                            onClick={() => {
                              if (ord.rawOrder) setSelectedInvoiceOrder(ord.rawOrder);
                              else setActiveTab('orders');
                            }}
                            title="Click to print invoice slip or manage order"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              <img
                                src={ord.avatar}
                                alt={ord.customer}
                                style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {ord.customer}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'}</span>
                                  <span>•</span>
                                  <span>{['Indore, MP', 'Bengaluru, KA', 'Delhi NCR', 'Mumbai, MH'][idx % 4]}</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                                {formatINR(ord.price)}
                              </div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: ord.statusColor,
                                  background: ord.statusBg || (ord.status === 'Complete' ? '#ecfdf5' : ord.status === 'Processing' ? '#eff6ff' : '#fffbeb'),
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  marginTop: '3px',
                                }}
                              >
                                {ord.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Auto-dispatch SLA: 99.4%</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#2563eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
                      >
                        <Printer size={13} />
                        Fulfill & Print Slips
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BOTTOM 3 ENTERPRISE SAAS MODULES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* Module 1: High-Velocity Catalog Products */}
                <div className="pro-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                        Catalog Velocity Leaders
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Top selling SKUs by units & revenue
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      All ({products.length || 14})
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      {
                        title: products[0]?.name || 'Chanderi Pure Silk Handloom Saree',
                        sales: '₹48,200',
                        units: 32,
                        stock: 45,
                        img: products[0]?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&auto=format&fit=crop&q=80',
                      },
                      {
                        title: products[1]?.name || 'Maheshwari Zari Border Dupatta',
                        sales: '₹24,600',
                        units: 28,
                        stock: 62,
                        img: products[1]?.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=120&auto=format&fit=crop&q=80',
                      },
                      {
                        title: products[2]?.name || 'Handcrafted Organic Cotton Kurta',
                        sales: '₹19,800',
                        units: 24,
                        stock: 18,
                        img: products[2]?.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=120&auto=format&fit=crop&q=80',
                      },
                    ].map((prod, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <img
                            src={prod.img}
                            alt={prod.title}
                            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.title}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              {prod.units} sold • Stock: <span style={{ color: prod.stock < 20 ? '#f59e0b' : '#059669', fontWeight: 700 }}>{prod.stock}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', flexShrink: 0, marginLeft: '8px' }}>
                          {prod.sales}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Stock Health: 98% Optimal</span>
                    <button
                      type="button"
                      onClick={() => setIsAddProductModalOpen(true)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={13} /> Add Product
                    </button>
                  </div>
                </div>

                {/* Module 2: Pan-India Express Logistics Pipeline */}
                <div className="pro-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                        Logistics & Courier Routing
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Integrated 3PL Carrier Performance
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#059669', padding: '2px 7px', borderRadius: '5px', fontWeight: 700 }}>
                      100% Insured
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { hub: 'North Hub (Delhi NCR & UP)', share: '36%', status: 'Next Pickup 4:30 PM', color: '#2563eb' },
                      { hub: 'West Hub (Mumbai & MP)', share: '28%', status: 'Daily Linehaul Active', color: '#059669' },
                      { hub: 'South Hub (Bengaluru & Hyd)', share: '22%', status: 'Direct Air Express', color: '#7c3aed' },
                      { hub: 'East Hub (Kolkata & Bihar)', share: '14%', status: 'Surface Fastrack', color: '#f59e0b' },
                    ].map((route, idx) => (
                      <div key={idx} style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: route.color }} />
                            {route.hub}
                          </span>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>{route.share}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.68rem', color: '#64748b' }}>
                          <span>{route.status}</span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>SLA: 99.6%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                    <span>⚡ BlueDart • Delhivery • Shadowfax</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Direct API Linked</span>
                  </div>
                </div>

                {/* Module 3: Merchant Treasury & Rolling Settlements */}
                <div className="pro-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                        Payouts & Treasury Ledger
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Automated T+1 Bank Transfers
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('transactions')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      History
                    </button>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Upcoming Scheduled Transfer</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', letterSpacing: '-0.02em' }}>
                      ₹48,290.00
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> Scheduled Tomorrow, 11:00 AM IST
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                      <span>Destination Account:</span>
                      <strong style={{ color: '#0f172a' }}>HDFC Bank (•••• 4921)</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                      <span>Monthly Reserve Status:</span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>₹0 Reserve (Tier 1 Pro)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('transactions')}
                      style={{
                        width: '100%',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f172a')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    >
                      <Download size={13} />
                      Download GST Tax Invoices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ENTERPRISE PRODUCTS & STOCK MANAGEMENT ================= */}
          {activeTab === 'products' && (
            <div id="catalog-top-anchor" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* TOP HEADER & ADD PRODUCT ACTION */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                      Products & Inventory Management
                    </h2>
                    <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', padding: '3px 9px', borderRadius: '6px', fontWeight: 800 }}>
                      {totalProductsCount} Listed
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Manage marketplace pricing, monitor warehouse stock levels, and execute instant inventory boosts.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Plus size={16} />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* INVENTORY METRIC KPI STRIP (4 METRIC PILLS) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Total Catalog SKUs</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{allCatalogProducts.length}</div>
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Boxes size={18} />
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>In-Stock Healthy</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                      {allCatalogProducts.filter((p) => (p.stock || 0) >= 10).length}
                    </div>
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Low Stock Alert (&lt;10)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
                      {allCatalogProducts.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 10).length}
                    </div>
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={18} />
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Out of Stock</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>
                      {allCatalogProducts.filter((p) => (p.stock || 0) === 0).length}
                    </div>
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={18} />
                  </div>
                </div>
              </div>

              {/* FILTERS & SEARCH CONTROL PANEL */}
              <div className="pro-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Row 1: Stock Status Tabs & View Mode Toggles */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Status Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'ALL', label: 'All Products', count: allCatalogProducts.length },
                      { key: 'IN_STOCK', label: 'In Stock', count: allCatalogProducts.filter((p) => (p.stock || 0) >= 10).length },
                      { key: 'LOW_STOCK', label: 'Low Stock (<10)', count: allCatalogProducts.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 10).length },
                      { key: 'OUT_OF_STOCK', label: 'Out of Stock', count: allCatalogProducts.filter((p) => (p.stock || 0) === 0).length },
                    ].map((tab) => {
                      const isActive = productStatusFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setProductStatusFilter(tab.key)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                            background: isActive ? '#0f172a' : '#f8fafc',
                            color: isActive ? '#ffffff' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: isActive ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{tab.label}</span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '1px 6px',
                              borderRadius: '9999px',
                              background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                              color: isActive ? '#ffffff' : '#64748b',
                              fontWeight: 800,
                            }}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* View Mode Toggle (Grid vs Table) */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      onClick={() => setProductViewMode('grid')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: productViewMode === 'grid' ? '#ffffff' : 'transparent',
                        color: productViewMode === 'grid' ? '#0f172a' : '#64748b',
                        fontWeight: productViewMode === 'grid' ? 800 : 600,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        boxShadow: productViewMode === 'grid' ? '0 1px 3px rgba(15,23,42,0.1)' : 'none',
                      }}
                      title="Grid Cards View"
                    >
                      <Grid size={14} />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductViewMode('table')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: productViewMode === 'table' ? '#ffffff' : 'transparent',
                        color: productViewMode === 'table' ? '#0f172a' : '#64748b',
                        fontWeight: productViewMode === 'table' ? 800 : 600,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        boxShadow: productViewMode === 'table' ? '0 1px 3px rgba(15,23,42,0.1)' : 'none',
                      }}
                      title="Spreadsheet Table View"
                    >
                      <List size={14} />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Search, Category Selector, Sorting Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Search Input with Clear Button */}
                  <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Search by title, SKU, or category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 36px 8px 34px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.82rem',
                        background: '#f8fafc',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {productSearch && (
                      <button
                        type="button"
                        onClick={() => setProductSearch('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Dropdowns */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Category Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Category:</span>
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {availableProductCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === 'ALL' ? 'All Categories' : cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Sort:</span>
                      <select
                        value={productSortBy}
                        onChange={(e) => setProductSortBy(e.target.value)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="NEWEST">Latest Added</option>
                        <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                        <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                        <option value="STOCK_LOW_HIGH">Stock: Low to High</option>
                        <option value="STOCK_HIGH_LOW">Stock: High to Low</option>
                        <option value="NAME_AZ">Product Name (A-Z)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT LISTINGS: GRID OR TABLE */}
              {paginatedProducts.length === 0 ? (
                <div className="pro-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#64748b' }}>
                    <Boxes size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    No matching products found
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '380px', margin: '6px auto 18px' }}>
                    Try clearing your search query or switching your status filter to "All Products".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setProductStatusFilter('ALL');
                      setProductCategoryFilter('ALL');
                    }}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : productViewMode === 'grid' ? (
                /* GRID CARDS VIEW */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                  {paginatedProducts.map((prod) => {
                    const stockNum = Number(prod.stock || 0);
                    const isOutOfStock = stockNum === 0;
                    const isLow = stockNum > 0 && stockNum < 10;
                    const sellingPrice = prod.discountPrice || prod.price;
                    const mrp = prod.price;
                    const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;
                    const discountPercent = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

                    return (
                      <div
                        key={prod._id}
                        className="pro-card"
                        style={{
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '14px',
                          position: 'relative',
                        }}
                      >
                        {/* Top: Image + Category Tag */}
                        <div>
                          <div style={{ position: 'relative', width: '100%', height: '170px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }}>
                            <img
                              src={prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                              alt={prod.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            />
                            {/* Category Badge */}
                            <span
                              style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                background: 'rgba(15, 23, 42, 0.85)',
                                backdropFilter: 'blur(4px)',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              {prod.category || 'Apparel'}
                            </span>

                            {/* SKU Chip */}
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                background: 'rgba(255, 255, 255, 0.92)',
                                color: '#0f172a',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                letterSpacing: '0.02em',
                              }}
                            >
                              {prod.sku || `SKU-${prod._id.slice(-6).toUpperCase()}`}
                            </span>
                          </div>

                          {/* Product Title */}
                          <div style={{ marginTop: '12px' }}>
                            <h3
                              title={prod.name}
                              style={{
                                margin: 0,
                                fontSize: '0.92rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.35,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '2.5em',
                              }}
                            >
                              {prod.name}
                            </h3>

                            {/* Price Strip */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                                {formatINR(sellingPrice)}
                              </span>
                              {hasDiscount && (
                                <>
                                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                    {formatINR(mrp)}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>
                                    {discountPercent}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Stock Status Meter & Quick Boost Actions */}
                        <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: isOutOfStock ? '#dc2626' : isLow ? '#d97706' : '#059669',
                                background: isOutOfStock ? '#fef2f2' : isLow ? '#fffbeb' : '#ecfdf5',
                                padding: '3px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOutOfStock ? '#dc2626' : isLow ? '#d97706' : '#059669' }} />
                              {isOutOfStock ? 'Out of Stock (0)' : isLow ? `Low Stock (${stockNum})` : `In Stock: ${stockNum} units`}
                            </span>

                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                              Warehouse #14
                            </span>
                          </div>

                          {/* Quick Inventory Boost Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Quick Restock:</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleQuickBoostStock(prod, 10)}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  color: '#0f172a',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                                title="Add +10 inventory units"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickBoostStock(prod, 25)}
                                style={{
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                                  transition: 'all 0.15s ease',
                                }}
                                title="Add +25 bulk units"
                              >
                                +25 Units
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* SPREADSHEET TABLE VIEW */
                <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Product Details</th>
                          <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>SKU & Category</th>
                          <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Selling Price</th>
                          <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Stock Status</th>
                          <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Inventory Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((prod) => {
                          const stockNum = Number(prod.stock || 0);
                          const isOutOfStock = stockNum === 0;
                          const isLow = stockNum > 0 && stockNum < 10;
                          return (
                            <tr key={prod._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                              <td style={{ padding: '12px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img
                                    src={prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
                                    alt={prod.name}
                                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                  />
                                  <div style={{ maxWidth: '260px' }}>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {prod.name}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Added {formatDate(prod.createdAt || new Date())}</span>
                                  </div>
                                </div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{prod.category || 'General'}</div>
                                <code style={{ fontSize: '0.68rem', color: '#2563eb', background: '#eff6ff', padding: '1px 5px', borderRadius: '4px' }}>
                                  {prod.sku || `SKU-${prod._id.slice(-6).toUpperCase()}`}
                                </code>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>
                                  {formatINR(prod.discountPrice || prod.price)}
                                </div>
                                {prod.discountPrice && prod.discountPrice < prod.price && (
                                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                    {formatINR(prod.price)}
                                  </span>
                                )}
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    color: isOutOfStock ? '#dc2626' : isLow ? '#d97706' : '#059669',
                                    background: isOutOfStock ? '#fef2f2' : isLow ? '#fffbeb' : '#ecfdf5',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOutOfStock ? '#dc2626' : isLow ? '#d97706' : '#059669' }} />
                                  {isOutOfStock ? '0 (Out)' : `${stockNum} Available`}
                                </span>
                              </td>

                              <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickBoostStock(prod, 10)}
                                    style={{
                                      background: '#f1f5f9',
                                      border: '1px solid #cbd5e1',
                                      padding: '5px 9px',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      color: '#0f172a',
                                    }}
                                  >
                                    +10
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickBoostStock(prod, 25)}
                                    style={{
                                      background: '#059669',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    +25 Units
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ENTERPRISE PAGINATION CONTROL BAR (PREV / NEXT / PAGE PILLS) */}
              <div
                className="pro-card"
                style={{
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                {/* Left: Summary Info */}
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Showing <strong style={{ color: '#0f172a' }}>{totalProductsCount > 0 ? startProductIndex + 1 : 0}</strong> to{' '}
                  <strong style={{ color: '#0f172a' }}>{endProductIndex}</strong> of{' '}
                  <strong style={{ color: '#0f172a' }}>{totalProductsCount}</strong> Products
                </div>

                {/* Middle: Items per page selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Rows:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[8, 16, 24].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => {
                          setProductsPerPage(cnt);
                          setProductPage(1);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: productsPerPage === cnt ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          background: productsPerPage === cnt ? '#0f172a' : '#ffffff',
                          color: productsPerPage === cnt ? '#ffffff' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: productsPerPage === cnt ? 800 : 600,
                          cursor: 'pointer',
                        }}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Pagination Navigation Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handleProductPageChange(safeCurrentProductPage - 1)}
                    disabled={safeCurrentProductPage <= 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: safeCurrentProductPage <= 1 ? '#f8fafc' : '#ffffff',
                      color: safeCurrentProductPage <= 1 ? '#cbd5e1' : '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: safeCurrentProductPage <= 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronLeft size={15} />
                    <span>Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((pNum) => {
                      const isCurrent = safeCurrentProductPage === pNum;
                      // Display window for page pills if large page count
                      if (totalProductPages > 6 && Math.abs(safeCurrentProductPage - pNum) > 2 && pNum !== 1 && pNum !== totalProductPages) {
                        if (pNum === 2 || pNum === totalProductPages - 1) {
                          return <span key={pNum} style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '0 2px' }}>...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => handleProductPageChange(pNum)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: isCurrent ? '1px solid #0f172a' : '1px solid #e2e8f0',
                            background: isCurrent ? '#0f172a' : '#ffffff',
                            color: isCurrent ? '#ffffff' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: isCurrent ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handleProductPageChange(safeCurrentProductPage + 1)}
                    disabled={safeCurrentProductPage >= totalProductPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: safeCurrentProductPage >= totalProductPages ? '#f8fafc' : '#ffffff',
                      color: safeCurrentProductPage >= totalProductPages ? '#cbd5e1' : '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: safeCurrentProductPage >= totalProductPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
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
