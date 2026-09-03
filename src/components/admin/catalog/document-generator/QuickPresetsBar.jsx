'use client';
import React from 'react';
import { PRESETS } from '@/hooks/admin/useDocumentGeneratorState';
import { Sparkles, Check } from 'lucide-react';

export default function QuickPresetsBar({ activePreset, applyPreset, isMobile }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: isMobile ? '10px 12px' : '12px 16px',
      marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={15} color="#003666" />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick 1-Click Templates
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
          Select a preset to auto-configure all options
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: 8,
      }}>
        {PRESETS.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '8px 10px',
                borderRadius: 8,
                border: `1.5px solid ${isActive ? '#003666' : '#cbd5e1'}`,
                background: isActive ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: isActive ? '0 2px 4px rgba(0,54,102,0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 2 }}>
                <span style={{ fontSize: '1rem' }}>{p.icon}</span>
                {isActive ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.66rem', color: '#1e40af', fontWeight: 700 }}>
                    <Check size={12} strokeWidth={3} /> ACTIVE
                  </span>
                ) : (
                  <span style={{ fontSize: '0.62rem', color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                    {p.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: isActive ? '#003666' : '#1e293b', lineHeight: 1.2 }}>
                {p.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2, lineHeight: 1.15 }}>
                {p.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
