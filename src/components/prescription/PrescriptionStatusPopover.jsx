'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Lock, Check, X, Pencil } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePrescriptionStatus } from '@/hooks/usePrescriptionStatus';
import {
  CLINICAL_STATUSES,
  PAYMENT_STATUSES,
  PRODUCTION_STATUSES,
  LABEL_STATUSES,
  LOGISTICS_STATUSES,
} from '@/utils/prescriptions/statusWorkflow';

/**
 * PrescriptionStatusPopover
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable Status cell trigger + GCP-style multi-axis dropdown popover powered by
 * `usePrescriptionStatus`. Can be embedded in `/labels`, `/admin`, `/doctor`,
 * `/pharmacy`, and `/rx/[code]` with automatic role permissions & cascade sync.
 */
export default function PrescriptionStatusPopover({
  prescription,
  cleanCode,
  role = 'admin',
  isEs = false,
  onUpdated = null,
}) {
  const {
    axes,
    draft,
    isSaving,
    cascadeNote,
    editableAxes,
    isAdmin,
    productionUnlocked,
    derivedPrimaryStatus,
    updateDraftAxis,
    resetDraft,
    saveStatuses,
  } = usePrescriptionStatus(prescription, { cleanCode, role, isEs, onUpdated });

  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState('paymentStatus');
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const togglePopover = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      const left = Math.min(Math.max(12, rect.left), vw - 356);
      const top = rect.bottom + 240 > vh ? Math.max(12, rect.top - 240) : rect.bottom + 6;
      setPopoverPos({ top, left });
    }
    resetDraft();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleSave = async () => {
    const ok = await saveStatuses();
    if (ok) setIsOpen(false);
  };

  const isPaid = axes.paymentStatus === 'paid' || axes.paymentStatus === 'invoiced_b2b';

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: '3px' }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={togglePopover}
        title={isEs ? 'Clic para editar estados multi-rol' : 'Click to edit multi-role statuses'}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '3px',
          background: isOpen ? '#eff6ff' : 'transparent',
          border: isOpen ? '1px solid #93c5fd' : '1px solid transparent',
          borderRadius: '8px',
          padding: '3px 6px 3px 3px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <StatusBadge status={derivedPrimaryStatus} />
          <Pencil size={11} color="#64748b" style={{ opacity: 0.55, flexShrink: 0 }} />
          <ChevronDown size={13} color="#64748b" style={{ flexShrink: 0 }} />
        </div>

        {/* Compact multi-axis summary line for Admin */}
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#64748b', paddingLeft: '2px', whiteSpace: 'nowrap' }}>
            <span style={{ color: isPaid ? '#16a34a' : '#d97706', fontWeight: 700 }}>
              {isPaid ? 'Paid' : 'Unpaid'}
            </span>
            <span>·</span>
            <span>{axes.productionStatus === 'processing' ? 'Lab: Active' : axes.productionStatus === 'qc_passed' ? 'Lab: QC' : 'Lab: Idle'}</span>
            {axes.logisticsStatus !== 'awaiting_release' && (
              <>
                <span>·</span>
                <span>{axes.logisticsStatus === 'in_transit_hub' ? 'Customs' : axes.logisticsStatus === 'delivered' ? 'Delivered' : 'Logistics'}</span>
              </>
            )}
          </div>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            zIndex: 1200,
            width: 'min(380px, calc(100vw - 24px))',
            maxWidth: '94vw',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Actualizar Estado del Ciclo' : 'Update Lifecycle Status'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* 5-Step GCP Horizontal Stepper */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '4px' }}>
            {[
              { key: 'clinicalStatus', short: 'Rx', title: '1. Clinical Review', done: draft.clinicalStatus === 'approved' },
              { key: 'paymentStatus', short: 'Pay', title: '2. Payment', done: draft.paymentStatus === 'paid' || draft.paymentStatus === 'invoiced_b2b' },
              { key: 'productionStatus', short: 'Lab', title: '3. Lab Production', done: draft.productionStatus === 'qc_passed' || draft.productionStatus === 'dispensed', locked: !productionUnlocked },
              { key: 'labelStatus', short: 'Label', title: '4. Label & Print', done: draft.labelStatus === 'printed' || draft.labelStatus === 'labeled' },
              { key: 'logisticsStatus', short: 'Ship', title: '5. Shipping', done: draft.logisticsStatus === 'delivered' || draft.logisticsStatus === 'in_transit_hub' },
            ].map((step) => {
              const isSelected = activeStep === step.key;
              return (
                <button
                  key={step.key}
                  type="button"
                  title={step.title}
                  onClick={() => setActiveStep(step.key)}
                  style={{
                    padding: '5px 3px',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #1a73e8' : '1px solid #e2e8f0',
                    background: isSelected ? '#e8f0fe' : step.done ? '#f0fdf4' : '#f8fafc',
                    color: isSelected ? '#1a73e8' : step.done ? '#15803d' : '#64748b',
                    fontSize: '0.64rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {step.locked ? '🔒 ' : step.done ? '✓ ' : ''}{step.short}
                </button>
              );
            })}
          </div>

          {/* Active Step 1-Click Segmented Pills (No native <select>) */}
          {(() => {
            const stepMap = {
              clinicalStatus: { label: '1. Clinical Review (Doctor)', options: CLINICAL_STATUSES },
              paymentStatus: { label: '2. Payment / Billing Gate', options: PAYMENT_STATUSES },
              productionStatus: { label: '3. Production (Supplier / Lab)', options: PRODUCTION_STATUSES, locked: !productionUnlocked },
              labelStatus: { label: '4. Label & GMP Print', options: LABEL_STATUSES },
              logisticsStatus: { label: '5. Logistics & Customs', options: LOGISTICS_STATUSES },
            };
            const current = stepMap[activeStep] || stepMap.paymentStatus;
            const canEditStep = editableAxes.includes(activeStep) && !isSaving;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#334155' }}>
                  {current.label}
                </div>
                {current.locked ? (
                  <div style={{ fontSize: '0.71rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '6px 8px' }}>
                    🔒 Locked: requires Clinical Approval + Payment before compounding.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {current.options.map((opt) => {
                      const isActive = draft[activeStep] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={!canEditStep}
                          onClick={() => updateDraftAxis(activeStep, opt.value)}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            border: isActive ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                            background: isActive ? '#1a73e8' : '#ffffff',
                            color: isActive ? '#ffffff' : '#334155',
                            fontSize: '0.71rem',
                            fontWeight: isActive ? 700 : 600,
                            cursor: canEditStep ? 'pointer' : 'not-allowed',
                            opacity: canEditStep ? 1 : 0.6,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {cascadeNote && (
            <div style={{ fontSize: '0.70rem', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 8px', fontWeight: 600 }}>
              {cascadeNote}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsOpen(false)}
              style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#1a73e8',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: isSaving ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Check size={13} />
              <span>{isSaving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar' : 'Save')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
