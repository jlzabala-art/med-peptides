'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, FileText, Loader2, Pill } from 'lucide-react';

/**
 * Inline Master-Detail preview rendered directly inside the Worklist table row (Golden Rule #4).
 * Lets operators inspect all prescription parts, ingredients, and posology in 1 click without leaving the table.
 */
export default function LabelsRowQuickPreview({
  row,
  cleanCode,
  isEs,
  onOpenStudio,
}) {
  const initialParts = Array.isArray(row?.formulaParts) && row.formulaParts.length > 0
    ? row.formulaParts
    : Array.isArray(row?.formulas) && row.formulas.length > 0
      ? row.formulas
      : null;

  const [parts, setParts] = useState(initialParts);
  const [notes, setNotes] = useState(row?.notes || row?.clinicalNotes || '');
  const [loading, setLoading] = useState(!initialParts);

  useEffect(() => {
    if (initialParts || !cleanCode) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/prescriptions/${encodeURIComponent(cleanCode)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const rx = data.prescription || data;
        const fetchedParts =
          rx.formulaParts ||
          rx.formulas ||
          rx.items ||
          [];
        setParts(Array.isArray(fetchedParts) ? fetchedParts : []);
        setNotes(rx.notes || rx.clinicalNotes || rx.instructions || '');
      })
      .catch(() => {
        if (!cancelled) setParts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cleanCode, initialParts]);

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={14} color="#003666" />
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666' }}>
            {isEs ? 'Contenido de la Prescripción' : 'Prescription Content'} · #{row?.code}
          </span>
          {row?.doctorName && (
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              ({row.doctorName})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenStudio?.(row?.code)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#1a73e8',
            color: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <span>{isEs ? 'Abrir en Label Studio' : 'Open in Label Studio'}</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748b', padding: '6px 0' }}>
          <Loader2 size={14} className="animate-spin" />
          <span>{isEs ? 'Cargando fórmula...' : 'Loading prescription parts...'}</span>
        </div>
      ) : parts && parts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
          {parts.map((part, idx) => {
            const title = part.title || part.name || part.formulaName || `${isEs ? 'Parte' : 'Part'} ${idx + 1}`;
            const form = part.form || part.presentation || part.vehicle || '';
            const posology = part.posology || part.dosage || part.instructions || part.sig || '';
            const actives = Array.isArray(part.ingredients)
              ? part.ingredients.map((i) => `${i.name || i.ingredient}${i.dose ? ` ${i.dose}` : ''}`).join(' · ')
              : part.composition || part.actives || '';
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderLeft: '3px solid #1a73e8',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Pill size={12} color="#1a73e8" />
                    <span>{title}</span>
                  </span>
                  {form && (
                    <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#475569', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                      {form}
                    </span>
                  )}
                </div>
                {actives && (
                  <div style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.4 }}>
                    {actives}
                  </div>
                )}
                {posology && (
                  <div style={{ fontSize: '0.70rem', color: '#0f766e', fontWeight: 600 }}>
                    Sig: {posology}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: '0.74rem', color: '#475569' }}>
          {row?.title || row?.treatmentTitle || (isEs ? 'Sin detalle de partes disponible en resumen.' : 'No part breakdown available in summary.')}
        </div>
      )}

      {notes && (
        <div style={{ fontSize: '0.72rem', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
          <strong>{isEs ? 'Notas:' : 'Notes:'}</strong> {notes}
        </div>
      )}
    </div>
  );
}
