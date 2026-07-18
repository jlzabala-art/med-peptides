'use client';

import React from 'react';
import {
  Users, ShoppingCart, FileText, DollarSign,
  ClipboardList, Activity, Calendar, Package,
  Stethoscope, Receipt, AlertCircle, CheckCircle2,
  TrendingUp, Clock, UserCheck
} from 'lucide-react';

// ─── KPI definitions per role ─────────────────────────────────────────────────
const KPI_CONFIG = {
  admin: (kpis) => [
    { label: 'Total Users',       value: kpis?.totalUsers ?? '—',           icon: Users,        color: '#2563eb', bg: '#eff6ff' },
    { label: 'Pending Approvals', value: kpis?.pendingApprovals ?? '—',     icon: AlertCircle,  color: '#d97706', bg: '#fffbeb', alert: (kpis?.pendingApprovals ?? 0) > 0 },
    { label: 'Active Orders',     value: kpis?.activeOrders ?? '—',         icon: ShoppingCart, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Revenue (Total)',   value: kpis?.totalRevenue != null ? `$${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '—', icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Open RFQs',        value: kpis?.openRFQs ?? '—',             icon: ClipboardList, color: '#0891b2', bg: '#ecfeff', alert: (kpis?.openRFQs ?? 0) > 0 },
    { label: 'Pending Rx',       value: kpis?.pendingPrescriptions ?? '—',  icon: FileText,     color: '#dc2626', bg: '#fef2f2', alert: (kpis?.pendingPrescriptions ?? 0) > 0 },
    { label: 'Bulk Orders',      value: kpis?.pendingBulkOrders ?? '—',     icon: Package,      color: '#c2410c', bg: '#fff7ed', alert: (kpis?.pendingBulkOrders ?? 0) > 0 },
    { label: 'Pending Bills',    value: kpis?.pendingBills ?? '—',          icon: Receipt,      color: '#64748b', bg: '#f1f5f9' },
  ],
  doctor: (kpis) => [
    { label: 'Active Patients',      value: kpis?.activePatients ?? '—',       icon: Users,        color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Pending Rx',          value: kpis?.pendingPrescriptions ?? '—',  icon: AlertCircle,  color: '#d97706', bg: '#fffbeb', alert: (kpis?.pendingPrescriptions ?? 0) > 0 },
    { label: 'Active Prescriptions', value: kpis?.activePrescriptions ?? '—',  icon: FileText,     color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Active Orders',        value: kpis?.activeOrders ?? '—',         icon: ShoppingCart, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Follow-ups Pending',   value: kpis?.pendingFollowUps ?? '—',     icon: Clock,        color: '#7c3aed', bg: '#f5f3ff', alert: (kpis?.pendingFollowUps ?? 0) > 0 },
  ],
  patient: (kpis) => [
    { label: 'Active Prescriptions', value: kpis?.activePrescriptions ?? '—',  icon: FileText,     color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Total Orders',         value: kpis?.totalOrders ?? '—',           icon: ShoppingCart, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Pending Orders',       value: kpis?.pendingOrders ?? '—',         icon: Clock,        color: '#d97706', bg: '#fffbeb', alert: (kpis?.pendingOrders ?? 0) > 0 },
    { label: 'Consultations',        value: kpis?.upcomingConsultations ?? '—', icon: Calendar,     color: '#16a34a', bg: '#f0fdf4' },
  ],
  wholesaler: (kpis) => [
    { label: 'Total Bulk Orders',   value: kpis?.totalBulkOrders ?? '—',    icon: Package,      color: '#c2410c', bg: '#fff7ed' },
    { label: 'Pending Orders',      value: kpis?.pendingBulkOrders ?? '—',  icon: Clock,        color: '#d97706', bg: '#fffbeb', alert: (kpis?.pendingBulkOrders ?? 0) > 0 },
    { label: 'Delivered Orders',    value: kpis?.deliveredOrders ?? '—',    icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Revenue',             value: kpis?.totalRevenue != null ? `$${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '—', icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Managed Clients',     value: kpis?.managedClients ?? '—',     icon: UserCheck,    color: '#0d9488', bg: '#f0fdfa' },
  ],
};

// ─── Single KPI card ──────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, bg, alert = false }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        padding: '1.1rem 1.25rem',
        borderRadius: 'var(--radius-md, 12px)',
        background: 'var(--color-surface, #fff)',
        border: `1px solid ${alert ? `${color}40` : 'var(--color-border, #e2e8f0)'}`,
        boxShadow: alert ? `0 0 0 2px ${color}20` : '0 1px 3px rgba(0,0,0,0.04)',
        flex: '1 1 160px',
        minWidth: 0,
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = alert ? `0 0 0 2px ${color}20` : '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary, #64748b)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {label}
        </span>
        <span style={{
          display: 'inline-flex',
          padding: '0.35rem',
          borderRadius: '8px',
          background: bg,
          color,
        }}>
          <Icon size={14} strokeWidth={2.5} />
        </span>
      </div>
      <div style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: alert ? color : 'var(--color-text, #0f172a)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {value}
      </div>
      {alert && (
        <span style={{
          fontSize: '0.66rem',
          fontWeight: 700,
          color,
          background: bg,
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          alignSelf: 'flex-start',
        }}>
          Action needed
        </span>
      )}
    </div>
  );
}

// ─── Main strip ───────────────────────────────────────────────────────────────
export default function KpiStripClient({ role = 'admin', kpis = null }) {
  const configFn = KPI_CONFIG[role];
  if (!configFn) return null;

  const cards = configFn(kpis);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.875rem',
      }}
      aria-label={`KPI summary for ${role}`}
    >
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
