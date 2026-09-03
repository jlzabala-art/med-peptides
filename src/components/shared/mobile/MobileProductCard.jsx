"use client";

import React, { useRef, useCallback, useState } from 'react';
import { Share2, Tag, Layers, CheckSquare, Square, MoreVertical, ExternalLink, Printer } from '@/lib/icons';
import StatusBadge from '../../ui/StatusBadge';
import AppStatusToggle from '../../ui/AppStatusToggle';
import SwipeableCard from '../../ui/SwipeableCard';
import { triggerHaptic } from '../../../utils/haptics';

const LONG_PRESS_MS = 500;

export default function MobileProductCard({
  row,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
  onUpdateProduct,
  isAdmin = true,
}) {
  const name = row.name || row.displayName || 'Unnamed Product';
  const category = row.category || row.therapeutic_category || 'Peptide';
  const dosage = row.dosage || (row.variants?.length ? `${row.variants.length} Variants` : '10 mg');
  const sku = row.sku || row.id || '';
  const qrScans = row.qrScans || row.analytics?.qrScans || 0;
  const isActive = row.isActive !== false;

  const [copiedSku, setCopiedSku] = useState(false);

  /* Long-press for selection */
  const timer = useRef(null);
  const handleTouchStart = useCallback(() => {
    timer.current = setTimeout(() => {
      triggerHaptic('medium');
      onLongPress?.();
    }, LONG_PRESS_MS);
  }, [onLongPress]);

  const cancelLongPress = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleTap = useCallback(() => {
    cancelLongPress();
    triggerHaptic('light');
    if (selectionMode) onToggleSelect?.();
    else onRowClick?.(row);
  }, [selectionMode, onToggleSelect, onRowClick, row, cancelLongPress]);

  const handleCopySku = async (e) => {
    e.stopPropagation();
    triggerHaptic('copy');
    await navigator.clipboard.writeText(sku).catch(() => {});
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 1500);
  };

  const handleToggleActive = (newStatus) => {
    triggerHaptic('medium');
    onUpdateProduct?.(row.id, { isActive: newStatus });
  };

  const swipeActions = {
    left: [
      {
        icon: <Share2 size={18} />,
        label: 'Share / QR',
        color: '#2563eb',
        onClick: () => {
          triggerHaptic('tap');
          onQuickAction?.('share', row);
        },
      },
    ],
    right: [
      {
        icon: <ExternalLink size={18} />,
        label: 'Open /p/',
        color: '#0d9488',
        onClick: () => {
          triggerHaptic('tap');
          window.open(`/p/${row.slug || row.id}`, '_blank', 'noopener');
        },
      },
    ],
  };

  return (
    <SwipeableCard {...swipeActions}>
      <div
        className={`mpc-card${isSelected ? ' mpc-card--selected' : ''}`}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        role="button"
        tabIndex={0}
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: '14px',
          border: isSelected ? '1.5px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          padding: '0.9rem 1rem',
          marginBottom: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          userSelect: 'none',
        }}
      >
        {/* Top Row: SKU, Category pill, Active Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {selectionMode && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('tap');
                  onToggleSelect?.();
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#003666' : '#94a3b8',
                }}
              >
                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
            )}

            <span
              onClick={handleCopySku}
              style={{
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: copiedSku ? '#16a34a' : '#64748b',
                background: copiedSku ? '#dcfce7' : '#f1f5f9',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              title="Tap to copy SKU"
            >
              {copiedSku ? '✓ Copied' : (sku.length > 14 ? sku.substring(0, 12) + '…' : sku)}
            </span>

            <span style={{
              background: '#eff6ff',
              color: '#1e40af',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
            }}>
              {category}
            </span>
          </div>

          {/* Touch-Friendly Toggle (44px target) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: '44px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <AppStatusToggle
              isActive={isActive}
              isLocked={!isAdmin}
              onToggle={handleToggleActive}
            />
          </div>
        </div>

        {/* Middle Row: Product Name & Dosage */}
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
            {name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>{dosage}</span>
            {row.supplierName && (
              <>
                <span>·</span>
                <span style={{ color: '#0d9488', fontWeight: 500 }}>{row.supplierName}</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Metrics & Quick Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '0.55rem',
          marginTop: '0.2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: qrScans > 0 ? '#2563eb' : '#94a3b8',
              background: qrScans > 0 ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${qrScans > 0 ? '#bfdbfe' : '#e2e8f0'}`,
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
            }}>
              📱 {qrScans} scans
            </span>

            <StatusBadge status={isActive ? 'active' : 'inactive'} compact />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                window.open(`/api/vial-label/${row.id}?format=38x90`, '_blank', 'noopener');
              }}
              title="Print Thermal Label"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <Printer size={15} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://regenpept.com'}/p/${row.slug || row.id}`;
                const text = `${name} — Clinical Information\n${publicUrl}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
              }}
              title="Share on WhatsApp"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                background: '#25d366',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </SwipeableCard>
  );
}
