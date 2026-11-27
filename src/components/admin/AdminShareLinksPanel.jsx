'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link2, Plus, Copy, Clock, ShieldOff, RotateCcw, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import MetricCard from '@/components/ui/MetricCard';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import { PRICING_MARKETS, getPricingMarketMeta } from '@/constants/roles';

const ROUTE_OPTIONS = [
  { value: '/pricing/peptides', label: 'Peptides (/pricing/peptides)' },
  { value: '/pricing/pellets', label: 'Pellets (/pricing/pellets)' },
  { value: '/pricing/bloodo', label: 'Bloodo Diagnostics (/pricing/bloodo)' },
  { value: '/pricing/24genomics-qatar', label: '24Genomics Qatar (/pricing/24genomics-qatar)' },
  { value: '/pricing/colway-qatar', label: 'Colway Qatar (/pricing/colway-qatar)' },
  { value: '/b2b/quotes/magenta', label: 'Magenta Bulk API Quote (/b2b/quotes/magenta)' },
];

const SHARE_ROLES = [
  { value: 'wholesaler', label: 'Wholesaler (+15%+15%)' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'clinic', label: 'Clinic / Pharmacy' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'patient', label: 'Patient (MSRP)' },
];

function computeLinkStatus(link, nowMs) {
  if (link?.revoked) return 'cancelled';
  if (nowMs && link?.expiresAt && new Date(link.expiresAt).getTime() < nowMs) {
    return 'inactive';
  }
  return 'active';
}

function formatDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminShareLinksPanel() {
  const [links, setLinks] = useState([]);
  const [nowMs, setNowMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyToken, setBusyToken] = useState(null);

  // Quick-create form state
  const [route, setRoute] = useState('/pricing/peptides');
  const [role, setRole] = useState('wholesaler');
  const [market, setMarket] = useState('global');
  const [currency, setCurrency] = useState('USD');
  const [recipientName, setRecipientName] = useState('');
  const [ttlDays, setTtlDays] = useState('14');

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shares/pricing-link?list=1', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not load share links');
      }
      setLinks(Array.isArray(data.links) ? data.links : []);
      setNowMs(Date.now());
    } catch (err) {
      toast.error(err.message || 'Failed to load share links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/shares/pricing-link?list=1', { cache: 'no-store' })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok || !data?.ok) {
          throw new Error(data?.error || 'Could not load share links');
        }
        setLinks(Array.isArray(data.links) ? data.links : []);
        setNowMs(Date.now());
      })
      .catch((err) => {
        if (active) toast.error(err.message || 'Failed to load share links');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/shares/pricing-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route,
          role,
          market,
          currency,
          recipientName: recipientName.trim(),
          ttlDays: Number(ttlDays) || 14,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to generate link');
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard && data.url) {
        navigator.clipboard.writeText(data.url).catch(() => {});
      }
      toast.success(`Link /s/${data.token} created & copied to clipboard`);
      setRecipientName('');
      await fetchLinks();
    } catch (err) {
      toast.error(err.message || 'Could not create share link');
    } finally {
      setCreating(false);
    }
  };

  const handlePatch = useCallback(async (token, action) => {
    setBusyToken(token);
    try {
      const res = await fetch('/api/shares/pricing-link', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action, ttlDays: 7 }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Update failed');
      }
      setLinks((prev) => prev.map((item) => (item.token === token ? data.link : item)));
      const msg =
        action === 'revoke'
          ? `Link ${token} revoked`
          : action === 'restore'
            ? `Link ${token} restored`
            : `Link ${token} extended +7 days`;
      toast.success(msg);
    } catch (err) {
      toast.error(err.message || 'Could not update share link');
    } finally {
      setBusyToken(null);
    }
  }, []);

  const handleCopyUrl = useCallback((token) => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://www.atlashealth-services.com';
    const url = `${origin}/s/${token}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success(`Copied ${url}`);
      }).catch(() => {
        toast.error('Clipboard copy unavailable');
      });
    }
  }, []);

  const kpis = useMemo(() => {
    const soonThreshold = nowMs ? nowMs + 72 * 60 * 60 * 1000 : 0;
    let active = 0;
    let totalViews = 0;
    let expiringSoon = 0;

    for (const l of links) {
      totalViews += Number(l.views || 0);
      const status = computeLinkStatus(l, nowMs);
      if (status === 'active') {
        active += 1;
        if (nowMs && l.expiresAt) {
          const expMs = new Date(l.expiresAt).getTime();
          if (expMs > nowMs && expMs <= soonThreshold) {
            expiringSoon += 1;
          }
        }
      }
    }
    return {
      total: links.length,
      active,
      totalViews,
      expiringSoon,
    };
  }, [links, nowMs]);

  const columns = useMemo(
    () => [
      {
        key: 'token',
        header: 'Share Token',
        render: (val, row) => {
          const item = row || val;
          return <CopyableId value={item.token} />;
        },
      },
      {
        key: 'recipientName',
        header: 'Recipient / Partner',
        render: (val, row) => {
          const item = row || val;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {item.recipientName || 'Unnamed Partner'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                {item.route}
              </span>
            </div>
          );
        },
      },
      {
        key: 'role',
        header: 'Granted Context',
        render: (val, row) => {
          const item = row || val;
          const m = getPricingMarketMeta(item.market);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  textTransform: 'uppercase',
                }}
              >
                {item.role}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                {m.flag} {m.label}
              </span>
              {item.currency && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f766e' }}>
                  · {item.currency}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (val, row) => {
          const item = row || val;
          return <StatusBadge status={computeLinkStatus(item, nowMs)} />;
        },
      },
      {
        key: 'views',
        header: 'Views',
        render: (val, row) => {
          const item = row || val;
          return <span style={{ fontWeight: 600 }}>{Number(item.views || 0)}</span>;
        },
      },
      {
        key: 'expiresAt',
        header: 'Expires',
        render: (val, row) => {
          const item = row || val;
          return <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formatDateShort(item.expiresAt)}</span>;
        },
      },
      {
        key: '_actions',
        header: 'Actions',
        render: (val, row) => {
          const item = row || val;
          const isBusy = busyToken === item.token;
          const status = computeLinkStatus(item, nowMs);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => handleCopyUrl(item.token)}
                style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Copy full /s/ URL"
              >
                <Copy size={12} />
                <span>Copy</span>
              </button>
              <button
                type="button"
                className="gcp-btn-secondary"
                disabled={isBusy}
                onClick={() => handlePatch(item.token, 'extend')}
                style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Extend expiry +7 days"
              >
                <Clock size={12} />
                <span>+7d</span>
              </button>
              {status === 'cancelled' ? (
                <button
                  type="button"
                  className="gcp-btn-secondary"
                  disabled={isBusy}
                  onClick={() => handlePatch(item.token, 'restore')}
                  style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Restore access"
                >
                  <RotateCcw size={12} />
                  <span>Restore</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="gcp-btn-secondary"
                  disabled={isBusy}
                  onClick={() => handlePatch(item.token, 'revoke')}
                  style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626' }}
                  title="Revoke link immediately"
                >
                  <ShieldOff size={12} />
                  <span>Revoke</span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [busyToken, handleCopyUrl, handlePatch, nowMs]
  );

  return (
    <section
      style={{
        marginTop: '2rem',
        padding: '1.25rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={18} />
            <span>Signed B2B Share Links (/s/[token])</span>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            Create, audit, extend, or revoke short-lived commercial links scoped by Role, Market, and Currency.
          </p>
        </div>
        <button
          type="button"
          className="gcp-btn-secondary"
          onClick={fetchLinks}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 4 KPIs (Golden Rule #22) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.15rem' }}>
        <MetricCard title="Total Share Links" value={kpis.total} subtitle="Last 100 generated" />
        <MetricCard title="Active Grants" value={kpis.active} subtitle="Live non-expired links" />
        <MetricCard title="Total Partner Views" value={kpis.totalViews} subtitle="Resolved via /s/[token]" />
        <MetricCard title="Expiring <= 72h" value={kpis.expiringSoon} subtitle="Requires +7d extension" alert={kpis.expiringSoon > 0} />
      </div>

      {/* Quick Create Bar */}
      <form
        onSubmit={handleCreate}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '8px',
          padding: '0.85rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          marginBottom: '1rem',
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', fontWeight: 600, color: '#475569' }}>
          Target Schedule / Route
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}
          >
            {ROUTE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', fontWeight: 600, color: '#475569' }}>
          Granted Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}
          >
            {SHARE_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', fontWeight: 600, color: '#475569' }}>
          Market
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}
          >
            {Object.values(PRICING_MARKETS).map((m) => (
              <option key={m.id} value={m.id}>{m.flag} {m.label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', fontWeight: 600, color: '#475569' }}>
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="AED">AED</option>
            <option value="QAR">QAR</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', fontWeight: 600, color: '#475569' }}>
          Partner / Recipient
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Magenta Procurement"
            maxLength={120}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.73rem', fontWeight: 600, color: '#475569' }}>
          TTL (Days)
          <input
            type="number"
            min={1}
            max={90}
            value={ttlDays}
            onChange={(e) => setTtlDays(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}
          />
        </label>

        <button
          type="submit"
          className="gcp-btn-primary"
          disabled={creating}
          style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>{creating ? 'Creating...' : 'Create & Copy Link'}</span>
        </button>
      </form>

      {/* Unified DataTable (Golden Rule #3) */}
      <DataTable
        columns={columns}
        data={links}
        keyField="token"
        isLoading={loading}
        emptyTitle="No signed share links yet"
        emptyDescription="Create a role + market scoped pricing link above to share with B2B partners."
        initialRowsPerPage={10}
      />
    </section>
  );
}
