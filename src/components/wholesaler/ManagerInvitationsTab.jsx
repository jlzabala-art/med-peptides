"use client";
/**
 * ManagerInvitationsTab.jsx
 *
 * Gestión de invitaciones de clientes por un account manager (estandarizado con DataModule).
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInvitationsQuery } from '@/hooks/data/useWholesalerQuery';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import DataModule from '../ui/DataModule';
import MetricCard from '../ui/MetricCard';
import StatusBadge from '../ui/StatusBadge';
import { UserPlus, Mail, LinkIcon, CheckCircle2, Clock, Users, X } from '@/lib/icons';
import { toast } from 'react-hot-toast';

export default function ManagerInvitationsTab() {
  const { currentUser } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [inviteeRole, setInviteeRole] = useState('patient');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    invitations,
    isLoading,
    createInvitation,
    isCreating,
  } = useInvitationsQuery(currentUser?.uid);

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    if (!inviteeName || !inviteeRole) return;
    await createInvitation({
      name: inviteeName,
      email: inviteeEmail || null,
      role: inviteeRole,
    });
    setInviteeName('');
    setInviteeEmail('');
    setInviteeRole('patient');
    setShowCreateForm(false);
  };

  const copyLink = (inviteId) => {
    const link = `${window.location.origin}/login?invite=${inviteId}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace de invitación copiado');
  };

  const columns = [
    {
      header: 'Nombre / Rol',
      key: 'name',
      width: '30%',
      render: (row) => (
        <>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{row.role}</div>
          {row.email && <div style={{ fontSize: '0.73rem', color: 'var(--color-text-tertiary)' }}>{row.email}</div>}
        </>
      ),
    },
    {
      header: 'Fecha',
      key: 'createdAt',
      width: '25%',
      render: (row) => (
        <div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString('es-ES') : 'Ahora'}
          </div>
          {row.acceptedAt && (
            <div style={{ color: 'var(--color-success)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
              Aceptado: {row.acceptedAt?.toDate ? row.acceptedAt.toDate().toLocaleDateString('es-ES') : 'Sí'}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Estado',
      key: 'status',
      width: '20%',
      render: (row) => <StatusBadge status={row.status || 'pending'} />,
    },
    {
      header: 'Acciones',
      key: 'actions',
      width: '25%',
      align: 'right',
      render: (row) => (
        row.status === 'pending' ? (
          <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => copyLink(row.id)}
              title="Copiar enlace de invitación"
              style={{
                minHeight: '36px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.7rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <LinkIcon size={14} /> Copiar link
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>Sin acciones</span>
        )
      ),
    },
  ];

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return invitations.filter((i) => {
      if (statusFilter !== 'all' && (i.status || 'pending') !== statusFilter) return false;
      if (!term) return true;
      return (i.name || '').toLowerCase().includes(term) || (i.email || '').toLowerCase().includes(term);
    });
  }, [invitations, searchTerm, statusFilter]);

  const kpiStats = useMemo(() => {
    const total = invitations.length;
    const pending = invitations.filter((i) => (i.status || 'pending') === 'pending').length;
    const accepted = invitations.filter((i) => i.status === 'accepted' || i.status === 'active').length;
    const doctors = invitations.filter((i) => i.role === 'doctor').length;
    return { total, pending, accepted, doctors };
  }, [invitations]);

  const activeFilters = statusFilter !== 'all'
    ? [{ id: 'status', label: `Estado: ${statusFilter}`, onRemove: () => setStatusFilter('all') }]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {showCreateForm && (
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} color="var(--color-primary)" /> Nueva Invitación
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              aria-label="Cerrar formulario"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreateInvite} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>
                Rol del Usuario
              </label>
              <select
                value={inviteeRole}
                onChange={(e) => setInviteeRole(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--color-bg-app)', outline: 'none' }}
              >
                <option value="patient">Paciente</option>
                <option value="doctor">Médico</option>
                <option value="staff">Staff / Enfermería</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Juan García"
                value={inviteeName}
                onChange={(e) => setInviteeName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>
                Email (Opcional)
              </label>
              <input
                type="email"
                placeholder="juan@clinica.com"
                value={inviteeEmail}
                onChange={(e) => setInviteeEmail(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              style={{
                minHeight: '42px',
                backgroundColor: isCreating ? 'var(--border)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: isCreating ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isCreating ? <><Spinner size={14} /> Generando...</> : 'Generar Enlace'}
            </button>
          </form>
        </Card>
      )}

      <DataModule
        title="Invitaciones de Usuario"
        subtitle="Invita a médicos, pacientes y personal vinculados automáticamente a tu cuenta."
        icon={UserPlus}
        panel="wholesaler"
        namespace="manager_invitations"
        primaryAction={{
          label: showCreateForm ? 'Cerrar Formulario' : 'Nueva Invitación',
          icon: showCreateForm ? X : UserPlus,
          onClick: () => setShowCreateForm((v) => !v),
        }}
        searchPlaceholder="Buscar por nombre o email…"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={filteredData.length}
        totalCount={invitations.length}
        filterOptions={[
          {
            id: 'status',
            label: 'Estado',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'Todos' },
              { value: 'pending', label: 'Pendiente' },
              { value: 'accepted', label: 'Aceptado' },
            ],
          },
        ]}
        filters={activeFilters}
        onClearAllFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
        }}
        kpis={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <MetricCard title="Total Invitations" value={kpiStats.total} subtitle="All generated links" icon={UserPlus} color="#2563eb" />
            <MetricCard title="Pending" value={kpiStats.pending} subtitle="Awaiting registration" icon={Clock} color="#d97706" />
            <MetricCard title="Accepted" value={kpiStats.accepted} subtitle="Linked accounts" icon={CheckCircle2} color="#16a34a" />
            <MetricCard title="Physicians Invited" value={kpiStats.doctors} subtitle="Medical partners" icon={Users} color="#0f172a" />
          </div>
        }
        data={filteredData}
        columns={columns}
        loading={isLoading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyState={{
          icon: Mail,
          title: 'Sin invitaciones',
          subtitle: searchTerm
            ? 'No hay resultados para esta búsqueda.'
            : 'Crea tu primera invitación usando el botón "Nueva Invitación".',
        }}
      />
    </div>
  );
}
