import React from 'react';
import { X, CheckSquare } from 'lucide-react';

/**
 * BulkActionsBar
 *
 * A floating action bar that appears at the bottom of the screen when one or
 * more rows are selected. Fully reusable across all table views.
 *
 * @param {number}   selectedCount - Number of selected rows
 * @param {Function} onClear       - Callback to deselect all
 * @param {Array}    actions       - Array of { label, icon, onClick, variant? ('danger'|'default') }
 */
export default function BulkActionsBar({ selectedCount, onClear, actions = [] }) {
  if (selectedCount === 0) return null;

  return (
    <>
      <style>{`
        @keyframes bulkBarSlideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        .bulk-bar-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: #fff;
          transition: background 0.15s ease, transform 0.1s ease;
          white-space: nowrap;
        }
        .bulk-bar-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        .bulk-bar-btn.danger {
          background: rgba(239,68,68,0.3);
          border-color: rgba(239,68,68,0.5);
        }
        .bulk-bar-btn.danger:hover {
          background: rgba(239,68,68,0.5);
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          animation: 'bulkBarSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 0.75rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)',
          backdropFilter: 'blur(8px)',
          flexWrap: 'wrap',
          maxWidth: 'calc(100vw - 2rem)',
        }}
      >
        {/* Count badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            background: 'rgba(99,102,241,0.35)',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#c7d2fe',
            fontSize: '0.8rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <CheckSquare size={14} />
          {selectedCount} selected
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'rgba(255,255,255,0.12)',
            margin: '0 0.25rem',
          }}
        />

        {/* Action buttons */}
        {actions.map((action, i) => (
          <button
            key={i}
            className={`bulk-bar-btn${action.variant === 'danger' ? ' danger' : ''}`}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon && React.cloneElement(action.icon, { size: 14 })}
            {action.label}
          </button>
        ))}

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'rgba(255,255,255,0.12)',
            margin: '0 0.25rem',
          }}
        />

        {/* Clear selection */}
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'color 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          title="Clear selection"
        >
          <X size={16} />
        </button>
      </div>
    </>
  );
}
