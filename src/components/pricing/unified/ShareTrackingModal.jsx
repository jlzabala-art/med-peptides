'use client';

import React from 'react';
import { Users, X, Share2, CheckCircle2 } from 'lucide-react';

/**
 * ShareTrackingModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal for auditing recipient distribution history and engagement analytics.
 * Follows Google Cloud Console modal and audit logging UX patterns.
 */
export default function ShareTrackingModal({
  selectedShareGroup,
  onClose,
  onOpenShareModal
}) {
  if (!selectedShareGroup) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15,23,42,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          maxWidth: '560px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={18} color="#16a34a" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Share Tracking &amp; Recipients · {selectedShareGroup.label}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Audited delivery records and interaction analytics across verified channels
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '4px' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Recipient list */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}>
          {selectedShareGroup.recipients?.map((r, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 14px',
                borderBottom: idx === selectedShareGroup.recipients.length - 1 ? 'none' : '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                  {r.organization}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Sent on {r.date} via <strong>{r.channel.toUpperCase()}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#166534',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={11} />
                  <span>Opened ({r.views} views)</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              const target = selectedShareGroup;
              onClose();
              onOpenShareModal(target);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#003666',
              color: '#ffffff',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} />
            <span>Share with New Client</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
