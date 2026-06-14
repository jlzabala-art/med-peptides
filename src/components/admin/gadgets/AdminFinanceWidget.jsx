import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import BarChart2 from "lucide-react/dist/esm/icons/bar-chart-2";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import ArrowDownRight from "lucide-react/dist/esm/icons/arrow-down-right";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
/**
 * AdminFinanceWidget.jsx
 *
 * Finance Intelligence gadget for the Admin Overview dashboard.
 * Calls the financeAiAssistant Cloud Function with a preset "snapshot" query
 * to retrieve portfolio KPIs: avg margin, top performers, gross profit.
 *
 * Uses the same fetch+auth pattern as other HTTP Cloud Functions in this app.
 */

import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase';











import { Card, CardHeader, CardContent, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';

// ── CF endpoint (same region as other agents) ─────────────────────────────────
const FINANCE_CF_URL =
  'https://europe-west1-med-peptides-app.cloudfunctions.net/financeAiAssistant';

// Preset query that triggers the structured snapshot response
const SNAPSHOT_QUERY =
  'Give me a complete portfolio financial snapshot: avg retail margin, top 5 products by margin, total gross profit, and any products with margin below 40%.';

// ── Colour helpers ────────────────────────────────────────────────────────────
function colorForMargin(pct) {
  if (pct == null) return 'var(--color-text-tertiary)';
  if (pct >= 75) return 'var(--color-success)';
  if (pct >= 50) return '#f59e0b';
  return 'var(--color-danger)';
}
function colorForLabel(label) {
  if (label === 'success') return 'var(--color-success)';
  if (label === 'warning') return '#f59e0b';
  if (label === 'danger') return 'var(--color-danger)';
  return 'var(--color-primary)';
}
function fmt(v) {
  if (typeof v === 'string') return v;
  return v != null ? String(v) : '—';
}

// ── KPI pill ──────────────────────────────────────────────────────────────────
function KpiPill({ icon, label, value, color }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        padding: '0.85rem 1.1rem',
        borderRadius: 'var(--radius-md)',
        background: `${color}08`,
        border: `1px solid ${color}18`,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: '1.1rem' }}>{icon}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 900, color, lineHeight: 1 }}>{fmt(value)}</div>
      <div
        style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.03em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Product row ───────────────────────────────────────────────────────────────
function ProductMarginRow({ p, rank }) {
  const mg = p.margin_retail ?? p.margin;
  const color = colorForMargin(mg);
  const isWeak = mg != null && mg < 40;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.6rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        background: isWeak ? 'rgba(239,68,68,0.04)' : 'var(--color-bg-app)',
        border: `1px solid ${isWeak ? 'rgba(239,68,68,0.15)' : '#f1f5f9'}`,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem',
          fontWeight: 900,
          color,
        }}
      >
        {rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {p.name || p.sku || '—'}
        </div>
        {p.category && (
          <div
            style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}
          >
            {p.category}
          </div>
        )}
      </div>
      {/* Margin bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <div
          style={{
            width: 60,
            height: 5,
            borderRadius: '3px',
            background: 'var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(mg ?? 0, 100)}%`,
              background: color,
              borderRadius: '3px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <span
          style={{ fontSize: '0.78rem', fontWeight: 800, color, minWidth: 38, textAlign: 'right' }}
        >
          {mg != null ? `${mg.toFixed(1)}%` : '—'}
        </span>
        {isWeak ? (
          <ArrowDownRight size={13} color="var(--color-danger)" />
        ) : (
          <ArrowUpRight size={13} color="var(--color-success)" />
        )}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function AdminFinanceWidget() {
  const [data, setData] = useState(null); // structured finance_summary
  const [rawText, setRawText] = useState(''); // AI narrative
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false); // show AI narrative
  const [lastFetched, setLastFetched] = useState(null);

  const fetchSnapshot = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const res = await fetch(FINANCE_CF_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: SNAPSHOT_QUERY,
          currency: 'usd',
          format: 'structured',
          userProfile: { role: 'admin' }
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.formattedData?.formatType === 'finance_summary') {
        setData(json.formattedData);
      }
      if (json.reply) setRawText(json.reply);
      setLastFetched(new Date());
    } catch (err) {
      console.error('[AdminFinanceWidget]', err);
      setError('No se pudo cargar el análisis financiero.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    // eslint-disable-next-line
    fetchSnapshot();
  }, []);

  // Extract structured sections from formattedData
  const kpis = data?.sections?.find((s) => s.type === 'finance_kpi_row')?.kpis || [];
  const topProducts =
    data?.sections?.find((s) => s.type === 'finance_top_products')?.products || [];
  const weakItems = data?.sections?.find((s) => s.type === 'finance_weak_margins')?.products || [];

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }} noPadding>
      <CardHeader 
        icon={BarChart2}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Finance Intelligence
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(139,92,246,0.1)',
                color: '#8b5cf6',
                border: '1px solid rgba(139,92,246,0.2)',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={10} style={{ display: 'inline', marginRight: 4 }} />
              AI
            </span>
          </div>
        }
        subtitle="AgentFinance · portfolio de márgenes y gross profit"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSnapshot}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              style={{ animation: loading ? 'finSpin 1s linear infinite' : 'none' }}
            />
            {loading ? 'Analizando…' : 'Actualizar'}
          </Button>
        }
      />

      <CardContent style={{ flex: 1, overflowY: 'auto' }}>
        {/* Error */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.06)',
              color: 'var(--color-danger)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  backgroundSize: '200% 100%',
                  animation: 'finShimmer 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* KPIs */}
        {kpis.length > 0 && (
          <div
            style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}
          >
            {kpis.map((k) => (
              <KpiPill
                key={k.label}
                icon={k.icon}
                label={k.label}
                value={k.value}
                color={colorForLabel(k.color)}
              />
            ))}
          </div>
        )}

        {/* Top products by margin */}
        {topProducts.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.5rem',
              }}
            >
              🏆 Top performers por margen retail
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {topProducts.slice(0, 5).map((p, i) => (
                <ProductMarginRow key={p.id || i} p={p} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Weak margin alert */}
        {weakItems.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-danger)',
                marginBottom: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <AlertCircle size={12} /> {weakItems.length} producto{weakItems.length > 1 ? 's' : ''}{' '}
              con margen bajo (&lt;40%)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {weakItems.map((p, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239,68,68,0.08)',
                    color: 'var(--color-danger)',
                  }}
                >
                  {p.name || p.sku}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI narrative toggle */}
        {rawText && (
          <div>
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.3rem 0',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={12} color="#8b5cf6" />
              Análisis completo de AgentFinance
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {expanded && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(139,92,246,0.04)',
                  border: '1px solid rgba(139,92,246,0.12)',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                }}
              >
                {rawText}
              </div>
            )}
          </div>
        )}

        {/* No data yet */}
        {!loading && !data && !error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              padding: '40px 24px',
            }}
          >
            <BarChart2 size={48} color="var(--color-border)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Finance Intelligence AI</div>
            <div style={{ fontSize: '14px', maxWidth: 300, marginBottom: 24 }}>Ejecuta el asistente para analizar márgenes, beneficios y métricas clave del portfolio en tiempo real.</div>
            <Button variant="primary" onClick={fetchSnapshot}>
              Ejecutar Análisis
            </Button>
          </div>
        )}

      </CardContent>

      {lastFetched && (
        <CardFooter>
          Última consulta: {lastFetched.toLocaleTimeString('es-ES')} · AgentFinance (Gemini 2.5 Flash)
        </CardFooter>
      )}

      <style>{`
        @keyframes finSpin    { to { transform: rotate(360deg); } }
        @keyframes finShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </Card>
  );
}