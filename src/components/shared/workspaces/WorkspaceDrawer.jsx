"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspaceStore, useShallow } from '../../../stores/useWorkspaceStore';
import { useDrawer } from '../../../context/DrawerContext';
import {
  FileText,
  ShieldCheck,
  Truck,
  Tag,
  Layers,
  Sparkles,
  Stethoscope
} from '@/lib/icons';
import notifier from '../../../services/NotificationService';
import { searchCatalogFast } from '../../../repositories/workspaceSearchRepository';
import { useRoleAccess } from '../../../hooks/useRoleAccess';
import { resolveVariantPrice } from '../../../utils/resolvePrice';
import PatientLabelSheetModal from '../../admin/prescriptions/PatientLabelSheetModal';

// Modular Subcomponents
import SaveKitModal from './drawer/SaveKitModal';
import WorkspaceDrawerHeader from './drawer/WorkspaceDrawerHeader';
import WorkspaceProductsAccordion from './drawer/WorkspaceProductsAccordion';
import WorkspaceRecipientAccordion from './drawer/WorkspaceRecipientAccordion';
import WorkspaceShippingAccordion from './drawer/WorkspaceShippingAccordion';
import WorkspaceFinancialAccordion from './drawer/WorkspaceFinancialAccordion';
import WorkspacePdfPreviewSheet from './drawer/WorkspacePdfPreviewSheet';

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
    addReconstitutionBacteriostaticWater,
    setWorkspaceIntent,
    setTargetEntity,
    setSelectedTargetType,
    setShippingDetails,
    setDiscountPercent,
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
      addReconstitutionBacteriostaticWater: s.addReconstitutionBacteriostaticWater,
      setWorkspaceIntent: s.setWorkspaceIntent,
      setTargetEntity: s.setTargetEntity,
      setSelectedTargetType: s.setSelectedTargetType,
      setShippingDetails: s.setShippingDetails,
      setDiscountPercent: s.setDiscountPercent,
      savedKits: s.savedKits,
      saveWorkspaceAsKit: s.saveWorkspaceAsKit,
      loadKitIntoWorkspace: s.loadKitIntoWorkspace,
      deleteSavedKit: s.deleteSavedKit
    }))
  );

  const { openDrawer } = useDrawer();
  const [mounted, setMounted] = useState(false);

  // Accordion Section Expansion States: Products ALWAYS expanded by default
  const [sectionExpanded, setSectionExpanded] = useState({
    products: true,
    recipient: false,
    shipping: false,
    financial: false
  });

  const [isSaveKitModalOpen, setIsSaveKitModalOpen] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [protocols, setProtocols] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchingCatalog, setSearchingCatalog] = useState(false);

  const wsList = Object.values(workspaces || {});
  const activeWs = workspaces[activeWorkspaceId] || wsList[0] || null;

  const { is, can, role } = useRoleAccess();
  const isDoctor = role === 'doctor' || is('doctor') || !can('manage:suppliers');
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fetch fast protocols and catalog products when drawer opens
  useEffect(() => {
    if (!isDrawerOpen) return;
    let isMounted = true;
    setSearchingCatalog(true);

    import('../../../repositories/protocolRepository')
      .then(mod => {
        if (typeof mod.getAllProtocols === 'function') {
          return mod.getAllProtocols();
        }
        return [];
      })
      .then(prots => {
        if (isMounted) setProtocols(prots || []);
      })
      .catch(console.error);

    searchCatalogFast('')
      .then(prods => {
        if (isMounted) setAvailableProducts(prods || []);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setSearchingCatalog(false);
      });

    return () => { isMounted = false; };
  }, [isDrawerOpen]);

  if (!mounted || !isDrawerOpen || !activeWs) return null;

  const items = activeWs.items || [];
  const selectedShippingMethod = activeWs.shippingMethod || 'cold_chain';
  const shippingAddress = activeWs.shippingAddress || '';
  const shippingNotes = activeWs.shippingNotes || '';
  const discountPercent = activeWs.discountPercent || 0;

  const getItemUnitPrice = (it) => {
    if (it.customPrice != null && !isDoctor) return Number(it.customPrice);
    if (isDoctor) {
      const resolved = resolveVariantPrice(it, { tier: 'clinic' });
      const amount = resolved?.amount ?? Number(it.unitPrice || it.price || it.unitRate || 0);
      return isNaN(amount) ? 0 : amount;
    }
    const p = Number(it.unitPrice || it.price || it.unitRate || 0);
    return isNaN(p) ? 0 : p;
  };

  const handleSaveAsProtocol = async () => {
    if (items.length === 0) {
      notifier.warning('Please add compounds to workspace before creating a protocol.');
      return;
    }
    try {
      const { createProtocol } = await import('../../../repositories/protocolRepository');
      const protocolName = activeWs.name || 'Custom Clinical Protocol';
      const newId = await createProtocol({
        protocol_name: protocolName,
        title: protocolName,
        category: 'Doctor Prescribed Protocol',
        visibility: 'private',
        drugs_used: items.map(it => ({
          product_title: it.canonicalName,
          dosage: it.dosage,
          format: it.format,
          quantity: it.quantity,
          route: it.route || 'Subcutaneous (SC)',
        })),
        phases: [{
          phase_title: 'Primary Regimen',
          duration_weeks: 4,
          drugs_used: items.map(it => ({
            product_title: it.canonicalName,
            dosage: it.dosage,
            format: it.format,
            quantity: it.quantity,
            route: it.route || 'Subcutaneous (SC)',
          })),
        }],
      });
      notifier.success(`Clinical Protocol "${protocolName}" saved (#${newId.slice(0, 6)})!`);
    } catch (err) {
      console.error('Save protocol error:', err);
      notifier.error('Failed to save protocol: ' + err.message);
    }
  };

  const workspacePrescriptions = items.map((it, idx) => ({
    id: `WS-${(it.productId || it.id || idx).toString().slice(0, 8)}`,
    name: it.canonicalName,
    title: it.canonicalName,
    volume: it.format || 'Standard Vial',
    dosage: it.dosage || 'Standard',
    instructions: it.instructions || `Administer ${it.dosage || 'prescribed dose'} as clinically directed by physician.`,
    quantityBottles: it.quantity || 1,
    items: [{
      name: it.canonicalName,
      strength: it.dosage || 'Standard',
    }],
  }));

  const targetPatient = activeWs.targetEntity?.type === 'patient'
    ? activeWs.targetEntity
    : {
        name: activeWs.targetEntity?.name || 'Patient Chart',
        id: activeWs.targetEntity?.id || 'pat-workspace',
        fileNumber: activeWs.targetEntity?.fileNumber || '50957',
      };

  const subtotalSaleAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const rate = getItemUnitPrice(it);
    return sum + (qty * rate);
  }, 0);

  const totalSupplierCost = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const cost = Number(it.supplierCost || 0);
    return sum + (qty * cost);
  }, 0);

  const shippingCost = selectedShippingMethod === 'cold_chain' ? 35 : selectedShippingMethod === 'express' ? 15 : 0;
  const discountAmount = discountPercent > 0 ? (subtotalSaleAmount * discountPercent) / 100 : 0;
  const grandTotal = Math.max(0, subtotalSaleAmount + shippingCost - discountAmount);

  const grossMarginAmount = Math.max(0, subtotalSaleAmount - totalSupplierCost);
  const marginPercent = subtotalSaleAmount > 0 ? Math.round((grossMarginAmount / subtotalSaleAmount) * 100) : 0;

  const toggleSection = (sectionKey) => {
    setSectionExpanded(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
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
        shippingCost,
        shippingAddress,
        shippingNotes,
        discountPercentage: discountPercent,
        grandTotal,
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
      shippingAddress,
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
          shippingCost,
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
        supplierCost,
      };
    });

    addItems(itemsToAdd, activeWs.id, { openDrawer: true });
    notifier.success(`Loaded ${itemsToAdd.length} peptide(s) from protocol "${proto.name || proto.title}"!`);
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
      supplierCost,
      quantity: 1,
    }, activeWs.id, { openDrawer: true });
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

      {/* 2. Responsive Side Panel / Bottom Sheet */}
      <div
        className="workspace-responsive-panel"
        style={{
          position: 'fixed',
          zIndex: 999999,
          backgroundColor: '#f8fafc',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes slideUpSheet {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .workspace-responsive-panel {
            top: 0;
            right: 0;
            width: min(480px, 100vw);
            height: 100dvh;
            max-height: 100vh;
            animation: slideLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @media (max-width: 768px) {
            .workspace-responsive-panel {
              top: auto !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100vw !important;
              height: calc(100dvh - 24px) !important;
              max-height: 94vh !important;
              border-radius: 20px 20px 0 0 !important;
              animation: slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            .workspace-mobile-drag-handle {
              display: flex !important;
            }
          }
        `}</style>

        {/* Header Module */}
        <WorkspaceDrawerHeader
          activeWs={activeWs}
          wsList={wsList}
          onClose={() => setDrawerOpen(false)}
          onSetActiveWorkspace={setActiveWorkspace}
          onCreateWorkspace={createWorkspace}
          onRenameWorkspace={renameWorkspace}
          onDuplicateWorkspace={duplicateWorkspace}
          onClearWorkspace={clearWorkspaceItems}
          onDeleteWorkspace={deleteWorkspace}
          onOpenSaveKitModal={() => {
            if (items.length === 0) {
              notifier.warning('Add products to the workspace before saving as a kit.');
              return;
            }
            setIsSaveKitModalOpen(true);
          }}
          isDoctor={isDoctor}
        />

        {/* Scrollable Body: Accordion Sections */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Section 1: Staged Products */}
          <WorkspaceProductsAccordion
            isExpanded={sectionExpanded.products}
            onToggleExpand={() => toggleSection('products')}
            items={items}
            activeWs={activeWs}
            subtotalSaleAmount={subtotalSaleAmount}
            getItemUnitPrice={getItemUnitPrice}
            onUpdateItemQuantity={(itemId, qty) => updateItemQuantity(itemId, qty, activeWs.id)}
            onUpdateItemPrice={(itemId, price) => updateItemPrice(itemId, price, activeWs.id)}
            onUpdateItemFormat={(itemId, format) => updateItemFormat(itemId, format, activeWs.id)}
            onRemoveItem={(itemId) => removeItem(itemId, activeWs.id)}
            onAddBacteriostaticWater={() => addReconstitutionBacteriostaticWater(activeWs.id)}
            protocols={protocols}
            availableProducts={availableProducts}
            savedKits={savedKits}
            onLoadProtocol={handleLoadProtocol}
            onAddProduct={handleAddProduct}
            onLoadKit={(kitId) => loadKitIntoWorkspace(kitId, activeWs.id)}
            onDeleteKit={deleteSavedKit}
            searchingCatalog={searchingCatalog}
            isDoctor={isDoctor}
          />

          {/* Section 2: Recipient & Operational Intent */}
          <WorkspaceRecipientAccordion
            isExpanded={sectionExpanded.recipient}
            onToggleExpand={() => toggleSection('recipient')}
            activeWs={activeWs}
            onSetIntent={(intent) => setWorkspaceIntent(intent, activeWs.id)}
            onSetTargetEntity={(ent) => setTargetEntity(ent, activeWs.id)}
            onSetSelectedTargetType={(type) => setSelectedTargetType(type, activeWs.id)}
            isDoctor={isDoctor}
          />

          {/* Section 3: Cold-Chain & Shipping Logistics (Only in commercial mode or if expanded) */}
          {!isDoctor && (
            <WorkspaceShippingAccordion
              isExpanded={sectionExpanded.shipping}
              onToggleExpand={() => toggleSection('shipping')}
              activeWs={activeWs}
              onUpdateShipping={(details) => setShippingDetails(details, activeWs.id)}
            />
          )}

          {/* Section 4: Commercial Financials & Margins */}
          <WorkspaceFinancialAccordion
            isExpanded={sectionExpanded.financial}
            onToggleExpand={() => toggleSection('financial')}
            activeWs={activeWs}
            subtotalSaleAmount={subtotalSaleAmount}
            totalSupplierCost={totalSupplierCost}
            shippingCost={shippingCost}
            discountPercent={discountPercent}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            grossMarginAmount={grossMarginAmount}
            marginPercent={marginPercent}
            onSetDiscountPercent={(pct) => setDiscountPercent(pct, activeWs.id)}
            isDoctor={isDoctor}
          />
        </div>

        {/* Sticky Footer Action Bar with iOS Safe-Area Padding */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            paddingBottom: 'calc(0.85rem + env(safe-area-inset-bottom, 16px))',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
            zIndex: 10,
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '99px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>💡 Add compounds above to unlock actions</span>
            </div>
          ) : isDoctor ? (
            /* ── Doctor Actions (Clinical Focus: Prescribing & Protocols Only - NO LABELS) ── */
            <>
              <button
                type="button"
                onClick={handleExecutePrescription}
                style={{
                  width: '100%',
                  minHeight: '46px',
                  padding: '12px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
                  touchAction: 'manipulation',
                }}
              >
                <ShieldCheck size={18} /> Prescribe All in Rx Builder (${grandTotal.toFixed(2)})
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSaveAsProtocol}
                  style={{
                    minHeight: '40px',
                    padding: '8px 10px',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    borderRadius: '8px',
                    border: '1.5px solid #bfdbfe',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    touchAction: 'manipulation',
                  }}
                  title="Save staged compounds as a new clinical protocol"
                >
                  <Layers size={15} /> Save as Protocol
                </button>

                <button
                  type="button"
                  onClick={() => setShowPdfPreview(true)}
                  style={{
                    minHeight: '40px',
                    padding: '8px 10px',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    touchAction: 'manipulation',
                  }}
                >
                  <FileText size={15} /> Clinical Summary
                </button>
              </div>
            </>
          ) : (
            /* ── Admin / Commercial Actions ── */
            <>
              {activeWs.intent === 'buy' ? (
                <button
                  type="button"
                  onClick={handleExecutePO}
                  style={{
                    width: '100%',
                    minHeight: '46px',
                    padding: '12px',
                    backgroundColor: '#c2410c',
                    color: 'white',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(194, 65, 12, 0.25)',
                    touchAction: 'manipulation',
                  }}
                >
                  <Truck size={17} /> Generate Purchase Order (${grandTotal.toFixed(2)})
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleExecuteQuotation}
                    style={{
                      width: '100%',
                      minHeight: '46px',
                      padding: '12px',
                      backgroundColor: '#003666',
                      color: 'white',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(0, 54, 102, 0.25)',
                      touchAction: 'manipulation',
                    }}
                  >
                    <FileText size={17} /> Generate B2B Quotation (${grandTotal.toFixed(2)})
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: isDoctor ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleExecutePrescription}
                      style={{
                        minHeight: '40px',
                        padding: '8px',
                        backgroundColor: '#0d9488',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                        touchAction: 'manipulation',
                      }}
                    >
                      <ShieldCheck size={15} /> Create Rx
                    </button>
                    {!isDoctor && (
                      <button
                        type="button"
                        onClick={() => setIsStickerModalOpen(true)}
                        style={{
                          minHeight: '40px',
                          padding: '8px',
                          backgroundColor: '#f0fdfa',
                          color: '#0f766e',
                          borderRadius: '8px',
                          border: '1.5px solid #99f6e4',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          touchAction: 'manipulation',
                        }}
                      >
                        <Tag size={15} /> Pharmapolis Stickers
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Live PDF Quick Preview Shortcut */}
              <button
                type="button"
                onClick={() => setShowPdfPreview(true)}
                style={{
                  width: '100%',
                  padding: '7px',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  touchAction: 'manipulation',
                }}
              >
                <FileText size={13} /> 👁️ Quick Live Document Summary
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save Kit In-App Modal (replacing window.prompt) */}
      <SaveKitModal
        isOpen={isSaveKitModalOpen}
        onClose={() => setIsSaveKitModalOpen(false)}
        defaultName={`${activeWs?.name || 'Workspace'} Kit`}
        onSave={(kitName) => {
          saveWorkspaceAsKit(kitName, activeWs.id);
          notifier.success(`Saved kit "${kitName}" successfully!`);
        }}
      />

      {/* Live PDF Document Summary Preview Bottom Sheet */}
      <WorkspacePdfPreviewSheet
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        activeWs={activeWs}
        items={items}
        getItemUnitPrice={getItemUnitPrice}
        subtotalSaleAmount={subtotalSaleAmount}
        shippingCost={shippingCost}
        discountAmount={discountAmount}
        grandTotal={grandTotal}
      />

      {/* Pharmapolis A4 Stickers Modal (7.5x4.5cm) for all Workspace Items */}
      {!isDoctor && (
        <PatientLabelSheetModal
          isOpen={isStickerModalOpen}
          onClose={() => setIsStickerModalOpen(false)}
          patient={targetPatient}
          prescriptions={workspacePrescriptions}
        />
      )}
    </>
  , document.body);
}
