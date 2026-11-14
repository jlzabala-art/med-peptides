'use client';

import React from 'react';
import {
  FlaskConical,
  CheckCircle2,
  ShoppingCart,
  TrendingDown,
  ShieldCheck,
  Award,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

/**
 * PeptidesKpiSummaryBar
 * Google Cloud-inspired 4-KPI Metric Strip with Scope Switcher (Rule #22)
 * Features an ultra-compact 1-row summary on mobile with expand/collapse toggle (Rule #23).
 */
export default function PeptidesKpiSummaryBar({
  filteredProducts = [],
  processedProducts = [],
  totalCartCount = 0,
  totalCartValueUsd = 0,
  formatPrice = val => `$${val}`,
  scopeMode = 'filtered',
  setScopeMode,
  isMobileKpiExpanded = false,
  setIsMobileKpiExpanded,
  setSelectedCategory,
  selectedFdaStatus = 'all',
  setSelectedFdaStatus,
  setSearchQuery,
  setIsOrderDrawerOpen,
  isEs = false
}) {
  const currentProducts = scopeMode === 'filtered' ? filteredProducts : processedProducts;
  const approvedCount = currentProducts.filter(
    p => p.fdaBucket === 'fda_503a' || p.fdaBucket === 'fda_approved'
  ).length;

  return (
    <div
      className="gcp-kpis-summary-block"
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '10px 14px',
        marginBottom: '0.85rem',
        boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
      }}
    >
      {/* Scope Indicator & Switcher (Google Cloud Standard - Golden Rule #22) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '8px',
          marginBottom: '10px',
          borderBottom: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#0284c7',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            {filteredProducts.length === processedProducts.length
              ? (isEs ? `${processedProducts.length} Formulaciones Disponibles` : `${processedProducts.length} Available Formulations`)
              : (isEs ? `${filteredProducts.length} de ${processedProducts.length} Formulaciones` : `${filteredProducts.length} of ${processedProducts.length} Formulations`)}
          </span>
          {totalCartCount > 0 && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 750,
                color: '#137333',
                background: '#e6f4ea',
                border: '1px solid #ceead6',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCircle2 size={11} />
              <span>{totalCartCount} {isEs ? (totalCartCount === 1 ? 'Vial' : 'Viales') : (totalCartCount === 1 ? 'Vial' : 'Vials')} ({formatPrice(totalCartValueUsd)})</span>
            </span>
          )}
        </div>

        {/* Scope Switcher: Active Filter View vs Global Catalog */}
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            borderRadius: '5px',
            padding: '2px',
            gap: '2px',
            border: '1px solid #e2e8f0'
          }}
        >
          <button
            type="button"
            onClick={() => setScopeMode('filtered')}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              border: 'none',
              background: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
              color: scopeMode === 'filtered' ? '#1a73e8' : '#64748b',
              fontWeight: scopeMode === 'filtered' ? 750 : 500,
              fontSize: '0.66rem',
              cursor: 'pointer',
              boxShadow: scopeMode === 'filtered' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Ver métricas del conjunto filtrado actual' : 'View metrics for current active filter'}
          >
            {isEs ? `Filtros Activos (${filteredProducts.length})` : `Active Filters (${filteredProducts.length})`}
          </button>
          <button
            type="button"
            onClick={() => setScopeMode('global')}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              border: 'none',
              background: scopeMode === 'global' ? '#ffffff' : 'transparent',
              color: scopeMode === 'global' ? '#1a73e8' : '#64748b',
              fontWeight: scopeMode === 'global' ? 750 : 500,
              fontSize: '0.66rem',
              cursor: 'pointer',
              boxShadow: scopeMode === 'global' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Ver métricas de toda la base de datos' : 'View metrics for entire database'}
          >
            {isEs ? `Catálogo Global (${processedProducts.length})` : `Entire Catalog (${processedProducts.length})`}
          </button>
        </div>
      </div>

      {/* Mobile-Only Compact KPI Summary Bar (Rule #23: Prevents bulky GCP cards from pushing products below fold on mobile) */}
      <div
        className="mobile-kpi-summary-strip"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '4px 0',
          fontSize: '0.72rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            🧬 {currentProducts.length} {isEs ? 'Formulaciones' : 'Formulations'}
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontWeight: 650, color: '#0284c7' }}>
            🏛️ {approvedCount} {isEs ? 'Aprobadas' : 'Approved'}
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontWeight: 650, color: '#16a34a' }}>
            📦 -15% Pack
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileKpiExpanded(!isMobileKpiExpanded)}
          style={{
            background: isMobileKpiExpanded ? '#e8f0fe' : '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#1a73e8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}
          title={isMobileKpiExpanded ? (isEs ? 'Ocultar tarjetas de métricas' : 'Hide metric cards') : (isEs ? 'Ver tarjetas de métricas completas' : 'Show full metric cards')}
        >
          <span>{isMobileKpiExpanded ? (isEs ? 'Ocultar' : 'Hide') : (isEs ? 'KPIs' : 'KPIs')}</span>
          {isMobileKpiExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* 4 KPIs in a 2x2 Mobile Grid / 4-Col Desktop Grid (GCP Standard) */}
      <div className={`peptides-kpis-grid ${!isMobileKpiExpanded ? 'mobile-kpi-collapsed' : 'mobile-kpi-expanded'}`}>
        {/* KPI 1: Available Formulations */}
        <div
          className="peptides-kpi-card"
          onClick={() => {
            setSelectedCategory('all');
            setSelectedFdaStatus('all');
            setSearchQuery('');
          }}
          title={isEs ? 'Clic para ver todas las formulaciones' : 'Click to view all formulations'}
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '12px 14px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '102px',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Formulaciones' : 'Formulations'}
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={15} style={{ color: '#1a73e8' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#202124', lineHeight: 1.15 }}>
              {currentProducts.length}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{isEs ? 'Viales Liofilizados' : 'Sterile Vials'}</span>
              <span style={{ color: '#1a73e8', fontWeight: 600 }}>{isEs ? 'Filtrar →' : 'Filter →'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pack ×10 Volume Savings */}
        <div
          className="peptides-kpi-card"
          onClick={() => {
            if (totalCartCount > 0 && setIsOrderDrawerOpen) setIsOrderDrawerOpen(true);
          }}
          title={totalCartCount > 0 ? (isEs ? 'Clic para revisar proforma' : 'Click to review proforma') : ''}
          style={{
            background: '#ffffff',
            border: totalCartCount > 0 ? '1px solid #bbf7d0' : '1px solid #dadce0',
            borderTop: totalCartCount > 0 ? '3px solid #16a34a' : '1px solid #dadce0',
            borderRadius: '8px',
            padding: '12px 14px',
            cursor: totalCartCount > 0 ? 'pointer' : 'default',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '102px',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 650, color: totalCartCount > 0 ? '#15803d' : '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {totalCartCount > 0 ? (isEs ? 'Proforma' : 'Proforma') : (isEs ? 'Ahorro Pack ×10' : 'Pack ×10 Savings')}
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {totalCartCount > 0 ? <ShoppingCart size={15} style={{ color: '#16a34a' }} /> : <TrendingDown size={15} style={{ color: '#16a34a' }} />}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#15803d', lineHeight: 1.15 }}>
              {totalCartCount > 0 ? `${totalCartCount} ${isEs ? 'Viales' : 'Vials'}` : (isEs ? '-15% a -52%' : '-15% to -52%')}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{totalCartCount > 0 ? `${formatPrice(totalCartValueUsd)} Subtotal` : (isEs ? 'Nivel Pack 10' : 'Pack ×10 Tier')}</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>{totalCartCount > 0 ? (isEs ? 'Revisar →' : 'Review →') : (isEs ? 'Explorar →' : 'Explore →')}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: 503A & FDA Approved */}
        <div
          className="peptides-kpi-card"
          onClick={() => setSelectedFdaStatus(selectedFdaStatus === 'fda_503a' ? 'all' : 'fda_503a')}
          title={isEs ? 'Clic para filtrar 503A & Aprobados' : 'Click to filter 503A & Approved'}
          style={{
            background: '#ffffff',
            border: selectedFdaStatus === 'fda_503a' ? '1.5px solid #0284c7' : '1px solid #dadce0',
            borderRadius: '8px',
            padding: '12px 14px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '102px',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? '503A & Aprobados' : '503A & Approved'}
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={15} style={{ color: '#0284c7' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.15 }}>
              {approvedCount}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>20 HHS · 15 NDA</span>
              <span style={{ color: '#0284c7', fontWeight: 600 }}>{isEs ? 'Ver →' : 'View →'}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Analytical Quality & Purity */}
        <div
          className="peptides-kpi-card"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '12px 14px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '102px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Pureza y Calidad' : 'Quality & Purity'}
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={15} style={{ color: '#0d9488' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.15 }}>
              100% COA
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>≥99.0% HPLC</span>
              <span style={{ color: '#0d9488', fontWeight: 600 }}>{isEs ? 'Fichas →' : 'Specs →'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
