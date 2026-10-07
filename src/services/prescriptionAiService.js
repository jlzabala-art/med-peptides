/**
 * @file prescriptionAiService.js
 * @description Unified AI Prescription Processing Engine.
 * 
 * Capabilities:
 *  - Multimodal AI Extraction (Gemini 2.5 Flash) via /api/ai-extract-prescription
 *  - Automatic Classification (Standard Clinical Prescriptions vs Fagron Genomics)
 *  - Multi-formulation session grouping (TrichoSol, TrichoOil, Oral Capsules, etc.)
 *  - Fuzzy Catalog Matching via Algolia with automatic Placeholder Generation (resolveIngredients)
 *  - Real-time Firestore Deduplication (by Box ID or Patient + Report Date)
 *  - Canonical schema normalization matching src/schemas/prescriptionSchema.js & AGENTS.md Rule #28
 *  - Optional automatic patient registration/linking via patientLinkService
 */

import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase.js';
import { PRESCRIPTION_SOURCES, PRESCRIPTION_STATUSES, prescriptionSchema, prescriptionLineSchema } from '../schemas/prescriptionSchema.js';
import { resolveIngredients } from './apiIngredientMatcher.js';
import { createPatient } from './patientLinkService.js';
import { logger } from '../utils/logger';
import { getPharmapolisLabelsForPrescription } from '../data/pharmapolisLabelsMap.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/i, '')
    .replace(/^dr[a]?\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── Known Compounding Vehicles & Galenic Bases ──────────────────────────────
export const GALENIC_VEHICLE_PATTERNS = [
  'trichosol', 'trichooil', 'trichofoam', 'espumil', 'pentravan',
  'versabase', 'nourivan', 'syrspend', 'bacteriostatic water',
  'agua bacteriostatica', 'agua bacteriostática', 'suero fisiologico',
  'suero fisiológico', 'beeler', 'vehiculo', 'vehículo', 'base csp',
  'c.s.p.', 'csp', 'solucion hidroalcoholica', 'solución hidroalcohólica',
  'liposomal base', 'crema base', 'gel base'
];

/**
 * Checks if a product or ingredient name is a galenic vehicle / compounding base.
 * @param {string} name 
 * @returns {boolean}
 */
export function isGalenicVehicleOrBase(name) {
  if (!name) return false;
  const n = String(name).toLowerCase();
  return GALENIC_VEHICLE_PATTERNS.some(pattern => n.includes(pattern));
}

/**
 * Searches for an existing doctor in Firestore by license or full name.
 * 
 * @param {string} doctorName 
 * @param {string} doctorLicense 
 * @returns {Promise<Object|null>} Doctor object with id if found
 */
export async function lookupDoctorByNameOrLicense(doctorName = '', doctorLicense = '') {
  try {
    const cleanLic = (doctorLicense || '').trim();
    const cleanName = (doctorName || '').trim().replace(/^dr\.?\s+/i, '');

    // 1. Try matching license number if provided
    if (cleanLic) {
      const qLic = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        where('licenseNumber', '==', cleanLic),
        limit(1)
      );
      const snapLic = await getDocs(qLic);
      if (!snapLic.empty) {
        return { id: snapLic.docs[0].id, ...snapLic.docs[0].data() };
      }

      // Check alternate field medicalLicense
      const qMedLic = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        where('medicalLicense', '==', cleanLic),
        limit(1)
      );
      const snapMedLic = await getDocs(qMedLic);
      if (!snapMedLic.empty) {
        return { id: snapMedLic.docs[0].id, ...snapMedLic.docs[0].data() };
      }
    }

    // 2. Try matching doctor name against doctors list
    if (cleanName && cleanName.length >= 3) {
      const qDocs = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        limit(100)
      );
      const snapDocs = await getDocs(qDocs);
      const targetLower = cleanName.toLowerCase();

      for (const d of snapDocs.docs) {
        const data = d.data();
        const dName = (data.displayName || data.name || `${data.firstName || ''} ${data.lastName || ''}`).toLowerCase();
        if (dName.includes(targetLower) || targetLower.includes(dName)) {
          return { id: d.id, ...data };
        }
      }
    }
  } catch (err) {
    logger.warn('[prescriptionAiService] lookupDoctorByNameOrLicense warning', { error: err.message });
  }
  return null;
}

/**
 * Sends a file (PDF or Image) to the multimodal AI endpoint for extraction.
 * @param {File|Blob} file 
 * @returns {Promise<Object>} Raw structured extraction from Gemini
 */
export async function extractPrescriptionFromDocument(file) {
  if (!file) {
    throw new Error('No file provided for AI extraction.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/ai-extract-prescription', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `AI extraction failed with HTTP status ${res.status}`);
  }

  const data = await res.json();
  return data;
}

/**
 * Normalizes raw Gemini AI extraction into strict canonical prescription objects.
 * Handles multi-formulation blocks (Fagron Genomics TrichoTest/NutriGen or multi-med Rx)
 * and resolves ingredients against the Algolia product catalog.
 * 
 * @param {Object} rawData - Output from extractPrescriptionFromDocument
 * @param {Object} options - Options (currentUser, context, supplierHint)
 * @returns {Promise<Array<Object>>} Array of normalized prescription documents
 */
export async function normalizeExtractedPrescriptions(rawData, options = {}) {
  const { currentUser, context = {}, supplierHint = null } = options;
  const isFagron = rawData.documentType === 'FagronGenomics' || rawData.fagronDetails?.isFagron || !!rawData.fagronDetails?.boxId;

  // Extract formulation blocks
  let blocks = [];
  if (Array.isArray(rawData.formulationBlocks) && rawData.formulationBlocks.length > 0) {
    blocks = rawData.formulationBlocks;
  } else {
    // Fallback single block
    blocks = [{
      treatmentProgram: isFagron ? (rawData.fagronDetails?.testName || 'Fagron Genomics') : 'Standard Prescription',
      treatmentType: isFagron ? 'Topical Magistral Formulation' : 'Medical Prescription',
      dispensingForm: 'Topical Solution',
      volume: null,
      duration: '30 days',
      treatmentDays: 30,
      posology: rawData.clinicalNotes || 'As directed by physician.',
      items: (rawData.ingredients || []).map(ing => ({
        name: ing.name || '',
        dose: ing.dose || '',
        quantity: ing.quantity || 1,
        frequency: 'Once daily'
      }))
    }];
  }

  // Generate shared sessionId if multiple formulations exist in a single document
  const sessionId = blocks.length > 1 ? `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : null;

  // Check if caller specifically requested splitting blocks into individual prescriptions
  const shouldSplitBlocks = options.splitBlocksIntoSeparatePrescriptions === true;

  if (shouldSplitBlocks) {
    const splitResults = [];
    for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
      const block = blocks[blockIdx];
      const rawItems = Array.isArray(block.items) ? block.items : [];
      const targetProg = isFagron ? (rawData.fagronDetails?.testName || block.treatmentProgram || 'Fagron Genomics') : null;
      const resolvedIngredients = await resolveIngredients(rawItems, {
        supplierHint: supplierHint || (isFagron ? 'Fagron Iberia' : 'Standard Supplier'),
        importSource: isFagron ? 'fagron_ai_import' : 'standard_rx_ai_import',
        programName: targetProg,
      });

      const anyUnresolved = resolvedIngredients.some(r => !r.productId || r.isPlaceholder);
      const unassignedAlerts = resolvedIngredients.filter(r => r.isUnassignedProgramApi && r.programAlert).map(r => r.programAlert);

      const blockLabel = block.treatmentType || block.treatmentProgram || `Formulation ${blockIdx + 1}`;
      const prescriptionLines = resolvedIngredients.map((r, idx) => {
        const orig = r.original || {};
        const nameLower = (orig.name || '').toLowerCase();
        let dosageForm = block.dispensingForm || 'Magistral Component';
        if (nameLower.includes('trichosol') || nameLower.includes('solution') || nameLower.includes('lotion')) {
          dosageForm = 'Topical Solution (Vehicle)';
        } else if (nameLower.includes('trichooil') || nameLower.includes('oil')) {
          dosageForm = 'Topical Oil (Vehicle)';
        } else if (nameLower.includes('cap') || nameLower.includes('tablet') || nameLower.includes('oral')) {
          dosageForm = 'Oral Capsule';
        } else if (nameLower.includes('vial') || nameLower.includes('inj') || orig.route?.toLowerCase() === 'subcutaneous') {
          dosageForm = 'Injectable Vial';
        }

        return {
          ...prescriptionLineSchema,
          id: `rx_line_${Date.now()}_${blockIdx}_${idx}`,
          productId: r.productId || null,
          variantId: null,
          productName: r.matchedName || orig.name || '',
          sku: '',
          activeIngredient: orig.activeIngredient || orig.name || '',
          dosage: orig.dosage || orig.dose || '',
          dose: orig.dose || orig.dosage || '',
          strength: orig.strength || orig.dose || '',
          concentration: orig.strength || orig.dose || '',
          presentation: block.volume || '',
          category: isFagron ? 'Compounding / Genomic' : 'Peptide / Medicine',
          price: 0,
          quantity: Number(orig.quantity) || 1,
          dosageForm,
          formulationBlock: blockLabel,
          formulationIndex: blockIdx + 1,
          blockVolume: block.volume || null,
          route: orig.route || (dosageForm.includes('Topical') ? 'Topical' : (dosageForm.includes('Injectable') ? 'Subcutaneous' : 'Oral')),
          frequency: orig.frequency || (dosageForm.includes('Topical') ? 'Once daily (Night)' : 'As directed'),
          duration: orig.duration || block.duration || '30 days',
          treatmentDays: Number(block.treatmentDays) || 30,
          instructions: orig.instructions || block.posology || '',
          patientInstructions: block.posology || '',
          status: 'pending',
          geneTargets: r.matchedProduct?.geneTargets || orig.geneTargets || [],
          clinicalDescription: r.matchedProduct?.clinicalDescription || orig.clinicalDescription || '',
          clinicalIndication: r.matchedProduct?.clinicalIndication || orig.clinicalIndication || '',
          mechanismOfAction: r.matchedProduct?.mechanismOfAction || orig.mechanismOfAction || '',
          pharmacologicalClass: r.matchedProduct?.pharmacologicalClass || orig.pharmacologicalClass || '',
          compatibleVehicles: r.matchedProduct?.compatibleVehicles || orig.compatibleVehicles || [],
          _isPlaceholder: !!r.isPlaceholder,
          _isNewPlaceholder: !!r.isNew,
          _needsProductMapping: !r.productId || !!r.isPlaceholder,
          _matchScore: r.score || 0,
          _genomicPriority: r.priority || null,
          _isProgramAssigned: r.isProgramAssigned ?? true,
          _isUnassignedProgramApi: !!r.isUnassignedProgramApi,
          _programAlert: r.programAlert || null,
          _unassignedProgramName: r.unassignedProgramName || null,
          _isVehicleOrBase: !!orig.isVehicleOrBase || 
            nameLower.includes('trichosol') || 
            nameLower.includes('trichooil') || 
            nameLower.includes('trichofoam') || 
            nameLower.includes('pentravan') || 
            nameLower.includes('oliogel') || 
            nameLower.includes('versatile') || 
            nameLower.includes('espuma') || 
            nameLower.includes('foam') || 
            nameLower.includes('vehiculo') || 
            nameLower.includes('vehicle') ||
            nameLower.includes('c.s.p') ||
            nameLower.includes('csp'),
        };
      });

      const patientName = rawData.patient?.name || context.patientName || 'Unknown Patient';
      const doctorName = rawData.doctor?.name || context.doctorName || 'Prescribing Physician';
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedRxNumber = `RX-${datePart}-${randPart}`;

      splitResults.push({
        ...prescriptionSchema,
        ...context,
        prescriptionNumber: generatedRxNumber,
        prescriptionCode: generatedRxNumber,
        code: generatedRxNumber,
        prescriptionId: generatedRxNumber,
        status: PRESCRIPTION_STATUSES.DRAFT,
        validationStatus: anyUnresolved ? 'Needs Review' : (unassignedAlerts.length > 0 ? 'Review API Scope' : 'Ready'),
        quotationStatus: 'Pending',
        orderStatus: 'Pending',
        _unassignedProgramAlerts: unassignedAlerts,
        sourceType: isFagron ? PRESCRIPTION_SOURCES.FAGRON : PRESCRIPTION_SOURCES.UPLOAD,
        source: isFagron ? 'fagron' : 'document',
        importSource: isFagron ? 'fagron_genomics_ai' : 'standard_rx_ai',
        sessionId,
        patientId: context.patientId || null,
        patientName,
        patient: {
          name: patientName,
          dob: rawData.patient?.dob || '',
          gender: rawData.patient?.gender || '',
          email: rawData.patient?.email || '',
          phone: rawData.patient?.phone || '',
          idNumber: rawData.patient?.idNumber || '',
          address: rawData.patient?.address || '',
        },
        doctorId: context.doctorId || null,
        doctorName,
        doctorLicense: rawData.doctor?.licenseNumber || '',
        doctor: {
          name: doctorName,
          license: rawData.doctor?.licenseNumber || '',
          clinic: rawData.doctor?.clinicName || '',
          address: rawData.doctor?.clinicAddress || '',
          specialty: rawData.doctor?.specialty || '',
          phone: rawData.doctor?.phone || '',
          email: rawData.doctor?.email || '',
        },
        clinicName: rawData.doctor?.clinicName || '',
        diagnosis: rawData.diagnosis || (isFagron ? (rawData.fagronDetails?.testName || 'Fagron Genomics') : ''),
        clinicalIndication: block.posology || rawData.diagnosis || '',
        clinicalNotes: rawData.clinicalNotes || '',
        treatmentProgram: block.treatmentProgram || (isFagron ? rawData.fagronDetails?.testName : 'Clinical Rx'),
        treatmentType: block.treatmentType || 'Formulation',
        dispensingForm: block.dispensingForm || null,
        volume: block.volume || null,
        duration: block.duration || '30 days',
        posology: block.posology || '',
        prescriptionLines,
        items: prescriptionLines,
        fagron: isFagron ? {
          boxId: rawData.fagronDetails?.boxId || null,
          reportDate: rawData.fagronDetails?.reportDate || rawData.prescriptionDate || null,
          testName: rawData.fagronDetails?.testName || null,
          geneticBiomarkers: rawData.fagronDetails?.geneticBiomarkers || [],
          sourceFile: rawData._fileName || null,
          ocrExtracted: true,
          importedAt: new Date().toISOString(),
          importedBy: currentUser?.email || 'admin',
        } : null,
        aiExtraction: {
          documentType: rawData.documentType || 'Unknown',
          completeness: rawData.completeness ?? 90,
          confidenceScore: rawData.confidenceScore ?? 85,
          missing: rawData.missing || [],
          extractedAt: new Date().toISOString(),
          matchSummary: {
            total: prescriptionLines.length,
            matched: prescriptionLines.filter(l => !l._isPlaceholder).length,
            placeholders: prescriptionLines.filter(l => l._isPlaceholder).length,
          }
        },
        auditTrail: [{
          timestamp: new Date().toISOString(),
          action: 'ai_imported',
          user: currentUser?.email || 'system_ai',
          details: `Imported via Atlas AI from file ${rawData._fileName || 'prescription document'}`
        }]
      });
    }
    return splitResults;
  }

  // ── DEFAULT: Consolidated Single Prescription with Multiple Products ───────
  // A prescription sheet (especially Fagron compound formulas or multi-item recipes)
  // is treated as ONE single prescription containing all prescribed items.
  const allPrescriptionLines = [];
  let anyUnresolvedGlobal = false;
  const allUnassignedAlerts = [];

  for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
    const block = blocks[blockIdx];
    const rawItems = Array.isArray(block.items) ? block.items : [];

    const targetProg = isFagron ? (rawData.fagronDetails?.testName || block.treatmentProgram || 'Fagron Genomics') : null;
    const resolvedIngredients = await resolveIngredients(rawItems, {
      supplierHint: supplierHint || (isFagron ? 'Fagron Iberia' : 'Standard Supplier'),
      importSource: isFagron ? 'fagron_ai_import' : 'standard_rx_ai_import',
      programName: targetProg,
    });

    if (resolvedIngredients.some(r => !r.productId || r.isPlaceholder)) {
      anyUnresolvedGlobal = true;
    }
    const unassignedAlerts = resolvedIngredients.filter(r => r.isUnassignedProgramApi && r.programAlert).map(r => r.programAlert);
    allUnassignedAlerts.push(...unassignedAlerts);

    const blockLabel = block.treatmentType || block.treatmentProgram || `Formulation ${blockIdx + 1}`;

    const lines = resolvedIngredients.map((r, idx) => {
      const orig = r.original || {};
      const nameLower = (orig.name || '').toLowerCase();
      
      let dosageForm = block.dispensingForm || 'Magistral Component';
      if (nameLower.includes('pomade') || nameLower.includes('ointment') || nameLower.includes('pomada') || block.blockType === 'pomade') {
        dosageForm = 'Topical Pomade / Ointment';
      } else if (nameLower.includes('pentravan') || nameLower.includes('lipoderm') || block.blockType === 'hormone') {
        dosageForm = 'Transdermal Liposomal Cream';
      } else if (nameLower.includes('trichosol') || nameLower.includes('solution') || nameLower.includes('lotion') || block.blockType === 'trichosol') {
        dosageForm = 'Topical Solution (Vehicle)';
      } else if (nameLower.includes('trichooil') || nameLower.includes('oil') || block.blockType === 'trichooil') {
        dosageForm = 'Topical Oil (Vehicle)';
      } else if (nameLower.includes('cap') || nameLower.includes('tablet') || nameLower.includes('oral') || block.blockType === 'oral') {
        dosageForm = 'Oral Capsule';
      } else if (nameLower.includes('vial') || nameLower.includes('inj') || orig.route?.toLowerCase() === 'subcutaneous' || block.blockType === 'injectable') {
        dosageForm = 'Injectable Vial';
      }

      let resolvedDose = orig.dosage || orig.dose || orig.strength || '';
      if (!resolvedDose || resolvedDose === '—') {
        if (nameLower.includes('prostaquinon')) resolvedDose = '3% Topical';
        else if (nameLower.includes('minoxidil')) resolvedDose = '5% Topical';
        else if (nameLower.includes('latanoprost')) resolvedDose = '0.005% Topical';
        else if (nameLower.includes('diltiazem')) resolvedDose = '2%';
        else if (nameLower.includes('lidocaine')) resolvedDose = '2%';
      }

      return {
        ...prescriptionLineSchema,
        id: `rx_line_${Date.now()}_${blockIdx}_${idx}`,
        productId: r.productId || null,
        variantId: null,
        productName: r.matchedName || orig.name || '',
        sku: '',
        activeIngredient: orig.activeIngredient || orig.name || '',
        dosage: resolvedDose,
        dose: resolvedDose,
        strength: orig.strength || resolvedDose,
        concentration: orig.strength || resolvedDose,
        presentation: block.volume || '',
        category: isFagron ? 'Compounding / Genomic' : 'Peptide / Medicine',
        price: 0,
        quantity: Number(orig.quantity) || 1,
        dosageForm,
        formulationBlock: blockLabel,
        formulationIndex: blockIdx + 1,
        blockVolume: block.volume || null,
        route: orig.route || (dosageForm.includes('Pomade') ? 'Topical / Perianal' : (dosageForm.includes('Transdermal') ? 'Transdermal' : (dosageForm.includes('Topical') ? 'Topical' : (dosageForm.includes('Injectable') ? 'Subcutaneous' : 'Oral')))),
        frequency: orig.frequency || (dosageForm.includes('Pomade') ? 'Twice daily' : (dosageForm.includes('Topical') ? 'Once daily (Night)' : 'As directed')),
        duration: orig.duration || block.duration || '30 days',
        treatmentDays: Number(block.treatmentDays) || 30,
        instructions: orig.instructions || block.posology || '',
        patientInstructions: block.posology || orig.instructions || '',
        status: 'pending',
        // UI & Audit flags
        _isPlaceholder: !!r.isPlaceholder,
        _isNewPlaceholder: !!r.isNew,
        _needsProductMapping: !r.productId || !!r.isPlaceholder,
        _matchScore: r.score || 0,
        _genomicPriority: r.priority || null,
        _isProgramAssigned: r.isProgramAssigned ?? true,
        _isUnassignedProgramApi: !!r.isUnassignedProgramApi,
        _programAlert: r.programAlert || null,
        _unassignedProgramName: r.unassignedProgramName || null,
        _isVehicleOrBase: !!orig.isVehicleOrBase || orig.itemType === 'vehicle_base' || nameLower.includes('trichosol') || nameLower.includes('trichooil') || nameLower.includes('pentravan') || nameLower.includes('pomade base') || nameLower.includes('ointment base'),
      };
    });

    allPrescriptionLines.push(...lines);
  }

  const patientName = rawData.patient?.name || context.patientName || 'Unknown Patient';

  // 1. Extract official prescription / file code from document if detected (e.g. 51861, FILE #51861)
  const rawCodeCandidate = rawData.prescriptionNumber || rawData.fileNumber || rawData.clinicReference;
  let detectedRxCode = '';
  if (rawCodeCandidate && typeof rawCodeCandidate === 'string') {
    const cleanMatch = rawCodeCandidate.match(/\d{4,8}/);
    if (cleanMatch) {
      detectedRxCode = cleanMatch[0];
    } else {
      detectedRxCode = rawCodeCandidate.replace(/^(FILE|RX|RECETA|ORDER|#)\s*#?/i, '').trim();
    }
  }

  // Generate clean, official prescription number
  let generatedRxNumber;
  if (detectedRxCode && detectedRxCode.length >= 3) {
    generatedRxNumber = detectedRxCode;
  } else {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    generatedRxNumber = `RX-${datePart}-${randPart}`;
  }

  // 2. Automated Doctor matching from Firestore
  let matchedDoctor = null;
  try {
    matchedDoctor = await lookupDoctorByNameOrLicense(
      rawData.doctor?.name || context.doctorName,
      rawData.doctor?.licenseNumber
    );
  } catch (err) {
    logger.warn('[prescriptionAiService] Doctor lookup error', { error: err.message });
  }

  const doctorName = matchedDoctor?.displayName || matchedDoctor?.name || rawData.doctor?.name || context.doctorName || 'Prescribing Physician';
  const doctorSlug = matchedDoctor?.slug || slugify(doctorName);
  const doctorId = matchedDoctor?.id || context.doctorId || null;
  const doctorLicense = rawData.doctor?.licenseNumber || matchedDoctor?.licenseNumber || matchedDoctor?.medicalLicense || '';
  const clinicName = rawData.doctor?.clinicName || matchedDoctor?.clinicName || matchedDoctor?.practiceName || '';
  const clinicAddress = rawData.doctor?.clinicAddress || matchedDoctor?.clinicAddress || '';

  // Formulate unified multi-product clinical summary
  const treatmentType = blocks.length > 1
    ? blocks.map(b => b.treatmentType || b.treatmentProgram).filter(Boolean).join(' + ')
    : (blocks[0]?.treatmentType || 'Custom Compounded Formula');

  const dispensingForm = blocks.length > 1
    ? blocks.map(b => b.dispensingForm).filter(Boolean).join(' / ')
    : (blocks[0]?.dispensingForm || 'Topical Solution');

  const combinedPosology = blocks.length > 1
    ? blocks.map((b, i) => `[${b.phaseName || b.treatmentType || `Formulation ${i + 1}`}]: ${b.posology || 'As directed by physician'}`).join('\n\n')
    : (blocks[0]?.posology || rawData.clinicalNotes || 'As directed by physician.');

  const combinedVolumes = blocks.map(b => b.volume || b.packaging?.volume).filter(Boolean).join(', ') || null;
  const combinedDuration = blocks.find(b => b.duration)?.duration || '90 days';

  // Build canonical sequential phases array
  const phases = blocks.map((b, bIdx) => {
    const phaseNum = b.phaseNumber || (bIdx + 1);
    const defaultPhaseName = `Phase ${phaseNum}: ${b.treatmentType || b.dispensingForm || 'Formulation'}`;
    const vehicleObj = b.vehicleBase || {
      name: b.items?.find(i => i.isVehicleOrBase)?.name || 'Compounding Base',
      type: b.blockType || 'compounding',
      specifications: ''
    };
    return {
      id: `phase-${phaseNum}`,
      phaseNumber: phaseNum,
      phaseName: b.phaseName || defaultPhaseName,
      timeOfDay: b.timeOfDay || (bIdx === 0 ? 'morning' : 'evening'),
      treatmentType: b.treatmentType || b.dispensingForm || 'Formulation',
      dispensingForm: b.dispensingForm || 'Compounded Formulation',
      volume: b.volume || b.packaging?.volume || null,
      duration: b.duration || combinedDuration || '90 days',
      treatmentDays: Number(b.treatmentDays) || 90,
      vehicle: vehicleObj,
      vehicleBase: vehicleObj,
      packaging: b.packaging || { containerType: 'Safety Dispenser', volume: b.volume },
      posology: b.posology || '',
      posologySteps: Array.isArray(b.posologySteps) ? b.posologySteps : [],
      safetyWarnings: Array.isArray(b.safetyWarnings) ? b.safetyWarnings : [],
      items: b.items || []
    };
  });

  // Auto-detect clinical archetype category
  const detectedCategory = rawData.clinicalCategory || (
    blocks.some(b => b.blockType === 'pomade' || (b.items || []).some(i => (i.name || '').toLowerCase().includes('diltiazem') || (i.name || '').toLowerCase().includes('pomade'))) ? 'compounding' :
    blocks.some(b => b.blockType === 'hormone' || (b.items || []).some(i => (i.name || '').toLowerCase().includes('pentravan') || (i.name || '').toLowerCase().includes('testosterone') || (i.name || '').toLowerCase().includes('estradiol'))) ? 'hormone' :
    (isFagron && (rawData.fagronDetails?.testName?.toLowerCase().includes('tricho') || blocks.some(b => (b.items || []).some(i => (i.name || '').toLowerCase().includes('trichosol'))))) ? 'trichotest' :
    (isFagron && (rawData.fagronDetails?.testName?.toLowerCase().includes('nutri') || blocks.some(b => (b.items || []).some(i => (i.name || '').toLowerCase().includes('nattokinase'))))) ? 'nutrigen' :
    'standard'
  );

  const resolvedDispensingForm = dispensingForm !== 'Topical Solution' ? dispensingForm : (
    detectedCategory === 'compounding' ? 'Topical Pomade / Ointment' :
    detectedCategory === 'hormone' ? 'Transdermal Liposomal Cream' :
    detectedCategory === 'nutrigen' ? 'Oral Capsules' :
    dispensingForm
  );

  const unifiedRx = {
    ...prescriptionSchema,
    ...context,
    prescriptionNumber: generatedRxNumber,
    prescriptionCode: generatedRxNumber,
    code: generatedRxNumber,
    prescriptionId: generatedRxNumber,
    status: PRESCRIPTION_STATUSES.DRAFT,
    validationStatus: anyUnresolvedGlobal ? 'Needs Review' : (allUnassignedAlerts.length > 0 ? 'Review API Scope' : 'Ready'),
    quotationStatus: 'Pending',
    orderStatus: 'Pending',
    clinicalCategory: detectedCategory,
    doctorSlug,
    _unassignedProgramAlerts: allUnassignedAlerts,
    
    // Source categorization
    sourceType: isFagron ? PRESCRIPTION_SOURCES.FAGRON : PRESCRIPTION_SOURCES.UPLOAD,
    source: isFagron ? 'fagron' : 'document',
    importSource: isFagron ? 'fagron_genomics_ai' : 'standard_rx_ai',
    sessionId,

    // Patient identity
    patientId: context.patientId || null,
    patientName,
    patient: {
      name: patientName,
      dob: rawData.patient?.dob || '',
      gender: rawData.patient?.gender || '',
      email: rawData.patient?.email || '',
      phone: rawData.patient?.phone || '',
      idNumber: rawData.patient?.idNumber || '',
      address: rawData.patient?.address || '',
    },

    // Doctor identity
    doctorId,
    doctorName,
    doctorLicense,
    doctor: {
      name: doctorName,
      license: doctorLicense,
      clinic: clinicName,
      address: clinicAddress,
      specialty: rawData.doctor?.specialty || matchedDoctor?.specialty || '',
      phone: rawData.doctor?.phone || matchedDoctor?.phone || '',
      email: rawData.doctor?.email || matchedDoctor?.email || '',
      slug: doctorSlug
    },
    clinicName,

    // Clinical information
    diagnosis: rawData.diagnosis || (isFagron ? (rawData.fagronDetails?.testName || 'Fagron Genomics') : ''),
    clinicalIndication: combinedPosology || rawData.diagnosis || '',
    clinicalNotes: rawData.clinicalNotes || '',
    treatmentProgram: rawData.fagronDetails?.testName || blocks[0]?.treatmentProgram || 'Clinical Rx',
    treatmentType,
    dispensingForm: resolvedDispensingForm,
    volume: combinedVolumes,
    duration: combinedDuration,
    posology: combinedPosology,
    phases,
    formulationBlocks: blocks,

    // ALL PRODUCTS / LINES CONSOLIDATED IN THIS SINGLE PRESCRIPTION
    prescriptionLines: allPrescriptionLines,
    items: allPrescriptionLines,

    // Fagron specific metadata
    fagron: isFagron ? {
      boxId: rawData.fagronDetails?.boxId || null,
      reportDate: rawData.fagronDetails?.reportDate || rawData.prescriptionDate || null,
      testName: rawData.fagronDetails?.testName || null,
      geneticBiomarkers: rawData.fagronDetails?.geneticBiomarkers || [],
      sourceFile: rawData._fileName || null,
      ocrExtracted: true,
      importedAt: new Date().toISOString(),
      importedBy: currentUser?.email || 'admin',
    } : null,

    // AI Metadata
    aiExtraction: {
      documentType: rawData.documentType || 'Unknown',
      completeness: rawData.completeness ?? 90,
      confidenceScore: rawData.confidenceScore ?? 85,
      missing: rawData.missing || [],
      extractedAt: new Date().toISOString(),
      matchSummary: {
        total: allPrescriptionLines.length,
        matched: allPrescriptionLines.filter(l => !l._isPlaceholder).length,
        placeholders: allPrescriptionLines.filter(l => l._isPlaceholder).length,
      }
    },

    auditTrail: [{
      timestamp: new Date().toISOString(),
      action: 'ai_imported',
      user: currentUser?.email || 'system_ai',
      details: `Imported via Atlas AI (${allPrescriptionLines.length} products in ${blocks.length} formulation blocks)`
    }]
  };

  // Pre-generate guaranteed Pharmapolis compounding bottle labels
  try {
    const labels = getPharmapolisLabelsForPrescription(unifiedRx, null);
    if (labels && labels.length > 0) {
      unifiedRx.pharmacyLabels = labels;
    }
  } catch (lblErr) {
    logger.warn('[prescriptionAiService] Auto label generation warning', { error: lblErr.message });
  }

  return [unifiedRx];
}

/**
 * Checks Firestore for existing prescriptions to flag duplicates.
 * Matches by fagron.boxId or by (patient.name + reportDate).
 * 
 * @param {Array<Object>} prescriptions 
 * @returns {Promise<Array<Object>>} Prescriptions with `_dupStatus` and `_existingId`
 */
export async function checkDuplicatesInFirestore(prescriptions = []) {
  if (!prescriptions || prescriptions.length === 0) return [];

  return Promise.all(
    prescriptions.map(async (rx) => {
      let dupStatus = 'new';
      let existingId = null;
      let existingData = null;
      let duplicateReason = null;

      try {
        const boxId = rx.fagron?.boxId ? String(rx.fagron.boxId).trim() : null;
        const patientName = String(rx.patient?.name || rx.patientName || '').trim();
        const dateVal = String(rx.fagron?.reportDate || rx.prescriptionDate || rx.date || '').trim();

        // 1. Primary check: Fagron Box ID / Sample barcode
        if (boxId) {
          const qBox = query(
            collection(db, 'prescriptions'),
            where('fagron.boxId', '==', boxId)
          );
          const snapBox = await getDocs(qBox);
          if (!snapBox.empty) {
            dupStatus = 'duplicate';
            existingId = snapBox.docs[0].id;
            existingData = { id: snapBox.docs[0].id, ...snapBox.docs[0].data() };
            duplicateReason = `Muestra Fagron Box ID: ${boxId}`;
          }
        }

        // 2. Secondary check: Patient Name + Date
        if (dupStatus === 'new' && patientName && dateVal) {
          // Check matching prescriptionDate
          const qDate = query(
            collection(db, 'prescriptions'),
            where('patient.name', '==', patientName),
            where('prescriptionDate', '==', dateVal)
          );
          const snapDate = await getDocs(qDate);
          if (!snapDate.empty) {
            dupStatus = 'duplicate';
            existingId = snapDate.docs[0].id;
            existingData = { id: snapDate.docs[0].id, ...snapDate.docs[0].data() };
            duplicateReason = `Paciente "${patientName}" con fecha ${dateVal}`;
          } else {
            // Also check matching fagron.reportDate
            const qFagronDate = query(
              collection(db, 'prescriptions'),
              where('patient.name', '==', patientName),
              where('fagron.reportDate', '==', dateVal)
            );
            const snapFagronDate = await getDocs(qFagronDate);
            if (!snapFagronDate.empty) {
              dupStatus = 'duplicate';
              existingId = snapFagronDate.docs[0].id;
              existingData = { id: snapFagronDate.docs[0].id, ...snapFagronDate.docs[0].data() };
              duplicateReason = `Paciente "${patientName}" con fecha de informe ${dateVal}`;
            }
          }
        }
      } catch (err) {
        logger.warn('[prescriptionAiService] Deduplication query check failed', { error: err.message });
      }

      return {
        ...rx,
        _dupStatus: dupStatus,
        _existingId: existingId,
        _existingData: existingData,
        _duplicateReason: duplicateReason,
      };
    })
  );
}

/**
 * Saves a list of validated prescription objects to Firestore.
 * Optionally creates/links patient profile in `patients/`.
 * 
 * @param {Array<Object>} prescriptionsToSave 
 * @param {Object} options - { alsoCreatePatient: boolean, currentUser: Object }
 * @returns {Promise<{ savedCount: number, savedIds: Array<string>, errors: Array<string> }>}
 */
export async function savePrescriptionsToFirestore(prescriptionsToSave = [], options = {}) {
  const { alsoCreatePatient = true, currentUser } = options;
  let savedCount = 0;
  const savedIds = [];
  const savedPrescriptions = [];
  const errors = [];

  for (const rx of prescriptionsToSave) {
    try {
      let patientId = rx.patientId || null;

      // Automatically register or link patient in CRM if requested
      if (alsoCreatePatient && rx.patient?.name && !patientId) {
        try {
          const patientResult = await createPatient({
            name: rx.patient.name,
            dob: rx.patient.dob || '',
            gender: rx.patient.gender || '',
            email: rx.patient.email || '',
            phone: rx.patient.phone || '',
            source: rx.fagron ? 'fagron_import' : 'prescription_ai_import',
          });
          if (patientResult?.id) {
            patientId = patientResult.id;
          }
        } catch (patientErr) {
          logger.warn('[prescriptionAiService] Could not auto-create patient', { error: patientErr.message });
        }
      }

      // Prepare payload with Firestore serverTimestamps (Two-Phase Ingestion Workflow)
      const payload = {
        ...rx,
        status: rx.status || 'draft',
        state: rx.state || 'draft',
        ingestionStage: 'awaiting_atlas_review',
        reviewEtaHours: 24,
        validationStatus: rx.validationStatus || 'Under Clinical Review',
        patientId: patientId || rx.patientId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (options.overrideDuplicate) {
        payload.duplicateOverrideConfirmed = true;
      }

      // Strip temporary UI properties before writing to DB
      delete payload._dupStatus;
      delete payload._existingId;
      delete payload._existingData;
      delete payload._duplicateReason;

      const docRef = await addDoc(collection(db, 'prescriptions'), payload);
      savedCount++;
      savedIds.push(docRef.id);

      const officialCode = payload.prescriptionNumber || payload.code || docRef.id;
      savedPrescriptions.push({
        id: docRef.id,
        prescriptionNumber: officialCode,
        patientName: payload.patientName || payload.patient?.name || 'Patient',
        treatmentType: payload.treatmentType || 'Formulation',
        lineCount: payload.prescriptionLines?.length || 0,
        status: payload.status,
        ingestionStage: 'awaiting_atlas_review',
        reviewEtaHours: 24,
        rxUrl: `/rx/${officialCode}`,
      });
    } catch (err) {
      logger.error('[prescriptionAiService] Error saving prescription', { error: err });
      errors.push(`Error on prescription for ${rx.patientName || 'Unknown'}: ${err.message}`);
    }
  }

  return {
    savedCount,
    savedIds,
    savedPrescriptions,
    errors,
  };
}

/**
 * Validates clinical safety rules, drug interactions, duplicate active ingredients,
 * vehicle completeness (e.g. TrichoSol/TrichoOil for Fagron/topical Rx), and catalog stock hints.
 * 
 * @param {Array<Object>} prescriptions - Array of normalized prescription objects
 * @returns {{ warnings: Array<Object>, suggestions: Array<Object>, isClean: boolean }}
 */
export function validatePrescriptionClinicalRules(prescriptions = []) {
  const warnings = [];
  const suggestions = [];

  if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
    return { warnings, suggestions, isClean: true };
  }

  const seenIngredients = new Map(); // ingredientName -> [rxIndices]
  const TRICHOLOGY_ACTIVES = ['minoxidil', 'finasteride', 'dutasteride', 'latanoprost', 'bimatoprost', 'clobetasol', 'cetirizine', 'caffeine'];
  const TRICHOLOGY_VEHICLES = ['trichosol', 'trichooil', 'trichofoam', 'propylene glycol', 'topical solution', 'ethanolic base'];

  prescriptions.forEach((rx, idx) => {
    const rxTitle = rx.patientName || rx.patient?.name || `Prescription #${idx + 1}`;
    const lines = rx.prescriptionLines || [];
    let hasTrichologyActive = false;
    let hasVehicle = false;

    lines.forEach((line) => {
      const activeName = (line.activeIngredient || line.productName || line.name || '').toLowerCase().trim();
      if (!activeName) return;

      // 1. Duplicate check across session
      if (seenIngredients.has(activeName)) {
        warnings.push({
          type: 'duplicate_active',
          severity: 'warning',
          title: `Duplicate Active Ingredient: "${line.activeIngredient || line.productName}"`,
          message: `The active ingredient "${line.activeIngredient || line.productName}" is prescribed multiple times across formulation blocks in this session.`,
          rxIndex: idx,
          ingredient: activeName
        });
      } else {
        seenIngredients.set(activeName, idx);
      }

      // 2. Trichology vehicle presence check
      if (TRICHOLOGY_ACTIVES.some(a => activeName.includes(a))) {
        hasTrichologyActive = true;
      }
      if (TRICHOLOGY_VEHICLES.some(v => activeName.includes(v))) {
        hasVehicle = true;
      }

      // 3. High concentration checks
      if (activeName.includes('minoxidil')) {
        const doseStr = line.dose || line.concentration || '';
        const match = doseStr.match(/(\d+(\.\d+)?)\s*%/);
        if (match && parseFloat(match[1]) > 7.0) {
          warnings.push({
            type: 'high_concentration',
            severity: 'caution',
            title: `High Minoxidil Concentration (${match[1]}%)`,
            message: `Topical Minoxidil concentration exceeds 7.0%. Monitor for systemic absorption and cardiovascular tolerance.`,
            rxIndex: idx,
          });
        }
      }

      if (activeName.includes('dutasteride')) {
        const doseStr = line.dose || line.concentration || '';
        const match = doseStr.match(/(\d+(\.\d+)?)\s*%/);
        if (match && parseFloat(match[1]) > 0.5) {
          warnings.push({
            type: 'high_concentration',
            severity: 'caution',
            title: `High Dutasteride Concentration (${match[1]}%)`,
            message: `Topical Dutasteride concentration exceeds 0.5%. Verify patient hormone baseline prior to dispensing.`,
            rxIndex: idx,
          });
        }
      }

      // 4. Catalog Match Stock Suggestions
      if (line.matchStatus === 'EXACT_MATCH' || line.matchStatus === 'FUZZY_MATCH') {
        suggestions.push({
          type: 'catalog_match',
          title: `Catalog Ready: ${line.productName}`,
          message: `Mapped to existing catalog item. Ready for instant batch formulation and stock deduction.`,
          rxIndex: idx,
        });
      }
    });

    // Check vehicle requirement for topical/trichology formulations
    const isTopicalOrFagron = rx.source === PRESCRIPTION_SOURCES.FAGRON || (rx.fagron?.boxId) || (rx.treatmentType?.toLowerCase().includes('topical'));
    if ((isTopicalOrFagron || hasTrichologyActive) && !hasVehicle && lines.length > 0) {
      warnings.push({
        type: 'missing_vehicle',
        severity: 'info',
        title: `Vehicle / Base Recommendation for ${rxTitle}`,
        message: `This formulation contains active trichology compounds without an explicit base vehicle. Consider adding TrichoSol™ or TrichoOil™ as the compounding vehicle.`,
        rxIndex: idx,
      });
    }
  });

  return {
    warnings,
    suggestions,
    isClean: warnings.length === 0,
  };
}
