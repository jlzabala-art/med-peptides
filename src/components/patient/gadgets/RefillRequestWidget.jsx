import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function RefillRequestWidget() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchRx() {
      if (!user?.uid) return;
      const q = query(collection(db, 'recommendations'), where('patientId', '==', user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status === 'active');
      setPrescriptions(list);
    }
    fetchRx();
  }, [user]);

  const handleRequest = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const rx = prescriptions.find(p => p.id === selected);
      // Create a notification for the doctor/admin
      await addDoc(collection(db, 'refill_requests'), {
        patientId: user.uid,
        patientName: user.displayName,
        originalRxId: rx.id,
        doctorId: rx.doctorId,
        productName: rx.productName,
        status: 'pending_approval',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelected('');
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <RefreshCw size={18} color="var(--primary)" /> Solicitar Renovación (Refill)
      </h3>
      
      {success ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', gap: '1rem', padding: '1rem 0' }}>
          <CheckCircle2 size={40} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: 800 }}>Solicitud Enviada</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Tu médico revisará la petición pronto.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>¿Te estás quedando sin tu fórmula? Solicita una renovación directamente a tu médico.</p>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }}>
            <option value="">Selecciona un tratamiento activo...</option>
            {prescriptions.map(p => (
              <option key={p.id} value={p.id}>{p.productName || 'Fórmula'} (por {p.doctorName})</option>
            ))}
          </select>

          <button 
            onClick={handleRequest}
            disabled={loading || !selected}
            style={{ 
              marginTop: 'auto', padding: '0.85rem', width: '100%',
              background: selected ? 'var(--primary)' : 'var(--color-border)', color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: selected && !loading ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      )}
    </div>
  );
}
