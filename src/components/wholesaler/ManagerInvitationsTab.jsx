"use client";
/**
 * ManagerInvitationsTab.jsx
 *
 * Gestión de invitaciones de clientes por un account manager.
 * Sin imports directos de firebase/firestore — usa useInvitationsQuery del repositorio.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInvitationsQuery } from '@/hooks/data/useWholesalerQuery';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import { StatusChip } from '../ui';
import { UserPlus, Mail, LinkIcon } from '@/lib/icons';
import { toast } from 'react-hot-toast';

export default function ManagerInvitationsTab() {
  const { currentUser } = useAuth();

  // Form state
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [inviteeRole, setInviteeRole] = useState('patient');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // React Query hook — sin inline queryFn ni imports de Firestore
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
  };

  const copyLink = (inviteId) => {
    const link = `${window.location.origin}/login?invite=${inviteId}`;
    navigator.clipboard.writeText(link);
    toast('¡Enlace de invitación copiado!');
  };

  // Columns definition
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
      render: (row) => <StatusChip status={row.status} />,
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
              onClick={() => copyLink(row.id)}
              title="Copiar enlace de invitación"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
            >
              <LinkIcon size={15} />
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>Sin acciones</span>
        )
      ),
    },
  ];

  const filteredData = invitations.filter((i) => {
    const term = searchTerm.toLowerCase();
    return (i.name || '').toLowerCase().includes(term) || (i.email || '').toLowerCase().includes(term);
  });

  return (
    <div style={{ padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          <UserPlus size={22} color="var(--color-primary)" /> Invitaciones de Usuario
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
          Invita a médicos, pacientes y personal. Quedarán vinculados automáticamente a tu cuenta al registrarse.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Formulario de creación */}
        <Card style={{ flex: '1 1 280px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} color="var(--color-primary)" /> Nueva Invitación
          </h3>
          <form onSubmit={handleCreateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>
                Rol del Usuario
              </label>
              <select
                value={inviteeRole}
                onChange={(e) => setInviteeRole(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--color-bg-app)', outline: 'none' }}
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
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
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
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: '0.2rem', display: 'block' }}>
                Necesario para enviar el enlace automáticamente por email.
              </span>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              style={{
                marginTop: '0.5rem',
                backgroundColor: isCreating ? 'var(--border)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: isCreating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isCreating ? <><Spinner size={14} /> Generando...</> : 'Generar Enlace de Invitación'}
            </button>
          </form>
        </Card>

        {/* Tabla de historial */}
        <div style={{ flex: '2 1 420px' }}>
          <DataTable
            data={filteredData}
            columns={columns}
            loading={isLoading}
            globalSearch={true}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre o email…"
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyState={
              <EmptyState
                icon={Mail}
                title="Sin invitaciones"
                subtitle={searchTerm ? 'No hay resultados para esta búsqueda.' : 'Crea tu primera invitación usando el formulario de la izquierda.'}
                action={searchTerm ? { label: 'Limpiar búsqueda', onClick: () => setSearchTerm('') } : undefined}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
