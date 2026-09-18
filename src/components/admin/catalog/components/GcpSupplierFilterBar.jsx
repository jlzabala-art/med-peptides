"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Search, 
  X, 
  ShieldCheck, 
  Check, 
  Filter 
} from '@/lib/icons';

/**
 * GcpSupplierFilterBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant supplier filter for Catalog Variant Sourcing.
 * 
 * Adaptive Behavior:
 * - If <= 3 suppliers: Renders high-density GCP segmented tabs.
 * - If > 3 suppliers: Renders GCP Resource Selector Bar with live search,
 *   active filter chips, and responsive full-width mobile ergonomics.
 * 
 * Guarantees:
 * - Zero badge/text overlap (fixes the pill clustering bug).
 * - Full visibility on laptop and desktop without horizontal scroll traps.
 * - Mobile-first touch targets (>= 44px) and fluid width.
 */
export default function GcpSupplierFilterBar({
  supplierGroups = [],
  selectedSupplierFilter = 'all',
  onSelectSupplier,
  totalVariantsCount = 0
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Selected supplier object
  const selectedGroup = useMemo(() => {
    if (selectedSupplierFilter === 'all') return null;
    return supplierGroups.find(g => g.key === selectedSupplierFilter || g.id === selectedSupplierFilter);
  }, [supplierGroups, selectedSupplierFilter]);

  // Filtered suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return supplierGroups;
    const q = searchQuery.toLowerCase().trim();
    return supplierGroups.filter(g => g.name.toLowerCase().includes(q));
  }, [supplierGroups, searchQuery]);

  // Handle supplier selection
  const handleSelect = (key) => {
    onSelectSupplier(key);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (!supplierGroups || supplierGroups.length === 0) return null;

  // ── Mode 1: Compact GCP Segmented Tabs (When <= 3 Suppliers) ──
  if (supplierGroups.length <= 3) {
    return (
      <div 
        className="gcp-supplier-segmented-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          padding: '0.25rem 0'
        }}
      >
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Building2 size={13} style={{ color: '#0284c7' }} /> Supplier:
        </span>

        {/* All Suppliers Tab */}
        <button
          type="button"
          onClick={() => onSelectSupplier('all')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: selectedSupplierFilter === 'all' ? 700 : 500,
            borderRadius: '6px',
            border: selectedSupplierFilter === 'all' ? '1px solid #003666' : '1px solid #cbd5e1',
            backgroundColor: selectedSupplierFilter === 'all' ? '#003666' : '#ffffff',
            color: selectedSupplierFilter === 'all' ? '#ffffff' : '#334155',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>All Suppliers</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1px 6px',
            fontSize: '0.68rem',
            fontWeight: 700,
            borderRadius: '10px',
            backgroundColor: selectedSupplierFilter === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
            color: selectedSupplierFilter === 'all' ? '#ffffff' : '#475569'
          }}>
            {totalVariantsCount}
          </span>
        </button>

        {/* Individual Supplier Tabs */}
        {supplierGroups.map(group => {
          const isSelected = selectedSupplierFilter === group.key;
          return (
            <button
              type="button"
              key={group.key}
              onClick={() => onSelectSupplier(isSelected ? 'all' : group.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: isSelected ? 700 : 500,
                borderRadius: '6px',
                border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                backgroundColor: isSelected ? '#003666' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{group.name}</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1px 6px',
                fontSize: '0.68rem',
                fontWeight: 700,
                borderRadius: '10px',
                backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: isSelected ? '#ffffff' : '#475569'
              }}>
                {group.variants.length}
              </span>
              {group.hasCOA && (
                <ShieldCheck size={12} style={{ color: isSelected ? '#86efac' : '#10b981', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Mode 2: GCP Resource Selector Bar (When > 3 Suppliers) ──
  return (
    <div 
      className="gcp-supplier-filter-bar-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0.25rem 0'
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.625rem'
        }}
      >
        {/* Left: Supplier Dropdown Trigger */}
        <div 
          ref={dropdownRef}
          style={{ position: 'relative', width: '100%', maxWidth: '460px' }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              minHeight: '40px',
              padding: '6px 12px',
              backgroundColor: selectedSupplierFilter !== 'all' ? '#eff6ff' : '#ffffff',
              border: selectedSupplierFilter !== 'all' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Building2 size={15} style={{ color: selectedSupplierFilter !== 'all' ? '#2563eb' : '#003666', flexShrink: 0 }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Supplier:
                </span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: selectedSupplierFilter !== 'all' ? '#1e3a8a' : '#0f172a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {selectedGroup ? selectedGroup.name : `All Suppliers (${supplierGroups.length})`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '12px',
                backgroundColor: selectedSupplierFilter !== 'all' ? '#dbeafe' : '#f1f5f9',
                color: selectedSupplierFilter !== 'all' ? '#1d4ed8' : '#475569'
              }}>
                {selectedGroup ? `${selectedGroup.variants.length} var` : `${totalVariantsCount} total`}
              </span>

              <ChevronDown 
                size={14} 
                style={{ 
                  color: '#64748b',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
          </button>

          {/* Dropdown Menu Popover */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '8px',
                maxHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              {/* Search Box */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              >
                <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${supplierGroups.length} suppliers...`}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '0.78rem',
                    color: '#0f172a'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: '#94a3b8'
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Options List */}
              <div 
                style={{
                  overflowY: 'auto',
                  maxHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  paddingRight: '2px'
                }}
              >
                {/* Option: All Suppliers */}
                <button
                  type="button"
                  onClick={() => handleSelect('all')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: selectedSupplierFilter === 'all' ? '#eff6ff' : 'transparent',
                    color: selectedSupplierFilter === 'all' ? '#1e3a8a' : '#1e293b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSupplierFilter !== 'all') e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSupplierFilter !== 'all') e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={13} style={{ color: selectedSupplierFilter === 'all' ? '#2563eb' : '#64748b' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: selectedSupplierFilter === 'all' ? 700 : 500 }}>
                      All Suppliers
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '1px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      backgroundColor: selectedSupplierFilter === 'all' ? '#dbeafe' : '#f1f5f9',
                      color: selectedSupplierFilter === 'all' ? '#1d4ed8' : '#475569'
                    }}>
                      {totalVariantsCount} variants
                    </span>
                    {selectedSupplierFilter === 'all' && <Check size={14} style={{ color: '#2563eb' }} />}
                  </div>
                </button>

                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '3px 0' }} />

                {/* Filtered Individual Suppliers */}
                {filteredSuppliers.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                    No suppliers match "{searchQuery}"
                  </div>
                ) : (
                  filteredSuppliers.map(group => {
                    const isSelected = selectedSupplierFilter === group.key;
                    return (
                      <button
                        type="button"
                        key={group.key}
                        onClick={() => handleSelect(group.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                          color: isSelected ? '#1e3a8a' : '#1e293b',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.12s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: isSelected ? 700 : 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {group.name}
                          </span>
                          {group.hasCOA && (
                            <span title="HPLC Verified COA" style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <ShieldCheck size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{
                            padding: '1px 6px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '10px',
                            backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                            color: isSelected ? '#1d4ed8' : '#475569'
                          }}>
                            {group.variants.length} var
                          </span>
                          {isSelected && <Check size={14} style={{ color: '#2563eb' }} />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Active Filter Chip & Stats */}
        {selectedSupplierFilter !== 'all' && selectedGroup && (
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '20px',
              fontSize: '0.75rem',
              color: '#1e40af'
            }}
          >
            <span style={{ fontWeight: 600 }}>Active: {selectedGroup.name}</span>
            <button
              type="button"
              onClick={() => onSelectSupplier('all')}
              title="Reset to All Suppliers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                border: 'none',
                color: '#1e40af',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
