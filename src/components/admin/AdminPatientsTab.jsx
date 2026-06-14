import Users from "lucide-react/dist/esm/icons/users";
import Activity from "lucide-react/dist/esm/icons/activity";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import React, { useState, useEffect } from 'react';










import { StatusChip } from '../ui';
import PatientOnboardingWizard from './patients/PatientOnboardingWizard';
import PatientProfileWorkspace from './patients/PatientProfileWorkspace';

// Mock Patient Data
const MOCK_PATIENTS = [
  {
    id: 'pat_001',
    name: 'Emily Chen',
    age: 42,
    gender: 'Female',
    clinic: 'Atlas Longevity Center',
    physician: 'Dr. Sarah Jenkins',
    manager: 'Mike O\'Connor',
    status: 'Active',
    program: 'Metabolic Optimization',
    lastActivity: '2023-10-15',
    revenue: 4500,
    riskScore: 'Low',
    email: 'emily.c@example.com',
    phone: '+1 555-0102',
    avatar: ''
  },
  {
    id: 'pat_002',
    name: 'James Wilson',
    age: 55,
    gender: 'Male',
    clinic: 'Peak Performance Med',
    physician: 'Dr. Robert Silva',
    manager: 'Carlos Silva',
    status: 'Awaiting Follow-Up',
    program: 'Longevity Protocol',
    lastActivity: '2023-10-10',
    revenue: 12000,
    riskScore: 'Medium',
    email: 'jwilson@example.com',
    phone: '+1 555-0921',
    avatar: ''
  }
];

function PatientKPIs({ data }) {
  const active = data.filter(d => d.status === 'Active').length;
  const newPatients = data.filter(d => d.status === 'New').length || 1;
  const awaiting = data.filter(d => d.status === 'Awaiting Follow-Up').length;
  const revenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  const fmtCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', flexShrink: 0 }}>
      {[
        { label: 'Total Patients', value: data.length, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Active', value: active, color: '#10b981', bg: '#ecfdf5' },
        { label: 'New This Month', value: newPatients, color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Awaiting Follow-Up', value: awaiting, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Total Revenue', value: fmtCurrency(revenue), color: '#ec4899', bg: '#fdf2f8' }
      ].map((kpi, idx) => (
        <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-card-subtle">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{kpi.label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPatientsTab() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setPatients(MOCK_PATIENTS);
      setLoading(false);
    }, 400);
  }, []);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.physician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--primary)" /> Patient Management
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Central workspace for managing patients, clinical journeys, and commercial health.
          </p>
        </div>
        <button className="gcp-btn-primary" onClick={() => setIsWizardOpen(true)}>
          <UserPlus size={16} style={{ marginRight: '0.5rem' }} /> Add Patient
        </button>
      </div>

      {!loading && <PatientKPIs data={patients} />}

      {/* Main CRM Workspace */}
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#fafafa' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search patients by name, email, clinic, physician..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          <button className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Filter size={14} style={{ marginRight: '0.4rem' }} /> Advanced Filters
          </button>
        </div>

        {/* Patient List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Welcome to Patient Management</h3>
              <p style={{ margin: '0 0 1.5rem 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                Manage patients, programs, clinics, physicians, prescriptions, and follow-ups from one centralized workspace.
              </p>
              <button className="gcp-btn-primary" onClick={() => setIsWizardOpen(true)}>Create First Patient</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {filtered.map(patient => (
                <div 
                  key={patient.id} 
                  onClick={() => setSelectedPatient(patient)}
                  className="hover-card-subtle"
                  style={{ 
                    border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', 
                    cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {patient.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{patient.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{patient.age} y/o • {patient.gender}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Program</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{patient.program}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Clinic</span>
                      <span style={{ color: 'var(--text-main)' }}>{patient.clinic}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Physician</span>
                      <span style={{ color: 'var(--text-main)' }}>{patient.physician}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <StatusChip status={patient.status} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Open Profile <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isWizardOpen && (
        <PatientOnboardingWizard 
          onClose={() => setIsWizardOpen(false)}
          onComplete={(newPat) => {
            setPatients(prev => [newPat, ...prev]);
            setIsWizardOpen(false);
          }}
        />
      )}

      {selectedPatient && (
        <PatientProfileWorkspace 
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

    </div>
  );
}