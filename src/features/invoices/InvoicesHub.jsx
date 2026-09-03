import React, { useState } from 'react';
import useFirestorePaginatedCollection from '../../hooks/data/useFirestorePaginatedCollection';

import InvoiceWorkspace from './InvoiceWorkspace';
import InvoiceActionCenter from './InvoiceActionCenter';
import FinancialKPIHeader from './FinancialKPIHeader';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusChip from '../../components/ui/StatusChip';
import CopyableId from '../../components/ui/CopyableId';
import StandardDrawer from '../../components/ui/StandardDrawer';

export default function InvoicesHub() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const {
    data: invoices,
    isLoading: loading,
    isFetchingMore,
    hasMore,
    loadMore,
    refresh,
    metrics
  } = useFirestorePaginatedCollection('b2b_invoices', {
    pageSize: 50,
    orderByField: 'createdAt',
    orderByDesc: true
  });

  const columns = [
    { key: 'documentNumber', label: 'Invoice #', width: '15%', render: (row) => <CopyableId value={row.documentNumber || row.id.slice(0, 8)} /> },
    { key: 'customerName', label: 'Customer', width: '35%', render: (row) => <span style={{ fontWeight: 600 }}>{row.customerName}</span> },
    { key: 'createdAt', label: 'Date', width: '15%', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'dueDate', label: 'Due Date', width: '15%', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'N/A' },
    { key: 'grandTotal', label: 'Total', width: '10%', render: (row) => `$${(row.grandTotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}` },
    { key: 'status', label: 'Status', width: '10%', render: (row) => <StatusChip status={row.status || 'draft'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader 
        title="Invoices" 
        subtitle="Manage billing, payments, and accounts receivable"
      />
      
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflow: 'auto' }}>
        <FinancialKPIHeader invoices={invoices} />
        
        <DataTable
          data={invoices}
          columns={columns}
          loading={loading}
          globalSearch={true}
          searchPlaceholder="Search invoices..."
          onRowClick={setSelectedInvoice}
        />
      </div>

      <StandardDrawer
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice ${selectedInvoice.documentNumber || selectedInvoice.id.slice(0, 8)}` : ''}
        size="lg"
      >
        {selectedInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InvoiceWorkspace invoice={selectedInvoice} />
            {/* Adding the action center below the workspace for simplicity in the drawer */}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
              <InvoiceActionCenter invoice={selectedInvoice} />
            </div>
          </div>
        )}
      </StandardDrawer>
    </div>
  );
}
