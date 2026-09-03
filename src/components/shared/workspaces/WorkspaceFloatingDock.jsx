"use client";

import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { Briefcase, ArrowRight, Trash2, ChevronUp, ChevronDown, CheckCircle2, Plus } from 'lucide-react';

export default function WorkspaceFloatingDock() {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    createWorkspace,
    setDrawerOpen,
    clearWorkspaceItems
  } = useWorkspaceStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const wsList = Object.values(workspaces || {});
  const activeWs = workspaces[activeWorkspaceId] || wsList[0] || null;

  const totalAllItems = Object.values(workspaces || {}).reduce(
    (acc, ws) => acc + (ws.items || []).reduce((s, it) => s + (it.quantity || 1), 0),
    0
  );

  // If all workspaces are empty, hide the dock
  if (!activeWs || totalAllItems === 0) return null;

  const items = activeWs.items || [];
  const currentTotalAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const rate = Number(it.unitPrice || it.price || 0);
    return sum + (qty * rate);
  }, 0);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 90,
        maxWidth: '460px',
        width: 'calc(100% - 48px)',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #bfdbfe',
        boxShadow: '0 10px 25px -5px rgba(0, 54, 102, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Workspace Tabs strip if multiple exist */}
      {wsList.length > 1 && (
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: '#00284d',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginRight: '4px' }}>
            Workspaces:
          </span>
          {wsList.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            const count = (ws.items || []).reduce((s, it) => s + (it.quantity || 1), 0);

            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isActive ? '#003666' : 'rgba(255,255,255,0.1)',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{ws.name}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Dock Header */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#003666',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Briefcase size={16} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {activeWs.name} ({items.length} {items.length === 1 ? 'item' : 'items'})
            </div>
            <div style={{ fontSize: '0.7rem', color: '#93c5fd' }}>
              {activeWs.intent === 'buy' ? '🏭 Buy Operation' : '💼 Sell Operation'} • ${currentTotalAmount.toLocaleString()} USD
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen(true);
            }}
            style={{
              padding: '4px 10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Manage <ArrowRight size={13} />
          </button>
          <div style={{ color: '#93c5fd', display: 'flex', alignItems: 'center' }}>
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </div>
      </div>

      {/* Collapsible item preview */}
      {isExpanded && (
        <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '8px 12px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          {items.map((it, i) => (
            <div
              key={it.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                padding: '4px 0',
                borderBottom: i < items.length - 1 ? '1px solid #e2e8f0' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <span style={{ fontWeight: 600, color: '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {it.canonicalName}
                </span>
                {it.dosage && <span style={{ color: '#64748b', fontSize: '0.7rem', flexShrink: 0 }}>({it.dosage})</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ color: '#64748b' }}>×{it.quantity || 1}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  ${((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
