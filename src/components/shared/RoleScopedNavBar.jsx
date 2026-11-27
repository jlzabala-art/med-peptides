'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSurfacePolicy } from '@/hooks/useSurfacePolicy';
import { usePricing } from '@/hooks/usePricing';
import { getRoleMenuItems } from '@/constants/roleNavigationRegistry';

/**
 * RoleScopedNavBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean, monochrome Google-Cloud-UX role navigation bar rendered ONLY for
 * authenticated non-admin roles (Distributor, Wholesaler, Doctor, Clinic,
 * Patient, Account Manager, Supplier, Pharmacy).
 *
 * - Admin sees the full platform menus instead.
 * - Guest / signed share-link (/s/[token]) visitors see ZERO global menus.
 */
export default function RoleScopedNavBar({ lang = 'en' }) {
  const pathname = usePathname() || '/';
  const { userProfile } = useAuth();
  const policy = useSurfacePolicy();
  const { market, isSimulating } = usePricing();
  const isEs = lang === 'es';

  const items = useMemo(() => {
    if (!policy.canSeeRoleMenu) return [];
    return getRoleMenuItems({
      role: policy.effectiveRole,
      market,
      allowedSchedules: isSimulating ? null : (userProfile?.allowedSchedules || null),
    });
  }, [policy.canSeeRoleMenu, policy.effectiveRole, market, isSimulating, userProfile?.allowedSchedules]);

  if (!policy.canSeeRoleMenu || items.length === 0) return null;

  return (
    <nav
      className="no-print"
      aria-label={isEs ? 'Navegación de rol' : 'Role navigation'}
      style={{
        width: '100%',
        background: '#ffffff',
        borderBottom: '1px solid #dadce0',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {items.map((item) => {
          const baseHref = item.href.split('?')[0];
          const isActive =
            baseHref === '/pricing'
              ? pathname === '/pricing'
              : pathname === baseHref || pathname.startsWith(`${baseHref}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '32px',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: isActive ? 700 : 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                color: isActive ? '#003666' : '#3c4043',
                backgroundColor: isActive ? '#eff6ff' : '#f8f9fa',
                border: `1px solid ${isActive ? '#bfdbfe' : '#dadce0'}`,
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {isEs ? item.labelEs : item.labelEn}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
