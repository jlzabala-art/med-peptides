"use client";
/**
 * MobileSelectionBar
 * Floating fixed-bottom bar shown when cards are selected on mobile.
 * Portal-rendered above all content (z-index: 800).
 *
 * Props:
 *   count       : number of selected items
 *   onClear     : () => void — exits selection mode
 *   bulkActions : [{label, icon?, onClick, variant?}] — passed to MobileActionSheet
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from '@/lib/icons';
import MobileActionSheet from './MobileActionSheet';

export default function MobileSelectionBar({ count = 0, onClear, bulkActions = [] }) {
  const [showSheet, setShowSheet] = useState(false);

  if (count === 0 || typeof window === 'undefined') return null;

  return createPortal(
    <>
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: 'var(--color-primary, #003666)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.875rem)',
          zIndex: 800,
          boxShadow: '0 -4px 24px rgba(0,54,102,0.28)',
          animation: 'msbSlideUp 0.2s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>
          {count} selected
        </span>

        {bulkActions.length > 0 && (
          <button
            onClick={() => setShowSheet(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.30)',
              borderRadius: 8,
              padding: '0.5rem 1rem',
              color: 'white',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Bulk Actions <ChevronDown size={14} />
          </button>
        )}

        <button
          onClick={onClear}
          aria-label="Cancel selection"
          style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <X size={16} />
        </button>
      </div>

      <MobileActionSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        title="Bulk Actions"
        items={bulkActions}
      />

      <style>{`
        @keyframes msbSlideUp {
          from { transform: translateY(100%); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
      `}</style>
    </>,
    document.body
  );
}
