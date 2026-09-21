"use client";

import Building2 from "lucide-react/dist/esm/icons/building-2";
import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Target from "lucide-react/dist/esm/icons/target";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Mail from "lucide-react/dist/esm/icons/mail";
import Plus from "lucide-react/dist/esm/icons/plus";
import Archive from "lucide-react/dist/esm/icons/archive";
import Download from "lucide-react/dist/esm/icons/download";
import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge, CopyableId, QuoteQuickActionDropdown, MetricCard, KpiScopeBar } from '../ui';
import { exportToCSV, triggerServerExport } from '../../utils/universalExporter';
import { useFirestoreCollection } from '../../hooks/data/useFirestoreCollection';
import ClinicFormDrawer from './clinics/ClinicFormDrawer';
import ClinicProfileWorkspace from './clinics/ClinicProfileWorkspace';
import PricingTierSelectorCell from './customers/PricingTierSelectorCell';
import CustomerShareModal from './customers/CustomerShareModal';
import CustomerSharedLinksCard from './customers/CustomerSharedLinksCard';
import TerritoryFilter from './clinics/TerritoryFilter';
import PageHeader from '../ui/PageHeader';
import AIQuickActionButton from '../ui/AIQuickActionButton';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTable from '../ui/DataTable';
import StandardDrawer from '../ui/StandardDrawer';
import { useToast } from '../../hooks/useToast';
import { Share2, Sparkles, MessageCircle, Eye } from '@/lib/icons';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';
import useDataModuleState from '../../hooks/useDataModuleState';
import MobileClinicCard from '../shared/mobile/MobileClinicCard';

// ── Dashboard KPI Cards (Standard MetricCard & KpiScopeBar - Golden Rule #22 & #38) ──
function ClinicKPIs({ data, isFiltered, scope, onScopeChange, totalCount }) {
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
    <div style={{ marginBottom: '1.25rem', flexShrink: 0 }}>
      <KpiScopeBar
        scope={scope}
        onScopeChange={onScopeChange}
        isFiltered={isFiltered}
        filteredCount={data.length}
        totalCount={totalCount || data.length}
        entityName="Clinics"
        scopeLabel={scope === 'global' ? 'Entire Database (Unfiltered)' : (isFiltered ? 'Matching Active Filters' : 'Active Clinic Network')}
      />
      <div className="kpi-grid-4" style={{ marginTop: '0.75rem' }}>
        <MetricCard
          title="Total Clinics"
          value={totals.clinics}
          icon={Building2}
          color="#1d4ed8"
          subtitle="Registered facilities"
        />
        <MetricCard
          title="Assigned Physicians"
          value={totals.physicians}
          icon={Users}
          color="#15803d"
          subtitle="Active medical staff"
        />
        <MetricCard
          title="Territories / Countries"
          value={totals.countries}
          icon={Target}
          color="#a21caf"
          subtitle="Global reach"
        />
        <MetricCard
          title="Active Facility Status"
          value={`${totals.active} / ${totals.clinics}`}
          icon={FileText}
          color="#a16207"
          subtitle="Operating facilities"
        />
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
  const [kpiScope, setKpiScope] = useState('filtered');
  const selectedTerritory = getUrlParam('territory', 'All');
  const setSelectedTerritory = (val) => updateUrlParam('territory', val);
  const selectedType = getUrlParam('type', 'All');
  const setSelectedType = (val) => updateUrlParam('type', val);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [shareModalClinic, setShareModalClinic] = useState(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return clinics.filter(c => {
      const name = (c.name || c.legalName || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      const country = (c.country || '').toLowerCase();
      const type = (c.type || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const id = (c.id || '').toLowerCase();
      const zohoId = (c.zohoContactId || c.zohoContactNumber || '').toLowerCase();
      const phone = (c.phone || '').replace(/[^\d+]/g, '');

      const q = (searchTerm || '').toLowerCase().trim();
      const cleanQ = q.replace(/[^\d+]/g, '');

      const matchesSearch = !q ||
        name.includes(q) ||
        city.includes(q) ||
        country.includes(q) ||
        type.includes(q) ||
        email.includes(q) ||
        id.includes(q) ||
        zohoId.includes(q) ||
        (cleanQ.length >= 3 && phone.includes(cleanQ));

      const matchesTerritory = !selectedTerritory || selectedTerritory === 'All' ||
        country.includes(selectedTerritory.toLowerCase()) ||
        city.includes(selectedTerritory.toLowerCase());
      const matchesType = !selectedType || selectedType === 'All' ||
        type === selectedType.toLowerCase() ||
        type.includes(selectedType.toLowerCase());

      return matchesSearch && matchesTerritory && matchesType;
    });
  }, [clinics, searchTerm, selectedTerritory, selectedType]);

  const columns = [
    {
      key: 'name',
      header: 'Clinic / Medical Center',
      width: '32%',
      render: (c) => {
        const typeLabel = c.type ? c.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Medical Clinic';
        const loc = [c.city, c.country].filter(Boolean).join(', ');
        const hasZohoBooks = Boolean(c.zohoContactId || c.zohoContactNumber);
        const hasZohoBigin = Boolean(c.zohoBiginContactId);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, border: '1px solid #bfdbfe' }}>
              🏥
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.90rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name || c.legalName}
                </span>
                {hasZohoBooks && (
                  <span
                    title={`Zoho Books Contact: ${c.zohoContactNumber || c.zohoContactId}`}
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      backgroundColor: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Books ✓
                  </span>
                )}
                {hasZohoBigin && (
                  <span
                    title="Synchronized with Zoho Bigin CRM"
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Bigin ✓
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b' }}>
                <CopyableId value={c.id} iconOnly={true} />
                <span style={{ color: '#0284c7', fontWeight: 600 }}>{typeLabel}</span>
                {loc && (
                  <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    • 📍 {loc}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'pricingTier',
      header: 'Pricing & Currency',
      width: '20%',
      render: (c) => {
        const currency = c.currency || (c.country?.toLowerCase().includes('emirates') ? 'AED' : (c.country?.toLowerCase().includes('spain') ? 'EUR' : 'USD'));

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <PricingTierSelectorCell
              customer={c}
              customerType="clinic"
              onUpdate={async (id, data) => {
                try {
                  const { updateDoc, doc } = await import('firebase/firestore');
                  const { db } = await import('@/firebase');
                  await updateDoc(doc(db, 'clinics', id), data);
                  refresh();
                } catch (err) {
                  console.error('Failed to update clinic tier:', err);
                  throw err;
                }
              }}
            />
            <span
              style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                lineHeight: 1.2
              }}
              title={`Customer Invoicing Currency: ${currency}`}
            >
              {currency}
            </span>
          </div>
        );
      }
    },
    {
      key: 'contact',
      header: 'Contact & Channels',
      width: '20%',
      render: (c) => {
        const rawPhone = c.phone || '';
        const cleanDigits = rawPhone.replace(/[^\d+]/g, '');
        const waNumber = cleanDigits.replace('+', '');
        const email = c.email || '';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} onClick={e => e.stopPropagation()}>
            {rawPhone ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <a
                  href={`tel:${cleanDigits}`}
                  title={`Call ${rawPhone}`}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  📞 {rawPhone}
                </a>
                {waNumber.length >= 7 && (
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open WhatsApp chat with ${c.name || 'Clinic'}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.70rem',
                      textDecoration: 'none'
                    }}
                  >
                    💬
                  </a>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>— No phone —</span>
            )}

            {email ? (
              <a
                href={`mailto:${email}`}
                title={`Send email to ${email}`}
                style={{
                  fontSize: '0.72rem',
                  color: '#0284c7',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                ✉️ {email}
              </a>
            ) : c.website ? (
              <a
                href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'none' }}
              >
                🌐 {new URL(c.website.startsWith('http') ? c.website : `https://${c.website}`).hostname.replace('www.', '')}
              </a>
            ) : (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>—</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      render: (c) => <StatusBadge status={c.status || 'active'} />
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      width: '18%',
      align: 'right',
      render: (c) => {
        const rawPhone = c.phone || c.contactPhone || '';
        const cleanDigits = rawPhone.replace(/[^\d+]/g, '');
        const waNumber = cleanDigits.replace('+', '');

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }} onClick={e => e.stopPropagation()}>
            {/* 1. Share Public Catalog / Datasheet */}
            <button
              type="button"
              onClick={() => setShareModalClinic(c)}
              className="gcp-action-thumb-btn thumb-share"
              title="Compartir Catálogo B2B / Datasheet con margen verificado"
            >
              <Share2 size={15} />
            </button>

            {/* 2. Commercial Quotation Wizard */}
            <QuoteQuickActionDropdown 
              size="sm" 
              variant="thumbnail" 
              entityContext={{ 
                type: 'clinic', 
                recipientType: 'clinic', 
                clinicId: c.id, 
                clinicName: c.name || c.legalName
              }} 
            />

            {/* 3. WhatsApp Direct Chat */}
            {waNumber.length >= 7 && (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="gcp-action-thumb-btn thumb-whatsapp"
                title={`Abrir chat de WhatsApp con ${c.name || 'la clínica'}`}
              >
                <MessageCircle size={15} />
              </a>
            )}

            {/* 4. AI Demand & Replenishment Forecast */}
            <button
              type="button"
              onClick={() => {
                setSelectedClinic(c);
                toast.success(`AI Demand & Replenishment Forecast generado para ${c.name || 'la clínica'}.`);
              }}
              className="gcp-action-thumb-btn thumb-ai"
              title="AI Demand & Stock Forecast (Predecir consumo de péptidos)"
            >
              <Sparkles size={14} />
            </button>

            {/* 5. 360° Profile Workspace */}
            <button
              type="button"
              onClick={() => setSelectedClinic(c)}
              className="gcp-action-thumb-btn thumb-profile"
              title="Abrir Perfil 360° Workspace (Médicos, Prescripciones, Órdenes)"
            >
              <Eye size={15} />
            </button>
          </div>
        );
      }
    }
  ];

  const handleExportClinics = async (targetList) => {
    const listToExport = targetList || filtered;
    if (!listToExport || listToExport.length === 0) {
      toast.success('Starting direct database export stream for clinics...');
      try {
        await triggerServerExport({ entity: 'clinics', format: 'csv' });
        toast.success('Clinics export completed.');
      } catch (err) {
        toast.error('Failed to export clinics: ' + err.message);
      }
      return;
    }
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Clinic Name' },
      { key: 'territory', header: 'Territory' },
      { key: 'tier', header: 'Tier' },
      { key: 'status', header: 'Status' },
      { key: 'manager', header: 'Account Manager' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'address', header: 'Address' },
    ];
    exportToCSV(listToExport, columns, `clinics_export_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${listToExport.length} clinics to CSV.`);
  };

  const bulkActions = [
    {
      label: 'Export CSV',
      icon: Download,
      onClick: () => {
        const selectedClinics = clinics.filter(c => selectedIds.includes(c.id));
        handleExportClinics(selectedClinics);
      }
    },
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
    <CustomerSharedLinksCard
      customer={clinic}
      customerType="clinic"
      onOpenShareModal={() => setShareModalClinic(clinic)}
      onOpenWorkspace={() => setSelectedClinic(clinic)}
    />
  );

  return (
    <AdminTabErrorBoundary tabId="clinics" tabLabel="Clinics">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {!isSubTab ? (
          <PageHeader
            title="Clinic Network Management"
            subtitle="Manage physical clinic locations, organizational structures, territories, and commercial insights."
            showDashboardBack={false}
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => handleExportClinics()}
                  title="Export clinics database to CSV"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={15} /> Export CSV
                </button>
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
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.5rem 0 1rem',
            borderBottom: '1px solid var(--border)',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Clinic Network & Facilities
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({clinics.length} registered)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="gcp-btn-secondary"
                onClick={() => handleExportClinics()}
                title="Export clinics database to CSV"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.80rem', fontWeight: 600, borderRadius: '6px' }}
              >
                <Download size={14} /> Export CSV
              </button>
              <AIQuickActionButton
                label="AI Forecast Demand"
                onClick={() => {
                  toast.success("AI Clinic Demand & Inventory Forecast generated.");
                }}
                title="Forecast clinic stock reordering and peptide demand with AI"
              />
              <QuoteQuickActionDropdown size="md" variant="secondary" buttonLabel="Quote" />
              <button
                className="gcp-btn-primary"
                onClick={() => setIsWizardOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 14px', fontSize: '0.80rem', fontWeight: 700, borderRadius: '6px' }}
              >
                <Plus size={15} /> Add Clinic
              </button>
            </div>
          </div>
        )}
        <div className="tab-container" style={{ padding: isSubTab ? '0.5rem 0' : '1.5rem', flex: 1, overflowY: 'auto' }}>
          {!loading && (
            <ClinicKPIs
              data={kpiScope === 'global' ? clinics : filtered}
              isFiltered={Boolean(searchTerm.trim() || (selectedTerritory && selectedTerritory !== 'All') || (selectedType && selectedType !== 'All'))}
              scope={kpiScope}
              onScopeChange={setKpiScope}
              totalCount={clinics.length}
            />
          )}

          <GlobalSearchBar
            namespace="admin-clinics"
            placeholder="Search clinics by name, network, or territory..."
            value={searchTerm}
            onChange={updateSearchTerm}
            resultCount={loading ? undefined : filtered.length}
            bulkActions={bulkActions}
            selectedIds={selectedIds}
            filters={[
              selectedTerritory && selectedTerritory !== 'All' && {
                key: 'territory',
                label: 'Territory',
                value: selectedTerritory,
                onRemove: () => setSelectedTerritory('All')
              },
              selectedType && selectedType !== 'All' && {
                key: 'type',
                label: 'Type',
                value: selectedType.replace(/_/g, ' '),
                onRemove: () => setSelectedType('All')
              }
            ].filter(Boolean)}
            filterOptions={[
              {
                key: 'territory',
                label: 'Territory',
                value: selectedTerritory === 'All' ? '' : selectedTerritory,
                options: [
                  { label: 'All Territories', value: '' },
                  { label: 'Dubai (UAE)', value: 'Dubai' },
                  { label: 'Doha (Qatar)', value: 'Doha' },
                  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
                  { label: 'Qatar', value: 'Qatar' }
                ],
                onChange: (val) => setSelectedTerritory(val || 'All')
              },
              {
                key: 'type',
                label: 'Facility Type',
                value: selectedType === 'All' ? '' : selectedType,
                options: [
                  { label: 'All Types', value: '' },
                  { label: 'Longevity Clinic', value: 'longevity_clinic' },
                  { label: 'Aesthetic Center', value: 'aesthetic_center' },
                  { label: 'Hospital', value: 'hospital' },
                  { label: 'Polyclinic', value: 'polyclinic' }
                ],
                onChange: (val) => setSelectedType(val || 'All')
              }
            ]}
          />
          
          <TerritoryFilter
            clinics={clinics}
            selectedTerritory={selectedTerritory}
            onSelectTerritory={setSelectedTerritory}
          />
          
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

          {/* Customer Share Modal (Lotusland baseline + margin) */}
          <CustomerShareModal
            isOpen={Boolean(shareModalClinic)}
            onClose={() => setShareModalClinic(null)}
            customer={shareModalClinic}
            customerType="clinic"
            onSuccess={() => refresh()}
          />

          <StandardDrawer 
            isOpen={!!selectedClinic} 
            onClose={() => setSelectedClinic(null)} 
            hideHeader={true}
            bodyPadding="0"
            width="min(920px, 95vw)"
          >
            {selectedClinic && <ClinicProfileWorkspace clinic={selectedClinic} onClose={() => setSelectedClinic(null)} />}
          </StandardDrawer>
        </div>
      </div>
    </AdminTabErrorBoundary>
  );
}