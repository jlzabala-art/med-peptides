"use client";

import React from 'react';
import { GOAL_LABELS } from '../../constants/goalTypes';

/**
 * MobileGoalChipsBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Horizontal touch-scrollable chip filter bar for mobile viewports.
 * Displays all canonical goals for 1-tap thumb filtering.
 */
export default function MobileGoalChipsBar({ activeGoals = [], onToggleGoal }) {
  const goalsList = Object.keys(GOAL_LABELS).map(key => ({
    id: key,
    label: GOAL_LABELS[key]
  }));

  return (
    <div className="mobile-only mgc-container" style={{
      width: '100%',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      padding: '0.5rem 0.25rem',
      display: 'flex',
      gap: '0.4rem',
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none'
    }}>
      <style>{`
        .mgc-container::-webkit-scrollbar { display: none; }
        .mgc-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          border: 1px solid var(--color-border, #e2e8f0);
          background: var(--color-bg-surface, #ffffff);
          color: var(--color-text-secondary, #475569);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .mgc-chip--active {
          background: var(--color-primary, #003666);
          color: #ffffff;
          border-color: var(--color-primary, #003666);
          box-shadow: 0 2px 6px rgba(0, 54, 102, 0.2);
        }
      `}</style>
      {goalsList.map((g) => {
        const isActive = activeGoals.includes(g.id);
        return (
          <button
            key={g.id}
            className={`mgc-chip${isActive ? ' mgc-chip--active' : ''}`}
            onClick={() => onToggleGoal(g.id)}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}
