import X from "lucide-react/dist/esm/icons/x";
import React, { useEffect } from 'react';

import './ui.css';

export default function ContextualSidePanel({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = '400px'
}) {
  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
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
      {/* Mobile overlay - non-blocking on desktop if desired, but typically we want at least a subtle backdrop or we can make it purely non-blocking */}
      <div 
        className="side-panel-overlay mobile-only" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div 
        className="contextual-side-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : `-${width}`,
          width: window.innerWidth < 768 ? '100%' : width,
          height: '100vh',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border)'
        }}
        role="dialog"
        aria-modal="false" // non-blocking on desktop
        aria-label={title}
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '20px 24px',
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
              padding: '4px',
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
    </>
  );
}