import React from 'react';
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
import { formatAEDtoDual } from '../../utils/currencies';

export default function AdminExecutiveSummaryWidget({ metrics = {}, visibleKPIs = [], currentRolePreset = 'CEO' }) {
  const router = useRouter();

  const CARD_CONFIG = {
    revenue: {
      title: 'Real Revenue Generated',
      value: formatAEDtoDual(metrics.revenue || 0),
      icon: TrendingUp,
      route: '/admin/revenue?filter=real',
      styleClass: styles.revenueIcon,
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
      route: '/admin/users?role=patient&status=active',
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
      route: '/admin/users?filter=followup_due',
      styleClass: styles.inventoryIcon,
    },
    grossProfit: {
      title: 'Gross Margin Performance',
      value: formatAEDtoDual(metrics.grossProfit || 0),
      icon: DollarSign,
      route: '/admin/revenue?view=margin',
      styleClass: styles.revenueIcon,
    },
    cashPosition: {
      title: 'Real-Time Cash Position',
      value: formatAEDtoDual(metrics.cashPosition || 0),
      icon: Briefcase,
      route: '/admin/revenue?view=cash',
      styleClass: styles.shipmentIcon,
    },
    pipelineValue: {
      title: 'Active Sales Pipeline',
      value: formatAEDtoDual(metrics.pipelineValue || 0),
      icon: TrendingUp,
      route: '/admin/orders?status=pipeline',
      styleClass: styles.revenueIcon,
    },
    supplierHealth: {
      title: 'Supplier Health Score',
      value: `${metrics.supplierHealth || '98'}%`,
      icon: ShieldCheck,
      route: '/admin/rfqs?view=suppliers',
      styleClass: styles.rfqIcon,
    },
    systemUptime: {
      title: 'Infrastructure Uptime',
      value: `${metrics.systemUptime || '99.9'}%`,
      icon: Server,
      route: '/admin/settings?tab=infrastructure',
      styleClass: styles.inventoryIcon,
    },
  };

  const getBriefTitle = () => {
    switch(currentRolePreset) {
      case 'Clinical': return 'Clinical AI Assistant';
      case 'Finance': return 'Finance AI Overview';
      case 'Sales': return 'Sales Velocity Brief';
      case 'Purchasing': return 'Sourcing AI Hub';
      case 'Operations': return 'Ops Command Brief';
      default: return 'Executive AI Brief';
    }
  };

  const renderContextualButtons = () => {
    switch(currentRolePreset) {
      case 'Clinical':
        return (
          <>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/prescriptions?status=pending')}>
              Review Prescriptions
            </button>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/users?role=patient')}>
              Manage Patients
            </button>
          </>
        );
      case 'Finance':
        return (
          <>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/revenue?view=cash')}>
              Cash Flow Analysis
            </button>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/orders?status=invoiced')}>
              Outstanding Invoices
            </button>
          </>
        );
      case 'Sales':
        return (
          <>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/orders?status=pipeline')}>
              Pipeline Review
            </button>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/users?role=wholeseller')}>
              Key Accounts
            </button>
          </>
        );
      case 'Purchasing':
        return (
          <>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/rfqs?status=pending')}>
              Review RFQs
            </button>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/products?view=low_stock')}>
              Low Stock Alerts
            </button>
          </>
        );
      case 'Operations':
        return (
          <>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/orders?status=processing')}>
              Fulfillment Queue
            </button>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/settings?tab=infrastructure')}>
              System Health
            </button>
          </>
        );
      default: // CEO / Default
        return (
          <>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/revenue')}>
              Executive Report
            </button>
            <button className={styles.actionBtn} onClick={() => router.push('/admin/approvals?status=pending')}>
              Pending Approvals
            </button>
          </>
        );
    }
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconWrapper}>
            <Sparkles size={18} className={styles.sparkleIcon} />
          </div>
          <h3 className={styles.title}>{getBriefTitle()}</h3>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot}></span>
            AI Analysis Live
          </span>
        </div>
        <div className={styles.headerActions}>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        {visibleKPIs.slice(0, 4).map((key) => {
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
          {renderContextualButtons()}
          <button
            className={`${styles.actionBtn} ${styles.askAtlasBtn}`}
            onClick={() => router.push('/admin/analytics')}
          >
            Ask Atlas AI
          </button>
        </div>
      </div>
    </div>
  );
}
