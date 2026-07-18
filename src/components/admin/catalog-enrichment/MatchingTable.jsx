import React from 'react';
import { Card } from '../../ui';
import { CheckCircle, HelpCircle, Loader2 } from '@/lib/icons';
import DataTable from '../../ui/DataTable';
import DataTableSkeleton from '../../ui/skeletons/DataTableSkeleton';
import EmptyState from '../../ui/EmptyState';
import StatusBadge from '../../ui/StatusBadge';

export default function MatchingTable({ auditResults, loading, onRowClick }) {
  const getConfidenceColor = (conf) => {
    if (conf >= 90) return 'var(--color-success)';
    if (conf >= 60) return '#f59e0b';
    if (conf > 0) return '#ef4444';
    return 'var(--text-muted)';
  };

  const columns = [
    {
      key: 'item',
      header: 'Requested Product',
      sortKey: 'item',
      render: (r) => <span style={{ fontWeight: 500 }}>{r.item}</span>
    },
    {
      key: '_match',
      header: 'Matched Product (DB)',
      render: (r) => r.productInfo
        ? <span>{r.productInfo.name}</span>
        : <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No Match</span>
    },
    {
      key: 'confidence',
      header: 'Match Confidence',
      align: 'center',
      sortValue: (r) => r.confidence,
      render: (r) => r.confidence > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontWeight: 700, color: getConfidenceColor(r.confidence) }}>{r.confidence}%</span>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px' }}>
            <div style={{ width: `${r.confidence}%`, height: '100%', backgroundColor: getConfidenceColor(r.confidence), borderRadius: '2px' }} />
          </div>
        </div>
      ) : <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>0%</span>
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (r) => r.supplier || <span style={{ color: 'var(--text-muted)' }}>-</span>
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      sortValue: (r) => Number(r.price) || 0,
      render: (r) => r.price
        ? (!isNaN(Number(r.price)) ? `$${Number(r.price).toFixed(2)}` : r.price)
        : <span style={{ color: 'var(--text-muted)' }}>-</span>
    },
    {
      key: 'zohoStatus',
      header: 'Zoho Status',
      render: (r) => {
        const statusMap = { Ready: 'active', 'Needs Review': 'pending', Error: 'error', 'Missing in DB': 'error' };
        return <StatusBadge status={statusMap[r.zohoStatus] || 'inactive'} label={r.zohoStatus || 'Unknown'} />;
      }
    },
    {
      key: '_action',
      header: 'Action',
      render: (r) => r.confidence >= 90 ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 600 }}>
          <CheckCircle size={14} /> Synced
        </span>
      ) : r.confidence > 0 ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontSize: '0.8rem', fontWeight: 600 }}>
          <HelpCircle size={14} /> Review
        </span>
      ) : (
        <button className="gcp-btn gcp-btn--primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
          Create
        </button>
      )
    }
  ];

  return (
    <Card style={{ overflow: 'hidden' }}>
      {loading ? (
        <DataTableSkeleton rows={6} columns={7} />
      ) : auditResults.length === 0 ? (
        <EmptyState icon={CheckCircle} title="No items found" subtitle="Run a catalog audit to see matching results." />
      ) : (
        <DataTable
          data={auditResults.map((r, i) => ({ ...r, _idx: i }))}
          columns={columns}
          keyField="_idx"
          onRowClick={onRowClick}
          globalSearch
          searchPlaceholder="Search products..."
          emptyTitle="No matches found"
          rowStyle={(r) => ({ background: r.confidence === 0 ? '#fffbeb' : 'transparent' })}
        />
      )}
    </Card>
  );
}
