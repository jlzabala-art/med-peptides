"use client";

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, DollarSign, ExternalLink, ShieldCheck } from '@/lib/icons';
import { getCompetitorBenchmark } from '../../../services/algoliaCompetitorService';
import { triggerHaptic } from '../../../utils/haptics';

export default function AlgoliaCompetitorBadge({
  productName = '',
  ourPrice = 0,
  dosageMg = 5,
  compact = false,
}) {
  const [benchmark, setBenchmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!productName) return;
      setLoading(true);
      try {
        const res = await getCompetitorBenchmark({ productName, ourPrice, dosageMg });
        if (isMounted) setBenchmark(res);
      } catch (e) {
        console.warn('[AlgoliaCompetitorBadge] Error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [productName, ourPrice, dosageMg]);

  if (loading || !benchmark) {
    return <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>...</span>;
  }

  const { isCompetitive, priceDeltaPercent, avgPrice, minPrice, maxPrice, competitors } = benchmark;
  const absDelta = Math.abs(priceDeltaPercent);

  const badgeBg = isCompetitive ? '#f0fdf4' : '#fffbeb';
  const badgeBorder = isCompetitive ? '#bbf7d0' : '#fde68a';
  const badgeColor = isCompetitive ? '#15803d' : '#b45309';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => {
          triggerHaptic('light');
          setShowDetails((prev) => !prev);
        }}
        title="Ver análisis de precios de la competencia en tiempo real (Algolia)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: compact ? '2px 6px' : '4px 9px',
          borderRadius: '6px',
          backgroundColor: badgeBg,
          border: `1px solid ${badgeBorder}`,
          color: badgeColor,
          fontSize: compact ? '0.7rem' : '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
        }}
      >
        {isCompetitive ? (
          <TrendingDown size={13} color="#16a34a" />
        ) : (
          <TrendingUp size={13} color="#d97706" />
        )}
        <span>
          {isCompetitive ? `-${absDelta}% vs mercado` : `+${absDelta}% vs mercado`}
        </span>
      </button>

      {/* Floating Detailed Benchmark Popover */}
      {showDetails && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99998 }}
            onClick={() => setShowDetails(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 99999,
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
              padding: '1rem',
              color: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary, #003666)' }}>
                Benchmark de Competencia
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                Algolia Index
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Mínimo</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>${minPrice}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Promedio</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary, #003666)' }}>${avgPrice}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Máximo</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626' }}>${maxPrice}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
              Precios por Competidor:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
              {competitors.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    background: '#fafafa',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#334155' }}>{c.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>${c.price}</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>(${c.ppm}/mg)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
