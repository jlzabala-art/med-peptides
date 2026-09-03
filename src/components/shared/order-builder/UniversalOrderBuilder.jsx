'use client';
import orderRepository from '../../../repositories/orderRepository';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useOrderBuilderStore } from '../../../stores/orderBuilderStore';

import BuilderTargetSelector from './BuilderTargetSelector';
import BuilderCatalogSearch from './BuilderCatalogSearch';
import BuilderDraftCart, { getItemResolvedPrice } from './BuilderDraftCart';
import BuilderProtocolSearch from './BuilderProtocolSearch';
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

import { createPrescription } from '../../../services/prescriptionsService';
import { createPurchaseOrder } from '../../../repositories/supplierRepository';
import { PRESCRIPTION_STATUSES } from '../../../schemas/prescriptionSchema';
import toast from 'react-hot-toast';

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
    addItem,
    updateItemQuantity,
    removeItem,
    clear,
    clinicalAlerts,
    patientHistoryCache,
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
  const activeSteps = useMemo(() => {
    if (mode !== 'prescription') return ALL_STEPS;
    const steps = [];
    if (!resolvedInitialPatient) steps.push(ALL_STEPS[0]);  // need patient
    if (!resolvedProtocolId && initialItems.length === 0) steps.push(ALL_STEPS[1]); // need items
    steps.push(ALL_STEPS[2]); // doctor & notes always last
    return steps;
  }, [mode, resolvedInitialPatient, resolvedProtocolId, initialItems.length]);

  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [protocolLoaded, setProtocolLoaded] = useState(!!resolvedProtocolId);

  const [selectedDoctor, setSelectedDoctor] = useState(resolvedInitialDoctor);
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [treatmentGoal, setTreatmentGoal]   = useState('');
  const [activeTab, setActiveTab] = useState('protocol');
  const [generateSupplierPO, setGenerateSupplierPO] = useState(true);
  const [splitPrescriptions, setSplitPrescriptions] = useState(false);
  const [itemTreatmentTypes, setItemTreatmentTypes] = useState({});

  // ─── Initialize target from props ─────────────────────────────────────────
  useEffect(() => {
    // If no active target exists, and an initial target was provided, set it.
    if (!activeTargetId && resolvedInitialPatient && !selectedTarget) {
      setSelectedTarget(resolvedInitialPatient);
    }
  }, [activeTargetId, resolvedInitialPatient, selectedTarget, setSelectedTarget]);

  // ─── Initialize items from props ─────────────────────────────────────────
  useEffect(() => {
    if (initialItems && initialItems.length > 0 && draftItems.length === 0) {
      initialItems.forEach(item => {
        if (!item.productId) console.warn("UniversalOrderBuilder: Missing productId in initialItems", item);
        addItem({
          id:        item.id || item.productId || crypto.randomUUID(),
          productId: item.productId,
          variantId: item.variantId || null,
          sku:       item.sku || '',
          name:      item.productName || item.name || 'Unknown Item',
          price:     item.price || 0,
          quantity:  item.quantity || 1,
          duration:  item.duration,
          dosage:    item.dosage,
          frequency: item.frequency,
          route:     item.route,
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
        const createDoc = async (itemsToSave, treatmentType, isGrouped) => {
          const prescriptionDoc = {
            patientId:           selectedTarget.id || selectedTarget.objectID,
            patientName:         selectedTarget.name || selectedTarget.displayName || '',
            doctorId:            selectedDoctor?.id || selectedDoctor?.objectID || null,
            doctorName:          selectedDoctor?.name || selectedDoctor?.displayName || null,
            protocolId:          resolvedProtocolId || null,
            protocolName:        resolvedProtocolName || null,
            clinicalIndication:  clinicalIndication || '',
            treatmentGoal:       treatmentGoal || '',
            treatmentType:       treatmentType || '',
            sourceType:          resolvedProtocolId ? 'Protocol' : 'Selected Items',
            status:              status === 'draft' ? PRESCRIPTION_STATUSES.DRAFT : PRESCRIPTION_STATUSES.PENDING,
            items:               itemsToSave.map(item => {
              if (!item.productId) throw new Error(`Missing productId in item: ${item.name || item.productName}`);
              return {
                id:        item.id,
                productId: item.productId,
                variantId: item.variantId || null,
                productName: item.productName || item.name || '',
                sku:       item.sku || '',
                price:     item.price || 0,
                quantity:  item.quantity,
                dosage:    item.dosage || null,
                presentation: item.presentation || null,
                frequency: item.frequency || null,
                route:     item.route || null,
                duration:  item.duration || null,
              };
            }),
            totals: {
              subtotal: itemsToSave.reduce((sum, item) => sum + ((item.prices?.[pricingTier] || item.price || 0) * item.quantity), 0),
            },
            createdBy:       currentUser?.uid || 'admin',
            expiresAt:       new Date(new Date().setMonth(new Date().getMonth() + 6)),
            refillsRemaining: 0,
            metadata: {
              sourceModule,
              builderVersion: '2.0',
              clinicalAlertsAtSubmit: {
                strict: clinicalAlerts?.errors?.length || 0,
                warnings: clinicalAlerts?.warnings?.length || 0,
                info: clinicalAlerts?.info?.length || 0,
              },
            },
          };
          prescriptionDoc.totals.total = prescriptionDoc.totals.subtotal * 1.05;

          const newRxId = await createPrescription(prescriptionDoc);

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
          <span><strong>Draft Recovered:</strong> You have an unsaved prescription for {selectedTarget?.name}. {lastMod && `(Last updated at ${lastMod})`}</span>
        </div>
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to clear this draft for ${selectedTarget?.name}?`)) {
              clear();
            }
          }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem'
          }}
        >
          Discard Draft
        </button>
      </div>
    );
  };

  // ─── Patient History (Renew Previous) ───────────────────────────────────
  const patientHistory = selectedTarget
    ? (patientHistoryCache?.[selectedTarget.id] || { prescriptions: [], loading: false })
    : { prescriptions: [], loading: false };

  const handleRenewPrescription = (previousRx) => {
    if (!previousRx?.items?.length) return;
    previousRx.items.forEach(item => {
      if (!item.productId) console.warn("UniversalOrderBuilder: Missing productId in handleRenewPrescription", item);
      addItem({
        id: item.id || item.productId || crypto.randomUUID(),
        productId: item.productId,
        variantId: item.variantId || null,
        sku: item.sku || '',
        name: item.productName || item.name || 'Unknown',
        price: item.price || 0,
        quantity: item.quantity || 1,
        dosage: item.dosage || null,
        frequency: item.frequency || null,
        route: item.route || null,
        duration: item.duration || null,
        sourceId: `renew-${previousRx.id}`,
        sourceType: 'renew',
      });
    });
    toast.success(`Renewed ${previousRx.items.length} items from previous prescription`);
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
        <BuilderTargetSelector
          mode={mode}
          selectedTarget={selectedTarget}
          onSelectTarget={setSelectedTarget}
          currentUserId={currentUser?.uid}
        />
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

          {/* Tab 1: Refill Previous */}
          {activeTab === 'refill' && mode === 'prescription' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedTarget ? (
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.65rem 1rem', background: 'var(--surface-50, #f8fafc)',
                    borderBottom: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)'
                  }}>
                    <History size={15} />
                    Recent Prescriptions for {selectedTarget.name}
                    {patientHistory.loading && <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite', opacity: 0.5, marginLeft: 'auto' }} />}
                  </div>
                  {!patientHistory.loading && patientHistory.prescriptions.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      No previous prescriptions found for this patient.
                    </div>
                  )}
                  {patientHistory.prescriptions.map(rx => (
                    <div key={rx.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
                      fontSize: '0.85rem', color: 'var(--text-main)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{rx.protocolName || 'Custom Formulation'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {rx.items?.length || 0} items
                          {rx.createdAt?.toDate ? ` · ${rx.createdAt.toDate().toLocaleDateString()}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRenewPrescription(rx)}
                        className="gcp-btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <RefreshCw size={14} /> Refill Items
                      </button>
                    </div>
                  ))}
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--surface-50, #f8fafc)', borderTop: '1px solid var(--border)' }}>
                    <a href={`/admin/prescriptions?patientId=${selectedTarget.id}`} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                      View full prescription history for {selectedTarget.name} ↗
                    </a>
                  </div>
                </div>
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
          <div style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Summary</div>
            {selectedTarget && <div>👤 Patient: <strong>{selectedTarget.name || selectedTarget.displayName}</strong></div>}
            {resolvedProtocolName && <div>📋 Protocol: <strong>{resolvedProtocolName}</strong></div>}
            <div>💊 Items: <strong>{draftItems.length}</strong></div>
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
