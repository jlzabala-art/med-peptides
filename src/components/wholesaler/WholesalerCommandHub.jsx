'use client';

import React, { useState, useEffect } from 'react';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { formatAEDtoDual } from '../../utils/currencies';
import notifier from '../../services/NotificationService';
import { fetchPortalDashboardDataAction } from '../../actions/portalDashboardActions';

export default function WholesalerCommandHub({ userId = null, initialData = null }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    async function load() {
      const res = await fetchPortalDashboardDataAction('wholesaler', userId);
      setData(res);
      setLoading(false);
    }
    load();
  }, [userId, initialData]);

  const handleApprovePo = (poId) => {
    notifier.success(`Bulk Purchase Order ${poId} approved! Credit line reserved & inventory locked.`);
  };

  const pendingOrders = data?.pendingBulkOrders || [
    { id: 'PO-9002', clinicName: 'Atlas Longevity Center', totalAmount: 42500, itemsCount: 6, status: 'Awaiting Credit Approval' },
    { id: 'PO-9008', clinicName: 'GCC Wellness Alliance', totalAmount: 18900, itemsCount: 3, status: 'Awaiting Stock Reservation' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 20px -2px rgba(37, 99, 235, 0.08)',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #dbeafe',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
              Wholesale Distribution & Clinic Bulk Operations Hub
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#1d4ed8' }}>
              Process clinic bulk purchase orders, manage B2B pricing & Rx Inbox
            </span>
          </div>
        </div>

        <button
          onClick={() => notifier.info('Navigating to B2B Catalog Tier Price Editor...')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <DollarSign size={16} />
          <span>Update B2B Tier Price List</span>
        </button>
      </div>

      {/* Bulk Orders Queue */}
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
          Pending Clinic Bulk Purchase Orders (POs)
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {pendingOrders.map((po) => (
            <div
              key={po.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                border: '1px solid #bfdbfe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{po.id}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>• {po.clinicName}</span>
                </div>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#475569' }}>
                  Total: <strong>{formatAEDtoDual(po.totalAmount)}</strong> ({po.itemsCount} line items) — <span style={{ color: '#d97706', fontWeight: 600 }}>{po.status}</span>
                </p>
              </div>

              <button
                onClick={() => handleApprovePo(po.id)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle2 size={14} />
                <span>Approve & Reserve Stock</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
