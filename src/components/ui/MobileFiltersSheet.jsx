"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Check, SlidersHorizontal } from '@/lib/icons';

/**
 * MobileFiltersSheet — Two-level mobile filter bottom sheet
 *
 * Architecture:
 *   Level 1 (groups): Compact rows → Category, Goal, Presentation, Supplier, …
 *   Level 2 (detail): In-place content swap → chips for selected group
 *
 * NEVER stacks a second bottom sheet.
 * Pending values are committed only when the user taps "Show X Products".
 */
export default function MobileFiltersSheet({
  isOpen,
  onClose,
  filterOptions = [],
  onClearAll,
  resultCount = 0,
}) {
  const [view, setView] = useState('groups');
  const [activeGroupKey, setActiveGroupKey] = useState(null);
  const [pendingValues, setPendingValues] = useState({});
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // Sync pending from applied values when sheet opens
  useEffect(() => {
    if (isOpen) {
      const initial = {};
      filterOptions.forEach(fo => {
        initial[fo.key] = Array.isArray(fo.values) ? [...fo.values] : [];
      });
      setPendingValues(initial);
      setView('groups');
      setActiveGroupKey(null);
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Scroll content to top on view change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [view, activeGroupKey]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* ── Derived ── */
  const getGroupSummary = (fo) => {
    const vals = pendingValues[fo.key] || [];
    if (vals.length === 0) return 'Any';
    if (vals.length === 1) {
      const opt = (fo.options || []).find(o => String(o.value) === String(vals[0]));
      return opt?.label ?? String(vals[0]);
    }
    return `${vals.length} selected`;
  };

  const activeGroupCount = Object.values(pendingValues).filter(v => v.length > 0).length;
  const totalPending = Object.values(pendingValues).reduce((s, v) => s + (v?.length || 0), 0);
  const activeGroup = filterOptions.find(fo => fo.key === activeGroupKey);

  const ctaLabel = totalPending > 0
    ? (resultCount > 0 ? `Show ${resultCount} Products` : 'Apply Filters')
    : (resultCount > 0 ? `Show ${resultCount} Products` : 'Show Products');
  const ctaDisabled = false;

  /* ── Handlers ── */
  const toggleOption = (groupKey, value) => {
    setPendingValues(prev => {
      const current = prev[groupKey] || [];
      const strVal = String(value);
      const has = current.map(String).includes(strVal);
      return {
        ...prev,
        [groupKey]: has
          ? current.filter(v => String(v) !== strVal)
          : [...current, value],
      };
    });
  };

  const handleApply = () => {
    filterOptions.forEach(fo => {
      fo.onChange?.(pendingValues[fo.key] || []);
    });
    onClose();
  };

  const handleClearAll = () => {
    const cleared = {};
    filterOptions.forEach(fo => { cleared[fo.key] = []; });
    setPendingValues(cleared);
    filterOptions.forEach(fo => fo.onChange?.([]));
    onClearAll?.();
  };

  if (!mounted) return null;

  const sheet = (
    <div
      className={`mfs-overlay${isOpen ? ' mfs-overlay--open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label="Filter products"
    >
      <div className={`mfs-sheet${isOpen ? ' mfs-sheet--open' : ''}`}>

        {/* Drag handle */}
        <div className="mfs-handle" aria-hidden="true" />

        {/* Header */}
        <div className="mfs-header">
          {view === 'detail' ? (
            <button
              className="mfs-back-btn"
              onClick={() => { setView('groups'); setActiveGroupKey(null); }}
              aria-label="Back to all filters"
            >
              <ChevronLeft size={18} />
              <span>{activeGroup?.pluralLabel || activeGroup?.label || 'Back'}</span>
            </button>
          ) : (
            <div className="mfs-header-title">
              <SlidersHorizontal size={16} aria-hidden="true" />
              <span>Filters</span>
              {activeGroupCount > 0 && (
                <span className="mfs-header-badge">{activeGroupCount}</span>
              )}
            </div>
          )}
          <button
            className="mfs-close-btn"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="mfs-content" ref={contentRef}>

          {view === 'groups' ? (
            /* ── Level 1: compact group rows ── */
            <div className="mfs-groups">
              {filterOptions.map((fo) => {
                const summary = getGroupSummary(fo);
                const hasActive = (pendingValues[fo.key] || []).length > 0;
                return (
                  <button
                    key={fo.key}
                    className={`mfs-group-row${hasActive ? ' mfs-group-row--active' : ''}`}
                    onClick={() => { setActiveGroupKey(fo.key); setView('detail'); }}
                    aria-label={`${fo.pluralLabel || fo.label}: ${summary}`}
                  >
                    <span className="mfs-group-name">{fo.pluralLabel || fo.label}</span>
                    <div className="mfs-group-right">
                      <span className={`mfs-group-summary${hasActive ? ' mfs-group-summary--active' : ''}`}>
                        {summary}
                      </span>
                      <ChevronRight size={16} className="mfs-group-chevron" aria-hidden="true" />
                    </div>
                  </button>
                );
              })}
            </div>

          ) : activeGroup ? (
            /* ── Level 2: chip selection ── */
            <div className="mfs-detail">
              {activeGroup.multiSelect && (
                <p className="mfs-detail-hint">Select one or more</p>
              )}
              <div className="mfs-chips-grid">
                {(activeGroup.options || []).map((opt) => {
                  const groupPending = pendingValues[activeGroupKey] || [];
                  const isSelected = groupPending.map(String).includes(String(opt.value));
                  const count = opt.count;
                  const hasCount = typeof count === 'number' && count > 0;
                  const isZero = typeof count === 'number' && count === 0;

                  return (
                    <button
                      key={opt.value}
                      className={[
                        'mfs-chip',
                        isSelected ? 'mfs-chip--selected' : '',
                        isZero ? 'mfs-chip--zero' : '',
                      ].filter(Boolean).join(' ')}
                      disabled={isZero}
                      onClick={() => toggleOption(activeGroupKey, opt.value)}
                      aria-pressed={isSelected}
                    >
                      {isSelected && <Check size={12} className="mfs-chip-check" aria-hidden="true" />}
                      <span className="mfs-chip-label">{opt.label ?? String(opt.value)}</span>
                      {hasCount && <span className="mfs-chip-count">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

        </div>

        {/* Sticky footer */}
        <div className="mfs-footer">
          <button
            className="mfs-footer-clear"
            onClick={handleClearAll}
            disabled={totalPending === 0}
          >
            Clear All
          </button>
          <button
            className="mfs-footer-apply"
            onClick={handleApply}
            disabled={ctaDisabled}
          >
            {ctaLabel}
            {resultCount > 0 && totalPending > 0 && (
              <span className="mfs-footer-apply-count">{resultCount}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}

/**
 * MobileFilterTrigger — Full-width button shown in place of FilterRow on mobile.
 */
export function MobileFilterTrigger({ onClick, activeCount = 0 }) {
  return (
    <button
      className={`mft-btn${activeCount > 0 ? ' mft-btn--active' : ''}`}
      onClick={onClick}
      aria-label={activeCount > 0
        ? `Open filters, ${activeCount} filter group${activeCount > 1 ? 's' : ''} active`
        : 'Open filters'}
    >
      <SlidersHorizontal size={16} className="mft-icon" aria-hidden="true" />
      <span className="mft-label">Filters</span>
      {activeCount > 0 && (
        <span className="mft-badge" aria-hidden="true">{activeCount}</span>
      )}
    </button>
  );
}
