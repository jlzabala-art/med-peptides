"use client";

import React from 'react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * PublicSegmentedControl
 * Standardized Google Cloud-inspired segmented buttons for switching views,
 * dose selections, and timeline tabs.
 */
export default function PublicSegmentedControl({
  items = [],
  activeId,
  onChange,
  className = '',
  size = 'md',
  style = {}
}) {
  return (
    <div
      className={`pds-segmented-control ${size === 'sm' ? 'is-sm' : size === 'lg' ? 'is-lg' : ''} ${className}`}
      role="tablist"
      style={style}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            className={`pds-segmented-item ${isActive ? 'is-active' : ''}`}
            onClick={() => {
              if (item.disabled || isActive) return;
              triggerHaptic('selection');
              if (onChange) onChange(item.id);
            }}
          >
            {Icon && <Icon size={14} />}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span style={{ opacity: 0.8, fontSize: '0.70rem', marginLeft: '2px' }}>
                ({item.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
