import React from 'react';

/**
 * FloatingActionButton (FAB)
 * Standardized FAB for mobile-primary actions.
 * Usually placed bottom-right.
 */
export default function FloatingActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  color = 'var(--primary)',
  position = 'bottom-right', // bottom-right, bottom-center
  className = '',
  style = {}
}) {
  const positionStyles = {
    'bottom-right': { bottom: 'var(--space-24)', right: 'var(--space-24)' },
    'bottom-center': { bottom: 'var(--space-24)', left: '50%', transform: 'translateX(-50%)' },
  };

  return (
    <button
      className={`fab ${className}`}
      onClick={onClick}
      style={{
        position: 'fixed',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: label ? 'var(--space-8)' : '0',
        backgroundColor: color,
        color: '#fff',
        border: 'none',
        borderRadius: label ? 'var(--radius-full)' : '50%',
        padding: label ? '0 var(--space-20)' : '0',
        width: label ? 'auto' : '56px',
        height: '56px',
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        fontWeight: 'var(--font-weight-bold)',
        ...positionStyles[position],
        ...style
      }}
    >
      {Icon && <Icon size={24} />}
      {label && <span>{label}</span>}
    </button>
  );
}
