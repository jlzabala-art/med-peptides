"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Layers, ChevronDown, Plus, Check, User, Building2, Stethoscope } from '@/lib/icons';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import toast from 'react-hot-toast';

export default function WorkspaceTopBarControl({ iconBtnStyle = {} }) {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    toggleDrawer,
    setDrawerOpen,
    createWorkspace,
    getTotalItemCount
  } = useWorkspaceStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const workspaceList = Object.values(workspaces || {});
  const activeWs = workspaces[activeWorkspaceId] || workspaceList[0];
  const activeIndex = workspaceList.findIndex(w => w.id === (activeWs?.id || activeWorkspaceId));
  const totalItems = getTotalItemCount();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Global Keyboard Shortcuts (⌥1, ⌥2, ⌥3 / Alt+1, Alt+2, Alt+3)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (e.key === '1' || e.code === 'Digit1') {
          e.preventDefault();
          if (workspaceList[0]) {
            setActiveWorkspace(workspaceList[0].id);
            toast.success(`Workspace 1: ${workspaceList[0].name || 'Activo'} (⌥1)`, { id: 'ws-switch' });
          }
        } else if (e.key === '2' || e.code === 'Digit2') {
          e.preventDefault();
          if (workspaceList[1]) {
            setActiveWorkspace(workspaceList[1].id);
            toast.success(`Workspace 2: ${workspaceList[1].name || 'Activo'} (⌥2)`, { id: 'ws-switch' });
          }
        } else if (e.key === '3' || e.code === 'Digit3') {
          e.preventDefault();
          if (workspaceList[2]) {
            setActiveWorkspace(workspaceList[2].id);
            toast.success(`Workspace 3: ${workspaceList[2].name || 'Activo'} (⌥3)`, { id: 'ws-switch' });
          }
        } else if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          toggleDrawer();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceList, setActiveWorkspace, toggleDrawer]);

  const activeRecipientName = activeWs?.targetEntity?.name || activeWs?.targetEntity?.companyName;
  const displayName = activeRecipientName || activeWs?.name || 'Workspace';

  const getRecipientIcon = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('clinic')) return <Building2 size={12} color="#0d9488" />;
    if (t.includes('doctor') || t.includes('physician')) return <Stethoscope size={12} color="#0284c7" />;
    if (t.includes('wholesaler')) return <Building2 size={12} color="#c2410c" />;
    return <User size={12} color="#7c3aed" />;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* ── Main TopBar Trigger Pill ── */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(0, 54, 102, 0.15)',
          padding: '2px 4px 2px 8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginLeft: '0.35rem',
          transition: 'all 0.15s ease'
        }}
      >
        {/* Click to open Drawer */}
        <button
          type="button"
          onClick={toggleDrawer}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            color: '#003666',
            fontWeight: 700,
            fontSize: '0.78rem',
            lineHeight: 1
          }}
          title={`Abrir Workspace (${displayName}) • Atajo: ⌥W`}
        >
          <Briefcase size={15} color="#003666" style={{ flexShrink: 0 }} />

          {/* Active Workspace Label (Hidden on small mobile) */}
          <span
            className="hide-mobile"
            style={{
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {displayName}
          </span>

          {/* Slot Badge: e.g. "1/3" or "2/3" */}
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '1px 5px',
              borderRadius: '10px'
            }}
          >
            {activeIndex >= 0 ? activeIndex + 1 : 1}/{Math.max(workspaceList.length, 1)}
          </span>

          {/* Staged Items Count */}
          {totalItems > 0 && (
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '10px'
              }}
            >
              {totalItems}
            </span>
          )}
        </button>

        {/* Dropdown Toggle Chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(prev => !prev);
          }}
          style={{
            background: 'none',
            border: 'none',
            borderLeft: '1px solid #e2e8f0',
            marginLeft: '4px',
            padding: '2px 4px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            color: '#64748b'
          }}
          title="Ver los 3 Workspaces Activos (⌥1, ⌥2, ⌥3)"
        >
          <ChevronDown size={13} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
        </button>
      </div>

      {/* ── Dropdown Switcher Popover ── */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '280px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '8px',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Workspaces Activos ({workspaceList.length}/3)
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Atajo: ⌥1 / ⌥2 / ⌥3
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
            {workspaceList.map((ws, idx) => {
              const isCurrent = ws.id === activeWs?.id;
              const target = ws.targetEntity;
              const wsClientName = target?.name || target?.companyName || ws.name || `Workspace ${idx + 1}`;
              const wsItemsCount = (ws.items || []).length;
              const subtotal = (ws.items || []).reduce((sum, it) => sum + ((it.quantity || 1) * (it.price || it.unitPrice || 0)), 0);

              return (
                <div
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws.id);
                    setIsDropdownOpen(false);
                    setDrawerOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: isCurrent ? '#eff6ff' : '#ffffff',
                    border: isCurrent ? '1.5px solid #bfdbfe' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        backgroundColor: isCurrent ? '#2563eb' : '#f1f5f9',
                        color: isCurrent ? '#ffffff' : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {target?.type && getRecipientIcon(target.type)}
                        <span style={{ fontSize: '0.80rem', fontWeight: isCurrent ? 700 : 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {wsClientName}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {wsItemsCount} {wsItemsCount === 1 ? 'compuesto' : 'compuestos'} • ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <kbd
                      style={{
                        fontSize: '0.64rem',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontFamily: 'monospace'
                      }}
                    >
                      ⌥{idx + 1}
                    </kbd>
                    {isCurrent && <Check size={14} color="#2563eb" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Workspace if under limit */}
          {workspaceList.length < 3 && (
            <button
              type="button"
              onClick={() => {
                const newId = createWorkspace(`Workspace ${workspaceList.length + 1}`, 'sell');
                setActiveWorkspace(newId);
                setIsDropdownOpen(false);
                setDrawerOpen(true);
                toast.success('Nuevo Workspace creado ✓');
              }}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                backgroundColor: '#fafafa',
                color: '#0284c7',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Plus size={13} /> Nuevo Workspace ({workspaceList.length}/3)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
