import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const Checkbox = forwardRef(({ 
  label, 
  id, 
  checked, 
  onChange, 
  disabled = false,
  indeterminate = false,
  className = '', 
  style = {},
  ...props 
}, ref) => {
  const generatedId = id || `checkbox-${Math.random().toString(36).substring(7)}`;
  const innerRef = useRef(null);

  useImperativeHandle(ref, () => innerRef.current, []);

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={`gcp-checkbox-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: disabled ? 0.5 : 1, ...style }}>
      <input
        ref={innerRef}
        type="checkbox"
        id={generatedId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '1.125rem',
          height: '1.125rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          accentColor: 'var(--color-primary)',
          margin: 0
        }}
        {...props}
      />
      {label && (
        <label 
          htmlFor={generatedId} 
          style={{ 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            color: 'var(--color-text-primary)', 
            cursor: disabled ? 'not-allowed' : 'pointer',
            margin: 0,
            userSelect: 'none'
          }}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
