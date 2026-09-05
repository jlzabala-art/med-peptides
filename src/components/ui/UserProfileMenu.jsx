"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import AvatarGenerator from './AvatarGenerator';
import RoleImpersonatorSelector from '../shell/RoleImpersonatorSelector';
import StatusBadge from './StatusBadge';
import { 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Briefcase, 
  ChevronRight, 
  X,
  Sparkles
} from '@/lib/icons';

export default function UserProfileMenu({ roleContext = 'patient', isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const router = useRouter();
  const { user, userProfile, activeRole, logout, isAdmin } = useAuth();
  const { workspaces, activeWorkspaceId } = useWorkspaceStore();

  const activeWs = workspaces?.[activeWorkspaceId] || Object.values(workspaces || {})[0];

  const displayName = userProfile?.firstName && userProfile?.lastName
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : userProfile?.fullName || userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  const displayEmail = userProfile?.email || user?.email || '';
  const currentRole = activeRole || roleContext || 'patient';

  // Close on click outside (desktop popover)
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isMobile]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleLogoutClick = async () => {
    setIsOpen(false);
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    router.push('/login');
  };

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Trigger Button: Avatar Icon + Name (on Desktop/Laptop) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`User account menu for ${displayName}`}
        style={{
          background: isOpen ? '#f1f5f9' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? '#cbd5e1' : 'transparent',
          padding: isMobile ? '2px' : '4px 10px 4px 6px',
          cursor: 'pointer',
          borderRadius: '24px',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.15s ease'
        }}
      >
        <AvatarGenerator
          name={displayName}
          email={displayEmail}
          size={32}
        />
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              {currentRole}
            </span>
          </div>
        )}
      </button>

      {/* ── MOBILE BOTTOM SHEET ── */}
      {isOpen && isMobile && mounted && createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100060,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.15s ease'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '16px 20px 28px 20px',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: '#cbd5e1',
              alignSelf: 'center',
              marginBottom: '4px'
            }} />

            {/* Header: User Info & Close */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AvatarGenerator name={displayName} email={displayEmail} size={48} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {displayName}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', wordBreak: 'break-all' }}>
                    {displayEmail}
                  </span>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe'
                    }}>
                      {currentRole}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Active Workspace Info */}
            {activeWs && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={16} color="#0284c7" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Active Workspace</span>
                    <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>{activeWs.name || 'Workspace 1'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleNavigate(roleContext === 'admin' ? '/admin/settings' : `/${roleContext}/my-profile`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  background: '#ffffff',
                  cursor: 'pointer',
                  color: '#1e293b',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={18} color="#64748b" />
                  <span>Account & Preferences</span>
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </button>

              {isAdmin && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                    <ShieldCheck size={16} color="#003666" />
                    <span>Role Impersonation</span>
                  </div>
                  <RoleImpersonatorSelector />
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogoutClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── DESKTOP POPOVER DROPDOWN ── */}
      {isOpen && !isMobile && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '280px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.2)',
            zIndex: 99999,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b', wordBreak: 'break-all' }}>
              {displayEmail}
            </span>
            <div style={{ marginTop: '4px' }}>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}>
                {currentRole}
              </span>
            </div>
          </div>

          {/* Body Links */}
          <div style={{ padding: '8px' }}>
            <button
              type="button"
              onClick={() => handleNavigate(roleContext === 'admin' ? '/admin/settings' : `/${roleContext}/my-profile`)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Settings size={15} color="#64748b" />
              <span>Settings & Profile</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNavigate('/admin/users')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ShieldCheck size={15} color="#64748b" />
                <span>Team & Permissions</span>
              </button>
            )}
          </div>

          {/* Footer Logout */}
          <div style={{ padding: '8px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
            <button
              type="button"
              onClick={handleLogoutClick}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#dc2626',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
