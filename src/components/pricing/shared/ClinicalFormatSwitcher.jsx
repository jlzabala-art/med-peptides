'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FlaskConical, Syringe, Pill, Layers, Calculator, BookOpen, ShoppingBag, ChevronDown, Dna, Sparkles } from '@/lib/icons';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { PRICING_GROUPS, findPricingGroupByFormat } from '@/constants/pricingTaxonomy';

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
  const [openGroupId, setOpenGroupId] = useState(null);
  const switcherRef = useRef(null);

  useEffect(() => {
    if (!openGroupId || typeof window === 'undefined') return undefined;
    const onDocClick = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setOpenGroupId(null);
    };
    window.addEventListener('mousedown', onDocClick);
    return () => window.removeEventListener('mousedown', onDocClick);
  }, [openGroupId]);

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

  const activeGroup = findPricingGroupByFormat(activeFormat);
  const groupIconMap = {
    peptides: FlaskConical,
    genomics: Dna,
    derma: Sparkles,
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
    ...PRICING_GROUPS.map((grp) => ({
      id: grp.id,
      isGroup: true,
      group: grp,
      href: buildHref(`/pricing?group=${grp.hubMacroId}`),
      icon: groupIconMap[grp.iconKey] || Layers,
      label: isEs ? grp.labelEs : grp.labelEn,
      shortLabel: isEs ? grp.shortEs : grp.shortEn,
      badge: String(grp.items.length),
    })),
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
      <div ref={switcherRef} className="atlas-format-switcher-inner" style={{ position: 'relative', overflow: 'visible', flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isGroupActive = t.isGroup && activeGroup?.id === t.id;
          const isActive = t.id === activeFormat || isGroupActive;
          const isDropdownOpen = t.isGroup && openGroupId === t.id;

          if (t.isGroup) {
            return (
              <div key={t.id} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setOpenGroupId((prev) => (prev === t.id ? null : t.id))}
                  className="atlas-format-switcher-tab"
                  style={{
                    fontWeight: isActive ? 800 : 650,
                    background: isActive ? '#003666' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    border: isActive ? '1px solid #003666' : '1px solid #cbd5e1',
                    boxShadow: isActive ? '0 1px 3px rgba(0, 54, 102, 0.16)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={13} color={isActive ? '#93c5fd' : '#64748b'} style={{ flexShrink: 0 }} />
                  <span className="atlas-format-switcher-full">{t.label}</span>
                  <span className="atlas-format-switcher-short">{t.shortLabel}</span>
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
                  <ChevronDown size={12} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                </button>
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      minWidth: '230px',
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
                    {t.group.items.map((item) => {
                      const isCur = item.id === activeFormat;
                      return (
                        <Link
                          key={item.id}
                          href={buildHref(item.href)}
                          onClick={() => setOpenGroupId(null)}
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
                            gap: '8px',
                          }}
                        >
                          <span>{isEs ? item.labelEs : item.labelEn}</span>
                          {item.badge && (
                            <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '999px', background: isCur ? '#dbeafe' : '#f1f5f9', color: isCur ? '#1d4ed8' : '#64748b', fontWeight: 700 }}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                    <Link
                      href={t.href}
                      onClick={() => setOpenGroupId(null)}
                      style={{
                        marginTop: '4px',
                        padding: '7px 10px',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '0.72rem',
                        fontWeight: 750,
                        color: '#1a73e8',
                        textDecoration: 'none',
                      }}
                    >
                      {isEs ? 'Ver todo el grupo en Hub →' : 'View all in Hub →'}
                    </Link>
                  </div>
                )}
              </div>
            );
          }

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

      {/* Level 2: Sibling Schedules Sub-Rail when inside a Theme Group */}
      {activeGroup && activeGroup.items.length > 1 && (
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <div
            style={{
              maxWidth: '1240px',
              margin: '0 auto',
              padding: '4px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', whiteSpace: 'nowrap', marginRight: '2px' }}>
              {isEs ? activeGroup.shortEs : activeGroup.shortEn}:
            </span>
            {activeGroup.items.map((sib) => {
              const isCur = sib.id === activeFormat;
              return (
                <Link
                  key={sib.id}
                  href={buildHref(sib.href)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '999px',
                    fontSize: '0.71rem',
                    fontWeight: isCur ? 800 : 600,
                    background: isCur ? '#eff6ff' : 'transparent',
                    color: isCur ? '#1d4ed8' : '#475569',
                    border: isCur ? '1px solid #bfdbfe' : '1px solid transparent',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {isEs ? sib.labelEs : sib.labelEn}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
