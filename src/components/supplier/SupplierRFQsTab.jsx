"use client";
/**
 * SupplierRFQsTab.jsx
 *
 * Supplier RFQ Bidding & Operations view.
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRFQsBySupplier } from '@/repositories/supplierRepository';
import { queryKeys } from '@/hooks/data/queryKeys';
import { useAuth } from '../../context/AuthContext';
import FileText from "lucide-react/dist/esm/icons/file-text";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import format from 'date-fns/format';
import SupplierRFQModal from './SupplierRFQModal';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

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
      <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
        {row.prfqId || row.id?.slice(0, 10)}
      </span>
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

  const { data: rfqs = [], isLoading } = useQuery({
    queryKey: queryKeys.rfqs.bySupplier(supplierId, {}),
    queryFn: () => getRFQsBySupplier(supplierId),
    staleTime: 1000 * 60 * 5,
    enabled: !!supplierId,
  });

  const handleSuccess = () => {
    setSelectedRfq(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.rfqs.bySupplier(supplierId, {}) });
  };

  const columnsWithCtx = columns.map((col) =>
    col.key === '_actions'
      ? { ...col, render: (row) => col.render(row, null, { onOpen: setSelectedRfq }) }
      : col
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          Requests for Quotations (RFQs)
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
          Review and submit competitive bids for bulk purchase requests.
        </p>
      </div>

      <DataTable
        columns={columnsWithCtx}
        data={rfqs}
        keyField="id"
        loading={isLoading}
        onRowClick={(row) => setSelectedRfq(row)}
        globalSearch={true}
        searchPlaceholder="Search RFQ by ID or status..."
        emptyState={
          <EmptyState
            icon={FileText}
            title="No Pending Quote Requests"
            subtitle="You currently have no open RFQs from platform administrators."
          />
        }
      />

      {selectedRfq && (
        <SupplierRFQModal
          rfq={selectedRfq}
          onClose={() => setSelectedRfq(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
