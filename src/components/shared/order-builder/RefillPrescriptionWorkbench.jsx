'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  FileText,
  Tag,
  Check,
  Edit3,
  RotateCcw,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Pill,
  RefreshCw,
  X,
} from 'lucide-react';
import CopyableId from '@/components/ui/CopyableId';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import { normalizeRxRefillItems, computeRxRefillIntelligence } from '@/stores/orderBuilderSlices/createOrderPrefetchSlice';
import BuilderCatalogSearch from './BuilderCatalogSearch';
import toast from 'react-hot-toast';

/**
 * RefillPrescriptionWorkbench
 * ─────────────────────────────────────────────────────────────────────────────
 * Labels-style interactive Refill & Duplication Workbench inside UniversalOrderBuilder.
 *
 * Displays:
 * 1. Full Prior Prescription Header (Code with CopyableId, Issue Date, Prescribing Doctor,
 *    Original Cloud PDF button, and 1-click Pharmapolis Labels Preview button).
 * 2. Labels-Style Formula Breakdown Cards (Phase 1, Phase 2, Phase 3 / Vials):
 *    - Active Ingredients (APIs) & concentrations as rich pills
 *    - Galenic Vehicle / Base & Volume
 *    - Posology / Patient Directions
 *    - Include / Exclude toggle switch per formula (synchronizes live with draftItems cart)
 *    - Inline Editor for Dosage / APIs / Vehicle / Posology / Quantity
 *    - "Replace Product" & "+ Add Extra Product from Catalog" controls
 * 3. Next Refill Cycle & Date Scheduler (30d, 60d, 90d, 180d, or Custom Date + Refills Authorized)
 */
export default function RefillPrescriptionWorkbench({
  sourceRx,
  patientHistoryPrescriptions = [],
  onSelectSourceRx,
  draftItems = [],
  setDraftItems,
  addItem,
  refillConfig,
  onChangeRefillConfig,
}) {
  const [editingFormulaIdx, setEditingFormulaIdx] = useState(null);
  const [replacingFormulaIdx, setReplacingFormulaIdx] = useState(null);
  const [showAddCatalogModal, setShowAddCatalogModal] = useState(false);
  const [formulaEdits, setFormulaEdits] = useState({});

  // Resolve the active source prescription (either passed directly or first in patient history)
  const activeRx = sourceRx || patientHistoryPrescriptions?.[0] || null;

  // Build rich "Labels-style" formula cards by combining getPharmapolisLabelsForPrescription + normalizeRxRefillItems
  const enrichedFormulas = useMemo(() => {
    if (!activeRx) return [];
    let labels = [];
    try {
      labels = getPharmapolisLabelsForPrescription(activeRx) || [];
    } catch (err) {
      console.warn('RefillPrescriptionWorkbench: fallback to normalizeRxRefillItems', err);
    }
    const rawRefillItems = normalizeRxRefillItems(activeRx) || [];

    const count = Math.max(labels.length, rawRefillItems.length);
    if (count === 0) return [];

    const result = [];
    for (let i = 0; i < count; i++) {
      const lbl = labels[i] || {};
      const raw = rawRefillItems[i] || {};
      const key = raw.id || raw.productId || lbl.id || `refill_formula_${i + 1}`;
      const editOverride = formulaEdits[key] || {};

      // Extract APIs list
      const apisList = Array.isArray(lbl.apis) && lbl.apis.length > 0
        ? lbl.apis.map((a) => ({
            name: a.name || a.drugName || a.activeIngredient || 'Active Ingredient',
            dose: a.dose || a.dosage || a.strength || '',
          }))
        : Array.isArray(lbl.activeIngredientsList) && lbl.activeIngredientsList.length > 0
          ? lbl.activeIngredientsList.map((str) => ({ name: str, dose: '' }))
          : [];

      const formulaTitle =
        editOverride.title ??
        (lbl.productTitle && !/^compounded pharmaceutical protocol$/i.test(lbl.productTitle)
          ? lbl.productTitle
          : raw.productName || raw.name || lbl.productName || `Formula ${i + 1}`);

      const formulaComposition =
        editOverride.formula ??
        (lbl.formula ||
          (apisList.length > 0
            ? apisList.map((a) => `${a.name} ${a.dose}`.trim()).join(' + ')
            : raw.dosage || ''));

      const vehicleName =
        editOverride.vehicle ??
        (typeof lbl.vehicle === 'string'
          ? lbl.vehicle
          : lbl.vehicle?.name || raw.vehicle || 'Pharmaceutical Compounding Base');

      const volumeText =
        editOverride.volume ??
        (lbl.volume || raw.volume || raw.format || raw.dispensingForm || '100 mL / 90 Caps');

      const dosageFormText =
        editOverride.dosageForm ??
        (lbl.dosageForm || raw.dispensingForm || raw.format || 'Compounded Preparation');

      const directionsText =
        editOverride.directions ??
        (lbl.directions || raw.posology || raw.instructions || 'Use as directed by prescribing physician.');

      const unitPrice = Number(editOverride.price ?? raw.price ?? raw.unitPrice ?? 145) || 145;

      result.push({
        key,
        index: i,
        phaseNumber: lbl.phaseNumber || i + 1,
        productId: raw.productId || raw.id || `rx-refill-${activeRx.id}-f${i + 1}`,
        variantId: raw.variantId || null,
        sku: raw.sku || lbl.batchCode || '',
        title: formulaTitle,
        formula: formulaComposition,
        apis: apisList,
        vehicle: vehicleName,
        volume: volumeText,
        dosageForm: dosageFormText,
        directions: directionsText,
        warnings: lbl.warnings || '',
        storage: lbl.storage || 'Store at room temperature (15°C - 25°C)',
        price: unitPrice,
        defaultQuantity: Number(raw.quantity) || 1,
        rawLabel: lbl,
      });
    }

    return result;
  }, [activeRx, formulaEdits]);

  const intel = useMemo(() => {
    if (!activeRx) return null;
    return activeRx._refillIntel || computeRxRefillIntelligence(activeRx);
  }, [activeRx]);

  // Check if a formula is currently included in draftItems
  const findCartItemForFormula = (formula) => {
    return draftItems.find(
      (d) =>
        d._refillKey === formula.key ||
        (d.productId && formula.productId && d.productId === formula.productId) ||
        (d.name && formula.title && d.name === formula.title)
    );
  };

  const handleToggleIncludeFormula = (formula) => {
    const existing = findCartItemForFormula(formula);
    if (existing) {
      // Exclude from draftItems
      setDraftItems((prev) => prev.filter((item) => item !== existing));
      toast(`Excluido del Refill: ${formula.title}`, { icon: '➖' });
    } else {
      // Include in draftItems
      const itemToAdd = {
        id: formula.key,
        _refillKey: formula.key,
        productId: formula.productId,
        variantId: formula.variantId,
        sku: formula.sku,
        name: formula.title,
        productName: formula.title,
        price: formula.price,
        quantity: formula.defaultQuantity || 1,
        dosage: formula.formula,
        formula: formula.formula,
        vehicle: formula.vehicle,
        volume: formula.volume,
        presentation: `${formula.dosageForm} · ${formula.volume}`,
        frequency: formula.directions,
        posology: formula.directions,
        instructions: formula.directions,
        route: formula.dosageForm,
        duration: `${refillConfig?.cycleDays || 90} days`,
        sourceId: `refill-${activeRx?.id || 'rx'}`,
        sourceType: 'refill',
        apis: formula.apis,
      };
      setDraftItems((prev) => [...prev, itemToAdd]);
      toast.success(`Incluido en el Refill: ${formula.title}`);
    }
  };

  const handleIncludeAll = (includeAll) => {
    if (!includeAll) {
      // Keep only custom-added items that didn't come from this prescription's formulas
      const formulaKeys = new Set(enrichedFormulas.map((f) => f.key));
      const formulaTitles = new Set(enrichedFormulas.map((f) => f.title));
      setDraftItems((prev) =>
        prev.filter((d) => !formulaKeys.has(d._refillKey) && !formulaTitles.has(d.name))
      );
      toast('Todas las fórmulas originales excluidas temporalmente', { icon: 'ℹ️' });
      return;
    }

    const rebuilt = enrichedFormulas.map((formula) => {
      const existing = findCartItemForFormula(formula);
      return {
        id: existing?.id || formula.key,
        _refillKey: formula.key,
        productId: formula.productId,
        variantId: formula.variantId,
        sku: formula.sku,
        name: formula.title,
        productName: formula.title,
        price: formula.price,
        quantity: existing?.quantity || formula.defaultQuantity || 1,
        dosage: formula.formula,
        formula: formula.formula,
        vehicle: formula.vehicle,
        volume: formula.volume,
        presentation: `${formula.dosageForm} · ${formula.volume}`,
        frequency: formula.directions,
        posology: formula.directions,
        instructions: formula.directions,
        route: formula.dosageForm,
        duration: `${refillConfig?.cycleDays || 90} days`,
        sourceId: `refill-${activeRx?.id || 'rx'}`,
        sourceType: 'refill',
        apis: formula.apis,
      };
    });

    // Keep any extra catalog items the operator added manually
    const formulaKeys = new Set(enrichedFormulas.map((f) => f.key));
    const formulaTitles = new Set(enrichedFormulas.map((f) => f.title));
    const extraItems = draftItems.filter(
      (d) => !formulaKeys.has(d._refillKey) && !formulaTitles.has(d.name)
    );

    setDraftItems([...rebuilt, ...extraItems]);
    toast.success(`Las ${rebuilt.length} fórmulas de la prescripción original están incluidas`);
  };

  const handleUpdateFormulaQuantity = (formula, deltaOrVal, isAbsolute = false) => {
    const existing = findCartItemForFormula(formula);
    if (!existing) {
      // Automatically include if user increments quantity
      handleToggleIncludeFormula(formula);
      return;
    }
    const nextQty = isAbsolute
      ? Math.max(1, Number(deltaOrVal) || 1)
      : Math.max(1, (Number(existing.quantity) || 1) + deltaOrVal);

    setDraftItems((prev) =>
      prev.map((item) => (item === existing ? { ...item, quantity: nextQty } : item))
    );
  };

  const handleSaveFormulaInlineEdit = (formula, updatedFields) => {
    setFormulaEdits((prev) => ({
      ...prev,
      [formula.key]: {
        ...(prev[formula.key] || {}),
        ...updatedFields,
      },
    }));

    // Also update in draftItems if currently included
    const existing = findCartItemForFormula(formula);
    if (existing) {
      setDraftItems((prev) =>
        prev.map((item) =>
          item === existing
            ? {
                ...item,
                name: updatedFields.title ?? item.name,
                productName: updatedFields.title ?? item.productName,
                dosage: updatedFields.formula ?? item.dosage,
                formula: updatedFields.formula ?? item.formula,
                vehicle: updatedFields.vehicle ?? item.vehicle,
                volume: updatedFields.volume ?? item.volume,
                presentation: `${updatedFields.dosageForm ?? formula.dosageForm} · ${updatedFields.volume ?? formula.volume}`,
                frequency: updatedFields.directions ?? item.frequency,
                posology: updatedFields.directions ?? item.posology,
                instructions: updatedFields.directions ?? item.instructions,
                price: Number(updatedFields.price ?? item.price) || item.price,
              }
            : item
        )
      );
    }

    setEditingFormulaIdx(null);
    toast.success(`Fórmula ${formula.phaseNumber} actualizada para este Refill ✓`);
  };

  const handleReplaceFormulaWithCatalogItem = (formula, newCatalogItem) => {
    const existing = findCartItemForFormula(formula);
    const replacement = {
      ...newCatalogItem,
      id: newCatalogItem.id || crypto.randomUUID(),
      _refillKey: formula.key,
      replacedFormulaTitle: formula.title,
      sourceId: `refill-replace-${activeRx?.id || 'rx'}`,
      sourceType: 'refill_replacement',
    };

    if (existing) {
      setDraftItems((prev) => prev.map((item) => (item === existing ? replacement : item)));
    } else {
      setDraftItems((prev) => [...prev, replacement]);
    }

    setFormulaEdits((prev) => ({
      ...prev,
      [formula.key]: {
        title: `${newCatalogItem.name || newCatalogItem.productName} (Sustituye a ${formula.title})`,
        formula: newCatalogItem.dosage || newCatalogItem.sku || 'Standard Catalog Presentation',
        vehicle: newCatalogItem.presentation || 'Catalog Formulation',
        volume: newCatalogItem.dosage || '1 Unit',
        directions: newCatalogItem.notes || formula.directions,
        price: Number(newCatalogItem.price) || formula.price,
      },
    }));

    setReplacingFormulaIdx(null);
    toast.success(`Sustituido "${formula.title}" por "${newCatalogItem.name || newCatalogItem.productName}"`);
  };

  const handleOpenLabelsPreview = (startIndex = 0) => {
    if (typeof window !== 'undefined' && activeRx) {
      window.dispatchEvent(
        new CustomEvent('OPEN_PHARMAPOLIS_LABELS', {
          detail: { rx: activeRx, index: startIndex },
        })
      );
    }
  };

  if (!activeRx) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: '10px',
        color: '#64748b',
        fontSize: '0.88rem',
      }}>
        No se encontraron prescripciones anteriores para este paciente. Usa las pestañas <strong>Use Protocol</strong> o <strong>Custom Products</strong>.
      </div>
    );
  }

  const rxCode = activeRx.prescriptionCode || activeRx.code || activeRx.protocolNumber || activeRx.id;
  const cloudPdfUrl = activeRx.pdfUrl || activeRx.documentUrl || activeRx.importedFileUrl || activeRx.fagron?.originalFileUrl || null;
  const includedCount = enrichedFormulas.filter((f) => Boolean(findCartItemForFormula(f))).length;
  const allIncluded = enrichedFormulas.length > 0 && includedCount === enrichedFormulas.length;

  // Compute extra items added from catalog that are not part of the original formulas
  const formulaKeys = new Set(enrichedFormulas.map((f) => f.key));
  const formulaTitles = new Set(enrichedFormulas.map((f) => f.title));
  const extraCatalogItems = draftItems.filter(
    (d) => !formulaKeys.has(d._refillKey) && !formulaTitles.has(d.name)
  );

  // Refill scheduler state
  const cycleDays = refillConfig?.cycleDays ?? 90;
  const nextRefillDateStr = refillConfig?.nextRefillDate || (() => {
    const d = new Date();
    d.setDate(d.getDate() + cycleDays);
    return d.toISOString().split('T')[0];
  })();
  const refillsRemaining = refillConfig?.refillsRemaining ?? 1;

  const handleSelectCycleDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const isoDate = d.toISOString().split('T')[0];
    onChangeRefillConfig?.({
      ...refillConfig,
      cycleDays: days,
      nextRefillDate: isoDate,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* ── Multiple Prior Prescriptions Switcher (if patient has >1 prior Rx) ── */}
      {patientHistoryPrescriptions.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.6rem 0.9rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '0.8rem',
        }}>
          <span style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={14} color="#003666" />
            Prescripción Origen a Duplicar / Renovar:
          </span>
          <select
            value={activeRx.id}
            onChange={(e) => {
              const found = patientHistoryPrescriptions.find((p) => p.id === e.target.value);
              if (found && onSelectSourceRx) onSelectSourceRx(found);
            }}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#0f172a',
              background: '#ffffff',
            }}
          >
            {patientHistoryPrescriptions.map((p) => {
              const c = p.prescriptionCode || p.code || p.id?.slice(0, 8);
              const title = p.protocolName || p.treatmentTitle || 'Compounded Rx';
              return (
                <option key={p.id} value={p.id}>
                  #{c} · {title}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* ── 1. HEADER CARD: PRIOR PRESCRIPTION METADATA + LABELS & PDF ACTIONS ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      }}>
        {/* Top Banner Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.9rem 1.1rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#003666',
                color: '#ffffff',
              }}>
                REFILL & DUPLICACIÓN DE RECETA
              </span>

              <CopyableId value={rxCode} />

              {intel && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 9px',
                  borderRadius: '999px',
                  background: intel.status === 'overdue' ? '#fef3c7' : intel.status === 'due_soon' ? '#dbeafe' : '#dcfce7',
                  color: intel.status === 'overdue' ? '#b45309' : intel.status === 'due_soon' ? '#1d4ed8' : '#15803d',
                  border: `1px solid ${intel.status === 'overdue' ? '#fde68a' : intel.status === 'due_soon' ? '#bfdbfe' : '#bbf7d0'}`,
                }}>
                  {intel.status === 'overdue' ? '⚠️ ' : intel.status === 'due_soon' ? '🔔 ' : '🟢 '}
                  {intel.badgeLabel}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {activeRx.protocolName || activeRx.treatmentTitle || activeRx.treatmentProgram || 'Fórmula Magistral Personalizada'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#475569' }}>
              <span>
                👨‍⚕️ Médico Origen: <strong>{activeRx.doctor?.name || activeRx.doctorName || 'Dr. Prescriptor'}</strong>
              </span>
              <span>·</span>
              <span>
                🧪 <strong>{enrichedFormulas.length} {enrichedFormulas.length === 1 ? 'Fórmula' : 'Fórmulas'}</strong> en la prescripción original
              </span>
              {intel?.detailText && (
                <>
                  <span>·</span>
                  <span>{intel.detailText}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Quick Actions: View Original Labels & Original Cloud PDF */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleOpenLabelsPreview(0)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.42rem 0.75rem',
                borderRadius: '7px',
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #86efac',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Ver las etiquetas galénicas completas de Pharmapolis de esta prescripción"
            >
              <Tag size={13} />
              Ver Etiquetas Labels ({enrichedFormulas.length})
            </button>

            {cloudPdfUrl && (
              <a
                href={cloudPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.42rem 0.75rem',
                  borderRadius: '7px',
                  background: '#ffffff',
                  color: '#1d4ed8',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <FileText size={13} />
                Original Cloud PDF ↗
              </a>
            )}
          </div>
        </div>

        {/* Sub-Toolbar: Bulk Inclusion Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.65rem 1.1rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
            Selecciona qué fórmulas deseas incluir en esta renovación, edita sus concentraciones/cantidades o sustitúyelas:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: includedCount > 0 ? '#dcfce7' : '#fee2e2',
              color: includedCount > 0 ? '#166534' : '#991b1b',
            }}>
              {includedCount} de {enrichedFormulas.length} Fórmulas Incluidas
            </span>
            <button
              type="button"
              onClick={() => handleIncludeAll(!allIncluded)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {allIncluded ? 'Deseleccionar Todas' : '✓ Incluir Todas'}
            </button>
          </div>
        </div>

        {/* ── 2. LABELS-STYLE FORMULA CARDS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem' }}>
          {enrichedFormulas.map((formula, idx) => {
            const cartItem = findCartItemForFormula(formula);
            const isIncluded = Boolean(cartItem);
            const qty = cartItem?.quantity || formula.defaultQuantity || 1;
            const isEditing = editingFormulaIdx === idx;
            const isReplacing = replacingFormulaIdx === idx;

            return (
              <div
                key={formula.key}
                style={{
                  border: isIncluded ? '1.5px solid #3b82f6' : '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  background: isIncluded ? '#ffffff' : '#f8fafc',
                  opacity: isIncluded ? 1 : 0.72,
                  transition: 'all 0.15s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Formula Card Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: isIncluded ? '#eff6ff' : '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
                    {/* Include / Exclude Checkbox Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleIncludeFormula(formula)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.32rem 0.65rem',
                        borderRadius: '6px',
                        border: isIncluded ? '1px solid #2563eb' : '1px solid #94a3b8',
                        background: isIncluded ? '#2563eb' : '#ffffff',
                        color: isIncluded ? '#ffffff' : '#475569',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {isIncluded ? <Check size={13} /> : <X size={13} />}
                      {isIncluded ? 'Incluida en Refill' : 'Excluida'}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: '#0f172a',
                          color: '#ffffff',
                        }}>
                          FÓRMULA {formula.phaseNumber}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                          {formula.title}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '1px 8px',
                          borderRadius: '99px',
                          background: '#dbeafe',
                          color: '#1e40af',
                        }}>
                          {formula.volume}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 500 }}>
                        {formula.dosageForm}
                      </span>
                    </div>
                  </div>

                  {/* Right Controls: Quantity Stepper + Edit + Replace + Label View */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {isIncluded && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: '#ffffff',
                      }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateFormulaQuantity(formula, -1)}
                          style={{ border: 'none', background: 'transparent', padding: '3px 8px', cursor: 'pointer', fontWeight: 800, color: '#334155' }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0 6px', color: '#0f172a' }}>
                          Qty: {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateFormulaQuantity(formula, 1)}
                          style={{ border: 'none', background: 'transparent', padding: '3px 8px', cursor: 'pointer', fontWeight: 800, color: '#334155' }}
                        >
                          +
                        </button>
                      </div>
                    )}

                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', minWidth: '58px', textAlign: 'right' }}>
                      ${(formula.price * (isIncluded ? qty : 1)).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingFormulaIdx(isEditing ? null : idx);
                        setReplacingFormulaIdx(null);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: isEditing ? '#fef3c7' : '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Editar dosis, principios activos, vehículo o posología para este Refill"
                    >
                      <Edit3 size={12} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingFormulaIdx(isReplacing ? null : idx);
                        setEditingFormulaIdx(null);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: isReplacing ? '#e0e7ff' : '#ffffff',
                        color: '#1e40af',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Sustituir esta fórmula por otro producto del catálogo"
                    >
                      <RefreshCw size={12} />
                      Sustituir
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenLabelsPreview(idx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0',
                        background: '#f0fdf4',
                        color: '#166534',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Ver etiqueta Pharmapolis de esta fórmula"
                    >
                      <Tag size={12} />
                      Label
                    </button>
                  </div>
                </div>

                {/* Formula Body: Labels-Style Breakdown (APIs, Vehicle, Posology) */}
                <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Active Ingredients (APIs) */}
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                      Principios Activos & Concentración (APIs)
                    </div>
                    {formula.apis && formula.apis.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {formula.apis.map((api, aIdx) => (
                          <span
                            key={aIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#0f172a',
                            }}
                          >
                            <FlaskConical size={12} color="#2563eb" />
                            <span>{api.name}</span>
                            {api.dose && (
                              <span style={{
                                padding: '0 5px',
                                borderRadius: '4px',
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                fontWeight: 700,
                                fontSize: '0.73rem',
                              }}>
                                {api.dose}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        {formula.formula || 'Fórmula magistral según prescripción original'}
                      </div>
                    )}
                  </div>

                  {/* Two-column Galenic Vehicle + Posology */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                    <div style={{ padding: '0.5rem 0.7rem', borderRadius: '7px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Vehículo / Excipiente Galénico
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
                        {formula.vehicle} ({formula.volume})
                      </div>
                    </div>

                    <div style={{ padding: '0.5rem 0.7rem', borderRadius: '7px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Posología / Pauta de Administración
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 500 }}>
                        {formula.directions}
                      </div>
                    </div>
                  </div>

                  {/* Inline Formula Editor (when user clicks "Editar") */}
                  {isEditing && (
                    <FormulaInlineEditor
                      formula={formula}
                      onSave={(updated) => handleSaveFormulaInlineEdit(formula, updated)}
                      onCancel={() => setEditingFormulaIdx(null)}
                    />
                  )}

                  {/* Inline Catalog Replacer (when user clicks "Sustituir") */}
                  {isReplacing && (
                    <div style={{
                      marginTop: '0.4rem',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      border: '1px solid #93c5fd',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a' }}>
                          🔄 Buscar producto en el catálogo para sustituir a &ldquo;{formula.title}&rdquo;:
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplacingFormulaIdx(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.76rem', fontWeight: 600 }}
                        >
                          Cancelar ✕
                        </button>
                      </div>
                      <BuilderCatalogSearch
                        onAdd={(newItem) => handleReplaceFormulaWithCatalogItem(formula, newItem)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Extra Added Catalog Products Section */}
          {extraCatalogItems.length > 0 && (
            <div style={{
              marginTop: '0.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ➕ Productos Adicionales Incorporados a este Refill ({extraCatalogItems.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {extraCatalogItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.7rem',
                      background: '#ffffff',
                      borderRadius: '7px',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <strong>{item.name || item.productName}</strong>
                      {item.dosage && <span style={{ color: '#475569', marginLeft: '0.4rem' }}>· {item.dosage}</span>}
                      <span style={{ color: '#15803d', fontWeight: 700, marginLeft: '0.5rem' }}>Qty: {item.quantity || 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraftItems((prev) => prev.filter((i) => i !== item))}
                      style={{
                        border: 'none',
                        background: '#fee2e2',
                        color: '#991b1b',
                        borderRadius: '5px',
                        padding: '2px 8px',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Button to Add Additional Product from Catalog */}
          <div>
            {!showAddCatalogModal ? (
              <button
                type="button"
                onClick={() => setShowAddCatalogModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  border: '1.5px dashed #2563eb',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Plus size={15} />
                Añadir otro Producto o Péptido adicional a esta Prescripción
              </button>
            ) : (
              <div style={{
                padding: '0.9rem',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #93c5fd',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    ➕ Buscar en el catálogo para añadir al Refill:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddCatalogModal(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Cerrar buscador ✕
                  </button>
                </div>
                <BuilderCatalogSearch
                  onAdd={(item) => {
                    addItem(item);
                    toast.success(`Añadido "${item.name || item.productName}" al Refill`);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. NEXT REFILL SCHEDULER & CYCLE REGISTRATION CARD ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1rem 1.15rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={17} color="#003666" />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                Programación y Registro del Próximo Refill
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Se registrará automáticamente en la nueva prescripción y actualizará el ciclo de alertas del paciente.
              </div>
            </div>
          </div>

          <span style={{
            fontSize: '0.76rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '99px',
            background: '#dcfce7',
            color: '#166534',
            border: '1px solid #86efac',
          }}>
            📅 Próximo Refill: {nextRefillDateStr}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.85rem',
          alignItems: 'end',
        }}>
          {/* Cycle Preset Pills */}
          <div>
            <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Duración del Ciclo (Días)
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {[
                { days: 30, label: '30d' },
                { days: 60, label: '60d' },
                { days: 90, label: '90d (Estándar)' },
                { days: 180, label: '180d' },
              ].map((preset) => {
                const active = cycleDays === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleSelectCycleDays(preset.days)}
                    style={{
                      padding: '0.36rem 0.65rem',
                      borderRadius: '6px',
                      border: active ? '1.5px solid #003666' : '1px solid #cbd5e1',
                      background: active ? '#003666' : '#f8fafc',
                      color: active ? '#ffffff' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exact Next Refill Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Fecha Exacta Próximo Refill
            </label>
            <input
              type="date"
              value={nextRefillDateStr}
              onChange={(e) => {
                const val = e.target.value;
                const diffMs = new Date(val).getTime() - Date.now();
                const computedDays = Math.max(1, Math.round(diffMs / 86400000));
                onChangeRefillConfig?.({
                  ...refillConfig,
                  nextRefillDate: val,
                  cycleDays: computedDays,
                });
              }}
              style={{
                width: '100%',
                padding: '0.38rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0f172a',
              }}
            />
          </div>

          {/* Authorized Refills Remaining */}
          <div>
            <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Renovaciones Adicionales Autorizadas
            </label>
            <select
              value={refillsRemaining}
              onChange={(e) =>
                onChangeRefillConfig?.({
                  ...refillConfig,
                  refillsRemaining: Number(e.target.value),
                })
              }
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0f172a',
                background: '#ffffff',
              }}
            >
              <option value={0}>0 (Solo esta renovación)</option>
              <option value={1}>1 Refill adicional autorizado</option>
              <option value={2}>2 Refills adicionales autorizados</option>
              <option value={3}>3 Refills adicionales autorizados</option>
              <option value={4}>4 Refills adicionales autorizados</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FormulaInlineEditor — Allows modifying Title, Active Ingredients, Vehicle, Volume, Posology, and Price inline
 */
function FormulaInlineEditor({ formula, onSave, onCancel }) {
  const [title, setTitle] = useState(formula.title || '');
  const [comp, setComp] = useState(formula.formula || '');
  const [vehicle, setVehicle] = useState(formula.vehicle || '');
  const [volume, setVolume] = useState(formula.volume || '');
  const [directions, setDirections] = useState(formula.directions || '');
  const [price, setPrice] = useState(formula.price || 145);

  return (
    <div style={{
      marginTop: '0.4rem',
      padding: '0.85rem',
      borderRadius: '8px',
      background: '#fffbeb',
      border: '1px solid #fcd34d',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>✏️ Editar Fórmula {formula.phaseNumber} para la nueva Prescripción</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
            Nombre de la Fórmula / Producto
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
            Volumen / Cantidad Envase
          </label>
          <input
            type="text"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
            Precio Unitario ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
          Principios Activos y Concentraciones (Fórmula Magistral)
        </label>
        <input
          type="text"
          value={comp}
          onChange={(e) => setComp(e.target.value)}
          style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
            Vehículo / Base Galénica
          </label>
          <input
            type="text"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
            Posología / Instrucciones al Paciente
          </label>
          <input
            type="text"
            value={directions}
            onChange={(e) => setDirections(e.target.value)}
            style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          />
        </div>
      </div>

      {/* Golden Rule #5: Explicit Save (✔️) and Cancel (❌) confirmation buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem', marginTop: '0.2rem' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0.32rem 0.7rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ❌ Cancelar
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              title,
              formula: comp,
              vehicle,
              volume,
              directions,
              price: Number(price) || formula.price,
            })
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0.32rem 0.75rem',
            borderRadius: '6px',
            border: 'none',
            background: '#16a34a',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ✔️ Guardar Cambios en Fórmula
        </button>
      </div>
    </div>
  );
}

