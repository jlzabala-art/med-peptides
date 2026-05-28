/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ShieldCheck, User, Bookmark, ClipboardList,
  Settings, LogOut, LogIn, UserPlus, FlaskConical, Users,
  Package, LayoutGrid, BarChart2, Layers, BookOpen, ChevronDown,
  Globe, ArrowUpRight, HardDrive, Search, CheckCircle2,
  MessageSquare, Zap, MailPlus, History, GitMerge,
  Activity, Brain, Tag
} from 'lucide-react';
import { USER_MENU, VISITOR_MENU } from './navConfig';
import '../styles/header.css';

// ── Icon map for all known paths ──────────────────────────────────────────────
const PATH_ICONS = {
  '/paciente':                          <LayoutDashboard size={15} />,
  '/admin':                              <ShieldCheck size={15} />,
  '/my-protocols':                       <FlaskConical size={15} />,
  '/saved':                              <Bookmark size={15} />,
  '/saved/protocols':                    <ClipboardList size={15} />,
  '/saved/products':                     <Bookmark size={15} />,
  '/orders':                             <Package size={15} />,
  '/orders/history':                     <History size={15} />,
  '/settings':                           <Settings size={15} />,
  '/login':                              <LogIn size={15} />,
  '/login?tab=register':                 <UserPlus size={15} />,
  // Intelligence
  '/admin?s=intelligence&t=analytics':   <BarChart2 size={15} />,
  '/admin?s=intelligence&t=clinical-logs': <Activity size={15} />,
  // Architecture
  '/admin?s=architecture&t=clinical-ai': <Brain size={15} />,
  '/admin?s=architecture&t=home-layout': <LayoutGrid size={15} />,
  '/admin?s=architecture&t=settings':    <Settings size={15} />,
  // Operations
  '/admin?s=operations&t=users':         <Users size={15} />,
  '/admin?s=operations&t=products':      <Package size={15} />,
  '/admin?s=operations&t=pricing':       <Globe size={15} />,
  '/admin?s=operations&t=costs':         <Tag size={15} />,
};

// Domain metadata — label, icon, color
const DOMAIN_CONFIG = {
  Operations:    { icon: <HardDrive size={14} />,   color: 'var(--color-success)' },
  Architecture:  { icon: <Layers size={14} />,      color: 'var(--color-primary)' },
  Intelligence:  { icon: <BarChart2 size={14} />,  color: '#8b5cf6' },
};

const DOMAIN_ORDER = ['Operations', 'Architecture', 'Intelligence'];

// ── MenuItem ──────────────────────────────────────────────────────────────────
function MenuItem({ label, path, onClose, danger = false }) {
  const [pathname, search] = path.includes('?') ? path.split('?') : [path, undefined];
  const to = search ? { pathname, search: `?${search}` } : pathname;

  return (
    <Link
      to={to}
      className={`dropdown-item ${danger ? 'dropdown-item--danger' : ''}`}
      onClick={onClose}
    >
      <span className="dropdown-item-icon">
        {PATH_ICONS[path] || <User size={15} />}
      </span>
      {label}
    </Link>
  );
}

// ── LogoutButton ──────────────────────────────────────────────────────────────
function LogoutButton({ onLogout }) {
  return (
    <button className="dropdown-item dropdown-item--danger" onClick={onLogout}>
      <span className="dropdown-item-icon"><LogOut size={15} /></span>
      Logout
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserDropdown({ user, userProfile: propUserProfile, isProfessional, isAdmin, onClose, onLogout }) {
  const { activeRole, baseRole, switchActiveRole, userProfile: authUserProfile } = useAuth();
  const userProfile = propUserProfile || authUserProfile;
  const location = useLocation();

  const defaultExpanded = Object.fromEntries(DOMAIN_ORDER.map((d) => [d, false]));
  const [expandedDomains, setExpandedDomains] = useState({ ...defaultExpanded });

  const toggleDomain = (domain) =>
    setExpandedDomains((prev) => ({ ...prev, [domain]: !prev[domain] }));

  const isLoggedIn = !!user;

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <div className="dropdown-overlay" aria-hidden="true" onClick={onClose} />
        <div
          role="navigation"
          aria-label="User account menu"
          className="dropdown-panel"
          style={{ right: 0, width: '260px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="user-profile-header">
            <span className="user-profile-name">Guest</span>
            <span className="user-profile-role text-muted">Not signed in</span>
          </div>
          <div className="dropdown-body" style={{ padding: '0.5rem' }}>
            {VISITOR_MENU.map((item) => (
              <MenuItem key={item.path} label={item.label} path={item.path} onClose={onClose} />
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  const isImpersonating = activeRole !== baseRole;
  const menuRoleKey = activeRole === 'admin' ? 'admin' : ['clinic', 'doctor', 'wholesaler', 'staff'].includes(activeRole) ? 'professional' : 'guest';
  
  const items       = USER_MENU[menuRoleKey] ?? USER_MENU.guest;
  const adminItems  = items.filter((i) => i.section === 'admin');
  const mainItems   = items.filter((i) => !i.section).filter(item => {
    // Hide 'Admin Dashboard' redundant link if already on /admin
    if (activeRole === 'admin' && item.path === '/admin' && location.pathname === '/admin') return false;
    return true;
  });

  const displayName    = user?.displayName || userProfile?.firstName || 'Account';
  const roleLabel = isImpersonating
    ? `View: ${activeRole.toUpperCase()} (Context)`
    : baseRole === 'admin'
    ? 'Admin Account'
    : ['clinic', 'doctor', 'wholesaler', 'staff'].includes(baseRole)
    ? 'Professional Account'
    : 'Guest Account';

  return (
    <>
      <div className="dropdown-overlay" aria-hidden="true" onClick={onClose} />

      <div
        role="navigation"
        aria-label="User account menu"
        className="dropdown-panel"
        style={{ right: 0, width: ['admin', 'clinic', 'doctor'].includes(baseRole) ? '310px' : '280px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="user-profile-header">
          <span className="user-profile-name">{displayName}</span>
          <span className="user-profile-role" style={{
            color: isImpersonating ? 'var(--color-warning)' : baseRole === 'admin' ? 'var(--color-danger)' : ['clinic', 'doctor', 'wholesaler', 'staff'].includes(baseRole) ? 'var(--color-success)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>{roleLabel}</span>
        </div>

        <div className="dropdown-body" style={{ padding: '0.5rem' }}>
          {/* Main items (Dashboard, Admin Board, etc.) */}
          {mainItems.map((item) => (
            <MenuItem key={item.path} label={item.label} path={item.path} onClose={onClose} />
          ))}

          {/* Admin Section Groups */}
          {adminItems.length > 0 && (
            <>
              <div className="dropdown-divider" />
              <div style={{ padding: '0.25rem 0.5rem' }}>
                <span style={{
                  display: 'block',
                  fontSize: '0.65rem',
                  fontWeight: 850,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.4rem',
                  paddingLeft: '0.25rem'
                }}>
                  Control Modules
                </span>
                {DOMAIN_ORDER.map((domain) => {
                  const domainConfig = DOMAIN_CONFIG[domain];
                  const domainItems = adminItems.filter((item) => item.domain === domain);
                  if (domainItems.length === 0) return null;
                  const isExpanded = expandedDomains[domain];

                  return (
                    <div key={domain} style={{ marginBottom: '0.25rem' }}>
                      <button
                        onClick={() => toggleDomain(domain)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.6rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: isExpanded ? 'rgba(0,0,0,0.03)' : 'transparent',
                          color: isExpanded ? 'var(--text-main)' : '#5f6368',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: domainConfig.color, display: 'flex', alignItems: 'center' }}>
                            {domainConfig.icon}
                          </span>
                          <span>{domain}</span>
                        </div>
                        <ChevronDown
                          size={13}
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s',
                            opacity: 0.6
                          }}
                        />
                      </button>

                      {isExpanded && (
                        <div style={{
                          paddingLeft: '0.5rem',
                          marginTop: '0.15rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1px',
                          borderLeft: `1.5px solid ${domainConfig.color}33`,
                          marginLeft: '1.25rem',
                        }}>
                          {domainItems.map((item) => (
                            <MenuItem
                              key={item.path}
                              label={item.label}
                              path={item.path}
                              onClose={onClose}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {['admin', 'clinic', 'doctor'].includes(baseRole) && (() => {
            let options = [];
            if (baseRole === 'admin') {
              options = ['admin', 'clinic', 'doctor', 'wholesaler', 'sales_agent', 'staff', 'patient', 'guest'];
            } else if (baseRole === 'clinic') {
              options = ['clinic', 'doctor', 'staff', 'patient', 'guest'];
            } else if (baseRole === 'doctor') {
              options = ['doctor', 'staff', 'patient', 'guest'];
            }

            const ROLE_SWITCH_METADATA = {
              admin: {
                label: 'Admin View',
                icon: <ShieldCheck size={13} />,
                color: 'var(--color-danger)',
                bgLight: 'rgba(239, 68, 68, 0.05)',
                borderLight: 'rgba(239, 68, 68, 0.12)',
                borderActive: 'var(--color-danger)',
              },
              clinic: {
                label: 'Clinic View',
                icon: <Layers size={13} />,
                color: 'var(--color-success)',
                bgLight: 'rgba(16, 185, 129, 0.05)',
                borderLight: 'rgba(16, 185, 129, 0.12)',
                borderActive: 'var(--color-success)',
              },
              doctor: {
                label: 'Physician View',
                icon: <FlaskConical size={13} />,
                color: '#06b6d4',
                bgLight: 'rgba(6, 182, 212, 0.05)',
                borderLight: 'rgba(6, 182, 212, 0.12)',
                borderActive: '#06b6d4',
              },
              wholesaler: {
                label: 'Wholesaler View',
                icon: <Package size={13} />,
                color: '#6366f1',
                bgLight: 'rgba(99, 102, 241, 0.05)',
                borderLight: 'rgba(99, 102, 241, 0.12)',
                borderActive: '#6366f1',
              },
              sales_agent: {
                label: 'Agent View',
                icon: <Tag size={13} />,
                color: '#f59e0b',
                bgLight: 'rgba(245, 158, 11, 0.05)',
                borderLight: 'rgba(245, 158, 11, 0.12)',
                borderActive: '#f59e0b',
              },
              staff: {
                label: 'Staff View',
                icon: <Users size={13} />,
                color: 'var(--color-text-secondary)',
                bgLight: 'rgba(100, 116, 139, 0.05)',
                borderLight: 'rgba(100, 116, 139, 0.12)',
                borderActive: 'var(--color-text-secondary)',
              },
              patient: {
                label: 'Patient View',
                icon: <User size={13} />,
                color: '#8b5cf6',
                bgLight: 'rgba(139, 92, 246, 0.05)',
                borderLight: 'rgba(139, 92, 246, 0.12)',
                borderActive: '#8b5cf6',
              },
              guest: {
                label: 'Guest View',
                icon: <Globe size={13} />,
                color: '#ec4899',
                bgLight: 'rgba(236, 72, 153, 0.05)',
                borderLight: 'rgba(236, 72, 153, 0.12)',
                borderActive: '#ec4899',
              },
            };

            return (
              <>
                <div className="dropdown-divider" />
                <div style={{ padding: '0.5rem 0.75rem' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 850, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                    Switch View Context
                  </span>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.4rem',
                  }}>
                    {options.map((roleKey) => {
                      const meta = ROLE_SWITCH_METADATA[roleKey];
                      if (!meta) return null;
                      const isActive = activeRole === roleKey;
                      return (
                        <button
                          key={roleKey}
                          onClick={() => {
                            switchActiveRole(roleKey);
                            onClose();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.45rem 0.5rem',
                            borderRadius: '8px',
                            border: isActive ? `1.5px solid ${meta.borderActive}` : '1.5px solid var(--border)',
                            backgroundColor: isActive ? meta.bgLight : 'var(--color-bg-surface)',
                            color: isActive ? meta.color : 'var(--text-main)',
                            fontSize: '0.72rem',
                            fontWeight: isActive ? 800 : 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left',
                            boxShadow: isActive ? `0 1px 3px ${meta.bgLight}` : 'none'
                          }}
                        >
                          <span style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: meta.color,
                            flexShrink: 0
                          }}>
                            {meta.icon}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {meta.label.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Logout */}
          <div className="dropdown-divider" />
          <LogoutButton onLogout={() => { onLogout(); onClose(); }} />
        </div>
      </div>
    </>
  );
}
