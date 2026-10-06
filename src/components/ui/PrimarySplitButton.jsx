import React, { useState, useRef, useEffect } from 'react';

/**
 * PrimarySplitButton
 * Follows Google Cloud Console primary action button standard:
 * - Clean split action with 6px border-radius and crisp divider
 * - Elevation-2 floating menu on click
 * - Monochromatic or semantic GCP icons with title and descriptive subtext
 */
export default function PrimarySplitButton({ mainAction, dropdownActions }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'stretch',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          background: 'var(--color-primary, #003666)',
          border: '1px solid var(--color-primary, #003666)',
        }}
      >
        {/* Main Action Button */}
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false);
            if (mainAction?.onClick) mainAction.onClick();
          }}
          style={{
            flex: 1,
            background: 'var(--color-primary, #003666)',
            color: '#ffffff',
            border: 'none',
            padding: '0 14px',
            height: '36px',
            fontSize: '0.84rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00284d')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary, #003666)')}
        >
          {mainAction?.icon && (
            React.isValidElement(mainAction.icon)
              ? React.cloneElement(mainAction.icon, { size: 16 })
              : React.createElement(mainAction.icon, { size: 16 })
          )}
          <span>{mainAction?.label || 'Create'}</span>
        </button>

        {/* Dropdown Chevron Split Trigger */}
        {dropdownActions && dropdownActions.length > 0 && (
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            style={{
              background: 'var(--color-primary, #003666)',
              color: '#ffffff',
              border: 'none',
              borderLeft: '1px solid rgba(255, 255, 255, 0.28)',
              padding: '0 9px',
              height: '36px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#00284d')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary, #003666)')}
            title="More creation options"
            aria-label="More creation options"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Google Cloud Console Style Dropdown Menu */}
      {dropdownOpen && dropdownActions && dropdownActions.length > 0 && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '6px',
            boxShadow: '0 2px 6px 2px rgba(60,64,67,0.15), 0 1px 2px 0 rgba(60,64,67,0.3)',
            zIndex: 150,
            minWidth: '240px',
            padding: '6px 0',
            animation: 'fadeInMenu 0.12s ease-out'
          }}
        >
          {dropdownActions.map((action, idx) => (
            <button
              key={action.id || idx}
              type="button"
              role="menuitem"
              onClick={() => {
                setDropdownOpen(false);
                action.onClick();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: action.description ? 'flex-start' : 'center',
                gap: '12px',
                padding: '9px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f3f4')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: action.description ? '2px' : '0',
                  color: '#5f6368',
                  flexShrink: 0
                }}
              >
                {action.icon && (
                  React.isValidElement(action.icon)
                    ? React.cloneElement(action.icon, { size: 16 })
                    : React.createElement(action.icon, { size: 16 })
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    color: '#202124',
                    lineHeight: '1.3'
                  }}
                >
                  {action.label}
                </div>
                {action.description && (
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: '#5f6368',
                      marginTop: '2px',
                      lineHeight: '1.25'
                    }}
                  >
                    {action.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

