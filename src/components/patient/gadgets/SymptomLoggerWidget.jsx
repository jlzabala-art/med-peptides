import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { Activity, Battery, Moon, Activity as PainIcon, CheckCircle2 } from 'lucide-react';

export default function SymptomLoggerWidget() {
  const { user } = useAuth();
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [pain, setPain] = useState(0);
  const [sideEffects, setSideEffects] = useState('');
  const [doctors, setPhysicians] = useState([]);
  const [selectedPhysician, setSelectedPhysician] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchPhysicians() {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'doctor_patient_relationships'), where('patientId', '==', user.uid), where('status', '==', 'active'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPhysicians(list);
        if (list.length === 1) setSelectedPhysician(list[0].doctorId);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPhysicians();
  }, [user]);

  const handleLog = async () => {
    if (!selectedPhysician) {
      alert("Selecciona un médico al que enviar el reporte.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'symptom_logs'), {
        patientId: user.uid,
        patientName: user.displayName || 'Patient',
        doctorId: selectedPhysician,
        energyLevel: Number(energy),
        sleepQuality: Number(sleep),
        painLevel: Number(pain),
        sideEffects: sideEffects,
        timestamp: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEnergy(5);
        setSleep(5);
        setPain(0);
        setSideEffects('');
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderSlider = (label, value, setter, icon, min=1, max=10) => (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {icon} {label}
        </label>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{value}/{max}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} onChange={e => setter(e.target.value)}
        style={{ width: '100%', cursor: 'pointer' }}
      />
    </div>
  );

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={18} color="var(--primary)" /> Diario de Síntomas
      </h3>
      
      {success ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', gap: '1rem', padding: '1rem 0' }}>
          <CheckCircle2 size={40} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: 800 }}>Reporte Guardado</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Tu médico verá este progreso en su monitor.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <select value={selectedPhysician} onChange={e => setSelectedPhysician(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }}>
              <option value="">-- Médico a Notificar --</option>
              {doctors.map(d => <option key={d.id} value={d.doctorId}>Dr. {d.doctorName}</option>)}
            </select>
          </div>

          {renderSlider("Nivel de Energía", energy, setEnergy, <Battery size={14} />, 1, 10)}
          {renderSlider("Calidad del Sueño", sleep, setSleep, <Moon size={14} />, 1, 10)}
          {renderSlider("Nivel de Dolor", pain, setPain, <PainIcon size={14} />, 0, 10)}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Efectos Secundarios (Opcional)</label>
            <textarea 
              value={sideEffects} onChange={e => setSideEffects(e.target.value)} 
              placeholder="Ej: Náuseas leves en la mañana..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', resize: 'vertical', minHeight: '50px', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            onClick={handleLog}
            disabled={loading || !selectedPhysician}
            style={{ 
              marginTop: '1rem', padding: '0.85rem', width: '100%',
              background: selectedPhysician ? 'var(--primary)' : 'var(--color-border)', color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: selectedPhysician && !loading ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
            }}
          >
            {loading ? 'Guardando...' : 'Save Reporte Diario'}
          </button>
        </div>
      )}
    </div>
  );
}
