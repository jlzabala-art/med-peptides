/**
 * AcademiaDropdown.jsx
 *
 * 3-column dropdown: Tools | Learning | Support
 * Data from navConfig.js (static — no Firestore query).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ACADEMIA_MENU } from './navConfig';

const S = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 149,
    background: 'transparent',
  },
  panel: {
    position: 'absolute',
    top: 'calc(100% + 0.75rem)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(600px, 96vw)',
    backgroundColor: 'white',
    borderRadius: '18px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.11), 0 4px 12px rgba(0,0,0,0.05)',
    border: '0.5px solid rgba(0,0,0,0.08)',
    zIndex: 150,
    overflow: 'hidden',
    animation: 'dropIn 0.17s ease-out',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    padding: '1.5rem',
    gap: '0.25rem',
  },
  colHeader: {
    fontSize: '0.63rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '0.55rem',
    paddingBottom: '0.45rem',
    borderBottom: '1px solid var(--border, #f0f0f0)',
  },
  item: {
    display: 'block',
    padding: '0.4rem 0.55rem',
    borderRadius: '7px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-main)',
    transition: 'background 0.12s, color 0.12s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

function NavItem({ label, path, onClose }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={path}
      style={{
        ...S.item,
        background: hovered ? 'var(--background, #f5f5f5)' : 'transparent',
        color: hovered ? 'var(--primary)' : 'var(--text-main)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClose}
    >
      {label}
    </Link>
  );
}

export default function AcademiaDropdown({ onClose }) {
  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={S.overlay} aria-hidden="true" onClick={onClose} />

      <div
        role="navigation"
        aria-label="Academia menu"
        style={S.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {ACADEMIA_MENU.map((item) => (
            item.soon
              ? (
                <div
                  key={item.path}
                  style={{
                    ...S.item,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: 0.45,
                    cursor: 'default',
                    pointerEvents: 'none',
                  }}
                >
                  {item.label}
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.1rem 0.4rem', borderRadius: '4px', letterSpacing: '0.05em' }}>SOON</span>
                </div>
              )
              : (
                <NavItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  onClose={onClose}
                />
              )
          ))}
        </div>
      </div>
    </>
  );
}
