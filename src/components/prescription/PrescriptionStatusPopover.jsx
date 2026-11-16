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
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const togglePopover = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      const left = Math.min(Math.max(12, rect.left), vw - 326);
      const top = rect.bottom + 360 > vh ? Math.max(12, rect.top - 360) : rect.bottom + 6;
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
            width: 'min(310px, calc(100vw - 32px))',
            maxWidth: '92vw',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Ciclo de Vida Multi-Rol' : 'Multi-Role Lifecycle'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
              1. Clinical Review (Doctor)
            </label>
            <select
              disabled={!editableAxes.includes('clinicalStatus') || isSaving}
              value={draft.clinicalStatus}
              onChange={(e) => updateDraftAxis('clinicalStatus', e.target.value)}
              style={{ fontSize: '0.76rem', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
            >
              {CLINICAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
              2. Payment / Billing Gate
            </label>
            <select
              disabled={!editableAxes.includes('paymentStatus') || isSaving}
              value={draft.paymentStatus}
              onChange={(e) => updateDraftAxis('paymentStatus', e.target.value)}
              style={{ fontSize: '0.76rem', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: productionUnlocked ? '#475569' : '#b45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {!productionUnlocked && <Lock size={11} />}
              <span>3. Production (Supplier / Lab)</span>
            </label>
            {!productionUnlocked ? (
              <div style={{ fontSize: '0.71rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '5px 8px' }}>
                Locked: requires Clinical Approval + Payment before compounding.
              </div>
            ) : (
              <select
                disabled={!editableAxes.includes('productionStatus') || isSaving}
                value={draft.productionStatus}
                onChange={(e) => updateDraftAxis('productionStatus', e.target.value)}
                style={{ fontSize: '0.76rem', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
              >
                {PRODUCTION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
              4. Label &amp; GMP Print
            </label>
            <select
              disabled={!editableAxes.includes('labelStatus') || isSaving}
              value={draft.labelStatus}
              onChange={(e) => updateDraftAxis('labelStatus', e.target.value)}
              style={{ fontSize: '0.76rem', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
            >
              {LABEL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
              5. Logistics &amp; Customs
            </label>
            <select
              disabled={!editableAxes.includes('logisticsStatus') || isSaving}
              value={draft.logisticsStatus}
              onChange={(e) => updateDraftAxis('logisticsStatus', e.target.value)}
              style={{ fontSize: '0.76rem', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
            >
              {LOGISTICS_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

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
