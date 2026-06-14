import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Truck from "lucide-react/dist/esm/icons/truck";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card } from '../ui';





import { useTranslation } from 'react-i18next';

export default function PublicClientQuote() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'APPROVED', 'REJECTED'
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const docRef = doc(db, 'agency_rfqs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (['APPROVED_BY_CLIENT', 'AWAITING_INVOICE', 'RECONCILED', 'SHIPPED', 'DELIVERED'].includes(data.status)) setStatus('APPROVED');
          if (data.status === 'REJECTED') setStatus('REJECTED');
          setRfq({ id: docSnap.id, ...data });
        } else {
          setError(t('quote.notFound', "Quote not found or invalid link."));
        }
      } catch (err) {
        console.error(err);
        setError(t('quote.errorLoading', "Error loading quote."));
      }
      setLoading(false);
    };
    fetchRFQ();
  }, [id, t]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      const newStatus = action === 'accept' ? 'APPROVED_BY_CLIENT' : 'REJECTED';
      await updateDoc(doc(db, 'agency_rfqs', id), {
        status: newStatus
      });
      setStatus(action === 'accept' ? 'APPROVED' : 'REJECTED');
    } catch (err) {
      console.error(err);
      alert(t('quote.errorAction', "Error processing action."));
    }
    setActionLoading(false);
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spin" /></div>;
  if (error) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        <h2 style={{ color: '#b91c1c' }}>{t('quote.accessDenied', "Access Denied")}</h2>
        <p>{error}</p>
      </Card>
    </div>
  );

  const totalQuote = rfq.items?.reduce((acc, item) => acc + ((item.clientUnitPrice || 0) * item.quantity), 0) || 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center', color: '#166534' }}>
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{t('quote.portalTitle', "Client Quote Portal")}</span>
        </div>

        <Card style={{ padding: '0', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #bbf7d0' }}>
          <div style={{ padding: '2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: '#0f172a' }}>{t('quote.quoteNumber', "Quote #{{id}}", { id: id.slice(0,6).toUpperCase() })}</h1>
              <p style={{ margin: 0, color: '#64748b' }}>{t('quote.preparedFor', "Prepared for:")} <strong>{rfq.clientName}</strong></p>
            </div>
            {status === 'APPROVED' && <span style={{ padding: '0.5rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: 700, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18}/> {t('quote.approved', "APPROVED")}</span>}
            {status === 'REJECTED' && <span style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '20px', fontWeight: 700, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><XCircle size={18}/> {t('quote.rejected', "REJECTED")}</span>}
          </div>

          <div style={{ padding: '2rem', background: '#fafafa' }}>
            <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc' }}>{t('quote.tableItem', "Item")}</th>
                  <th style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc' }}>{t('quote.tableQty', "Qty")}</th>
                  <th style={{ textAlign: 'right', padding: '1rem', background: '#f8fafc' }}>{t('quote.tableUnitPrice', "Unit Price")}</th>
                  <th style={{ textAlign: 'right', padding: '1rem', background: '#f8fafc' }}>{t('quote.tableTotal', "Total")}</th>
                </tr>
              </thead>
              <tbody>
                {rfq.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ color: '#334155' }}>{item.peptide_name}</strong>
                      {item.dosage && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{item.dosage}</div>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '1rem' }}>${item.clientUnitPrice?.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '1rem', fontWeight: 700 }}>${((item.clientUnitPrice || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1rem 2rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  <span>{t('quote.totalQuote', "Total Quote:")}</span>
                  <span>${totalQuote.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {(rfq.status === 'SHIPPED' || rfq.status === 'DELIVERED') && rfq.shippingData && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1d4ed8' }}>
                  <Truck size={24} />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{t('quote.trackingInfo', "Tracking Information")}</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.95rem' }}>
                  <div>
                    <strong style={{ color: '#1e3a8a', display: 'block' }}>{t('quote.carrier', "Carrier")}</strong>
                    <span style={{ color: '#334155' }}>{rfq.shippingData.carrier}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#1e3a8a', display: 'block' }}>{t('quote.trackingAWB', "Tracking (AWB)")}</strong>
                    <span style={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{rfq.shippingData.awb}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#1e3a8a', display: 'block' }}>{t('quote.estDelivery', "Est. Delivery")}</strong>
                    <span style={{ color: '#334155' }}>{rfq.shippingData.eta}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!status && (
            <div style={{ padding: '1.5rem 2rem', background: 'white', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => handleAction('reject')}
                disabled={actionLoading}
                className="gcp-btn gcp-btn--secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', color: '#b91c1c', border: '1px solid #fecaca', background: '#fef2f2' }}
              >
                {t('quote.rejectBtn', "Reject Quote")}
              </button>
              <button 
                onClick={() => handleAction('accept')}
                disabled={actionLoading}
                className="gcp-btn gcp-btn--primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#16a34a', color: 'white' }}
              >
                {actionLoading ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}
                {t('quote.acceptBtn', "Accept Quote")}
              </button>
            </div>
          )}
        </Card>

      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}