import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, limit, startAfter, getCountFromServer, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent } from '../ui/Card';
import { PackageSearch, FileCheck, Truck, Clock, CheckCircle, Package } from 'lucide-react';
import DataTable from '../ui/DataTable';

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

  const columns = [
    { key: 'id', label: 'ID', render: (val) => val.slice(0, 8).toUpperCase() },
    { 
      key: activeTab === 'agency_rfqs' ? 'clientName' : 'supplierId', 
      label: activeTab === 'agency_rfqs' ? 'Client' : 'Supplier',
      render: (val, item) => val || item.supplierName || 'Unknown'
    },
    { key: 'status', label: 'Status', render: (val) => (
      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
        ['DELIVERED', 'COMPLETED'].includes(val) ? 'bg-green-100 text-green-800' :
        ['SHIPPED', 'in_transit'].includes(val) ? 'bg-blue-100 text-blue-800' :
        'bg-orange-100 text-orange-800'
      }`}>
        {val?.replace('_', ' ') || 'PENDING'}
      </span>
    )},
    ...(activeTab === 'supplier_shipments' ? [
      { key: 'trackingNumber', label: 'Tracking' },
      { key: 'carrier', label: 'Carrier' }
    ] : []),
    { key: 'createdAt', label: 'Created', render: (val) => val ? new Date(val.seconds ? val.seconds * 1000 : val).toLocaleDateString() : 'N/A' },
    { key: 'actions', label: 'Actions', render: (_, item) => (
      <button 
        onClick={() => setEditingItem(item)}
        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
      >
        Manage
      </button>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="text-indigo-600" />
            Admin Logistics & Shipping
          </h1>
          <p className="text-gray-500">Global control center for tracking and managing operations.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'supplier_shipments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('supplier_shipments')}
        >
          Supplier Shipments
        </button>
        <button
          className={`py-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'agency_rfqs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('agency_rfqs')}
        >
          Agency RFQs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-600 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Records</p>
              <p className="text-2xl font-black text-gray-900">{kpiStats.total}</p>
            </div>
            <Package className="w-8 h-8 text-gray-200" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">{activeTab === 'supplier_shipments' ? 'Supplier Logistics' : 'RFQ Logistics'}</h3>
          <button onClick={() => loadData(1)} className="text-sm font-semibold text-indigo-600 hover:underline">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4">Manage Status</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select 
                  value={editingItem.status || ''}
                  onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                  className="w-full p-2 border rounded"
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
                    <label className="block text-sm font-semibold mb-1">Tracking Number</label>
                    <input 
                      type="text" 
                      value={editingItem.trackingNumber || ''}
                      onChange={(e) => setEditingItem({...editingItem, trackingNumber: e.target.value})}
                      className="w-full p-2 border rounded" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Carrier</label>
                    <input 
                      type="text" 
                      value={editingItem.carrier || ''}
                      onChange={(e) => setEditingItem({...editingItem, carrier: e.target.value})}
                      className="w-full p-2 border rounded" 
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 border rounded font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
