"use client";
/**
 * MobileSupplierCard
 * Premium mobile card for the Suppliers table.
 * Shows: company name, country, product/variant counts, B2B/B2C status.
 * Long-press → selection mode. Tap ⋮ → quick actions sheet.
 */

import React, { useRef, useCallback } from 'react';
import { MoreVertical, Check, MapPin, Package, Building2, FileText, Mail, Square, CheckSquare } from '@/lib/icons';
import StatusBadge from '../../ui/StatusBadge';
import SwipeableCard from '../../ui/SwipeableCard';

const LONG_PRESS_MS = 500;

/* ── Country flag (emoji) ─────────────────────────────────────────── */
function countryToFlag(country) {
  if (!country) return null;
  // Map common country names to flag emojis
  const flags = {
    spain: '🇪🇸', 'united states': '🇺🇸', usa: '🇺🇸', us: '🇺🇸',
    germany: '🇩🇪', france: '🇫🇷', 'united kingdom': '🇬🇧', uk: '🇬🇧',
    china: '🇨🇳', india: '🇮🇳', canada: '🇨🇦',
    netherlands: '🇳🇱', italy: '🇮🇹', switzerland: '🇨🇭',
    mexico: '🇲🇽', brazil: '🇧🇷', poland: '🇵🇱',
  };
  return flags[country.toLowerCase()] || null;
}

export default function MobileSupplierCard({
  row,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
}) {
  const name    = row.companyName || row.name || row.displayName || row.supplierName || row.title || (row.id ? `Supplier #${row.id.slice(0, 6).toUpperCase()}` : 'Supplier');
  const country = row.country || row.countryOfOrigin || null;
  const flag    = countryToFlag(country);
  const products = row.productsSupplied || row.catalog_items?.length || 0;
  const variants = row.variantsSupplied || 0;
  const statusB2B = row.statusB2B || 'inactive';
  const statusB2C = row.statusB2C || 'inactive';

  /* Long-press */
  const timer = useRef(null);
  const handleTouchStart = useCallback(() => {
    timer.current = setTimeout(() => onLongPress?.(), LONG_PRESS_MS);
  }, [onLongPress]);
  const cancelLongPress = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleTap = useCallback(() => {
    cancelLongPress();
    if (selectionMode) onToggleSelect?.();
    else onRowClick?.(row);
  }, [selectionMode, onToggleSelect, onRowClick, row, cancelLongPress]);

  const swipeActions = {
    left: [
      {
        icon: <Mail size={20} />,
        label: 'Contact',
        color: '#16a34a',
        onClick: () => onQuickAction && onQuickAction('menu', row) // Replace with contact action if needed
      }
    ],
    right: [
      {
        icon: <FileText size={20} />,
        label: 'Details',
        color: '#2563eb',
        onClick: () => onRowClick?.(row)
      }
    ]
  };

  return (
    <SwipeableCard {...swipeActions}>
    <div
      className={`msc-card${isSelected ? ' msc-card--selected' : ''}`}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } }}
      aria-label={`${name}${country ? `, ${country}` : ''}`}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection checkbox (always visible) */}
      <div
        className="msc-checkbox-container"
        onClick={(e) => {
          if (!selectionMode) {
            e.stopPropagation();
            onToggleSelect?.();
          }
        }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          color: isSelected ? 'var(--color-primary, #003666)' : 'var(--color-text-tertiary)',
        }}
      >
        {isSelected ? <CheckSquare size={20} strokeWidth={2} /> : <Square size={20} strokeWidth={2} />}
      </div>

      {/* Icon column */}
      <div className="msc-icon" aria-hidden="true">
        <Building2 size={26} strokeWidth={1.5} />
      </div>

      {/* Body */}
      <div className="msc-body">
        <div className="msc-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span>{name}</span>
        </div>

        {row.type && (
          <div style={{ display: 'inline-flex', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
            <span style={{ 
              background: row.type.includes('API') ? 'rgba(22, 163, 74, 0.1)' : 'rgba(0, 54, 102, 0.08)', 
              color: row.type.includes('API') ? '#16a34a' : 'var(--color-primary, #003666)', 
              fontSize: '0.68rem', 
              fontWeight: 700, 
              padding: '0.15rem 0.45rem', 
              borderRadius: '6px' 
            }}>
              {row.type}
            </span>
          </div>
        )}

        {country && (
          <div className="msc-location">
            {flag && <span aria-hidden="true">{flag}</span>}
            <MapPin size={11} />
            {country}
          </div>
        )}

        <div className="msc-stats">
          {products > 0 && (
            <span className="msc-stat">
              <Package size={11} /> {products} product{products !== 1 ? 's' : ''}
            </span>
          )}
          {variants > 0 && (
            <span className="msc-stat">{variants} variant{variants !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="msc-status-row">
          <span className="msc-status-label">B2B</span>
          <StatusBadge status={statusB2B} compact />
          <span className="msc-status-label" style={{ marginLeft: 8 }}>B2C</span>
          <StatusBadge status={statusB2C} compact />
        </div>
      </div>

      {/* Right side */}
      {!selectionMode ? (
        <div className="msc-right">
          {onQuickAction && (
            <button
              className="msc-quick-btn"
              onClick={(e) => { e.stopPropagation(); onQuickAction('menu', row); }}
              aria-label={`Actions for ${name}`}
            >
              <MoreVertical size={15} />
            </button>
          )}
        </div>
      ) : (
        <div style={{ width: 24 }} />
      )}
    </div>
    </SwipeableCard>
  );
}
