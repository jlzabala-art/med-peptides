"use client";

import React, { useState } from 'react';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import { formatAEDtoDual } from '../../utils/currencies';
import notifier from '../../services/NotificationService';
import { useWholesalerDashboardData } from '../../hooks/data/useWholesalerDashboardData';
import { useRouter } from 'next/navigation';

export default function WholesalerCommandHub({ userId = null, initialData = null }) {
  const router = useRouter();
  const { data, loading, isRefreshing, approvePo, refetch } = useWholesalerDashboardData({
    wholesalerId: userId,
    initialData,
  });
  const [processingPoId, setProcessingPoId] = useState(null);

  const handleApprovePo = async (poId) => {
    if (processingPoId) return;
    setProcessingPoId(poId);
    try {
      await approvePo(poId);
    } finally {
      setProcessingPoId(null);
    }
  };

  const pendingOrders = data?.pendingBulkOrders || [];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 20px -2px rgba(37, 99, 235, 0.08)',
        marginBottom: '1.25rem',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#003666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Wholesale Distribution & Clinic Bulk Operations Hub
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Process clinic bulk purchase orders, manage B2B tier pricing & dispatch queue
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            notifier.info('Opening B2B wholesale pricing catalog...');
            router.push('/admin/catalog?view=b2b');
          }}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#003666',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            minHeight: '38px',
            boxShadow: '0 2px 4px rgba(0, 54, 102, 0.15)'
          }}
        >
          <DollarSign size={16} />
          <span>Update B2B Tier Price List</span>
        </button>
      </div>

      {/* Bulk Orders Queue */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Clinic Bulk Purchase Orders (POs)
            </h4>
            <button
              onClick={() => refetch()}
              disabled={isRefreshing || loading}
              title="Refresh Queue"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.2rem',
                borderRadius: '4px',
              }}
            >
              <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
            {pendingOrders.length} Pending Approval
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {pendingOrders.length === 0 ? (
            <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
              ✓ All pending clinic purchase orders have been approved & reserved!
            </div>
          ) : (
            pendingOrders.map((po) => {
              const isCurrentProcessing = processingPoId === po.id;
              return (
                <div
                  key={po.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{po.id}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#003666', fontWeight: 700 }}>• {po.clinicName}</span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      Total: <strong>{formatAEDtoDual(po.totalAmount)}</strong> ({po.itemsCount} line items) — <span style={{ color: '#d97706', fontWeight: 700 }}>{po.status}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleApprovePo(po.id)}
                    disabled={processingPoId !== null}
                    style={{
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      backgroundColor: isCurrentProcessing ? '#94a3b8' : '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: processingPoId !== null ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      minHeight: '38px',
                      opacity: processingPoId && !isCurrentProcessing ? 0.6 : 1,
                      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCurrentProcessing ? (
                      <>
                        <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Reserving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Approve & Reserve Stock</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
