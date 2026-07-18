import React from 'react';
import { RefreshCw, Download, FileText } from '@/lib/icons'; // Ensure these icons exist in your lucide-react exports or adapt

export default function PageFooter({
  lastUpdated,
  onRefresh,
  onExportCsv,
  onExportPdf,
  selectedCount = 0,
  isSticky = false,
  customActions
}) {
  return (
    <div
      className="gcp-page-footer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderTop: '1px solid var(--border-color, #e5e7eb)',
        backgroundColor: 'var(--bg-app, #f9fafb)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary, #64748b)',
        position: isSticky ? 'sticky' : 'static',
        bottom: 0,
        zIndex: isSticky ? 10 : 1,
        marginTop: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {selectedCount > 0 ? (
          <span style={{ fontWeight: 600, color: 'var(--color-primary, #0f172a)' }}>
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
        ) : lastUpdated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Last synced: {lastUpdated}</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--color-primary, #2563eb)',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Refresh Data"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        ) : (
          <span>Data up to date</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {customActions}
        
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <FileText size={14} />
            Export CSV
          </button>
        )}
        
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <Download size={14} />
            Export PDF
          </button>
        )}
      </div>
    </div>
  );
}
