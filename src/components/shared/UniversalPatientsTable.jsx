"use client";

import Users from "lucide-react/dist/esm/icons/users";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import React, { useState, useEffect, useMemo } from 'react';
import { StatusChip } from '../ui';
import DataModule from '../ui/DataModule';
import PatientOnboardingWizard from '../admin/patients/PatientOnboardingWizard';
import PatientProfileWorkspace from '../admin/patients/PatientProfileWorkspace';
import { formatAEDtoDual } from '../../utils/currencies';
import { useSearchParams } from 'next/navigation';

import { useFirestorePaginatedCollection } from '../../hooks/data/useFirestorePaginatedCollection';
import { useFirestoreCollection } from '../../hooks/data/useFirestoreCollection';
import { usePatientAggregates } from '../../hooks/data/usePatientAggregates';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import { useDataTable } from '../../hooks/ui/useDataTable';
import BulkActionsBar from '../ui/BulkActionsBar';
import PatientFiltersBar from '../admin/patients/PatientFiltersBar';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../hooks/useToast';
import { Archive, Trash2, Activity, ShieldCheck, ShieldAlert } from '@/lib/icons';

function PatientKPIs() {
  const { data: aggs, isLoading } = usePatientAggregates();
  const fmtCurrency = (val) => formatAEDtoDual(val);

  if (isLoading) {
    return <GridSkeleton count={5} cols={5} />;
  }

  const kpis = [
    { label: 'Total Patients', value: aggs?.totalPatients || 0, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active', value: aggs?.activePatients || 0, color: '#10b981', bg: '#ecfdf5' },
    { label: 'New This Month', value: aggs?.newPatients || 0, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Awaiting Follow-Up', value: aggs?.awaitingFollowUp || 0, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Revenue', value: fmtCurrency(aggs?.totalRevenue || 0), color: '#ec4899', bg: '#fdf2f8' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', flexShrink: 0 }}>
      {kpis.map((kpi, idx) => (
        <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-card-subtle">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{kpi.label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function UniversalPatientsTable({ doctorId, accountManagerId, readOnly = false, viewMode = 'admin', hideHeader = false, title = 'Patient Registry', subtitle = 'Centralized database for managing all patients across the platform.' }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({});

  // Fetch doctors for the filter dropdown
  const { data: doctors } = useFirestoreCollection('users', {
    whereConditions: [['roles', 'array-contains', 'doctor']]
  });

  // Construct where conditions based on filters
  const whereConditions = useMemo(() => {
    const conditions = [];
    if (filters.status) conditions.push(['status', '==', filters.status]);
    if (filters.physicianId) conditions.push(['physicianId', '==', filters.physicianId]);
    return conditions;
  }, [filters]);

  const { 
    data: paginatedPatients, 
    isLoading: loading, 
    hasMore, 
    loadMore,
    isFetchingMore
  } = useFirestorePaginatedCollection('patients', {
    whereConditions,
    orderByFields: [['createdAt', 'desc']],
    pageSize: 50
  });

  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId && paginatedPatients && paginatedPatients.length > 0 && !selectedPatient) {
      const p = paginatedPatients.find(p => p.id === patientId);
      if (p) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPatient(p);
        const url = new URL(window.location.href);
        url.searchParams.delete('patientId');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, paginatedPatients, selectedPatient]);

  const {
    selectedIds,
    clearSelection,
    selectedItems,
    search: searchTerm,
    setSearch: setSearchTerm,
    toggleRowSelection,
  } = useDataTable(paginatedPatients, {
    idField: 'id',
    initialPageSize: 50,
  });

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'atlas_patients',
    searchTerm,
    { hitsPerPage: 50 },
    300
  );

  const filtered = isAlgoliaActive && searchTerm.trim()
    ? algoliaHits.map(h => paginatedPatients.find(p => p.id === h.objectID) || { ...h, id: h.objectID }).filter(Boolean)
    : paginatedPatients;

  async function handleBulkStatusChange(newStatus) {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (!window.confirm(`Update status to "${newStatus}" for ${ids.length} patient(s)?`)) return;
    try {
      await Promise.all(ids.map(id => updateDoc(doc(db, 'patients', id), { status: newStatus })));
      clearSelection();
      toast.success(`${ids.length} patients updated. Please refresh to see changes.`);
    } catch (err) {
      toast.error('Failed to update patients: ' + err.message);
    }
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (!window.confirm(`Permanently delete ${ids.length} patient(s)?`)) return;
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, 'patients', id))));
      clearSelection();
      toast.success(`${ids.length} patients deleted. Please refresh to see changes.`);
    } catch (err) {
      toast.error('Failed to delete patients: ' + err.message);
    }
  }

  function handleBulkExportCSV() {
    const items = selectedItems;
    if (!items.length) return;
    const headers = ['ID', 'Name', 'Age', 'Gender', 'Clinic', 'Physician', 'Status'];
    const rows = items.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.age || '',
      p.gender || '',
      `"${(p.clinic || '').replace(/"/g, '""')}"`,
      `"${(p.physician || '').replace(/"/g, '""')}"`,
      p.status || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${items.length} patients to CSV.`);
  }

  return (
    <DataModule
      title={title}
      subtitle={subtitle}
      icon={Users}
      hideHeader={hideHeader}
      primaryAction={!readOnly ? {
        label: 'Add Patient',
        icon: UserPlus,
        onClick: () => setIsWizardOpen(true)
      } : null}
      searchPlaceholder="Search patients by name, email, clinic, physician (Algolia)..."
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      resultCount={loading && !algoliaLoading ? undefined : filtered.length}
      searchLoading={algoliaLoading}
      namespace="admin-patients"
      kpis={<PatientKPIs />}
      filtersBar={<PatientFiltersBar filters={filters} setFilters={setFilters} doctors={doctors} />}
      data={filtered}
      loading={loading}
      hasMore={hasMore}
      loadMore={loadMore}
      isFetchingMore={isFetchingMore}
      isSearchActive={isAlgoliaActive}
      selectedIds={Array.from(selectedIds)}
      onSelectionChange={(newArr) => {
         clearSelection();
         newArr.forEach(id => toggleRowSelection(id));
      }}
      onRowClick={setSelectedPatient}
      emptyState={{
        title: "Welcome to Patient Management",
        description: "Manage patients, programs, clinics, physicians, prescriptions, and follow-ups from one centralized workspace.",
        actionLabel: "Create First Patient",
        onAction: () => setIsWizardOpen(true)
      }}
      bulkActions={[
        { label: 'Mark Active', icon: <Activity size={14} />, onClick: () => handleBulkStatusChange('Active') },
        { label: 'Export CSV', icon: <Archive size={14} />, onClick: handleBulkExportCSV },
        { label: 'Delete', icon: <Trash2 size={14} />, onClick: handleBulkDelete, variant: 'danger' },
      ]}
      columns={[
        { 
          key: 'name', 
          header: 'Patient Name', 
          render: (row) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                {row.name ? row.name.substring(0,2).toUpperCase() : '??'}
              </div>
              <div style={{ fontWeight: 600 }}>{row.name}</div>
            </div>
          )
        },
        { 
          key: 'demographics', 
          header: 'Age / Gender', 
          render: (row) => <span style={{ color: 'var(--text-muted)' }}>{row.age} y/o • {row.gender}</span> 
        },
        { key: 'program', header: 'Program', render: (row) => <span style={{ fontWeight: 600 }}>{row.program}</span> },
        { key: 'clinic', header: 'Clinic' },
        { key: 'physician', header: 'Physician' },
        { key: 'status', header: 'Status', render: (row) => <StatusChip status={row.status} /> },
        {
          key: 'portal',
          header: 'Portal',
          render: (row) => row.linkedUserId
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '20px', padding: '0.2rem 0.6rem' }}><ShieldCheck size={12} /> Vinculado</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: 'var(--color-bg-hover)', borderRadius: '20px', padding: '0.2rem 0.6rem' }}><ShieldAlert size={12} /> Sin Acceso</span>,
        },
      ]}
    >
      {isWizardOpen && (
        <PatientOnboardingWizard 
          onClose={() => setIsWizardOpen(false)}
          onComplete={(newPat) => {
            setIsWizardOpen(false);
            window.location.reload(); 
          }}
        />
      )}

      {selectedPatient && (
        <PatientProfileWorkspace 
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </DataModule>
  );
}