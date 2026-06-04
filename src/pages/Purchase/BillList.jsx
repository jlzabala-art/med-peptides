import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Receipt, Plus, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui';
import DataTable from '../../components/ui/DataTable';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BillForm from '../../components/purchase/BillForm';

export default function BillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'purchaseBills'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBills(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreate = () => {
    setSelectedBill(null);
    setShowForm(true);
  };

  const handleEdit = (bill) => {
    setSelectedBill(bill);
    setShowForm(true);
  };

  const columns = [
    {
      key: 'billNumber',
      header: 'Bill#',
      sortKey: 'billNumber',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.billNumber || r.id.slice(0, 8)}</span>
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
          backgroundColor: r.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(234,88,12,0.1)', 
          color: r.status === 'paid' ? '#15803d' : '#c2410c' 
        }}>
          {(r.status || 'unpaid').toUpperCase()}
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

  const filtered = bills.filter(r => 
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="Supplier Bills"
        subtitle="Manage bills from suppliers, reconcile with POs, and track payments."
        icon={Receipt}
        actions={
          <button onClick={handleCreate} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> New Bill
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
            searchPlaceholder="Search by supplier or bill number..."
            emptyTitle="No Bills found"
            emptyDescription="Create a new Bill to track supplier payables."
          />
        )}
      </Card>

      {showForm && (
        <BillForm 
          bill={selectedBill} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
