import React from 'react';

export default function TextField({ 
  label, 
  id, 
  error, 
  helperText, 
  icon: Icon,
  className = '', 
  ...props 
}) {
  return (
    <div className={`gcp-text-field ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '0.75rem', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem',
            paddingLeft: Icon ? '2.25rem' : '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-primary)';
            e.target.style.boxShadow = `0 0 0 1px ${error ? 'var(--color-danger)' : 'var(--color-primary)'}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <span style={{ fontSize: '0.75rem', color: error ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}
