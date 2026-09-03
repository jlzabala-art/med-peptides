"use client";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import { Search, Users, Plus, Archive, CheckCircle2, Trash2, FilePlus, UserPlus, ClipboardList, Activity, Mail, Wand2, ScanText, Download, RefreshCw } from 'lucide-react';
import * as fb from '../../../firebase';
const db = fb?.db;

import PhysiciansAnalyticsHeader from './PhysiciansAnalyticsHeader';
import PhysicianProfileDrawer from './PhysicianProfileDrawer';
import UniversalFormDrawer from '../../shared/UniversalFormDrawer';
import DataModule from '../../ui/DataModule';
import AIQuickActionButton from '../../ui/AIQuickActionButton';
import InlineAlert from '../../ui/InlineAlert';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import notifier from '../../../services/NotificationService';
import { useToast } from '../../../hooks/useToast';
import { exportToCSV } from '../../../utils/exportUtils';
import { useFirestorePaginatedCollection } from '../../../hooks/data/useFirestorePaginatedCollection';
import CopyableId from '../../ui/CopyableId';
import StatusChip from '../../ui/StatusChip';
import DataTable from '../../ui/DataTable';
import EmptyState from '../../ui/EmptyState';
import AppActionGroup from '../../ui/AppActionGroup';
import MobileDoctorCard from './mobile/MobileDoctorCard';
import MobileActionSheet from '../../ui/MobileActionSheet';
import { Eye, Edit3, XCircle } from '@/lib/icons';

export default function AdminPhysiciansTab() {
  // UI State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // 'create_physician', 'assign_patient', 'assign_am', 'create_prescription'
  const [actionDoctor, setActionDoctor] = useState(null);
  const [mobileActionDoctor, setMobileActionDoctor] = useState(null);

  const handleMobileQuickAction = React.useCallback((action, doctor) => {
    if (action === 'menu') {
      setMobileActionDoctor(doctor);
    } else if (action === 'view') {
      setSelectedDoctor(doctor);
    } else if (action === 'patients') {
      setSelectedDoctor({ ...doctor, activeTab: 'patients' });
    } else if (action === 'approve') {
      // Direct call to approve bulk action logic or similar
    }
  }, []);

  const mobileCardPropsForTable = React.useMemo(() => ({
    onQuickAction: handleMobileQuickAction,
  }), [handleMobileQuickAction]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const filterStatus = searchParams.get('status') || 'all';
  const filterSpecialty = searchParams.get('specialty') || 'all';
  const filterRange = searchParams.get('range') || 'all';
  const filterActivity = searchParams.get('activity') || 'all'; // Default to all

  const updateUrlParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (searchParams.get('q') || '')) {
        updateUrlParam('q', searchTerm);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, searchParams]);

  const [selectedIds, setSelectedIds] = useState([]);
  
  // Duplicate Detection State
  const [duplicateFound, setDuplicateFound] = useState(null);
  const [initialFormData, setInitialFormData] = useState({});
  
  // Real Data State
  const [globalStats, setGlobalStats] = useState({ totalPhysicians: 0, totalPrescriptions: 0, totalPatients: 0, totalRevenue: 0 });

  const algoliaFacetFilters = React.useMemo(() => {
    const filters = [];
    if (filterStatus && filterStatus !== 'all') filters.push(`status:${filterStatus}`);
    if (filterSpecialty && filterSpecialty !== 'all') filters.push(`specialty:${filterSpecialty}`);
    if (filterActivity === 'has_prescriptions') filters.push('prescriptionCount>0');
    return filters;
  }, [filterStatus, filterSpecialty, filterActivity]);

  const algoliaNumericFilters = React.useMemo(() => {
    const filters = [];
    if (filterRange && filterRange !== 'all') {
      const date = new Date();
      if (filterRange === '7d') date.setDate(date.getDate() - 7);
      else if (filterRange === '30d') date.setDate(date.getDate() - 30);
      else if (filterRange === '90d') date.setDate(date.getDate() - 90);
      else if (filterRange === '1y') date.setFullYear(date.getFullYear() - 1);
      filters.push(`createdAt_ts>=${date.getTime()}`);
    }
    return filters;
  }, [filterRange]);

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'atlas_physicians',
    searchTerm,
    { 
      hitsPerPage: 50,
      facetFilters: algoliaFacetFilters.length > 0 ? algoliaFacetFilters : undefined,
      numericFilters: algoliaNumericFilters.length > 0 ? algoliaNumericFilters : undefined
    },
    300
  );

  // Server-side query construction for Firestore fallback (when Algolia is not active)
  const buildServerQuery = () => {
    const conditions = [];
    const orders = [];
    
    // Always restrict to doctors
    conditions.push(['role', 'in', ['doctor', 'physician']]);

    if (filterActivity === 'has_prescriptions') {
      conditions.push(['prescriptionCount', '>', 0]);
      orders.push(['prescriptionCount', 'desc']);
    } else {
      orders.push(['createdAt', 'desc']);
    }

    if (filterStatus !== 'all') {
      conditions.push(['status', '==', filterStatus]);
    }
    if (filterSpecialty !== 'all') {
      conditions.push(['specialty', '==', filterSpecialty]);
    }
    if (filterRange !== 'all') {
      const d = new Date();
      if (filterRange === '7d') d.setDate(d.getDate() - 7);
      else if (filterRange === '30d') d.setDate(d.getDate() - 30);
      else if (filterRange === '90d') d.setDate(d.getDate() - 90);
      else if (filterRange === '1y') d.setFullYear(d.getFullYear() - 1);
      conditions.push(['createdAt', '>=', d]);
    }

    return { conditions, orders };
  };

  const { conditions: serverConditions, orders: serverOrders } = React.useMemo(() => buildServerQuery(), [filterStatus, filterSpecialty, filterRange, filterActivity]);

  const {
    data: doctors,
    isLoading: loading,
    isFetchingMore,
    hasMore,
    loadMore,
    refresh
  } = useFirestorePaginatedCollection('users', {
    pageSize: 50,
    whereConditions: serverConditions,
    orderByFields: serverOrders
  });

  const physicianSchema = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'text', required: true },
    { name: 'specialty', label: 'Specialty', type: 'select', required: true, options: [
        { value: 'Functional Medicine', label: 'Functional Medicine' },
        { value: 'Longevity', label: 'Longevity' },
        { value: 'Anti-Aging', label: 'Anti-Aging' },
        { value: 'Endocrinology', label: 'Endocrinology' },
        { value: 'General Practice', label: 'General Practice' }
    ]},
    { name: 'clinicName', label: 'Clinic / Hospital', type: 'text', required: true },
    { name: 'licenseNumber', label: 'License Number', type: 'text', required: false },
    { name: 'roleTemplate', label: 'Permissions Role', type: 'select', required: true, options: [
        { value: 'basic', label: 'Basic (Portal only)' },
        { value: 'standard', label: 'Standard (+ Catalog)' },
        { value: 'senior', label: 'Senior (+ Prescribe)' }
    ]}
  ];

  const prescriptionSchema = [
    { name: 'patientId', label: 'Patient Name or ID', type: 'text', required: true },
    { name: 'diagnosis', label: 'Diagnosis', type: 'text', required: true },
    { name: 'clinicalNotes', label: 'Clinical Notes', type: 'textarea', required: false },
  ];

  const assignPatientSchema = [
    { name: 'patientEmail', label: 'Patient Email', type: 'email', required: true },
    { name: 'relationshipType', label: 'Relationship Type', type: 'select', required: true, options: [
        { value: 'primary', label: 'Primary Care' },
        { value: 'specialist', label: 'Specialist' }
    ]}
  ];

  const assignAMSchema = [
    { name: 'amEmail', label: 'Account Manager', type: 'account-manager-select', required: true, placeholder: 'Select account manager...' },
    { name: 'notes', label: 'Assignment Notes', type: 'textarea', required: false }
  ];

  const handleActionSubmit = async (formData) => {
    try {
      if (activeAction === 'create_physician') {
        const newDoc = {
          ...formData,
          role: 'doctor',
          createdAt: new Date(),
          status: 'active',
          approved: true,
          prescriptionCount: 0
        };
        await addDoc(collection(db, 'users'), newDoc);
        notifier.success('Physician created successfully');
      } else if (activeAction === 'create_prescription') {
        await addDoc(collection(db, 'prescriptions'), {
          ...formData,
          physicianId: actionDoctor.id,
          doctorName: actionDoctor.displayName || `${actionDoctor.firstName} ${actionDoctor.lastName}`,
          clinic: actionDoctor.clinicName || 'Atlas Clinic',
          status: 'draft',
          createdAt: new Date(),
          sourceType: 'Manual Entry'
        });
        await updateDoc(doc(db, 'users', actionDoctor.id), { prescriptionCount: (actionDoctor.prescriptionCount || 0) + 1 });
        notifier.success('Prescription drafted successfully');
      } else if (activeAction === 'assign_patient') {
        await addDoc(collection(db, 'doctor_patient_relationships'), {
          ...formData,
          doctorId: actionDoctor.id,
          doctorName: actionDoctor.displayName || `${actionDoctor.firstName} ${actionDoctor.lastName}`,
          createdAt: new Date(),
          status: 'active'
        });
        notifier.success('Patient assigned successfully');
      } else if (activeAction === 'assign_am') {
        await updateDoc(doc(db, 'users', actionDoctor.id), {
          accountManagerEmail: formData.amEmail,
          accountManagerNotes: formData.notes || '',
          updatedAt: new Date()
        });
        notifier.success('Account Manager assigned');
      }
      setActiveAction(null);
      setActionDoctor(null);
      refresh();
    } catch (err) {
      notifier.error('Action failed: ' + err.message);
      console.error(err);
    }
  };

  const handleValuesChange = async (newData) => {
    if (activeAction === 'create_physician' && newData.email && newData.email.includes('@') && newData.email.length > 5) {
      try {
        const q = query(collection(db, 'users'), where('email', '==', newData.email), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const found = snap.docs[0].data();
          if (found.email === newData.email && duplicateFound?.email !== found.email) {
            setDuplicateFound(found);
          }
        }
      } catch (err) {
        console.error("Error checking duplicate:", err);
      }
    }
  };

  const handlePasteParse = (text) => {
    if (!text.trim()) return;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const updates = {};
    lines.forEach(line => {
      if (line.includes('@')) updates.email = line;
      else if (/^\+?[0-9\s\-\(\)]+$/.test(line) && line.length > 7) updates.phone = line;
      else if (line.toLowerCase().includes('dr.') || line.toLowerCase().includes('dr ')) {
        const nameParts = line.replace(/dr\.?\s*/i, '').split(' ');
        updates.firstName = nameParts[0];
        if (nameParts.length > 1) updates.lastName = nameParts.slice(1).join(' ');
      }
      else if (line.toLowerCase().includes('clinic') || line.toLowerCase().includes('hospital')) {
        updates.clinicName = line;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      setInitialFormData(prev => ({ ...prev, ...updates }));
    }
  };

  const customHeader = duplicateFound ? (
    <InlineAlert
      type="info"
      title="Existing Record Found"
      message={`An account with email ${duplicateFound.email} already exists in the system (Role: ${duplicateFound.role}). Would you like to load their existing details?`}
      action={{
        label: "Load Details",
        onClick: () => {
          setInitialFormData(duplicateFound);
          setDuplicateFound(null);
        }
      }}
      onClose={() => setDuplicateFound(null)}
    />
  ) : (
    <div style={{ backgroundColor: 'var(--surface-sunken)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border)' }}>
      <label className="gcp-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Wand2 size={16} color="var(--primary)" />
        AI Auto-fill
      </label>
      <textarea 
        className="gcp-input" 
        placeholder="Paste physician details here (Name, Email, Clinic...) to auto-fill" 
        rows={2}
        onChange={(e) => handlePasteParse(e.target.value)}
        style={{ resize: 'vertical' }}
      />
    </div>
  );

  const fetchGlobalStats = async () => {
    try {
      const metaSnap = await getDocs(query(collection(db, 'meta')));
      const metaDoc = metaSnap.docs.find(d => d.id === 'physician_stats');
      if (metaDoc) {
        const data = metaDoc.data();
        setGlobalStats({
          totalPhysicians:    data.totalPhysicians    || 0,
          totalPrescriptions: data.totalPrescriptions || 0,
          totalPatients:      data.totalPatients      || 0,
          totalRevenue:       data.totalRevenue       || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching physician meta stats:", err);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const filteredDoctors = isAlgoliaActive && searchTerm.trim()
    ? algoliaHits.map(h => doctors.find(d => d.id === h.objectID) || { ...h, id: h.objectID }).filter(Boolean)
    : doctors;

  const finalFilteredDoctors = filteredDoctors.filter(d => {
    // We keep client-side filtering as a safety net, but it's largely redundant 
    // now that server-side queries handle it directly.
    const status = d.isArchived ? 'archived' : (d.status || 'active');
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (filterSpecialty !== 'all' && d.specialty !== filterSpecialty) return false;
    
    if (filterActivity === 'has_prescriptions' && (!d.prescriptionCount || d.prescriptionCount <= 0)) return false;

    if (filterRange !== 'all') {
      const dDate = d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date(d.createdAt);
      if (!isNaN(dDate.getTime())) {
        const startDate = new Date();
        if (filterRange === '7d') startDate.setDate(startDate.getDate() - 7);
        else if (filterRange === '30d') startDate.setDate(startDate.getDate() - 30);
        else if (filterRange === '90d') startDate.setDate(startDate.getDate() - 90);
        else if (filterRange === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        if (dDate < startDate) return false;
      }
    }
    
    return true;
  });

  const capitalizeName = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  const getDoctorName = (d) => capitalizeName(d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Unnamed Physician');
  const getPatientsCount = (d) => d.patientCount ?? 0;
  const getOrdersData = (d) => ({ count: d.orderCount ?? 0, revenue: d.totalRevenue ?? 0 });

  const handleBulkExportCSV = () => {
    const items = finalFilteredDoctors.filter(d => selectedIds.includes(d.id));
    if (!items.length) return;
    exportToCSV(
      items.map(d => ({
        id: d.id,
        name: getDoctorName(d),
        email: d.email,
        specialty: d.specialty || 'General',
        clinic: d.clinicName || '-',
        status: d.isArchived ? 'Archived' : (d.status || 'Active'),
        patients: getPatientsCount(d),
        orders: getOrdersData(d).count,
        revenue: getOrdersData(d).revenue
      })),
      `physicians_export_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Specialty', accessor: 'specialty' },
        { header: 'Clinic', accessor: 'clinic' },
        { header: 'Status', accessor: 'status' },
        { header: 'Patients', accessor: 'patients' },
        { header: 'Orders', accessor: 'orders' },
        { header: 'Revenue (AED)', accessor: 'revenue' },
      ]
    );
  };

  const handleBulkAction = async (action) => {
    if (!selectedIds.length) return;
    let msg = `Perform ${action} on ${selectedIds.length} physicians?`;
    if (action === 'delete') msg = `PERMANENTLY DELETE ${selectedIds.length} physicians? This cannot be undone!`;
    
    notifier.confirmCritical(msg, async () => {
      try {
        for (const uid of selectedIds) {
          const userRef = doc(db, 'users', uid);
          if (action === 'approve') await updateDoc(userRef, { status: 'active', approved: true });
          if (action === 'revoke') await updateDoc(userRef, { status: 'pending', approved: false });
          if (action === 'archive') await updateDoc(userRef, { isArchived: true });
          if (action === 'delete') await updateDoc(userRef, { isDeleted: true });
        }
        setSelectedIds([]);
        fetchPhysicianData();
        toast.success(`Bulk action ${action} completed`);
      } catch (err) {
        toast.error('Bulk action failed.');
        console.error(err);
      }
    });
  };

  const columns = [
    {
      key: 'physician',
      header: 'Physician',
      width: '40%',
      render: (d) => {
        const name = getDoctorName(d);
        const clinicInfo = [d.specialty || 'General', d.clinicName].filter(Boolean).join(' • ');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.email}</span>
                <CopyableId value={d.id} iconOnly={true} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontWeight: 500 }}>
                {clinicInfo}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (d) => {
        const statusStr = d.isArchived ? 'archived' : (d.status || 'active');
        return <StatusChip status={statusStr} />;
      }
    },
    {
      key: 'patients',
      header: 'Patients',
      width: '18%',
      align: 'center',
      render: (d) => {
        const pts = getPatientsCount(d);
        if (pts > 0) {
          return (
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDoctor({ ...d, activeTab: 'patients' });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  color: '#d97706',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                title={`View ${pts} assigned patients`}
              >
                {pts}
              </button>
            </div>
          );
        }
        return <div style={{ fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>0</div>;
      }
    },
    {
      key: 'prescriptions',
      header: 'Rx Count',
      width: '18%',
      align: 'center',
      render: (d) => {
        const count = d.prescriptionCount ?? 0;
        const name = getDoctorName(d);
        if (count > 0) {
          return (
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/prescriptions?doctorId=${d.id}&doctorName=${encodeURIComponent(name)}`);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-success-bg, rgba(22, 163, 74, 0.1))',
                  color: 'var(--color-success, #16a34a)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                title={`View all ${count} prescriptions for ${name}`}
              >
                {count}
              </button>
            </div>
          );
        }
        return <div style={{ fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>0</div>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '200px',
      align: 'right',
      render: (d) => {
        const actions = [
          {
            type: 'view_patients',
            label: 'View Patients',
            onClick: () => setSelectedDoctor({ ...d, activeTab: 'patients' })
          },
          {
            type: 'create_prescription',
            label: 'New Prescription',
            onClick: () => { setActionDoctor(d); setActiveAction('create_prescription'); }
          },
          {
            type: 'import_prescription',
            label: 'Import Prescription',
            onClick: () => { setActionDoctor(d); setActiveAction('assign_patient'); }
          },
          {
            type: 'assign_am',
            label: 'Assign Account Manager',
            onClick: () => { setActionDoctor(d); setActiveAction('assign_am'); }
          },
          {
            type: 'archive',
            label: 'Archive Physician',
            onClick: () => { setSelectedIds([d.id]); handleBulkAction('archive'); }
          }
        ];
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <AppActionGroup actions={actions} maxVisible={3} />
          </div>
        );
      }
    }
  ];

  // Removed early return for showOnboarding so Drawer renders over the module

  const filterOptionsConfig = [
    {
      key: 'status',
      label: 'Status',
      value: filterStatus,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' }
      ],
      onChange: (val) => updateUrlParam('status', val)
    },
    {
      key: 'specialty',
      label: 'Specialty',
      value: filterSpecialty,
      options: [
        { label: 'All Specialties', value: 'all' },
        { label: 'Functional Medicine', value: 'Functional Medicine' },
        { label: 'Longevity', value: 'Longevity' },
        { label: 'Anti-Aging', value: 'Anti-Aging' },
        { label: 'Endocrinology', value: 'Endocrinology' },
        { label: 'General Practice', value: 'General Practice' }
      ],
      onChange: (val) => updateUrlParam('specialty', val)
    },
    {
      key: 'range',
      label: 'Joined',
      value: filterRange,
      options: [
        { label: 'All Time', value: 'all' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Last 90 Days', value: '90d' },
        { label: 'Last 1 Year', value: '1y' }
      ],
      onChange: (val) => updateUrlParam('range', val)
    }
  ];

  const activeFilters = [
    filterStatus && filterStatus !== 'all' && { key: 'status', label: 'Status', value: filterStatus, onRemove: () => updateUrlParam('status', 'all') },
    filterSpecialty && filterSpecialty !== 'all' && { key: 'specialty', label: 'Specialty', value: filterSpecialty, onRemove: () => updateUrlParam('specialty', 'all') },
    filterRange && filterRange !== 'all' && { key: 'range', label: 'Joined', value: filterRange, onRemove: () => updateUrlParam('range', 'all') }
  ].filter(Boolean);

  const getFormConfig = () => {
    switch (activeAction) {
      case 'create_physician':
        return {
          title: "Onboard New Physician",
          subtitle: "Create a new doctor account and configure portal permissions.",
          schema: physicianSchema,
          initialData: initialFormData,
          submitLabel: "Create Physician Account",
          customHeader: customHeader
        };
      case 'create_prescription':
        return {
          title: "Draft Prescription",
          subtitle: `Creating prescription on behalf of Dr. ${actionDoctor?.lastName || actionDoctor?.firstName}`,
          schema: prescriptionSchema,
          initialData: {},
          submitLabel: "Save Draft",
          customHeader: null
        };
      case 'assign_patient':
        return {
          title: "Assign Patient",
          subtitle: `Assign a patient to Dr. ${actionDoctor?.lastName || actionDoctor?.firstName}`,
          schema: assignPatientSchema,
          initialData: {},
          submitLabel: "Assign Patient",
          customHeader: null
        };
      case 'assign_am':
        return {
          title: "Assign Account Manager",
          subtitle: `Set Account Manager for Dr. ${actionDoctor?.lastName || actionDoctor?.firstName}`,
          schema: assignAMSchema,
          initialData: {},
          submitLabel: "Save Assignment",
          customHeader: null
        };
      default:
        return { schema: [] };
    }
  };

  const formConfig = getFormConfig();

  return (
    <>
      <DataModule
        loading={loading}
        title="Physicians"
        subtitle="Licensed practitioners, specialized scopes, and prescribing permissions."
        icon={Users}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AIQuickActionButton
              label="AI Onboard Doctor"
              onClick={() => { setInitialFormData({}); setActiveAction('create_physician'); }}
              title="Parse physician credentials, specialty, and clinical focus with AI"
            />
            <button
              type="button"
              onClick={() => { setInitialFormData({}); setActiveAction('create_physician'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                backgroundColor: 'var(--color-primary, #003666)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <UserPlus size={16} />
              <span>Onboard Physician</span>
            </button>
          </div>
        }
        mobileOverflowActions={[
          { label: 'Export CSV', icon: Download, onClick: handleBulkExportCSV },
          { label: 'Refresh', icon: RefreshCw, onClick: () => notifier.info("Refreshing physicians...") } // or actual refetch if available
        ]}
        kpis={<PhysiciansAnalyticsHeader stats={globalStats} />}
        namespace="admin-physicians"
        searchPlaceholder="Search physicians by name, email, clinic..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={loading && !algoliaLoading ? undefined : finalFilteredDoctors.length}
        bulkActions={[
          { label: 'Export CSV', icon: <Archive size={14} />, onClick: handleBulkExportCSV },
          { label: 'Assign Protocol', icon: <ClipboardList size={14} />, onClick: () => { notifier.info('Assign Protocol modal coming soon'); setSelectedIds([]); } },
          { label: 'Request Audit', icon: <Activity size={14} />, onClick: () => handleBulkAction('request_audit') },
          { label: 'Safety Update', icon: <Mail size={14} />, onClick: () => { notifier.info('Safety Update mailer coming soon'); setSelectedIds([]); } },
          { label: 'Approve', icon: <CheckCircle2 size={14} />, onClick: () => handleBulkAction('approve') },
          { label: 'Archive', icon: <Archive size={14} />, onClick: () => handleBulkAction('archive'), variant: 'danger' },
        ]}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        filters={activeFilters}
        filterOptions={filterOptionsConfig}
        data={finalFilteredDoctors}
        columns={columns}
        onRowClick={(d) => setSelectedDoctor(d)}
        mobileCardComponent={MobileDoctorCard}
        mobileCardProps={mobileCardPropsForTable}
        emptyState={{
          title: "No physicians found",
          subtitle: "Adjust search or filters to see results"
        }}
      />

      {selectedDoctor && (
        <PhysicianProfileDrawer 
          doctor={selectedDoctor} 
          onClose={() => setSelectedDoctor(null)}
        />
      )}
      <UniversalFormDrawer
        isOpen={activeAction !== null}
        onClose={() => {
          setActiveAction(null);
          setActionDoctor(null);
          setDuplicateFound(null);
          setInitialFormData({});
        }}
        title={formConfig.title}
        subtitle={formConfig.subtitle}
        schema={formConfig.schema}
        initialData={formConfig.initialData}
        onSubmit={handleActionSubmit}
        onValuesChange={handleValuesChange}
        customHeader={formConfig.customHeader}
        submitLabel={formConfig.submitLabel}
        width="600px"
      />
      
      {/* Mobile quick-action sheet for doctors */}
      <MobileActionSheet
        isOpen={!!mobileActionDoctor}
        onClose={() => setMobileActionDoctor(null)}
        title={mobileActionDoctor?.displayName || mobileActionDoctor?.email || 'Physician'}
        items={[
          {
            label: 'View Profile',
            icon: Eye,
            onClick: () => setSelectedDoctor(mobileActionDoctor),
          },
          {
            label: 'View Patients',
            icon: Users,
            onClick: () => setSelectedDoctor({ ...mobileActionDoctor, activeTab: 'patients' }),
          },
          {
            label: 'Approve',
            icon: CheckCircle2,
            onClick: async () => {
              if (!mobileActionDoctor) return;
              try {
                await updateDoc(doc(db, 'atlas_physicians', mobileActionDoctor.id), { status: 'approved' });
                toast.success('Physician approved');
                // Could refresh data here
              } catch (e) {
                toast.error('Failed to approve');
              }
            },
          },
          {
            label: 'Archive',
            icon: Archive,
            variant: 'danger',
            onClick: () => {
              notifier.confirmCritical(
                `Archive physician ${mobileActionDoctor?.email}?`,
                async () => {
                  await updateDoc(doc(db, 'atlas_physicians', mobileActionDoctor.id), { isArchived: true, status: 'inactive' });
                  toast.success('Physician archived');
                }
              );
            },
          },
        ]}
      />
    </>
  );
}