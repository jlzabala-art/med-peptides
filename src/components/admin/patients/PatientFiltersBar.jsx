import React from 'react';
import Filter from 'lucide-react/dist/esm/icons/filter';

export default function PatientFiltersBar({ filters, setFilters, doctors = [] }) {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
        <Filter size={16} /> Filters
      </div>

      <select
        className="gcp-input"
        style={{ width: '180px', padding: '0.4rem 0.8rem' }}
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="Active">Active</option>
        <option value="New">New</option>
        <option value="Awaiting Follow-Up">Awaiting Follow-Up</option>
        <option value="Inactive">Inactive</option>
      </select>

      <select
        className="gcp-input"
        style={{ width: '200px', padding: '0.4rem 0.8rem' }}
        value={filters.physicianId || ''}
        onChange={(e) => handleChange('physicianId', e.target.value)}
      >
        <option value="">All Physicians</option>
        {doctors.map(d => (
          <option key={d.id} value={d.id}>{d.name || d.displayName || 'Unknown Doctor'}</option>
        ))}
      </select>

      {/* Inputs for Wholeseller / Account Manager which we don't have lists for yet */}
      <input 
        type="text"
        className="gcp-input"
        style={{ width: '180px', padding: '0.4rem 0.8rem' }}
        placeholder="Filter by Wholeseller"
        value={filters.wholeseller || ''}
        onChange={(e) => handleChange('wholeseller', e.target.value)}
      />

      <input 
        type="text"
        className="gcp-input"
        style={{ width: '180px', padding: '0.4rem 0.8rem' }}
        placeholder="Filter by Account Mgr"
        value={filters.accountManager || ''}
        onChange={(e) => handleChange('accountManager', e.target.value)}
      />

      {activeFiltersCount > 0 && (
        <button 
          onClick={handleClear}
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' 
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
