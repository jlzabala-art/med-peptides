'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Clock, Compass, ChevronRight, FileText, FlaskConical, Sparkles } from 'lucide-react';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { searchAlgoliaFederated } from '@/services/algoliaSearch';
import { trackSearchClick } from '@/services/algoliaInsights';

const QUICK_MODULES = [
  { labelEn: 'Clinical Catalog', labelEs: 'Catálogo Clínico', href: '/c/CAT-MU9L9GBN', tag: 'Catalog' },
  { labelEn: 'Prescriptions & Label Studio', labelEs: 'Prescripciones y Etiquetas', href: '/labels', tag: 'Rx / GMP' },
  { labelEn: 'Clinical Protocols', labelEs: 'Protocolos Clínicos', href: '/proto', tag: 'Protocols' },
  { labelEn: 'B2B Price Hub', labelEs: 'Hub de Precios B2B', href: '/pricing', tag: 'Pricing' },
  { labelEn: '24Genomics DNA Panels', labelEs: 'Paneles ADN 24Genomics', href: '/pricing/24genetics', tag: 'Genomics' },
  { labelEn: 'Colway Clinical Derma', labelEs: 'Colway Clinical Derma', href: '/pricing/colway', tag: 'Colway' },
  { labelEn: 'NP LABS Hormones (TRT & BHRT)', labelEs: 'NP LABS Hormonas (TRT y BHRT)', href: '/pricing/nplab-hormones', tag: 'Hormones' },
  { labelEn: 'Peptides Price Schedule', labelEs: 'Tarifa Oficial Péptidos', href: '/pricing/peptides', tag: 'Peptides' },
  { labelEn: 'Peptide Vials Directory', labelEs: 'Directorio de Viales', href: '/vials', tag: 'Vials' },
  { labelEn: 'Reconstitution Calculator', labelEs: 'Calculadora de Reconstitución', href: '/calculator', tag: 'Tools' },
];

/**
 * GlobalPublicCommandPalette
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified ⌘K / Ctrl+K quick-navigation & recent-context palette across all
 * public routes, connecting Catalog, Protocols, Prescriptions (/labels & /rx),
 * Pricing, and Calculator as a single cohesive application.
 */
export default function GlobalPublicCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all'); // 'rx' | 'protocols' | 'products' | 'all'
  const [rxMatches, setRxMatches] = useState([]);
  const [recentRxList, setRecentRxList] = useState([]);
  const [loadingRx, setLoadingRx] = useState(false);
  const [algoliaProducts, setAlgoliaProducts] = useState([]);
  const [algoliaProtocols, setAlgoliaProtocols] = useState([]);
  const [algoliaQueryId, setAlgoliaQueryId] = useState(null);
  const [loadingAlgolia, setLoadingAlgolia] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { recentItems } = useAtlasContext();
  const isEs = typeof document !== 'undefined' && document.documentElement?.lang === 'es';

  const resolveDefaultScope = (path) => {
    if (path.startsWith('/labels') || path.startsWith('/rx')) return 'rx';
    if (path.startsWith('/proto')) return 'protocols';
    if (path.startsWith('/p/') || path.startsWith('/raw/') || path.startsWith('/pricing') || path.startsWith('/vials') || path.startsWith('/calculator')) return 'products';
    return 'all';
  };

  useEffect(() => {
    const handleOpen = () => {
      setSearchScope(resolveDefaultScope(pathname));
      setIsOpen(true);
    };
    window.addEventListener('open-atlas-command-palette', handleOpen);
    return () => window.removeEventListener('open-atlas-command-palette', handleOpen);
  }, [pathname]);

  // Listen for ⌘K / Ctrl+K globally across all screens
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) setSearchScope(resolveDefaultScope(pathname));
          return !prev;
        });
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, isOpen]);

  // Load recent patients/prescriptions when opened in 'rx' scope with empty query
  useEffect(() => {
    if (!isOpen || searchScope !== 'rx' || query.trim().length >= 2 || recentRxList.length > 0) return;
    let active = true;
    setLoadingRx(true);
    fetch('/api/labels/search?q=')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.results)) {
          setRecentRxList(data.results.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingRx(false);
      });
    return () => { active = false; };
  }, [isOpen, searchScope, query, recentRxList.length]);

  // Live federated Algolia + prescription quick search when query >= 2 chars
  useEffect(() => {
    const trimmed = query.trim();
    if (!isOpen || trimmed.length < 2) {
      setRxMatches([]);
      setAlgoliaProducts([]);
      setAlgoliaProtocols([]);
      setAlgoliaQueryId(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingRx(true);
      setLoadingAlgolia(true);
      try {
        const [rxRes, fedRes] = await Promise.allSettled([
          fetch(`/api/labels/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal }),
          searchAlgoliaFederated(trimmed, ['products', 'protocols'], 5),
        ]);
        if (controller.signal.aborted) return;

        if (rxRes.status === 'fulfilled' && rxRes.value?.ok) {
          const data = await rxRes.value.json();
          setRxMatches(Array.isArray(data?.results) ? data.results.slice(0, 5) : []);
        } else {
          setRxMatches([]);
        }

        if (fedRes.status === 'fulfilled' && fedRes.value) {
          setAlgoliaProducts(Array.isArray(fedRes.value.products) ? fedRes.value.products : []);
          setAlgoliaProtocols(Array.isArray(fedRes.value.protocols) ? fedRes.value.protocols : []);
          setAlgoliaQueryId(fedRes.value.queryID || null);
        }
      } catch {
        // ignore abort
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRx(false);
          setLoadingAlgolia(false);
        }
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query]);

  if (!isOpen) return null;

  const qLower = query.trim().toLowerCase();
  const filteredModules = QUICK_MODULES.filter((m) =>
    !qLower ||
    m.labelEn.toLowerCase().includes(qLower) ||
    m.labelEs.toLowerCase().includes(qLower) ||
    m.tag.toLowerCase().includes(qLower)
  );

  const filteredRecent = (recentItems || []).filter((item) =>
    !qLower ||
    item.title.toLowerCase().includes(qLower) ||
    item.path.toLowerCase().includes(qLower)
  );

  const navigateTo = (href) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div
      className="no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Atlas Command Palette"
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '10vh 1rem 1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.24)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Search size={17} color="#1a73e8" style={{ flexShrink: 0 }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchScope === 'rx'
                ? (isEs ? 'Buscar paciente, #RX, médico o fórmula...' : 'Search patient, #RX code, doctor, or formula...')
                : searchScope === 'protocols'
                  ? (isEs ? 'Buscar protocolo, péptido o biomarcador...' : 'Search protocol, peptide, or biomarker...')
                  : searchScope === 'products'
                    ? (isEs ? 'Buscar péptido, API o monografía...' : 'Search peptide, API, or monograph...')
                    : (isEs ? 'Buscar paciente, protocolo, péptido o módulo...' : 'Search patient, protocol, peptide, or module...')
            }
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              color: '#0f172a',
              background: 'transparent',
            }}
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Context-Aware Scope Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexWrap: 'wrap' }}>
          {[
            { id: 'rx', label: isEs ? 'Pacientes y Recetas' : 'Patients & Rx' },
            { id: 'protocols', label: isEs ? 'Protocolos' : 'Protocols' },
            { id: 'products', label: isEs ? 'Péptidos y Catálogo' : 'Peptides & Catalog' },
            { id: 'all', label: isEs ? 'Todo Atlas' : 'All Atlas' },
          ].map((tab) => {
            const active = searchScope === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchScope(tab.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: active ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                  background: active ? '#e8f0fe' : '#ffffff',
                  color: active ? '#1a73e8' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ maxHeight: '62vh', overflowY: 'auto', padding: '8px' }}>
          {/* Empty-state Recent Patients / Prescriptions when in 'rx' scope */}
          {searchScope === 'rx' && query.trim().length < 2 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={11} />
                <span>{isEs ? 'Pacientes y Recetas Recientes' : 'Recent Patients & Prescriptions'}</span>
              </div>
              {loadingRx ? (
                <div style={{ padding: '8px 10px', fontSize: '0.78rem', color: '#64748b' }}>
                  {isEs ? 'Cargando pacientes...' : 'Loading patients...'}
                </div>
              ) : (
                recentRxList.map((rx) => {
                  const code = rx.code || rx.id;
                  const isRawUid = /^[A-Za-z0-9]{18,}$/.test(String(code || '')) && !String(code).includes('-');
                  const displayCode = isRawUid ? `ID-${String(code).slice(0, 6).toUpperCase()}` : code;
                  const targetPath = pathname.startsWith('/labels')
                    ? `/labels?rx=${encodeURIComponent(code)}`
                    : `/rx/${encodeURIComponent(code)}`;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => navigateTo(targetPath)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: '#0f172a',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rx.patientName || rx.name || 'Patient'} · <span style={{ color: '#1a73e8', fontFamily: 'monospace' }}>#{displayCode}</span>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                    </button>
                  );
                })
              )}
            </div>
          )}
          {filteredRecent.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={11} />
                <span>{isEs ? 'Visto recientemente' : 'Recently Viewed'}</span>
              </div>
              {filteredRecent.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigateTo(item.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', flexShrink: 0 }}>{item.path}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && (algoliaProducts.length > 0 || loadingAlgolia) && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FlaskConical size={11} />
                <span>{isEs ? 'Formulaciones y Monografías' : 'Formulations & Monographs'}</span>
                {loadingAlgolia && <span style={{ color: '#1a73e8' }}>...</span>}
              </div>
              {algoliaProducts.map((prod, idx) => {
                const slug = prod.slug || prod.objectID || prod.id;
                const label = prod.canonicalName || prod.name || prod.title || slug;
                return (
                  <button
                    key={prod.objectID || slug}
                    type="button"
                    onClick={() => {
                      if (prod.objectID) {
                        trackSearchClick({
                          indexName: 'products',
                          objectID: prod.objectID,
                          queryID: algoliaQueryId,
                          position: idx + 1,
                          eventName: 'Command Palette Product Clicked',
                        });
                      }
                      navigateTo(`/p/${encodeURIComponent(slug)}`);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#0f172a',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                    <span style={{ fontSize: '0.7rem', color: '#1a73e8', fontFamily: 'monospace', flexShrink: 0 }}>
                      {prod.category || 'Monograph'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {query.trim().length >= 2 && algoliaProtocols.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={11} />
                <span>{isEs ? 'Protocolos Clínicos' : 'Clinical Protocols'}</span>
              </div>
              {algoliaProtocols.map((proto, idx) => {
                const slug = proto.slug || proto.objectID || proto.id;
                const label = proto.title || proto.name || slug;
                return (
                  <button
                    key={proto.objectID || slug}
                    type="button"
                    onClick={() => {
                      if (proto.objectID) {
                        trackSearchClick({
                          indexName: 'protocols',
                          objectID: proto.objectID,
                          queryID: algoliaQueryId,
                          position: idx + 1,
                          eventName: 'Command Palette Protocol Clicked',
                        });
                      }
                      navigateTo(`/proto/${encodeURIComponent(slug)}`);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#0f172a',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                    <span style={{ fontSize: '0.7rem', color: '#7c3aed', fontFamily: 'monospace', flexShrink: 0 }}>
                      {proto.goal || 'Protocol'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {query.trim().length >= 2 && (rxMatches.length > 0 || loadingRx) && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={11} />
                <span>{isEs ? 'Prescripciones' : 'Prescriptions'}</span>
                {loadingRx && <span style={{ color: '#1a73e8' }}>...</span>}
              </div>
              {rxMatches.map((rx) => (
                <div
                  key={rx.code || rx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigateTo(`/rx/${encodeURIComponent(rx.code || rx.id)}`)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    {rx.patientName || rx.name} <span style={{ color: '#1a73e8', fontFamily: 'monospace' }}>#{rx.code}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(`/labels?rx=${encodeURIComponent(rx.code || rx.id)}`)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#1a73e8',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isEs ? 'Etiquetas' : 'Labels'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <div style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Compass size={11} />
              <span>{isEs ? 'Módulos Atlas' : 'Atlas Modules'}</span>
            </div>
            {filteredModules.map((mod) => (
              <button
                key={mod.href}
                type="button"
                onClick={() => navigateTo(mod.href)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: pathname === mod.href ? '#eff6ff' : 'transparent',
                  color: pathname === mod.href ? '#1a73e8' : '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{isEs ? mod.labelEs : mod.labelEn}</span>
                <ChevronRight size={13} color="#94a3b8" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
