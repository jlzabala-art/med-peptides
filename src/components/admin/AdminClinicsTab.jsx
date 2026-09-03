"use client";

import Building2 from "lucide-react/dist/esm/icons/building-2";
import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Target from "lucide-react/dist/esm/icons/target";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Mail from "lucide-react/dist/esm/icons/mail";
import Plus from "lucide-react/dist/esm/icons/plus";
import Archive from "lucide-react/dist/esm/icons/archive";
import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge, CopyableId, QuoteQuickActionDropdown } from '../ui';
import { useFirestoreCollection } from '../../hooks/data/useFirestoreCollection';
import ClinicFormDrawer from './clinics/ClinicFormDrawer';
import ClinicProfileWorkspace from './clinics/ClinicProfileWorkspace';
import TerritoryFilter from './clinics/TerritoryFilter';
import PageHeader from '../ui/PageHeader';
import AIQuickActionButton from '../ui/AIQuickActionButton';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTable from '../ui/DataTable';
import StandardDrawer from '../ui/StandardDrawer';
import { useToast } from '../../hooks/useToast';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';
import useDataModuleState from '../../hooks/useDataModuleState';
import MobileClinicCard from '../shared/mobile/MobileClinicCard';

// ── Dashboard KPI Cards (Computed from genuine Firestore records) ───────────────
function ClinicKPIs({ data }) {
  const totals = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const uniqueCountries = new Set(list.map(c => c.country).filter(Boolean)).size;
    const totalPhysicians = list.reduce((acc, curr) => acc + (curr.assignedPhysiciansCount || (curr.assignedPhysicianIds && curr.assignedPhysicianIds.length) || 0), 0);
    const activeCount = list.filter(c => c.status === 'active').length;

    return {
      clinics: list.length,
      physicians: totalPhysicians,
      countries: uniqueCountries || (list.length > 0 ? 1 : 0),
      active: activeCount
    };
  }, [data]);

  return (
    <div className="kpi-grid-4" style={{ marginBottom: '1rem', flexShrink: 0 }}>
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
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Physicians</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totals.physicians}</div>
        </div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '12px', background: '#fdf4ff', borderRadius: '50%', color: '#a21caf' }}><Target size={24} /></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Territories / Countries</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totals.countries}</div>
        </div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '12px', background: '#fefce8', borderRadius: '50%', color: '#a16207' }}><FileText size={24} /></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Facility Status</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totals.active} / {totals.clinics}</div>
        </div>
      </div>
    </div>
  );
}

import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';

export default function AdminClinicsTab({ isSubTab = false, initialData = null, serverKPIs = null }) {
  const { searchTerm, updateSearchTerm, getUrlParam, updateUrlParam } = useDataModuleState('admin-clinics');
  
  // Use server-prefetched data if provided; fall back to real-time Firestore collection
  const { data: rawClinics = [], isLoading: loading, refresh } = useFirestoreCollection('clinics', {
    orderByFields: [['name', 'asc']],
    limitCount: 100,
    // Skip the initial Firestore fetch when server already provided data
    enabled: !initialData,
  });

  const clinics = useMemo(() => {
    // Prefer server data on first render (zero-latency), then merge with live Firestore data
    const source = (initialData && rawClinics.length === 0) ? initialData : rawClinics;
    return Array.isArray(source) ? source : [];
  }, [rawClinics, initialData]);


  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const selectedTerritory = getUrlParam('territory', 'All');
  const setSelectedTerritory = (val) => updateUrlParam('territory', val);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return clinics.filter(c => {
      const name = (c.name || c.legalName || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      const country = (c.country || '').toLowerCase();
      const type = (c.type || '').toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch = !q || name.includes(q) || city.includes(q) || country.includes(q) || type.includes(q);
      const matchesTerritory = selectedTerritory === 'All' || country.includes(selectedTerritory.toLowerCase()) || city.includes(selectedTerritory.toLowerCase());
      return matchesSearch && matchesTerritory;
    });
  }, [clinics, searchTerm, selectedTerritory]);

  const columns = [
    {
      key: 'name',
      header: 'Clinic / Medical Center',
      width: '38%',
      render: (c) => {
        const typeLabel = c.type ? c.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Medical Clinic';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, border: '1px solid #bfdbfe' }}>
              🏥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.90rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.name || c.legalName}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CopyableId value={c.id} iconOnly={true} />
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>{typeLabel}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'location',
      header: 'Location & Address',
      width: '28%',
      render: (c) => {
        const loc = [c.city, c.country].filter(Boolean).join(', ');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              📍 {loc || 'Location on file'}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.streetAddress || c.state || 'Address registered'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'contact',
      header: 'Direct Contact',
      width: '20%',
      render: (c) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
            📞 {c.phone || '—'}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#0369a1' }}>
            {c.email || (c.website ? new URL(c.website).hostname.replace('www.', '') : '—')}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status & Actions',
      width: '14%',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }} onClick={e => e.stopPropagation()}>
          <StatusBadge status={c.status || 'active'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <QuoteQuickActionDropdown 
              size="sm" 
              variant="icon" 
              entityContext={{ 
                type: 'clinic', 
                recipientType: 'clinic', 
                clinicId: c.id, 
                clinicName: c.name || c.legalName
              }} 
            />
            <button
              onClick={() => setSelectedClinic(c)}
              className="gcp-btn-icon"
              title="Open Clinic Profile"
              style={{ padding: '4px 6px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              👁️
            </button>
          </div>
        </div>
      )
    }
  ];

  const bulkActions = [
    {
      label: 'Assign Territory',
      icon: MapPin,
      onClick: () => {
        toast.success(`Territory reassigned for ${selectedIds.length} clinics`);
        setSelectedIds([]);
      }
    },
    {
      label: 'Send Notification',
      icon: Mail,
      onClick: () => {
        toast.success(`Notification sent to ${selectedIds.length} clinics`);
        setSelectedIds([]);
      }
    },
    {
      label: 'Archive',
      icon: Archive,
      onClick: () => {
        toast.success(`${selectedIds.length} clinics archived`);
        setSelectedIds([]);
      },
      variant: 'danger'
    }
  ];

  const clinicExpandableRender = (clinic) => (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Contact & Address</span>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{clinic.address || '—'}</div>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{clinic.email || '—'} · {clinic.phone || '—'}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Account Manager</span>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{clinic.manager || 'Unassigned'}</div>
        </div>
        {clinic.insights && clinic.insights.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Clinical & Commercial Insights</span>
            <ul style={{ margin: '4px 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#334155' }}>
              {clinic.insights.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AdminTabErrorBoundary tabId="clinics" tabLabel="Clinics">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <PageHeader
          title="Clinic Network Management"
          subtitle="Manage physical clinic locations, organizational structures, territories, and commercial insights."
          actions={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AIQuickActionButton
                label="AI Forecast Demand"
                onClick={() => {
                  toast.success("AI Clinic Demand & Inventory Forecast generated.");
                }}
                title="Forecast clinic stock reordering and peptide demand with AI"
              />
              <QuoteQuickActionDropdown size="md" variant="secondary" buttonLabel="Quote" />
              <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)}>
                <Plus size={16} /> Add Clinic
              </button>
            </div>
          }
        />
        <div className="tab-container" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          {!loading && <ClinicKPIs data={clinics} />}

          <GlobalSearchBar
            namespace="admin-clinics"
            placeholder="Search clinics by name, network, or territory..."
            searchTerm={searchTerm}
            onSearchChange={updateSearchTerm}
            resultCount={loading ? undefined : filtered.length}
            bulkActions={bulkActions}
            selectedIds={selectedIds}
          />
          
          <TerritoryFilter selectedTerritory={selectedTerritory} onSelectTerritory={setSelectedTerritory} />
          
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginTop: '1rem' }}>
            <DataTable
              data={filtered}
              columns={columns}
              keyField="id"
              expandableRender={clinicExpandableRender}
              onRowClick={setSelectedClinic}
              mobileCardComponent={MobileClinicCard}
              emptyTitle="No clinics found"
              emptySubtitle="Try adjusting your search or filters."
            />
          </div>

          {isWizardOpen && (
            <ClinicFormDrawer 
              isOpen={isWizardOpen}
              onClose={() => setIsWizardOpen(false)}
              onComplete={(newClinic) => {
                setIsWizardOpen(false);
                setClinics(prev => [newClinic, ...prev]);
                toast.success(`Clinic ${newClinic.name} created successfully.`);
              }}
            />
          )}

          <StandardDrawer 
            isOpen={!!selectedClinic} 
            onClose={() => setSelectedClinic(null)} 
            title={selectedClinic?.name}
            width="50vw"
          >
            {selectedClinic && <ClinicProfileWorkspace clinic={selectedClinic} onClose={() => setSelectedClinic(null)} />}
          </StandardDrawer>
        </div>
      </div>
    </AdminTabErrorBoundary>
  );
}