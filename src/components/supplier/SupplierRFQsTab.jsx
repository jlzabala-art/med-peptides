"use client";
/**
 * SupplierRFQsTab.jsx
 *
 * Supplier RFQ Bidding & Operations view (standardized on DataModule).
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRFQsBySupplier } from '@/repositories/supplierRepository';
import { queryKeys } from '@/hooks/data/queryKeys';
import { useAuth } from '../../context/AuthContext';
import FileText from "lucide-react/dist/esm/icons/file-text";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import format from 'date-fns/format';
import SupplierRFQModal from './SupplierRFQModal';
import DataModule from '../ui/DataModule';
import MetricCard from '../ui/MetricCard';
import CopyableId from '../ui/CopyableId';
import StatusBadge from '../ui/StatusBadge';

// Status mappings -> StatusBadge
const RFQ_STATUS_MAP = {
  pending_supplier: 'pending',
  supplier_quoted:  'po_created',
  accepted:         'active',
  rejected:         'rejected',
};

const RFQ_STATUS_LABEL = {
  pending_supplier: 'Needs Action',
  supplier_quoted:  'Quoted · Awaiting Admin',
  accepted:         'Accepted (PO Created)',
  rejected:         'Rejected',
};

const columns = [
  {
    key: 'prfqId',
    header: 'RFQ ID',
    width: '18%',
    render: (row) => (
      <CopyableId value={row.prfqId || row.id} displayValue={row.prfqId || row.id?.slice(0, 10)} />
    ),
  },
  {
    key: 'createdAt',
    header: 'Date',
    width: '16%',
    render: (row) =>
      row.createdAt?.seconds
        ? format(new Date(row.createdAt.seconds * 1000), 'dd MMM yyyy')
        : '—',
  },
  {
    key: 'items',
    header: 'Quantity',
    width: '12%',
    render: (row) => `${row.items?.reduce((s, i) => s + (i.qty ?? 0), 0) ?? 0} units`,
  },
  {
    key: 'totals',
    header: 'Quoted Rate',
    width: '18%',
    render: (row) => (
      <span style={{ fontWeight: 800, color: '#0f172a' }}>
        {row.totals?.subtotal != null ? `$${row.totals.subtotal.toFixed(2)}` : '—'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '20%',
    render: (row) => (
      <StatusBadge
        status={RFQ_STATUS_MAP[row.status] ?? 'inactive'}
        label={RFQ_STATUS_LABEL[row.status] ?? row.status}
      />
    ),
  },
  {
    key: '_actions',
    header: 'Actions',
    width: '16%',
    align: 'right',
    render: (row, _, { onOpen }) => (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpen(row); }}
        style={{
          minHeight: '36px',
          padding: '0 12px',
          background: row.status === 'pending_supplier' ? 'var(--color-primary)' : '#ffffff',
          color: row.status === 'pending_supplier' ? 'white' : '#475569',
          border: '1px solid #cbd5e1',
          borderRadius: '7px',
          fontWeight: 800,
          fontSize: '0.78rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {row.status === 'pending_supplier' ? 'Review & Bid' : 'View Details'}
      </button>
    ),
  },
];

export default function SupplierRFQsTab() {
  const { userProfile } = useAuth();
  const supplierId = userProfile?.uid;
  const queryClient = useQueryClient();
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rfqs = [], isLoading } = useQuery({
    queryKey: queryKeys.rfqs.bySupplier(supplierId, {}),
    queryFn: () => getRFQsBySupplier(supplierId),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(supplierId),
  });

  const handleSuccess = () => {
    setSelectedRfq(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.rfqs.bySupplier(supplierId, {}) });
  };

  const filteredRfqs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rfqs.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(row.prfqId || row.id || '').toLowerCase().includes(q) ||
        String(RFQ_STATUS_LABEL[row.status] || row.status || '').toLowerCase().includes(q)
      );
    });
  }, [rfqs, searchTerm, statusFilter]);

  const kpiStats = useMemo(() => {
    const total = rfqs.length;
    const needsAction = rfqs.filter((r) => r.status === 'pending_supplier').length;
    const accepted = rfqs.filter((r) => r.status === 'accepted').length;
    const quotedValue = rfqs.reduce((acc, r) => acc + (Number(r.totals?.subtotal) || 0), 0);
    return { total, needsAction, accepted, quotedValue };
  }, [rfqs]);

  const columnsWithCtx = columns.map((col) =>
    col.key === '_actions'
      ? { ...col, render: (row) => col.render(row, null, { onOpen: setSelectedRfq }) }
      : col
  );

  const activeFilters = statusFilter !== 'all'
    ? [{
        id: 'status',
        label: `Status: ${RFQ_STATUS_LABEL[statusFilter] || statusFilter}`,
        onRemove: () => setStatusFilter('all'),
      }]
    : [];

  return (
    <>
      <DataModule
        title="Requests for Quotations (RFQs)"
        subtitle="Review and submit competitive bids for bulk purchase requests."
        icon={FileText}
        panel="supplier"
        namespace="supplier_rfqs"
        searchPlaceholder="Search RFQ by ID or status..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={filteredRfqs.length}
        totalCount={rfqs.length}
        filterOptions={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'pending_supplier', label: 'Needs Action' },
              { value: 'supplier_quoted', label: 'Quoted · Awaiting Admin' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
            ],
          },
        ]}
        filters={activeFilters}
        onClearAllFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
        }}
        kpis={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <MetricCard
              title="Total RFQs"
              value={kpiStats.total}
              subtitle="Assigned quote requests"
              icon={FileText}
              color="#2563eb"
            />
            <MetricCard
              title="Needs Action"
              value={kpiStats.needsAction}
              subtitle="Awaiting supplier bid"
              icon={Clock}
              color="#d97706"
            />
            <MetricCard
              title="Accepted POs"
              value={kpiStats.accepted}
              subtitle="Converted to purchase orders"
              icon={CheckCircle}
              color="#16a34a"
            />
            <MetricCard
              title="Quoted Pipeline"
              value={`$${kpiStats.quotedValue.toFixed(2)}`}
              subtitle="Total quoted subtotal"
              icon={DollarSign}
              color="#0f172a"
            />
          </div>
        }
        data={filteredRfqs}
        columns={columnsWithCtx}
        loading={isLoading}
        onRowClick={(row) => setSelectedRfq(row)}
        emptyState={{
          icon: FileText,
          title: 'No Pending Quote Requests',
          subtitle: 'You currently have no open RFQs from platform administrators.',
        }}
      />

      {selectedRfq && (
        <SupplierRFQModal
          rfq={selectedRfq}
          onClose={() => setSelectedRfq(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
