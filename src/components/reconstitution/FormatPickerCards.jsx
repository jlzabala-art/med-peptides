"use client";

import React from 'react';
import { CheckCircle2 } from '@/lib/icons';

/**
 * FormatPickerCards
 * ─────────────────────────────────────────────────────────────────────────────
 * Patient-friendly 3-card visual format selector with clear miniature illustrations
 * distinguishing Lyophilized Vial vs Pre-filled Pen vs Standalone 3 mL Refill Cartridge.
 */
export default function FormatPickerCards({
  options = [],
  activeFormatId = 'vial',
  onSelectFormat,
  lang = 'en',
}) {
  const isEs = lang === 'es';

  const renderGraphic = (id, active) => {
    const stroke = active ? '#1a73e8' : '#64748b';
    const accent = active ? '#e8f0fe' : '#f1f5f9';

    if (id === 'vial') {
      return (
        <svg viewBox="0 0 64 48" width="54" height="40" aria-hidden="true">
          <rect x="20" y="6" width="24" height="6" rx="2" fill={active ? '#1a73e8' : '#94a3b8'} />
          <rect x="23" y="12" width="18" height="4" fill="#cbd5e1" />
          <rect x="16" y="16" width="32" height="26" rx="5" fill={accent} stroke={stroke} strokeWidth="2" />
          <rect x="19" y="28" width="26" height="11" rx="2" fill={active ? '#bae6fd' : '#e2e8f0'} />
          <line x1="22" y1="22" x2="42" y2="22" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );
    }
    if (id === 'pen') {
      return (
        <svg viewBox="0 0 64 48" width="54" height="40" aria-hidden="true">
          <line x1="6" y1="24" x2="14" y2="24" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <rect x="14" y="19" width="14" height="10" rx="2" fill={active ? '#bae6fd' : '#e2e8f0'} stroke={stroke} strokeWidth="1.6" />
          <rect x="28" y="17" width="24" height="14" rx="3" fill={accent} stroke={stroke} strokeWidth="2" />
          <rect x="36" y="21" width="9" height="6" rx="1.5" fill="#ffffff" stroke={stroke} strokeWidth="1.2" />
          <rect x="52" y="19" width="6" height="10" rx="2" fill={active ? '#1a73e8' : '#94a3b8'} />
        </svg>
      );
    }
    // Cartridge (3 mL refill)
    return (
      <svg viewBox="0 0 64 48" width="54" height="40" aria-hidden="true">
        <rect x="10" y="19" width="6" height="10" rx="1.5" fill={active ? '#16a34a' : '#94a3b8'} />
        <rect x="16" y="16" width="34" height="16" rx="3" fill={accent} stroke={stroke} strokeWidth="2" />
        <rect x="18" y="19" width="22" height="10" rx="1.5" fill={active ? '#bbf7d0' : '#e2e8f0'} />
        <rect x="42" y="18" width="6" height="12" rx="1" fill="#334155" />
        <path d="M 52 24 L 58 24 M 55 21 L 58 24 L 55 27" stroke={active ? '#16a34a' : '#64748b'} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '10px',
    }}>
      {options.map((opt) => {
        const isActive = activeFormatId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectFormat?.(opt.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: isActive ? '2px solid #1a73e8' : '1.5px solid #e2e8f0',
              background: isActive ? '#f0f7ff' : '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.16s ease',
              boxShadow: isActive ? '0 4px 12px rgba(26, 115, 232, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.03)',
              position: 'relative',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {renderGraphic(opt.id, isActive)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: isActive ? '#003666' : '#0f172a' }}>
                  {isEs ? opt.nameEs : opt.name}
                </span>
                {isActive && <CheckCircle2 size={14} color="#1a73e8" style={{ flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: '0.73rem', color: isActive ? '#1e40af' : '#64748b', marginTop: '2px', lineHeight: 1.35 }}>
                {isEs ? opt.descEs : opt.descEn}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
