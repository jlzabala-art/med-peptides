"use client";

import React, { useState } from 'react';
import { Briefcase, X, Plus, Edit2, Check, Copy, Trash2, Layers, Stethoscope } from '@/lib/icons';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function WorkspaceDrawerHeader({
  activeWs,
  wsList,
  onClose,
  onSetActiveWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDuplicateWorkspace,
  onClearWorkspace,
  onDeleteWorkspace,
  onOpenSaveKitModal,
  isDoctor = false,
  isWideDrawer = false,
  onToggleWideDrawer,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const items = activeWs?.items || [];
  const totalItemCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  const handleStartRename = () => {
    setNameInput(activeWs?.name || '');
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (nameInput.trim()) {
      onRenameWorkspace(activeWs.id, nameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        zIndex: 10,
      }}
    >
      {/* Mobile Top Drag Indicator */}
      <div className="workspace-mobile-drag-handle" style={{ display: 'none', justifyContent: 'center', paddingTop: '8px', paddingBottom: '4px' }}>
        <div style={{ width: '40px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '99px' }} />
      </div>

      {/* Primary Brand Top Bar */}
      <div style={{ padding: '0.85rem 1.15rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              backgroundColor: isDoctor ? 'rgba(13, 148, 136, 0.12)' : (activeWs?.intent === 'buy' ? 'rgba(194, 65, 12, 0.1)' : 'rgba(0, 54, 102, 0.08)'),
              color: isDoctor ? '#0d9488' : (activeWs?.intent === 'buy' ? '#c2410c' : '#003666'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isDoctor ? <Stethoscope size={20} /> : <Briefcase size={20} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap' }}>
                {isDoctor ? 'Clinical Prescribing Workspace' : 'Operational Workspace'}
              </h3>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '99px',
                  backgroundColor: isDoctor ? '#ccfbf1' : (activeWs?.intent === 'buy' ? '#ffedd5' : '#e0f2fe'),
                  color: isDoctor ? '#0f766e' : (activeWs?.intent === 'buy' ? '#9a3412' : '#0369a1'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {isDoctor ? 'CLINICAL RX' : (activeWs?.intent === 'buy' ? 'BUY' : 'SELL')}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              {isDoctor ? 'Stage compounds & generate prescriptions or protocols' : 'Multi-compound staging & document generator'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Laptop Expand/Collapse Width Toggle (GCP Console Style) */}
          {onToggleWideDrawer && (
            <button
              type="button"
              className="workspace-laptop-expand-btn"
              onClick={onToggleWideDrawer}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '9px',
                border: '1px solid #e2e8f0',
                backgroundColor: isWideDrawer ? '#eff6ff' : '#f8fafc',
                color: isWideDrawer ? '#1d4ed8' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                touchAction: 'manipulation',
              }}
              title={isWideDrawer ? 'Collapse width to 480px' : 'Expand width to 720px for dual-pane view'}
            >
              {isWideDrawer ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          {/* Close Button with generous 44px touch target */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '9px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              touchAction: 'manipulation',
            }}
            title="Close workspace"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Multi-Workspace Horizontal Tab Switcher */}
      <div
        style={{
          padding: '0 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {wsList.map((ws) => {
          const isActive = ws.id === activeWs?.id;
          const count = (ws.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => onSetActiveWorkspace(ws.id)}
              style={{
                padding: '5px 10px',
                borderRadius: '7px',
                border: `1.5px solid ${isActive ? '#003666' : '#cbd5e1'}`,
                backgroundColor: isActive ? '#003666' : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                fontSize: '0.74rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
                touchAction: 'manipulation',
              }}
            >
              <span>{ws.name}</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  padding: '1px 5px',
                  borderRadius: '99px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#475569',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onCreateWorkspace()}
          style={{
            padding: '5px 8px',
            borderRadius: '7px',
            border: '1px dashed #94a3b8',
            backgroundColor: '#ffffff',
            color: '#0284c7',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            flexShrink: 0,
            touchAction: 'manipulation',
          }}
          title="Create a new draft workspace"
        >
          <Plus size={13} /> New Tab
        </button>
      </div>

      {/* Active Tab Sub-header: Inline Rename + Action Strip */}
      <div
        style={{
          padding: '6px 1.15rem 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#fafbfc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '160px' }}>
          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                style={{
                  padding: '4px 8px',
                  fontSize: '0.82rem',
                  border: '1.5px solid #0284c7',
                  borderRadius: '6px',
                  outline: 'none',
                  fontWeight: 700,
                  flex: 1,
                  minWidth: 0,
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
              />
              <button
                type="button"
                onClick={handleSaveRename}
                style={{ border: 'none', background: '#16a34a', color: 'white', padding: '6px 8px', borderRadius: '5px', cursor: 'pointer' }}
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                style={{ border: 'none', background: '#94a3b8', color: 'white', padding: '6px 8px', borderRadius: '5px', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {activeWs?.name}
              </span>
              <button
                type="button"
                onClick={handleStartRename}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px', borderRadius: '4px', flexShrink: 0 }}
                title="Rename workspace"
              >
                <Edit2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Quick Utilities: Save Kit, Duplicate, Clear, Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onOpenSaveKitModal}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#0284c7',
              borderRadius: '6px',
              border: '1px solid #bae6fd',
              backgroundColor: '#f0f9ff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
            title="Save current staged products as reusable kit"
          >
            <Layers size={11} /> Save Kit
          </button>
          <button
            type="button"
            onClick={() => onDuplicateWorkspace(activeWs?.id)}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
            }}
            title="Duplicate workspace"
          >
            <Copy size={11} /> Copy
          </button>
          <button
            type="button"
            onClick={() => onClearWorkspace(activeWs?.id)}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#dc2626',
              borderRadius: '6px',
              border: '1px solid #fca5a5',
              backgroundColor: '#fff5f5',
              cursor: 'pointer',
            }}
            title="Clear all staged items"
          >
            Clear
          </button>
          {wsList.length > 1 && (
            <button
              type="button"
              onClick={() => onDeleteWorkspace(activeWs?.id)}
              style={{
                padding: '4px 6px',
                fontSize: '0.72rem',
                color: '#dc2626',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
              title="Delete workspace"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
