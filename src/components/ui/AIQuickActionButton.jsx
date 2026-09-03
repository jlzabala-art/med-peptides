"use client";

import React from 'react';
import { Sparkles, Loader2 } from '@/lib/icons';

/**
 * AIQuickActionButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Standard, contextual AI Action Button used across all main screens
 * (Products, Protocols, Prescriptions, Patients, Doctors, Clinics, Suppliers).
 * 
 * Provides a distinct, elegant AI accent with consistent UX and zero chat leakage.
 */
export default function AIQuickActionButton({
  label = "AI Action",
  onClick,
  loading = false,
  disabled = false,
  icon: CustomIcon,
  variant = "subtle", // "subtle" | "outline" | "solid"
  size = "md",        // "sm" | "md" | "lg"
  className = "",
  style = {},
  title
}) {
  const IconComponent = CustomIcon || Sparkles;

  const sizeStyles = {
    sm: { padding: '4px 10px', fontSize: '0.75rem', height: '32px', gap: '5px' },
    md: { padding: '6px 13px', fontSize: '0.8125rem', height: '36px', gap: '6px' },
    lg: { padding: '8px 16px', fontSize: '0.875rem', height: '42px', gap: '7px' },
  }[size] || { padding: '6px 13px', fontSize: '0.8125rem', height: '36px', gap: '6px' };

  const variantStyles = {
    subtle: {
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      color: '#4f46e5',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      boxShadow: '0 1px 2px rgba(99, 102, 241, 0.08)'
    },
    outline: {
      background: '#ffffff',
      color: '#6366f1',
      border: '1.5px solid #a5b4fc',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
    },
    solid: {
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)'
    }
  }[variant] || {};

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title || label}
      className={`ai-quick-action-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        flexShrink: 0,
        ...sizeStyles,
        ...variantStyles,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 3px 8px rgba(99, 102, 241, 0.18)';
          if (variant === 'subtle') e.currentTarget.style.background = '#ede9fe';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variantStyles.boxShadow || 'none';
          if (variant === 'subtle') e.currentTarget.style.background = variantStyles.background;
        }
      }}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" />
      ) : (
        <IconComponent size={size === 'sm' ? 13 : 15} color={variant === 'solid' ? '#ffffff' : '#6366f1'} />
      )}
      <span>{label}</span>
    </button>
  );
}
