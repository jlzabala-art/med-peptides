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
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
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
              borderLeft: '1px solid rgba(255,255,255,0.2)',
              padding: '0 8px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
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
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          minWidth: '200px',
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
                gap: '12px',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: idx < dropdownActions.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                color: '#334155',
                fontWeight: 500,
                transition: 'background 0.2s'
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
