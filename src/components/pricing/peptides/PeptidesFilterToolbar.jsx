'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Truck, Layers, ChevronDown } from 'lucide-react';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import {
  SHIPPING_DESTINATIONS,
  DOSAGE_STRENGTHS
} from '@/constants/peptideCategories';

/**
 * PeptidesFilterToolbar
 * Google Cloud-inspired search, filter chips, shipping corridor switcher & dosage strength pills.
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
  shippingDest = 'EU',
  handleShippingDestChange,
  selectedStrength = 'all',
  setSelectedStrength,
  groupByCategory = true,
  setGroupByCategory
}) {
  const isEs = lang === 'es';
  const [isMobileSecondaryOpen, setIsMobileSecondaryOpen] = useState(false);

  return (
    <div className="gcp-search-and-category-block" style={{ marginBottom: '0.85rem' }}>
      {/* Desktop Filter Sidebar Toggle + Global Search Bar (Google Cloud Standard) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '8px' }}>
        {setIsSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="mobile-hide"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '42px',
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
        <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 50 }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            lang={lang}
            placeholder={isEs
              ? 'Buscar por nombre de péptido (ej. BPC-157, Semaglutide, Tirzepatide, GHK-Cu, Epithalon)...'
              : 'Search by peptide name (e.g. BPC-157, Semaglutide, Tirzepatide, GHK-Cu, Epithalon)...'}
            size="lg"
            resultCount={filteredProducts.length}
            filters={activeFilterChips}
          />
        </div>
      </div>

      {/* Mobile Progressive Disclosure Toggle for Shipping & Strength Sub-bar */}
      <div className="mobile-only-secondary-toggle">
        <button
          type="button"
          onClick={() => setIsMobileSecondaryOpen(prev => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            background: isMobileSecondaryOpen ? '#e8f0fe' : '#ffffff',
            border: isMobileSecondaryOpen ? '1px solid #1a73e8' : '1px solid #dadce0',
            borderRadius: '6px',
            fontSize: '0.73rem',
            fontWeight: 700,
            color: isMobileSecondaryOpen ? '#1a73e8' : '#3c4043',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(60,64,67,0.04)',
            marginBottom: '6px'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={13} color={isMobileSecondaryOpen ? '#1a73e8' : '#0284c7'} />
            <span>{isEs ? 'Tarifas de Envío & Dosis' : 'Shipping Corridors & Dosage'}</span>
            <span style={{ fontSize: '0.67rem', color: isMobileSecondaryOpen ? '#1a73e8' : '#64748b', fontWeight: 600 }}>
              ({shippingDest} · {selectedStrength === 'all' ? (isEs ? 'Todas' : 'All') : selectedStrength})
            </span>
          </span>
          <ChevronDown
            size={14}
            color={isMobileSecondaryOpen ? '#1a73e8' : '#64748b'}
            style={{
              transform: isMobileSecondaryOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }}
          />
        </button>
      </div>

      {/* Sub-bar with Shipping Corridor, Dosage Strength Pills & Grouping View */}
      <div
        className={`peptides-secondary-filters-subbar ${isMobileSecondaryOpen ? 'mobile-secondary-expanded' : 'mobile-secondary-collapsed'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 12px'
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
            <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#334155' }}>
              {isEs ? 'Destino y Tarifa de Envío (≤ 2 kg):' : 'Shipping Corridor & Rate (≤ 2 kg):'}
            </span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ffffff', padding: '2px', borderRadius: '6px', border: '1px solid #cbd5e1', flexWrap: 'wrap', maxWidth: '100%' }}>
            {Object.values(SHIPPING_DESTINATIONS).map(corridor => {
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
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
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
            {DOSAGE_STRENGTHS.map(st => {
              const isSelected = selectedStrength === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStrength(st.id)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
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
                  fontSize: '0.70rem',
                  padding: '3px 8px',
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
                  fontSize: '0.70rem',
                  padding: '3px 8px',
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
    </div>
  );
}
