'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Download, Globe, ShoppingCart, Clock, Copy, Check } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';

/**
 * CatalogSharesHistoryTable
 *
 * Displays a compact history of all catalog PDFs and Web Share links
 * generated for a specific recipient (clinic, doctor, wholesaler, patient).
 *
 * Designed to be embedded as an `expandableRender` row inside the
 * recipient's DataTable (e.g. inside PhysicianProfileDrawer or
 * the Clinics/Wholeseller tables).
 *
 * @param {string} recipientId — Firestore ID of the recipient
 * @param {string} [type]      — Optional filter: 'pdf' | 'web'
 */
export default function CatalogSharesHistoryTable({ recipientId, type = null }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [copied,  setCopied]  = useState(null); // ID of currently copied item

  const fetchShares = useCallback(async () => {
    if (!recipientId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ recipientId, limit: '30' });
      if (type) params.set('type', type);

      const res = await fetch(`/api/catalog/shares?${params}`);
      if (!res.ok) throw new Error('Failed to fetch catalog history');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [recipientId, type]);

  useEffect(() => { fetchShares(); }, [fetchShares]);

  // ── Mark interaction ───────────────────────────────────────────────────────
  const markInteraction = async (shareId, interaction) => {
    try {
      await fetch('/api/catalog/shares', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, interaction }),
      });
      // Optimistic update
      setItems(prev => prev.map(item =>
        item.id === shareId ? { ...item, [interaction]: true } : item
      ));
    } catch (err) {
      console.warn('Failed to mark interaction:', err);
    }
  };

  // ── Copy URL to clipboard ──────────────────────────────────────────────────
  const handleCopyUrl = async (item) => {
    const url = item.shareableUrl || item.pdfDownloadUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(item.id);
      toast.success('Enlace copiado');
      setTimeout(() => setCopied(null), 2000);
      if (item.sourceType === 'web' && !item.webOpened) {
        markInteraction(item.id, 'webOpened');
      }
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  // ── Format helpers ─────────────────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  const supplierLabel = (item) => {
    if (item.supplierLabel) return item.supplierLabel;
    if (!item.supplierId)   return 'All Suppliers';
    return item.supplierId.replace(/^supplier-/i, '').replace(/-/g, ' ');
  };

  // ── Interaction badge ──────────────────────────────────────────────────────
  const InteractionBadge = ({ active, label, color = '#16a34a', bgColor = '#f0fdf4' }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      padding: '2px 7px', borderRadius: '9999px', fontSize: '0.67rem', fontWeight: 700,
      color: active ? color : '#94a3b8',
      backgroundColor: active ? bgColor : '#f8fafc',
      border: `1px solid ${active ? color + '30' : '#e2e8f0'}`,
    }}>
      {label}
    </span>
  );

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'catalogCode',
      header: 'Catalog Code',
      width: '22%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
            {row.catalogCode || row.catalogId?.slice(-8) || '—'}
          </span>
          <button
            type="button"
            onClick={() => handleCopyUrl(row)}
            title="Copiar enlace"
            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: copied === row.id ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center' }}
          >
            {copied === row.id ? <Check size={11} /> : <Copy size={11} />}
          </button>
        </div>
      ),
    },
    {
      key: 'supplierLabel',
      header: 'Proveedor',
      width: '22%',
      render: (row) => (
        <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>
          {supplierLabel(row)}
        </span>
      ),
    },
    {
      key: 'margin',
      header: 'Margen',
      width: '10%',
      render: (row) => (
        <span style={{
          fontSize: '0.72rem', fontWeight: 800, color: '#0369a1',
          backgroundColor: '#e0f2fe', padding: '1px 7px', borderRadius: '9999px',
        }}>
          +{row.margin ?? 0}%
        </span>
      ),
    },
    {
      key: 'sourceType',
      header: 'Tipo',
      width: '8%',
      render: (row) => (
        <span title={row.sourceType === 'pdf' ? 'PDF' : 'Web Share'}>
          {row.sourceType === 'pdf' ? <Download size={13} color="#475569" /> : <Globe size={13} color="#0284c7" />}
        </span>
      ),
    },
    {
      key: 'issuedAt',
      header: 'Fecha',
      width: '15%',
      render: (row) => (
        <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {formatDate(row.issuedAt)}
        </span>
      ),
    },
    {
      key: 'interactions',
      header: 'Interacciones',
      width: '23%',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <InteractionBadge active={row.webOpened}    label="Web"    color="#0284c7" bgColor="#f0f9ff" />
          <InteractionBadge active={row.pdfDownloaded} label="PDF"   color="#7c3aed" bgColor="#faf5ff" />
          <InteractionBadge active={row.orderPlaced}  label="Pedido" color="#16a34a" bgColor="#f0fdf4" />
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '10%',
      render: (row) => {
        const url = row.shareableUrl || row.pdfDownloadUrl;
        if (!url) return null;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (row.sourceType === 'web' && !row.webOpened) markInteraction(row.id, 'webOpened');
              if (row.sourceType === 'pdf' && !row.pdfDownloaded) markInteraction(row.id, 'pdfDownloaded');
            }}
            style={{ color: '#0284c7', display: 'flex', alignItems: 'center' }}
            title="Abrir enlace"
          >
            <ExternalLink size={13} />
          </a>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!recipientId) return null;

  if (error) {
    return (
      <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
        Error cargando historial: {error}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '4px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="#64748b" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Catálogos Generados
          </span>
          {!loading && (
            <span style={{ fontSize: '0.68rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '9999px' }}>
              {items.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchShares}
          disabled={loading}
          style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#0284c7', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Cargando…' : 'Refrescar'}
        </button>
      </div>

      {loading ? (
        /* Skeleton */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '32px', backgroundColor: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="Sin catálogos generados"
          subtitle="Los catálogos PDF y Web Share generados para este destinatario aparecerán aquí."
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          rowKey="id"
          compact
          globalSearch={false}
          showPagination={items.length > 10}
          pageSize={10}
        />
      )}
    </div>
  );
}
