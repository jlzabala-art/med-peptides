"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Pill,
  FileText,
  Package,
  LayoutDashboard,
  Plus,
  TestTube,
  Navigation,
  ChevronRight,
  Sparkles,
} from '@/lib/icons';
import { useDrawer } from '../../context/DrawerContext';
import { searchAlgoliaFederated } from '../../services/algoliaSearch';
import { triggerHaptic } from '../../utils/haptics';
import { trackSearchClick } from '../../services/algoliaInsights';

const TRENDING_SUGGESTIONS = [
  'BPC-157 5mg',
  'Tirzepatide 10mg',
  'Protocolo Longevidad',
  'NAD+ 500mg',
  'Semaglutide',
  'CJC-1295 + Ipamorelin',
  'Epithalon',
];

const QUICK_ACTIONS = [
  { id: 'go_finder', label: 'Guided Protocol Finder (Wizard)', icon: Navigation, route: '/protocol-finder' },
  { id: 'go_dash', label: 'Main Dashboard', icon: LayoutDashboard, route: '/admin' },
  { id: 'go_prod', label: 'Peptides & Formulas Catalog', icon: Pill, route: '/admin/products' },
  { id: 'go_proto', label: 'Clinical Protocols Library', icon: TestTube, route: '/admin/protocols' },
  { id: 'go_pat', label: 'Patients Directory', icon: User, route: '/admin/patients' },
  { id: 'go_rx', label: 'Prescriptions & Treatments', icon: FileText, route: '/admin/prescriptions' },
  { id: 'new_rx', label: 'New Medical Prescription', icon: Plus, action: 'rx-builder' },
];

export default function Omnibar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [algoliaResults, setAlgoliaResults] = useState({ products: [], protocols: [], users: [] });
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setAlgoliaResults({ products: [], protocols: [], users: [] });
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Query Algolia Federated Multi-Index Search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      return;
    }

    let isMounted = true;

    const timer = setTimeout(async () => {
      if (isMounted) setSearching(true);
      try {
        const results = await searchAlgoliaFederated(query, ['products', 'protocols', 'users'], 3);
        if (isMounted) {
          setAlgoliaResults(results || { products: [], protocols: [], users: [] });
        }
      } catch (err) {
        console.error('Algolia federated search failed', err);
      } finally {
        if (isMounted) setSearching(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      setAlgoliaResults({ products: [], protocols: [], users: [] });
      setSearching(false);
    };
  }, [query]);

  const filteredActions = QUICK_ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    triggerHaptic('tap');
    if (item._index && (item.objectID || item.id)) {
      trackSearchClick({
        indexName: item._index,
        objectID: item.objectID || item.id,
      });
    }

    if (item.route) {
      router.push(item.route);
    } else if (item.action === 'rx-builder') {
      openDrawer('rx-builder', 'new');
    } else if (item._index === 'products') {
      router.push(`/p/${item.slug || item.id || item.objectID}`);
    } else if (item._index === 'protocols') {
      router.push(`/proto/${item.protocol_slug || item.slug || item.id || item.objectID}`);
    } else if (item._index === 'users') {
      router.push(`/admin/patients?id=${item.id || item.objectID}`);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1.1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <Search size={20} color="#003666" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search peptides, protocols, patients or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: '#0f172a',
              background: 'transparent',
            }}
          />
          <div style={{ fontSize: '0.72rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '3px 7px', borderRadius: '5px', fontWeight: 700 }}>
            ESC
          </div>
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '440px', overflowY: 'auto', padding: '0.6rem' }}>
          {/* Query Suggestions / Trending Searches (when query is empty) */}
          {!query.trim() && (
            <div style={{ padding: '0.4rem 0.5rem 0.8rem 0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', padding: '2px 4px', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                <Sparkles size={12} color="#003666" />
                <span>Búsquedas Frecuentes (Algolia Query Suggestions)</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {TRENDING_SUGGESTIONS.map((sugg) => (
                  <button
                    key={sugg}
                    onClick={() => {
                      triggerHaptic('selection');
                      setQuery(sugg);
                    }}
                    style={{
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#334155',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#003666';
                      e.currentTarget.style.color = '#003666';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.color = '#334155';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Algolia Products */}
          {algoliaResults.products?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#003666', padding: '4px 10px', letterSpacing: '0.04em' }}>
                📦 Productos & Péptidos (Algolia)
              </div>
              {algoliaResults.products.map((p) => (
                <div
                  key={p.objectID || p.id}
                  onClick={() => handleSelect({ ...p, _index: 'products' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Pill size={16} color="#003666" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                      {p.name || p.title}
                    </span>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}

          {/* Algolia Protocols */}
          {algoliaResults.protocols?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#0d9488', padding: '4px 10px', letterSpacing: '0.04em' }}>
                🔬 Clinical Protocols (Algolia)
              </div>
              {algoliaResults.protocols.map((proto) => (
                <div
                  key={proto.objectID || proto.id}
                  onClick={() => handleSelect({ ...proto, _index: 'protocols' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdfa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <TestTube size={16} color="#0d9488" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                      {proto.name || proto.title}
                    </span>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', padding: '4px 10px', letterSpacing: '0.04em' }}>
                ⚡ System Actions
              </div>
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    onClick={() => handleSelect(action)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#334155',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Icon size={16} style={{ marginRight: '0.75rem', color: '#64748b' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{action.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {filteredActions.length === 0 && !algoliaResults.products?.length && !algoliaResults.protocols?.length && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
              No matches found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
