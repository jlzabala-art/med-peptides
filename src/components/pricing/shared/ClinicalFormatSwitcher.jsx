'use client';

import React from 'react';
import Link from 'next/link';
import { FlaskConical, Syringe, Pill, Layers } from '@/lib/icons';

/**
 * ClinicalFormatSwitcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Google Cloud UX format navigation bar across the 3 core clinical
 * formularies (/pricing/peptides, /pricing/pens, /pricing/pellets) so
 * clinicians can switch formats in 1 click without returning to /pricing.
 */
export default function ClinicalFormatSwitcher({
  activeFormat = 'pens', // 'peptides' | 'pens' | 'pellets'
  lang = 'en',
  currency = null,
}) {
  const isEs = lang === 'es';

  const buildHref = (basePath) => {
    const params = new URLSearchParams();
    if (isEs) params.set('lang', 'es');
    if (currency && basePath !== '/pricing/pens') params.set('currency', currency);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const tabs = [
    {
      id: 'peptides',
      href: buildHref('/pricing/peptides'),
      icon: FlaskConical,
      label: isEs ? 'Viales y Péptidos' : 'Peptide Vials & Kits',
      badge: isEs ? 'Catálogo' : 'Schedule',
    },
    {
      id: 'pens',
      href: buildHref('/pricing/pens'),
      icon: Syringe,
      label: isEs ? 'Guía de Dosificación Pens' : 'Peptide Pen Dosing Guide',
      badge: 'U-100 · 27 Pens',
    },
    {
      id: 'pellets',
      href: buildHref('/pricing/pellets'),
      icon: Pill,
      label: isEs ? 'Pellets Hormonales' : 'Hormone Pellets',
      badge: 'EU GMP',
    },
    {
      id: 'directory',
      href: buildHref('/pricing'),
      icon: Layers,
      label: isEs ? 'Todos los Catálogos' : 'All Schedules',
      badge: null,
    },
  ];

  return (
    <nav
      aria-label={isEs ? 'Selector rápido de formato clínico' : 'Clinical format switcher'}
      style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === activeFormat;
          return (
            <Link
              key={t.id}
              href={t.href}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '7px',
                fontSize: '0.74rem',
                fontWeight: isActive ? 800 : 650,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: isActive ? '#003666' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                border: isActive ? '1px solid #003666' : '1px solid #cbd5e1',
                boxShadow: isActive ? '0 1px 3px rgba(0, 54, 102, 0.16)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={13} color={isActive ? '#93c5fd' : '#64748b'} />
              <span>{t.label}</span>
              {t.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 750,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255, 255, 255, 0.18)' : '#f1f5f9',
                    color: isActive ? '#e0f2fe' : '#64748b',
                  }}
                >
                  {t.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
