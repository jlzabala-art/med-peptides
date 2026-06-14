import ActivitySquare from "lucide-react/dist/esm/icons/activity-square";
import Battery from "lucide-react/dist/esm/icons/battery";
import Moon from "lucide-react/dist/esm/icons/moon";
import Frown from "lucide-react/dist/esm/icons/frown";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';





export default function ClinicalProgressMonitorWidget() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('ALL');

  useEffect(() => {
    if (!user?.uid) return;
    // Get last 20 symptom logs for this doctor
    const q = query(
      collection(db, 'symptom_logs'),
      where('doctorId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(list);
    });

    return () => unsub();
  }, [user]);

  // Extract unique patients for the filter
  const uniquePatients = Array.from(new Set(logs.map(l => l.patientId))).map(id => {
    return logs.find(l => l.patientId === id);
  });

  const filteredLogs = selectedPatient === 'ALL' ? logs : logs.filter(l => l.patientId === selectedPatient);

  const getScoreColor = (score, inverse=false) => {
    // For energy/sleep: higher is better (green)
    // For pain (inverse): higher is worse (red)
    if (inverse) {
      if (score <= 3) return 'var(--color-success)'; // green
      if (score <= 6) return '#f59e0b'; // yellow
      return 'var(--color-danger)'; // red
    } else {
      if (score >= 7) return 'var(--color-success)';
      if (score >= 4) return '#f59e0b';
      return 'var(--color-danger)';
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ActivitySquare size={18} color="var(--primary)" /> Monitor Clínico (Síntomas)
        </h3>
        <select 
          value={selectedPatient} 
          onChange={e => setSelectedPatient(e.target.value)}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }}
        >
          <option value="ALL">Todos los Patients</option>
          {uniquePatients.map(p => (
            <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            No hay reportes de síntomas recientes.
          </div>
        ) : (
          filteredLogs.map(log => {
            const dateStr = log.timestamp ? log.timestamp.toDate().toLocaleDateString() : 'Reciente';
            return (
              <div key={log.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--color-bg-app)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{log.patientName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{dateStr}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <div style={{ background: 'var(--color-bg-surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem' }}>
                      <Battery size={10}/> Energía
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getScoreColor(log.energyLevel) }}>{log.energyLevel}/10</div>
                  </div>
                  <div style={{ background: 'var(--color-bg-surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem' }}>
                      <Moon size={10}/> Sueño
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getScoreColor(log.sleepQuality) }}>{log.sleepQuality}/10</div>
                  </div>
                  <div style={{ background: 'var(--color-bg-surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem' }}>
                      <Frown size={10}/> Dolor
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getScoreColor(log.painLevel, true) }}>{log.painLevel}/10</div>
                  </div>
                </div>

                {log.sideEffects && (
                  <div style={{ fontSize: '0.8rem', color: '#b45309', background: 'var(--color-warning-bg)', padding: '0.5rem 0.8rem', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                    <strong style={{ display: 'block', marginBottom: '0.1rem' }}>Efectos reportados:</strong>
                    {log.sideEffects}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}