"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Activity, ShieldCheck, FileText, Loader2, ClipboardList, UserPlus, FilePlus } from '@/lib/icons';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;
import StandardDrawer from '../../ui/StandardDrawer';
import StandardDrawerTabs from '../../common/StandardDrawerTabs';
import DataTable from '../../ui/DataTable';
import ImportPrescriptionModal from '../../../features/prescriptions/components/ImportPrescriptionModal';
import DocumentPreviewModal from '../../ui/DocumentPreviewModal';
import { FileUp, Eye } from 'lucide-react';

export default function PhysicianProfileDrawer({ doctor, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

  useEffect(() => {
    async function fetchDetailedData() {
      if (!doctor || dataFetched) return;
      setLoadingData(true);
      try {
        const [patientsSnap, ordersSnap, presSnap] = await Promise.all([
          getDocs(query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', doctor.id), limit(50))),
          getDocs(query(collection(db, 'orders'), where('supervisingPhysicianId', '==', doctor.id), limit(50))),
          getDocs(query(collection(db, 'prescriptions'), where('doctorId', '==', doctor.id), limit(50)))
        ]);
        setPatients(patientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPrescriptions(presSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setDataFetched(true);
      } catch (e) {
        console.error("Error fetching detailed doctor data", e);
      } finally {
        setLoadingData(false);
      }
    }
    if (activeTab !== 'overview') {
      fetchDetailedData();
    }
  }, [doctor, activeTab, dataFetched]);

  if (!doctor) return null;

  const doctorName = doctor.displayName || [doctor.firstName, doctor.lastName].filter(Boolean).join(' ') || 'Unnamed Physician';
  
  const headerContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 }}>
        {doctorName.charAt(0).toUpperCase()}
      </div>
      <div>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {doctorName}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={14} color="var(--primary)"/> {doctor.specialty || 'General Practitioner'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {doctor.clinicName || 'Atlas Health Clinic'}</span>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'patients', label: 'Patients', count: patients.length || null },
    { id: 'prescriptions', label: 'Prescriptions', count: prescriptions.length || null },
    { id: 'orders', label: 'Orders', count: orders.length || null },
    { id: 'timeline', label: 'Timeline' }
  ];

  // Merge events for Timeline
  const timelineEvents = [...patients.map(p => ({ ...p, type: 'patient_assigned', date: p.createdAt })), 
                          ...orders.map(o => ({ ...o, type: 'order_created', date: o.createdAt })), 
                          ...prescriptions.map(p => ({ ...p, type: 'prescription_issued', date: p.createdAt }))]
                         .filter(e => e.date)
                         .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

  return (
    <StandardDrawer
      isOpen={!!doctor}
      onClose={onClose}
      headerContent={headerContent}
      headerColor="var(--color-bg-surface)"
      width="800px"
    >
      <StandardDrawerTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {loadingData && activeTab !== 'overview' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--primary)' }}>
            <Loader2 size={24} className="spin" />
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contact Information</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><Mail size={14} color="var(--text-muted)"/> {doctor.email || 'N/A'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}><Phone size={14} color="var(--text-muted)"/> {doctor.phone || 'N/A'}</div>
                  </div>
                  <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Status</div>
                    <div style={{ color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14}/> Active</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered: {doctor.createdAt ? new Date(doctor.createdAt.seconds ? doctor.createdAt.toDate() : doctor.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <DataTable 
                data={patients}
                columns={[
                  { header: 'Patient Name', accessor: (p) => p.patientName || 'Unnamed' },
                  { header: 'Status', accessor: (p) => p.status || 'Active' }
                ]}
                emptyState={
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No patients assigned to this physician.</div>
                }
              />
            )}

            {activeTab === 'prescriptions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => setIsImportOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '8px',
                      backgroundColor: '#e0f2fe', color: '#0369a1',
                      border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700
                    }}
                  >
                    <FileUp size={14} /> Import Rx
                  </button>
                </div>
                <DataTable 
                  data={prescriptions}
                  columns={[
                    { header: 'Document', accessor: (p) => p.documentNumber || p.id },
                    { header: 'Patient', accessor: (p) => p.patientName || 'Unknown' },
                    { header: 'Status', accessor: (p) => p.status || 'Draft' },
                    { header: 'Action', accessor: (p) => p.fileUrl ? (
                      <button 
                        onClick={() => setPreviewPdfUrl(p.fileUrl)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="View PDF"
                      >
                        <Eye size={16} />
                      </button>
                    ) : '-' }
                  ]}
                  emptyState={
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No prescriptions created by this physician.</div>
                  }
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <DataTable 
                data={orders}
                columns={[
                  { header: 'Order #', accessor: (o) => o.documentNumber || o.id },
                  { header: 'Date', accessor: (o) => o.createdAt ? new Date(o.createdAt?.seconds * 1000).toLocaleDateString() : 'N/A' },
                  { header: 'Status', accessor: (o) => o.status || 'Pending' }
                ]}
                emptyState={
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders supervised by this physician.</div>
                }
              />
            )}

            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                {timelineEvents.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No activity timeline available.</div>
                ) : (
                  timelineEvents.map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {event.type === 'patient_assigned' && <UserPlus size={14} color="var(--primary)" />}
                          {event.type === 'prescription_issued' && <FilePlus size={14} color="var(--primary)" />}
                          {event.type === 'order_created' && <ClipboardList size={14} color="var(--primary)" />}
                        </div>
                        {idx !== timelineEvents.length - 1 && <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border)', marginTop: '0.5rem', marginBottom: '0.5rem' }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: '1.5rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {event.type === 'patient_assigned' && `Patient Assigned: ${event.patientName || 'Unknown'}`}
                          {event.type === 'prescription_issued' && `Prescription Issued: ${event.documentNumber || event.id}`}
                          {event.type === 'order_created' && `Order Created: ${event.documentNumber || event.id}`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(event.date?.seconds * 1000).toLocaleString()}
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
        context={{ doctorId: doctor.id, doctorName: doctorName }}
      />

      <DocumentPreviewModal
        isOpen={!!previewPdfUrl}
        onClose={() => setPreviewPdfUrl(null)}
        fileUrl={previewPdfUrl}
      />
    </StandardDrawer>
  );
}