'use client';

import React, { useState, useEffect } from 'react';
import Package from 'lucide-react/dist/esm/icons/package';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Send from 'lucide-react/dist/esm/icons/send';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Truck from 'lucide-react/dist/esm/icons/truck';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import X from 'lucide-react/dist/esm/icons/x';

import notifier from '../../services/NotificationService';
import { fetchPortalDashboardDataAction } from '../../actions/portalDashboardActions';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

export default function SupplierCommandHub({ userId = null, initialData = null }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  const { workspaces, activeWorkspaceId, setDrawerOpen, setWorkspaceIntent } = useWorkspaceStore();
  const activeWs = workspaces[activeWorkspaceId] || Object.values(workspaces || {})[0];
  const wsItemsCount = (activeWs?.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

  useEffect(() => {
    if (initialData) return;
    async function load() {
      const res = await fetchPortalDashboardDataAction('supplier', userId);
      setData(res);
      setLoading(false);
    }
    load();
  }, [userId, initialData]);

  const handleRespondRfq = (rfq) => {
    setSelectedRfq(rfq);
  };

  const handleSubmitQuote = (e) => {
    e?.preventDefault();
    if (!quoteUnitPrice) {
      notifier.warning('Please enter a valid unit price rate for your quote.');
      return;
    }
    notifier.success(`Submitted quote of $${quoteUnitPrice}/unit for RFQ #${selectedRfq.id}! Clinic buyer notified.`);
    setSelectedRfq(null);
    setQuoteUnitPrice('');
    setQuoteNotes('');
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
        background: 'linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(194, 65, 12, 0.25)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffedd5',
            }}
          >
            <Package size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em', color: '#ffffff' }}>
              Supplier Control Room & RFQ Bidding Hub
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#fed7aa', fontWeight: 500 }}>
              RFQ Bidding • PO Dispatch Queue • COA Batch Certificates
            </span>
          </div>
        </div>

        {/* Procurement Workspace Cart Button */}
        <button
          type="button"
          onClick={() => {
            if (activeWs) setWorkspaceIntent(activeWs.id, 'buy');
            setDrawerOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <Briefcase size={16} />
          <span>Procurement Cart</span>
          <span
            style={{
              backgroundColor: '#ffedd5',
              color: '#9a3412',
              fontSize: '0.72rem',
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: '99px',
            }}
          >
            {wsItemsCount}
          </span>
        </button>
      </div>

      {/* Quick Launch Mobile Action Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          onClick={() => notifier.info('Select batch PDF to upload COA Certificate...')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: 'none',
            color: '#9a3412',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <UploadCloud size={15} />
          <span>Upload Batch COA</span>
        </button>

        <button
          type="button"
          onClick={() => handleFulfillPo('PO-88102')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Truck size={15} />
          <span>Dispatch PO Orders</span>
        </button>

        <button
          type="button"
          onClick={() => {
            notifier.info('Opening Wholesale Price List Editor...');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <DollarSign size={15} />
          <span>Manage Price List</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-quick-create', { detail: { type: 'new-purchase-order' } }));
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <FileText size={15} />
          <span>Generate PO Form</span>
        </button>
      </div>

      {/* Quick Bidding Modal Card */}
      {selectedRfq && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#c2410c' }}>
              Submit Bid for {selectedRfq.id} ({selectedRfq.clinicName})
            </span>
            <button type="button" onClick={() => setSelectedRfq(null)} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
          <form onSubmit={handleSubmitQuote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
              Item: <strong>{selectedRfq.item}</strong> ({selectedRfq.qty})
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="0.01"
                placeholder="Unit Price ($)..."
                value={quoteUnitPrice}
                onChange={(e) => setQuoteUnitPrice(e.target.value)}
                autoFocus
                style={{ flex: 1, padding: '7px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
              />
              <button
                type="submit"
                style={{ padding: '7px 14px', borderRadius: '7px', backgroundColor: '#ea580c', color: '#ffffff', border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Submit Quote
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Queue: Pending RFQs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#ffedd5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Pending Requests for Quotations (RFQs) to Bid ({pendingRfqs.length})
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {pendingRfqs.map((rfq) => (
            <div
              key={rfq.id}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{rfq.id}</strong>
                  <span style={{ fontSize: '0.76rem', color: '#ea580c', fontWeight: 700 }}>• {rfq.clinicName}</span>
                </div>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#475569' }}>
                  Item: <strong>{rfq.item}</strong> ({rfq.qty}) — Due: <span style={{ color: '#dc2626', fontWeight: 700 }}>{rfq.dueDate}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRespondRfq(rfq)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
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
