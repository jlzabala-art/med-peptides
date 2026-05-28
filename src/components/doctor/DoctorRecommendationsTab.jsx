import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { ClipboardList, Plus, Send, Loader2, BrainCircuit } from 'lucide-react';

export default function DoctorRecommendationsTab({ doctorId, doctorMeta, patients }) {
  const { activePermissions } = useAuth();
  const queryClient = useQueryClient();
  const clinicalLogs = activePermissions?.clinicalLogs ?? true;
  const [selectedPatient, setSelectedPatient] = useState('');
  const [form, setForm] = useState({ title: '', peptides: '', notes: '' });

  const activePatients = patients?.filter(p => p.status === 'active') || [];
  const selPatient = activePatients.find(p => p.id === selectedPatient);
  const selName = selPatient ? [selPatient.firstName, selPatient.lastName].filter(Boolean).join(' ') || selPatient.email : null;

  const { data: recs = [], isLoading: recLoading } = useQuery({
    queryKey: ['recommendations', doctorId, selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return [];
      const q = query(
        collection(db, 'recommendations'),
        where('doctorId', '==', doctorId),
        where('patientId', '==', selectedPatient)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      return list;
    },
    enabled: !!doctorId && !!selectedPatient,
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const peptidesArray = formData.peptides.split(',').map(p => p.trim()).filter(Boolean);
      await addDoc(collection(db, 'recommendations'), {
        doctorId,
        patientId: selectedPatient,
        userId: selectedPatient,
        title: formData.title.trim(),
        peptides: peptidesArray,
        notes: formData.notes.trim(),
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recommendations', doctorId, selectedPatient]);
      setForm({ title: '', peptides: '', notes: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !form.title.trim()) return;
    mutation.mutate(form);
  };

  if (activePatients.length === 0) {
    return (
      <Card>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <ClipboardList size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>No Active Patients</p>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Add patients first in the Patients tab.</p>
        </div>
      </Card>
    );
  }

  const inputStyle = { width: '100%', background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.95rem', color: 'var(--color-text-primary)', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
      <Card>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 1rem' }}>Select Patient</h2>
        <select
          value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}
          style={{ width: '100%', maxWidth: '500px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
        >
          <option value='' disabled>— Select a patient —</option>
          {activePatients.map(p => (
            <option key={p.id} value={p.id}>{[p.firstName, p.lastName].filter(Boolean).join(' ') || p.email}</option>
          ))}
        </select>
      </Card>

      {selectedPatient && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
          <Card>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> New Recommendation for {selName}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input placeholder='Title (e.g. Repair Protocol)' value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={inputStyle} />
              <input placeholder='Peptides (comma separated, e.g. BPC-157, TB-500)' value={form.peptides} onChange={e => setForm(f => ({ ...f, peptides: e.target.value }))} style={inputStyle} />
              
              {clinicalLogs ? (
                <textarea placeholder='Clinical notes / dosage instructions...' value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
              ) : (
                <div style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                  Clinical notes restricted (Requires Clinical Logs permission)
                </div>
              )}
              
              {mutation.isError && <div style={{ color: 'red', fontSize: '0.85rem' }}>{mutation.error.message}</div>}
              {mutation.isSuccess && <div style={{ color: 'green', fontSize: '0.85rem' }}>Recommendation sent successfully!</div>}

              <button type='submit' disabled={mutation.isPending} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: mutation.isPending ? 'not-allowed' : 'pointer', alignSelf: 'flex-end', opacity: mutation.isPending ? 0.7 : 1 }}>
                {mutation.isPending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                {mutation.isPending ? 'Saving...' : 'Send Recommendation'}
              </button>
            </form>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 1.25rem' }}>Recommendation History</h3>
            
            {recLoading ? (
              <Spinner text="Loading recommendations..." />
            ) : recs.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No previous recommendations for this patient.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recs.map(r => (
                  <div key={r.id} style={{ background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>{r.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'Unknown date'}</div>
                      </div>
                      {clinicalLogs && (
                        <button
                          title='Consult Clinic AI'
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                              detail: {
                                message: `Analyze this recommendation for patient ${selName}: "${r.title}". Peptides: ${Array.isArray(r.peptides) ? r.peptides.join(', ') : r.peptides}. Notes: ${r.notes}. Provide clinical insights.`,
                                doctorContext: { doctorName: doctorMeta?.doctorName, specialty: doctorMeta?.specialty, patientName: selName, protocolName: r.title }
                              }
                            }));
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <BrainCircuit size={14} /> AI
                        </button>
                      )}
                    </div>

                    {r.peptides && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {(Array.isArray(r.peptides) ? r.peptides : typeof r.peptides === 'string' ? r.peptides.split(',').map(p => p.trim()).filter(Boolean) : []).map(p => (
                          <span key={p} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '99px', background: '#e0f2fe', color: '#0369a1' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {r.notes && (
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.6, background: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {clinicalLogs ? r.notes : <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>[Notes restricted]</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
