"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Check, Search } from 'lucide-react';

/**
 * MultiSelectFilter — A filter pill that opens a popover with checkboxes.
 * Props:
 *  - label: string             Base singular label ("Category", "Supplier", …)
 *  - pluralLabel: string       Explicit plural form ("Categories", "Suppliers", …)
 *                              Falls back to `label` if not provided.
 *  - values: string[]          Array of currently selected values
 *  - options: {label, value}[] All available options (no "All" needed)
 *  - onChange: (values: string[]) => void
 *  - maxWidth?: number
 */
export default function MultiSelectFilter({ label, pluralLabel, plural: pluralProp, values = [], options = [], onChange, maxWidth = 240 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(values);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  // Start hidden — position is calculated synchronously via useLayoutEffect
  // before the first paint, so the menu never renders at (0,0).
  const [menuStyle, setMenuStyle] = useState({ visibility: 'hidden' });

  // Accept both 'pluralLabel' (from MasterCatalogTable) and 'plural' (from FilterRow legacy usage)
  const plural = pluralLabel || pluralProp || label;

  useEffect(() => {
    if (!isOpen) setPending(values);
  }, [values, isOpen]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect  = triggerRef.current.getBoundingClientRect();
    const menuW = Math.max(rect.width, maxWidth);
    const vw    = window.innerWidth;
    const overflowsRight = rect.left + menuW > vw - 8;

    setMenuStyle({
      position:   'fixed',
      top:        rect.bottom + 4,
      ...(overflowsRight
        ? { right: vw - rect.right, left: 'auto' }
        : { left: rect.left,        right: 'auto' }),
      minWidth:   menuW,
      maxWidth:   Math.min(menuW, vw - 16),
      zIndex:     99999,
      visibility: 'visible',   // reveal after position is set
    });
  }, [maxWidth]);

  // useLayoutEffect → runs synchronously after DOM mutations but BEFORE the
  // browser paints. This eliminates the (0,0) → correct-position jump.
  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle({ visibility: 'hidden' }); // reset for next open
      return;
    }
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        handleClose(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, pending]);

  const handleClose = (apply = false) => {
    if (apply) onChange(pending);
    else setPending(values);
    setIsOpen(false);
    setSearch('');
  };

  const toggleValue = (val) => {
    setPending(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const filtered = options.filter(o => {
    const lbl = (o.label ?? o.value ?? '').toString();
    return lbl.toLowerCase().includes(search.toLowerCase());
  });

  const activeCount = values.length;
  const isActive = activeCount > 0;

  // Resolve human-readable label from options.
  // options updates reactively when facets load from API.
  // If the option isn't found yet (loading race), show a neutral placeholder.
  const resolveLabel = (val) => {
    const opt = options.find(o => o.value === val || o.id === val);
    return opt?.label ?? opt?.name ?? opt?.value ?? val;
  };

  const buttonLabel = isActive
    ? (() => {
        const firstLabel = resolveLabel(values[0]);
        return activeCount > 1 ? `${firstLabel} +${activeCount - 1}` : firstLabel;
      })()
    : `All ${plural}`;

  return (
    <>
      <div ref={triggerRef} className="atlas-search__filter-pill">
        <button
          className={`atlas-search__filter-pill-btn ${isActive ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) setPending(values);
            setIsOpen(v => !v);
          }}
          style={{ gap: '5px' }}
        >
          <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {buttonLabel}
          </span>
          {isActive && (
            <span style={{
              background: 'var(--color-primary, #003666)', color: '#fff',
              borderRadius: '10px', fontSize: '0.6rem', fontWeight: 700,
              padding: '1px 5px', lineHeight: '1.4', flexShrink: 0
            }}>{activeCount}</span>
          )}
          <ChevronDown size={10} style={{ flexShrink: 0 }} />
        </button>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            ...menuStyle,
            background: 'var(--color-bg-surface, #fff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 10px',
            borderBottom: '1px solid var(--border-light, #f1f5f9)',
            background: 'var(--color-bg-subtle, #f8fafc)'
          }}>
            <Search size={13} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder={`Search ${plural.toLowerCase()}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', fontSize: '0.8rem',
                color: 'var(--text-main, #1e293b)'
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Select All / Clear */}
          <div style={{ display: 'flex', gap: '6px', padding: '6px 10px', borderBottom: '1px solid var(--border-light, #f1f5f9)' }}>
            <button onClick={() => setPending(options.map(o => o.value))} style={{ flex: 1, fontSize: '0.72rem', fontWeight: 600, padding: '4px 0', borderRadius: '5px', border: 'none', background: 'var(--color-bg-subtle, #f1f5f9)', color: 'var(--text-muted, #64748b)', cursor: 'pointer' }}>Select All</button>
            <button onClick={() => setPending([])} style={{ flex: 1, fontSize: '0.72rem', fontWeight: 600, padding: '4px 0', borderRadius: '5px', border: 'none', background: 'var(--color-bg-subtle, #f1f5f9)', color: 'var(--text-muted, #64748b)', cursor: 'pointer' }}>Clear</button>
          </div>

          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: '4px' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No results</div>
            )}
            {filtered.map(opt => {
              const selected = pending.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggleValue(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                    background: selected ? 'var(--primary-light, #eff6ff)' : 'transparent',
                    transition: 'background 0.1s', fontSize: '0.83rem',
                    color: selected ? 'var(--color-primary, #003666)' : 'var(--text-main, #334155)',
                    fontWeight: selected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--color-bg-subtle, #f8fafc)'; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${selected ? 'var(--color-primary, #003666)' : 'var(--border, #cbd5e1)'}`,
                    background: selected ? 'var(--color-primary, #003666)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                  }}>
                    {selected && <Check size={9} style={{ color: '#fff', strokeWidth: 3 }} />}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{opt.label ?? opt.value}</span>{opt.count != null && <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.7rem', fontWeight: 600, color: selected ? 'var(--color-primary)' : 'var(--text-muted)', background: 'var(--color-bg-subtle, #f1f5f9)', borderRadius: '10px', padding: '1px 6px' }}>{opt.count}</span>}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '6px', padding: '8px 10px', borderTop: '1px solid var(--border-light, #f1f5f9)' }}>
            <button onClick={() => handleClose(false)} style={{ flex: 1, fontSize: '0.78rem', fontWeight: 500, padding: '6px 0', borderRadius: '6px', border: '1px solid var(--border, #e2e8f0)', background: 'transparent', color: 'var(--text-muted, #64748b)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => handleClose(true)} style={{ flex: 2, fontSize: '0.78rem', fontWeight: 700, padding: '6px 0', borderRadius: '6px', border: 'none', background: 'var(--color-primary, #003666)', color: '#fff', cursor: 'pointer' }}>
              Apply{pending.length > 0 ? ` (${pending.length})` : ''}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
