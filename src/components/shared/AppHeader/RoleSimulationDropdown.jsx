import React, { useState, useRef, useEffect } from 'react';
import Users from 'lucide-react/dist/esm/icons/users';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Eye from 'lucide-react/dist/esm/icons/eye';
import X from 'lucide-react/dist/esm/icons/x';
import { useSimulationStore, ALL_ROLES } from '../../../stores/useSimulationStore';

/**
 * RoleSimulationDropdown
 * ─────────────────────────────────────────────────────────────────────────────
 * Header dropdown that lets an Admin view the app as any of the 11 roles.
 * Shows a "View As" button. On click, opens a role picker menu.
 * When a simulation is active, the button turns colored and shows the active role.
 */
export default function RoleSimulationDropdown() {
  const { simulatedRole, setSimulatedRole, exitSimulation } = useSimulationStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const activeRoleData = ALL_ROLES.find((r) => r.id === simulatedRole);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleSelect = (roleId) => {
    if (roleId === simulatedRole) {
      exitSimulation();
    } else {
      setSimulatedRole(roleId);
    }
    setIsOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <style>{`
        .role-sim-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--border, #e2e8f0);
          background: var(--color-bg-app, #fff);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary, #475569);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .role-sim-btn:hover {
          border-color: var(--primary, #2563eb);
          color: var(--primary, #2563eb);
          background: var(--primary-soft, #eff6ff);
        }
        .role-sim-btn.active {
          border-color: var(--sim-color, #6366f1);
          color: var(--sim-color, #6366f1);
          background: color-mix(in srgb, var(--sim-color, #6366f1) 10%, white);
        }
        .role-sim-exit {
          margin-left: 4px;
          display: inline-flex;
          align-items: center;
          padding: 2px;
          border-radius: 50%;
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          transition: background 0.15s;
        }
        .role-sim-exit:hover { background: rgba(0,0,0,0.08); }

        .role-sim-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 220px;
          background: var(--color-bg-app, #fff);
          border: 1.5px solid var(--border, #e2e8f0);
          border-radius: 12px;
          box-shadow: 0 12px 32px -4px rgba(0,0,0,0.14);
          z-index: 1000;
          overflow: hidden;
          animation: simDropIn 0.15s ease;
        }
        @keyframes simDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .role-sim-dropdown__header {
          padding: 0.75rem 1rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid var(--border, #f1f5f9);
        }
        .role-sim-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.55rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--text-main, #0f172a);
          transition: background 0.1s;
        }
        .role-sim-item:hover { background: var(--color-bg-subtle, #f8fafc); }
        .role-sim-item.selected {
          background: color-mix(in srgb, var(--item-color, #6366f1) 10%, white);
          font-weight: 600;
        }
        .role-sim-item__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .role-sim-item__check {
          margin-left: auto;
          font-size: 0.75rem;
          color: var(--item-color, #6366f1);
          font-weight: 700;
        }
        .role-sim-footer {
          border-top: 1px solid var(--border, #f1f5f9);
          padding: 0.5rem;
        }
        .role-sim-footer-btn {
          width: 100%;
          padding: 0.5rem;
          border: none;
          background: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.1s;
        }
        .role-sim-footer-btn:hover { background: var(--color-bg-subtle, #f1f5f9); }
      `}</style>

      {/* Trigger Button */}
      <button
        className={`role-sim-btn ${simulatedRole ? 'active' : ''}`}
        style={simulatedRole ? { '--sim-color': activeRoleData?.color } : {}}
        onClick={() => setIsOpen((o) => !o)}
        title="View app as different role"
      >
        {simulatedRole ? (
          <>
            <span>{activeRoleData?.emoji}</span>
            <span>Viewing as {activeRoleData?.label}</span>
          </>
        ) : (
          <>
            <Eye size={14} />
            <span>View As</span>
          </>
        )}
        <ChevronDown size={12} />

        {/* Exit button (inline) */}
        {simulatedRole && (
          <button
            className="role-sim-exit"
            title="Exit simulation"
            onClick={(e) => {
              e.stopPropagation();
              exitSimulation();
            }}
          >
            <X size={12} />
          </button>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="role-sim-dropdown">
          <div className="role-sim-dropdown__header">
            <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
            Simulate Role View
          </div>

          {ALL_ROLES.map((role) => {
            const isSelected = simulatedRole === role.id;
            return (
              <div
                key={role.id}
                className={`role-sim-item ${isSelected ? 'selected' : ''}`}
                style={{ '--item-color': role.color }}
                onClick={() => handleSelect(role.id)}
              >
                <span
                  className="role-sim-item__dot"
                  style={{ backgroundColor: role.color }}
                />
                <span>{role.emoji}</span>
                <span>{role.label}</span>
                {isSelected && <span className="role-sim-item__check">✓ Active</span>}
              </div>
            );
          })}

          {simulatedRole && (
            <div className="role-sim-footer">
              <button className="role-sim-footer-btn" onClick={() => { exitSimulation(); setIsOpen(false); }}>
                <X size={14} />
                Exit simulation — return to Admin view
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
