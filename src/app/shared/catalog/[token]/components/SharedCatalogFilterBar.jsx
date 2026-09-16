'use client';

import React from 'react';
import { Search, Filter, ChevronDown, ClipboardList } from 'lucide-react';

/**
 * SharedCatalogFilterBar — Search box, Goals multi-select, Format/Packaging dropdown,
 * protocol filter chips, and result count indicator.
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
  // Protocol chips
  protocols,
  productsWithProtocolsCount,
  onlyWithProtocols,
  setOnlyWithProtocols,
  showProtocolsUnderProducts,
  setShowProtocolsUnderProducts,
  // Result count
  displayedProducts,
}) {
  return (
    <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  right: 0,
                  width: '320px',
                  maxWidth: '92vw',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  zIndex: 1000,
                  padding: '10px',
                  maxHeight: '380px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 8px', borderBottom: '1px solid #f1f5f9', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Clinical Goals (Multi-Select)
                    </span>
                    {selectedGoals.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => clearGoals()}
                        style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Reset All
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Select one or more</span>
                    )}
                  </div>

                  <div
                    onClick={() => clearGoals()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedGoals.length === 0 ? '#f0fdf4' : 'transparent',
                      marginBottom: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: selectedGoals.length === 0 ? 800 : 600, color: selectedGoals.length === 0 ? '#15803d' : '#1e293b' }}>
                      ✨ All Clinical Goals
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({products.length})</span>
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
                          transition: 'background 0.12s ease',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ accentColor: '#003666', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                          />
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: isChecked ? 700 : 500,
                            color: isChecked ? '#1e40af' : '#1e293b',
                            lineHeight: 1.3,
                            wordBreak: 'break-word'
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

          {/* Format & Packaging Dropdown */}
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
                backgroundColor: (packagingMode !== 'all' || dosageFilter === 'high_dose') ? '#f0fdf4' : '#ffffff',
                border: (packagingMode !== 'all' || dosageFilter === 'high_dose') ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 12px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {dosageFilter === 'high_dose' ? '💪' : packagingMode === 'kits' ? '📦' : packagingMode === 'units' ? '🧪' : '✨'}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: (packagingMode !== 'all' || dosageFilter === 'high_dose') ? '#15803d' : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {dosageFilter === 'high_dose'
                    ? 'High Dose (≥10mg)'
                    : packagingMode === 'kits'
                    ? '10-Vial Kits'
                    : packagingMode === 'units'
                    ? 'Single Vials (1–9)'
                    : 'All Formats & Kits'}
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
                  width: '270px',
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
                      Format & Presentation
                    </span>
                  </div>

                  {[
                    { id: 'all', label: 'All Formats', icon: '✨', desc: 'Single vials & 10-vial kits' },
                    { id: 'kits', label: '10-Vial Kits', icon: '📦', desc: 'Bulk volume best savings' },
                    { id: 'units', label: 'Single Vials (1–9)', icon: '🧪', desc: 'Individual test vials' },
                    { id: 'high_dose', label: 'High Dose (≥10mg)', icon: '💪', desc: 'Concentrated formulations' },
                  ].map(opt => {
                    const isSelected = opt.id === 'high_dose'
                      ? dosageFilter === 'high_dose'
                      : (packagingMode === opt.id && dosageFilter !== 'high_dose');
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (opt.id === 'high_dose') {
                            setDosageFilter('high_dose');
                            setPackagingMode('all');
                          } else {
                            setDosageFilter('all');
                            setPackagingMode(opt.id);
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Formulations count indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '2px' }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          Showing {displayedProducts.length} of {products.length} formulations
        </div>
      </div>
    </div>
  );
}
