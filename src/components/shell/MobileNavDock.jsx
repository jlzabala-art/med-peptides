"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Package, FileText, Layers, Users, Briefcase, ShoppingBag, Activity, Store } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useAuth } from '../../context/AuthContext';

/**
 * MobileNavDock
 * ─────────────────────────────────────────────────────────────────────────────
 * Single authoritative role-based bottom navigation dock for mobile (< 768px).
 * Dynamically switches navigation tabs based on user role (Admin, Doctor, Wholesaler, Patient).
 */
export default function MobileNavDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole } = useAuth();
  const isDrawerOpen = useWorkspaceStore((state) => state.isDrawerOpen);
  const toggleDrawer = useWorkspaceStore((state) => state.toggleDrawer);
  const activeItemCount = useWorkspaceStore((state) => {
    const ws = state.workspaces[state.activeWorkspaceId] || Object.values(state.workspaces)[0];
    return (ws?.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
  });

  // Scroll detection for auto-hiding on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      if (currentScroll > lastScrollRef.current + 20 && currentScroll > 80) {
        setVisible(false);
      } else if (currentScroll < lastScrollRef.current - 12) {
        setVisible(true);
      }
      lastScrollRef.current = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Configure role-specific navigation tabs
  const navItems = useMemo(() => {
    const role = (activeRole || 'patient').toLowerCase();

    if (role === 'doctor' || role === 'physician') {
      return [
        { id: 'protocols', label: 'Protocols', icon: Layers, path: '/admin/protocols', altPath: '/doctor/protocols' },
        { id: 'prescriptions', label: 'Rx', icon: FileText, path: '/admin/prescriptions', altPath: '/doctor/prescriptions' },
        { id: 'patients', label: 'Patients', icon: Users, path: '/admin/patients', altPath: '/doctor/patients' },
        { id: 'catalog', label: 'Catalog', icon: Package, path: '/admin/catalog', altPath: '/catalog' },
        { id: 'workspace', label: 'Workspace', icon: Briefcase, isWorkspaceTrigger: true },
      ];
    }

    if (role === 'wholesaler' || role === 'b2b') {
      return [
        { id: 'b2b-catalog', label: 'Catalog', icon: Store, path: '/wholesaler/catalog', altPath: '/admin/catalog' },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/wholesaler/bulk-orders' },
        { id: 'clients', label: 'Clients', icon: Users, path: '/wholesaler/clients' },
        { id: 'catalogs', label: 'Builder', icon: Layers, path: '/wholesaler/catalogs' },
        { id: 'workspace', label: 'Workspace', icon: Briefcase, isWorkspaceTrigger: true },
      ];
    }

    if (role === 'patient') {
      return [
        { id: 'my-rx', label: 'My Rx', icon: FileText, path: '/patient/prescriptions', altPath: '/patient' },
        { id: 'my-programs', label: 'Programs', icon: Activity, path: '/patient/protocols' },
        { id: 'catalog', label: 'Catalog', icon: Package, path: '/catalog' },
        { id: 'workspace', label: 'Workspace', icon: Briefcase, isWorkspaceTrigger: true },
      ];
    }

    // Default: Admin / Staff
    return [
      { id: 'catalog', label: 'Catalog', icon: Package, path: '/admin/catalog', altPath: '/catalog' },
      { id: 'prescriptions', label: 'Rx', icon: FileText, path: '/admin/prescriptions', altPath: '/prescriptions' },
      { id: 'protocols', label: 'Protocols', icon: Layers, path: '/admin/protocols', altPath: '/protocols' },
      { id: 'patients', label: 'Patients', icon: Users, path: '/admin/patients', altPath: '/patients' },
      { id: 'workspace', label: 'Workspace', icon: Briefcase, isWorkspaceTrigger: true },
    ];
  }, [activeRole]);

  return (
    <div
      className="mobile-nav-dock"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99990,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e2e8f0',
        padding: '0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .mobile-nav-dock {
            display: none !important;
          }
        }
      `}</style>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActivePath = item.path && (pathname === item.path || pathname.startsWith(item.path) || (item.altPath && pathname.startsWith(item.altPath)));
        const isActiveWs = item.isWorkspaceTrigger && isDrawerOpen;
        const isActive = isActivePath || isActiveWs;

        const handleClick = () => {
          if (item.isWorkspaceTrigger) {
            toggleDrawer();
          } else if (item.path) {
            router.push(item.path);
          }
        };

        return (
          <button
            key={item.id}
            type="button"
            onClick={handleClick}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: 'none',
              border: 'none',
              padding: '0.3rem 0.2rem',
              color: isActive ? 'var(--color-primary, #003666)' : '#64748b',
              cursor: 'pointer',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} strokeWidth={isActive ? 2.3 : 1.75} />
              
              {item.isWorkspaceTrigger && activeItemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: '99px',
                    padding: '0.5px 5px',
                    minWidth: '16px',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  {activeItemCount}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
