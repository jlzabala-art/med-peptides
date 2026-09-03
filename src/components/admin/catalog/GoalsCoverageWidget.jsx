'use client';
/**
 * GoalsCoverageWidget.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Grid de 13 goals canónicos con barra de progreso y conteo de productos/variantes.
 * Lee desde /api/goals-coverage → _meta/goals_coverage (1 lectura Firestore).
 *
 * Props:
 *   className  — string opcional para contenedor raíz
 *   compact    — boolean, si true muestra versión reducida (4 cols, sin variantes)
 */

import { useEffect, useState } from 'react';
import { Target, TrendingUp, RefreshCw } from '@/lib/icons';

const GOAL_LABELS = {
  weight_loss_glp1:      { label: 'Weight Loss / GLP-1',     emoji: '⚖️' },
  metabolic_health:      { label: 'Metabolic Health',         emoji: '🔥' },
  anti_aging_longevity:  { label: 'Anti-Aging & Longevity',   emoji: '⏳' },
  recovery_healing:      { label: 'Recovery & Healing',       emoji: '🩹' },
  cognitive_mood:        { label: 'Cognitive & Mood',         emoji: '🧠' },
  hormonal_optimization: { label: 'Hormonal Optimization',    emoji: '⚡' },
  fertility:             { label: 'Fertility',                emoji: '🌱' },
  immune_support:        { label: 'Immune Support',           emoji: '🛡️' },
  skin_hair_aesthetics:  { label: 'Skin / Hair / Aesthetics', emoji: '✨' },
  performance_muscle:    { label: 'Performance / Muscle',     emoji: '💪' },
  biomarkers:            { label: 'Biomarkers',              emoji: '🧪' },
  genomics:              { label: 'Genomics',                emoji: '🧬' },
  general_wellness:      { label: 'General Wellness',         emoji: '🌿' },
};

// RAM cache — 5 min
let _cache = null;
let _cacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000;

export default function GoalsCoverageWidget({ className = '', compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  async function load(forceRefresh = false) {
    if (!forceRefresh && _cache && Date.now() - _cacheTs < CACHE_TTL) {
      setData(_cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `/api/goals-coverage${forceRefresh ? '?refresh=1' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      _cache = json;
      _cacheTs = Date.now();
      setData(json);
      setLastUpdate(new Date(json.updatedAt || Date.now()));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const byGoal = data?.byGoal || {};
  const productsTotal = data?.productsTotal || 0;
  const maxProducts = Math.max(...Object.values(byGoal).map(g => g.products || 0), 1);

  const goals = Object.entries(GOAL_LABELS).map(([id, meta]) => ({
    id,
    ...meta,
    products: byGoal[id]?.products ?? 0,
    variants: byGoal[id]?.variants ?? 0,
  })).sort((a, b) => b.products - a.products);

  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Goals Coverage
          </span>
          {!loading && (
            <span style={{
              fontSize: '0.7rem',
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: '12px',
              padding: '2px 8px',
              fontWeight: 600,
            }}>
              {productsTotal} productos
            </span>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          title="Refresh desde Firestore"
          style={{
            background: 'none',
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            color: 'var(--text-secondary)',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.25rem' }}>
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '8px' }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--color-danger, #dc2626)', fontSize: '0.85rem', padding: '1rem 0' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.5rem',
          }}>
            {goals.map(({ id, label, emoji, products, variants }) => {
              const pct = Math.round((products / maxProducts) * 100);
              const coverage = productsTotal > 0 ? Math.round((products / productsTotal) * 100) : 0;
              return (
                <div
                  key={id}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2, var(--surface))',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>{emoji}</span> {label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {products}P {!compact && `· ${variants}V`}
                      <span style={{ marginLeft: '4px', color: coverage >= 15 ? 'var(--color-success, #16a34a)' : 'var(--text-secondary)', fontWeight: 700 }}>
                        {coverage}%
                      </span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: '2px',
                      background: 'var(--primary)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && lastUpdate && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.75rem', textAlign: 'right' }}>
            Actualizado: {lastUpdate.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
