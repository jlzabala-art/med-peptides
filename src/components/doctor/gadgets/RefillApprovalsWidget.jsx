import React, { useState, useEffect } from 'react';
import { subscribeToRefillRequests, approveRefillRequest, denyRefillRequest } from '../../../repositories/prescriptionRepository';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FileSignature, Check, X } from '@/lib/icons';
import { toast } from 'react-hot-toast';

export default function RefillApprovalsWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToRefillRequests(user.uid, (list) => {
      setRequests(list);
    });

    return () => unsub();
  }, [user]);

  const handleApprove = async (req) => {
    setLoadingId(req.id);
    try {
      await approveRefillRequest(req, user?.displayName || 'Médico Asignado');
      toast.success(t('doctor.approvals.approve_success', 'Renovación aprobada'));
    } catch (err) {
      toast.error('Error al aprobar la renovación');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (reqId) => {
    setLoadingId(reqId);
    try {
      await denyRefillRequest(reqId, 'Rechazado por el médico');
      toast.success(t('doctor.approvals.reject_success', 'Renovación rechazada'));
    } catch (err) {
      toast.error('Error al rechazar la renovación');
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