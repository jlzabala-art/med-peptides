'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Truck, Layers, ChevronDown, ShieldCheck } from 'lucide-react';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import {
  CATEGORY_ORDER,
  CATEGORY_MAP,
  FDA_FILTERS,
  SHIPPING_DESTINATIONS,
  DOSAGE_STRENGTHS
} from '@/constants/peptideCategories';

/**
 * PeptidesFilterToolbar
 * Google Cloud-inspired search, mobile horizontal category strip, unified filter rail
 * (FDA + Shipping Corridor + Dosage Strength), and desktop sidebar toggle.
 */
export default function PeptidesFilterToolbar({
  isSidebarOpen = true,
  setIsSidebarOpen,
  searchQuery = '',
  setSearchQuery,
  lang = 'en',
  filteredProducts = [],
  processedProducts = [],
  activeFilterChips = [],
  selectedCategory = 'all',
  setSelectedCategory,
  selectedFdaStatus = 'all',
  setSelectedFdaStatus,
  setIsFdaSheetOpen,
  setIsCategorySheetOpen,
  shippingDest = 'EU',
  handleShippingDestChange,
  selectedStrength = 'all',
  setSelectedStrength,
  groupByCategory = true,
  setGroupByCategory,
  onExportCsv,
  onOpenBulkQuote,
  onOpenAtlasAi,
  currency = 'USD',
  isDistributor = false,
}) {
  const isEs = lang === 'es';
  const [isMobileSecondaryOpen, setIsMobileSecondaryOpen] = useState(false);

  const activeFdaObj = FDA_FILTERS.find((f) => f.id === selectedFdaStatus);
  const fdaChipLabel =
    selectedFdaStatus === 'all'
      ? (isEs ? 'FDA: Todas' : 'FDA: All')
      : (isEs ? (activeFdaObj?.labelEs || 'FDA') : (activeFdaObj?.labelEn || 'FDA'));

  const activeCorridor = SHIPPING_DESTINATIONS[shippingDest] || SHIPPING_DESTINATIONS.EU;

  const filterOptions = [
    {
      key: 'fda',
      label: 'FDA',
      value: selectedFdaStatus,
      options: FDA_FILTERS.map((f) => ({
        label: isEs ? (f.labelEs || f.label) : (f.labelEn || f.label),
        value: f.id
      })),
      onChange: (val) => {
        if (setSelectedFdaStatus) setSelectedFdaStatus(val);
        if (setIsFdaSheetOpen) setIsFdaSheetOpen(false);
      }
    },
    {
      key: 'shipping',
      label: isEs ? 'Envío' : 'Shipping',
      value: shippingDest,
      options: Object.values(SHIPPING_DESTINATIONS).map((c) => ({
        label: `${c.flag || ''} ${isEs ? (c.labelEs || c.id) : (c.labelEn || c.id)} ${c.rateBadge || ''}`.trim(),
        value: c.id
      })),
      onChange: (val) => {
        handleShippingDestChange && handleShippingDestChange(val);
      }
    },
    {
      key: 'dosage',
      label: isEs ? 'Dosis' : 'Dose',
      value: selectedStrength,
      options: DOSAGE_STRENGTHS.map((d) => ({
        label: isEs ? (d.labelEs || d.label) : (d.labelEn || d.label),
        value: d.id
      })),
      onChange: (val) => {
        setSelectedStrength && setSelectedStrength(val);
      }
    }
  ];

  return (
    <div className="gcp-search-and-category-block" style={{ marginBottom: '0.75rem' }}>
      {/* Global Search Bar FIRST (Golden Rule #7) + Desktop Filter Sidebar Toggle on Right */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 50 }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            lang={lang}
            placeholder={isEs
              ? 'Buscar péptido (BPC-157, Tirzepatide...)'
              : 'Search peptide (BPC-157, Tirzepatide...)'}
            size="lg"
            resultCount={filteredProducts.length}
            filters={activeFilterChips}
            filterOptions={filterOptions}
          />
        </div>
        {setIsSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="mobile-hide"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '48px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              background: isSidebarOpen ? '#e8f0fe' : '#ffffff',
              color: isSidebarOpen ? '#1a73e8' : '#3c4043',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
            title={isSidebarOpen ? (isEs ? 'Ocultar panel lateral (ampliar tabla al 100%)' : 'Hide sidebar (expand table to 100%)') : (isEs ? 'Mostrar panel lateral de filtros' : 'Show filter sidebar')}
          >
            <SlidersHorizontal size={14} />
            <span>{isSidebarOpen ? (isEs ? 'Filtros (On)' : 'Filters (On)') : (isEs ? 'Filtros (Off)' : 'Filters (Off)')}</span>
          </button>
        )}
      </div>

      {/* Compact Corridor + Wholesale Tier + CSV/Bulk Actions Strip (Replaces duplicated filter card) */}
      <div
        className="mobile-hide"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '7px 12px',
          marginBottom: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '0.74rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', color: '#334155' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#003666' }}>
            <Truck size={13} color="#0284c7" />
            <span>
              {activeCorridor?.flag}{' '}
              {shippingDest === 'US'
                ? (isEs ? 'USA Express · $25 tarifa plana (≤2 kg) · 3–5 días · Cadena fría' : 'USA Express · $25 flat (≤2 kg) · 3–5 business days · Cold-pack')
                : shippingDest === 'AE'
                ? (isEs ? 'UAE / GCC Express · $80 (≤2 kg) · 3–5 días · Cadena fría' : 'UAE / GCC Express · $80 (≤2 kg) · 3–5 business days · Cold-pack')
                : (isEs ? 'Europa Express · €60 (≤2 kg) · 2–4 días · Cadena fría' : 'Europe Express · €60 (≤2 kg) · 2–4 business days · Cold-pack')}
            </span>
          </span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: '#15803d', fontWeight: 700 }}>
            ✓ {isDistributor ? (isEs ? 'Tier Distribuidor' : 'Distributor Tier') : (isEs ? 'Tarifa Mayorista Autorizada' : 'Authorized Wholesale Tier')} ({currency}) · RP-HPLC ≥99.0% CoA
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onOpenAtlasAi && (
            <button
              type="button"
              onClick={onOpenAtlasAi}
              className="gcp-btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title={isEs ? 'Consultar a Atlas AI sobre esta tarifa' : 'Ask Atlas AI about this schedule'}
            >
              <span>✦ Atlas AI</span>
            </button>
          )}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="gcp-btn-secondary"
              style={{ padding: '4px 9px', fontSize: '0.72rem', fontWeight: 600 }}
            >
              {isEs ? 'Exportar CSV' : 'Export CSV'}
            </button>
          )}
          {onOpenBulkQuote && (
            <button
              type="button"
              onClick={onOpenBulkQuote}
              className="gcp-btn-secondary"
              style={{ padding: '4px 9px', fontSize: '0.72rem', fontWeight: 600 }}
            >
              {isEs ? 'Cotización 50+ Viales' : 'Bulk Quote (50+ Vials)'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileSecondaryOpen((prev) => !prev)}
            className="gcp-btn-secondary"
            style={{ padding: '4px 9px', fontSize: '0.72rem', fontWeight: 600 }}
          >
            {isMobileSecondaryOpen ? (isEs ? 'Ocultar Opciones' : 'Hide Options') : (isEs ? 'Envío y Vista' : 'Shipping & View')}
          </button>
        </div>
      </div>

      {/* Mobile-Only Horizontal Scrollable Category Pill Strip (attached directly under search — Rule #7 & #23) */}
      <div className="peptides-mobile-category-strip" role="tablist" aria-label={isEs ? 'Categorías terapéuticas' : 'Therapeutic categories'}>
        <button
          type="button"
          className={`peptides-mob-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory && setSelectedCategory('all')}
        >
          <span>{isEs ? 'Todas' : 'All'}</span>
          <span className="peptides-mob-cat-count">{processedProducts.length}</span>
        </button>
        {CATEGORY_ORDER.map((key) => {
          const meta = CATEGORY_MAP[key];
          if (!meta) return null;
          const count = processedProducts.filter((p) => p.categoryKey === key).length;
          if (count === 0) return null;
          const isSel = selectedCategory === key;
          return (
            <button
              key={key}
              type="button"
              className={`peptides-mob-cat-pill ${isSel ? 'active' : ''}`}
              onClick={() => setSelectedCategory && setSelectedCategory(key)}
            >
              <span>{isEs ? meta.labelEs : meta.labelEn}</span>
              <span className="peptides-mob-cat-count">{count}</span>
            </button>
          );
        })}
        {setIsCategorySheetOpen && (
          <button
            type="button"
            className="peptides-mob-cat-pill"
            onClick={() => setIsCategorySheetOpen(true)}
            style={{ borderStyle: 'dashed' }}
          >
            <Layers size={12} />
            <span>{isEs ? 'Ver lista' : 'Full list'}</span>
          </button>
        )}
      </div>

      {/* Mobile-Only Unified Compact Filter Chip Rail (FDA + Shipping Corridor & Dosage) */}
      <div className="peptides-mobile-quick-filters-rail">
        {setIsFdaSheetOpen && (
          <button
            type="button"
            onClick={() => setIsFdaSheetOpen(true)}
            className={`peptides-mob-rail-chip ${selectedFdaStatus !== 'all' ? 'active' : ''}`}
          >
            <ShieldCheck size={13} color={selectedFdaStatus !== 'all' ? '#1a73e8' : '#5f6368'} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fdaChipLabel}
            </span>
            <ChevronDown size={13} style={{ flexShrink: 0 }} />
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsMobileSecondaryOpen((prev) => !prev)}
          className={`peptides-mob-rail-chip ${(isMobileSecondaryOpen || selectedStrength !== 'all') ? 'active' : ''}`}
          aria-expanded={isMobileSecondaryOpen}
        >
          <Truck size={13} color={(isMobileSecondaryOpen || selectedStrength !== 'all') ? '#1a73e8' : '#5f6368'} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shippingDest} · {selectedStrength === 'all' ? (isEs ? 'Dosis: Todas' : 'All Doses') : selectedStrength}
          </span>
          <ChevronDown
            size={13}
            style={{
              flexShrink: 0,
              transform: isMobileSecondaryOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.18s ease'
            }}
          />
        </button>
      </div>

      {/* Sub-bar with Shipping Corridor, Dosage Strength Pills & Grouping View (Progressive Disclosure — collapsed by default) */}
      {isMobileSecondaryOpen && (
      <div
        className="peptides-secondary-filters-subbar mobile-secondary-expanded"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 12px'
        }}
      >
        {/* Integrated Shipping Corridor Segmented Switcher (Google Cloud Standard) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={13} color="#0284c7" />
            <span style={{ fontSize: '0.72rem', fontWeight: 750, color: '#334155' }}>
              {isEs ? 'Destino y Tarifa de Envío (≤ 2 kg):' : 'Shipping Corridor & Rate (≤ 2 kg):'}
            </span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ffffff', padding: '3px', borderRadius: '7px', border: '1px solid #cbd5e1', flexWrap: 'wrap', maxWidth: '100%' }}>
            {Object.values(SHIPPING_DESTINATIONS).map((corridor) => {
              const isSel = shippingDest === corridor.id;
              return (
                <button
                  key={corridor.id}
                  type="button"
                  onClick={() => handleShippingDestChange && handleShippingDestChange(corridor.id)}
                  title={isEs ? corridor.corridorLabelEs : corridor.corridorLabelEn}
                  style={{
                    border: isSel ? '1px solid #0284c7' : '1px solid transparent',
                    background: isSel ? '#e0f2fe' : 'transparent',
                    color: isSel ? '#0369a1' : '#475569',
                    fontWeight: isSel ? 800 : 600,
                    fontSize: '0.72rem',
                    padding: '6px 9px',
                    minHeight: '34px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{corridor.flag}</span>
                  <span>{isEs ? corridor.labelEs : corridor.labelEn}</span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      color: isSel ? '#0284c7' : '#64748b'
                    }}
                  >
                    {corridor.rateBadge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dosage Strength Quick Filter Pills + Category Grouping Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Concentración:' : 'Filter Strength:'}
            </span>
            {DOSAGE_STRENGTHS.map((st) => {
              const isSelected = selectedStrength === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStrength(st.id)}
                  style={{
                    padding: '5px 10px',
                    minHeight: '32px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 600,
                    border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? '#0284c7' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          {/* View Organization Switcher: Categories (Default) vs Continuous */}
          {setGroupByCategory && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#ffffff',
                padding: '2px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                gap: '2px'
              }}
            >
              <button
                type="button"
                onClick={() => setGroupByCategory(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: groupByCategory ? '#e8f0fe' : 'transparent',
                  color: groupByCategory ? '#003666' : '#64748b',
                  fontWeight: groupByCategory ? 800 : 600,
                  fontSize: '0.72rem',
                  padding: '5px 9px',
                  minHeight: '30px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <Layers size={12} />
                <span>{isEs ? 'Categorías' : 'Categories'}</span>
              </button>
              <button
                type="button"
                onClick={() => setGroupByCategory(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: !groupByCategory ? '#e8f0fe' : 'transparent',
                  color: !groupByCategory ? '#003666' : '#64748b',
                  fontWeight: !groupByCategory ? 800 : 600,
                  fontSize: '0.72rem',
                  padding: '5px 9px',
                  minHeight: '30px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: !groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <span>≡</span>
                <span>{isEs ? 'Continua' : 'Continuous'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
