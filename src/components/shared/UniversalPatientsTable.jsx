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
import PatientsKPIs from '../admin/patients/PatientsKPIs';
import StandardDrawer from '../ui/StandardDrawer';
import { formatAEDtoDual } from '../../utils/currencies';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AppActionGroup from '../ui/AppActionGroup';
import { filterDoctorPatients } from '@/domain';

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
import { Archive, Trash2, Activity, ShieldCheck, ShieldAlert, Clock, DollarSign, Stethoscope, Layers, Share2, MessageCircle } from '@/lib/icons';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import EntityLink from '../ui/EntityLink';
import ReassignPhysicianModal from '../admin/patients/ReassignPhysicianModal';
import UniversalShareDrawer from '../ui/UniversalShareDrawer';
import EngagementBadge from '../ui/EngagementBadge';
import UniversalActionCell from '../ui/UniversalActionCell';

function capitalizeName(name) {
  if (!name) return name;
  return name.split(' ').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

import { useRoleAccess } from '../../hooks/useRoleAccess';



function cleanStr(s) {
  return (s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function resolvePatientDoctorAndClinic(row, doctors = []) {
  const doctorObj = (doctors || []).find(d => d.id === (row.physicianId || row.doctorId));
  
  const docName = row.physician 
    || row.doctorName 
    || doctorObj?.name 
    || doctorObj?.displayName 
    || row.doctor?.name 
    || (row.prescribingDoctorNames && row.prescribingDoctorNames[0])
    || null;

  const clinicName = row.clinic 
    || row.clinicName 
    || row.doctorClinic 
    || doctorObj?.clinic 
    || doctorObj?.clinicName 
    || row.doctor?.clinicName 
    || null;

  return { 
    docName: docName || 'Unassigned Doctor', 
    clinicName: clinicName || 'Atlas Network' 
  };
}

export default function UniversalPatientsTable({ doctorId, accountManagerId, readOnly = false, viewMode = 'admin', hideHeader = false, title = 'Patient Registry', subtitle = 'Centralized database for managing all patients across the platform.', initialData = null, serverKPIs = null, scopeFilter = 'all' }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [mobileActionPatient, setMobileActionPatient] = useState(null);
  const [reassignModal, setReassignModal] = useState({ isOpen: false, patients: [] });
  const [sharePatient, setSharePatient] = useState(null);

  const { is, role } = useRoleAccess();
  const isAdmin = is('admin') || role === 'admin';
  // Reassignment is exclusively permitted for Super Administrators in the Admin Console, never for physicians
  const canReassignDoctor = isAdmin && viewMode === 'admin';
  const isMedicalDirector = (is('medical_director') || role === 'medical_director') && viewMode !== 'doctor';
  const effectiveDoctorId = viewMode === 'doctor'
    ? (doctorId || 'dr-hanieh-erdmann')
    : (isMedicalDirector ? null : doctorId);

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
    commercialStage: 'all',
    physicianId: undefined,
    productCategory: undefined,
    algoliaDoctor: undefined,
  });

  // Fetch doctors for the filter dropdown
  const { data: doctors } = useFirestoreCollection('users', {
    whereConditions: [['roles', 'array-contains', 'doctor']]
  });

  // Live Firestore patients query (fallback when Algolia is empty or inactive)
  const { data: firestorePatients = [], isLoading: firestoreLoading } = useFirestoreCollection('patients', {
    limitCount: 100,
  });

  // Algolia Facets
  const { facets: algoliaFacets } = useAlgoliaFacets('atlas_patients', ['prescribedProductCategories', 'prescribingDoctorNames']);

  // Algolia pagination & search state
  const [page, setPage] = useState(0);

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

  // Sync searchParams from URL (e.g. /doctor/patients?search=Carlos%20M%C3%A9ndez or ?doctor=Dr.+Nahla or ?physicianId=...)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || searchParams.get('ids') || searchParams.get('doctor') || searchParams.get('doctorName');
    const urlStatus = searchParams.get('status');
    const urlPhysicianId = searchParams.get('physicianId') || searchParams.get('doctorId');

    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
    if (urlStatus && urlStatus !== filters.status) {
      setFilters(prev => ({ ...prev, status: urlStatus }));
    }
    if (urlPhysicianId && urlPhysicianId !== filters.physicianId) {
      setFilters(prev => ({ ...prev, physicianId: urlPhysicianId }));
    }

    const patientId = searchParams.get('patientId');
    if (patientId) {
      const url = new URL(window.location.href);
      url.searchParams.delete('patientId');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const algoliaSearchParams = React.useMemo(() => {
    const facetFilters = [];
    if (filters.productCategory) facetFilters.push(`prescribedProductCategories:${filters.productCategory}`);
    if (filters.algoliaDoctor) facetFilters.push(`prescribingDoctorNames:${filters.algoliaDoctor}`);
    if (filters.status) facetFilters.push(`status:${filters.status.toLowerCase()}`);
    if (filters.physicianId) {
      facetFilters.push(`physicianId:${filters.physicianId}`);
    } else if (effectiveDoctorId) {
      facetFilters.push(`doctorIds:${effectiveDoctorId}`);
    }
    
    // Numeric filters for timeRange
    const numericFilters = [];
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = Date.now();
      let threshold = 0;
      if (filters.timeRange === '30d') threshold = now - 30 * 24 * 60 * 60 * 1000;
      if (filters.timeRange === '90d') threshold = now - 90 * 24 * 60 * 60 * 1000;
      numericFilters.push(`createdAt_ts >= ${threshold}`);
    }

    return { 
      alwaysFetch: true,
      facetFilters: facetFilters.length > 0 ? facetFilters : undefined, 
      numericFilters: numericFilters.length > 0 ? numericFilters : undefined,
      page,
      hitsPerPage: 50 
    };
  }, [filters, page, effectiveDoctorId]);

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading, totalHits } = useAlgoliaSearch(
    'atlas_patients',
    searchTerm,
    algoliaSearchParams,
    300
  );

  // Map objectID to id for compatibility & multi-query matching fallback
  const finalFiltered = useMemo(() => {
    let list = [];
    if (algoliaHits && algoliaHits.length > 0) {
      list = algoliaHits.map(h => ({ ...h, id: h.objectID || h.id }));
    } else if (initialData && initialData.length > 0) {
      list = initialData.map(p => ({ ...p, id: p.id || p.objectID }));
    } else if (firestorePatients && firestorePatients.length > 0) {
      list = firestorePatients.map(p => ({ ...p, id: p.id || p.objectID }));
    }

    // Strict Clinical Segregation (HIPAA / Medical Privacy - Domain Kernel Rule)
    if (effectiveDoctorId || viewMode === 'doctor') {
      const targetDocId = effectiveDoctorId || (viewMode === 'doctor' ? 'dr-hanieh-erdmann' : null);
      if (viewMode === 'doctor' && !targetDocId) return [];
      list = filterDoctorPatients(list, targetDocId);
    }

    // Multi-patient query support (comma-separated search) with diacritic-insensitivity
    if (searchTerm && searchTerm.trim()) {
      const queries = searchTerm.split(',').map(q => cleanStr(q)).filter(Boolean);
      if (queries.length > 0) {
        list = list.filter(p => {
          const id = cleanStr(p.id || p.objectID);
          const name = cleanStr(p.name || `${p.firstName || ''} ${p.lastName || ''}`);
          const email = cleanStr(p.email);
          const physician = cleanStr(p.physician || p.physicianName || p.doctorName || p.prescribingDoctor || p.doctor?.name || '');
          const clinic = cleanStr(p.clinic || p.clinicName || '');
          return queries.some(q => id.includes(q) || name.includes(q) || email.includes(q) || physician.includes(q) || clinic.includes(q));
        });
      }
    }

    // Filter by status if selected
    if (filters.status) {
      list = list.filter(p => (p.status || '').toLowerCase() === filters.status.toLowerCase());
    }

    // Filter by physician if selected
    if (filters.physicianId) {
      const selectedDoc = (doctors || []).find(d => d.id === filters.physicianId);
      const docNameClean = cleanStr(selectedDoc?.name || selectedDoc?.displayName || '');
      list = list.filter(p => {
        if (filters.physicianId === 'dr-hanieh-erdmann') {
          const docStr = `${p.doctorName || ''} ${p.physicianName || ''} ${p.prescribingDoctor || ''} ${p.clinicName || ''} ${p.clinic || ''}`.toLowerCase();
          if (docStr.includes('erdmann') || docStr.includes('bedaya')) return true;
        }
        return (
          p.physicianId === filters.physicianId ||
          p.assignedDoctorId === filters.physicianId ||
          p.doctorId === filters.physicianId ||
          (Array.isArray(p.doctorIds) && p.doctorIds.includes(filters.physicianId)) ||
          (docNameClean && cleanStr(p.physician || p.doctorName || '').includes(docNameClean))
        );
      });
    }

    // Filter by prescription assignment status (Golden Rule: Depuración)
    if (filters.prescriptionStatus) {
      if (filters.prescriptionStatus === 'no_rx') {
        list = list.filter(p => !p.prescriptionsCount || p.prescriptionsCount === 0 || (!p.prescriptions?.length && !p.activePrescriptions?.length));
      } else if (filters.prescriptionStatus === 'has_rx') {
        list = list.filter(p => (p.prescriptionsCount && p.prescriptionsCount > 0) || p.prescriptions?.length > 0 || p.activePrescriptions?.length > 0);
      }
    }

    // Filter by commercial lifecycle stage (Golden Rule: Regla #8)
    if (filters.commercialStage && filters.commercialStage !== 'all') {
      list = list.filter(p => {
        const stage = p.commercialStage || (
          p.hasPaidOrders || (Array.isArray(p.invoices) && p.invoices.length > 0) ? 'paid' : 'registered_only'
        );
        return stage === filters.commercialStage;
      });
    }

    // Filter by doctor practice scope (con nosotros vs consulta propia)
    if (scopeFilter === 'rx_active') {
      list = list.filter(p => p.patientType === 'regenpept_rx' || p.hasActivePrescription === true || p.prescriptionCount > 0 || (Array.isArray(p.prescriptions) && p.prescriptions.length > 0));
    } else if (scopeFilter === 'external') {
      list = list.filter(p => p.patientType === 'external_practice' || (!p.hasActivePrescription && (!p.prescriptionCount || p.prescriptionCount === 0) && (!Array.isArray(p.prescriptions) || p.prescriptions.length === 0)));
    }

    return list;
  }, [algoliaHits, initialData, firestorePatients, effectiveDoctorId, searchTerm, filters.status, filters.physicianId, filters.prescriptionStatus, filters.commercialStage, scopeFilter, doctors]);

  // Stage counts for segmented tabs (calculated against the scoped doctor's patients)
  const stageCounts = useMemo(() => {
    let base = [];
    if (algoliaHits && algoliaHits.length > 0) {
      base = algoliaHits.map(h => ({ ...h, id: h.objectID || h.id }));
    } else if (initialData && initialData.length > 0) {
      base = initialData.map(p => ({ ...p, id: p.id || p.objectID }));
    } else if (firestorePatients && firestorePatients.length > 0) {
      base = firestorePatients.map(p => ({ ...p, id: p.id || p.objectID }));
    }

    if (effectiveDoctorId || viewMode === 'doctor') {
      const targetDocId = effectiveDoctorId || (viewMode === 'doctor' ? 'dr-hanieh-erdmann' : null);
      if (viewMode === 'doctor' && !targetDocId) return { all: 0, paid: 0, quote_pending: 0, quote_unconfirmed: 0, registered_only: 0 };
      base = filterDoctorPatients(base, targetDocId);
    }

    if (filters.physicianId) {
      const selectedDoc = (doctors || []).find(d => d.id === filters.physicianId);
      const docNameClean = cleanStr(selectedDoc?.name || selectedDoc?.displayName || '');
      base = base.filter(p => (
        p.physicianId === filters.physicianId ||
        p.assignedDoctorId === filters.physicianId ||
        p.doctorId === filters.physicianId ||
        (Array.isArray(p.doctorIds) && p.doctorIds.includes(filters.physicianId)) ||
        (docNameClean && cleanStr(p.physician || p.doctorName || '').includes(docNameClean))
      ));
    }

    const counts = { all: base.length, paid: 0, quote_pending: 0, quote_unconfirmed: 0, registered_only: 0 };
    base.forEach(p => {
      const stage = p.commercialStage || (p.hasPaidOrders || (Array.isArray(p.invoices) && p.invoices.length > 0) ? 'paid' : 'registered_only');
      if (counts[stage] !== undefined) counts[stage]++;
      else counts.registered_only++;
    });
    return counts;
  }, [algoliaHits, initialData, firestorePatients, effectiveDoctorId, viewMode, filters.physicianId, doctors]);

  const COMMERCIAL_TABS = useMemo(() => [
    { id: 'all', label: 'All Patients', icon: '🌐', count: stageCounts.all },
    { id: 'paid', label: 'Paid & Confirmed', icon: '🟢', count: stageCounts.paid, color: '#16a34a' },
    { id: 'quote_pending', label: 'Quote Pending', icon: '🟡', count: stageCounts.quote_pending, color: '#d97706' },
    { id: 'quote_unconfirmed', label: 'Unconfirmed Quote', icon: '🔴', count: stageCounts.quote_unconfirmed, color: '#dc2626' },
    { id: 'registered_only', label: 'Registered Leads', icon: '⚪', count: stageCounts.registered_only, color: '#64748b' },
  ], [stageCounts]);

  // Smart Auto-open Patient Detail Drawer if 1 match or openDetail=true
  const autoOpenedRef = React.useRef(false);

  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (!finalFiltered || finalFiltered.length === 0) return;

    const openDetailParam = searchParams.get('openDetail') === 'true';
    const patientIdParam = searchParams.get('patientId') || searchParams.get('drawerId');
    const searchParam = searchParams.get('search');
    const viewParam = searchParams.get('view') || 'overview';

    let targetPatient = null;

    if (patientIdParam) {
      targetPatient = finalFiltered.find(p => p.id === patientIdParam || p.objectID === patientIdParam);
    } else if (openDetailParam && finalFiltered.length > 0) {
      targetPatient = finalFiltered[0];
    } else if (searchParam && finalFiltered.length === 1) {
      const query = cleanStr(searchParam);
      const p = finalFiltered[0];
      const name = cleanStr(p.name || `${p.firstName || ''} ${p.lastName || ''}`);
      const id = cleanStr(p.id);
      if (name.includes(query) || id.includes(query) || query.includes(name)) {
        targetPatient = p;
      }
    }

    if (targetPatient) {
      autoOpenedRef.current = true;
      openDrawer('patient', targetPatient.id, { initialTab: viewParam, patient: targetPatient });
    }
  }, [finalFiltered, searchParams, openDrawer]);

  const { handleBulkStatusChange, handleFieldUpdate, handleBulkDelete } = usePatientActions((id, field, value) => {
  });



  const doctorBreadcrumbs = useMemo(() => [
    { label: 'Doctor Overview', href: '/doctor' },
    { label: 'Patients' }
  ], []);

  return (
    <DataModule
      title={title}
      subtitle={subtitle}
      icon={Users}
      hideHeader={hideHeader}
      panel={viewMode === 'doctor' || effectiveDoctorId ? 'doctor' : 'admin'}
      breadcrumbs={viewMode === 'doctor' || effectiveDoctorId ? doctorBreadcrumbs : undefined}
      viewSelector={
        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px', overflowX: 'auto', maxWidth: '100%' }}>
          {COMMERCIAL_TABS.map(tab => {
            const isActive = (filters.commercialStage || 'all') === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, commercialStage: tab.id }))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? (tab.color || '#0f172a') : '#64748b',
                  border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.icon} {tab.label}</span>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? (tab.color || '#003666') : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#64748b'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      }
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
              backgroundColor: 'var(--color-primary, #0d9488)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
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
          isFiltered={Boolean(searchTerm || filters.status || filters.clinic || filters.physicianId || filters.commercialStage !== 'all' || (filters.timeRange && filters.timeRange !== 'all'))} 
          scopedPatients={effectiveDoctorId ? finalFiltered : null}
          isDoctorMode={Boolean(effectiveDoctorId || viewMode === 'doctor')}
        />
      }
      filterOptions={[
        {
          key: 'commercialStage',
          label: 'Commercial Status',
          value: filters.commercialStage || 'all',
          options: [
            { label: 'All Lifecycle Stages', value: 'all' },
            { label: '🟢 Paid & Confirmed', value: 'paid' },
            { label: '🟡 Quote Pending', value: 'quote_pending' },
            { label: '🔴 Unconfirmed Quote', value: 'quote_unconfirmed' },
            { label: '⚪ Registered Only', value: 'registered_only' }
          ],
          onChange: (val) => setFilters(prev => ({ ...prev, commercialStage: val || 'all' }))
        },
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
            ...(doctors || []).map(d => ({ label: d.name || d.displayName || d.email, value: d.id }))
          ],
          onChange: (val) => setFilters(prev => ({ ...prev, physicianId: val || undefined }))
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
        filters.commercialStage && filters.commercialStage !== 'all' && {
          key: 'commercialStage',
          label: 'Commercial',
          value: filters.commercialStage === 'paid' ? 'Paid & Confirmed'
               : filters.commercialStage === 'quote_pending' ? 'Quote Pending'
               : filters.commercialStage === 'quote_unconfirmed' ? 'Unconfirmed Quote'
               : 'Registered Lead',
          onRemove: () => setFilters(prev => ({ ...prev, commercialStage: 'all' }))
        },
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
          value: (doctors || []).find(d => d.id === filters.physicianId)?.name || (doctors || []).find(d => d.id === filters.physicianId)?.displayName || 'Physician', 
          onRemove: () => setFilters(prev => ({ ...prev, physicianId: undefined })) 
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
        openDrawer('patient', row.id, { initialTab: 'overview', patient: row });
        const params = new URLSearchParams(searchParams.toString());
        params.set('drawer', 'patient');
        params.set('drawerId', row.id);
        router.push(`${pathname}?${params.toString()}`);
      }}
      mobileCardComponent={MobilePatientCard}
      expandableRender={(row) => {
        const allergies = Array.isArray(row.allergies) && row.allergies.length > 0 ? row.allergies.join(', ') : 'None registered';
        const activeGoals = Array.isArray(row.healthGoals) && row.healthGoals.length > 0 ? row.healthGoals.join(' • ') : (row.primaryGoal || 'Longevity & Metabolic Wellness');
        const { docName: physicianName, clinicName: patientClinicName } = resolvePatientDoctorAndClinic(row, doctors);

        const stage = row.commercialStage || (
          row.hasPaidOrders || (Array.isArray(row.invoices) && row.invoices.length > 0) ? 'paid' : 'registered_only'
        );
        const isPaid = stage === 'paid';
        const isUnconfirmed = stage === 'quote_unconfirmed';
        const isPending = stage === 'quote_pending';
        const invoiceDisplay = row.lastInvoiceRef || (Array.isArray(row.invoices) && row.invoices[0] ? `# INV ${row.invoices[0]}` : null);
        const totalDisplay = row.totalSpent ? `$${Number(row.totalSpent).toLocaleString()} USD` : null;

        return (
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid var(--border)', borderRadius: '0 0 8px 8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 1. Grid 4 Tarjetas de Contexto del Paciente */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {/* Perfil Clínico & Objetivos */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Clinical Focus & Goal
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {activeGoals}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>
                  Allergies: {allergies}
                </span>
              </div>

              {/* Contacto Directo */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Verified Contact
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                  {row.email || 'No email registered'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {row.phone || '+971 (Direct)'} • {row.country || 'United Arab Emirates'}
                </span>
              </div>

              {/* Logística de Entrega a Domicilio */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Home Delivery & Cold Chain
                </span>
                <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0284c7' }}>
                  2-8°C Insulated Pack
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.address?.street || row.street || 'Standard Residence Delivery'}
                </span>
              </div>

              {/* Médico & Afiliación */}
              <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Supervisory Doctor & Clinic
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {physicianName}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {patientClinicName}
                </span>
              </div>
            </div>

            {/* 2. Tarjeta de Estado Comercial & Cotización (GCP Lifecycle Card) */}
            <div style={{ 
              backgroundColor: isPaid ? '#f0fdf4' : isUnconfirmed ? '#fef2f2' : isPending ? '#fffbeb' : '#ffffff',
              border: `1px solid ${isPaid ? '#bbf7d0' : isUnconfirmed ? '#fecaca' : isPending ? '#fde68a' : '#e2e8f0'}`,
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <StatusBadge 
                  status={stage} 
                  customLabel={
                    isPaid ? 'Confirmed & Paid' :
                    isPending ? 'Quote Pending Payment' :
                    isUnconfirmed ? 'Quotation Unconfirmed (Needs Follow-up)' :
                    'Lead / Registered Only'
                  }
                />
                <span style={{ fontSize: '0.80rem', color: isPaid ? '#166534' : isUnconfirmed ? '#991b1b' : '#1e293b', fontWeight: 600 }}>
                  {isPaid 
                    ? `Payment Confirmed (${totalDisplay || 'Verified'}) • ${invoiceDisplay ? `Invoice: ${invoiceDisplay}` : 'Direct Zoho Payment'}`
                    : isUnconfirmed 
                      ? 'Consultation/Prescription issued without order confirmation. Opportunity to reactivate patient.'
                      : isPending 
                        ? 'Awaiting patient quotation acceptance & checkout.'
                        : 'No formal quotation has been generated yet for this patient.'
                  }
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isUnconfirmed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const msg = encodeURIComponent(`Hello ${row.name || 'there'}, Dr. ${physicianName || 'Khalid Shukri'} has a follow-up regarding your personalized peptide treatment plan. Would you like to review or renew your prescription quotation?`);
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📲 Reactivate via WhatsApp
                  </button>
                )}
                {isPaid && (
                  <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
                    ✓ Order Processed with Lotusland
                  </span>
                )}
              </div>
            </div>

            {/* 3. Barra de Accesos Rápidos para el Paciente */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
                <span>Prescriptions: <strong>{row.prescriptionCount || 0} active</strong></span>
                <span>•</span>
                <span>Last Order: <strong>{row.lastOrderStatus || (isPaid ? 'Delivered' : 'Pending')}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSharePatient(row)}
                  className="gcp-btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Compartir Expediente / Portal de Paciente"
                >
                  <Share2 size={12} /> Share Portal
                </button>
                <button
                  onClick={() => openDrawer('rx-builder', 'new', {
                    initialPatient: { id: row.id, name: row.name, email: row.email },
                    sourceModule: 'patients-table',
                  })}
                  className="gcp-btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                >
                  New Rx
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
      emptyState={
        (searchTerm || filters.status || filters.physicianId || filters.productCategory || filters.algoliaDoctor || filters.commercialStage !== 'all' || (filters.timeRange && filters.timeRange !== 'all'))
          ? {
              title: "No patients match active filters",
              description: `No patient records found matching ${searchTerm ? `"${searchTerm}"` : 'the current filter criteria'}. Try clearing your search or resetting active filters.`,
              actionLabel: "Clear All Filters",
              onAction: () => {
                setSearchTerm('');
                setFilters({ timeRange: 'all', status: undefined, commercialStage: 'all', physicianId: undefined, productCategory: undefined, algoliaDoctor: undefined });
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('search');
                  url.searchParams.delete('status');
                  url.searchParams.delete('ids');
                  window.history.replaceState({}, '', url.toString());
                }
              }
            }
          : {
              title: "Welcome to Patient Management",
              description: "Manage patients, programs, clinics, physicians, prescriptions, and follow-ups from one centralized workspace.",
              actionLabel: "Create First Patient",
              onAction: () => setIsWizardOpen(true)
            }
      }
      bulkActions={[
        ...(canReassignDoctor ? [{
          label: 'Reassign Doctor',
          icon: Stethoscope,
          onClick: () => {
            const selectedList = finalFiltered.filter(p => selectedIds.has(p.id));
            if (selectedList.length === 0) return;
            setReassignModal({ isOpen: true, patients: selectedList });
          }
        }] : []),
        {
          label: 'Create Multi-Rx',
          icon: FileText,
          onClick: () => {
            const selectedList = finalFiltered.filter(p => selectedIds.has(p.id));
            if (selectedList.length === 0) return;
            openDrawer('rx-builder', 'new', {
              initialPatient: { id: selectedList[0].id, name: selectedList.map(p => p.name || p.firstName).join(', ') },
              sourceModule: 'multi-patient-selection',
            });
            notifier.info(`Initiated multi-patient prescription session for ${selectedList.length} patients.`);
          }
        },
        { label: 'Mark Active', icon: Activity, onClick: () => handleBulkStatusChange(Array.from(selectedIds), 'Active', clearSelection) },
        { label: 'Export CSV', icon: Archive, onClick: () => handleBulkExportCSV(finalFiltered.filter(p => selectedIds.has(p.id))) },
        { label: 'Delete', icon: Trash2, onClick: () => handleBulkDelete(Array.from(selectedIds), clearSelection), variant: 'danger' },
      ]}
      columns={[
        { 
          key: 'name', 
          header: 'Patient',
          width: '26%',
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
          width: '20%',
          render: (row) => {
            const { docName, clinicName } = resolvePatientDoctorAndClinic(row, doctors);
            const isUnassigned = docName === 'Unassigned Doctor';
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: isUnassigned ? '#94a3b8' : '#0f172a' }}>
                  {docName}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {clinicName}
                </span>
              </div>
            );
          }
        },
        { 
          key: 'prescriptionCount', 
          header: 'Active Program', 
          width: '16%', 
          render: (row) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                {row.prescriptionCount || 1} Rx Active
              </span>
            </div>
          )
        },
        { 
          key: 'commercialStage', 
          header: 'Quotation & Payment', 
          width: '24%', 
          render: (row) => {
            const stage = row.commercialStage || (
              row.hasPaidOrders || (Array.isArray(row.invoices) && row.invoices.length > 0) ? 'paid' : 'registered_only'
            );
            const isPaid = stage === 'paid';
            const isUnconfirmed = stage === 'quote_unconfirmed';
            const isPending = stage === 'quote_pending';
            const invoiceDisplay = row.lastInvoiceRef || (Array.isArray(row.invoices) && row.invoices[0] ? `# INV ${row.invoices[0]}` : null);
            const totalDisplay = row.totalSpent ? `$${Number(row.totalSpent).toLocaleString()} USD` : null;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <StatusBadge 
                    status={stage} 
                    customLabel={
                      isPaid ? 'Paid & Confirmed' :
                      isPending ? 'Quote Pending' :
                      isUnconfirmed ? 'Unconfirmed Quote' :
                      'Registered Lead'
                    }
                  />
                  {totalDisplay && isPaid && (
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#15803d', backgroundColor: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                      {totalDisplay}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                  {invoiceDisplay ? (
                    <span>Ref: <strong>{invoiceDisplay}</strong></span>
                  ) : isUnconfirmed ? (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ Quote issued • Not paid</span>
                  ) : isPending ? (
                    <span style={{ color: '#d97706', fontWeight: 600 }}>⏳ Awaiting payment</span>
                  ) : (
                    <span>No active quote</span>
                  )}
                </div>
                {(row.lastAssetSharedAt || row.lastAssetViewCount) && (
                  <div style={{ marginTop: '3px' }}>
                    <EngagementBadge
                      viewCount={row.lastAssetViewCount || 0}
                      lastViewedAt={row.lastAssetViewedAt}
                      sharedAt={row.lastAssetSharedAt}
                      status={row.lastAssetReadStatus}
                      size="xs"
                    />
                  </div>
                )}
              </div>
            );
          }
        },
        {
          key: 'actions',
          header: 'Actions',
          width: '14%',
          align: 'right',
          isAction: true,
          render: (row) => (
            <UniversalActionCell
              entity={row}
              entityType="patient"
              onView={() => {
                openDrawer('patient', row.id, { initialTab: 'overview', patient: row });
                const params = new URLSearchParams(searchParams);
                params.set('drawer', 'patient');
                params.set('drawerId', row.id);
                params.set('tab', 'overview');
                router.push(`${pathname}?${params.toString()}`);
              }}
              onShare={() => setSharePatient(row)}
              extraActions={[
                {
                  type: 'create_prescription',
                  tooltip: 'New Prescription (Rx)',
                  onClick: () => {
                    openDrawer('rx-builder', 'new', {
                      initialPatient: { id: row.id, name: row.name, email: row.email },
                      sourceModule: 'patients-table',
                    });
                  }
                },
                ...(canReassignDoctor ? [{
                  label: 'Reassign Doctor',
                  icon: Stethoscope,
                  tooltip: 'Reassign Doctor & Clinic (Admin Only)',
                  onClick: () => {
                    setReassignModal({ isOpen: true, patients: [row] });
                  }
                }] : [])
              ]}
            />
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
            label: 'Cargar en Workspace',
            icon: Layers,
            onClick: () => {
              useWorkspaceStore.getState().loadUserIntoWorkspace(mobileActionPatient, { role: 'patient' });
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
          {
            label: 'Reassign Doctor',
            icon: Stethoscope,
            onClick: () => {
              setReassignModal({ isOpen: true, patients: [mobileActionPatient] });
            },
          },
        ]}
      />
      <ReassignPhysicianModal
        isOpen={reassignModal.isOpen}
        onClose={() => setReassignModal({ isOpen: false, patients: [] })}
        patients={reassignModal.patients}
        onSuccess={() => {
          clearSelection();
          router.refresh();
        }}
      />
      <UniversalShareDrawer
        isOpen={Boolean(sharePatient)}
        onClose={() => setSharePatient(null)}
        entityType="patient"
        entity={sharePatient}
      />
    </DataModule>
  );
}