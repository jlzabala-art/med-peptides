import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import React, { useState, useCallback } from 'react';


import { motion, AnimatePresence } from 'framer-motion';

export function SectionAccordion({ title, icon: Icon, defaultOpen = false, children, accentColor = 'var(--color-primary)' }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen(prev => !prev), []);

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
          {Icon && <Icon size={16} color={accentColor} strokeWidth={2.2} />}
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

      {/* Body — animated */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.35rem 1.35rem' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SectionAccordion;