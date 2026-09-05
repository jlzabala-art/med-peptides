'use client';

import React, { useState, useEffect } from 'react';
import Package from 'lucide-react/dist/esm/icons/package';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Send from 'lucide-react/dist/esm/icons/send';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import notifier from '../../services/NotificationService';
import { fetchPortalDashboardDataAction } from '../../actions/portalDashboardActions';

export default function SupplierCommandHub({ userId = null, initialData = null }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    async function load() {
      const res = await fetchPortalDashboardDataAction('supplier', userId);
      setData(res);
      setLoading(false);
    }
    load();
  }, [userId, initialData]);

  const handleRespondRfq = (rfqId) => {
    notifier.success(`Quotation form opened for ${rfqId}. Submit your unit prices.`);
  };

  const handleFulfillPo = (poId) => {
    notifier.success(`Dispatch label generated for PO #${poId}. Marked as Fulfilled.`);
  };

  const pendingRfqs = data?.pendingRfqs || [
    { id: 'RFQ-301', clinicName: 'Dubai Peptide Wellness Clinic', item: 'BPC-157 High Purity Raw Material', qty: '500g', dueDate: 'Today 18:00' },
    { id: 'RFQ-304', clinicName: 'Riyadh Regenerative Hub', item: 'Semaglutide 10mg Vials', qty: '200 units', dueDate: 'Tomorrow 12:00' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
        border: '1px solid #fed7aa',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 20px -2px rgba(194, 65, 12, 0.08)',
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
          borderBottom: '1px solid #ffedd5',
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
              backgroundColor: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#9a3412' }}>
              Supplier Control Room & RFQ Bidding Hub
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#c2410c' }}>
              Manage RFQ bids, PO dispatch queues & Certificate of Analysis (COA) uploads
            </span>
          </div>
        </div>

        <button
          onClick={() => notifier.info('Select batch PDF to upload COA...')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#ea580c',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <UploadCloud size={16} />
          <span>Upload Batch COA Certificate</span>
        </button>
      </div>

      {/* Action Queue: Pending RFQs */}
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>
          Pending Requests for Quotations (RFQs) to Bid
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {pendingRfqs.map((rfq) => (
            <div
              key={rfq.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                border: '1px solid #fed7aa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{rfq.id}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>• {rfq.clinicName}</span>
                </div>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#475569' }}>
                  Requested Item: <strong>{rfq.item}</strong> ({rfq.qty}) — Due: <span style={{ color: '#dc2626', fontWeight: 600 }}>{rfq.dueDate}</span>
                </p>
              </div>

              <button
                onClick={() => handleRespondRfq(rfq.id)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  backgroundColor: '#ea580c',
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
                <Send size={14} />
                <span>Submit Quote</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
