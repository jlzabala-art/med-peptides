'use client';

import React from 'react';
import {
  BadgeCheck,
  Building2,
  Coins,
  FileText,
  Package,
  Percent,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

function KpiCard({ icon: Icon, iconWrapClass, label, value, valueClass = '', sub }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon-wrap ${iconWrapClass}`}>
        <Icon size={20} />
      </div>
      <div className="kpi-info">
        <div className="kpi-label">{label}</div>
        <div className={`kpi-value ${valueClass}`}>{value}</div>
        <div className="kpi-sub">{sub}</div>
      </div>
    </div>
  );
}

export default function PricingKpiStrip({
  isGuest,
  isClinicOrDoctor,
  isWholesaler,
  isAdmin,
  totals,
  totalCount,
  filteredCount,
  hasActiveFilters,
  scopeMode,
  setScopeMode,
  markupPct,
  hasCustomOverrides,
  formatPrice,
}) {
  const isFilteredScope = scopeMode === 'filtered' && hasActiveFilters;

  return (
    <>
      {/* Rule #22: Scope Transparency & Switcher */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.28rem 0.7rem',
            borderRadius: '999px',
            background: isFilteredScope ? '#eff6ff' : '#f1f5f9',
            border: isFilteredScope ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
            color: isFilteredScope ? '#1d4ed8' : '#475569',
          }}
        >
          <span>
            {isFilteredScope
              ? `Matching Active Filters (${filteredCount} SKUs)`
              : `Entire Schedule (${totalCount} SKUs)`}
          </span>
        </div>

        {hasActiveFilters && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setScopeMode('global')}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: scopeMode === 'global' ? '#003666' : 'transparent',
                color: scopeMode === 'global' ? '#ffffff' : '#64748b',
              }}
            >
              Entire Schedule ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setScopeMode('filtered')}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: scopeMode === 'filtered' ? '#003666' : 'transparent',
                color: scopeMode === 'filtered' ? '#ffffff' : '#64748b',
              }}
            >
              Filtered ({filteredCount})
            </button>
          </div>
        )}
      </div>

      <section className="kpi-grid no-print">
        {isGuest && (
          <>
            <KpiCard
              icon={Package}
              iconWrapClass="bg-blue-500/10 text-blue-500"
              label="Verified Portfolio"
              value={`${totals.count} Formulations`}
              sub="Professional cellular & trichology range"
            />
            <KpiCard
              icon={Sparkles}
              iconWrapClass="bg-emerald-500/10 text-emerald-500"
              label="Bioactive Technology"
              value="Triple Helix"
              valueClass="text-emerald-600"
              sub="Native biologically active tropocollagen"
            />
            <KpiCard
              icon={ShieldCheck}
              iconWrapClass="bg-teal-500/10 text-teal-500"
              label="Warehouse Origin"
              value="Dubai Free Zone"
              valueClass="text-teal-600"
              sub="Immediate GCC cold-chain delivery"
            />
            <KpiCard
              icon={BadgeCheck}
              iconWrapClass="bg-sky-500/10 text-sky-500"
              label="Regulatory Standard"
              value="EU / ISO 22716"
              valueClass="text-sky-600"
              sub="cGMP Certified · UAE FTA VAT Compliant"
            />
          </>
        )}

        {isClinicOrDoctor && !isWholesaler && (
          <>
            <KpiCard
              icon={TrendingUp}
              iconWrapClass="bg-emerald-500/10 text-emerald-500"
              label="Clinic Margin on MSRP"
              value="~25% – 30% Net"
              valueClass="text-emerald-600"
              sub="Recommended clinic markup over wholesale"
            />
            <KpiCard
              icon={Package}
              iconWrapClass="bg-blue-500/10 text-blue-500"
              label="Stock Availability"
              value="100% In Stock"
              sub="Guaranteed Dubai cold-chain allocation"
            />
            <KpiCard
              icon={FileText}
              iconWrapClass="bg-indigo-500/10 text-indigo-500"
              label="Professional Protocols"
              value={`${totals.count} Dossiers`}
              valueClass="text-indigo-600"
              sub="In-clinic and homecare regimens"
            />
            <KpiCard
              icon={ShieldCheck}
              iconWrapClass="bg-teal-500/10 text-teal-500"
              label="Order Minimum (MOQ)"
              value="No Clinic MOQ"
              valueClass="text-teal-600"
              sub="Unitary clinical dispensing enabled"
            />
          </>
        )}

        {isWholesaler && !isAdmin && (
          <>
            <KpiCard
              icon={Coins}
              iconWrapClass="bg-sky-500/10 text-sky-500"
              label="Wholesale Portfolio Basket"
              value={formatPrice(totals.totalWholesale)}
              valueClass="text-sky-600"
              sub={`Total 1-unit basket of ${totals.count} SKUs`}
            />
            <KpiCard
              icon={TrendingUp}
              iconWrapClass="bg-emerald-500/10 text-emerald-500"
              label="Gross Margin vs Clinic"
              value="~25% Spread"
              valueClass="text-emerald-600"
              sub="Wholesale to clinic distribution spread"
            />
            <KpiCard
              icon={Percent}
              iconWrapClass="bg-indigo-500/10 text-indigo-500"
              label="Active Volume Tier"
              value={`+${markupPct}% Net Tier`}
              sub="Configured partner wholesale rate"
            />
            <KpiCard
              icon={Building2}
              iconWrapClass="bg-blue-500/10 text-blue-500"
              label="Logistics Basis"
              value="Ex-Warehouse Dubai"
              sub="Refrigerated pallet & carton dispatch"
            />
          </>
        )}

        {isAdmin && (
          <>
            <KpiCard
              icon={Coins}
              iconWrapClass="bg-indigo-500/10 text-indigo-500"
              label="Portfolio Landed Cost"
              value={formatPrice(totals.totalLanded)}
              sub="Total CIF Dubai acquisition cost"
            />
            <KpiCard
              icon={Percent}
              iconWrapClass="bg-sky-500/10 text-sky-500"
              label="Portfolio Wholesale Revenue"
              value={formatPrice(totals.totalWholesale)}
              valueClass="text-sky-600"
              sub="Total wholesale unit basket"
            />
            <KpiCard
              icon={TrendingUp}
              iconWrapClass="bg-emerald-500/10 text-emerald-500"
              label="Aggregate Net Margin"
              value={`+${formatPrice(totals.totalMargin)}`}
              valueClass="text-emerald-600"
              sub={`${totals.avgMarginPct}% avg margin on wholesale`}
            />
            <KpiCard
              icon={Sliders}
              iconWrapClass="bg-amber-500/10 text-amber-500"
              label="Formula Overrides"
              value={hasCustomOverrides ? 'Custom Rates Active' : 'Standard Formula'}
              valueClass="text-amber-600"
              sub={`+${markupPct}% base wholesale markup`}
            />
          </>
        )}
      </section>
    </>
  );
}
