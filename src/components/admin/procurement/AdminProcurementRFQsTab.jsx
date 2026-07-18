"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;
import { Card, DataTable, StatusChip, StandardDrawer } from '../../ui';
import PageHeader from '../../ui/PageHeader';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import DataTableSkeleton from '../../ui/skeletons/DataTableSkeleton';
import { useProcurementManager } from '../../../hooks/data/useProcurementManager';
import toast from 'react-hot-toast';
import { FileText, Loader2, CheckCircle, X, Search } from '@/lib/icons';

export default function AdminProcurementRFQsTab() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRfq, setSelectedRfq] = useState(null);
  
  const { convertPurchaseRFQToPO } = useProcurementManager();

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

  const handleConvertPO = async (rfq) => {
    if (!window.confirm("Are you sure you want to accept this quote and convert to a Purchase Order?")) return;
    
    try {
      await convertPurchaseRFQToPO(rfq.id);
      toast.success("Successfully converted to Purchase Order!");
      setSelectedRfq(null);
      loadRfqs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert to PO");
    }
  };

  const filteredRfqs = rfqs.filter(r => 
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.id.slice(0,8).toUpperCase()}</span>
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
      header: 'Action',
      align: 'right',
      render: (r) => (
        <button 
          onClick={() => setSelectedRfq(r)}
          className="btn btn-outline"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title="Procurement RFQs (Sent to Suppliers)"
        subtitle="Manage Requests for Quotation sent to suppliers to negotiate bulk pricing."
        icon={FileText}
      />

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
          title={`RFQ: ${selectedRfq.id.slice(0,8).toUpperCase()}`}
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
