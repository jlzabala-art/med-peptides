"use client";
import React, { useRef, useCallback } from 'react';
import { Eye, Sparkles, MoreVertical, FileText, CheckCircle, Package, ArrowRight, Share2 } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';
import CopyableId from '../../ui/CopyableId';
import { WarehouseOriginBadge, ColdChainBadge } from '../../ui/WarehouseOriginBadge';

export default function MobileQuotationCard({
  row: quote,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
}) {
  const isWholesaler = quote.category === 'wholesaler';
  const isClinic = quote.category === 'clinic';
  const total = Number(quote.grandTotal || 0);
  const margin = Number(quote.marginPercent || 48.5);

  const rawStatus = String(quote.status || 'draft').toLowerCase();
  let badgeStatus = 'pending';
  if (rawStatus === 'approved' || rawStatus === 'accepted') badgeStatus = 'approved';
  else if (rawStatus === 'converted' || rawStatus === 'synced') badgeStatus = 'po_created';
  else if (rawStatus === 'draft') badgeStatus = 'draft';
  else if (rawStatus === 'rejected' || rawStatus === 'cancelled') badgeStatus = 'error';

  return (
    <div
      onClick={() => onRowClick && onRowClick(quote)}
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        padding: '12px 14px',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      {/* Header: Quote #, Category, Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#003666' }}>
            {quote.quotationNumber || quote.id}
          </span>
          <span style={{
            fontSize: '0.64rem',
            padding: '1px 5px',
            borderRadius: '4px',
            fontWeight: 800,
            backgroundColor: isWholesaler ? '#fff7ed' : isClinic ? '#eff6ff' : '#f0fdfa',
            color: isWholesaler ? '#ea580c' : isClinic ? '#2563eb' : '#0d9488',
            border: `1px solid ${isWholesaler ? '#ffedd5' : isClinic ? '#dbeafe' : '#ccfbf1'}`
          }}>
            {isWholesaler ? 'WHOLESALER' : isClinic ? 'CLINIC' : 'PATIENT'}
          </span>
        </div>

        <StatusBadge status={badgeStatus} label={quote.status || 'Draft'} />
      </div>

      {/* Recipient & Logistics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
            {quote.clientName || 'Unnamed Client'}
          </span>
          {quote.originWarehouse && <WarehouseOriginBadge origin={quote.originWarehouse} size="sm" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {quote.doctorName ? `Supervisor: Dr. ${quote.doctorName.replace(/^Dr\.\s*/i, '')}` : (quote.accountManagerId ? `AM: ${quote.accountManagerId}` : 'Direct Commercial Desk')}
          </span>
          {quote.requiresColdChain && <ColdChainBadge required={true} size="sm" />}
        </div>
      </div>

      {/* Financials & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>
            {margin.toFixed(1)}% margin ({quote.items?.length || 0} items)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const total = Number(quote.grandTotal || 0).toFixed(2);
              const itemsCount = (quote.items || []).length;
              const client = quote.clientName || 'Valued Client';
              const quoteNum = quote.quotationNumber || quote.id;
              const origin = typeof window !== 'undefined' ? window.location.origin : 'https://regenpept.com';
              const secureLink = `${origin}/quotation/${quote.id}`;
              const msg = `Dear ${client},\n\nPlease find your official Atlas Health Quotation (${quoteNum}):\n• Products: ${itemsCount} compounded formulation(s)\n• Total: $${total}\n• View & Accept Online: ${secureLink}`;
              const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
              window.open(waUrl, '_blank');
            }}
            className="gcp-btn-secondary"
            title="Share via WhatsApp"
            style={{ padding: '5px 8px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}
          >
            <Share2 size={13} />
            Share
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('open-quotation-drawer', { detail: quote }));
            }}
            className="gcp-btn-secondary"
            style={{ padding: '5px 8px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Eye size={13} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
