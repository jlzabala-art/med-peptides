"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, MapPin, Mail, FilePlus, UserPlus, ClipboardList, Loader2, Eye, FileUp } from '@/lib/icons';
import { useDrawer } from '../../../context/DrawerContext';
import { UniversalForm } from '../../shared/UniversalFormDrawer';
import notifier from '../../../services/NotificationService';
import { doc, updateDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;
import StandardDrawer from '../../ui/StandardDrawer';
import StandardDrawerTabs from '../../common/StandardDrawerTabs';
import DataTable from '../../ui/DataTable';
import StatusChip from '../../ui/StatusChip';
import ImportPrescriptionModal from '../../../features/prescriptions/components/ImportPrescriptionModal';
import DocumentPreviewModal from '../../ui/DocumentPreviewModal';

// ── Physician form schema ────────────────────────────────────────────────────
export const physicianSchema = [
  { name: 'firstName',   label: 'First Name',     type: 'text',   required: true },
  { name: 'lastName',    label: 'Last Name',      type: 'text',   required: true },
  { name: 'email',       label: 'Email Address',  type: 'email',  required: true },
  { name: 'phone',       label: 'Phone Number',   type: 'text',   required: true },
  { name: 'specialty',   label: 'Specialty',      type: 'select', required: true, options: [
    { value: 'Functional Medicine', label: 'Functional Medicine' },
    { value: 'Longevity',           label: 'Longevity'           },
    { value: 'Anti-Aging',          label: 'Anti-Aging'          },
    { value: 'Endocrinology',       label: 'Endocrinology'       },
    { value: 'General Practice',    label: 'General Practice'    },
  ]},
  { name: 'clinicName',    label: 'Clinic / Hospital', type: 'text', required: true  },
  { name: 'licenseNumber', label: 'License Number',    type: 'text', required: false },
  { name: 'roleTemplate',  label: 'Permissions Role',  type: 'select', required: true, options: [
    { value: 'basic',    label: 'Basic (Portal only)' },
    { value: 'standard', label: 'Standard (+ Catalog)' },
    { value: 'senior',   label: 'Senior (+ Prescribe)' },
  ]},
];

// ── Column definitions — fields taken directly from Firestore, no mapping ────
// prescriptions: { doctorId, patientId, patient:{name,email,phone}, status,
//                  diagnosis, clinicalNotes, createdAt, doctorName,
//                  fagron:{boxId, originalPdfUrl}, fileUrl, source }
const getPrescriptionColumns = (onRxClick) => [
  {
    key: 'patient', header: 'Patient', width: '35%',
    render: (p) => (
      <span 
        style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
        onClick={(e) => { 
          e.stopPropagation(); 
          if (onRxClick) onRxClick(p.id);
        }}
      >
        {p.patient?.name || p.patientName || '—'}
      </span>
    ),
  },
  {
    key: 'diagnosis', header: 'Diagnosis', width: '30%',
    render: (p) => (
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {p.diagnosis || (p.source === 'fagron_pdf_ocr' ? 'Fagron Genomics' : '—')}
      </span>
    ),
  },
  {
    key: 'status', header: 'Status', width: '20%',
    render: (p) => <StatusChip status={p.status || 'draft'} />,
  },
  {
    key: 'date', header: 'Date', width: '10%',
    render: (p) => p.createdAt?.seconds
      ? new Date(p.createdAt.seconds * 1000).toLocaleDateString()
      : '—',
  },
  {
    key: 'pdf', header: '', width: '5%',
    render: (p) => {
      const url = p.fileUrl || p.fagron?.originalPdfUrl;
      return url
        ? <PdfButton url={url} />
        : null;
    },
  },
];

// doctor_patient_relationships: { doctorId, patientId, patientName, patientEmail,
//                                  status, createdAt, source, initiatedByRole }
const PATIENT_COLUMNS = [
  { key: 'name',   header: 'Patient Name',  width: '38%', render: (r) => r.patientName  || '—' },
  { key: 'email',  header: 'Email',         width: '35%', render: (r) => r.patientEmail || '—' },
  { key: 'status', header: 'Status',        width: '15%', render: (r) => <StatusChip status={r.status || 'active'} /> },
  { key: 'date',   header: 'Linked',        width: '12%', render: (r) => r.createdAt?.seconds
      ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : '—' },
];

// orders: { orderId, userId, customerName, customer:{fullName,email}, status,
//            total, currency, createdAt, paymentStatus }
const ORDER_COLUMNS = [
  { key: 'order',  header: 'Order #', width: '22%',
    render: (o) => <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.orderId || o.id?.slice(0,8).toUpperCase()}</span> },
  { key: 'customer', header: 'Customer', width: '30%',
    render: (o) => o.customerName || o.customer?.fullName || '—' },
  { key: 'total',  header: 'Total',  width: '18%',
    render: (o) => o.total != null ? `${o.total} ${o.currency || 'USD'}` : '—' },
  { key: 'status', header: 'Status', width: '15%',
    render: (o) => <StatusChip status={o.status || 'pending'} /> },
  { key: 'date',   header: 'Date',   width: '15%',
    render: (o) => o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : '—' },
];

// Tiny helper rendered in prescription PDF column
function PdfButton({ url }) {
  const [, forceRender] = useState(0);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); window._previewPdf?.(url); }}
      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
      title="View PDF"
    >
      <Eye size={15} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
import { useRouter } from 'next/navigation';

export default function PhysicianProfileDrawer({ doctor, initialTab, onClose, serverBundle = null }) {
  const { openDrawer } = useDrawer();
  const router = useRouter();
  const [activeTab,      setActiveTab]      = useState(doctor?.activeTab || initialTab || 'overview');
  const [patients,       setPatients]       = useState(serverBundle?.relationships || []);
  const [orders,         setOrders]         = useState(serverBundle?.orders || []);
  const [prescriptions,  setPrescriptions]  = useState(serverBundle?.prescriptions || []);
  const [loadingData,    setLoadingData]    = useState(false);
  const [dataFetched,    setDataFetched]    = useState(serverBundle != null);
  const [isImportOpen,   setIsImportOpen]   = useState(false);
  const [previewPdfUrl,  setPreviewPdfUrl]  = useState(null);
  const [currentDoctor,  setCurrentDoctor]  = useState(doctor);

  // Expose PDF preview to PdfButton via window (avoids prop drilling into column defs)
  useEffect(() => {
    window._previewPdf = (url) => setPreviewPdfUrl(url);
    return () => { delete window._previewPdf; };
  }, []);

  useEffect(() => {
    setCurrentDoctor(doctor);
    // If a new doctor is opened and no serverBundle, reset data for fresh fetch
    if (!serverBundle) {
      setDataFetched(false);
      setPatients([]);
      setPrescriptions([]);
      setOrders([]);
    } else {
      // Hydrate from server bundle immediately
      setPatients(serverBundle.relationships || []);
      setPrescriptions(serverBundle.prescriptions || []);
      setOrders(serverBundle.orders || []);
      setDataFetched(true);
    }
    if (doctor?.activeTab || initialTab) setActiveTab(doctor?.activeTab || initialTab || 'overview');
  }, [doctor?.id]);

  // ── Data fetching — one fetch per doctor, cached in state ─────────────────
  useEffect(() => {
    if (activeTab === 'overview' || !currentDoctor?.id || dataFetched) return;

    const id = currentDoctor.id;

    async function fetchAll() {
      setLoadingData(true);
      try {
        // Run all queries in parallel for speed
        const [presSnap, relSnap] = await Promise.all([
          // PRESCRIPTIONS — doctorId is the canonical field (all 3 are the same value)
          getDocs(query(
            collection(db, 'prescriptions'),
            where('doctorId', '==', id),
            limit(200)
          )),
          // PATIENTS — from doctor_patient_relationships
          getDocs(query(
            collection(db, 'doctor_patient_relationships'),
            where('doctorId', '==', id),
            limit(200)
          )),
        ]);

        const presData = presSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPrescriptions(presData);

        let patData = relSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fallback: if no relationships, derive unique patients from prescriptions
        // (happens when doctor_patient_relationships not yet populated)
        if (patData.length === 0 && presData.length > 0) {
          const seen = new Set();
          patData = presData
            .filter(rx => {
              const pid = rx.patientId;
              if (!pid || seen.has(pid)) return false;
              seen.add(pid);
              return true;
            })
            .map(rx => ({
              id:           rx.patientId,
              patientId:    rx.patientId,
              patientName:  rx.patient?.name  || rx.patientName  || 'Unknown',
              patientEmail: rx.patient?.email || rx.patientEmail || '',
              status:       'active',
              createdAt:    rx.createdAt,
            }));
        }
        setPatients(patData);

        // ORDERS — query by patientIds found in prescriptions
        // (orders have userId = patientId, no physician reference)
        const patientIds = [...new Set(presData.map(p => p.patientId).filter(Boolean))];
        if (patientIds.length > 0) {
          // Firestore 'in' max = 30 per query; take first 30
          const chunk = patientIds.slice(0, 30);
          const ordSnap = await getDocs(query(
            collection(db, 'orders'),
            where('userId', 'in', chunk),
            limit(100)
          ));
          setOrders(ordSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        setDataFetched(true);
      } catch (e) {
        console.error('PhysicianProfileDrawer fetch error:', e);
        notifier.error('Failed to load physician data');
      } finally {
        setLoadingData(false);
      }
    }

    fetchAll();
  }, [currentDoctor?.id, activeTab, dataFetched]);

  const handleUpdateDoctor = async (formData) => {
    try {
      await updateDoc(doc(db, 'users', currentDoctor.id), formData);
      setCurrentDoctor(prev => ({ ...prev, ...formData }));
      notifier.success('Physician updated successfully');
    } catch (err) {
      console.error(err);
      notifier.error('Failed to update physician');
      throw err;
    }
  };

  if (!currentDoctor) return null;

  const doctorName = currentDoctor.displayName
    || [currentDoctor.firstName, currentDoctor.lastName].filter(Boolean).join(' ')
    || 'Unnamed Physician';

  const tabs = [
    { id: 'overview',      label: 'Overview' },
    { id: 'patients',      label: 'Patients',      count: patients.length      || null },
    { id: 'prescriptions', label: 'Prescriptions', count: prescriptions.length || null },
    { id: 'orders',        label: 'Orders',        count: orders.length        || null },
    { id: 'timeline',      label: 'Timeline' },
  ];

  const timelineEvents = [
    ...patients.map(p      => ({ ...p, _type: 'patient',      _date: p.createdAt })),
    ...prescriptions.map(p => ({ ...p, _type: 'prescription', _date: p.createdAt })),
    ...orders.map(o        => ({ ...o, _type: 'order',        _date: o.createdAt })),
  ]
    .filter(e => e._date?.seconds)
    .sort((a, b) => b._date.seconds - a._date.seconds)
    .slice(0, 50);

  return (
    <StandardDrawer
      isOpen={!!currentDoctor}
      onClose={onClose}
      headerContent={
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
            {doctorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>{doctorName}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={12} color="var(--primary)" />{currentDoctor.specialty || 'General'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{currentDoctor.clinicName || '—'}</span>
              {currentDoctor.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} />{currentDoctor.email}</span>}
            </div>
          </div>
          {/* Nueva Rx quick action */}
          <button
            onClick={() => openDrawer('rx-builder', 'new', {
              initialDoctor: { id: currentDoctor.id, name: doctorName },
              initialDoctorId: currentDoctor.id,
              initialDoctorName: doctorName,
              sourceModule: 'physician-profile',
            })}
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto', flexShrink: 0, fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            <ClipboardList size={14} /> New Prescription
          </button>
        </div>
      }
      headerColor="var(--color-bg-surface)"
      width="840px"
    >
      <StandardDrawerTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>

        {/* Loading state */}
        {loadingData && activeTab !== 'overview' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="spin" />
            <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
            Loading data…
          </div>
        )}

        {!loadingData && (
          <>
            {activeTab === 'overview' && (
              <UniversalForm
                schema={physicianSchema}
                initialData={currentDoctor}
                initialMode="view"
                onSubmit={handleUpdateDoctor}
                submitLabel="Save Changes"
              />
            )}

            {activeTab === 'patients' && (
              <DataTable
                data={patients}
                keyField="id"
                columns={PATIENT_COLUMNS}
                emptyTitle="No patients linked"
                emptySubtitle="No patient relationships found for this physician."
              />
            )}

            {activeTab === 'prescriptions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setIsImportOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    <FileUp size={14} /> Import Rx
                  </button>
                </div>
                <DataTable
                  data={prescriptions}
                  keyField="id"
                  columns={getPrescriptionColumns((rxId) => router.push(`/admin/prescriptions?id=${rxId}`))}
                  emptyTitle="No prescriptions found"
                  emptySubtitle="No prescriptions have been created for this physician yet."
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <DataTable
                data={orders}
                keyField="id"
                columns={ORDER_COLUMNS}
                emptyTitle="No orders found"
                emptySubtitle="Orders are linked to patients. No orders found for this physician's patients."
              />
            )}

            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {timelineEvents.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No activity yet.</div>
                ) : (
                  timelineEvents.map((ev, idx) => (
                    <div key={ev.id + idx} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {ev._type === 'patient'      && <UserPlus     size={13} color="var(--primary)" />}
                          {ev._type === 'prescription' && <FilePlus     size={13} color="var(--primary)" />}
                          {ev._type === 'order'        && <ClipboardList size={13} color="var(--primary)" />}
                        </div>
                        {idx < timelineEvents.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0' }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: '1.25rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-main)' }}>
                          {ev._type === 'patient'      && `Patient linked: ${ev.patientName || '—'}`}
                          {ev._type === 'prescription' && `Prescription: ${ev.fagron?.boxId || ev.documentNumber || ev.id?.slice(0,8)} — ${ev.patient?.name || ev.patientName || '—'}`}
                          {ev._type === 'order'        && `Order: ${ev.orderId || ev.id?.slice(0,8)} — ${ev.customerName || ev.customer?.fullName || '—'}`}
                        </div>
                        <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {new Date(ev._date.seconds * 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ImportPrescriptionModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        context={{ doctorId: doctor.id, doctorName }}
      />
      <DocumentPreviewModal
        isOpen={!!previewPdfUrl}
        onClose={() => setPreviewPdfUrl(null)}
        fileUrl={previewPdfUrl}
      />
    </StandardDrawer>
  );
}