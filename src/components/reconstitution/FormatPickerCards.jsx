"use client";

import React from 'react';
import { CheckCircle2 } from '@/lib/icons';

/**
 * FormatPickerCards
 * ─────────────────────────────────────────────────────────────────────────────
 * Patient-friendly visual format selector with clear miniature illustrations
 * covering all ready-to-use peptide formats: Lyophilized Vial, Injector Pen (3 mL),
 * Refill Cartridge (3 mL), Nasal Spray, Oral Capsules/Troches, and Topical Serum/Cream.
 */
export default function FormatPickerCards({
  options = [],
  recommendedFormatIds = [],
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
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <rect x="17" y="5" width="22" height="5" rx="2" fill={active ? '#1a73e8' : '#94a3b8'} />
          <rect x="20" y="10" width="16" height="4" fill="#cbd5e1" />
          <rect x="13" y="14" width="30" height="24" rx="5" fill={accent} stroke={stroke} strokeWidth="1.8" />
          <rect x="16" y="25" width="24" height="10" rx="2" fill={active ? '#bae6fd' : '#e2e8f0'} />
        </svg>
      );
    }
    if (id === 'pen') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <line x1="4" y1="22" x2="12" y2="22" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <rect x="12" y="17" width="13" height="10" rx="2" fill={active ? '#bae6fd' : '#e2e8f0'} stroke={stroke} strokeWidth="1.5" />
          <rect x="25" y="15" width="21" height="14" rx="3" fill={accent} stroke={stroke} strokeWidth="1.8" />
          <rect x="32" y="19" width="8" height="6" rx="1.5" fill="#ffffff" stroke={stroke} strokeWidth="1.1" />
          <rect x="46" y="17" width="6" height="10" rx="2" fill={active ? '#1a73e8' : '#94a3b8'} />
        </svg>
      );
    }
    if (id === 'cartridge') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <rect x="8" y="17" width="5" height="10" rx="1.5" fill={active ? '#16a34a' : '#94a3b8'} />
          <rect x="13" y="14" width="31" height="16" rx="3" fill={accent} stroke={stroke} strokeWidth="1.8" />
          <rect x="15" y="17" width="20" height="10" rx="1.5" fill={active ? '#bbf7d0' : '#e2e8f0'} />
          <rect x="37" y="16" width="5" height="12" rx="1" fill="#334155" />
          <path d="M 46 22 L 52 22 M 49 19 L 52 22 L 49 25" stroke={active ? '#16a34a' : '#64748b'} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id === 'spray') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <path d="M 24 6 L 32 6 L 34 15 L 22 15 Z" fill={active ? '#a855f7' : '#94a3b8'} />
          <rect x="16" y="15" width="24" height="5" rx="2" fill="#cbd5e1" />
          <rect x="18" y="20" width="20" height="19" rx="4" fill={active ? '#faf5ff' : '#f1f5f9'} stroke={active ? '#9333ea' : '#64748b'} strokeWidth="1.8" />
          <circle cx="28" cy="2" r="1.2" fill="#9333ea" />
          <circle cx="22" cy="4" r="1" fill="#9333ea" />
          <circle cx="34" cy="4" r="1" fill="#9333ea" />
        </svg>
      );
    }
    if (id === 'capsule') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <rect x="10" y="15" width="36" height="14" rx="7" fill={active ? '#ecfdf5' : '#f1f5f9'} stroke={active ? '#0d9488' : '#64748b'} strokeWidth="1.8" />
          <path d="M 28 15 L 39 15 A 7 7 0 0 1 39 29 L 28 29 Z" fill={active ? '#0d9488' : '#94a3b8'} />
        </svg>
      );
    }
    // Topical Serum / Cream
    return (
      <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
        <rect x="23" y="6" width="10" height="7" rx="2" fill={active ? '#d97706' : '#94a3b8'} />
        <line x1="28" y1="8" x2="36" y2="8" stroke={active ? '#d97706' : '#94a3b8'} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="17" y="13" width="22" height="25" rx="5" fill={active ? '#fffbeb' : '#f1f5f9'} stroke={active ? '#d97706' : '#64748b'} strokeWidth="1.8" />
        <rect x="20" y="21" width="16" height="12" rx="2" fill={active ? '#fde68a' : '#e2e8f0'} />
      </svg>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
      gap: '9px',
    }}>
      {options.map((opt) => {
        const isActive = activeFormatId === opt.id;
        const isRecommended = recommendedFormatIds.length > 0 && recommendedFormatIds.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectFormat?.(opt.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '11px',
              border: isActive ? '2px solid #1a73e8' : isRecommended ? '1.5px solid #cbd5e1' : '1px dashed #cbd5e1',
              background: isActive ? '#f0f7ff' : '#ffffff',
              opacity: isActive || isRecommended || recommendedFormatIds.length === 0 ? 1 : 0.78,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.16s ease',
              boxShadow: isActive ? '0 4px 12px rgba(26, 115, 232, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {renderGraphic(opt.id, isActive)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isActive ? '#003666' : '#0f172a', lineHeight: 1.2 }}>
                  {isEs ? opt.nameEs : opt.name}
                </span>
                {isActive && <CheckCircle2 size={14} color="#1a73e8" style={{ flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: '0.70rem', color: isActive ? '#1e40af' : '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                {isEs ? opt.shortEs : opt.shortEn}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
