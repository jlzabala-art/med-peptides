"use client";
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import MultiSelectFilter from './MultiSelectFilter';

/**
 * SingleSelectFilterPill — Floating popover pill for single-select dimensions
 */
function SingleSelectFilterPill({ label, value, options = [], onChange, maxWidth = 220 }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ visibility: 'hidden' });

  const selectedOption = options.find(o => String(o.value) === String(value));
  const isActive = Boolean(value && value !== '');
  const buttonText = isActive ? (selectedOption?.label || label) : label;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuW = Math.max(rect.width, maxWidth);
    const vw = window.innerWidth;
    const overflowsRight = rect.left + menuW > vw - 8;

    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      ...(overflowsRight
        ? { right: vw - rect.right, left: 'auto' }
        : { left: rect.left, right: 'auto' }),
      minWidth: menuW,
      maxWidth: Math.min(menuW, vw - 16),
      zIndex: 99999,
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
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <>
      <div ref={triggerRef} className="atlas-search__filter-pill" style={{ display: 'inline-flex' }}>
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`atlas-search__filter-pill-btn ${isActive ? 'active' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 11px',
            fontSize: '0.82rem',
            fontWeight: isActive ? 700 : 500,
            borderRadius: '20px',
            border: isActive ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
            backgroundColor: isActive ? '#eff6ff' : '#ffffff',
            color: isActive ? '#003666' : '#334155',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <span>{buttonText}</span>
          <ChevronDown size={12} style={{ color: isActive ? '#003666' : '#64748b' }} />
        </button>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            ...menuStyle,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {options.map(opt => {
            const isSelected = String(opt.value) === String(value || '');
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#003666' : '#0f172a',
                  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} style={{ color: '#003666' }} />}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

import UnifiedFiltersDrawer from './UnifiedFiltersDrawer';
import { SlidersHorizontal } from '@/lib/icons';

/**
 * FilterRow — Line 2 of the unified search/filter layout.
 * Renders high-priority quick pills + a unified 'All Filters (N)' drawer trigger.
 * Optimized for laptops & desktops (no line wraps, clean space).
 */
export default function FilterRow({ 
  filterOptions = [], 
  onClearAll = null, 
  activeCount = 0, 
  className = '',
  maxInlinePills = 2,
  resultCount
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!filterOptions || filterOptions.length === 0) return null;

  // Derive active count if not provided
  const computedActiveCount = activeCount || filterOptions.reduce((acc, fo) => {
    if (fo.multiSelect) return acc + (fo.values?.length || 0);
    return acc + (fo.value && fo.value !== '' && fo.value !== 'all' ? 1 : 0);
  }, 0);

  // If there are many filter dimensions, pin the first `maxInlinePills` and group the rest in Drawer
  const hasManyFilters = filterOptions.length > maxInlinePills;
  const pinnedOptions = hasManyFilters ? filterOptions.slice(0, maxInlinePills) : filterOptions;

  return (
    <>
      <div
        className={`filter-row ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'visible',
          padding: '3px 0 6px 0',
          position: 'relative',
          zIndex: 10,
          maxWidth: '100%',
          boxSizing: 'border-box',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Unified All Filters Button (Always visible when there are 3+ filters) */}
        {hasManyFilters && (
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              fontSize: '0.82rem',
              fontWeight: computedActiveCount > 0 ? 800 : 600,
              borderRadius: '20px',
              border: computedActiveCount > 0 ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
              backgroundColor: computedActiveCount > 0 ? '#eff6ff' : '#ffffff',
              color: computedActiveCount > 0 ? 'var(--color-primary, #003666)' : '#334155',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = computedActiveCount > 0 ? '#eff6ff' : '#ffffff'}
          >
            <SlidersHorizontal size={13} color={computedActiveCount > 0 ? 'var(--color-primary, #003666)' : '#64748b'} />
            <span>All Filters</span>
            {computedActiveCount > 0 && (
              <span style={{
                backgroundColor: 'var(--color-primary, #003666)',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '10px',
                lineHeight: 1.2
              }}>
                {computedActiveCount}
              </span>
            )}
          </button>
        )}

        {/* Pinned Quick Filter Pills */}
        {pinnedOptions.map((fo, idx) => {
          const key = fo.key || fo.id || `fo-${idx}`;

          if (fo.multiSelect) {
            return (
              <MultiSelectFilter
                key={key}
                label={fo.label || fo.pluralLabel || 'Filter'}
                plural={fo.pluralLabel || fo.label || 'Items'}
                values={fo.values || []}
                options={(fo.options || []).map(o => ({
                  ...o,
                  label: o.label ?? o.name ?? o.value,
                }))}
                onChange={fo.onChange}
                maxWidth={fo.maxWidth || 260}
              />
            );
          }

          // Single-select pill (e.g. timeframe / Import Date, availability)
          return (
            <SingleSelectFilterPill
              key={key}
              label={fo.label || 'Filter'}
              value={fo.value}
              options={fo.options || []}
              onChange={fo.onChange}
              maxWidth={fo.maxWidth || 230}
            />
          );
        })}

        {/* Inline Clear All Button (appears directly on the same line) */}
        {onClearAll && computedActiveCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '20px',
              border: '1px solid #fecaca',
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(225, 29, 72, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffe4e6';
              e.currentTarget.style.borderColor = '#fda4af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff1f2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
          >
            <span>✕ Clear ({computedActiveCount})</span>
          </button>
        )}

        <style jsx global>{`
          .filter-row::-webkit-scrollbar { display: none; }
          @media (max-width: 640px) {
            .filter-row { gap: 5px; }
          }
        `}</style>
      </div>

      {/* Unified Filters Drawer */}
      <UnifiedFiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filterOptions={filterOptions}
        onClearAll={onClearAll}
        resultCount={resultCount}
      />
    </>
  );
}
