"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, User, Building2, Globe, ChevronDown, Plus } from '@/lib/icons';

/**
 * Unified Quote Quick Action Dropdown
 * Provides a single, elegant "Quote ▾" trigger that lets the user choose:
 * - Patient (B2C Treatment)
 * - Clinic (B2B Clinic Stock)
 * - Wholesaler (B2B Bulk Distribution)
 */
export default function QuoteQuickActionDropdown({
  entityContext = null,
  size = 'md',
  variant = 'primary', // 'primary', 'secondary', 'icon'
  buttonLabel = 'Quote',
  align = 'right'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 260;
    
    let left = align === 'right' ? (rect.right - menuWidth) : rect.left;
    if (left + menuWidth > window.innerWidth - 12) left = window.innerWidth - menuWidth - 12;
    if (left < 12) left = 12;

    setMenuCoords({
      top: rect.bottom + window.scrollY + 6,
      left: left + window.scrollX,
    });
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) calculatePosition();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', () => setIsOpen(false), true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', () => setIsOpen(false), true);
      };
    }
  }, [isOpen]);

  const handleSelect = (recipientType) => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
      detail: {
        recipientType,
        type: recipientType,
        ...entityContext
      }
    }));
  };

  const getButtonStyle = () => {
    if (variant === 'icon') {
      return {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.3rem',
        color: 'var(--color-primary, #0d9488)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        borderRadius: '6px'
      };
    }
    if (variant === 'secondary') {
      return {
        padding: size === 'sm' ? '0.35rem 0.75rem' : '0.5rem 1rem',
        fontSize: size === 'sm' ? '0.8rem' : '0.88rem',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface, #fff)',
        color: 'var(--text-main, #0f172a)',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      };
    }
    // Default primary
    return {
      padding: size === 'sm' ? '0.35rem 0.75rem' : '0.5rem 1rem',
      fontSize: size === 'sm' ? '0.8rem' : '0.88rem',
      borderRadius: '8px',
      border: '1px solid #0d9488',
      backgroundColor: '#0d9488',
      color: '#ffffff',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'all 0.15s ease'
    };
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        style={getButtonStyle()}
        title="Create commercial quotation"
      >
        <FileText size={size === 'sm' ? 14 : 16} />
        {variant !== 'icon' && <span>{buttonLabel}</span>}
        <ChevronDown size={13} style={{ opacity: 0.8, marginLeft: '1px' }} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            width: '270px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 99999,
            overflow: 'hidden',
            padding: '6px'
          }}
        >
          <div style={{ padding: '8px 10px 4px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            New Quotation For:
          </div>

          {/* Option 1: Patient */}
          <button
            onClick={() => handleSelect('patient')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              border: 'none',
              background: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdfa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ width: 30, height: 30, borderRadius: '8px', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <User size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Patient (B2C)</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>Personalized treatment & doctor Rx</div>
            </div>
          </button>

          {/* Option 2: Clinic */}
          <button
            onClick={() => handleSelect('clinic')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              border: 'none',
              background: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ width: 30, height: 30, borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <Building2 size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Clinic (B2B Stock)</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>In-clinic inventory & IV lounge supply</div>
            </div>
          </button>

          {/* Option 3: Wholesaler */}
          <button
            onClick={() => handleSelect('wholesaler')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              border: 'none',
              background: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff7ed'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ width: 30, height: 30, borderRadius: '8px', backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <Globe size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Wholesaler (B2B Bulk)</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>Master batch distribution & MOQ tier</div>
            </div>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
