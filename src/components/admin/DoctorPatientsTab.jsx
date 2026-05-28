/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, FileText, Search, PlusCircle, Activity } from 'lucide-react';

export default function PhysicianPatientsTab({ doctorId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (doctorId) {
      fetchPatients();
    } else {
      setLoading(false);
    }
  }, [doctorId]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Fetches active relationships where this doctor is supervising
      const relQ = query(
        collection(db, 'doctor_patient_relationships'),
        where('doctorId', '==', doctorId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(relQ);
      const patientPromises = snapshot.docs.map(async (docSnap) => {
        const relData = docSnap.data();
        // Here we could fetch patient details if needed from users collection, but for privacy/demo we use the relationship doc
        return {
          id: docSnap.id,
          patientId: relData.patientId,
          patientEmail: relData.patientEmail,
          patientName: relData.patientName || 'Anon Patient',
          assignedProtocols: relData.assignedProtocols || [],
          status: relData.status,
          activatedAt: relData.activatedAt
        };
      });
      
      const resolvedPatients = await Promise.all(patientPromises);
      setPatients(resolvedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p && (
      (p.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.patientEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} color="var(--primary)" />
            My Patients
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Manage your clinically supervised patients and review their assigned protocols.
          </p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} /> Invite New Patient
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.9rem' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-bg-app)', border: '1px dashed var(--border)' }}>
          <Users size={48} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No Patients Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Invite patients to connect with your clinical account to assign protocols.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredPatients.map(p => (
            <div key={p.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>{p.patientName}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.patientEmail}</div>
                </div>
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  Active
                </span>
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={14} /> Assigned Protocols
                </h4>
                {p.assignedProtocols.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {p.assignedProtocols.map((proto, idx) => (
                      <li key={idx}>{proto.name || 'Protocol'}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No protocols assigned yet.</div>
                )}
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={16} /> View Clinical Chart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
