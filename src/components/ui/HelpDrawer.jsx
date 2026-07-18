import React from 'react';
import { ExternalLink, Book, HelpCircle } from 'lucide-react';
import StandardDrawer from './StandardDrawer';

export default function HelpDrawer({ isOpen, onClose }) {
  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} />
          <span>Support & Documentation</span>
        </div>
      }
      width="360px"
      bodyPadding="1.5rem"
    >
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
    </StandardDrawer>
  );
}
