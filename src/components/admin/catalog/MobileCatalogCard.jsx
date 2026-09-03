"use client";

/**
 * MobileCatalogCard — premium horizontal product card for mobile catalog.
 *
 * Props injected by DataTable (via mobileCardProps):
 *   row              : product object (with __catalogMeta attached)
 *   onRowClick       : (row) => void  — opens variant drawer (tap main area)
 *   selectionMode    : boolean        — long-press selection mode active
 *   isSelected       : boolean        — this card is in the selection set
 *   onToggleSelect   : () => void     — toggle selection of this card
 *   onLongPress      : () => void     — enter selection mode from this card
 *   onQuickAction    : (action, row) => void — card ⋮ button
 */

import React, { useRef, useCallback } from 'react';
import {
  ChevronRight, Package, TestTube, Pill, Droplets,
  Microscope, Dna, Heart, Activity, MoreVertical,
  Check, Square, CheckSquare, Play, FileText, ShoppingCart
} from '@/lib/icons';
import { PRESENTATION_LABELS } from '../../../constants/presentationTypes';
import { getGoalLabel } from '../../../config/goals';
import { getProductAvailableTypes } from '../../../utils/productNormalizer';
import StatusBadge from '../../ui/StatusBadge';
import SwipeableCard from '../../ui/SwipeableCard';

/* ── Category icon mapping ──────────────────────────────────────── */
const CATEGORY_ICONS = {
  peptides:              TestTube,
  genetic_tests:         Dna,
  blood_analysis:        Microscope,
  supplements:           Pill,
  compounding_materials: Droplets,
  hormones:              Activity,
  wellness:              Heart,
};

function CategoryIcon({ category }) {
  const Icon = CATEGORY_ICONS[category?.toLowerCase()] || Package;
  return (
    <div className="mcc-thumb" aria-hidden="true">
      <Icon size={28} strokeWidth={1.5} />
    </div>
  );
}

/* ── Safe numeric coercion (guards object-typed Firestore fields) ── */
function safeNum(val) {
  if (val === null || val === undefined || typeof val === 'object') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

/* ── Min price across variants ──────────────────────────────────── */
function getMinPrice(row) {
  if (!row.variants?.length) return null;
  let min = Infinity;
  row.variants.forEach(v => {
    const costTiers = v.cost_tiers;
    const costTiersMin = costTiers && typeof costTiers === 'object'
      ? Math.min(...Object.values(costTiers).map(safeNum).filter(p => p > 0))
      : null;
    const tiersMin = costTiersMin && isFinite(costTiersMin)
      ? costTiersMin
      : (Array.isArray(v.pricing_tiers) && v.pricing_tiers.length > 0
          ? Math.min(...v.pricing_tiers.map(t => safeNum(t.price)).filter(p => p > 0))
          : null);
    const price =
      tiersMin ||
      safeNum(v.unit_price) ||
      safeNum(v.pricing?.retail) ||
      safeNum(v.pricing_normalized?.retail_usd) ||
      safeNum(v.price);
    if (price > 0) min = Math.min(min, price);
  });
  return min === Infinity ? null : min;
}

function formatPrice(price) {
  if (!price) return null;
  return `From €${price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ── Variant summary ──────────────────────────────────────── */
function getVariantSummary(row) {
  const numVariants = row.variants?.length || row.variantsCount || 0;
  if (numVariants === 0) return null;

  if (row.variants && row.variants.length > 0) {
    const v = row.variants[0];
    const parts = [];
    const rawStrength = v.strength || v.dosage || v.dosage_per_vial;
    if (rawStrength !== null && rawStrength !== undefined) {
      const s = typeof rawStrength === 'object'
        ? (rawStrength.value || rawStrength.label || null)
        : String(rawStrength);
      if (s) parts.push(s);
    }
    const pres = v.presentation;
    if (pres && typeof pres === 'string') {
      parts.push(PRESENTATION_LABELS[pres] || pres);
    }
    
    let summary = parts.length > 0 ? parts.join(' · ') : '';
    
    if (numVariants > 1) {
      if (summary) summary += ` (+ ${numVariants - 1} more variant${numVariants > 2 ? 's' : ''})`;
      else summary = `${numVariants} variants`;
    }

    return summary || null;
  }

  return `${numVariants} variant${numVariants !== 1 ? 's' : ''}`;
}

/* ── Stock / status ─────────────────────────────────────────────── */
function getStockStatus(row) {
  if (row.isActive === false || row.status === 'inactive' || row.status === 'archived') return 'paused';
  if (row.totalStock === null || row.totalStock === undefined) return 'active';
  return row.totalStock > 0 ? 'active' : 'out of stock';
}

/* ── Supplier name ──────────────────────────────────────────────── */
function resolveSupplierName(s, supplierIdToName) {
  if (!s) return null;
  if (typeof s === 'string') return supplierIdToName?.[s] || s;
  if (typeof s === 'object') {
    return s.name || s.companyName || s.displayName ||
           supplierIdToName?.[s.id] || s.id || null;
  }
  return null;
}

function getSupplierSummary(row, supplierIdToName) {
  if (row.supplierName) return row.supplierName;
  if (row.supplierId) {
    const resolved = resolveSupplierName(row.supplierId, supplierIdToName);
    if (resolved) return resolved;
  }
  const suppliers = row.suppliers || [];
  if (!suppliers.length) return null;
  const first = resolveSupplierName(suppliers[0], supplierIdToName);
  if (suppliers.length === 1) return first;
  return first ? `${first} +${suppliers.length - 1}` : `${suppliers.length} suppliers`;
}

/* ── First clinical goal label ──────────────────────────────────── */
function getFirstGoal(row) {
  const goals = row.goals || row.goalIds || [];
  if (!goals.length) return null;
  const g = goals[0];
  const id = typeof g === 'string' ? g : g?.id || null;
  return id ? getGoalLabel(id) : null;
}

/* ── Category display label ─────────────────────────────────────── */
function getCatLabel(row, getCategoryLabel) {
  const cat = row.category;
  if (!cat) return null;
  return getCategoryLabel ? getCategoryLabel(cat) : cat;
}

/* ═══════════════════════════════════════════════════════════════════
   Card component
═══════════════════════════════════════════════════════════════════ */
const LONG_PRESS_MS = 500;

export default function MobileCatalogCard({
  row,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
}) {
  const meta = row?.__catalogMeta || {};
  const { supplierIdToName = {}, getCategoryLabel } = meta;

  const name           = row.canonicalName || row.name || '—';
  const catLabel       = getCatLabel(row, getCategoryLabel);
  const goalLabel      = getFirstGoal(row);
  const variantSummary = getVariantSummary(row);
  const supplier       = getSupplierSummary(row, supplierIdToName);
  const minPrice       = getMinPrice(row);
  const priceLabel     = formatPrice(minPrice);
  const stockStatus    = getStockStatus(row);
  const metaLine       = [catLabel, goalLabel].filter(Boolean).join(' · ') || null;

  /* ── Long-press detection ──────────────────────────────────────── */
  const longPressTimer = useRef(null);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      onLongPress?.();
    }, LONG_PRESS_MS);
  }, [onLongPress]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  /* ── Tap handler: selection mode vs normal ─────────────────────── */
  const handleCardTap = useCallback((e) => {
    cancelLongPress();
    if (selectionMode) {
      onToggleSelect?.();
    } else {
      onRowClick?.(row);
    }
  }, [selectionMode, onToggleSelect, onRowClick, row, cancelLongPress]);

  const swipeActions = {
    left: [
      {
        icon: <ShoppingCart size={20} />,
        label: 'Order',
        color: '#16a34a',
        onClick: () => onQuickAction && onQuickAction('menu', row) // Replace with order/add to cart action if needed
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
      className={`mcc-card${isSelected ? ' mcc-card--selected' : ''}`}
      onClick={handleCardTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardTap(e);
        }
      }}
      aria-label={`${name}${metaLine ? `, ${metaLine}` : ''}${priceLabel ? `, ${priceLabel}` : ''}`}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection checkbox (always visible) */}
      <div
        className="mcc-checkbox-container"
        onClick={(e) => {
          // If not in selection mode, tapping the checkbox directly starts it
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

      <CategoryIcon category={row.category} />

      <div className="mcc-body">
        <div className="mcc-name" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ flex: '1 1 auto', minWidth: '140px', wordBreak: 'break-word', lineHeight: '1.25' }}>{name}</span>
          {row.scientificData?.molecularWeight && (
            <span style={{ background: 'rgba(0,54,102,0.06)', color: 'var(--primary, #003666)', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {String(row.scientificData.molecularWeight).replace(/\s*g\/mol/i, '')} g/mol
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
          {/* Multi-type chips from availableTypes[] */}
          {getProductAvailableTypes(row).map(t => {
            const CHIP = {
              finished_product:  { label: 'Finished',   bg: 'rgba(29,78,216,0.08)', color: '#1d4ed8', border: 'rgba(29,78,216,0.2)', icon: '📦' },
              raw_material:      { label: 'Bulk API',   bg: 'rgba(22,163,74,0.1)',  color: '#16a34a', border: 'rgba(22,163,74,0.2)',  icon: '🧪' },
              clinical_supplies: { label: 'Clinical',   bg: 'rgba(71,85,105,0.08)', color: '#475569', border: 'rgba(71,85,105,0.2)', icon: '💉' },
              diagnostic:        { label: 'Diagnostic', bg: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: 'rgba(124,58,237,0.2)', icon: '🧬' },
              service:           { label: 'Service',    bg: 'rgba(217,119,6,0.08)', color: '#d97706', border: 'rgba(217,119,6,0.2)',  icon: '⚙️' },
            }[t] || { label: t, bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: '📋' };
            return (
              <span key={t} style={{ background: CHIP.bg, color: CHIP.color, fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', border: `1px solid ${CHIP.border}` }}>
                {CHIP.icon} {CHIP.label}
              </span>
            );
          })}
          {goalLabel && (
            <span style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0284c7', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
              {goalLabel}
            </span>
          )}
          {catLabel && (
            <span style={{ background: 'rgba(100, 116, 139, 0.08)', color: '#475569', fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
              {catLabel}
            </span>
          )}
        </div>

        {variantSummary && (
          <div className="mcc-detail" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{variantSummary}</div>
        )}

        {supplier && (
          <div className="mcc-supplier">{supplier}</div>
        )}

        <div className="mcc-footer">
          {priceLabel && (
            <span className="mcc-price">{priceLabel}</span>
          )}
          {stockStatus && (
            <StatusBadge status={stockStatus} compact />
          )}
        </div>
      </div>

      {/* Right side: quick action button OR chevron */}
      {!selectionMode ? (
        <div className="mcc-right">
          {onQuickAction && (
            <button
              className="mcc-quick-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction('menu', row);
              }}
              aria-label={`Actions for ${name}`}
            >
              <MoreVertical size={16} />
            </button>
          )}
          <div className="mcc-chevron" aria-hidden="true">
            <ChevronRight size={16} />
          </div>
        </div>
      ) : (
        <div style={{ width: 28 }} />
      )}
    </div>
    </SwipeableCard>
  );
}
