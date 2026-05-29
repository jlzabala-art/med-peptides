import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Mail, Link as LinkIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import AppDataTable from '../ui/AppDataTable';
import StatusBadge from '../ui/StatusBadge';

export default function ManagerInvitationsTab() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Form State
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [inviteeRole, setInviteeRole] = useState('patient');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['managerInvitations', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return [];
      const invRef = collection(db, 'invitations');
      const q = query(invRef, where('createdBy', '==', currentUser.uid));
      const snap = await getDocs(q);
      
      const invList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return invList.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
    },
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 5,
  });

  const createInviteMutation = useMutation({
    mutationFn: async (invData) => {
      const docRef = await addDoc(collection(db, 'invitations'), invData);
      return { id: docRef.id, ...invData, createdAt: new Date() };
    },
    onSuccess: (newInvite) => {
      queryClient.setQueryData(['managerInvitations', currentUser?.uid], (oldData) => {
        return [newInvite, ...(oldData || [])];
      });
      setInviteeName('');
      setInviteeEmail('');
      setInviteeRole('patient');
    },
    onError: (e) => {
      console.error("Error creating invite:", e);
      alert("Failed to create invitation. Please try again.");
    }
  });

  const handleCreateInvite = (e) => {
    e.preventDefault();
    if (!inviteeName || !inviteeRole) return;
    
    createInviteMutation.mutate({
      name: inviteeName,
      email: inviteeEmail || null,
      role: inviteeRole,
      status: 'pending',
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
    });
  };

  const copyLink = (inviteId) => {
    const link = `${window.location.origin}/login?invite=${inviteId}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  const sendEmail = async (invite) => {
    if (!invite.email) {
      alert("No email address provided for this invitation.");
      return;
    }
    
    try {
      const link = `${window.location.origin}/login?invite=${invite.id}`;
      await addDoc(collection(db, 'mail'), {
        to: invite.email,
        message: {
          subject: `You have been invited to Regenpept as a ${invite.role}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Welcome to Regenpept</h2>
              <p>Hello ${invite.name},</p>
              <p>You have been invited by your Account Manager to join the platform as a <b>${invite.role}</b>.</p>
              <p><a href="${link}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Click here to register</a></p>
              <br/>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p>${link}</p>
            </div>
          `
        }
      });
      alert(`Invitation email queued for ${invite.email}`);
    } catch (e) {
      console.error("Failed to send email", e);
      alert("Failed to send email.");
    }
  };

  const columns = [
    {
      header: 'Name / Role',
      key: 'name',
      sortKey: 'name',
      render: (row) => (
        <>
          <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{row.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{row.role}</div>
          {row.email && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{row.email}</div>}
        </>
      )
    },
    {
      header: 'Date',
      key: 'date',
      sortKey: 'createdAt',
      render: (row) => (
        <div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Created: {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'Just now'}</div>
          {row.acceptedAt && (
            <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Accepted: {row.acceptedAt?.toDate ? row.acceptedAt.toDate().toLocaleDateString() : 'Yes'}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      sortKey: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {row.status === 'pending' ? (
            <>
              <button 
                onClick={() => copyLink(row.id)}
                title="Copy Invite Link"
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <LinkIcon size={16} />
              </button>
              
              {row.email && (
                <button 
                  onClick={() => sendEmail(row)}
                  title="Send Email"
                  style={{ background: 'var(--color-success-bg)', border: '1px solid #bbf7d0', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Mail size={16} />
                </button>
              )}
            </>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>No actions</span>
          )}
        </div>
      )
    }
  ];

  const filteredData = invitations.filter(i => {
    const term = searchTerm.toLowerCase();
    return (i.name || '').toLowerCase().includes(term) || (i.email || '').toLowerCase().includes(term);
  });

  return (
    <div style={{ padding: '0 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserPlus size={24} color="var(--primary)" />
          User Invitations
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Invite doctors, patients, and staff. They will be automatically linked to you upon registration.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Create Form */}
        <Card style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="var(--color-primary)" /> Create New Invite
          </h2>
          
          <form onSubmit={handleCreateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>User Role</label>
              <select 
                value={inviteeRole} 
                onChange={(e) => setInviteeRole(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg-app)', outline: 'none' }}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff / Nurse</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Full Name</label>
              <input 
                type="text" 
                required
                placeholder="Dr. John Doe"
                value={inviteeName} 
                onChange={(e) => setInviteeName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Email Address (Optional)</label>
              <input 
                type="email" 
                placeholder="john@example.com"
                value={inviteeEmail} 
                onChange={(e) => setInviteeEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem', display: 'block' }}>Required if you want to send the invite via email automatically.</span>
            </div>

            <button 
              type="submit" 
              disabled={createInviteMutation.isPending}
              style={{ marginTop: '0.5rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-surface)', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: createInviteMutation.isPending ? 'not-allowed' : 'pointer' }}
            >
              {createInviteMutation.isPending ? 'Generating Link...' : 'Generate Invite Link'}
            </button>
          </form>
        </Card>

        {/* History Table */}
        <div style={{ flex: '2 1 500px' }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading invitations…
            </div>
          ) : (
            <AppDataTable 
              data={filteredData}
              columns={columns}
              searchQuery={searchTerm}
              onSearchChange={setSearchTerm}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </div>
      </div>
    </div>
  );
}
