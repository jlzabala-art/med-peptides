'use client';

import React from 'react';
import { X, Check, Filter, RefreshCw } from '@/lib/icons';

/**
 * MobileFiltersSheet
 * ─────────────────────────────────────────────────────────────────────────────
 * A bottom sheet designed specifically for mobile ergonomics (Golden Rule #23).
 * Provides large touch targets (min 48px) for filtering datasets with one thumb.
 */
export default function MobileFiltersSheet({
  isOpen,
  onClose,
  filterOptions = [],
  activeFilters = [],
  onResetAll
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 10001,
          animation: 'fadeIn 0.15s ease-out'
        }}
      />

      {/* Sheet Container */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          zIndex: 10002,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
          animation: 'sheetSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Handle bar */}
        <div style={{ padding: '0.75rem 0 0.25rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#cbd5e1' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--color-primary, #003666)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Filter & Refine
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div style={{
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {filterOptions.map((group, groupIdx) => {
            const isMulti = group.multiSelect;
            const currentVal = isMulti ? (group.values || []) : (group.value || '');

            return (
              <div key={group.key || group.id || `grp-${groupIdx}`}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  marginBottom: '0.65rem'
                }}>
                  {group.label}
                </label>

                {/* Option Pills / Large Touch Targets */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {group.options?.map((opt) => {
                    const isSelected = isMulti 
                      ? currentVal.includes(opt.value)
                      : String(currentVal) === String(opt.value);

                    const handleSelect = () => {
                      if (isMulti) {
                        const newVals = isSelected
                          ? currentVal.filter(v => v !== opt.value)
                          : [...currentVal, opt.value];
                        group.onChange(newVals);
                      } else {
                        group.onChange(opt.value);
                      }
                    };

                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={handleSelect}
                        style={{
                          minHeight: '44px',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          color: isSelected ? 'var(--color-primary, #003666)' : '#334155',
                          fontSize: '0.92rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} color="var(--color-primary, #003666)" />}
                        <span>{opt.label}</span>
                        {opt.count !== undefined && (
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                            color: isSelected ? '#1e40af' : '#64748b'
                          }}>
                            {opt.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div style={{
          padding: '1rem 1.25rem calc(1rem + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          gap: '0.75rem',
          backgroundColor: '#ffffff'
        }}>
          {onResetAll && (
            <button
              onClick={onResetAll}
              style={{
                flex: 1,
                minHeight: '48px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} />
              Reset All
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              flex: 2,
              minHeight: '48px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: 'var(--color-primary, #003666)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.98rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 54, 102, 0.3)'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
