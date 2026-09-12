"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;
import { Card, DataTable, StatusChip, CopyableId, StandardDrawer, AppActionGroup, MetricCard, KpiScopeBar } from '../../ui';
import PageHeader from '../../ui/PageHeader';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import DataTableSkeleton from '../../ui/skeletons/DataTableSkeleton';
import { useProcurementManager } from '../../../hooks/data/useProcurementManager';
import { toast } from 'react-hot-toast';
import notifier from '../../../services/NotificationService';
import { FileText, Loader2, CheckCircle, X, Search, Clock, Send, Package, Download } from '@/lib/icons';
import { exportToCSV } from '../../../utils/universalExporter';

export default function AdminProcurementRFQsTab() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [kpiScope, setKpiScope] = useState('filtered');
  
  const { convertPurchaseRFQToPO, createPurchaseRFQ } = useProcurementManager();

  const loadRfqs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'purchase_rfqs'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      setRfqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading rfqs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRfqs();
  }, []);

  const handleCloneRFQ = async (rfq) => {
    try {
      const clonedItems = (rfq.items || []).map(i => ({
        productId: i.productId || '',
        productName: i.productName || i.name || 'Item',
        dosage: i.dosage || '',
        qty: i.qty || i.quantity || 1,
        proposedUnitPrice: i.proposedUnitPrice || i.targetPrice || i.unitPrice || 0,
      }));
      await createPurchaseRFQ({
        supplierId: rfq.supplierId || '',
        items: clonedItems,
        notes: rfq.notes ? `Cloned from #${rfq.id.slice(0, 6)}: ${rfq.notes}` : `Cloned from #${rfq.id.slice(0, 6)}`,
        proposedDiscount: rfq.proposedDiscount || 0,
        shippingAddress: rfq.shippingAddress || null,
      });
      toast.success("RFQ cloned successfully!");
      loadRfqs();
    } catch (err) {
      console.error("Clone RFQ error:", err);
      toast.error("Failed to clone RFQ: " + err.message);
    }
  };

  const handleConvertPO = async (rfq) => {
    notifier.confirmCritical("Are you sure you want to accept this quote and convert to a Purchase Order?", async () => {
      try {
        await convertPurchaseRFQToPO(rfq.id);
        toast.success("Successfully converted to Purchase Order!");
        setSelectedRfq(null);
        loadRfqs();
      } catch (err) {
        console.error(err);
        toast.error("Failed to convert to PO");
      }
    });
  };

  const filteredRfqs = rfqs.filter(r => 
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeRfqsForKpis = kpiScope === 'global' ? rfqs : filteredRfqs;

  const kpis = {
    total: activeRfqsForKpis.length,
    awaitingQuote: activeRfqsForKpis.filter(r => ['sent', 'draft', 'pending'].includes(String(r.status || '').toLowerCase())).length,
    quotesReceived: activeRfqsForKpis.filter(r => ['supplier_responded', 'responded'].includes(String(r.status || '').toLowerCase())).length,
    convertedToPO: activeRfqsForKpis.filter(r => String(r.status || '').toLowerCase() === 'po_created').length,
  };

  const handleExportRfqs = () => {
    const list = filteredRfqs;
    if (list.length === 0) {
      notifier.info("No RFQs to export");
      return;
    }
    const cols = [
      { key: 'id', header: 'RFQ #', accessor: r => r.id },
      { key: 'supplierName', header: 'Supplier', accessor: r => r.supplierName || '' },
      { key: 'status', header: 'Status', accessor: r => r.status || '' },
      { key: 'items', header: 'Item Count', accessor: r => (r.items || []).length },
      { key: 'createdAt', header: 'Date', accessor: r => (r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '') }
    ];
    exportToCSV(list, cols, `procurement_rfqs_${new Date().toISOString().slice(0, 10)}.csv`);
    notifier.success(`Exported ${list.length} RFQs to CSV.`);
  };

  const columns = [
    {
      key: 'createdAt',
      header: 'Date',
      sortKey: 'createdAt',
      sortValue: (r) => r.createdAt?.seconds || 0,
      render: (r) => r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'N/A'
    },
    {
      key: 'id',
      header: 'RFQ #',
      render: (r) => <CopyableId value={r.id} displayValue={r.id.slice(0,8).toUpperCase()} />
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortKey: 'supplierName',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.supplierName}</span>
    },
    {
      key: 'items',
      header: 'Items',
      sortValue: (r) => r.items?.length || 0,
      render: (r) => r.items?.length || 0
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: (r) => <StatusChip status={r.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
          <AppActionGroup
            maxVisible={3}
            actions={[
              { type: 'view', label: 'View RFQ', onClick: () => setSelectedRfq(r) },
              {
                type: 'clone',
                label: 'Clone RFQ (Re-quote Items)',
                onClick: () => handleCloneRFQ(r)
              },
              {
                type: 'create_order',
                label: 'Convert to PO',
                onClick: () => handleConvertPO(r)
              }
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title="Procurement RFQs (Sent to Suppliers)"
        subtitle="Manage Requests for Quotation sent to suppliers to negotiate bulk pricing."
        icon={FileText}
        actions={
          <button
            className="btn btn-outline"
            onClick={handleExportRfqs}
            title="Export RFQs to CSV"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={15} /> Export
          </button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <KpiScopeBar
          scope={kpiScope}
          onScopeChange={setKpiScope}
          isFiltered={filteredRfqs.length !== rfqs.length}
          filteredCount={filteredRfqs.length}
          globalCount={rfqs.length}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <MetricCard
            title="Total RFQs"
            value={kpis.total}
            icon={FileText}
            trend="All procurement requests"
            trendDirection="neutral"
          />
          <MetricCard
            title="Awaiting Quote"
            value={kpis.awaitingQuote}
            icon={Clock}
            trend="Supplier evaluating specs"
            trendDirection="neutral"
          />
          <MetricCard
            title="Quotes Received"
            value={kpis.quotesReceived}
            icon={Send}
            trend="Ready for approval & conversion"
            trendDirection="up"
          />
          <MetricCard
            title="Converted to PO"
            value={kpis.convertedToPO}
            icon={CheckCircle}
            trend="Contract & Order finalized"
            trendDirection="up"
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by supplier or status..."
          resultCount={loading ? undefined : filteredRfqs.length}
          namespace="admin-procurement-rfq"
          size="lg"
        />
      </div>

      <Card style={{ overflow: 'visible', padding: 0 }}>
        {loading ? (
          <DataTableSkeleton rows={8} columns={5} />
        ) : (
          <DataTable
            data={filteredRfqs}
            columns={columns}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search..."
            emptyTitle="No Procurement RFQs found"
            emptyDescription="You have not requested any quotes from suppliers yet."
          />
        )}
      </Card>

      {selectedRfq && (
        <StandardDrawer
          isOpen={true}
          onClose={() => setSelectedRfq(null)}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>RFQ: <CopyableId value={selectedRfq.id} displayValue={selectedRfq.id.slice(0,8).toUpperCase()} /></span>}
          subtitle={`Supplier: ${selectedRfq.supplierName}`}
          width="800px"
          footer={
            <>
              <button onClick={() => setSelectedRfq(null)} className="btn btn-outline">Close</button>
              {selectedRfq.status === 'supplier_responded' && (
                <button 
                  onClick={() => handleConvertPO(selectedRfq)} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={16} /> Accept & Convert to PO
                </button>
              )}
              {selectedRfq.status === 'po_created' && (
                <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>
                  Converted to PO
                </button>
              )}
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedRfq.adminNotes && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <strong>Your Notes:</strong> {selectedRfq.adminNotes}
                </div>
              )}
              {selectedRfq.supplierNotes && (
                <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#1e40af' }}>
                  <strong>Supplier Response:</strong> {selectedRfq.supplierNotes}
                </div>
              )}

              <DataTable
                data={selectedRfq.items?.map((item, idx) => ({ ...item, _idx: idx })) || []}
                keyField="_idx"
                columns={[
                  {
                    key: 'product',
                    header: 'Product',
                    render: (r) => (
                      <>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.dosage} | SKU: {r.sku}</div>
                      </>
                    )
                  },
                  {
                    key: 'qty',
                    header: 'Req. Qty',
                    render: (r) => <div style={{ textAlign: 'right' }}>{r.quantity} {r.units}</div>
                  },
                  {
                    key: 'target',
                    header: 'Your Target',
                    render: (r) => <div style={{ textAlign: 'right', color: 'var(--text-muted)' }}>${parseFloat(r.targetCost).toFixed(2)}</div>
                  },
                  {
                    key: 'offer',
                    header: 'Supplier Offer',
                    render: (r) => <div style={{ textAlign: 'right', fontWeight: r.finalCost ? 700 : 400, color: r.finalCost ? 'var(--primary)' : 'inherit' }}>{r.finalCost ? `$${parseFloat(r.finalCost).toFixed(2)}` : 'Awaiting'}</div>
                  },
                  {
                    key: 'total',
                    header: 'Total',
                    render: (r) => <div style={{ textAlign: 'right', fontWeight: 700 }}>{r.finalCost ? `$${(parseFloat(r.finalCost) * r.quantity).toFixed(2)}` : '—'}</div>
                  }
                ]}
              />
          </div>
        </StandardDrawer>
      )}
    </div>
  );
}
