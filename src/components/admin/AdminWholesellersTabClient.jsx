"use client";
/**
 * AdminWholesellersTabClient.jsx
 *
 * Tab exclusivo para WHOLESELLERS (distribuidores/revendedores).
 * Lee de la colección `wholesellers` — COMPLETAMENTE DISTINTO de `suppliers`.
 *
 * Relación con suppliers:
 *   - Un wholeseller puede tener authorizedVariantIds[] que referencia variantes
 *     que a su vez tienen supplierId. Pero el wholeseller NO es un supplier.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWholesellerData } from './wholesellers/useWholesellerData';
import { getWholesellerColumns } from './wholesellers/wholesellerColumns';
import PageHeader from '../ui/PageHeader';
import DataModule from '../ui/DataModule';
import StandardDrawer from '../ui/StandardDrawer';
import CreateWholesellerDrawer from './CreateWholesellerDrawer';
import Modal from '../ui/Modal';
import AccountManagerSelect from '../ui/AccountManagerSelect';
import { DataTableSkeleton } from '../ui';
import StatusBadge from '../ui/StatusBadge';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import { CheckCircle, XCircle, Users, Mail, Download, Archive, Package, Globe } from '@/lib/icons';
import toast from 'react-hot-toast';
import notifier from '../../services/NotificationService';

// ── KPI Cards ─────────────────────────────────────────────────────────────────
function WholesellerKPIs({ kpiStats, isLoading, activeKpiFilter, setActiveKpiFilter }) {
  const cards = [
    {
      key: null,
      label: 'Total Wholesellers',
      value: kpiStats?.total ?? '—',
      icon: Building2,
      color: 'var(--color-primary)',
    },
    {
      key: 'active',
      label: 'Active',
      value: kpiStats?.active ?? '—',
      icon: CheckCircle,
      color: '#16a34a',
    },
    {
      key: 'pending',
      label: 'Pending Approval',
      value: kpiStats?.pending ?? '—',
      icon: Package,
      color: '#d97706',
    },
    {
      key: 'restricted',
      label: 'Custom Catalog',
      value: kpiStats?.restricted ?? '—',
      icon: Globe,
      color: '#2563eb',
    },
  ];

  if (isLoading) {
    return (
      <div className="kpi-grid-4" style={{ marginBottom: '1rem' }}>
        {cards.map((_, i) => (
          <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--surface-alt)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="kpi-grid-4" style={{ marginBottom: '1rem' }}>
      {cards.map(card => {
        const Icon = card.icon;
        const isActive = activeKpiFilter === card.key;
        return (
          <button
            key={card.label}
            onClick={() => setActiveKpiFilter(isActive ? null : card.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1rem', borderRadius: '12px',
              background: isActive ? card.color + '15' : 'var(--surface)',
              border: `1px solid ${isActive ? card.color : 'var(--border)'}`,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={16} style={{ color: card.color }} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {isLoading ? '—' : (card.value ?? '—')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.label}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminWholesellersTabClient({ isMobile, initialData }) {
  const {
    wholesellers,
    paginatedData,
    loading,
    kpisLoading,
    serverKpis,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    activeKpiFilter,
    setActiveKpiFilter,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    handleUpdate,
    handleBulkUpdate,
    handleCreate,
    handleDelete,
    refresh,
  } = useWholesellerData({ initialData });

  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedWholeseller, setSelectedWholeseller] = useState(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState('');

  if (loading && !wholesellers.length) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <PageHeader
          title="Wholesellers"
          subtitle="Distributors & resellers — manage catalog access, pricing tiers, and relationships."
        />
        <DataTableSkeleton rows={10} columns={6} showHeader showSearch />
      </div>
    );
  }

  const handleToggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleToggleSelectAll = (checked) =>
    setSelectedIds(checked ? paginatedData.map(w => w.id) : []);

  const handleBulkAction = async (action) => {
    if (action === 'Activate') {
      await handleBulkUpdate(selectedIds, { status: 'active' });
      setSelectedIds([]);
    } else if (action === 'Suspend') {
      await handleBulkUpdate(selectedIds, { status: 'inactive' });
      setSelectedIds([]);
    } else if (action === 'Assign Manager') {
      setSelectedManager('');
      setManagerModalOpen(true);
    } else {
      toast.success(`Bulk action [${action}] for ${selectedIds.length} wholesellers. (Feature in development)`);
      setSelectedIds([]);
    }
  };

  const submitAssignManager = async () => {
    if (!selectedManager) { toast.error('Please select an Account Manager'); return; }
    await handleBulkUpdate(selectedIds, { accountManagerId: selectedManager });
    setManagerModalOpen(false);
    setSelectedIds([]);
  };

  const columns = getWholesellerColumns({
    onUpdate: (id, data) => handleUpdate(id, data),
  });

  return (
    <>
      <DataModule
        loading={loading}
        title="Wholesellers"
        subtitle="Distributors & resellers — manage catalog access, pricing tiers, and relationships."
        icon={Building2}
        kpis={
          <WholesellerKPIs
            kpiStats={serverKpis}
            isLoading={kpisLoading}
            activeKpiFilter={activeKpiFilter}
            setActiveKpiFilter={setActiveKpiFilter}
          />
        }
        primaryAction={{
          label: 'New Wholeseller',
          icon: Building2,
          onClick: () => setCreateDrawerOpen(true),
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search wholesellers by name, country, contact..."
        resultCount={totalItems}
        namespace="admin-wholesellers"
        filters={[
          ...(filters?.status || []).map(val => ({
            key: `status-${val}`,
            label: 'Status',
            value: val,
            onRemove: () => setFilters(prev => ({ ...prev, status: prev.status.filter(v => v !== val) })),
          })),
          ...(filters?.tier || []).map(val => ({
            key: `tier-${val}`,
            label: 'Tier',
            value: val,
            onRemove: () => setFilters(prev => ({ ...prev, tier: prev.tier.filter(v => v !== val) })),
          })),
        ].filter(Boolean)}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            multiSelect: true,
            values: filters?.status || [],
            options: [
              { label: 'Active',   value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Pending',  value: 'pending' },
              { label: 'Archived', value: 'archived' },
            ],
            onChange: (vals) => setFilters(prev => ({ ...prev, status: vals })),
          },
          {
            key: 'tier',
            label: 'Pricing Tier',
            multiSelect: true,
            values: filters?.tier || [],
            options: [
              { label: 'Standard',  value: 'standard' },
              { label: 'Clinic B2B', value: 'tier_b2b_clinic' },
              { label: 'Premium',   value: 'premium' },
            ],
            onChange: (vals) => setFilters(prev => ({ ...prev, tier: vals })),
          },
        ]}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={[
          { label: 'Activate',        icon: <CheckCircle size={14} />, onClick: () => handleBulkAction('Activate') },
          { label: 'Suspend',         icon: <XCircle size={14} />,     onClick: () => handleBulkAction('Suspend') },
          { label: 'Assign Manager',  icon: <Users size={14} />,       onClick: () => handleBulkAction('Assign Manager') },
          { label: 'Email',           icon: <Mail size={14} />,        onClick: () => handleBulkAction('Email') },
          { label: 'Export',          icon: <Download size={14} />,    onClick: () => handleBulkAction('Export') },
          { label: 'Archive',         icon: <Archive size={14} />,     onClick: () => handleBulkAction('Archive'), variant: 'danger' },
        ]}
        data={paginatedData}
        columns={columns}
        keyField="id"
        onRowClick={(d) => setSelectedWholeseller(d)}
        emptyState={{
          title: 'No wholesellers found',
          subtitle: 'Create your first wholeseller or adjust your filters.',
          action: { label: 'New Wholeseller', onClick: () => setCreateDrawerOpen(true) },
        }}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* Create Wholeseller Drawer */}
      <CreateWholesellerDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={async (data) => {
          await handleCreate(data);
          setCreateDrawerOpen(false);
          refresh();
        }}
      />

      {/* Assign Manager Modal */}
      <Modal
        isOpen={managerModalOpen}
        onClose={() => setManagerModalOpen(false)}
        title="Assign Account Manager"
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="gcp-btn-secondary" onClick={() => setManagerModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitAssignManager}>Assign</button>
          </div>
        }
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Select an account manager to assign to {selectedIds.length} selected wholeseller(s).
          </p>
          <AccountManagerSelect
            label="Account Manager"
            value={selectedManager}
            onChange={setSelectedManager}
            placeholder="Search manager..."
          />
        </div>
      </Modal>
    </>
  );
}