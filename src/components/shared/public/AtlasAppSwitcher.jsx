'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ChevronRight, Clock, Search } from 'lucide-react';
import { useAtlasContext } from '@/context/AtlasContextProvider';

/**
 * AtlasAppSwitcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Google Workspace-style App Switcher shared across PublicUnifiedHeader
 * and standalone module headers (e.g. LabelsHeader) so all Atlas modules feel
 * connected as one continuous platform.
 */
export default function AtlasAppSwitcher({
  isSpanish = false,
  portalHref = '/login',
  variant = 'dark', // 'dark' (navy header) | 'light' (white header)
  extraFooter = null,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const pathname = usePathname() || '/';
  const { recentItems } = useAtlasContext();

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const apps = [
    { label: isSpanish ? 'Catálogo Clínico' : 'Clinical Catalog', href: '/c/CAT-MU9L9GBN' },
    { label: isSpanish ? 'Protocolos Clínicos' : 'Clinical Protocols', href: '/proto' },
    { label: isSpanish ? 'Hub de Precios B2B' : 'B2B Price Hub', href: '/pricing' },
    { label: isSpanish ? 'Lista de Péptidos' : 'Peptides Schedule', href: '/pricing/peptides' },
    { label: isSpanish ? 'Tarifa de Pellets' : 'Pellets Price Schedule', href: '/pricing/pellets' },
    { label: isSpanish ? 'Directorio de Viales' : 'Peptide Vials', href: '/vials' },
    { label: isSpanish ? 'Guía Implante Pellets' : 'Trocar Pellets Guide', href: '/guides/hormone-pellets-implantation' },
    { label: isSpanish ? 'Calculadora de Dosis' : 'Dosing Calculator', href: '/calculator' },
    { label: isSpanish ? 'Mi Portal' : 'My Portal', href: portalHref },
  ];

  const isLight = variant === 'light';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isSpanish ? 'Cambiar de módulo Atlas' : 'Switch Atlas Module'}
        aria-expanded={open}
        title={isSpanish ? 'Aplicaciones Atlas' : 'Atlas Apps'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          border: isLight
            ? '1px solid var(--atlas-border, #e2e8f0)'
            : '1px solid rgba(255,255,255,0.14)',
          background: isLight
            ? (open ? '#eff6ff' : '#f8fafc')
            : (open ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'),
          color: isLight ? '#334155' : '#e2e8f0',
          cursor: 'pointer',
        }}
      >
        <LayoutGrid size={16} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            width: '280px',
            maxWidth: '90vw',
            background: 'var(--atlas-surface, #ffffff)',
            border: '1px solid var(--atlas-border, #e2e8f0)',
            borderRadius: '12px',
            boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16)',
            padding: '8px',
            zIndex: 9999,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '3px',
          }}
        >
          <div style={{ padding: '4px 8px 5px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
            {isSpanish ? 'Plataforma Atlas' : 'Atlas Platform'}
          </div>

          {apps.map((app) => {
            const isActive = pathname === app.href || (app.href !== '/' && pathname.startsWith(`${app.href}/`));
            return (
              <Link
                key={app.href}
                href={app.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isActive ? '#1a73e8' : '#0f172a',
                  background: isActive ? '#eff6ff' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <span>{app.label}</span>
                <ChevronRight size={13} color="#94a3b8" />
              </Link>
            );
          })}

          {Array.isArray(recentItems) && recentItems.length > 0 && (
            <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ padding: '2px 8px 4px', fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} />
                <span>{isSpanish ? 'Visto recientemente' : 'Recently Viewed'}</span>
              </div>
              {recentItems.slice(0, 4).map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '7px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#334155',
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                  <ChevronRight size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-atlas-command-palette'));
              }
            }}
            style={{
              marginTop: '4px',
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#334155',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Search size={12} color="#1a73e8" />
              <span>{isSpanish ? 'Buscador Global' : 'Quick Jump'}</span>
            </span>
            <kbd style={{ fontSize: '0.66rem', padding: '1px 5px', borderRadius: '4px', background: '#fff', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>
              ⌘K
            </kbd>
          </button>

          {extraFooter ? extraFooter(() => setOpen(false)) : null}
        </div>
      )}
    </div>
  );
}
