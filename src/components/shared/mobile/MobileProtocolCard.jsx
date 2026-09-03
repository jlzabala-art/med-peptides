"use client";
/**
 * MobileProtocolCard
 * Premium mobile card for the Protocols table.
 * Shows: icon, name, goals/category tags, phases, duration, status.
 * Long-press → selection mode. Tap ⋮ → quick actions sheet.
 */

import React, { useRef, useCallback } from 'react';
import { MoreVertical, Check, FlaskConical, Clock, Layers, ClipboardList, Edit3, Square, CheckSquare, Dna } from '@/lib/icons';
import StatusBadge from '../../ui/StatusBadge';
import SwipeableCard from '../../ui/SwipeableCard';
import { getGoalLabel } from '../../../config/goals';

const LONG_PRESS_MS = 500;

/* ── Goal color palette (subset of CLINICAL_GOALS colors) ───────── */
const GOAL_COLORS = [
  '#003666', '#0d9488', '#7c3aed', '#92400e', '#9d174d',
  '#0369a1', '#4338ca', '#166534',
];
function goalColor(label = '') {
  const code = [...label].reduce((a, c) => a + c.charCodeAt(0), 0);
  return GOAL_COLORS[code % GOAL_COLORS.length];
}

/* ── Status → display label map for protocols ───────────────────── */
function normalizeProtocolStatus(status) {
  if (!status) return 'draft';
  const s = status.toLowerCase();
  if (s === 'inactive' || s === 'paused') return 'paused';
  return s; // draft, active, archived
}

export default function MobileProtocolCard({
  row: p,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
}) {
  const name = p.name || p.title || 'Unnamed Protocol';
  const status = normalizeProtocolStatus(p.status);
  const rawGoals = (Array.isArray(p.goals) && p.goals.length > 0)
    ? p.goals
    : (Array.isArray(p.goalIds) && p.goalIds.length > 0)
      ? p.goalIds
      : (p.primary_goal || p.goal)
        ? [p.primary_goal || p.goal]
        : (p.therapeutic_category || p.category)
          ? [p.therapeutic_category || p.category]
          : ['Regenerative'];
  
  const goals = rawGoals.map(g => typeof g === 'string' ? (g.includes('_') ? (getGoalLabel ? getGoalLabel(g) : g) : g) : (g?.label || 'Clinical'));
  const hasPeptides = p.has_peptides || (Array.isArray(p.peptides) && p.peptides.length > 0) || (p.category?.toLowerCase().includes('peptide'));
  const category = p.category || p.therapeutic_category || null;
  const phases = (p.phases ?? []).length;
  const duration =
    p.protocol_duration_weeks ||
    p.duration_weeks ||
    p.durationWeeks ||
    (p.phases?.reduce((a, ph) => a + (ph.durationWeeks || ph.duration_weeks || 0), 0) ?? 0);
  const version = p.version_number ?? 1;

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
    else onRowClick?.(p);
  }, [selectionMode, onToggleSelect, onRowClick, p, cancelLongPress]);

  const swipeActions = {
    left: [
      {
        icon: <ClipboardList size={20} />,
        label: 'Assign',
        color: '#16a34a',
        onClick: () => onQuickAction && onQuickAction('menu', p) // Replace with assign action if needed
      }
    ],
    right: [
      {
        icon: <Edit3 size={20} />,
        label: 'Edit',
        color: '#2563eb',
        onClick: () => onRowClick?.(p)
      }
    ]
  };

  return (
    <SwipeableCard {...swipeActions}>
    <div
      className={`mptc-card${isSelected ? ' mptc-card--selected' : ''}`}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } }}
      aria-label={`Protocol ${name}`}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection checkbox (always visible) */}
      <div
        className="mptc-checkbox-container"
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
      <div className="mptc-icon" aria-hidden="true">
        <FlaskConical size={26} strokeWidth={1.5} />
      </div>

      {/* Body */}
      <div className="mptc-body">
        {/* Name + version */}
        <div className="mptc-name-row">
          <span className="mptc-name">{name}</span>
          <span className="mptc-version">v{version}</span>
        </div>

        {/* Goal tags or category */}
        {(goals || category || hasPeptides) && (
          <div className="mptc-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.35rem 0' }}>
            {hasPeptides && (
              <span
                className="mptc-tag"
                style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', fontWeight: 700, border: '1px solid rgba(124, 58, 237, 0.2)' }}
              >
                🧬 Peptides
              </span>
            )}
            {goals
              ? goals.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="mptc-tag"
                    style={{ background: `${goalColor(g)}15`, color: goalColor(g), fontWeight: 600 }}
                  >
                    {g}
                  </span>
                ))
              : <span className="mptc-tag mptc-tag--default">{category}</span>
            }
            {goals && goals.length > 2 && (
              <span className="mptc-tag mptc-tag--more">+{goals.length - 2}</span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="mptc-stats">
          {phases > 0 && (
            <span className="mptc-stat">
              <Layers size={11} /> {phases} phase{phases !== 1 ? 's' : ''}
            </span>
          )}
          {duration > 0 && (
            <span className="mptc-stat">
              <Clock size={11} /> {duration} wk{duration !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      {!selectionMode ? (
        <div className="mptc-right">
          <StatusBadge status={status} compact />
          {onQuickAction && (
            <button
              className="mptc-quick-btn"
              onClick={(e) => { e.stopPropagation(); onQuickAction('menu', p); }}
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
