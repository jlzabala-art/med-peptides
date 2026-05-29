import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AppDataTable from '../ui/AppDataTable';

export default function ManagerClientsTab() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

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

  const columns = [
    {
      key: 'client',
      header: 'Client Details',
      sortKey: 'lastName',
      render: (row) => {
        const name = row.firstName ? `${row.firstName} ${row.lastName}` : (row.displayName || row.name || 'Unnamed Client');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '36px', height: '36px', 
              backgroundColor: row.role === 'doctor' ? '#e0f2fe' : '#f3e8ff', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <UserCheck size={18} color={row.role === 'doctor' ? '#0284c7' : '#9333ea'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{name}</span>
              <span style={{ fontSize: '0.75rem', color: row.role === 'doctor' ? '#0284c7' : '#9333ea', textTransform: 'uppercase', fontWeight: 700 }}>
                {row.role || 'Patient'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} /> {row.email || '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} /> {row.phone || '—'}
          </div>
        </div>
      )
    },
    {
      key: 'joined',
      header: 'Joined Date',
      sortKey: 'createdAt',
      width: '120px',
      render: (row) => {
        const date = row.createdAt?.toDate ? row.createdAt.toDate() : (row.createdAt ? new Date(row.createdAt) : null);
        return (
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {date ? date.toLocaleDateString() : '—'}
          </div>
        );
      }
    }
  ];

  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    const name = (c.firstName ? `${c.firstName} ${c.lastName}` : (c.displayName || c.name || '')).toLowerCase();
    return name.includes(term) || (c.email || '').toLowerCase().includes(term);
  });

  return (
    <div style={{ padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} color="var(--primary)" />
            My Clients
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Manage the doctors and patients assigned to your portfolio.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading clients…
        </div>
      ) : isError ? (
        <div style={{ padding: '2rem', color: 'red' }}>Failed to load clients.</div>
      ) : (
        <AppDataTable 
          data={filteredClients}
          columns={columns}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </div>
  );
}
