import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { DollarSign, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const DEMO_PAYOUTS = [
  {
    id: '1',
    doctorId: 'doc1',
    doctorName: 'Dr. Alejandro Gomez',
    amount: 1250.0,
    period: 'Mayo 2026',
    status: 'pending',
  },
  {
    id: '2',
    doctorId: 'doc2',
    doctorName: 'Dra. María Sánchez',
    amount: 3400.5,
    period: 'Mayo 2026',
    status: 'processing',
  },
  {
    id: '3',
    doctorId: 'doc3',
    doctorName: 'Dr. John Doe',
    amount: 890.0,
    period: 'Abril 2026',
    status: 'paid',
  },
];

export default function PayoutManagerWidget({
  ownerId = 'admin',
  ownerType = 'admin',
  permissions = { canEdit: true, canExport: true },
  hideCosts = false,
}) {
  const { activeRole } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayouts() {
      if (activeRole !== 'admin') return;
      try {
        const q = query(collection(db, 'payouts'), orderBy('period', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPayouts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setPayouts(DEMO_PAYOUTS);
        }
      } catch (err) {
        console.error('Error fetching payouts', err);
        setPayouts(DEMO_PAYOUTS);
      } finally {
        setLoading(false);
      }
    }
    fetchPayouts();
  }, [activeRole]);

  const handleApprove = async (id) => {
    const payout = payouts.find(p => p.id === id);
    if (!payout) return;

    if (payout.amount >= 1000) {
      // Send to CFO Approval Queue
      try {
        await addDoc(collection(db, 'financial_approvals'), {
          type: 'payout_auth',
          status: 'pending',
          data: {
            payoutId: id,
            amount: payout.amount,
            recipientName: payout.doctorName
          },
          requestedBy: activeRole || 'Admin',
          createdAt: new Date().toISOString()
        });
        alert('High-value payout routed to CFO for approval.');
        setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p)));
      } catch (err) {
        console.error('Error queueing approval', err);
      }
    } else {
      // Normal flow
      setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'processing' } : p)));
    }
  };

  if (activeRole !== 'admin') return null;

  return (
    <div
      className="amd-table-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h3
            className="amd-title"
            style={{
              margin: '0 0 0.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#202124',
            }}
          >
            <DollarSign size={16} color="#1a73e8" /> Practitioner Payouts
          </h3>
          <p className="amd-caption" style={{ margin: 0, color: '#5f6368' }}>
            Payout and commission management.
          </p>
        </div>
        <div
          style={{
            padding: '0.4rem',
            background: '#e6f4ea',
            borderRadius: '4px',
            color: '#137333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileText size={16} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#5f6368', fontSize: '0.85rem' }}>
            Loading payouts...
          </div>
        ) : payouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#5f6368', fontSize: '0.85rem' }}>
            No pending payouts.
          </div>
        ) : (
          payouts.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid #f1f3f4',
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#202124',
                    fontSize: '0.875rem',
                  }}
                >
                  {p.doctorName}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#5f6368',
                    marginTop: '0.15rem',
                  }}
                >
                  Period: {p.period}
                </div>

                <div
                  className="amd-badge"
                  style={{
                    marginTop: '0.35rem',
                    backgroundColor:
                      p.status === 'paid'
                        ? '#e6f4ea'
                        : p.status === 'processing'
                          ? '#fef7e0'
                          : '#fce8e6',
                    color:
                      p.status === 'paid'
                        ? '#137333'
                        : p.status === 'processing'
                          ? '#b06000'
                          : '#c5221f',
                  }}
                >
                  {p.status === 'paid'
                    ? 'Paid'
                    : p.status === 'processing'
                      ? 'Processing'
                      : 'Pending'}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.4rem',
                }}
              >
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#202124', lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading, inherit)' }}>
                  ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                {p.status === 'pending' && (
                  <button
                    onClick={() => handleApprove(p.id)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#1a73e8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1557b0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#1a73e8')}
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
