import React, { useRef, useEffect, useState, useCallback } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';
import Command from 'lucide-react/dist/esm/icons/command';
import Loader from 'lucide-react/dist/esm/icons/loader';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Clock from 'lucide-react/dist/esm/icons/clock';

/**
 * GlobalSearchBar
 * ─────────────────────────────────────────────────────────────────────────────
 * A premium, modular search bar component. Designed to be visually prominent
 * and used across all modules (Products, Prescriptions, Orders, etc.)
 *
 * Features:
 * - ⌘K / Ctrl+K keyboard shortcut to focus
 * - Recent searches (stored in localStorage per namespace)
 * - Instant feedback with debouncing
 * - Result count badge
 * - Loading state
 * - Clear button
 * - Configurable placeholder, size, and namespace
 *
 * @param {string}   value          — Controlled search term value
 * @param {Function} onChange       — Called on every keystroke with the new term
 * @param {string}   placeholder    — Input placeholder text
 * @param {number}   resultCount    — If set, shows a "N results" badge
 * @param {boolean}  isLoading      — Shows a spinner if true
 * @param {string}   namespace      — Key for localStorage recent searches (e.g. 'products', 'prescriptions')
 * @param {string}   size           — 'sm' | 'md' | 'lg'. Default: 'md'
 * @param {boolean}  showShortcut   — Show ⌘K hint. Default: true on desktop
 * @param {boolean}  showRecent     — Show recent searches dropdown. Default: true
 * @param {string}   className      — Extra CSS class
 * @param {Function} onFocus        — Called when the input is focused
 * @param {Function} onBlur         — Called when the input is blurred
 *
 * @example
 * // In AdminProductsTab:
 * <GlobalSearchBar
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Search by name, SKU, category, dosage..."
 *   resultCount={totalItems}
 *   namespace="admin-products"
 *   size="lg"
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

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (showRecent && recentSearches.length > 0 && !value) {
      setShowDropdown(true);
    }
    onFocus?.();
  }, [recentSearches, value, showRecent, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay so click on recent item registers before blur hides dropdown
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
    sm: { height: '34px', fontSize: '0.8rem', iconSize: 15 },
    md: { height: '40px', fontSize: '0.875rem', iconSize: 17 },
    lg: { height: '48px', fontSize: '0.95rem', iconSize: 20 },
  };
  const { height, fontSize, iconSize } = sizeConfig[size] || sizeConfig.md;

  return (
    <div className="search-bar-wrap">
      {/*
        .search-bar-wrap activates @container search-bar (container-type:inline-size)
        so the bar adapts to its own container width — not the viewport.
        E.g. it can shrink in a sidebar without needing a global media query.
      */}
      <div
        className={`atlas-search ${className}`}
      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
    >
      <style>{`
        .atlas-search__input-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          height: ${height};
          padding: 0 0.75rem;
          border-radius: 10px;
          border: 1.5px solid var(--border, #e2e8f0);
          background: var(--color-bg-app, #fff);
          transition: all 0.2s ease;
          cursor: text;
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
        .atlas-search__input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: ${fontSize};
          color: var(--text-main, #0f172a);
          min-width: 0;
        }
        .atlas-search__input::placeholder {
          color: var(--text-muted, #94a3b8);
        }
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
        }
        .atlas-search__shortcut:hover { border-color: var(--primary-soft, #93c5fd); }
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
        .atlas-search__dropdown-item:hover {
          background: var(--color-bg-subtle, #f8fafc);
        }
        .atlas-search__spinner {
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div
        className={`atlas-search__input-wrap ${isFocused ? 'focused' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Search icon or spinner */}
        {isLoading ? (
          <Loader size={iconSize} color="var(--primary, #2563eb)" className="atlas-search__spinner" />
        ) : (
          <Search size={iconSize} color={isFocused ? 'var(--primary, #2563eb)' : 'var(--text-muted, #94a3b8)'} />
        )}

        {/* Input */}
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

        {/* Keyboard shortcut hint */}
        {showShortcut && !value && !isFocused && (
          <span
            className="atlas-search__shortcut"
            onClick={() => inputRef.current?.focus()}
            title="Press ⌘K or Ctrl+K to search"
          >
            <Command size={10} />K
          </span>
        )}
      </div>

      {/* Recent searches dropdown */}
      {showDropdown && showRecent && recentSearches.length > 0 && (
        <div className="atlas-search__dropdown">
          <div
            style={{
              padding: '0.5rem 1rem 0.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent Searches
            </span>
            <button
              style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={clearRecent}
            >
              Clear all
            </button>
          </div>
          {recentSearches.map((term, i) => (
            <div
              key={i}
              className="atlas-search__dropdown-item"
              onClick={() => handleRecentClick(term)}
            >
              <Clock size={13} color="var(--text-muted)" />
              {term}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
