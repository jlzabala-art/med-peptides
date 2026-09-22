'use client';

import React from 'react';
import { Search, Filter, ChevronDown, ClipboardList, List, LayoutGrid, ShieldCheck } from 'lucide-react';
import { getFdaPeptideStatus, FDA_STATUS_TYPES } from '@/data/fdaPeptidesRegistry';

/** Compact inline FDA emblem — 18×16 SVG that mirrors the FDA wordmark style */
const FdaEmblem = ({ size = 18, color = '#1d4ed8' }) => (
  <svg width={size} height={Math.round(size * 0.88)} viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="FDA" role="img" style={{ flexShrink: 0 }}>
    <rect width="36" height="32" rx="4" fill={color} />
    <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontWeight="900"
      fontSize="14"
      letterSpacing="0.5"
      fill="#ffffff"
    >FDA</text>
  </svg>
);


/**
 * SharedCatalogFilterBar — Search box, Goals multi-select, Format/Packaging dropdown,
 * FDA Status dropdown, protocol filter chips, and result count indicator.
 */
export default function SharedCatalogFilterBar({
  searchQuery,
  setSearchQuery,
  // Goals dropdown
  isGoalDropdownOpen,
  setIsGoalDropdownOpen,
  selectedGoals,
  clearGoals,
  availableGoals,
  toggleGoal,
  products,
  // Format dropdown
  isFormatDropdownOpen,
  setIsFormatDropdownOpen,
  packagingMode,
  setPackagingMode,
  dosageFilter,
  setDosageFilter,
  routeFilter = 'all',
  setRouteFilter,
  // FDA Status dropdown
  fdaFilter = 'all',
  setFdaFilter,
  // Protocol chips
  protocols,
  productsWithProtocolsCount,
  onlyWithProtocols,
  setOnlyWithProtocols,
  showProtocolsUnderProducts,
  setShowProtocolsUnderProducts,
  // Result count
  displayedProducts,
  // Dual view mode
  viewMode = 'list',
  setViewMode,
}) {
  const ROUTE_LABELS = {
    injectable: { label: 'Injectable / SubQ', icon: '💉' },
    nasal:      { label: 'Nasal Spray', icon: '👃' },
    oral:       { label: 'Oral / Capsules', icon: '💊' },
    topical:    { label: 'Topical / Hair', icon: '💧' },
  };

  const [isFdaDropdownOpen, setIsFdaDropdownOpen] = React.useState(false);

  const FDA_OPTIONS = [
    { id: 'all',                          label: 'All Regulatory Profiles',      icon: '🌐', desc: 'All evaluated & standard peptides' },
    { id: 'fda_approved',                 label: 'FDA Approved APIs',            icon: '🏛️', desc: 'Approved NDA/ANDA ingredients (GLP-1, etc.)' },
    { id: 'fda_pcac_503a_recommended',    label: '503A PCAC Recommended',       icon: '🛡️', desc: 'July 2026 PCAC Bulks List evaluation' },
    { id: 'clinical_investigational',     label: 'Clinical Investigational (IND)',icon: '🔬', desc: 'Active clinical IND trials (Retatrutide, etc.)' },
    { id: 'research_analytical_standard', label: 'Analytical Reference Standards',icon: '⚗️', desc: 'High-purity characterization standards' },
  ];

  const fdaStatusCounts = React.useMemo(() => {
    const counts = {
      all: (products || []).length,
      fda_approved: 0,
      fda_pcac_503a_recommended: 0,
      clinical_investigational: 0,
      research_analytical_standard: 0
    };
    (products || []).forEach(p => {
      const st = getFdaPeptideStatus(p)?.status;
      if (st && counts[st] !== undefined) {
        counts[st]++;
      }
    });
    return counts;
  }, [products]);

  const fdaButtonLabel = () => {
    const opt = FDA_OPTIONS.find(o => o.id === fdaFilter);
    if (fdaFilter && fdaFilter !== 'all' && opt) {
      return opt.label;
    }
    return 'FDA Regulatory Status';
  };

  const fdaButtonIcon = () => {
    const opt = FDA_OPTIONS.find(o => o.id === fdaFilter);
    if (fdaFilter && fdaFilter !== 'all' && opt) {
      // Show the category emoji when a specific filter is active
      return <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{opt.icon}</span>;
    }
    // Default: show the FDA badge emblem
    return <FdaEmblem size={18} color={isFdaActive ? '#1d4ed8' : '#475569'} />;
  };

  const isFdaActive = fdaFilter && fdaFilter !== 'all';

  const hasActiveFilters = Boolean(
    searchQuery ||
    (selectedGoals && selectedGoals.length > 0) ||
    packagingMode !== 'all' ||
    dosageFilter !== 'all' ||
    (routeFilter && routeFilter !== 'all') ||
    isFdaActive ||
    onlyWithProtocols
  );

  const handleClearAll = () => {
    if (setSearchQuery) setSearchQuery('');
    if (clearGoals) clearGoals();
    if (setPackagingMode) setPackagingMode('all');
    if (setDosageFilter) setDosageFilter('all');
    if (setRouteFilter) setRouteFilter('all');
    if (setFdaFilter) setFdaFilter('all');
    if (setOnlyWithProtocols) setOnlyWithProtocols(false);
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
    return 'All Peptide Formats';
  };

  const formatButtonIcon = () => {
    if (dosageFilter === 'high_dose') return '💪';
    if (packagingMode === 'vials') return '🧪';
    if (packagingMode === 'pens') return '💉';
    if (packagingMode === 'sprays') return '💨';
    if (packagingMode === 'oral') return '💊';
    if (packagingMode === 'kits') return '📦';
    if (packagingMode === 'units') return '🧪';
    if (routeFilter && routeFilter !== 'all' && ROUTE_LABELS[routeFilter]) {
      return ROUTE_LABELS[routeFilter].icon;
    }
    return '✨';
  };

  const isFormatActive = packagingMode !== 'all' || dosageFilter === 'high_dose' || (routeFilter && routeFilter !== 'all');

  return (
    <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="catalog-filter-row">
        {/* Search Input */}
        <div className="catalog-search-box" style={{ flex: '1 1 260px' }}>
          <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by product, active compound, dosage (e.g. 5mg)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              color: '#0f172a',
              width: '100%',
              height: '100%'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mobile 2-column Dropdowns Row (Goals + Formats) */}
        <div className="catalog-dropdowns-row">
          {/* Goals Multi-Select Popover */}
          <div className="category-dropdown-container" style={{ position: 'relative', flex: '0 1 290px', minWidth: '220px', boxSizing: 'border-box' }}>
            <button
              type="button"
              onClick={() => setIsGoalDropdownOpen(prev => !prev)}
              style={{
                width: '100%',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                backgroundColor: selectedGoals.length > 0 ? '#eff6ff' : '#ffffff',
                border: selectedGoals.length > 0 ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 12px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Filter size={15} color={selectedGoals.length > 0 ? '#1d4ed8' : '#0284c7'} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: selectedGoals.length > 0 ? '#1e40af' : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {selectedGoals.length === 0
                    ? `All Clinical Goals (${products.length})`
                    : selectedGoals.length === 1
                    ? `${availableGoals.find(g => g.id === selectedGoals[0])?.label || selectedGoals[0]}`
                    : `${selectedGoals.length} Goals Selected`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {selectedGoals.length > 0 && (
                  <span style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {selectedGoals.length}
                  </span>
                )}
                <ChevronDown size={14} color="#64748b" style={{ transform: isGoalDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </div>
            </button>

            {isGoalDropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                  onClick={() => setIsGoalDropdownOpen(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  left: 0,
                  width: '320px',
                  maxWidth: '92vw',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  zIndex: 1000,
                  padding: '8px',
                  maxHeight: '380px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Filter by Clinical Goal
                    </span>
                    {selectedGoals.length > 0 && (
                      <button
                        type="button"
                        onClick={clearGoals}
                        style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => { clearGoals(); setIsGoalDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedGoals.length === 0 ? '#eff6ff' : 'transparent',
                      transition: 'background 0.12s ease',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>🌐</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: selectedGoals.length === 0 ? 800 : 500, color: selectedGoals.length === 0 ? '#1d4ed8' : '#334155' }}>
                        All Clinical Goals
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: selectedGoals.length === 0 ? '#2563eb' : '#64748b',
                      backgroundColor: selectedGoals.length === 0 ? '#dbeafe' : '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '6px'
                    }}>
                      {products.length}
                    </span>
                  </div>

                  {availableGoals?.map(goal => {
                    const isChecked = selectedGoals.includes(goal.id);
                    return (
                      <div
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isChecked ? '#eff6ff' : 'transparent',
                          transition: 'background 0.12s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                          />
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: isChecked ? 700 : 500,
                            color: isChecked ? '#1e40af' : '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {goal.label}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isChecked ? '#2563eb' : '#64748b',
                          backgroundColor: isChecked ? '#dbeafe' : '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          flexShrink: 0
                        }}>
                          {goal.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Format, Packaging & Route Dropdown */}
          <div className="format-dropdown-container" style={{ position: 'relative', flex: '0 1 240px', minWidth: '200px', boxSizing: 'border-box' }}>
            <button
              type="button"
              onClick={() => setIsFormatDropdownOpen(prev => !prev)}
              style={{
                width: '100%',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                backgroundColor: isFormatActive ? '#f0fdf4' : '#ffffff',
                border: isFormatActive ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 12px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {formatButtonIcon()}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: isFormatActive ? '#15803d' : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {formatButtonLabel()}
                </span>
              </div>
              <ChevronDown size={14} color="#64748b" style={{ transform: isFormatDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
            </button>

            {isFormatDropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                  onClick={() => setIsFormatDropdownOpen(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '275px',
                  maxWidth: '92vw',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  zIndex: 1000,
                  padding: '8px',
                }}>
                  <div style={{ padding: '4px 8px 6px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Peptide Presentation & Format
                    </span>
                  </div>

                  {[
                    { id: 'all',       label: 'All Peptide Formats',         icon: '✨', desc: 'Every presentation & delivery system' },
                    { id: 'vials',     label: 'Lyophilized Vials',            icon: '🧪', desc: 'Single lyophilized injection vials' },
                    { id: 'pens',      label: 'Pre-filled Pens & Cartridges', icon: '💉', desc: 'Dial pens & 3 mL refill cartridges' },
                    { id: 'sprays',    label: 'Nasal Sprays',                icon: '💨', desc: 'Metered mucosal actuation pumps' },
                    { id: 'oral',      label: 'Oral & Sublingual',            icon: '💊', desc: 'Enteric capsules and oral tablets' },
                    { id: 'kits',      label: '10-Vial Multi-Kits',           icon: '📦', desc: 'Volume multi-packs with savings' },
                    { id: 'high_dose', label: 'High Dose (≥10mg)',            icon: '💪', desc: 'High-concentration peptide strength' },
                  ].map(opt => {
                    const isSelected = opt.id === 'high_dose'
                      ? dosageFilter === 'high_dose'
                      : (packagingMode === opt.id && dosageFilter !== 'high_dose' && (!routeFilter || routeFilter === 'all'));
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (opt.id === 'high_dose') {
                            setDosageFilter('high_dose');
                            setPackagingMode('all');
                            if (setRouteFilter) setRouteFilter('all');
                          } else {
                            setDosageFilter('all');
                            setPackagingMode(opt.id);
                            if (setRouteFilter) setRouteFilter('all');
                          }
                          setIsFormatDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                          transition: 'background 0.12s ease',
                          marginBottom: '2px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.95rem' }}>{opt.icon}</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#15803d' : '#1e293b' }}>
                              {opt.label}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              {opt.desc}
                            </span>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.82rem' }}>✓</span>}
                      </div>
                    );
                  })}

                  {/* Route of Administration Section */}
                  {setRouteFilter && (
                    <>
                      <div style={{ padding: '6px 8px 4px', borderTop: '1px solid #f1f5f9', marginTop: '4px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Administration Route
                        </span>
                      </div>
                      {[
                        { id: 'injectable', label: 'Injectable / SubQ', icon: '💉', desc: 'Vials, pens & ampoules' },
                        { id: 'nasal',      label: 'Nasal Spray',     icon: '👃', desc: 'Intranasal delivery' },
                        { id: 'oral',       label: 'Oral / Capsules', icon: '💊', desc: 'Oral peptide tablets' },
                        { id: 'topical',    label: 'Topical / Hair',  icon: '💧', desc: 'Scalp & skin solutions' },
                      ].map(r => {
                        const isSelected = routeFilter === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => {
                              setRouteFilter(isSelected ? 'all' : r.id);
                              setIsFormatDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              transition: 'background 0.12s ease',
                              marginBottom: '2px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.92rem' }}>{r.icon}</span>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.80rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                                  {r.label}
                                </span>
                                <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                                  {r.desc}
                                </span>
                              </div>
                            </div>
                            {isSelected && <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '0.82rem' }}>✓</span>}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* FDA Regulatory Status Dropdown */}
          <div className="fda-dropdown-container" style={{ position: 'relative', flex: '0 1 230px', minWidth: '185px', boxSizing: 'border-box' }}>
            <button
              type="button"
              onClick={() => setIsFdaDropdownOpen(prev => !prev)}
              style={{
                width: '100%',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                backgroundColor: isFdaActive ? '#eff6ff' : '#ffffff',
                border: isFdaActive ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 12px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {fdaButtonIcon()}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: isFdaActive ? '#1d4ed8' : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {fdaButtonLabel()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {isFdaActive && (
                  <span style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {fdaStatusCounts[fdaFilter] || 0}
                  </span>
                )}
                <ChevronDown size={14} color="#64748b" style={{ transform: isFdaDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </div>
            </button>

            {isFdaDropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                  onClick={() => setIsFdaDropdownOpen(false)}
                />
                <div
                  className="fda-dropdown-menu-popover"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    padding: '8px',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px 6px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                    <FdaEmblem size={16} color="#475569" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      FDA Regulatory Status
                    </span>
                    {isFdaActive && (
                      <button
                        type="button"
                        onClick={() => { if (setFdaFilter) setFdaFilter('all'); setIsFdaDropdownOpen(false); }}
                        style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0, marginLeft: 'auto' }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {FDA_OPTIONS.map(opt => {
                    const isSelected = fdaFilter === opt.id || (!fdaFilter && opt.id === 'all');
                    const count = fdaStatusCounts[opt.id] ?? 0;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (setFdaFilter) setFdaFilter(opt.id);
                          setIsFdaDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                          transition: 'background 0.12s ease',
                          marginBottom: '2px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem', flexShrink: 0 }}>{opt.icon}</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                              {opt.label}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              {opt.desc}
                            </span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isSelected ? '#2563eb' : '#64748b',
                          backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          flexShrink: 0
                        }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Active Filters Chips Bar ── */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 0',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginRight: '2px' }}>
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
                color: '#1d4ed8',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                fontWeight: 600
              }}>
                🎯 {label}
                <button
                  type="button"
                  onClick={() => toggleGoal(gId)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            );
          })}

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

          {packagingMode === 'kits' && (
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
              📦 10-Vial Kits
              <button
                type="button"
                onClick={() => setPackagingMode('all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15803d', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

          {packagingMode === 'units' && (
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
              🧪 Single Vials
              <button
                type="button"
                onClick={() => setPackagingMode('all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15803d', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

          {routeFilter && routeFilter !== 'all' && ROUTE_LABELS[routeFilter] && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              fontWeight: 600
            }}>
              {ROUTE_LABELS[routeFilter].icon} {ROUTE_LABELS[routeFilter].label}
              <button
                type="button"
                onClick={() => setRouteFilter('all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

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
              fontWeight: 600
            }}>
              {fdaButtonIcon()} FDA: {fdaButtonLabel()}
              <button
                type="button"
                onClick={() => setFdaFilter('all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          )}

          {onlyWithProtocols && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid #fde68a',
              fontWeight: 600
            }}>
              📋 Has Protocols
              <button
                type="button"
                onClick={() => setOnlyWithProtocols(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b45309', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1 }}
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
              fontSize: '0.75rem',
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

      {/* Formulations count indicator & View Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          Showing <strong>{displayedProducts.length}</strong> of <strong>{products.length}</strong> formulations
        </div>

        {setViewMode && (
          <div className="proto-view-switcher" role="radiogroup" aria-label="Catalog view mode">
            <button
              type="button"
              className={`proto-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Compact list view"
            >
              <List size={13} />
              <span>List</span>
            </button>
            <button
              type="button"
              className={`proto-view-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
              onClick={() => setViewMode('cards')}
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
