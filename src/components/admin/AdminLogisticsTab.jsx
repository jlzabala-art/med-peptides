"use client";

import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import Truck from "lucide-react/dist/esm/icons/truck";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Package from "lucide-react/dist/esm/icons/package";
import Download from "lucide-react/dist/esm/icons/download";
import Tags from "lucide-react/dist/esm/icons/tags";
import Plus from "lucide-react/dist/esm/icons/plus";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import User from "lucide-react/dist/esm/icons/user";
import Pill from "lucide-react/dist/esm/icons/pill";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import X from "lucide-react/dist/esm/icons/x";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, updateDoc, limit, startAfter, getCountFromServer, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
// eslint-disable-next-line no-restricted-imports
import { db } from '../../firebase';
import { Card, CardContent } from '../ui/Card';
import MetricCard from '../ui/MetricCard';
import KpiScopeBar from '../ui/KpiScopeBar';

import DataTable from '../ui/DataTable';
import KittingRiskAnalysis from './KittingRiskAnalysis';
import notifier from '../../services/NotificationService';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import StatusChip from '../ui/StatusChip';
import CopyableId from '../ui/CopyableId';
import AppActionGroup from '../ui/AppActionGroup';
import { exportToCSV } from '../../utils/universalExporter';
import ClinicPicker from './patients/ClinicPicker';
import PhysicianPicker from './patients/PhysicianPicker';

export default function AdminLogisticsTab() {
  const [activeTab, setActiveTab] = useState('clinical_shipments'); // 'clinical_shipments', 'supplier_shipments', or 'agency_rfqs'
  const [kpiScope, setKpiScope] = useState('filtered');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageCursors, setPageCursors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const PAGE_SIZE = 50;

  const [editingItem, setEditingItem] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Shipment Registration Form State
  const [newShipment, setNewShipment] = useState({
    shipmentType: 'prescription', // 'prescription' or 'diagnostic_test'
    orderCode: '',
    itemSummary: '',
    clinicId: '',
    clinicName: '',
    doctorId: '',
    doctorName: '',
    doctorLicense: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    deliveryAddress: '',
    city: '',
    country: '',
    carrier: 'DHL Express Healthcare',
    trackingNumber: '',
    status: 'pending',
    notes: ''
  });

  // Real-time KPIs
  const [kpiStats, setKpiStats] = useState({ total: 0 });

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const collectionName = activeTab;
      const baseQ = collection(db, collectionName);

      // Total count for pagination
      let total = 0;
      try {
        const countSnap = await getCountFromServer(baseQ);
        total = countSnap.data().count;
      } catch (err) {
        console.warn('Count server fallback for', collectionName, err);
      }

      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      setKpiStats({ total });

      const qConstraints = [orderBy('createdAt', 'desc'), limit(PAGE_SIZE)];

      if (page > 1 && pageCursors[page]) {
        qConstraints.push(startAfter(pageCursors[page]));
      }

      let data = [];
      try {
        const q = query(baseQ, ...qConstraints);
        const snap = await getDocs(q);
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (snap.docs.length > 0) {
          setPageCursors(prev => ({
            ...prev,
            [page + 1]: snap.docs[snap.docs.length - 1]
          }));
        }
      } catch (fetchErr) {
        // Fallback for clinical_shipments if collection is newly introduced: fetch from orders
        if (collectionName === 'clinical_shipments') {
          const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE)));
          data = ordersSnap.docs.map(d => {
            const ord = d.data();
            return {
              id: d.id,
              orderCode: ord.orderId || ord.code || d.id,
              shipmentType: ord.type === 'test' || String(ord.productName || '').toLowerCase().includes('test') ? 'diagnostic_test' : 'prescription',
              clinicName: ord.clinicName || ord.customerInstitution || '—',
              doctorName: ord.doctorName || ord.physicianName || '—',
              patientName: ord.customerName || ord.patientName || 'Clinical Client',
              deliveryAddress: ord.customerAddress || ord.deliveryAddress || 'Standard Clinical Courier Dispatch',
              carrier: ord.carrier || 'Express Medical Courier',
              trackingNumber: ord.trackingNumber || 'Pending Dispatch',
              status: ord.status || 'pending',
              createdAt: ord.createdAt
            };
          });
        } else {
          throw fetchErr;
        }
      }

      setDataList(data);
    } catch (err) {
      console.error("Error loading logistics data:", err);
      setDataList([]);
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
      const payload = { 
        status: editingItem.status,
        trackingNumber: editingItem.trackingNumber || '',
        carrier: editingItem.carrier || ''
      };

      if (editingItem.status === 'DELIVERED' || editingItem.status === 'delivered') {
        payload.deliveredAt = new Date();
      }

      await updateDoc(ref, payload);
      notifier.success("Status and tracking updated.");
      setEditingItem(null);
      loadData(currentPage);
    } catch (err) {
      console.error("Failed to update status:", err);
      notifier.error("Error updating status.");
    }
  };

  const handleRegisterShipment = async (e) => {
    e.preventDefault();
    if (!newShipment.patientName || !newShipment.deliveryAddress) {
      notifier.error("Please provide at least the Patient/Recipient Name and Delivery Address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const generatedCode = newShipment.orderCode.trim() || `RX-LOG-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const shipmentDoc = {
        orderCode: generatedCode,
        shipmentType: newShipment.shipmentType,
        itemSummary: newShipment.itemSummary || (newShipment.shipmentType === 'diagnostic_test' ? 'Diagnostic Test Kit (Epigenetics / Biomarkers)' : 'Clinical Prescription Formulation (Lyophilized Peptide Standard)'),
        clinicId: newShipment.clinicId || null,
        clinicName: newShipment.clinicName || 'Direct Clinical Dispatch',
        doctorId: newShipment.doctorId || null,
        doctorName: newShipment.doctorName || 'Prescribing Physician',
        doctorLicense: newShipment.doctorLicense || '',
        patientName: newShipment.patientName.trim(),
        patientEmail: newShipment.patientEmail.trim() || '',
        patientPhone: newShipment.patientPhone.trim() || '',
        deliveryAddress: newShipment.deliveryAddress.trim(),
        city: newShipment.city.trim() || '',
        country: newShipment.country.trim() || '',
        carrier: newShipment.carrier || 'DHL Express Healthcare',
        trackingNumber: newShipment.trackingNumber.trim() || 'Awaiting dispatch confirmation',
        status: newShipment.status || 'pending',
        notes: newShipment.notes.trim() || '',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'clinical_shipments'), shipmentDoc);
      notifier.success(`Clinical shipment #${generatedCode} registered successfully.`);

      setIsRegisterModalOpen(false);
      setNewShipment({
        shipmentType: 'prescription',
        orderCode: '',
        itemSummary: '',
        clinicId: '',
        clinicName: '',
        doctorId: '',
        doctorName: '',
        doctorLicense: '',
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        deliveryAddress: '',
        city: '',
        country: '',
        carrier: 'DHL Express Healthcare',
        trackingNumber: '',
        status: 'pending',
        notes: ''
      });

      if (activeTab !== 'clinical_shipments') {
        setActiveTab('clinical_shipments');
      } else {
        loadData(1);
      }
    } catch (err) {
      console.error("Failed to register shipment:", err);
      notifier.error("Failed to register shipment. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => {
    if (activeTab === 'clinical_shipments') {
      return [
        { 
          key: 'id', 
          header: 'Reference', 
          render: (val, item) => <CopyableId value={item.orderCode || val} /> 
        },
        {
          key: 'shipmentType',
          header: 'Type',
          render: (val) => (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              background: val === 'diagnostic_test' ? '#f5f3ff' : '#f0f9ff',
              color: val === 'diagnostic_test' ? '#7c3aed' : '#0284c7',
              border: `1px solid ${val === 'diagnostic_test' ? '#ddd6fe' : '#bae6fd'}`
            }}>
              {val === 'diagnostic_test' ? '🧬 Diagnostic Test' : '💊 Prescription'}
            </span>
          )
        },
        { 
          key: 'clinicName', 
          header: 'Clinic', 
          render: (val) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={13} style={{ color: '#64748b', flexShrink: 0 }} />
              <span style={{ fontWeight: 650, color: '#0f172a' }}>{val || '—'}</span>
            </div>
          )
        },
        { 
          key: 'doctorName', 
          header: 'Doctor', 
          render: (val) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Stethoscope size={13} style={{ color: '#0284c7', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: '#334155' }}>{val || '—'}</span>
            </div>
          )
        },
        { 
          key: 'patientName', 
          header: 'Patient / Destination', 
          render: (val, item) => (
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{val || '—'}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{item.deliveryAddress || 'Standard Dispatch'}</div>
            </div>
          )
        },
        { 
          key: 'carrier', 
          header: 'Logistics', 
          render: (val, item) => (
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{val || 'Express Courier'}</div>
              <div style={{ fontSize: '11px', color: '#0284c7', fontFamily: 'monospace' }}>
                {item.trackingNumber || 'Pending AWB'}
              </div>
            </div>
          )
        },
        { 
          key: 'status', 
          header: 'Status', 
          render: (val) => <StatusChip status={val || 'pending'} />
        },
        { 
          key: 'createdAt', 
          header: 'Registered', 
          render: (val) => val ? new Date(val.seconds ? val.seconds * 1000 : val).toLocaleDateString() : 'N/A' 
        },
        { 
          key: 'actions', 
          header: 'Actions', 
          align: 'right',
          render: (_, item) => (
            <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
              <AppActionGroup actions={[
                { type: 'edit', onClick: () => setEditingItem(item) }
              ]} />
            </div>
          )
        }
      ];
    }

    return [
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
        render: (val) => <StatusChip status={val} />
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
        align: 'right',
        render: (_, item) => (
          <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
            <AppActionGroup actions={[
              { type: 'edit', onClick: () => setEditingItem(item) }
            ]} />
          </div>
        )
      }
    ];
  }, [activeTab]);

  const activeFilters = [];
  activeFilters.push({
    key: 'type',
    label: 'Logistics Type',
    value: activeTab === 'clinical_shipments' 
      ? 'Clinical Shipments (Rx & Tests)'
      : activeTab === 'supplier_shipments' 
        ? 'Supplier Shipments' 
        : 'Agency RFQs',
    onRemove: () => setActiveTab('clinical_shipments')
  });

  const activeDataForKpis = dataList;
  const kpis = {
    total: kpiScope === 'global' ? kpiStats.total : activeDataForKpis.length,
    inTransit: activeDataForKpis.filter(d => ['shipped', 'in_transit', 'dispatched', 'en tránsito'].includes(String(d.status || '').toLowerCase())).length,
    delivered: activeDataForKpis.filter(d => String(d.status || '').toLowerCase() === 'delivered').length,
    pending: activeDataForKpis.filter(d => ['pending', 'draft', 'delayed', 'action_required'].includes(String(d.status || '').toLowerCase())).length,
  };

  const handleExportLogistics = () => {
    if (dataList.length === 0) {
      notifier.info("No logistics records to export");
      return;
    }
    const cols = [
      { key: 'id', header: 'ID', accessor: d => d.orderCode || d.id },
      { key: 'type', header: 'Type', accessor: d => d.shipmentType || 'prescription' },
      { key: 'clinic', header: 'Clinic', accessor: d => d.clinicName || '' },
      { key: 'doctor', header: 'Doctor', accessor: d => d.doctorName || '' },
      { key: 'patient', header: 'Patient', accessor: d => d.patientName || '' },
      { key: 'status', header: 'Status', accessor: d => d.status || '' },
      { key: 'carrier', header: 'Carrier', accessor: d => d.carrier || '' },
      { key: 'trackingNumber', header: 'Tracking', accessor: d => d.trackingNumber || '' },
      { key: 'createdAt', header: 'Created', accessor: d => (d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : '') }
    ];
    exportToCSV(dataList, cols, `${activeTab}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    notifier.success(`Exported ${dataList.length} logistics records to CSV.`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title="Logistics & Express Medical Tracking"
        subtitle="Global control center for clinical prescriptions, diagnostic test kits, and fulfillment operations."
        icon={Truck}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsRegisterModalOpen(true)}
              title="Register a new Clinical Prescription or Diagnostic Test Shipment"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#003666',
                color: '#ffffff',
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Register Clinical Shipment
            </button>
            <button
              className="btn btn-outline"
              onClick={handleExportLogistics}
              title="Export logistics records to CSV"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={15} /> Export
            </button>
          </div>
        }
      />

      {/* ── Subtab Navigation Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '10px',
        marginBottom: '1.25rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('clinical_shipments')}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            cursor: 'pointer',
            background: activeTab === 'clinical_shipments' ? '#003666' : '#ffffff',
            color: activeTab === 'clinical_shipments' ? '#ffffff' : '#475569',
            borderColor: activeTab === 'clinical_shipments' ? '#003666' : '#cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Pill size={14} /> Clinical Shipments (Rx & Tests)
        </button>
        <button
          onClick={() => setActiveTab('supplier_shipments')}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            cursor: 'pointer',
            background: activeTab === 'supplier_shipments' ? '#0f172a' : '#ffffff',
            color: activeTab === 'supplier_shipments' ? '#ffffff' : '#475569',
            borderColor: activeTab === 'supplier_shipments' ? '#0f172a' : '#cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Truck size={14} /> Supplier Shipments
        </button>
        <button
          onClick={() => setActiveTab('agency_rfqs')}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            cursor: 'pointer',
            background: activeTab === 'agency_rfqs' ? '#0f172a' : '#ffffff',
            color: activeTab === 'agency_rfqs' ? '#ffffff' : '#475569',
            borderColor: activeTab === 'agency_rfqs' ? '#0f172a' : '#cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Package size={14} /> Agency RFQs
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <KpiScopeBar
          scope={kpiScope}
          onScopeChange={setKpiScope}
          isFiltered={dataList.length !== kpiStats.total}
          filteredCount={dataList.length}
          globalCount={kpiStats.total}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <MetricCard
            title="Total Records"
            value={kpis.total}
            icon={PackageSearch}
            color="var(--color-primary, #003666)"
          />
          <MetricCard
            title="In Transit"
            value={kpis.inTransit}
            icon={Truck}
            color="#2563eb"
          />
          <MetricCard
            title="Delivered"
            value={kpis.delivered}
            icon={CheckCircle}
            color="#16a34a"
          />
          <MetricCard
            title="Pending Dispatch"
            value={kpis.pending}
            icon={Clock}
            color="#d97706"
          />
        </div>
      </div>

      <GlobalSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder={activeTab === 'clinical_shipments' ? "Search by clinic, doctor, patient, tracking..." : "Search shipments, clients, tracking..."}
        filters={activeFilters}
      />

      {/* Real-time Protocol Kitting Risk Engine */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <KittingRiskAnalysis />
      </div>

      <div style={{ backgroundColor: 'var(--color-surface, #ffffff)', borderRadius: '0.75rem', border: '1px solid var(--color-border, #e2e8f0)', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={dataList}
          keyField="id"
          loading={loading}
          emptyTitle={activeTab === 'clinical_shipments' ? "No clinical shipments registered" : "No logistics records found"}
          emptyDescription={activeTab === 'clinical_shipments' ? "Register a clinical prescription or diagnostic test shipment using the button above." : "There are currently no active shipments matching this category."}
        />

        {/* Real server-side pagination controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border, #e2e8f0)', fontSize: '0.875rem' }}>
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (currentPage > 1) {
                  const prevPage = currentPage - 1;
                  setCurrentPage(prevPage);
                  loadData(prevPage);
                }
              }}
              disabled={currentPage <= 1 || loading}
              style={{
                padding: '0.35rem 0.75rem',
                border: '1px solid var(--color-border, #cbd5e1)',
                borderRadius: '0.375rem',
                backgroundColor: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  loadData(nextPage);
                }
              }}
              disabled={currentPage >= totalPages || loading}
              style={{
                padding: '0.35rem 0.75rem',
                border: '1px solid var(--color-border, #cbd5e1)',
                borderRadius: '0.375rem',
                backgroundColor: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: REGISTER CLINICAL SHIPMENT (Prescription or Test) ── */}
      {isRegisterModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.6)', padding: '1rem', backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '42rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#003666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📦 Register Clinical Shipment
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  Link or create clinical entities (Clinic, Doctor, Patient) for formal logistics dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterShipment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type Switcher */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                  1. Shipment Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setNewShipment({ ...newShipment, shipmentType: 'prescription' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${newShipment.shipmentType === 'prescription' ? '#003666' : '#cbd5e1'}`,
                      background: newShipment.shipmentType === 'prescription' ? '#eff6ff' : '#ffffff',
                      color: newShipment.shipmentType === 'prescription' ? '#003666' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Pill size={16} color="#003666" />
                    <div>
                      <div style={{ fontSize: '13px' }}>Medical Prescription</div>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>Peptides & Compounded Rx</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewShipment({ ...newShipment, shipmentType: 'diagnostic_test' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${newShipment.shipmentType === 'diagnostic_test' ? '#7c3aed' : '#cbd5e1'}`,
                      background: newShipment.shipmentType === 'diagnostic_test' ? '#f5f3ff' : '#ffffff',
                      color: newShipment.shipmentType === 'diagnostic_test' ? '#7c3aed' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FlaskConical size={16} color="#7c3aed" />
                    <div>
                      <div style={{ fontSize: '13px' }}>Diagnostic Test Kit</div>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>Trichotest / 24Genetics / DBS</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Reference */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Order / Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PO-DRAFT-261101-4921"
                    value={newShipment.orderCode}
                    onChange={(e) => setNewShipment({ ...newShipment, orderCode: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Formulation / Kit Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BPC-157 10mg (10 Vials)"
                    value={newShipment.itemSummary}
                    onChange={(e) => setNewShipment({ ...newShipment, itemSummary: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Section 2: Clinical Actors (Clinic & Doctor) */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#003666', marginBottom: '10px' }}>
                  2. Prescribing Clinic & Physician
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      🏥 Medical Clinic / Center
                    </label>
                    <ClinicPicker
                      value={newShipment.clinicId}
                      clinicName={newShipment.clinicName}
                      allowCustom={true}
                      placeholder="Search existing or enter new clinic..."
                      onChange={(selected) => {
                        setNewShipment(prev => ({
                          ...prev,
                          clinicId: selected.clinicId || '',
                          clinicName: selected.clinicName || ''
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      🩺 Treating Doctor
                    </label>
                    <PhysicianPicker
                      value={newShipment.doctorId}
                      physicianName={newShipment.doctorName}
                      clinicId={newShipment.clinicId}
                      clinicName={newShipment.clinicName}
                      allowCustom={true}
                      placeholder="Search doctor or enter new physician..."
                      onChange={(selected) => {
                        setNewShipment(prev => ({
                          ...prev,
                          doctorId: selected.doctorId || '',
                          doctorName: selected.doctorName || '',
                          doctorLicense: selected.license || ''
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Patient & Delivery Address */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#003666', marginBottom: '10px' }}>
                  3. Patient Recipient & Delivery Address
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Carlos Méndez"
                      value={newShipment.patientName}
                      onChange={(e) => setNewShipment({ ...newShipment, patientName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={newShipment.patientEmail}
                      onChange={(e) => setNewShipment({ ...newShipment, patientEmail: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={newShipment.patientPhone}
                      onChange={(e) => setNewShipment({ ...newShipment, patientPhone: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    Full Delivery Destination Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street, suite, clinic floor, city, postal code, country"
                    value={newShipment.deliveryAddress}
                    onChange={(e) => setNewShipment({ ...newShipment, deliveryAddress: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Section 4: Carrier & Logistics Tracking */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Courier / Carrier
                  </label>
                  <select
                    value={newShipment.carrier}
                    onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="DHL Express Healthcare">DHL Express Healthcare</option>
                    <option value="FedEx Clinical Logistics">FedEx Clinical Logistics</option>
                    <option value="UPS Express Medical">UPS Express Medical</option>
                    <option value="Local Courier Dispatch">Local Courier Dispatch</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Air Waybill / Tracking #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 179353489124"
                    value={newShipment.trackingNumber}
                    onChange={(e) => setNewShipment({ ...newShipment, trackingNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Dispatch Status
                  </label>
                  <select
                    value={newShipment.status}
                    onChange={(e) => setNewShipment({ ...newShipment, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, background: '#ffffff', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '8px 20px', backgroundColor: '#003666', color: '#ffffff', borderRadius: '6px', fontWeight: 700, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                >
                  {isSubmitting ? 'Registering...' : 'Confirm & Register Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT EXISTING STATUS & TRACKING ── */}
      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.6)', padding: '1rem', backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '28rem', width: '100%', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', marginTop: 0, color: '#003666' }}>
              Update Shipment Logistics
            </h3>
            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Fulfillment Status
                </label>
                <select 
                  value={editingItem.status || ''}
                  onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Carrier
                </label>
                <input 
                  type="text" 
                  value={editingItem.carrier || ''}
                  onChange={(e) => setEditingItem({...editingItem, carrier: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Air Waybill / Tracking Number
                </label>
                <input 
                  type="text" 
                  value={editingItem.trackingNumber || ''}
                  onChange={(e) => setEditingItem({...editingItem, trackingNumber: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, background: '#ffffff', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#003666', color: '#ffffff', borderRadius: '6px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
