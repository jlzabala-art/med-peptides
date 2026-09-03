"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Search, X, Command, Loader, Clock, ChevronDown, Filter } from '@/lib/icons';
import '../../styles/search.css';
import MultiSelectFilter from './MultiSelectFilter';
import SingleSelectFilter from './SingleSelectFilter';
import MobileFiltersSheet from '../mobile/MobileFiltersSheet';

/**
 * GlobalSearchBar
 * ─────────────────────────────────────────────────────────────────────────────
 * A premium, modular search bar component. Designed to be visually prominent
 * and used across ALL modules as the FIRST element users see (Golden Rule #7).
 *
 * Features:
 * - ⌘K / Ctrl+K keyboard shortcut to focus
 * - Recent searches stored in localStorage per namespace
 * - Instant feedback with debouncing
 * - Result count badge
 * - Loading/searching state
 * - Clear button (×) and Escape key
 * - Integrated filter chips/pills (prop: `filters`) — visually attached below input
 * - Configurable placeholder, size, and namespace
 *
 * @param {string}    value           — Controlled search term value
 * @param {Function}  onChange        — Called on every keystroke with the new term
 * @param {string}    placeholder     — Input placeholder text
 * @param {number}    resultCount     — If set, shows a "N results" badge
 * @param {boolean}   isLoading       — Shows a spinner if true
 * @param {string}    namespace       — Key for localStorage recent searches (e.g. 'products')
 * @param {string}    size            — 'sm' | 'md' | 'lg'. Default: 'md'
 * @param {boolean}   showShortcut    — Show ⌘K hint. Default: true
 * @param {boolean}   showRecent      — Show recent searches dropdown. Default: true
 * @param {string}    className       — Extra CSS class
 * @param {Function}  onFocus         — Called when input is focused
 * @param {Function}  onBlur          — Called when input is blurred
 *
 * @param {Array}     filters         — Active filter chips to display below the bar.
 *   Each filter: { key: string, label: string, value: string, onRemove: () => void }
 *   Example: [{ key: 'status', label: 'Estado', value: 'Activo', onRemove: () => setStatus(null) }]
 *
 * @param {Array}     filterOptions   — Optional quick-filter buttons shown inside the bar to the right.
 *   Each option: { key: string, label: string, options: [{label, value}], value: any, onChange: (val) => void }
 *   Renders as compact dropdown pills inside the search bar row.
 *
 * @example — Main module usage:
 * <GlobalSearchBar
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Search clients, status, email..."
 *   resultCount={totalClients}
 *   namespace="admin-clients"
 *   size="lg"
 *   filters={[
 *     statusFilter && { key: 'status', label: 'Estado', value: statusFilter, onRemove: () => setStatusFilter(null) }
 *   ].filter(Boolean)}
 *   filterOptions={[
 *     { key: 'status', label: 'Estado', options: [{label:'Todos',value:''},{label:'Activo',value:'active'}], value: statusFilter, onChange: setStatusFilter }
 *   ]}
 * />
 */
export default function GlobalSearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  resultCount,
  isLoading = false,
  namespace = 'global',
  size = 'md',
  showShortcut = true,
  showRecent = true,
  className = '',
  onFocus,
  onBlur,
  // Integrated filters (Golden Rule #7)
  filters = [],          // Active filter chips rendered below the bar
  filterOptions = [],    // Quick-filter dropdowns rendered inside the bar
}) {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`atlas-search-${namespace}`) || '[]');
    } catch {
      return [];
    }
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState(null); // For filter dropdowns

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ⌘K / Ctrl+K global shortcut to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.atlas-search__filter-pill')) {
        setOpenFilterKey(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (showRecent && recentSearches.length > 0 && !value) {
      setShowDropdown(true);
    }
    onFocus?.();
  }, [recentSearches, value, showRecent, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => setShowDropdown(false), 150);
    onBlur?.();
  }, [onBlur]);

  const handleChange = useCallback(
    (e) => {
      const term = e.target.value;
      onChange?.(term);
      setShowDropdown(showRecent && !term && recentSearches.length > 0);
    },
    [onChange, showRecent, recentSearches]
  );

  const handleClear = useCallback(() => {
    onChange?.('');
    inputRef.current?.focus();
    if (showRecent && recentSearches.length > 0) {
      setShowDropdown(true);
    }
  }, [onChange, showRecent, recentSearches]);

  const saveRecentSearch = useCallback(
    (term) => {
      if (!term || !term.trim()) return;
      const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem(`atlas-search-${namespace}`, JSON.stringify(updated));
      } catch (err) {
        console.debug('Failed to save recent search:', err);
      }
    },
    [recentSearches, namespace]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && value.trim()) {
        saveRecentSearch(value.trim());
        setShowDropdown(false);
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [value, saveRecentSearch, handleClear]
  );

  const handleRecentClick = useCallback(
    (term) => {
      onChange?.(term);
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [onChange]
  );

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(`atlas-search-${namespace}`);
    } catch (err) {
      console.debug('Failed to clear recent searches:', err);
    }
    setShowDropdown(false);
  }, [namespace]);

  const sizeConfig = {
    sm: { height: '34px', fontSize: '0.8rem',  iconSize: 15 },
    md: { height: '40px', fontSize: '0.875rem', iconSize: 17 },
    lg: { height: '48px', fontSize: '0.95rem',  iconSize: 20 },
  };
  const { height, iconSize } = sizeConfig[size] || sizeConfig.md;

  const hasActiveFilters = filters && filters.length > 0;
  const hasFilterOptions  = filterOptions && filterOptions.length > 0;

  return (
    <>
      <div className={`search-bar-wrap atlas-search-size-${size} ${className}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>

        {/* ── INPUT ROW ──────────────────────────────────────────────────── */}
        <div
          className={`atlas-search__input-wrap ${isFocused ? 'focused' : ''} ${hasActiveFilters ? 'has-active-filters' : ''}`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Search icon / spinner */}
          {isLoading ? (
            <Loader size={iconSize} color="var(--primary, #2563eb)" className="atlas-search__spinner" />
          ) : (
            <Search size={iconSize} color={isFocused ? 'var(--primary, #2563eb)' : 'var(--text-muted, #94a3b8)'} />
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            className="atlas-search__input"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Result count badge */}
          {resultCount !== undefined && !isLoading && (
            <span className="atlas-search__count">
              {resultCount.toLocaleString()} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}

          {/* Clear button */}
          {value && (
            <button className="atlas-search__clear" onClick={handleClear} title="Clear search (Esc)">
              <X size={14} />
            </button>
          )}

          {/* ── Quick-filter inline pills (separated by a divider) ── */}
          {hasFilterOptions && (
            <>
              <div className="atlas-search__divider" />
              {isMobile ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileSheetOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    backgroundColor: hasActiveFilters ? '#eff6ff' : '#f1f5f9',
                    border: hasActiveFilters ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                    color: hasActiveFilters ? '#1e40af' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Filter size={13} color={hasActiveFilters ? '#1e40af' : '#64748b'} />
                  <span>Filters</span>
                  {filters.length > 0 && (
                    <span style={{
                      background: '#2563eb',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem'
                    }}>
                      {filters.length}
                    </span>
                  )}
                </button>
              ) : (
                filterOptions.map((fo, idx) => {
                  const uniqueKey = fo.id || fo.key || fo.label || `fo-${idx}`;

                  // Multi-select mode — uses MultiSelectFilter component
                  if (fo.multiSelect) {
                    return (
                      <MultiSelectFilter
                        key={uniqueKey}
                        label={fo.label}
                        values={fo.values || []}
                        options={fo.options || []}
                        onChange={fo.onChange}
                        maxWidth={fo.maxWidth || 240}
                      />
                    );
                  }

                  // Modern single-select pill with portal & micro-badges
                  return (
                    <SingleSelectFilter
                      key={uniqueKey}
                      label={fo.label}
                      value={fo.value || ''}
                      options={fo.options || []}
                      onChange={fo.onChange}
                      maxWidth={fo.maxWidth || 200}
                    />
                  );
                })
              )}
            </>
          )}

          {/* ⌘K shortcut hint */}
          {showShortcut && !value && !isFocused && !hasFilterOptions && (
            <span
              className="atlas-search__shortcut"
              onClick={() => inputRef.current?.focus()}
              title="Press ⌘K or Ctrl+K to search"
            >
              <Command size={10} />K
            </span>
          )}
        </div>

        {/* ── ACTIVE FILTER CHIPS ZONE (attached below input) ──────────── */}
        {hasActiveFilters && (
          <div
            className="atlas-search__chips-zone"
            style={{ position: 'absolute', top: height, left: 0, right: 0, zIndex: 10 }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem', flexShrink: 0 }}>
              ACTIVE FILTERS:
            </span>
            {filters.map((filter, idx) => filter && (
              <span key={filter.key || filter.id || `filter-${idx}`} className="atlas-search__chip">
                {filter.label && <span className="atlas-search__chip-label">{filter.label}:</span>}
                {filter.value}
                {filter.onRemove && (
                  <button className="atlas-search__chip-remove" onClick={filter.onRemove} title={`Remove ${filter.label} filter`}>
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* ── RECENT SEARCHES DROPDOWN ──────────────────────────────────── */}
        {showDropdown && showRecent && recentSearches.length > 0 && (
          <div className="atlas-search__dropdown">
            <div style={{ padding: '0.5rem 1rem 0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Searches
              </span>
              <button style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={clearRecent}>
                Clear all
              </button>
            </div>
            {recentSearches.map((term, i) => (
              <div key={i} className="atlas-search__dropdown-item" onClick={() => handleRecentClick(term)}>
                <Clock size={13} color="var(--text-muted)" />
                {term}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spacer so content below accounts for the chips zone height */}
      {hasActiveFilters && <div style={{ height: '38px' }} />}

      {/* Mobile Filters Bottom Sheet */}
      {isMobile && hasFilterOptions && (
        <MobileFiltersSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          filterOptions={filterOptions}
          activeFilters={filters}
          onResetAll={() => {
            filters.forEach(f => f?.onRemove?.());
            filterOptions.forEach(fo => {
              if (fo.multiSelect) fo.onChange?.([]);
              else fo.onChange?.('');
            });
            setIsMobileSheetOpen(false);
          }}
        />
      )}
    </>
  );
}
