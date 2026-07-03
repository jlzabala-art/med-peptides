import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Activity, ShieldCheck, FileText, Loader2, ClipboardList } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import StandardDrawer from '../../ui/StandardDrawer';
import StandardDrawerTabs from '../../common/StandardDrawerTabs';
import DataTable from '../../ui/DataTable';

export default function PhysicianProfileDrawer({ doctor, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

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
    { id: 'orders', label: 'Orders', count: orders.length || null },
    { id: 'prescriptions', label: 'Prescriptions', count: prescriptions.length || null }
  ];

  return (
    <StandardDrawer
      isOpen={!!doctor}
      onClose={onClose}
      headerContent={headerContent}
      headerColor="var(--color-bg-surface)"
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
              <DataTable 
                data={prescriptions}
                columns={[
                  { header: 'Document', accessor: (p) => p.documentNumber || p.id },
                  { header: 'Patient', accessor: (p) => p.patientName || 'Unknown' },
                  { header: 'Status', accessor: (p) => p.status || 'Draft' }
                ]}
                emptyState={
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No prescriptions created by this physician.</div>
                }
              />
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
          </>
        )}
      </div>
    </StandardDrawer>
  );
}