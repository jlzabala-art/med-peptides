import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { FlaskConical, Calendar, BrainCircuit } from 'lucide-react';

export default function DoctorProtocolsTab({ doctorId, doctorMeta, patients }) {
  const { activePermissions } = useAuth();
  const clinicalLogs = activePermissions?.clinicalLogs ?? true;
  const [selectedPatient, setSelectedPatient] = useState('');

  const { data: recs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['protocols', doctorId, selectedPatient],
    queryFn: async () => {
      let q;
      if (selectedPatient) {
        q = query(collection(db, 'recommendations'), where('doctorId', '==', doctorId), where('patientId', '==', selectedPatient));
      } else {
        q = query(collection(db, 'recommendations'), where('doctorId', '==', doctorId));
      }
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      return list;
    },
    enabled: !!doctorId,
  });

  const patientName = (id) => {
    const p = patients?.find(p => p.id === id);
    if (!p) return id;
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email;
  };

  const activePatients = patients || [];

  if (activePatients.length === 0) {
    return (
      <Card>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <FlaskConical size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>No protocols found</p>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Recommendations you send will appear as protocols here.</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Protocol Filter</h2>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: '#e0e7ff', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>
            {recs.length} protocol{recs.length !== 1 ? 's' : ''} {selectedPatient ? ` for ${patientName(selectedPatient)}` : ' in total'}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={selectedPatient}
            onChange={e => setSelectedPatient(e.target.value)}
            style={{ width: '100%', maxWidth: '500px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
          >
            <option value=''>— All Patients —</option>
            {activePatients.map(p => (
              <option key={p.id} value={p.id}>{patientName(p.id)}</option>
            ))}
          </select>
          <button onClick={() => refetch()} className="btn" style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </Card>

      {isLoading ? (
        <Spinner text="Loading protocols..." />
      ) : isError ? (
        <div style={{ color: 'red', padding: '1rem' }}>Failed to load protocols.</div>
      ) : recs.length === 0 ? (
        <Card>
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <FlaskConical size={36} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No protocols found for this filter.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {recs.map(r => {
            const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '';
            const pName = patientName(r.patientId);
            return (
              <Card key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{r.title}</div>
                    {!selectedPatient && (
                      <span style={{ display: 'inline-block', marginTop: '0.4rem', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: 'var(--color-text-secondary)' }}>
                        {pName}
                      </span>
                    )}
                  </div>
                  {clinicalLogs && (
                    <button
                      title='Consult Clinic AI'
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                          detail: {
                            message: `Review this peptide protocol for patient ${pName}: "${r.title}". Peptides involved: ${r.peptides}. Clinical notes: ${r.notes}. What are the safety precautions and interactions?`,
                            doctorContext: { doctorName: doctorMeta?.doctorName, specialty: doctorMeta?.specialty, patientName: pName, protocolName: r.title }
                          }
                        }));
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', color: 'var(--primary)', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <BrainCircuit size={14} /> AI
                    </button>
                  )}
                </div>

                {r.peptides && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {(typeof r.peptides === 'string' ? r.peptides.split(',') : Array.isArray(r.peptides) ? r.peptides : []).map(p => p.trim()).filter(Boolean).map(p => (
                      <span key={p} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: '20px', background: '#e0e7ff', color: 'var(--primary)' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {r.notes && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, background: 'var(--color-bg-app)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {clinicalLogs ? r.notes : <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>[Restricted notes]</span>}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {date && <><Calendar size={14} style={{ marginRight: '6px' }} /> {date}</>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
