import Search from "lucide-react/dist/esm/icons/search";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Filter from "lucide-react/dist/esm/icons/filter";
import X from "lucide-react/dist/esm/icons/x";
import Grid from "lucide-react/dist/esm/icons/grid";
import Brain from "lucide-react/dist/esm/icons/brain";
import React, { useState, useEffect } from 'react';








export default function CatalogSmartSearch({ 
  searchQuery, 
  onSearchChange,
  activeCategories = [],
  categories = [],
  onCategoryChange,
  onOpenAdvancedFilters,
  activeFilters = [], 
  onRemoveFilter,
  onClearAllFilters,
  isMobile,
  products = [],
  activeWorkspace = 'products',
  advancedFilters = {},
  onUpdateAdvancedFilter
}) {
  const placeholders = [
    "Ask Atlas: 'Compare suppliers for BPC-157'...",
    "Ask Atlas: 'Show products with missing COA'...",
    "Ask Atlas: 'Find top-rated TB-500 vendors'...",
    "Ask Atlas: 'Filter by purity > 99%'..."
  ];

  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      marginBottom: '1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(248, 250, 252, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {/* Row 1: Search Input */}
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '24px',
          padding: '0.6rem 1.2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
          transition: 'all 0.3s ease',
        }}>
          <Search size={20} color="var(--text-muted, #64748b)" style={{ marginRight: '8px' }} />
          <input 
            type="text"
            placeholder={placeholders[placeholderIdx]}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '0.2rem 0.5rem',
              outline: 'none',
              fontSize: '0.95rem',
              color: 'var(--text-main, #1e293b)',
              width: '100%',
              fontWeight: 500
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}
            >
              <X size={16} color="var(--text-muted, #64748b)" />
            </button>
          )}
        </div>

        {/* Row 2: Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbars">
          <style>{`.hide-scrollbars::-webkit-scrollbar { display: none; }`}</style>
          <button
            onClick={() => {
              // Trigger AI Semantic Search (either by modifying searchQuery or emitting event)
              onSearchChange("Ask Atlas: ");
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--color-primary, #6366f1)',
              boxShadow: '0 2px 10px rgba(99,102,241, 0.05)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <Sparkles size={18} color="var(--color-primary, #6366f1)" /> 
            AI Search
          </button>

          <button
            onClick={onOpenAdvancedFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--text-main, #1e293b)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <Filter size={18} color="var(--color-primary, #6366f1)" /> 
            Filters
          </button>
        </div>
      </div>

      {/* Quick Dropdown Filters removed as requested */}

      {/* Selected Categories, Supplier & Active Filter Chips */}
      {(activeCategories.length > 0 || (activeFilters && activeFilters.length > 0) || (activeWorkspace === 'products' && advancedFilters?.products?.supplier && advancedFilters.products.supplier !== 'All Suppliers')) && (
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {activeWorkspace === 'products' && activeCategories.map(cat => (
            <div key={cat} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              fontSize: '0.8rem',
              color: 'var(--color-primary, #6366f1)',
              fontWeight: 600,
            }}>
              {cat}
              <button 
                onClick={() => onCategoryChange(activeCategories.filter(c => c !== cat))}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  padding: '2px', 
                  color: 'inherit'
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {activeWorkspace === 'products' && advancedFilters?.products?.supplier && advancedFilters.products.supplier !== 'All Suppliers' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-main, #1e293b)',
              fontWeight: 500,
            }}>
              Supplier: {advancedFilters.products.supplier}
              <button 
                onClick={() => onUpdateAdvancedFilter('products', 'supplier', 'All Suppliers')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: 'inherit' }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {activeFilters && activeFilters.map(filter => (
            <div key={filter.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-main, #1e293b)',
              fontWeight: 500,
            }}>
              {filter.label}
              <button 
                onClick={() => onRemoveFilter && onRemoveFilter(filter.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: 'inherit' }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => {
              if (onClearAllFilters) onClearAllFilters();
              if (activeWorkspace === 'products') {
                onCategoryChange([]);
                if (advancedFilters?.products?.supplier) {
                  onUpdateAdvancedFilter('products', 'supplier', 'All Suppliers');
                }
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: 'var(--text-muted, #64748b)',
              fontWeight: 500,
              marginLeft: '4px',
              padding: '4px 8px',
              borderRadius: '12px'
            }}
          >
            Clear all
          </button>
        </div>
      )}

    </div>
  );
}
