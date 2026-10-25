"use client";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, doc, updateDoc, addDoc } from 'firebase/firestore';
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
import { Eye, Edit3, XCircle, Layers, ExternalLink, Key, Share2, MessageCircle } from '@/lib/icons';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import DoctorAccessLinkModal from './DoctorAccessLinkModal';
import UniversalShareDrawer from '../../ui/UniversalShareDrawer';
import EngagementBadge from '../../ui/EngagementBadge';
import UniversalActionCell from '../../ui/UniversalActionCell';

export default function AdminPhysiciansTab() {
  // UI State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // 'create_physician', 'assign_patient', 'assign_am', 'create_prescription'
  const [actionDoctor, setActionDoctor] = useState(null);
  const [mobileActionDoctor, setMobileActionDoctor] = useState(null);
  const [accessModalDoctor, setAccessModalDoctor] = useState(null);
  const [shareDoctor, setShareDoctor] = useState(null);

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
    }

    if (filterStatus !== 'all') {
      conditions.push(['status', '==', filterStatus]);
    }
    if (filterSpecialty !== 'all') {
      conditions.push(['specialty', '==', filterSpecialty]);
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
    { name: 'country', label: 'Country of Practice / Origin', type: 'select', required: false, options: [
        { value: 'AE', label: '🇦🇪 United Arab Emirates' },
        { value: 'DE', label: '🇩🇪 Germany' },
        { value: 'ES', label: '🇪🇸 Spain' },
        { value: 'GB', label: '🇬🇧 United Kingdom' },
        { value: 'US', label: '🇺🇸 United States' },
        { value: 'CH', label: '🇨🇭 Switzerland' },
        { value: 'SA', label: '🇸🇦 Saudi Arabia' },
        { value: 'Other', label: '🌐 Other Country' },
    ]},
    { name: 'idType', label: 'Document Type', type: 'select', required: false, options: [
        { value: 'passport', label: '🛂 Passport (Visiting / International)' },
        { value: 'emirates_id', label: '🪪 Emirates ID (UAE Resident)' },
        { value: 'national_id', label: '🆔 National ID' },
    ]},
    { name: 'nationalId', label: 'Identity Document # (Passport / EID)', type: 'text', required: false },
    { name: 'specialty', label: 'Specialty', type: 'select', required: true, options: [
        { value: 'Dermatology & Hair Restoration', label: 'Dermatology & Hair Restoration' },
        { value: 'Functional Medicine', label: 'Functional Medicine' },
        { value: 'Longevity', label: 'Longevity' },
        { value: 'Anti-Aging', label: 'Anti-Aging' },
        { value: 'Endocrinology', label: 'Endocrinology' },
        { value: 'General Practice', label: 'General Practice' }
    ]},
    { name: 'clinicName', label: 'Clinic / Hospital', type: 'text', required: true },
    { name: 'licenseNumber', label: 'Primary Medical License #', type: 'text', required: false },
    { name: 'dhaLicense', label: 'DHA License (Dubai)', type: 'text', required: false },
    { name: 'germanMedicalId', label: 'German Medical ID / Arztausweis', type: 'text', required: false },
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
  const getDoctorSlug = (d) => {
    if (d?.slug) return d.slug;
    const name = getDoctorName(d);
    return String(name || '')
      .toLowerCase()
      .replace(/^dr[a]?\.\s*/i, '')
      .replace(/^dr[a]?\s*/i, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };
  const getPatientsCount = (d) => d.patientCount ?? 0;
  const getOrdersData = (d) => ({ count: d.orderCount ?? 0, revenue: d.totalRevenue ?? 0 });

  // Order physicians by number of patients and prescriptions descending
  const sortedDoctors = React.useMemo(() => {
    return [...finalFilteredDoctors].sort((a, b) => {
      const ptsA = (getPatientsCount(a) || a.prescriptionCount || 0);
      const ptsB = (getPatientsCount(b) || b.prescriptionCount || 0);
      if (ptsB !== ptsA) return ptsB - ptsA;
      const rxA = a.prescriptionCount || 0;
      const rxB = b.prescriptionCount || 0;
      if (rxB !== rxA) return rxB - rxA;
      return 0;
    });
  }, [finalFilteredDoctors]);

  const handleBulkExportCSV = () => {
    const items = sortedDoctors.filter(d => selectedIds.includes(d.id));
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

  const physicianExpandableRender = (d) => {
    const name = getDoctorName(d);
    const drSlug = getDoctorSlug(d);
    return (
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          fontSize: '0.85rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
            Contacto & Identificación
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{d.email || 'No email registered'}</span>
            {d.email && <CopyableId value={d.email} iconOnly={true} />}
          </div>
          {d.phone && (
            <div style={{ color: '#475569', fontSize: '0.8rem' }}>
              Tel: <span style={{ fontWeight: 500 }}>{d.phone}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Doctor ID:</span>
            <CopyableId value={d.id} />
          </div>
        </div>

        {/* Practice & Clinic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
            Centro Médico / Dónde Trabaja
          </span>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
            {d.clinicName || d.clinic || 'Clínica no asignada'}
          </div>
          <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.8rem' }}>
            {d.specialty || d.title || 'General Practitioner'}
          </div>
          {(d.dhaLicense || d.licenseNumber || d.licenseId) && (
            <div style={{ fontSize: '0.75rem', color: '#475569' }}>
              Licencia DHA: <span style={{ fontWeight: 600, color: '#0f172a' }}>{d.dhaLicense || d.licenseNumber || d.licenseId}</span>
            </div>
          )}
        </div>

        {/* Clinical Statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
            Métricas Clínicas
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d97706' }}>{getPatientsCount(d)}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Pacientes</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>{d.prescriptionCount || 0}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Prescripciones</div>
            </div>
          </div>
        </div>

        {/* Engagement en Portal Público */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
            Actividad en Portal
          </span>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <EngagementBadge
                viewCount={d.lastAssetViewCount || d.viewCount || 0}
                lastViewedAt={d.lastAssetViewedAt || d.lastActiveAt || d.lastLoginAt}
                sharedAt={d.lastAssetSharedAt}
                status={d.lastAssetReadStatus}
                size="sm"
              />
            </div>
            {d.lastAssetSharedTitle && (
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Último recurso: <strong>{d.lastAssetSharedTitle}</strong>
              </div>
            )}
            {d.lastLoginAt && (
              <div style={{ fontSize: '0.70rem', color: '#475569' }}>
                Último acceso 1-Tap: {new Date(d.lastLoginAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
            Acciones Rápidas
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <a
              href={`/dr/${encodeURIComponent(drSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <ExternalLink size={13} /> Ver Página Pública
            </a>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShareDoctor(d)}
              style={{
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                borderColor: '#1a73e8',
                color: '#1a73e8',
                background: '#e8f0fe',
                fontWeight: 700
              }}
              title="Compartir enlace trazado / Acceso 1-Tap para WhatsApp o Email"
            >
              <Share2 size={13} /> Compartir Perfil / Acceso 1-Tap
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => useWorkspaceStore.getState().loadUserIntoWorkspace(d, { role: 'doctor' })}
              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Layers size={13} /> Cargar en Workspace
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedDoctor({ ...d, activeTab: 'patients' })}
              style={{ fontSize: '0.78rem' }}
            >
              Ver Pacientes ({getPatientsCount(d)})
            </button>
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: 'physician',
      header: 'Physician',
      width: '24%',
      render: (d) => {
        const name = getDoctorName(d);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.92rem' }}>
              {name}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      render: (d) => {
        const statusStr = d.isArchived ? 'archived' : (d.status || 'active');
        return <StatusChip status={statusStr} />;
      }
    },
    {
      key: 'portalEngagement',
      header: 'Portal Activity',
      width: '14%',
      align: 'center',
      render: (d) => (
        <EngagementBadge
          viewCount={d.lastAssetViewCount || d.viewCount || 0}
          lastViewedAt={d.lastAssetViewedAt || d.lastActiveAt || d.lastLoginAt}
          sharedAt={d.lastAssetSharedAt}
          status={d.lastAssetReadStatus}
        />
      ),
    },
    {
      key: 'subscriptionTier',
      header: 'Plan / Tier',
      width: '10%',
      align: 'center',
      render: (d) => {
        const isPro = d.subscriptionTier === 'advanced' || d.subscriptionTier === 'pro';
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const nextTier = isPro ? 'basic' : 'advanced';
                try {
                  await updateDoc(doc(db, 'users', d.id), {
                    subscriptionTier: nextTier,
                    planUpdatedAt: new Date()
                  });
                  notifier.success(`Dr. ${d.firstName || d.displayName || 'Physician'} updated to ${nextTier === 'advanced' ? 'Pro' : 'Basic'}`);
                  refresh();
                } catch (err) {
                  notifier.error('Error updating plan: ' + err.message);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: isPro ? 600 : 500,
                cursor: 'pointer',
                border: isPro ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                backgroundColor: isPro ? '#eff6ff' : '#f8fafc',
                color: isPro ? '#1d4ed8' : '#64748b',
                transition: 'all 0.15s ease',
              }}
              title="Click to toggle between Basic and Pro"
            >
              {isPro ? 'Pro' : 'Basic'}
            </button>
          </div>
        );
      }
    },
    {
      key: 'patients',
      header: 'Patients',
      width: '10%',
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
      width: '12%',
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
      width: '18%',
      align: 'right',
      render: (d) => {
        const isPro = d.subscriptionTier === 'advanced' || d.subscriptionTier === 'pro';
        const actions = [
          {
            type: 'toggle_plan',
            label: isPro ? 'Cambiar a Básico' : 'Promocionar a Avanzado Pro',
            onClick: async () => {
              const nextTier = isPro ? 'basic' : 'advanced';
              try {
                await updateDoc(doc(db, 'users', d.id), {
                  subscriptionTier: nextTier,
                  planUpdatedAt: new Date()
                });
                notifier.success(`Doctor actualizado a ${nextTier === 'advanced' ? 'Avanzado Pro' : 'Básico'}`);
                refresh();
              } catch (err) {
                notifier.error('Error al actualizar plan: ' + err.message);
              }
            }
          },
          {
            type: 'share_doctor',
            label: 'Compartir Perfil / Acceso 1-Tap',
            icon: Share2,
            onClick: () => setShareDoctor(d)
          },
          {
            type: 'view_public_page',
            label: 'View Public Page',
            icon: ExternalLink,
            onClick: () => {
              const drSlug = getDoctorSlug(d);
              window.open(`/dr/${encodeURIComponent(drSlug)}`, '_blank');
            }
          },
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
            type: 'workspace',
            label: 'Abrir en Workspace',
            icon: Layers,
            onClick: () => {
              useWorkspaceStore.getState().loadUserIntoWorkspace(d, { role: 'doctor' });
            }
          },
          {
            type: 'archive',
            label: 'Archive Physician',
            onClick: () => { setSelectedIds([d.id]); handleBulkAction('archive'); }
          }
        ];
        return (
          <UniversalActionCell
            entity={d}
            entityType="doctor"
            viewHref={`/dr/${encodeURIComponent(getDoctorSlug(d))}`}
            onShare={() => setShareDoctor(d)}
            extraActions={actions}
          />
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
        resultCount={loading && !algoliaLoading ? undefined : sortedDoctors.length}
        bulkActions={[
          { label: 'Export CSV', icon: Archive, onClick: handleBulkExportCSV },
          { label: 'Assign Protocol', icon: ClipboardList, onClick: () => { notifier.info('Assign Protocol modal coming soon'); setSelectedIds([]); } },
          { label: 'Request Audit', icon: Activity, onClick: () => handleBulkAction('request_audit') },
          { label: 'Safety Update', icon: Mail, onClick: () => { notifier.info('Safety Update mailer coming soon'); setSelectedIds([]); } },
          { label: 'Approve', icon: CheckCircle2, onClick: () => handleBulkAction('approve') },
          { label: 'Archive', icon: Archive, onClick: () => handleBulkAction('archive'), variant: 'danger' },
        ]}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        filters={activeFilters}
        filterOptions={filterOptionsConfig}
        data={sortedDoctors}
        columns={columns}
        expandableRender={physicianExpandableRender}
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
                await updateDoc(doc(db, 'users', mobileActionDoctor.id), { status: 'approved' });
                toast.success('Physician approved');
                refresh();
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
                  await updateDoc(doc(db, 'users', mobileActionDoctor.id), { isArchived: true, status: 'inactive' });
                  toast.success('Physician archived');
                  refresh();
                }
              );
            },
          },
        ]}
      />

      {/* Universal Share Drawer (Polymorphic: Doctor profile & 1-Tap onboarding) */}
      <UniversalShareDrawer
        isOpen={Boolean(shareDoctor || accessModalDoctor)}
        onClose={() => {
          setShareDoctor(null);
          setAccessModalDoctor(null);
        }}
        entityType="doctor"
        entity={shareDoctor || accessModalDoctor}
      />
    </>
  );
}