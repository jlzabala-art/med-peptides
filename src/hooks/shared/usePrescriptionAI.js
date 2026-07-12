import { useState, useCallback } from 'react';
import * as fb from '../../firebase';
const db = fb?.db;
const storage = fb?.storage;
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  const processPrescription = useCallback((file, currentUid = 'anonymous', metadata = {}) => {

    return new Promise(async (resolve, reject) => {
      setIsProcessing(true);
      setError(null);

      try {
        const { docId, docRef, downloadURL } = await queuePrescription(file, currentUid, metadata);

        // 3. Listen for AI processing completion
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();
          
          if (data.status !== 'pending_ai' && data.status !== 'processing') {
            unsubscribe();
            setIsProcessing(false);
            
            const rxDetails = data.prescriptionDetails || {};
            const products = rxDetails.products || [];
            
            resolve({
              rawDocId: docId,
              fileUrl: downloadURL,
              fileName: file.name,
              patientName: rxDetails.patientName || data.customerDetection?.name,
              doctorName: rxDetails.doctorName,
              dosage: products[0]?.dosage || rxDetails.dosage || 'Not Detected',
              frequency: products[0]?.frequency || rxDetails.frequency || 'Not Detected',
              match: true,
              matchedProducts: products.map(p => ({
                name: p.name,
                category: p.category,
                variants: []
              })),
              rawAiData: data
            });
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
