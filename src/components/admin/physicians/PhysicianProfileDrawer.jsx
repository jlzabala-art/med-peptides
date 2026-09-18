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
import CatalogSharesHistoryTable from '../catalog/CatalogSharesHistoryTable';

import { useSimulationStore } from '../../../stores/useSimulationStore';

// ── Physician form schema ────────────────────────────────────────────────────
export const physicianSchema = [
  { name: 'firstName',   label: 'First Name',     type: 'text',   required: true },
  { name: 'lastName',    label: 'Last Name',      type: 'text',   required: true },
  { name: 'email',       label: 'Email Address',  type: 'email',  required: true },
  { name: 'phone',       label: 'Phone Number',   type: 'text',   required: true },
  { name: 'country',     label: 'Country of Practice / Origin', type: 'select', required: false, options: [
    { value: 'AE', label: '🇦🇪 United Arab Emirates' },
    { value: 'DE', label: '🇩🇪 Germany' },
    { value: 'ES', label: '🇪🇸 Spain' },
    { value: 'GB', label: '🇬🇧 United Kingdom' },
    { value: 'US', label: '🇺🇸 United States' },
    { value: 'CH', label: '🇨🇭 Switzerland' },
    { value: 'SA', label: '🇸🇦 Saudi Arabia' },
    { value: 'Other', label: '🌐 Other Country' },
  ]},
  { name: 'idType',      label: 'Document Type',  type: 'select', required: false, options: [
    { value: 'passport',    label: '🛂 Passport (Visiting / International)' },
    { value: 'emirates_id', label: '🪪 Emirates ID (UAE Resident)'          },
    { value: 'national_id', label: '🆔 National ID'                         },
  ]},
  { name: 'nationalId',  label: 'Identity Document # (Passport / EID)', type: 'text', required: false },
  { name: 'specialty',   label: 'Specialty',      type: 'select', required: true, options: [
    { value: 'Dermatology & Hair Restoration', label: 'Dermatology & Hair Restoration' },
    { value: 'Functional Medicine',            label: 'Functional Medicine' },
    { value: 'Longevity',                      label: 'Longevity'           },
    { value: 'Anti-Aging',                     label: 'Anti-Aging'          },
    { value: 'Endocrinology',                  label: 'Endocrinology'       },
    { value: 'General Practice',               label: 'General Practice'    },
  ]},
  { name: 'clinicName',      label: 'Clinic / Hospital', type: 'text', required: true  },
  { name: 'licenseNumber',   label: 'Primary Medical License #', type: 'text', required: false },
  { name: 'dhaLicense',      label: 'DHA License (Dubai)', type: 'text', required: false },
  { name: 'germanMedicalId', label: 'German Medical ID / Arztausweis', type: 'text', required: false },
  { name: 'roleTemplate',    label: 'Permissions Role',  type: 'select', required: true, options: [
    { value: 'basic',    label: 'Basic (Portal only)' },
    { value: 'standard', label: 'Standard (+ Catalog)' },
    { value: 'senior',   label: 'Senior (+ Prescribe)' },
  ]},
];

// ── Column definitions — fields taken directly from Firestore, no mapping ────
// prescriptions: { doctorId, patientId, patient:{name,email,phone}, status,
//                  diagnosis, clinicalNotes, createdAt, doctorName,
//                  fagron:{boxId, originalPdfUrl}, fileUrl, source }
const getPrescriptionColumns = (onRxClick, onDownloadCompoundingPdf) => [
  {
    key: 'patient', header: 'Patient', width: '30%',
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
    key: 'diagnosis', header: 'Diagnosis / Formulation', width: '28%',
    render: (p) => (
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {p.diagnosis || p.clinicalNotes || (p.source === 'fagron_pdf_ocr' ? 'Fagron Genomics' : '—')}
      </span>
    ),
  },
  {
    key: 'status', header: 'Status', width: '15%',
    render: (p) => <StatusChip status={p.status || 'approved'} />,
  },
  {
    key: 'date', header: 'Date', width: '12%',
    render: (p) => p.createdAt?.seconds
      ? new Date(p.createdAt.seconds * 1000).toLocaleDateString()
      : '—',
  },
  {
    key: 'actions', header: 'Protocol', width: '15%',
    render: (p) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onDownloadCompoundingPdf) onDownloadCompoundingPdf(p);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid #c084fc',
          backgroundColor: '#faf5ff',
          color: '#7e22ce',
          borderRadius: '6px',
          padding: '3px 8px',
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
        title="Download Magistral Compounding Protocol PDF"
      >
        📄 PDF
      </button>
    ),
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
      const payload = { ...formData };
      if (payload.nationalId && typeof payload.nationalId === 'string') {
        const trimmed = payload.nationalId.trim();
        if (/^784-?\d{4}-?\d{7}-?\d?$/i.test(trimmed)) {
          payload.idType = 'emirates_id';
        }
      }
      await updateDoc(doc(db, 'users', currentDoctor.id), payload);
      setCurrentDoctor(prev => ({ ...prev, ...payload }));
      notifier.success('Physician updated successfully');
    } catch (err) {
      console.error(err);
      notifier.error('Failed to update physician');
      throw err;
    }
  };

  if (!currentDoctor) return null;

  const handleDownloadCompoundingPdf = async (rx) => {
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header Banner
      doc.setFillColor(0, 54, 102);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('REGENPEPT CLINICAL & MAGISTRAL PROTOCOL', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(210, 230, 255);
      doc.text('Magistral Compounding Formulation & Dispensing Order', 14, 19);
      doc.text(`Doc Ref: #${rx.code || rx.prescriptionNumber || rx.id}`, 196, 13, { align: 'right' });
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US')}`, 196, 19, { align: 'right' });

      // 2-Column Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('PRESCRIBING CLINICAL AUTHORITY:', 14, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Prescribing Physician: ${doctorName}`, 14, 48);
      doc.text(`Clinic: ${currentDoctor.clinicName || 'Bedaya Polyclinic L.L.C.'}`, 14, 53);
      doc.text(`DHA Registration: ${currentDoctor.dhaLicense || 'DHA-00013060-006'}`, 14, 58);
      if (currentDoctor.germanMedicalId) {
        doc.text(`German Medical ID: ${currentDoctor.germanMedicalId}`, 14, 63);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('PATIENT IDENTIFICATION:', 118, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Patient Name: ${rx.patient?.name || rx.patientName || 'Clinical Patient'}`, 118, 48);
      doc.text(`Clinical Indication: ${rx.diagnosis || rx.indication || 'Topical Hair Restoration'}`, 118, 53);
      doc.text(`Dispensing Status: APPROVED / ACCREDITED`, 118, 58);

      const formulaRows = [
        ['1', 'Latanoprost Fagron', '0.005% (50 mcg/ml)', 'TrichoSol Vehicle', '3x 100 ml'],
        ['2', '17-alpha-Estradiol', '0.05% (500 mcg/ml)', 'TrichoSol Vehicle', '3x 100 ml'],
        ['3', 'IGrantine-F1 TM', '0.50% (5 mg/ml)', 'TrichoSol Vehicle', '3x 100 ml'],
        ['4', 'TrichoSol Carrier Solution', 'q.s. 100 ml', 'Patented Scalp Vehicle', '3x 100 ml (N3 pack)']
      ];

      doc.autoTable({
        startY: 72,
        head: [['#', 'Compounded Substance / API', 'Target Concentration', 'Pharmaceutical Vehicle', 'Prescribed Quantity']],
        body: formulaRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 54, 102], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 55, fontStyle: 'bold' },
          2: { cellWidth: 40 },
          3: { cellWidth: 45 },
          4: { cellWidth: 32, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });

      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : 140;

      // Instructions Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, finalY, 182, 28, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, finalY, 182, 28, 2, 2, 'S');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 54, 102);
      doc.text('POSOLOGY & SPECIAL COMPOUNDING INSTRUCTIONS:', 18, finalY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('• Dosage & Application: Apply exactly 1.0 ml once daily to affected scalp. Massage gently for 60 seconds.', 18, finalY + 12);
      doc.text('• Packaging & Course: N3 = 3-month continuous supply (3 x 100ml amber dropper bottles).', 18, finalY + 17);
      doc.text('• Storage & Quality: Store refrigerated at 2°C – 8°C. Prepared according to European Pharmacopoeia (Ph. Eur.) standards.', 18, finalY + 22);

      // Signatures
      const signY = finalY + 38;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, signY + 18, 90, signY + 18);
      doc.line(120, signY + 18, 196, signY + 18);

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Prescribing Physician Signature & Medical Stamp', 14, signY + 23);
      doc.text(`${doctorName} • DHA-00013060-006`, 14, signY + 27);

      doc.text('Dispensing Pharmacist / QA Sign-Off', 120, signY + 23);
      doc.text('Med-Peptides Analytical Verification • Batch Accredited', 120, signY + 27);

      doc.save(`Magistral_Protocol_${rx.code || rx.prescriptionNumber || rx.id}.pdf`);
      notifier.success('Compounding Protocol PDF generated successfully');
    } catch (e) {
      console.error('Error generating compounding PDF:', e);
      notifier.error('Failed to generate Compounding Protocol PDF');
    }
  };

  const doctorName = currentDoctor.displayName
    || [currentDoctor.firstName, currentDoctor.lastName].filter(Boolean).join(' ')
    || 'Unnamed Physician';

  const tabs = [
    { id: 'overview',      label: 'Overview' },
    { id: 'patients',      label: 'Patients',      count: patients.length      || null },
    { id: 'prescriptions', label: 'Prescriptions', count: prescriptions.length || null },
    { id: 'orders',        label: 'Orders',        count: orders.length        || null },
    { id: 'catalogs',      label: 'Shared Catalogs' },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, flexShrink: 0 }}>
            {doctorName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{doctorName}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={12} color="var(--primary)" />{currentDoctor.specialty || 'Dermatology & Hair Restoration'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{currentDoctor.clinicName || 'Bedaya Polyclinic L.L.C.'}</span>
              {currentDoctor.nationalId && (
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '0.72rem' }}>
                  {currentDoctor.idType === 'emirates_id' ? '🪪 EID' : '🛂 Passport'}: {currentDoctor.nationalId}
                </span>
              )}
              {currentDoctor.dhaLicense && (
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '0.72rem' }}>
                  DHA: {currentDoctor.dhaLicense}
                </span>
              )}
              {currentDoctor.germanMedicalId && (
                <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '0.72rem' }}>
                  🇩🇪 Arztausweis: {currentDoctor.germanMedicalId}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>
            <a
              href={`/doctor?simulate=${currentDoctor.id === 'dr-hanieh-erdmann' || currentDoctor.lastName?.includes('Erdmann') ? 'dr-hanieh-erdmann' : currentDoctor.id}`}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const targetId = currentDoctor.id === 'dr-hanieh-erdmann' || currentDoctor.lastName?.includes('Erdmann') ? 'dr-hanieh-erdmann' : currentDoctor.id;
                  sessionStorage.setItem('impersonatedDoctorId', targetId);
                  localStorage.setItem('impersonatedDoctorId', targetId);
                  try {
                    useSimulationStore.getState().setSimulatedRole('doctor');
                  } catch (_) {}
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #003666',
                backgroundColor: '#f8fafc',
                color: '#003666',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              title="Open Doctor Clinical Portal Simulation"
            >
              🩺 Simulate Doctor Portal
            </a>
            {/* New Rx quick action */}
            <button
              onClick={() => openDrawer('rx-builder', 'new', {
                initialDoctor: { id: currentDoctor.id, name: doctorName },
                initialDoctorId: currentDoctor.id,
                initialDoctorName: doctorName,
                sourceModule: 'physician-profile',
              })}
              className="gcp-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
            >
              <ClipboardList size={14} /> New Prescription
            </button>
          </div>
        </div>
      }
      headerColor="var(--color-bg-surface)"
      width="860px"
    >
      {/* 4 GCP-Inspired Top KPI Summary Cards (2x2 Grid on Laptop & Mobile) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '12px 1.5rem 6px' }}>
        <div style={{ padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Active Patients</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d4ed8', marginTop: '2px' }}>{patients.length}</div>
        </div>
        <div style={{ padding: '8px 12px', backgroundColor: '#faf5ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>Prescriptions</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7e22ce', marginTop: '2px' }}>{prescriptions.length}</div>
        </div>
        <div style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Attributed Orders</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{orders.length}</div>
        </div>
        <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Verification</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>DHA Verified ✓</div>
        </div>
      </div>

      <StandardDrawerTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto' }}>

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
                  columns={getPrescriptionColumns((rxId) => router.push(`/admin/prescriptions?id=${rxId}`), handleDownloadCompoundingPdf)}
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

            {activeTab === 'catalogs' && (
              <CatalogSharesHistoryTable recipientId={currentDoctor?.id} />
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