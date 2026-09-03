"use client";
/**
 * MobileDoctorCard
 * Premium mobile card for the Physicians/Doctors table.
 * Shows: avatar initials, name, specialty, clinic, patient & Rx counts, status.
 * Long-press → selection mode. Tap ⋮ → quick actions sheet.
 */

import React, { useRef, useCallback } from 'react';
import { MoreVertical, Check, Stethoscope, Users, Building2, Mail } from '@/lib/icons';
import StatusBadge from '../../ui/StatusBadge';

const LONG_PRESS_MS = 500;

/* ── Deterministic teal-family avatar colors for doctors ─────────── */
const AVATAR_COLORS = [
  ['#0d9488', '#f0fdfa'], ['#0369a1', '#e0f2fe'], ['#1d4ed8', '#eff6ff'],
  ['#7c3aed', '#f5f3ff'], ['#065f46', '#d1fae5'], ['#0f766e', '#ccfbf1'],
  ['#1e40af', '#dbeafe'], ['#4338ca', '#e0e7ff'],
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
  return { initials: initials || 'DR', fg, bg };
}

function capitalizeName(str = '') {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export default function MobileDoctorCard({
  row: d,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
}) {
  const name = capitalizeName(
    d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Unnamed Physician'
  );
  const { initials, fg, bg } = avatarProps(name);
  const specialty = d.specialty || 'General';
  const clinic = d.clinicName || d.clinic || null;
  const email = d.email || null;
  const status = d.isArchived ? 'archived' : (d.status || 'active');
  const patientCount = d.patientCount ?? d.patients ?? null;
  const rxCount = d.rxCount ?? d.prescriptionCount ?? null;

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
    else onRowClick?.(d);
  }, [selectionMode, onToggleSelect, onRowClick, d, cancelLongPress]);

  return (
    <div
      className={`mdc-card${isSelected ? ' mdc-card--selected' : ''}`}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } }}
      aria-label={`Dr. ${name}, ${specialty}`}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection circle */}
      {selectionMode && (
        <div className="mdc-selection-circle" aria-hidden="true">
          {isSelected && <Check size={12} strokeWidth={3} />}
        </div>
      )}

      {/* Avatar */}
      <div
        className="mdc-avatar"
        style={{ background: bg, color: fg }}
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Body */}
      <div className="mdc-body">
        {/* Name */}
        <div className="mdc-name">Dr. {name}</div>

        {/* Specialty • Clinic */}
        <div className="mdc-meta">
          <Stethoscope size={11} />
          <span>{specialty}</span>
          {clinic && (
            <>
              <span className="mdc-dot" aria-hidden="true">·</span>
              <Building2 size={11} />
              <span>{clinic}</span>
            </>
          )}
        </div>

        {/* Email */}
        {email && (
          <div className="mdc-email">
            <Mail size={11} />
            <span>{email}</span>
          </div>
        )}

        {/* Stats */}
        {(patientCount !== null || rxCount !== null) && (
          <div className="mdc-stats">
            {patientCount !== null && (
              <span className="mdc-stat">
                <Users size={11} /> {patientCount} patient{patientCount !== 1 ? 's' : ''}
              </span>
            )}
            {rxCount !== null && (
              <span className="mdc-stat">{rxCount} Rx</span>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      {!selectionMode ? (
        <div className="mdc-right">
          <StatusBadge status={status} compact />
          {onQuickAction && (
            <button
              className="mdc-quick-btn"
              onClick={(e) => { e.stopPropagation(); onQuickAction('menu', d); }}
              aria-label={`Actions for Dr. ${name}`}
            >
              <MoreVertical size={15} />
            </button>
          )}
        </div>
      ) : (
        <div style={{ width: 24 }} />
      )}
    </div>
  );
}
