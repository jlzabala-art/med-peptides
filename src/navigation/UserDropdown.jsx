/**
 * UserDropdown.jsx
 *
 * Role-based user account dropdown.
 * Guest: Login / Register
 * Professional: Dashboard, My Protocols, Saved, Orders, Settings, Logout
 * Admin: Dashboard, Admin Board, Admin tools, Logout
 *
 * Data from navConfig.js (static paths).
 * Logout callback injected via prop.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, ShieldCheck, User, Bookmark, ClipboardList,
  Settings, LogOut, LogIn, UserPlus, FlaskConical, Users,
  Package, ShoppingBag
} from 'lucide-react';
import { USER_MENU } from './navConfig';

const PATH_ICONS = {
  '/dashboard':             <LayoutDashboard size={15} />,
  '/admin':                 <ShieldCheck size={15} />,
  '/my-protocols':          <FlaskConical size={15} />,
  '/saved':                 <Bookmark size={15} />,
  '/orders':                <ClipboardList size={15} />,
  '/settings':              <Settings size={15} />,
  '/login':                 <LogIn size={15} />,
  '/login?tab=register':    <UserPlus size={15} />,
  '/admin/protocols':       <FlaskConical size={15} />,
  '/admin/products':        <Package size={15} />,
  '/admin/users':           <Users size={15} />,
  '/admin/settings':        <Settings size={15} />,
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
    width: '240px',
    backgroundColor: 'white',
    borderRadius: '18px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.11)',
    border: '0.5px solid rgba(0,0,0,0.08)',
    zIndex: 150,
    overflow: 'hidden',
    animation: 'userDropIn 0.17s ease-out',
  },
  header: {
    padding: '1rem 1rem 0.75rem',
    borderBottom: '1px solid var(--border, #f0f0f0)',
    backgroundColor: 'var(--background, #fafafa)',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: '0.7rem',
    fontWeight: 600,
    marginTop: '0.1rem',
    display: 'block',
  },
  body: {
    padding: '0.5rem',
  },
  sectionLabel: {
    fontSize: '0.6rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.11em',
    padding: '0.5rem 0.6rem 0.2rem',
    display: 'block',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.52rem 0.7rem',
    borderRadius: '9px',
    textDecoration: 'none',
    fontSize: '0.855rem',
    fontWeight: 500,
    color: 'var(--text-main)',
    transition: 'background 0.12s, color 0.12s',
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  divider: {
    height: '1px',
    background: 'var(--border, #f0f0f0)',
    margin: '0.4rem 0.5rem',
  },
};

function MenuItem({ label, path, icon, onClose, danger = false }) {
  const [hovered, setHovered] = useState(false);
  const color = danger
    ? (hovered ? '#dc2626' : 'var(--text-muted)')
    : (hovered ? 'var(--primary)' : 'var(--text-main)');

  // React Router v6: parse query string paths into object form so navigation works correctly
  const [pathname, search] = path.includes('?') ? path.split('?') : [path, undefined];
  const to = search ? { pathname, search: `?${search}` } : pathname;

  return (
    <Link
      to={to}
      style={{ ...S.item, background: hovered ? 'var(--background, #f5f5f5)' : 'transparent', color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClose}
    >
      <span style={{ color: danger ? 'inherit' : 'var(--primary)', display: 'flex', flexShrink: 0 }}>
        {icon || PATH_ICONS[path] || <User size={15} />}
      </span>
      {label}
    </Link>
  );
}

function LogoutButton({ onLogout }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...S.item,
        color: hovered ? '#dc2626' : 'var(--text-muted)',
        background: hovered ? 'rgba(220,38,38,0.06)' : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onLogout}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: 'inherit' }}>
        <LogOut size={15} />
      </span>
      Logout
    </button>
  );
}

export default function UserDropdown({ user, userProfile, isProfessional, isAdmin, onClose, onLogout }) {
  const isLoggedIn = !!user;

  // Determine display role key
  const roleKey = isAdmin ? 'admin' : isProfessional ? 'professional' : 'guest';
  const items = USER_MENU[roleKey] ?? USER_MENU.guest;

  // Admin section items vs top items
  const adminItems = items.filter((i) => i.section === 'admin');
  const mainItems  = items.filter((i) => !i.section);

  const displayName = user?.displayName || userProfile?.firstName || 'Account';
  const roleLabel   = isAdmin ? 'Admin Account' : isProfessional ? 'Professional Account' : 'Guest';
  const roleColor   = isAdmin ? '#ef4444' : isProfessional ? 'var(--success, #16a34a)' : 'var(--text-muted)';

  return (
    <>
      <style>{`
        @keyframes userDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={S.overlay} aria-hidden="true" onClick={onClose} />

      <div
        role="navigation"
        aria-label="User account menu"
        style={S.panel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={S.header}>
          <span style={S.userName}>{isLoggedIn ? displayName : 'Guest'}</span>
          <span style={{ ...S.userRole, color: roleColor }}>{roleLabel}</span>
        </div>

        <div style={S.body}>
          {/* Main items */}
          {mainItems.map((item) => (
            <MenuItem
              key={item.path}
              label={item.label}
              path={item.path}
              onClose={onClose}
            />
          ))}

          {/* Admin section */}
          {adminItems.length > 0 && (
            <>
              <div style={S.divider} />
              <span style={S.sectionLabel}>Admin Tools</span>
              {adminItems.map((item) => (
                <MenuItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  onClose={onClose}
                />
              ))}
            </>
          )}

          {/* Logout */}
          {isLoggedIn && (
            <>
              <div style={S.divider} />
              <LogoutButton onLogout={() => { onLogout(); onClose(); }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
