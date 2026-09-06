import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspaceStore, useShallow } from '../../../stores/useWorkspaceStore';
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
  Package,
  Thermometer,
  MapPin,
  Sparkles,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers
} from 'lucide-react';
import notifier from '../../../services/NotificationService';
import { getRecentEntitiesFast, searchCatalogFast } from '../../../repositories/workspaceSearchRepository';
import { resolvePriceForRole, resolveVariantPrice } from '../../../services/pricingService';

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
    updateItemFormat,
    updateItemDosage,
    applyDiscountPercentage,
    multiplyQuantities,
    addReconstitutionBacteriostaticWater,
    setWorkspaceIntent,
    setTargetEntity,
    savedKits,
    saveWorkspaceAsKit,
    loadKitIntoWorkspace,
    deleteSavedKit
  } = useWorkspaceStore(
    useShallow((s) => ({
      workspaces: s.workspaces,
      activeWorkspaceId: s.activeWorkspaceId,
      isDrawerOpen: s.isDrawerOpen,
      setDrawerOpen: s.setDrawerOpen,
      setActiveWorkspace: s.setActiveWorkspace,
      createWorkspace: s.createWorkspace,
      renameWorkspace: s.renameWorkspace,
      duplicateWorkspace: s.duplicateWorkspace,
      deleteWorkspace: s.deleteWorkspace,
      clearWorkspaceItems: s.clearWorkspaceItems,
      addItem: s.addItem,
      addItems: s.addItems,
      removeItem: s.removeItem,
      updateItemQuantity: s.updateItemQuantity,
      updateItemPrice: s.updateItemPrice,
      updateItemFormat: s.updateItemFormat,
      updateItemDosage: s.updateItemDosage,
      applyDiscountPercentage: s.applyDiscountPercentage,
      multiplyQuantities: s.multiplyQuantities,
      addReconstitutionBacteriostaticWater: s.addReconstitutionBacteriostaticWater,
      setWorkspaceIntent: s.setWorkspaceIntent,
      setTargetEntity: s.setTargetEntity,
      savedKits: s.savedKits,
      saveWorkspaceAsKit: s.saveWorkspaceAsKit,
      loadKitIntoWorkspace: s.loadKitIntoWorkspace,
      deleteSavedKit: s.deleteSavedKit
    }))
  );

  const { openDrawer } = useDrawer();

  const [nameInput, setNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(0);

  // Accordion Section Expansion States: Products ALWAYS expanded (true), rest collapsed (false)
  const [sectionExpanded, setSectionExpanded] = useState({
    products: true,
    recipient: false,
    shipping: false,
    financial: false
  });

  // Accordion Staged Product Item Details Expansion States ({ [itemId]: boolean })
  const [expandedItemIds, setExpandedItemIds] = useState({});

  // Shipping & Logistics States
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('cold_chain'); // 'cold_chain' | 'express' | 'pickup'
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');

  // Target Recipient States
  const [selectedTargetType, setSelectedTargetType] = useState('clinic'); // 'clinic' | 'wholeseller' | 'patient' | 'doctor' | 'supplier'
  const [targetTypeEntities, setTargetTypeEntities] = useState([]);
  const [loadingTargetType, setLoadingTargetType] = useState(false);
  const [targetSearchQuery, setTargetSearchQuery] = useState('');

  const [protocols, setProtocols] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [activePicker, setActivePicker] = useState(null); // 'products' | 'protocols' | 'kits' | null
  const [pickerSearch, setPickerSearch] = useState('');
  const [searchingCatalog, setSearchingCatalog] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const wsList = Object.values(workspaces || {});
  const activeWs = workspaces[activeWorkspaceId] || wsList[0] || null;
  const items = activeWs?.items || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (sectionKey) => {
    setSectionExpanded(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const toggleItemExpanded = (itemId) => {
    setExpandedItemIds(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Sync address preview when target entity changes
  useEffect(() => {
    if (activeWs?.targetEntity) {
      const ent = activeWs.targetEntity;
      const computedAddr = ent.address || ent.shippingAddress || (ent.city ? `${ent.city}, ${ent.state || ''} ${ent.zip || ''}` : '');
      if (computedAddr && !shippingAddress) {
        setShippingAddress(computedAddr);
      }
    }
  }, [activeWs?.targetEntity]);

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

  // Fast Catalog Search
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
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pickerSearch, activePicker, isDrawerOpen]);

  // Target Entities Loader
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

  // Sync workspace name
  useEffect(() => {
    if (activeWs) {
      setNameInput(activeWs.name);
      setIsEditingName(false);
    }
  }, [activeWorkspaceId, activeWs?.name]);

  if (!isDrawerOpen || !activeWs || !mounted) return null;

  // ─── Price & Financial Calculations (Deep Multi-Fallback Variant Price Resolver) ────────────────
  const extractNumericPrice = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const p = parseFloat(val.replace(/[^0-9.]/g, ''));
      return isNaN(p) ? 0 : p;
    }
    if (typeof val === 'object') {
      if (typeof val.base === 'number') return val.base;
      if (typeof val.perUnit === 'number') return val.perUnit;
      if (typeof val.price === 'number') return val.price;
      if (typeof val.value === 'number') return val.value;
      if (typeof val.amount === 'number') return val.amount;
    }
    return 0;
  };

  const getItemUnitPrice = (it) => {
    if (!it) return 0;

    // 1. Primary Canonical Pricing Engine Resolution
    try {
      const role = activeWs?.pricingTier || 'clinic';
      const canonicalResolved = resolvePriceForRole(it, { role });
      if (canonicalResolved && typeof canonicalResolved.perUnit === 'number' && canonicalResolved.perUnit > 0) {
        return canonicalResolved.perUnit;
      }
    } catch (e) {
      // Fallthrough to extractNumericPrice below
    }

    // 2. Direct scalar and pricing object fields
    const directPrice = 
      extractNumericPrice(it.unitPrice) ||
      extractNumericPrice(it.price) ||
      extractNumericPrice(it.unitRate) ||
      extractNumericPrice(it.unit_price) ||
      extractNumericPrice(it.msrp) ||
      extractNumericPrice(it.retailPrice) ||
      extractNumericPrice(it.wholesalerPrice) ||
      extractNumericPrice(it.pricing?.clinicPrice) ||
      extractNumericPrice(it.pricing?.retailPrice) ||
      extractNumericPrice(it.pricing?.wholesalePrice) ||
      extractNumericPrice(it.pricing?.masterPrice) ||
      extractNumericPrice(it.pricing);
    if (directPrice > 0) return directPrice;

    // 2. Nested variant pricing fields
    const v = it.variant || it.selectedVariant || it.variants?.[0] || {};
    const variantPrice =
      extractNumericPrice(v.unitPrice) ||
      extractNumericPrice(v.price) ||
      extractNumericPrice(v.unitRate) ||
      extractNumericPrice(v.retailPrice) ||
      extractNumericPrice(v.tier1Price) ||
      extractNumericPrice(v.vialPrice) ||
      extractNumericPrice(v.cartridgePrice) ||
      extractNumericPrice(v.pricing?.clinicPrice) ||
      extractNumericPrice(v.pricing?.retailPrice) ||
      extractNumericPrice(v.pricing?.wholesalePrice) ||
      extractNumericPrice(v.pricing?.masterPrice) ||
      extractNumericPrice(v.pricing);
    if (variantPrice > 0) return variantPrice;

    return 0;
  };

  const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  const subtotalSaleAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const rate = getItemUnitPrice(it);
    return sum + (qty * rate);
  }, 0);

  const discountAmount = subtotalSaleAmount * (selectedDiscount / 100);
  const netSubtotal = Math.max(0, subtotalSaleAmount - discountAmount);

  // Shipping Cost Calculation
  const shippingCost = selectedShippingMethod === 'cold_chain' ? 35 : selectedShippingMethod === 'express' ? 15 : 0;

  // Grand Total
  const grandTotal = netSubtotal + (items.length > 0 ? shippingCost : 0);

  const totalCostAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const cost = Number(it.supplierCost || 0);
    return sum + (qty * cost);
  }, 0);

  const marginAmount = grandTotal - totalCostAmount;
  const marginPercent = grandTotal > 0 ? Math.round((marginAmount / grandTotal) * 100) : 0;

  // Detect Temperature-Sensitive Items
  const hasSensitiveItems = items.some(it => {
    const name = (it.canonicalName || '').toLowerCase();
    const fmt = (it.format || '').toLowerCase();
    return fmt.includes('vial') || name.includes('pep') || name.includes('bpc') || name.includes('semaglutide') || name.includes('tirzepatide') || name.includes('nad') || name.includes('glutathione') || name.includes('growth');
  });

  const handleSaveName = () => {
    if (nameInput.trim()) {
      renameWorkspace(activeWs.id, nameInput.trim());
      setIsEditingName(false);
    }
  };

  // Execution Handlers
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
        shippingMethod: selectedShippingMethod,
        shippingCost: shippingCost,
        shippingAddress: shippingAddress,
        shippingNotes: shippingNotes,
        discountPercentage: selectedDiscount,
        grandTotal: grandTotal,
        items: items.map(it => ({
          compoundName: it.canonicalName,
          dosage: it.dosage,
          format: it.format,
          quantity: it.quantity,
          unitRate: getItemUnitPrice(it),
          supplierCost: it.supplierCost,
          supplierName: it.supplierName,
          totalPrice: (it.quantity || 1) * getItemUnitPrice(it)
        }))
      }
    }));
    notifier.info(`Launching B2B Quotation Wizard with ${items.length} items (${selectedShippingMethod.toUpperCase()} shipping).`);
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
        price: getItemUnitPrice(it),
        quantity: it.quantity,
        dosage: it.dosage,
        format: it.format
      })),
      patientId: activeWs.targetEntity?.type === 'patient' ? activeWs.targetEntity.id : null,
      shippingMethod: selectedShippingMethod,
      shippingAddress: shippingAddress,
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
          shippingMethod: selectedShippingMethod,
          shippingCost: shippingCost,
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
    const itemsToAdd = (peptides.length > 0 ? peptides : [{ id: proto.id, canonicalName: proto.name }]).map(pep => {
      const v0 = pep.variants?.[0] || pep.variant || {};
      const resolvedUnitPrice = Number(
        pep.unitPrice || pep.price || pep.unitRate || pep.unit_price ||
        v0.resolvedPrice?.perUnit || v0.unitPrice || v0.price || v0.tier1Price || v0.tier1_price || v0.retailPrice ||
        pep.tier1Price || pep.tier1_price || pep.retailPrice || 0
      );
      const supplierCost = Number(pep.costPrice || pep.supplierCost || v0.supplierCost || 0);

      return {
        id: pep.id || `pep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId: pep.productId || pep.id,
        canonicalName: pep.name || pep.canonicalName || pep.title || 'Protocol Peptide',
        dosage: pep.dosage || pep.dose || v0.dosage || 'Standard',
        format: pep.format || v0.format || 'Vial',
        quantity: 1,
        unitPrice: resolvedUnitPrice,
        supplierCost: supplierCost,
      };
    });

    addItems(itemsToAdd, activeWs.id);
    setActivePicker(null);
    notifier.success(`Loaded ${itemsToAdd.length} peptide(s) from protocol "${proto.name}"!`);
  };

  const handleAddProduct = (prod) => {
    const v0 = prod.variants?.[0] || prod.variant || {};
    const resolvedUnitPrice = Number(
      prod.unitPrice || prod.price || prod.unitRate || prod.unit_price ||
      v0.resolvedPrice?.perUnit || v0.unitPrice || v0.price || v0.tier1Price || v0.tier1_price || v0.retailPrice ||
      prod.pricing?.retailPrice || prod.pricing?.tier1Price || prod.tier1_price || prod.tier1Price || prod.retailPrice || 0
    );
    const supplierCost = Number(prod.supplierCost || v0.supplierCost || prod.pricing?.supplierCost || 0);

    addItem({
      id: prod.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: prod.id,
      canonicalName: prod.canonicalName || prod.name || 'Catalog Item',
      dosage: prod.dosage || v0.dosage || 'Standard',
      format: prod.format || v0.format || 'Vial',
      unitPrice: resolvedUnitPrice,
      supplierCost: supplierCost,
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

      {/* 2. Side Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(460px, 100vw)',
          height: '100dvh',
          maxHeight: '100vh',
          zIndex: 999999,
          backgroundColor: '#f8fafc',
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

        {/* ─── HEADER: Workspace Tabs & Navigation ────────────────────────────── */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)',
                }}
              >
                <Briefcase size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  Operational Workspaces
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                  {wsList.length} Active Workspace{wsList.length > 1 ? 's' : ''} • Staging Cart
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => createWorkspace()}
                className="gcp-btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
                title="Create new workspace"
              >
                <Plus size={14} /> New
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '6px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                }}
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: '#f1f5f9',
              padding: '3px',
              borderRadius: '9px',
              border: '1px solid #e2e8f0',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {wsList.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              const count = (ws.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => setActiveWorkspace(ws.id)}
                  style={{
                    flex: 1,
                    minWidth: '110px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#003666' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{ws.intent === 'buy' ? '🏭' : '💼'}</span>
                  <span>{ws.name}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 7px',
                      borderRadius: '99px',
                      backgroundColor: isActive ? '#003666' : '#cbd5e1',
                      color: isActive ? '#ffffff' : '#334155',
                      fontWeight: 700,
                    }}
                  >
                    {count} item{count === 1 ? '' : 's'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Workspace Title & Quick Tools */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              paddingTop: '2px',
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
                      padding: '4px 8px',
                      fontSize: '0.82rem',
                      border: '1px solid #0284c7',
                      borderRadius: '6px',
                      outline: 'none',
                      fontWeight: 700,
                      flex: 1,
                      minWidth: 0,
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button type="button" onClick={handleSaveName} style={{ border: 'none', background: '#16a34a', color: 'white', padding: '5px 8px', borderRadius: '5px', cursor: 'pointer' }}>
                    <Check size={13} />
                  </button>
                  <button type="button" onClick={() => setIsEditingName(false)} style={{ border: 'none', background: '#94a3b8', color: 'white', padding: '5px 8px', borderRadius: '5px', cursor: 'pointer' }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {activeWs.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px', borderRadius: '4px', flexShrink: 0 }}
                    title="Rename workspace"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  if (items.length === 0) {
                    notifier.warning('Add products to the workspace before saving as a kit.');
                    return;
                  }
                  const name = window.prompt('Enter a name for this reusable kit template:', `${activeWs.name} Kit`);
                  if (name && name.trim()) {
                    saveWorkspaceAsKit(name.trim(), activeWs.id);
                    notifier.success(`Saved kit "${name.trim()}" successfully!`);
                  }
                }}
                className="gcp-btn-secondary"
                style={{ padding: '4px 9px', fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', borderRadius: '6px', border: '1px solid #bae6fd', backgroundColor: '#f0f9ff' }}
                title="Save current workspace items as a reusable kit"
              >
                + Save Kit
              </button>
              <button
                type="button"
                onClick={() => duplicateWorkspace(activeWs.id)}
                className="gcp-btn-secondary"
                style={{ padding: '4px 9px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                title="Duplicate workspace"
              >
                <Copy size={12} /> Duplicate
              </button>
              <button
                type="button"
                onClick={() => clearWorkspaceItems(activeWs.id)}
                className="gcp-btn-secondary"
                style={{ padding: '4px 9px', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff5f5' }}
                title="Clear items"
              >
                Clear
              </button>
              {wsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteWorkspace(activeWs.id)}
                  className="gcp-btn-secondary"
                  style={{ padding: '4px 7px', fontSize: '0.75rem', color: '#dc2626', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  title="Delete workspace"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── MAIN ACCORDION SCROLLABLE BODY ────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          {/* 📦 ACCORDION SECTION 1: STAGED PRODUCTS */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '11px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Accordion Header Bar */}
            <div
              onClick={() => toggleSection('products')}
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
                borderBottom: sectionExpanded.products ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sectionExpanded.products ? <ChevronDown size={17} style={{ color: '#003666' }} /> : <ChevronRight size={17} style={{ color: '#64748b' }} />}
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} /> Staged Products
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    backgroundColor: items.length > 0 ? '#003666' : '#e2e8f0',
                    color: items.length > 0 ? '#ffffff' : '#475569',
                    fontWeight: 800
                  }}
                >
                  {items.length}
                </span>
              </div>

              {items.length > 0 && (
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  ${subtotalSaleAmount.toFixed(2)}
                </span>
              )}
            </div>

            {/* Accordion Body Content */}
            {sectionExpanded.products && (
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', backgroundColor: '#f8fafc' }}>
                {items.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '2px dashed #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003666' }}>
                      <Package size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>
                        No Products Staged Yet
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                        Select clinical protocols or master catalog items to build your workspace:
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '0.2rem' }}>
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
                          padding: '9px 12px',
                          backgroundColor: activePicker === 'protocols' ? '#003666' : '#eff6ff',
                          color: activePicker === 'protocols' ? '#ffffff' : '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
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
                          padding: '9px 12px',
                          backgroundColor: activePicker === 'products' ? '#003666' : '#f0fdf4',
                          color: activePicker === 'products' ? '#ffffff' : '#15803d',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <span>📦</span> Add from Master Catalog
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#003666 #f1f5f9'
                    }}
                  >
                    {items.map((it, idx) => {
                      const unitRate = getItemUnitPrice(it);
                      const lineTotal = (it.quantity || 1) * unitRate;
                      const supplierCost = Number(it.supplierCost || 0);
                      const unitMargin = unitRate - supplierCost;
                      const unitMarginPct = unitRate > 0 ? Math.round((unitMargin / unitRate) * 100) : 0;
                      const isItemExpanded = !!expandedItemIds[it.id];

                      return (
                        <div
                          key={it.id || idx}
                          style={{
                            backgroundColor: '#ffffff',
                            border: `1.5px solid ${isItemExpanded ? '#003666' : '#cbd5e1'}`,
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Item Card Header (Always Visible - Collapsed / Expanded Toggle) */}
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
                              userSelect: 'none'
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
                                  {it.canonicalName || it.name || it.displayName || it.title || 'Product Item'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 600, color: '#334155' }}>{it.dosage || 'Standard'}</span>
                                  <span>•</span>
                                  <span style={{ fontWeight: 600, color: '#0284c7' }}>{it.format || 'Vial'}</span>
                                  <span style={{ margin: '0 2px', color: '#cbd5e1' }}>|</span>
                                  {unitRate > 0 ? (
                                    <span style={{ color: '#0284c7', fontWeight: 800 }}>
                                      ${unitRate.toFixed(2)} / unit
                                    </span>
                                  ) : (
                                    <div
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#fef3c7', padding: '1px 6px', borderRadius: '5px', border: '1px solid #fde68a' }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309' }}>$</span>
                                      <input
                                        type="number"
                                        step="0.5"
                                        placeholder="0.00"
                                        onChange={(e) => updateItemPrice(it.id, parseFloat(e.target.value) || 0, activeWs.id)}
                                        style={{
                                          width: '56px',
                                          fontSize: '0.74rem',
                                          fontWeight: 800,
                                          color: '#92400e',
                                          backgroundColor: '#ffffff',
                                          border: '1px solid #f59e0b',
                                          borderRadius: '4px',
                                          padding: '1px 4px',
                                          outline: 'none',
                                          textAlign: 'right'
                                        }}
                                      />
                                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309' }}>/ unit</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Controls on Collapsed Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                              {/* Quantity buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(it.id, Math.max(1, (it.quantity || 1) - 1), activeWs.id)}
                                  style={{ width: '24px', height: '24px', border: '1px solid #cbd5e1', borderRadius: '5px', background: '#f8fafc', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', color: '#334155' }}
                                >
                                  -
                                </button>
                                <span style={{ fontSize: '0.82rem', fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>
                                  {it.quantity || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(it.id, (it.quantity || 1) + 1, activeWs.id)}
                                  style={{ width: '24px', height: '24px', border: '1px solid #cbd5e1', borderRadius: '5px', background: '#f8fafc', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', color: '#334155' }}
                                >
                                  +
                                </button>
                              </div>

                              {/* Line Total */}
                              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666', minWidth: '55px', textAlign: 'right' }}>
                                ${lineTotal.toFixed(2)}
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => removeItem(it.id, activeWs.id)}
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', padding: '3px 5px', borderRadius: '5px', display: 'flex' }}
                                title="Remove item"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Item Accordion Body (Expanded Product Specifications & Commercial Breakdown) */}
                          {isItemExpanded && (
                            <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#ffffff' }}>
                              {/* Metadata Grid */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                <div>
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>Dose & Presentation:</span>
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
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>Supplier Source:</span>
                                  <div style={{ fontWeight: 700, color: '#475569' }}>{it.supplierName || 'Magenta / Partner Compounder'}</div>
                                </div>
                              </div>

                              {/* Interactive Format & Presentation Switcher */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Quick Format Switcher:</span>
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                  {['Vial', 'Single Cartridge', 'Double Cartridge', 'Sublingual', 'Oral Drops'].map(fmtOption => {
                                    const isCurrent = (it.format || 'Vial').toLowerCase() === fmtOption.toLowerCase();
                                    return (
                                      <button
                                        key={fmtOption}
                                        type="button"
                                        onClick={() => {
                                          updateItemFormat(it.id, fmtOption, activeWs.id);
                                          notifier.info(`Format set to "${fmtOption}"`);
                                        }}
                                        style={{
                                          padding: '3px 8px',
                                          borderRadius: '5px',
                                          border: `1px solid ${isCurrent ? '#003666' : '#cbd5e1'}`,
                                          backgroundColor: isCurrent ? '#003666' : '#ffffff',
                                          color: isCurrent ? '#ffffff' : '#475569',
                                          fontSize: '0.72rem',
                                          fontWeight: isCurrent ? 800 : 600,
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        {fmtOption}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Editable Pricing & Commercial Margin Row */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>Unit Rate: $</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={unitRate}
                                    onChange={(e) => updateItemPrice(it.id, parseFloat(e.target.value) || 0, activeWs.id)}
                                    style={{ width: '70px', textAlign: 'right', padding: '4px 6px', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 800, outline: 'none', backgroundColor: '#ffffff' }}
                                  />
                                </div>

                                <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                                  <span style={{ color: '#64748b' }}>Cost: <b>${supplierCost.toFixed(2)}</b></span>
                                  <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                                  <span style={{ fontWeight: 800, color: unitMarginPct >= 40 ? '#16a34a' : '#0284c7' }}>
                                    Margin: ${unitMargin.toFixed(2)} ({unitMarginPct}%)
                                  </span>
                                </div>
                              </div>

                              {/* Clinical & Reconstitution Guidance */}
                              {(it.format?.toLowerCase().includes('vial') || it.canonicalName?.toLowerCase().includes('pep')) && (
                                <div style={{ fontSize: '0.72rem', color: '#0369a1', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '7px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Info size={14} style={{ flexShrink: 0 }} />
                                  <span>Clinical Note: Reconstitute with Bacteriostatic Water. Store refrigerated at 2°C – 8°C.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quick Add Pickers Trigger (Protocols, Catalog, Saved Kits) */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePicker(activePicker === 'protocols' ? null : 'protocols');
                          setPickerSearch('');
                        }}
                        style={{
                          flex: 1,
                          minWidth: '110px',
                          padding: '7px 8px',
                          backgroundColor: activePicker === 'protocols' ? '#003666' : '#ffffff',
                          color: activePicker === 'protocols' ? '#ffffff' : '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '7px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Protocol Item
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePicker(activePicker === 'products' ? null : 'products');
                          setPickerSearch('');
                        }}
                        style={{
                          flex: 1,
                          minWidth: '110px',
                          padding: '7px 8px',
                          backgroundColor: activePicker === 'products' ? '#003666' : '#ffffff',
                          color: activePicker === 'products' ? '#ffffff' : '#15803d',
                          border: '1px solid #bbf7d0',
                          borderRadius: '7px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Catalog Item
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePicker(activePicker === 'kits' ? null : 'kits');
                          setPickerSearch('');
                        }}
                        style={{
                          flex: 1,
                          minWidth: '110px',
                          padding: '7px 8px',
                          backgroundColor: activePicker === 'kits' ? '#003666' : '#ffffff',
                          color: activePicker === 'kits' ? '#ffffff' : '#0369a1',
                          border: '1px solid #bae6fd',
                          borderRadius: '7px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📦 Reusable Kits ({savedKits?.length || 0})
                      </button>
                    </div>
                  </div>
                )}

                {/* Protocol Picker Modal/Panel */}
                {activePicker === 'protocols' && (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #003666', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Clinical Protocol</span>
                      <button type="button" onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={15} /></button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search protocol name..."
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '7px', outline: 'none' }}
                    />
                    <div style={{ maxHeight: '170px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {protocols.filter(p => !pickerSearch || p.name?.toLowerCase().includes(pickerSearch.toLowerCase())).slice(0, 15).map(proto => (
                        <div
                          key={proto.id}
                          onClick={() => handleLoadProtocol(proto)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '7px',
                            border: '1px solid #f1f5f9',
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{proto.name}</span>
                          <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800 }}>+ Load</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Picker Modal/Panel */}
                {activePicker === 'products' && (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #16a34a', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Catalog Product</span>
                      <button type="button" onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={15} /></button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search product name..."
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '7px', outline: 'none' }}
                    />
                    <div style={{ maxHeight: '170px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {availableProducts.filter(p => !pickerSearch || p.canonicalName?.toLowerCase().includes(pickerSearch.toLowerCase())).slice(0, 15).map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => handleAddProduct(prod)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '7px',
                            border: '1px solid #f1f5f9',
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{prod.canonicalName}</span>
                          <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 800 }}>+ Add</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reusable Kit / Template Picker Modal/Panel */}
                {activePicker === 'kits' && (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #0284c7', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Reusable Kit Template</span>
                      <button type="button" onClick={() => setActivePicker(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={15} /></button>
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
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{(kit.items || []).length} items • {kit.intent === 'buy' ? 'Supplier PO' : 'Quote/Rx'}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                loadKitIntoWorkspace(kit.id, activeWs.id);
                                setActivePicker(null);
                                notifier.success(`Loaded kit "${kit.name}"!`);
                              }}
                              style={{ padding: '4px 8px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                              + Load Kit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteSavedKit(kit.id);
                                notifier.info(`Deleted kit "${kit.name}"`);
                              }}
                              style={{ padding: '4px 6px', backgroundColor: '#fff5f5', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer' }}
                              title="Delete kit"
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

          {/* 🎯 ACCORDION SECTION 2: OPERATIONAL ROUTING & TARGET RECIPIENT */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '11px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Accordion Header Bar */}
            <div
              onClick={() => toggleSection('recipient')}
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
                borderBottom: sectionExpanded.recipient ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sectionExpanded.recipient ? <ChevronDown size={17} style={{ color: '#003666' }} /> : <ChevronRight size={17} style={{ color: '#64748b' }} />}
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} /> Operational Routing & Recipient
                </span>
              </div>

              {activeWs.targetEntity ? (
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✓ {activeWs.targetEntity.name}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#d97706',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '3px 8px',
                    borderRadius: '99px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  + Assign Recipient
                </span>
              )}
            </div>

            {/* Accordion Body Content */}
            {sectionExpanded.recipient && (
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#ffffff' }}>
                {/* Intent Toggle */}
                <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '9px' }}>
                  <button
                    type="button"
                    onClick={() => setWorkspaceIntent(activeWs.id, 'sell')}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: activeWs.intent === 'sell' ? '#003666' : 'transparent',
                      color: activeWs.intent === 'sell' ? '#ffffff' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <DollarSign size={14} /> SELL (Quote / Rx)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspaceIntent(activeWs.id, 'buy')}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: activeWs.intent === 'buy' ? '#c2410c' : 'transparent',
                      color: activeWs.intent === 'buy' ? '#ffffff' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Truck size={14} /> BUY (Supplier PO)
                  </button>
                </div>

                {/* Target Recipient Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{activeWs.intent === 'buy' ? 'Target Supplier / Compounder' : 'Target Recipient'}</span>
                    {loadingTargetType && <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 600 }}>Loading...</span>}
                  </label>

                  {activeWs.intent === 'sell' && (
                    <div style={{ display: 'flex', gap: '3px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
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
                            padding: '5px 2px',
                            fontSize: '0.72rem',
                            fontWeight: selectedTargetType === tab.type ? 800 : 600,
                            backgroundColor: selectedTargetType === tab.type ? '#ffffff' : 'transparent',
                            color: selectedTargetType === tab.type ? '#003666' : '#64748b',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Entity Badge or Search Dropdown */}
                  {activeWs.targetEntity ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.95rem' }}>{activeWs.targetEntity.type === 'supplier' ? '🏭' : activeWs.targetEntity.type === 'clinic' ? '🏥' : activeWs.targetEntity.type === 'wholeseller' ? '🏢' : '👤'}</span>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b' }}>{activeWs.targetEntity.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>{activeWs.targetEntity.type}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTargetEntity(activeWs.id, null)}
                        style={{ border: 'none', background: '#dbeafe', color: '#1e40af', fontSize: '0.74rem', fontWeight: 800, padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}
                      >
                        ✕ Clear
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <input
                        type="text"
                        placeholder={`Search ${activeWs.intent === 'buy' ? 'suppliers' : selectedTargetType + 's'} by name...`}
                        value={targetSearchQuery}
                        onChange={(e) => setTargetSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '7px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8rem',
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
                            setTargetEntity(activeWs.id, { id: found.id, name: found.name, type: found.type || (activeWs.intent === 'buy' ? 'supplier' : selectedTargetType), address: found.address, city: found.city, state: found.state, zip: found.zip });
                            setTargetSearchQuery('');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '7px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '0.8rem',
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

                {/* Companion suggestion */}
                {items.some(it => (it.format?.toLowerCase().includes('vial') || it.presentation?.toLowerCase().includes('vial')) && !it.canonicalName?.toLowerCase().includes('water')) && !items.some(it => it.canonicalName?.toLowerCase().includes('water')) && (
                  <div style={{ backgroundColor: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: '8px', padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>💧</span>
                      <span style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 700 }}>Lyophilized Vials staged</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addReconstitutionBacteriostaticWater(activeWs.id);
                        notifier.success('Added Bacteriostatic Water 30ml companion!');
                      }}
                      style={{ padding: '4px 8px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      + Add BAC Water ($15)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🚚 ACCORDION SECTION 3: SHIPPING & COLD-CHAIN LOGISTICS */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '11px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Accordion Header Bar */}
            <div
              onClick={() => toggleSection('shipping')}
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
                borderBottom: sectionExpanded.shipping ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sectionExpanded.shipping ? <ChevronDown size={17} style={{ color: '#003666' }} /> : <ChevronRight size={17} style={{ color: '#64748b' }} />}
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} /> Shipping & Logistics Method
                </span>
              </div>

              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: selectedShippingMethod === 'cold_chain' ? '#0284c7' : '#16a34a' }}>
                {selectedShippingMethod === 'cold_chain' ? 'Cold-Chain ($35)' : selectedShippingMethod === 'express' ? 'Express ($15)' : 'Pickup ($0)'}
              </span>
            </div>

            {/* Accordion Body Content */}
            {sectionExpanded.shipping && (
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: '#ffffff' }}>
                {/* Smart Biologics Alert */}
                {hasSensitiveItems && (
                  <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Thermometer size={16} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.73rem', color: '#0369a1', fontWeight: 600, lineHeight: 1.3 }}>
                      <b>Cold-Chain Recommended:</b> Biologic peptides detected. 2-8°C temp-controlled insulation protects compound integrity during transit.
                    </span>
                  </div>
                )}

                {/* Shipping Option Pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { id: 'cold_chain', icon: '🧊', title: 'Cold-Chain Temp-Controlled', sub: '2°C - 8°C Thermal Box • Priority Overnight', cost: 35 },
                    { id: 'express', icon: '🚚', title: 'Standard Express Courier', sub: '2-3 Business Days • Tracked Delivery', cost: 15 },
                    { id: 'pickup', icon: '🏥', title: 'Clinic / Direct Pickup', sub: 'On-site pickup at facility', cost: 0 },
                  ].map(opt => {
                    const isSel = selectedShippingMethod === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedShippingMethod(opt.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: `1.5px solid ${isSel ? '#003666' : '#e2e8f0'}`,
                          backgroundColor: isSel ? '#f0f7ff' : '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>{opt.icon}</span>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isSel ? '#003666' : '#0f172a' }}>{opt.title}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{opt.sub}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSel ? '#003666' : '#475569' }}>
                          {opt.cost === 0 ? 'Free' : `$${opt.cost}.00`}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recipient Shipping Address & Delivery Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#475569', fontWeight: 700 }}>
                    <MapPin size={13} /> Delivery Destination & Special Instructions
                  </div>
                  <input
                    type="text"
                    placeholder="Shipping Street Address, City, State, Zip..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Special delivery notes (e.g. Leave at clinic reception)..."
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '7px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.76rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 💰 ACCORDION SECTION 4: FINANCIAL BREAKDOWN & MARGINS */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '11px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Accordion Header Bar */}
            <div
              onClick={() => toggleSection('financial')}
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
                borderBottom: sectionExpanded.financial ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sectionExpanded.financial ? <ChevronDown size={17} style={{ color: '#003666' }} /> : <ChevronRight size={17} style={{ color: '#64748b' }} />}
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={16} /> Financial Breakdown & Margins
                </span>
              </div>

              <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#003666' }}>
                ${grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Accordion Body Content */}
            {sectionExpanded.financial && (
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '7px', backgroundColor: '#ffffff' }}>
                {/* Quick Discount Selector */}
                {activeWs.intent === 'sell' && items.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '7px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Discount:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 5, 10, 15, 20].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setSelectedDiscount(pct);
                            applyDiscountPercentage(pct, activeWs.id);
                          }}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: selectedDiscount === pct ? 800 : 600,
                            backgroundColor: selectedDiscount === pct ? '#003666' : '#f8fafc',
                            color: selectedDiscount === pct ? '#ffffff' : '#64748b',
                            border: '1px solid',
                            borderColor: selectedDiscount === pct ? '#003666' : '#e2e8f0',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          {pct === 0 ? '0%' : `-${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Rows */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>Items Subtotal:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>${subtotalSaleAmount.toFixed(2)}</span>
                </div>

                {selectedDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#dc2626' }}>
                    <span>Discount ({selectedDiscount}%):</span>
                    <span style={{ fontWeight: 800 }}>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>Shipping ({selectedShippingMethod === 'cold_chain' ? 'Cold-Chain' : selectedShippingMethod === 'express' ? 'Express' : 'Pickup'}):</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {items.length > 0 ? (shippingCost === 0 ? '$0.00 (Free)' : `+$${shippingCost.toFixed(2)}`) : '$0.00'}
                  </span>
                </div>

                {/* Grand Total Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '7px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>Grand Total:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003666' }}>
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Margin Health Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>
                    <span>Estimated Margin:</span>
                    <span style={{ color: marginPercent >= 40 ? '#16a34a' : marginPercent >= 25 ? '#0284c7' : '#ea580c' }}>
                      ${marginAmount.toFixed(2)} ({marginPercent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
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
            )}
          </div>

        </div>

        {/* ─── STICKY FOOTER: Primary Action CTA Buttons ───────────────────────── */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
            zIndex: 10
          }}
        >
          {activeWs.intent === 'buy' ? (
            <button
              type="button"
              onClick={handleExecutePO}
              disabled={items.length === 0}
              className="gcp-btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#c2410c',
                color: 'white',
                borderRadius: '9px',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(194, 65, 12, 0.25)',
              }}
            >
              <Truck size={17} /> Generate Purchase Order (${grandTotal.toFixed(2)})
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleExecuteQuotation}
                disabled={items.length === 0}
                className="gcp-btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#003666',
                  color: 'white',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0, 54, 102, 0.25)',
                }}
              >
                <FileText size={17} /> Generate B2B Quotation (${grandTotal.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={handleExecutePrescription}
                disabled={items.length === 0}
                className="gcp-btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                }}
              >
                <ShieldCheck size={16} /> Create Rx Prescription
              </button>
            </>
          )}

          {/* Live PDF Quick Preview Shortcut */}
          <button
            type="button"
            onClick={() => setShowPdfPreview(true)}
            disabled={items.length === 0}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: '#f8fafc',
              color: '#475569',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: items.length > 0 ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileText size={13} /> 👁️ Quick Live PDF Summary Preview
          </button>
        </div>
      </div>

      {/* 📄 LIVE PDF QUICK PREVIEW BOTTOM SHEET DRAWER */}
      {showPdfPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setShowPdfPreview(false)}
        >
          <style>{`
            @keyframes slideUpSheet {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          <div
            style={{
              width: 'min(720px, 100vw)',
              maxHeight: '88vh',
              backgroundColor: '#ffffff',
              borderRadius: '20px 20px 0 0',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #cbd5e1',
              animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px', backgroundColor: '#003666' }}>
              <div style={{ width: '44px', height: '5px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '99px' }} />
            </div>

            {/* Bottom Sheet Header */}
            <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#003666', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} />
                <span style={{ fontWeight: 800, fontSize: '0.96rem' }}>Live Summary Preview — {activeWs.name}</span>
              </div>
              <button type="button" onClick={() => setShowPdfPreview(false)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* Bottom Sheet Document Body */}
            <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #003666', paddingBottom: '0.8rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003666', margin: 0, letterSpacing: '-0.02em' }}>ATLAS SERVICES</h2>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Clinical & Commercial Workspace Document</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.76rem', color: '#475569' }}>
                  <div><b>Date:</b> {new Date().toLocaleDateString()}</div>
                  <div><b>Target:</b> {activeWs.targetEntity?.name || 'General Clinic'}</div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Item / Compound</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Dose / Format</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const rate = getItemUnitPrice(it);
                    const name = it.canonicalName || it.name || it.displayName || 'Product Item';
                    return (
                      <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{name}</td>
                        <td style={{ padding: '8px 10px', color: '#475569' }}>{it.dosage || 'Standard'} • {it.format || 'Vial'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{it.quantity || 1}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>${rate.toFixed(2)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#003666' }}>${((it.quantity || 1) * rate).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', paddingTop: '0.5rem', borderTop: '2px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Subtotal: <b>${subtotalSaleAmount.toFixed(2)}</b></div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Shipping ({selectedShippingMethod}): <b>${shippingCost.toFixed(2)}</b></div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#003666', marginTop: '4px' }}>Grand Total: ${grandTotal.toFixed(2)}</div>
              </div>
            </div>

            {/* Bottom Sheet Footer */}
            <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{ padding: '8px 14px', backgroundColor: '#003666', color: '#ffffff', border: 'none', borderRadius: '7px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                🖨️ Print / Export PDF
              </button>
              <button
                type="button"
                onClick={() => setShowPdfPreview(false)}
                style={{ padding: '8px 14px', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '7px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
