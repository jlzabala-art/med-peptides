"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore, ALL_ROLES } from '../../../stores/useSimulationStore';
import { PRICING_MARKETS, getPricingMarketMeta } from '../../../constants/roles';
import { Users, ChevronDown, Eye, X, Globe, Share2, Check } from '@/lib/icons';
import toast from 'react-hot-toast';

/**
 * RoleSimulationDropdown
 * ─────────────────────────────────────────────────────────────────────────────
 * Header dropdown that lets an Admin view the app as any Role + Market/Country.
 */
export default function RoleSimulationDropdown() {
  const { simulatedRole, simulatedMarket, setSimulatedRole, setSimulatedMarket, exitSimulation } = useSimulationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [creatingShare, setCreatingShare] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const ref = useRef(null);

  const handleGenerateSignedShareLink = async () => {
    if (creatingShare || typeof window === 'undefined') return;
    setCreatingShare(true);
    try {
      const route = window.location.pathname || '/pricing/peptides';
      const role = simulatedRole || 'wholesaler';
      const market = simulatedMarket || 'global';
      const res = await fetch('/api/shares/pricing-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route, role, market, ttlDays: 14 }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || 'Could not generate share link');
      }
      await navigator.clipboard.writeText(data.url);
      setCopiedShareUrl(true);
      toast.success(`Share link copied (${role} · ${market.toUpperCase()} · 14d)`);
      setTimeout(() => setCopiedShareUrl(false), 2500);
    } catch (err) {
      toast.error(err.message || 'Failed to create share link');
    } finally {
      setCreatingShare(false);
    }
  };

  const activeRoleData = ALL_ROLES.find((r) => r.id === simulatedRole);
  const activeMarketData = simulatedMarket ? getPricingMarketMeta(simulatedMarket) : null;
  const hasSimulation = Boolean(simulatedRole || simulatedMarket);

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
        className={`role-sim-btn ${hasSimulation ? 'active' : ''}`}
        style={hasSimulation ? { '--sim-color': activeRoleData?.color || '#0284c7' } : {}}
        onClick={() => setIsOpen((o) => !o)}
        title="View app as different role & market"
      >
        {hasSimulation ? (
          <>
            <span>{activeRoleData?.emoji || '🌍'}</span>
            <span>
              {activeRoleData ? activeRoleData.label : 'Admin'}
              {activeMarketData ? ` · ${activeMarketData.badge}` : ''}
            </span>
          </>
        ) : (
          <>
            <Eye size={14} />
            <span>View As</span>
          </>
        )}
        <ChevronDown size={12} />

        {/* Exit button (inline) */}
        {hasSimulation && (
          <span
            role="button"
            tabIndex={0}
            className="role-sim-exit"
            title="Exit simulation"
            onClick={(e) => {
              e.stopPropagation();
              exitSimulation();
            }}
          >
            <X size={12} />
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="role-sim-dropdown" style={{ minWidth: '250px' }}>
          {/* Market / Country Switcher */}
          <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={11} />
              <span>Market / Country Pricing</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
              {PRICING_MARKETS.map((mkt) => {
                const isMktSel = (simulatedMarket || 'global') === mkt.id;
                return (
                  <button
                    key={mkt.id}
                    type="button"
                    onClick={() => setSimulatedMarket(mkt.id)}
                    style={{
                      padding: '4px 7px',
                      borderRadius: '6px',
                      border: isMktSel ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                      background: isMktSel ? '#e8f0fe' : '#ffffff',
                      color: isMktSel ? '#1967d2' : '#334155',
                      fontSize: '0.72rem',
                      fontWeight: isMktSel ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{mkt.labelEn}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, opacity: 0.8 }}>{mkt.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="role-sim-dropdown__header">
            <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
            Simulate Role View
          </div>

          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
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
          </div>

          <div className="role-sim-footer" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              disabled={creatingShare}
              onClick={handleGenerateSignedShareLink}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: copiedShareUrl ? '#ecfdf5' : '#f8fafc',
                color: copiedShareUrl ? '#15803d' : '#0f172a',
                fontSize: '0.76rem',
                fontWeight: 650,
                cursor: creatingShare ? 'wait' : 'pointer',
              }}
            >
              {copiedShareUrl ? <Check size={13} /> : <Share2 size={13} />}
              <span>
                {creatingShare
                  ? 'Creating link...'
                  : copiedShareUrl
                    ? 'Private Link Copied ✓'
                    : `Share Link (${activeRoleData?.label?.split(' ')[0] || 'Wholesaler'} · ${(activeMarketData?.badge || 'GLB')})`}
              </span>
            </button>
            {hasSimulation && (
              <button className="role-sim-footer-btn" onClick={() => { exitSimulation(); setIsOpen(false); }}>
                <X size={14} />
                Exit simulation — return to Admin view
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
