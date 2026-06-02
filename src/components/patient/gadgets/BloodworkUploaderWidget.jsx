import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FileUp, FileText, CheckCircle2 } from 'lucide-react';

export default function BloodworkUploaderWidget() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [doctors, setPhysicians] = useState([]);
  const [selectedPhysician, setSelectedPhysician] = useState('');
  const [notes, setNotes] = useState('');
  const [fileAttached, setFileAttached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchPhysicians() {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'doctor_patient_relationships'), where('patientId', '==', user.uid), where('status', '==', 'active'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPhysicians(list);
        if (list.length === 1) setSelectedPhysician(list[0].doctorId);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPhysicians();
  }, [user]);

  const handleUpload = async () => {
    if (!selectedPhysician || !fileAttached) {
      alert(t('patient.bloodwork.alert_missing_fields') || "Por favor, selecciona un médico y adjunta el archivo.");
      return;
    }
    setLoading(true);
    try {
      const docRel = doctors.find(d => d.doctorId === selectedPhysician);
      
      // Simulate file upload logic by creating a record in Firestore
      // In a real scenario, we would upload to Firebase Storage first and get the URL.
      await addDoc(collection(db, 'lab_results'), {
        patientId: user.uid,
        patientName: user.displayName || 'Patient',
        doctorId: selectedPhysician,
        doctorName: docRel?.doctorName || 'Médico',
        type: 'bloodwork',
        notes: notes,
        fileUrl: 'simulated_storage_url_123.pdf', 
        fileName: 'analiticas_recientes.pdf',
        status: 'pending_review',
        uploadedAt: serverTimestamp()
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFileAttached(false);
        setNotes('');
      }, 4000);
    } catch (err) {
      console.error(err);
      alert(t('patient.bloodwork.error_uploading') || "Error al enviar los resultados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileUp size={18} color="var(--primary)" /> {t('patient.bloodwork.title')}
      </h3>
      
      {success ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', gap: '1rem', padding: '1rem 0' }}>
          <CheckCircle2 size={40} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: 800 }}>{t('patient.bloodwork.success_title')}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{t('patient.bloodwork.success_desc')}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{t('patient.bloodwork.description')}</p>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{t('patient.bloodwork.send_to')}</label>
            <select value={selectedPhysician} onChange={e => setSelectedPhysician(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }}>
              <option value="">{t('patient.bloodwork.select_physician')}</option>
              {doctors.map(d => <option key={d.id} value={d.doctorId}>Dr. {d.doctorName}</option>)}
            </select>
          </div>

          <div 
            onClick={() => setFileAttached(true)}
            style={{ 
              padding: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '12px', background: fileAttached ? 'var(--color-success-bg)' : 'var(--color-bg-app)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer',
              color: fileAttached ? '#166534' : 'var(--color-text-secondary)', transition: 'all 0.2s'
            }}
          >
            <FileText size={24} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{fileAttached ? t('patient.bloodwork.file_attached') : t('patient.bloodwork.attach_pdf')}</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{t('patient.bloodwork.notes_label')}</label>
            <textarea 
              value={notes} onChange={e => setNotes(e.target.value)} 
              placeholder={t('patient.bloodwork.notes_placeholder')}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            onClick={handleUpload}
            disabled={loading || !fileAttached || !selectedPhysician}
            style={{ 
              marginTop: 'auto', padding: '0.85rem', width: '100%',
              background: (fileAttached && selectedPhysician) ? 'var(--primary)' : 'var(--color-border)', color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: (fileAttached && selectedPhysician) && !loading ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
            }}
          >
            {loading ? t('patient.bloodwork.submit_loading') : t('patient.bloodwork.submit_btn')}
          </button>
        </div>
      )}
    </div>
  );
}
