'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X, Tags, Upload, FlaskConical, Calculator, ChevronRight, User, ExternalLink, Calendar, Package } from 'lucide-react';
import { PHARMACY_OPS_TOOLS } from '@/constants/publicAdminDirectory';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const TOOL_ICONS = {
  labels: Tags,
  intake: Upload,
  compounding: FlaskConical,
  calculator: Calculator,
};

/**
 * PharmacyOpsWorkspaceBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console sub-navigation switcher shared across Block 3 tools:
 *   - /labels (Labels Studio)
 *   - /rx/intake (New Prescription Intake)
 *   - /compounding (Compounding Lab)
 *   - /calculator (Reconstitution Calculator)
 * Includes responsive mobile horizontal scrolling (flex-shrink: 0) and an
 * inline live Patient / RX-XXXX quick jumper.
 */
export default function PharmacyOpsWorkspaceBar({ lang = 'en' }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { is } = useRoleAccess();
  const isAdminOrStaff = is('admin') || is('doctor') || is('medical_director') || is('compounding_pharmacy') || is('account_manager');
  const isLabelsHome = pathname === '/labels' || pathname === '/labels/';
  const canQuickSearchRx = !isLabelsHome && (isAdminOrStaff || pathname.startsWith('/labels') || pathname.startsWith('/rx'));
  const isEs = lang === 'es' || (typeof document !== 'undefined' && document.documentElement?.lang === 'es');

  const [rxQuery, setRxQuery] = useState('');
  const [rxResults, setRxResults] = useState([]);
  const [rxOpen, setRxOpen] = useState(false);
  const [loadingRx, setLoadingRx] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setRxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const q = rxQuery.trim();
    if (!canQuickSearchRx || q.length < 2) {
      setRxResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingRx(true);
      try {
        const res = await fetch(`/api/labels/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) {
          const data = await res.json();
          setRxResults(Array.isArray(data?.results) ? data.results.slice(0, 16) : []);
        }
      } catch {
        // ignore abort
      } finally {
        if (!ctrl.signal.aborted) setLoadingRx(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [rxQuery, canQuickSearchRx]);

  // Group search results by Patient so patients with multiple prescriptions are clearly structured
  const groupedPatients = useMemo(() => {
    const groups = new Map();
    const seenCodes = new Set();

    (rxResults || []).forEach((item) => {
      const pName = String(item.patientName || item.name || 'Patient').trim();
      const normName = pName.toLowerCase().replace(/\s+/g, ' ');
      const rawCode = String(item.code || item.id || '').trim();
      const codeKey = rawCode.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (codeKey && seenCodes.has(`${normName}::${codeKey}`)) return;
      if (codeKey) seenCodes.add(`${normName}::${codeKey}`);

      if (!groups.has(normName)) {
        groups.set(normName, {
          patientName: pName,
          prescriptions: [],
        });
      }

      const g = groups.get(normName);
      g.prescriptions.push({
        code: rawCode,
        title: item.title || item.treatmentTitle || 'Compounded Prescription Protocol',
        date: item.date || item.createdAt || '',
        partsCount: item.partsCount || 1,
        status: item.status || 'approved',
        raw: item,
      });
    });

    return Array.from(groups.values());
  }, [rxResults]);

  return (
    <div
      className={canQuickSearchRx ? 'no-print' : 'no-print atlas-hide-when-footer-nav'}
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #dadce0',
        padding: '0 16px',
        position: 'relative',
        zIndex: 35,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          minHeight: '44px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: 4 Pharmacy & Rx Tool Tabs (Desktop >=1024px; on mobile/tablet lives in B2BUniversalMenu footer) */}
        <div
          className="atlas-chip-rail atlas-hide-when-footer-nav"
          style={{
            gap: '4px',
            maxWidth: '100%',
            padding: '4px 12px 4px 0',
          }}
        >
          {PHARMACY_OPS_TOOLS.map((tool) => {
            const Icon = TOOL_ICONS[tool.id] || FlaskConical;
            const active =
              tool.href === '/labels'
                ? pathname.startsWith('/labels')
                : tool.href === '/rx/intake'
                  ? pathname.startsWith('/rx/intake')
                  : pathname.startsWith(tool.href);

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => router.push(tool.href)}
                style={{
                  flexShrink: 0,
                  minHeight: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: active ? '1px solid #d2e3fc' : '1px solid transparent',
                  background: active ? '#e8f0fe' : 'transparent',
                  color: active ? '#1a73e8' : '#5f6368',
                  fontSize: '0.76rem',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={active ? '#1a73e8' : '#5f6368'} />
                <span>{isEs ? tool.labelEs : tool.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Live Patient / RX-XXXX Search (Rule #74: Full-width on mobile) */}
        {canQuickSearchRx && (
          <div ref={wrapRef} style={{ position: 'relative', minWidth: '220px', flex: '1 1 280px', padding: '4px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f3f4',
                border: rxOpen ? '1px solid #1a73e8' : '1px solid #dadce0',
                borderRadius: '6px',
                padding: '6px 10px',
                minHeight: '38px',
              }}
            >
              <Search size={13} color="#5f6368" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={rxQuery}
                onChange={(e) => {
                  setRxQuery(e.target.value);
                  setRxOpen(true);
                }}
                onFocus={() => setRxOpen(true)}
                placeholder={isEs ? 'Saltar a paciente o #RX...' : 'Jump to patient or #RX...'}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.75rem',
                  color: '#202124',
                  width: '100%',
                }}
              />
              {rxQuery && (
                <button
                  type="button"
                  onClick={() => setRxQuery('')}
                  style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: '#5f6368' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {rxOpen && rxQuery.trim().length >= 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: 'min(96vw, 580px)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                  zIndex: 95,
                  padding: '8px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                }}
              >
                {/* Header with summary count */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px 8px',
                    borderBottom: '1px solid #f1f5f9',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {isEs ? 'Resultados de Búsqueda de Pacientes' : 'Patient & Prescription Matches'}
                  </span>
                  {!loadingRx && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '1px 7px', borderRadius: '10px' }}>
                      {groupedPatients.length} {groupedPatients.length === 1 ? (isEs ? 'paciente' : 'patient') : (isEs ? 'pacientes' : 'patients')} · {rxResults.length} Rx
                    </span>
                  )}
                </div>

                {loadingRx ? (
                  <div style={{ padding: '16px 12px', fontSize: '0.76rem', color: '#64748b', textAlign: 'center' }}>
                    {isEs ? 'Buscando historias y recetas...' : 'Searching patients & prescriptions...'}
                  </div>
                ) : groupedPatients.length === 0 ? (
                  <div style={{ padding: '16px 12px', fontSize: '0.76rem', color: '#64748b', textAlign: 'center' }}>
                    {isEs ? 'No se encontraron prescripciones coincidentes' : 'No matching patient prescriptions found'}
                  </div>
                ) : (
                  groupedPatients.map((group, gIdx) => {
                    return (
                      <div
                        key={`pharmacy-ops-group-${group.patientName}-${gIdx}`}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Patient Entity Header */}
                        <div
                          style={{
                            padding: '7px 10px',
                            background: '#f8fafc',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ display: 'inline-flex', padding: '3px', borderRadius: '4px', background: '#f3e8fd', color: '#8430ce' }}>
                              <User size={12} />
                            </span>
                            <span style={{ fontWeight: 800, fontSize: '0.80rem', color: '#0f172a' }}>
                              {group.patientName}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #dbeafe',
                            }}
                          >
                            {group.prescriptions.length} {group.prescriptions.length === 1 ? (isEs ? 'Prescripción' : 'Prescription') : (isEs ? 'Prescripciones' : 'Prescriptions')}
                          </span>
                        </div>

                        {/* Prescriptions under this patient */}
                        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {group.prescriptions.map((rx, rxIdx) => {
                            const isRawUid = /^[A-Za-z0-9]{18,}$/.test(String(rx.code || '')) && !String(rx.code).includes('-');
                            const displayCode = isRawUid ? `ID-${String(rx.code).slice(0, 6).toUpperCase()}` : rx.code;

                            return (
                              <div
                                key={`rx-sub-${rx.code}-${rxIdx}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  background: '#ffffff',
                                  border: '1px solid #f1f5f9',
                                  transition: 'background 0.12s ease',
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 800, fontSize: '0.76rem', color: '#1a73e8', fontFamily: 'monospace' }}>
                                      #{displayCode}
                                    </span>
                                    {rx.date && (
                                      <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                        <Calendar size={10} />
                                        <span>{rx.date}</span>
                                      </span>
                                    )}
                                    {rx.partsCount > 0 && (
                                      <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px' }}>
                                        📦 {rx.partsCount} {rx.partsCount === 1 ? (isEs ? 'Parte' : 'Part') : (isEs ? 'Partes' : 'Parts')}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.71rem', color: '#334155', marginTop: '3px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                                    {rx.title}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRxOpen(false);
                                      setRxQuery('');
                                      router.push(`/labels?rx=${encodeURIComponent(rx.code)}`);
                                    }}
                                    style={{
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      background: '#1a73e8',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {isEs ? 'Cargar' : 'Load'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRxOpen(false);
                                      setRxQuery('');
                                      router.push(`/rx/${encodeURIComponent(rx.code)}`);
                                    }}
                                    style={{
                                      padding: '3px 7px',
                                      borderRadius: '4px',
                                      border: '1px solid #cbd5e1',
                                      background: '#ffffff',
                                      color: '#1a73e8',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '2px',
                                    }}
                                  >
                                    <span>Rx</span>
                                    <ExternalLink size={9} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
