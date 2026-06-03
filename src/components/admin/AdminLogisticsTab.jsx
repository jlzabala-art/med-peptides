import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, limit, startAfter, getCountFromServer, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent } from '../ui/Card';
import { PackageSearch, FileCheck, Truck, Clock, CheckCircle, Package } from 'lucide-react';
import DataTable from '../ui/DataTable';
import KittingRiskAnalysis from './KittingRiskAnalysis';

export default function AdminLogisticsTab() {
  const [activeTab, setActiveTab] = useState('supplier_shipments'); // 'supplier_shipments' or 'agency_rfqs'
  
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageCursors, setPageCursors] = useState({});
  const PAGE_SIZE = 20;

  const [editingItem, setEditingItem] = useState(null);
  
  // Real-time KPIs
  const [kpiStats, setKpiStats] = useState({ total: 0 });

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const collectionName = activeTab;
      const baseQ = collection(db, collectionName);

      // Total count for pagination
      const countSnap = await getCountFromServer(baseQ);
      const total = countSnap.data().count;
      setTotalPages(Math.ceil(total / PAGE_SIZE));
      setKpiStats({ total });

      let qConstraints = [orderBy('createdAt', 'desc'), limit(PAGE_SIZE)];

      if (page > 1 && pageCursors[page]) {
        qConstraints.push(startAfter(pageCursors[page]));
      }

      const q = query(baseQ, ...qConstraints);
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      setDataList(data);

      if (snap.docs.length > 0) {
        setPageCursors(prev => ({
          ...prev,
          [page + 1]: snap.docs[snap.docs.length - 1]
        }));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    setPageCursors({});
    loadData(1);
  }, [activeTab]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const ref = doc(db, activeTab, editingItem.id);
      const payload = { status: editingItem.status };
      
      if (activeTab === 'supplier_shipments') {
        payload.trackingNumber = editingItem.trackingNumber || '';
        payload.carrier = editingItem.carrier || '';
      }
      
      if (editingItem.status === 'DELIVERED') {
        payload.deliveredAt = new Date();
      }

      await updateDoc(ref, payload);
      setEditingItem(null);
      loadData(currentPage);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating status.");
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase();
    if (['DELIVERED', 'COMPLETED'].includes(s)) {
      return { background: 'var(--color-success-bg, #dcfce7)', color: 'var(--color-success, #166534)' };
    }
    if (['SHIPPED', 'IN_TRANSIT'].includes(s)) {
      return { background: 'var(--color-info-bg, #dbeafe)', color: 'var(--color-info, #1e40af)' };
    }
    return { background: 'var(--color-warning-bg, #ffedd5)', color: 'var(--color-warning, #9a3412)' };
  };

  const columns = [
    { key: 'id', label: 'ID', render: (val) => val.slice(0, 8).toUpperCase() },
    { 
      key: activeTab === 'agency_rfqs' ? 'clientName' : 'supplierId', 
      label: activeTab === 'agency_rfqs' ? 'Client' : 'Supplier',
      render: (val, item) => val || item.supplierName || 'Unknown'
    },
    { key: 'status', label: 'Status', render: (val) => {
      const style = getStatusStyle(val);
      return (
        <span style={{ ...style, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {val?.replace('_', ' ') || 'PENDING'}
        </span>
      );
    }},
    ...(activeTab === 'supplier_shipments' ? [
      { key: 'trackingNumber', label: 'Tracking' },
      { key: 'carrier', label: 'Carrier' }
    ] : []),
    { key: 'createdAt', label: 'Created', render: (val) => val ? new Date(val.seconds ? val.seconds * 1000 : val).toLocaleDateString() : 'N/A' },
    { key: 'actions', label: 'Actions', render: (_, item) => (
      <button 
        onClick={() => setEditingItem(item)}
        style={{ color: 'var(--color-primary, #4f46e5)', fontWeight: '500', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Manage
      </button>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary, #111827)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Truck style={{ color: 'var(--color-primary, #4f46e5)' }} />
            Admin Logistics & Shipping
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #6b7280)', margin: '0.25rem 0 0' }}>Global control center for tracking and managing operations.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
        <button
          style={{ padding: '0.5rem 1rem', fontWeight: 'bold', borderBottom: activeTab === 'supplier_shipments' ? '2px solid var(--color-primary, #4f46e5)' : '2px solid transparent', color: activeTab === 'supplier_shipments' ? 'var(--color-primary, #4f46e5)' : 'var(--color-text-secondary, #6b7280)', background: 'none', cursor: 'pointer', transition: 'colors 0.2s' }}
          onClick={() => setActiveTab('supplier_shipments')}
        >
          Supplier Shipments
        </button>
        <button
          style={{ padding: '0.5rem 1rem', fontWeight: 'bold', borderBottom: activeTab === 'agency_rfqs' ? '2px solid var(--color-primary, #4f46e5)' : '2px solid transparent', color: activeTab === 'agency_rfqs' ? 'var(--color-primary, #4f46e5)' : 'var(--color-text-secondary, #6b7280)', background: 'none', cursor: 'pointer', transition: 'colors 0.2s' }}
          onClick={() => setActiveTab('agency_rfqs')}
        >
          Agency RFQs
        </button>
      </div>

      <KittingRiskAnalysis />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card style={{ borderLeft: '4px solid var(--color-primary, #4f46e5)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <CardContent style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #6b7280)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Records</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-text-primary, #111827)', margin: 0 }}>{kpiStats.total}</p>
            </div>
            <Package style={{ width: '2rem', height: '2rem', color: 'var(--color-border, #e5e7eb)' }} />
          </CardContent>
        </Card>
      </div>

      <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border, #f3f4f6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', margin: 0 }}>{activeTab === 'supplier_shipments' ? 'Supplier Logistics' : 'RFQ Logistics'}</h3>
          <button onClick={() => loadData(1)} style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-primary, #4f46e5)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
            Refresh Data
          </button>
        </div>
        <DataTable
          columns={columns}
          data={dataList}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            loadData(page);
          }}
        />
      </Card>

      {/* Edit Modal */}
      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '28rem', width: '100%', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: 0 }}>Manage Status</h3>
            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>Status</label>
                <select 
                  value={editingItem.status || ''}
                  onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                >
                  <option value="ordered">Ordered</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  {activeTab === 'agency_rfqs' && (
                    <>
                      <option value="RECONCILED">Reconciled</option>
                      <option value="COMPLETED">Completed</option>
                    </>
                  )}
                </select>
              </div>
              
              {activeTab === 'supplier_shipments' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>Tracking Number</label>
                    <input 
                      type="text" 
                      value={editingItem.trackingNumber || ''}
                      onChange={(e) => setEditingItem({...editingItem, trackingNumber: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>Carrier</label>
                    <input 
                      type="text" 
                      value={editingItem.carrier || ''}
                      onChange={(e) => setEditingItem({...editingItem, carrier: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }} 
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', fontWeight: '600', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary, #4f46e5)', color: 'white', borderRadius: '0.25rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
