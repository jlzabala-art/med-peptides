import React from 'react';
import { Upload, FileCheck, Download } from '@/lib/icons';

export default function DocumentsTab({ rx }) {
  const documents = rx.documents || rx.attachments || [];

  if (documents.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          gap: '1.25rem',
          border: '2px dashed #e2e8f0',
          borderRadius: '14px',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Upload size={28} color="#6366f1" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.35rem 0', color: '#334155', fontWeight: 700 }}>
            No Documents Attached
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8', maxWidth: 300 }}>
            Upload patient consent forms, lab results, or supporting clinical documents.
          </p>
          <button
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Upload size={14} /> Upload Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {documents.map((doc, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileCheck size={20} color="#3b82f6" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
              {doc.name || `Document ${i + 1}`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.15rem' }}>
              {doc.type || 'PDF'} · {doc.uploadedAt || 'Unknown date'}
            </div>
          </div>
          <button
            style={{
              padding: '0.4rem',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Download size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
