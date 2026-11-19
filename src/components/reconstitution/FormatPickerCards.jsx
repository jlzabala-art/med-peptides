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
  availableFormatIds = null,
  recommendedFormatIds = [],
  activeFormatId = 'vial',
  onSelectFormat,
  lang = 'en',
}) {
  const isEs = lang === 'es';
  const enabledList = Array.isArray(availableFormatIds)
    ? availableFormatIds
    : (Array.isArray(recommendedFormatIds) ? recommendedFormatIds : []);

  const renderGraphic = (id, active, available) => {
    const stroke = !available ? '#94a3b8' : (active ? '#1a73e8' : '#475569');
    const accent = !available ? '#f1f5f9' : (active ? '#e8f0fe' : '#f1f5f9');

    if (id === 'vial') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <rect x="17" y="5" width="22" height="5" rx="2" fill={active && available ? '#1a73e8' : '#94a3b8'} />
          <rect x="20" y="10" width="16" height="4" fill="#cbd5e1" />
          <rect x="13" y="14" width="30" height="24" rx="5" fill={accent} stroke={stroke} strokeWidth="1.8" />
          <rect x="16" y="25" width="24" height="10" rx="2" fill={active && available ? '#bae6fd' : '#e2e8f0'} />
        </svg>
      );
    }
    if (id === 'pen') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <line x1="4" y1="22" x2="12" y2="22" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <rect x="12" y="17" width="13" height="10" rx="2" fill={active && available ? '#bae6fd' : '#e2e8f0'} stroke={stroke} strokeWidth="1.5" />
          <rect x="25" y="15" width="21" height="14" rx="3" fill={accent} stroke={stroke} strokeWidth="1.8" />
          <rect x="32" y="19" width="8" height="6" rx="1.5" fill="#ffffff" stroke={stroke} strokeWidth="1.1" />
          <rect x="46" y="17" width="6" height="10" rx="2" fill={active && available ? '#1a73e8' : '#94a3b8'} />
        </svg>
      );
    }
    if (id === 'cartridge') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <rect x="8" y="17" width="5" height="10" rx="1.5" fill={active && available ? '#16a34a' : '#94a3b8'} />
          <rect x="13" y="14" width="31" height="16" rx="3" fill={accent} stroke={stroke} strokeWidth="1.8" />
          <rect x="15" y="17" width="20" height="10" rx="1.5" fill={active && available ? '#bbf7d0' : '#e2e8f0'} />
          <rect x="37" y="16" width="5" height="12" rx="1" fill={available ? '#334155' : '#94a3b8'} />
          <path d="M 46 22 L 52 22 M 49 19 L 52 22 L 49 25" stroke={active && available ? '#16a34a' : stroke} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id === 'spray') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <path d="M 24 6 L 32 6 L 34 15 L 22 15 Z" fill={active && available ? '#a855f7' : '#94a3b8'} />
          <rect x="16" y="15" width="24" height="5" rx="2" fill="#cbd5e1" />
          <rect x="18" y="20" width="20" height="19" rx="4" fill={active && available ? '#faf5ff' : '#f1f5f9'} stroke={active && available ? '#9333ea' : stroke} strokeWidth="1.8" />
          <circle cx="28" cy="2" r="1.2" fill={available ? '#9333ea' : '#94a3b8'} />
          <circle cx="22" cy="4" r="1" fill={available ? '#9333ea' : '#94a3b8'} />
          <circle cx="34" cy="4" r="1" fill={available ? '#9333ea' : '#94a3b8'} />
        </svg>
      );
    }
    if (id === 'capsule') {
      return (
        <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
          <rect x="10" y="15" width="36" height="14" rx="7" fill={active && available ? '#ecfdf5' : '#f1f5f9'} stroke={active && available ? '#0d9488' : stroke} strokeWidth="1.8" />
          <path d="M 28 15 L 39 15 A 7 7 0 0 1 39 29 L 28 29 Z" fill={active && available ? '#0d9488' : '#94a3b8'} />
        </svg>
      );
    }
    // Topical Serum / Cream
    return (
      <svg viewBox="0 0 56 44" width="46" height="36" aria-hidden="true">
        <rect x="23" y="6" width="10" height="7" rx="2" fill={active && available ? '#d97706' : '#94a3b8'} />
        <line x1="28" y1="8" x2="36" y2="8" stroke={active && available ? '#d97706' : '#94a3b8'} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="17" y="13" width="22" height="25" rx="5" fill={active && available ? '#fffbeb' : '#f1f5f9'} stroke={active && available ? '#d97706' : stroke} strokeWidth="1.8" />
        <rect x="20" y="21" width="16" height="12" rx="2" fill={active && available ? '#fde68a' : '#e2e8f0'} />
      </svg>
    );
  };

  const isOddCount = options.length % 2 === 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .atlas-format-picker-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }
        .atlas-format-picker-grid.is-odd-list {
          grid-template-columns: 1fr;
        }
        @media (max-width: 768px) {
          .atlas-format-picker-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .atlas-format-picker-grid.is-odd-list {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 440px) {
          .atlas-format-picker-grid {
            grid-template-columns: 1fr;
          }
        }
      ` }} />
      <div className={`atlas-format-picker-grid${isOddCount ? ' is-odd-list' : ''}`}>
      {options.map((opt) => {
        const isAvailable = enabledList.length === 0 ? true : enabledList.includes(opt.id);
        const isActive = isAvailable && activeFormatId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={!isAvailable}
            aria-disabled={!isAvailable}
            tabIndex={isAvailable ? 0 : -1}
            title={!isAvailable ? (isEs ? 'No disponible para este producto' : 'Not available for this product') : undefined}
            onClick={() => {
              if (!isAvailable) return;
              onSelectFormat?.(opt.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '11px',
              border: isActive
                ? '2px solid #1a73e8'
                : isAvailable
                  ? '1.5px solid #cbd5e1'
                  : '1px dashed #cbd5e1',
              background: isActive
                ? '#f0f7ff'
                : isAvailable
                  ? '#ffffff'
                  : '#f8fafc',
              opacity: isAvailable ? 1 : 0.45,
              filter: isAvailable ? 'none' : 'grayscale(100%)',
              textAlign: 'left',
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              transition: 'all 0.16s ease',
              boxShadow: isActive
                ? '0 4px 12px rgba(26, 115, 232, 0.12)'
                : isAvailable
                  ? '0 1px 2px rgba(15, 23, 42, 0.04)'
                  : 'none',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {renderGraphic(opt.id, isActive, isAvailable)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: !isAvailable ? '#64748b' : isActive ? '#003666' : '#0f172a',
                  lineHeight: 1.2,
                }}>
                  {isEs ? opt.nameEs : opt.name}
                </span>
                {isActive && <CheckCircle2 size={14} color="#1a73e8" style={{ flexShrink: 0 }} />}
              </div>
              <div style={{
                fontSize: '0.70rem',
                color: !isAvailable ? '#94a3b8' : isActive ? '#1e40af' : '#64748b',
                marginTop: '2px',
                lineHeight: 1.3,
              }}>
                {!isAvailable
                  ? (isEs ? 'No disponible para este producto' : 'Not available for this product')
                  : (isEs ? opt.shortEs : opt.shortEn)}
              </div>
            </div>
          </button>
        );
      })}
      </div>
    </>
  );
}
