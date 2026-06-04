import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui';
import DataTable from '../../components/ui/DataTable';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import RFQForm from '../../components/purchase/RFQForm';

export default function RFQList() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'purchase_rfqs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRfqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreate = () => {
    setSelectedRfq(null);
    setShowForm(true);
  };

  const handleEdit = (rfq) => {
    setSelectedRfq(rfq);
    setShowForm(true);
  };

  const columns = [
    {
      key: 'rfqNumber',
      header: 'RFQ#',
      sortKey: 'rfqNumber',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.rfqNumber || r.id.slice(0, 8)}</span>
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortKey: 'supplierName',
    },
    {
      key: 'date',
      header: 'Date',
      sortKey: 'createdAt',
      render: (r) => r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: (r) => (
        <span style={{ 
          padding: '0.25rem 0.5rem', 
          borderRadius: '12px', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          backgroundColor: r.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', 
          color: r.status === 'approved' ? '#15803d' : '#2563eb' 
        }}>
          {(r.status || 'draft').toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (r) => (
        <button 
          onClick={() => handleEdit(r)}
          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
        >
          View / Edit
        </button>
      )
    }
  ];

  const filtered = rfqs.filter(r => 
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="Requests for Quotation"
        subtitle="Manage supplier quote requests before converting to Purchase Orders."
        icon={FileText}
        actions={
          <button onClick={handleCreate} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> New RFQ
          </button>
        }
      />

      <Card style={{ overflow: 'visible', padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" /></div>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by supplier or RFQ number..."
            emptyTitle="No RFQs found"
            emptyDescription="Create a new Request for Quotation to get started."
          />
        )}
      </Card>

      {showForm && (
        <RFQForm 
          rfq={selectedRfq} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
