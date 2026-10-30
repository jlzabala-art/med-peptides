'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, CheckCircle2, Activity, AlertCircle, ArrowLeft, Check,
  Stethoscope, Building2, Calendar, User, Pill, FlaskConical, Dna, FileText,
  Trash2, Plus, Eye, Edit3, ChevronDown, ChevronUp, Layers, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { prescriptionSchema } from '../../../schemas/prescriptionSchema';
import { resolveIngredients } from '../../../services/apiIngredientMatcher';
import { syncPrescriptionToAlgolia, syncPatientToAlgolia } from '../../../services/algoliaSyncService';
import AIContextBadge from '../../../components/ui/AIContextBadge';
import { processPrescriptionZohoOnImport } from '../../../actions/zohoAutoIngestMatcher';
import ClinicPicker from '../../../components/admin/patients/ClinicPicker';
import PhysicianPicker from '../../../components/admin/patients/PhysicianPicker';
import PharmapolisLabelSvg from '../../../components/prescription/PharmapolisLabelSvg';
import AlgoliaIngredientSearchInput from './AlgoliaIngredientSearchInput';

/**
 * ImportPrescriptionModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Central Unified Prescription & Laboratory Protocol Import Engine.
 *
 * Capabilities:
 *  - Multimodal AI Extraction with Silent Real-Time Failover Router
 *  - Dual Document Support: Compounded Medical Prescriptions & Lab Biomarkers (Bloodo NAD+)
 *  - Interactive Master-Detail Review & Edit Station:
 *      * Direct Algolia Catalog Search for Active Ingredients
 *      * Exceptional Fallback for Unmapped Custom APIs (Placeholders)
 *      * Full Posology & Dispensing Format Editing
 *      * Real-Time Vector SVG Label Preview before confirming import
 *  - Dual Persistence Pathways:
 *      * Authenticated Admin / Physician Direct Firestore SDK
 *      * Public / Account Manager Safe Server Route (/api/labels/import)
 *  - Mobile & Laptop Responsive (Google Cloud Console UX Standard)
 */
export default function ImportPrescriptionModal({ 
  isOpen, 
  onClose, 
  context = {}, 
  title = "Import Prescription",
  onExtractionComplete,
  persistEndpoint = null,
  onImported = null,
  note = null
}) {
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [previewBlockIdx, setPreviewBlockIdx] = useState(0);
  const [expandedBlocks, setExpandedBlocks] = useState({ 0: true });

  const resetState = () => {
    setUploading(false);
    setIsSaving(false);
    setReviewData(null);
    setActiveTab('editor');
    setPreviewBlockIdx(0);
    setExpandedBlocks({ 0: true });
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const toggleBlockExpanded = (idx) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      setUploading(true);
      toast.loading('Analyzing document with Atlas AI...', { id: 'upload-toast' });

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ai-extract-prescription', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze document');
      }

      const extractedData = await res.json();
      
      // If parent supplied explicit callback, delegate immediately
      if (onExtractionComplete) {
        onExtractionComplete(extractedData);
        toast.success('Extraction complete!', { id: 'upload-toast' });
        handleClose();
        return;
      }

      // Detect whether document is a Laboratory Biomarker Protocol (Bloodo / DBS) or Prescription
      const isLab = extractedData.documentType === 'LabResult' || !!extractedData.labResult;
      const lr = extractedData.labResult || {};
      const pCode = lr.patientCode || extractedData.patient?.code || extractedData.fileNumber || extractedData.prescriptionNumber || '';

      const geneticReportDate = lr.protocolDate || 
                                lr.analysisDate || 
                                extractedData.fagronDetails?.reportDate || 
                                extractedData.fagron?.reportDate || 
                                extractedData.geneticResultDate || 
                                extractedData.reportDate || 
                                extractedData.prescriptionDate || 
                                extractedData.date || '';

      const patientName = isLab 
        ? (pCode ? `Patient #${pCode}` : (extractedData.patient?.name || 'Verified Patient'))
        : ((typeof extractedData.patient === 'object' ? extractedData.patient?.name : extractedData.patient) || context.patientName || '');
      const clinicName = extractedData.doctor?.clinicName || extractedData.clinic || (isLab ? 'Shamma Clinic by Novomed LLC' : '');
      const doctorName = (typeof extractedData.doctor === 'object' ? extractedData.doctor?.name : extractedData.doctor) || context.doctorName || (isLab ? 'Dr. Çağatay Sezgin, MD, FISHRS' : '');

      // Normalize extracted formulation blocks
      const rawBlocks = (extractedData.formulationBlocks && extractedData.formulationBlocks.length > 0)
        ? extractedData.formulationBlocks
        : [{
            treatmentType: extractedData.treatmentTitle || 'Compounded Pharmaceutical Formula',
            treatmentProgram: extractedData.clinicalCategory || 'Compounding',
            dispensingForm: extractedData.dispensingForm || 'Magistral Solution',
            volume: extractedData.volume || '100 mL',
            posology: extractedData.posology || '',
            items: Array.isArray(extractedData.ingredients) ? extractedData.ingredients : []
          }];

      const normalizedBlocks = rawBlocks.map((b, bIdx) => {
        const rawItems = Array.isArray(b.items) ? b.items : (Array.isArray(b.ingredients) ? b.ingredients : []);
        return {
          treatmentType: b.treatmentType || b.phaseName || b.treatmentProgram || `Formula ${bIdx + 1}`,
          treatmentProgram: b.treatmentProgram || 'Compounding',
          dispensingForm: b.dispensingForm || 'Magistral Solution',
          volume: b.volume || '100 mL',
          posology: b.posology || extractedData.posology || '',
          items: rawItems.map((it, itIdx) => ({
            id: `item_${bIdx}_${itIdx}_${Date.now()}`,
            name: it.name || it.activeIngredient || '',
            dose: it.dose || it.strength || it.dosage || '',
            isVehicleOrBase: !!it.isVehicleOrBase,
            productId: it.productId || null,
            sku: it.sku || '',
            isPlaceholder: !!it._isPlaceholder
          }))
        };
      });

      setReviewData({
        isLabResult: isLab,
        extractedData,
        // Laboratory fields
        labTestName: lr.testName || 'Nicotinamide Adenine Dinucleotide (NAD+) Quantitative Test',
        labBiomarker: lr.biomarker || 'NAD+ (Total Intracellular)',
        labValue: lr.value != null ? lr.value : (extractedData.value || ''),
        labUnit: lr.unit || 'µmol/L',
        labZone: lr.zone || 'yellow',
        labZoneLabel: lr.zoneLabel || 'Insufficient / Suboptimal',
        protocolNumber: pCode || lr.protocolNumber || extractedData.prescriptionNumber || '',
        sampleType: lr.sampleType || 'Dried Blood Spot (DBS)',
        collectionDate: lr.collectionDate || '',
        receiptDate: lr.receiptDate || '',
        analysisDate: lr.analysisDate || '',
        laboratory: lr.laboratory || 'LifeLab1 / Bloodo',
        interpretation: lr.interpretation || '',
        // Clinical attribution & patient fields
        patientName,
        patientCode: pCode,
        patientAge: lr.patientAge || extractedData.patient?.age || '',
        patientGender: lr.patientGender || extractedData.patient?.gender || 'Male',
        clinicName,
        clinicId: extractedData.matchedClinic?.id || '',
        doctorName,
        doctorId: extractedData.matchedDoctor?.id || (isLab ? 'z3aUIMaYsPViG1JgM95r' : ''),
        doctorLicense: extractedData.doctor?.licenseNumber || extractedData.doctorLicense || '',
        mfgDate: geneticReportDate || new Date().toISOString().split('T')[0],
        prescriptionDate: extractedData.prescriptionDate || geneticReportDate || '',
        testName: isLab ? (lr.testName || 'Bloodo NAD+ Test') : (extractedData.fagronDetails?.testName || extractedData.documentType || 'TrichoTest'),
        boxId: extractedData.fagronDetails?.boxId || (isLab ? lr.protocolNumber : ''),
        blocks: normalizedBlocks
      });

      // Expand all blocks by default
      const initialExpanded = {};
      normalizedBlocks.forEach((_, idx) => { initialExpanded[idx] = true; });
      setExpandedBlocks(initialExpanded);

      toast.success(
        isLab
          ? 'Lab diagnostic detected! Please review the biomarker values.'
          : 'Extraction completed. Review data and preview labels before confirming.',
        { id: 'upload-toast' }
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || 'Failed to analyze document', { id: 'upload-toast' });
    } finally {
      setUploading(false);
    }
  }, [context, onExtractionComplete]);

  // Block updates
  const handleUpdateBlockField = (blockIdx, field, value) => {
    setReviewData(prev => {
      if (!prev) return prev;
      const nextBlocks = [...prev.blocks];
      if (!nextBlocks[blockIdx]) return prev;
      nextBlocks[blockIdx] = {
        ...nextBlocks[blockIdx],
        [field]: value
      };
      return { ...prev, blocks: nextBlocks };
    });
  };

  // Ingredient updates
  const handleUpdateIngredient = (blockIdx, itemIdx, changes) => {
    setReviewData(prev => {
      if (!prev) return prev;
      const nextBlocks = [...prev.blocks];
      const curBlock = nextBlocks[blockIdx];
      if (!curBlock || !curBlock.items) return prev;
      const nextItems = [...curBlock.items];
      nextItems[itemIdx] = {
        ...nextItems[itemIdx],
        ...changes
      };
      nextBlocks[blockIdx] = { ...curBlock, items: nextItems };
      return { ...prev, blocks: nextBlocks };
    });
  };

  // Add ingredient
  const handleAddIngredient = (blockIdx) => {
    setReviewData(prev => {
      if (!prev) return prev;
      const nextBlocks = [...prev.blocks];
      const curBlock = nextBlocks[blockIdx];
      if (!curBlock) return prev;
      const newItem = {
        id: `custom_item_${Date.now()}`,
        name: '',
        dose: '',
        isVehicleOrBase: false,
        productId: null,
        sku: '',
        isPlaceholder: false
      };
      nextBlocks[blockIdx] = {
        ...curBlock,
        items: [...(curBlock.items || []), newItem]
      };
      return { ...prev, blocks: nextBlocks };
    });
  };

  // Delete ingredient
  const handleDeleteIngredient = (blockIdx, itemIdx) => {
    setReviewData(prev => {
      if (!prev) return prev;
      const nextBlocks = [...prev.blocks];
      const curBlock = nextBlocks[blockIdx];
      if (!curBlock || !curBlock.items) return prev;
      const nextItems = curBlock.items.filter((_, idx) => idx !== itemIdx);
      nextBlocks[blockIdx] = { ...curBlock, items: nextItems };
      return { ...prev, blocks: nextBlocks };
    });
  };

  // Confirm and persist import
  const handleConfirmImport = async () => {
    if (!reviewData) return;
    try {
      setIsSaving(true);

      // ── 1. Laboratory Biomarker DBS Path ──
      if (reviewData.isLabResult) {
        toast.loading('Saving Lab Result to Atlas...', { id: 'save-toast' });
        const cleanCode = String(reviewData.protocolNumber || Date.now()).trim();
        const docId = `LAB-${cleanCode}-NAD`;
        const docRef = doc(collection(db, 'lab_results'), docId);
        
        const zone = String(reviewData.labZone || 'yellow').toLowerCase();
        const zoneColor = (zone === 'green' || zone === 'optimal') ? '#15803d' :
                          (zone === 'light_green' || zone === 'near_optimal') ? '#16a34a' :
                          (zone === 'dark_red') ? '#991b1b' :
                          (zone === 'red' || zone === 'deficient') ? '#dc2626' : '#d97706';
        const zoneBg = (zone === 'green' || zone === 'light_green') ? '#f0fdf4' :
                       (zone === 'red' || zone === 'dark_red') ? '#fef2f2' : '#fffbeb';

        const payload = {
          id: docId,
          code: cleanCode,
          protocolNumber: cleanCode,
          patient: {
            code: reviewData.patientCode || 'Anonymous',
            id: reviewData.patientCode || 'Anonymous',
            name: reviewData.patientName || `Patient #${reviewData.patientCode || 'Anonymous'}`,
            gender: reviewData.patientGender || 'Male',
            age: Number(reviewData.patientAge) || 50
          },
          patientCode: reviewData.patientCode || 'Anonymous',
          patientName: reviewData.patientName || `Patient #${reviewData.patientCode || 'Anonymous'}`,
          doctorId: reviewData.doctorId || 'dr-sobia',
          doctorName: reviewData.doctorName || 'Dr. Sobia Mirza',
          doctorSpecialty: 'Aesthetic Medicine & Regenerative Biology',
          clinicName: reviewData.clinicName || 'My London Skin Clinic',
          testType: 'nad_dbs',
          testName: reviewData.labTestName || 'Nicotinamide Adenine Dinucleotide (NAD+) Quantitative Test',
          shortName: 'NAD+ Dried Blood Spot (DBS)',
          biomarker: reviewData.labBiomarker || 'NAD+ (Total Intracellular)',
          sampleType: 'Dried Blood Spot (DBS)',
          value: Number(reviewData.labValue) || 0,
          unit: reviewData.labUnit || 'µmol/L',
          zone: reviewData.labZone || 'yellow',
          zoneLabel: reviewData.labZoneLabel || 'Insufficient / Suboptimal',
          zoneColor,
          zoneBg,
          resultCategory: reviewData.labZone || 'insufficient',
          collectionDate: reviewData.collectionDate || '',
          receiptDate: reviewData.receiptDate || '',
          analysisDate: reviewData.analysisDate || '',
          protocolDate: reviewData.analysisDate || '',
          method: 'Enzymatic cyclic assay (XLT01690-0)',
          laboratory: {
            name: 'LifeLab1',
            city: 'Vilnius',
            country: 'Lithuania',
            license: 'License 4864',
            standards: 'ISO 15189 / EU IVDR Accredited'
          },
          referenceRanges: {
            deficient: { min: 0, max: 8.8, label: 'Deficient / Depleted', color: '#dc2626' },
            insufficient: { min: 8.8, max: 17.4, label: 'Insufficient / Suboptimal', color: '#d97706' },
            near_optimal: { min: 17.4, max: 21.7, label: 'Near-Optimal', color: '#16a34a' },
            optimal: { min: 21.7, max: 33.7, label: 'Optimal / Longevity Range', color: '#15803d' }
          },
          interpretation: reviewData.interpretation || '',
          pdfReportUrl: `/reports/bloodo-nad-${cleanCode}.pdf`,
          status: 'completed',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(docRef, payload, { merge: true });

        toast.success(`Lab report #${cleanCode} (${reviewData.labValue} ${reviewData.labUnit}) successfully imported!`, { id: 'save-toast' });
        if (onImported) {
          onImported([{ id: docId, code: cleanCode, patientName: reviewData.patientName, isLabResult: true }]);
        }
        handleClose();
        return;
      }

      // ── 2. Clinical Prescription Path (Single or Multi-Phase) ──
      toast.loading('Saving prescription to Atlas & generating labels...', { id: 'save-toast' });

      const {
        patientName,
        clinicName,
        clinicId,
        doctorName,
        doctorId,
        doctorLicense,
        mfgDate,
        prescriptionDate,
        protocolNumber,
        blocks
      } = reviewData;

      const effectiveBlocks = Array.isArray(blocks) && blocks.length > 0 ? blocks : [];
      let totalNewPlaceholders = 0;
      let totalMatchedCatalog = 0;
      const pendingDocs = [];
      const created = [];

      // 1. Clean code to ONLY the alphanumeric identifier (max 24 chars, no notes/sentences)
      const cleanPatientName = patientName.trim() || 'Unknown Patient';
      const rawCode = String(protocolNumber || reviewData.patientCode || reviewData.boxId || Date.now()).trim();
      let cleanCode = rawCode.replace(/^#/, '');
      const boxMatch = cleanCode.match(/\b(BOX[0-9]{4,6}[A-Z0-9]+)\b/i);
      if (boxMatch) {
        cleanCode = boxMatch[1].toUpperCase();
      } else {
        const rxMatch = cleanCode.match(/\b(RX-[A-Z0-9-]+)\b/i);
        if (rxMatch) {
          cleanCode = rxMatch[1].toUpperCase();
        } else {
          const digitMatch = cleanCode.match(/\b\d{4,8}\b/);
          if (digitMatch) {
            cleanCode = digitMatch[0];
          } else {
            cleanCode = cleanCode.replace(/\(.*?\)/g, '').split(/[.;,\n]/)[0].trim().slice(0, 24);
          }
        }
      }

      // 2. Doctor / Clinic auto-matching (e.g. My London Skin Clinic -> Dr. Sobia Mirza)
      let finalDoctorName = doctorName.trim() || 'Unknown Doctor';
      let finalDoctorId = doctorId || null;
      let finalDoctorSlug = doctorId || 'dr-sobia';
      let finalDoctorLicense = doctorLicense || null;
      let finalClinicName = clinicName || null;
      let finalClinicId = clinicId || null;

      const clinicLower = (clinicName || '').toLowerCase();
      const docLower = (doctorName || '').toLowerCase();
      if (clinicLower.includes('my london') || clinicLower.includes('london skin') || docLower.includes('sobia')) {
        finalDoctorName = 'Dr. Sobia Mirza';
        finalDoctorId = 'dr-sobia';
        finalDoctorSlug = 'dr-sobia';
        finalDoctorLicense = 'DHA Registered';
        finalClinicName = 'My London Skin Clinic';
        finalClinicId = 'IdDU1oK1VuAVVYrGz6E7';
      }

      // 3. Map all items per block and construct consolidated parts
      const allMappedItems = [];
      const parts = [];

      for (let bIdx = 0; bIdx < effectiveBlocks.length; bIdx++) {
        const block = effectiveBlocks[bIdx];
        const blockItems = Array.isArray(block.items) ? block.items : [];
        const mappedBlockItems = [];

        for (let itIdx = 0; itIdx < blockItems.length; itIdx++) {
          const item = blockItems[itIdx];
          let prodId = item.productId || null;
          let prodSku = item.sku || '';
          let isPlace = !!item.isPlaceholder;
          let matchedName = item.name;

          // If not linked to catalog yet, attempt Algolia/Genomics resolution
          if (!prodId && item.name) {
            try {
              const res = await resolveIngredients([{ name: item.name, dose: item.dose }], {
                supplierHint: 'Fagron Iberia',
                importSource: 'fagron_genomics'
              });
              if (res && res[0]) {
                prodId = res[0].productId || null;
                matchedName = res[0].matchedName || item.name;
                isPlace = res[0].isPlaceholder;
                prodSku = res[0].matchedProduct?.sku || '';
              }
            } catch (err) {
              console.warn('[ImportPrescriptionModal] Resolve fallback error for item:', item.name);
            }
          }

          if (isPlace) totalNewPlaceholders++;
          if (prodId && !isPlace) totalMatchedCatalog++;

          const itemObj = {
            id: `ai_item_${Date.now()}_${bIdx}_${itIdx}`,
            formulationIndex: bIdx + 1,
            formulationBlock: block.treatmentType || `Part ${bIdx + 1}`,
            productId: prodId,
            variantId: null,
            productName: matchedName || item.name,
            drugName: matchedName || item.name,
            sku: prodSku,
            activeIngredient: item.name,
            concentration: item.dose || '',
            dosage: item.dose || '',
            dose: item.dose || '',
            isVehicleOrBase: !!item.isVehicleOrBase,
            quantity: 1,
            price: 0,
            instructions: block.posology || '',
            _aiRawName: item.name,
            _aiRawDose: item.dose,
            _isPlaceholder: isPlace,
            _needsProductMapping: !prodId || isPlace,
            status: 'Pending'
          };
          mappedBlockItems.push(itemObj);
          allMappedItems.push(itemObj);
        }

        parts.push({
          partIndex: bIdx + 1,
          phaseNumber: bIdx + 1,
          title: block.treatmentType || `Part ${bIdx + 1}`,
          treatmentType: block.treatmentType || `Part ${bIdx + 1}`,
          treatmentProgram: block.treatmentProgram || 'Compounding',
          volume: block.volume || '100 mL',
          dispensingForm: block.dispensingForm || block.treatmentType || 'Magistral Formulation',
          posology: block.posology || '',
          instructions: block.posology || '',
          items: mappedBlockItems
        });
      }

      // 4. Construct ONE single prescription document containing all parts
      const newRx = {
        ...prescriptionSchema,
        ...context,
        code: cleanCode,
        rxCode: cleanCode,
        prescriptionNumber: cleanCode,
        fileNumber: cleanCode,
        patientName: cleanPatientName,
        patient: typeof reviewData.extractedData?.patient === 'object' ? {
          ...reviewData.extractedData.patient,
          name: cleanPatientName,
          code: cleanCode
        } : { name: cleanPatientName, code: cleanCode },
        doctorName: finalDoctorName,
        doctorId: finalDoctorId,
        doctorSlug: finalDoctorSlug,
        doctorLicense: finalDoctorLicense,
        doctor: {
          id: finalDoctorId,
          name: finalDoctorName,
          displayName: finalDoctorName,
          license: finalDoctorLicense,
          clinic: finalClinicName,
          clinicName: finalClinicName
        },
        clinicName: finalClinicName,
        clinic: finalClinicName,
        clinicId: finalClinicId,
        sourceType: 'fagron_genomics',
        source: 'fagron',
        status: 'draft',
        validationStatus: allMappedItems.some(i => i._needsProductMapping) ? 'Needs Review' : 'Ready',
        treatmentProgram: parts[0]?.treatmentProgram || 'Compounding',
        treatmentType: parts.length > 1 ? `${parts.length}-Part Multi-Formula Regimen` : (parts[0]?.treatmentType || 'Compounding Formula'),
        treatmentTitle: parts.length > 1 ? `${parts.length}-Part Multi-Formula Regimen` : (parts[0]?.treatmentType || 'Compounding Formula'),
        importSource: 'fagron_genomics',
        posology: parts[0]?.posology || '',
        volume: parts[0]?.volume || '100 mL',
        dispensingForm: parts[0]?.dispensingForm || 'Magistral Formulation',
        prescriptionDate: mfgDate || prescriptionDate || new Date().toISOString().split('T')[0],
        parts: parts,
        formulationBlocks: parts,
        partsCount: parts.length,
        isMultiPart: parts.length > 1,
        items: allMappedItems,
        prescriptionLines: allMappedItems,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (persistEndpoint) {
        pendingDocs.push(newRx);
      } else {
        const docRef = await addDoc(collection(db, 'prescriptions'), newRx);
        created.push({ id: docRef.id, code: cleanCode, patientName: cleanPatientName });

        // Non-blocking Algolia synchronization
        syncPrescriptionToAlgolia({ ...newRx, id: docRef.id }).catch(err => {
          console.warn('[ImportPrescriptionModal] Algolia rx sync error:', err);
        });
        if (newRx.patient?.name) {
          syncPatientToAlgolia({
            id: docRef.id,
            name: newRx.patient.name,
            code: newRx.code,
            doctorName: newRx.doctorName,
            clinicName: newRx.clinicName
          }).catch(err => {
            console.warn('[ImportPrescriptionModal] Algolia patient sync error:', err);
          });
        }

        // Zoho auto-ingest pipeline
        processPrescriptionZohoOnImport({
          prescriptionId: docRef.id,
          rxData: newRx,
          userEmail: 'import_modal'
        }).catch(err => {
          console.warn('[ImportPrescriptionModal] Zoho auto-ingest error:', err);
        });

        // Automated email notification to jose@mediluxeme.com on prescription import
        fetch('/api/prescriptions/notify-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescriptionId: docRef.id,
            rxData: { ...newRx, id: docRef.id, code: cleanCode, patientName: cleanPatientName },
            importChannel: 'portal_import_modal'
          })
        }).catch(err => {
          console.warn('[ImportPrescriptionModal] Email notification error:', err);
        });
      }

      if (persistEndpoint && pendingDocs.length > 0) {
        const saveRes = await fetch(persistEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prescriptions: pendingDocs })
        });
        const saveJson = await saveRes.json().catch(() => ({}));
        if (!saveRes.ok || !saveJson.success) {
          throw new Error(saveJson.error || 'Failed to save imported prescription');
        }
        created.push(...(saveJson.created || []));
      }

      const baseMsg = effectiveBlocks.length > 1
        ? `${effectiveBlocks.length} formulations successfully imported (${effectiveBlocks.map(b => b.treatmentType).join(', ')})`
        : 'Prescription successfully imported';
      const matchMsg = totalMatchedCatalog > 0
        ? ` · ${totalMatchedCatalog} catalog API${totalMatchedCatalog > 1 ? 's' : ''}`
        : '';
      const placeholderMsg = totalNewPlaceholders > 0
        ? ` · ${totalNewPlaceholders} custom item${totalNewPlaceholders > 1 ? 's' : ''}`
        : '';

      toast.success(`${baseMsg}${matchMsg}${placeholderMsg}`, { id: 'save-toast' });
      if (onImported) onImported(created);
      handleClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || 'Error saving prescription', { id: 'save-toast' });
    } finally {
      setIsSaving(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/pdf': ['.pdf'], 
      'image/*': ['.png', '.jpg', '.jpeg'] 
    },
    disabled: uploading || isSaving
  });

  if (!isOpen) return null;

  const currentPreviewBlock = reviewData?.blocks?.[previewBlockIdx] || reviewData?.blocks?.[0] || {};
  const currentPreviewIngredients = (currentPreviewBlock.items || []).map(it => {
    return `${it.name || ''} ${it.dose || ''}`.trim();
  }).filter(Boolean);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.70)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: reviewData ? '920px' : '520px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        transition: 'max-width 0.2s ease',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header (GCP Style) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          gap: '1rem'
        }}>
          <AIContextBadge
            title={reviewData ? (reviewData.isLabResult ? 'Review & Confirm Lab Result' : 'Review, Edit & Preview Prescription') : title}
            subtitle={reviewData 
              ? (reviewData.isLabResult
                  ? 'Verify biomarkers, patient, and prescribing physician before filing into laboratory records.'
                  : 'Review and verify active ingredients matched with the catalog, and inspect regulatory vial labels before import.')
              : 'Clinical AI parses prescriptions, genetic reports, and provider signatures into official records'}
            contextPill={reviewData?.isLabResult 
              ? `Biomarker: ${reviewData.labBiomarker || 'NAD+'} · #${reviewData.protocolNumber || 'Lab'}` 
              : (reviewData?.testName ? `${reviewData.testName}${reviewData.boxId ? ` · #${reviewData.boxId}` : ''}` : (context?.patientName ? `Patient: ${context.patientName}` : "Target: Official Rx Engine"))}
            accentColor={reviewData?.isLabResult ? "#2563eb" : "#0d9488"}
            model="Active Intelligence"
          />
          <button 
            onClick={handleClose}
            disabled={isSaving || uploading}
            style={{
              background: 'none', border: 'none', padding: '0.5rem',
              cursor: 'pointer', color: '#64748b', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '40px', minHeight: '40px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Container */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {reviewData ? (
            /* ── Step 2: Extraction Review, Interactive Editor & Preview ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Mode Specific Banners */}
              {reviewData.isLabResult ? (
                /* Lab DBS Banner */
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: '#2563eb', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <FlaskConical size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', letterSpacing: '0.04em' }}>
                          DBS Laboratory Analytics
                        </span>
                        <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          Protocol #{reviewData.protocolNumber || 'N/A'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {reviewData.labBiomarker || 'NAD+ (Total Intracellular)'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {reviewData.laboratory || 'LifeLab1'} · {reviewData.sampleType || 'Dried Blood Spot (DBS)'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                      {reviewData.labValue} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>{reviewData.labUnit}</span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                      background: (reviewData.labZone === 'green' || reviewData.labZone === 'optimal' || reviewData.labZone === 'light_green') ? '#dcfce7' : '#fef3c7',
                      color: (reviewData.labZone === 'green' || reviewData.labZone === 'optimal') ? '#15803d' : '#b45309'
                    }}>
                      {reviewData.labZoneLabel || 'Suboptimal'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Top GCP Tab Strip for Prescriptions: Editor vs. Label Preview */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('editor')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: activeTab === 'editor' ? '#e0f2fe' : 'transparent',
                        color: activeTab === 'editor' ? '#0369a1' : '#64748b',
                        fontWeight: activeTab === 'editor' ? 700 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Edit3 size={14} />
                      <span>1. Clinical Data &amp; Formulas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: activeTab === 'preview' ? '#e0f2fe' : 'transparent',
                        color: activeTab === 'preview' ? '#0369a1' : '#64748b',
                        fontWeight: activeTab === 'preview' ? 700 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Eye size={14} />
                      <span>2. Preview Labels</span>
                      <span style={{
                        fontSize: '0.68rem',
                        background: activeTab === 'preview' ? '#0284c7' : '#94a3b8',
                        color: '#ffffff',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontWeight: 700
                      }}>
                        {reviewData.blocks.length}
                      </span>
                    </button>
                  </div>

                  {reviewData.extractedData?.confidenceScore && (
                    <span style={{
                      fontSize: '0.72rem',
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={12} />
                      {reviewData.extractedData.confidenceScore}% OCR Accuracy
                    </span>
                  )}
                </div>
              )}

              {/* ── TAB 1: Clinical Identification & Formulation Editor ── */}
              {activeTab === 'editor' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Section A: Identification & Attributions */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>
                      Patient &amp; Prescribing Provider Identification
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                      {/* Patient Name */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <User size={13} color="#64748b" />
                          <span>Patient Name</span>
                          <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={reviewData.patientName}
                          onChange={(e) => setReviewData(prev => ({ ...prev, patientName: e.target.value }))}
                          style={{
                            width: '100%', height: '38px', borderRadius: '6px',
                            border: '1px solid #cbd5e1', padding: '0 12px',
                            fontSize: '0.88rem', color: '#0f172a', boxSizing: 'border-box'
                          }}
                          placeholder="Full Patient Legal Name"
                        />
                      </div>

                      {/* File Number / Prescription Code */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <FileText size={13} color="#64748b" />
                          <span>Medical File / Protocol / Rx #</span>
                        </label>
                        <input
                          type="text"
                          value={reviewData.protocolNumber}
                          onChange={(e) => setReviewData(prev => ({ ...prev, protocolNumber: e.target.value }))}
                          style={{
                            width: '100%', height: '38px', borderRadius: '6px',
                            border: '1px solid #cbd5e1', padding: '0 12px',
                            fontSize: '0.88rem', color: '#0f172a', boxSizing: 'border-box'
                          }}
                          placeholder="e.g. 51861 or BOX03509AATRI"
                        />
                      </div>
                    </div>

                    {/* Clinic & Prescribing Doctor with Pickers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                      {/* Clinic */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <Building2 size={13} color="#64748b" />
                          <span>Clinic / Medical Facility</span>
                        </label>
                        <ClinicPicker
                          value={reviewData.clinicId || ''}
                          clinicName={reviewData.clinicName || ''}
                          allowCustom={true}
                          placeholder="Select or search clinic in Atlas..."
                          onChange={({ clinicId, clinicName }) => {
                            setReviewData(prev => ({
                              ...prev,
                              clinicId: clinicId || '',
                              clinicName: clinicName || '',
                            }));
                          }}
                        />
                      </div>

                      {/* Doctor */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <Stethoscope size={13} color="#64748b" />
                          <span>Prescribing Physician</span>
                          <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <PhysicianPicker
                          value={reviewData.doctorId || ''}
                          physicianName={reviewData.doctorName || ''}
                          clinicId={reviewData.clinicId || ''}
                          clinicName={reviewData.clinicName || ''}
                          strictClinic={Boolean(reviewData.clinicId || reviewData.clinicName)}
                          allowCustom={true}
                          placeholder="Select clinic physician or enter custom name..."
                          onChange={({ doctorId, doctorName, license }) => {
                            setReviewData(prev => ({
                              ...prev,
                              doctorId: doctorId || '',
                              doctorName: doctorName || '',
                              doctorLicense: license || prev.doctorLicense
                            }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Manufacturing / Report Date */}
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} color="#64748b" />
                          <span>Manufacturing / Genetic Report Date</span>
                          <span style={{ color: '#dc2626' }}>*</span>
                        </div>
                        <span style={{ fontSize: '0.66rem', color: '#059669', fontWeight: 600 }}>
                          Sourced from document or clinical signature (not upload date)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={reviewData.mfgDate}
                        onChange={(e) => setReviewData(prev => ({ ...prev, mfgDate: e.target.value }))}
                        style={{
                          width: '100%', height: '38px', borderRadius: '6px',
                          border: '1px solid #cbd5e1', padding: '0 12px',
                          fontSize: '0.88rem', color: '#0f172a', boxSizing: 'border-box'
                        }}
                        placeholder="YYYY-MM-DD (e.g. 2026-10-29)"
                      />
                    </div>
                  </div>

                  {/* Section B: Formulation Blocks & Algolia Ingredients Editor */}
                  {!reviewData.isLabResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Pill size={16} color="#0d9488" />
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                            Formulations &amp; Active Ingredients ({reviewData.blocks.length})
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Search each API to match with the official compounding catalog.
                        </span>
                      </div>

                      {reviewData.blocks.map((block, bIdx) => {
                        const isExpanded = !!expandedBlocks[bIdx];
                        return (
                          <div
                            key={bIdx}
                            style={{
                              border: '1px solid #cbd5e1',
                              borderRadius: '10px',
                              background: '#ffffff',
                              overflow: 'hidden',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                          >
                            {/* Block Header Accordion Bar */}
                            <div
                              onClick={() => toggleBlockExpanded(bIdx)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                background: '#f8fafc',
                                borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                                cursor: 'pointer',
                                userSelect: 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                  background: '#0d9488',
                                  color: '#ffffff',
                                  fontSize: '0.70rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '4px'
                                }}>
                                  FORMULA {bIdx + 1}
                                </span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                  {block.treatmentType || `Formula ${bIdx + 1}`}
                                </span>
                                {block.volume && (
                                  <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                    {block.volume}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                                  {(block.items || []).length} active{(block.items || []).length === 1 ? '' : 's'}
                                </span>
                                {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                              </div>
                            </div>

                            {/* Block Content */}
                            {isExpanded && (
                              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Formula Title, Form, Volume */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                      Formula Name
                                    </label>
                                    <input
                                      type="text"
                                      value={block.treatmentType}
                                      onChange={(e) => handleUpdateBlockField(bIdx, 'treatmentType', e.target.value)}
                                      style={{ width: '100%', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                      placeholder="e.g. TrichoSol Topical Solution"
                                    />
                                  </div>

                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                      Galenic Dosage Form
                                    </label>
                                    <input
                                      type="text"
                                      value={block.dispensingForm}
                                      onChange={(e) => handleUpdateBlockField(bIdx, 'dispensingForm', e.target.value)}
                                      style={{ width: '100%', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                      placeholder="e.g. Topical Solution, Oral Capsules"
                                    />
                                  </div>

                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                      Volume / Packaging
                                    </label>
                                    <input
                                      type="text"
                                      value={block.volume}
                                      onChange={(e) => handleUpdateBlockField(bIdx, 'volume', e.target.value)}
                                      style={{ width: '100%', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                      placeholder="e.g. 100 mL or 60 Capsules"
                                    />
                                  </div>
                                </div>

                                {/* Posology Instructions */}
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                    Posology &amp; Directions for Use
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={block.posology}
                                    onChange={(e) => handleUpdateBlockField(bIdx, 'posology', e.target.value)}
                                    style={{ width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: '0.80rem', resize: 'vertical', boxSizing: 'border-box' }}
                                    placeholder="e.g. Apply 1 mL every 24 hours on dry scalp..."
                                  />
                                </div>

                                {/* Active Ingredients Table with Algolia Picker */}
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <label style={{ fontSize: '0.70rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      Active Pharmaceutical Ingredients (Catalog Match)
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleAddIngredient(bIdx)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid #0d9488',
                                        background: '#f0fdfa',
                                        color: '#0f766e',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Plus size={12} />
                                      <span>Add Ingredient</span>
                                    </button>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {(block.items || []).map((item, itIdx) => (
                                      <div
                                        key={item.id || itIdx}
                                        style={{
                                          display: 'grid',
                                          gridTemplateColumns: 'minmax(200px, 2fr) minmax(110px, 1fr) auto auto',
                                          gap: '8px',
                                          alignItems: 'center',
                                          background: '#f8fafc',
                                          padding: '8px',
                                          borderRadius: '6px',
                                          border: '1px solid #e2e8f0'
                                        }}
                                      >
                                        {/* Algolia Search Input */}
                                        <AlgoliaIngredientSearchInput
                                          value={item.name}
                                          productId={item.productId}
                                          sku={item.sku}
                                          isPlaceholder={item.isPlaceholder}
                                          onChange={({ name, productId, sku, isPlaceholder }) => {
                                            handleUpdateIngredient(bIdx, itIdx, {
                                              name,
                                              productId,
                                              sku,
                                              isPlaceholder
                                            });
                                          }}
                                        />

                                        {/* Dose / Concentration */}
                                        <input
                                          type="text"
                                          value={item.dose || ''}
                                          onChange={(e) => handleUpdateIngredient(bIdx, itIdx, { dose: e.target.value })}
                                          placeholder="Dose (e.g. 5% or 2 mg)"
                                          style={{
                                            height: '36px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            padding: '0 8px',
                                            fontSize: '0.82rem',
                                            boxSizing: 'border-box'
                                          }}
                                        />

                                        {/* Vehicle / Base Checkbox */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                          <input
                                            type="checkbox"
                                            checked={!!item.isVehicleOrBase}
                                            onChange={(e) => handleUpdateIngredient(bIdx, itIdx, { isVehicleOrBase: e.target.checked })}
                                          />
                                          <span>Base</span>
                                        </label>

                                        {/* Delete Action */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteIngredient(bIdx, itIdx)}
                                          title="Remove active ingredient"
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: Live Vector SVG Label Preview ── */}
              {activeTab === 'preview' && !reviewData.isLabResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Phase selector tabs if multi-block */}
                  {reviewData.blocks.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {reviewData.blocks.map((b, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewBlockIdx(idx)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: previewBlockIdx === idx ? '1px solid #0284c7' : '1px solid #cbd5e1',
                            background: previewBlockIdx === idx ? '#e0f2fe' : '#ffffff',
                            color: previewBlockIdx === idx ? '#0369a1' : '#475569',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Phase {idx + 1}: {b.treatmentType || `Formula ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* SVG Container Mockup */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px'
                  }}>
                    <div style={{
                      maxWidth: '460px',
                      width: '100%',
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #cbd5e1'
                    }}>
                      <PharmapolisLabelSvg
                        labelData={{
                          patientName: reviewData.patientName,
                          code: reviewData.protocolNumber || 'RX-PENDING',
                          productName: currentPreviewBlock.treatmentType || 'Compounded Pharmaceutical Formula',
                          ingredients: currentPreviewIngredients,
                          directions: currentPreviewBlock.posology || 'Use as clinically directed by prescribing physician.',
                          prescriberName: reviewData.doctorName || 'Prescribing Physician',
                          date: reviewData.mfgDate || new Date().toISOString().split('T')[0],
                          volume: currentPreviewBlock.volume || '100 mL'
                        }}
                        variant="backQr"
                        widthMm={75}
                        heightMm={45}
                      />
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', maxWidth: '420px', lineHeight: 1.4 }}>
                      Real-time regulatory label preview (75 mm × 45 mm) with active ingredients, posology, lot, 2D DataMatrix code, and prescriber credentials.
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginTop: '10px',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => setReviewData(null)}
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Upload Another Document</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeTab === 'editor' && !reviewData.isLabResult && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: '1px solid #0284c7',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} />
                      <span>Preview Label</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isSaving || !reviewData.patientName.trim()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 22px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSaving ? '#94a3b8' : (reviewData.isLabResult ? '#2563eb' : '#1a73e8'),
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      boxShadow: reviewData.isLabResult ? '0 1px 3px rgba(37,99,235,0.3)' : '0 1px 3px rgba(26,115,232,0.3)'
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Activity size={14} className="spin" />
                        <span>Saving to Records...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{reviewData.isLabResult ? 'Confirm & Import Lab Result' : 'Confirm & Import Prescription'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Step 1: Upload Dropzone ── */
            <>
              <div 
                {...getRootProps()}
                style={{ 
                  background: isDragActive ? '#f0f9ff' : '#fff', 
                  border: `2px dashed ${isDragActive ? '#0ea5e9' : '#cbd5e1'}`, 
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}>
                <input {...getInputProps()} />
                
                {uploading ? (
                  <>
                    <Activity size={48} color="#0ea5e9" style={{ marginBottom: '16px', animation: 'pulse 2s infinite' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1rem' }}>Processing Document...</h3>
                    <p style={{ margin: 0, color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>
                      Please wait while Clinical AI extracts formulations and patient records.
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={48} color={isDragActive ? '#0ea5e9' : '#94a3b8'} style={{ marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1rem' }}>Drag &amp; Drop or Click to Upload</h3>
                    <p style={{ margin: 0, color: '#64748b', textAlign: 'center', fontSize: '0.85rem', marginBottom: '16px' }}>
                      Supported formats: PDF, PNG, JPG, JPEG
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                      <div style={{
                        background: '#f0fdfa',
                        border: '1px solid #14b8a6',
                        color: '#0f766e',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <Pill size={13} /> Prescriptions (TrichoTest, BHRT)
                      </div>
                      <div style={{
                        background: '#eff6ff',
                        border: '1px solid #3b82f6',
                        color: '#1d4ed8',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <FlaskConical size={13} /> Lab Diagnostics (Bloodo NAD+, DBS)
                      </div>
                    </div>

                    <div style={{ 
                      background: '#f0fdfa', 
                      border: '1px solid #14b8a6', 
                      color: '#0f766e', 
                      padding: '6px 12px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}>
                      <CheckCircle2 size={14} /> AI Extraction &amp; Review Enabled
                    </div>
                  </>
                )}
              </div>
              
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <AlertCircle size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
                  <strong>Clinical Access:</strong> {note || 'Restricted to licensed physicians and administrators. Files are parsed via clinical intelligence to enable formulation verification before official records are committed.'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
