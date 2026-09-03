"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * SingleSelectFilter — Enterprise single-select filter pill with portal popover.
 * Props:
 *  - label: string             Base label ("Import Date", "Data Quality", ...)
 *  - value: string             Currently selected value (empty string = neutral default)
 *  - options: {label, value, count?}[] All options
 *  - onChange: (value: string) => void
 *  - maxWidth?: number
 */
export default function SingleSelectFilter({
  label,
  value = '',
  options = [],
  onChange,
  maxWidth = 200
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ visibility: 'hidden' });

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
      visibility: 'visible',
    });
  }, [maxWidth]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle({ visibility: 'hidden' });
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
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
    setSearch('');
  };

  const activeOption = options.find(o => o.value === value);
  const isActive = Boolean(value && value !== 'all' && value !== '');
  const buttonLabel = isActive ? (activeOption?.label || value) : label;

  const showSearch = options.length > 6;
  const filtered = options.filter(o => {
    if (!search.trim()) return true;
    const lbl = (o.label ?? o.value ?? '').toString();
    return lbl.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div ref={triggerRef} className="atlas-search__filter-pill">
        <button
          type="button"
          className={`atlas-search__filter-pill-btn ${isActive ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(v => !v);
          }}
          style={{ gap: '5px' }}
        >
          <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {buttonLabel}
          </span>
          <ChevronDown size={10} style={{ flexShrink: 0, opacity: isActive ? 0.9 : 0.6 }} />
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
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Optional Search */}
          {showSearch && (
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
                placeholder={`Filter options…`}
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
          )}

          {/* Options */}
          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '4px' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>No matching options</div>
            )}
            {filtered.map(opt => {
              const selected = opt.value === value || (!value && opt.value === '');
              return (
                <div
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                    background: selected && isActive ? 'var(--primary-light, #eff6ff)' : 'transparent',
                    transition: 'background 0.1s', fontSize: '0.83rem',
                    color: selected && isActive ? 'var(--color-primary, #003666)' : 'var(--text-main, #334155)',
                    fontWeight: selected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!(selected && isActive)) e.currentTarget.style.background = 'var(--color-bg-subtle, #f8fafc)'; }}
                  onMouseLeave={e => { if (!(selected && isActive)) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 14, height: 14, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-primary, #003666)'
                  }}>
                    {selected && <Check size={13} style={{ strokeWidth: 2.5 }} />}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {opt.label ?? opt.value}
                  </span>
                  {opt.count != null && (
                    <span style={{
                      marginLeft: 'auto', flexShrink: 0, fontSize: '0.7rem', fontWeight: 600,
                      color: selected ? 'var(--color-primary, #003666)' : 'var(--text-muted, #64748b)',
                      background: 'var(--color-bg-subtle, #f1f5f9)', borderRadius: '10px',
                      padding: '1px 6px'
                    }}>
                      {opt.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
