import React from 'react';

export function Input({ label, error, className = '', style = {}, id, ...props }) {
  const generatedId = id || `input-${Math.random().toString(36).substring(7)}`;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      {label && (
        <label htmlFor={generatedId} style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        id={generatedId}
        className={`gcp-input ${className}`}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg-surface)',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...style
        }}
        // Using focus-within via a wrapper or simple CSS is cleaner, but here we provide the inline defaults. 
        // A global CSS `.gcp-input:focus` in index.css handles the blue outline.
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{error}</span>
      )}
    </div>
  );
}

export function Select({ label, error, options = [], className = '', style = {}, id, ...props }) {
  const generatedId = id || `select-${Math.random().toString(36).substring(7)}`;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      {label && (
        <label htmlFor={generatedId} style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        id={generatedId}
        className={`gcp-input ${className}`}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg-surface)',
          outline: 'none',
          cursor: 'pointer',
          ...style
        }}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{error}</span>
      )}
    </div>
  );
}
