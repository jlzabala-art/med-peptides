"use client";
/**
 * MobileSortSheet
 * ─────────────────────────────────────────────────────────────────────────────
 * A bottom sheet for selecting sort order on mobile.
 * Mirrors the visual design of MobileFiltersSheet.
 *
 * Props:
 *   isOpen          — boolean
 *   onClose         — () => void
 *   options         — [{ key, label, directions?: ['asc','desc'] }]
 *   currentSort     — { key, direction } | null
 *   onApply         — ({ key, direction }) => void
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUp, ArrowDown, Check } from '@/lib/icons';

const DEFAULT_DIRECTIONS = ['asc', 'desc'];

const DIRECTION_LABELS = {
  asc: { text: 'A → Z', icon: ArrowUp, altText: '0 → 9' },
  desc: { text: 'Z → A', icon: ArrowDown, altText: '9 → 0' },
};

export default function MobileSortSheet({ isOpen, onClose, options = [], currentSort = null, onApply }) {
  const [pending, setPending] = useState(currentSort || { key: null, direction: 'asc' });

  // Sync when sheet reopens
  useEffect(() => {
    if (isOpen) setPending(currentSort || { key: null, direction: 'asc' });
  }, [isOpen, currentSort]);

  if (!isOpen) return null;

  const selectedOption = options.find(o => o.key === pending.key);
  const directions = selectedOption?.directions || DEFAULT_DIRECTIONS;

  const handleOptionSelect = (key) => {
    if (pending.key === key) {
      // Toggle direction
      const dirs = options.find(o => o.key === key)?.directions || DEFAULT_DIRECTIONS;
      const idx = dirs.indexOf(pending.direction);
      const next = dirs[(idx + 1) % dirs.length];
      setPending({ key, direction: next });
    } else {
      const firstDir = (options.find(o => o.key === key)?.directions || DEFAULT_DIRECTIONS)[0];
      setPending({ key, direction: firstDir });
    }
  };

  const handleApply = () => {
    onApply?.(pending.key ? pending : null);
    onClose?.();
  };

  const handleClear = () => {
    setPending({ key: null, direction: 'asc' });
    onApply?.(null);
    onClose?.();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="mss-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="mss-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Sort options"
      >
        {/* Header */}
        <div className="mss-header">
          <div className="mss-handle" aria-hidden="true" />
          <div className="mss-header-row">
            <span className="mss-title">Sort by</span>
            <button className="mss-close-btn" onClick={onClose} aria-label="Close sort">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="mss-options">
          {options.map(opt => {
            const isSelected = pending.key === opt.key;
            const dirs = opt.directions || DEFAULT_DIRECTIONS;
            const dirInfo = DIRECTION_LABELS[pending.direction];

            return (
              <button
                key={opt.key}
                className={`mss-option${isSelected ? ' mss-option--active' : ''}`}
                onClick={() => handleOptionSelect(opt.key)}
                aria-pressed={isSelected}
              >
                <span className="mss-option-label">{opt.label}</span>
                {isSelected && (
                  <span className="mss-option-dir">
                    {dirInfo?.icon && React.createElement(dirInfo.icon, { size: 12 })}
                    {pending.direction === 'asc'
                      ? (opt.ascLabel || dirInfo?.text)
                      : (opt.descLabel || DIRECTION_LABELS.desc.text)}
                  </span>
                )}
                {isSelected && <Check size={16} className="mss-option-check" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mss-footer">
          <button className="mss-footer-clear" onClick={handleClear} disabled={!pending.key}>
            Clear sort
          </button>
          <button className="mss-footer-apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
