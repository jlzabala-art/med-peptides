import React, { useState, useEffect } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';
import Check from 'lucide-react/dist/esm/icons/check';
import Box from 'lucide-react/dist/esm/icons/box';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { useProductSearch } from '../../../hooks/useProductSearch';

/**
 * UniversalItemPicker
 * 
 * A reusable component that provides a unified item search and selection experience.
 * Supports selecting products and nested variants.
 */
export default function UniversalItemPicker({
  onSelect,
  onClose,
  multiSelect = true,
  filters = '',
  showQuantities = true
}) {
  const { query, setQuery, results, isSearching, loadMore, hasMore } = useProductSearch({
    filters,
    hitsPerPage: 15
  });

  const [selectedItems, setSelectedItems] = useState(new Map()); // Map of id -> { ...item, quantity }
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  const toggleExpand = (e, productId) => {
    e.stopPropagation();
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  const handleToggleSelect = (item, parentItem = null) => {
    // If it has variants and we are not selecting a variant, just expand it
    if (item.variants && item.variants.length > 0 && !parentItem) {
      setExpandedProducts(prev => {
        const newSet = new Set(prev);
        newSet.add(item.id || item.objectID);
        return newSet;
      });
      return;
    }

    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const itemId = item.id || item.objectID;
      
      if (newMap.has(itemId)) {
        newMap.delete(itemId);
      } else {
        if (!multiSelect) {
          newMap.clear();
        }
        
        // Ensure name is properly set for variants
        const displayName = parentItem 
          ? `${parentItem.name} - ${item.name || item.sku}` 
          : item.name || item.displayName || 'Unknown Item';

        newMap.set(itemId, { 
          ...item, 
          name: displayName,
          parentProductId: parentItem ? (parentItem.id || parentItem.objectID) : null,
          quantity: 1 
        });
      }
      return newMap;
    });
  };

  const handleUpdateQuantity = (item, qty) => {
    if (qty < 1) return;
    const itemId = item.id || item.objectID;
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(itemId)) {
        const existing = newMap.get(itemId);
        newMap.set(itemId, { ...existing, quantity: qty });
      }
      return newMap;
    });
  };

  const handleConfirm = () => {
    const itemsArray = Array.from(selectedItems.values());
    if (onSelect) onSelect(itemsArray);
    if (onClose) onClose();
  };

  const renderItemRow = (item, isVariant = false, parentItem = null) => {
    const id = item.id || item.objectID;
    const isSelected = selectedItems.has(id);
    const selItem = selectedItems.get(id);
    const hasVariants = item.variants && item.variants.length > 0;
    const isExpanded = expandedProducts.has(id);

    return (
      <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div 
          onClick={() => handleToggleSelect(item, parentItem)}
          style={{
            backgroundColor: isSelected ? '#f0f9ff' : '#fff',
            border: `1px solid ${isSelected ? '#bae6fd' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: isVariant ? '0.5rem 1rem 0.5rem 2.5rem' : '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: isSelected ? '0 0 0 1px #bae6fd' : 'none',
            borderLeft: isVariant ? '3px solid #cbd5e1' : `1px solid ${isSelected ? '#bae6fd' : '#e2e8f0'}`
          }}
        >
          {/* Expand Icon or Checkbox */}
          {hasVariants && !isVariant ? (
            <div 
              onClick={(e) => toggleExpand(e, id)}
              style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          ) : (
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: `2px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
              backgroundColor: isSelected ? '#0284c7' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isSelected && <Check size={14} color="#fff" />}
            </div>
          )}

          {/* Item Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontWeight: isVariant ? 500 : 600, color: '#0f172a', fontSize: '0.9rem' }}>
              {item.name || item.displayName || item.sku || 'Unknown'}
              {hasVariants && !isVariant && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem', fontWeight: 400 }}>({item.variants.length} variants)</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
              {item.sku && <span>SKU: {item.sku}</span>}
              {!isVariant && item.category && <span>• {item.category}</span>}
              {item.stock !== undefined && (
                <span style={{ color: item.stock > 0 ? '#10b981' : '#ef4444' }}>
                  • Stock: {item.stock}
                </span>
              )}
              {item.price && <span>• €{item.price}</span>}
            </div>
          </div>

          {/* Quantity Controls */}
          {isSelected && showQuantities && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}
            >
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Qty:</span>
              <input
                type="number"
                min="1"
                value={selItem.quantity}
                onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value) || 1)}
                style={{
                  width: '60px',
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          )}
        </div>

        {/* Render Variants if expanded */}
        {hasVariants && isExpanded && !isVariant && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', marginBottom: '8px' }}>
            {item.variants.map((variant) => renderItemRow(variant, true, item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
      {/* Search Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Add Items</h2>
          {onClose && (
            <button 
              onClick={onClose}
              style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', padding: '0.4rem', color: '#475569', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            autoFocus
            type="text"
            placeholder="Search catalog for products or variants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
          {isSearching && (
            <Loader2 className="spinner" size={16} color="#3b82f6" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />
          )}
        </div>
      </div>

      {/* Results List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#fff' }}>
        <style>{`
          @keyframes spin { 100% { transform: translateY(-50%) rotate(360deg); } }
        `}</style>
        
        {results.length === 0 && !isSearching && query.length > 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Box size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No items found matching "{query}"</p>
          </div>
        )}

        {results.length === 0 && !isSearching && query.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <p>Type to search the catalog</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {results.map((item) => renderItemRow(item, false, null))}
        </div>

        {hasMore && (
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <button 
              onClick={loadMore}
              disabled={isSearching}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              {isSearching ? 'Loading...' : 'Load More Results'}
            </button>
          </div>
        )}
      </div>

      {/* Footer / Confirm Actions */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
          {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onClose && (
            <button 
              onClick={onClose}
              style={{ padding: '0.6rem 1.2rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleConfirm}
            disabled={selectedItems.size === 0}
            style={{ 
              padding: '0.6rem 1.2rem', 
              border: 'none', 
              borderRadius: '6px', 
              backgroundColor: selectedItems.size > 0 ? '#3b82f6' : '#94a3b8', 
              color: '#fff', 
              fontWeight: 600, 
              cursor: selectedItems.size > 0 ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Check size={16} /> Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
