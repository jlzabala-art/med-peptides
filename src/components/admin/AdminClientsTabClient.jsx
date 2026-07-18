'use client';
import React, { useState, useEffect, useMemo } from 'react';
import userRepository from '../../repositories/userRepository';
import { Users, Edit2, Trash2 } from '@/lib/icons';
import DataTable from '../ui/DataTable';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';

const AdminClientsTabClient = ({ ownerId, ownerType, initialData = [] }) => {
  const [clients, setClients] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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
      render: (val) => <StatusBadge status={val === 'patient' ? 'active' : 'inactive'} />
    },
    {
      key: 'actions',
      header: <span style={{ float: 'right' }}>Acciones</span>,
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="gcp-btn gcp-btn--text" style={{ padding: '4px' }} title="Editar">
            <Edit2 size={16} />
          </button>
          <button className="gcp-btn gcp-btn--text" style={{ padding: '4px', color: '#ef4444' }} title="Eliminar">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ], []);

  // Filter integration
  const activeFilters = [];
  if (roleFilter) {
    activeFilters.push({
      key: 'role',
      label: 'Rol',
      value: roleFilter,
      onRemove: () => setRoleFilter('')
    });
  }

  const filterOptions = [
    {
      key: 'role',
      label: 'Rol',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Paciente', value: 'patient' },
        { label: 'Médico', value: 'physician' }
      ],
      value: roleFilter,
      onChange: setRoleFilter
    }
  ];

  const filteredClients = useMemo(() => {
    let result = clients;
    if (roleFilter) {
      result = result.filter(c => c.role === roleFilter);
    }
    return result;
  }, [clients, roleFilter]);

  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      <PageHeader 
        title="Gestión de Clientes" 
        subtitle="Administra los pacientes y sus datos principales."
        icon={Users}
        actions={
          <button className="gcp-btn gcp-btn--primary">
            Nuevo Cliente
          </button>
        }
      />
      
      <div style={{ marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar clientes por nombre, email o ID..."
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
