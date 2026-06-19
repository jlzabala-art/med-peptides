import React from 'react';
import X from 'lucide-react/dist/esm/icons/x';

export default function ActiveFilterChips({
  activeCategories,
  activeFiltersVisuals,
  activeWorkspace,
  advancedFilters,
  setActiveCategories,
  handleRemoveFilter,
  handleClearAllFilters
}) {
  const hasActiveFilters = 
    activeCategories.length > 0 ||
    activeFiltersVisuals.length > 0 ||
    (activeWorkspace === 'products' && advancedFilters?.products?.supplier !== 'All Suppliers');

  if (!hasActiveFilters) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {activeWorkspace === 'products' &&
        activeCategories.map((cat) => (
          <div
            key={cat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: 'rgba(99,102,241,0.08)',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            {cat}
            <X
              size={12}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveCategories(activeCategories.filter((c) => c !== cat))}
            />
          </div>
        ))}
      
      {activeFiltersVisuals.map((filter) => (
        <div
          key={filter.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'var(--color-bg-surface, #ffffff)',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            fontSize: '0.85rem',
            color: 'var(--text-main, #0f172a)',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          {filter.label}
          <X
            size={14}
            style={{ cursor: 'pointer', color: '#64748b' }}
            onClick={() => handleRemoveFilter(filter.id)}
          />
        </div>
      ))}
      
      <button
        onClick={handleClearAllFilters}
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          padding: '4px 12px',
          borderRadius: '16px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: '#ef4444',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <X size={14} /> Clear all
      </button>
    </div>
  );
}
