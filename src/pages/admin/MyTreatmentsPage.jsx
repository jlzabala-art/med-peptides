import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePrescriptions } from '../../hooks/admin/usePrescriptions';
import { HeartPulse, Search, Plus, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from '@/lib/icons';
import DataTable from '../../components/ui/DataTable';
import StatusChip from '../../components/ui/StatusChip';

const STATUS_CONFIG = {
  active:    { label: 'Active',     color: 'var(--color-success)', icon: CheckCircle },
  pending:   { label: 'Pending',  color: 'var(--color-warning)', icon: Clock },
  completed: { label: 'Completed', color: 'var(--color-primary)', icon: CheckCircle },
  cancelled: { label: 'Cancelled',  color: 'var(--color-danger)',  icon: XCircle },
};

export default function MyTreatmentsPage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Fetch prescriptions filtered by current user, or all for admins
  const { prescriptions, loading, loadMore, hasMore, isFetchingMore } = usePrescriptions({
    whereConditions: user
      ? (userProfile?.role === 'admin' ? [] : [['patientUid', '==', user.uid]])
      : [],
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return prescriptions;
    const q = search.toLowerCase();
    return prescriptions.filter(
      (p) =>
        p.patientName?.toLowerCase().includes(q) ||
        p.protocolName?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q)
    );
  }, [prescriptions, search]);

  const columns = [
    {
      key: 'protocol',
      header: 'Protocol',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
            {row.protocolName || row.productName || '—'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {row.doctorName ? `Dr. ${row.doctorName}` : 'No doctor assigned'}
          </span>
        </div>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => (
        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {row.patientName || 'Unknown Patient'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending;
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: `${cfg.color}18`,
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/prescriptions/${row.id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          View <ChevronRight size={14} />
        </button>
      ),
    },
  ];

  const activeTreatments = prescriptions.filter((p) => p.status === 'active').length;
  const pendingTreatments = prescriptions.filter((p) => p.status === 'pending').length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <HeartPulse size={28} color="var(--color-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              My Treatments
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {userProfile?.firstName ? `Welcome, ${userProfile.firstName}. ` : ''}
            {userProfile?.role === 'admin' 
              ? 'Here are all active prescriptions and protocols in the system.' 
              : 'Here are all your active prescriptions and protocols.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/prescriptions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <Plus size={16} /> New Prescription
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: prescriptions.length, color: 'var(--color-primary)', icon: HeartPulse },
          { label: 'Active', value: activeTreatments, color: 'var(--color-success)', icon: CheckCircle },
          { label: 'Pending', value: pendingTreatments, color: 'var(--color-warning)', icon: AlertCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</span>
              <Icon size={18} color={color} />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {loading ? '—' : value}
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input
          type="text"
          placeholder="Search treatments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem 0.6rem 2.25rem',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            fontSize: '0.875rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage={
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <HeartPulse size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600 }}>No treatments registered</p>
            <p style={{ fontSize: '0.85rem' }}>Your prescriptions will appear here once they are created.</p>
          </div>
        }
      />

      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={loadMore}
            disabled={isFetchingMore}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {isFetchingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
