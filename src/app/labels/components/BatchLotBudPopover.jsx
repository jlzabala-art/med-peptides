'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Hash } from 'lucide-react';

function addDaysIso(days) {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

/**
 * BatchLotBudPopover
 * ─────────────────────────────────────────────────────────────────────────────
 * Allows pharmacy operators to inject a Lot/Batch # and Beyond-Use Date (BUD)
 * across every label in the active batch queue in one click.
 */
export default function BatchLotBudPopover({ onApplyBatchLotBud, isEs = false }) {
  const [open, setOpen] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(() => addDaysIso(90));
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleApply = (e) => {
    e.preventDefault();
    if (!batchNumber.trim() && !expiryDate) return;
    onApplyBatchLotBud?.({
      batchNumber: batchNumber.trim() || undefined,
      expiryDate: expiryDate || undefined
    });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={isEs ? 'Aplicar Lote y Caducidad (BUD) a todo el lote' : 'Apply Batch # & BUD to entire queue'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          color: '#334155',
          fontSize: '0.72rem',
          fontWeight: 650,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        <Hash size={12} color="#1a73e8" />
        <span>{isEs ? 'Lote / BUD Masivo' : 'Batch Lot / BUD'}</span>
      </button>

      {open && (
        <form
          onSubmit={handleApply}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '260px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.14)',
            padding: '12px',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
            {isEs ? 'Actualizar Lote y BUD en todo el lote' : 'Mass-Update Batch # & BUD'}
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.70rem', fontWeight: 600, color: '#475569' }}>
            <span>{isEs ? 'Número de Lote (Batch #)' : 'Batch / Lot Number'}</span>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. PH-2026-114"
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.70rem', fontWeight: 600, color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={11} />
              <span>{isEs ? 'Fecha Caducidad (BUD)' : 'Beyond-Use Date (BUD)'}</span>
            </span>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.75rem'
              }}
            />
          </label>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[30, 90, 180].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setExpiryDate(addDaysIso(d))}
                style={{
                  flex: 1,
                  padding: '4px',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#1a73e8',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                +{d}d
              </button>
            ))}
          </div>

          <button
            type="submit"
            style={{
              marginTop: '2px',
              padding: '7px 10px',
              borderRadius: '6px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isEs ? 'Aplicar a todo el lote' : 'Apply to Batch Queue'}
          </button>
        </form>
      )}
    </div>
  );
}
