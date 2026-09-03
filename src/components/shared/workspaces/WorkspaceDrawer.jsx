import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { useDrawer } from '../../../context/DrawerContext';
import {
  Briefcase,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Building2,
  Users,
  FileText,
  ShieldCheck,
  Truck,
  DollarSign,
  Package
} from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import notifier from '../../../services/NotificationService';
import { getRecentEntitiesFast, searchCatalogFast } from '../../../repositories/workspaceSearchRepository';

export default function WorkspaceDrawer() {
  const {
    workspaces,
    activeWorkspaceId,
    isDrawerOpen,
    setDrawerOpen,
    setActiveWorkspace,
    createWorkspace,
    renameWorkspace,
    duplicateWorkspace,
    deleteWorkspace,
    clearWorkspaceItems,
    addItem,
    addItems,
    removeItem,
    updateItemQuantity,
    updateItemPrice,
    applyDiscountPercentage,
    multiplyQuantities,
    addReconstitutionBacteriostaticWater,
    setWorkspaceIntent,
    setTargetEntity
  } = useWorkspaceStore();

  const { openDrawer } = useDrawer();

  const [nameInput, setNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(0);

  // On-demand Target Recipient States
  const [selectedTargetType, setSelectedTargetType] = useState('clinic'); // 'clinic' | 'wholeseller' | 'patient' | 'doctor' | 'supplier'
  const [targetTypeEntities, setTargetTypeEntities] = useState([]);
  const [loadingTargetType, setLoadingTargetType] = useState(false);
  const [targetSearchQuery, setTargetSearchQuery] = useState('');

  const [protocols, setProtocols] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [activePicker, setActivePicker] = useState(null); // 'products' | 'protocols' | null
  const [pickerSearch, setPickerSearch] = useState('');
  const [searchingCatalog, setSearchingCatalog] = useState(false);

  const wsList = Object.values(workspaces || {});
  const activeWs = workspaces[activeWorkspaceId] || wsList[0] || null;
  const items = activeWs?.items || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Keyboard Shortcuts (Alt+W to toggle, Esc to close, Cmd+Enter to execute)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        setDrawerOpen(!isDrawerOpen);
      }
      if (isDrawerOpen) {
        if (e.key === 'Escape') {
          if (activePicker) {
            setActivePicker(null);
          } else {
            setDrawerOpen(false);
          }
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          if (activeWs?.intent === 'buy') {
            handleExecutePO();
          } else {
            handleExecuteQuotation();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, activePicker, activeWs?.intent, items.length]);

  // 1. Instant Fast Search for Catalog & Protocols (Algolia + RAM Cache)
  useEffect(() => {
    if (!isDrawerOpen || !activePicker) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      if (pickerSearch.trim().length >= 2) {
        setSearchingCatalog(true);
        try {
          const res = await searchCatalogFast(pickerSearch);
          if (isMounted) {
            if (activePicker === 'products' && res.products?.length > 0) {
              setAvailableProducts(res.products);
            }
            if (activePicker === 'protocols' && res.protocols?.length > 0) {
              setProtocols(res.protocols);
            }
          }
        } finally {
          if (isMounted) setSearchingCatalog(false);
        }
      }
    }, 150); // 150ms debounce for ultra-fast typing

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pickerSearch, activePicker, isDrawerOpen]);

  // 2. High-Speed 0ms Target Entities Load (RAM + LocalStorage + SWR)
  useEffect(() => {
    if (!isDrawerOpen) return;
    const effectiveType = activeWs?.intent === 'buy' ? 'supplier' : selectedTargetType;

    let isMounted = true;
    async function loadFastEntities() {
      setLoadingTargetType(true);
      try {
        const data = await getRecentEntitiesFast(effectiveType);
        if (isMounted) {
          setTargetTypeEntities(data || []);
        }
      } finally {
        if (isMounted) setLoadingTargetType(false);
      }
    }

    loadFastEntities();
    return () => { isMounted = false; };
  }, [isDrawerOpen, selectedTargetType, activeWs?.intent]);

  // Sync name input when active workspace changes
  useEffect(() => {
    if (activeWs) {
      setNameInput(activeWs.name);
      setIsEditingName(false);
    }
  }, [activeWorkspaceId, activeWs?.name]);

  if (!isDrawerOpen || !activeWs || !mounted) return null;

  const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  const totalSaleAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const rate = Number(it.unitPrice || 0);
    return sum + (qty * rate);
  }, 0);

  const totalCostAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const cost = Number(it.supplierCost || 0);
    return sum + (qty * cost);
  }, 0);

  const marginAmount = totalSaleAmount - totalCostAmount;
  const marginPercent = totalSaleAmount > 0 ? Math.round((marginAmount / totalSaleAmount) * 100) : 0;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      renameWorkspace(activeWs.id, nameInput.trim());
      setIsEditingName(false);
    }
  };

  // Execution Handlers (100% English)
  const handleExecuteQuotation = () => {
    if (items.length === 0) {
      notifier.warning('Please add products to the workspace before generating a quote.');
      return;
    }
    setDrawerOpen(false);
    window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
      detail: {
        type: 'manual',
        clientName: activeWs.targetEntity?.name || '',
        clientId: activeWs.targetEntity?.id || '',
        recipientType: activeWs.targetEntity?.type || 'clinic',
        items: items.map(it => ({
          compoundName: it.canonicalName,
          dosage: it.dosage,
          format: it.format,
          quantity: it.quantity,
          unitRate: it.unitPrice,
          supplierCost: it.supplierCost,
          supplierName: it.supplierName,
          totalPrice: it.quantity * it.unitPrice
        }))
      }
    }));
    notifier.info(`Launching B2B Quotation Wizard with ${items.length} items.`);
  };

  const handleExecutePrescription = () => {
    if (items.length === 0) {
      notifier.warning('Please add compounds before creating a prescription.');
      return;
    }
    setDrawerOpen(false);
    openDrawer('rx-builder', 'new', {
      initialItems: items.map(it => ({
        type: 'product',
        id: it.id,
        productId: it.productId,
        name: it.canonicalName,
        sku: it.sku,
        price: it.unitPrice,
        quantity: it.quantity,
        dosage: it.dosage,
        format: it.format
      })),
      patientId: activeWs.targetEntity?.type === 'patient' ? activeWs.targetEntity.id : null,
      sourceModule: 'workspace'
    });
  };

  const handleExecutePO = () => {
    if (items.length === 0) {
      notifier.warning('Please add items to workspace before generating a purchase order.');
      return;
    }
    setDrawerOpen(false);
    window.dispatchEvent(new CustomEvent('open-quick-create', {
      detail: {
        type: 'new-purchase-order',
        payload: {
          supplierId: activeWs.targetEntity?.type === 'supplier' ? activeWs.targetEntity.id : '',
          supplierName: activeWs.targetEntity?.name || '',
          items: items.map(it => ({
            productId: it.productId,
            variantId: it.variantId,
            name: it.canonicalName,
            quantity: it.quantity,
            unitCost: it.supplierCost,
            sku: it.sku
          }))
        }
      }
    }));
    notifier.success(`Opening Purchase Order form with ${items.length} line items.`);
  };

  const handleLoadProtocol = (proto) => {
    const peptides = proto.peptides || [];
    const itemsToAdd = (peptides.length > 0 ? peptides : [{ id: proto.id, canonicalName: proto.name }]).map(pep => ({
      id: pep.id || `pep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: pep.productId || pep.id,
      canonicalName: pep.name || pep.canonicalName || pep.title || 'Protocol Peptide',
      dosage: pep.dosage || pep.dose || '1 vial',
      quantity: 1,
      unitPrice: Number(pep.price || 0),
      supplierCost: Number(pep.costPrice || 0),
      format: pep.format || 'Vial',
    }));

    addItems(itemsToAdd, activeWs.id);
    setActivePicker(null);
    notifier.success(`Loaded ${itemsToAdd.length} peptide(s) from protocol "${proto.name}"!`);
  };

  const handleAddProduct = (prod) => {
    addItem({
      id: prod.id,
      productId: prod.id,
      canonicalName: prod.canonicalName || prod.name,
      dosage: prod.dosage || (prod.variants?.[0]?.dosage) || 'Standard',
      format: prod.format || (prod.variants?.[0]?.format) || 'Vial',
      unitPrice: Number(prod.price || prod.variants?.[0]?.unit_price || 0),
      supplierCost: Number(prod.variants?.[0]?.supplierCost || 0),
      quantity: 1,
    }, activeWs.id);
    notifier.success(`Added "${prod.canonicalName || prod.name}" to workspace!`);
  };

  return createPortal(
    <>
      {/* 1. Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999998,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* 2. Side Panel - Pinned directly to the right edge */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(420px, 94vw)',
          height: '100dvh',
          maxHeight: '100vh',
          zIndex: 999999,
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
          animation: 'slideLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {/* ─── 1. Header & Tabs ──────────────────────────────────────────────── */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#003666',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                <Briefcase size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                  Operational Workspaces
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {wsList.length} active workspace{wsList.length > 1 ? 's' : ''} • Concurrent staging
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => createWorkspace()}
                className="gcp-btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderRadius: '6px',
                  fontWeight: 600,
                }}
                title="Create new workspace"
              >
                <Plus size={13} /> New
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '2px',
              scrollbarWidth: 'none',
            }}
          >
            {wsList.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              const count = (ws.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #003666' : '1px solid #cbd5e1',
                    backgroundColor: isActive ? '#003666' : '#ffffff',
                    color: isActive ? '#ffffff' : '#334155',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  <span>{ws.intent === 'buy' ? '🏭' : '💼'}</span>
                  <span>{ws.name}</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      borderRadius: '99px',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#475569',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 2. Active Workspace Toolbar ────────────────────────────────────── */}
        <div
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.82rem',
                    border: '1px solid #2563eb',
                    borderRadius: '5px',
                    outline: 'none',
                    fontWeight: 700,
                    flex: 1,
                    minWidth: 0,
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button onClick={handleSaveName} style={{ border: 'none', background: '#16a34a', color: 'white', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer' }}>
                  <Check size={13} />
                </button>
                <button onClick={() => setIsEditingName(false)} style={{ border: 'none', background: '#94a3b8', color: 'white', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer' }}>
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {activeWs.name}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                  title="Rename workspace"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={() => duplicateWorkspace(activeWs.id)}
              className="gcp-btn-secondary"
              style={{ padding: '3px 7px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}
              title="Duplicate workspace"
            >
              <Copy size={12} /> Duplicate
            </button>
            <button
              onClick={() => clearWorkspaceItems(activeWs.id)}
              className="gcp-btn-secondary"
              style={{ padding: '3px 7px', fontSize: '0.72rem', color: '#dc2626', borderRadius: '4px' }}
              title="Clear items"
            >
              Clear
            </button>
            {wsList.length > 1 && (
              <button
                onClick={() => deleteWorkspace(activeWs.id)}
                className="gcp-btn-secondary"
                style={{ padding: '3px 7px', fontSize: '0.72rem', color: '#dc2626', borderRadius: '4px' }}
                title="Delete workspace"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ─── 3. Staged Items List / Empty State with Loaders ──────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 'auto 0' }}>
              <div
                style={{
                  padding: '1.75rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px dashed #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: '0 0 3px 0' }}>
                    Workspace is empty
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Choose how you want to populate this workspace:
                  </p>
                </div>

                {/* Quick Action Loaders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePicker(activePicker === 'protocols' ? null : 'protocols');
                      setPickerSearch('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: activePicker === 'protocols' ? '#003666' : '#eff6ff',
                      color: activePicker === 'protocols' ? '#ffffff' : '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>📋</span> Load from Clinical Protocol
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePicker(activePicker === 'products' ? null : 'products');
                      setPickerSearch('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: activePicker === 'products' ? '#003666' : '#f0fdf4',
                      color: activePicker === 'products' ? '#ffffff' : '#15803d',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>📦</span> Add from Master Catalog
                  </button>
                </div>
              </div>

              {/* Protocol Picker Panel */}
              {activePicker === 'protocols' && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>Select Clinical Protocol</span>
                    <button onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}><X size={14} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search protocol name..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                  />
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {protocols.filter(p => !pickerSearch || p.name?.toLowerCase().includes(pickerSearch.toLowerCase())).slice(0, 15).map(proto => (
                      <div
                        key={proto.id}
                        onClick={() => handleLoadProtocol(proto)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #f1f5f9',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.1s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{proto.name}</span>
                        <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 700 }}>+ Load</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Picker Panel */}
              {activePicker === 'products' && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>Select Catalog Product</span>
                    <button onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}><X size={14} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search product name..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                  />
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {availableProducts.filter(p => !pickerSearch || p.canonicalName?.toLowerCase().includes(pickerSearch.toLowerCase())).slice(0, 15).map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => handleAddProduct(prod)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #f1f5f9',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.1s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{prod.canonicalName}</span>
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>+ Add</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '2px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Staged Compounds ({items.length})
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Total Units: <b>{totalItemsCount}</b>
                </span>
              </div>

              {items.map((it, idx) => (
                <div
                  key={it.id || idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {it.canonicalName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {it.dosage && <span><b>Dose:</b> {it.dosage}</span>}
                        {it.format && <span>• <b>Format:</b> {it.format}</span>}
                        {it.sku && <span>• <b>SKU:</b> {it.sku}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(activeWs.id, it.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      title="Remove item"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Quantity & Unit Pricing Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Qty:</span>
                      <button
                        onClick={() => updateItemQuantity(activeWs.id, it.id, Math.max(1, (it.quantity || 1) - 1))}
                        style={{ width: '22px', height: '22px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity || 1}
                        onChange={(e) => updateItemQuantity(activeWs.id, it.id, parseInt(e.target.value, 10) || 1)}
                        style={{ width: '38px', textAlign: 'center', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                      />
                      <button
                        onClick={() => updateItemQuantity(activeWs.id, it.id, (it.quantity || 1) + 1)}
                        style={{ width: '22px', height: '22px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        +
                      </button>
                    </div>

                    {/* Unit Price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Rate: $</span>
                      <input
                        type="number"
                        step="0.1"
                        value={it.unitPrice || 0}
                        onChange={(e) => updateItemPrice(activeWs.id, it.id, parseFloat(e.target.value) || 0)}
                        style={{ width: '58px', textAlign: 'right', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                      />
                    </div>

                    {/* Line Total */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#003666' }}>
                        ${((it.quantity || 1) * (it.unitPrice || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── 4. Intent & Operational Routing Module ─────────────────────────── */}
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            flexShrink: 0,
          }}
        >
          {/* Intent Toggle */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setWorkspaceIntent(activeWs.id, 'sell')}
              style={{
                flex: 1,
                padding: '7px 8px',
                borderRadius: '6px',
                border: activeWs.intent === 'sell' ? '1px solid #003666' : '1px solid #cbd5e1',
                backgroundColor: activeWs.intent === 'sell' ? '#003666' : '#ffffff',
                color: activeWs.intent === 'sell' ? '#ffffff' : '#475569',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <DollarSign size={14} /> SELL (Quote / Rx)
            </button>
            <button
              onClick={() => setWorkspaceIntent(activeWs.id, 'buy')}
              style={{
                flex: 1,
                padding: '7px 8px',
                borderRadius: '6px',
                border: activeWs.intent === 'buy' ? '1px solid #c2410c' : '1px solid #cbd5e1',
                backgroundColor: activeWs.intent === 'buy' ? '#c2410c' : '#ffffff',
                color: activeWs.intent === 'buy' ? '#ffffff' : '#475569',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Truck size={14} /> BUY (Supplier PO)
            </button>
          </div>

          {/* Target Entity Selector (On-Demand & Scalable) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{activeWs.intent === 'buy' ? 'Target Supplier / Compounder' : 'Target Recipient'}</span>
              {loadingTargetType && <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500 }}>Loading...</span>}
            </label>

            {/* Target Type Switcher Tabs (Only if SELL) */}
            {activeWs.intent === 'sell' && (
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                {[
                  { type: 'clinic', label: '🏥 Clinic' },
                  { type: 'wholeseller', label: '🏢 Wholesaler' },
                  { type: 'patient', label: '👤 Patient' },
                  { type: 'doctor', label: '🩺 Doctor' },
                ].map(tab => (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => {
                      setSelectedTargetType(tab.type);
                      setTargetSearchQuery('');
                    }}
                    style={{
                      flex: 1,
                      padding: '4px 2px',
                      fontSize: '0.68rem',
                      fontWeight: selectedTargetType === tab.type ? 700 : 500,
                      backgroundColor: selectedTargetType === tab.type ? '#ffffff' : 'transparent',
                      color: selectedTargetType === tab.type ? '#003666' : '#64748b',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      boxShadow: selectedTargetType === tab.type ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Selected Recipient Card or Search & Select Dropdown */}
            {activeWs.targetEntity ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem' }}>{activeWs.targetEntity.type === 'supplier' ? '🏭' : activeWs.targetEntity.type === 'clinic' ? '🏥' : activeWs.targetEntity.type === 'wholeseller' ? '🏢' : '👤'}</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{activeWs.targetEntity.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'capitalize' }}>{activeWs.targetEntity.type}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetEntity(activeWs.id, null)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px' }}
                >
                  ✕ Clear
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  type="text"
                  placeholder={`Search ${activeWs.intent === 'buy' ? 'suppliers' : selectedTargetType + 's'} by name...`}
                  value={targetSearchQuery}
                  onChange={(e) => setTargetSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <select
                  value=""
                  onChange={(e) => {
                    const targetId = e.target.value;
                    if (!targetId) return;
                    const found = targetTypeEntities.find(it => it.id === targetId);
                    if (found) {
                      setTargetEntity(activeWs.id, { id: found.id, name: found.name, type: found.type || (activeWs.intent === 'buy' ? 'supplier' : selectedTargetType) });
                      setTargetSearchQuery('');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.78rem',
                    color: '#334155',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">
                    {loadingTargetType ? 'Loading recent...' : `-- Select ${activeWs.intent === 'buy' ? 'Supplier' : selectedTargetType} (${targetTypeEntities.length} recent) --`}
                  </option>
                  {targetTypeEntities
                    .filter(ent => !targetSearchQuery || ent.name?.toLowerCase().includes(targetSearchQuery.toLowerCase()))
                    .map(ent => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name} {ent.email ? `(${ent.email})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Clinical Reconstitution Suggestion (if lyophilized vials are present and BAC Water is missing) */}
          {items.some(it => (it.format?.toLowerCase().includes('vial') || it.presentation?.toLowerCase().includes('vial')) && !it.canonicalName?.toLowerCase().includes('water')) && !items.some(it => it.canonicalName?.toLowerCase().includes('water')) && (
            <div style={{ backgroundColor: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: '8px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>💧</span>
                <span style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600 }}>Lyophilized Vials staged</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  addReconstitutionBacteriostaticWater(activeWs.id);
                  notifier.success('Added Bacteriostatic Water 30ml companion!');
                }}
                style={{
                  padding: '3px 8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Add BAC Water ($15)
              </button>
            </div>
          )}

          {/* Rapid Multipliers & Volume Scaling */}
          {items.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Volume Scaling:</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1, 2, 5, 10].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      multiplyQuantities(m, activeWs.id);
                      notifier.info(`Adjusted quantities by ${m}x`);
                    }}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#334155'
                    }}
                  >
                    x{m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Financial Breakdown & Margin Simulator */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            {/* Quick Discount Selector (Sell mode) */}
            {activeWs.intent === 'sell' && items.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Discount:</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[0, 5, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setSelectedDiscount(pct);
                        applyDiscountPercentage(pct, activeWs.id);
                      }}
                      style={{
                        padding: '2px 5px',
                        fontSize: '0.65rem',
                        fontWeight: selectedDiscount === pct ? 800 : 500,
                        backgroundColor: selectedDiscount === pct ? '#003666' : '#f8fafc',
                        color: selectedDiscount === pct ? '#ffffff' : '#64748b',
                        border: '1px solid',
                        borderColor: selectedDiscount === pct ? '#003666' : '#e2e8f0',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {pct === 0 ? '0%' : `-${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
              <span>Subtotal (Sales Value):</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>${totalSaleAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
              <span>Supplier Cost:</span>
              <span style={{ fontWeight: 700, color: '#64748b' }}>${totalCostAmount.toFixed(2)}</span>
            </div>

            {/* Margin Health Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: '#003666' }}>
                <span>Estimated Gross Margin:</span>
                <span style={{ color: marginPercent >= 40 ? '#16a34a' : marginPercent >= 25 ? '#0284c7' : '#ea580c' }}>
                  ${marginAmount.toFixed(2)} ({marginPercent}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, marginPercent))}%`,
                    height: '100%',
                    backgroundColor: marginPercent >= 40 ? '#16a34a' : marginPercent >= 25 ? '#0284c7' : '#ea580c',
                    transition: 'width 0.2s ease, background-color 0.2s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
            {activeWs.intent === 'buy' ? (
              <button
                onClick={handleExecutePurchaseOrder}
                disabled={items.length === 0}
                className="gcp-btn-primary"
                style={{
                  width: '100%',
                  padding: '9px',
                  backgroundColor: '#c2410c',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Truck size={15} /> Generate Purchase Order (PO)
              </button>
            ) : (
              <>
                <button
                  onClick={handleExecuteQuotation}
                  disabled={items.length === 0}
                  className="gcp-btn-primary"
                  style={{
                    width: '100%',
                    padding: '9px',
                    backgroundColor: '#003666',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <FileText size={15} /> Generate B2B Quotation
                </button>
                <button
                  onClick={handleExecutePrescription}
                  disabled={items.length === 0}
                  className="gcp-btn-secondary"
                  style={{
                    width: '100%',
                    padding: '9px',
                    backgroundColor: '#0d9488',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldCheck size={15} /> Create Rx Prescription
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
