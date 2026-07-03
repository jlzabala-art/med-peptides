import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Activity from "lucide-react/dist/esm/icons/activity";
import Filter from "lucide-react/dist/esm/icons/filter";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Search from "lucide-react/dist/esm/icons/search";
import React, { useState } from 'react';
import AdminPageHeader from './AdminPageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import { useAuditLogs } from '../../hooks/admin/useAuditLogs';

const fmt = (date) => new Intl.DateTimeFormat('en-GB', {
  day: 'short', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit'
}).format(date);

export default function AdminAuditLogsTab() {
  const { auditLogs: paginatedLogs, loading: loadingLogs, hasMore, loadMore, fetchAuditLogs: fetchLogs } = useAuditLogs({ pageSize: 100 });
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
    if (action.includes('price') || action.includes('cost')) return '#10b981'; // Green
    if (action.includes('role') || action.includes('restriction')) return '#ef4444'; // Red
    if (action.includes('stock')) return '#f59e0b'; // Yellow
    return '#3b82f6'; // Blue
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header — normalised */}
      <AdminPageHeader
        title="Security Audit Logs"
        subtitle="Immutable record of all critical system actions, price changes, and role updates."
        icon={ShieldCheck}
        actions={
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', backgroundColor: 'white',
              border: '1px solid #e2e8f0', borderRadius: '8px',
              color: '#334155', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      {/* Prominent search */}
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
        {/* Toolbar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Filter logs by action, ID, or user..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.5rem 1rem 0.5rem 2.2rem',
                border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            <Filter size={16} /> Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Timestamp</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Source & User</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Activity size={24} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} /> Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const date = log.executed_at?.toDate ? log.executed_at.toDate() : new Date(log.executed_at);
                  const isDateValid = !isNaN(date.getTime());
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {isDateValid ? fmt(date) : 'Unknown'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          backgroundColor: `${getActionColor(log.action)}15`, 
                          color: getActionColor(log.action),
                          padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{log.executed_by || 'Unknown'}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShieldAlert size={12} /> {log.source || 'Manual'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.25rem 1rem' }}>
                          {log.product_id && <><span style={{ color: '#94a3b8' }}>Product ID:</span> <span style={{ fontFamily: 'monospace' }}>{log.product_id}</span></>}
                          {log.user_id && <><span style={{ color: '#94a3b8' }}>Target User:</span> <span style={{ fontFamily: 'monospace' }}>{log.user_id}</span></>}
                          {log.old_price !== undefined && <><span style={{ color: '#94a3b8' }}>Price Change:</span> <span>${log.old_price} &rarr; ${log.new_price}</span></>}
                          {log.old_role !== undefined && <><span style={{ color: '#94a3b8' }}>Role Change:</span> <span>{log.old_role} &rarr; {log.new_role}</span></>}
                          {log.count !== undefined && <><span style={{ color: '#94a3b8' }}>Batch Count:</span> <span>{log.count} items modified</span></>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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