'use client';

import React, { useState, useRef, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { getNextAllowedStates } from '@/schemas/transactionalStateMachine';
import { ChevronDown, Check, AlertCircle, History } from '@/lib/icons';

/**
 * InteractiveStatusDropdown
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a GCP-styled status badge that, when clicked by an authorized user,
 * displays a contextual dropdown containing ONLY legally valid target states
 * according to transactionalStateMachine.js.
 *
 * @param {string}   entityType     — 'prescription' | 'quotation' | 'purchase_order' | 'sales_order'
 * @param {string}   currentStatus  — Current status string (e.g. 'draft', 'pending')
 * @param {Function} onStatusChange — Async callback (targetStatus) => Promise<void>
 * @param {boolean}  disabled       — If true, renders static badge
 * @param {Object}   statusHistory  — Optional history map { [timestamp]: { from, to, by, at } }
 */
export default function InteractiveStatusDropdown({
  entityType = 'quotation',
  currentStatus = 'draft',
  onStatusChange,
  disabled = false,
  statusHistory = null,
  record = {},
  validator
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const containerRef = useRef(null);

  // Determine legally allowed next states from state machine
  const allowedStates = getNextAllowedStates(entityType, currentStatus);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowHistory(false);
        setErrorMsg(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStatus = async (target) => {
    if (target === currentStatus || isUpdating) return;

    // Optional client-side validator guard
    if (validator) {
      const check = validator(record, target);
      if (check && !check.valid) {
        setErrorMsg(check.error || 'Transition not allowed by business rules');
        return;
      }
    }

    try {
      setIsUpdating(true);
      setErrorMsg(null);
      if (onStatusChange) {
        await onStatusChange(target);
      }
      setIsOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasHistory = statusHistory && Object.keys(statusHistory).length > 0;
  const historyEntries = hasHistory 
    ? Object.values(statusHistory).sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
    : [];

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Interactive Badge Pill */}
      <button
        type="button"
        disabled={disabled || allowedStates.length === 0 || isUpdating}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowHistory(false);
          setErrorMsg(null);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: (disabled || allowedStates.length === 0 || isUpdating) ? 'default' : 'pointer',
          borderRadius: '12px',
          outline: 'none',
          opacity: isUpdating ? 0.6 : 1,
          transition: 'transform 0.1s ease'
        }}
        title={allowedStates.length > 0 ? 'Click to transition state' : 'Terminal status'}
      >
        <StatusBadge status={currentStatus} />
        {!disabled && allowedStates.length > 0 && (
          <ChevronDown size={12} color="#64748b" style={{ marginLeft: '-2px' }} />
        )}
      </button>

      {/* History Icon Trigger if available */}
      {hasHistory && (
        <button
          type="button"
          onClick={() => {
            setShowHistory(!showHistory);
            setIsOpen(false);
          }}
          title="View audit state timeline"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '2px',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px'
          }}
        >
          <History size={13} />
        </button>
      )}

      {/* ── DROPDOWN MENU FOR LEGAL TRANSITIONS ────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1000,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            padding: '0.35rem',
            minWidth: '170px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
            Change status to:
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', color: '#b91c1c', backgroundColor: '#fef2f2',
              padding: '0.3rem 0.5rem', borderRadius: '4px', marginBottom: '4px'
            }}>
              <AlertCircle size={12} />
              <span>{errorMsg}</span>
            </div>
          )}

          {allowedStates.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleSelectStatus(st)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <StatusBadge status={st} />
            </button>
          ))}
        </div>
      )}

      {/* ── TIMELINE POPOVER FOR AUDIT HISTORY ─────────────────────────────── */}
      {showHistory && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1000,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            padding: '0.75rem',
            minWidth: '240px',
            maxWidth: '300px',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.3rem' }}>
            State Transition Audit Timeline
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {historyEntries.map((h, i) => (
              <div key={i} style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <span style={{ color: '#94a3b8' }}>{h.from}</span>
                  <span style={{ color: '#38bdf8' }}>➔</span>
                  <span style={{ color: '#4ade80' }}>{h.to}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                  {h.at ? new Date(h.at).toLocaleString() : 'Date recorded'} {h.by ? `· by ${h.by.slice(0, 8)}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
