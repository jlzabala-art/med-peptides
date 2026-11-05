'use client';
import orderRepository from '../../../repositories/orderRepository';
import * as quotationRepository from '../../../repositories/quotationRepository';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useOrderBuilderStore } from '../../../stores/orderBuilderStore';
import { normalizeRxRefillItems, computeRxRefillIntelligence } from '../../../stores/orderBuilderSlices/createOrderPrefetchSlice';

import BuilderTargetSelector from './BuilderTargetSelector';
import BuilderCatalogSearch from './BuilderCatalogSearch';
import BuilderDraftCart, { getItemResolvedPrice } from './BuilderDraftCart';
import BuilderProtocolSearch from './BuilderProtocolSearch';
import RefillPrescriptionWorkbench from './RefillPrescriptionWorkbench';
import UniversalUserSelector from '../UniversalUserSelector';

import Save from "lucide-react/dist/esm/icons/save";
import Send from "lucide-react/dist/esm/icons/send";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import User from "lucide-react/dist/esm/icons/user";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Loader from "lucide-react/dist/esm/icons/loader";
import Layers from "lucide-react/dist/esm/icons/layers";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import History from "lucide-react/dist/esm/icons/history";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";

import { createPrescription, updatePrescription } from '../../../services/prescriptionsService';
import { getPharmapolisLabelsForPrescription } from '../../../data/pharmapolisLabelsMap';
import { createPurchaseOrder } from '../../../repositories/supplierRepository';
import { PRESCRIPTION_STATUSES } from '../../../schemas/prescriptionSchema';
import toast from 'react-hot-toast';
import notifier from '../../../services/NotificationService';

// ─── Step definitions (full flow) ─────────────────────────────────────────────
const ALL_STEPS = [
  { id: 'patient',   label: 'Patient',          icon: User },
  { id: 'protocol',  label: 'Protocol / Items',  icon: Layers },
  { id: 'doctor',    label: 'Doctor & Notes',    icon: Stethoscope },
];

/**
 * UniversalOrderBuilder — "Rx Everywhere"
 *
 * Centralized component for generating:
 * - Patient Prescriptions (mode: 'prescription') — adaptive wizard
 * - Wholesaler B2B Orders (mode: 'wholesale' | 'admin')
 *
 * Context props (pre-load from any module):
 * @param {Object}  initialPatient    — pre-select patient { id, name, email, ... }
 * @param {Object}  initialProtocol   — pre-load protocol { id, name, phases, ... }
 * @param {Object}  initialDoctor     — pre-assign doctor { id, name, ... }
 * @param {Array}   initialItems      — pre-fill cart with items
 *
 * Legacy props (keep backwards-compat):
 * @param {string}  initialProtocolId
 * @param {string}  initialProtocolName
 * @param {string}  initialDoctorId
 * @param {string}  initialDoctorName
 * @param {Object}  initialTarget     — alias for initialPatient
 */
export default function UniversalOrderBuilder({
  mode = 'prescription',
  sourceModule = 'unknown',  // Context Router: which module opened this builder
  // New context props
  initialPatient = null,
  initialProtocol = null,
  initialDoctor = null,
  initialSourceRx = null,
  isRefill = false,
  // Legacy props (backwards compat)
  initialItems = [],
  initialTarget = null,
  initialProtocolId = null,
  initialProtocolName = null,
  initialDoctorId = null,
  initialDoctorName = null,
  onSaved,
  onCanceled,
}) {
  const { currentUser } = useAuth();

  const {
    carts,
    activeTargetId,
    setActiveTargetId,
    pendingItem,
    setSelectedTarget,
    setDraftItems,
    addItem,
    updateItemQuantity,
    removeItem,
    clear,
    clinicalAlerts,
    patientHistoryCache,
    prefetchPatientHistory,
  } = useOrderBuilderStore();

  const activeCart = carts?.[activeTargetId] || {};
  const draftItems = activeCart.draftItems || [];
  const selectedTarget = activeCart.target || null;

  const [selectedPricingTier, setSelectedPricingTier] = useState(null);

  const pricingTier = useMemo(() => {
    if (selectedPricingTier) return selectedPricingTier;
    if (selectedTarget?.pricingTier) return selectedTarget.pricingTier;
    return mode === 'wholesale' ? 'wholesale' : 'clinic';
  }, [selectedPricingTier, selectedTarget, mode]);

  const totals = useMemo(() => {
    let subtotal = 0;
    draftItems?.forEach(item => {
      const unitPrice = getItemResolvedPrice(item, pricingTier);
      subtotal += (unitPrice * (item.quantity || 1));
    });
    const tax = subtotal * 0.05;
    return { subtotal, tax, total: subtotal + tax };
  }, [draftItems, pricingTier]);

  // Normalize: initialPatient takes precedence over initialTarget (legacy)
  const resolvedInitialPatient = initialPatient || initialTarget;
  // Normalize: initialProtocol object takes precedence over id/name strings
  const resolvedProtocolId   = initialProtocol?.id   || initialProtocolId   || null;
  const resolvedProtocolName = initialProtocol?.name || initialProtocolName || null;
  // Normalize: initialDoctor object takes precedence over id/name strings
  const resolvedInitialDoctor = initialDoctor
    ? { id: initialDoctor.id, name: initialDoctor.name || initialDoctor.displayName }
    : initialDoctorId
    ? { id: initialDoctorId, name: initialDoctorName }
    : null;

  // ─── Determine which steps are needed (adaptive wizard) ──────────────────
  // CRITICAL UX FIX: Never skip Step 1 ('Protocol / Items & Refill Workbench') in prescription mode!
  // Especially when opening a Refill or pre-loaded prescription, the operator MUST see the
  // Labels-style formula breakdown, check/uncheck items, edit concentrations, or add products.
  const activeSteps = useMemo(() => {
    if (mode !== 'prescription') return ALL_STEPS;
    const steps = [];
    if (!resolvedInitialPatient) steps.push(ALL_STEPS[0]);  // need patient
    steps.push(ALL_STEPS[1]); // ALWAYS include Formulas / Items & Refill Workbench step
    steps.push(ALL_STEPS[2]); // doctor & notes always last
    return steps;
  }, [mode, resolvedInitialPatient]);

  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [protocolLoaded, setProtocolLoaded] = useState(!!resolvedProtocolId);
  const [activeSourceRx, setActiveSourceRx] = useState(initialSourceRx || null);

  // Refill Cycle & Next Refill Scheduler state
  const [refillConfig, setRefillConfig] = useState(() => {
    const defaultDays = Number(initialSourceRx?.refillCycleDays) || 90;
    const d = new Date();
    d.setDate(d.getDate() + defaultDays);
    return {
      cycleDays: defaultDays,
      nextRefillDate: d.toISOString().split('T')[0],
      refillsRemaining: 1,
    };
  });

  const [selectedDoctor, setSelectedDoctor] = useState(resolvedInitialDoctor);
  const [clinicalIndication, setClinicalIndication] = useState(initialSourceRx?.clinicalIndication || '');
  const [treatmentGoal, setTreatmentGoal]   = useState(initialSourceRx?.treatmentGoal || '');
  const [activeTab, setActiveTab] = useState(
    isRefill || initialSourceRx || (resolvedInitialPatient && !resolvedProtocolId) ? 'refill' : 'protocol'
  );
  const [selectedRefillMap, setSelectedRefillMap] = useState({});
  const [refillQtyMap, setRefillQtyMap] = useState({});
  const [generateSupplierPO, setGenerateSupplierPO] = useState(true);
  const [splitPrescriptions, setSplitPrescriptions] = useState(false);
  const [itemTreatmentTypes, setItemTreatmentTypes] = useState({});
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState(null);

  // Auto-sync notes to localStorage (Draft Auto-Save)
  const draftNotesKey = `__atlas_rx_notes_${selectedDoctor?.id || 'doc'}_${selectedTarget?.id || 'target'}`;

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const savedNotes = localStorage.getItem(draftNotesKey);
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        if (parsed.clinicalIndication && !clinicalIndication) setClinicalIndication(parsed.clinicalIndication);
        if (parsed.treatmentGoal && !treatmentGoal) setTreatmentGoal(parsed.treatmentGoal);
      }
    } catch (e) {
      console.warn('Error reading saved draft notes:', e);
    }
  }, [draftNotesKey]);

  useEffect(() => {
    if (!clinicalIndication && !treatmentGoal) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftNotesKey, JSON.stringify({
          clinicalIndication,
          treatmentGoal,
          timestamp: Date.now(),
        }));
        setLastAutoSavedTime(new Date());
      } catch (e) {
        console.warn('Error saving draft notes:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [clinicalIndication, treatmentGoal, draftNotesKey]);

  // ─── Initialize target from props & ensure prescription history is prefetched ───
  useEffect(() => {
    if (resolvedInitialPatient && (!selectedTarget || selectedTarget.id !== resolvedInitialPatient.id)) {
      setSelectedTarget(resolvedInitialPatient);
    }
  }, [resolvedInitialPatient, selectedTarget, setSelectedTarget]);

  useEffect(() => {
    if (selectedTarget?.id || selectedTarget?.name) {
      prefetchPatientHistory?.(selectedTarget.id, selectedTarget.name);
    }
  }, [selectedTarget?.id, selectedTarget?.name, prefetchPatientHistory]);

  // ─── Initialize items from props (or enriched Labels-style formulas if initialSourceRx is passed) ───
  useEffect(() => {
    if (initialSourceRx && draftItems.length === 0) {
      let labels = [];
      try {
        labels = getPharmapolisLabelsForPrescription(initialSourceRx) || [];
      } catch (e) {
        console.warn('Error extracting Pharmapolis labels for initialSourceRx:', e);
      }
      const rawRefillItems = normalizeRxRefillItems(initialSourceRx) || [];
      const count = Math.max(labels.length, rawRefillItems.length);

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const lbl = labels[i] || {};
          const raw = rawRefillItems[i] || {};
          const key = raw.id || raw.productId || lbl.id || `refill_formula_${i + 1}`;
          const apisList = Array.isArray(lbl.apis) && lbl.apis.length > 0
            ? lbl.apis.map((a) => ({
                name: a.name || a.drugName || a.activeIngredient || 'Active Ingredient',
                dose: a.dose || a.dosage || a.strength || '',
              }))
            : [];
          const formulaTitle =
            lbl.productTitle && !/^compounded pharmaceutical protocol$/i.test(lbl.productTitle)
              ? lbl.productTitle
              : raw.productName || raw.name || lbl.productName || `Formula ${i + 1}`;
          const formulaComposition =
            lbl.formula ||
            (apisList.length > 0 ? apisList.map((a) => `${a.name} ${a.dose}`.trim()).join(' + ') : raw.dosage || '');
          const vehicleName =
            typeof lbl.vehicle === 'string'
              ? lbl.vehicle
              : lbl.vehicle?.name || raw.vehicle || 'Pharmaceutical Compounding Base';
          const volumeText = lbl.volume || raw.volume || raw.format || raw.dispensingForm || '100 mL / 90 Caps';
          const dosageFormText = lbl.dosageForm || raw.dispensingForm || raw.format || 'Compounded Preparation';
          const directionsText = lbl.directions || raw.posology || raw.instructions || '';

          addItem({
            id: key,
            _refillKey: key,
            productId: raw.productId || raw.id || `rx-refill-${initialSourceRx.id}-f${i + 1}`,
            variantId: raw.variantId || null,
            sku: raw.sku || lbl.batchCode || '',
            name: formulaTitle,
            productName: formulaTitle,
            price: Number(raw.price || raw.unitPrice || 145) || 145,
            quantity: Number(raw.quantity) || 1,
            dosage: formulaComposition,
            formula: formulaComposition,
            vehicle: vehicleName,
            volume: volumeText,
            presentation: `${dosageFormText} · ${volumeText}`,
            frequency: directionsText,
            posology: directionsText,
            instructions: directionsText,
            route: dosageFormText,
            duration: `${refillConfig.cycleDays || 90} days`,
            sourceId: `refill-${initialSourceRx.id}`,
            sourceType: 'refill',
            apis: apisList,
          });
        }
        return;
      }
    }

    if (initialItems && initialItems.length > 0 && draftItems.length === 0) {
      initialItems.forEach(item => {
        if (!item.productId) console.warn("UniversalOrderBuilder: Missing productId in initialItems", item);
        addItem({
          id:        item.id || item.productId || crypto.randomUUID(),
          productId: item.productId || item.id || crypto.randomUUID(),
          variantId: item.variantId || null,
          sku:       item.sku || '',
          name:      item.productName || item.name || 'Unknown Item',
          price:     item.price || item.unitPrice || 145,
          quantity:  item.quantity || 1,
          duration:  item.duration,
          dosage:    item.dosage || item.dose || item.formula,
          frequency: item.frequency || item.posology || item.instructions,
          route:     item.route || item.format || item.dispensingForm,
        });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load items from protocol object if provided ──────────────────────────
  useEffect(() => {
    if (!initialProtocol || draftItems.length > 0) return;
    const phasePeptides = initialProtocol.phases?.flatMap(ph =>
      (ph.peptides || ph.items || []).map(pep => {
        if (!pep.productId) console.warn("UniversalOrderBuilder: Missing productId in initialProtocol phases", pep);
        return {
          id:        pep.id || pep.productId || crypto.randomUUID(),
          productId: pep.productId,
          variantId: pep.variantId || null,
          sku:       pep.sku || '',
          name:      pep.productName || pep.name || 'Peptide',
          price:     pep.price || 0,
          quantity:  pep.quantity || 1,
          dosage:    pep.dosage,
          frequency: pep.frequency,
          route:     pep.route,
          duration:  pep.duration,
        };
      })
    ) || [];
    phasePeptides.forEach(item => addItem(item));
    if (phasePeptides.length > 0) setProtocolLoaded(true);
  }, [initialProtocol]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handle protocol selected from BuilderProtocolSearch ─────────────────
  const handleSelectProtocol = (protocol) => {
    if (!protocol) return;
    // Clear existing and add new items
    clear();
    let items = [];
    if (protocol.bom && protocol.bom.length > 0) {
      items = protocol.bom.map(pep => {
        if (!pep.productId) console.warn("UniversalOrderBuilder: Missing productId in protocol.bom", pep);
        return {
          id:        pep.id || pep.productId || crypto.randomUUID(),
          productId: pep.productId,
          variantId: pep.variantId || null,
          sku:       pep.sku || '',
          name:      pep.productName || pep.name || 'Protocol Item',
          price:     pep.price || 0,
          quantity:  pep.quantity || 1,
          dosage:    pep.dosage,
          frequency: pep.frequency,
          route:     pep.route,
          duration:  pep.duration,
        };
      });
    } else {
      console.warn("UniversalOrderBuilder: Protocol missing bom array, falling back to phases", protocol);
      items = protocol.phases?.flatMap(ph =>
        (ph.peptides || ph.items || []).map(pep => {
          if (!pep.productId) console.warn("UniversalOrderBuilder: Missing productId in protocol.phases", pep);
          return {
            id:        pep.id || pep.productId || crypto.randomUUID(),
            productId: pep.productId,
            variantId: pep.variantId || null,
            sku:       pep.sku || '',
            name:      pep.productName || pep.name || 'Peptide',
            price:     pep.price || 0,
            quantity:  pep.quantity || 1,
            dosage:    pep.dosage,
            frequency: pep.frequency,
            route:     pep.route,
            duration:  pep.duration,
          };
        })
      ) || [];
    }
    items.forEach(item => addItem(item));
    setProtocolLoaded(true);
  };

  // ─── Navigation guards ───────────────────────────────────────────────────
  const currentStepDef = activeSteps[step];
  const canAdvance = useMemo(() => {
    if (!currentStepDef) return false;
    if (currentStepDef.id === 'patient') return !!selectedTarget;
    if (currentStepDef.id === 'protocol') return draftItems.length > 0;
    return true;
  }, [currentStepDef, selectedTarget, draftItems.length]);

  const canSubmit = !!selectedTarget && draftItems.length > 0;
  const isLastStep = step === activeSteps.length - 1;

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (status) => {
    if (!canSubmit) {
      toast.error('Select a patient and add at least one product.');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'prescription') {
        const effectiveSourceRx = activeSourceRx || (activeTab === 'refill' ? patientHistory.prescriptions?.[0] : null);
        const isRefillSubmission = Boolean(isRefill || effectiveSourceRx);
        const parentRxCode = effectiveSourceRx
          ? (effectiveSourceRx.prescriptionCode || effectiveSourceRx.code || effectiveSourceRx.protocolNumber || effectiveSourceRx.id)
          : null;
        const nextRefillNumber = effectiveSourceRx ? (Number(effectiveSourceRx.refillCount || effectiveSourceRx.refillNumber || 0) + 1) : 1;

        const createDoc = async (itemsToSave, treatmentType, isGrouped) => {
          const prescriptionDoc = {
            patientId:           selectedTarget.id || selectedTarget.objectID,
            patientName:         selectedTarget.name || selectedTarget.displayName || '',
            doctorId:            selectedDoctor?.id || selectedDoctor?.objectID || null,
            doctorName:          selectedDoctor?.name || selectedDoctor?.displayName || null,
            protocolId:          resolvedProtocolId || effectiveSourceRx?.protocolId || null,
            protocolName:        resolvedProtocolName || effectiveSourceRx?.protocolName || effectiveSourceRx?.treatmentTitle || null,
            clinicalIndication:  clinicalIndication || effectiveSourceRx?.clinicalIndication || '',
            treatmentGoal:       treatmentGoal || effectiveSourceRx?.treatmentGoal || '',
            treatmentType:       treatmentType || effectiveSourceRx?.treatmentType || '',
            sourceType:          isRefillSubmission ? 'Refill' : (resolvedProtocolId ? 'Protocol' : 'Selected Items'),
            status:              status === 'draft' ? PRESCRIPTION_STATUSES.DRAFT : PRESCRIPTION_STATUSES.PENDING,
            isRefill:            isRefillSubmission,
            parentPrescriptionId: effectiveSourceRx?.id || null,
            parentPrescriptionCode: parentRxCode || null,
            refillNumber:        isRefillSubmission ? nextRefillNumber : 0,
            refillCycleDays:     Number(refillConfig?.cycleDays) || 90,
            nextRefillDate:      refillConfig?.nextRefillDate || null,
            refillsRemaining:    Number(refillConfig?.refillsRemaining ?? 0),
            items:               itemsToSave.map(item => {
              const resolvedPid = item.productId || item.id || crypto.randomUUID();
              return {
                id:           item.id || resolvedPid,
                productId:    resolvedPid,
                variantId:    item.variantId || null,
                productName:  item.productName || item.name || '',
                name:         item.productName || item.name || '',
                sku:          item.sku || '',
                price:        item.price || 0,
                quantity:     item.quantity || 1,
                dosage:       item.dosage || item.formula || null,
                formula:      item.formula || item.dosage || null,
                vehicle:      item.vehicle || null,
                volume:       item.volume || null,
                presentation: item.presentation || null,
                frequency:    item.frequency || item.posology || null,
                posology:     item.posology || item.frequency || null,
                instructions: item.instructions || item.posology || item.frequency || null,
                route:        item.route || null,
                duration:     item.duration || `${refillConfig?.cycleDays || 90} days`,
                apis:         item.apis || [],
              };
            }),
            totals: {
              subtotal: itemsToSave.reduce((sum, item) => sum + ((item.prices?.[pricingTier] || item.price || 0) * item.quantity), 0),
            },
            createdBy:       currentUser?.uid || 'admin',
            expiresAt:       new Date(new Date().setMonth(new Date().getMonth() + 6)),
            metadata: {
              sourceModule,
              builderVersion: '2.1-refill',
              isRefill: isRefillSubmission,
              parentPrescriptionId: effectiveSourceRx?.id || null,
              parentPrescriptionCode: parentRxCode || null,
              nextRefillDate: refillConfig?.nextRefillDate || null,
              refillCycleDays: Number(refillConfig?.cycleDays) || 90,
              clinicalAlertsAtSubmit: {
                strict: clinicalAlerts?.errors?.length || 0,
                warnings: clinicalAlerts?.warnings?.length || 0,
                info: clinicalAlerts?.info?.length || 0,
              },
            },
          };
          prescriptionDoc.totals.total = prescriptionDoc.totals.subtotal * 1.05;

          const newRxId = await createPrescription(prescriptionDoc);

          // Update parent prescription in Firestore so its Refill Alert & Next Refill Cycle reflect the renewal
          if (isRefillSubmission && effectiveSourceRx?.id && !String(effectiveSourceRx.id).startsWith('multipart_')) {
            try {
              await updatePrescription(effectiveSourceRx.id, {
                lastRefilledAt: new Date().toISOString(),
                lastRefillPrescriptionId: newRxId,
                refillCount: nextRefillNumber,
                refillCycleDays: Number(refillConfig?.cycleDays) || 90,
                nextRefillDate: refillConfig?.nextRefillDate || null,
                refillStatus: 'refilled',
              });
            } catch (parentErr) {
              console.warn('Could not update parent prescription refill metadata:', parentErr);
            }
          }

          let poId = null;
          if (generateSupplierPO && status !== 'draft' && itemsToSave.length > 0) {
            try {
              poId = await createPurchaseOrder({
                linkedPrescriptionId: newRxId,
                patientId: selectedTarget.id || selectedTarget.objectID,
                patientName: selectedTarget.name || selectedTarget.displayName || '',
                doctorId: selectedDoctor?.id || selectedDoctor?.objectID || null,
                doctorName: selectedDoctor?.name || selectedDoctor?.displayName || '',
                items: itemsToSave,
                totalAmount: prescriptionDoc.totals.total || 0,
                notes: `Auto-generated Supplier PO for Prescription #${newRxId.slice(0, 6)} (${selectedTarget.name})`,
              });
            } catch (poErr) {
              console.error("Error creating linked supplier PO:", poErr);
            }
          }
          return { newRxId, poId };
        };

        if (splitPrescriptions) {
          const groupedItems = draftItems.reduce((acc, item) => {
             const type = itemTreatmentTypes[item.id] || item.treatmentType || 'General';
             if (!acc[type]) acc[type] = [];
             acc[type].push(item);
             return acc;
          }, {});

          const sessionId = `sess_${Date.now()}`;
          for (const [type, items] of Object.entries(groupedItems)) {
            const { newRxId, poId } = await createDoc(items, type, true);
            // Link sessionId manually if needed or update after. We can just add sessionId if we modify createDoc.
          }
          if (status === 'draft') {
            toast.success(`Drafts saved for ${selectedTarget.name}`);
          } else {
            toast.success(`Prescriptions submitted for ${selectedTarget.name}`);
          }
        } else {
          const { newRxId, poId } = await createDoc(draftItems, '', false);
          if (status === 'draft') {
            toast.success(`Draft saved #${newRxId.slice(0, 6)} for ${selectedTarget.name}`);
          } else {
            toast.success(`Prescription submitted for ${selectedTarget.name}${poId ? ' · Supplier PO created' : ''}`);
          }
        }
      } else if (mode === 'quotation') {
        const year = new Date().getFullYear();
        const randSeq = Math.floor(1000 + Math.random() * 9000);
        const quotationNumber = `QUO-${year}-${randSeq}`;
        const clientCleanName = (selectedTarget.name || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const publicToken = `quote_${clientCleanName}_${Date.now().toString(36)}`;

        const quoteDoc = {
          quotationNumber,
          publicToken,
          token: publicToken,
          category: selectedTarget.type || (sourceModule === 'wholesaler' ? 'wholesaler' : 'patient'),
          recipientType: selectedTarget.type || 'patient',
          patientId: selectedTarget.id || null,
          clientId: selectedTarget.id || null,
          patientName: selectedTarget.name || '',
          clientName: selectedTarget.name || '',
          patientEmail: selectedTarget.email || '',
          patientPhone: selectedTarget.phone || '',
          doctorId: resolvedInitialDoctor?.id || null,
          doctorName: resolvedInitialDoctor?.name || '',
          items: draftItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId || null,
            name: item.productName || item.name || '',
            dosage: item.dosage || '',
            quantity: item.quantity || 1,
            unitPrice: getItemResolvedPrice(item, pricingTier),
            unitRate: getItemResolvedPrice(item, pricingTier),
            supplierId: item.supplierId || null,
            supplierName: item.supplierName || null,
            supplierCost: item.supplierCost || null,
            isKit: item.isKit || item.quantity >= 10,
          })),
          subtotal: totals.subtotal || 0,
          grandTotal: totals.total || 0,
          totalAmount: totals.total || 0,
          status: status === 'draft' ? 'draft' : 'pending',
          currency: 'USD',
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.uid || 'admin'
        };

        const qId = await quotationRepository.createQuotation(quoteDoc);
        toast.success(`Cotización ${quotationNumber} creada para ${selectedTarget.name}!`);
      } else {
        const orderDoc = {
          userId:    selectedTarget.id,
          userName:  selectedTarget.name,
          userEmail: selectedTarget.email || '',
          type:      'wholesale',
          status:    'pending',
          items:     draftItems.map(item => {
            if (!item.productId) throw new Error(`Missing productId in item: ${item.name || item.productName}`);
            return {
              productId: item.productId,
              variantId: item.variantId || null,
              name:      item.productName || item.name || '',
              quantity:  item.quantity,
              price:     item.price,
              sku:       item.sku || '',
              image:     item.image || '',
            };
          }),
          subtotal:  totals.subtotal || 0,
          total:     totals.total || 0,
          createdBy: currentUser?.uid || 'admin',
          metadata:  { source: 'UniversalOrderBuilder', sourceModule, builderVersion: '2.0' },
        };
        const promise = orderRepository.createOrder(orderDoc);
        toast.promise(promise, {
          loading: 'Submitting order...',
          success: (orderId) => `Order saved for ${selectedTarget.name || 'the recipient'}. ID: ${orderId.slice(0, 6)}`,
          error: (err) => `Error: ${err.message}`
        });
      }

      clear();
      try {
        localStorage.removeItem(draftNotesKey);
        setClinicalIndication('');
        setTreatmentGoal('');
        setLastAutoSavedTime(null);
      } catch (e) {}
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Error saving prescription/order:', err);
      toast.error('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Context summary banner (shows pre-loaded context) ───────────────────
  const ContextBanner = () => {
    const chips = [];
    if (resolvedInitialPatient) chips.push({ label: 'Patient', value: resolvedInitialPatient.name });
    if (resolvedProtocolName) chips.push({ label: 'Protocol', value: resolvedProtocolName });
    if (resolvedInitialDoctor) chips.push({ label: 'Doctor', value: resolvedInitialDoctor.name });
    if (chips.length === 0) return null;
    return (
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center',
        padding: '0.6rem 1rem', background: 'var(--color-info-bg, #eff6ff)',
        border: '1px solid var(--color-info-border, #bfdbfe)', borderRadius: '8px',
        fontSize: '0.82rem',
      }}>
        <CheckCircle size={14} color="var(--color-info, #2563eb)" style={{ flexShrink: 0 }} />
        <span style={{ color: 'var(--color-info, #2563eb)', fontWeight: 600 }}>Pre-loaded context:</span>
        {chips.map(c => (
          <span key={c.label} style={{
            display: 'inline-flex', gap: '0.25rem',
            background: 'var(--color-info, #2563eb)', color: '#fff',
            borderRadius: '99px', padding: '0.15rem 0.6rem', fontWeight: 600,
          }}>
            <span style={{ opacity: 0.75 }}>{c.label}:</span> {c.value}
          </span>
        ))}
      </div>
    );
  };

  // ─── Product Variant Context Banner (shows pre-selected item from catalog) ───
  const ProductVariantContextBanner = () => {
    if (!draftItems || draftItems.length === 0) return null;
    const firstItem = draftItems[0];
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        marginBottom: '1rem',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div style={{
            padding: '0.35rem 0.65rem',
            background: 'var(--color-primary, #003666)',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.72rem',
            letterSpacing: '0.03em',
            flexShrink: 0
          }}>
            PRESCRIBING ITEM
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e3a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {firstItem.name || firstItem.productName}
              {draftItems.length > 1 ? ` (+${draftItems.length - 1} more items)` : ''}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 500 }}>
              {firstItem.dosage ? `${firstItem.dosage} · ` : ''}
              {firstItem.presentation || 'Magistral Formulation'}
              {firstItem.quantity ? ` · Qty: ${firstItem.quantity}` : ''}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DraftBanner = () => {
    if (!activeCart || draftItems.length === 0) return null;
    const lastMod = activeCart.lastModified ? new Date(activeCart.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.6rem 1rem', background: 'var(--color-warning-bg, #fffbeb)',
        border: '1px solid var(--color-warning-border, #fde68a)', borderRadius: '8px',
        fontSize: '0.82rem', marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning, #d97706)' }}>
          <History size={14} />
          <span>
            <strong>Borrador Activo:</strong> Prescripción en curso para {selectedTarget?.name}. {lastMod && `(Actualizado: ${lastMod})`}
          </span>
          {lastAutoSavedTime && (
            <span style={{ fontSize: '0.72rem', color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
              ● Guardado aut.
            </span>
          )}
        </div>
        <button
          onClick={() => {
            notifier.confirmCritical(
              `¿Estás seguro de que deseas descartar este borrador para ${selectedTarget?.name}?`,
              () => {
                clear();
                try {
                  localStorage.removeItem(draftNotesKey);
                  setClinicalIndication('');
                  setTreatmentGoal('');
                  setLastAutoSavedTime(null);
                } catch (e) {}
              }
            );
          }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem'
          }}
        >
          Descartar Borrador
        </button>
      </div>
    );
  };

  // ─── Patient History (Renew Previous with Granular Per-Item Selection) ────
  const patientHistory = selectedTarget
    ? (patientHistoryCache?.[selectedTarget.id] || patientHistoryCache?.[selectedTarget.name] || { prescriptions: [], loading: false })
    : { prescriptions: [], loading: false };

  const getRxRefillItems = (rx) => {
    if (!rx) return [];
    const raw = normalizeRxRefillItems(rx);
    return raw.map((it, idx) => ({
      ...it,
      _refillKey: it.id || it.productId || `item_${idx}`,
    }));
  };

  const isRefillItemSelected = (rxId, refillKey) => {
    const rxMap = selectedRefillMap[rxId];
    if (!rxMap || rxMap[refillKey] === undefined) return true; // Checked by default
    return Boolean(rxMap[refillKey]);
  };

  const toggleRefillItemSelection = (rxId, refillKey) => {
    setSelectedRefillMap((prev) => {
      const currentRxMap = prev[rxId] || {};
      const currentVal = currentRxMap[refillKey] === undefined ? true : Boolean(currentRxMap[refillKey]);
      return {
        ...prev,
        [rxId]: {
          ...currentRxMap,
          [refillKey]: !currentVal,
        },
      };
    });
  };

  const toggleAllRefillItems = (rx, selectAll) => {
    const items = getRxRefillItems(rx);
    const nextRxMap = {};
    items.forEach((it) => {
      nextRxMap[it._refillKey] = selectAll;
    });
    setSelectedRefillMap((prev) => ({
      ...prev,
      [rx.id]: nextRxMap,
    }));
  };

  const getRefillItemQuantity = (rxId, refillKey, defaultQty = 1) => {
    const k = `${rxId}__${refillKey}`;
    return refillQtyMap[k] !== undefined ? refillQtyMap[k] : (Number(defaultQty) || 1);
  };

  const setRefillItemQuantity = (rxId, refillKey, qty) => {
    const k = `${rxId}__${refillKey}`;
    setRefillQtyMap((prev) => ({
      ...prev,
      [k]: Math.max(1, Number(qty) || 1),
    }));
  };

  const addSingleRefillItem = (previousRx, item) => {
    const qty = getRefillItemQuantity(previousRx.id, item._refillKey, item.quantity);
    addItem({
      id: item.id || item.productId || crypto.randomUUID(),
      productId: item.productId || item.id || `compounded-${previousRx.id}`,
      variantId: item.variantId || null,
      sku: item.sku || '',
      name: item.productName || item.name || 'Custom Formula',
      price: Number(item.price || item.unitPrice || 145),
      quantity: qty,
      dosage: item.dosage || item.dose || null,
      frequency: item.frequency || null,
      route: item.route || null,
      duration: item.duration || previousRx.duration || null,
      presentation: item.format || item.dispensingForm || null,
      sourceId: `renew-${previousRx.id}`,
      sourceType: 'renew',
    });
  };

  const handleRenewPrescription = (previousRx, onlySelected = true) => {
    const allItems = getRxRefillItems(previousRx);
    if (!allItems.length) {
      toast.error('No formulas/items found in this prescription');
      return;
    }
    const itemsToRefill = onlySelected
      ? allItems.filter((it) => isRefillItemSelected(previousRx.id, it._refillKey))
      : allItems;

    if (!itemsToRefill.length) {
      toast.error('Select at least one formula/product to refill');
      return;
    }

    itemsToRefill.forEach((item) => {
      addSingleRefillItem(previousRx, item);
    });
    toast.success(`Added ${itemsToRefill.length} of ${allItems.length} formulas from previous prescription to refill cart`);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem', position: 'relative' }}>

      {/* ── Multi-Cart Switcher ── */}
      {Object.keys(carts).length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-50, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={16} /> Draft Carts
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select 
              value={activeTargetId || ''} 
              onChange={(e) => {
                if (e.target.value === 'new') setActiveTargetId(null);
                else setActiveTargetId(e.target.value);
              }}
              style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', maxWidth: '200px' }}
            >
              <option value="new">+ Start New Draft</option>
              {Object.values(carts).map(cart => (
                <option key={cart.target.id} value={cart.target.id}>
                  {cart.target.name || 'Unknown'} ({cart.draftItems.length} items)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Context banner (pre-loaded from another module) ── */}
      <ContextBanner />
      
      {/* ── Proactive Clinical Refill Alert Banner (when patient has prior Rx) ── */}
      {mode === 'prescription' && selectedTarget && patientHistory.prescriptions?.length > 0 && (() => {
        const latestRx = patientHistory.prescriptions[0];
        const intel = latestRx._refillIntel || computeRxRefillIntelligence(latestRx);
        const rxItems = getRxRefillItems(latestRx);
        const isOverdue = intel.status === 'overdue';
        const isDueSoon = intel.status === 'due_soon';
        const bannerBg = isOverdue ? '#fffbeb' : isDueSoon ? '#eff6ff' : '#f0fdf4';
        const bannerBorder = isOverdue ? '#fde68a' : isDueSoon ? '#bfdbfe' : '#bbf7d0';
        const accentColor = isOverdue ? '#b45309' : isDueSoon ? '#1d4ed8' : '#15803d';
        const cloudPdfUrl = latestRx.pdfUrl || latestRx.documentUrl || latestRx.importedFileUrl || latestRx.fagron?.originalFileUrl || null;

        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: bannerBg,
            border: `1px solid ${bannerBorder}`,
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', minWidth: 0, flex: 1 }}>
              <History size={18} style={{ color: accentColor, flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                    Prior Prescription Detected · {latestRx.protocolName || latestRx.treatmentTitle || latestRx.treatmentProgram || 'Custom Formulation'}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isOverdue ? '#fef3c7' : isDueSoon ? '#dbeafe' : '#dcfce7',
                    color: accentColor,
                    border: `1px solid ${bannerBorder}`,
                  }}>
                    {isOverdue ? '⚠️ ' : isDueSoon ? '🔔 ' : '🟢 '}{intel.badgeLabel}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  {intel.detailText} · <strong>{rxItems.length} personalized formulas</strong> available for selective per-item refill.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              {cloudPdfUrl && (
                <a
                  href={cloudPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#1d4ed8',
                    border: '1px solid #cbd5e1',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📄 Original Cloud PDF ↗
                </a>
              )}
              {(activeTab !== 'refill' || currentStepDef?.id !== 'protocol') && (
                <button
                  type="button"
                  onClick={() => {
                    const protoIdx = activeSteps.findIndex((s) => s.id === 'protocol');
                    if (protoIdx >= 0) setStep(protoIdx);
                    setActiveTab('refill');
                  }}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    background: 'var(--color-primary, #003666)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Select Items to Refill ({rxItems.length}) →
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Draft Banner (Persistent Recovery) ── */}
      <DraftBanner />

      {/* ── Step indicator (prescription mode only, if >1 step) ── */}
      {mode === 'prescription' && activeSteps.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '0.5rem' }}>
          {activeSteps.map((s, idx) => {
            const isActive = idx === step;
            const isDone   = idx < step;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => { if (isDone) setStep(idx); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none',
                    background: isActive ? 'var(--color-primary, #003666)' : isDone ? 'var(--color-success-bg, #f0fdf4)' : 'var(--surface)',
                    color:      isActive ? '#fff' : isDone ? 'var(--color-success, #16a34a)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500, fontSize: '0.85rem',
                    cursor:     isDone ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                >
                  <s.icon size={14} />
                  {s.label}
                  {isDone && ' ✓'}
                </button>
                {idx < activeSteps.length - 1 && (
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── PATIENT STEP ── */}
      {currentStepDef?.id === 'patient' && (
        <>
          <ProductVariantContextBanner />
          <BuilderTargetSelector
            mode={mode}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            currentUserId={currentUser?.uid}
          />
        </>
      )}

      {/* ── PROTOCOL / ITEMS STEP ── */}
      {(mode !== 'prescription' || currentStepDef?.id === 'protocol') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '1rem', marginBottom: '0.5rem' }}>
            {mode === 'prescription' && (
              <button
                onClick={() => setActiveTab('refill')}
                style={{
                  padding: '0.75rem 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'refill' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === 'refill' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'refill' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <History size={16} /> Refill Previous
              </button>
            )}
            <button
              onClick={() => setActiveTab('protocol')}
              style={{
                padding: '0.75rem 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'protocol' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'protocol' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'protocol' ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Layers size={16} /> Use Protocol
            </button>
            <button
              onClick={() => setActiveTab('product')}
              style={{
                padding: '0.75rem 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'product' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'product' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'product' ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ShoppingCart size={16} /> Custom Products
            </button>
          </div>

          {/* Tab 1: Refill Previous (Labels-Style Full Prescription Breakdown, Duplication & Next Refill Scheduler) */}
          {activeTab === 'refill' && mode === 'prescription' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedTarget ? (
                <RefillPrescriptionWorkbench
                  sourceRx={activeSourceRx || patientHistory.prescriptions?.[0] || null}
                  patientHistoryPrescriptions={patientHistory.prescriptions || []}
                  onSelectSourceRx={(nextRx) => {
                    setActiveSourceRx(nextRx);
                  }}
                  draftItems={draftItems}
                  setDraftItems={setDraftItems}
                  addItem={addItem}
                  refillConfig={refillConfig}
                  onChangeRefillConfig={setRefillConfig}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                  Please select a patient first to view their prescription history.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Use Protocol */}
          {activeTab === 'protocol' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!protocolLoaded ? (
                <>
                  <BuilderProtocolSearch onSelectProtocol={handleSelectProtocol} />
                  <div style={{ marginTop: '0.5rem' }}>
                    <a href={`/admin/protocols?patientId=${selectedTarget?.id || ''}&intent=rx_build`} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                      Browse Master Protocols ↗
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ padding: '1rem', background: 'var(--color-success-bg, #f0fdf4)', border: '1px solid var(--color-success-border, #bbf7d0)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success, #16a34a)' }}>
                    <CheckCircle size={18} />
                    <span style={{ fontSize: '0.9rem' }}><strong>Protocol loaded:</strong> {resolvedProtocolName}</span>
                  </div>
                  <button onClick={() => { setProtocolLoaded(false); clear(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    Clear Protocol
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Custom Products */}
          {activeTab === 'product' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <BuilderCatalogSearch onAdd={addItem} />
              <div style={{ marginTop: '0.5rem' }}>
                <a href={`/admin/catalog?patientId=${selectedTarget?.id || ''}&intent=rx_build`} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Browse Master Catalog ↗
                </a>
              </div>
            </div>
          )}

          {/* Persistent Draft Cart (Always visible at the bottom of the step) */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--border)' }}>
            <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} /> Selected Items ({draftItems.length})
            </h3>
            {draftItems.length > 0 ? (
              <BuilderDraftCart
                items={draftItems}
                totals={totals}
                pricingTier={pricingTier}
                onSelectPricingTier={setSelectedPricingTier}
                onUpdateQuantity={updateItemQuantity}
                onRemove={removeItem}
                splitPrescriptions={splitPrescriptions}
                itemTreatmentTypes={itemTreatmentTypes}
              />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'var(--surface-50)', borderRadius: '8px' }}>
                No items added yet. Use the tabs above to select items.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DOCTOR & NOTES STEP (prescription only) ── */}
      {mode === 'prescription' && currentStepDef?.id === 'doctor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={18} /> Prescribing Doctor & Clinical Notes
          </h3>

          <UniversalUserSelector
            roleFilter="doctor"
            label="Prescribing Doctor"
            value={selectedDoctor?.id || ''}
            onChange={(user) => setSelectedDoctor(user)}
            placeholder="Search by name..."
            containerStyle={{ background: 'var(--color-bg-surface, #fff)', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '8px' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Clinical Indication
              </label>
              <input
                type="text"
                className="gcp-input"
                value={clinicalIndication}
                onChange={e => setClinicalIndication(e.target.value)}
                placeholder="Ex: Muscle recovery, anti-aging, hormonal optimization..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Treatment Goal
                <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>(optional)</span>
              </label>
              <textarea
                className="gcp-input"
                value={treatmentGoal}
                onChange={e => setTreatmentGoal(e.target.value)}
                rows={3}
                placeholder="Describe the general therapeutic goal for the patient..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Order summary */}
          <div style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>Summary</div>
            {selectedTarget && <div>👤 Patient: <strong>{selectedTarget.name || selectedTarget.displayName}</strong></div>}
            {resolvedProtocolName && <div>📋 Protocol: <strong>{resolvedProtocolName}</strong></div>}
            {(isRefill || activeSourceRx || patientHistory.prescriptions?.length > 0) && (
              <div style={{ color: '#15803d', fontWeight: 600 }}>
                📅 Next Scheduled Refill: <strong>{refillConfig?.nextRefillDate} ({refillConfig?.cycleDays || 90}d cycle)</strong>
                {refillConfig?.refillsRemaining > 0 ? ` · +${refillConfig.refillsRemaining} Authorized Refills` : ''}
              </div>
            )}
            <div>💊 Items Included: <strong>{draftItems.length}</strong></div>
            <div>💰 Total: <strong>${(totals.total || 0).toFixed(2)}</strong></div>
          </div>

          {/* Advanced Split Option */}
          {draftItems.length > 1 && (
            <div style={{
              padding: '1rem',
              background: splitPrescriptions ? 'var(--color-info-bg)' : 'var(--surface)',
              border: splitPrescriptions ? '1px solid var(--color-info-border)' : '1px solid var(--border)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'all 0.15s'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="split-rx-chk"
                  checked={splitPrescriptions}
                  onChange={(e) => setSplitPrescriptions(e.target.checked)}
                  style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                />
                <label htmlFor="split-rx-chk" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                    Advanced: Split into separate prescriptions
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                    Group items by treatment type into separate prescription documents.
                  </div>
                </label>
              </div>

              {splitPrescriptions && (
                <div style={{ paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {draftItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item.name || item.productName}</span>
                      <select
                        value={itemTreatmentTypes[item.id] || item.treatmentType || 'General'}
                        onChange={(e) => setItemTreatmentTypes(prev => ({ ...prev, [item.id]: e.target.value }))}
                        style={{ padding: '0.3rem', fontSize: '0.8rem', width: '150px', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="General">General</option>
                        <option value="Hormonal">Hormonal</option>
                        <option value="Recovery">Recovery</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Longevity">Longevity</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Supplier PO Fulfillment Option (Phase E) */}
          <div style={{
            padding: '0.85rem 1rem',
            background: generateSupplierPO ? 'rgba(37, 99, 235, 0.05)' : 'var(--surface)',
            border: generateSupplierPO ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid var(--border)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            transition: 'all 0.15s'
          }}>
            <input
              type="checkbox"
              id="generate-supplier-po-chk"
              checked={generateSupplierPO}
              onChange={(e) => setGenerateSupplierPO(e.target.checked)}
              style={{ marginTop: '0.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="generate-supplier-po-chk" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                📦 Auto-generate Supplier Purchase Order (Fulfillment)
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                Creates a linked Supplier PO in Procurement for direct compounding and delivery to patient.
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Wholesale mode: show catalog inline (no steps) ── */}
      {mode !== 'prescription' && (
        <>
          <BuilderTargetSelector
            mode={mode}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            currentUserId={currentUser?.uid}
          />
          {selectedTarget && (
            <>
              <BuilderCatalogSearch onAdd={addItem} />
              <BuilderDraftCart
                items={draftItems}
                totals={totals}
                pricingTier={pricingTier}
                onSelectPricingTier={setSelectedPricingTier}
                onUpdateQuantity={updateItemQuantity}
                onRemove={removeItem}
              />
            </>
          )}
          {!selectedTarget && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>
              First select a patient to add products.
            </div>
          )}
        </>
      )}

      {/* ── Clinical Alerts Panel ── */}
      {clinicalAlerts?.all?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          {/* STRICT errors */}
          {clinicalAlerts.errors.map((alert, i) => (
            <div key={`err-${i}`} style={{
              display: 'flex', gap: '0.6rem', padding: '0.75rem 1rem',
              borderRadius: '8px', fontSize: '0.83rem',
              border: '1px solid var(--color-error-border, #fecaca)',
              background: 'var(--color-error-bg, #fef2f2)',
            }}>
              <AlertTriangle size={15} color="var(--color-error, #dc2626)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: 'var(--color-error, #dc2626)', display: 'block', marginBottom: '0.15rem' }}>
                  🚫 Contraindicación Clínica — Envío Bloqueado
                </span>
                <span style={{ color: 'var(--color-error, #dc2626)', lineHeight: 1.5 }}>{alert.message}</span>
                {alert.reference && (
                  <span style={{ display: 'block', marginTop: '0.3rem', opacity: 0.6, fontSize: '0.75rem' }}>Ref: {alert.reference}</span>
                )}
              </div>
            </div>
          ))}

          {/* WARNINGS */}
          {clinicalAlerts.warnings.map((alert, i) => (
            <div key={`warn-${i}`} style={{
              display: 'flex', gap: '0.6rem', padding: '0.75rem 1rem',
              borderRadius: '8px', fontSize: '0.83rem',
              border: '1px solid var(--color-warning-border, #fde68a)',
              background: 'var(--color-warning-bg, #fffbeb)',
            }}>
              <AlertTriangle size={15} color="var(--color-warning, #d97706)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-warning, #d97706)', display: 'block', marginBottom: '0.15rem' }}>
                  ⚠️ Aviso Clínico — Revisar antes de enviar
                </span>
                <span style={{ color: 'var(--color-warning-text, #92400e)', lineHeight: 1.5 }}>{alert.message}</span>
                {alert.reference && (
                  <span style={{ display: 'block', marginTop: '0.3rem', opacity: 0.6, fontSize: '0.75rem' }}>Ref: {alert.reference}</span>
                )}
              </div>
            </div>
          ))}

          {/* INFO tips */}
          {clinicalAlerts.info.map((alert, i) => (
            <div key={`info-${i}`} style={{
              display: 'flex', gap: '0.6rem', padding: '0.65rem 1rem',
              borderRadius: '8px', fontSize: '0.82rem',
              border: '1px solid var(--color-info-border, #bfdbfe)',
              background: 'var(--color-info-bg, #eff6ff)',
            }}>
              <CheckCircle size={14} color="var(--color-info, #2563eb)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--color-info, #2563eb)', lineHeight: 1.5 }}>{alert.message}</span>
                {alert.reference && (
                  <span style={{ display: 'block', marginTop: '0.3rem', opacity: 0.6, fontSize: '0.75rem' }}>Ref: {alert.reference}</span>
                )}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* ── Action buttons & Sticky Footer ── */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'var(--surface)', padding: '1rem', 
        borderTop: '1px solid var(--border)', 
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
        zIndex: 50,
        display: 'flex', justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Left: Cancel / Back / Totals */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {onCanceled && step === 0 && (
              <button onClick={onCanceled} className="gcp-btn-secondary">Cancel</button>
            )}
            {mode === 'prescription' && step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            
            {/* Show Total if items exist */}
            {draftItems.length > 0 && (
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Total</span>
                 <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>${(totals.total || 0).toFixed(2)}</span>
               </div>
            )}
          </div>

          {/* Right: Next / Save / Send */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {mode === 'prescription' && !isLastStep && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance}
                className="gcp-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: !canAdvance ? 0.5 : 1 }}
              >
                Next: {activeSteps[step + 1]?.label} <ChevronRight size={16} />
              </button>
            )}

            {(mode !== 'prescription' || isLastStep) && (
              <>
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={saving || !canSubmit}
                  className="gcp-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmit('sent')}
                  disabled={saving || !canSubmit || (clinicalAlerts?.errors?.length > 0)}
                  className="gcp-btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    opacity: (saving || !canSubmit || clinicalAlerts?.errors?.length > 0) ? 0.5 : 1,
                  }}
                  title={clinicalAlerts?.errors?.length > 0 ? 'Bloqueado: resuelva las contraindicaciones clínicas antes de enviar' : undefined}
                >
                  {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                  {mode === 'prescription' ? 'Submit Prescription' : 'Process Order'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
