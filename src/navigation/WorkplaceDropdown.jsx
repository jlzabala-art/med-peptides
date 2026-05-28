 
/**
 * WorkplaceDropdown.jsx
 *
 * Role-based dropdown for the cart/workplace icon.
 * Shows different links for: guest | professional | admin
 * Data from navConfig.js (static).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Bookmark, ClipboardList, History, Settings } from 'lucide-react';
import { WORKPLACE_MENU } from './navConfig';

const ICONS = {
  '/cart':            <ShoppingCart size={15} />,
  '/saved':           <Bookmark size={15} />,
  '/saved/protocols': <Bookmark size={15} />,
  '/saved/products':  <Bookmark size={15} />,
  '/orders':          <ClipboardList size={15} />,
  '/orders/history':  <History size={15} />,
  '/admin/orders':    <Settings size={15} />,
};

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
    right: 0,
    width: '220px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.11)',
    border: '0.5px solid rgba(0,0,0,0.08)',
    zIndex: 150,
    overflow: 'hidden',
    animation: 'dropInRight 0.17s ease-out',
    padding: '0.6rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.55rem 0.75rem',
    borderRadius: '9px',
    textDecoration: 'none',
    fontSize: '0.855rem',
    fontWeight: 500,
    color: 'var(--text-main)',
    transition: 'background 0.12s, color 0.12s',
  },
  roleTag: {
    fontSize: '0.6rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    padding: '0.5rem 0.75rem 0.25rem',
    display: 'block',
  },
};

function WorkplaceItem({ label, path, onClose }) {
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
      <span style={{ color: 'var(--primary)', display: 'flex', flexShrink: 0 }}>
        {ICONS[path] || <ShoppingCart size={15} />}
      </span>
      {label}
    </Link>
  );
}

export default function WorkplaceDropdown({ role = 'guest', onClose }) {
  // Normalise role: any professional variant → 'professional', admin → 'admin'
  const key = role === 'admin' ? 'admin' : role === 'guest' ? 'guest' : 'professional';
  const items = WORKPLACE_MENU[key] ?? WORKPLACE_MENU.guest;

  const roleLabel = key === 'admin' ? 'Admin Access' : key === 'professional' ? 'Professional' : 'Guest';

  return (
    <>
      <style>{`
        @keyframes dropInRight {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={S.overlay} aria-hidden="true" onClick={onClose} />

      <div
        role="navigation"
        aria-label="Workplace menu"
        style={S.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={S.roleTag}>{roleLabel}</span>
        {items.map((item) => (
          <WorkplaceItem
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
