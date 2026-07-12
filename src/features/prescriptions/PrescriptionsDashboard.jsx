import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, FileText, ChevronRight } from '@/lib/icons';
import { getPrescriptionsByFilter } from '../../services/prescriptionsService';

import SourceSelectorModal from './SourceSelectorModal';

import DataTable from '../../components/ui/DataTable';
import StatusChip from '../../components/ui/StatusChip';

const PrescriptionsDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await getPrescriptionsByFilter();
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    }
    setLoading(false);
  };

  const handleCreatePrescription = (sourceType) => {
    setIsSourceModalOpen(false);
    router.push(`/prescriptions/new?source=${encodeURIComponent(sourceType)}`);
  };

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {row.patientName || 'Unknown Patient'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {row.doctorId ? `Dr. ${row.doctorId}` : 'No Doctor Assigned'}
          </div>
        </div>
      )
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) => <StatusChip status={row.sourceType || 'Manual'} />
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusChip status={row.status || 'Draft'} />
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          {row.createdAt ? new Date(row.createdAt?.toDate?.() || row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => <ChevronRight size={18} color="var(--color-text-secondary)" />
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Prescriptions</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage clinical prescriptions, extractions, and approvals.
          </p>
        </div>
        <button
          onClick={() => setIsSourceModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'var(--color-primary, #003666)',
            color: '#ffffff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          New Prescription
        </button>
      </div>

      <DataTable
        columns={columns}
        data={prescriptions}
        isLoading={loading}
        keyField="id"
        onRowClick={(row) => router.push(`/prescriptions/${row.id}`)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by patient, doctor, or ID..."
        emptyTitle="No prescriptions found"
        emptyDescription="Get started by creating a new prescription manually or importing from a source."
        emptyActionLabel="Create First Prescription"
        onEmptyAction={() => setIsSourceModalOpen(true)}
      />

      {isSourceModalOpen && (
        <SourceSelectorModal 
          onClose={() => setIsSourceModalOpen(false)} 
          onSelectSource={handleCreatePrescription}
        />
      )}
    </div>
  );
};

export default PrescriptionsDashboard;
