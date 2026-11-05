'use client';

import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  Pill
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createPrescription } from '@/services/prescriptionsService';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';

/**
 * RefillFormulaWorkbench
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive Clinical Refill Studio inside Prescription & Label Hub.
 * Allows clinicians and compounding pharmacists to:
 *  1. Duplicate an existing prescription with preserved lineage (parentPrescriptionId).
 *  2. Selectively include or drop formula parts (e.g., skip Phase 1, refill Phase 2 & 3).
 *  3. Surgically modify APIs (drop components with [×], modify doses/percentages, add new APIs).
 *  4. Adjust vehicles, volume sizes, and posology based on patient response.
 *  5. Schedule the refill (immediate vs +30d / +60d / +90d).
 *  6. Instantly persist to Firestore and transition back to official label generation.
 */
export default function RefillFormulaWorkbench({
  sourceRx = {},
  labels = [],
  onRefillCreated,
  onCancel,
  isEs = false,
}) {
  // Extract initial formula parts from labels or sourceRx items
  const initialParts = useMemo(() => {
    if (labels && labels.length > 0) {
      return labels.map((lbl, idx) => {
        const rawApis = Array.isArray(lbl.apis) ? lbl.apis : [];
        return {
          id: lbl.id || `part-${idx}`,
          phaseNumber: lbl.phaseNumber || idx + 1,
          title: lbl.productName || lbl.productTitle || `Formula ${idx + 1}`,
          volume: lbl.volume || '30 mL',
          dosageForm: lbl.dosageForm || 'Topical Galenic',
          vehicle: typeof lbl.vehicle === 'object' ? (lbl.vehicle?.name || '') : (lbl.vehicle || ''),
          directions: lbl.directions || lbl.posology || '',
          included: true,
          isExpanded: true,
          apis: rawApis.map((api, aIdx) => ({
            id: `api-${idx}-${aIdx}-${Date.now()}`,
            name: api.name || api.activeIngredient || 'Active Ingredient',
            dose: api.dose || api.dosage || api.percentage || '',
          })),
          newApiName: '',
          newApiDose: '',
          showAddApi: false,
        };
      });
    }

    const rxItems = sourceRx.items || sourceRx.compounds || sourceRx.prescriptionLines || [];
    if (rxItems.length > 0) {
      return rxItems.map((item, idx) => {
        const rawApis = Array.isArray(item.apis) ? item.apis : [];
        return {
          id: item.id || `item-${idx}`,
          phaseNumber: idx + 1,
          title: item.productName || item.name || `Formula ${idx + 1}`,
          volume: item.volume || '30 mL',
          dosageForm: item.presentation || item.dosageForm || 'Compounded Formula',
          vehicle: item.vehicle || '',
          directions: item.instructions || item.posology || '',
          included: true,
          isExpanded: true,
          apis: rawApis.map((api, aIdx) => ({
            id: `api-${idx}-${aIdx}-${Date.now()}`,
            name: api.name || api.activeIngredient || 'Active Ingredient',
            dose: api.dose || api.dosage || api.percentage || '',
          })),
          newApiName: '',
          newApiDose: '',
          showAddApi: false,
        };
      });
    }

    return [{
      id: 'default-part-0',
      phaseNumber: 1,
      title: sourceRx.treatmentTitle || sourceRx.treatmentProgram || 'Compounded Treatment',
      volume: '30 mL',
      dosageForm: 'Compounded Formula',
      vehicle: '',
      directions: '',
      included: true,
      isExpanded: true,
      apis: [],
      newApiName: '',
      newApiDose: '',
      showAddApi: false,
    }];
  }, [labels, sourceRx]);

  // Working state for mutable formulation parts
  const [parts, setParts] = useState(initialParts);
  const [cycleDays, setCycleDays] = useState(30);
  const [quantity, setQuantity] = useState(1);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle inclusion of an entire formula part
  const handleTogglePartIncluded = (partIdx) => {
    setParts(prev => prev.map((p, idx) => idx === partIdx ? { ...p, included: !p.included } : p));
  };

  // Toggle expansion of a formula part
  const handleTogglePartExpanded = (partIdx) => {
    setParts(prev => prev.map((p, idx) => idx === partIdx ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  // Drop an active component (API) from a formula
  const handleDropApi = (partIdx, apiId) => {
    setParts(prev => prev.map((p, idx) => {
      if (idx !== partIdx) return p;
      return {
        ...p,
        apis: p.apis.filter(a => a.id !== apiId)
      };
    }));
  };

  // Update concentration / dose of an active component
  const handleUpdateApiDose = (partIdx, apiId, newDose) => {
    setParts(prev => prev.map((p, idx) => {
      if (idx !== partIdx) return p;
      return {
        ...p,
        apis: p.apis.map(a => a.id === apiId ? { ...a, dose: newDose } : a)
      };
    }));
  };

  // Update text field of a formula part (vehicle, posology, volume)
  const handleUpdatePartField = (partIdx, field, value) => {
    setParts(prev => prev.map((p, idx) => idx === partIdx ? { ...p, [field]: value } : p));
  };

  // Add a new API to a formula part
  const handleAddApi = (partIdx) => {
    setParts(prev => prev.map((p, idx) => {
      if (idx !== partIdx) return p;
      if (!p.newApiName.trim()) {
        toast.error(isEs ? 'Indica el nombre del ingrediente activo' : 'Please provide active ingredient name');
        return p;
      }
      const newApi = {
        id: `api-custom-${Date.now()}`,
        name: p.newApiName.trim(),
        dose: p.newApiDose.trim() || '1%',
      };
      return {
        ...p,
        apis: [...p.apis, newApi],
        newApiName: '',
        newApiDose: '',
        showAddApi: false,
      };
    }));
  };

  // Preserved lineage computation
  const parentRxCode = sourceRx.code || sourceRx.prescriptionCode || sourceRx.fileNumber || 'RX-ORIGINAL';
  const previousRefillNumber = Number(sourceRx.refillNumber || 0);
  const nextRefillNumber = previousRefillNumber + 1;
  const newRefillCode = `${parentRxCode}-R${nextRefillNumber}`;

  const selectedPartsCount = parts.filter(p => p.included).length;

  // Submit and create the new Refill Prescription in Firestore
  const handleEmitRefill = async () => {
    const activeFormulas = parts.filter(p => p.included);
    if (activeFormulas.length === 0) {
      toast.error(isEs ? 'Debes seleccionar al menos una fórmula para el refill' : 'Please select at least one formula to refill');
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = toast.loading(isEs ? 'Generando nueva prescripción Refill…' : 'Generating new refill prescription…');

    try {
      // Calculate schedule date
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + cycleDays);

      const patientData = sourceRx.patient || {
        id: sourceRx.patientId || 'unknown_patient',
        name: sourceRx.patientName || 'Patient',
        email: sourceRx.patientEmail || '',
        phone: sourceRx.patientPhone || '',
      };

      const doctorData = sourceRx.doctor || {
        id: sourceRx.doctorId || 'unknown_doctor',
        name: sourceRx.doctorName || 'Doctor',
      };

      // Formulate items representing updated parts
      const formulatedItems = activeFormulas.map((p, idx) => ({
        id: `refill-item-${idx}-${Date.now()}`,
        productId: `custom-compound-${p.phaseNumber}`,
        productName: p.title,
        name: p.title,
        phaseNumber: p.phaseNumber,
        volume: p.volume,
        presentation: p.dosageForm,
        vehicle: p.vehicle,
        posology: p.directions,
        instructions: p.directions,
        quantity: Number(quantity) || 1,
        apis: p.apis.map(a => ({
          name: a.name,
          activeIngredient: a.name,
          dose: a.dose,
          dosage: a.dose,
          percentage: a.dose,
        })),
      }));

      const newPrescriptionPayload = {
        code: newRefillCode,
        prescriptionCode: newRefillCode,
        isRefill: true,
        parentPrescriptionId: sourceRx.id || null,
        parentPrescriptionCode: parentRxCode,
        refillNumber: nextRefillNumber,
        refillCycleDays: Number(cycleDays),
        nextRefillDate: scheduledDate.toISOString(),
        patient: patientData,
        patientId: patientData.id || sourceRx.patientId || null,
        patientName: patientData.name || sourceRx.patientName || 'Patient',
        doctor: doctorData,
        doctorId: doctorData.id || sourceRx.doctorId || null,
        doctorName: doctorData.name || sourceRx.doctorName || 'Doctor',
        treatmentTitle: sourceRx.treatmentTitle || activeFormulas[0]?.title || 'Refill Prescription',
        treatmentProgram: sourceRx.treatmentProgram || sourceRx.treatmentTitle || 'Refill Protocol',
        items: formulatedItems,
        prescriptionLines: formulatedItems,
        compounds: formulatedItems,
        clinicalIndication: sourceRx.clinicalIndication || '',
        clinicalNotes: clinicalNotes.trim() || `Refill #${nextRefillNumber} derived from ${parentRxCode}. Modifications applied.`,
        status: 'approved', // Pharmacist/Doctor verified refill
        approvalStatus: 'approved',
        currency: sourceRx.currency || 'USD',
        totals: {
          subtotal: 0,
          total: 0,
        },
        metadata: {
          isRefill: true,
          parentPrescriptionId: sourceRx.id || null,
          parentPrescriptionCode: parentRxCode,
          refillNumber: nextRefillNumber,
          refillCycleDays: Number(cycleDays),
          modifiedFromParent: true,
          partsIncludedCount: activeFormulas.length,
          createdAtClient: new Date().toISOString(),
        }
      };

      const newRxId = await createPrescription(newPrescriptionPayload);

      toast.success(
        isEs
          ? `✓ Refill ${newRefillCode} creado exitosamente`
          : `✓ Refill ${newRefillCode} successfully issued`,
        { id: loadingToastId }
      );

      if (onRefillCreated) {
        onRefillCreated({ id: newRxId, ...newPrescriptionPayload }, newRxId);
      }
    } catch (err) {
      console.error('[RefillFormulaWorkbench] Error emitting refill:', err);
      toast.error(
        isEs ? `Error al emitir refill: ${err.message}` : `Failed to emit refill: ${err.message}`,
        { id: loadingToastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '960px',
      margin: '0 auto',
      background: '#ffffff',
      border: '1px solid #c2e7ff',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(26, 115, 232, 0.12)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
    }}>
      {/* ── 1. Top Clinical Header & Lineage Banner ── */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a73e8 0%, #0d9488 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(26, 115, 232, 0.25)',
          }}>
            <RotateCcw size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Laboratorio de Refill Clínico' : 'Clinical Refill & Duplication Studio'}
              </span>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                fontSize: '0.70rem',
                fontWeight: 750,
                padding: '1px 8px',
                borderRadius: '12px',
              }}>
                Refill #{nextRefillNumber}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{isEs ? 'Prescripción base:' : 'Base prescription:'}</span>
              <CopyableId value={parentRxCode} />
              <span>• {sourceRx.patientName || sourceRx.patient?.name || 'Patient'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: selectedPartsCount > 0 ? '#15803d' : '#b91c1c',
            background: selectedPartsCount > 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${selectedPartsCount > 0 ? '#86efac' : '#fca5a5'}`,
            padding: '3px 8px',
            borderRadius: '6px',
          }}>
            {selectedPartsCount} {isEs ? 'fórmulas activas' : 'formulas included'}
          </span>
        </div>
      </div>

      {/* ── 2. Formula Cards with Surgical API Editor ── */}
      <div style={{
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '480px',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
          {isEs
            ? 'Selecciona las fórmulas a resurtir, elimina componentes que causen intolerancia o ajusta sus concentraciones:'
            : 'Select formulas to refill, remove intolerant components, or adjust active concentrations:'}
        </div>

        {parts.map((part, pIdx) => (
          <div
            key={part.id || pIdx}
            style={{
              border: part.included ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
              borderRadius: '8px',
              background: part.included ? '#ffffff' : '#f8fafc',
              overflow: 'hidden',
              transition: 'all 0.15s ease',
              boxShadow: part.included ? '0 2px 8px rgba(37, 99, 235, 0.06)' : 'none',
              opacity: part.included ? 1 : 0.7,
            }}
          >
            {/* Card Header with Checkbox and Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: part.included ? '#eff6ff' : '#f1f5f9',
              borderBottom: part.isExpanded ? '1px solid #dbeafe' : 'none',
            }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
              }}>
                <input
                  type="checkbox"
                  checked={part.included}
                  onChange={() => handleTogglePartIncluded(pIdx)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#1a73e8',
                    cursor: 'pointer',
                  }}
                />
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: part.included ? '#1d4ed8' : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                }}>
                  {part.phaseNumber}
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: part.included ? '#1e3a8a' : '#64748b' }}>
                  {part.title}
                </span>
                <span style={{
                  fontSize: '0.70rem',
                  color: '#64748b',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}>
                  {part.volume}
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleTogglePartExpanded(pIdx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                }}
              >
                <span>{part.isExpanded ? (isEs ? 'Plegar' : 'Collapse') : (isEs ? 'Modificar' : 'Modify')}</span>
                {part.isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Expanded Editor Body */}
            {part.included && part.isExpanded && (
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Active APIs Section */}
                <div>
                  <div style={{
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span>{isEs ? 'Ingredientes Activos (APIs) y Concentración:' : 'Active Principles (APIs) & Concentrations:'}</span>
                    <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                      {part.apis.length} {isEs ? 'activos en mezcla' : 'active components'}
                    </span>
                  </div>

                  {part.apis.length === 0 ? (
                    <div style={{
                      padding: '8px 10px',
                      background: '#fef2f2',
                      border: '1px dashed #f87171',
                      borderRadius: '6px',
                      color: '#b91c1c',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <AlertCircle size={14} />
                      <span>{isEs ? 'Todos los activos fueron retirados. Añade al menos uno.' : 'All APIs removed. Please add at least one.'}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {part.apis.map((api) => (
                        <div
                          key={api.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                            <FlaskConical size={13} color="#0d9488" />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', wordBreak: 'break-word' }}>
                              {api.name}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>{isEs ? 'Dosis:' : 'Dose:'}</span>
                            <input
                              type="text"
                              value={api.dose}
                              onChange={(e) => handleUpdateApiDose(pIdx, api.id, e.target.value)}
                              placeholder="e.g. 5%"
                              style={{
                                width: '68px',
                                padding: '3px 6px',
                                fontSize: '0.74rem',
                                fontWeight: 750,
                                textAlign: 'center',
                                borderRadius: '4px',
                                border: '1px solid #94a3b8',
                                background: '#ffffff',
                                color: '#0f172a',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleDropApi(pIdx, api.id)}
                              style={{
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}
                              title={isEs ? 'Retirar este componente de la fórmula' : 'Remove component from formulation'}
                            >
                              <X size={12} />
                              <span className="mobile-hide">{isEs ? 'Quitar' : 'Drop'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New API Inline Accordion */}
                  <div style={{ marginTop: '8px' }}>
                    {part.showAddApi ? (
                      <div style={{
                        padding: '8px 10px',
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}>
                        <input
                          type="text"
                          value={part.newApiName}
                          onChange={(e) => handleUpdatePartField(pIdx, 'newApiName', e.target.value)}
                          placeholder={isEs ? 'Nombre de API (ej. Melatonina)' : 'API name (e.g. Melatonin)'}
                          style={{
                            flex: 1,
                            minWidth: '140px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            border: '1px solid #86efac',
                            borderRadius: '4px',
                          }}
                        />
                        <input
                          type="text"
                          value={part.newApiDose}
                          onChange={(e) => handleUpdatePartField(pIdx, 'newApiDose', e.target.value)}
                          placeholder="e.g. 1% / 100 mg"
                          style={{
                            width: '90px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            border: '1px solid #86efac',
                            borderRadius: '4px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddApi(pIdx)}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 750,
                            cursor: 'pointer',
                          }}
                        >
                          {isEs ? 'Añadir' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePartField(pIdx, 'showAddApi', false)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          {isEs ? 'Cancelar' : 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdatePartField(pIdx, 'showAddApi', true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '5px',
                          padding: '4px 10px',
                          color: '#0d9488',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={12} />
                        <span>{isEs ? '+ Añadir Activo / Péptido a la mezcla' : '+ Add Active Component to formula'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Vehicle & Posology Fields */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '8px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '8px',
                }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      {isEs ? 'Vehículo / Base Galénica:' : 'Vehicle / Galenic Base:'}
                    </label>
                    <input
                      type="text"
                      value={part.vehicle}
                      onChange={(e) => handleUpdatePartField(pIdx, 'vehicle', e.target.value)}
                      placeholder="e.g. TrichoOil™ 30mL"
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      {isEs ? 'Posología / Indicaciones:' : 'Posology & Instructions:'}
                    </label>
                    <input
                      type="text"
                      value={part.directions}
                      onChange={(e) => handleUpdatePartField(pIdx, 'directions', e.target.value)}
                      placeholder="e.g. 1-2 times / week"
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── 3. Bottom Execution Controls & Scheduling ── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {/* Scheduling Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
              {isEs ? 'Ciclo de Programación:' : 'Refill Schedule:'}
            </span>
            {[
              { days: 0, label: isEs ? 'Inmediato' : 'Immediate' },
              { days: 30, label: isEs ? '+30 días' : '+30 days' },
              { days: 60, label: isEs ? '+60 días' : '+60 days' },
              { days: 90, label: isEs ? '+90 días' : '+90 days' },
            ].map(c => (
              <button
                key={c.days}
                type="button"
                onClick={() => setCycleDays(c.days)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '14px',
                  fontSize: '0.70rem',
                  fontWeight: cycleDays === c.days ? 800 : 600,
                  background: cycleDays === c.days ? '#003666' : '#ffffff',
                  color: cycleDays === c.days ? '#ffffff' : '#334155',
                  border: cycleDays === c.days ? '1px solid #003666' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
              {isEs ? 'Unidades:' : 'Quantity:'}
            </span>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '45px',
                padding: '3px 4px',
                fontSize: '0.74rem',
                fontWeight: 800,
                textAlign: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        {/* Clinical Modification Note */}
        <div>
          <input
            type="text"
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder={isEs
              ? 'Motivo clínico del ajuste (ej. Se retira activo por tolerancia y se ajusta concentración al 7%)'
              : 'Clinical adjustment note (e.g. Removed active due to tolerance, adjusted concentration to 7%)'}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '0.74rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              boxSizing: 'border-box',
              background: '#ffffff',
            }}
          />
        </div>

        {/* Primary Action Button Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          paddingTop: '6px',
        }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.76rem',
                fontWeight: 650,
                cursor: 'pointer',
              }}
            >
              {isEs ? 'Volver a Etiqueta' : 'Back to Label'}
            </button>
          )}

          <button
            type="button"
            disabled={isSubmitting || selectedPartsCount === 0}
            onClick={handleEmitRefill}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: selectedPartsCount > 0 ? '#1a73e8' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 18px',
              fontWeight: 750,
              fontSize: '0.82rem',
              cursor: selectedPartsCount > 0 && !isSubmitting ? 'pointer' : 'not-allowed',
              boxShadow: selectedPartsCount > 0 ? '0 2px 6px rgba(26, 115, 232, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={14} />
            <span>
              {isSubmitting
                ? (isEs ? 'Creando Refill…' : 'Issuing Refill…')
                : (isEs ? `Emitir Refill #${newRefillCode}` : `Emit Refill #${newRefillCode}`)}
            </span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
