"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  ShieldCheck,
  LayoutDashboard,
  Sliders,
  LogOut,
  LogIn,
  ChevronDown,
  Building2,
  Box,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { triggerHaptic } from '@/utils/haptics';

/**
 * GcpUserBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console UX Standard User Profile Capsule & Quick Logout.
 * Unified component for public-facing headers (Pricing, Monographs, Doctor Portal, B2B Payables).
 *
 * Props:
 * - variant: 'dark' (Navy #002b4d, default) | 'light' (White #ffffff)
 * - lang: 'en' | 'es' (default: 'en')
 * - loginRedirect: optional redirect path after login
 * - onLogout: optional callback after logout
 * - showQuickLogout: boolean (default: true)
 * - align: 'right' | 'left' (dropdown alignment, default: 'right')
 */
export default function GcpUserBadge({
  variant = 'dark',
  lang = 'en',
  loginRedirect,
  onLogout,
  showQuickLogout = true,
  align = 'right'
}) {
  const pathname = usePathname();
  const { user, activeRole, logout, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const isEs = lang === 'es';
  const isDark = variant === 'dark';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Determine effective display name
  const effectiveDisplayName = useMemo(() => {
    if (!user) return '';
    return (
      user.displayName ||
      userProfile?.fullName ||
      userProfile?.name ||
      userProfile?.clinicName ||
      user.email?.split('@')[0] ||
      'User'
    );
  }, [user, userProfile]);

  // Determine avatar initials (e.g. "Jose Luis Zabala" -> "JZ" or "JL")
  const effectiveInitials = useMemo(() => {
    if (!effectiveDisplayName) return 'U';
    const parts = effectiveDisplayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return effectiveDisplayName.substring(0, 2).toUpperCase();
  }, [effectiveDisplayName]);

  // Determine role label & avatar background color according to GCP semantics
  const { roleLabel, avatarBgColor } = useMemo(() => {
    const rawRole = (activeRole || userProfile?.role || 'guest').toLowerCase();

    if (rawRole === 'admin') {
      return {
        roleLabel: 'ADMIN PORTAL',
        avatarBgColor: '#16a34a' // Green
      };
    }
    if (rawRole === 'doctor' || rawRole === 'medical_director') {
      return {
        roleLabel: 'DOCTOR PORTAL',
        avatarBgColor: '#0d9488' // Medical Teal
      };
    }
    if (rawRole === 'clinic') {
      return {
        roleLabel: 'CLINICAL B2B',
        avatarBgColor: '#0d9488'
      };
    }
    if (rawRole === 'wholesaler' || rawRole === 'wholeseller') {
      return {
        roleLabel: 'WHOLESALER B2B',
        avatarBgColor: '#c2410c' // Orange
      };
    }
    if (rawRole === 'supplier') {
      return {
        roleLabel: 'SUPPLIER PORTAL',
        avatarBgColor: '#475569'
      };
    }
    if (rawRole === 'pharmacy') {
      return {
        roleLabel: 'PHARMACY PORTAL',
        avatarBgColor: '#2563eb'
      };
    }
    if (user) {
      return {
        roleLabel: 'PATIENT PORTAL',
        avatarBgColor: '#0284c7' // Blue
      };
    }
    return {
      roleLabel: 'GUEST',
      avatarBgColor: '#64748b'
    };
  }, [activeRole, userProfile, user]);

  // Determine primary console navigation link
  const primaryDashboardPath = useMemo(() => {
    const rawRole = (activeRole || userProfile?.role || '').toLowerCase();
    if (rawRole === 'admin') return '/admin';
    if (rawRole === 'doctor' || rawRole === 'medical_director') return '/doctor';
    if (rawRole === 'wholesaler' || rawRole === 'wholeseller') return '/wholesaler';
    if (rawRole === 'clinic') return '/clinic';
    if (rawRole === 'supplier') return '/supplier';
    if (rawRole === 'pharmacy') return '/pharmacy';
    return '/patient';
  }, [activeRole, userProfile]);

  // Quick logout handler
  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic('selection');
    setIsOpen(false);
    try {
      if (logout) {
        await logout();
      } else {
        const { getAuth, signOut } = await import('firebase/auth');
        await signOut(getAuth());
      }
      toast.success(isEs ? 'Sesión cerrada correctamente' : 'Signed out successfully');
      if (onLogout) onLogout();
    } catch (err) {
      console.warn('Logout error:', err);
      toast.error(isEs ? 'Error al cerrar sesión' : 'Failed to sign out');
    }
  };

  const resolvedRedirect = loginRedirect || pathname || '/';

  // ── Unauthenticated State: Clean GCP Sign In Button ──
  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(resolvedRedirect)}`}
        className="gcp-header-signin-btn"
        title={isEs ? 'Iniciar sesión institucional o acceder' : 'Sign in to access clinical pricing'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: isDark ? 'rgba(255, 255, 255, 0.12)' : '#ffffff',
          color: isDark ? '#ffffff' : '#1a73e8',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #1a73e8',
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '0.74rem',
          fontWeight: 700,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          backdropFilter: isDark ? 'blur(4px)' : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.20)' : '#e8f0fe';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.12)' : '#ffffff';
        }}
      >
        <LogIn size={13} color={isDark ? '#38bdf8' : '#1a73e8'} />
        <span>{isEs ? 'Iniciar Sesión' : 'Sign In'}</span>
      </Link>
    );
  }

  // ── Authenticated State: Google Cloud Console User Capsule ──
  return (
    <div
      ref={containerRef}
      className="gcp-user-badge-wrapper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        position: 'relative'
      }}
    >
      {/* User Capsule Trigger */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          setIsOpen((prev) => !prev);
        }}
        className="gcp-user-badge-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: isDark
            ? (isOpen ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.12)')
            : (isOpen ? '#f1f5f9' : '#ffffff'),
          border: isDark
            ? (isOpen ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.22)')
            : (isOpen ? '1px solid #bfdbfe' : '1px solid #dadce0'),
          padding: '2px 8px 2px 3px',
          borderRadius: '20px',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
          backdropFilter: isDark ? 'blur(4px)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.18)' : '#f8fafc';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.12)' : '#ffffff';
          }
        }}
        title={`Conectado como ${user.email}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Status Dot */}
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: '22px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#22c55e',
            border: isDark ? '1.5px solid #002b4d' : '1.5px solid #ffffff',
            boxShadow: '0 0 5px #22c55e',
            zIndex: 2
          }}
          aria-hidden="true"
        />

        {/* Circular Avatar with Initials */}
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: avatarBgColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.70rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            flexShrink: 0
          }}
        >
          {effectiveInitials}
        </div>

        {/* Two-Line User Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            lineHeight: 1.15
          }}
        >
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 750,
              color: isDark ? '#ffffff' : '#202124',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {effectiveDisplayName}
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              color: isDark ? '#94a3b8' : '#5f6368',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}
          >
            {roleLabel}
          </span>
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          size={12}
          color={isDark ? '#94a3b8' : '#5f6368'}
          style={{
            marginLeft: '1px',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease'
          }}
        />
      </button>

      {/* GCP Dedicated Quick Logout Icon Button (Adjacent, 1-Click) */}
      {showQuickLogout && (
        <button
          type="button"
          onClick={handleLogout}
          title={isEs ? 'Cerrar Sesión' : 'Sign Out'}
          aria-label={isEs ? 'Cerrar Sesión' : 'Sign Out'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#5f6368',
            padding: '5px',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2';
            e.currentTarget.style.color = isDark ? '#fca5a5' : '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.7)' : '#5f6368';
          }}
        >
          <LogOut size={15} />
        </button>
      )}

      {/* Google Cloud Console Account Dropdown Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User account menu"
          style={{
            position: 'absolute',
            [align]: 0,
            top: 'calc(100% + 6px)',
            width: '240px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.10)',
            zIndex: 1500,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'gcpDropdownFadeIn 0.12s ease'
          }}
        >
          {/* Header with Avatar & Email */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #f1f5f9'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: avatarBgColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 750,
                flexShrink: 0
              }}
            >
              {effectiveInitials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  color: '#202124',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {effectiveDisplayName}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#5f6368',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.email}
              </div>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '3px',
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  textTransform: 'uppercase'
                }}
              >
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Navigation links based on role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Primary Console Dashboard */}
            <Link
              href={primaryDashboardPath}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '4px',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                transition: 'background 0.12s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LayoutDashboard size={14} color="#1a73e8" />
              <span>{isEs ? 'Mi Consola Principal' : 'Primary Console'}</span>
            </Link>

            {/* Doctor Portal Link if doctor or admin */}
            {(activeRole === 'admin' || activeRole === 'doctor' || activeRole === 'clinic') && (
              <Link
                href="/dr"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#334155',
                  textDecoration: 'none',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <User size={14} color="#0d9488" />
                <span>{isEs ? 'Portal Médico / Clínica' : 'Doctor Portal'}</span>
              </Link>
            )}

            {/* Account Settings */}
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '4px',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                transition: 'background 0.12s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <User size={14} color="#64748b" />
              <span>{isEs ? 'Mi Cuenta' : 'Account'}</span>
            </Link>

            {/* Account Manager Hub (if admin or staff) */}
            {activeRole === 'admin' && (
              <Link
                href="/account-manager"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#334155',
                  textDecoration: 'none',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Sliders size={14} color="#64748b" />
                <span>{isEs ? 'Consola Account Manager' : 'Account Manager Hub'}</span>
              </Link>
            )}
          </div>

          <div style={{ height: '1px', background: '#f1f5f9', margin: '2px 0' }} />

          {/* Explicit Sign Out in Popover */}
          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#dc2626',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={14} color="#dc2626" />
            <span>{isEs ? 'Cerrar Sesión' : 'Sign Out'}</span>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes gcpDropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

