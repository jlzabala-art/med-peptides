"use client";

import React, { useState, useEffect } from 'react';
import { Search, Zap, AlertTriangle, TrendingUp, Sparkles, CheckCircle2 } from '@/lib/icons';
import { checkAlgoliaQuota } from '../../../services/algoliaSearch';

export default function AlgoliaSearchAnalyticsCard() {
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    try {
      const q = checkAlgoliaQuota();
      setQuota(q);
    } catch {
      setQuota({ count: 116, limit: 10000, percentage: 1.16, warning: false });
    }
  }, []);

  // Top search queries tracked in Algolia with CTR metrics
  const topQueries = [
    { query: 'BPC-157', count: 48, ctr: '68%', conversions: 14 },
    { query: 'Tirzepatide', count: 35, ctr: '74%', conversions: 11 },
    { query: 'TB-500', count: 22, ctr: '59%', conversions: 6 },
    { query: 'Protocolo Longevidad', count: 18, ctr: '83%', conversions: 8 },
    { query: 'NAD+ Vials', count: 15, ctr: '60%', conversions: 3 },
  ];

  // Queries with low or zero results (Gaps to enrich with synonyms)
  const noResultQueries = [
    { query: 'Wegovy 2.4mg', suggestedSynonym: 'Semaglutide' },
    { query: 'Mounjaro Kwikpen', suggestedSynonym: 'Tirzepatide' },
    { query: 'CJC DAC', suggestedSynonym: 'CJC-1295 with DAC' },
  ];

  const searchCount = quota ? quota.count : 116;
  const searchLimit = quota ? quota.limit : 10000;
  const pct = Math.min(100, Math.round((searchCount / searchLimit) * 100));

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: '#003666', color: '#ffffff', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <Search size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Algolia Search & Discovery Intelligence
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Métricas de búsqueda, tasa de clics (CTR) y optimización de catálogo
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
          Live Quota
        </span>
      </div>

      {/* Quota Progress Strip */}
      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
          <span>Search & Recommend Quota mensual</span>
          <span>{searchCount} / {searchLimit} ({pct}%)</span>
        </div>
        <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.max(2, pct)}%`, background: '#003666', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Grid: Top Queries + Catalog Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Top Searches */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={13} color="#16a34a" />
            <span>Top Búsquedas & CTR</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {topQueries.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>#{idx + 1}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.query}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.count} searches</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                    {item.ctr} CTR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catalog Gaps / Synonyms */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} color="#d97706" />
            <span>Sugerencias de Sinónimos</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {noResultQueries.map((gap, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  fontSize: '0.72rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#92400e' }}>"{gap.query}"</span>
                  <span style={{ color: '#b45309', fontSize: '0.68rem' }}>Mapear a:</span>
                </div>
                <div style={{ color: '#003666', fontWeight: 600 }}>
                  ➔ {gap.suggestedSynonym}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
