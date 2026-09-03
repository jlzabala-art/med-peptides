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

  return {
    queuePrescription,
    processPrescription,
    isProcessing,
    error
  };
}
