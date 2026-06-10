import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, FileText, Sparkles, CheckCircle2,
  MapPin, Phone, Mail, Navigation, Plus, Lock, Globe, Building, Target, X
} from 'lucide-react';
import ERPListDetailLayout from '../shared/ERPListDetailLayout';
import { Tabs, StatusChip } from '../ui';

// --- MOCK DATA LAYER ---
const MOCK_CLINICS = [
  {
    id: 'cln_001',
    name: 'Atlas Longevity Center',
    network: 'Atlas Prime',
    territory: 'North America - West',
    manager: 'Sarah Jenkins',
    status: 'active',
    address: '100 Wellness Way, Los Angeles, CA',
    tier: 'Platinum',
    physicians: 12,
    patients: 450,
    monthlyVolume: 125000,
    email: 'contact@atlaslongevity.com',
    phone: '+1 (555) 123-4567',
    insights: [
      "Upsell Opportunity: High demand for NAD+ precursors in this territory.",
      "Engagement Alert: Account manager hasn't visited in 45 days."
    ]
  },
  {
    id: 'cln_002',
    name: 'Metabolic Reset Clinic',
    network: 'Independent',
    territory: 'Europe - South',
    manager: 'Carlos Silva',
    status: 'onboarding',
    address: 'Av. Diagonal 123, Barcelona, Spain',
    tier: 'Gold',
    physicians: 3,
    patients: 80,
    monthlyVolume: 15000,
    email: 'info@metabolicreset.es',
    phone: '+34 600 123 456',
    insights: [
      "Onboarding: Needs final catalog approval.",
      "Territory Expansion: Good candidate for the new Weight Loss protocol beta."
    ]
  },
  {
    id: 'cln_003',
    name: 'Peak Performance Med',
    network: 'Athletics Health Group',
    territory: 'North America - East',
    manager: 'Mike O\'Connor',
    status: 'active',
    address: '500 Sport Ave, Miami, FL',
    tier: 'Platinum',
    physicians: 8,
    patients: 320,
    monthlyVolume: 85000,
    email: 'sales@peakperformancemed.com',
    phone: '+1 (555) 987-6543',
    insights: [
      "Cross-sell Opportunity: BPC-157 is their top seller, recommend TB-500 stack."
    ]
  }
];

// ── Dashboard KPI Cards ───────────────
function ClinicKPIs({ data }) {
  const totals = {
    clinics: data.length,
    physicians: data.reduce((acc, curr) => acc + (curr.physicians || 0), 0),
    patients: data.reduce((acc, curr) => acc + (curr.patients || 0), 0),
    volume: data.reduce((acc, curr) => acc + (curr.monthlyVolume || 0), 0)
  };

  const fmtCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', flexShrink: 0 }}>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '50%', color: '#1d4ed8' }}><Building2 size={24} /></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Clinics</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totals.clinics}</div>
        </div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '50%', color: '#15803d' }}><Users size={24} /></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Physicians</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totals.physicians}</div>
        </div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '12px', background: '#fdf4ff', borderRadius: '50%', color: '#a21caf' }}><Target size={24} /></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Network Patients</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totals.patients}</div>
        </div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '12px', background: '#fefce8', borderRadius: '50%', color: '#a16207' }}><FileText size={24} /></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Monthly Volume</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{fmtCurrency(totals.volume)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Detail Drawer ───────────────
function ClinicDetail({ clinic, onClose }) {
  const [detailTab, setDetailTab] = useState('overview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{clinic.name}</h2>
            <StatusChip status={clinic.status} />
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {clinic.id} · {clinic.tier} Tier</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '6px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <Tabs
          activeTab={detailTab}
          onChange={setDetailTab}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#3b82f6" /> Contact & Location
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Address</label><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{clinic.address}</div></div>
                      <div><label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Territory</label><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{clinic.territory}</div></div>
                      <div><label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Email</label><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{clinic.email}</div></div>
                      <div><label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Phone</label><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{clinic.phone}</div></div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={14} color="#10b981" /> Organization
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Network</label><div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1d4ed8' }}>{clinic.network}</div></div>
                      <div><label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Account Manager</label><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{clinic.manager}</div></div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'insights',
              label: 'AI Insights',
              content: (
                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} /> Atlas Commercial Intelligence
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {clinic.insights.map((insight, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e0f2fe', fontSize: '0.85rem', color: '#0f172a', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <Navigation size={14} color="#0ea5e9" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}

// ── Main Tab ───────────────
export default function AdminClinicsTab() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate fetching from a real repository
    setTimeout(() => {
      setClinics(MOCK_CLINICS);
      setLoading(false);
    }, 600);
  }, []);

  const filtered = clinics.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.network || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.territory || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderListItem = (c, isSelected) => (
    <div style={{ padding: '0.85rem 1.15rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
          {c.name}
        </span>
        <StatusChip status={c.status} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: '4px' }}>
          {c.tier}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>· {c.network}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <span>Mgr: {c.manager}</span>
        <span>{c.territory}</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', backgroundColor: '#f1f5f9' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={24} color="#1a73e8" /> Clinic Network Management
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
          Manage physical clinic locations, organizational structures, territories, and commercial insights.
        </p>
      </div>

      {/* KPI Dashboard */}
      {!loading && <ClinicKPIs data={clinics} />}

      {/* ERP List / Detail Layout */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ERPListDetailLayout
          items={filtered}
          renderListItem={renderListItem}
          renderDetail={(c, onClose) => <ClinicDetail key={c.id} clinic={c} onClose={onClose} />}
          getItemId={c => c.id}
          loading={loading}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search clinics by name, network, or territory..."
          detailWidth="60%"
          headerLeft={
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>Active Clinics</div>
          }
          headerActions={
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px', padding: '0.4rem 1rem' }}>
              <Plus size={16} /> Add Clinic
            </button>
          }
          emptyState={
            <div style={{ textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Building2 size={40} style={{ margin: '0 auto', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, color: '#64748b' }}>Select a Clinic</div>
              <div style={{ fontSize: '0.8rem' }}>Click a clinic on the left to inspect network and commercial details.</div>
            </div>
          }
        />
      </div>

    </div>
  );
}
