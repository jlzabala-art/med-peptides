"use client";

import React, { useMemo } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import { CloudLightning } from '@/lib/icons';

export default function InvoiceDataGrid({ invoices = [], onSelect, selectedInvoice, isLoading = false }) {
  const columns = useMemo(() => [
    {
      key: 'documentNumber',
      header: 'Invoice #',
      width: '20%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            {row.documentNumber || row.id?.slice(0, 8)}
          </span>
          <CopyableId value={row.documentNumber || row.id} iconOnly={true} />
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      width: '28%',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {row.customerName || 'Unknown Customer'}
          </div>
          {row.customerEmail && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              {row.customerEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '18%',
      render: (row) => {
        const amount = Number(row.grandTotal) || Number(row.totalAmount) || 0;
        return (
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            €{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '18%',
      render: (row) => {
        const rawStatus = (row.status || 'draft').toLowerCase();
        const mappedStatus = rawStatus === 'partially paid' ? 'pending'
          : rawStatus === 'sent' ? 'processing'
          : rawStatus === 'paid' ? 'completed'
          : rawStatus;
        return <StatusBadge status={mappedStatus} label={row.status || 'Draft'} />;
      },
    },
    {
      key: 'sync',
      header: 'Sync',
      width: '16%',
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
          <CloudLightning size={14} />
          <span>Synced</span>
        </div>
      ),
    },
  ], []);

  const handleRowClick = (row) => {
    if (onSelect) onSelect(row);
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        getRowProps={(row) => ({
          style: {
            backgroundColor: selectedInvoice?.id === row.id ? 'rgba(0, 54, 102, 0.05)' : 'transparent',
            cursor: 'pointer',
          },
        })}
        emptyTitle="No invoices found"
        emptyDescription="There are no synchronized invoices matching this filter."
        showStatusFooter={false}
      />
    </div>
  );
}