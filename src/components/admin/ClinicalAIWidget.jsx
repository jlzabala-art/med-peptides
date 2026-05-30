/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  MessageSquare,
  Compass,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  FlaskConical,
  Clock,
} from 'lucide-react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import CuriosityMap from './gadgets/CuriosityMap';
import LanguageSplit from './gadgets/LanguageSplit';
import FrictionSignals from './gadgets/FrictionSignals';
import { Card, MetricCard, Button } from '../ui';
import { db } from '../../firebase';

// ─── Data fetch ───────────────────────────────────────────────────────────────
async function fetchLogs() {
  const q = query(collection(db, 'clinical_logs'), orderBy('timestamp', 'desc'), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Token matching & Normalization helpers ─────────────────────────────────
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().trim();
}

function getItemCandidates(item, type) {
  const cands = new Set();

  if (item.id) cands.add(item.id);

  if (type === 'protocol') {
    if (item.title) cands.add(item.title);
    if (item.protocol_name) cands.add(item.protocol_name);
  } else {
    if (item.displayName) cands.add(item.displayName);
    else if (item.name) cands.add(item.name);
  }

  // Exact match only for synonyms
  if (Array.isArray(item.synonyms)) {
    item.synonyms.forEach((s) => {
      if (s.trim().length > 3) cands.add(s.trim());
    });
  }

  const cleanCands = [];
  cands.forEach((c) => {
    if (typeof c === 'string') {
      const clean = c.trim();
      if (clean && clean.length > 3) {
        cleanCands.push(clean);
      }
    }
  });

  return cleanCands;
}

function logMatchesItemWithRegex(log, regexes, type, itemName) {
  if (type === 'peptide' && Array.isArray(log.matchedPeptides)) {
    const normName = itemName.toLowerCase().trim();
    const hasMatch = log.matchedPeptides.some((p) => {
      const normP = p.toLowerCase().trim();
      if (normP === normName) return true;
      return regexes.some((rx) => rx.test(normP));
    });
    if (hasMatch) return true;
  }

  const query = log.userQuery || '';
  const reply = log.aiReply || '';
  const combinedText = `${query} ${reply}`;

  for (const rx of regexes) {
    if (rx.test(combinedText)) {
      return true;
    }
  }
  return false;
}

function precompileItems(items, type) {
  return items.map((item) => {
    const name =
      type === 'protocol'
        ? item.title || item.protocol_name || item.name || item.id
        : item.displayName || item.name || item.id;
    const candidates = getItemCandidates(item, type);
    const regexes = candidates.map((cand) => {
      const escaped = cand
        .toLowerCase()
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    });
    return { id: item.id, name, regexes, raw: item };
  });
}

function computeItemFrequencies(logs, compiledItems, type) {
  const list = compiledItems.map((cItem) => {
    let count = 0;
    for (const log of logs) {
      if (logMatchesItemWithRegex(log, cItem.regexes, type, cItem.name)) {
        count++;
      }
    }
    return { id: cItem.id, name: cItem.name, count };
  });
  return list.sort((a, b) => b.count - a.count);
}

function getLogMatches(log, compProducts, compSupplements, compProtocols) {
  const matched = [];
  compProducts.forEach((c) => {
    if (logMatchesItemWithRegex(log, c.regexes, 'peptide', c.name)) {
      matched.push({
        name: c.name,
        type: 'peptide',
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.08)',
      });
    }
  });
  compSupplements.forEach((c) => {
    if (logMatchesItemWithRegex(log, c.regexes, 'supplement', c.name)) {
      matched.push({
        name: c.name,
        type: 'supplement',
        color: 'var(--color-success)',
        bg: 'rgba(16,185,129,0.08)',
      });
    }
  });
  compProtocols.forEach((c) => {
    if (logMatchesItemWithRegex(log, c.regexes, 'protocol', c.name)) {
      matched.push({
        name: c.name,
        type: 'protocol',
        color: 'var(--color-primary)',
        bg: 'rgba(59,130,246,0.08)',
      });
    }
  });
  return matched;
}

// ─── Aggregate helpers ────────────────────────────────────────────────────────
function computeKPIs(logs, compProducts) {
  const sessions = new Map();
  for (const log of logs) {
    if (!sessions.has(log.sessionId)) sessions.set(log.sessionId, []);
    sessions.get(log.sessionId).push(log);
  }

  const totalSessions = sessions.size;
  const totalQueries = logs.length;

  const depths = [...sessions.values()].map((s) => s.length);
  const avgDepth =
    totalSessions > 0 ? (depths.reduce((a, b) => a + b, 0) / totalSessions).toFixed(1) : '—';

  let topCompound = '—';
  if (compProducts && compProducts.length > 0) {
    const productFreqs = computeItemFrequencies(logs, compProducts, 'peptide');
    if (productFreqs.length > 0 && productFreqs[0].count > 0) {
      topCompound = productFreqs[0].name;
    }
  } else {
    const compoundCount = {};
    for (const log of logs) {
      for (const p of log.matchedPeptides || []) {
        compoundCount[p] = (compoundCount[p] || 0) + 1;
      }
    }
    topCompound = Object.entries(compoundCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  }

  return { totalSessions, totalQueries, avgDepth, topCompound };
}

function computeLanguageSplit(logs) {
  const counts = { en: 0, es: 0, other: 0 };
  for (const log of logs) {
    const lang = (log.language || '').toLowerCase();
    if (lang === 'en') counts.en++;
    else if (lang === 'es') counts.es++;
    else counts.other++;
  }
  return counts;
}

function computeSessionDepthBuckets(logs) {
  const sessions = new Map();
  for (const log of logs) {
    if (!sessions.has(log.sessionId)) sessions.set(log.sessionId, 0);
    sessions.set(log.sessionId, sessions.get(log.sessionId) + 1);
  }
  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, '5+': 0 };
  for (const depth of sessions.values()) {
    if (depth === 1) buckets['1']++;
    else if (depth === 2) buckets['2']++;
    else if (depth === 3) buckets['3']++;
    else if (depth === 4) buckets['4']++;
    else buckets['5+']++;
  }
  return buckets;
}

function computeFrictionSignals(logs, top = 8) {
  const unmatched = logs.filter((l) => !l.matchedPeptides?.length && l.userQuery);
  const freq = {};
  for (const log of unmatched) {
    const q = (log.userQuery || '').trim().toLowerCase();
    if (q) freq[q] = (freq[q] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([query, count]) => ({ query, count }));
}

// ─── Curiosity Map panel ─────────────────────────────────────────────────────
// Removed internal definition, now imported
// ─── Language Split panel ────────────────────────────────────────────────────
// Removed internal definition, now imported
// ─── Session Depth Chart ────────────────────────────────────────────────────
function SessionDepthChart({ buckets }) {
  const entries = Object.entries(buckets);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const COLOR = '#6366f1';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '120px' }}>
      {entries.map(([label, val]) => {
        const heightPct = Math.round((val / maxVal) * 100);
        return (
          <div
            key={label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: COLOR }}>{val || '0'}</span>
            <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'flex-end' }}>
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  minHeight: val > 0 ? '4px' : 0,
                  borderRadius: '6px 6px 0 0',
                  background: COLOR,
                  opacity: 0.2 + (heightPct / 100) * 0.8,
                  transition: 'height 0.6s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Friction Signals panel ────────────────────────────────────────────────────
// Removed internal definition, now imported
// ─── Activity Feed ───────────────────────────────────────────────────────────────
function formatRelative(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

function ActivityFeed({ logs, compProducts, compSupplements, compProtocols }) {
  const recent = [...logs]
    .sort((a, b) => {
      const ta = a.timestamp?.toDate?.() ?? new Date(a.timestamp ?? 0);
      const tb = b.timestamp?.toDate?.() ?? new Date(b.timestamp ?? 0);
      return tb - ta;
    })
    .slice(0, 50); // Show up to 50 in table

  if (recent.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}
      >
        No activity yet.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="gcp-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Agent</th>
            <th>User Query</th>
            <th>Matched Data</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((log) => {
            const lang = (log.language || '').toUpperCase() || '?';
            const agent = log.agentId || 'Clinical AI';
            const matchedItems = getLogMatches(log, compProducts, compSupplements, compProtocols);

            return (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{formatRelative(log.timestamp)}</td>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{agent}</td>
                <td
                  style={{
                    maxWidth: '300px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {log.userQuery || <em style={{ color: 'var(--text-muted)' }}>No query text</em>}
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {matchedItems.slice(0, 3).map((item, idx) => (
                      <span
                        key={`${item.name}-${idx}`}
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          background: item.bg,
                          color: item.color,
                        }}
                      >
                        {item.name}
                      </span>
                    ))}
                    {matchedItems.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        +{matchedItems.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}



// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminClinicalAITab({ context = null }) {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeFilter, setTimeFilter] = useState('30d');
  const [agentFilter, setAgentFilter] = useState('all');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [logsSnap, productsSnap, supplementsSnap, protocolsSnap] = await Promise.all([
        getDocs(query(collection(db, 'clinical_logs'), orderBy('timestamp', 'desc'), limit(500))),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'supplements')),
        getDocs(collection(db, 'protocols')),
      ]);

      const fetchedLogs = logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const fetchedProducts = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const fetchedSupplements = supplementsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const fetchedProtocols = protocolsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setLogs(fetchedLogs);
      setProducts(fetchedProducts);
      setSupplements(fetchedSupplements);
      setProtocols(fetchedProtocols);
    } catch (err) {
      console.error(err);
      setError('Failed to load ClinicalAI logs and database items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const compProducts = useMemo(() => precompileItems(products, 'peptide'), [products]);
  const compSupplements = useMemo(() => precompileItems(supplements, 'supplement'), [supplements]);
  const compProtocols = useMemo(() => precompileItems(protocols, 'protocol'), [protocols]);

  // Filter logs by Agent and Time
  const filteredLogs = logs.filter((log) => {
    // 1. Agent Filter
    const agent = log.agentId || 'clinical_ai';
    if (agentFilter !== 'all' && agent !== agentFilter) return false;

    // 2. Time Filter
    if (timeFilter !== 'all') {
      const logDate = log.timestamp?.toDate?.() || new Date(log.timestamp || 0);
      const now = new Date();
      const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
      if (timeFilter === '1d' && diffDays > 1) return false;
      if (timeFilter === '7d' && diffDays > 7) return false;
      if (timeFilter === '30d' && diffDays > 30) return false;
      if (timeFilter === '90d' && diffDays > 90) return false;
    }
    return true;
  });

  const kpis = computeKPIs(filteredLogs, compProducts);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          ClinicalAI Intelligence
        </h2>
        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          Discovery engine · Educational assistant · Exploration layer
        </p>
      </div>

      {/* Filters Card */}
      <Card
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: '200px',
          }}
        >
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            AGENT
          </label>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              fontSize: '0.85rem',
              backgroundColor: '#f8f9fa',
            }}
          >
            <option value="all">All Agents</option>
            <option value="clinical_ai">Clinical AI</option>
            <option value="order_assistant">Order Assistant</option>
            <option value="prescription_agent">Prescription Agent</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: '200px',
          }}
        >
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            TIME RANGE
          </label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              fontSize: '0.85rem',
              backgroundColor: '#f8f9fa',
            }}
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last Month</option>
            <option value="90d">Last 3 Months</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={load}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: loading ? '#f1f3f4' : 'white',
              color: loading ? '#80868b' : '#1a73e8',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
            }}
          >
            <RefreshCw
              size={14}
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </Card>

      {/* ── Context Banner (from Supervision Monitor) ── */}
      {context && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            color: '#a5b4fc',
            marginBottom: '1.5rem',
            fontSize: '0.83rem',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 18 }}>{context.icon || '🔗'}</span>
          <span style={{ flex: 1 }}>
            Contexto: <strong style={{ color: '#e0e7ff' }}>{context.label}</strong>
            {context.count !== undefined && (
              <span style={{ marginLeft: 8, fontWeight: 400, color: 'var(--color-text-tertiary)' }}>
                ({context.count} relationship{context.count !== 1 ? 's' : ''})
              </span>
            )}
            {context.note && (
              <span style={{ marginLeft: 8, fontWeight: 400, color: 'var(--color-text-tertiary)' }}>
                — {context.note}
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: 11,
              color: '#6366f1',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            ← from Supervision Monitor
          </span>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div
          style={{
            margin: '0 0 1.5rem 0',
            padding: '1.25rem',
            background: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: '4px',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4
              style={{
                margin: '0 0 0.25rem 0',
                color: '#b91c1c',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              System Error
            </h4>
            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="clinical-ai-kpi-grid">
        <MetricCard
          icon={MessageSquare}
          title="AI Sessions"
          value={loading ? '…' : kpis.totalSessions}
          subtitle="Unique conversations"
          color="#8b5cf6"
          bg="rgba(139,92,246,0.08)"
        />
        <MetricCard
          icon={Compass}
          title="Total Queries"
          value={loading ? '…' : kpis.totalQueries}
          subtitle="User messages logged"
          color="var(--color-success)"
          bg="rgba(16,185,129,0.08)"
        />
        <MetricCard
          icon={Brain}
          title="Avg Session Depth"
          value={loading ? '…' : kpis.avgDepth}
          subtitle="Messages per session"
          color="var(--color-primary)"
          bg="rgba(59,130,246,0.08)"
        />
        <MetricCard
          icon={Brain}
          title="Top Compound"
          value={loading ? '…' : kpis.topCompound}
          subtitle="Most queried compound"
          color="#f59e0b"
          bg="rgba(245,158,11,0.08)"
        />
      </div>

      {/* ── 2-col: Curiosity Map + Language Split ── */}
      <div className="clinical-ai-grid">
        {/* Curiosity Map */}
        <div className="gcp-card" style={{ padding: '1.75rem' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                background: 'rgba(139,92,246,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FlaskConical size={16} color="#8b5cf6" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: 'var(--text-main)',
                }}
              >
                Curiosity Map
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Top items by query frequency
              </p>
            </div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <CuriosityMap
              logs={filteredLogs}
              products={products}
              supplements={supplements}
              protocols={protocols}
            />
          )}
        </div>

        {/* Language Split */}
        <div className="gcp-card" style={{ padding: '1.75rem' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={16} color="var(--color-success)" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: 'var(--text-main)',
                }}
              >
                Language Split
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                EN · ES · Other distribution
              </p>
            </div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <LanguageSplit counts={computeLanguageSplit(filteredLogs)} />
          )}
        </div>
      </div>

      {/* ── Session Depth Histogram ── */}
      <div className="gcp-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Brain size={16} color="#6366f1" />
          </div>
          <div>
            <h3
              style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}
            >
              Session Depth
            </h3>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Messages per session — exploration depth distribution
            </p>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <SessionDepthChart buckets={computeSessionDepthBuckets(filteredLogs)} />
        )}
      </div>

      {/* ── Friction Signals ── */}
      <div className="gcp-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              background: 'rgba(239,68,68,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={16} color="var(--color-danger)" />
          </div>
          <div>
            <h3
              style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}
            >
              Friction Signals
            </h3>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Queries that matched no compound — where users are confused
            </p>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <FrictionSignals signals={computeFrictionSignals(filteredLogs)} />
        )}
      </div>

      {/* ── Recent Activity Feed ── */}
      <div className="gcp-card" style={{ padding: '1.75rem' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              background: 'rgba(59,130,246,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={16} color="var(--color-primary)" />
          </div>
          <div>
            <h3
              style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}
            >
              Recent Activity
            </h3>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Last 15 queries — live pulse of the AI assistant
            </p>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <ActivityFeed
            logs={filteredLogs}
            compProducts={compProducts}
            compSupplements={compSupplements}
            compProtocols={compProtocols}
          />
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .gcp-card {
          background: white;
          border: 1px solid #dadce0;
          border-radius: 8px;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
          overflow: hidden;
        }

        .clinical-ai-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .clinical-ai-grid {
          display: grid; 
          grid-template-columns: 1fr 320px; 
          gap: 1rem; 
          margin-bottom: 1.5rem;
        }

        /* Mobile Adjustments */
        @media (max-width: 1024px) {
          .clinical-ai-grid {
            grid-template-columns: 1fr;
          }
          .clinical-ai-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .clinical-ai-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminClinicalAITab | Props: none
      </div>
    
</div>
  );
}
