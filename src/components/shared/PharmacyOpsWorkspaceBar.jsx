'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X, Tags, Upload, FlaskConical, Calculator, ChevronRight } from 'lucide-react';
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
  const canQuickSearchRx = isAdminOrStaff || pathname.startsWith('/labels') || pathname.startsWith('/rx');
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
          setRxResults(Array.isArray(data?.results) ? data.results.slice(0, 6) : []);
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

  return (
    <div
      className="no-print"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #dadce0',
        padding: '0 16px',
        position: 'sticky',
        top: '48px',
        zIndex: 45,
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
        {/* Left: 4 Pharmacy & Rx Tool Tabs (Horizontal scroll on mobile) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            maxWidth: '100%',
            padding: '4px 0',
            scrollbarWidth: 'none',
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

        {/* Right: Quick Live Patient / RX-XXXX Search */}
        {canQuickSearchRx && (
          <div ref={wrapRef} style={{ position: 'relative', minWidth: '220px', flex: '0 1 280px', padding: '4px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f3f4',
                border: rxOpen ? '1px solid #1a73e8' : '1px solid #dadce0',
                borderRadius: '6px',
                padding: '4px 10px',
                minHeight: '32px',
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
                  top: 'calc(100% + 4px)',
                  right: 0,
                  width: 'min(92vw, 340px)',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(60,64,67,0.18)',
                  zIndex: 95,
                  padding: '6px',
                }}
              >
                {loadingRx ? (
                  <div style={{ padding: '8px 10px', fontSize: '0.74rem', color: '#5f6368' }}>
                    {isEs ? 'Buscando recetas...' : 'Searching prescriptions...'}
                  </div>
                ) : rxResults.length === 0 ? (
                  <div style={{ padding: '8px 10px', fontSize: '0.74rem', color: '#5f6368' }}>
                    {isEs ? 'Sin coincidencias' : 'No matching prescriptions'}
                  </div>
                ) : (
                  rxResults.map((rx) => {
                    const code = rx.code || rx.id;
                    const isRawUid = /^[A-Za-z0-9]{18,}$/.test(String(code || '')) && !String(code).includes('-');
                    const displayCode = isRawUid ? `ID-${String(code).slice(0, 6).toUpperCase()}` : code;
                    return (
                      <div
                        key={code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setRxOpen(false);
                            setRxQuery('');
                            router.push(`/labels?rx=${encodeURIComponent(code)}`);
                          }}
                          style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: '#202124',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rx.patientName || rx.name || 'Patient'}{' '}
                          <span style={{ color: '#1a73e8', fontFamily: 'monospace' }}>#{displayCode}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRxOpen(false);
                            setRxQuery('');
                            router.push(`/rx/${encodeURIComponent(code)}`);
                          }}
                          style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            background: '#f8fafc',
                            color: '#1a73e8',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <span>Rx</span>
                          <ChevronRight size={11} />
                        </button>
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
