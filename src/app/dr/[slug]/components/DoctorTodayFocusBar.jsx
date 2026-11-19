'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileSignature,
  Repeat,
  PlusCircle,
  Calculator,
  Compass,
  Tag,
  ChevronRight,
} from 'lucide-react';

/**
 * DoctorTodayFocusBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Friendly, action-oriented "Today's Clinical Focus" bar at the top of the
 * Doctor Portal Overview, connecting prescriptions, refills, /labels,
 * /calculator, and /proto in 1 click.
 */
export default function DoctorTodayFocusBar({
  isEs = false,
  doctorName = '',
  pendingCount = 0,
  refillsDueCount = 0,
  activeCount = 0,
  onOpenPending,
  onOpenPrescriptions,
  onNewPrescription,
}) {
  return (
    <section
      aria-label={isEs ? 'Resumen de acción clínica' : 'Today Clinical Focus'}
      style={{
        marginBottom: '16px',
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        border: '1px solid #dbeafe',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
            {isEs
              ? `Bienvenido${doctorName ? `, ${doctorName}` : ''} · Hoy en Consulta`
              : `Welcome${doctorName ? `, ${doctorName}` : ''} · Today's Clinical Focus`}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>
            {isEs
              ? 'Accesos directos para firmar recetas, gestionar refills y prescribir en segundos.'
              : 'Quick clinical actions to review pending signatures, manage refills, and prescribe.'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="gcp-btn-primary"
            onClick={onNewPrescription}
            style={{ fontSize: '0.76rem', padding: '7px 12px' }}
          >
            <PlusCircle size={14} />
            <span>{isEs ? 'Nueva Prescripción' : 'New Prescription'}</span>
          </button>

          <Link
            href="/pricing/pens"
            className="gcp-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '7px 11px', textDecoration: 'none' }}
          >
            <Compass size={13} color="#003666" />
            <span>{isEs ? 'Plumas U-100' : 'U-100 Pens'}</span>
          </Link>

          <Link
            href="/calculator?format=pen"
            className="gcp-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '7px 11px', textDecoration: 'none' }}
          >
            <Calculator size={13} color="#0284c7" />
            <span>{isEs ? 'Calculadora' : 'Calculator'}</span>
          </Link>

          <Link
            href="/proto"
            className="gcp-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '7px 11px', textDecoration: 'none' }}
          >
            <Compass size={13} color="#0d9488" />
            <span>{isEs ? 'Protocolos' : 'Protocols'}</span>
          </Link>

          <Link
            href="/labels"
            className="gcp-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '7px 11px', textDecoration: 'none' }}
          >
            <Tag size={13} color="#7c3aed" />
            <span>{isEs ? 'Etiquetas / Refills' : 'Label Studio'}</span>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <button
          type="button"
          onClick={onOpenPending}
          style={{
            textAlign: 'left',
            padding: '10px 12px',
            borderRadius: '10px',
            border: pendingCount > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0',
            background: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: '#fffbeb', color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileSignature size={15} />
            </span>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                {pendingCount} {isEs ? 'Pendientes de firma' : 'Pending Review / Sign'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {isEs ? 'Revisar y autorizar' : 'Review & authorize'}
              </div>
            </div>
          </div>
          <ChevronRight size={14} color="#94a3b8" />
        </button>

        <Link
          href="/labels"
          style={{
            textAlign: 'left',
            padding: '10px 12px',
            borderRadius: '10px',
            border: refillsDueCount > 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
            background: '#ffffff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Repeat size={15} />
            </span>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                {refillsDueCount} {isEs ? 'Refills programados' : 'Scheduled Refills'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {isEs ? 'Gestionar renovaciones' : 'Manage renewals & labels'}
              </div>
            </div>
          </div>
          <ChevronRight size={14} color="#94a3b8" />
        </Link>

        <button
          type="button"
          onClick={onOpenPrescriptions}
          style={{
            textAlign: 'left',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', color: '#1a73e8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Tag size={15} />
            </span>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                {activeCount} {isEs ? 'Prescripciones totales' : 'Total Prescriptions'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {isEs ? 'Ver historial completo' : 'Browse full Rx history'}
              </div>
            </div>
          </div>
          <ChevronRight size={14} color="#94a3b8" />
        </button>
      </div>
    </section>
  );
}
