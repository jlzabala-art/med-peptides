"use client";

import Users from "lucide-react/dist/esm/icons/users";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Download from "lucide-react/dist/esm/icons/download";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Eye from "lucide-react/dist/esm/icons/eye";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import StatusBadge from '../ui/StatusBadge';
import { MetricCard } from '../ui';
import CopyableId from '../ui/CopyableId';
import DataModule from '../ui/DataModule';
import AIQuickActionButton from '../ui/AIQuickActionButton';
import PatientFormDrawer from '../admin/patients/PatientFormDrawer';
import PatientProfileWorkspace from '../admin/patients/PatientProfileWorkspace';
import StandardDrawer from '../ui/StandardDrawer';
import { formatAEDtoDual } from '../../utils/currencies';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AppActionGroup from '../ui/AppActionGroup';

import { useFirestoreCollection } from '../../hooks/data/useFirestoreCollection';
import { usePatientAggregates } from '../../hooks/data/usePatientAggregates';
import { useAlgoliaSearch, useAlgoliaFacets } from '../../hooks/data/useAlgoliaSearch';
import { useDataTable } from '../../hooks/ui/useDataTable';
import { useDrawer } from '../../context/DrawerContext';
import MobilePatientCard from './mobile/MobilePatientCard';
import MobileActionSheet from '../ui/MobileActionSheet';
import notifier from '../../services/NotificationService';
import BulkActionsBar from '../ui/BulkActionsBar';
import InlineEditableCell from '../ui/InlineEditableCell';
import { usePatientActions } from '../../hooks/usePatientActions';
import { usePatientExport } from '../../hooks/usePatientExport';
import { Archive, Trash2, Activity, ShieldCheck, ShieldAlert, Clock, DollarSign } from '@/lib/icons';
import EntityLink from '../ui/EntityLink';

function capitalizeName(name) {
  if (!name) return name;
  return name.split(' ').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

import PatientsKPIs from '../admin/patients/PatientsKPIs';

export default function UniversalPatientsTable({ doctorId, accountManagerId, readOnly = false, viewMode = 'admin', hideHeader = false, title = 'Patient Registry', subtitle = 'Centralized database for managing all patients across the platform.', initialData = null, serverKPIs = null }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [mobileActionPatient, setMobileActionPatient] = useState(null);

  const handleMobileQuickAction = useCallback((action, patient) => {
    if (action === 'menu') { setMobileActionPatient(patient); }
  }, []);

  const mobileCardPropsForTable = useMemo(() => ({
    onQuickAction: handleMobileQuickAction,
  }), [handleMobileQuickAction]);
  const { handleBulkExportCSV } = usePatientExport();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { openDrawer } = useDrawer();

  const [filters, setFilters] = useState({
    timeRange: 'all',
    status: undefined,
    physicianId: undefined,
    productCategory: undefined,
    algoliaDoctor: undefined,
  });

  // Fetch doctors for the filter dropdown
  const { data: doctors } = useFirestoreCollection('users', {
    whereConditions: [['roles', 'array-contains', 'doctor']]
  });

  // Algolia Facets
  const { facets: algoliaFacets } = useAlgoliaFacets('atlas_patients', ['prescribedProductCategories', 'prescribingDoctorNames']);

  // Algolia pagination & search state
  const [page, setPage] = useState(0);


  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId) {
      // Clear param, handled elsewhere
      const url = new URL(window.location.href);
      url.searchParams.delete('patientId');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const {
    selectedIds,
    clearSelection,
    selectedItems,
    search: searchTerm,
    setSearch: setSearchTerm,
    toggleRowSelection,
  } = useDataTable([], {
    idField: 'objectID', // Algolia uses objectID
    initialPageSize: 50,
  });

  const algoliaSearchParams = React.useMemo(() => {
    const facetFilters = [];
    if (filters.productCategory) facetFilters.push(`prescribedProductCategories:${filters.productCategory}`);
    if (filters.algoliaDoctor) facetFilters.push(`prescribingDoctorNames:${filters.algoliaDoctor}`);
    if (filters.status) facetFilters.push(`status:${filters.status}`);
    if (filters.physicianId) facetFilters.push(`physicianId:${filters.physicianId}`);
    
    // Numeric filters for timeRange
    const numericFilters = [];
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = Date.now();
      let threshold = 0;
      if (filters.timeRange === '30d') threshold = now - 30 * 24 * 60 * 60 * 1000;
      if (filters.timeRange === '90d') threshold = now - 90 * 24 * 60 * 60 * 1000;
      numericFilters.push(`createdAt >= ${threshold}`);
    }

    return { 
      alwaysFetch: true,
      facetFilters: facetFilters.length > 0 ? facetFilters : undefined, 
      numericFilters: numericFilters.length > 0 ? numericFilters : undefined,
      page,
      hitsPerPage: 50 
    };
  }, [filters, page]);

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading, totalHits } = useAlgoliaSearch(
    'atlas_patients',
    searchTerm,
    algoliaSearchParams,
    300
  );

  // Map objectID to id for compatibility
  // When Algolia is inactive and initialData was provided by the RSC, use it for 0ms first paint
  const finalFiltered = useMemo(() => {
    if (isAlgoliaActive || algoliaLoading || searchTerm) {
      return algoliaHits.map(h => ({ ...h, id: h.objectID }));
    }
    if (algoliaHits.length > 0) {
      return algoliaHits.map(h => ({ ...h, id: h.objectID }));
    }
    // Fall back to server-prefetched data when Algolia hasn't loaded yet
    return (initialData || []).map(p => ({ ...p, id: p.id || p.objectID }));
  }, [algoliaHits, isAlgoliaActive, algoliaLoading, searchTerm, initialData]);

  const { handleBulkStatusChange, handleFieldUpdate, handleBulkDelete } = usePatientActions((id, field, value) => {
    // Optionally trigger a re-fetch or local update if needed
    // Algolia updates take a few seconds, optimistic UI could be applied here by mutating finalFiltered
  });



  return (
    <DataModule
      title={title}
      subtitle={subtitle}
      icon={Users}
      hideHeader={hideHeader}
      actions={!readOnly ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <AIQuickActionButton
            label="AI Patient Intake"
            onClick={() => setIsWizardOpen(true)}
            title="Extract patient profile, allergies and blood biomarkers with AI"
          />
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-primary, #003666)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <UserPlus size={16} />
            <span>Add Patient</span>
          </button>
        </div>
      ) : null}
      mobileOverflowActions={[
        { label: 'Export CSV', icon: Download, onClick: () => handleBulkExportCSV(finalFiltered) },
        { label: 'Refresh', icon: RefreshCw, onClick: () => {} }
      ]}
      searchPlaceholder="Search patients by name, email, clinic, physician (Algolia)..."
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      resultCount={algoliaLoading ? undefined : totalHits}
      searchLoading={algoliaLoading}
      namespace="admin-patients"
      kpis={
        <PatientsKPIs 
          filteredCount={finalFiltered.length} 
          isFiltered={Boolean(searchTerm || filters.status || filters.clinic || filters.physician)} 
        />
      }
      filterOptions={[
        {
          key: 'status',
          label: 'Status',
          value: filters.status || '',
          options: [
            { label: 'All Statuses', value: '' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
            { label: 'Archived', value: 'Archived' }
          ],
          onChange: (val) => setFilters(prev => ({ ...prev, status: val || undefined }))
        },
        {
          key: 'physicianId',
          label: 'Physician',
          value: filters.physicianId || '',
          options: [
            { label: 'All Physicians', value: '' },
            ...(doctors || []).map(d => ({ label: d.name || d.email, value: d.id }))
          ],
          onChange: (val) => setFilters(prev => ({ ...prev, physicianId: val || undefined }))
        },
        {
          key: 'productCategory',
          label: 'Product Category (Algolia)',
          value: filters.productCategory || '',
          options: [
            { label: 'All Categories', value: '' },
            ...(algoliaFacets?.prescribedProductCategories || []).map(f => ({ label: `${f.name} (${f.count})`, value: f.name }))
          ],
          onChange: (val) => setFilters(prev => ({ ...prev, productCategory: val || undefined }))
        },
        {
          key: 'algoliaDoctor',
          label: 'Prescribed By (Algolia)',
          value: filters.algoliaDoctor || '',
          options: [
            { label: 'All Doctors', value: '' },
            ...(algoliaFacets?.prescribingDoctorNames || []).map(f => ({ label: `${f.name} (${f.count})`, value: f.name }))
          ],
          onChange: (val) => setFilters(prev => ({ ...prev, algoliaDoctor: val || undefined }))
        },
        {
          key: 'timeRange',
          label: 'Time Range',
          value: filters.timeRange || 'all',
          options: [
            { label: 'All Time', value: 'all' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' }
          ],
          onChange: (val) => setFilters(prev => ({ ...prev, timeRange: val || 'all' }))
        }
      ]}
      filters={[
        filters.timeRange && filters.timeRange !== 'all' && {
          key: 'timeRange',
          label: 'Time',
          value: filters.timeRange === '30d' ? 'Last 30 Days' : 'Last 90 Days',
          onRemove: () => setFilters(prev => ({ ...prev, timeRange: 'all' }))
        },
        filters.status && { 
          key: 'status', 
          label: 'Status', 
          value: filters.status, 
          onRemove: () => setFilters(prev => ({ ...prev, status: undefined })) 
        },
        filters.physicianId && { 
          key: 'physician', 
          label: 'Assigned Physician', 
          value: (doctors || []).find(d => d.id === filters.physicianId)?.name || 'Unknown', 
          onRemove: () => setFilters(prev => ({ ...prev, physicianId: undefined })) 
        },
        filters.productCategory && {
          key: 'productCategory',
          label: 'Category',
          value: filters.productCategory,
          onRemove: () => setFilters(prev => ({ ...prev, productCategory: undefined })) 
        },
        filters.algoliaDoctor && {
          key: 'algoliaDoctor',
          label: 'Prescribed By',
          value: filters.algoliaDoctor,
          onRemove: () => setFilters(prev => ({ ...prev, algoliaDoctor: undefined })) 
        }
      ].filter(Boolean)}
      data={finalFiltered}
      loading={algoliaLoading}
      isSearchActive={isAlgoliaActive}
      selectedIds={Array.from(selectedIds)}
      onSelectionChange={(newArr) => {
         clearSelection();
         newArr.forEach(id => toggleRowSelection(id));
      }}
      onRowClick={(row) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('drawer', 'patient');
        params.set('drawerId', row.id);
        router.push(`${pathname}?${params.toString()}`);
      }}
      mobileCardComponent={MobilePatientCard}
      expandableRender={(row) => {
        const allergies = Array.isArray(row.allergies) && row.allergies.length > 0 ? row.allergies.join(', ') : 'None registered';
        const activeGoals = Array.isArray(row.healthGoals) && row.healthGoals.length > 0 ? row.healthGoals.join(' • ') : (row.primaryGoal || 'Longevity & Metabolic Wellness');
        const physicianName = (doctors || []).find(d => d.id === row.physicianId)?.name || row.physician || 'Direct Medical Desk';

        return (
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid var(--border)', borderRadius: '0 0 8px 8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 1. Grid 4 Tarjetas de Contexto del Paciente */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {/* Perfil Clínico & Objetivos */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🩺 Clinical Focus & Goal
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  🎯 {activeGoals}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>
                  Allergies: {allergies}
                </span>
              </div>

              {/* Contacto Directo */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  📞 Verified Contact
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  📧 {row.email || 'No email registered'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  📱 {row.phone || '+971 (Direct)'} • {row.country || 'United Arab Emirates'}
                </span>
              </div>

              {/* Logística de Entrega a Domicilio */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🚚 Home Delivery & Cold Chain
                </span>
                <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0284c7' }}>
                  ❄️ 2-8°C Insulated Pack
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {row.address?.street || row.street || 'Standard Residence Delivery'}
                </span>
              </div>

              {/* Médico & Afiliación */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  👨‍⚕️ Supervisory Doctor & Clinic
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {physicianName}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  🏥 {row.clinic || 'Affiliated Clinical Center'}
                </span>
              </div>
            </div>

            {/* 2. Barra de Accesos Rápidos para el Paciente */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
                <span>Prescriptions: <strong>{row.prescriptionCount || 0} active</strong></span>
                <span>•</span>
                <span>Last Order: <strong>{row.lastOrderStatus || 'Delivered'}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openDrawer('rx-builder', 'new', {
                    initialPatient: { id: row.id, name: row.name, email: row.email },
                    sourceModule: 'patients-table',
                  })}
                  className="gcp-btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                >
                  ➕ New Rx
                </button>
                <button
                  onClick={() => openDrawer('patient', row.id, { initialTab: 'overview', patient: row })}
                  className="gcp-btn-primary"
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                >
                  View Full Medical Chart →
                </button>
              </div>
            </div>
          </div>
        );
      }}
      emptyState={{
        title: "Welcome to Patient Management",
        description: "Manage patients, programs, clinics, physicians, prescriptions, and follow-ups from one centralized workspace.",
        actionLabel: "Create First Patient",
        onAction: () => setIsWizardOpen(true)
      }}
      bulkActions={[
        { label: 'Mark Active', icon: Activity, onClick: () => handleBulkStatusChange(Array.from(selectedIds), 'Active', clearSelection) },
        { label: 'Export CSV', icon: Archive, onClick: () => handleBulkExportCSV(finalFiltered.filter(p => selectedIds.has(p.id))) },
        { label: 'Delete', icon: Trash2, onClick: () => handleBulkDelete(Array.from(selectedIds), clearSelection), variant: 'danger' },
      ]}
      columns={[
        { 
          key: 'name', 
          header: 'Patient',
          width: '30%',
          render: (row) => (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.80rem', flexShrink: 0 }}>
                {(row.name || row.firstName || 'P').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.90rem' }}>{capitalizeName(row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unnamed Patient')}</span>
                  <CopyableId value={row.id} iconOnly={true} />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {row.email || row.country || 'Patient Record'}
                </div>
              </div>
            </div>
          )
        },
        {
          key: 'physician',
          header: 'Doctor & Clinic',
          width: '30%',
          render: (row) => {
            const docName = (doctors || []).find(d => d.id === row.physicianId)?.name || row.physician || 'Direct Medical Desk';
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  👨‍⚕️ {docName}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  🏥 {row.clinic || 'Affiliated Clinical Center'}
                </span>
              </div>
            );
          }
        },
        { 
          key: 'prescriptionCount', 
          header: 'Active Program', 
          width: '22%', 
          render: (row) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                📋 {row.prescriptionCount || 1} Rx Active
              </span>
            </div>
          )
        },
        { 
          key: 'status', 
          header: 'Status & Actions', 
          width: '18%', 
          render: (row) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <StatusBadge status={row.status === 'Active' || row.status === 'active' ? 'active' : 'pending'} label={row.status || 'Active'} />
              <AppActionGroup
                actions={[
                  {
                    type: 'view',
                    tooltip: 'View Patient Chart',
                    onClick: () => {
                      openDrawer('patient', row.id, { initialTab: 'overview', patient: row });
                      const params = new URLSearchParams(searchParams);
                      params.set('drawer', 'patient');
                      params.set('drawerId', row.id);
                      params.set('tab', 'overview');
                      router.push(`${pathname}?${params.toString()}`);
                    }
                  },
                  {
                    type: 'create_prescription',
                    tooltip: 'New Prescription (Rx)',
                    onClick: () => {
                      openDrawer('rx-builder', 'new', {
                        initialPatient: { id: row.id, name: row.name, email: row.email },
                        sourceModule: 'patients-table',
                      });
                    }
                  }
                ]}
              />
            </div>
          )
        }
      ]}
    >
      <PatientFormDrawer 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={(newPat) => {
          setIsWizardOpen(false);
          window.location.reload(); 
        }}
      />
      <MobileActionSheet
        isOpen={!!mobileActionPatient}
        onClose={() => setMobileActionPatient(null)}
        title={mobileActionPatient?.name || mobileActionPatient?.firstName || 'Patient'}
        items={[
          {
            label: 'View Profile',
            icon: Eye,
            onClick: () => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('drawer', 'patient');
              params.set('drawerId', mobileActionPatient.id);
              router.push(`${pathname}?${params.toString()}`);
            },
          },
          {
            label: 'Create Prescription',
            icon: FileText,
            onClick: () => openDrawer('rx-builder', 'new', {
              initialPatient: { id: mobileActionPatient.id, name: mobileActionPatient.name },
              sourceModule: 'patients-table',
            }),
          },
          {
            label: 'Create Order',
            icon: ShoppingCart,
            onClick: () => {
              const basePanel = pathname.split('/')[1] || 'admin';
              router.push(`/${basePanel}/orders/new?patientId=${mobileActionPatient.id}`);
            },
          },
        ]}
      />
    </DataModule>
  );
}