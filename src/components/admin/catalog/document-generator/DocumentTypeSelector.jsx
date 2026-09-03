'use client';
import React from 'react';
import { DOC_TYPES } from '@/hooks/admin/useDocumentGeneratorState';

export default function DocumentTypeSelector({ value, onChange, isMobile }) {
  if (isMobile) {
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', marginBottom: 6 }}>
          Document Type
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: '#f1f5f9',
          padding: 3,
          borderRadius: 10,
          gap: 3,
        }}>
          {DOC_TYPES.map(t => {
            const isSelected = value === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange(t.value)}
                style={{
                  padding: '8px 4px',
                  background: isSelected ? '#ffffff' : 'transparent',
                  border: isSelected ? '1px solid #cbd5e1' : 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  color: isSelected ? '#003666' : '#64748b',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', marginBottom: 8 }}>
        Document Type
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {DOC_TYPES.map(t => {
          const isSelected = value === t.value;
          return (
            <div
              key={t.value}
              onClick={() => onChange(t.value)}
              style={{
                border: `2px solid ${isSelected ? '#003666' : '#e2e8f0'}`,
                background: isSelected ? '#f0f7ff' : '#ffffff',
                borderRadius: 10,
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 6px rgba(0,54,102,0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#003666' : '#1e293b' }}>
                  {t.label}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: isSelected ? '#334155' : '#64748b', lineHeight: 1.3 }}>
                {t.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
