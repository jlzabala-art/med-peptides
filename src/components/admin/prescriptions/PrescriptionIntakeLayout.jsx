import React, { useState, useEffect, useCallback } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, limit, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import WorkflowDetailWorkspace from '../../../features/operations/components/WorkflowDetailWorkspace';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function PrescriptionIntakeLayout() {
  const [queue, setQueue] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Escuchar directamente la cola de operaciones filtrada por PRESCRIPTION
    const q = query(
      collection(db, 'operations_queue'),
      where('detectedIntent', '==', 'PRESCRIPTION'),
      orderBy('date', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQueue(items);
    }, (error) => {
      console.error("Error fetching prescriptions queue:", error);
    });

    return () => unsubscribe();
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      setUploading(true);
      toast.loading('Uploading document...', { id: 'upload-toast' });

      // 1. Upload to Storage
      const storageRef = ref(storage, `prescriptions/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Create in inbound_emails to trigger AI Pipeline
      const docId = `manual_${Date.now()}`;
      await setDoc(doc(collection(db, 'inbound_emails'), docId), {
        from: 'system@regenpept.com',
        to: 'system@regenpept.com',
        subject: `Manual Upload: ${file.name}`,
        textBody: 'Please process the attached prescription document.',
        htmlBody: '',
        attachments: [{
          name: file.name,
          contentType: file.type,
          path: `prescriptions/${Date.now()}_${file.name}`,
          url: downloadURL
        }],
        receivedAt: serverTimestamp(),
        status: 'pending_ai',
        source: 'manual_upload'
      });

      toast.success('Document uploaded and sent to AI queue!', { id: 'upload-toast' });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload document', { id: 'upload-toast' });
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/pdf': ['.pdf'], 
      'image/*': ['.png', '.jpg', '.jpeg'] 
    } 
  });

  // Si hay un item seleccionado, mostramos la vista detallada (la misma del Inbox)
  if (selectedItem) {
    return (
      <WorkflowDetailWorkspace 
        item={selectedItem} 
        onBack={() => setSelectedItem(null)} 
        onUpdateItem={(updated) => {
          setQueue(queue.map(q => q.id === updated.id ? updated : q));
          setSelectedItem(updated);
        }}
      />
    );
  }

  // Vista dividida (Dropzone y Cola)
  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', minHeight: '600px' }}>
      {/* Left: Upload Area */}
      <div 
        {...getRootProps()}
        style={{ 
          flex: 1, 
          background: isDragActive ? '#f0f9ff' : '#fff', 
          border: `2px dashed ${isDragActive ? '#0ea5e9' : '#cbd5e1'}`, 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.5 : 1
        }}>
        <input {...getInputProps()} />
        <Upload size={48} color={isDragActive ? '#0ea5e9' : '#94a3b8'} style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Upload Prescription</h3>
        <p style={{ margin: 0, color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
          Drag and drop PDF, Image, WhatsApp Screenshot,<br />or Doctor Notes here.
        </p>

        {/* Badge para Fagron Genomics */}
        <div style={{ 
          background: '#f0fdfa', 
          border: '1px solid #14b8a6', 
          color: '#0f766e', 
          padding: '8px 16px', 
          borderRadius: '16px', 
          fontSize: '13px', 
          fontWeight: 600, 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <CheckCircle2 size={16} /> Especialmente validado para Fagron Genomics
        </div>
      </div>

      {/* Right: Queue */}
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Pending Queue</h3>
        {queue.length === 0 && <div style={{ color: '#64748b', fontSize: '14px' }}>No prescriptions pending.</div>}
        
        {queue.map(rx => (
          <div key={rx.id} onClick={() => setSelectedItem(rx)} style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {rx.prescriptionDetails?.patientName || rx.customerDetection?.name || 'Unknown Patient'}
              </span>
              <span style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                borderRadius: '12px',
                background: rx.status === 'Completed' ? '#dcfce7' : rx.status === 'Awaiting Review' ? '#fef9c3' : '#f1f5f9',
                color: rx.status === 'Completed' ? '#166534' : rx.status === 'Awaiting Review' ? '#854d0e' : '#475569',
                fontWeight: 600
              }}>
                {rx.status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Doctor: {rx.prescriptionDetails?.doctorName || 'Unknown Doctor'}
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
              <span>Products: {rx.workflowRecommendation?.preview?.products?.length || 0}</span>
              <span>Matched: {rx.workflowRecommendation?.preview?.products?.filter(p => p.sku !== 'UNKNOWN').length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}