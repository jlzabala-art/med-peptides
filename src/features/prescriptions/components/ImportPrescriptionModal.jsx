import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle2, Activity, AlertCircle, ArrowLeft, Check, Stethoscope, Building2, Calendar, User, Pill, FlaskConical, Dna, FileText } from 'lucide-react';
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

/**
 * @param {string}   [persistEndpoint] - When set (e.g. '/api/labels/import'), the built
 *   prescription docs are POSTed to this server route instead of being written with the
 *   client Firestore SDK. Used by the public Label Studio (Account Managers) where no
 *   authenticated Atlas session exists, so Atlas validation is skipped server-side.
 * @param {Function} [onImported] - Called with an array of `{ id, code, patientName }`
 *   for each created prescription.
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

  const resetState = () => {
    setUploading(false);
    setIsSaving(false);
    setReviewData(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      setUploading(true);
      toast.loading('Analyzing prescription via AI...', { id: 'upload-toast' });

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ai-extract-prescription', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to analyze document');
      }

      const extractedData = await res.json();
      
      // If parent supplied explicit callback (e.g. dedicated wizard), delegate immediately
      if (onExtractionComplete) {
        onExtractionComplete(extractedData);
        toast.success('Extraction complete!', { id: 'upload-toast' });
        handleClose();
        return;
      }

      // Detect whether document is a Laboratory Biomarker Protocol (Bloodo / LifeLab1 / NAD+) or Prescription
      const isLab = extractedData.documentType === 'LabResult' || !!extractedData.labResult;
      const lr = extractedData.labResult || {};
      const pCode = lr.patientCode || extractedData.patient?.code || extractedData.fileNumber || '';

      // Prioritize Genetic result date / report date over import date
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
        protocolNumber: lr.protocolNumber || extractedData.prescriptionNumber || '',
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
        mfgDate: geneticReportDate,
        prescriptionDate: extractedData.prescriptionDate || geneticReportDate || '',
        testName: isLab ? (lr.testName || 'Bloodo NAD+ Test') : (extractedData.fagronDetails?.testName || extractedData.documentType || 'TrichoTest'),
        boxId: extractedData.fagronDetails?.boxId || (isLab ? lr.protocolNumber : ''),
        blocks: extractedData.formulationBlocks || []
      });

      toast.success(isLab ? '¡Analítica de laboratorio detectada! Revisa los valores.' : 'Extraction complete! Review details before saving.', { id: 'upload-toast' });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || 'Failed to analyze document', { id: 'upload-toast' });
    } finally {
      setUploading(false);
    }
  }, [context, onExtractionComplete]);

  const handleConfirmImport = async () => {
    if (!reviewData) return;
    try {
      setIsSaving(true);

      // ── Handle Laboratory Result Import (Bloodo / Biomarkers) ──
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
          doctorId: reviewData.doctorId || 'z3aUIMaYsPViG1JgM95r',
          doctorName: reviewData.doctorName || 'Dr. Çağatay Sezgin, MD, FISHRS',
          doctorSpecialty: 'Hair Restoration Surgery / Regenerative Medicine',
          clinicName: reviewData.clinicName || 'Shamma Clinic by Novomed LLC',
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

        toast.success(`¡Informe de laboratorio #${cleanCode} (${reviewData.labValue} ${reviewData.labUnit}) importado con éxito!`, { id: 'save-toast' });
        if (onImported) {
          onImported([{ id: docId, code: cleanCode, patientName: reviewData.patientName, isLabResult: true }]);
        }
        handleClose();
        return;
      }

      toast.loading('Saving prescription to Atlas & generating labels...', { id: 'save-toast' });

      const { extractedData, patientName, clinicName, clinicId, doctorName, doctorId, doctorLicense, mfgDate, prescriptionDate } = reviewData;

      // Handle multi-formulation blocks (e.g., Trichotest → TrichoSol + TrichoOil)
      const blocks = extractedData.formulationBlocks && extractedData.formulationBlocks.length > 0 
        ? extractedData.formulationBlocks 
        : [{ 
            treatmentType: null,
            treatmentProgram: null,
            ingredients: extractedData.ingredients || [],
            posology: extractedData.posology || '',
            volume: null,
            dispensingForm: null
          }];

      let totalNewPlaceholders = 0;
      let totalMatchedCatalog = 0;
      const sessionId = blocks.length > 1 ? crypto.randomUUID() : null;
      const pendingDocs = [];
      const created = [];

      for (const block of blocks) {
        const blockIngredients = Array.isArray(block.items) ? block.items : (Array.isArray(block.ingredients) ? block.ingredients : []);
        const resolved = await resolveIngredients(
          blockIngredients,
          { supplierHint: 'Fagron Iberia', importSource: 'fagron_genomics' }
        );

        const blockNewPlaceholders = resolved.filter(r => r.isPlaceholder && r.isNew).length;
        const blockMatched = resolved.filter(r => !r.isPlaceholder).length;
        totalNewPlaceholders += blockNewPlaceholders;
        totalMatchedCatalog += blockMatched;

        const anyUnresolved = resolved.some(r => !r.productId || r.isPlaceholder);

        const mappedItems = resolved.map((r, idx) => ({
          id: `ai_item_${Date.now()}_${idx}`,
          productId: r.productId || null,
          variantId: null,
          productName: r.matchedName || r.original?.name || '',
          drugName: r.matchedName || r.original?.name || '',
          sku: '',
          activeIngredient: r.original?.activeIngredient || r.original?.name || '',
          concentration: r.original?.dose || r.original?.strength || '',
          dosage: r.original?.dose || r.original?.dosage || '',
          dose: r.original?.dose || '',
          isVehicleOrBase: !!r.original?.isVehicleOrBase,
          quantity: r.original?.quantity || 1,
          price: 0,
          instructions: block.posology || extractedData.posology || '',
          _aiRawName: r.original?.name,
          _aiRawDose: r.original?.dose,
          _isPlaceholder: r.isPlaceholder,
          _needsProductMapping: !r.productId || r.isPlaceholder,
          _matchScore: r.score,
          status: 'Pending',
        }));

        const cleanPatientName = patientName || 'Unknown Patient';
        const cleanDoctorName = doctorName || 'Unknown Doctor';

        const newRx = {
          ...prescriptionSchema,
          ...context,
          patientName: cleanPatientName,
          patient: typeof extractedData.patient === 'object' ? {
            ...extractedData.patient,
            name: cleanPatientName
          } : { name: cleanPatientName },
          doctorName: cleanDoctorName,
          doctorId: doctorId || null,
          doctor: typeof extractedData.doctor === 'object' ? {
            ...extractedData.doctor,
            name: cleanDoctorName,
            id: doctorId || null,
            licenseNumber: doctorLicense || null
          } : { name: cleanDoctorName, id: doctorId || null },
          clinicName: clinicName || null,
          clinicId: clinicId || null,
          doctorLicense: doctorLicense || extractedData.doctor?.licenseNumber || null,
          sourceType: 'fagron_genomics',
          source: 'fagron',
          status: 'draft',
          validationStatus: anyUnresolved ? 'Needs Review' : 'Ready',
          sessionId,
          treatmentProgram: block.treatmentProgram || extractedData.fagronDetails?.testName || 'TrichoTest',
          treatmentType: block.treatmentType || null,
          importSource: 'fagron_genomics',
          posology: block.posology || extractedData.posology || '',
          clinicalIndication: block.posology || '',
          volume: block.volume || null,
          dispensingForm: block.dispensingForm || null,
          items: mappedItems,
          prescriptionLines: mappedItems,
          formulationBlocks: blocks,
          isMultiPart: blocks.length > 1,
          totalParts: blocks.length,
          parts: blocks.length > 1 ? blocks.map((b, bIdx) => ({
            partNumber: bIdx + 1,
            title: b.treatmentType || b.treatmentProgram || `Part ${bIdx + 1}`,
            treatmentType: b.treatmentType || null,
            volume: b.volume || null,
            dispensingForm: b.dispensingForm || null,
            posology: b.posology || '',
            items: Array.isArray(b.items) ? b.items : (Array.isArray(b.ingredients) ? b.ingredients : []),
            totalParts: blocks.length
          })) : null,
          // Authoritative manufacturing / genetic result dates (Rule: never use import date)
          mfgDate: mfgDate || null,
          prodDate: mfgDate || null,
          prescriptionDate: prescriptionDate || mfgDate || null,
          geneticResultDate: mfgDate || null,
          dateIssued: prescriptionDate || mfgDate || null,
          fagron: extractedData.fagronDetails ? {
            boxId: extractedData.fagronDetails.boxId || null,
            testName: extractedData.fagronDetails.testName || 'TrichoTest',
            reportDate: mfgDate || extractedData.fagronDetails.reportDate || null,
            geneticBiomarkers: extractedData.fagronDetails.geneticBiomarkers || []
          } : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          aiExtraction: {
            completeness: extractedData.completeness || 0,
            missing: extractedData.missing || [],
            rawDate: extractedData.date || null,
            extractedAt: new Date().toISOString(),
            matchSummary: {
              total: resolved.length,
              matched: blockMatched,
              newPlaceholders: blockNewPlaceholders,
            },
          },
        };

        if (persistEndpoint) {
          const { createdAt: _c, updatedAt: _u, ...serializable } = newRx;
          pendingDocs.push(serializable);
          continue;
        }

        const docRef = await addDoc(collection(db, 'prescriptions'), newRx);
        created.push({ id: docRef.id, code: docRef.id, patientName: cleanPatientName });
        
        syncPrescriptionToAlgolia({ ...newRx, id: docRef.id }).catch(err => {
          console.warn('[ImportPrescriptionModal] Algolia rx sync error:', err);
        });
        if (newRx.patient?.id || newRx.patient?.name) {
          syncPatientToAlgolia({
            id: newRx.patient.id || newRx.patientId || docRef.id,
            name: newRx.patient.name || newRx.patientName,
            ...newRx.patient
          }).catch(err => {
            console.warn('[ImportPrescriptionModal] Algolia patient sync error:', err);
          });
        }

        processPrescriptionZohoOnImport({
          prescriptionId: docRef.id,
          rxData: newRx,
          userEmail: 'import_modal'
        }).then(zohoRes => {
          if (zohoRes?.status === 'auto_created_and_linked') {
            toast.success(`✨ Zoho Books: ${zohoRes.createdCount} APIs auto-creados (100% sincronizado)`);
          } else if (zohoRes?.status === 'partial_match') {
            toast(`ℹ️ Zoho Books: Matching parcial (${zohoRes.percent}%). Pendiente de revisión manual.`);
          }
        }).catch(err => {
          console.warn('[ImportPrescriptionModal] Zoho auto-ingest error:', err);
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

      const baseMsg = blocks.length > 1
        ? `${blocks.length} formulaciones importadas (${blocks.map(b => b.treatmentType || 'Form.').join(', ')})`
        : 'Prescripción importada con éxito';
      const matchMsg = totalMatchedCatalog > 0
        ? ` · ${totalMatchedCatalog} API${totalMatchedCatalog > 1 ? 's' : ''} en catálogo`
        : '';
      const placeholderMsg = totalNewPlaceholders > 0
        ? ` · ${totalNewPlaceholders} placeholder${totalNewPlaceholders > 1 ? 's' : ''} creado${totalNewPlaceholders > 1 ? 's' : ''}`
        : '';

      toast.success(`${baseMsg}${matchMsg}${placeholderMsg}`, { id: 'save-toast' });
      if (onImported) onImported(created);
      handleClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || 'Error al guardar prescripción', { id: 'save-toast' });
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

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
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
        maxWidth: reviewData ? '680px' : '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        transition: 'max-width 0.2s ease',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
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
            title={reviewData ? (reviewData.isLabResult ? 'Review & Confirm Lab Result' : 'Review & Confirm Prescription') : title}
            subtitle={reviewData 
              ? (reviewData.isLabResult
                  ? 'Verifica los biomarcadores, paciente y médico antes de archivar en la sección de analíticas.'
                  : 'Verifica y edita la clínica, médico prescriptor y fecha del resultado antes de importar.')
              : 'Multimodal AI parses clinical scripts, lab reports, and doctor signatures into official records'}
            contextPill={reviewData?.isLabResult 
              ? `Biomarker: ${reviewData.labBiomarker || 'NAD+'} · #${reviewData.protocolNumber || 'Lab'}` 
              : (reviewData?.testName ? `${reviewData.testName}${reviewData.boxId ? ` · #${reviewData.boxId}` : ''}` : (context?.patientName ? `Patient: ${context.patientName}` : "Target: Official Rx Engine"))}
            accentColor={reviewData?.isLabResult ? "#2563eb" : "#0d9488"}
            model="Gemini 3.5 Flash • Multimodal"
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

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {reviewData ? (
            /* ── Step 2: Extraction Review & Editable Summary ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviewData.isLabResult ? (
                /* ── Laboratory Result DBS Banner ── */
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
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FlaskConical size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', letterSpacing: '0.04em' }}>
                          Analítica de Laboratorio DBS
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
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: (reviewData.labZone === 'green' || reviewData.labZone === 'optimal' || reviewData.labZone === 'light_green') ? '#dcfce7' : '#fef3c7',
                      color: (reviewData.labZone === 'green' || reviewData.labZone === 'optimal') ? '#15803d' : '#b45309'
                    }}>
                      {reviewData.labZoneLabel || 'Suboptimal'}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  color: '#166534'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Datos extraídos con éxito del documento</span>
                  </div>
                  {reviewData.extractedData?.confidenceScore && (
                    <span style={{ fontSize: '0.74rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {reviewData.extractedData.confidenceScore}% Precisión
                    </span>
                  )}
                </div>
              )}

              {/* Lab Biomarker Quantitative Edit Row */}
              {reviewData.isLabResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Valor Cuantitativo
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={reviewData.labValue}
                      onChange={(e) => setReviewData(prev => ({ ...prev, labValue: e.target.value }))}
                      style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.88rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Unidad
                    </label>
                    <input
                      type="text"
                      value={reviewData.labUnit}
                      onChange={(e) => setReviewData(prev => ({ ...prev, labUnit: e.target.value }))}
                      style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Rango / Zona
                    </label>
                    <select
                      value={reviewData.labZone}
                      onChange={(e) => {
                        const z = e.target.value;
                        const labels = {
                          yellow: 'Insufficient / Suboptimal',
                          green: 'Optimal / Longevity Range',
                          light_green: 'Near-Optimal',
                          red: 'Deficient / Depleted'
                        };
                        setReviewData(prev => ({ ...prev, labZone: z, labZoneLabel: labels[z] || z }));
                      }}
                      style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.84rem', boxSizing: 'border-box', background: '#fff' }}
                    >
                      <option value="yellow">Yellow (Insufficient / Suboptimal)</option>
                      <option value="green">Green (Optimal / Longevity)</option>
                      <option value="light_green">Light Green (Near-Optimal)</option>
                      <option value="red">Red (Deficient / Depleted)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Patient Fields */}
              {reviewData.isLabResult ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      <User size={13} color="#64748b" />
                      <span>Nombre del Paciente / Patient Name</span>
                      <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={reviewData.patientName}
                      onChange={(e) => setReviewData(prev => ({ ...prev, patientName: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '38px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '0 12px',
                        fontSize: '0.88rem',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Nombre del Paciente"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Código Muestra
                    </label>
                    <input
                      type="text"
                      value={reviewData.patientCode}
                      onChange={(e) => setReviewData(prev => ({ ...prev, patientCode: e.target.value }))}
                      style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                      placeholder="ej. DBUQEQ842449"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Edad / Sexo
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        value={reviewData.patientAge}
                        onChange={(e) => setReviewData(prev => ({ ...prev, patientAge: e.target.value }))}
                        style={{ width: '55px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 6px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                        placeholder="Edad"
                      />
                      <select
                        value={reviewData.patientGender}
                        onChange={(e) => setReviewData(prev => ({ ...prev, patientGender: e.target.value }))}
                        style={{ flex: 1, height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 6px', fontSize: '0.84rem', boxSizing: 'border-box', background: '#fff' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <User size={13} color="#64748b" />
                    <span>Nombre del Paciente / Patient Name</span>
                    <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewData.patientName}
                    onChange={(e) => setReviewData(prev => ({ ...prev, patientName: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      padding: '0 12px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nombre y Apellidos del Paciente"
                  />
                </div>
              )}

              {/* 2-Column: Clinic & Prescribing Doctor */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {/* Clinic with ClinicPicker */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Building2 size={13} color="#64748b" />
                    <span>Clínica / Clinic</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, textTransform: 'none' }}>(Elegir o cambiar)</span>
                  </label>
                  <ClinicPicker
                    value={reviewData.clinicId || ''}
                    clinicName={reviewData.clinicName || ''}
                    allowCustom={true}
                    placeholder="Seleccionar o buscar clínica en Atlas..."
                    onChange={({ clinicId, clinicName }) => {
                      setReviewData(prev => ({
                        ...prev,
                        clinicId: clinicId || '',
                        clinicName: clinicName || '',
                      }));
                    }}
                  />
                </div>

                {/* Prescribing Doctor with PhysicianPicker */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Stethoscope size={13} color="#64748b" />
                      <span>Médico Prescriptor / Doctor</span>
                      <span style={{ color: '#dc2626' }}>*</span>
                    </div>
                    {(reviewData.clinicName || reviewData.clinicId) && (
                      <span style={{ fontSize: '0.66rem', color: '#1a73e8', fontWeight: 600, textTransform: 'none' }}>
                        Filtrado por clínica
                      </span>
                    )}
                  </label>
                  <PhysicianPicker
                    value={reviewData.doctorId || ''}
                    physicianName={reviewData.doctorName || ''}
                    clinicId={reviewData.clinicId || ''}
                    clinicName={reviewData.clinicName || ''}
                    strictClinic={Boolean(reviewData.clinicId || reviewData.clinicName)}
                    allowCustom={true}
                    placeholder="Elegir doctor de la clínica o escribir..."
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

              {/* Dates & Clinical specific review */}
              {reviewData.isLabResult ? (
                /* Lab Result Dates */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      <Calendar size={13} color="#64748b" />
                      <span>Fecha de Recogida / Collection Date</span>
                    </label>
                    <input
                      type="text"
                      value={reviewData.collectionDate}
                      onChange={(e) => setReviewData(prev => ({ ...prev, collectionDate: e.target.value }))}
                      style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      <Calendar size={13} color="#059669" />
                      <span>Fecha de Análisis / Report Date</span>
                    </label>
                    <input
                      type="text"
                      value={reviewData.analysisDate}
                      onChange={(e) => setReviewData(prev => ({ ...prev, analysisDate: e.target.value }))}
                      style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>
              ) : (
                /* Prescription Manufacturing / Genetic Result Date */
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="#64748b" />
                      <span>Fecha de Fabricación / Genetic Result Date</span>
                      <span style={{ color: '#dc2626' }}>*</span>
                    </div>
                    <span style={{ fontSize: '0.66rem', color: '#059669', fontWeight: 600, textTransform: 'none' }}>
                      Tomada del informe genético (no fecha de importación)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={reviewData.mfgDate}
                    onChange={(e) => setReviewData(prev => ({ ...prev, mfgDate: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      padding: '0 12px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                    placeholder="YYYY-MM-DD o DD-MM-YYYY (ej. 2025-12-15)"
                  />
                </div>
              )}

              {/* Lab Result Interpretation OR Extracted Formulations Preview */}
              {reviewData.isLabResult ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Interpretación Clínica del Laboratorio
                  </label>
                  <textarea
                    rows={2}
                    value={reviewData.interpretation || ''}
                    onChange={(e) => setReviewData(prev => ({ ...prev, interpretation: e.target.value }))}
                    style={{ width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box' }}
                    placeholder="Interpretación médica o notas del informe..."
                  />
                </div>
              ) : (
                Array.isArray(reviewData.blocks) && reviewData.blocks.length > 0 && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      <Pill size={14} color="#0d9488" />
                      <span>Formulaciones detectadas ({reviewData.blocks.length}):</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {reviewData.blocks.map((b, idx) => {
                        const count = Array.isArray(b.items) ? b.items.length : (Array.isArray(b.ingredients) ? b.ingredients.length : 0);
                        return (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.78rem'
                          }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>
                              Parte {idx + 1}: {b.treatmentType || b.treatmentProgram || `Fórmula ${idx + 1}`}
                            </span>
                            <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {count} principio{count === 1 ? '' : 's'} activo{count === 1 ? '' : 's'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}

              {/* Bottom Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginTop: '10px',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0'
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
                  <span>Volver a Subir</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isSaving || !reviewData.patientName.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
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
                      <span>Guardando en Atlas...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{reviewData.isLabResult ? 'Confirmar e Importar Informe de Laboratorio' : 'Confirmar e Importar Prescripción'}</span>
                    </>
                  )}
                </button>
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
                      Please wait while Gemini analyzes the document.
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={48} color={isDragActive ? '#0ea5e9' : '#94a3b8'} style={{ marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1rem' }}>Drag & Drop or Click to Upload</h3>
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
                        <Pill size={13} /> Prescripciones (TrichoTest, BHRT)
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
                        <FlaskConical size={13} /> Analíticas Lab (Bloodo NAD+, DBS)
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
                  <strong>Note:</strong> {note || 'Uploaded files will be analyzed by AI, allowing you to review prescriptions or laboratory results before creating official records.'}
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
