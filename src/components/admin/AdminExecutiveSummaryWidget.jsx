"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminExecutiveSummaryWidget.module.css';

import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Truck from 'lucide-react/dist/esm/icons/truck';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Users from 'lucide-react/dist/esm/icons/users';
import Activity from 'lucide-react/dist/esm/icons/activity';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Box from 'lucide-react/dist/esm/icons/box';
import Layers from 'lucide-react/dist/esm/icons/layers';
import FileCheck from 'lucide-react/dist/esm/icons/file-check';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Building2 from 'lucide-react/dist/esm/icons/building-2';

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

export default function AdminExecutiveSummaryWidget({ metrics: initialMetrics = {} }) {
  const router = useRouter();
  const { effectiveRole } = useRoleAccess();
  const [timeRange, setTimeRange] = useState('today');
  const [serverMetrics, setServerMetrics] = useState(initialMetrics);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const activeRole = effectiveRole || 'admin';
  const isAdmin = activeRole === 'admin';

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

  // ── Master Definitions of all 4-KPI Rows ────────────────────────────────────

  const PRODUCTS_ROW = {
    id: 'products',
    title: '🏷️ Products & Catalog',
    tag: 'Inventory & Compounds',
    kpis: [
      {
        id: 'publishedProducts',
        title: 'Published Compounds',
        value: `${metrics.publishedProducts || 0} Compounds`,
        icon: Box,
        route: '/admin/products?status=published',
        styleClass: styles.inventoryIcon,
      },
      {
        id: 'totalVariants',
        title: 'Catalog Formats & SKUs',
        value: `${metrics.totalVariants || 0} Formats`,
        icon: Layers,
        route: '/admin/products',
        styleClass: styles.rfqIcon,
      },
      {
        id: 'lowStockAlerts',
        title: 'Low Stock / Stockouts',
        value: `${metrics.lowStockAlerts || 0} Alerts`,
        icon: AlertTriangle,
        route: '/admin/products?filter=low_stock',
        styleClass: styles.shipmentIcon,
      },
      {
        id: 'verifiedMonographs',
        title: 'Verified CoA Monographs',
        value: `${metrics.verifiedMonographs || 0} Verified`,
        icon: FileCheck,
        route: '/admin/knowledge-base',
        styleClass: styles.revenueIcon,
      },
    ],
  };

  const SALES_ROW = {
    id: 'sales',
    title: '💼 Sales & Commercial Performance',
    tag: `Period: ${TIME_RANGES.find(t => t.id === timeRange)?.label}`,
    kpis: [
      {
        id: 'quotationsCount',
        title: 'Quotations Issued',
        value: `${metrics.quotationsCount || 0} Quotes`,
        icon: FileText,
        route: '/admin/quotations',
        styleClass: styles.rfqIcon,
      },
      {
        id: 'revenue',
        title: 'Real Revenue Generated',
        value: formatAEDtoDual(metrics.revenue || 0),
        icon: TrendingUp,
        route: '/admin/revenue?filter=real',
        styleClass: styles.revenueIcon,
      },
      {
        id: 'periodOrders',
        title: 'Confirmed Sales Orders',
        value: `${metrics.periodOrders || 0} Orders`,
        icon: ShoppingCart,
        route: '/admin/orders',
        styleClass: styles.inventoryIcon,
      },
      {
        id: 'avgQuotationValue',
        title: 'Average Quotation Value',
        value: formatAEDtoDual(metrics.avgQuotationValue || 0),
        icon: DollarSign,
        route: '/admin/quotations',
        styleClass: styles.revenueIcon,
      },
    ],
  };

  const PROCUREMENT_ROW = {
    id: 'procurement',
    title: '📦 Procurement & Sourcing',
    tag: 'Supply Chain & Manufacturing',
    kpis: [
      {
        id: 'openRFQs',
        title: 'Active Sourcing RFQs',
        value: `${metrics.openRFQs || 0} RFQs`,
        icon: FileText,
        route: '/admin/procurement',
        styleClass: styles.rfqIcon,
      },
      {
        id: 'pendingPOs',
        title: 'Pending Purchase Orders',
        value: `${metrics.pendingPOs || 0} POs`,
        icon: Briefcase,
        route: '/admin/purchase-orders',
        styleClass: styles.shipmentIcon,
      },
      {
        id: 'procurementSpend',
        title: 'Sourcing Spend (Period)',
        value: formatAEDtoDual(metrics.procurementSpend || 0),
        icon: DollarSign,
        route: '/admin/procurement',
        styleClass: styles.revenueIcon,
      },
      {
        id: 'activeSuppliers',
        title: 'Active Synthesis Labs',
        value: `${metrics.activeSuppliers || 0} Suppliers`,
        icon: Building2,
        route: '/admin/suppliers',
        styleClass: styles.inventoryIcon,
      },
    ],
  };

  const CLINICAL_ROW = {
    id: 'clinical',
    title: '🩺 Clinical Operations & Medical Direction',
    tag: 'Doctor & Patient Supervision',
    kpis: [
      {
        id: 'activePatients',
        title: 'Active Enrolled Patients',
        value: `${metrics.activePatients || 0} Patients`,
        icon: Users,
        route: '/admin/patients?status=active',
        styleClass: styles.revenueIcon,
      },
      {
        id: 'pendingPrescriptions',
        title: 'Prescriptions Awaiting Review',
        value: `${metrics.pendingPrescriptions || 0} Pending`,
        icon: FileText,
        route: '/admin/prescriptions?status=pending',
        styleClass: styles.rfqIcon,
      },
      {
        id: 'activeProtocols',
        title: 'Active Clinical Protocols',
        value: `${metrics.activeProtocols || 0} Protocols`,
        icon: Activity,
        route: '/admin/protocols?status=active',
        styleClass: styles.shipmentIcon,
      },
      {
        id: 'dueFollowUps',
        title: 'Patient Follow-Ups Due',
        value: `${metrics.dueFollowUps || 0} Due`,
        icon: AlertTriangle,
        route: '/admin/patients?filter=followup_due',
        styleClass: styles.inventoryIcon,
      },
    ],
  };

  const WHOLESALE_ROW = {
    id: 'wholesale',
    title: '🌐 Wholesaler & B2B Distribution',
    tag: 'Institutional Network',
    kpis: [
      {
        id: 'wholesaleSales',
        title: 'B2B Wholesale Volume',
        value: formatAEDtoDual(metrics.wholesaleSales || 0),
        icon: DollarSign,
        route: '/admin/orders?type=wholesale',
        styleClass: styles.revenueIcon,
      },
      {
        id: 'openOrders',
        title: 'Pending Order Processing',
        value: `${metrics.openOrders || 0} Orders`,
        icon: Truck,
        route: '/admin/orders?status=processing',
        styleClass: styles.shipmentIcon,
      },
      {
        id: 'pendingApprovals',
        title: 'Users Pending Approval',
        value: `${metrics.pendingApprovals || 0} Approvals`,
        icon: AlertTriangle,
        route: '/admin/approvals?status=pending',
        styleClass: styles.inventoryIcon,
      },
      {
        id: 'activeClinics',
        title: 'Active Partner Clinics',
        value: `${metrics.activeClinics || 0} Clinics`,
        icon: Building2,
        route: '/admin/clinics',
        styleClass: styles.revenueIcon,
      },
    ],
  };

  // ── Determine which rows to display according to user role ──────────────────
  const activeSections = isAdmin
    ? [PRODUCTS_ROW, SALES_ROW, PROCUREMENT_ROW, CLINICAL_ROW, WHOLESALE_ROW]
    : ['doctor', 'medical_director'].includes(activeRole)
    ? [CLINICAL_ROW]
    : ['wholesaler', 'supplier'].includes(activeRole)
    ? [WHOLESALE_ROW, PROCUREMENT_ROW]
    : [CLINICAL_ROW];

  const getBriefTitle = () => {
    if (['doctor', 'medical_director'].includes(activeRole)) return 'Clinical AI Brief';
    if (activeRole === 'patient') return 'Personal Health AI Brief';
    if (['wholesaler', 'supplier'].includes(activeRole)) return 'Wholesale Sourcing AI Brief';
    return 'Executive AI Command Brief';
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

        {/* Date Range Filter Selector (Server Calculated) */}
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

      {/* Render 4-KPI Rows with Section Headings */}
      {activeSections.map((section) => (
        <div key={section.id} className={styles.rowSection}>
          <div className={styles.rowHeader}>
            <span className={styles.rowTitle}>{section.title}</span>
            <span className={styles.rowTag}>{section.tag}</span>
          </div>
          <div className={styles.kpiRowGrid}>
            {section.kpis.map((kpi) => {
              const IconComponent = kpi.icon;
              return (
                <div 
                  key={kpi.id} 
                  className={styles.card} 
                  onClick={() => router.push(kpi.route)}
                >
                  <div className={`${styles.iconContainer} ${kpi.styleClass}`}>
                    <IconComponent size={18} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardValue}>{kpi.value}</span>
                      <ArrowUpRight size={14} className={styles.arrowIcon} />
                    </div>
                    <span className={styles.cardLabel}>{kpi.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className={styles.footer} style={{ marginTop: '0.5rem' }}>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.askAtlasBtn}`}
            onClick={() => {
              const isDoctor = ['doctor', 'medical_director'].includes(activeRole);
              const label = isDoctor ? 'Ask Clinical AI' : activeRole === 'patient' ? 'Ask Personal AI' : 'Ask Atlas AI';
              window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                detail: {
                  role: activeRole,
                  message: `Provide a comprehensive cross-domain intelligence brief and priority actions for ${activeRole.toUpperCase()}.`,
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
            {['doctor', 'medical_director'].includes(activeRole) 
              ? 'Ask Clinical AI (DOCTOR)' 
              : activeRole === 'patient' 
              ? 'Ask Personal AI (PATIENT)' 
              : activeRole === 'wholesaler' || activeRole === 'supplier' 
              ? 'Ask Wholesale AI (SUPPLY)' 
              : 'Ask Atlas AI (ADMIN)'}
          </button>
        </div>
      </div>
    </div>
  );
}
