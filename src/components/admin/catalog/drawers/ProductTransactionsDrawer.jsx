import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProtocolDisplayName } from '../../../../utils/protocolHelpers';
import StandardDrawer from '../../../ui/StandardDrawer';
import DataTable from '../../../ui/DataTable';
import CopyableId from '../../../ui/CopyableId';
import StatusBadge from '../../../ui/StatusBadge';
import EmptyState from '../../../ui/EmptyState';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Activity, 
  ShoppingCart, 
  FlaskConical, 
  ExternalLink,
  Layers,
  Sparkles,
  Eye
} from '@/lib/icons';

export default function ProductTransactionsDrawer({ isOpen, onClose, product, onNavigate }) {
  const router = useRouter();
  const [activeAccordion, setActiveAccordion] = useState('protocols');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    protocols: [],
    prescriptions: [],
    orders: [],
    protocolCount: 0,
    prescriptionCount: 0,
    orderCount: 0
  });

  useEffect(() => {
    if (!isOpen || !product) return;

    let isMounted = true;
    setLoading(true);
    const productName = product.canonicalName || product.name || '';

    fetch(`/api/catalog/product-usage?product=${encodeURIComponent(productName)}`)
      .then(res => res.json())
      .then(result => {
        if (isMounted && result) {
          setData({
            protocols: result.protocols || [],
            prescriptions: result.prescriptions || [],
            orders: result.orders || [],
            protocolCount: result.protocolCount || (result.protocols ? result.protocols.length : 0),
            prescriptionCount: result.prescriptionCount || (result.prescriptions ? result.prescriptions.length : 0),
            orderCount: result.orderCount || (result.orders ? result.orders.length : 0)
          });
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load product transactions:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, product]);

  if (!product) return null;

  const productName = product.canonicalName || product.name || 'Product';

  // Table Columns Definitions

  // 1. Protocols Columns
  const protocolColumns = [
    {
      key: 'name',
      header: 'Protocol Name',
      width: '40%',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{getProtocolDisplayName(row)}</div>
          {row.category && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.category}</div>}
        </div>
      )
    },
    {
      key: 'goal',
      header: 'Primary Goal',
      width: '35%',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: '#334155' }}>
          {row.primary_goal || row.goal || 'General Health'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
      render: (row) => <StatusBadge status={row.status || 'active'} />
    },
    {
      key: 'action',
      header: 'Actions',
      width: '10%',
      align: 'center',
      render: (row) => (
        <button
          onMouseEnter={() => {
            if (row?.id) router.prefetch(`/admin/protocols?q=${row.id}`);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
            const targetUrl = `/admin/protocols?q=${row.id}`;
            router.push(targetUrl);
          }}
          title={`View Protocol: ${row.name || row.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            color: '#0f766e',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  // 2. Prescriptions Columns
  const prescriptionColumns = [
    {
      key: 'id',
      header: 'Prescription ID',
      width: '25%',
      render: (row) => <CopyableId value={row.id} />
    },
    {
      key: 'patient',
      header: 'Patient Name',
      width: '30%',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#1e293b' }}>
          {row.patientName || row.patient || 'Patient Record'}
        </span>
      )
    },
    {
      key: 'doctor',
      header: 'Prescribing Doctor',
      width: '25%',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
          {row.doctorName || 'Licensed Physician'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      render: (row) => <StatusBadge status={row.status || 'active'} />
    },
    {
      key: 'action',
      header: 'Actions',
      width: '8%',
      align: 'center',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
            const targetUrl = `/admin/prescriptions?q=${encodeURIComponent(row.id)}`;
            if (typeof window !== 'undefined') window.location.href = targetUrl;
          }}
          title={`View Prescription ${row.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            color: '#2563eb',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  // 3. Orders Columns
  const orderColumns = [
    {
      key: 'id',
      header: 'Order #',
      width: '25%',
      render: (row) => <CopyableId value={row.orderNumber || row.id} />
    },
    {
      key: 'customer',
      header: 'Customer / Clinic',
      width: '35%',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#1e293b' }}>
          {row.customerName}
        </span>
      )
    },
    {
      key: 'total',
      header: 'Amount',
      width: '20%',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#0f172a' }}>
          ${Number(row.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      render: (row) => <StatusBadge status={row.status || 'processing'} />
    },
    {
      key: 'action',
      header: 'Actions',
      width: '8%',
      align: 'center',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
            const targetUrl = `/admin/orders?q=${encodeURIComponent(row.id)}`;
            if (typeof window !== 'undefined') window.location.href = targetUrl;
          }}
          title={`View Order ${row.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            color: '#b45309',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  const totalUsageCount = data.protocolCount + data.prescriptionCount + data.orderCount;

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Usage & Transactions: ${productName}`}
      subtitle={`${totalUsageCount} active references found across Protocols, Prescriptions, Orders & Formulations`}
      width="900px"
    >
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Metric Summary Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.85rem'
        }}>
          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={14} style={{ color: '#0f766e' }} />
              Active Protocols
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {data.protocolCount}
            </div>
          </div>

          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} style={{ color: '#2563eb' }} />
              Active Prescriptions
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {data.prescriptionCount}
            </div>
          </div>

          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShoppingCart size={14} style={{ color: '#b45309' }} />
              Commercial Orders
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {data.orderCount}
            </div>
          </div>
        </div>

        {/* Accordions Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          {/* Accordion 1: Protocols */}
          <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: 'white' }}>
            <div
              onClick={() => setActiveAccordion(activeAccordion === 'protocols' ? null : 'protocols')}
              style={{
                padding: '0.85rem 1.1rem',
                backgroundColor: activeAccordion === 'protocols' ? '#f8fafc' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
                borderBottom: activeAccordion === 'protocols' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Activity size={18} style={{ color: '#0f766e' }} />
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                  Protocols Using {productName}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f766e', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '12px', border: '1px solid #ccfbf1' }}>
                  {data.protocolCount} Active
                </span>
              </div>
              {activeAccordion === 'protocols' ? <ChevronDown size={18} style={{ color: '#64748b' }} /> : <ChevronRight size={18} style={{ color: '#64748b' }} />}
            </div>

            {activeAccordion === 'protocols' && (
              <div style={{ padding: '0.75rem' }}>
                {data.protocols.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No active protocols linked"
                    subtitle="This compound is currently not included in any active clinical research protocols."
                  />
                ) : (
                  <DataTable
                    columns={protocolColumns}
                    data={data.protocols}
                    loading={loading}
                    pagination={false}
                  />
                )}
              </div>
            )}
          </div>

          {/* Accordion 2: Prescriptions */}
          <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: 'white' }}>
            <div
              onClick={() => setActiveAccordion(activeAccordion === 'prescriptions' ? null : 'prescriptions')}
              style={{
                padding: '0.85rem 1.1rem',
                backgroundColor: activeAccordion === 'prescriptions' ? '#f8fafc' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
                borderBottom: activeAccordion === 'prescriptions' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileText size={18} style={{ color: '#2563eb' }} />
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                  Active Patient Prescriptions
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  {data.prescriptionCount} Prescriptions
                </span>
              </div>
              {activeAccordion === 'prescriptions' ? <ChevronDown size={18} style={{ color: '#64748b' }} /> : <ChevronRight size={18} style={{ color: '#64748b' }} />}
            </div>

            {activeAccordion === 'prescriptions' && (
              <div style={{ padding: '0.75rem' }}>
                {data.prescriptions.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No active prescriptions found"
                    subtitle="There are currently no active patient prescriptions containing this compound."
                  />
                ) : (
                  <DataTable
                    columns={prescriptionColumns}
                    data={data.prescriptions}
                    loading={loading}
                    pagination={false}
                  />
                )}
              </div>
            )}
          </div>

          {/* Accordion 3: Commercial Orders */}
          <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: 'white' }}>
            <div
              onClick={() => setActiveAccordion(activeAccordion === 'orders' ? null : 'orders')}
              style={{
                padding: '0.85rem 1.1rem',
                backgroundColor: activeAccordion === 'orders' ? '#f8fafc' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
                borderBottom: activeAccordion === 'orders' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShoppingCart size={18} style={{ color: '#b45309' }} />
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                  Commercial Orders & Purchase Orders
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fffbeb', padding: '2px 8px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                  {data.orderCount} Orders
                </span>
              </div>
              {activeAccordion === 'orders' ? <ChevronDown size={18} style={{ color: '#64748b' }} /> : <ChevronRight size={18} style={{ color: '#64748b' }} />}
            </div>

            {activeAccordion === 'orders' && (
              <div style={{ padding: '0.75rem' }}>
                {data.orders.length === 0 ? (
                  <EmptyState
                    icon={ShoppingCart}
                    title="No commercial orders found"
                    subtitle="No active customer orders or POs currently contain this product line."
                  />
                ) : (
                  <DataTable
                    columns={orderColumns}
                    data={data.orders}
                    loading={loading}
                    pagination={false}
                  />
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </StandardDrawer>
  );
}
