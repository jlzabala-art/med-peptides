"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users2,
  Building2,
  Stethoscope,
  User,
  Share2,
  Mail,
  Phone,
  Eye,
  Plus,
  Download,
  CheckCircle,
  Archive,
  RefreshCw,
  Globe,
  Layers
} from '@/lib/icons';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import useDataModuleState from '../../../hooks/useDataModuleState';
import { DataTable, StatusBadge, CopyableId, MetricCard, KpiScopeBar, QuoteQuickActionDropdown } from '../../ui';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import PricingTierSelectorCell from './PricingTierSelectorCell';
import CustomerSharedLinksCard from './CustomerSharedLinksCard';
import CustomerShareModal from './CustomerShareModal';
import ClinicProfileWorkspace from '../clinics/ClinicProfileWorkspace';
import StandardDrawer from '../../ui/StandardDrawer';
import { exportToCSV } from '../../../utils/universalExporter';
import { useToast } from '../../../hooks/useToast';

/**
 * Flag / Icon helper by customer type
 */
function getCustomerTypeMeta(type = '') {
  const t = (type || '').toLowerCase();
  if (t.includes('clinic') || t.includes('hospital')) {
    return { label: 'Clinic', icon: '🏥', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' };
  }
  if (t.includes('wholesaler') || t.includes('distributor')) {
    return { label: 'Wholesaler', icon: '🏢', color: '#c2410c', bg: '#fff7ed', border: '#ffedd5' };
  }
  if (t.includes('doctor') || t.includes('physician')) {
    return { label: 'Doctor', icon: '🩺', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
  }
  return { label: 'Patient', icon: '👤', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
}

/**
 * AdminAllCustomersDirectory
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Unified Customers Directory (SSOT).
 * Unifies Clinics, Wholesalers, Doctors, and Patients into a single,
 * cohesive Google Cloud style console.
 */
export default function AdminAllCustomersDirectory({ onSyncSSOT, isSyncing = false }) {
  const { toast } = useToast();
  const { searchTerm, updateSearchTerm, getUrlParam, updateUrlParam } = useDataModuleState('admin-customers-all');

  // Query authoritative 'customers' collection
  const { data: rawCustomers = [], isLoading: loadingCustomers, refresh } = useFirestoreCollection('customers', {
    orderByFields: [['name', 'asc']],
    limitCount: 200
  });

  // Also query 'clinics' and 'wholesellers' to guarantee zero-orphan completeness
  const { data: rawClinics = [] } = useFirestoreCollection('clinics', { limitCount: 100 });
  const { data: rawWholesalers = [] } = useFirestoreCollection('wholesellers', { limitCount: 100 });

  // Merge and harmonize into a single authoritative customer list
  const allCustomers = useMemo(() => {
    const map = new Map();

    // 1. Existing in 'customers'
    rawCustomers.forEach(c => {
      if (c && c.id) map.set(c.id, { ...c });
    });

    // 2. Supplement clinics if not yet migrated
    rawClinics.forEach(cl => {
      if (!cl || !cl.id) return;
      if (!map.has(cl.id)) {
        map.set(cl.id, {
          id: cl.id,
          customerType: 'clinic',
          name: cl.name || cl.legalName || 'Clinic Partner',
          companyName: cl.name,
          email: cl.email,
          phone: cl.phone,
          country: cl.country,
          city: cl.city,
          pricingTier: cl.pricingTier || 'clinic_partner',
          currency: cl.currency || (cl.country?.toLowerCase().includes('emirates') ? 'AED' : 'USD'),
          status: cl.status || 'active',
          zohoContactId: cl.zohoContactId,
          zohoContactNumber: cl.zohoContactNumber,
          zohoBiginContactId: cl.zohoBiginContactId
        });
      }
    });

    // 3. Supplement wholesalers if not yet migrated
    rawWholesalers.forEach(ws => {
      if (!ws || !ws.id) return;
      if (!map.has(ws.id)) {
        map.set(ws.id, {
          id: ws.id,
          customerType: 'wholesaler',
          name: ws.companyName || ws.name || 'Wholesale Partner',
          companyName: ws.companyName || ws.name,
          email: ws.contactEmail || ws.email,
          phone: ws.contactPhone || ws.phone,
          country: ws.country,
          city: ws.city,
          pricingTier: ws.pricingTier || 'standard',
          currency: ws.currency || 'USD',
          status: ws.status || 'active',
          zohoContactId: ws.zohoContactId,
          zohoContactNumber: ws.zohoContactNumber,
          zohoBiginContactId: ws.zohoBiginContactId
        });
      }
    });

    return Array.from(map.values());
  }, [rawCustomers, rawClinics, rawWholesalers]);

  const [serverKpis, setServerKpis] = useState(null);
  const [loadingKpis, setLoadingKpis] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadKpis() {
      try {
        const res = await fetch('/api/customers/kpis');
        const data = await res.json();
        if (isMounted && res.ok && data.success) {
          setServerKpis(data);
        }
      } catch (err) {
        console.warn('Could not fetch server customer KPIs:', err);
      } finally {
        if (isMounted) setLoadingKpis(false);
      }
    }
    loadKpis();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filters State
  const selectedType = getUrlParam('type', 'All');
  const setSelectedType = (val) => updateUrlParam('type', val);

  const selectedCountry = getUrlParam('country', 'All');
  const setSelectedCountry = (val) => updateUrlParam('country', val);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [shareModalCustomer, setShareModalCustomer] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [kpiScope, setKpiScope] = useState('filtered');

  // Filter calculation across all 8 facets
  const filtered = useMemo(() => {
    return allCustomers.filter(c => {
      const name = (c.name || c.companyName || c.legalName || '').toLowerCase();
      const email = (c.email || c.contactEmail || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      const country = (c.country || '').toLowerCase();
      const type = (c.customerType || c.type || '').toLowerCase();
      const id = (c.id || '').toLowerCase();
      const zoho = (c.zohoContactId || c.zohoContactNumber || c.zohoBiginContactId || '').toLowerCase();
      const rawPhone = (c.phone || c.contactPhone || c.mobile || '');
      const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

      const q = (searchTerm || '').toLowerCase().trim();
      const cleanQ = q.replace(/[^\d+]/g, '');

      const matchesSearch = !q ||
        name.includes(q) ||
        email.includes(q) ||
        city.includes(q) ||
        country.includes(q) ||
        id.includes(q) ||
        zoho.includes(q) ||
        (cleanQ.length >= 3 && cleanPhone.includes(cleanQ));

      // 8-KPI Facet Matching
      let matchesFacet = true;
      if (selectedType && selectedType !== 'All') {
        const sel = selectedType.toLowerCase();
        if (sel === 'active') {
          matchesFacet = (c.status || '').toLowerCase() === 'active';
        } else if (sel === 'zoho') {
          matchesFacet = Boolean(c.zohoContactId || c.zohoContactNumber || c.hasBooks);
        } else if (sel === 'hybrid') {
          matchesFacet = Boolean(c.isSupplier || (Array.isArray(c.roles) && c.roles.length > 1));
        } else {
          matchesFacet = type.includes(sel);
        }
      }

      const matchesCountry = !selectedCountry || selectedCountry === 'All' ||
        country.toLowerCase().includes(selectedCountry.toLowerCase()) ||
        city.toLowerCase().includes(selectedCountry.toLowerCase());

      return matchesSearch && matchesFacet && matchesCountry;
    });
  }, [allCustomers, searchTerm, selectedType, selectedCountry]);

  // Distinct territory counts
  const territoryOptions = useMemo(() => {
    const map = new Map();
    allCustomers.forEach(c => {
      const country = c.country?.trim();
      if (country) map.set(country, (map.get(country) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  }, [allCustomers]);

  // Counts by type & facets (Client fallback)
  const typeCounts = useMemo(() => {
    let clinicsCount = 0;
    let wholesalersCount = 0;
    let doctorsCount = 0;
    let patientsCount = 0;
    let activeCount = 0;
    let zohoCount = 0;
    let hybridCount = 0;

    allCustomers.forEach(c => {
      const t = (c.customerType || c.type || '').toLowerCase();
      if (t.includes('clinic')) clinicsCount++;
      else if (t.includes('wholesal')) wholesalersCount++;
      else if (t.includes('doctor') || t.includes('physician')) doctorsCount++;
      else patientsCount++;

      if ((c.status || '').toLowerCase() === 'active') activeCount++;
      if (c.zohoContactId || c.zohoContactNumber || c.hasBooks) zohoCount++;
      if (c.isSupplier || (Array.isArray(c.roles) && c.roles.length > 1)) hybridCount++;
    });

    return {
      all: allCustomers.length,
      clinics: clinicsCount,
      wholesalers: wholesalersCount,
      doctors: doctorsCount,
      patients: patientsCount,
      active: activeCount,
      zoho: zohoCount,
      hybrid: hybridCount
    };
  }, [allCustomers]);

  // Dynamic filtered counts for Scope Switcher (Golden Rule #22)
  const filteredCounts = useMemo(() => {
    let clinicsCount = 0;
    let wholesalersCount = 0;
    let doctorsCount = 0;
    let patientsCount = 0;
    let activeCount = 0;
    let zohoCount = 0;
    let hybridCount = 0;

    filtered.forEach(c => {
      const t = (c.customerType || c.type || '').toLowerCase();
      if (t.includes('clinic')) clinicsCount++;
      else if (t.includes('wholesal')) wholesalersCount++;
      else if (t.includes('doctor') || t.includes('physician')) doctorsCount++;
      else patientsCount++;

      if ((c.status || '').toLowerCase() === 'active') activeCount++;
      if (c.zohoContactId || c.zohoContactNumber || c.hasBooks) zohoCount++;
      if (c.isSupplier || (Array.isArray(c.roles) && c.roles.length > 1)) hybridCount++;
    });

    return {
      all: filtered.length,
      clinics: clinicsCount,
      wholesalers: wholesalersCount,
      doctors: doctorsCount,
      patients: patientsCount,
      active: activeCount,
      zoho: zohoCount,
      hybrid: hybridCount
    };
  }, [filtered]);

  // Bulk actions
  const bulkActions = [
    {
      label: 'Export Selected',
      icon: Download,
      onClick: () => {
        const toExport = allCustomers.filter(c => selectedIds.includes(c.id));
        exportToCSV(toExport, 'customers_export.csv');
        toast.success(`Exported ${toExport.length} accounts to CSV`);
        setSelectedIds([]);
      }
    }
  ];

  // Columns definition
  const columns = [
    {
      key: 'name',
      header: 'Customer / Organization',
      width: '38%',
      render: (row) => {
        const meta = getCustomerTypeMeta(row.customerType || row.type);
        const hasBooks = Boolean(row.zohoContactId || row.zohoContactNumber);
        const hasBigin = Boolean(row.zohoBiginContactId);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                flexShrink: 0
              }}
            >
              {meta.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.name || row.companyName || 'Unnamed Account'}
                </span>
                {hasBooks && (
                  <span
                    title={`Zoho Books Contact: ${row.zohoContactNumber || row.zohoContactId}`}
                    style={{
                      fontSize: '0.64rem',
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
                {hasBigin && (
                  <span
                    title="Synchronized with Zoho Bigin CRM"
                    style={{
                      fontSize: '0.64rem',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                <CopyableId value={row.id} />
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'customerType',
      header: 'Channel Type',
      width: '15%',
      render: (row) => {
        const meta = getCustomerTypeMeta(row.customerType || row.type);
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.border}`,
              fontSize: '0.74rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            {meta.icon} {meta.label}
          </span>
        );
      }
    },
    {
      key: 'commercialTerms',
      header: 'Pricing & Currency',
      width: '16%',
      render: (row) => {
        const currency = row.currency || (row.country?.toLowerCase().includes('emirates') ? 'AED' : (row.country?.toLowerCase().includes('spain') ? 'EUR' : 'USD'));
        const markup = row.commercialMarkup ?? row.markup ?? row.discountMargin ?? 20;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                whiteSpace: 'nowrap'
              }}
            >
              +{markup}%
            </span>
            <span
              style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                whiteSpace: 'nowrap'
              }}
            >
              {currency}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '13%',
      render: (row) => <StatusBadge status={row.status || 'active'} />
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      width: '18%',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className="gcp-action-thumb-btn thumb-workspace"
            onClick={() => useWorkspaceStore.getState().loadUserIntoWorkspace(row, { role: row.customerType || 'customer' })}
            style={{ width: '30px', height: '30px' }}
            title="Cargar en Workspace comercial"
          >
            <Layers size={14} />
          </button>
          <button
            type="button"
            className="gcp-action-thumb-btn thumb-share"
            onClick={() => setShareModalCustomer(row)}
            style={{ width: '30px', height: '30px' }}
            title="Compartir Catálogo B2B / Ficha"
          >
            <Share2 size={14} />
          </button>
          <QuoteQuickActionDropdown
            size="sm"
            variant="thumbnail"
            entityContext={{
              type: row.customerType || 'customer',
              recipientType: row.customerType || 'customer',
              customerId: row.id,
              customerName: row.name || row.companyName
            }}
          />
          <button
            type="button"
            className="gcp-action-thumb-btn thumb-profile"
            onClick={() => setSelectedCustomer(row)}
            style={{ width: '30px', height: '30px' }}
            title="Abrir Perfil del Cliente (360°)"
          >
            <Eye size={14} />
          </button>
        </div>
      )
    }
  ];

  const isFilteredScope = kpiScope === 'filtered';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* ── KPI SCOPE SWITCHER & SSOT SYNC (Rule #22) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
        <KpiScopeBar
          scope={kpiScope}
          onScopeChange={setKpiScope}
          isFiltered={selectedType !== 'All' || selectedCountry !== 'All' || Boolean(searchTerm)}
          filteredCount={filtered.length}
          globalCount={serverKpis?.total ?? allCustomers.length}
        />
        {onSyncSSOT && (
          <button
            type="button"
            className="gcp-btn-secondary"
            onClick={onSyncSSOT}
            disabled={isSyncing}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing SSOT...' : 'Sync SSOT'}
          </button>
        )}
      </div>

      {/* ── 8 SERVER-SIDE INTERACTIVE KPIS (GCP Resource Console Standard) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        width: '100%'
      }}>
        {[
          { title: 'Total Accounts (SSOT)', value: isFilteredScope ? filteredCounts.all : (serverKpis?.total ?? typeCounts.all), icon: Users2, color: '#1d4ed8', subtitle: isFilteredScope ? 'Matching active filters' : 'Consolidated database', typeId: 'All' },
          { title: 'Clinics & Centers', value: isFilteredScope ? filteredCounts.clinics : (serverKpis?.clinics ?? typeCounts.clinics), icon: Stethoscope, color: '#0d9488', subtitle: 'Medical facilities', typeId: 'clinic' },
          { title: 'Wholesalers (B2B)', value: isFilteredScope ? filteredCounts.wholesalers : (serverKpis?.wholesalers ?? typeCounts.wholesalers), icon: Building2, color: '#c2410c', subtitle: 'Bulk commercial accounts', typeId: 'wholesaler' },
          { title: 'Doctors / Prescribers', value: isFilteredScope ? filteredCounts.doctors : (serverKpis?.doctors ?? typeCounts.doctors), icon: Stethoscope, color: '#2563eb', subtitle: 'Licensed practitioners', typeId: 'doctor' },
          { title: 'Direct Patients', value: isFilteredScope ? filteredCounts.patients : (serverKpis?.patients ?? typeCounts.patients), icon: User, color: '#7c3aed', subtitle: 'B2C end consumers', typeId: 'patient' },
          { title: 'Active Accounts', value: isFilteredScope ? filteredCounts.active : (serverKpis?.active ?? typeCounts.active), icon: CheckCircle, color: '#16a34a', subtitle: 'Active status', typeId: 'active' },
          { title: 'Zoho Books Synced', value: isFilteredScope ? filteredCounts.zoho : (serverKpis?.zohoSynced ?? typeCounts.zoho), icon: RefreshCw, color: '#0891b2', subtitle: 'SSOT ERP contacts', typeId: 'zoho' },
          { title: 'Multi-Role / Hybrid', value: isFilteredScope ? filteredCounts.hybrid : (serverKpis?.multiRole ?? typeCounts.hybrid), icon: Layers, color: '#9333ea', subtitle: 'Cross-counterparty', typeId: 'hybrid' },
        ].map(card => {
          const isActiveCard = selectedType === card.typeId || (card.typeId === 'All' && (!selectedType || selectedType === 'All'));
          return (
            <div
              key={card.typeId}
              onClick={() => setSelectedType(card.typeId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedType(card.typeId)}
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                outline: isActiveCard ? `2.5px solid ${card.color}` : '2.5px solid transparent',
                outlineOffset: '2px',
                transition: 'all 0.15s ease',
                boxShadow: isActiveCard ? `0 4px 14px ${card.color}25` : '0 1px 3px rgba(0,0,0,0.03)',
              }}
              title={`Filter by ${card.title}`}
            >
              <MetricCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                subtitle={card.subtitle}
              />
            </div>
          );
        })}
      </div>

      {/* ── UNIFIED SEARCH BAR ── */}
      <GlobalSearchBar
        namespace="admin-customers-all"
        placeholder="Search any account by name, email, phone, ID, city, or Zoho code..."
        value={searchTerm}
        onChange={updateSearchTerm}
        resultCount={filtered.length}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        filters={[
          selectedType && selectedType !== 'All' && {
            key: 'type',
            label: 'Filter',
            value: selectedType === 'clinic' ? 'Clinics' :
                   selectedType === 'wholesaler' ? 'Wholesalers' :
                   selectedType === 'doctor' ? 'Doctors' :
                   selectedType === 'patient' ? 'Patients' :
                   selectedType === 'active' ? 'Active Status' :
                   selectedType === 'zoho' ? 'Zoho Books Synced' :
                   selectedType === 'hybrid' ? 'Multi-Role / Hybrid' : selectedType,
            onRemove: () => setSelectedType('All')
          },
          selectedCountry && selectedCountry !== 'All' && {
            key: 'country',
            label: 'Territory',
            value: selectedCountry,
            onRemove: () => setSelectedCountry('All')
          }
        ].filter(Boolean)}
        filterOptions={[
          {
            key: 'type',
            label: 'Filter Facet',
            value: selectedType === 'All' ? '' : selectedType,
            options: [
              { label: 'All Accounts', value: '' },
              { label: `🏥 Clinics (${typeCounts.clinics})`, value: 'clinic' },
              { label: `🏢 Wholesalers (${typeCounts.wholesalers})`, value: 'wholesaler' },
              { label: `🩺 Doctors (${typeCounts.doctors})`, value: 'doctor' },
              { label: `👤 Patients (${typeCounts.patients})`, value: 'patient' },
              { label: `✅ Active (${typeCounts.active})`, value: 'active' },
              { label: `⚡ Zoho Synced (${typeCounts.zoho})`, value: 'zoho' },
              { label: `🔄 Multi-Role / Hybrid (${typeCounts.hybrid})`, value: 'hybrid' }
            ],
            onChange: (val) => setSelectedType(val || 'All')
          },
          {
            key: 'country',
            label: 'Territory',
            value: selectedCountry === 'All' ? '' : selectedCountry,
            options: [
              { label: 'All Territories', value: '' },
              ...territoryOptions.map(t => ({ label: `${t.label} (${t.count})`, value: t.label }))
            ],
            onChange: (val) => setSelectedCountry(val || 'All')
          }
        ]}
      />



      {/* ── MAIN UNIFIED DATATABLE ── */}
      <div style={{ backgroundColor: 'var(--surface, #ffffff)', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', overflow: 'hidden' }}>
        <DataTable
          data={filtered}
          columns={columns}
          keyField="id"
          loading={loadingCustomers || loadingKpis}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          expandableRender={(row) => (
            <CustomerSharedLinksCard
              customer={row}
              customerType={row.customerType || 'customer'}
              onOpenShareModal={() => setShareModalCustomer(row)}
              onOpenWorkspace={() => setSelectedCustomer(row)}
            />
          )}
          emptyTitle="No customer accounts found"
          emptySubtitle="Try adjusting your search term or channel filters."
        />
      </div>

      {/* ── DRAWERS & MODALS ── */}
      {selectedCustomer && (
        <StandardDrawer
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={`Profile · ${selectedCustomer.name || selectedCustomer.companyName}`}
          size="full"
        >
          <ClinicProfileWorkspace
            clinic={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </StandardDrawer>
      )}

      {shareModalCustomer && (
        <CustomerShareModal
          isOpen={Boolean(shareModalCustomer)}
          onClose={() => setShareModalCustomer(null)}
          customer={shareModalCustomer}
          customerType={shareModalCustomer.customerType || 'customer'}
          onShareGenerated={() => {
            refresh();
            toast.success('B2B Catalog link generated successfully!');
          }}
        />
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
