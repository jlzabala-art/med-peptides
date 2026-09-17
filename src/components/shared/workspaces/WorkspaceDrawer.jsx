"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from '@/lib/icons';
import notifier from '../../../services/NotificationService';
import { searchCatalogFast } from '../../../repositories/workspaceSearchRepository';
import { useRoleAccess } from '../../../hooks/useRoleAccess';
import { resolveVariantPrice } from '../../../utils/resolvePrice';
import { resolveItemTierPricing } from '@/utils/tierPricingResolver';
import PatientLabelSheetModal from '../../admin/prescriptions/PatientLabelSheetModal';

// Modular Subcomponents
import SaveKitModal from './drawer/SaveKitModal';
import WorkspaceDrawerHeader from './drawer/WorkspaceDrawerHeader';
import WorkspaceStepperBar from './drawer/WorkspaceStepperBar';
import WorkspaceMiniSummaryStrip from './drawer/WorkspaceMiniSummaryStrip';
import WorkspaceProductsAccordion from './drawer/WorkspaceProductsAccordion';
import WorkspaceRecipientAccordion from './drawer/WorkspaceRecipientAccordion';
import WorkspaceShippingAccordion from './drawer/WorkspaceShippingAccordion';
import WorkspaceFinancialAccordion from './drawer/WorkspaceFinancialAccordion';
import WorkspacePdfPreviewSheet from './drawer/WorkspacePdfPreviewSheet';
import { useWorkspaceActions } from './hooks/useWorkspaceActions';
import { useContextualBinding } from './hooks/useContextualBinding';
import { estimateWorkspaceLogistics } from '@/utils/logisticsEstimator';

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

  // Stepper State: 0=Products, 1=Recipient, 2=Logistics (Admin), 3=Review
  const [activeStep, setActiveStep] = useState(0);

  const [isSaveKitModalOpen, setIsSaveKitModalOpen] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [protocols, setProtocols] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchingCatalog, setSearchingCatalog] = useState(false);

  const wsList = Object.values(workspaces || {});
  const activeWs = workspaces[activeWorkspaceId] || wsList[0] || null;

  const { is, can, role } = useRoleAccess();
  const isAdmin = role === 'admin' || is('admin') || can('view:cost_pricing');
  const isDoctor = !isAdmin && (role === 'doctor' || is('doctor') || role === 'medical_director' || role === 'clinic');
  const isWholesaler = !isAdmin && (role === 'wholesaler' || role === 'wholeseller' || is('wholesaler') || is('wholeseller'));
  const isPatient = !isAdmin && (role === 'patient' || is('patient'));
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

  const items = activeWs?.items || [];
  const selectedShippingMethod = activeWs?.shippingMethod || 'cold_chain';
  const shippingAddress = activeWs?.shippingAddress || '';
  const shippingNotes = activeWs?.shippingNotes || '';
  const discountPercent = activeWs?.discountPercent || 0;

  const steps = useMemo(() => {
    if (isDoctor) {
      return [
        { key: 'products', label: 'Products', isComplete: items.length > 0 },
        { key: 'recipient', label: 'Patient', isComplete: !!activeWs?.targetEntity },
        { key: 'review', label: 'Review & Prescribe', isComplete: items.length > 0 && !!activeWs?.targetEntity },
      ];
    }
    return [
      { key: 'products', label: 'Products', isComplete: items.length > 0 },
      { key: 'recipient', label: isWholesaler ? 'Client' : 'Recipient', isComplete: !!activeWs?.targetEntity },
      { key: 'shipping', label: 'Logistics', isComplete: true },
      { key: 'review', label: isAdmin ? 'Review & Margins' : 'Review & Order', isComplete: items.length > 0 && !!activeWs?.targetEntity },
    ];
  }, [isAdmin, isDoctor, isWholesaler, items.length, activeWs?.targetEntity]);

  const safeActiveStep = Math.min(activeStep, steps.length - 1);

  // Keyboard shortcut navigation (Left / Right Arrow)
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyNav = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (e.key === 'ArrowRight') {
        setActiveStep((s) => Math.min(steps.length - 1, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveStep((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [isDrawerOpen, steps.length]);

  const getItemTierInfo = (it) => {
    return resolveItemTierPricing(it, {
      isAdmin,
      isDoctor,
      isWholesaler,
      isPatient,
      activeWs,
    });
  };

  const getItemUnitPrice = (it) => {
    // Admin with explicit manual price override
    if (isAdmin && it.customPrice != null) return Number(it.customPrice);

    const tierInfo = getItemTierInfo(it);
    return tierInfo.effectiveUnitPrice;
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

  // ── Dynamic Logistics Cost from Predictive Engine ─────────────────────
  const logisticsEstimate = useMemo(() => {
    return estimateWorkspaceLogistics(activeWs, items);
  }, [
    activeWs?.targetEntity,
    activeWs?.shippingAddress,
    activeWs?.selectedShippingOptionId,
    activeWs?.selectedWarehouseId,
    activeWs?.shippingCostOverride,
    items.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    items.map((it) => it.supplierName || it.supplier).join(','),
  ]);
  const shippingCost = logisticsEstimate.estimatedCost;
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

  // Contextual Auto-Binding for Doctors & Routes
  useContextualBinding({ isDoctor });

  // Modular Workspace Actions (Prescriptions, Quotes, POs, Protocols, 1-Tap Regimens)
  const {
    isSavingProtocol,
    handleExecutePrescription,
    handleExecuteQuotation,
    handleExecutePO,
    handleSaveAsProtocol,
    handleLoadProtocol,
    handleAddProduct,
    handleAddClinicalRegimen,
  } = useWorkspaceActions({
    activeWs,
    items,
    selectedShippingMethod,
    shippingCost,
    shippingAddress,
    shippingNotes,
    discountPercent,
    grandTotal,
    getItemUnitPrice,
    setDrawerOpen,
    openDrawer,
    addItems,
    addItem,
    isAdmin,
    isDoctor,
    isWholesaler,
    isPatient,
    role,
  });

  const [isWideDrawer, setIsWideDrawer] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('atlas_ws_wide') === 'true';
      } catch (e) {}
    }
    return false;
  });

  const toggleWideDrawer = () => {
    setIsWideDrawer(prev => {
      const next = !prev;
      try { localStorage.setItem('atlas_ws_wide', String(next)); } catch (e) {}
      return next;
    });
  };

  // GCP Keyboard Shortcuts: Esc to close, Cmd+Enter to execute primary
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (items.length > 0) {
          if (isDoctor) handleExecutePrescription();
          else if (activeWs?.intent === 'buy') handleExecutePO();
          else handleExecuteQuotation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, items.length, isDoctor, activeWs?.intent]);

  if (!mounted || !isDrawerOpen || !activeWs) return null;

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
            width: ${isWideDrawer ? 'min(720px, 95vw)' : 'min(480px, 100vw)'};
            height: 100dvh;
            max-height: 100vh;
            animation: slideLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @media (max-width: 768px) {
            .workspace-responsive-panel {
              top: auto !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100vw !important;
              height: calc(100dvh - 20px) !important;
              max-height: 95vh !important;
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
          isWideDrawer={isWideDrawer}
          onToggleWideDrawer={toggleWideDrawer}
        />

        {/* Interactive Stepper Navigation Bar */}
        <WorkspaceStepperBar
          steps={steps}
          activeStep={safeActiveStep}
          onGoToStep={setActiveStep}
        />

        {/* Step Views Container: 100% full height for the active step */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column' }}>
          {/* Step 0: Staged Products */}
          <div style={{ display: safeActiveStep === 0 ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
            <WorkspaceProductsAccordion
              stepperMode={true}
              isExpanded={true}
              onToggleExpand={() => {}}
              items={items}
              activeWs={activeWs}
              subtotalSaleAmount={subtotalSaleAmount}
              getItemUnitPrice={getItemUnitPrice}
              getItemTierInfo={getItemTierInfo}
              onUpdateItemQuantity={(itemId, qty) => updateItemQuantity(itemId, qty, activeWs.id)}
              onUpdateItemPrice={(itemId, price) => {
                if (isAdmin) updateItemPrice(itemId, price, activeWs.id);
              }}
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
              isAdmin={isAdmin}
              isDoctor={isDoctor}
              isWholesaler={isWholesaler}
              isPatient={isPatient}
              onAddClinicalRegimen={handleAddClinicalRegimen}
            />
          </div>

          {/* Step 1: Recipient & Routing */}
          <div style={{ display: safeActiveStep === 1 ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
            <WorkspaceRecipientAccordion
              stepperMode={true}
              isExpanded={true}
              onToggleExpand={() => {}}
              activeWs={activeWs}
              onSetIntent={(intent) => setWorkspaceIntent(intent, activeWs.id)}
              onSetTargetEntity={(ent) => setTargetEntity(ent, activeWs.id)}
              onSetSelectedTargetType={(type) => setSelectedTargetType(type, activeWs.id)}
              isAdmin={isAdmin}
              isDoctor={isDoctor}
              isWholesaler={isWholesaler}
              isPatient={isPatient}
            />
          </div>

          {/* Step 2 (Admin/Wholesaler): Logistics */}
          {!isDoctor && (
            <div style={{ display: safeActiveStep === 2 ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <WorkspaceShippingAccordion
                stepperMode={true}
                isExpanded={true}
                onToggleExpand={() => {}}
                activeWs={activeWs}
                onUpdateShipping={(details) => setShippingDetails(details, activeWs.id)}
              />
            </div>
          )}

          {/* Step 2 (Doctor) or Step 3 (Non-Doctor): Review & Financials */}
          <div style={{ display: safeActiveStep === (isDoctor ? 2 : 3) ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
            <WorkspaceFinancialAccordion
              stepperMode={true}
              isExpanded={true}
              onToggleExpand={() => {}}
              activeWs={activeWs}
              subtotalSaleAmount={subtotalSaleAmount}
              totalSupplierCost={totalSupplierCost}
              shippingCost={shippingCost}
              discountPercent={discountPercent}
              discountAmount={discountAmount}
              grandTotal={grandTotal}
              grossMarginAmount={grossMarginAmount}
              marginPercent={marginPercent}
              onSetDiscountPercent={(pct) => {
                if (isAdmin) setDiscountPercent(pct, activeWs.id);
              }}
              isAdmin={isAdmin}
              isDoctor={isDoctor}
              isWholesaler={isWholesaler}
              isPatient={isPatient}
            />
          </div>
        </div>

        {/* Always-visible Mini-Summary Strip */}
        <WorkspaceMiniSummaryStrip
          itemsCount={items.length}
          activeWs={activeWs}
          grandTotal={grandTotal}
          isAdmin={isAdmin}
          isDoctor={isDoctor}
          isWholesaler={isWholesaler}
          isPatient={isPatient}
          activeStep={safeActiveStep}
          onGoToStep={setActiveStep}
        />

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
          ) : (
            <>
              {/* Stepper Navigation Controls (When not on the final step) */}
              {safeActiveStep < steps.length - 1 ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    disabled={safeActiveStep === 0}
                    style={{
                      padding: '10px 14px',
                      minHeight: '44px',
                      backgroundColor: safeActiveStep === 0 ? '#f1f5f9' : '#ffffff',
                      color: safeActiveStep === 0 ? '#cbd5e1' : '#475569',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: safeActiveStep === 0 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      touchAction: 'manipulation',
                    }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      minHeight: '44px',
                      backgroundColor: isDoctor ? '#0d9488' : '#003666',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: isDoctor ? '0 2px 8px rgba(13, 148, 136, 0.25)' : '0 2px 8px rgba(0, 54, 102, 0.25)',
                      touchAction: 'manipulation',
                    }}
                  >
                    Next: {steps[safeActiveStep + 1]?.label} <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                /* ── Final Review Step Actions ── */
                <>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                      style={{
                        padding: '10px 12px',
                        minHeight: '44px',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        touchAction: 'manipulation',
                      }}
                      title="Back to previous step"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {isDoctor ? (
                      <button
                        type="button"
                        onClick={handleExecutePrescription}
                        style={{
                          flex: 1,
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
                    ) : activeWs.intent === 'buy' ? (
                      <button
                        type="button"
                        onClick={handleExecutePO}
                        style={{
                          flex: 1,
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
                      <button
                        type="button"
                        onClick={handleExecuteQuotation}
                        style={{
                          flex: 1,
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
                    )}
                  </div>

                  {/* Secondary Action Grid */}
                  {isDoctor ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleSaveAsProtocol}
                        disabled={isSavingProtocol}
                        style={{
                          minHeight: '38px',
                          padding: '6px 10px',
                          backgroundColor: isSavingProtocol ? '#f1f5f9' : '#eff6ff',
                          color: isSavingProtocol ? '#94a3b8' : '#1d4ed8',
                          borderRadius: '8px',
                          border: '1.5px solid #bfdbfe',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: isSavingProtocol ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          touchAction: 'manipulation',
                        }}
                      >
                        <Layers size={14} /> {isSavingProtocol ? 'Saving...' : 'Save as Protocol'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPdfPreview(true)}
                        style={{
                          minHeight: '38px',
                          padding: '6px 10px',
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
                        <FileText size={14} /> Clinical Summary
                      </button>
                    </div>
                  ) : activeWs.intent !== 'buy' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleExecutePrescription}
                        style={{
                          minHeight: '38px',
                          padding: '6px 8px',
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
                        <ShieldCheck size={14} /> Create Rx
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsStickerModalOpen(true)}
                        style={{
                          minHeight: '38px',
                          padding: '6px 8px',
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
                        <Tag size={14} /> Stickers
                      </button>
                    </div>
                  ) : null}

                  {/* Document Summary Quick View */}
                  <button
                    type="button"
                    onClick={() => setShowPdfPreview(true)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      touchAction: 'manipulation',
                    }}
                  >
                    <FileText size={13} /> 👁️ Quick Document Preview
                  </button>
                </>
              )}
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
