"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;
import { useAuth } from '../../context/AuthContext';
import FileText from "lucide-react/dist/esm/icons/file-text";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import format from 'date-fns/format';
import SupplierRFQModal from './SupplierRFQModal';
import DataTable from '../ui/DataTable';

export default function SupplierRFQsTab() {
  const { userProfile } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState(null);

  const fetchRfqs = async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'purchase_rfqs'),
        where('supplierId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRfqs(data);
    } catch (err) {
      console.error('Error fetching supplier RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [userProfile?.uid]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending_supplier':
        return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Needs Action</span>;
      case 'supplier_quoted':
        return <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Quoted, Waiting Admin</span>;
      case 'accepted':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Accepted (PO Created)</span>;
      case 'rejected':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12}/> Rejected</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  const columns = [
    {
      key: 'prfqId',
      header: 'Request ID',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{val}</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (val) => val?.seconds ? format(new Date(val.seconds * 1000), 'MMM d, yyyy') : 'N/A',
    },
    {
      key: 'items',
      header: 'Items',
      render: (val) => `${val?.reduce((sum, item) => sum + item.qty, 0) ?? 0} items`,
    },
    {
      key: 'totals',
      header: 'Value (Admin Proposed)',
      render: (val) => <span style={{ fontWeight: 600 }}>${val?.subtotal?.toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => getStatusBadge(val),
    },
    {
      key: '_actions',
      header: 'Action',
      render: (_, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={(e) => { e.stopPropagation(); setSelectedRfq(row); }}
        >
          {row.status === 'pending_supplier' ? 'Review & Respond' : 'View Details'}
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Quotation Requests</h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Review and respond to Admin purchase requests.</p>
      </div>

      <DataTable
        columns={columns}
        data={rfqs}
        keyField="id"
        isLoading={loading}
        onRowClick={(row) => setSelectedRfq(row)}
        emptyTitle="No quotation requests found"
        emptyDescription="You have no pending requests from Admin."
      />

      {selectedRfq && (
        <SupplierRFQModal
          rfq={selectedRfq}
          onClose={() => setSelectedRfq(null)}
          onSuccess={() => {
            setSelectedRfq(null);
            fetchRfqs();
          }}
        />
      )}
    </div>
  );
}
