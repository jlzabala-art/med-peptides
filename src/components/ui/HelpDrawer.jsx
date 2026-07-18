import React from 'react';
import { X, ExternalLink, Book, HelpCircle } from 'lucide-react';

export default function HelpDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          zIndex: 9998
        }}
        onClick={onClose}
      />
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '360px',
          backgroundColor: 'var(--bg-app, #fff)',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <HelpCircle size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Support & Documentation</h3>
          </div>
          <button 
            onClick={onClose}
            className="gcp-btn-secondary"
            style={{ padding: '6px', border: 'none', background: 'transparent' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Press <strong>?</strong> anywhere in the app to open this help panel.
          </p>

          <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-primary)', fontSize: '0.9rem', padding: '12px', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <Book size={16} />
              Platform Guidelines
              <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-primary)', fontSize: '0.9rem', padding: '12px', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <Book size={16} />
              API Documentation
              <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
