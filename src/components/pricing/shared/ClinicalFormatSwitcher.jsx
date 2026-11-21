'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FlaskConical, Syringe, Pill, Layers, Calculator, BookOpen, ShoppingBag, ChevronDown } from '@/lib/icons';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';

/**
 * ClinicalFormatSwitcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Google Cloud UX format navigation bar across all core clinical
 * & pricing modules (/pricing, /pricing/peptides, /pricing/pens,
 * /pricing/pellets, /proto, /calculator) so clinicians experience one continuous suite.
 */
export default function ClinicalFormatSwitcher({
  activeFormat = 'pens', // 'directory' | 'peptides' | 'pens' | 'pellets' | 'protocols' | 'calculator'
  lang: langProp = null,
  currency: currencyProp = null,
}) {
  const workspace = usePublicWorkspace?.() || null;
  const lang = langProp || workspace?.lang || 'en';
  const currency = currencyProp || workspace?.currency || null;
  const isEs = lang === 'es';
  const rfqCount = Array.isArray(workspace?.rfqItems) ? workspace.rfqItems.length : 0;
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!moreOpen || typeof window === 'undefined') return undefined;
    const onDocClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    window.addEventListener('mousedown', onDocClick);
    return () => window.removeEventListener('mousedown', onDocClick);
  }, [moreOpen]);

  const buildHref = (basePath) => {
    if (typeof workspace?.buildWorkspaceHref === 'function') {
      const href = workspace.buildWorkspaceHref(basePath);
      if (basePath === '/pricing/pens' || basePath === '/calculator') {
        const [pathOnly, qs] = href.split('?');
        if (!qs) return pathOnly;
        const p = new URLSearchParams(qs);
        p.delete('currency');
        const nextQs = p.toString();
        return nextQs ? `${pathOnly}?${nextQs}` : pathOnly;
      }
      return href;
    }
    const params = new URLSearchParams();
    if (isEs) params.set('lang', 'es');
    if (currency && basePath !== '/pricing/pens' && basePath !== '/calculator') {
      params.set('currency', currency);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const tabs = [
    {
      id: 'directory',
      href: buildHref('/pricing'),
      icon: Layers,
      label: isEs ? 'Todos los Catálogos' : 'All Schedules',
      shortLabel: isEs ? 'Todos' : 'All',
      badge: null,
    },
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
      id: 'protocols',
      href: buildHref('/proto'),
      icon: BookOpen,
      label: isEs ? 'Protocolos Clínicos' : 'Clinical Protocols',
      shortLabel: isEs ? 'Protocolos' : 'Protocols',
      badge: null,
    },
    {
      id: 'calculator',
      href: buildHref('/calculator'),
      icon: Calculator,
      label: isEs ? 'Calculadora de Uso' : 'Dosing Guide',
      shortLabel: isEs ? 'Dosis' : 'Dosing',
      badge: '6 Formats',
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
          max-width: 1240px;
          margin: 0 auto;
          padding: 6px 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .atlas-format-switcher-inner::-webkit-scrollbar {
          display: none;
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
          flex-shrink: 0;
        }
        .atlas-format-switcher-short {
          display: none;
        }
        @media (max-width: 768px) {
          .atlas-format-switcher-inner {
            padding: 6px 8px;
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 4px;
            overflow-x: visible;
          }
          .atlas-format-switcher-tab {
            padding: 5px 2px;
            font-size: 0.68rem;
            gap: 3px;
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

        {(() => {
          const moreCatalogs = [
            { id: '24genetics', href: buildHref('/pricing/24genetics'), label: isEs ? '24Genetics DNA' : '24Genetics DNA Panels' },
            { id: '24genomics-qatar', href: buildHref('/pricing/24genomics-qatar'), label: '24Genetics Qatar' },
            { id: 'nplab-hormones', href: buildHref('/pricing/nplab-hormones'), label: isEs ? 'Hormonas NP Lab' : 'NP Lab Hormones' },
            { id: 'colway', href: buildHref('/pricing/colway'), label: 'Colway UAE Derma' },
            { id: 'colway-hair', href: buildHref('/pricing/colway-hair'), label: 'Colway Hair & Trichology' },
            { id: 'colway-qatar', href: buildHref('/pricing/colway-qatar'), label: 'Colway Qatar' },
            { id: 'dnlab-pens', href: buildHref('/pricing/dnlab-pens'), label: 'DNLab Peptide Pens' },
          ];
          const activeMore = moreCatalogs.find((m) => m.id === activeFormat);
          return (
            <div ref={moreRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="atlas-format-switcher-tab"
                style={{
                  fontWeight: activeMore ? 800 : 650,
                  background: activeMore ? '#003666' : '#ffffff',
                  color: activeMore ? '#ffffff' : '#475569',
                  border: activeMore ? '1px solid #003666' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <span>{activeMore ? activeMore.label : (isEs ? 'Más Catálogos' : 'More Schedules')}</span>
                <ChevronDown size={12} style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              {moreOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    minWidth: '215px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.16)',
                    padding: '6px',
                    zIndex: 1200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {moreCatalogs.map((item) => {
                    const isCur = item.id === activeFormat;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: isCur ? 800 : 600,
                          color: isCur ? '#003666' : '#334155',
                          background: isCur ? '#eff6ff' : 'transparent',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{item.label}</span>
                        {isCur && <span style={{ fontSize: '0.65rem', color: '#1d4ed8' }}>●</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {rfqCount > 0 && typeof workspace?.setIsQuoteDrawerOpen === 'function' && (
          <button
            type="button"
            onClick={() => workspace.setIsQuoteDrawerOpen(true)}
            className="atlas-format-switcher-tab"
            style={{
              marginLeft: 'auto',
              fontWeight: 750,
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #86efac',
              cursor: 'pointer',
            }}
            title={isEs ? 'Abrir cotización combinada B2B' : 'Open combined B2B quote cart'}
          >
            <ShoppingBag size={13} color="#16a34a" style={{ flexShrink: 0 }} />
            <span>{isEs ? `Presupuesto (${rfqCount})` : `Quote (${rfqCount})`}</span>
          </button>
        )}
      </div>
    </nav>
  );
}
