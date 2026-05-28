import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Truck, Check, PackageOpen } from 'lucide-react';

export default function GlobalLogisticsQueueWidget() {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    // Escuchar todas las prescripciones que están pendientes de envío (ya aprobadas por el doctor)
    // El doctor crea la prescripción en 'recommendations' con status 'pending' o 'approved_by_doctor'. 
    // Para simplificar, buscamos status: 'pending' (o el que estemos usando como default).
    const q = query(
      collection(db, 'recommendations'),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecommendations(list);
    });

    return () => unsub();
  }, []);

  const handleDispatch = async (recId) => {
    setLoadingId(recId);
    try {
      await updateDoc(doc(db, 'recommendations', recId), {
        status: 'dispatched',
        dispatchedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={18} color="var(--primary)" /> Logistics Center (B2C Prescriptions)
        </h3>
        {recommendations.length > 0 && (
          <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-md)' }}>
            {recommendations.length} Orders
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {recommendations.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            No medical prescriptions pending dispatch.
          </div>
        ) : (
          recommendations.map(rec => (
            <div key={rec.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-app)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{rec.patientName}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    <strong>Prescribed by:</strong> Dr. {rec.doctorName}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {rec.productName}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Protocol: {rec.protocolName} | Duration: {rec.durationDays} days
                </div>
              </div>

              <button 
                onClick={() => handleDispatch(rec.id)}
                disabled={loadingId === rec.id}
                style={{ 
                  marginTop: '1rem', width: '100%', padding: '0.75rem', background: 'var(--color-success)', color: 'white', 
                  border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {loadingId === rec.id ? 'Processing...' : <><PackageOpen size={16} /> Mark as Dispatched</>}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
