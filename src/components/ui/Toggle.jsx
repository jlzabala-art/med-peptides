import React from 'react';

export default function Toggle({ 
  label, 
  id, 
  checked, 
  onChange, 
  disabled = false,
  className = '', 
  ...props 
}) {
  return (
    <div className={`gcp-toggle ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: disabled ? 0.5 : 1 }}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          position: 'relative',
          width: '2.5rem',
          height: '1.25rem',
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
          borderRadius: '9999px',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          outline: 'none',
          padding: 0
        }}
        {...props}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? 'calc(100% - 1.125rem - 2px)' : '2px',
            width: '1.125rem',
            height: '1.125rem',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            transition: 'left 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        />
      </button>
      {label && (
        <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', cursor: disabled ? 'not-allowed' : 'pointer' }} onClick={() => !disabled && onChange && onChange(!checked)}>
          {label}
        </label>
      )}
    </div>
  );
}
