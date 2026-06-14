import Building2 from "lucide-react/dist/esm/icons/building-2";
import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import Plus from "lucide-react/dist/esm/icons/plus";
import Lock from "lucide-react/dist/esm/icons/lock";
import Globe from "lucide-react/dist/esm/icons/globe";
import Building from "lucide-react/dist/esm/icons/building";
import Target from "lucide-react/dist/esm/icons/target";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState, useEffect } from 'react';















import ERPListDetailLayout from '../shared/ERPListDetailLayout';
import { Tabs, StatusChip } from '../ui';
import ClinicOnboardingWizard from './clinics/ClinicOnboardingWizard';
import ClinicProfileWorkspace from './clinics/ClinicProfileWorkspace';
import TerritoryFilter from './clinics/TerritoryFilter';

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

// ── Detail Drawer (Replaced by ClinicProfileWorkspace) ───────────────

// ── Main Tab ───────────────
export default function AdminClinicsTab() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState('All');

  useEffect(() => {
    // Simulate fetching from a real repository
    setTimeout(() => {
      setClinics(MOCK_CLINICS);
      setLoading(false);
    }, 600);
  }, []);

  const filtered = clinics.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.network || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.territory || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTerritory = selectedTerritory === 'All' || (c.territory || '').includes(selectedTerritory);
    return matchesSearch && matchesTerritory;
  });

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

      {/* Territory Filter */}
      <TerritoryFilter selectedTerritory={selectedTerritory} onSelectTerritory={setSelectedTerritory} />

      {/* ERP List / Detail Layout */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ERPListDetailLayout
          items={filtered}
          renderListItem={renderListItem}
          renderDetail={(c, onClose) => <ClinicProfileWorkspace key={c.id} clinic={c} onClose={onClose} />}
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
            <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px', padding: '0.4rem 1rem' }}>
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

      {isWizardOpen && (
        <ClinicOnboardingWizard 
          onClose={() => setIsWizardOpen(false)}
          onComplete={(newClinic) => {
            setClinics(prev => [newClinic, ...prev]);
            setIsWizardOpen(false);
          }}
        />
      )}

    </div>
  );
}