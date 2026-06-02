import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FileSignature, Check, X } from 'lucide-react';

export default function RefillApprovalsWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'refill_requests'),
      where('doctorId', '==', user.uid),
      where('status', '==', 'pending_approval')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(list);
    });

    return () => unsub();
  }, [user]);

  const handleApprove = async (req) => {
    setLoadingId(req.id);
    try {
      // 1. Update request status
      await updateDoc(doc(db, 'refill_requests', req.id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });

      // 2. Create new recommendation for Admin to supply
      await addDoc(collection(db, 'recommendations'), {
        doctorId: user.uid,
        doctorName: user.displayName || 'Médico Asignado',
        patientId: req.patientId,
        patientName: req.patientName,
        productId: req.productId || 'custom',
        productName: req.productName,
        notes: 'Renovación automática aprobada por el médico.',
        status: 'pending', // Trigger Admin Supply Notification
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (reqId) => {
    setLoadingId(reqId);
    try {
      await updateDoc(doc(db, 'refill_requests', reqId), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSignature size={18} color="var(--primary)" /> {t('doctor.approvals.title')}
        </h3>
        {requests.length > 0 && (
          <span style={{ background: 'var(--color-danger)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            {requests.length} {t('doctor.approvals.pending')}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {requests.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            {t('doctor.approvals.empty')}
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--color-bg-app)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{req.patientName}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    {t('doctor.approvals.requests_label')} <strong style={{ color: 'var(--color-text-primary)' }}>{req.productName}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => handleReject(req.id)}
                  disabled={loadingId === req.id}
                  style={{ 
                    flex: 1, padding: '0.5rem', background: 'transparent', color: 'var(--color-text-secondary)', 
                    border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                  }}
                >
                  <X size={16} /> {t('doctor.approvals.reject')}
                </button>
                <button 
                  onClick={() => handleApprove(req)}
                  disabled={loadingId === req.id}
                  style={{ 
                    flex: 1, padding: '0.5rem', background: 'var(--color-success)', color: 'white', 
                    border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                  }}
                >
                  <Check size={16} /> {t('doctor.approvals.approve')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
