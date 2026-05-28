import React from 'react';

export default function Card({ children, style = {}, className = '' }) {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        padding: '1.5rem',
        ...style
      }}
    >
      {children}
    </div>
  );
}
