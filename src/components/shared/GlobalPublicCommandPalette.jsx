'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Clock, Compass, ChevronRight, FileText, FlaskConical, Sparkles, ShieldCheck } from 'lucide-react';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { filterAdminDirectoryGroups } from '@/constants/publicAdminDirectory';
import { searchAlgoliaFederated } from '@/services/algoliaSearch';
import { trackSearchClick } from '@/services/algoliaInsights';

/**
 * GlobalPublicCommandPalette
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified ⌘K / Ctrl+K quick-navigation & context-aware search across public routes.
 * - Admin (`is('admin')`): Full 5-Group Public Screens Index + Live Patient/Rx + Algolia.
 * - Non-Admin: Strictly scoped to the current page context (never exposes cross-app directory or patient list).
 */
export default function GlobalPublicCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState('directory'); // 'directory' | 'rx' | 'protocols' | 'products' | 'all'
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
  const { is } = useRoleAccess();
  const isAdminUser = is('admin');
  const isEs = typeof document !== 'undefined' && document.documentElement?.lang === 'es';

  const resolveDefaultScope = (path, adminFlag) => {
    if (path.startsWith('/proto')) return 'protocols';
    if (
      path.startsWith('/collection') ||
      path.startsWith('/p/') ||
      path.startsWith('/raw/') ||
      path.startsWith('/pricing') ||
      path.startsWith('/vials') ||
      path.startsWith('/calculator')
    ) {
      return adminFlag ? 'directory' : 'products';
    }
    if (path.startsWith('/labels') || path.startsWith('/rx')) {
      return adminFlag ? 'rx' : 'products';
    }
    return adminFlag ? 'directory' : 'products';
  };

  useEffect(() => {
    const handleOpen = () => {
      if (pathname.startsWith('/patient/dna-report')) {
        const dnaInput = document.getElementById('gcp-omnibox-search');
        if (dnaInput) {
          dnaInput.focus();
          return;
        }
      }
      setSearchScope(resolveDefaultScope(pathname, isAdminUser));
      setIsOpen(true);
    };
    window.addEventListener('open-atlas-command-palette', handleOpen);
    return () => window.removeEventListener('open-atlas-command-palette', handleOpen);
  }, [pathname, isAdminUser]);

  // Listen for ⌘K / Ctrl+K globally across all screens
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (pathname.startsWith('/patient/dna-report')) return; // Handled by DNA Portal omnibox
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) setSearchScope(resolveDefaultScope(pathname, isAdminUser));
          return !prev;
        });
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, isOpen, isAdminUser]);

  // Load recent patients/prescriptions ONLY for Admin when opened in 'rx' scope with empty query
  useEffect(() => {
    if (!isOpen || !isAdminUser || searchScope !== 'rx' || query.trim().length >= 2 || recentRxList.length > 0) return;
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
  }, [isOpen, isAdminUser, searchScope, query, recentRxList.length]);

  // Live federated Algolia (+ Admin-only prescription search) when query >= 2 chars
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
      if (isAdminUser) setLoadingRx(true);
      setLoadingAlgolia(true);
      try {
        const algoliaTargets = isAdminUser
          ? ['products', 'protocols']
          : pathname.startsWith('/proto')
            ? ['protocols']
            : ['products'];

        const [rxRes, fedRes] = await Promise.allSettled([
          isAdminUser
            ? fetch(`/api/labels/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
            : Promise.resolve(null),
          searchAlgoliaFederated(trimmed, algoliaTargets, 6),
        ]);
        if (controller.signal.aborted) return;

        if (isAdminUser && rxRes.status === 'fulfilled' && rxRes.value?.ok) {
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
  }, [isOpen, query, isAdminUser, pathname]);

  if (!isOpen) return null;

  const qLower = query.trim().toLowerCase();
  const filteredDirectoryGroups = isAdminUser ? filterAdminDirectoryGroups(query) : [];

  const filteredRecent = isAdminUser
    ? (recentItems || []).filter((item) =>
        !qLower ||
        item.title.toLowerCase().includes(qLower) ||
        item.path.toLowerCase().includes(qLower)
      )
    : [];

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
        padding: '5vh 0.75rem 0.75rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isAdminUser ? '660px' : '540px',
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
              !isAdminUser
                ? pathname.startsWith('/proto')
                  ? (isEs ? 'Buscar protocolo en esta vista...' : 'Search protocol in this view...')
                  : (isEs ? 'Buscar formulación en esta vista...' : 'Search formulation in this view...')
                : searchScope === 'directory'
                  ? (isEs ? 'Filtrar catálogos, portales, tarifas o #RX...' : 'Filter catalogs, portals, pricing, or #RX...')
                  : searchScope === 'rx'
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
              fontSize: '0.92rem',
              color: '#0f172a',
              background: 'transparent',
            }}
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Context-Aware Scope Switcher Pills (Admin Only) vs. Page-Scoped Indicator (Non-Admin) */}
        {isAdminUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexWrap: 'wrap' }}>
            {[
              { id: 'directory', label: isEs ? 'Índice Pantallas' : 'Screens Index' },
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
                    padding: '5px 11px',
                    borderRadius: '999px',
                    border: active ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                    background: active ? '#e8f0fe' : '#ffffff',
                    color: active ? '#1a73e8' : '#475569',
                    fontSize: '0.73rem',
                    fontWeight: active ? 700 : 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>
            <span>
              {pathname.startsWith('/proto')
                ? (isEs ? 'Alcance: Catálogo de Protocolos' : 'Scope: Protocols Catalog')
                : (isEs ? 'Alcance: Catálogo de esta vista' : 'Scope: Current Page Catalog')}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {isEs ? 'Escribe 2+ letras para buscar' : 'Type 2+ letters to search'}
            </span>
          </div>
        )}

        <div style={{ maxHeight: '68vh', overflowY: 'auto', padding: '10px' }}>
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
                  {pathname?.startsWith('/labels') && (
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
                  )}
                </div>
              ))}
            </div>
          )}

          {isAdminUser && (searchScope === 'directory' || searchScope === 'all' || query.trim().length >= 2) && filteredDirectoryGroups.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              <div style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', borderRadius: '6px' }}>
                <ShieldCheck size={12} />
                <span>{isEs ? 'Índice Maestro de Pantallas Públicas (Solo Admin)' : 'Public Screens & Catalogs Directory (Admin Only)'}</span>
              </div>
              {filteredDirectoryGroups.map((group) => (
                <div key={group.id}>
                  <div style={{ padding: '2px 10px 6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.03em' }}>
                    {isEs ? group.titleEs : group.titleEn}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))',
                      gap: '6px',
                    }}
                  >
                    {group.items.map((mod) => {
                      const isCurrent = pathname === mod.href;
                      return (
                        <button
                          key={mod.href}
                          type="button"
                          onClick={() => navigateTo(mod.href)}
                          style={{
                            width: '100%',
                            minHeight: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            padding: '8px 11px',
                            borderRadius: '8px',
                            border: isCurrent ? '1px solid #1a73e8' : '1px solid #e2e8f0',
                            background: isCurrent ? '#e8f0fe' : '#ffffff',
                            color: isCurrent ? '#1a73e8' : '#202124',
                            fontSize: '0.79rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isEs ? mod.labelEs : mod.labelEn}
                          </span>
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              color: isCurrent ? '#1a73e8' : '#5f6368',
                              background: isCurrent ? '#ffffff' : '#f1f3f4',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              flexShrink: 0,
                            }}
                          >
                            {mod.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isAdminUser && query.trim().length < 2 && (
            <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: '0.8rem', color: '#5f6368' }}>
              {pathname.startsWith('/proto')
                ? (isEs ? 'Escribe el nombre de un protocolo, péptido o indicación para buscar en esta vista.' : 'Type a protocol name, peptide, or goal to search within this view.')
                : (isEs ? 'Escribe el nombre de una formulación o producto para buscar en esta vista.' : 'Type a formulation or product name to search within this view.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
