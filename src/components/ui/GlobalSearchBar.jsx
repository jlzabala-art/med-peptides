"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Search, X, Command, Loader, Clock, ChevronDown } from '@/lib/icons';

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
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`atlas-search-${namespace}`) || '[]');
    } catch {
      return [];
    }
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState(null); // For filter dropdowns

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
      } catch {}
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
    } catch {}
    setShowDropdown(false);
  }, [namespace]);

  const sizeConfig = {
    sm: { height: '34px', fontSize: '0.8rem',  iconSize: 15 },
    md: { height: '40px', fontSize: '0.875rem', iconSize: 17 },
    lg: { height: '48px', fontSize: '0.95rem',  iconSize: 20 },
  };
  const { height, fontSize, iconSize } = sizeConfig[size] || sizeConfig.md;

  const hasActiveFilters = filters && filters.length > 0;
  const hasFilterOptions  = filterOptions && filterOptions.length > 0;

  return (
    <div className="search-bar-wrap" style={{ width: '100%' }}>
      <style>{`
        /* ── Input wrapper ──────────────────────────────────────── */
        .atlas-search__input-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          height: ${height};
          padding: 0 0.75rem;
          border-radius: ${hasActiveFilters ? '10px 10px 0 0' : '10px'};
          border: 1.5px solid var(--border, #e2e8f0);
          border-bottom: ${hasActiveFilters ? '1px solid var(--border, #e2e8f0)' : '1.5px solid var(--border, #e2e8f0)'};
          background: var(--color-bg-app, #fff);
          transition: all 0.2s ease;
          cursor: text;
          position: relative;
        }
        .atlas-search__input-wrap:hover {
          border-color: var(--primary-soft, #93c5fd);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .atlas-search__input-wrap.focused {
          border-color: var(--primary, #2563eb);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          background: #fff;
        }
        /* ── Text input ─────────────────────────────────────────── */
        .atlas-search__input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: ${fontSize};
          color: var(--text-main, #0f172a);
          min-width: 0;
        }
        .atlas-search__input::placeholder { color: var(--text-muted, #94a3b8); }
        /* ── Count badge ────────────────────────────────────────── */
        .atlas-search__count {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--primary, #2563eb);
          background: var(--primary-soft, #eff6ff);
          padding: 2px 8px;
          border-radius: 100px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        /* ── ⌘K shortcut badge ──────────────────────────────────── */
        .atlas-search__shortcut {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 0.7rem;
          color: var(--text-muted, #94a3b8);
          background: var(--color-bg-subtle, #f8fafc);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 5px;
          padding: 2px 5px;
          flex-shrink: 0;
          cursor: pointer;
          user-select: none;
        }
        .atlas-search__shortcut:hover { border-color: var(--primary-soft, #93c5fd); }
        /* ── Clear button ───────────────────────────────────────── */
        .atlas-search__clear {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: var(--text-muted, #94a3b8);
          display: flex;
          align-items: center;
          border-radius: 50%;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .atlas-search__clear:hover {
          background: var(--color-bg-subtle, #f1f5f9);
          color: var(--text-main, #0f172a);
        }
        /* ── Recent searches dropdown ──────────────────────────── */
        .atlas-search__dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--color-bg-app, #fff);
          border: 1.5px solid var(--border, #e2e8f0);
          border-radius: 10px;
          box-shadow: 0 8px 24px -4px rgba(0,0,0,0.12);
          z-index: 100;
          overflow: hidden;
          animation: searchDropdownIn 0.15s ease;
        }
        @keyframes searchDropdownIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .atlas-search__dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
          color: var(--text-main, #0f172a);
          cursor: pointer;
          transition: background 0.1s;
        }
        .atlas-search__dropdown-item:hover { background: var(--color-bg-subtle, #f8fafc); }
        /* ── Spinner ────────────────────────────────────────────── */
        .atlas-search__spinner { animation: spin 0.8s linear infinite; flex-shrink: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        /* ── Active filter chips zone ──────────────────────────── */
        .atlas-search__chips-zone {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0.5rem 0.75rem 0.6rem;
          border: 1.5px solid var(--primary, #2563eb);
          border-top: none;
          border-radius: 0 0 10px 10px;
          background: var(--color-bg-app, #fff);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.07);
          animation: chipsIn 0.15s ease;
        }
        @keyframes chipsIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .atlas-search__chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.55rem;
          background: rgba(37, 99, 235, 0.08);
          color: #1d4ed8;
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: default;
          transition: background 0.15s;
        }
        .atlas-search__chip:hover { background: rgba(37, 99, 235, 0.13); }
        .atlas-search__chip-label { color: #64748b; font-weight: 500; margin-right: 1px; }
        .atlas-search__chip-remove {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #60a5fa;
          display: flex;
          align-items: center;
          border-radius: 50%;
          transition: color 0.1s;
          line-height: 1;
        }
        .atlas-search__chip-remove:hover { color: #1d4ed8; }
        /* ── Inline quick-filter pills ─────────────────────────── */
        .atlas-search__filter-pill {
          position: relative;
          flex-shrink: 0;
        }
        .atlas-search__filter-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.55rem;
          background: var(--color-bg-subtle, #f8fafc);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-main, #334155);
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s, background 0.15s;
          user-select: none;
        }
        .atlas-search__filter-pill-btn:hover,
        .atlas-search__filter-pill-btn.active {
          border-color: var(--primary, #2563eb);
          color: #1d4ed8;
          background: rgba(37,99,235,0.06);
        }
        .atlas-search__filter-pill-menu {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          min-width: 140px;
          background: var(--color-bg-app, #fff);
          border: 1.5px solid var(--border, #e2e8f0);
          border-radius: 8px;
          box-shadow: 0 6px 20px -4px rgba(0,0,0,0.1);
          z-index: 200;
          overflow: hidden;
          animation: searchDropdownIn 0.12s ease;
        }
        .atlas-search__filter-pill-option {
          padding: 0.55rem 0.85rem;
          font-size: 0.8rem;
          color: var(--text-main, #334155);
          cursor: pointer;
          transition: background 0.1s;
        }
        .atlas-search__filter-pill-option:hover { background: var(--color-bg-subtle, #f8fafc); }
        .atlas-search__filter-pill-option.selected {
          color: var(--primary, #2563eb);
          font-weight: 600;
          background: rgba(37,99,235,0.05);
        }
        /* ── Divider between input and filter pills ─────────────── */
        .atlas-search__divider {
          width: 1px;
          height: 18px;
          background: var(--border, #e2e8f0);
          flex-shrink: 0;
        }
        
        /* ── Mobile responsiveness ──────────────────────────────── */
        @media (max-width: 768px) {
          .atlas-search__filter-pill-btn {
            font-size: 0;
            padding: 0.3rem;
            gap: 0;
            border-radius: 6px;
          }
          .atlas-search__filter-pill-btn svg {
            margin: 0 0.15rem;
          }
          .atlas-search__count {
            display: none;
          }
          .atlas-search__shortcut {
            display: none;
          }
          .atlas-search__chips-zone {
            padding: 0.5rem;
            font-size: 0.65rem;
          }
        }
      `}</style>

      {/* ── Main container ──────────────────────────────────────────────── */}
      <div className={`atlas-search ${className}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>

        {/* ── INPUT ROW ──────────────────────────────────────────────────── */}
        <div
          className={`atlas-search__input-wrap ${isFocused ? 'focused' : ''}`}
          style={{ borderRadius: hasActiveFilters ? '10px 10px 0 0' : '10px' }}
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
              {filterOptions.map((fo) => (
                <div key={fo.key} className="atlas-search__filter-pill">
                  <button
                    className={`atlas-search__filter-pill-btn ${fo.value ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenFilterKey(openFilterKey === fo.key ? null : fo.key);
                    }}
                  >
                    {fo.value
                      ? (fo.options?.find(o => o.value === fo.value)?.label || fo.label)
                      : fo.label}
                    <ChevronDown size={10} />
                  </button>
                  {openFilterKey === fo.key && fo.options && (
                    <div className="atlas-search__filter-pill-menu">
                      {fo.options.map((opt) => (
                        <div
                          key={opt.value}
                          className={`atlas-search__filter-pill-option ${fo.value === opt.value ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            fo.onChange?.(opt.value);
                            setOpenFilterKey(null);
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
              Filtros:
            </span>
            {filters.map((filter) => filter && (
              <span key={filter.key} className="atlas-search__chip">
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
    </div>
  );
}
