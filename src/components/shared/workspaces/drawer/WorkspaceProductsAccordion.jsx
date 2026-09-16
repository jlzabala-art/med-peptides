"use client";

import React, { useState } from 'react';
import {
  Package,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  X,
  Plus,
  FileText,
  Trash2,
  Droplet,
  Layers,
  Search,
  Check
} from '@/lib/icons';
import notifier from '@/services/NotificationService';

export default function WorkspaceProductsAccordion({
  isExpanded,
  onToggleExpand,
  items,
  activeWs,
  subtotalSaleAmount,
  getItemUnitPrice,
  onUpdateItemQuantity,
  onUpdateItemPrice,
  onUpdateItemFormat,
  onRemoveItem,
  onAddBacteriostaticWater,
  protocols = [],
  availableProducts = [],
  savedKits = [],
  onLoadProtocol,
  onAddProduct,
  onLoadKit,
  onDeleteKit,
  searchingCatalog,
  onSearchCatalogFast,
}) {
  const [expandedItemIds, setExpandedItemIds] = useState({});
  const [activePicker, setActivePicker] = useState(null); // 'products' | 'protocols' | 'kits' | null
  const [pickerSearch, setPickerSearch] = useState('');

  const toggleItemExpanded = (itemId) => {
    setExpandedItemIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Defensive guards: use Array.isArray() instead of `|| []`
  // because `|| []` only activates for falsy values — a truthy non-array object
  // (e.g. a Firestore snapshot or paginated hook result) bypasses it and crashes .filter()
  const filteredProtocols = (Array.isArray(protocols) ? protocols : []).filter(p => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return (p.name || p.title || '').toLowerCase().includes(q) ||
      (p.primary_goal || p.category || '').toLowerCase().includes(q);
  });

  const filteredProducts = (Array.isArray(availableProducts) ? availableProducts : []).filter(p => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return (p.canonicalName || p.name || '').toLowerCase().includes(q) ||
      (p.sku || p.category || '').toLowerCase().includes(q);
  });

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Accordion Header Bar */}
      <div
        onClick={onToggleExpand}
        style={{
          padding: '0.85rem 1.1rem',
          backgroundColor: '#ffffff',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded ? <ChevronDown size={18} style={{ color: '#003666' }} /> : <ChevronRight size={18} style={{ color: '#64748b' }} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={17} /> Staged Products
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '99px',
              backgroundColor: items.length > 0 ? '#003666' : '#e2e8f0',
              color: items.length > 0 ? '#ffffff' : '#475569',
              fontWeight: 800,
            }}
          >
            {items.length}
          </span>
        </div>

        {items.length > 0 && (
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
            ${subtotalSaleAmount.toFixed(2)}
          </span>
        )}
      </div>

      {/* Accordion Body Content */}
      {isExpanded && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Card 1: Load Clinical Protocol */}
              <div
                onClick={() => {
                  setActivePicker(activePicker === 'protocols' ? null : 'protocols');
                  setPickerSearch('');
                }}
                style={{
                  backgroundColor: activePicker === 'protocols' ? '#e0f2fe' : '#ffffff',
                  border: `1.5px solid ${activePicker === 'protocols' ? '#0284c7' : '#bfdbfe'}`,
                  borderRadius: '12px',
                  padding: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)',
                  touchAction: 'manipulation',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#003666', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={22} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                      Load Clinical Protocol
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#0284c7', fontWeight: 600 }}>
                      Import multi-compound treatment regimens
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Select →
                </button>
              </div>

              {/* Card 2: Add from Master Catalog */}
              <div
                onClick={() => {
                  setActivePicker(activePicker === 'products' ? null : 'products');
                  setPickerSearch('');
                }}
                style={{
                  backgroundColor: activePicker === 'products' ? '#dcfce7' : '#ffffff',
                  border: `1.5px solid ${activePicker === 'products' ? '#16a34a' : '#bbf7d0'}`,
                  borderRadius: '12px',
                  padding: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.05)',
                  touchAction: 'manipulation',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={22} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#14532d' }}>
                      Add from Master Catalog
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#16a34a', fontWeight: 600 }}>
                      Search individual peptides, vials & dosages
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Browse →
                </button>
              </div>

              {/* Card 3: Saved Kits (if available) */}
              {(savedKits || []).length > 0 && (
                <div
                  onClick={() => {
                    setActivePicker(activePicker === 'kits' ? null : 'kits');
                    setPickerSearch('');
                  }}
                  style={{
                    backgroundColor: activePicker === 'kits' ? '#fdf4ff' : '#ffffff',
                    border: `1.5px solid ${activePicker === 'kits' ? '#a855f7' : '#e9d5ff'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    touchAction: 'manipulation',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Layers size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#581c87' }}>
                        Load Saved Kit Template ({savedKits.length})
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#9333ea', fontWeight: 600 }}>
                        Quick-load custom composite kits
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      backgroundColor: '#9333ea',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '7px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Kits →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Quick Action Strip above items */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setActivePicker(activePicker === 'products' ? null : 'products')}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '7px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      touchAction: 'manipulation',
                    }}
                  >
                    <Plus size={13} /> Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePicker(activePicker === 'protocols' ? null : 'protocols')}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '7px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      touchAction: 'manipulation',
                    }}
                  >
                    <FileText size={13} /> Load Protocol
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onAddBacteriostaticWater}
                  style={{
                    padding: '5px 9px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '7px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#1d4ed8',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Add Bacteriostatic Water 30ml companion diluent"
                >
                  <Droplet size={12} /> + Bac Water 30ml
                </button>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {items.map((it, idx) => {
                  const unitRate = getItemUnitPrice(it);
                  const lineTotal = (it.quantity || 1) * unitRate;
                  const isItemExpanded = !!expandedItemIds[it.id];

                  return (
                    <div
                      key={it.id || idx}
                      style={{
                        backgroundColor: '#ffffff',
                        border: `1.5px solid ${isItemExpanded ? '#003666' : '#e2e8f0'}`,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Item Header */}
                      <div
                        onClick={() => toggleItemExpanded(it.id)}
                        style={{
                          padding: '0.75rem 0.85rem',
                          backgroundColor: isItemExpanded ? '#f0f7ff' : '#ffffff',
                          borderBottom: isItemExpanded ? '1px solid #bfdbfe' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <button
                            type="button"
                            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: isItemExpanded ? '#003666' : '#64748b', display: 'flex' }}
                          >
                            {isItemExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.25, wordBreak: 'break-word' }}>
                              {it.canonicalName || it.name || it.displayName || 'Product Item'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>{it.dosage || 'Standard'}</span>
                              <span>•</span>
                              <span style={{ fontWeight: 600, color: '#0284c7' }}>{it.format || 'Vial'}</span>
                              <span style={{ margin: '0 2px', color: '#cbd5e1' }}>|</span>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  backgroundColor: unitRate > 0 ? '#f0f9ff' : '#fffbeb',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  border: `1px solid ${unitRate > 0 ? '#bae6fd' : '#fde68a'}`,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: unitRate > 0 ? '#0284c7' : '#d97706' }}>$</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={unitRate > 0 ? unitRate.toString() : ''}
                                  placeholder="0.00"
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (/^\d*\.?\d*$/.test(raw)) {
                                      const parsed = parseFloat(raw) || 0;
                                      onUpdateItemPrice(it.id, parsed);
                                    }
                                  }}
                                  style={{
                                    width: '60px',
                                    fontSize: '0.76rem',
                                    fontWeight: 800,
                                    color: unitRate > 0 ? '#0369a1' : '#b45309',
                                    backgroundColor: '#ffffff',
                                    border: `1px solid ${unitRate > 0 ? '#38bdf8' : '#f59e0b'}`,
                                    borderRadius: '4px',
                                    padding: '2px 4px',
                                    outline: 'none',
                                    textAlign: 'right',
                                  }}
                                />
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: unitRate > 0 ? '#0284c7' : '#d97706' }}>/u</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Controls: Quantity Buttons with Touch Target >= 40px */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
                            <button
                              type="button"
                              onClick={() => onUpdateItemQuantity(it.id, Math.max(1, (it.quantity || 1) - 1))}
                              style={{
                                width: '38px',
                                height: '38px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                background: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 900,
                                fontSize: '1rem',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                touchAction: 'manipulation',
                              }}
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span style={{ fontSize: '0.86rem', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
                              {it.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateItemQuantity(it.id, (it.quantity || 1) + 1)}
                              style={{
                                width: '38px',
                                height: '38px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                background: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 900,
                                fontSize: '1rem',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                touchAction: 'manipulation',
                              }}
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#003666', minWidth: '55px', textAlign: 'right' }}>
                            ${lineTotal.toFixed(2)}
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(it.id)}
                            style={{
                              width: '36px',
                              height: '36px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              cursor: 'pointer',
                              borderRadius: '7px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              touchAction: 'manipulation',
                            }}
                            title="Remove item"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details Body */}
                      {isItemExpanded && (
                        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#ffffff' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.74rem' }}>
                            <div>
                              <span style={{ color: '#64748b', fontWeight: 600 }}>Dose & Format:</span>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{it.dosage || 'Standard'} • {it.format || 'Vial'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontWeight: 600 }}>SKU Code:</span>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{it.sku || 'N/A'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontWeight: 600 }}>Category:</span>
                              <div style={{ fontWeight: 700, color: '#0369a1' }}>{it.category || 'Biologics / Peptides'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontWeight: 600 }}>Supplier:</span>
                              <div style={{ fontWeight: 700, color: '#475569' }}>{it.supplierName || 'Partner Compounder'}</div>
                            </div>
                          </div>

                          {/* Quick Format Switcher */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Quick Format Switcher:</span>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {['Vial', 'Single Cartridge', 'Double Cartridge', 'Sublingual', 'Oral Drops'].map(fmtOption => {
                                const isCurrent = (it.format || 'Vial').toLowerCase() === fmtOption.toLowerCase();
                                return (
                                  <button
                                    key={fmtOption}
                                    type="button"
                                    onClick={() => onUpdateItemFormat(it.id, fmtOption)}
                                    style={{
                                      padding: '4px 9px',
                                      borderRadius: '6px',
                                      border: `1.5px solid ${isCurrent ? '#003666' : '#cbd5e1'}`,
                                      backgroundColor: isCurrent ? '#003666' : '#ffffff',
                                      color: isCurrent ? '#ffffff' : '#334155',
                                      fontSize: '0.72rem',
                                      fontWeight: isCurrent ? 800 : 600,
                                      cursor: 'pointer',
                                      touchAction: 'manipulation',
                                    }}
                                  >
                                    {fmtOption}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inline Picker Overlay for Protocols */}
          {activePicker === 'protocols' && (
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #0284c7', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Clinical Protocol</span>
                <button type="button" onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
              </div>
              <input
                type="text"
                placeholder="Search protocols by name or goal..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
              />
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {filteredProtocols.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onLoadProtocol(p);
                      setActivePicker(null);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '7px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      touchAction: 'manipulation',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#003666' }}>{p.name || p.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.primary_goal || 'Clinical Regimen'} • {p.duration_weeks || 8} wks</div>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>+ Select</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline Picker Overlay for Master Catalog */}
          {activePicker === 'products' && (
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #16a34a', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Product from Catalog</span>
                <button type="button" onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
              </div>
              <input
                type="text"
                placeholder="Search by peptide name, SKU, or category..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
              />
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {filteredProducts.slice(0, 30).map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onAddProduct(prod);
                      setActivePicker(null);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '7px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      touchAction: 'manipulation',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>{prod.canonicalName || prod.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{prod.dosage || prod.unit || 'Standard'} • {prod.category || 'Peptides'}</div>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>+ Add</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline Picker Overlay for Saved Kits */}
          {activePicker === 'kits' && (
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Reusable Kit</span>
                <button type="button" onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(savedKits || []).map(kit => (
                  <div
                    key={kit.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '7px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{kit.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{(kit.items || []).length} items</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadKit(kit.id);
                          setActivePicker(null);
                        }}
                        style={{ padding: '5px 10px', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        + Load
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteKit(kit.id)}
                        style={{ padding: '5px 7px', backgroundColor: '#fff5f5', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
