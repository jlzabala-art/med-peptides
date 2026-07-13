"use client";
import React, { useEffect } from 'react';
import './ui.css';
import { X } from '@/lib/icons';

export default function ContextualSidePanel({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = '400px'
}) {
  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="side-panel-overlay" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999,
          animation: 'drawerFadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div 
        className="contextual-side-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: width,
          maxWidth: '100%',
          height: '100vh',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border)',
          animation: 'drawerSlideInFromRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: 'max(20px, env(safe-area-inset-top)) 24px 20px 24px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--background)'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '4px'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
      
      <style>{`
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlideInFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .contextual-side-panel {
            width: 100vw !important;
          }
        }
      `}</style>
    </>
  );
}
