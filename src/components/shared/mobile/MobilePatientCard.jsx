"use client";
/**
 * MobilePatientCard
 * Premium mobile card for the Patients table.
 * Shows: avatar, name, email, program, physician, status.
 * Long-press → selection mode. Tap ⋮ → quick actions sheet.
 */

import React, { useRef, useCallback } from 'react';
import { MoreVertical, Check, User, Phone, Mail, FileText, ClipboardList, Square, CheckSquare } from '@/lib/icons';
import StatusBadge from '../../ui/StatusBadge';
import SwipeableCard from '../../ui/SwipeableCard';

/* ── Deterministic avatar color from name ────────────────────────── */
const AVATAR_COLORS = [
  ['#1e40af', '#dbeafe'], ['#065f46', '#d1fae5'], ['#7c3aed', '#ede9fe'],
  ['#92400e', '#fef3c7'], ['#9d174d', '#fce7f3'], ['#0369a1', '#e0f2fe'],
  ['#4338ca', '#e0e7ff'], ['#166534', '#dcfce7'],
];

function avatarProps(name = '') {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [fg, bg] = AVATAR_COLORS[code % AVATAR_COLORS.length];
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
  return { initials: initials || '?', fg, bg };
}

const LONG_PRESS_MS = 500;

export default function MobilePatientCard({
  row,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
}) {
  const name = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unnamed Patient';
  const { initials, fg, bg } = avatarProps(name);
  const status   = row.status || 'active';
  const email    = row.email || null;
  const phone    = row.phone || null;
  const program  = row.program || null;
  const physician = row.physician || null;

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
        icon: <ClipboardList size={20} />,
        label: 'Prescribe',
        color: '#16a34a',
        onClick: () => onQuickAction && onQuickAction('menu', row) // Replace with prescribe action if needed
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
      className={`mpc-card${isSelected ? ' mpc-card--selected' : ''}`}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } }}
      aria-label={`${name}${program ? `, ${program}` : ''}`}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection checkbox (always visible) */}
      <div
        className="mpc-checkbox-container"
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

      {/* Avatar */}
      <div
        className="mpc-avatar"
        style={{ background: bg, color: fg }}
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Body */}
      <div className="mpc-body">
        <div className="mpc-name">{name}</div>

        {(email || phone) && (
          <div className="mpc-contact">
            {email && (
              <span className="mpc-contact-item">
                <Mail size={11} /> {email}
              </span>
            )}
            {phone && (
              <span className="mpc-contact-item">
                <Phone size={11} /> {phone}
              </span>
            )}
          </div>
        )}

        <div className="mpc-meta-row">
          {program && <span className="mpc-tag">{program}</span>}
          {physician && <span className="mpc-physician">{physician}</span>}
        </div>
      </div>

      {/* Right side */}
      {!selectionMode ? (
        <div className="mpc-right">
          <StatusBadge status={status} compact />
          {onQuickAction && (
            <button
              className="mpc-quick-btn"
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
