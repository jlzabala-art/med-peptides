import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { FlaskConical, Check, X, FileText } from 'lucide-react';

export default function LabResultsInboxWidget() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'lab_results'),
      where('doctorId', '==', user.uid),
      where('status', '==', 'pending_review')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setResults(list);
    });

    return () => unsub();
  }, [user]);

  const handleReview = async (resId) => {
    setLoadingId(resId);
    try {
      await updateDoc(doc(db, 'lab_results', resId), {
        status: 'reviewed',
        reviewedAt: serverTimestamp()
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
          <FlaskConical size={18} color="var(--primary)" /> Analíticas Entrantes
        </h3>
        {results.length > 0 && (
          <span style={{ background: 'var(--color-danger)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            {results.length} Pendientes
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {results.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            No hay nuevos resultados de laboratorio pendientes de revisión.
          </div>
        ) : (
          results.map(res => (
            <div key={res.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--color-bg-app)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{res.patientName}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FileText size={12}/> {res.fileName || 'Documento Adjunto'}
                  </div>
                  {res.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      "{res.notes}"
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => alert("Mostrando PDF o imagen del paciente...")}
                  style={{ 
                    flex: 1, padding: '0.5rem', background: 'var(--color-border)', color: 'var(--color-text-secondary)', 
                    border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                  }}
                >
                  Ver Archivo
                </button>
                <button 
                  onClick={() => handleReview(res.id)}
                  disabled={loadingId === res.id}
                  style={{ 
                    flex: 1, padding: '0.5rem', background: 'var(--color-success)', color: 'white', 
                    border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                  }}
                >
                  <Check size={16} /> Marcar Revisado
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
