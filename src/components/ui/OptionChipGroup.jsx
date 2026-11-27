'use client';

import React from 'react';
import { Check } from '@/lib/icons';

/**
 * OptionChipGroup — Unified GCP Accessible Radio Chip Selector
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides consistent keyboard focus, role="radiogroup" / aria-checked semantics,
 * non-color checkmark indicator on the active option, and 44px mobile touch targets.
 *
 * Props:
 *  - options: Array<{ id: string, label: string, disabled?: boolean }>
 *  - value: string (active option id)
 *  - onChange: (id: string) => void
 *  - ariaLabel?: string
 *  - ariaLabelledBy?: string
 *  - mobileGrid?: boolean (default true — 2-col grid on ≤768px)
 *  - showCheck?: boolean (default true — shows ✓ icon on selected chip)
 *  - className?: string
 */
export default function OptionChipGroup({
  options = [],
  value,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  mobileGrid = true,
  showCheck = true,
  className = '',
}) {
  if (!options.length) return null;
  const isOdd = options.length % 2 === 1;

  return (
    <div
      role="radiogroup"
      aria-label={!ariaLabelledBy ? ariaLabel : undefined}
      aria-labelledby={ariaLabelledBy}
      className={`gcp-chip-group ${mobileGrid ? 'gcp-chip-group--grid-mobile' : ''} ${
        mobileGrid && isOdd ? 'gcp-chip-group--odd-last' : ''
      } ${className}`.trim()}
    >
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={Boolean(opt.disabled)}
            onClick={() => onChange && onChange(opt.id)}
            className={`gcp-chip-btn ${isSelected ? 'is-active' : ''}`}
          >
            {showCheck && isSelected && <Check size={13} style={{ flexShrink: 0 }} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
