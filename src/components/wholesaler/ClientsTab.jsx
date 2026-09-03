"use client";
/**
 * ClientsTab.jsx
 *
 * Gestión de clientes atribuidos a un tenant (wholesaler/franquicia).
 * Sin imports directos de firebase/firestore — usa useClientsQuery y useWholesalerOrdersQuery.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClientsQuery, useWholesalerOrdersQuery } from '@/hooks/data/useWholesalerQuery';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { Users, ShoppingBag, Calendar, Mail, CheckCircle, Clock } from '@/lib/icons';

// ─── Columnas de Clientes ────────────────────────────────────────────────────
const clientColumns = [
  {
    key: 'name',
    header: 'Nombre',
    width: '25%',
    render: (row) => (
      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {row.firstName} {row.lastName}
      </span>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    width: '30%',
    render: (row) => (
      <a href={`mailto:${row.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        <Mail size={13} /> {row.email}
      </a>
    ),
  },
  {
    key: 'institution',
    header: 'Institución',
    width: '20%',
    render: (row) => row.institution || '—',
  },
  {
    key: 'role',
    header: 'Rol',
    width: '12%',
    render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.role || 'guest'}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    width: '13%',
    render: (row) => <StatusBadge status={row.approved ? 'active' : 'pending'} />,
  },
];

// ─── Columnas de Pedidos ─────────────────────────────────────────────────────
const orderColumns = [
  {
    key: 'orderId',
    header: 'ID Pedido',
    width: '18%',
    render: (row) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.8rem' }}>
        {row.orderId || row.id?.slice(0, 8)}
      </span>
    ),
  },
  {
    key: 'customer',
    header: 'Cliente',
    width: '28%',
    render: (row) => (
      <div>
        <div style={{ fontWeight: 600 }}>{row.customer?.fullName || '—'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{row.customer?.email}</div>
      </div>
    ),
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    width: '18%',
    render: (row) => {
      const date = row.createdAt?.seconds
        ? new Date(row.createdAt.seconds * 1000).toLocaleDateString('es-ES')
        : row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-ES') : '—';
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          <Calendar size={13} /> {date}
        </span>
      );
    },
  },
  {
    key: 'total',
    header: 'Total',
    width: '16%',
    render: (row) => (
      <span style={{ fontWeight: 700 }}>{row.totalDisplay || `$${(row.total ?? 0).toFixed(2)}`}</span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    width: '20%',
    render: (row) => <StatusBadge status={row.status || 'pending'} />,
  },
];

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ClientsTab() {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId;
  const [activeSubTab, setActiveSubTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: clientsData = [],
    isLoading: clientsLoading,
  } = useClientsQuery(tenantId);

  const {
    data: ordersData = [],
    isLoading: ordersLoading,
  } = useWholesalerOrdersQuery(tenantId);

  // Filtro local por búsqueda
  const filteredClients = (clientsData).filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.institution || '').toLowerCase().includes(q)
    );
  });

  if (!tenantId) {
    return (
      <EmptyState
        icon={Users}
        title="Sin Tenant Asignado"
        subtitle="Contacta con soporte de Atlas Health para vincular tu cuenta a una franquicia."
      />
    );
  }

  const tabs = [
    { id: 'clients', label: `Clínicas y Pacientes (${clientsData.length})` },
    { id: 'orders', label: `Pedidos Facturados (${ordersData.length})` },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: '8px' }}>
            <Users size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Gestión de Clientes</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
              Clínicas y pacientes bajo tu franquicia, y sus pedidos.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', background: 'var(--border)', borderRadius: '8px', padding: '0.25rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeSubTab === tab.id ? 'var(--color-bg-surface)' : 'transparent',
                color: activeSubTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: activeSubTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {activeSubTab === 'clients' ? (
        <DataTable
          columns={clientColumns}
          data={filteredClients}
          loading={clientsLoading}
          globalSearch={true}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Buscar por nombre, email o institución…"
          emptyState={
            <EmptyState
              icon={Users}
              title="Sin clientes registrados"
              subtitle={searchQuery ? 'No hay resultados para esta búsqueda. Intenta con otro término.' : 'Aún no hay clínicas ni pacientes bajo tu franquicia.'}
              action={searchQuery ? { label: 'Limpiar búsqueda', onClick: () => setSearchQuery('') } : undefined}
            />
          }
        />
      ) : (
        <DataTable
          columns={orderColumns}
          data={ordersData}
          loading={ordersLoading}
          globalSearch={false}
          emptyState={
            <EmptyState
              icon={ShoppingBag}
              title="Sin pedidos registrados"
              subtitle="Los pedidos de tus clientes aparecerán aquí una vez que sean procesados."
            />
          }
        />
      )}
    </div>
  );
}
