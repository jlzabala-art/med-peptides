import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { Stethoscope, UserPlus, Check, X, Send, Loader2 } from 'lucide-react';

export default function PatientSupervisorTab({ userId }) {
  const queryClient = useQueryClient();
  const [selectedPhysicianId, setSelectedPhysicianId] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all relationships for this patient
  const { data: relationships = [], isLoading: relLoading } = useQuery({
    queryKey: ['doctorPatientRels', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(collection(db, 'doctor_patient_relationships'), where('patientId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!userId,
  });

  // Fetch available doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['availableDoctors'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  // Derived state
  const incomingInvites = relationships.filter(r => r.status === 'pending' && r.initiatedBy === 'doctor');
  const outgoingInvites = relationships.filter(r => r.status === 'pending' && r.initiatedBy === 'patient');
  const activeRel = relationships.find(r => r.status === 'accepted');

  // Fetch supervisor profile if active
  const { data: supervisorProfile, isLoading: supLoading } = useQuery({
    queryKey: ['userProfile', activeRel?.doctorId],
    queryFn: async () => {
      if (!activeRel?.doctorId) return null;
      const snap = await getDocs(query(collection(db, 'users'), where('__name__', '==', activeRel.doctorId)));
      return snap.docs.length ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
    },
    enabled: !!activeRel?.doctorId,
  });

  const requestMutation = useMutation({
    mutationFn: async ({ doctorId, notes }) => {
      const docObj = doctors.find(d => d.id === doctorId);
      const docName = docObj ? (docObj.displayName || `${docObj.firstName || ''} ${docObj.lastName || ''}`.trim()) : 'Doctor';
      
      await addDoc(collection(db, 'doctor_patient_relationships'), {
        patientId: userId,
        doctorId,
        doctorName: docName,
        status: 'pending',
        initiatedBy: 'patient',
        notes,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['doctorPatientRels', userId]);
      setSuccess('Request sent successfully.');
      setError(null);
      setSelectedPhysicianId('');
      setRequestNotes('');
    },
    onError: (err) => setError(err.message)
  });

  const acceptMutation = useMutation({
    mutationFn: async ({ relId, doctorId }) => {
      await updateDoc(doc(db, 'doctor_patient_relationships', relId), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });
      // Also update the user document with the doctor ID
      await updateDoc(doc(db, 'users', userId), {
        assignedPhysicianIds: [doctorId]
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['doctorPatientRels', userId])
  });

  const declineMutation = useMutation({
    mutationFn: async (relId) => {
      await deleteDoc(doc(db, 'doctor_patient_relationships', relId));
    },
    onSuccess: () => queryClient.invalidateQueries(['doctorPatientRels', userId])
  });

  if (relLoading) return <Spinner text="Loading supervisor info..." />;

  const handleRequest = (e) => {
    e.preventDefault();
    if (!selectedPhysicianId) return;
    if (activeRel) {
      setError('You already have an active supervisor.');
      return;
    }
    requestMutation.mutate({ doctorId: selectedPhysicianId, notes: requestNotes });
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '28px',
      padding: 'clamp(2rem, 5vw, 3rem)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'rgba(0,75,135,0.06)', padding: '0.75rem', borderRadius: '16px', color: 'var(--primary)' }}>
          <Stethoscope size={28} strokeWidth={1.2} />
        </div>
        <h2 style={{ fontWeight: 900, color: 'var(--primary)', margin: 0, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>My Supervisor</h2>
      </div>

      {incomingInvites.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem',
          padding: '1.5rem', backgroundColor: 'rgba(124, 111, 247, 0.05)',
          border: '1px solid rgba(124, 111, 247, 0.2)', borderRadius: '20px',
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Incoming Supervisor Invitations ({incomingInvites.length})
          </h3>
          {incomingInvites.map(inv => (
            <div key={inv.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              padding: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{inv.doctorName}</div>
                {inv.notes && <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#555', marginTop: '4px' }}>"{inv.notes}"</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => acceptMutation.mutate({ relId: inv.id, doctorId: inv.doctorId })} className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', gap: '4px' }}>
                  {acceptMutation.isPending ? <Loader2 size={14} className="spin" /> : <Check size={14} />} Accept
                </button>
                <button onClick={() => declineMutation.mutate(inv.id)} className="btn" style={{ background: 'transparent', color: '#e11d48', border: '1px solid #fecdd3', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '4px' }}>
                  <X size={14} /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {outgoingInvites.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem',
          padding: '1.5rem', backgroundColor: 'rgba(0, 75, 135, 0.03)',
          border: '1px solid var(--border)', borderRadius: '20px',
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Sent Supervision Requests ({outgoingInvites.length})
          </h3>
          {outgoingInvites.map(inv => (
            <div key={inv.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              padding: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{inv.doctorName}</div>
              </div>
              <button onClick={() => declineMutation.mutate(inv.id)} className="btn" style={{ background: 'transparent', color: '#e11d48', border: '1px solid #fecdd3', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '4px' }}>
                <X size={14} /> Cancel Request
              </button>
            </div>
          ))}
        </div>
      )}

      {supLoading ? (
        <Spinner text="Loading supervisor profile..." />
      ) : activeRel && supervisorProfile ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.75rem 2rem',
          borderRadius: '20px', background: 'linear-gradient(135deg, rgba(0,75,135,0.04), rgba(0,75,135,0.01))',
          border: '1px solid rgba(0,75,135,0.12)', flexWrap: 'wrap',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #0077cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 900, flexShrink: 0,
          }}>
            {(supervisorProfile.displayName || supervisorProfile.firstName || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
              {supervisorProfile.displayName || [supervisorProfile.firstName, supervisorProfile.lastName].filter(Boolean).join(' ') || 'Dr.'}
            </div>
            {supervisorProfile.specialty && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {supervisorProfile.specialty}
              </div>
            )}
            {supervisorProfile.email && (
              <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>
                {supervisorProfile.email}
              </div>
            )}
          </div>
          <div style={{
            padding: '0.45rem 1rem', borderRadius: '99px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#065f46',
            fontSize: '0.78rem', fontWeight: 800, border: '1.5px solid rgba(16,185,129,0.25)', textTransform: 'uppercase',
          }}>✓ Active</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '2.5rem 0 1.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🩺</div>
            <h3 style={{ fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>No Supervisor Assigned</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto' }}>
              Your supervising physician will appear here once assigned. Request clinical supervision below to link your account.
            </p>
          </div>

          <div style={{ padding: '2rem', backgroundColor: 'rgba(0, 75, 135, 0.02)', border: '1px solid var(--border)', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} /> Request Clinical Supervision
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Search and select a verified physician to request supervision. This allows them to issue peptide protocols.
            </p>

            {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ background: '#dcfce7', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem' }}>{success}</div>}

            <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>SELECT PHYSICIAN</label>
                <select value={selectedPhysicianId} onChange={e => setSelectedPhysicianId(e.target.value)} required style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.88rem' }}>
                  <option value="">— Select a doctor —</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.displayName || [doc.firstName, doc.lastName].filter(Boolean).join(' ') || 'Physician'} {doc.specialty ? `(${doc.specialty})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>MESSAGE / CLINICAL NOTE (optional)</label>
                <textarea value={requestNotes} onChange={e => setRequestNotes(e.target.value)} placeholder="Provide details..." rows={3} style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.88rem', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={requestMutation.isPending || !selectedPhysicianId} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!selectedPhysicianId || requestMutation.isPending) ? 0.6 : 1 }}>
                  {requestMutation.isPending ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                  {requestMutation.isPending ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
