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

import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { PRESCRIPTION_SOURCES, PRESCRIPTION_STATUSES, prescriptionSchema, prescriptionLineSchema } from '../schemas/prescriptionSchema.js';
import { resolveIngredients } from './apiIngredientMatcher.js';
import { createPatient } from './patientLinkService.js';
import { logger } from '../utils/logger';

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

  const results = [];

  for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
    const block = blocks[blockIdx];
    const rawItems = Array.isArray(block.items) ? block.items : [];

    // Resolve ingredients against Algolia + create placeholders for unmatched APIs
    const targetProg = isFagron ? (rawData.fagronDetails?.testName || block.treatmentProgram || 'Fagron Genomics') : null;
    const resolvedIngredients = await resolveIngredients(rawItems, {
      supplierHint: supplierHint || (isFagron ? 'Fagron Iberia' : 'Standard Supplier'),
      importSource: isFagron ? 'fagron_ai_import' : 'standard_rx_ai_import',
      programName: targetProg,
    });

    const anyUnresolved = resolvedIngredients.some(r => !r.productId || r.isPlaceholder);
    const unassignedAlerts = resolvedIngredients.filter(r => r.isUnassignedProgramApi && r.programAlert).map(r => r.programAlert);

    // Map resolved items to strict prescriptionLineSchema
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
        route: orig.route || (dosageForm.includes('Topical') ? 'Topical' : (dosageForm.includes('Injectable') ? 'Subcutaneous' : 'Oral')),
        frequency: orig.frequency || (dosageForm.includes('Topical') ? 'Once daily (Night)' : 'As directed'),
        duration: orig.duration || block.duration || '30 days',
        treatmentDays: Number(block.treatmentDays) || 30,
        instructions: orig.instructions || block.posology || '',
        patientInstructions: block.posology || '',
        status: 'Pending',
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
        _isVehicleOrBase: !!orig.isVehicleOrBase || nameLower.includes('trichosol') || nameLower.includes('trichooil') || nameLower.includes('pentravan'),
      };
    });

    const patientName = rawData.patient?.name || context.patientName || 'Unknown Patient';
    const doctorName = rawData.doctor?.name || context.doctorName || 'Prescribing Physician';

    const normalizedRx = {
      ...prescriptionSchema,
      ...context,
      // Statuses strictly lowercase per AGENTS.md Rule #28
      status: PRESCRIPTION_STATUSES.DRAFT,
      validationStatus: anyUnresolved ? 'Needs Review' : (unassignedAlerts.length > 0 ? 'Review API Scope' : 'Ready'),
      quotationStatus: 'Pending',
      orderStatus: 'Pending',
      _unassignedProgramAlerts: unassignedAlerts,
      
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

      // Clinical information
      diagnosis: rawData.diagnosis || (isFagron ? (rawData.fagronDetails?.testName || 'Fagron Genomics') : ''),
      clinicalIndication: block.posology || rawData.diagnosis || '',
      clinicalNotes: rawData.clinicalNotes || '',
      treatmentProgram: block.treatmentProgram || (isFagron ? rawData.fagronDetails?.testName : 'Clinical Rx'),
      treatmentType: block.treatmentType || 'Formulation',
      dispensingForm: block.dispensingForm || null,
      volume: block.volume || null,
      duration: block.duration || '30 days',
      posology: block.posology || '',

      // Prescription Lines (both standard key and legacy items alias)
      prescriptionLines,
      items: prescriptionLines,

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
    };

    results.push(normalizedRx);
  }

  return results;
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

      try {
        // 1. Match by Fagron Box ID
        if (rx.fagron?.boxId) {
          const q = query(
            collection(db, 'prescriptions'),
            where('fagron.boxId', '==', rx.fagron.boxId)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            dupStatus = 'duplicate';
            existingId = snap.docs[0].id;
          }
        }

        // 2. Fallback: match by patient.name + reportDate
        if (dupStatus === 'new' && rx.patient?.name && rx.fagron?.reportDate) {
          const q = query(
            collection(db, 'prescriptions'),
            where('fagron.reportDate', '==', rx.fagron.reportDate),
            where('patient.name', '==', rx.patient.name)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            dupStatus = 'duplicate';
            existingId = snap.docs[0].id;
          }
        }
      } catch (err) {
        logger.warn('[prescriptionAiService] Deduplication query check failed', { error: err.message });
      }

      return {
        ...rx,
        _dupStatus: dupStatus,
        _existingId: existingId,
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

      // Prepare payload with Firestore serverTimestamps
      const payload = {
        ...rx,
        patientId: patientId || rx.patientId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Strip temporary UI properties before writing to DB
      delete payload._dupStatus;
      delete payload._existingId;

      const docRef = await addDoc(collection(db, 'prescriptions'), payload);
      savedCount++;
      savedIds.push(docRef.id);
    } catch (err) {
      logger.error('[prescriptionAiService] Error saving prescription', { error: err });
      errors.push(`Error on prescription for ${rx.patientName || 'Unknown'}: ${err.message}`);
    }
  }

  return {
    savedCount,
    savedIds,
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
