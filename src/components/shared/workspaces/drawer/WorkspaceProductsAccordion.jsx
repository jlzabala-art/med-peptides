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
  Check,
  Copy
} from '@/lib/icons';
import notifier from '@/services/NotificationService';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

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
  isDoctor = false,
}) {
  const [expandedItemIds, setExpandedItemIds] = useState({});
  const [activePicker, setActivePicker] = useState(null); // 'products' | 'protocols' | 'kits' | null
  const [pickerSearch, setPickerSearch] = useState('');
  
  // High-capacity visualization state
  const [viewMode, setViewMode] = useState(items.length >= 6 ? 'compact' : 'cards'); // 'compact' | 'cards'
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [transferItemId, setTransferItemId] = useState(null);

  const workspacesMap = useWorkspaceStore(s => s.workspaces);
  const moveItemBetweenWorkspaces = useWorkspaceStore(s => s.moveItemBetweenWorkspaces);
  const copyItemBetweenWorkspaces = useWorkspaceStore(s => s.copyItemBetweenWorkspaces);

  const toggleItemExpanded = (itemId) => {
    setExpandedItemIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleGroupCollapse = (groupKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const renderTransferPopover = (it) => {
    if (transferItemId !== it.id) return null;
    const otherWorkspaces = Object.values(workspacesMap || {}).filter(w => w.id !== activeWs?.id);

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          right: '30px',
          top: '28px',
          backgroundColor: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: '8px',
          padding: '8px',
          zIndex: 50,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          minWidth: '220px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>Transfer Compound</span>
          <button
            type="button"
            onClick={() => setTransferItemId(null)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
          >
            <X size={12} />
          </button>
        </div>

        <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {otherWorkspaces.length === 0 ? (
            <span style={{ fontSize: '0.7rem', color: '#64748b', padding: '4px 0' }}>No other active workspaces</span>
          ) : (
            otherWorkspaces.map(ws => (
              <div
                key={ws.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.72rem',
                }}
              >
                <span style={{ fontWeight: 700, color: '#003666', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ws.name}
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      moveItemBetweenWorkspaces(it.id, activeWs?.id, ws.id);
                      setTransferItemId(null);
                      notifier.info(`Moved to ${ws.name}`);
                    }}
                    style={{ padding: '2px 5px', fontSize: '0.66rem', fontWeight: 800, backgroundColor: '#003666', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    title="Move item to workspace"
                  >
                    Move
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      copyItemBetweenWorkspaces(it.id, activeWs?.id, ws.id);
                      setTransferItemId(null);
                      notifier.info(`Copied to ${ws.name}`);
                    }}
                    style={{ padding: '2px 5px', fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#0284c7', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}
                    title="Copy item to workspace"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            moveItemBetweenWorkspaces(it.id, activeWs?.id, 'new');
            setTransferItemId(null);
            notifier.info(`Moved to new workspace`);
          }}
          style={{
            padding: '5px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '5px',
            fontSize: '0.7rem',
            fontWeight: 800,
            color: '#15803d',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          + Move to New Workspace
        </button>
      </div>
    );
  };

  // Defensive guards for pickers
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

  // Filter items in workspace by live search query
  const displayedItems = (items || []).filter(it => {
    if (!workspaceSearch.trim()) return true;
    const q = workspaceSearch.toLowerCase();
    const name = (it.canonicalName || it.name || it.displayName || '').toLowerCase();
    const sku = (it.sku || '').toLowerCase();
    const format = (it.format || '').toLowerCase();
    const dosage = (it.dosage || '').toLowerCase();
    const category = (it.category || '').toLowerCase();
    return name.includes(q) || sku.includes(q) || format.includes(q) || dosage.includes(q) || category.includes(q);
  });

  // Helper to categorize item
  const getItemCategoryKey = (it) => {
    const fmt = (it.format || '').toLowerCase();
    const cat = (it.category || '').toLowerCase();
    const name = (it.canonicalName || it.name || '').toLowerCase();

    if (name.includes('bacteriostatic') || name.includes('water') || name.includes('saline') || cat.includes('diluent')) {
      return 'diluents';
    }
    if (fmt.includes('cartridge') || fmt.includes('pen')) {
      return 'cartridges';
    }
    if (fmt.includes('sublingual') || fmt.includes('drop') || fmt.includes('capsule') || fmt.includes('oral') || fmt.includes('nasal')) {
      return 'oral_topical';
    }
    return 'injectables';
  };

  const categoryMeta = {
    injectables: { label: '💉 Injectables & Lyophilized Vials', color: '#0284c7' },
    cartridges: { label: '🧪 Pre-filled Cartridges & Pens', color: '#7c3aed' },
    oral_topical: { label: '💧 Sublingual & Oral Formats', color: '#059669' },
    diluents: { label: '🌊 Reconstitution & Diluents', color: '#0891b2' },
  };

  // Grouped items mapping
  const groupedItems = displayedItems.reduce((acc, it) => {
    const key = getItemCategoryKey(it);
    if (!acc[key]) acc[key] = [];
    acc[key].push(it);
    return acc;
  }, {});

  // Render a compact row (~34px)
  const renderCompactRow = (it, idx) => {
    const unitRate = getItemUnitPrice(it);
    const lineTotal = (it.quantity || 1) * unitRate;

    return (
      <div
        key={it.id || idx}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto auto',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          minHeight: '34px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          fontSize: '0.78rem',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
      >
        {/* Col 1: Name, dosage, format */}
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span
            style={{
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px',
            }}
            title={it.canonicalName || it.name || 'Product'}
          >
            {it.canonicalName || it.name || 'Product'}
          </span>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: '#0284c7',
              backgroundColor: '#f0f9ff',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid #bae6fd',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {it.dosage || 'Std'}
          </span>
          <span
            style={{
              fontSize: '0.64rem',
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              padding: '1px 5px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {it.format || 'Vial'}
          </span>
        </div>

        {/* Col 2: Quantity Controls */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '6px', padding: '1px' }}>
          <button
            type="button"
            onClick={() => onUpdateItemQuantity(it.id, Math.max(1, (it.quantity || 1) - 1))}
            style={{
              width: '24px',
              height: '24px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: '#ffffff',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title="Decrease"
          >
            -
          </button>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>
            {it.quantity || 1}
          </span>
          <button
            type="button"
            onClick={() => onUpdateItemQuantity(it.id, (it.quantity || 1) + 1)}
            style={{
              width: '24px',
              height: '24px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: '#ffffff',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title="Increase"
          >
            +
          </button>
        </div>

        {/* Col 3: Price / Clinic Price */}
        <div style={{ textAlign: 'right', minWidth: '55px' }}>
          {isDoctor ? (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#0d9488',
                backgroundColor: '#f0fdfa',
                padding: '2px 5px',
                borderRadius: '5px',
                border: '1px solid #99f6e4',
                whiteSpace: 'nowrap',
              }}
              title="Clinic Prescribing Price"
            >
              ${unitRate.toFixed(2)}
            </span>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '1px 3px',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>$</span>
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
                  width: '44px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'right',
                }}
              />
            </div>
          )}
        </div>

        {/* Col 4: Line total */}
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003666', minWidth: '52px', textAlign: 'right' }}>
          ${lineTotal.toFixed(2)}
        </div>

        {/* Col 5: Transfer & Remove item */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTransferItemId(transferItemId === it.id ? null : it.id);
            }}
            style={{
              width: '24px',
              height: '24px',
              background: transferItemId === it.id ? '#eff6ff' : 'none',
              border: `1px solid ${transferItemId === it.id ? '#bfdbfe' : 'transparent'}`,
              color: transferItemId === it.id ? '#0284c7' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              padding: 0,
            }}
            title="Transfer compound to another workspace"
          >
            <Copy size={13} />
          </button>
          {renderTransferPopover(it)}

          <button
            type="button"
            onClick={() => onRemoveItem(it.id)}
            style={{
              width: '24px',
              height: '24px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Remove item"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

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
          {isExpanded ? <ChevronDown size={18} style={{ color: isDoctor ? '#0d9488' : '#003666' }} /> : <ChevronRight size={18} style={{ color: '#64748b' }} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isDoctor ? '#0d9488' : '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={17} /> Staged Products
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '99px',
              backgroundColor: items.length > 0 ? (isDoctor ? '#0d9488' : '#003666') : '#e2e8f0',
              color: items.length > 0 ? '#ffffff' : '#475569',
              fontWeight: 800,
            }}
          >
            {items.length}
          </span>
          {items.length >= 10 && (
            <span style={{ fontSize: '0.68rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
              High-Volume
            </span>
          )}
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
              {/* Toolbar & Action Ribbon */}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* View Mode Toggle (Compact Table vs Cards) */}
                  <div style={{ display: 'inline-flex', backgroundColor: '#e2e8f0', borderRadius: '7px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('compact')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: viewMode === 'compact' ? '#ffffff' : 'transparent',
                        color: viewMode === 'compact' ? '#003666' : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: viewMode === 'compact' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      }}
                      title="Compact Table View (~34px rows)"
                    >
                      ☰ Compact
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: viewMode === 'cards' ? '#ffffff' : 'transparent',
                        color: viewMode === 'cards' ? '#003666' : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      }}
                      title="Cards View"
                    >
                      🔲 Cards
                    </button>
                  </div>

                  {/* Grouping switch */}
                  <button
                    type="button"
                    onClick={() => setGroupByCategory(prev => !prev)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: groupByCategory ? '#eff6ff' : '#ffffff',
                      border: `1px solid ${groupByCategory ? '#bfdbfe' : '#cbd5e1'}`,
                      borderRadius: '7px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: groupByCategory ? '#0284c7' : '#64748b',
                      cursor: 'pointer',
                    }}
                    title="Group items by clinical route / category"
                  >
                    {groupByCategory ? '✓ Grouped' : 'Group'}
                  </button>

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
                    <Droplet size={12} /> + Bac Water
                  </button>
                </div>
              </div>

              {/* High-Capacity Search Filter (Visible if 5 or more items) */}
              {items.length >= 5 && (
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    placeholder={`Filter ${items.length} staged compounds...`}
                    value={workspaceSearch}
                    onChange={(e) => setWorkspaceSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 28px 6px 28px',
                      borderRadius: '7px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.76rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  {workspaceSearch && (
                    <button
                      type="button"
                      onClick={() => setWorkspaceSearch('')}
                      style={{
                        position: 'absolute',
                        right: '7px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Items Display: Grouped or Flat */}
              {displayedItems.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    No products matching &ldquo;{workspaceSearch}&rdquo;
                  </p>
                </div>
              ) : viewMode === 'compact' ? (
                /* --- COMPACT TABLE VIEW (~34px rows) --- */
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Table Column Headers */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto auto',
                      gap: '8px',
                      padding: '5px 10px',
                      backgroundColor: '#f1f5f9',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <span>Product & Dosage</span>
                    <span style={{ textAlign: 'center', minWidth: '70px' }}>Qty</span>
                    <span style={{ textAlign: 'right', minWidth: '55px' }}>{isDoctor ? 'Clinic Price' : 'Price'}</span>
                    <span style={{ textAlign: 'right', minWidth: '52px' }}>Total</span>
                    <span style={{ width: '24px' }}></span>
                  </div>

                  {/* Body Content */}
                  {groupByCategory ? (
                    Object.entries(groupedItems).map(([grpKey, grpList]) => {
                      if (!grpList || grpList.length === 0) return null;
                      const isCollapsed = !!collapsedGroups[grpKey];
                      const meta = categoryMeta[grpKey] || { label: grpKey, color: '#0f172a' };

                      return (
                        <div key={grpKey} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <div
                            onClick={() => toggleGroupCollapse(grpKey)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#f8fafc',
                              borderBottom: isCollapsed ? 'none' : '1px solid #f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: meta.color,
                            }}
                          >
                            <span>{meta.label} ({grpList.length})</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                              {isCollapsed ? '▼' : '▲'}
                            </span>
                          </div>
                          {!isCollapsed && grpList.map((it, idx) => renderCompactRow(it, idx))}
                        </div>
                      );
                    })
                  ) : (
                    displayedItems.map((it, idx) => renderCompactRow(it, idx))
                  )}
                </div>
              ) : (
                /* --- CARDS VIEW (Detailed Cards) --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {displayedItems.map((it, idx) => {
                    const unitRate = getItemUnitPrice(it);
                    const lineTotal = (it.quantity || 1) * unitRate;
                    const isItemExpanded = !!expandedItemIds[it.id];

                    return (
                      <div
                        key={it.id || idx}
                        style={{
                          backgroundColor: '#ffffff',
                          border: `1.5px solid ${isItemExpanded ? (isDoctor ? '#0d9488' : '#003666') : '#e2e8f0'}`,
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
                            backgroundColor: isItemExpanded ? (isDoctor ? '#f0fdfa' : '#f0f7ff') : '#ffffff',
                            borderBottom: isItemExpanded ? `1px solid ${isDoctor ? '#99f6e4' : '#bfdbfe'}` : 'none',
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
                              style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: isItemExpanded ? (isDoctor ? '#0d9488' : '#003666') : '#64748b', display: 'flex' }}
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
                                {isDoctor ? (
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      color: '#0d9488',
                                      backgroundColor: '#f0fdfa',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      border: '1px solid #99f6e4',
                                    }}
                                    title="Clinic Prescribing Price"
                                  >
                                    ${unitRate.toFixed(2)} / u (Clinic Price)
                                  </span>
                                ) : (
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
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Controls: Quantity Buttons with Touch Target >= 38px */}
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

                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: isDoctor ? '#0d9488' : '#003666', minWidth: '55px', textAlign: 'right' }}>
                              ${lineTotal.toFixed(2)}
                            </div>

                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTransferItemId(transferItemId === it.id ? null : it.id);
                                }}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  background: transferItemId === it.id ? '#eff6ff' : '#f8fafc',
                                  border: `1px solid ${transferItemId === it.id ? '#0284c7' : '#cbd5e1'}`,
                                  color: transferItemId === it.id ? '#0284c7' : '#475569',
                                  cursor: 'pointer',
                                  borderRadius: '7px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  touchAction: 'manipulation',
                                }}
                                title="Transfer / Duplicate to another workspace"
                              >
                                <Copy size={15} />
                              </button>
                              {renderTransferPopover(it)}

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
                                        border: `1.5px solid ${isCurrent ? (isDoctor ? '#0d9488' : '#003666') : '#cbd5e1'}`,
                                        backgroundColor: isCurrent ? (isDoctor ? '#0d9488' : '#003666') : '#ffffff',
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
              )}
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

