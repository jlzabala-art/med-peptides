import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';

export default function ManagerClientsTab() {
  const { currentUser } = useAuth();

  const { data: clients = [], isLoading, isError } = useQuery({
    queryKey: ['managerClients', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return [];
      const usersRef = collection(db, 'users');
      const qUsers = query(usersRef, where('assignedAccountManagerId', '==', currentUser.uid));
      const usersSnap = await getDocs(qUsers);
      
      return usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return <Spinner text="Loading clients..." />;
  }

  if (isError) {
    return <div style={{ padding: '2rem', color: 'red' }}>Failed to load clients.</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>My Clients</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Manage the doctors and patients assigned to your portfolio.</p>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-border)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
          Total: {clients.length}
        </div>
      </div>

      {clients.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <User size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>No Clients Assigned</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            You do not currently have any doctors or patients assigned to your account.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {clients.map(client => (
            <Card key={client.id} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: client.role === 'doctor' ? '#dbeafe' : '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color={client.role === 'doctor' ? 'var(--color-primary)' : '#9333ea'} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>{client.firstName ? `${client.firstName} ${client.lastName}` : (client.displayName || client.name || 'Unnamed Client')}</div>
                  <div style={{ fontSize: '0.8rem', color: client.role === 'doctor' ? 'var(--color-primary)' : '#9333ea', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.25rem' }}>
                    {client.role || 'Patient'}
                  </div>
                </div>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} color="var(--color-text-tertiary)" /> {client.email || 'No email provided'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} color="var(--color-text-tertiary)" /> {client.phone || 'No phone provided'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--color-text-tertiary)" /> {client.createdAt ? `Joined ${new Date(client.createdAt).toLocaleDateString()}` : 'Unknown'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
