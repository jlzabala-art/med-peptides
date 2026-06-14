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
  Timestamp,
  onSnapshot,
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
  Link2,
} from 'lucide-react';

import AdminSupplyNotifierWidget from './gadgets/AdminSupplyNotifierWidget';
import SystemAuditLogWidget from './gadgets/SystemAuditLogWidget';
import PayoutManagerWidget from './gadgets/PayoutManagerWidget';
import AdminFinanceWidget from './gadgets/AdminFinanceWidget';
import AdminProductSyncWidget from './gadgets/AdminProductSyncWidget';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  MetricCard,
  Button,
} from '../ui';

import RecentRegistrationsTable from './metrics/RecentRegistrationsTable';
import DoctorCohortTable from './metrics/DoctorCohortTable';
import WholesalerCohortTable from './metrics/WholesalerCohortTable';
import PageVisitsTable from './metrics/PageVisitsTable';

const DEFAULT_CONFIG = {
  visibleKPIs: [
    'totalUsers',
    'pendingApprovals',
    'activeOrders',
    'revenue',
    'activePhysicians',
    'monthlyActivePatients',
    'averageOrderValue',
    'lowStockAlerts',
    'systemHealth',
    'completedOrders',
  ],
  kpiOrder: [
    'totalUsers',
    'pendingApprovals',
    'activeOrders',
    'revenue',
    'activePhysicians',
    'monthlyActivePatients',
    'averageOrderValue',
    'lowStockAlerts',
    'systemHealth',
    'completedOrders',
    'newUsersThisWeek',
    'activeRelationships',
  ],
  visiblePanels: {
    recentRegistrations: false, // Hidden by default to reduce clutter
    systemStatus: true,
    supplyNotifier: true,
    activeUsers: true,
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
        'monthlyActivePatients',
        'averageOrderValue',
        'lowStockAlerts',
        'systemHealth',
        'completedOrders',
        'newUsersThisWeek',
        'activeRelationships',
      ],
      allowedPanels: [
        'recentRegistrations',
        'systemStatus',
        'supplyNotifier',
        'activeUsers',
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
      allowedKPIs: [
        'totalUsers',
        'activeOrders',
        'averageOrderValue',
        'lowStockAlerts',
        'completedOrders',
        'newUsersThisWeek',
      ],
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
  completedOrders: {
    title: 'Completed Orders',
    icon: CheckCircle2,
    color: '#0f9d58',
    bgColor: '#e6f4ea',
    subtitle: 'Successfully delivered',
  },
  newUsersThisWeek: {
    title: 'New Users (7d)',
    icon: Sparkles,
    color: '#1a73e8',
    bgColor: '#e8f0fe',
    subtitle: 'Growth this week',
  },
  activeRelationships: {
    title: 'Active Linkages',
    icon: Link2,
    color: '#1a73e8',
    bgColor: '#e8f0fe',
    subtitle: 'Doctor-patient pairs',
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

  const [aiConsumption, setAiConsumption] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
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
    completedOrders: 0,
    newUsersThisWeek: 0,
    activeRelationships: 0,
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
    const fetchMetrics = async (isSilent = false) => {
      if (!isSilent) setLoading(true);

      try {
        const startTime = Date.now();

        // Presence and AI Cost listeners
        const activeUsersUnsub = onSnapshot(
          query(collection(db, 'presence'), where('isOnline', '==', true)),
          (snap) => {
            const online = [];
            snap.forEach((doc) => {
              const data = doc.data();
              // Optional: filter out users who haven't been active in > 5 mins just in case
              if (data.lastActiveAt) {
                const lastActiveMs = data.lastActiveAt.toMillis();
                if (Date.now() - lastActiveMs < 300000) {
                  online.push(data);
                }
              }
            });
            setActiveUsers(online);
          }
        );

        const aiLogsUnsub = onSnapshot(doc(db, 'ai_metrics', 'usage'), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let totalCost = 0;
            if (data.agents) {
              Object.values(data.agents).forEach((agentStats) => {
                totalCost += agentStats.estimatedCost || 0;
              });
            }
            setAiConsumption(totalCost);
          } else {
            setAiConsumption(0);
          }
        });

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
            (!isNaN(Number(p.stockQuantity)) && Number(p.stockQuantity) < 15)
        ).length;

        const completedOrdersCount = allOrders.filter(
          (o) => o.status === 'completed' || o.status === 'delivered'
        ).length;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newUsersThisWeekCount = scopedUsers.filter((u) => {
          const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
          return createdAt >= oneWeekAgo;
        }).length;

        const activeRelationshipsCount = allRels.filter((r) => r.status === 'active').length;

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
          completedOrders: completedOrdersCount,
          newUsersThisWeek: newUsersThisWeekCount,
          activeRelationships: activeRelationshipsCount,
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

        // ── Broadcast live metrics to AdminAI via PortalLayout event bus ──
        // This allows ClinicalAssistant to answer questions about the current
        // dashboard state (revenue, users, orders, etc.) in real time.
        const recentUsersSnapshot = recent.map((u) => ({
          name: u.fullName || u.displayName || u.email || 'Unknown',
          role: u.role || 'patient',
          status: u.status || 'active',
          email: u.email || '',
          createdAt: u.createdAt
            ? typeof u.createdAt.toDate === 'function'
              ? u.createdAt.toDate().toLocaleDateString()
              : new Date(u.createdAt).toLocaleDateString()
            : 'N/A',
        }));

        // Top 5 orders by value for financial summary
        const topOrders = [...allOrders]
          .sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0))
          .slice(0, 5)
          .map((o) => ({
            id: o.id?.slice(0, 8) || 'N/A',
            status: o.status || 'unknown',
            total: `$${Number(o.total || 0).toFixed(2)}`,
            customer: o.customerName || o.userEmail || 'N/A',
          }));

        window.dispatchEvent(
          new CustomEvent('admin-context-update', {
            detail: {
              label: 'Dashboard KPIs',
              activeTab: 'dashboard',
              live_metrics: {
                totalUsers: totalUsersCount,
                pendingApprovals: pendingApprovalsCount,
                activeOrders: activeOrdersCount,
                totalRevenue: `$${totalRevenue.toFixed(2)}`,
                activePhysicians: activePhysiciansCount,
                monthlyActivePatients: monthlyActivePatientsCount,
                averageOrderValue: `$${averageOrderValue.toFixed(2)}`,
                lowStockAlerts: lowStockAlertsCount,
                completedOrders: completedOrdersCount,
                newUsersThisWeek: newUsersThisWeekCount,
                activeRelationships: activeRelationshipsCount,
                systemLatency: `${dbLatency}ms`,
              },
              recent_registrations: recentUsersSnapshot,
              top_orders_by_value: topOrders,
              data_timestamp: new Date().toISOString(),
            },
          })
        );
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

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
    navigate(`/admin/${tab === 'dashboard' ? '' : tab}`);
  };

  const navigateToUserTab = (role) => {
    if (role === 'wholesaler') {
      navigate('/admin/wholesellers');
    } else if (role === 'doctor') {
      navigate('/admin/doctors');
    } else {
      navigate('/admin/patients');
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
      <style>{`
        /* ─── AdminMetricsDashboard — Design System ───────────────── */

        /* ── Shared card shell ────────────────────────────────────── */
        .amd-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid var(--color-border, #e2e8f0);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          padding: 1.5rem;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .amd-card.clickable { cursor: pointer; }
        .amd-card.clickable:hover {
          box-shadow: 0 4px 16px rgba(26,115,232,0.12);
          border-color: var(--color-primary, #1a73e8);
        }
        /* card header row */
        .amd-card-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 0.875rem;
        }
        .amd-card-title {
          margin: 0;
          font-size: 0.9rem; font-weight: 600;
          color: var(--color-text-primary, #202124);
        }
        /* stat label (uppercase small) */
        .amd-stat-label {
          font-size: 0.68rem; font-weight: 700;
          color: #64748b; text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        /* stat value */
        .amd-stat-value {
          font-size: 1.6rem; font-weight: 800;
          line-height: 1.1; letter-spacing: -0.02em;
          margin-top: 0.15rem;
        }

        /* Typography Scale */
        .amd-label    { font-size: 0.7rem;  font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
        .amd-caption  { font-size: 0.75rem; font-weight: 400; }
        .amd-body     { font-size: 0.85rem; font-weight: 400; }
        .amd-subtitle { font-size: 0.85rem; font-weight: 600; }
        .amd-title    { font-size: 1rem;    font-weight: 600; }
        .amd-heading  { font-size: 1.1rem;  font-weight: 600; }
        .amd-value    { font-size: 1.6rem;  font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; color: var(--color-text-primary, #1e293b); font-family: var(--font-heading, inherit); }

        /* Layouts */
        .amd-command-header {
          padding: 1.75rem 2rem;
        }
        .amd-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .amd-active-users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .amd-bottom-grid {
          display: grid;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .amd-widget-grid {
          display: grid;
          gap: 1.5rem;
        }
        .amd-table-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid var(--color-border, #dadce0);
          box-shadow: 0 1px 2px rgba(60,67,70,0.1);
          margin-bottom: 1.5rem;
        }
        .amd-table-section table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }
        .amd-table-section thead tr {
          border-bottom: 2px solid var(--color-border, #dadce0);
          background-color: #f8f9fa;
        }
        .amd-table-section th {
          padding: 0.65rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #5f6368;
          white-space: nowrap;
        }
        .amd-table-section td {
          padding: 0.65rem 0.875rem;
          border-bottom: 1px solid #f1f3f4;
          color: #202124;
          vertical-align: middle;
        }
        .amd-table-section tr:hover td { background-color: #f8f9fa; }
        .amd-expand-btn {
          background: none; border: none; cursor: pointer;
          padding: 0.25rem 0.5rem; border-radius: 4px;
          font-size: 0.75rem; color: #5f6368; display: flex; align-items: center; gap: 0.25rem;
        }
        .amd-expand-btn:hover { background: #f1f3f4; }
        .amd-expanded-row td {
          background: #f8f9fa;
          font-size: 0.8rem;
          color: #5f6368;
          padding: 0.5rem 0.875rem 0.75rem 2.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .amd-badge {
          display: inline-block;
          padding: 0.15rem 0.55rem;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        /* KPI card compact on mobile */
        @media (max-width: 768px) {
          .amd-command-header { padding: 1rem; }
          .amd-kpi-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
          .amd-active-users-grid { grid-template-columns: 1fr; }
          .amd-bottom-grid { grid-template-columns: 1fr !important; }
          .amd-widget-grid { grid-template-columns: 1fr !important; }
          /* Compact KPI card on mobile */
          .admin-metric-card {
            flex-direction: row !important;
            align-items: center !important;
            gap: 0.75rem !important;
            padding: 0.875rem 1rem !important;
            min-height: unset !important;
          }
          .admin-metric-card .amd-card-icon {
            flex-shrink: 0;
          }
          .admin-metric-card .amd-card-body {
            flex: 1; min-width: 0;
          }
          .amd-table-section { padding: 1rem 0.75rem; }
          .amd-table-section th, .amd-table-section td { padding: 0.5rem 0.625rem; }
        }

        @media (max-width: 480px) {
          .amd-kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      {/* ── Command Center Header ───────────────────────────────────── */}
      <div
        className="amd-command-header"
        style={{
          backgroundColor: 'var(--color-bg-surface, #ffffff)',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          position: 'relative',
          border: '1px solid var(--color-border, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.4rem',
              }}
            >
              {/* Live pulse indicator */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 0 0 rgba(16,185,129,0.4)',
                    animation: 'livePulse 2s infinite',
                  }}
                />
                <style>{`@keyframes livePulse { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 70%{box-shadow:0 0 0 8px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }`}</style>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Live · All Systems Operational
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--color-text-primary, #1e293b)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {wholesalerId ? 'Partner Overview' : 'Atlas Health · Command Center'}
            </h2>
            <p
              style={{
                margin: '0.35rem 0 0',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary, #64748b)',
              }}
            >
              {wholesalerId
                ? 'Performance metrics scoped to your B2B network.'
                : 'Real-time platform intelligence — physicians, patients, orders & infrastructure.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Time range selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Time Range
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--color-bg-app, #f8fafc)',
                  color: 'var(--color-text-primary, #334155)',
                  outline: 'none',
                  cursor: 'pointer',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <label
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Layout
                </label>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    border: '1px solid',
                    borderColor: isEditing
                      ? 'var(--color-primary, #0071bd)'
                      : 'var(--color-border, #e2e8f0)',
                    backgroundColor: isEditing
                      ? 'rgba(0,113,189,0.05)'
                      : 'var(--color-bg-app, #f8fafc)',
                    color: isEditing
                      ? 'var(--color-primary, #0071bd)'
                      : 'var(--color-text-secondary, #64748b)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Settings size={14} />
                  {isEditing ? 'Close Editor' : 'Customize'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KPI Summary Ribbon */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            gap: '2.5rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Total Users', value: metrics.totalUsers },
            { label: 'Active Physicians', value: metrics.activePhysicians },
            { label: 'Active Orders', value: metrics.activeOrders },
            {
              label: 'Pending Attention',
              value: metrics.pendingApprovals + metrics.lowStockAlerts,
            },
            { label: 'DB Latency', value: metrics.systemHealth },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className="amd-stat-label">{label}</span>
              <span className="amd-value">{value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* supplyNotifier panel */}
      {showPanel('supplyNotifier') && (
        <div style={{ marginBottom: '2rem' }}>
          <AdminSupplyNotifierWidget />
        </div>
      )}

      {/* Active Users & Telemetry Panel */}
      {showPanel('activeUsers') && (
        <div className="amd-active-users-grid">
          {/* Active Users Widget */}
          <div className="amd-card clickable" onClick={() => handleNavigate('analytics')}>
            <div className="amd-card-header">
              <h3 className="amd-card-title">Active Users ({activeUsers.length})</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'livePulse 2s infinite',
                  }}
                />
                <span className="amd-caption" style={{ color: '#64748b' }}>
                  Live · Real time
                </span>
                <ArrowUpRight size={14} style={{ color: 'var(--color-primary, #1a73e8)' }} />
              </div>
            </div>
            {activeUsers.length === 0 ? (
              <p
                className="amd-body"
                style={{ color: '#64748b', textAlign: 'center', padding: '1rem 0', margin: 0 }}
              >
                No users are currently active.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {activeUsers.map((u) => (
                  <div
                    key={u.userId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.4rem 0.6rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                    }}
                  >
                    <div>
                      <div className="amd-subtitle" style={{ color: '#202124' }}>
                        {u.email}
                      </div>
                      <div className="amd-caption" style={{ color: '#64748b' }}>
                        Role: {u.role}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-primary, #1a73e8)',
                        backgroundColor: 'rgba(26,115,232,0.08)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      {u.currentPath}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Consumption Widget */}
          <div className="amd-card clickable" onClick={() => handleNavigate('analytics')}>
            <div className="amd-card-header">
              <h3 className="amd-card-title">Atlas AI Consumption</h3>
              <ArrowUpRight
                size={16}
                style={{ color: 'var(--color-primary, #1a73e8)', flexShrink: 0 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span className="amd-stat-value" style={{ color: 'var(--color-primary, #1a73e8)' }}>
                ${aiConsumption.toFixed(3)}
              </span>
              <span className="amd-caption" style={{ color: '#64748b' }}>
                USD this month
              </span>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}
              >
                <span className="amd-caption" style={{ color: '#64748b' }}>
                  Gemini 1.5 Pro
                </span>
                <span className="amd-caption" style={{ color: '#64748b' }}>
                  ${aiConsumption.toFixed(3)} / $10.00 limit
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#f1f3f4',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min((aiConsumption / 10) * 100, 100)}%`,
                    height: '100%',
                    backgroundColor:
                      aiConsumption > 8 ? '#ef4444' : 'var(--color-primary, #1a73e8)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <p className="amd-caption" style={{ margin: '0.6rem 0 0', color: '#64748b' }}>
                Click to view full AI usage breakdown and session analytics →
              </p>
            </div>
          </div>
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

          <div
            className="amd-customize-grid"
            style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}
          >
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
        style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Key Performance Indicators
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{activeKPIs.length} metrics</span>
      </div>
      <div className="amd-kpi-grid">
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
        className="amd-bottom-grid"
        style={{
          gridTemplateColumns: showPanel('systemStatus') ? '1.6fr 1fr' : '1fr',
        }}
      >
        {/* Recent Registrations Table */}
        {showPanel('recentRegistrations') && (
          <RecentRegistrationsTable
            recentUsers={recentUsers}
            wholesalerId={wholesalerId}
            navigateToUserTab={navigateToUserTab}
            formatDate={formatDate}
          />
        )}

        {/* System Status & Health Panel (GCP Style) */}
        {showPanel('systemStatus') && (
          <Card
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <CardHeader icon={Server} title="Infrastructure Status" />
            <CardContent>
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
                    {metrics.systemHealth}
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
                    }}
                  >
                    regenpept-prod
                  </span>
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
                    <CheckCircle2 size={12} /> Cache flushed successfully!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Page Visits Analytics Table */}
      {showPanel('pageVisits') && (
        <PageVisitsTable
          visitsPeriod={visitsPeriod}
          setVisitsPeriod={setVisitsPeriod}
          prioritizedViews={prioritizedViews}
        />
      )}

      {/* Physician & Clinics cohort volume table */}
      {showPanel('doctorCohort') && (
        <DoctorCohortTable
          wholesalerId={wholesalerId}
          scopedDoctors={scopedDoctors}
          doctorsWithPatients={doctorsWithPatients}
        />
      )}

      {/* Wholesaler cohort volume table (Admin only) */}
      {!wholesalerId && showPanel('wholesalerCohort') && (
        <WholesalerCohortTable wholesalersWithStats={wholesalersWithStats} />
      )}

      {/* System Widgets and Operational Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* System Widgets Panel */}
        {(showPanel('auditLogs') || showPanel('payoutManager')) && (
          <div>
            <h2
              className="amd-heading"
              style={{
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
              className="amd-widget-grid"
              style={{
                gridTemplateColumns:
                  showPanel('auditLogs') && showPanel('payoutManager') ? '1fr 1fr' : '1fr',
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
              className="amd-heading"
              style={{
                color: '#202124',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Layers size={18} color="#1a73e8" />
              Intelligence &amp; Sync Hub
            </h2>
            <div
              className="amd-widget-grid"
              style={{
                gridTemplateColumns:
                  showPanel('financeWidget') && showPanel('productSyncWidget') ? '1fr 1fr' : '1fr',
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
