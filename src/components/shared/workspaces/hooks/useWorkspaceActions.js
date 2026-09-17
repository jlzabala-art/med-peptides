"use client";

import { useCallback, useState } from 'react';
import notifier from '@/services/NotificationService';
import { normalizeWorkspaceItem, normalizeWorkspaceItemList } from '@/utils/clinicalItemNormalizer';

/**
 * useWorkspaceActions
 * Decouples execution pipelines (Prescription, B2B Quote, PO, Protocol)
 * from Workspace presentation components.
 * 
 * Enforces role-based data shielding:
 * - Doctors NEVER see or transmit supplier costs or wholesale margins
 * - Normalizes items via clinicalItemNormalizer
 */
export function useWorkspaceActions({
  activeWs,
  items = [],
  selectedShippingMethod = 'cold_chain',
  shippingCost = 0,
  shippingAddress = '',
  shippingNotes = '',
  discountPercent = 0,
  grandTotal = 0,
  getItemUnitPrice,
  setDrawerOpen,
  openDrawer,
  addItems,
  addItem,
  isDoctor = false,
  role = 'doctor',
}) {
  const wsId = activeWs?.id;
  const [isSavingProtocol, setIsSavingProtocol] = useState(false);

  // 1. Execute Clinical Prescription (Rx-Builder)
  const handleExecutePrescription = useCallback(() => {
    if (!items || items.length === 0) {
      notifier.warning('Please add compounds before creating a prescription.');
      return;
    }

    if (setDrawerOpen) setDrawerOpen(false);

    // Normalize items for clinical prescription safely
    const normalizedItems = normalizeWorkspaceItemList(items, { role: isDoctor ? 'doctor' : role });

    if (openDrawer) {
      openDrawer('rx-builder', 'new', {
        initialItems: normalizedItems.map((it) => ({
          type: 'product',
          id: it.id,
          productId: it.productId,
          name: it.canonicalName,
          sku: it.sku,
          price: getItemUnitPrice ? getItemUnitPrice(it) : it.unitPrice,
          quantity: it.quantity,
          dosage: it.dosage,
          format: it.format,
          reconstitutionMl: it.reconstitutionMl,
        })),
        patientId: activeWs?.targetEntity?.type === 'patient' ? activeWs.targetEntity.id : null,
        targetPatient: activeWs?.targetEntity?.type === 'patient' ? activeWs.targetEntity : null,
        shippingMethod: selectedShippingMethod,
        shippingAddress,
        sourceModule: 'workspace',
      });
    }

    notifier.info(`Transferred ${normalizedItems.length} compounds to Prescription Builder.`);
  }, [items, setDrawerOpen, isDoctor, role, openDrawer, getItemUnitPrice, activeWs, selectedShippingMethod, shippingAddress]);

  // 2. Execute B2B Quotation Wizard (Commercial/Admin only)
  const handleExecuteQuotation = useCallback(() => {
    if (!items || items.length === 0) {
      notifier.warning('Please add products to the workspace before generating a quote.');
      return;
    }

    if (setDrawerOpen) setDrawerOpen(false);

    const normalizedItems = normalizeWorkspaceItemList(items, { role: isDoctor ? 'doctor' : role });

    window.dispatchEvent(
      new CustomEvent('open-quotation-wizard', {
        detail: {
          type: 'manual',
          clientName: activeWs?.targetEntity?.name || '',
          clientId: activeWs?.targetEntity?.id || '',
          recipientType: activeWs?.targetEntity?.type || 'clinic',
          shippingMethod: selectedShippingMethod,
          shippingCost,
          shippingAddress,
          shippingNotes,
          discountPercentage: discountPercent,
          grandTotal,
          items: normalizedItems.map((it) => ({
            compoundName: it.canonicalName,
            dosage: it.dosage,
            format: it.format,
            quantity: it.quantity,
            unitRate: getItemUnitPrice ? getItemUnitPrice(it) : it.unitPrice,
            // Supplier cost only passed if not a doctor
            supplierCost: isDoctor ? 0 : it.supplierCost,
            supplierName: isDoctor ? '' : it.supplierName,
            totalPrice: (it.quantity || 1) * (getItemUnitPrice ? getItemUnitPrice(it) : it.unitPrice),
          })),
        },
      })
    );

    notifier.info(`Launching B2B Quotation Wizard with ${items.length} items (${selectedShippingMethod.toUpperCase()} shipping).`);
  }, [items, setDrawerOpen, isDoctor, role, activeWs, selectedShippingMethod, shippingCost, shippingAddress, shippingNotes, discountPercent, grandTotal, getItemUnitPrice]);

  // 3. Execute Purchase Order (Suppliers/Admin only)
  const handleExecutePO = useCallback(() => {
    if (isDoctor) {
      notifier.warning('Purchase orders are restricted to administrative personnel.');
      return;
    }

    if (!items || items.length === 0) {
      notifier.warning('Please add items to workspace before generating a purchase order.');
      return;
    }

    if (setDrawerOpen) setDrawerOpen(false);

    window.dispatchEvent(
      new CustomEvent('open-quick-create', {
        detail: {
          type: 'new-purchase-order',
          payload: {
            supplierId: activeWs?.targetEntity?.type === 'supplier' ? activeWs.targetEntity.id : '',
            supplierName: activeWs?.targetEntity?.name || '',
            shippingMethod: selectedShippingMethod,
            shippingCost,
            items: items.map((it) => ({
              productId: it.productId,
              variantId: it.variantId,
              name: it.canonicalName,
              quantity: it.quantity,
              unitCost: it.supplierCost,
              sku: it.sku,
            })),
          },
        },
      })
    );

    notifier.success(`Opening Purchase Order form with ${items.length} line items.`);
  }, [isDoctor, items, setDrawerOpen, activeWs, selectedShippingMethod, shippingCost]);

  // 4. Save Workspace Staged Items as a Clinical Protocol (Idempotent non-blocking)
  const handleSaveAsProtocol = useCallback(async () => {
    if (!items || items.length === 0) {
      notifier.warning('Please add compounds to workspace before creating a protocol.');
      return;
    }

    if (isSavingProtocol) return; // Prevent concurrent requests

    setIsSavingProtocol(true);
    try {
      const { createProtocol } = await import('@/repositories/protocolRepository');
      const protocolName = activeWs?.name || 'Custom Clinical Protocol';
      const drugs = items.map((it) => ({
        product_title: it.canonicalName,
        dosage: it.dosage,
        format: it.format,
        quantity: it.quantity,
        route: it.route || 'Subcutaneous (SC)',
      }));

      const newId = await createProtocol({
        protocol_name: protocolName,
        title: protocolName,
        category: 'Doctor Prescribed Protocol',
        visibility: 'private',
        drugs_used: drugs,
        phases: [
          {
            phase_title: 'Primary Regimen',
            duration_weeks: 4,
            drugs_used: drugs,
          },
        ],
      });

      notifier.success(`Clinical Protocol "${protocolName}" saved (#${(newId || '').slice(0, 6)})!`);
    } catch (err) {
      console.error('Save protocol error:', err);
      notifier.error('Failed to save protocol: ' + err.message);
    } finally {
      setIsSavingProtocol(false);
    }
  }, [items, activeWs, isSavingProtocol]);

  // 5. Load Clinical Protocol into Workspace
  const handleLoadProtocol = useCallback(
    (proto) => {
      const peptides = proto.peptides || proto.drugs_used || [];
      const rawList = peptides.length > 0 ? peptides : [{ id: proto.id, canonicalName: proto.name || proto.title }];

      const itemsToAdd = rawList.map((pep) =>
        normalizeWorkspaceItem(pep, { role: isDoctor ? 'doctor' : role })
      );

      if (addItems && wsId) {
        addItems(itemsToAdd, wsId, { openDrawer: true });
        notifier.success(`Loaded ${itemsToAdd.length} compound(s) from protocol "${proto.name || proto.title}"!`);
      }
    },
    [isDoctor, role, addItems, wsId]
  );

  // 6. Add Single Product from Catalog
  const handleAddProduct = useCallback(
    (prod) => {
      const normalized = normalizeWorkspaceItem(prod, { role: isDoctor ? 'doctor' : role });
      if (addItem && wsId) {
        addItem(normalized, wsId, { openDrawer: true });
        notifier.success(`Added "${normalized.canonicalName}" to workspace!`);
      }
    },
    [isDoctor, role, addItem, wsId]
  );

  // 7. Add 1-Tap Clinical Regimen (e.g. GLP-1, Tissue Repair, NAD+)
  const handleAddClinicalRegimen = useCallback(
    (regimen) => {
      if (!regimen?.compounds || regimen.compounds.length === 0) return;

      const normalizedList = regimen.compounds.map((cmp) =>
        normalizeWorkspaceItem(cmp, { role: isDoctor ? 'doctor' : role })
      );

      if (addItems && wsId) {
        addItems(normalizedList, wsId, { openDrawer: true });
        notifier.success(`Loaded clinical regimen: "${regimen.name}" (${normalizedList.length} items)!`);
      }
    },
    [isDoctor, role, addItems, wsId]
  );

  return {
    isSavingProtocol,
    handleExecutePrescription,
    handleExecuteQuotation,
    handleExecutePO,
    handleSaveAsProtocol,
    handleLoadProtocol,
    handleAddProduct,
    handleAddClinicalRegimen,
  };
}
