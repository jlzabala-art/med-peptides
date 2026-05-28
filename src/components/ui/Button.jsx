import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  icon: Icon,
  className = '',
  style = {},
  ...props 
}) {
  // Base style
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
    fontFamily: 'var(--font-main)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.15s, box-shadow 0.15s',
    outline: 'none',
  };

  // Size styling
  const sizeStyles = {
    sm: { padding: '0.35rem 0.75rem', fontSize: '0.75rem' },
    md: { padding: '0.45rem 1rem', fontSize: '0.85rem' },
    lg: { padding: '0.6rem 1.25rem', fontSize: '1rem' }
  };

  // Variant styling
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-inverse)',
      border: '1px solid transparent',
      boxShadow: disabled ? 'none' : 'var(--shadow-sm)',
    },
    secondary: {
      backgroundColor: 'var(--color-bg-surface)',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-border)',
    },
    danger: {
      backgroundColor: 'var(--color-danger)',
      color: 'var(--color-text-inverse)',
      border: '1px solid transparent',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid transparent',
    }
  };

  // Disabled overriding
  const disabledStyles = (disabled || loading) ? {
    opacity: 0.6,
    boxShadow: 'none',
    ...(variant === 'primary' && { backgroundColor: '#f1f3f4', color: '#a8aab0', border: '1px solid transparent' })
  } : {};

  // Construct final style
  const finalStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...disabledStyles,
    ...style
  };

  return (
    <button 
      style={finalStyle} 
      disabled={disabled || loading}
      className={`gcp-btn-${variant} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" /> : (Icon && <Icon size={size === 'sm' ? 14 : 16} />)}
      {children}
    </button>
  );
}
