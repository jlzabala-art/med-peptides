import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StatusChip } from '../../ui';

function PrescriptionKPIs({ data }) {
  const active = data.filter(d => d.status === 'Active').length;
  const fulfilled = data.filter(d => d.status === 'Fulfilled').length;
  const expired = data.filter(d => d.status === 'Expired').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', flexShrink: 0 }}>
      {[
        { label: 'Total Prescriptions', value: data.length, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Active', value: active, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Fulfilled', value: fulfilled, color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Expired', value: expired, color: '#ef4444', bg: '#fef2f2' }
      ].map((kpi, idx) => (
        <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-card-subtle">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{kpi.label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPrescriptionsTab() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'prescriptions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = prescriptions.filter(p => 
    (p.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', backgroundColor: '#f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--primary)" /> Master Prescriptions
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            System of record for all approved patient prescriptions.
          </p>
        </div>
      </div>

      {!loading && <PrescriptionKPIs data={prescriptions} />}

      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#fafafa' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by patient, doctor, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          <button className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Filter size={14} style={{ marginRight: '0.4rem' }} /> Filters
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No Prescriptions Found</h3>
              <p style={{ margin: '0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                Approved prescriptions from the Operations Inbox will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {filtered.map(rx => (
                <div 
                  key={rx.id} 
                  onClick={() => setSelectedItem(rx)}
                  className="hover-card-subtle"
                  style={{ 
                    border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', 
                    cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {rx.patientName?.substring(0,2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{rx.patientName || 'Unknown Patient'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {rx.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Doctor</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rx.doctorName || 'N/A'}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Date Issued</span>
                      <span style={{ color: 'var(--text-main)' }}>{rx.dateIssued || 'Unknown'}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Products</span>
                      <span style={{ color: 'var(--text-main)' }}>{rx.products?.length || 0} items</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <StatusChip status={rx.status || 'Active'} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      View Details <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Detail Modal could go here when selectedItem is not null */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedItem(null)}>
          <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h2>Prescription Details</h2>
            <p><strong>Patient:</strong> {selectedItem.patientName}</p>
            <p><strong>Doctor:</strong> {selectedItem.doctorName}</p>
            <p><strong>Date Issued:</strong> {selectedItem.dateIssued}</p>
            <h3>Formulas:</h3>
            <ul>
              {selectedItem.products?.map((p, i) => (
                <li key={i}>{p.name} - {p.quantity} - {p.concentration}</li>
              ))}
            </ul>
            <button className="gcp-btn-primary" style={{ marginTop: '1rem' }} onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
