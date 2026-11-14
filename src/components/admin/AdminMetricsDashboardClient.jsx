'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Activity from 'lucide-react/dist/esm/icons/activity';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Clock from 'lucide-react/dist/esm/icons/clock';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Package from 'lucide-react/dist/esm/icons/package';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Server from 'lucide-react/dist/esm/icons/server';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Users from 'lucide-react/dist/esm/icons/users';
import {
  fetchDashboardMetricsAction,
  refreshDashboardMetricsAction,
} from '../../actions/dashboardActions';
import { formatAEDtoDual } from '../../utils/currencies';
import notifier from '../../services/NotificationService';
import PageHeader from '../ui/PageHeader';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';
import EmptyState from '../ui/EmptyState';
import styles from './AdminMetricsDashboard.module.css';

const DATE_RANGES = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'all', label: 'All time' },
];

const ROLE_PRESETS = {
  CEO: {
    label: 'CEO Overview',
    kpis: ['revenue', 'grossProfit', 'openOrders', 'pendingApprovals'],
  },
  Finance: {
    label: 'Finance & Margin',
    kpis: ['revenue', 'grossProfit', 'pipelineValue', 'openQuotations'],
  },
  Clinical: {
    label: 'Clinical Ops',
    kpis: ['activePatients', 'activeProtocols', 'pendingPrescriptions', 'dueFollowUps'],
  },
  Operations: {
    label: 'Supply & Catalog',
    kpis: ['openOrders', 'openRFQs', 'publishedProducts', 'activeSuppliers'],
  },
};

const KPI_DEFINITIONS = {
  revenue: {
    label: 'Recognized Revenue',
    icon: DollarSign,
    bg: '#eff6ff',
    color: '#1d4ed8',
    href: '/admin/orders',
    timeScoped: true,
    format: (m) => formatAEDtoDual(m.revenue || 0),
    subtitle: (m) => `${m.openOrders || 0} open orders in queue`,
  },
  grossProfit: {
    label: 'Gross Profit',
    icon: TrendingUp,
    bg: '#f0fdf4',
    color: '#15803d',
    href: '/admin/orders',
    timeScoped: true,
    format: (m) => formatAEDtoDual(m.grossProfit || 0),
    subtitle: (m) => {
      const rev = Number(m.revenue || 0);
      const margin = rev > 0 ? Math.round((Number(m.grossProfit || 0) / rev) * 100) : 0;
      return `${margin}% blended margin`;
    },
  },
  pipelineValue: {
    label: 'Quotation Pipeline',
    icon: FileText,
    bg: '#f5f3ff',
    color: '#6d28d9',
    href: '/admin/quotations',
    timeScoped: true,
    format: (m) => formatAEDtoDual(m.pipelineValue || 0),
    subtitle: (m) => `${m.openQuotations || 0} active quotations`,
  },
  openQuotations: {
    label: 'Open Quotations',
    icon: FileText,
    bg: '#fffbeb',
    color: '#b45309',
    href: '/admin/quotations',
    timeScoped: true,
    format: (m) => Number(m.openQuotations || 0).toLocaleString(),
    subtitle: () => 'Awaiting client acceptance',
  },
  openOrders: {
    label: 'Open Orders',
    icon: ShoppingCart,
    bg: '#eff6ff',
    color: '#0369a1',
    href: '/admin/orders',
    timeScoped: true,
    format: (m) => Number(m.openOrders || 0).toLocaleString(),
    subtitle: () => 'Pending fulfillment or transit',
  },
  pendingApprovals: {
    label: 'Pending User Approvals',
    icon: UserCheck,
    bg: '#fef2f2',
    color: '#b91c1c',
    href: '/admin/users',
    timeScoped: false,
    format: (m) => Number(m.pendingApprovals || 0).toLocaleString(),
    subtitle: (m) => `${m.activeUsersCount || 0} active accounts total`,
  },
  openRFQs: {
    label: 'Open Supplier RFQs',
    icon: Package,
    bg: '#fff7ed',
    color: '#c2410c',
    href: '/admin/rfq',
    timeScoped: true,
    format: (m) => Number(m.openRFQs || 0).toLocaleString(),
    subtitle: () => 'Sourcing requests in progress',
  },
  activePatients: {
    label: 'Active Patients',
    icon: Users,
    bg: '#f0fdfa',
    color: '#0f766e',
    href: '/admin/patients',
    timeScoped: false,
    format: (m) => Number(m.activePatients || 0).toLocaleString(),
    subtitle: () => 'Approved patient accounts',
  },
  activeProtocols: {
    label: 'Active Protocols',
    icon: Activity,
    bg: '#f0fdf4',
    color: '#15803d',
    href: '/admin/protocols',
    timeScoped: false,
    format: (m) => Number(m.activeProtocols || 0).toLocaleString(),
    subtitle: () => 'Published clinical regimens',
  },
  pendingPrescriptions: {
    label: 'Pending Prescriptions',
    icon: FileText,
    bg: '#fffbeb',
    color: '#b45309',
    href: '/admin/prescriptions',
    timeScoped: true,
    format: (m) => Number(m.pendingPrescriptions || 0).toLocaleString(),
    subtitle: () => 'Awaiting clinical review',
  },
  dueFollowUps: {
    label: 'Follow-Ups Due',
    icon: Clock,
    bg: '#fef2f2',
    color: '#b91c1c',
    href: '/admin/prescriptions',
    timeScoped: false,
    format: (m) => Number(m.dueFollowUps || 0).toLocaleString(),
    subtitle: () => 'Scheduled next 7 days',
  },
  publishedProducts: {
    label: 'Published Products',
    icon: Package,
    bg: '#f0fdf4',
    color: '#15803d',
    href: '/admin/catalog',
    timeScoped: false,
    format: (m) => Number(m.publishedProducts || 0).toLocaleString(),
    subtitle: () => 'Active catalog SKUs',
  },
  activeSuppliers: {
    label: 'Active Suppliers',
    icon: Building2,
    bg: '#eff6ff',
    color: '#1d4ed8',
    href: '/admin/suppliers',
    timeScoped: false,
    format: (m) => Number(m.activeSuppliers || 0).toLocaleString(),
    subtitle: () => 'Verified sourcing partners',
  },
};

function formatSyncedTime(isoString) {
  if (!isoString) return 'Just now';
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Just now';
  }
}

function formatRegistrationDate(val) {
  if (!val) return 'Recent';
  try {
    return new Date(val).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

export default function AdminMetricsDashboardClient({
  wholesalerId = null,
  initialMetricsData = null,
}) {
  const router = useRouter();
  const [activePreset, setActivePreset] = useState('CEO');
  const [dateRange, setDateRange] = useState(
    initialMetricsData?.meta?.dateRange || '30d'
  );
  const [dashboardData, setDashboardData] = useState(
    initialMetricsData || {
      metrics: {},
      priorities: [],
      recentRegistrations: [],
      meta: { dateRange: '30d', syncedAt: null, serverLatencyMs: null },
    }
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChangingScope, setIsChangingScope] = useState(false);

  const metrics = dashboardData?.metrics || {};
  const priorities = useMemo(
    () => dashboardData?.priorities || [],
    [dashboardData]
  );
  const recentRegistrations = useMemo(
    () => dashboardData?.recentRegistrations || [],
    [dashboardData]
  );
  const meta = dashboardData?.meta || {};

  const activeScopeLabel =
    DATE_RANGES.find((r) => r.id === dateRange)?.label || 'Last 30 days';

  const visibleKpis = useMemo(() => {
    const presetKeys = ROLE_PRESETS[activePreset]?.kpis || ROLE_PRESETS.CEO.kpis;
    return presetKeys
      .map((key) => ({ id: key, ...KPI_DEFINITIONS[key] }))
      .filter((item) => Boolean(item.label));
  }, [activePreset]);

  const handleDateRangeChange = async (nextRange) => {
    if (nextRange === dateRange || isChangingScope) return;
    setDateRange(nextRange);
    setIsChangingScope(true);
    try {
      const nextData = await fetchDashboardMetricsAction(nextRange);
      if (nextData) {
        setDashboardData(nextData);
      }
    } catch (err) {
      notifier.error(`Failed to load ${nextRange} metrics: ${err.message}`);
    } finally {
      setIsChangingScope(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const fresh = await refreshDashboardMetricsAction(dateRange);
      if (fresh) {
        setDashboardData(fresh);
        notifier.success(`Dashboard synced (${activeScopeLabel})`);
      }
    } catch (err) {
      notifier.error(`Refresh failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCardKeyDown = (e, href) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <div className={styles.dashboardRoot}>
      <PageHeader
        panel="admin"
        title={wholesalerId ? 'Wholesaler Command Center' : 'Executive Command Center'}
        subtitle="Real-time Firestore aggregations across revenue, clinical operations & supply chain"
        actions={
          <button
            type="button"
            className={styles.primaryHeaderBtn}
            onClick={handleRefresh}
            disabled={isRefreshing || isChangingScope}
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? styles.spinIcon : undefined}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        }
      />

      <div className={styles.contentWrap}>
        {/* Preset & Date-Range Scope Control Bar */}
        <div className={styles.controlBar}>
          <div
            className={styles.segmentedGroup}
            role="tablist"
            aria-label="Dashboard role presets"
          >
            {Object.entries(ROLE_PRESETS).map(([presetKey, preset]) => (
              <button
                key={presetKey}
                type="button"
                role="tab"
                aria-selected={activePreset === presetKey}
                className={`${styles.segmentBtn} ${
                  activePreset === presetKey ? styles.segmentBtnActive : ''
                }`}
                onClick={() => setActivePreset(presetKey)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div
            className={styles.segmentedGroup}
            role="group"
            aria-label="KPI time scope"
          >
            {DATE_RANGES.map((range) => (
              <button
                key={range.id}
                type="button"
                disabled={isChangingScope}
                className={`${styles.segmentBtn} ${
                  dateRange === range.id ? styles.segmentBtnActive : ''
                }`}
                onClick={() => handleDateRangeChange(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Transparency & Real Telemetry Indicator */}
        <div className={styles.scopeRow}>
          <span className={styles.scopeBadge}>
            <Calendar size={13} />
            <span>
              Scope: {activeScopeLabel}
              {isChangingScope ? ' (Updating...)' : ''}
            </span>
          </span>

          <div className={styles.telemetryGroup}>
            <span className={styles.telemetryItem}>
              <Server size={13} />
              <span>
                Firestore:{' '}
                {meta.serverLatencyMs != null
                  ? `${meta.serverLatencyMs} ms`
                  : 'SSR'}
              </span>
            </span>
            <span className={styles.telemetryItem}>
              <Clock size={13} />
              <span>Synced: {formatSyncedTime(meta.syncedAt)}</span>
            </span>
          </div>
        </div>

        {/* 4-Card Clickable KPI Grid */}
        <section className={styles.kpiGrid} aria-label="Key Performance Indicators">
          {visibleKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                role="button"
                tabIndex={0}
                className={styles.kpiCard}
                onClick={() => router.push(kpi.href)}
                onKeyDown={(e) => handleCardKeyDown(e, kpi.href)}
              >
                <div>
                  <div className={styles.kpiCardTop}>
                    <div
                      className={styles.kpiIconWrap}
                      style={{ backgroundColor: kpi.bg, color: kpi.color }}
                    >
                      <Icon size={19} />
                    </div>
                    <span className={styles.kpiScopePill}>
                      {kpi.timeScoped ? activeScopeLabel : 'Live Total'}
                    </span>
                  </div>
                  <p className={styles.kpiLabel} style={{ marginTop: '0.75rem' }}>
                    {kpi.label}
                  </p>
                  <p className={styles.kpiValue}>{kpi.format(metrics)}</p>
                </div>

                <div className={styles.kpiFooter}>
                  <span>{kpi.subtitle(metrics)}</span>
                  <span className={styles.kpiLinkHint}>
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Action Required Queue & Recent Registrations */}
        <div className={styles.twoColGrid}>
          <section className={styles.panelCard} aria-label="Action Required">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <AlertTriangle size={17} color="#d97706" />
                <span>Action Required Today</span>
              </h2>
              <span className={styles.panelCountBadge}>
                {priorities.length} {priorities.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {priorities.length === 0 ? (
              <EmptyState
                compact
                icon={CheckCircle2}
                title="All caught up"
                subtitle="No critical or high-priority items require attention right now."
              />
            ) : (
              <div className={styles.listBody}>
                {priorities.map((item) => (
                  <div key={item.id} className={styles.listRow}>
                    <div className={styles.rowMain}>
                      <div className={styles.rowTopLine}>
                        <StatusBadge
                          status={item.priority === 'critical' ? 'error' : 'pending'}
                          customLabel={(item.priority || 'high').toUpperCase()}
                        />
                        <p className={styles.rowTitle}>{item.text}</p>
                      </div>
                      {item.detail && (
                        <div className={styles.rowMeta}>
                          <span>{item.detail}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className={styles.rowActionBtn}
                      onClick={() => router.push(item.link || '/admin')}
                    >
                      <span>Resolve</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panelCard} aria-label="Recent Registrations">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <UserPlus size={17} color="#003666" />
                <span>Recent Registrations</span>
              </h2>
              <button
                type="button"
                className={styles.rowActionBtn}
                onClick={() => router.push('/admin/users')}
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {recentRegistrations.length === 0 ? (
              <EmptyState
                compact
                icon={Users}
                title="No recent registrations"
                subtitle="New user signups will appear here."
              />
            ) : (
              <div className={styles.listBody}>
                {recentRegistrations.map((u) => {
                  const fullName =
                    [u.firstName, u.lastName].filter(Boolean).join(' ') ||
                    u.email ||
                    'Unnamed Account';
                  const statusValue =
                    u.status || (u.approved ? 'active' : 'pending');

                  return (
                    <div key={u.id} className={styles.listRow}>
                      <div className={styles.rowMain}>
                        <div className={styles.rowTopLine}>
                          <p className={styles.rowTitle}>{fullName}</p>
                          <StatusBadge status={statusValue} />
                        </div>
                        <div className={styles.rowMeta}>
                          <span>{u.email || 'No email'}</span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize' }}>
                            {u.role || 'user'}
                          </span>
                          <span>•</span>
                          <span>{formatRegistrationDate(u.createdAt)}</span>
                        </div>
                      </div>

                      <CopyableId value={u.id} maxLength={10} truncate />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
