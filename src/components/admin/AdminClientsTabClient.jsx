'use client';
import React, { useState, useEffect, useMemo } from 'react';
import userRepository from '../../repositories/userRepository';
import { Users, Edit2, Trash2 } from '@/lib/icons';
import DataTable from '../ui/DataTable';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import StatusChip from '../ui/StatusChip';
import CopyableId from '../ui/CopyableId';
import AppActionGroup from '../ui/AppActionGroup';

const AdminClientsTabClient = ({ ownerId, ownerType, initialData = [] }) => {
  const [clients, setClients] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState([]); // string[]

  useEffect(() => {
    if (initialData.length > 0) return; // skip fetch if SSR data provided
    async function fetchClients() {
      try {
        const data = await userRepository.getUsersByRole('patient', 100);
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      render: (val, row) => <CopyableId value={row.id} />
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (val, row) => <span style={{ fontWeight: 500 }}>{row.firstName} {row.lastName}</span>
    },
    {
      key: 'email',
      header: 'Email',
      render: (val) => <span style={{ color: '#64748b' }}>{val}</span>
    },
    {
      key: 'role',
      header: 'Rol',
      render: (val) => <StatusChip status={val === 'patient' ? 'active' : 'inactive'} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
          <AppActionGroup actions={[
            { type: 'edit', onClick: () => {} },
            { type: 'delete', onClick: () => {} }
          ]} />
        </div>
      )
    }
  ], []);

  const ALL_ROLES = [
    { label: 'Paciente', value: 'patient' },
    { label: 'Médico',   value: 'physician' },
  ];

  const activeFilters = roleFilter.map(val => ({
    key: `role-${val}`,
    label: 'Rol',
    value: ALL_ROLES.find(r => r.value === val)?.label || val,
    onRemove: () => setRoleFilter(prev => prev.filter(v => v !== val))
  }));

  const filterOptions = [
    {
      key: 'role',
      label: 'Rol',
      multiSelect: true,
      values: roleFilter,
      options: ALL_ROLES.map(r => ({
        ...r,
        count: clients.filter(c => c.role === r.value).length || null,
      })),
      onChange: setRoleFilter
    }
  ];

  const filteredClients = useMemo(() => {
    if (roleFilter.length === 0) return clients;
    return clients.filter(c => roleFilter.includes(c.role));
  }, [clients, roleFilter]);

  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      <PageHeader 
        title="Clients Management" 
        subtitle="Manage patient accounts and master client records."
        icon={Users}
        actions={
          <button className="gcp-btn gcp-btn--primary">
            New Client
          </button>
        }
      />
      
      <div style={{ marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search clients by name, email or ID..."
          resultCount={filteredClients.length}
          namespace="admin-clients"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      {loading ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="gcp-table-container">
          <DataTable
            columns={columns}
            data={filteredClients}
            keyField={(row) => row.id}
            emptyMessage="No hay clientes disponibles."
            globalSearch={true}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
};

export default AdminClientsTabClient;
