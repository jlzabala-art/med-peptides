"use client";

import React from 'react';
import { Package, User, Building2, DollarSign, Truck } from '@/lib/icons';

/**
 * WorkspaceMiniSummaryStrip
 * Always-visible 1-row strip situated directly above the footer.
 * Summarizes: staged count, recipient, shipping (admin), grand total.
 * Clicking each chip jumps directly to its corresponding step.
 */
export default function WorkspaceMiniSummaryStrip({
  itemsCount = 0,
  activeWs = null,
  grandTotal = 0,
  isDoctor = false,
  activeStep = 0,
  onGoToStep = () => {},
}) {
  const recipient = activeWs?.targetEntity;
  const recipientName = recipient?.name || recipient?.businessName || recipient?.patientName;
  const isClinic = recipient?.type === 'clinic' || !!recipient?.clinicId;

  return (
    <div
      className="ws-mini-summary-strip"
      style={{
        padding: '6px 14px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        fontSize: '0.74rem',
        flexShrink: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        .ws-mini-summary-strip::-webkit-scrollbar { display: none; }
        .ws-mini-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 6px;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          font-size: 0.72rem;
          user-select: none;
        }
        .ws-mini-chip:hover {
          border-color: #94a3b8;
          background-color: #f1f5f9;
        }
        .ws-mini-chip.active {
          border-color: #0284c7;
          background-color: #eff6ff;
          color: #0369a1;
          font-weight: 700;
        }
      `}</style>

      {/* Chip 1: Products */}
      <button
        type="button"
        className={`ws-mini-chip ${activeStep === 0 ? 'active' : ''}`}
        onClick={() => onGoToStep(0)}
        title="View Staged Products"
      >
        <Package size={13} style={{ color: itemsCount > 0 ? '#0284c7' : '#94a3b8' }} />
        <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
      </button>

      {/* Chip 2: Recipient */}
      <button
        type="button"
        className={`ws-mini-chip ${activeStep === 1 ? 'active' : ''}`}
        onClick={() => onGoToStep(1)}
        title="View Recipient / Patient"
      >
        {isClinic ? (
          <Building2 size={13} style={{ color: recipientName ? '#16a34a' : '#94a3b8' }} />
        ) : (
          <User size={13} style={{ color: recipientName ? '#16a34a' : '#94a3b8' }} />
        )}
        <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {recipientName || (isDoctor ? 'No Patient' : 'No Recipient')}
        </span>
      </button>

      {/* Chip 3: Shipping (Admin Only) */}
      {!isDoctor && (
        <button
          type="button"
          className={`ws-mini-chip ${activeStep === 2 ? 'active' : ''}`}
          onClick={() => onGoToStep(2)}
          title="View Shipping & Logistics"
        >
          <Truck size={13} style={{ color: '#64748b' }} />
          <span>Logistics</span>
        </button>
      )}

      {/* Chip 4: Grand Total */}
      <button
        type="button"
        className={`ws-mini-chip ${activeStep === (isDoctor ? 2 : 3) ? 'active' : ''}`}
        onClick={() => onGoToStep(isDoctor ? 2 : 3)}
        title="View Financial Review"
        style={{
          marginLeft: 'auto',
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          color: '#1e3a8a',
          fontWeight: 800,
        }}
      >
        <DollarSign size={13} style={{ color: '#2563eb' }} />
        <span>${grandTotal.toFixed(2)}</span>
      </button>
    </div>
  );
}
