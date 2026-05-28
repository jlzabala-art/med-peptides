/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import {
  Users, Eye, ShoppingCart, TrendingUp, Globe, FlaskConical,
  BookOpen, Search, RefreshCw, AlertCircle, BarChart2, CheckCircle2,
} from 'lucide-react';
import PlatformHealth from './analytics/PlatformHealth';
import ExplorationJourney from './analytics/ExplorationJourney';
import DiscoveryInsights from './analytics/DiscoveryInsights';
import FrictionInsights from './analytics/FrictionInsights';

/* ── Constants ───────────────────────────────────────────────── */
const ENDPOINT = '/api/analytics-overview';
const CACHE_KEY = 'admin_analytics_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/* ── Helpers ─────────────────────────────────────────────────── */
function readCache(days) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY}_${days}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch (_) { /* ignore */ }
  return null;
}

function writeCache(days, data) {
  try {
    sessionStorage.setItem(`${CACHE_KEY}_${days}`, JSON.stringify({ data, ts: Date.now() }));
  } catch (_) { /* ignore */ }
}

function fmt(n) {
  if (n === undefined || n === null) return '—';
  const val = typeof n === 'object' ? n.current : n;
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return String(val);
}

/* ── Sub-components ──────────────────────────────────────────── */

function TrendBadge({ trend }) {
  if (!trend && trend !== 0) return null;
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
      fontSize: '0.65rem', fontWeight: 700,
      color: isNeutral ? 'var(--text-light)' : (isPositive ? 'var(--success)' : 'var(--error)'),
      backgroundColor: isNeutral ? 'var(--surface)' : (isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'),
      padding: '0.15rem 0.4rem', borderRadius: '4px', marginTop: '0.35rem'
    }}>
      {isPositive ? <TrendingUp size={10} /> : (!isNeutral && <AlertCircle size={10} />)}
      {isPositive ? '+' : ''}{trend}%
    </div>
  );
}

function MetricCard({ icon: Icon, iconBg, iconColor, label, value, sublabel }) {
  const currentVal = typeof value === 'object' ? value.current : value;
  const trend = typeof value === 'object' ? value.trend : null;

  return (
    <div className="analytics-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
        <div style={{ 
          backgroundColor: iconBg, color: iconColor, 
          padding: '0.6rem', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
          {label.toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{fmt(currentVal)}</div>
        <TrendBadge trend={trend} />
      </div>
      {sublabel && (
        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '0.4rem' }}>
          {sublabel}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .analytics-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }
        .analytics-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
          border-color: var(--secondary-light);
        }
      `}} />
    </div>
  );
}

function getOptimizationTip(label, pct) {
  if (pct > 40) return null; // Performing well
  const tips = {
    'Content Engagement': 'Users are leaving without viewing products. Try making the Peptide Catalog more prominent on the Home page.',
    'Add to Cart': 'Low interest in products. Consider adding more clinical data or high-quality images to peptide descriptions.',
    'Checkout': 'High cart abandonment. Review shipping costs or add a "Quick Checkout" option to reduce friction.',
    'Purchase': 'Checkout friction detected. Ensure payment methods are working and the checkout form is as simple as possible.'
  };
  return tips[label] || null;
}

function FunnelStep({ label, value, pct, index, totalSteps }) {
  const width = 100 - (index * (50 / totalSteps));
  const isBottleneck = index > 0 && pct < (index === 1 ? 45 : 25); // Slightly stricter thresholds
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: index < totalSteps - 1 ? '1rem' : 0 }}>
      <div style={{ 
        width: `${width}%`, 
        minHeight: '64px', 
        backgroundColor: isBottleneck ? 'rgba(239,68,68,0.02)' : 'white',
        border: `1.5px solid ${isBottleneck ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.5rem',
        position: 'relative',
        boxShadow: isBottleneck ? '0 8px 24px rgba(239,68,68,0.08)' : '0 8px 24px rgba(0,0,0,0.02)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        backgroundImage: index === totalSteps - 1 ? 'linear-gradient(to right, rgba(0,75,135,0.02), transparent)' : 'none'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isBottleneck ? 'var(--error)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            {isBottleneck && <AlertCircle size={12} strokeWidth={2.5} />}
            {label}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{fmt(value)}</div>
        </div>

        {index > 0 && (
          <div style={{ textAlign: 'right', backgroundColor: 'rgba(0,0,0,0.02)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ 
              fontSize: '1rem', fontWeight: 950, 
              color: isBottleneck ? 'var(--error)' : 'var(--primary)' 
            }}>
              {pct}%
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
              Retention
            </div>
          </div>
        )}
      </div>

      {isBottleneck && (
        <div style={{ 
          width: `${width}%`, marginTop: '0.75rem', padding: '0.8rem 1rem', 
          backgroundColor: 'rgba(239,68,68,0.04)', borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--error)', fontSize: '0.75rem', color: '#991b1b',
          lineHeight: 1.4, fontWeight: 500, boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontWeight: 800, textTransform: 'uppercase', marginRight: '0.5rem', fontSize: '0.65rem', display: 'block', marginBottom: '0.2rem' }}>Critical Leakage Detected</span>
          {getOptimizationTip(label, pct)}
        </div>
      )}

      {index < totalSteps - 1 && (
        <div style={{ 
          height: '20px', width: '2px', 
          background: isBottleneck ? 'linear-gradient(to bottom, var(--error), var(--border))' : 'var(--border)', 
          opacity: 0.4, marginTop: '0.5rem' 
        }}></div>
      )}
    </div>
  );
}

function ConversionFunnel({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
            <TrendingUp size={22} strokeWidth={2} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', display: 'block', letterSpacing: '-0.01em' }}>Conversion Architecture</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Real-time Journey Tracking</span>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800, background: 'rgba(16,185,129,0.08)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.15)' }}>
          LIVE ANALYSIS
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '500px', margin: '0 auto' }}>
        {steps.map((step, i) => (
          <FunnelStep key={i} {...step} index={i} totalSteps={steps.length} />
        ))}
      </div>
    </div>
  );
}

function TopList({ icon: Icon, title, items, emptyLabel, accentColor = 'var(--secondary)' }) {
  return (
    <div style={{ 
      background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
      padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.25rem' }}>
        <div style={{ background: `${accentColor}15`, color: accentColor, padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
        {items && items.length > 0 ? items.slice(0, 5).map((item, i) => (
          <div key={i} className="top-list-item" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.85rem 1rem', backgroundColor: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem', transition: 'all 0.2s ease', border: '1px solid transparent'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div style={{ 
                fontSize: '0.65rem', color: i < 3 ? 'white' : 'var(--text-light)', 
                fontWeight: 900, width: '22px', height: '22px', 
                backgroundColor: i < 3 ? accentColor : 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-sm)', flexShrink: 0
              }}>
                {i + 1}
              </div>
              <span style={{ color: 'var(--text-main)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name || item.label || item}
              </span>
            </div>
            <span style={{ color: accentColor, fontWeight: 900, marginLeft: '0.75rem', fontSize: '0.9rem' }}>
              {fmt(item.count ?? item.views ?? item.value)}
            </span>
          </div>
        )) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic', padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {emptyLabel}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .top-list-item:hover {
          background-color: white !important;
          border-color: ${accentColor}30 !important;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
      `}} />
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function AdminAnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [days, setDays] = useState(7);
  const abortRef = useRef(null);

  const load = async (forceRefresh = false, periodDays = days) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    if (!forceRefresh) {
      const cached = readCache(periodDays);
      if (cached) {
        setData(cached);
        setLoading(false);
        setLastRefresh(new Date());
        return;
      }
    }

    try {
      const res = await fetch(`${ENDPOINT}?days=${periodDays}`, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      writeCache(periodDays, json);
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load analytics data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(false, days);
    return () => abortRef.current?.abort();
  }, [days]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{ padding: '5rem 3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ position: 'relative', width: '48px', height: '48px', margin: '0 auto 1.5rem' }}>
          <RefreshCw size={48} style={{ opacity: 0.15, position: 'absolute', inset: 0 }} />
          <RefreshCw size={48} style={{ color: 'var(--primary)', animation: 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
        </div>
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em', color: 'var(--primary)' }}>Assembling Neural Insights…</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '50%' }}>
          <AlertCircle size={48} color="var(--error)" />
        </div>
        <div>
          <h3 style={{ fontWeight: 900, margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Pipeline Interrupted</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0.5rem 0 0', maxWidth: '300px' }}>{error}</p>
        </div>
        <button className="btn btn-primary" onClick={() => load(true)} style={{ padding: '0.8rem 2rem', borderRadius: 'var(--radius-md)' }}>
          <RefreshCw size={16} /> Reconnect Stream
        </button>
      </div>
    );
  }

  const metrics = data?.metrics ?? {};
  const tops    = data?.tops    ?? {};
  const funnel  = data?.funnel  ?? [];
  const friction = data?.friction ?? {};

  return (
    <div className="analytics-container">
      {/* ── Dashboard Global Styles & Responsiveness ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .analytics-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 3rem;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
        }
        .insights-main-row {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2rem;
          align-items: start;
        }
        .insights-secondary-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        
        @media (max-width: 1400px) {
          .metrics-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        @media (max-width: 1100px) {
          .insights-main-row { grid-template-columns: 1fr; }
        }
        
        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .insights-secondary-row { grid-template-columns: 1fr; }
          .header-controls { flex-direction: column; align-items: stretch !important; padding: 1.5rem !important; gap: 1.5rem !important; }
          .period-selector { justify-content: center; }
          .header-title-area { text-align: center; justify-content: center; flex-direction: column; }
          .analytics-container { gap: 1.5rem; }
        }
      `}} />

      {/* ── Header row ── */}
      <div className="header-controls" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '1.75rem 2rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="header-title-area" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <BarChart2 size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--primary)', margin: 0, letterSpacing: '-0.03em' }}>
              Strategic Intelligence
            </h2>
            {lastRefresh && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '0.25rem 0 0', fontWeight: 600 }}>
                Synced {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Analyzing {days}-day cycle
              </p>
            )}
          </div>
          
          {data?.partialData && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 1rem', borderRadius: '99px',
              backgroundColor: 'rgba(245,158,11,0.06)',
              border: '1px solid var(--border)',
              color: '#b45309', fontSize: '0.75rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.04em'
            }}>
              <AlertCircle size={14} strokeWidth={2.5} />
              <span>Limited GA4 View</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="period-selector" style={{ 
            display: 'flex', backgroundColor: '#f1f5f9', 
            padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' 
          }}>
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: '0.65rem 1.5rem', fontSize: '0.8rem', fontWeight: 900,
                  borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  backgroundColor: days === d ? 'var(--primary)' : 'transparent',
                  color: days === d ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: '60px'
                }}
              >
                {d}D
              </button>
            ))}
          </div>
          <button
            className="btn btn-outline"
            style={{ 
              padding: '0', borderRadius: 'var(--radius-md)', height: '48px', width: '48px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'white', border: '2px solid var(--border)',
              color: 'var(--text-muted)', transition: 'all 0.2s'
            }}
            onClick={() => load(true)}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseOut={(e)  => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <RefreshCw size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className="metrics-grid">
        <MetricCard
          icon={Users}
          iconBg="rgba(59,130,246,0.1)"
          iconColor="var(--primary)"
          label="Unique Researchers"
          value={metrics.visitors}
        />
        <MetricCard
          icon={BookOpen}
          iconBg="rgba(0,150,204,0.1)"
          iconColor="var(--secondary)"
          label="Protocol Views"
          value={metrics.protocolViews}
        />
        <MetricCard
          icon={FlaskConical}
          iconBg="rgba(139,92,246,0.1)"
          iconColor="#8b5cf6"
          label="Peptide Analysis"
          value={metrics.peptideViews}
        />
        <MetricCard
          icon={ShoppingCart}
          iconBg="rgba(245,158,11,0.1)"
          iconColor="#f59e0b"
          label="Cart Interest"
          value={metrics.addToCart}
        />
        <MetricCard
          icon={TrendingUp}
          iconBg="rgba(16,185,129,0.12)"
          iconColor="var(--success)"
          label="Checkout Entry"
          value={metrics.checkoutStarted}
        />
        <MetricCard
          icon={CheckCircle2}
          iconBg="rgba(0,54,102,0.08)"
          iconColor="var(--primary)"
          label="Final Protocols"
          value={metrics.completedOrders}
        />
      </div>

      {/* ── Platform Health ── */}
      {data?.health && (
        <PlatformHealth health={data.health} visitors={metrics.visitors} />
      )}

      {/* ── Exploration Journey ── */}
      <ExplorationJourney tops={tops} funnel={funnel} />

      {/* ── Discovery Insights ── */}
      <DiscoveryInsights tops={tops} />

      {/* ── Friction Insights (Phase 6) ── */}
      <FrictionInsights friction={friction} />

      {/* ── Conversion Funnel (repositioned below engagement) ── */}
      <ConversionFunnel steps={funnel} />

      {/* ── Geographic Reach ── */}
      <div className="insights-secondary-row" style={{ gridTemplateColumns: '1fr' }}>
        <TopList
          icon={Globe}
          title="Global Market Reach"
          items={tops.countries}
          emptyLabel="Geographic mapping pending."
          accentColor="var(--success)"
        />
      </div>
    </div>
  );
}
