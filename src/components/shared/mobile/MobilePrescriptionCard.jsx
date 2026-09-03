"use client";
/**
 * MobilePrescriptionCard
 * Premium mobile card for the Prescriptions table.
 * Shows: Rx ID, patient, doctor, status, items count, source, date.
 * Long-press → selection mode. Tap ⋮ → quick actions sheet.
 */

import React, { useRef, useCallback } from 'react';
import { MoreVertical, Check, FileText, Package, Calendar, Stethoscope, Play, Square, CheckSquare } from '@/lib/icons';
import StatusBadge from '../../ui/StatusBadge';
import SwipeableCard from '../../ui/SwipeableCard';

/* ── Source badge config ─────────────────────────────────────────── */
const SOURCE_META = {
  fagron:    { label: 'Fagron',      color: '#db2777', bg: '#fdf2f8' },
  document:  { label: 'Doc Upload',  color: '#2563eb', bg: '#eff6ff' },
  protocol:  { label: 'Protocol',    color: '#0d9488', bg: '#f0fdfa' },
  items:     { label: 'Items',       color: '#7c3aed', bg: '#f5f3ff' },
  ai_report: { label: 'AI Report',   color: '#4f46e5', bg: '#eef2ff' },
  manual:    { label: 'Manual',      color: '#475569', bg: '#f8fafc' },
};

function formatDate(ts) {
  if (!ts) return null;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d)) return null;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

const LONG_PRESS_MS = 500;

export default function MobilePrescriptionCard({
  row: rx,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
}) {
  const patient  = rx.patient?.name || rx.patientName || 'Unknown Patient';
  const doctor   = rx.doctor?.name  || rx.doctorName  || null;
  const status   = rx.status || 'draft';
  const source   = (rx.source || 'manual').toLowerCase().trim();
  const srcMeta  = SOURCE_META[source] || SOURCE_META.manual;
  const items    = rx._isSessionGroup ? rx._sessionCount : (rx.items || rx.compounds || []).length;
  const dateStr  = formatDate(rx.createdAt);
  const rxCode   = rx._isSessionGroup ? 'Group' : (rx.rxCode || rx.id?.slice(0, 8)?.toUpperCase() || '—');

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
    else onRowClick?.(rx);
  }, [selectionMode, onToggleSelect, onRowClick, rx, cancelLongPress]);

  const swipeActions = {
    left: [
      {
        icon: <Play size={20} />,
        label: 'Process',
        color: '#16a34a',
        onClick: () => onQuickAction && onQuickAction('menu', rx) // Replace with process/approve action if needed
      }
    ],
    right: [
      {
        icon: <FileText size={20} />,
        label: 'Details',
        color: '#2563eb',
        onClick: () => onQuickAction && onQuickAction('menu', rx) // Replace with view details
      }
    ]
  };

  return (
    <SwipeableCard {...swipeActions}>
    <div
      className={`mrxc-card${isSelected ? ' mrxc-card--selected' : ''}`}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } }}
      aria-label={`Prescription ${rxCode}, ${patient}`}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection checkbox (always visible) */}
      <div
        className="mrxc-checkbox-container"
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

      {/* Rx icon / source badge column */}
      <div className="mrxc-icon-col" aria-hidden="true">
        <div className="mrxc-icon">
          <FileText size={24} strokeWidth={1.5} />
        </div>
        <span
          className="mrxc-source"
          style={{ background: srcMeta.bg, color: srcMeta.color }}
        >
          {srcMeta.label}
        </span>
      </div>

      {/* Body */}
      <div className="mrxc-body">
        <div className="mrxc-patient">{patient}</div>
        {rx._isSessionGroup && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#db2777', background: '#fdf2f8', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '2px', width: 'fit-content' }}>
            {rx.treatmentProgram || 'Session Group'}
          </div>
        )}
        {!rx._isSessionGroup && rx.treatmentType && (
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
            {rx.treatmentType}
          </div>
        )}

        {doctor && (
          <div className="mrxc-doctor">
            <Stethoscope size={11} />
            {doctor}
          </div>
        )}

        <div className="mrxc-meta-row">
          {items > 0 && (
            <span className="mrxc-items">
              <Package size={11} /> {items} item{items !== 1 ? 's' : ''}
            </span>
          )}
          {dateStr && (
            <span className="mrxc-date">
              <Calendar size={11} /> {dateStr}
            </span>
          )}
        </div>
      </div>

      {/* Right side: status + action */}
      {!selectionMode ? (
        <div className="mrxc-right">
          {!rx._isSessionGroup ? <StatusBadge status={status} compact /> : <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Expand</span>}
          {onQuickAction && !rx._isSessionGroup && (
            <button
              className="mrxc-quick-btn"
              onClick={(e) => { e.stopPropagation(); onQuickAction('menu', rx); }}
              aria-label={`Actions for prescription ${rxCode}`}
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
