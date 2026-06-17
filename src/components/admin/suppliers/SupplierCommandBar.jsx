import React from 'react';
import { Filter, Search, List, Grid, CheckSquare, Settings, Download, Mail, Activity, Archive, Map } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplierCommandBar({ 
  searchTerm, 
  setSearchTerm, 
  activeView, 
  setActiveView,
  selectedCount,
  onClearSelection,
  onBulkAction
}) {

  // Normal command bar (Search + Views)
  const renderStandardBar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', minWidth: '240px' }}>
        <Filter size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search across name, email, type, country, tags..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', color: 'var(--text-main)' }}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {[
          { id: 'table', label: 'Table View', icon: List },
          { id: 'directory', label: 'Directory', icon: Grid },
          { id: 'comparison', label: 'Compare', icon: CheckSquare },
          { id: 'map', label: 'Map', icon: Map }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                border: 'none',
                backgroundColor: active ? 'var(--primary-light)' : 'var(--surface)',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                borderLeft: tab.id !== 'table' ? '1px solid var(--border)' : 'none'
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Bulk Actions Bar (Sticky contextual bar)
  const renderBulkBar = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      gap: '1rem', 
      flexWrap: 'wrap',
      backgroundColor: 'var(--primary-light)',
      border: '1px solid var(--primary)',
      borderRadius: '8px',
      padding: '0.5rem 1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
          {selectedCount} selected
        </span>
        <button 
          onClick={onClearSelection}
          style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Clear Selection
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onBulkAction('RFQ')} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={14} /> Send RFQ
        </button>
        <button onClick={() => onBulkAction('Documents')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckSquare size={14} /> Request Docs
        </button>
        <button onClick={() => onBulkAction('Email')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Mail size={14} /> Email
        </button>
        <button onClick={() => onBulkAction('Compare')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Settings size={14} /> Compare
        </button>
        <button onClick={() => onBulkAction('Export')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Download size={14} /> Export
        </button>
        <button onClick={() => onBulkAction('Archive')} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <Archive size={14} /> Archive
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-alt)', paddingTop: '8px', paddingBottom: '8px' }}>
      {selectedCount > 0 ? renderBulkBar() : renderStandardBar()}
    </div>
  );
}
