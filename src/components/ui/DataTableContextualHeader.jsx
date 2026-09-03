"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Sparkles, Edit3, Combine, Play, Pause, FileText, MoreHorizontal } from 'lucide-react';

export default function DataTableContextualHeader({
  selectedCount = 0,
  bulkActions = [],
  renderBatchActions,
  selectedIds = [],
  onClearSelection
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Split actions into top 3 primary actions and the rest in "More actions"
  const primaryActions = bulkActions.slice(0, 3);
  const secondaryActions = bulkActions.slice(3);

  // Clean label helper: remove trailing (X) counter if present in label
  const cleanLabel = (label) => {
    if (!label) return '';
    return label.replace(/\s*\(\d+\)\s*$/, '').trim();
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: '40px',
        padding: '2px 8px',
        backgroundColor: '#f0fdf4',
        fontFamily: 'var(--font-sans, inherit)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Left: Count + Divider + Primary Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* 1. Informational text (Styled Badge) */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: 700,
          color: '#0f766e',
          fontSize: '0.8rem',
          backgroundColor: '#ccfbf1',
          padding: '3px 8px',
          borderRadius: '12px',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}>
          {selectedCount} selected
        </span>

        <span style={{ color: '#cbd5e1', fontWeight: 300, userSelect: 'none' }}>|</span>

        {/* Custom renderBatchActions fallback if passed */}
        {renderBatchActions && bulkActions.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {renderBatchActions(selectedIds)}
          </div>
        ) : (
          primaryActions.map((action, idx) => {
            const IconComponent = action.icon;
            const isPrimary = idx === 0;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                title={cleanLabel(action.label)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '6px',
                  backgroundColor: isPrimary ? '#0f766e' : '#ffffff',
                  border: isPrimary ? 'none' : '1px solid #cbd5e1',
                  color: isPrimary ? '#ffffff' : '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isPrimary ? '#0d6460' : '#f8fafc';
                  e.currentTarget.style.borderColor = isPrimary ? 'transparent' : '#0f766e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isPrimary ? '#0f766e' : '#ffffff';
                  e.currentTarget.style.borderColor = isPrimary ? 'transparent' : '#cbd5e1';
                }}
              >
                {IconComponent && <IconComponent size={14} style={{ color: isPrimary ? '#ffffff' : '#0f766e', flexShrink: 0 }} />}
                {cleanLabel(action.label)}
              </button>
            );
          })
        )}

        {/* 3. Secondary Actions Dropdown */}
        {secondaryActions.length > 0 && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMoreOpen(prev => !prev);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#0f766e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <MoreHorizontal size={14} style={{ color: '#64748b' }} />
              More actions
              <ChevronDown size={13} style={{ color: '#64748b' }} />
            </button>

            {moreOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)',
                  border: '1px solid #cbd5e1',
                  zIndex: 999,
                  minWidth: '190px',
                  padding: '4px 0',
                  overflow: 'hidden'
                }}
              >
                {secondaryActions.map((action, idx) => {
                  const IconComp = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMoreOpen(false);
                        action.onClick?.();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#1e293b',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {IconComp && <IconComp size={14} style={{ color: '#64748b' }} />}
                      {cleanLabel(action.label)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Clear Selection Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClearSelection?.();
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#64748b',
          fontWeight: 600,
          fontSize: '0.78rem',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#be123c'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
      >
        <X size={14} />
        Clear
      </button>
    </div>
  );
}
