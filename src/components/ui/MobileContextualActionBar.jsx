"use client";
/**
 * MobileContextualActionBar
 * Sticky bottom bar shown when cards are selected on mobile.
 * Replaces the old generic "Bulk Actions" floating dropdown with direct actions.
 * Portal-rendered above all content.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from '@/lib/icons';
import MobileActionSheet from './MobileActionSheet';

export default function MobileContextualActionBar({ count = 0, bulkActions = [] }) {
  const [showSheet, setShowSheet] = useState(false);

  if (count === 0 || typeof window === 'undefined' || bulkActions.length === 0) return null;

  // Take up to 3 actions for direct placement.
  // We can prioritize based on the index.
  const directActions = bulkActions.slice(0, 3);
  const overflowActions = bulkActions.slice(3);

  return createPortal(
    <>
      <div
        className="mcab-container"
        role="group"
        aria-label="Bulk Actions"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: '#ffffff',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center actions or evenly distribute
          gap: '0.25rem',
          padding: '0.75rem 1rem',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.75rem)',
          zIndex: 800,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          animation: 'mcabSlideUp 0.25s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-evenly', alignItems: 'center' }}>
          {directActions.map((action, idx) => (
            <button
              key={idx}
              className="mcab-btn"
              onClick={action.onClick}
              aria-label={action.label}
              title={action.label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                padding: '0.25rem 0.5rem',
                minWidth: '60px'
              }}
            >
              {action.icon && <action.icon size={20} strokeWidth={1.5} />}
              <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{action.label}</span>
            </button>
          ))}

          {overflowActions.length > 0 && (
            <button
              className="mcab-btn"
              onClick={() => setShowSheet(true)}
              aria-label="More actions"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                padding: '0.25rem 0.5rem',
                minWidth: '60px'
              }}
            >
              <MoreHorizontal size={20} strokeWidth={1.5} />
              <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>More ⋯</span>
            </button>
          )}
        </div>
      </div>

      {overflowActions.length > 0 && (
        <MobileActionSheet
          isOpen={showSheet}
          onClose={() => setShowSheet(false)}
          title="More actions"
          items={overflowActions}
        />
      )}

      <style>{`
        @keyframes mcabSlideUp {
          from { transform: translateY(100%); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        .mcab-btn:active {
          opacity: 0.7;
        }
      `}</style>
    </>,
    document.body
  );
}
