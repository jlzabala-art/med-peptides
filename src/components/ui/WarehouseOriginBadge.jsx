"use client";

import React from 'react';
import { Package, Snowflake, Building2, Globe } from 'lucide-react';

/**
 * WarehouseOriginBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders standardized badges for Multi-Origin fulfillment (EU, China, Dubai)
 * and cold-chain temperature control.
 */
export function WarehouseOriginBadge({ origin = '', size = 'md' }) {
  if (!origin) return null;
  const low = String(origin).toLowerCase();

  let flag = '🌐';
  let label = origin;
  let bg = '#f8fafc';
  let color = '#475569';
  let border = '#e2e8f0';

  if (low.includes('eu') || low.includes('europe') || low.includes('poland') || low.includes('spain')) {
    flag = '🇪🇺';
    label = 'EU Warehouse';
    bg = '#eff6ff';
    color = '#1d4ed8';
    border = '#bfdbfe';
  } else if (low.includes('china') || low.includes('cn') || low.includes('asia')) {
    flag = '🇨🇳';
    label = 'China Warehouse';
    bg = '#fef2f2';
    color = '#b91c1c';
    border = '#fecaca';
  } else if (low.includes('dubai') || low.includes('uae') || low.includes('ae') || low.includes('dhcc')) {
    flag = '🇦🇪';
    label = 'Dubai DHCC';
    bg = '#f0fdf4';
    color = '#15803d';
    border = '#bbf7d0';
  } else if (low.includes('us') || low.includes('usa')) {
    flag = '🇺🇸';
    label = 'US Warehouse';
    bg = '#faf5ff';
    color = '#6b21a8';
    border = '#e9d5ff';
  }

  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: isSmall ? '0.15rem 0.45rem' : '0.25rem 0.6rem',
      borderRadius: '6px',
      fontSize: isSmall ? '0.7rem' : '0.75rem',
      fontWeight: 700,
      backgroundColor: bg,
      color: color,
      border: `1px solid ${border}`,
      whiteSpace: 'nowrap'
    }}>
      <span>{flag}</span>
      <span>{label}</span>
    </span>
  );
}

/**
 * ColdChainBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders thermal compliance badge (2-8°C, Dry Ice, or Ambient).
 */
export function ColdChainBadge({ required = true, range = '2_8_c', size = 'md' }) {
  if (!required) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.6rem',
        borderRadius: '6px',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        fontWeight: 700,
        backgroundColor: '#f8fafc',
        color: '#64748b',
        border: '1px solid #e2e8f0'
      }}>
        <Package size={12} /> Ambient
      </span>
    );
  }

  const isFrozen = range === 'minus_20_c' || range === 'dry_ice';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.6rem',
      borderRadius: '6px',
      fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
      fontWeight: 700,
      backgroundColor: isFrozen ? '#f0f9ff' : '#e0f2fe',
      color: isFrozen ? '#0369a1' : '#0284c7',
      border: '1px solid #bae6fd',
      whiteSpace: 'nowrap'
    }}>
      <Snowflake size={12} style={{ color: '#0284c7' }} />
      <span>{isFrozen ? '❄️ -20°C Dry Ice' : '❄️ 2°C – 8°C Cold Chain'}</span>
    </span>
  );
}

export default WarehouseOriginBadge;
