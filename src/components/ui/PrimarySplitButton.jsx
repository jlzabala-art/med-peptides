import React, { useState, useRef, useEffect } from 'react';

export default function PrimarySplitButton({ mainAction, dropdownActions }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div style={{ display: 'flex', border: '1px solid var(--color-primary, #003666)', borderRadius: '8px', overflow: 'hidden' }}>
        <button
          onClick={() => {
             setDropdownOpen(false);
             mainAction.onClick();
          }}
          style={{
            flex: 1,
            background: 'var(--color-primary, #003666)',
            color: '#fff',
            border: 'none',
            padding: '0 16px',
            height: '36px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#00284d'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-primary, #003666)'}
        >
          {mainAction.icon && (
            React.isValidElement(mainAction.icon)
              ? React.cloneElement(mainAction.icon, { size: 16 })
              : React.createElement(mainAction.icon, { size: 16 })
          )}
          {mainAction.label}
        </button>
        
        {dropdownActions && dropdownActions.length > 0 && (
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'var(--color-primary, #003666)',
              color: '#fff',
              border: 'none',
              borderLeft: '1px solid rgba(255,255,255,0.25)',
              padding: '0 8px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#00284d'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-primary, #003666)'}
            title="Additional creation options"
            aria-label="Additional creation options"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>

      {dropdownOpen && dropdownActions && dropdownActions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          background: '#fff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 100,
          minWidth: '220px',
          overflow: 'hidden'
        }}>
          {dropdownActions.map((action, idx) => (
            <button
              key={action.id || idx}
              onClick={() => {
                setDropdownOpen(false);
                action.onClick();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: idx < dropdownActions.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.84rem',
                color: '#334155',
                fontWeight: 600,
                transition: 'background 0.15s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {action.icon && (
                React.isValidElement(action.icon)
                  ? React.cloneElement(action.icon, { size: 16, color: 'var(--color-primary, #003666)' })
                  : React.createElement(action.icon, { size: 16, color: 'var(--color-primary, #003666)' })
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
