/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  PackageSearch,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Server,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Settings,
  DollarSign,
  Eye,
  EyeOff,
  Globe,
  Building2,
} from 'lucide-react';

import AdminSupplyNotifierWidget from './gadgets/AdminSupplyNotifierWidget';
import SystemAuditLogWidget from './gadgets/SystemAuditLogWidget';
import PayoutManagerWidget from './gadgets/PayoutManagerWidget';
import AdminFinanceWidget from './gadgets/AdminFinanceWidget';
import AdminProductSyncWidget from './gadgets/AdminProductSyncWidget';
import { GcpCard, GcpButton } from '../ui';

const DEFAULT_CONFIG = {
  visibleKPIs: [
    'totalUsers',
    'pendingApprovals',
    'activeOrders',
    'revenue',
    'activePhysicians',
    'averageOrderValue',
    'lowStockAlerts',
    'systemHealth',
  ],
  kpiOrder: [
    'totalUsers',
    'pendingApprovals',
    'activeOrders',
    'revenue',
    'activePhysicians',
    'averageOrderValue',
    'lowStockAlerts',
    'systemHealth',
  ],
  visiblePanels: {
    recentRegistrations: false, // Hidden by default to reduce clutter
    systemStatus: true,
    supplyNotifier: true,
    payoutManager: true,
    auditLogs: false, // Hidden by default
    financeWidget: true,
    productSyncWidget: true,
    pageVisits: false, // Hidden by default
    doctorCohort: true,
    wholesalerCohort: true,
  },
  permissions: {
    admin: {
      allowedKPIs: [
        'totalUsers',
        'pendingApprovals',
        'activeOrders',
        'revenue',
        'activePhysicians',
        'averageOrderValue',
        'lowStockAlerts',
        'systemHealth',
      ],
      allowedPanels: [
        'recentRegistrations',
        'systemStatus',
        'supplyNotifier',
        'payoutManager',
        'auditLogs',
        'financeWidget',
        'productSyncWidget',
        'pageVisits',
        'doctorCohort',
        'wholesalerCohort',
      ],
    },
    wholesaler: {
      allowedKPIs: ['totalUsers', 'activeOrders', 'averageOrderValue', 'lowStockAlerts'],
      allowedPanels: ['recentRegistrations', 'supplyNotifier', 'pageVisits', 'doctorCohort'],
    },
  },
};

const KPI_METADATA = {
  totalUsers: {
    title: 'Total Users',
    icon: Users,
    color: '#1a73e8', // Google Blue
    bgColor: '#e8f0fe',
    subtitle: 'Registered accounts',
  },
  pendingApprovals: {
    title: 'Pending Approvals',
    icon: UserPlus,
    color: '#f9ab00', // Google Yellow
    bgColor: '#fef7e0',
    subtitle: 'Requires attention',
  },
  activeOrders: {
    title: 'Active Orders',
    icon: PackageSearch,
    color: '#0f9d58', // Google Green
    bgColor: '#e6f4ea',
    subtitle: 'Processing pipeline',
  },
  revenue: {
    title: 'Total Revenue',
    icon: DollarSign,
    color: '#1a73e8',
    bgColor: '#e8f0fe',
    subtitle: 'Completed sales volume',
  },
  activePhysicians: {
    title: 'Active Physicians',
    icon: ShieldCheck,
    color: '#0f9d58',
    bgColor: '#e6f4ea',
    subtitle: 'Clinics & Doctors active',
  },
  monthlyActivePatients: {
    title: 'Monthly Active Patients',
    icon: Activity,
    color: '#1a73e8',
    bgColor: '#e8f0fe',
    subtitle: 'Patient engagement (30d)',
  },
  averageOrderValue: {
    title: 'Avg Order Value (AOV)',
    icon: DollarSign,
    color: '#1a73e8',
    bgColor: '#e8f0fe',
    subtitle: 'Average ticket size',
  },
  lowStockAlerts: {
    title: 'Low Stock Alerts',
    icon: RefreshCw,
    color: '#d93025', // Google Red
    bgColor: '#fce8e6',
    subtitle: 'Items running low',
  },
  systemHealth: {
    title: 'System Health',
    icon: Server,
    color: '#0f9d58',
    bgColor: '#e6f4ea',
    subtitle: 'All systems operational',
  },
};

export default function AdminMetricsDashboard({ wholesalerId = null }) {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.roles?.includes('admin');
  const activeRole = wholesalerId ? 'wholesaler' : 'admin';

  // Config State
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isEditing, setIsEditing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Live Metrics state
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeOrders: 0,
    revenue: 0,
    activePhysicians: 0,
    monthlyActivePatients: 0,
    averageOrderValue: 0,
    lowStockAlerts: 0,
    systemHealth: '0ms',
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [allRelationships, setAllRelationships] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [visitsPeriod, setVisitsPeriod] = useState('7d');
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cache Flush simulation state
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

  // Load configuration from Firestore
  useEffect(() => {
    async function loadConfig() {
      try {
        const docRef = doc(db, 'config', 'dashboard');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Merge loaded config with DEFAULT_CONFIG keys to prevent missing fields
          const data = docSnap.data();
          setConfig({
            visibleKPIs: data.visibleKPIs || DEFAULT_CONFIG.visibleKPIs,
            kpiOrder: data.kpiOrder || DEFAULT_CONFIG.kpiOrder,
            visiblePanels: { ...DEFAULT_CONFIG.visiblePanels, ...data.visiblePanels },
            permissions: {
              admin: { ...DEFAULT_CONFIG.permissions.admin, ...data.permissions?.admin },
              wholesaler: {
                ...DEFAULT_CONFIG.permissions.wholesaler,
                ...data.permissions?.wholesaler,
              },
            },
          });
        }
      } catch (err) {
        console.warn('Could not load custom dashboard configuration, using default:', err);
      }
    }
    loadConfig();
  }, []);

  // Fetch metrics dynamically with respect to wholesalerId scope and setup polling
  useEffect(() => {
    let intervalId;
    async function fetchMetrics(isSilent = false) {
      try {
        if (!isSilent) setLoading(true);

        const startDbTime = performance.now();

        // Create queries
        const usersQuery = collection(db, 'users');
        const relsQuery = query(
          collection(db, 'doctor_patient_relationships'),
          where('status', '==', 'active')
        );
        const ordersQuery = wholesalerId
          ? query(collection(db, 'orders'), where('wholesalerId', '==', wholesalerId))
          : collection(db, 'orders');
        const productsQuery = collection(db, 'products');
        const viewsQuery = query(
          collection(db, 'page_views'),
          orderBy('timestamp', 'desc'),
          limit(1000)
        );

        // Execute all queries in parallel
        const [usersSnap, relsSnap, ordersSnap, productsSnap, viewsSnapResult] = await Promise.all([
          getDocs(usersQuery),
          getDocs(relsQuery),
          getDocs(ordersQuery),
          getDocs(productsQuery),
          getDocs(viewsQuery).catch((e) => {
            console.warn('Could not fetch page_views collection:', e);
            return null;
          }),
        ]);

        const dbLatency = Math.round(performance.now() - startDbTime);

        let allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        let allRels = relsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        let allOrders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allProducts = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allViews = viewsSnapResult
          ? viewsSnapResult.docs.map((d) => ({ id: d.id, ...d.data() }))
          : [];

        // Apply Time Filter
        if (timeFilter !== 'all') {
          const now = new Date();
          let cutoff = new Date();
          if (timeFilter === '1d') cutoff.setDate(now.getDate() - 1);
          else if (timeFilter === '7d') cutoff.setDate(now.getDate() - 7);
          else if (timeFilter === '30d') cutoff.setDate(now.getDate() - 30);
          else if (timeFilter === '90d') cutoff.setDate(now.getDate() - 90);

          const isAfterCutoff = (item) => {
            const val = item.createdAt || item.timestamp;
            if (!val) return true; // keep items without date
            const d = typeof val.toDate === 'function' ? val.toDate() : new Date(val);
            if (isNaN(d.getTime())) return true;
            return d >= cutoff;
          };

          allUsers = allUsers.filter(isAfterCutoff);
          allOrders = allOrders.filter(isAfterCutoff);
          allRels = allRels.filter(isAfterCutoff);
        }

        // Filter users by wholesaler scoping rules if wholesalerId is set
        let scopedUsers = [];
        const scopedUserIds = new Set();
        if (wholesalerId) {
          const wholesalerRels = allRels.filter((r) => r.doctorId === wholesalerId);
          wholesalerRels.forEach((r) => {
            scopedUserIds.add(r.patientId);
          });
          allUsers.forEach((u) => {
            if (
              u.wholesalerId === wholesalerId ||
              u.id === wholesalerId ||
              u.parentWholesalerId === wholesalerId
            ) {
              scopedUserIds.add(u.id);
            }
          });
          scopedUsers = allUsers.filter((u) => scopedUserIds.has(u.id));
        } else {
          scopedUsers = allUsers;
        }

        // Calculate KPI values
        const totalUsersCount = scopedUsers.length;
        const pendingApprovalsCount = scopedUsers.filter((u) => u.status === 'pending').length;

        const activeOrdersCount = allOrders.filter((o) =>
          ['pending', 'processing', 'shipped'].includes(o.status)
        ).length;

        const totalRevenue = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        const activePhysiciansCount = scopedUsers.filter(
          (u) =>
            (u.role === 'doctor' ||
              u.role === 'clinic' ||
              (u.roles && (u.roles.includes('doctor') || u.roles.includes('clinic')))) &&
            u.status === 'active'
        ).length;

        const monthlyActivePatientsCount = scopedUsers.filter(
          (u) =>
            (u.role === 'patient' ||
              u.role === 'guest' ||
              (u.roles && (u.roles.includes('patient') || u.roles.includes('guest')))) &&
            u.status === 'active'
        ).length;

        const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

        const lowStockAlertsCount = allProducts.filter(
          (p) =>
            p.stockStatus === 'low' ||
            (Number(p.stockQuantity) !== undefined && Number(p.stockQuantity) < 15)
        ).length;

        setMetrics({
          totalUsers: totalUsersCount,
          pendingApprovals: pendingApprovalsCount,
          activeOrders: activeOrdersCount,
          revenue: totalRevenue,
          activePhysicians: activePhysiciansCount,
          monthlyActivePatients: monthlyActivePatientsCount,
          averageOrderValue: averageOrderValue,
          lowStockAlerts: lowStockAlertsCount,
          systemHealth: `${dbLatency}ms`,
        });

        setUsers(allUsers);
        setAllRelationships(allRels);
        setPageViews(allViews);

        // Recent users table
        const recent = [...scopedUsers]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentUsers(recent);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    }

    fetchMetrics();

    // Auto-polling every 30 seconds for live updates
    intervalId = setInterval(() => {
      fetchMetrics(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [wholesalerId, timeFilter]);

  const handleFlushCache = () => {
    if (isFlushing) return;
    setIsFlushing(true);
    setFlushSuccess(false);
    setTimeout(() => {
      setIsFlushing(false);
      setFlushSuccess(true);
      setTimeout(() => {
        setFlushSuccess(false);
      }, 3000);
    }, 1200);
  };

  const handleNavigate = (tab) => {
    navigate(`/admin?t=${tab}`);
  };

  const navigateToUserTab = (role) => {
    if (role === 'wholesaler') {
      navigate('/admin?t=wholesalers');
    } else if (role === 'doctor') {
      navigate('/admin?t=doctors');
    } else {
      navigate('/admin?t=patients');
    }
  };

  const formatDate = (v) => {
    if (!v) return 'N/A';
    if (typeof v.toDate === 'function') return v.toDate().toLocaleDateString();
    if (v.seconds) return new Date(v.seconds * 1000).toLocaleDateString();
    const d = new Date(v);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper checking if a panel should render based on visibility and active role permissions
  const showPanel = (panelKey) => {
    const isVisible = config.visiblePanels[panelKey];
    const isAllowed = config.permissions?.[activeRole]?.allowedPanels?.includes(panelKey);
    return isVisible && isAllowed;
  };

  // Layout customization controls
  const handleToggleKPI = (key) => {
    setConfig((prev) => {
      const nextVisible = prev.visibleKPIs.includes(key)
        ? prev.visibleKPIs.filter((k) => k !== key)
        : [...prev.visibleKPIs, key];
      return { ...prev, visibleKPIs: nextVisible };
    });
  };

  const handleTogglePanel = (key) => {
    setConfig((prev) => ({
      ...prev,
      visiblePanels: {
        ...prev.visiblePanels,
        [key]: !prev.visiblePanels[key],
      },
    }));
  };

  const handleTogglePermission = (roleKey, type, itemKey) => {
    setConfig((prev) => {
      const permissionsCopy = { ...prev.permissions };
      const currentList = permissionsCopy[roleKey][type] || [];
      const updatedList = currentList.includes(itemKey)
        ? currentList.filter((k) => k !== itemKey)
        : [...currentList, itemKey];

      permissionsCopy[roleKey] = {
        ...permissionsCopy[roleKey],
        [type]: updatedList,
      };

      return { ...prev, permissions: permissionsCopy };
    });
  };

  const moveKPI = (index, direction) => {
    const nextOrder = [...config.kpiOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= nextOrder.length) return;

    const temp = nextOrder[index];
    nextOrder[index] = nextOrder[targetIndex];
    nextOrder[targetIndex] = temp;

    setConfig((prev) => ({
      ...prev,
      kpiOrder: nextOrder,
    }));
  };

  const saveCustomLayout = async () => {
    setSavingConfig(true);
    try {
      const docRef = doc(db, 'config', 'dashboard');
      await setDoc(docRef, config);
      setIsEditing(false);
      setFlushSuccess(true);
      setTimeout(() => setFlushSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving dashboard configuration:', err);
      alert('Failed to save dashboard configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 54, 102, 0.1)',
            borderTopColor: '#1a73e8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  // Get filtered page views based on time period and wholesaler scope
  const getFilteredViews = () => {
    const now = new Date();
    let cutoff = new Date();
    if (visitsPeriod === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (visitsPeriod === '7d') {
      cutoff.setDate(now.getDate() - 7);
    } else if (visitsPeriod === '30d') {
      cutoff.setDate(now.getDate() - 30);
    }

    // Determine scoped user IDs if in wholesaler mode
    let scopedUserIds = new Set();
    if (wholesalerId) {
      const wholesalerRels = allRelationships.filter((r) => r.doctorId === wholesalerId);
      wholesalerRels.forEach((r) => {
        scopedUserIds.add(r.patientId);
      });
      users.forEach((u) => {
        if (
          u.wholesalerId === wholesalerId ||
          u.id === wholesalerId ||
          u.parentWholesalerId === wholesalerId
        ) {
          scopedUserIds.add(u.id);
        }
      });
    }

    return pageViews.filter((v) => {
      const vDate = v.timestamp
        ? new Date(v.timestamp)
        : v.serverTime?.seconds
          ? new Date(v.serverTime.seconds * 1000)
          : null;
      if (!vDate || isNaN(vDate.getTime())) return false;
      if (vDate < cutoff) return false;

      // Wholesaler scope
      if (wholesalerId) {
        return scopedUserIds.has(v.userId);
      }
      return true;
    });
  };

  const filteredViews = getFilteredViews();

  // Group page views by path
  const groupedViewsMap = {};
  filteredViews.forEach((v) => {
    const path = v.pagePath || '/';
    if (!groupedViewsMap[path]) {
      groupedViewsMap[path] = {
        path,
        title: v.pageTitle || 'Page',
        count: 0,
        countries: {},
      };
    }
    groupedViewsMap[path].count += 1;
    const country = v.country || 'Unknown';
    groupedViewsMap[path].countries[country] = (groupedViewsMap[path].countries[country] || 0) + 1;
  });

  const prioritizedViews = Object.values(groupedViewsMap).sort((a, b) => b.count - a.count);

  // Doctors / Clinics statistics
  const doctorsWithPatients = users
    .filter(
      (u) =>
        u.role === 'doctor' ||
        u.role === 'clinic' ||
        (u.roles && (u.roles.includes('doctor') || u.roles.includes('clinic')))
    )
    .map((doc) => {
      const docRels = allRelationships.filter(
        (r) => r.doctorId === doc.id && r.status === 'active'
      );
      const patientIds = new Set();
      docRels.forEach((r) => {
        const peer = users.find((usr) => usr.id === r.patientId);
        if (
          peer &&
          (peer.role === 'patient' ||
            peer.role === 'guest' ||
            (peer.roles && (peer.roles.includes('patient') || peer.roles.includes('guest'))))
        ) {
          patientIds.add(r.patientId);
        }
      });
      return {
        id: doc.id,
        name: doc.fullName || doc.displayName || doc.email,
        institution: doc.institution || 'Individual',
        role: doc.role,
        patientCount: patientIds.size,
      };
    })
    .sort((a, b) => b.patientCount - a.patientCount);

  // Scoped doctors for wholesaler view
  const getScopedDoctors = () => {
    if (!wholesalerId) return [];
    const wsRels = allRelationships.filter(
      (r) => r.doctorId === wholesalerId && r.status === 'active'
    );
    const doctorIds = new Set();
    wsRels.forEach((r) => {
      const peer = users.find((usr) => usr.id === r.patientId);
      if (
        peer &&
        (peer.role === 'doctor' ||
          peer.role === 'clinic' ||
          (peer.roles && (peer.roles.includes('doctor') || peer.roles.includes('clinic'))))
      ) {
        doctorIds.add(peer.id);
      }
    });
    users.forEach((u) => {
      if (
        (u.role === 'doctor' || u.role === 'clinic') &&
        (u.wholesalerId === wholesalerId || u.parentWholesalerId === wholesalerId)
      ) {
        doctorIds.add(u.id);
      }
    });

    return users
      .filter((u) => doctorIds.has(u.id))
      .map((doc) => {
        const docRels = allRelationships.filter(
          (r) => r.doctorId === doc.id && r.status === 'active'
        );
        const patientIds = new Set();
        docRels.forEach((r) => {
          const peer = users.find((usr) => usr.id === r.patientId);
          if (
            peer &&
            (peer.role === 'patient' ||
              peer.role === 'guest' ||
              (peer.roles && (peer.roles.includes('patient') || peer.roles.includes('guest'))))
          ) {
            patientIds.add(r.patientId);
          }
        });
        return {
          id: doc.id,
          name: doc.fullName || doc.displayName || doc.email,
          institution: doc.institution || 'Individual',
          role: doc.role,
          patientCount: patientIds.size,
        };
      })
      .sort((a, b) => b.patientCount - a.patientCount);
  };

  const scopedDoctors = getScopedDoctors();

  // Wholesalers statistics (Admin only)
  const wholesalersWithStats = users
    .filter((u) => u.role === 'wholesaler' || (u.roles && u.roles.includes('wholesaler')))
    .map((ws) => {
      const wsRels = allRelationships.filter((r) => r.doctorId === ws.id && r.status === 'active');
      let docCount = 0;
      let patCount = 0;
      wsRels.forEach((r) => {
        const peer = users.find((usr) => usr.id === r.patientId);
        if (peer) {
          const isDoc =
            peer.role === 'doctor' ||
            peer.role === 'clinic' ||
            (peer.roles && (peer.roles.includes('doctor') || peer.roles.includes('clinic')));
          if (isDoc) {
            docCount++;
          } else {
            patCount++;
          }
        }
      });
      return {
        id: ws.id,
        name: ws.fullName || ws.displayName || ws.email,
        doctorCount: docCount,
        patientCount: patCount,
      };
    })
    .sort((a, b) => b.patientCount - a.patientCount);

  // Filter and sort visible KPIs that are allowed for the current role
  const activeKPIs = config.kpiOrder.filter((key) => {
    const isVisible = config.visibleKPIs.includes(key);
    const isAllowed = config.permissions?.[activeRole]?.allowedKPIs?.includes(key);
    return isVisible && isAllowed;
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header title bar with customize buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #dadce0',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#202124',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Activity size={20} color="#1a73e8" />
            {wholesalerId ? 'Wholesaler Dashboard' : 'System Overview'}
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#5f6368' }}>
            {wholesalerId
              ? 'Performance metrics and patient queue scoped to your B2B circle.'
              : 'Real-time platform activity metrics, infrastructure health, and cohort logs.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5f6368' }}>
              TIME RANGE
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                padding: '0.45rem',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                fontSize: '0.8rem',
                backgroundColor: '#f8f9fa',
                outline: 'none',
              }}
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last Month</option>
              <option value="90d">Last 3 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {isAdmin && !wholesalerId && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                border: '1px solid #dadce0',
                backgroundColor: isEditing ? '#e8f0fe' : 'var(--color-bg-surface)',
                color: isEditing ? '#1a73e8' : '#3c4043',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Settings size={14} />
              {isEditing ? 'Close Editor' : 'Customize Layout'}
            </button>
          )}
        </div>
      </div>

      {/* supplyNotifier panel */}
      {showPanel('supplyNotifier') && (
        <div style={{ marginBottom: '2rem' }}>
          <AdminSupplyNotifierWidget />
        </div>
      )}

      {/* Customize Panel Drawer */}
      {isEditing && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 2px 0 rgba(60,67,70,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #dadce0',
              paddingBottom: '0.75rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#202124', fontWeight: 600 }}>
              Customize Dashboard Overview
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
              Arrange metrics and configure layout permissions.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            {/* KPI list reordering & visibility */}
            <div>
              <h4
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.85rem',
                  color: '#202124',
                  fontWeight: 600,
                }}
              >
                KPI Ordering & Visibility
              </h4>
              <div style={{ border: '1px solid #dadce0', borderRadius: '4px', overflow: 'hidden' }}>
                {config.kpiOrder.map((key, index) => {
                  const meta = KPI_METADATA[key];
                  const isVisible = config.visibleKPIs.includes(key);
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderBottom:
                          index < config.kpiOrder.length - 1 ? '1px solid #dadce0' : 'none',
                        backgroundColor: isVisible ? 'var(--color-bg-surface)' : '#f8f9fa',
                        opacity: isVisible ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleToggleKPI(key)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: isVisible ? '#1a73e8' : '#9aa0a6',
                          }}
                        >
                          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3c4043' }}>
                          {meta?.title || key}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Permissions checkboxes */}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem' }}>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={config.permissions.admin.allowedKPIs.includes(key)}
                              onChange={() => handleTogglePermission('admin', 'allowedKPIs', key)}
                            />
                            Admin
                          </label>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={config.permissions.wholesaler.allowedKPIs.includes(key)}
                              onChange={() =>
                                handleTogglePermission('wholesaler', 'allowedKPIs', key)
                              }
                            />
                            Wholesaler
                          </label>
                        </div>

                        {/* Reordering arrows */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            disabled={index === 0}
                            onClick={() => moveKPI(index, -1)}
                            style={{
                              padding: '2px',
                              border: '1px solid #dadce0',
                              borderRadius: '3px',
                              cursor: index === 0 ? 'default' : 'pointer',
                              backgroundColor: index === 0 ? '#f8f9fa' : 'var(--color-bg-surface)',
                            }}
                          >
                            <ChevronUp size={12} color={index === 0 ? '#9aa0a6' : '#5f6368'} />
                          </button>
                          <button
                            disabled={index === config.kpiOrder.length - 1}
                            onClick={() => moveKPI(index, 1)}
                            style={{
                              padding: '2px',
                              border: '1px solid #dadce0',
                              borderRadius: '3px',
                              cursor: index === config.kpiOrder.length - 1 ? 'default' : 'pointer',
                              backgroundColor:
                                index === config.kpiOrder.length - 1
                                  ? '#f8f9fa'
                                  : 'var(--color-bg-surface)',
                            }}
                          >
                            <ChevronDown
                              size={12}
                              color={index === config.kpiOrder.length - 1 ? '#9aa0a6' : '#5f6368'}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panels visibility and permissions */}
            <div>
              <h4
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.85rem',
                  color: '#202124',
                  fontWeight: 600,
                }}
              >
                Panel Permissions & Visibility
              </h4>
              <div style={{ border: '1px solid #dadce0', borderRadius: '4px', overflow: 'hidden' }}>
                {Object.keys(config.visiblePanels).map((key, index) => {
                  const isVisible = config.visiblePanels[key];
                  const title = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderBottom:
                          index < Object.keys(config.visiblePanels).length - 1
                            ? '1px solid #dadce0'
                            : 'none',
                        backgroundColor: isVisible ? 'var(--color-bg-surface)' : '#f8f9fa',
                        opacity: isVisible ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleTogglePanel(key)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: isVisible ? '#1a73e8' : '#9aa0a6',
                          }}
                        >
                          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3c4043' }}>
                          {title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={config.permissions.admin.allowedPanels.includes(key)}
                            onChange={() => handleTogglePermission('admin', 'allowedPanels', key)}
                          />
                          Admin
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={config.permissions.wholesaler.allowedPanels.includes(key)}
                            onChange={() =>
                              handleTogglePermission('wholesaler', 'allowedPanels', key)
                            }
                          />
                          Wholesaler
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              borderTop: '1px solid #dadce0',
              paddingTop: '1rem',
            }}
          >
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #dadce0',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveCustomLayout}
              disabled={savingConfig}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                backgroundColor: '#1a73e8',
                color: 'var(--color-bg-surface)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {savingConfig ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {activeKPIs.map((key) => {
          const meta = KPI_METADATA[key];
          let displayVal = metrics[key];

          // Formatting based on type
          if (key === 'revenue' || key === 'averageOrderValue') {
            displayVal = formatCurrency(metrics[key]);
          } else if (key === 'pendingApprovals' || key === 'lowStockAlerts') {
            displayVal = Number(metrics[key]) || 0;
          }

          const hasAlert =
            (key === 'pendingApprovals' && metrics.pendingApprovals > 0) ||
            (key === 'lowStockAlerts' && metrics.lowStockAlerts > 0);

          return (
            <MetricCard
              key={key}
              title={meta?.title || key}
              value={displayVal}
              icon={meta?.icon || Activity}
              color={meta?.color || '#1a73e8'}
              bgColor={meta?.bgColor || '#e8f0fe'}
              subtitle={meta?.subtitle || ''}
              alert={hasAlert}
              onClick={() => {
                if (wholesalerId) return; // Disable navigation on click in wholesaler scope
                if (key === 'totalUsers' || key === 'pendingApprovals') {
                  handleNavigate('patients');
                } else if (key === 'activePhysicians') {
                  handleNavigate('doctors');
                } else if (key === 'activeOrders') {
                  handleNavigate('orders');
                } else if (key === 'lowStockAlerts') {
                  handleNavigate('products');
                } else if (key === 'systemHealth') {
                  handleNavigate('analytics');
                }
              }}
            />
          );
        })}
      </div>

      {/* Two Column Layout: Recent Registrations & System Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showPanel('systemStatus') ? '1.6fr 1fr' : '1fr',
          gap: '2rem',
          marginBottom: '4rem',
        }}
      >
        {/* Recent Registrations Table (GCP Style) */}
        {showPanel('recentRegistrations') && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid #dadce0',
              boxShadow: '0 1px 2px 0 rgba(60,67,70,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#202124' }}>
                Recent User Registrations
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>Last 5 signups scoped</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #dadce0', backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                      User Name
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                      Email
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                      Role
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                      Zone
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #dadce0',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => navigateToUserTab(user.role)}
                          disabled={!!wholesalerId} // disable navigation links for wholesalers to prevent sandbox escape
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: wholesalerId ? '#202124' : '#1a73e8',
                            fontWeight: 700,
                            cursor: wholesalerId ? 'default' : 'pointer',
                            textDecoration: 'none',
                            fontSize: 'inherit',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => {
                            if (!wholesalerId) e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            if (!wholesalerId) e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {user.name || 'Unknown User'}
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#5f6368' }}>{user.email}</td>
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          textTransform: 'capitalize',
                          color: '#3c4043',
                          fontWeight: 500,
                        }}
                      >
                        {user.role || 'guest'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: user.status === 'pending' ? '#fef7e0' : '#e6f4ea',
                            color: user.status === 'pending' ? '#b06000' : '#137333',
                          }}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#5f6368' }}>
                        {user.shippingCountry || user.detectedCountry || user.region || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#5f6368' }}>
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: 'center', padding: '2rem', color: '#9aa0a6' }}
                      >
                        No recent registration activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Status & Health Panel (GCP Style) */}
        {showPanel('systemStatus') && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid #dadce0',
              boxShadow: '0 1px 2px 0 rgba(60,67,70,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <Server size={18} color="#1a73e8" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#202124' }}>
                  Infrastructure Status
                </h3>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #dadce0',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#5f6368', fontWeight: 500 }}>
                    Firestore Database
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#0f9d58',
                    }}
                  >
                    <span className="admin-pill-status-dot admin-pill-status-dot--pulse" />{' '}
                    Connected
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #dadce0',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#5f6368', fontWeight: 500 }}>
                    Clinical AI Engine
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#1a73e8',
                    }}
                  >
                    <Sparkles size={13} /> gemini-2.5-pro
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #dadce0',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#5f6368', fontWeight: 500 }}>
                    B2B Router Link
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#202124' }}>
                    Active
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #dadce0',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#5f6368', fontWeight: 500 }}>
                    Query Latency
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#202124' }}>
                    ~42ms
                  </span>
                </div>

                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#5f6368', fontWeight: 500 }}>
                    Location Context
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#202124',
                      fontFamily: 'monospace',
                    }}
                  >
                    regenpept-prod
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 'auto',
                padding: '1rem',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dadce0',
              }}
            >
              <h4
                style={{
                  margin: '0 0 0.4rem 0',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#202124',
                }}
              >
                Cache Management
              </h4>
              <p
                style={{
                  margin: '0 0 0.85rem 0',
                  fontSize: '0.72rem',
                  color: '#5f6368',
                  lineHeight: '1.4',
                }}
              >
                Flush application state cache to force immediate reload of catalog products and
                layout rules.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={handleFlushCache}
                  disabled={isFlushing}
                  className="admin-quick-btn"
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '4px',
                    width: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid #dadce0',
                    backgroundColor: 'var(--color-bg-surface)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: isFlushing ? 'default' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFlushing) e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    if (!isFlushing)
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                  }}
                >
                  <RefreshCw size={12} className={isFlushing ? 'animate-spin' : ''} />
                  {isFlushing ? 'Flushing...' : 'Flush Cache'}
                </button>
              </div>
              {flushSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    color: '#0f9d58',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginTop: '0.5rem',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  <CheckCircle2 size={12} /> Cache flushed successfully! (24.8 MB)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Page Visits Analytics Table */}
      {showPanel('pageVisits') && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #dadce0',
            boxShadow: '0 1px 2px 0 rgba(60,67,70,0.1)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#202124',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Globe size={18} color="#1a73e8" />
              Page Visits Analytics
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>
                Timeframe:
              </span>
              <select
                value={visitsPeriod}
                onChange={(e) => setVisitsPeriod(e.target.value)}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  fontSize: '0.72rem',
                  color: '#3c4043',
                  backgroundColor: 'var(--color-bg-surface)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #dadce0', backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Page Path
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Page Title
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#5f6368',
                      textAlign: 'center',
                    }}
                  >
                    Visits
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Geographical Origins (Top)
                  </th>
                </tr>
              </thead>
              <tbody>
                {prioritizedViews.map((view, idx) => {
                  const countryStrings = Object.entries(view.countries)
                    .sort((a, b) => b[1] - a[1])
                    .map(([country, count]) => `${country} (${count})`)
                    .join(', ');

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #dadce0',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          color: '#1a73e8',
                        }}
                      >
                        {view.path}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#202124' }}>{view.title}</td>
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'center',
                          fontWeight: 700,
                          color: '#202124',
                        }}
                      >
                        {view.count}
                      </td>
                      <td
                        style={{ padding: '0.75rem 1rem', color: '#5f6368', fontSize: '0.75rem' }}
                      >
                        {countryStrings || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
                {prioritizedViews.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#9aa0a6',
                        fontStyle: 'italic',
                      }}
                    >
                      No page views recorded in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Physician & Clinics cohort volume table */}
      {showPanel('doctorCohort') && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #dadce0',
            boxShadow: '0 1px 2px 0 rgba(60,67,70,0.1)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#202124',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Users size={18} color="#1a73e8" />
              Physicians & Clinics - Patient Volume
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>Ordered by patient count</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #dadce0', backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Doctor / Clinic Name
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Institution
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Role
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#5f6368',
                      textAlign: 'center',
                    }}
                  >
                    Active Patients
                  </th>
                </tr>
              </thead>
              <tbody>
                {(wholesalerId ? scopedDoctors : doctorsWithPatients).map((doc) => (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom: '1px solid #dadce0',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#202124' }}>
                      {doc.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#5f6368' }}>{doc.institution}</td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textTransform: 'capitalize',
                        color: '#5f6368',
                      }}
                    >
                      {doc.role}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: doc.patientCount > 0 ? '#e6f4ea' : '#f1f3f4',
                          color: doc.patientCount > 0 ? '#137333' : '#5f6368',
                        }}
                      >
                        {doc.patientCount} patient{doc.patientCount === 1 ? '' : 's'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(wholesalerId ? scopedDoctors.length : doctorsWithPatients.length) === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#9aa0a6',
                        fontStyle: 'italic',
                      }}
                    >
                      No physicians or clinics found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wholesaler cohort volume table (Admin only) */}
      {!wholesalerId && showPanel('wholesalerCohort') && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #dadce0',
            boxShadow: '0 1px 2px 0 rgba(60,67,70,0.1)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#202124',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Building2 size={18} color="#1a73e8" />
              Wholesalers B2B Performance
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>Active network volume</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #dadce0', backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Wholesaler Name
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#5f6368',
                      textAlign: 'center',
                    }}
                  >
                    Clinics & Physicians
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#5f6368',
                      textAlign: 'center',
                    }}
                  >
                    Patients
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#5f6368',
                      textAlign: 'center',
                    }}
                  >
                    Total Group Size
                  </th>
                </tr>
              </thead>
              <tbody>
                {wholesalersWithStats.map((ws) => (
                  <tr
                    key={ws.id}
                    style={{
                      borderBottom: '1px solid #dadce0',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#202124' }}>
                      {ws.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#5f6368' }}>
                      {ws.doctorCount}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#5f6368' }}>
                      {ws.patientCount}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#e8f0fe',
                          color: '#1a73e8',
                        }}
                      >
                        {ws.doctorCount + ws.patientCount} members
                      </span>
                    </td>
                  </tr>
                ))}
                {wholesalersWithStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#9aa0a6',
                        fontStyle: 'italic',
                      }}
                    >
                      No wholesalers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Widgets and Operational Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* System Widgets Panel */}
        {(showPanel('auditLogs') || showPanel('payoutManager')) && (
          <div>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#202124',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Activity size={18} color="#1a73e8" />
              Operational Widgets
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  showPanel('auditLogs') && showPanel('payoutManager') ? '1fr 1fr' : '1fr',
                gap: '1.5rem',
              }}
            >
              {showPanel('auditLogs') && (
                <div style={{ height: '380px' }}>
                  <SystemAuditLogWidget />
                </div>
              )}
              {showPanel('payoutManager') && (
                <div style={{ height: '380px' }}>
                  <PayoutManagerWidget />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operational Intelligence (Finance / Zoho Sync) */}
        {(showPanel('financeWidget') || showPanel('productSyncWidget')) && (
          <div>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#202124',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Layers size={18} color="#1a73e8" />
              Intelligence & Sync Hub
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  showPanel('financeWidget') && showPanel('productSyncWidget') ? '1fr 1fr' : '1fr',
                gap: '1.5rem',
              }}
            >
              {showPanel('financeWidget') && <AdminFinanceWidget />}
              {showPanel('productSyncWidget') && <AdminProductSyncWidget />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent for Metric Cards (GCP Styled)
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  alert = false,
  onClick,
}) {
  return (
    <div
      className="admin-metric-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.9)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow =
            `0 10px 30px ${color}1A, inset 0 1px 1px rgba(255,255,255,0.9)`;
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = `${color}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.9)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
        }
      }}
    >
      {/* Decorative top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${color}, ${color}80)`,
        opacity: 0.8
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: `${color}14`, // subtle transparent background
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.5)`,
          }}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        
        {alert && (
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              padding: '0.2rem 0.5rem',
              borderRadius: '20px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
            }}
          >
            Alert
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, marginTop: '0.25rem' }}>
        <h4
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: '#64748b',
            fontWeight: 600,
            letterSpacing: '0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h4>
        <div
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#0f172a',
            marginTop: '0.35rem',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            fontFamily: '"Inter", "Outfit", sans-serif',
          }}
        >
          {value}
        </div>
        <p
          style={{
            margin: '0.5rem 0 0',
            fontSize: '0.75rem',
            color: '#94a3b8',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
