'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Stethoscope, User, Dna, Microscope } from 'lucide-react';
import { FOUR_UNIFIED_PORTALS } from '@/constants/publicAdminDirectory';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const PORTAL_ICONS = {
  doctor: Stethoscope,
  patient: User,
  'dna-patient': Dna,
  'dna-nutritionist': Microscope,
};

/**
 * PortalContextSwitcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Role-aware Google Cloud Console switcher connecting the 4 Unified Portals:
 *   1. Doctors Portal (/doctor)
 *   2. Patients Portal (/patient)
 *   3. DNA Portal · Patient View (/patient/dna-report)
 *   4. DNA Portal · Nutritionist View (/patient/dna-report?view=nutritionist)
 *
 * Dual-profile rules:
 *   - Admin: sees all 4 portals.
 *   - Specialist (Doctor / Medical Director / Clinic / Nutritionist): sees
 *     Doctors Portal (/doctor) + DNA Nutritionist View + DNA Patient Preview.
 *   - Patient: sees Patients Portal (/patient) + DNA Patient View (never sees
 *     Doctor or Nutritionist portals).
 */
export default function PortalContextSwitcher({
  canAccessNutritionist = false,
  currentAudienceMode = 'patient',
  onSelectDnaAudience = null,
  lang = 'en',
}) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { is } = useRoleAccess();
  const isAdminUser = is('admin');
  const isDoctorOrSpecialist =
    isAdminUser ||
    is('doctor') ||
    is('medical_director') ||
    is('clinic') ||
    Boolean(canAccessNutritionist);
  const isEs = lang === 'es' || (typeof document !== 'undefined' && document.documentElement?.lang === 'es');

  const visiblePortals = FOUR_UNIFIED_PORTALS.filter((p) => {
    if (isAdminUser) return true;
    if (isDoctorOrSpecialist) {
      return p.id === 'doctor' || p.id === 'dna-nutritionist' || p.id === 'dna-patient';
    }
    return p.id === 'patient' || p.id === 'dna-patient';
  });

  const isDnaPage = pathname.startsWith('/patient/dna-report');

  return (
    <div
      className="no-print"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        backgroundColor: '#f1f3f4',
        border: '1px solid #dadce0',
        borderRadius: '6px',
        padding: '2px',
        overflowX: 'auto',
        maxWidth: '100%',
        scrollbarWidth: 'none',
      }}
      title={
        isEs
          ? 'Cambiar entre portales autorizados para tu perfil'
          : 'Switch between portals authorized for your profile'
      }
    >
      {visiblePortals.map((portal) => {
        const Icon = PORTAL_ICONS[portal.id] || Dna;
        const active =
          portal.id === 'doctor'
            ? pathname.startsWith('/doctor') || pathname.startsWith('/dr')
            : portal.id === 'patient'
              ? pathname.startsWith('/patient') && !isDnaPage
              : portal.id === 'dna-nutritionist'
                ? isDnaPage && currentAudienceMode === 'nutritionist'
                : isDnaPage && currentAudienceMode === 'patient';

        return (
          <button
            key={portal.id}
            type="button"
            onClick={() => {
              if (isDnaPage && onSelectDnaAudience && (portal.id === 'dna-nutritionist' || portal.id === 'dna-patient')) {
                onSelectDnaAudience(portal.id === 'dna-nutritionist' ? 'nutritionist' : 'patient');
                return;
              }
              router.push(portal.href);
            }}
            style={{
              flexShrink: 0,
              minHeight: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 9px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: active
                ? portal.id === 'dna-nutritionist'
                  ? '#003666'
                  : portal.id === 'dna-patient'
                    ? '#0d9488'
                    : '#1a73e8'
                : 'transparent',
              color: active ? '#ffffff' : '#5f6368',
              fontSize: '0.70rem',
              fontWeight: active ? 700 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={12} />
            <span>{isEs ? portal.labelEs : portal.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
}
