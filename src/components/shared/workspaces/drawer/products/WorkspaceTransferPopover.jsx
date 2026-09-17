"use client";

import React from 'react';
import { X } from '@/lib/icons';
import notifier from '../../../../../services/NotificationService';

/**
 * WorkspaceTransferPopover
 * Small popover letting users move or copy an item to another active workspace or create a new one.
 */
export default function WorkspaceTransferPopover({
  it,
  activeWs,
  workspacesMap,
  isOpen,
  onClose,
  onMoveItem,
  onCopyItem,
}) {
  if (!isOpen) return null;

  const otherWorkspaces = Object.values(workspacesMap || {}).filter(
    (w) => w.id !== activeWs?.id
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        right: '30px',
        top: '28px',
        backgroundColor: '#ffffff',
        border: '1.5px solid #0284c7',
        borderRadius: '8px',
        padding: '8px',
        zIndex: 50,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        minWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '4px',
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>
          Transfer Compound
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
        >
          <X size={12} />
        </button>
      </div>

      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {otherWorkspaces.length === 0 ? (
          <span style={{ fontSize: '0.7rem', color: '#64748b', padding: '4px 0' }}>
            No other active workspaces
          </span>
        ) : (
          otherWorkspaces.map((ws) => (
            <div
              key={ws.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 6px',
                backgroundColor: '#f8fafc',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                fontSize: '0.72rem',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: '#003666',
                  maxWidth: '110px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {ws.name}
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onMoveItem(it.id, activeWs?.id, ws.id);
                    onClose();
                    notifier.info(`Moved to ${ws.name}`);
                  }}
                  style={{
                    padding: '2px 5px',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Move item to workspace"
                >
                  Move
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCopyItem(it.id, activeWs?.id, ws.id);
                    onClose();
                    notifier.info(`Copied to ${ws.name}`);
                  }}
                  style={{
                    padding: '2px 5px',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    backgroundColor: '#eff6ff',
                    color: '#0284c7',
                    border: '1px solid #bfdbfe',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Copy item to workspace"
                >
                  Copy
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          onMoveItem(it.id, activeWs?.id, 'new');
          onClose();
          notifier.info(`Moved to new workspace`);
        }}
        style={{
          padding: '5px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '5px',
          fontSize: '0.7rem',
          fontWeight: 800,
          color: '#15803d',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        + Move to New Workspace
      </button>
    </div>
  );
}
