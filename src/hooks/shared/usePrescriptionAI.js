import { useState, useCallback } from 'react';
import * as fb from '../../firebase';
const db = fb?.db;
const storage = fb?.storage;
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { extractPrescriptionFromDocument, normalizeExtractedPrescriptions } from '../../services/prescriptionAiService';

export function usePrescriptionAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const queuePrescription = async (file, currentUid = 'anonymous', metadata = {}) => {
    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `prescriptions/${currentUid}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // 2. Create in inbound_emails to trigger AI Pipeline
    const docId = `rx_${Date.now()}_${currentUid}`;
    const docRef = doc(collection(db, 'inbound_emails'), docId);
    
    await setDoc(docRef, {
      from: currentUid === 'anonymous' ? 'b2c_checkout@regenpept.com' : `${currentUid}@regenpept.com`,
      to: 'system@regenpept.com',
      subject: `Prescription Upload: ${file.name}`,
      textBody: 'Please process the attached prescription document for clinical review.',
      htmlBody: '',
      attachments: [{
        name: file.name,
        contentType: file.type,
        path: storagePath,
        url: downloadURL
      }],
      receivedAt: serverTimestamp(),
      status: 'pending_ai',
      source: currentUid === 'anonymous' ? 'b2c_checkout' : 'b2b_portal',
      ...metadata
    });

    return { docId, docRef, downloadURL, storagePath };
  };

  const processPrescription = useCallback(async (file, currentUid = 'anonymous', metadata = {}) => {
    setIsProcessing(true);
    setError(null);

    // 1. First Attempt: Fast direct multimodal extraction via Next.js API
    try {
      const rawAiData = await extractPrescriptionFromDocument(file);

      // Dedicated Lab Result Handling (Bloodo / LifeLab1 / Biomarkers)
      if (rawAiData.documentType === 'LabResult' || rawAiData.labResult) {
        setIsProcessing(false);
        const lr = rawAiData.labResult || {};
        const pCode = lr.patientCode || rawAiData.patient?.code || rawAiData.fileNumber || '';
        return {
          isLabResult: true,
          documentType: 'LabResult',
          rawDocId: `direct_${Date.now()}`,
          fileUrl: URL.createObjectURL(file),
          fileName: file.name,
          patientName: pCode ? `Patient #${pCode}` : (rawAiData.patient?.name || 'Verified Patient'),
          patientCode: pCode,
          patientAge: lr.patientAge || rawAiData.patient?.age || null,
          patientGender: lr.patientGender || rawAiData.patient?.gender || null,
          doctorName: rawAiData.doctor?.name || 'Dr. Çağatay Sezgin, MD, FISHRS',
          doctorId: rawAiData.matchedDoctor?.id || 'z3aUIMaYsPViG1JgM95r',
          clinicName: rawAiData.doctor?.clinicName || rawAiData.clinic || 'Shamma Clinic by Novomed LLC',
          testName: lr.testName || 'Nicotinamide Adenine Dinucleotide (NAD+) Quantitative Test',
          biomarker: lr.biomarker || 'NAD+ (Total Intracellular)',
          value: lr.value != null ? lr.value : null,
          unit: lr.unit || 'µmol/L',
          zone: lr.zone || 'yellow',
          zoneLabel: lr.zoneLabel || 'Insufficient / Suboptimal',
          protocolNumber: lr.protocolNumber || rawAiData.prescriptionNumber || '',
          sampleType: lr.sampleType || 'Dried Blood Spot (DBS)',
          collectionDate: lr.collectionDate || '',
          receiptDate: lr.receiptDate || '',
          analysisDate: lr.analysisDate || '',
          protocolDate: lr.protocolDate || '',
          laboratory: lr.laboratory || 'LifeLab1 / Bloodo',
          interpretation: lr.interpretation || '',
          rawAiData
        };
      }

      const normalizedList = await normalizeExtractedPrescriptions(rawAiData);
      const firstRx = normalizedList[0] || {};
      const lines = firstRx.prescriptionLines || [];

      setIsProcessing(false);

      return {
        rawDocId: `direct_${Date.now()}`,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        patientName: firstRx.patientName || rawAiData.patient?.name || '',
        doctorName: firstRx.doctorName || rawAiData.doctor?.name || '',
        dosage: lines[0]?.dosage || lines[0]?.dose || 'Not Detected',
        frequency: lines[0]?.frequency || 'Not Detected',
        instructions: lines[0]?.instructions || 'Not Detected',
        match: true,
        matchedProducts: lines.map(l => ({
          name: l.productName || l.activeIngredient,
          category: l.category || '',
          dosage: l.dosage || l.dose,
          frequency: l.frequency,
          instructions: l.instructions,
          quantity: l.quantity || 1,
          variants: []
        })),
        rawAiData,
        rxDetails: {
          patientName: firstRx.patientName,
          doctorName: firstRx.doctorName,
          treatmentProgram: firstRx.treatmentProgram,
          treatmentType: firstRx.treatmentType,
          clinicalIndication: firstRx.clinicalIndication,
        },
        formulationBlocks: normalizedList.map(rx => ({
          treatmentProgram: rx.treatmentProgram || '',
          treatmentType: rx.treatmentType || '',
          clinicalIndication: rx.clinicalIndication || '',
          items: (rx.prescriptionLines || []).map(p => ({
            name: p.productName || p.activeIngredient,
            category: p.category || '',
            dosage: p.dosage || p.dose,
            frequency: p.frequency,
            instructions: p.instructions,
            quantity: p.quantity,
            variants: []
          }))
        }))
      };
    } catch (directErr) {
      console.warn('[usePrescriptionAI] Direct extraction failed, falling back to background queue:', directErr.message);
    }

    // 2. Fallback: Background Cloud Function Queue
    return new Promise(async (resolve, reject) => {
      try {
        const { docId, docRef, downloadURL } = await queuePrescription(file, currentUid, metadata);

        // Listen for AI processing completion
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();
          
          if (data.status === 'ai_processed' || data.status === 'completed' || data.status === 'needs_review') {
            unsubscribe();
            setIsProcessing(false);
            
            const aiInterp = data.aiInterpretation || {};
            const extractedData = aiInterp.extractedData || {};
            
            let rxDetails = extractedData.prescriptionDetails || {};
            let products = extractedData.products || [];
            let formulationBlocks = [];
            
            if (extractedData.prescriptions && extractedData.prescriptions.length > 0) {
                rxDetails = extractedData.prescriptions[0].prescriptionDetails || rxDetails;
                products = extractedData.prescriptions[0].products || products;
                
                formulationBlocks = extractedData.prescriptions.map(block => ({
                  treatmentProgram: block.prescriptionDetails?.treatmentProgram || rxDetails.treatmentProgram || '',
                  treatmentType: block.prescriptionDetails?.treatmentType || rxDetails.treatmentType || '',
                  clinicalIndication: block.prescriptionDetails?.clinicalIndication || rxDetails.clinicalIndication || '',
                  items: (block.products || []).map(p => ({
                    name: p.name,
                    category: p.category || '',
                    dosage: p.dosage,
                    frequency: p.frequency,
                    instructions: p.instructions,
                    quantity: p.quantity,
                    variants: []
                  }))
                }));
            } else {
                formulationBlocks = [{
                  treatmentProgram: rxDetails.treatmentProgram || '',
                  treatmentType: rxDetails.treatmentType || '',
                  clinicalIndication: rxDetails.clinicalIndication || '',
                  items: products.map(p => ({
                    name: p.name,
                    category: p.category || '',
                    dosage: p.dosage,
                    frequency: p.frequency,
                    instructions: p.instructions,
                    quantity: p.quantity,
                    variants: []
                  }))
                }];
            }
            
            resolve({
              rawDocId: docId,
              fileUrl: downloadURL,
              fileName: file.name,
              patientName: rxDetails.patientName || data.customerDetection?.name,
              doctorName: rxDetails.doctorName,
              dosage: products[0]?.dosage || rxDetails.dosage || 'Not Detected',
              frequency: products[0]?.frequency || rxDetails.frequency || 'Not Detected',
              instructions: products[0]?.instructions || 'Not Detected',
              match: true,
              matchedProducts: products.map(p => ({
                name: p.name,
                category: p.category || '',
                dosage: p.dosage,
                frequency: p.frequency,
                instructions: p.instructions,
                quantity: p.quantity,
                variants: []
              })),
              rawAiData: data,
              rxDetails,
              formulationBlocks
            });
          } else if (data.status === 'ai_failed') {
            unsubscribe();
            setIsProcessing(false);
            setError(data.aiErrorMessage || 'AI Processing Failed');
            reject(new Error(data.aiErrorMessage || 'AI Processing Failed'));
          }
        }, (err) => {
          unsubscribe();
          setIsProcessing(false);
          setError(err.message);
          reject(err);
        });

      } catch (err) {
        setIsProcessing(false);
        setError(err.message);
        reject(err);
      }
    });
  }, []);

  const saveLabResult = useCallback(async (labData) => {
    try {
      const cleanCode = String(labData.protocolNumber || labData.code || Date.now()).trim();
      const docId = `LAB-${cleanCode}-NAD`;
      const docRef = doc(collection(db, 'lab_results'), docId);

      const zone = String(labData.zone || 'yellow').toLowerCase();
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
          code: labData.patientCode || 'Anonymous',
          id: labData.patientCode || 'Anonymous',
          name: labData.patientName || `Patient #${labData.patientCode || 'Anonymous'}`,
          gender: labData.patientGender || 'Male',
          age: Number(labData.patientAge) || 50
        },
        patientCode: labData.patientCode || 'Anonymous',
        patientName: labData.patientName || `Patient #${labData.patientCode || 'Anonymous'}`,
        doctorId: labData.doctorId || 'dr-sobia',
        doctorName: labData.doctorName || 'Dr. Sobia Mirza',
        doctorSpecialty: labData.doctorSpecialty || 'Aesthetic Medicine & Regenerative Biology',
        clinicName: labData.clinicName || 'My London Skin Clinic',
        testType: 'nad_dbs',
        testName: labData.testName || 'Nicotinamide Adenine Dinucleotide (NAD+) Quantitative Test',
        shortName: 'NAD+ Dried Blood Spot (DBS)',
        biomarker: labData.biomarker || 'NAD+ (Total Intracellular)',
        sampleType: labData.sampleType || 'Dried Blood Spot (DBS)',
        value: labData.value != null ? Number(labData.value) : 0,
        unit: labData.unit || 'µmol/L',
        zone: labData.zone || 'yellow',
        zoneLabel: labData.zoneLabel || 'Insufficient / Suboptimal',
        zoneColor,
        zoneBg,
        resultCategory: labData.zone || 'insufficient',
        collectionDate: labData.collectionDate || '',
        receiptDate: labData.receiptDate || '',
        analysisDate: labData.analysisDate || '',
        protocolDate: labData.protocolDate || labData.analysisDate || '',
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
        interpretation: labData.interpretation || '',
        pdfReportUrl: labData.pdfReportUrl || `/reports/bloodo-nad-${cleanCode}.pdf`,
        status: 'completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, payload, { merge: true });
      return { success: true, id: docId, code: cleanCode, publicUrl: `/lab/${cleanCode}` };
    } catch (err) {
      console.error('[usePrescriptionAI] Error saving lab result:', err);
      throw err;
    }
  }, []);

  return {
    queuePrescription,
    processPrescription,
    saveLabResult,
    isProcessing,
    error
  };
}
