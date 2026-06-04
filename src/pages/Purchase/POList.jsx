import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { ShoppingCart, Plus, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui';
import DataTable from '../../components/ui/DataTable';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import POForm from '../../components/purchase/POForm';

export default function POList() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreate = () => {
    setSelectedPo(null);
    setShowForm(true);
  };

  const handleEdit = (po) => {
    setSelectedPo(po);
    setShowForm(true);
  };

  const columns = [
    {
      key: 'poNumber',
      header: 'PO#',
      sortKey: 'poNumber',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.poNumber || r.id.slice(0, 8)}</span>
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
      key: 'amount',
      header: 'Amount',
      sortKey: 'totalAmount',
      render: (r) => `$${(r.totalAmount || 0).toFixed(2)}`
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
          backgroundColor: r.status === 'closed' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', 
          color: r.status === 'closed' ? '#15803d' : '#2563eb' 
        }}>
          {(r.status || 'open').toUpperCase()}
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

  const filtered = pos.filter(r => 
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.poNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="Purchase Orders"
        subtitle="Manage supplier purchase orders generated from approved RFQs."
        icon={ShoppingCart}
        actions={
          <button onClick={handleCreate} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> New PO
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
            searchPlaceholder="Search by supplier or PO number..."
            emptyTitle="No Purchase Orders found"
            emptyDescription="Create a new PO or convert an RFQ to get started."
          />
        )}
      </Card>

      {showForm && (
        <POForm 
          po={selectedPo} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
