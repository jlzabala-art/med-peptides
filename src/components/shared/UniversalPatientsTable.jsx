"use client";

import Users from "lucide-react/dist/esm/icons/users";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import React, { useState, useEffect, useMemo } from 'react';
import { StatusChip, MetricCard } from '../ui';
import DataModule from '../ui/DataModule';
import PatientOnboardingWizard from '../admin/patients/PatientOnboardingWizard';
import PatientProfileWorkspace from '../admin/patients/PatientProfileWorkspace';
import { formatAEDtoDual } from '../../utils/currencies';
import { useSearchParams } from 'next/navigation';

import { useFirestoreCollection } from '../../hooks/data/useFirestoreCollection';
import { usePatientAggregates } from '../../hooks/data/usePatientAggregates';
import { usePatientStore } from '../../store/usePatientStore';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import { useDataTable } from '../../hooks/ui/useDataTable';
import BulkActionsBar from '../ui/BulkActionsBar';
import PatientFiltersBar from '../admin/patients/PatientFiltersBar';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../hooks/useToast';
import { Archive, Trash2, Activity, ShieldCheck, ShieldAlert, Clock, DollarSign } from '@/lib/icons';

function PatientKPIs() {
  const { data: aggs, isLoading } = usePatientAggregates();
  const fmtCurrency = (val) => formatAEDtoDual(val);

  const kpis = [
    { label: 'Total Patients', value: aggs?.totalPatients || 0, color: 'var(--color-primary)', icon: Users },
    { label: 'Active', value: aggs?.activePatients || 0, color: 'var(--color-success)', icon: Activity },
    { label: 'New This Month', value: aggs?.newPatients || 0, color: '#8b5cf6', icon: UserPlus },
    { label: 'Awaiting Follow-Up', value: aggs?.awaitingFollowUp || 0, color: 'var(--color-warning)', alert: (aggs?.awaitingFollowUp || 0) > 0, icon: Clock },
    { label: 'Total Revenue', value: fmtCurrency(aggs?.totalRevenue || 0), color: '#ec4899', icon: DollarSign }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', flexShrink: 0 }}>
      {kpis.map((kpi, idx) => (
        <MetricCard
          key={idx}
          title={kpi.label}
          value={kpi.value}
          color={kpi.color}
          icon={kpi.icon}
          alert={kpi.alert}
          loading={isLoading}
        />
      ))}
    </div>
  );
}

export default function UniversalPatientsTable({ doctorId, accountManagerId, readOnly = false, viewMode = 'admin', hideHeader = false, title = 'Patient Registry', subtitle = 'Centralized database for managing all patients across the platform.' }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
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

  const { patients, fetchPatients, loading } = usePatientStore();

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Apply whereConditions locally
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      let match = true;
      if (filters.status && p.status !== filters.status) match = false;
      if (filters.physicianId && p.physicianId !== filters.physicianId) match = false;
      return match;
    });
  }, [patients, filters]);

  // Fallbacks since we are now doing local pagination
  const hasMore = false; 
  const isFetchingMore = false;
  const loadMore = () => {};

  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId && filteredPatients && filteredPatients.length > 0) {
      // With Master-Detail, we'd ideally expand the row instead of opening a modal.
      // But for simplicity, we just clear the param.
      const p = filteredPatients.find(p => p.id === patientId);
      if (p) {
        const url = new URL(window.location.href);
        url.searchParams.delete('patientId');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, filteredPatients]);

  const {
    selectedIds,
    clearSelection,
    selectedItems,
    search: searchTerm,
    setSearch: setSearchTerm,
    toggleRowSelection,
  } = useDataTable(filteredPatients, {
    idField: 'id',
    initialPageSize: 50,
  });

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'atlas_patients',
    searchTerm,
    { hitsPerPage: 50 },
    300
  );

  const finalFiltered = isAlgoliaActive && searchTerm.trim()
    ? algoliaHits.map(h => filteredPatients.find(p => p.id === h.objectID) || { ...h, id: h.objectID }).filter(Boolean)
    : filteredPatients;

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
      resultCount={loading && !algoliaLoading ? undefined : finalFiltered.length}
      searchLoading={algoliaLoading}
      namespace="admin-patients"
      kpis={<PatientKPIs />}
      filtersBar={<PatientFiltersBar filters={filters} setFilters={setFilters} doctors={doctors} />}
      data={finalFiltered}
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
      expandableRender={(row) => (
        <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <PatientProfileWorkspace 
            patient={row}
            onClose={() => {}}
          />
        </div>
      )}
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
    </DataModule>
  );
}