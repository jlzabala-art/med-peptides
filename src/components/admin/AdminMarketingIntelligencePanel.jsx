"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  TrendingUp,
  Share2,
  MessageSquare,
  ShoppingCart,
  QrCode,
  Eye,
  RefreshCw,
  Clock,
  Package,
  Zap,
  AlertCircle,
} from '@/lib/icons';

// ── Reusable KPI Card ────────────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, icon: Icon, color = '#2563eb', bg = '#eff6ff', border = '#dbeafe', delta }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: `1px solid ${border}`,
      borderRadius: '14px',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flex: '1 1 180px',
      minWidth: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '10px',
          backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={color} />
        </div>
        {delta != null && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 800, color: delta >= 0 ? '#16a34a' : '#dc2626',
            backgroundColor: delta >= 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${delta >= 0 ? '#bbf7d0' : '#fecaca'}`,
            padding: '2px 6px', borderRadius: '6px',
          }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{subtitle}</div>}
    </div>
  );
}

// ── Event Type Config ────────────────────────────────────────────────────────
function getEventConfig(type) {
  switch (type) {
    case 'info_request':
      return { label: 'Info Request', icon: MessageSquare, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' };
    case 'webshare_order':
      return { label: 'Order via Web', icon: ShoppingCart, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    case 'qr_scan':
      return { label: 'QR / Barcode Scan', icon: QrCode, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
    case 'catalog_view':
      return { label: 'Catalog View', icon: Eye, color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    case 'whatsapp_inquiry':
      return { label: 'WhatsApp Inquiry', icon: MessageSquare, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    case 'proforma_download':
      return { label: 'Pro-Forma Download', icon: Package, color: '#0369a1', bg: '#eff6ff', border: '#dbeafe' };
    default:
      return { label: type || 'Event', icon: Zap, color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' };
  }
}

function timeAgo(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// ── Event Feed Row ───────────────────────────────────────────────────────────
function EventRow({ event }) {
  const cfg = getEventConfig(event.type);
  const Icon = cfg.icon;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '9px', flexShrink: 0, marginTop: '1px',
        backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} color={cfg.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
            {event.personName || event.recipient?.name || 'Anonymous'}
          </span>
          <span style={{
            fontSize: '0.64rem', fontWeight: 800, color: cfg.color,
            backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
            padding: '1px 5px', borderRadius: '4px',
          }}>
            {cfg.label}
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.productName || event.product || event.catalogName || 'Shared Catalog'}
        </div>
        {event.contactEmail && (
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>
            {event.contactEmail}
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8', flexShrink: 0, marginTop: '2px', whiteSpace: 'nowrap' }}>
        <Clock size={10} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
        {timeAgo(event.createdAt || event.generatedAt || event.lastActiveAt)}
      </div>
    </div>
  );
}

// ── Top Products Table ───────────────────────────────────────────────────────
function TopProductsPanel({ items }) {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
        No product engagement data yet
      </div>
    );
  }
  const max = Math.max(...items.map(i => i.totalInteractions || 1));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
            backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.62rem', fontWeight: 900, color: '#64748b',
          }}>
            {idx + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.productName || item.name || 'Unknown'}
            </div>
            <div style={{ marginTop: '3px', height: '5px', borderRadius: '3px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                backgroundColor: idx === 0 ? '#2563eb' : idx === 1 ? '#7c3aed' : '#0284c7',
                width: `${Math.round(((item.totalInteractions || 0) / max) * 100)}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', flexShrink: 0 }}>
            {item.totalInteractions || 0}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminMarketingIntelligencePanel() {
  const [catalogLogs, setCatalogLogs] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [qrScans, setQrScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // ── 1. Listen to catalog_generation_logs (info requests + shared catalogs) ─
  useEffect(() => {
    const q = query(
      collection(db, 'catalog_generation_logs'),
      orderBy('generatedAt', 'desc'),
      limit(100)
    );
    const unsub = onSnapshot(q, (snap) => {
      setCatalogLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // ── 2. Listen to shared_catalog_telemetry (webshare interactions) ──────────
  useEffect(() => {
    const q = query(
      collection(db, 'shared_catalog_telemetry'),
      orderBy('lastActiveAt', 'desc'),
      limit(100)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTelemetry(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return unsub;
  }, []);

  // ── 3. Listen to qr_scans analytics ─────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'qr_scans'),
      orderBy('scannedAt', 'desc'),
      limit(100)
    );
    const unsub = onSnapshot(q, (snap) => {
      setQrScans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return unsub;
  }, []);

  // ── Derived KPIs ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const infoRequests = catalogLogs.filter(l => l.docType === 'info_request');
    const sharedCatalogs = catalogLogs.filter(l => l.docType !== 'info_request');
    const totalViews = sharedCatalogs.reduce((s, l) => s + (l.viewCount || 0), 0);
    const webOrders = telemetry.filter(t => (t.orderInquiryCount || 0) > 0);
    const proformaDownloads = telemetry.reduce((s, t) => s + (t.proFormaDownloadCount || 0), 0);

    return {
      infoRequests: infoRequests.length,
      catalogShares: sharedCatalogs.length,
      totalViews: totalViews + qrScans.length,
      webOrders: webOrders.length,
      qrScans: qrScans.length,
      proformaDownloads,
    };
  }, [catalogLogs, telemetry, qrScans]);

  // ── Unified Event Feed ───────────────────────────────────────────────────
  const feedEvents = useMemo(() => {
    const events = [];

    catalogLogs.forEach(log => {
      events.push({
        id: log.id,
        type: log.docType === 'info_request' ? 'info_request' : 'catalog_view',
        personName: log.recipient?.name || log.sharedWith || null,
        contactEmail: log.recipient?.email || log.sharedEmail || null,
        productName: log.productName || log.catalogName || null,
        createdAt: log.generatedAt,
        viewCount: log.viewCount || 0,
        raw: log,
      });
    });

    telemetry.forEach(tel => {
      if ((tel.orderInquiryCount || 0) > 0) {
        events.push({
          id: `order_${tel.id}`,
          type: 'webshare_order',
          personName: tel.recipientName || null,
          productName: tel.latestItems?.join(', ') || 'Web Order',
          createdAt: tel.lastActiveAt,
          raw: tel,
        });
      }
      if ((tel.proFormaDownloadCount || 0) > 0) {
        events.push({
          id: `pf_${tel.id}`,
          type: 'proforma_download',
          personName: tel.recipientName || null,
          productName: tel.latestItems?.join(', ') || 'Pro-Forma',
          createdAt: tel.lastActiveAt,
          raw: tel,
        });
      }
    });

    qrScans.forEach(scan => {
      events.push({
        id: scan.id,
        type: 'qr_scan',
        personName: null,
        productName: scan.productName || scan.slug || 'Product Scan',
        createdAt: scan.scannedAt,
        raw: scan,
      });
    });

    // Sort by date desc
    events.sort((a, b) => {
      const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return db_ - da;
    });

    return events;
  }, [catalogLogs, telemetry, qrScans]);

  const filteredFeed = useMemo(() => {
    if (activeFilter === 'all') return feedEvents;
    return feedEvents.filter(e => e.type === activeFilter);
  }, [feedEvents, activeFilter]);

  // ── Top Products by engagement ───────────────────────────────────────────
  const topProducts = useMemo(() => {
    const map = {};
    feedEvents.forEach(e => {
      const name = e.productName;
      if (!name) return;
      if (!map[name]) map[name] = { productName: name, totalInteractions: 0 };
      map[name].totalInteractions += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, 8);
  }, [feedEvents]);

  const FILTERS = [
    { id: 'all', label: 'All Activity' },
    { id: 'info_request', label: '📬 Info Requests' },
    { id: 'webshare_order', label: '🛒 Web Orders' },
    { id: 'qr_scan', label: '📷 QR Scans' },
    { id: 'catalog_view', label: '👁️ Catalog Views' },
    { id: 'proforma_download', label: '📄 Pro-Formas' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 2px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
            Marketing Intelligence
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Real-time engagement from shared web catalogs, QR scans & info requests
          </p>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#64748b' }}>
            <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
            Loading live data...
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <KpiCard
          title="Info Requests"
          value={kpis.infoRequests}
          subtitle="From shared web catalogs"
          icon={MessageSquare}
          color="#7c3aed" bg="#f5f3ff" border="#c4b5fd"
        />
        <KpiCard
          title="Catalog Shares"
          value={kpis.catalogShares}
          subtitle="Personalized web links sent"
          icon={Share2}
          color="#2563eb" bg="#eff6ff" border="#dbeafe"
        />
        <KpiCard
          title="Total Views"
          value={kpis.totalViews}
          subtitle="Catalog views + QR scans"
          icon={Eye}
          color="#d97706" bg="#fffbeb" border="#fde68a"
        />
        <KpiCard
          title="Web Orders / Inquiries"
          value={kpis.webOrders}
          subtitle="Orders placed via shared link"
          icon={ShoppingCart}
          color="#16a34a" bg="#f0fdf4" border="#bbf7d0"
        />
        <KpiCard
          title="QR / Barcode Scans"
          value={kpis.qrScans}
          subtitle="Product pages via scan"
          icon={QrCode}
          color="#0284c7" bg="#f0f9ff" border="#bae6fd"
        />
        <KpiCard
          title="Pro-Forma Downloads"
          value={kpis.proformaDownloads}
          subtitle="Formal pricing docs"
          icon={Package}
          color="#0369a1" bg="#eff6ff" border="#dbeafe"
        />
      </div>

      {/* Main Content: Feed + Top Products */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Live Activity Feed */}
        <div style={{
          flex: '2 1 380px', backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {/* Feed Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a', boxShadow: '0 0 0 3px #dcfce7' }} />
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>Live Activity Feed</span>
              <span style={{
                fontSize: '0.66rem', fontWeight: 800, color: '#2563eb',
                backgroundColor: '#eff6ff', border: '1px solid #dbeafe',
                padding: '1px 6px', borderRadius: '4px',
              }}>
                {filteredFeed.length} events
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{
            display: 'flex', gap: '6px', padding: '10px 14px',
            overflowX: 'auto', borderBottom: '1px solid #f1f5f9',
          }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
                  border: `1.5px solid ${activeFilter === f.id ? '#003666' : '#e2e8f0'}`,
                  backgroundColor: activeFilter === f.id ? '#003666' : '#f8fafc',
                  color: activeFilter === f.id ? '#ffffff' : '#475569',
                  fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                  touchAction: 'manipulation',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '9px', backgroundColor: '#f1f5f9' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, width: '60%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '6px' }} />
                    <div style={{ height: 10, width: '40%', backgroundColor: '#f8fafc', borderRadius: '4px' }} />
                  </div>
                </div>
              ))
            ) : filteredFeed.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <AlertCircle size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>No activity yet</div>
                <div style={{ fontSize: '0.72rem', marginTop: '4px' }}>Events will appear here as your marketing tools are used</div>
              </div>
            ) : (
              filteredFeed.slice(0, 50).map(event => (
                <EventRow key={event.id} event={event} />
              ))
            )}
          </div>
        </div>

        {/* Top Products Panel */}
        <div style={{
          flex: '1 1 240px', backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <TrendingUp size={16} color="#2563eb" />
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>Top Products</span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
              By total engagement (views + scans + requests)
            </p>
          </div>
          <TopProductsPanel items={topProducts} />
        </div>
      </div>

      {/* Info Requests Detail Table */}
      <div style={{
        backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <MessageSquare size={16} color="#7c3aed" />
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>Clinical Info Requests</span>
          <span style={{
            fontSize: '0.66rem', fontWeight: 800, color: '#7c3aed',
            backgroundColor: '#f5f3ff', border: '1px solid #c4b5fd',
            padding: '1px 6px', borderRadius: '4px',
          }}>
            {catalogLogs.filter(l => l.docType === 'info_request').length} received
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Practitioner', 'Product / Compound', 'Status', 'Views', 'Date'].map((h, i) => (
                  <th key={i} style={{
                    padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem',
                    fontWeight: 800, color: '#64748b', textTransform: 'uppercase',
                    letterSpacing: '0.04em', width: i === 4 ? '100px' : i === 3 ? '60px' : i === 2 ? '90px' : 'auto',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catalogLogs.filter(l => l.docType === 'info_request').slice(0, 20).map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                      {log.recipient?.name || log.sharedWith || 'Anonymous'}
                    </div>
                    <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>
                      {log.recipient?.email || log.sharedEmail || ''}
                    </div>
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: '0.76rem', color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.productName || '—'}
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px',
                      backgroundColor: log.status === 'viewed' ? '#f0fdf4' : '#fffbeb',
                      color: log.status === 'viewed' ? '#16a34a' : '#d97706',
                      border: `1px solid ${log.status === 'viewed' ? '#bbf7d0' : '#fde68a'}`,
                    }}>
                      {log.status === 'viewed' ? 'Viewed' : 'Sent'}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: '0.76rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>
                    {log.viewCount || 0}
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {log.generatedAt ? new Date(log.generatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
              {catalogLogs.filter(l => l.docType === 'info_request').length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    No info requests yet — they appear when practitioners use your shared web catalogs
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
