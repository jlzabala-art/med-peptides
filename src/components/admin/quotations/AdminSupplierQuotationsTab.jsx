'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Eye,
  ExternalLink,
  Building2,
} from '@/lib/icons';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import EmptyState from '@/components/ui/EmptyState';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import SupplierQuotationDetailDrawer from './SupplierQuotationDetailDrawer';

/**
 * AdminSupplierQuotationsTab
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages inbound OEM/wholesaler quotations (`supplier_quotations`), revision
 * lineage (e.g., ilapo SQ212214 R1 €54 -> R2 €49), and Cloud Storage PDF preview.
 */
export default function AdminSupplierQuotationsTab() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailQuotationId, setDetailQuotationId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchQuotations = useCallback(async () => {
    const res = await fetch('/api/supplier-quotations', { cache: 'no-store' });
    const data = await res.json();
    return data?.ok && Array.isArray(data.items) ? data.items : null;
  }, []);

  const loadQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchQuotations();
      if (items) setQuotations(items);
    } catch (err) {
      console.error('[AdminSupplierQuotationsTab] load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchQuotations]);

  useEffect(() => {
    let active = true;
    fetchQuotations()
      .then((items) => {
        if (active && items) setQuotations(items);
      })
      .catch((err) => {
        console.error('[AdminSupplierQuotationsTab] load failed:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchQuotations]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return quotations.filter((item) => {
      if (statusFilter !== 'all' && String(item.status || '').toLowerCase() !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const itemText = (item.lineItems || []).map((li) => `${li.sku || ''} ${li.description || li.name || ''}`).join(' ');
      const hay = `${item.quotationNumber} ${item.supplierQuoteNumber} ${item.supplierName} ${item.commercialNotes} ${itemText}`.toLowerCase();
      return hay.includes(q);
    });
  }, [quotations, searchQuery, statusFilter]);

  const kpis = useMemo(() => {
    const total = quotations.length;
    const active = quotations.filter((q) => q.status === 'active' || q.status === 'approved').length;
    const improved = quotations.filter((q) => Boolean(q.improvementSummary?.isImproved || q.improvementSummary?.improvementPct < 0)).length;
    const cloudPdfs = quotations.filter((q) => Boolean(q.hasPdf)).length;
    return { total, active, improved, cloudPdfs };
  }, [quotations]);

  const columns = useMemo(
    () => [
      {
        key: 'quotationNumber',
        label: 'Quote / Revision',
        width: '18%',
        sortable: true,
        render: (_, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CopyableId value={row.quotationNumber || row.id} maxLength={18} />
              {row.revisionNumber > 1 && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '999px', background: '#e8f0fe', color: '#1967d2' }}>
                  Rev {row.revisionNumber}
                </span>
              )}
            </div>
            {row.documentDate && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.documentDate}</span>}
          </div>
        ),
      },
      {
        key: 'supplierName',
        label: 'Supplier & Line Item',
        width: '28%',
        sortable: true,
        render: (_, row) => {
          const firstItem = row.lineItems?.[0];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Building2 size={13} color="#5f6368" />
                {row.supplierName || row.supplierId}
              </span>
              {firstItem && (
                <span style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                  {firstItem.sku ? `[${firstItem.sku}] ` : ''}
                  {firstItem.description || firstItem.name}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'grandTotal',
        label: 'Offer Value & Delta',
        width: '18%',
        sortable: true,
        render: (_, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#0f172a' }}>
              {Number(row.grandTotal || row.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.currency || 'EUR'}
            </span>
            {row.unitPrice != null && (
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Unit: {Number(row.unitPrice).toFixed(2)} {row.currency || 'EUR'}
              </span>
            )}
            {row.improvementSummary && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.71rem', fontWeight: 700, color: '#15803d' }}>
                <TrendingDown size={12} />
                {row.improvementSummary.improvementPct}% ({row.improvementSummary.unitDeltaEur} {row.currency || 'EUR'}/u)
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        width: '13%',
        sortable: true,
        render: (_, row) => (
          <StatusBadge
            status={row.status === 'superseded' ? 'inactive' : row.status}
            customLabel={row.status === 'superseded' ? 'Superseded' : undefined}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Document & Actions',
        width: '23%',
        render: (_, row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
            {row.hasPdf && (
              <button
                type="button"
                onClick={() =>
                  setPreviewDoc({
                    id: row.id,
                    title: `Supplier Quote ${row.quotationNumber || row.id}`,
                    subtitle: `${row.supplierName || ''} · Rev ${row.revisionNumber || 1}`,
                    fileUrl: `/api/supplier-quotations/${encodeURIComponent(row.id)}/document`,
                    downloadName: row.sourceDocument?.fileName || `${row.id}.pdf`,
                  })
                }
                className="gcp-btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: '32px' }}
              >
                <Eye size={13} />
                <span>Preview PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setDetailQuotationId(row.id)}
              className="gcp-btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: '32px', color: '#5f6368', borderColor: '#dadce0', background: '#ffffff' }}
            >
              <ExternalLink size={13} />
              <span>Detail & Revisions</span>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const renderExpanded = useCallback((row) => {
    return (
      <div style={{ padding: '0.9rem 1.1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8rem', color: '#334155' }}>
          <span><strong>Incoterm:</strong> {row.incoterm || '—'}</span>
          <span><strong>Payment:</strong> {row.paymentTerms || '—'}</span>
          <span><strong>Salesperson:</strong> {row.salesperson || '—'}</span>
          {row.supersedesQuotationId && <span><strong>Supersedes:</strong> {row.supersedesQuotationId}</span>}
          {row.supersededByQuotationId && <span><strong>Replaced By:</strong> {row.supersededByQuotationId}</span>}
        </div>
        {row.commercialNotes && (
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{row.commercialNotes}</div>
        )}
        {row.lineItems?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {row.lineItems.map((li, idx) => (
              <div key={`${row.id}-li-${idx}`} style={{ fontSize: '0.78rem', padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span><strong>{li.sku || `#${idx + 1}`}</strong> · {li.description || li.name} ({li.quantity} {li.unit || 'pcs'})</span>
                <span style={{ fontWeight: 700 }}>{li.unitPrice} {row.currency || 'EUR'}/u → {li.lineAmount} {row.currency || 'EUR'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        <MetricCard title="Supplier Quotations" value={kpis.total} subtitle="All inbound offers" icon={FileText} color="#1a73e8" />
        <MetricCard title="Active Quotes" value={kpis.active} subtitle="Current valid revisions" icon={CheckCircle2} color="#16a34a" />
        <MetricCard title="Price Improvements" value={kpis.improved} subtitle="Negotiated reductions" icon={TrendingDown} color="#059669" />
        <MetricCard title="Cloud PDFs" value={kpis.cloudPdfs} subtitle="Archived originals" icon={ShieldCheck} color="#0284c7" />
      </div>

      <GlobalSearchBar
        size="lg"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search supplier quotations by number (SQ212214), supplier (ilapo), or product (Cerebrolysin)..."
        resultCount={filtered.length}
        storageKey="admin_supplier_quotations_search"
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Revisions' },
              { value: 'active', label: 'Active' },
              { value: 'superseded', label: 'Superseded' },
              { value: 'converted_to_po', label: 'Converted to PO' },
            ],
          },
        ]}
      />

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No supplier quotations match"
          subtitle="Supplier quotations and improved PDF revisions will appear here once ingested."
          action={{ label: 'Reset Filters', onClick: () => { setSearchQuery(''); setStatusFilter('all'); } }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          isLoading={loading}
          expandableRender={renderExpanded}
          pagination={true}
          initialRowsPerPage={25}
        />
      )}

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        fileUrl={previewDoc?.fileUrl || ''}
        downloadName={previewDoc?.downloadName || 'supplier-quote.pdf'}
        title={previewDoc?.title || 'Supplier Quotation PDF'}
        subtitle={previewDoc?.subtitle || ''}
        printable={true}
      />

      <SupplierQuotationDetailDrawer
        quotationId={detailQuotationId}
        isOpen={Boolean(detailQuotationId)}
        onClose={() => setDetailQuotationId(null)}
        onStatusChange={loadQuotations}
      />
    </div>
  );
}
