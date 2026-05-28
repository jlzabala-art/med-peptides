import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { DollarSign, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const DEMO_PAYOUTS = [
  { id: '1', doctorId: 'doc1', doctorName: 'Dr. Alejandro Gomez', amount: 1250.00, period: 'Mayo 2026', status: 'pending' },
  { id: '2', doctorId: 'doc2', doctorName: 'Dra. María Sánchez', amount: 3400.50, period: 'Mayo 2026', status: 'processing' },
  { id: '3', doctorId: 'doc3', doctorName: 'Dr. John Doe', amount: 890.00, period: 'Abril 2026', status: 'paid' },
];

export default function PayoutManagerWidget() {
  const { activeRole } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayouts() {
      if (activeRole !== 'admin') return;
      try {
        const q = query(
          collection(db, 'payouts'),
          orderBy('period', 'desc')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setPayouts(DEMO_PAYOUTS);
        }
      } catch (err) {
        console.error("Error fetching payouts", err);
        setPayouts(DEMO_PAYOUTS);
      } finally {
        setLoading(false);
      }
    }
    fetchPayouts();
  }, [activeRole]);

  const handleApprove = (id) => {
    // Demo action
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'processing' } : p));
  };

  if (activeRole !== 'admin') return null;

  return (
    <div className="card" style={{ padding: '0', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: 'var(--color-bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} color="var(--primary)" /> Practitioner Payouts
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Payout and commission management.</p>
        </div>
        <div style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', color: 'var(--color-success)' }}>
          <FileText size={20} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No pending payouts.</div>
        ) : (
          payouts.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-app)' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{p.doctorName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Period: {p.period}</div>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.7rem', fontWeight: 700, marginTop: '0.5rem',
                  background: p.status === 'paid' ? '#dcfce7' : p.status === 'processing' ? '#fef9c3' : '#fee2e2',
                  color: p.status === 'paid' ? '#166534' : p.status === 'processing' ? '#854d0e' : '#991b1b'
                }}>
                  {p.status === 'paid' && <CheckCircle2 size={12} />}
                  {p.status === 'processing' && <Loader2 size={12} />}
                  {p.status === 'pending' && <AlertCircle size={12} />}
                  {p.status === 'paid' ? 'Paid' : p.status === 'processing' ? 'Processing' : 'Pending'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                {p.status === 'pending' && (
                  <button 
                    onClick={() => handleApprove(p.id)}
                    style={{ padding: '0.4rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Approve Payout
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
