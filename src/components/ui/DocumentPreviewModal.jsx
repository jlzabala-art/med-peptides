import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, fileUrl, title = "Document Preview" }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1000px',
        height: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{title}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {fileUrl && (
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px',
                  backgroundColor: '#e0f2fe', color: '#0369a1',
                  textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600
                }}
              >
                <ExternalLink size={16} /> Open in New Tab
              </a>
            )}
            <button 
              onClick={onClose}
              style={{
                background: 'none', border: 'none', padding: '0.5rem',
                cursor: 'pointer', color: '#64748b', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div style={{ flex: 1, backgroundColor: '#cbd5e1', position: 'relative' }}>
          {fileUrl ? (
            <iframe 
              src={fileUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Document Preview"
            />
          ) : (
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              color: '#64748b', textAlign: 'center' 
            }}>
              <p>No document URL provided.</p>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}
