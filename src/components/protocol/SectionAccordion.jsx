/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function SectionAccordion({ id, title, icon: Icon, defaultOpen = false, children, accentColor = 'var(--color-primary)' }) {
  // Always start closed on page load — intentionally ignore any stored state
  const [open, setOpen] = useState(defaultOpen);
  const [rendered, setRendered] = useState(defaultOpen); // lazy: only render once opened

  const toggle = useCallback(() => {
    setOpen(prev => {
      const next = !prev;
      if (next) setRendered(true); // ensure content is rendered when opening
      return next;
    });
  }, []);

  return (
    <div
      className="proto-accordion"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.07)',
        background: 'var(--color-bg-surface)',
        overflow: 'hidden',
        marginBottom: '1rem',
        boxShadow: open ? '0 4px 24px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <button
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.1rem 1.35rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: open ? '1px solid rgba(0,0,0,0.06)' : 'none',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: `${accentColor}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={accentColor} strokeWidth={2.2} />
        </span>
        <span style={{
          flex: 1,
          fontSize: '1rem',
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {title}
        </span>
        <span style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: open ? accentColor : 'rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          {open
            ? <ChevronUp size={13} color="var(--color-bg-surface)" strokeWidth={2.5} />
            : <ChevronDown size={13} color="var(--color-text-secondary)" strokeWidth={2.5} />
          }
        </span>
      </button>

      {/* Body — lazy-rendered */}
      {(open || rendered) && (
        <div
          style={{
            padding: open ? '1.35rem' : '0 1.35rem',
            maxHeight: open ? '9999px' : 0,
            overflow: 'hidden',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s ease, padding 0.2s ease',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
