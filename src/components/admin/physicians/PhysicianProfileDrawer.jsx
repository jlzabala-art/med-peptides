import X from "lucide-react/dist/esm/icons/x";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Activity from "lucide-react/dist/esm/icons/activity";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Clock from "lucide-react/dist/esm/icons/clock";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React, { useState, useEffect } from 'react';









import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase';

export default function PhysicianProfileDrawer({ doctor, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    async function fetchDetailedData() {
      if (!doctor || dataFetched) return;
      setLoadingData(true);
      try {
        const [patientsSnap, ordersSnap] = await Promise.all([
          getDocs(query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', doctor.id), limit(50))),
          getDocs(query(collection(db, 'orders'), where('supervisingPhysicianId', '==', doctor.id), limit(50)))
        ]);
        setPatients(patientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setDataFetched(true);
      } catch (e) {
        console.error("Error fetching detailed doctor data", e);
      } finally {
        setLoadingData(false);
      }
    }
    if (activeTab === 'patients' || activeTab === 'orders' || activeTab === 'overview') {
      fetchDetailedData();
    }
  }, [doctor, activeTab, dataFetched]);

  if (!doctor) return null;

  const doctorName = doctor.displayName || [doctor.firstName, doctor.lastName].filter(Boolean).join(' ') || 'Unnamed Physician';

  // Compute stats from real data once fetched
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
  const activePatients = patients.length;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        width: '100%',
        maxWidth: '600px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header section */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--color-bg-surface)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
              {doctorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)' }}>{doctorName}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={14} color="var(--primary)"/> {doctor.specialty || 'General Practitioner'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {doctor.clinicName || 'Atlas Health Clinic'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--color-bg-surface)', padding: '0 1.5rem' }}>
          {['overview', 'activity', 'patients', 'orders'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                padding: '1rem 0',
                marginRight: '2rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loadingData ? (
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Contact</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><Mail size={14}/> {doctor.email || 'N/A'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}><Phone size={14}/> {doctor.phone || 'N/A'}</div>
                    </div>
                    <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</div>
                      <div style={{ color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14}/> Active</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered: {doctor.createdAt ? new Date(doctor.createdAt.seconds ? doctor.createdAt.toDate() : doctor.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Performance Summary (Recent)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div style={{ padding: '1rem', backgroundColor: 'rgba(26,115,232,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(26,115,232,0.2)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Active Patients</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{activePatients}</div>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginBottom: '0.25rem' }}>Total Orders</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>{orders.length}</div>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'rgba(139,92,246,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginBottom: '0.25rem' }}>Revenue</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>AED {totalRevenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  <Clock size={32} style={{ margin: '0 auto', color: 'var(--border)' }} />
                  <p>Activity timeline tracking is being implemented.</p>
                </div>
              )}

              {activeTab === 'patients' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {patients.length > 0 ? patients.map(p => (
                    <div key={p.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.displayName || [p.firstName, p.lastName].join(' ') || p.patientName || 'Unnamed Patient'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.email || p.patientEmail}</span>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No patients assigned yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {orders.length > 0 ? orders.map(o => (
                    <div key={o.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Order #{o.orderNumber || o.id.slice(0,6)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt?.seconds ? o.createdAt.toDate() : o.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>AED {(o.total || o.amount || 0).toLocaleString()}</div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders placed yet.</div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--color-bg-surface)', display: 'flex', gap: '1rem' }}>
          <button className="gcp-btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Mail size={16}/> Email</button>
          <button className="gcp-btn-primary" style={{ flex: 1 }}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}