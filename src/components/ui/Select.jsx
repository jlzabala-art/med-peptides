import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ 
  label, 
  id, 
  error, 
  helperText, 
  options = [], 
  className = '', 
  ...props 
}) {
  return (
    <div className={`gcp-select ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={id}
          style={{
            width: '100%',
            padding: '0.625rem 2.25rem 0.625rem 0.75rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
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
        >
          {options.map((opt, i) => (
            <option key={i} value={opt.value !== undefined ? opt.value : opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <div style={{ position: 'absolute', right: '0.75rem', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
          <ChevronDown size={16} />
        </div>
      </div>
      {(error || helperText) && (
        <span style={{ fontSize: '0.75rem', color: error ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}
