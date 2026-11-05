'use client';

import { useMemo } from 'react';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import { normalizeRxRefillItems, computeRxRefillIntelligence } from '@/stores/orderBuilderSlices/createOrderPrefetchSlice';
import { classifyPrescription } from '@/data/prescriptionTypeClassifier';

/**
 * usePrescriptionParts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single authoritative hook to normalize any prescription (single, multi-part,
 * Fagron, galenic, peptides, or session group) into a structured array of
 * clinical formulation parts.
 *
 * Reused by:
 * - <PrescriptionPreview /> (Universal preview component)
 * - UniversalPrescriptionsTable (expandable row master-detail)
 * - RefillPrescriptionWorkbench (refill duplication & selective builder)
 * - PharmacyLabelsModal (parts switcher)
 */
export function usePrescriptionParts(rx) {
  return useMemo(() => {
    if (!rx) {
      return {
        header: null,
        parts: [],
        isEmpty: true,
        isMultipart: false,
        totalParts: 0,
      };
    }

    // 1. Resolve prescription header metadata
    const typeInfo = classifyPrescription(rx);
    const code = rx.prescriptionCode || rx.code || rx.prescriptionNumber || rx.fileNumber || rx.id;
    const patientName = rx.patient?.name || rx.patientName || rx.patientInfo?.name || 'Patient';
    const patientId = rx.patient?.id || rx.patientId || null;
    const doctorName = rx.doctor?.name || rx.doctorName || rx.treatingDoctor || '—';
    const doctorId = rx.doctor?.id || rx.doctorId || null;
    const clinicName = rx.clinicName || rx.clinic?.name || rx.doctor?.clinic || '';
    const issuedDate = rx.dateIssued || rx.date || rx.createdAt || rx.prescriptionDate || null;
    const status = (rx.status || 'draft').toLowerCase();
    const isImport = (rx.source || 'manual').toLowerCase() !== 'manual';
    const sourceLabel = isImport
      ? (rx.source === 'fagron' ? 'Fagron Genomics' :
         rx.source === 'document' ? 'Scanned Document' :
         rx.source === 'ai_report' ? 'AI Report' :
         rx.source === 'protocol' ? 'Clinical Protocol' : 'Import')
      : 'Manual Entry';
    const sourceFileUrl = rx.fagron?.originalFileUrl || rx.importedFileUrl || rx.sourceFileUrl || rx.pdfUrl || null;
    const sourceFileName = rx.fagron?.originalFileName || rx.importedFileName || rx.sourceFileName || 'Source document';

    const intel = rx._refillIntel || computeRxRefillIntelligence(rx);

    // 2. Multi-part grouped session handling (_isSessionGroup)
    if (rx._isSessionGroup && Array.isArray(rx._sessionMembers) && rx._sessionMembers.length > 0) {
      const allParts = rx._sessionMembers.flatMap((member, memberIdx) => {
        let memberLabels = [];
        try {
          memberLabels = getPharmapolisLabelsForPrescription(member) || [];
        } catch {
          memberLabels = [];
        }

        if (memberLabels.length > 0) {
          return memberLabels.map((lbl, subIdx) => mapLabelToPart(lbl, member, memberIdx + subIdx));
        }

        // Fallback to normalized refill items
        const rawItems = normalizeRxRefillItems(member);
        return rawItems.map((item, subIdx) => mapItemToPart(item, member, memberIdx + subIdx));
      });

      return {
        header: {
          code,
          patientName,
          patientId,
          doctorName,
          doctorId,
          clinicName,
          issuedDate,
          status,
          isImport,
          sourceLabel,
          sourceFileUrl,
          sourceFileName,
          typeInfo,
          intel,
          nextRefillDate: rx.nextRefillDate || null,
          refillNumber: rx.refillNumber || null,
          parentPrescriptionCode: rx.parentPrescriptionCode || null,
        },
        parts: allParts,
        isEmpty: allParts.length === 0,
        isMultipart: true,
        totalParts: allParts.length,
      };
    }

    // 3. Standard row: Extract parts via getPharmapolisLabelsForPrescription
    let labels = [];
    try {
      labels = getPharmapolisLabelsForPrescription(rx) || [];
    } catch (err) {
      console.warn('[usePrescriptionParts] Error calling getPharmapolisLabelsForPrescription:', err);
      labels = [];
    }

    let parts = [];
    if (labels.length > 0) {
      parts = labels.map((lbl, idx) => mapLabelToPart(lbl, rx, idx));
    } else {
      // Fallback if labels map returns empty
      const rawItems = normalizeRxRefillItems(rx);
      parts = rawItems.map((item, idx) => mapItemToPart(item, rx, idx));
    }

    return {
      header: {
        code,
        patientName,
        patientId,
        doctorName,
        doctorId,
        clinicName,
        issuedDate,
        status,
        isImport,
        sourceLabel,
        sourceFileUrl,
        sourceFileName,
        typeInfo,
        intel,
        nextRefillDate: rx.nextRefillDate || null,
        refillNumber: rx.refillNumber || null,
        parentPrescriptionCode: rx.parentPrescriptionCode || null,
      },
      parts,
      isEmpty: parts.length === 0,
      isMultipart: parts.length > 1,
      totalParts: parts.length,
    };
  }, [rx]);
}

/**
 * Maps a resolved Pharmapolis label object to a clean Part representation.
 */
function mapLabelToPart(lbl, rx, idx) {
  const phaseNumber = lbl.phaseNumber || (idx + 1);

  // Extract clean APIs
  const apis = Array.isArray(lbl.apis) && lbl.apis.length > 0
    ? lbl.apis.map(a => ({
        name: a.name || a.drugName || a.activeIngredient || 'API',
        dose: a.dose || a.dosage || a.strength || '',
        zohoMatched: Boolean(a.zoho_item_id || a.zoho_sku),
      }))
    : Array.isArray(lbl.activeIngredientsList) && lbl.activeIngredientsList.length > 0
      ? lbl.activeIngredientsList.map(str => ({ name: str, dose: '', zohoMatched: false }))
      : [];

  // Detect route tag for easy pill display: Oral, Topical, Scalp Care, BHRT, etc.
  const title = lbl.productTitle || lbl.productName || `Formula ${phaseNumber}`;
  const dosageForm = lbl.dosageForm || 'Compounded Pharmaceutical Protocol';
  const volume = lbl.volume || '100 mL';
  const vehicle = typeof lbl.vehicle === 'string' ? lbl.vehicle : (lbl.vehicle?.name || 'Base galénica magistral');
  const directions = lbl.directions || lbl.instructions || 'Aplicar / tomar según pauta del médico prescriptor.';

  const routeTag = detectRouteTag(title, dosageForm, vehicle, directions);

  return {
    key: lbl.id || `part_${phaseNumber}_${idx}`,
    phaseNumber,
    title,
    subTitle: lbl.subTitle || (routeTag ? `${routeTag} · ${volume}` : volume),
    routeTag,
    dosageForm,
    volume,
    vehicle,
    formula: lbl.formula || apis.map(a => `${a.name} ${a.dose}`.trim()).join(' + '),
    apis,
    directions,
    warnings: lbl.warnings || '',
    storage: lbl.storage || 'Conservar a temperatura ambiente (15°C - 25°C).',
    batchCode: lbl.batchCode || '',
    lote: lbl.lote || '',
    prodDate: lbl.prodDate || '',
    expDate: lbl.expDate || '',
    doctorName: lbl.doctorName || rx?.doctor?.name || rx?.doctorName || '',
    doctorLicense: lbl.doctorLicense || '',
    clinicName: lbl.clinicName || '',
    targetRxUrl: lbl.targetRxUrl || null,
    rawLabel: lbl,
    price: Number(lbl.price || rx?.price || 145),
    quantity: Number(lbl.quantity || 1),
  };
}

/**
 * Fallback mapping from raw normalized item to clean Part.
 */
function mapItemToPart(item, rx, idx) {
  const phaseNumber = item.phaseNumber || (idx + 1);
  const title = item.productName || item.name || `Formula ${phaseNumber}`;
  const dosageForm = item.format || item.dispensingForm || 'Compounded Formula';
  const volume = item.volume || '1 Unit';
  const vehicle = item.vehicle || 'Galenic Base';
  const directions = item.posology || item.instructions || item.directions || 'Use as directed.';
  const routeTag = detectRouteTag(title, dosageForm, vehicle, directions);

  return {
    key: item.id || `part_${phaseNumber}_${idx}`,
    phaseNumber,
    title,
    subTitle: routeTag ? `${routeTag} · ${volume}` : volume,
    routeTag,
    dosageForm,
    volume,
    vehicle,
    formula: item.dosage || item.dose || title,
    apis: [{ name: title, dose: item.dosage || item.dose || '', zohoMatched: Boolean(item.zoho_item_id || item.zoho_sku) }],
    directions,
    warnings: '',
    storage: 'Store in a cool dry place',
    batchCode: '',
    lote: '',
    prodDate: '',
    expDate: '',
    doctorName: rx?.doctor?.name || rx?.doctorName || '',
    doctorLicense: '',
    clinicName: '',
    targetRxUrl: null,
    rawLabel: null,
    price: Number(item.price || 145),
    quantity: Number(item.quantity || 1),
  };
}

function detectRouteTag(title = '', dosageForm = '', vehicle = '', directions = '') {
  const text = `${title} ${dosageForm} ${vehicle} ${directions}`.toLowerCase();
  if (/\b(shampoo|wash|trichowash)\b/i.test(text)) return 'Scalp Wash';
  if (/\b(trichooil|oil|aceite)\b/i.test(text)) return 'Scalp Oil';
  if (/\b(scalp|topical|trichosol|solution|locion|lotion|drops)\b/i.test(text)) return 'Topical Scalp';
  if (/\b(oral|capsule|cápsula|tablet|swallow|breakfast|dinner)\b/i.test(text)) return 'Oral Formula';
  if (/\b(transdermal|bhrt|testosterone|estradiol|progesterone|pentravan)\b/i.test(text)) return 'BHRT Transdermal';
  if (/\b(injectable|subq|vial|pept|lyophilized)\b/i.test(text)) return 'SubQ Vial';
  return 'Galenic Formula';
}

