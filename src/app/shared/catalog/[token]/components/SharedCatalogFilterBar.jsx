'use client';

import React from 'react';
import { Search, Filter, ChevronDown, List, LayoutGrid } from 'lucide-react';
import { getFdaPeptideStatus } from '@/data/fdaPeptidesRegistry';

/**
 * SharedCatalogFilterBar — Streamlined Google Cloud UX Filter Toolbar.
 *  - Primary Search box with clear button
 *  - Quick Peptide Formats dropdown (Vials, Pens, Sprays, Kits, High Dose)
 *  - Mobile Filter button (triggers slide-over drawer with Clinical Goals & FDA Status)
 *  - Active Filter Chips Bar with instant 'Clear all'
 *  - Dual view toggle (List vs Cards) & Results counter
 */
export default function SharedCatalogFilterBar({
  searchQuery,
  setSearchQuery,
  selectedGoals = [],
  clearGoals,
  availableGoals = [],
  toggleGoal,
  products = [],
  isFormatDropdownOpen,
  setIsFormatDropdownOpen,
  packagingMode,
  setPackagingMode,
  dosageFilter,
  setDosageFilter,
  routeFilter = 'all',
  setRouteFilter,
  fdaFilter = 'all',
  setFdaFilter,
  onOpenMobileFilters = () => {},
  displayedProducts = [],
  viewMode = 'list',
  setViewMode,
  lang = 'en'
}) {
  const ROUTE_LABELS = {
    injectable: { label: 'Injectable / SubQ', icon: '💉' },
    nasal:      { label: 'Nasal Spray', icon: '👃' },
    oral:       { label: 'Oral / Capsules', icon: '💊' },
    topical:    { label: 'Topical / Hair', icon: '💧' },
  };

  const FDA_LABELS = {
    all: 'All Regulatory Profiles',
    fda_approved: 'FDA Approved APIs',
    fda_pcac_503a_recommended: '503A PCAC Recommended',
    clinical_investigational: 'Clinical Investigational (IND)',
    research_analytical_standard: 'Analytical Reference Standards'
  };

  const isFdaActive = fdaFilter && fdaFilter !== 'all';
  const isFormatActive = packagingMode !== 'all' || dosageFilter === 'high_dose' || (routeFilter && routeFilter !== 'all');

  const hasActiveFilters = Boolean(
    searchQuery ||
    (selectedGoals && selectedGoals.length > 0) ||
    isFormatActive ||
    isFdaActive
  );

  const handleClearAll = () => {
    if (setSearchQuery) setSearchQuery('');
    if (clearGoals) clearGoals();
    if (setPackagingMode) setPackagingMode('all');
    if (setDosageFilter) setDosageFilter('all');
    if (setRouteFilter) setRouteFilter('all');
    if (setFdaFilter) setFdaFilter('all');
  };

  const formatButtonLabel = () => {
    if (dosageFilter === 'high_dose') return 'High Dose (≥10mg)';
    if (packagingMode === 'vials') return 'Lyophilized Vials';
    if (packagingMode === 'pens') return 'Pens & Cartridges';
    if (packagingMode === 'sprays') return 'Nasal Sprays';
    if (packagingMode === 'oral') return 'Oral & Sublingual';
    if (packagingMode === 'kits') return '10-Vial Kits';
    if (packagingMode === 'units') return 'Single Vials';
    if (routeFilter && routeFilter !== 'all' && ROUTE_LABELS[routeFilter]) {
      return ROUTE_LABELS[routeFilter].label;
    }
    return 'All Formats';
  };

  const activeFacetsCount = (selectedGoals?.length || 0) + (isFdaActive ? 1 : 0);

  return (
    <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
      
      {/* ── Toolbar: Search + Quick Format + Mobile Filter Trigger ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        width: '100%'
      }}>
        
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '0 12px',
          height: '40px',
          flex: '1 1 260px',
          minWidth: '220px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
        }}>
          <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder={lang === 'es' ? 'Buscar formulación, principio activo, dosis...' : 'Search by formulation, compound, dosage (e.g. 5mg)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              color: '#0f172a',
              width: '100%',
              height: '100%'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Format Quick Dropdown Popover */}
        <div style={{ position: 'relative', flex: '0 1 auto' }}>
          <button
            type="button"
            onClick={() => setIsFormatDropdownOpen(prev => !prev)}
            style={{
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isFormatActive ? '#eff6ff' : '#ffffff',
              border: isFormatActive ? '1.5px solid #003666' : '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0 12px',
              cursor: 'pointer',
              fontSize: '0.80rem',
              fontWeight: 700,
              color: isFormatActive ? '#003666' : '#334155',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{formatButtonLabel()}</span>
            <ChevronDown size={14} color="#64748b" style={{ transform: isFormatDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>

          {isFormatDropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                onClick={() => setIsFormatDropdownOpen(false)}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
                padding: '6px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <div style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Filter by Format
                </div>

                {[
                  { id: 'all', label: 'All Formats', action: () => { setPackagingMode('all'); setDosageFilter('all'); setRouteFilter('all'); } },
                  { id: 'high_dose', label: 'High Dose (≥10mg)', action: () => setDosageFilter(dosageFilter === 'high_dose' ? 'all' : 'high_dose') },
                  { id: 'vials', label: '💉 Lyophilized Vials', action: () => setPackagingMode(packagingMode === 'vials' ? 'all' : 'vials') },
                  { id: 'pens', label: '🖊️ Pre-filled Pens', action: () => setPackagingMode(packagingMode === 'pens' ? 'all' : 'pens') },
                  { id: 'sprays', label: '👃 Nasal Sprays', action: () => setPackagingMode(packagingMode === 'sprays' ? 'all' : 'sprays') },
                  { id: 'oral', label: '💊 Oral Formulations', action: () => setPackagingMode(packagingMode === 'oral' ? 'all' : 'oral') },
                  { id: 'kits', label: '📦 10-Vial Kits', action: () => setPackagingMode(packagingMode === 'kits' ? 'all' : 'kits') },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { item.action(); setIsFormatDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Mobile Filter Button (< 1024px) */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="catalog-mobile-only-filter-btn"
          style={{
            height: '40px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: activeFacetsCount > 0 ? '#eff6ff' : '#ffffff',
            border: activeFacetsCount > 0 ? '1.5px solid #003666' : '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 12px',
            fontSize: '0.80rem',
            fontWeight: 700,
            color: activeFacetsCount > 0 ? '#003666' : '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
          }}
          title="Open Clinical Goals and FDA Regulatory Status filters"
        >
          <Filter size={14} color="#003666" />
          <span>Goals & FDA</span>
          {activeFacetsCount > 0 && (
            <span style={{
              background: '#003666',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '9999px'
            }}>
              {activeFacetsCount}
            </span>
          )}
        </button>

      </div>

      {/* ── Active Filter Chips Strip ── */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 0',
          fontSize: '0.76rem'
        }}>
          <span style={{ color: '#64748b', fontWeight: 800, fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '2px' }}>
            Active:
          </span>

          {searchQuery && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontWeight: 600
            }}>
              🔍 &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

          {selectedGoals && selectedGoals.map(gId => {
            const label = availableGoals.find(g => g.id === gId)?.label || gId;
            return (
              <span key={gId} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#eff6ff',
                color: '#003666',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                fontWeight: 700
              }}>
                🎯 {label}
                <button
                  type="button"
                  onClick={() => toggleGoal(gId)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#003666', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            );
          })}

          {isFdaActive && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              fontWeight: 700
            }}>
              🏛️ FDA: {FDA_LABELS[fdaFilter] || fdaFilter}
              <button
                type="button"
                onClick={() => setFdaFilter('all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

          {dosageFilter === 'high_dose' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              fontWeight: 600
            }}>
              💪 High Dose (≥10mg)
              <button
                type="button"
                onClick={() => setDosageFilter('all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15803d', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

          {packagingMode !== 'all' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              fontWeight: 600
            }}>
              📦 Format: {packagingMode}
              <button
                type="button"
                onClick={() => setPackagingMode('all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15803d', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            style={{
              border: 'none',
              background: 'none',
              color: '#dc2626',
              fontWeight: 700,
              fontSize: '0.74rem',
              cursor: 'pointer',
              marginLeft: '4px',
              padding: '2px 4px',
              textDecoration: 'underline'
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Sub-bar: Result count & List/Cards toggle ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        paddingTop: '2px'
      }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          Showing <strong>{displayedProducts.length}</strong> of <strong>{products.length}</strong> formulations
        </div>

        {setViewMode && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '2px',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#003666' : '#64748b',
                fontWeight: viewMode === 'list' ? 800 : 600,
                fontSize: '0.74rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
              title="Compact list view"
            >
              <List size={13} />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#003666' : '#64748b',
                fontWeight: viewMode === 'cards' ? 800 : 600,
                fontSize: '0.74rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
              title="Cards grid view"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
