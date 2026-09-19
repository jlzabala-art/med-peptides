"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { useRoleAccess } from '../../../hooks/useRoleAccess';
import { useAuth } from '../../../context/AuthContext';
import { Briefcase, ArrowRight, Trash2, ChevronUp, ChevronDown } from '@/lib/icons';

export default function WorkspaceFloatingDock() {
  const pathname = usePathname() || '';
  const { user, isAuthenticated } = useAuth();
  const { is } = useRoleAccess();

  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    isDrawerOpen,
    setDrawerOpen,
  } = useWorkspaceStore();

  const isProfessional = is('admin') || 
    is('medical_director') || 
    is('doctor') || 
    is('clinic') || 
    is('wholesaler') || 
    is('supplier') || 
    is('compounding_pharmacy') || 
    is('account_manager') || 
    is('patient_coordinator') || 
    is('fagron_clinic');

  const isDoctor = is('doctor') || is('medical_director');

  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wsList = Object.values(workspaces || {});
  const activeWs = workspaces[activeWorkspaceId] || wsList[0] || null;

  const totalAllItems = Object.values(workspaces || {}).reduce(
    (acc, ws) => acc + (ws.items || []).reduce((s, it) => s + (it.quantity || 1), 0),
    0
  );

  // Check if current route is a public or unauthenticated page
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/proto/') ||
    pathname.startsWith('/protocol/') ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/quotation/') ||
    pathname.startsWith('/shared/') ||
    pathname.startsWith('/c/') ||
    pathname.startsWith('/what-are-peptides') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/session-ended') ||
    pathname.startsWith('/verify/');

  // Hide dock if:
  // 1. Not mounted / SSR
  // 2. Drawer is open
  // 3. Workspaces empty
  // 4. On public page
  // 5. Not authenticated or not a professional user
  if (
    !mounted || 
    typeof document === 'undefined' || 
    isDrawerOpen || 
    !activeWs || 
    totalAllItems === 0 ||
    isPublicRoute ||
    !isAuthenticated ||
    !user ||
    !isProfessional
  ) {
    return null;
  }

  const items = activeWs.items || [];
  const currentTotalAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const rate = Number(it.unitPrice || it.price || 0);
    return sum + (qty * rate);
  }, 0);

  const primaryColor = isDoctor ? '#0d9488' : '#003666';
  const buttonColor = isDoctor ? '#0f766e' : '#2563eb';
  const accentBorder = isDoctor ? '#99f6e4' : '#93c5fd';

  return createPortal(
    <div
      className="workspace-floating-dock-container"
      style={{
        position: 'fixed',
        zIndex: 9990,
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: `1.5px solid ${accentBorder}`,
        boxShadow: '0 12px 30px -4px rgba(0, 54, 102, 0.22), 0 8px 12px -6px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        animation: 'slideUpDock 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        @keyframes slideUpDock {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .workspace-floating-dock-container {
          bottom: 24px;
          right: 24px;
          max-width: 440px;
          width: calc(100% - 48px);
        }
        @media (max-width: 768px) {
          .workspace-floating-dock-container {
            bottom: calc(68px + env(safe-area-inset-bottom, 10px)) !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            max-width: none !important;
            border-radius: 12px !important;
          }
        }
      `}</style>

      {/* Workspace Tabs strip if multiple exist */}
      {wsList.length > 1 && (
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: isDoctor ? '#042f2e' : '#00284d',
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
                  backgroundColor: isActive ? primaryColor : 'rgba(255,255,255,0.1)',
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
          backgroundColor: primaryColor,
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
            <div style={{ fontSize: '0.7rem', color: isDoctor ? '#ccfbf1' : '#93c5fd' }}>
              {isDoctor
                ? '🩺 Clinical Staging'
                : (activeWs.intent === 'buy' ? '🏭 Buy Operation' : '💼 Sell Operation')} • ${currentTotalAmount.toLocaleString()} USD
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen(true);
            }}
            style={{
              padding: '7px 12px',
              minHeight: '36px',
              backgroundColor: buttonColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              touchAction: 'manipulation',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
            }}
          >
            Manage <ArrowRight size={13} />
          </button>
          <div style={{ color: isDoctor ? '#ccfbf1' : '#93c5fd', display: 'flex', alignItems: 'center' }}>
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
    </div>,
    document.body
  );
}
