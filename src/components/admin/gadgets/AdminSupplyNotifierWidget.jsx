import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { AlertCircle, ArrowRight, Package } from 'lucide-react';

export default function AdminSupplyNotifierWidget({
  ownerId = 'admin',
  ownerType = 'admin',
  permissions = { canEdit: true, canExport: true },
  hideCosts = false,
}) {
  const [pendingReqs, setPendingReqs] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'recommendations'), where('status', '==', 'pending'));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingReqs(list);
    });

    return () => unsub();
  }, []);

  async function handleProcess(id) {
    setLoadingId(id);
    try {
      await updateDoc(doc(db, 'recommendations', id), {
        status: 'processing',
      });
    } catch (err) {
      console.error('Error processing supply', err);
    } finally {
      setLoadingId(null);
    }
  };

  if (pendingReqs.length === 0) return null;

  return (
    <div
      className="card"
      style={{
        padding: '2rem',
        background: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #ef4444',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            color: 'var(--color-danger)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={22} color="var(--color-danger)" /> Urgent: Prescriptions Awaiting
          Supply
        </h3>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'white',
            background: 'var(--color-danger)',
            padding: '0.3rem 0.8rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {pendingReqs.length} New
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pendingReqs.map((req) => (
          <div
            key={req.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-bg)',
              border: '1px solid #fca5a5',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#7f1d1d' }}>
                {req.patientName}{' '}
                <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>
                  (via {req.doctorName})
                </span>
              </div>
              <div
                style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600, marginTop: '4px' }}
              >
                <Package
                  size={14}
                  style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}
                />
                {req.productName || 'Compound Formula'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '2px' }}>
                {req.notes}
              </div>
            </div>

            <button
              onClick={() => handleProcess(req.id)}
              disabled={loadingId === req.id}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--color-danger)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--color-danger)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'var(--color-danger)')}
            >
              {loadingId === req.id ? (
                'Processing...'
              ) : (
                <>
                  Initiate Supply <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
