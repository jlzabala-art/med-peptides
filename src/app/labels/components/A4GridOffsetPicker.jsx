'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Grid } from 'lucide-react';

/**
 * A4GridOffsetPicker
 * ─────────────────────────────────────────────────────────────────────────────
 * Visual 2x5 A4 sheet grid selector so pharmacy operators can click the exact
 * starting label slot on a partially used A4 label sheet (startOffset 0..9).
 */
export default function A4GridOffsetPicker({ startOffset = 0, onChange, isEs = false }) {
  const [open, setOpen] = useState(false);
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

  const cells = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={isEs ? 'Elegir posición inicial en hoja A4' : 'Choose starting slot on A4 sheet'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 10px',
          borderRadius: '6px',
          border: startOffset > 0 ? '1.5px solid #1a73e8' : '1px solid #dadce0',
          background: startOffset > 0 ? '#e8f0fe' : '#ffffff',
          color: startOffset > 0 ? '#1a73e8' : '#3c4043',
          fontSize: '0.74rem',
          fontWeight: 650,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        <Grid size={13} />
        <span>
          {startOffset === 0
            ? (isEs ? 'A4: Inicio #1' : 'A4: Slot #1')
            : (isEs ? `A4: Desde #${startOffset + 1}` : `A4: Start #${startOffset + 1}`)}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '216px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.14)',
            padding: '12px',
            zIndex: 60
          }}
        >
          <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
            {isEs ? 'Posición inicial en hoja A4' : 'A4 Sheet Starting Slot'}
          </div>
          <div style={{ fontSize: '0.67rem', color: '#64748b', marginBottom: '10px', lineHeight: 1.35 }}>
            {isEs
              ? 'Haz clic en la primera etiqueta libre de tu hoja A4:'
              : 'Click the first available label on your A4 sheet:'}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '5px',
              padding: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
          >
            {cells.map((idx) => {
              const isSkipped = idx < startOffset;
              const isStart = idx === startOffset;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange?.(idx);
                    setOpen(false);
                  }}
                  style={{
                    height: '26px',
                    borderRadius: '4px',
                    border: isStart
                      ? '1.5px solid #1a73e8'
                      : isSkipped
                        ? '1px dashed #cbd5e1'
                        : '1px solid #cbd5e1',
                    background: isStart
                      ? '#1a73e8'
                      : isSkipped
                        ? '#e2e8f0'
                        : '#ffffff',
                    color: isStart
                      ? '#ffffff'
                      : isSkipped
                        ? '#94a3b8'
                        : '#334155',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={
                    isSkipped
                      ? (isEs ? `Espacio #${idx + 1} (usado/omitido)` : `Slot #${idx + 1} (skipped)`)
                      : (isEs ? `Empezar en #${idx + 1}` : `Start at #${idx + 1}`)
                  }
                >
                  {isSkipped ? '×' : `#${idx + 1}`}
                </button>
              );
            })}
          </div>

          {startOffset > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange?.(0);
                setOpen(false);
              }}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '5px 8px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#475569',
                fontSize: '0.69rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Restablecer a hoja nueva (#1)' : 'Reset to full sheet (#1)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
