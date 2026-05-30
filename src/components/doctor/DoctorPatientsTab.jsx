import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { invitePatientByEmail } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import Spinner from '../ui/Spinner';
import { Users, UserPlus, Check, X, BrainCircuit, Activity, FileText, Loader2 } from 'lucide-react';

export default function DoctorPatientsTab({ doctorId, doctorMeta, onCountResolved, onPatientsLoaded }) {
  const { activePermissions } = useAuth();
  const queryClient = useQueryClient();
  const clinicalLogs = activePermissions?.clinicalLogs ?? true;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Inline notes editing states
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotesText, setTempNotesText] = useState('');

  const { data: patients = [], isLoading, refetch } = useQuery({
    queryKey: ['doctorPatients', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const relQ = query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', doctorId));
      const relSnap = await getDocs(relQ);
      
      const results = await Promise.all(
        relSnap.docs.map(async (relDoc) => {
          const rel = relDoc.data();
          if (rel.status === 'revoked' || rel.status === 'rejected') return null;
          const patientId = rel.patientId;
          let profile = {};
          
          if (!rel.patientName && patientId) {
            try {
              const fetchPromise = getDoc(doc(db, 'users', patientId));
              const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000));
              const userSnap = await Promise.race([fetchPromise, timeoutPromise]);
              if (userSnap.exists()) profile = userSnap.data();
            } catch (e) {
              console.error('Error fetching user doc:', e);
            }
          }

          const fallbackFullName = rel.patientName || '';
          const parts = fallbackFullName.split(' ');
          const fallbackFirstName = parts[0] || '';
          const fallbackLastName = parts.slice(1).join(' ') || '';

          return {
            id: patientId || relDoc.id,
            relId: relDoc.id,
            status: rel.status ?? 'active',
            assignedAt: rel.assignedAt ?? rel.createdAt ?? null,
            firstName: profile.firstName || fallbackFirstName || '',
            lastName: profile.lastName || fallbackLastName || '',
            email: profile.email || rel.patientEmail || '',
            goals: profile.goals || [],
            initiatedByRole: rel.initiatedByRole || 'doctor',
            notes: rel.notes || '',
          };
        })
      );
      
      const validResults = results.filter(Boolean);
      return validResults;
    },
    enabled: !!doctorId
  });

  // Notify parent components when patients change
  useEffect(() => {
    if (patients) {
      onPatientsLoaded?.(patients);
      onCountResolved?.(patients.length);
    }
  }, [patients, onPatientsLoaded, onCountResolved]);

  const updateRelMutation = useMutation({
    mutationFn: async ({ relId, updates }) => {
      const relRef = doc(db, 'doctor_patient_relationships', relId);
      await updateDoc(relRef, { ...updates, updatedAt: new Date().toISOString() });
    },
    onSuccess: () => queryClient.invalidateQueries(['doctorPatients', doctorId])
  });

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError('');
    try {
      await invitePatientByEmail(doctorId, inviteEmail, inviteNotes);
      setInviteSuccess(true);
      queryClient.invalidateQueries(['doctorPatients', doctorId]);
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteNotes('');
        setInviteSuccess(false);
      }, 2000);
    } catch (err) {
      setInviteError(err.message || 'Error sending invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSaveNotes = (relId) => {
    updateRelMutation.mutate({ relId, updates: { notes: tempNotesText } });
    setEditingNotesId(null);
  };

  const triggerBulkAI = () => {
    if (selectedIds.length === 0) return;
    const names = patients.filter(p => selectedIds.includes(p.id)).map(p => `${p.firstName} ${p.lastName}`.trim()).join(', ');
    window.dispatchEvent(new CustomEvent('open-clinical-ai', {
      detail: { 
        message: `I want to perform a batch review on the following patients: ${names}. Provide a high-level treatment overview and summary recommendations for this group.`,
        doctorContext: { doctorName: doctorMeta?.doctorName, specialty: doctorMeta?.specialty }
      }
    }));
  };

  const filteredPatients = patients.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      return fullName.includes(q) || (p.email || '').toLowerCase().includes(q) || (p.goals || []).some(g => g.toLowerCase().includes(q));
    }
    return true;
  });

  const columns = [
    {
      header: 'Patient',
      key: 'patient',
      render: (p) => {
        const fullName = `${p.firstName} ${p.lastName}`.trim() || p.email || 'Unnamed patient';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: p.status === 'active' ? '#e0f2fe' : '#fef3c7', color: p.status === 'active' ? '#0284c7' : 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{fullName}</div>
              {p.goals?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '4px' }}>
                  {p.goals.slice(0, 2).map(g => <span key={g} style={{ fontSize: '0.7rem', background: '#f1f5f9', color: 'var(--color-text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{g}</span>)}
                  {p.goals.length > 2 && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>+{p.goals.length - 2}</span>}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (p) => <StatusBadge status={p.status} />
    },
    {
      header: 'Contact (Email)',
      key: 'email',
      render: (p) => p.email ? <a href={`mailto:${p.email}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>{p.email}</a> : '—'
    },
    {
      header: 'Assignment Date',
      key: 'assignedAt',
      render: (p) => p.assignedAt ? new Date(p.assignedAt).toLocaleDateString() : '—'
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (p) => {
        const fullName = `${p.firstName} ${p.lastName}`.trim() || p.email || 'Paciente';
        return (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {p.status === 'active' && clinicalLogs && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                    detail: { message: `I am reviewing patient ${fullName}. What should I consider for their next consultation?`, doctorContext: { doctorName: doctorMeta?.doctorName, specialty: doctorMeta?.specialty, patientName: fullName, patientGoals: p.goals } }
                  }));
                }}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', color: 'var(--primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                <BrainCircuit size={14} /> AI Review
              </button>
            )}
            {p.status === 'pending' && p.initiatedByRole === 'patient' && (
              <>
                <button onClick={() => updateRelMutation.mutate({ relId: p.relId, updates: { status: 'active', assignedAt: new Date().toISOString() } })} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  <Check size={14} /> Accept
                </button>
                <button onClick={() => updateRelMutation.mutate({ relId: p.relId, updates: { status: 'revoked' } })} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', color: 'var(--color-danger)', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  <X size={14} /> Decline
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const renderExpandable = (p) => {
    const fullName = `${p.firstName} ${p.lastName}`.trim() || p.email;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
            <Activity size={16} color="var(--primary)" /> Goals and Health Profile
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>Declared Goals</div>
          {p.goals?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {p.goals.map(g => <span key={g} style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--color-text-primary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 500 }}>{g}</span>)}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>No health goal selected.</div>
          )}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <Link to={`/doctor/prescriptions?search=${encodeURIComponent(fullName)}`} style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              View prescription history →
            </Link>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
            <FileText size={16} color="var(--primary)" /> Medical Supervisor Notes
          </div>
          {editingNotesId === p.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea value={tempNotesText} onChange={e => setTempNotesText(e.target.value)} placeholder="Enter treatment notes..." rows={4} style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--primary)', outline: 'none', resize: 'vertical' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setEditingNotesId(null)} disabled={updateRelMutation.isPending} className="btn" style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: 'none', color: 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleSaveNotes(p.relId)} disabled={updateRelMutation.isPending} className="btn" style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {updateRelMutation.isPending && <Loader2 size={12} className="spin" />} Save Notes
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.9rem', color: p.notes ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontStyle: p.notes ? 'normal' : 'italic', whiteSpace: 'pre-wrap', background: 'var(--color-bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {p.notes || "No clinical notes added yet."}
              </div>
              <button onClick={() => { setTempNotesText(p.notes || ''); setEditingNotesId(p.id); }} className="btn" style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                {p.notes ? 'Edit Notes' : 'Add Notes'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} color="var(--primary)" /> Supervised Patients
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', margin: 0 }}>{patients.length} Total assigned patients · Manage relationships and therapeutic protocols</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          <UserPlus size={16} /> Invite Patient
        </button>
      </div>

      <Card noPadding>

        {isLoading ? (
          <Spinner text="Loading supervised patients..." />
        ) : filteredPatients.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Users size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>No patients found.</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredPatients} 
            expandableRender={renderExpandable}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            renderCustomFilters={() => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[ { key: 'all', label: `All (${patients.length})` }, { key: 'active', label: 'Assigned' }, { key: 'pending', label: 'Pending' } ].map(f => (
                  <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: statusFilter === f.key ? '#e0e7ff' : 'transparent', color: statusFilter === f.key ? 'var(--primary)' : 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            filters={statusFilter !== 'all' ? [{ label: 'Status', value: statusFilter, type: 'status' }] : []}
            onFilterRemove={() => setStatusFilter('all')}
          />
        )}
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={20} color="var(--primary)" /> Invite New Patient</h3>
            {inviteError && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{inviteError}</div>}
            {inviteSuccess && <div style={{ background: '#dcfce7', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>Invitation sent successfully!</div>}
            
            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Patient Email Address</label>
                <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="patient@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Clinical Notes (Optional)</label>
                <textarea value={inviteNotes} onChange={e => setInviteNotes(e.target.value)} placeholder="Add a note to their profile..." rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn" style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', background: '#f1f5f9', color: 'var(--color-text-secondary)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={inviteLoading} className="btn" style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {inviteLoading && <Loader2 size={16} className="spin" />} Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
