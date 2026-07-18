"use client";

import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import Truck from "lucide-react/dist/esm/icons/truck";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Package from "lucide-react/dist/esm/icons/package";
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, updateDoc, limit, startAfter, getCountFromServer, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent } from '../ui/Card';
import MetricCard from '../ui/MetricCard';

import DataTable from '../ui/DataTable';
import KittingRiskAnalysis from './KittingRiskAnalysis';
import notifier from '../../services/NotificationService';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';

export default function AdminLogisticsTab() {
  const [activeTab, setActiveTab] = useState('supplier_shipments'); // 'supplier_shipments' or 'agency_rfqs'
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageCursors, setPageCursors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const PAGE_SIZE = 50;

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
      notifier.info("Error updating status.");
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'id', 
      header: 'ID', 
      render: (val) => <CopyableId value={val} /> 
    },
    { 
      key: activeTab === 'agency_rfqs' ? 'clientName' : 'supplierId', 
      header: activeTab === 'agency_rfqs' ? 'Client' : 'Supplier',
      render: (val, item) => <span style={{ fontWeight: 600 }}>{val || item.supplierName || 'Unknown'}</span>
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (val) => <StatusBadge status={val} />
    },
    ...(activeTab === 'supplier_shipments' ? [
      { key: 'trackingNumber', header: 'Tracking' },
      { key: 'carrier', header: 'Carrier' }
    ] : []),
    { 
      key: 'createdAt', 
      header: 'Created', 
      render: (val) => val ? new Date(val.seconds ? val.seconds * 1000 : val).toLocaleDateString() : 'N/A' 
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (_, item) => (
      <button 
        onClick={() => setEditingItem(item)}
        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
      >
        Manage
      </button>
    )}
  ], [activeTab]);

  const activeFilters = [];
  activeFilters.push({
    key: 'type',
    label: 'Logistics Type',
    value: activeTab === 'supplier_shipments' ? 'Supplier Shipments' : 'Agency RFQs',
    onRemove: () => setActiveTab('supplier_shipments')
  });

  const filterOptions = [
    {
      key: 'type',
      label: 'Logistics Type',
      options: [
        { label: 'Supplier Shipments', value: 'supplier_shipments' },
        { label: 'Agency RFQs', value: 'agency_rfqs' }
      ],
      value: activeTab,
      onChange: setActiveTab
    }
  ];

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Logistics & Shipping"
        subtitle="Global control center for tracking and managing operations."
        icon={Truck}
      />

      <div style={{ marginBottom: '0.5rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search shipments, clients, tracking..."
          resultCount={loading ? undefined : dataList.length}
          namespace="admin-logistics"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      <KittingRiskAnalysis />

      <div className="kpi-scroll-row" style={{ paddingBottom: '0.5rem' }}>
        <MetricCard
          title="Total Records"
          value={kpiStats.total}
          icon={Package}
          accentColor="var(--color-primary, #4f46e5)"
        />
      </div>

      <div className="gcp-table-container">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', margin: 0 }}>{activeTab === 'supplier_shipments' ? 'Supplier Logistics' : 'RFQ Logistics'}</h3>
          <button onClick={() => loadData(1)} style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-primary, #4f46e5)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
            Refresh Data
          </button>
        </div>
        <DataTable
          columns={columns}
          data={dataList}
          keyField="id"
          globalSearch={true}
          searchQuery={searchTerm}
          emptyMessage="No logistics records found matching your criteria."
        />
        
        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                const prevPage = currentPage - 1;
                setCurrentPage(prevPage);
                loadData(prevPage);
              }}
              disabled={currentPage === 1 || loading}
              className="gcp-btn gcp-btn--secondary"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >
              Previous
            </button>
            <button
              onClick={() => {
                const nxtPage = currentPage + 1;
                setCurrentPage(nxtPage);
                loadData(nxtPage);
              }}
              disabled={currentPage === totalPages || loading}
              className="gcp-btn gcp-btn--secondary"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

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