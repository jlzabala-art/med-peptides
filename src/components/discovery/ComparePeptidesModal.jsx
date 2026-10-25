"use client";

import X from "lucide-react/dist/esm/icons/x";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import React, { useEffect } from 'react';

import ComparePeptidesBlock from './ComparePeptidesBlock';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

export default function ComparePeptidesModal({ isOpen, onClose, block, allProducts }) {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen]);

  if (!isOpen || !block) return null;

  return (
    <div 
      className="atlas-bottom-sheet-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="atlas-bottom-sheet-modal-panel"
        style={{
          width: '100%',
          maxWidth: '900px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="atlas-bottom-sheet-handle" />

        {/* Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary, #003666)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <ShieldCheck size={22} /> Compare Peptides
          </h2>
          <button 
            onClick={onClose} 
            aria-label="Close" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '1px solid var(--border, #e2e8f0)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted, #64748b)' }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <ComparePeptidesBlock block={block} allProducts={allProducts} />
        </div>
      </div>
    </div>
  );
}
