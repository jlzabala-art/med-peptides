import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Pill, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export default function MyActivePrescriptionsWidget() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRefill, setLoadingRefill] = useState(null);
  const [successRefill, setSuccessRefill] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'recommendations'),
      where('patientId', '==', user.uid),
      where('status', 'in', ['active', 'processing', 'pending'])
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPrescriptions(list);
    });

    return () => unsub();
  }, [user]);

  const handleQuickRefill = async (rx) => {
    setLoadingRefill(rx.id);
    try {
      await addDoc(collection(db, 'refill_requests'), {
        patientId: user.uid,
        patientName: user.displayName || 'Patient',
        originalRxId: rx.id,
        doctorId: rx.doctorId,
        productName: rx.productName,
        status: 'pending_approval',
        createdAt: serverTimestamp()
      });
      setSuccessRefill(rx.id);
      setTimeout(() => {
        setSuccessRefill(null);
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRefill(null);
    }
  };

  if (prescriptions.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Pill size={18} color="var(--primary)" /> {t('patient.prescriptions.title')}
        </h3>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          {t('patient.prescriptions.empty')}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Pill size={18} color="var(--primary)" /> {t('patient.prescriptions.title')}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {prescriptions.map(p => {
          const now = new Date();
          const needsRefill = p.refillAlertDate && p.status === 'active' && now >= p.refillAlertDate.toDate();

          return (
            <div key={p.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--color-bg-app)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{p.productName || t('patient.prescriptions.formula_comp')}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{t('patient.prescriptions.prescribed_by', { doctor: p.doctorName })}</div>
                </div>
                <span style={{ 
                  fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '8px', fontWeight: 700, textTransform: 'uppercase',
                  background: p.status === 'active' ? '#dcfce7' : '#fef3c7',
                  color: p.status === 'active' ? '#166534' : '#92400e'
                }}>
                  {p.status}
                </span>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} color="var(--color-text-secondary)" /> {p.notes || t('patient.prescriptions.default_dosage')}
              </div>

              {needsRefill && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-warning-bg)', border: '1px solid #fde68a', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#b45309', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <AlertTriangle size={16} /> {t('patient.prescriptions.refill_alert_title')}
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#92400e' }}>
                    {t('patient.prescriptions.refill_alert_desc')}
                  </p>
                  
                  {successRefill === p.id ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 700 }}>{t('patient.prescriptions.refill_success')}</div>
                  ) : (
                    <button 
                      onClick={() => handleQuickRefill(p)}
                      disabled={loadingRefill === p.id}
                      style={{ 
                        padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={14} /> {loadingRefill === p.id ? t('patient.prescriptions.refill_loading') : t('patient.prescriptions.refill_btn')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
