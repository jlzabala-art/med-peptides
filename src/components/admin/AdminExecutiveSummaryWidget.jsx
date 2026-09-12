import React, { useState, useEffect } from 'react';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Truck from 'lucide-react/dist/esm/icons/truck';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import styles from './AdminExecutiveSummaryWidget.module.css';
import { useRouter } from 'next/navigation';

import Users from 'lucide-react/dist/esm/icons/users';
import Activity from 'lucide-react/dist/esm/icons/activity';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Server from 'lucide-react/dist/esm/icons/server';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import { formatAEDtoDual } from '../../utils/currencies';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { fetchExecutiveBriefAction } from '../../actions/adminActions';
import { triggerHaptic } from '../../utils/haptics';

const TIME_RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

export default function AdminExecutiveSummaryWidget({ metrics: initialMetrics = {}, visibleKPIs = [], currentRolePreset = 'CEO' }) {
  const router = useRouter();
  const { effectiveRole } = useRoleAccess();
  const [timeRange, setTimeRange] = useState('today');
  const [serverMetrics, setServerMetrics] = useState(initialMetrics);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const activeRole = effectiveRole || 'admin';

  // Fetch server-calculated metrics when role or timeRange changes
  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      setLoadingMetrics(true);
      try {
        const res = await fetchExecutiveBriefAction({ role: activeRole, timeRange });
        if (isMounted && res?.metrics) {
          setServerMetrics(res.metrics);
        }
      } catch (err) {
        console.warn('Failed to load executive brief metrics:', err);
      } finally {
        if (isMounted) setLoadingMetrics(false);
      }
    }
    loadMetrics();
    return () => { isMounted = false; };
  }, [activeRole, timeRange]);

  const metrics = { ...initialMetrics, ...serverMetrics };

  const ROLE_CARD_MAPPINGS = {
    doctor: ['activePatients', 'pendingPrescriptions', 'activeProtocols', 'dueFollowUps'],
    medical_director: ['activePatients', 'pendingPrescriptions', 'activeProtocols', 'dueFollowUps'],
    patient: ['activeProtocols', 'dueFollowUps', 'openOrders', 'pendingPrescriptions'],
    wholesaler: ['wholesaleSales', 'pendingPOs', 'openRFQs', 'openOrders'],
    supplier: ['wholesaleSales', 'pendingPOs', 'openRFQs', 'openOrders'],
    admin: ['revenue', 'openOrders', 'pendingApprovals', 'openRFQs'],
  };

  const currentRoleKpis = ROLE_CARD_MAPPINGS[activeRole] || ROLE_CARD_MAPPINGS.admin;

  const CARD_CONFIG = {
    revenue: {
      title: 'Real Revenue Generated',
      value: formatAEDtoDual(metrics.revenue || 0),
      icon: TrendingUp,
      route: '/admin/revenue?filter=real',
      styleClass: styles.revenueIcon,
    },
    wholesaleSales: {
      title: 'B2B Wholesale Volume',
      value: formatAEDtoDual(metrics.wholesaleSales || 0),
      icon: DollarSign,
      route: '/admin/orders?type=wholesale',
      styleClass: styles.revenueIcon,
    },
    pendingPOs: {
      title: 'Pending Purchase Orders',
      value: `${metrics.pendingPOs || '0'} POs`,
      icon: Briefcase,
      route: '/admin/orders?type=po',
      styleClass: styles.shipmentIcon,
    },
    openRFQs: {
      title: 'Active RFQs Pending',
      value: `${metrics.openRFQs || '0'} RFQs`,
      icon: FileText,
      route: '/admin/rfqs?status=pending',
      styleClass: styles.rfqIcon,
    },
    openOrders: {
      title: 'Pending Order Processing',
      value: `${metrics.openOrders || '0'} Orders`,
      icon: Truck,
      route: '/admin/orders?status=processing',
      styleClass: styles.shipmentIcon,
    },
    pendingApprovals: {
      title: 'Users Pending Approval',
      value: `${metrics.pendingApprovals || '0'} Approvals`,
      icon: AlertTriangle,
      route: '/admin/approvals?status=pending',
      styleClass: styles.inventoryIcon,
    },
    activePatients: {
      title: 'Active Enrolled Patients',
      value: `${metrics.activePatients || '0'} Patients`,
      icon: Users,
      route: '/admin/patients?status=active',
      styleClass: styles.revenueIcon,
    },
    pendingPrescriptions: {
      title: 'Prescriptions Awaiting Review',
      value: `${metrics.pendingPrescriptions || '0'} Pending`,
      icon: FileText,
      route: '/admin/prescriptions?status=pending',
      styleClass: styles.rfqIcon,
    },
    activeProtocols: {
      title: 'Active Clinical Protocols',
      value: `${metrics.activeProtocols || '0'} Protocols`,
      icon: Activity,
      route: '/admin/protocols?status=active',
      styleClass: styles.shipmentIcon,
    },
    dueFollowUps: {
      title: 'Patient Follow-Ups Due',
      value: `${metrics.dueFollowUps || '0'} Due`,
      icon: AlertTriangle,
      route: '/admin/patients?filter=followup_due',
      styleClass: styles.inventoryIcon,
    },
  };

  const getBriefTitle = () => {
    if (['doctor', 'medical_director'].includes(activeRole)) return 'Clinical AI Brief';
    if (activeRole === 'patient') return 'Personal Health AI Brief';
    if (['wholesaler', 'supplier'].includes(activeRole)) return 'Wholesale Sourcing AI Brief';
    return 'Executive AI Brief';
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header} style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconWrapper}>
            <Sparkles size={18} className={styles.sparkleIcon} />
          </div>
          <h3 className={styles.title}>{getBriefTitle()}</h3>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot}></span>
            AI Analysis Live
          </span>
          {loadingMetrics && <RefreshCw size={14} className="spin-icon" style={{ color: '#0284c7', marginLeft: '6px' }} />}
        </div>

        {/* Date Range Filter Selector (Server Calculated with Touch-Friendly Buttons) */}
        <div 
          className="admin-time-range-bar"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            backgroundColor: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '10px',
            boxSizing: 'border-box'
          }}
        >
          <Calendar size={14} className="admin-time-range-calendar-icon" style={{ color: '#64748b', marginLeft: '6px', marginRight: '2px', flexShrink: 0 }} />
          <div className="admin-time-range-segmented" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', flex: 1 }}>
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => {
                  triggerHaptic('select');
                  setTimeRange(tr.id);
                }}
                className={`admin-time-range-btn ${timeRange === tr.id ? 'active' : ''}`}
                style={{
                  padding: '6px 8px',
                  minHeight: '34px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.76rem',
                  fontWeight: timeRange === tr.id ? 800 : 600,
                  backgroundColor: timeRange === tr.id ? '#ffffff' : 'transparent',
                  color: timeRange === tr.id ? '#003666' : '#64748b',
                  boxShadow: timeRange === tr.id ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-kpi-grid admin-overview-kpi-grid">
        {currentRoleKpis.map((key) => {
          const config = CARD_CONFIG[key];
          if (!config) return null;
          const IconComponent = config.icon;
          return (
            <div key={key} className="dashboard-kpi-card" onClick={() => router.push(config.route)}>
              <div className={`dashboard-kpi-icon-box ${config.styleClass}`}>
                <IconComponent size={18} />
              </div>
              <div className="dashboard-kpi-content">
                <div className="dashboard-kpi-header">
                  <span className="dashboard-kpi-value">{config.value}</span>
                  <ArrowUpRight size={14} className={styles.arrowIcon} />
                </div>
                <span className="dashboard-kpi-label">{config.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.askAtlasBtn}`}
            onClick={() => {
              const isDoctor = ['doctor', 'medical_director'].includes(activeRole);
              const label = isDoctor ? 'Ask Clinical AI' : activeRole === 'patient' ? 'Ask Personal AI' : 'Ask Atlas AI';
              window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                detail: {
                  role: activeRole,
                  message: `Provide a role-specific intelligence brief and key action items for my role as ${activeRole.toUpperCase()}.`,
                  displayText: `${label} (${activeRole.toUpperCase()})`,
                  context: {
                    role: activeRole,
                    moduleMode: isDoctor ? 'doctor' : activeRole === 'admin' ? 'admin' : 'general',
                    isExecutiveBrief: true
                  }
                }
              }));
            }}
          >
            {['doctor', 'medical_director'].includes(activeRole) ? 'Ask Clinical AI (DOCTOR)' : activeRole === 'patient' ? 'Ask Personal AI (PATIENT)' : activeRole === 'wholesaler' || activeRole === 'supplier' ? 'Ask Wholesale AI (SUPPLY)' : 'Ask Atlas AI (ADMIN)'}
          </button>
        </div>
      </div>
    </div>
  );
}
