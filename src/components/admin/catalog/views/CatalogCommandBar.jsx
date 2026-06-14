import React, { useState } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import Filter from 'lucide-react/dist/esm/icons/filter';
import SortAsc from 'lucide-react/dist/esm/icons/arrow-up-down';
import LayoutTemplate from 'lucide-react/dist/esm/icons/layout-template';
import Save from 'lucide-react/dist/esm/icons/save';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import X from 'lucide-react/dist/esm/icons/x';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Clock from 'lucide-react/dist/esm/icons/clock';

export default function CatalogCommandBar({ filterState }) {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    addFilter,
    removeFilter,
    sortConfig,
    updateSort,
    activeViewId,
    savedViews,
    handleActiveViewChange,
  } = filterState;

  const [showFilters, setShowFilters] = useState(false);
  const [showViews, setShowViews] = useState(false);

  // Quick filters definition
  const QUICK_FILTERS = [
    { id: 'dateRange', value: 'last7days', label: 'Imported Last 7 Days', icon: Clock },
    { id: 'missingData', value: 'true', label: 'Missing Data', icon: AlertTriangle },
    { id: 'noSupplier', value: 'true', label: 'No Supplier', icon: Filter },
    { id: 'regulatoryRisk', value: 'true', label: 'Regulatory Risk', icon: AlertTriangle },
    { id: 'outOfStock', value: 'true', label: 'Out of Stock', icon: Filter },
  ];

  const handleQuickFilterToggle = (qf) => {
    const isActive = filters.some((f) => f.id === qf.id && f.value === qf.value);
    if (isActive) {
      removeFilter(qf.id);
    } else {
      addFilter(qf);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      {/* Top Row: Search and Core Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Views Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowViews(!showViews)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontWeight: 500,
              color: '#0f172a',
              cursor: 'pointer',
            }}
          >
            <LayoutTemplate size={16} color="#64748b" />
            {savedViews.find((v) => v.id === activeViewId)?.name || 'Custom View'}
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showViews && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                minWidth: '200px',
                zIndex: 50,
              }}
            >
              {savedViews.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    handleActiveViewChange(v.id);
                    setShowViews(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    backgroundColor: activeViewId === v.id ? '#f1f5f9' : 'transparent',
                    color: activeViewId === v.id ? '#0f172a' : '#475569',
                  }}
                >
                  {v.name}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #e2e8f0', padding: '4px' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '6px 8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: '#2563eb',
                  }}
                >
                  <Save size={14} /> Save Current View
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search */}
        <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
          <Search
            size={18}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search products, SKUs, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <X
              size={16}
              color="#94a3b8"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
              }}
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: showFilters || filters.length > 0 ? '#eff6ff' : '#ffffff',
              border: `1px solid ${showFilters || filters.length > 0 ? '#bfdbfe' : '#e2e8f0'}`,
              color: showFilters || filters.length > 0 ? '#1d4ed8' : '#475569',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Filter size={16} />
            Filters {filters.length > 0 && `(${filters.length})`}
          </button>

          {/* Simple Sort Dropdown for now */}
          <div style={{ position: 'relative' }}>
            <select
              value={`${sortConfig[0]?.key}-${sortConfig[0]?.direction}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split('-');
                updateSort(key, dir);
              }}
              style={{
                appearance: 'none',
                padding: '8px 32px 8px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: 500,
                outline: 'none',
              }}
            >
              <option value="importDate-desc">Newest Imported</option>
              <option value="importDate-asc">Oldest Imported</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="stock-asc">Stock (Low-High)</option>
              <option value="stock-desc">Stock (High-Low)</option>
            </select>
            <SortAsc
              size={14}
              color="#64748b"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Filters Row */}
      {showFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              marginRight: '4px',
            }}
          >
            Quick Filters:
          </span>
          {QUICK_FILTERS.map((qf) => {
            const isActive = filters.some((f) => f.id === qf.id && f.value === qf.value);
            const Icon = qf.icon;
            return (
              <button
                key={qf.id}
                onClick={() => handleQuickFilterToggle(qf)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: `1px solid ${isActive ? '#bfdbfe' : '#e2e8f0'}`,
                  backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                  color: isActive ? '#1d4ed8' : '#475569',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={12} /> {qf.label}
              </button>
            );
          })}
          {filters.length > 0 && (
            <button
              onClick={() => filterState.setFilters([])}
              style={{
                border: 'none',
                background: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginLeft: 'auto',
              }}
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
