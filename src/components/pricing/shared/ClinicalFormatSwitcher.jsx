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
      shortLabel: isEs ? 'Viales' : 'Vials',
      badge: isEs ? 'Catálogo' : 'Schedule',
    },
    {
      id: 'pens',
      href: buildHref('/pricing/pens'),
      icon: Syringe,
      label: isEs ? 'Guía de Dosificación Pens' : 'Peptide Pen Dosing Guide',
      shortLabel: isEs ? 'Plumas' : 'Pens',
      badge: 'U-100 · 27 Pens',
    },
    {
      id: 'pellets',
      href: buildHref('/pricing/pellets'),
      icon: Pill,
      label: isEs ? 'Pellets Hormonales' : 'Hormone Pellets',
      shortLabel: 'Pellets',
      badge: 'EU GMP',
    },
    {
      id: 'directory',
      href: buildHref('/pricing'),
      icon: Layers,
      label: isEs ? 'Todos los Catálogos' : 'All Schedules',
      shortLabel: isEs ? 'Todos' : 'All',
      badge: null,
    },
  ];

  return (
    <nav
      aria-label={isEs ? 'Selector rápido de formato clínico' : 'Clinical format switcher'}
      className="atlas-format-switcher-nav"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .atlas-format-switcher-nav {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          width: 100%;
        }
        .atlas-format-switcher-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .atlas-format-switcher-tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 0.74rem;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.15s ease;
          min-width: 0;
        }
        .atlas-format-switcher-short {
          display: none;
        }
        @media (max-width: 768px) {
          .atlas-format-switcher-inner {
            padding: 6px 10px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 5px;
          }
          .atlas-format-switcher-tab {
            padding: 6px 4px;
            font-size: 0.72rem;
            gap: 4px;
            border-radius: 7px;
            min-height: 34px;
          }
          .atlas-format-switcher-full,
          .atlas-format-switcher-badge {
            display: none !important;
          }
          .atlas-format-switcher-short {
            display: inline !important;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      ` }} />
      <div className="atlas-format-switcher-inner">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === activeFormat;
          return (
            <Link
              key={t.id}
              href={t.href}
              aria-current={isActive ? 'page' : undefined}
              className="atlas-format-switcher-tab"
              style={{
                fontWeight: isActive ? 800 : 650,
                background: isActive ? '#003666' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                border: isActive ? '1px solid #003666' : '1px solid #cbd5e1',
                boxShadow: isActive ? '0 1px 3px rgba(0, 54, 102, 0.16)' : 'none',
              }}
            >
              <Icon size={13} color={isActive ? '#93c5fd' : '#64748b'} style={{ flexShrink: 0 }} />
              <span className="atlas-format-switcher-full">{t.label}</span>
              <span className="atlas-format-switcher-short">{t.shortLabel}</span>
              {t.badge && (
                <span
                  className="atlas-format-switcher-badge"
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
