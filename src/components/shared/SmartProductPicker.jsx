"use client";

import React, { useState, useMemo } from 'react';
import { Search, Package, Plus, Check } from '@/lib/icons';
import { useProducts } from '../../hooks/admin/useProducts';

/**
 * SmartProductPicker
 * A reusable, highly optimized component to select SKUs from the catalog.
 * It uses the cached React Query `useProducts` hook, so it has zero network cost
 * after the initial catalog load.
 * Mobile & Laptop compatible.
 */
export default function SmartProductPicker({ 
  onSelect, 
  selectedProductIds = [], 
  multiSelect = false,
  placeholder = "Search for a product or SKU..."
}) {
  const { products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  // Local filtering for lightning-fast search
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products.slice(0, 10); // Show top 10 if no search
    
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    ).slice(0, 20); // Limit to 20 for performance
  }, [products, searchTerm]);

  return (
    <div className="w-full flex flex-col" style={{ gap: '1rem' }}>
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          style={{ fontSize: '16px' }} // 16px prevents iOS zoom on focus (mobile friendly)
        />
      </div>

      {/* Results List */}
      <div className="flex flex-col border border-gray-100 rounded-lg max-h-[300px] overflow-y-auto bg-white">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading catalog from cache...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No products found matching "{searchTerm}"
          </div>
        ) : (
          filteredProducts.map(product => {
            const isSelected = selectedProductIds.includes(product.id);
            return (
              <div 
                key={product.id}
                onClick={() => onSelect(product)}
                className={`flex items-center justify-between p-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Package size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-1 rounded">{product.sku || 'N/A'}</span>
                      <span>•</span>
                      <span>${product.proVialPrice || product.guestVialPrice || 0}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className={`p-1.5 rounded-full ${isSelected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600'}`}
                  aria-label={isSelected ? "Selected" : "Select"}
                >
                  {isSelected ? <Check size={16} /> : <Plus size={16} />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
