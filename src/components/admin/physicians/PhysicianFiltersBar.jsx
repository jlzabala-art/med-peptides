import React from 'react';
import { Filter } from 'lucide-react';

export default function PhysicianFiltersBar({ filters, setFilters }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(k => filters[k] && filters[k] !== 'all');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--border)',
      backgroundColor: '#f8fafc',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
        <Filter size={16} /> Filters
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
        <select
          className="gcp-input"
          value={filters.status || 'all'}
          onChange={(e) => updateFilter('status', e.target.value)}
          style={{ width: '160px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 500,
            textDecoration: 'underline'
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
