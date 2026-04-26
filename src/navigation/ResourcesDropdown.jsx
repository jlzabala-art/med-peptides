/**
 * ResourcesDropdown.jsx
 *
 * Simple dropdown list using RESOURCES_MENU from navConfig.
 * Closing is handled by the Header's navRef mousedown outside-click handler.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RESOURCES_MENU } from './navConfig';

const S = {
  panel: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--surface, white)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '0.5rem',
    minWidth: '220px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    zIndex: 1000,
    animation: 'dropIn 0.15s ease-out',
  },
  item: {
    display: 'block',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-main)',
    transition: 'background 0.12s, color 0.12s',
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

export default function ResourcesDropdown({ onClose }) {
  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div
        role="navigation"
        aria-label="Resources menu"
        style={S.panel}
      >
        {RESOURCES_MENU.map((item) => (
          <NavItem
            key={item.path}
            label={item.label}
            path={item.path}
            onClose={onClose}
          />
        ))}
      </div>
    </>
  );
}
