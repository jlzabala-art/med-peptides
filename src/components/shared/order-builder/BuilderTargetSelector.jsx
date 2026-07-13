import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import User from "lucide-react/dist/esm/icons/user";
import Building from "lucide-react/dist/esm/icons/building";

/**
 * BuilderTargetSelector
 * Allows selecting the target of the order based on the current mode.
 * 
 * Modes:
 *  - 'prescription': Target is a Patient (requires doctorId)
 *  - 'wholesale': Target is a Clinic (requires accountManagerId)
 *  - 'admin': Target is a Wholesaler, then optionally a Clinic
 */
export default function BuilderTargetSelector({ mode, selectedTarget, onSelectTarget, currentUserId }) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchTargets = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        let q;
        
        if (mode === 'prescription') {
           // Fetch patients assigned to this doctor
           q = query(usersRef, where('assignedDoctorId', '==', currentUserId));
        } else if (mode === 'wholesale') {
           // Fetch clinics assigned to this wholesaler
           q = query(usersRef, where('assignedAccountManagerId', '==', currentUserId));
        } else if (mode === 'admin') {
           // Admins can select any wholesaler to act on their behalf
           q = query(usersRef, where('role', '==', 'wholesaler'));
        }

        if (q) {
          const snap = await getDocs(q);
          if (active) {
            setTargets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        }
      } catch (err) {
        console.error('Error fetching targets:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (currentUserId) {
      fetchTargets();
    }
    return () => { active = false; };
  }, [mode, currentUserId]);

  if (loading) {
    return <div style={{ padding: '1rem', color: 'var(--color-text-tertiary)' }}>Cargando destinatarios...</div>;
  }

  const handleSelect = (e) => {
    const t = targets.find(x => x.id === e.target.value);
    onSelectTarget(t || null);
  };

  return (
    <div style={{ marginBottom: '1.5rem', background: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {mode === 'prescription' ? <User size={18} /> : <Building size={18} />}
        {mode === 'prescription' ? 'Seleccionar Paciente' : mode === 'wholesale' ? 'Seleccionar Clínica' : 'Seleccionar Mayorista'}
      </h3>
      
      <select 
        value={selectedTarget?.id || ''} 
        onChange={handleSelect}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontFamily: 'inherit',
          fontSize: '0.9rem'
        }}
      >
        <option value="">-- Seleccionar destinatario --</option>
        {targets.map(t => (
          <option key={t.id} value={t.id}>
            {t.firstName || t.name} {t.lastName || ''} {t.email ? `(${t.email})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
