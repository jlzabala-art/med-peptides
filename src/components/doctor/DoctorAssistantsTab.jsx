import Users from "lucide-react/dist/esm/icons/users";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Mail from "lucide-react/dist/esm/icons/mail";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';







import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

export default function DoctorAssistantsTab({ doctorId }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ['assistants', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const q = query(collection(db, 'users'), where('role', '==', 'staff'), where('assignedDoctorIds', 'array-contains', doctorId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!doctorId
  });

  const registerMutation = useMutation({
    mutationFn: async (formData) => {
      const cleanEmail = formData.email.trim().toLowerCase();
      const qExist = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const existSnap = await getDocs(qExist);
      if (!existSnap.empty) {
        const userDoc = existSnap.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: 'staff',
          assignedDoctorIds: arrayUnion(doctorId)
        });
        return { msg: `Assistant linked: ${cleanEmail}` };
      } else {
        await addDoc(collection(db, 'users'), {
          email: cleanEmail,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          role: 'staff',
          assignedDoctorIds: [doctorId],
          approved: true,
          createdAt: new Date().toISOString()
        });
        return { msg: `Assistant registered: ${cleanEmail}` };
      }
    },
    onSuccess: (data) => {
      showToast(data.msg);
      setEmail(''); setFirstName(''); setLastName(''); setPhone('');
      queryClient.invalidateQueries(['assistants', doctorId]);
    },
    onError: (err) => {
      console.error(err);
      showToast('Error registering assistant.', false);
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (assistantId) => {
      await updateDoc(doc(db, 'users', assistantId), {
        assignedDoctorIds: arrayRemove(doctorId)
      });
    },
    onSuccess: () => {
      showToast('Assistant successfully unlinked.');
      queryClient.invalidateQueries(['assistants', doctorId]);
    },
    onError: (err) => {
      console.error(err);
      showToast('Error unlinking assistant.', false);
    }
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      showToast('Please fill out all required fields.', false);
      return;
    }
    registerMutation.mutate({ email, firstName, lastName, phone });
  };

  const handleRemove = (assistantId) => {
    if (!window.confirm('Are you sure you want to unlink this assistant?')) return;
    removeMutation.mutate(assistantId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '1rem 1.5rem', borderRadius: '8px', background: toast.ok ? '#0f172a' : 'var(--color-danger)', color: 'var(--color-bg-surface)', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
          {toast.msg}
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={24} color="var(--primary)" /> Clinical Assistants Team
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Manage your team of assistants. They can coordinate orders but cannot issue prescriptions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Registered Assistants</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, background: '#e0e7ff', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px' }}>{assistants.length} Total</span>
          </div>

          {isLoading ? (
            <Spinner text="Loading assistants..." />
          ) : assistants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--color-bg-app)', borderRadius: '8px', border: '1px dashed #cbd5e1', color: 'var(--color-text-secondary)' }}>
              You have no registered assistants. Use the form on the right to register your team.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assistants.map(ass => (
                <div key={ass.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: 'var(--color-bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                      {(ass.firstName?.[0] || ass.email?.[0] || 'A').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{ass.firstName} {ass.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <Mail size={14} /> {ass.email} {ass.phone && `• 📞 ${ass.phone}`}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemove(ass.id)}
                    disabled={removeMutation.isPending}
                    className="btn"
                    style={{ background: '#fee2e2', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} color="var(--primary)" /> Register Assistant
          </h3>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>First Name *</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g., Maria" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Last Name *</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g., Smith" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g., nursing@clinic.com" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Phone (Optional)</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., +1 555 000 0000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }} />
            </div>

            <button type="submit" disabled={registerMutation.isPending} className="btn" style={{ marginTop: '0.5rem', background: 'var(--primary)', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {registerMutation.isPending ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />}
              Link Assistant
            </button>
          </form>
        </Card>

      </div>
    </div>
  );
}