"use client";
/**
 * ClientsTab.jsx
 *
 * Gestión de clientes atribuidos a un tenant (wholesaler/franquicia) sobre DataModule.
 * Sin imports directos de firebase/firestore — usa useClientsQuery y useWholesalerOrdersQuery.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClientsQuery, useWholesalerOrdersQuery } from '@/hooks/data/useWholesalerQuery';
import DataModule from '../ui/DataModule';
import MetricCard from '../ui/MetricCard';
import CopyableId from '../ui/CopyableId';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { Users, ShoppingBag, Calendar, Mail, CheckCircle, Clock } from '@/lib/icons';

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

const orderColumns = [
  {
    key: 'orderId',
    header: 'ID Pedido',
    width: '18%',
    render: (row) => (
      <CopyableId value={row.orderId || row.id} displayValue={row.orderId || row.id?.slice(0, 8)} />
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

export default function ClientsTab() {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId;
  const [activeSubTab, setActiveSubTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: clientsData = [], isLoading: clientsLoading } = useClientsQuery(tenantId);
  const { data: ordersData = [], isLoading: ordersLoading } = useWholesalerOrdersQuery(tenantId);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clientsData;
    const q = searchQuery.toLowerCase();
    return clientsData.filter((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.institution || '').toLowerCase().includes(q)
    );
  }, [clientsData, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return ordersData;
    const q = searchQuery.toLowerCase();
    return ordersData.filter((o) =>
      String(o.orderId || o.id || '').toLowerCase().includes(q) ||
      (o.customer?.fullName || '').toLowerCase().includes(q) ||
      (o.customer?.email || '').toLowerCase().includes(q)
    );
  }, [ordersData, searchQuery]);

  const kpiStats = useMemo(() => {
    const activeClients = clientsData.filter((c) => c.approved).length;
    const pendingClients = clientsData.length - activeClients;
    return {
      totalClients: clientsData.length,
      activeClients,
      pendingClients,
      totalOrders: ordersData.length,
    };
  }, [clientsData, ordersData]);

  if (!tenantId) {
    return (
      <EmptyState
        icon={Users}
        title="Sin Tenant Asignado"
        subtitle="Contacta con soporte de Atlas Health para vincular tu cuenta a una franquicia."
      />
    );
  }

  const isClientsView = activeSubTab === 'clients';

  return (
    <DataModule
      title="Client Management"
      subtitle="Clinics, patients and billed orders attributed to your franchise."
      icon={Users}
      panel="wholesaler"
      namespace={`wholesaler_${activeSubTab}`}
      viewSelector={
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '8px', padding: '0.2rem', border: '1px solid #e2e8f0' }}>
          {[
            { id: 'clients', label: `Clients (${clientsData.length})` },
            { id: 'orders', label: `Orders (${ordersData.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id);
                setSearchQuery('');
              }}
              style={{
                padding: '0.4rem 0.9rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeSubTab === tab.id ? '#ffffff' : 'transparent',
                color: activeSubTab === tab.id ? '#0f172a' : '#64748b',
                boxShadow: activeSubTab === tab.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
      searchPlaceholder={
        isClientsView
          ? 'Search by name, email or institution...'
          : 'Search by order ID, client name or email...'
      }
      searchTerm={searchQuery}
      onSearchChange={setSearchQuery}
      resultCount={isClientsView ? filteredClients.length : filteredOrders.length}
      totalCount={isClientsView ? clientsData.length : ordersData.length}
      onClearAllFilters={() => setSearchQuery('')}
      kpis={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <MetricCard
            title="Total Clients"
            value={kpiStats.totalClients}
            subtitle="Registered under franchise"
            icon={Users}
            color="#2563eb"
          />
          <MetricCard
            title="Approved Clients"
            value={kpiStats.activeClients}
            subtitle="Active accounts"
            icon={CheckCircle}
            color="#16a34a"
          />
          <MetricCard
            title="Pending Approval"
            value={kpiStats.pendingClients}
            subtitle="Awaiting verification"
            icon={Clock}
            color="#d97706"
          />
          <MetricCard
            title="Billed Orders"
            value={kpiStats.totalOrders}
            subtitle="Attributed franchise orders"
            icon={ShoppingBag}
            color="#0f172a"
          />
        </div>
      }
      data={isClientsView ? filteredClients : filteredOrders}
      columns={isClientsView ? clientColumns : orderColumns}
      loading={isClientsView ? clientsLoading : ordersLoading}
      emptyState={
        isClientsView
          ? {
              icon: Users,
              title: 'No registered clients',
              subtitle: searchQuery
                ? 'No results match your search.'
                : 'Clinics and patients under your franchise will appear here.',
            }
          : {
              icon: ShoppingBag,
              title: 'No billed orders yet',
              subtitle: 'Orders from your clients will appear here once processed.',
            }
      }
    />
  );
}
