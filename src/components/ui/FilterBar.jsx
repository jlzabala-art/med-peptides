import React from 'react';
import { X, Filter } from 'lucide-react';

export default function FilterBar({ filters = [], onRemoveFilter, onClearAll, children }) {
  if (filters.length === 0 && !children) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: 'var(--color-bg-surface, #ffffff)',
      borderBottom: '1px solid var(--border, #dadce0)',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted, #5f6368)' }}>
        <Filter size={16} />
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Filters:</span>
      </div>
      
      {/* Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
        {filters.map((filter, idx) => (
          <div
            key={`${filter.type}-${idx}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px 4px 12px',
              backgroundColor: 'var(--primary-light, #e8f0fe)',
              color: 'var(--primary, #1a73e8)',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: 500,
              border: '1px solid rgba(26,115,232,0.2)',
            }}
          >
            <span>{filter.label}: {filter.value}</span>
            <button
              onClick={() => onRemoveFilter(filter)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: 'var(--primary, #1a73e8)',
                borderRadius: '50%',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(26,115,232,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {filters.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #5f6368)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 8px',
              textDecoration: 'underline',
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Custom Filter Controls (Selects, etc) */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}
