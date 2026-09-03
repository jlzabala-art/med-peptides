"use client";

import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import DataTable from '../ui/DataTable';
import CopyableId from '../ui/CopyableId';
import { useAuditLogs } from '../../hooks/admin/useAuditLogs';

const fmt = (date) => new Intl.DateTimeFormat('en-GB', {
  day: 'short', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit'
}).format(date);

export default function AdminAuditLogsTabClient({ initialData = [], isSubTab = false }) {
  const { auditLogs: hookLogs, loading: loadingLogs, hasMore, loadMore, fetchAuditLogs: fetchLogs } = useAuditLogs({ pageSize: 100 });
  const paginatedLogs = hookLogs.length > 0 ? hookLogs : initialData;
  const logs = paginatedLogs || [];
  const loading = loadingLogs;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.executed_by || '').toLowerCase().includes(term) ||
      (log.source || '').toLowerCase().includes(term) ||
      (log.product_id || '').toLowerCase().includes(term) ||
      (log.user_id || '').toLowerCase().includes(term)
    );
  });

  const getActionColor = (action) => {
    if (action.includes('price') || action.includes('cost')) return '#10b981';
    if (action.includes('role') || action.includes('restriction')) return '#ef4444';
    if (action.includes('stock')) return '#f59e0b';
    return '#3b82f6';
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {!isSubTab && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={24} /> Security Audit Logs
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Immutable record of all critical system actions, price changes, and role updates.</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: 500, cursor: 'pointer' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search actions, users, sources, product IDs..."
          resultCount={loading ? undefined : filteredLogs.length}
          namespace="admin-audit-logs"
          size="lg"
        />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

        <div className="gcp-table-container">
          {loading && logs.length === 0 ? (
            <DataTableSkeleton rows={8} cols={4} />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'executed_at',
                  header: 'Timestamp',
                  render: (val) => {
                    const date = val?.toDate ? val.toDate() : new Date(val);
                    return <span style={{ color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{!isNaN(date.getTime()) ? fmt(date) : 'Unknown'}</span>;
                  }
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (val) => (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      backgroundColor: `${getActionColor(val || '')}15`,
                      color: getActionColor(val || ''),
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {val?.replace(/_/g, ' ')}
                    </span>
                  )
                },
                {
                  key: 'executed_by',
                  header: 'Source & User',
                  render: (val, row) => (
                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{val || 'Unknown'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldAlert size={12} /> {row.source || 'Manual'}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'product_id',
                  header: 'Details',
                  render: (val, row) => (
                    <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.25rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                      {row.product_id && <><span style={{ color: '#94a3b8' }}>Product ID:</span> <CopyableId value={row.product_id} /></>}
                      {row.user_id && <><span style={{ color: '#94a3b8' }}>Target User:</span> <CopyableId value={row.user_id} /></>}
                      {row.old_price !== undefined && <><span style={{ color: '#94a3b8' }}>Price Change:</span> <span>${row.old_price} → ${row.new_price}</span></>}
                      {row.old_role !== undefined && <><span style={{ color: '#94a3b8' }}>Role Change:</span> <span>{row.old_role} → {row.new_role}</span></>}
                      {row.count !== undefined && <><span style={{ color: '#94a3b8' }}>Batch Count:</span> <span>{row.count} items modified</span></>}
                    </div>
                  )
                }
              ]}
              data={filteredLogs}
              keyField="id"
              emptyMessage="No logs found matching your criteria."
            />
          )}
        </div>

        {hasMore && !loading && (
          <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
            <button className="gcp-btn-secondary" onClick={loadMore} disabled={loadingLogs}>
              {loadingLogs ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}