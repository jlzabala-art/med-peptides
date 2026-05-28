import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function AppFilterBar({ 
  searchQuery, 
  onSearchChange, 
  searchPlaceholder = "Search...",
  primaryFilters = [], // { id, label, active }
  onPrimaryFilterChange,
  secondaryFilters = [], // { id, label, active }
  onSecondaryFilterChange,
  dateRange = null, // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
  onDateRangeChange, // (dateRange) => void
  secondaryActions
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
      
      {/* Search Row */}
      {onSearchChange && (
        <div style={{ display: 'flex', flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              height: 'var(--search-height)',
              padding: '0 16px 0 40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-surface)',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 1px var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      )}
      
      {/* Filters & Actions Container */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>

      {/* Primary Filters (Segmented Control style) */}
      {primaryFilters.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {primaryFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onPrimaryFilterChange && onPrimaryFilterChange(filter.id)}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--filter-chip-radius)',
                border: `1px solid ${filter.active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: filter.active ? 'var(--color-primary-light)' : 'var(--color-bg-surface)',
                color: filter.active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: filter.active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Date Range Filter */}
      {dateRange && onDateRangeChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2px 8px', backgroundColor: 'var(--color-bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>From:</span>
            <input 
              type="date" 
              value={dateRange.start || ''} 
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              style={{ border: 'none', background: 'transparent', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer' }}
            />
          </div>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>To:</span>
            <input 
              type="date" 
              value={dateRange.end || ''} 
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              style={{ border: 'none', background: 'transparent', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* Secondary Filters (Muted chip style) */}
      {secondaryFilters.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--color-text-tertiary)', marginRight: '4px' }} />
          {secondaryFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onSecondaryFilterChange && onSecondaryFilterChange(filter.id)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: filter.active ? 'var(--color-bg-selected)' : 'var(--color-bg-hover)',
                color: filter.active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: '12px',
                fontWeight: filter.active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {secondaryActions && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
          {secondaryActions}
        </div>
      )}

      </div>
      
    </div>
  );
}
