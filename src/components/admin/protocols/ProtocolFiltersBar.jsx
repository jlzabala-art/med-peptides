import React from 'react';
import { Package, Clock, Archive, Filter, Activity } from '@/lib/icons';
import { useAlgoliaFacets } from '../../../hooks/data/useAlgoliaSearch';

export default function ProtocolFiltersBar({
  activeChip,
  setActiveChip,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
}) {
  const chips = [
    { id: 'all', label: 'All Protocols', icon: <Package size={14} /> },
    { id: 'active', label: 'Active', icon: <Activity size={14} /> },
    { id: 'drafts', label: 'Drafts', icon: <Clock size={14} /> },
    { id: 'archived', label: 'Archived', icon: <Archive size={14} /> },
  ];

  // Dynamically load categories from Algolia
  const { facets, loading: facetsLoading } = useAlgoliaFacets('protocols', ['category']);
  const availableCategories = facets.category || [];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0.75rem 1rem', 
      borderBottom: '1px solid var(--border)',
      backgroundColor: '#f8fafc',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
        <Filter size={16} /> Filters
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flex: 1, alignItems: 'center' }}>
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveChip(chip.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              backgroundColor: activeChip === chip.id ? 'var(--primary)' : 'white',
              color: activeChip === chip.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeChip === chip.id ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {chip.icon} {chip.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{ height: '32px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0 0.75rem', fontSize: '0.8rem', background: '#fff', cursor: 'pointer', color: 'var(--text-main)' }}
        >
          <option value="">All Categories</option>
          {facetsLoading && <option value="" disabled>Loading...</option>}
          {availableCategories.map(cat => (
            <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ height: '32px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0 0.75rem', fontSize: '0.8rem', background: '#fff', cursor: 'pointer', color: 'var(--text-main)' }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
  );
}
