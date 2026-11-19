'use client';

import React, { useState } from 'react';
import { ArrowRight, FileText, Trash2, Eye, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import notifier from '@/services/NotificationService';
import { auth } from '@/firebase';

/**
 * LabelsRowQuickPreview
 * ─────────────────────────────────────────────────────────────────────────────
 * Inline Master-Detail preview rendered directly inside the /labels Worklist row (Golden Rule #4):
 *  - Summarizes ALL prescriptions for that patient (e.g. "2 prescriptions")
 *  - Always provides "Preview PDF" (original document if stored, or /rx/[code] fallback)
 *  - Provides "Open Studio →" and safe "Delete" (Golden Rule #10 confirmCritical)
 */
export default function LabelsRowQuickPreview({
  row,
  patientPrescriptions = [],
  cleanCode,
  isEs = false,
  onOpenStudio,
  onRefreshWorklist,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [deletedIds, setDeletedIds] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const items = (Array.isArray(patientPrescriptions) && patientPrescriptions.length > 0 ? patientPrescriptions : [row])
    .filter(Boolean)
    .filter((item) => !deletedIds[item.id || item.code]);

  const patientDisplayName = row?.name || row?.patientName || 'Patient';

  const getConcisePartsSummary = (rx) => {
    const parts = Array.isArray(rx?.parts) && rx.parts.length > 0
      ? rx.parts
      : Array.isArray(rx?.formulaParts) && rx.formulaParts.length > 0
        ? rx.formulaParts
        : Array.isArray(rx?.formulas) && rx.formulas.length > 0
          ? rx.formulas
          : null;

    if (parts && parts.length > 0) {
      return parts
        .map((pt, idx) => {
          const form = pt.dispensingForm || pt.treatmentType || pt.name || `Part ${idx + 1}`;
          const vol = pt.volume ? ` (${pt.volume})` : '';
          return `${form}${vol}`;
        })
        .join(' · ');
    }
    return rx?.title || rx?.treatmentTitle || (isEs ? 'Protocolo magistral' : 'Compounded protocol');
  };

  const handlePreviewPdf = async (rx) => {
    const rxCode = String(rx?.code || cleanCode || '').replace(/^#/, '').trim();
    setPreviewTitle(`#${rxCode} · ${rx?.name || rx?.patientName || patientDisplayName}`);

    // Prefer direct stored URL if present
    const directUrl = rx?.originalDocumentUrl || rx?.pdfUrl || rx?.fileUrl || rx?.documentUrl;
    if (directUrl) {
      setPreviewUrl(directUrl);
      return;
    }

    // Try authenticated proxy if originalDocumentPath or rx.id is stored
    if (rx?.originalDocumentPath && rx?.id) {
      try {
        const token = auth?.currentUser ? await auth.currentUser.getIdToken() : '';
        const url = `/api/prescriptions/original-document?rxId=${encodeURIComponent(rx.id)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
        setPreviewUrl(url);
        return;
      } catch (err) {
        console.debug('Falling back to /rx preview:', err);
      }
    }

    // Always-available fallback: official Rx sheet / PDF view
    setPreviewUrl(`/rx/${encodeURIComponent(rxCode)}`);
  };

  const handleDeletePrescription = (rx) => {
    const targetId = rx?.id;
    const rxCode = rx?.code || targetId || 'RX';
    if (!targetId) {
      toast.error(isEs ? 'Falta el ID de la prescripción.' : 'Missing prescription document ID.');
      return;
    }

    notifier.confirmCritical(
      isEs
        ? `¿Eliminar la prescripción #${rxCode} de ${patientDisplayName}? Esta acción no se puede deshacer.`
        : `Delete prescription #${rxCode} for ${patientDisplayName}? This action cannot be undone.`,
      async () => {
        setDeletingId(targetId);
        try {
          const res = await fetch('/api/prescriptions/public-intake', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: targetId }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.success) {
            throw new Error(data?.error || 'Failed to delete prescription');
          }
          setDeletedIds((prev) => ({ ...prev, [targetId]: true }));
          toast.success(
            isEs
              ? `Prescripción #${rxCode} eliminada`
              : `Deleted prescription #${rxCode}`
          );
          onRefreshWorklist?.();
        } catch (err) {
          toast.error(err?.message || (isEs ? 'Error al eliminar prescripción.' : 'Could not delete prescription.'));
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <FileText size={14} color="#003666" />
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666' }}>
            {isEs ? `Prescripciones del Paciente (${items.length})` : `Patient Prescriptions (${items.length})`} · {patientDisplayName}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((rx, idx) => {
          const rxCode = String(rx?.code || cleanCode || '').replace(/^#/, '');
          const isDeleting = deletingId === rx?.id;
          const removedLen = Array.isArray(rx?.removedParts) ? rx.removedParts.length : 0;
          let totalParts = 1;
          if (typeof rx?.partsCount === 'number' && rx.partsCount > 0) {
            totalParts = Math.max(1, rx.partsCount - removedLen);
          } else if (Array.isArray(rx?.formulationBlocks) && rx.formulationBlocks.length > 0) {
            totalParts = rx.formulationBlocks.length;
          } else if (Array.isArray(rx?.pharmacyLabels) && rx.pharmacyLabels.length > 0) {
            totalParts = rx.pharmacyLabels.length;
          } else if (Array.isArray(rx?.parts) && rx.parts.length > 0) {
            totalParts = rx.parts.length;
          } else if (Array.isArray(rx?.phases) && rx.phases.length > 0) {
            totalParts = rx.phases.length;
          }
          return (
            <div
              key={rx?.id || `${rxCode}-${idx}`}
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {/* Left: 2-line concise summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '220px', flex: '1 1 360px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#202124' }}>
                    {idx + 1}. #{rxCode}
                  </span>
                  {rx?.testType && (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#e8f0fe',
                        color: '#1a73e8',
                        textTransform: 'uppercase',
                      }}
                    >
                      {rx.testType}
                    </span>
                  )}
                  <StatusBadge status={rx?.status || 'draft'} />
                  <span
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: '999px',
                      background: totalParts > 1 ? '#e8f0fe' : '#f1f5f9',
                      color: totalParts > 1 ? '#1a73e8' : '#475569',
                      border: totalParts > 1 ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {totalParts} {totalParts === 1 ? (isEs ? 'Parte' : 'Part') : (isEs ? 'Partes' : 'Parts')}
                  </span>
                  {rx?.doctorName && (
                    <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
                      {rx.doctorName}
                    </span>
                  )}
                  {(rx?.reportDate || rx?.prescriptionDate) && (
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      · {rx.reportDate || rx.prescriptionDate}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                  {getConcisePartsSummary(rx)}
                </div>
              </div>

              {/* Right: Always-available Preview PDF + Open Studio + Safe Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handlePreviewPdf(rx)}
                  className="gcp-btn-secondary"
                  style={{ fontSize: '0.73rem', padding: '5px 10px', minHeight: '32px' }}
                >
                  <Eye size={13} color="#003666" />
                  <span>{isEs ? 'Ver PDF' : 'Preview PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStudio?.(rx?.code || rxCode)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 11px',
                    minHeight: '32px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>{isEs ? 'Abrir Studio' : 'Open Studio'}</span>
                  <ArrowRight size={13} />
                </button>

                {rx?.id && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeletePrescription(rx)}
                    title={isEs ? 'Eliminar prescripción' : 'Delete prescription'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 9px',
                      minHeight: '32px',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1,
                    }}
                  >
                    {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    <span>{isEs ? 'Borrar' : 'Delete'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline PDF / Original Rx Preview Modal */}
      {previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '960px',
              height: '85vh',
              background: '#ffffff',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid #dadce0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                {previewTitle}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gcp-btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '5px 10px', textDecoration: 'none' }}
                >
                  {isEs ? 'Abrir en pestaña' : 'Open in New Tab'}
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  aria-label="Close preview"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} color="#334155" />
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              title={previewTitle}
              style={{ width: '100%', flex: 1, border: 'none', background: '#f1f5f9' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
