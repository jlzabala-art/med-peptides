"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sliders,
  User,
  Stethoscope,
  FlaskConical,
  X,
  Search,
  Building,
  Minimize2,
  Maximize2,
  Pin,
  Sparkles
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import {
  getActiveContext,
  setActiveDoctor,
  setActivePatient,
  setActiveSupplier,
  clearActiveDoctor,
  clearActivePatient,
  clearActiveSupplier,
  setDockMinimized,
  setDockClosed,
  reopenDock,
  subscribeToActiveContext
} from '@/services/activeContextService';

export default function GCPImpersonationDock() {
  const pathname = usePathname();
  const router = useRouter();

  const [context, setContext] = useState(getActiveContext());
  const [mounted, setMounted] = useState(false);

  // The floating context dock is strictly scoped to public catalog/brand collection pages
  // (Home "/" and "/collection/*"). It is excluded 100% from all B2B portals (Admin, Doctor,
  // Clinic, Supplier, Wholesaler, Workspace, Rx, Quotations, Shared tables) and individual
  // product/protocol datasheets where the Workspace or sticky action bar handles this natively.
  const isAllowedRoute = useMemo(() => {
    if (!pathname) return false;
    return pathname === '/' || pathname.startsWith('/collection/');
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    setContext(getActiveContext());
    const unsubscribe = subscribeToActiveContext((newCtx) => {
      setContext(newCtx);
    });
    return unsubscribe;
  }, []);

  // Global shortcut ⌘K auto-restores the dock if it was closed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (context.isDockClosed) {
          reopenDock();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [context.isDockClosed]);

  // Auto-detect context from active URL if slot is unpinned
  const resolvedDoctor = useMemo(() => {
    if (context.doctor) return context.doctor;
    if (pathname?.startsWith('/dr/')) {
      const slug = pathname.replace('/dr/', '').split('/')[0];
      const formatted = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      return {
        id: slug,
        name: `Dr. ${formatted}`,
        slug: slug,
        isAutoDetected: true
      };
    }
    return null;
  }, [context.doctor, pathname]);

  const resolvedPatient = useMemo(() => {
    if (context.patient) return context.patient;
    if (pathname?.startsWith('/rx/')) {
      const code = pathname.replace('/rx/', '').split('/')[0];
      return {
        id: code,
        name: `Rx #${code}`,
        code: code,
        isAutoDetected: true
      };
    }
    return null;
  }, [context.patient, pathname]);

  const resolvedSupplier = useMemo(() => {
    if (context.supplier) return context.supplier;
    if (pathname?.startsWith('/collection/')) {
      const slug = pathname.replace('/collection/', '').split('/')[0];
      const formatted = slug.charAt(0).toUpperCase() + slug.slice(1);
      return {
        id: slug,
        name: formatted,
        slug: slug,
        isAutoDetected: true
      };
    }
    return null;
  }, [context.supplier, pathname]);

  const handleOpenSearch = (initialFilter = 'All') => {
    triggerHaptic('selection');
    window.dispatchEvent(new CustomEvent('open-gcp-command-palette', { detail: { filter: initialFilter } }));
  };

  const isDoctorView = pathname?.startsWith('/dr/') || pathname?.startsWith('/doctor') || pathname?.startsWith('/medical');
  const hasLeftSidebar = pathname?.startsWith('/account-manager') || pathname?.startsWith('/tools') || pathname?.startsWith('/admin') || pathname?.startsWith('/dr/') || pathname?.startsWith('/doctor') || pathname?.startsWith('/medical') || pathname?.startsWith('/clinic') || pathname?.startsWith('/wholesaler') || pathname?.startsWith('/supplier');
  const hasRightSidebar = pathname?.startsWith('/p/') || pathname?.startsWith('/product/');
  const activeCount = [resolvedDoctor, resolvedPatient, !isDoctorView ? resolvedSupplier : null].filter(Boolean).length;

  if (!mounted || !isAllowedRoute) return null;

  // ── 1. CLOSED STATE: Discrete, Sleek Floating Glass Activator Pill ──────────
  if (context.isDockClosed) {
    return (
      <aside
        aria-label="Reopen Operations Context Dock"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: hasRightSidebar ? 'calc(310px + 1rem)' : '20px',
          zIndex: 99990,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          color: '#0f172a',
          borderRadius: '9999px',
          padding: '6px 14px',
          height: '38px',
          boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.14), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.90)',
          outline: '1px solid rgba(203, 213, 225, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none'
        }}
        onClick={() => {
          triggerHaptic('selection');
          reopenDock();
        }}
        title="Click to reopen Active Operations Context Dock (or press ⌘K)"
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#137333', boxShadow: '0 0 6px #137333' }} />
        <span>⚡ Activar Contexto</span>
        <kbd style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
          ⌘K
        </kbd>
        <Maximize2 size={13} style={{ color: '#64748b', marginLeft: '2px' }} />
      </aside>
    );
  }

  // ── 2. MINIMIZED STATE: Compact Active Summary Glass Pill ──────────────────
  if (context.isDockMinimized) {
    return (
      <aside
        aria-label="Expand Operations Context Dock"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '20px',
          zIndex: 99990,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          color: '#0f172a',
          borderRadius: '9999px',
          padding: '6px 14px',
          height: '38px',
          boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.14), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.90)',
          outline: '1px solid rgba(203, 213, 225, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none'
        }}
        onClick={() => {
          triggerHaptic('selection');
          setDockMinimized(false);
        }}
        title="Click to expand Operations Context Dock"
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#137333', boxShadow: '0 0 6px #137333' }} />
        <span>Contexto ({activeCount})</span>
        {resolvedDoctor && <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>🩺 {resolvedDoctor.name.replace('Dr. ', '')}</span>}
        {resolvedPatient && <span style={{ fontSize: '0.72rem', color: '#7e22ce', fontWeight: 600 }}>👤 {resolvedPatient.name}</span>}
        {!isDoctorView && resolvedSupplier && <span style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 600 }}>🏭 {resolvedSupplier.name}</span>}
        <Maximize2 size={13} style={{ color: '#64748b' }} />
      </aside>
    );
  }

  // ── 3. FULL EXPANDED STATE: Active Operations Context Dock ──────────────────
  return (
    <>
      <style jsx>{`
        .gcp-dock-wrapper {
          position: fixed;
          bottom: 16px;
          z-index: 99990;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.90);
          outline: 1px solid rgba(203, 213, 225, 0.45);
          border-radius: 9999px;
          padding: 6px 14px;
          min-height: 48px;
          color: #0f172a;
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 1024px) {
          .gcp-dock-wrapper.has-right-sidebar {
            left: calc((100vw - 320px) / 2);
            transform: translateX(-50%);
            width: auto;
            max-width: min(calc(100vw - 360px), 820px);
          }
          .gcp-dock-wrapper.has-left-sidebar {
            left: calc(260px + (100vw - 260px) / 2);
            transform: translateX(-50%);
            width: auto;
            max-width: min(calc(100vw - 300px), 820px);
          }
          .gcp-dock-wrapper:not(.has-left-sidebar):not(.has-right-sidebar) {
            left: 50%;
            transform: translateX(-50%);
            width: auto;
            max-width: 820px;
          }
        }

        @media (min-width: 900px) and (max-width: 1023px) {
          .gcp-dock-wrapper.has-left-sidebar {
            left: calc(260px + 1.5rem);
            right: 1.5rem;
            max-width: 820px;
            transform: none;
            width: auto;
          }
          .gcp-dock-wrapper:not(.has-left-sidebar) {
            left: 50%;
            transform: translateX(-50%);
            width: min(calc(100% - 32px), 820px);
            max-width: 820px;
          }
        }

        @media (max-width: 899px) {
          .gcp-dock-wrapper {
            left: 10px;
            right: 10px;
            transform: none;
            width: auto;
            padding: 6px 10px;
            border-radius: 16px;
          }
          .gcp-dock-slots {
            overflow-x: auto;
            max-width: 100%;
          }
        }
      `}</style>

      <aside
        aria-label="Active Operations Context Dock"
        className={`gcp-dock-wrapper ${hasLeftSidebar ? 'has-left-sidebar' : ''} ${hasRightSidebar ? 'has-right-sidebar' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>

          {/* LEFT: Live Active Operations Context (Doctor, Patient, Supplier) */}
          <div className="gcp-dock-slots" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            
            {/* Active Doctor Slot */}
            {resolvedDoctor ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  background: 'rgba(240, 253, 244, 0.9)',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  boxShadow: '0 1px 2px rgba(21, 128, 61, 0.08)'
                }}
                title={resolvedDoctor.isAutoDetected ? 'Active Doctor (Auto-detected from URL)' : 'Pinned Active Doctor'}
              >
                <Stethoscope size={13} style={{ flexShrink: 0 }} />
                <span
                  onClick={() => resolvedDoctor.slug && router.push(`/dr/${resolvedDoctor.slug}`)}
                  style={{ cursor: 'pointer', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {resolvedDoctor.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('selection');
                    clearActiveDoctor();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#15803d',
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: '0.85rem',
                    lineHeight: 1,
                    fontWeight: 700
                  }}
                  title="Unpin active doctor"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenSearch('Physicians')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Search and select active doctor"
              >
                <Stethoscope size={11} />
                <span>+ Médico</span>
              </button>
            )}

            {/* Active Patient Slot */}
            {resolvedPatient ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  background: 'rgba(250, 245, 255, 0.9)',
                  border: '1px solid #e9d5ff',
                  color: '#7e22ce',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  boxShadow: '0 1px 2px rgba(126, 34, 206, 0.08)'
                }}
                title={resolvedPatient.isAutoDetected ? 'Active Patient (Auto-detected from URL)' : 'Pinned Active Patient'}
              >
                <User size={13} style={{ flexShrink: 0 }} />
                <span
                  onClick={() => resolvedPatient.code && router.push(`/rx/${resolvedPatient.code}`)}
                  style={{ cursor: 'pointer', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {resolvedPatient.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('selection');
                    clearActivePatient();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#7e22ce',
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: '0.85rem',
                    lineHeight: 1,
                    fontWeight: 700
                  }}
                  title="Unpin active patient"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenSearch('Patients')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Search and select active patient"
              >
                <User size={11} />
                <span>+ Paciente</span>
              </button>
            )}

            {/* Active Supplier Slot (Hidden on Doctor View to avoid confusion) */}
            {!isDoctorView && (
              resolvedSupplier ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    background: 'rgba(239, 246, 255, 0.9)',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    boxShadow: '0 1px 2px rgba(29, 78, 216, 0.08)'
                  }}
                  title={resolvedSupplier.isAutoDetected ? 'Active Supplier (Auto-detected from URL)' : 'Pinned Active Supplier'}
                >
                  <Building size={13} style={{ flexShrink: 0 }} />
                  <span
                    onClick={() => resolvedSupplier.slug && router.push(`/collection/${resolvedSupplier.slug}`)}
                    style={{ cursor: 'pointer', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {resolvedSupplier.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('selection');
                      clearActiveSupplier();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '0.85rem',
                      lineHeight: 1,
                      fontWeight: 700
                    }}
                    title="Unpin active supplier"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSearch('Suppliers')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Search and select active supplier"
                >
                  <Building size={11} />
                  <span>+ Proveedor</span>
                </button>
              )
            )}

          </div>

          {/* CENTER: Search / Activate Trigger (Algolia & Catalog Integrated) */}
          <div
            onClick={() => handleOpenSearch('All')}
            style={{
              flex: 1,
              minWidth: '200px',
              maxWidth: '380px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              borderRadius: '9999px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              fontSize: '0.76rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = '#1a73e8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            title="Search clinical registry, patients, doctors, or suppliers (⌘K)"
          >
            <Search size={13} style={{ color: '#1a73e8', flexShrink: 0 }} />
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Buscar o activar contexto...
            </span>
            <kbd style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontFamily: 'monospace', fontWeight: 700 }}>
              ⌘K
            </kbd>
          </div>

          {/* RIGHT: Quick Hub Link, Minimize & Close Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <Link
              href="/account-manager"
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1a73e8',
                fontSize: '0.72rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Open Operations Console"
            >
              <Sliders size={11} />
              <span>Hub</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setDockMinimized(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="Minimizar barra"
            >
              <Minimize2 size={13} />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('impact');
                setDockClosed(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="Cerrar barra (se puede reactivar con el botón flotante en la esquina o con ⌘K)"
            >
              <X size={14} />
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
