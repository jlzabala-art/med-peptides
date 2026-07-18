"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, getCountFromServer, getAggregateFromServer, sum, count, doc, updateDoc } from 'firebase/firestore';
import { Search, Users, Plus, Archive, CheckCircle2, Trash2, FilePlus, UserPlus, ClipboardList, Activity, Mail } from 'lucide-react';
import * as fb from '../../../firebase';
const db = fb?.db;

import PhysiciansAnalyticsHeader from './PhysiciansAnalyticsHeader';
import PhysicianProfileDrawer from './PhysicianProfileDrawer';
import PhysicianOnboardingWizard from './PhysicianOnboardingWizard';
import PhysicianFiltersBar from './PhysicianFiltersBar';
import DataModule from '../../ui/DataModule';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import notifier from '../../../services/NotificationService';
import { useToast } from '../../../hooks/useToast';
import { exportToCSV } from '../../../utils/exportUtils';

export default function AdminPhysiciansTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [doctors, setDoctors] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalPhysicians: 0, activePhysicians: 0, newThisMonth: 0, totalRevenue: 0 });
  const [patientMap, setPatientMap] = useState({});
  const [orderMap, setOrderMap] = useState({});

  // UI State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'atlas_physicians',
    searchTerm,
    { hitsPerPage: 50 },
    300
  );

  const fetchPhysicianData = async () => {
    setLoading(true);
    try {
      const docsQuery = query(collection(db, 'users'), where('roles', 'array-contains', 'doctor'), limit(100));
      const docsSnap = await getDocs(docsQuery);
      const docsList = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const revenueSnap = await getAggregateFromServer(collection(db, 'orders'), { total: sum('total') });
      const revenueAmount = revenueSnap.data().total || 0;

      const totalDocsSnap = await getCountFromServer(query(collection(db, 'users'), where('roles', 'array-contains', 'doctor')));
      const totalDocsCount = totalDocsSnap.data().count;

      const activeDocsSnap = await getCountFromServer(query(collection(db, 'users'), where('roles', 'array-contains', 'doctor'), where('status', '==', 'active')));
      const activeDocsCount = activeDocsSnap.data().count;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      let newDocsCount = 0;
      try {
        const newDocsSnap = await getCountFromServer(query(collection(db, 'users'), where('roles', 'array-contains', 'doctor'), where('createdAt', '>=', startOfMonth)));
        newDocsCount = newDocsSnap.data().count;
      } catch(e) {
        console.warn("Index missing for new this month calculation, fallback to 0");
      }

      setGlobalStats({
        totalPhysicians: totalDocsCount,
        activePhysicians: activeDocsCount,
        newThisMonth: newDocsCount,
        totalRevenue: revenueAmount
      });

      const pMap = {};
      const oMap = {};
      await Promise.all(docsList.map(async (doc) => {
        try {
          const pCountSnap = await getCountFromServer(query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', doc.id)));
          pMap[doc.id] = [{ id: 'mock', length: pCountSnap.data().count }];

          const oAggSnap = await getAggregateFromServer(
            query(collection(db, 'orders'), where('supervisingPhysicianId', '==', doc.id)),
            { totalRev: sum('total'), orderCount: count() }
          );
          const oData = oAggSnap.data();
          const fakeOrderArr = new Array(oData.orderCount).fill({ total: 0 });
          if (oData.orderCount > 0) fakeOrderArr[0] = { total: oData.totalRev || 0 };
          oMap[doc.id] = fakeOrderArr;
        } catch(e) {
          console.error("Aggregation error for doc", doc.id, e);
          pMap[doc.id] = [];
          oMap[doc.id] = [];
        }
      }));

      setDoctors(docsList);
      setPatientMap(pMap);
      setOrderMap(oMap);
    } catch (err) {
      console.error("Error fetching physician data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhysicianData();
  }, []);

  const filteredDoctors = isAlgoliaActive && searchTerm.trim()
    ? algoliaHits.map(h => doctors.find(d => d.id === h.objectID) || { ...h, id: h.objectID }).filter(Boolean)
    : doctors;

  const finalFilteredDoctors = filteredDoctors.filter(d => {
    const status = d.isArchived ? 'archived' : (d.status || 'active');
    if (filters.status && filters.status !== 'all' && status !== filters.status) return false;
    return true;
  });

  const getDoctorName = (d) => d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Unnamed Physician';
  const getPatientsCount = (doctorId) => patientMap[doctorId]?.length || 0;
  const getOrdersData = (doctorId) => {
    const docOrders = orderMap[doctorId] || [];
    const rev = docOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
    return { count: docOrders.length, revenue: rev };
  };

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
        patients: getPatientsCount(d.id),
        orders: getOrdersData(d.id).count,
        revenue: getOrdersData(d.id).revenue
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
      render: (d) => {
        const name = getDoctorName(d);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{d.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'specialty',
      header: 'Specialty / Clinic',
      render: (d) => (
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{d.specialty || 'General'}</div>
          <div style={{ color: 'var(--text-muted)' }}>{d.clinicName || '-'}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => {
        const statusStr = d.isArchived ? 'Archived' : (d.status || 'Active');
        const isError = statusStr === 'Archived' || statusStr === 'Pending';
        return (
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            backgroundColor: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            color: isError ? 'var(--color-danger)' : 'var(--color-success)'
          }}>
            {statusStr}
          </span>
        );
      }
    },
    {
      key: 'patients',
      header: 'Patients',
      render: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{getPatientsCount(d.id)}</span>
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{getOrdersData(d.id).count}</span>
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>AED {getOrdersData(d.id).revenue.toLocaleString()}</span>
    },
    {
      key: 'actions',
      header: '',
      render: (d) => (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedDoctor(d); }}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            View Profile
          </button>
          <button 
            title="Assign Patient"
            onClick={(e) => { e.stopPropagation(); toast.info('Assign Patient modal coming soon'); }}
            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
            <UserPlus size={14} />
          </button>
          <button 
            title="Create Prescription"
            onClick={(e) => { e.stopPropagation(); toast.info('Prescription creator coming soon'); }}
            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
            <FilePlus size={14} />
          </button>
        </div>
      )
    }
  ];

  if (showOnboarding) {
    return (
      <PhysicianOnboardingWizard 
        onClose={() => setShowOnboarding(false)}
        onComplete={(newDoc) => {
          setDoctors([newDoc, ...doctors]);
        }}
      />
    );
  }

  return (
    <DataModule
      title="Physicians Management"
      subtitle="Enterprise directory and performance tracking"
      icon={Users}
      primaryAction={{ label: "Add Physician", icon: Plus, onClick: () => setShowOnboarding(true) }}
      kpis={<PhysiciansAnalyticsHeader stats={globalStats} />}
      filtersBar={<PhysicianFiltersBar filters={filters} setFilters={setFilters} />}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search physicians by name, email, clinic (Algolia)..."
      resultCount={loading && !algoliaLoading ? undefined : finalFilteredDoctors.length}
      searchLoading={algoliaLoading}
      namespace="admin-physicians"
      data={finalFilteredDoctors}
      columns={columns}
      loading={loading}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      onRowClick={setSelectedDoctor}
      emptyState={{
        title: "No Physicians Found",
        description: "No physicians matched your criteria or none exist in the platform.",
        actionLabel: "Add First Physician",
        onAction: () => setShowOnboarding(true)
      }}
      bulkActions={[
        { label: 'Export CSV', icon: <Archive size={14} />, onClick: handleBulkExportCSV },
        { label: 'Assign Protocol', icon: <ClipboardList size={14} />, onClick: () => { toast.info('Assign Protocol modal coming soon'); setSelectedIds([]); } },
        { label: 'Request Audit', icon: <Activity size={14} />, onClick: () => handleBulkAction('request_audit') },
        { label: 'Safety Update', icon: <Mail size={14} />, onClick: () => { toast.info('Safety Update mailer coming soon'); setSelectedIds([]); } },
        { label: 'Approve', icon: <CheckCircle2 size={14} />, onClick: () => handleBulkAction('approve') },
        { label: 'Archive', icon: <Archive size={14} />, onClick: () => handleBulkAction('archive'), variant: 'danger' },
      ]}
    >
      {selectedDoctor && (
        <PhysicianProfileDrawer 
          doctor={selectedDoctor} 
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </DataModule>
  );
}