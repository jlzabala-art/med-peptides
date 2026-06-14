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
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9998, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out'
        }} 
      />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', pointerEvents: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <ShieldCheck size={24} /> Compare Peptides
            </h2>
            <button 
              onClick={onClose} 
              aria-label="Close" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'white', border: '1px solid var(--border)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '2rem' }}>
            <ComparePeptidesBlock block={block} allProducts={allProducts} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}