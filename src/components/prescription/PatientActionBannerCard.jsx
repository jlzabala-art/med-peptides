"use client";

import React, { useMemo } from 'react';
import { Tag, CheckCircle2, Clock, Calendar, MessageSquare, ArrowRight } from '@/lib/icons';
import { RotateCcw, AlertCircle, Lock } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * PatientActionBannerCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console style Clinical Status & Pending Actions card for prescriptions.
 * - Only shows "Refill Action" if a refill is actually due or requested.
 * - Otherwise displays an active, reassuring clinical status with pending checklist items
 *   harmonized with the doctor's portal.
 * - Enforces healthcare authentication: when not authenticated, shows lock icon (🔒)
 *   and triggers frictionless Google Cloud UX quick login.
 */
export default function PatientActionBannerCard({
  isPatientView = false,
  isDispensed = false,
  isEs = false,
  rxId = '',
  rx = {},
  currentStatus = 'approved',
  resolvedPrice = null,
  doctorName = '',
  onOpenInquiry = null,
  isAuthenticated = false,
  onRequireAuth = null
}) {
  // Determine if a refill is actually due (only show refill urgency if truly due)
  const isActuallyRefillDue = useMemo(() => {
    return Boolean(
      rx?.isRefillDue ||
      rx?.refillPending ||
      rx?.refillStatus === 'pending' ||
      rx?.refillStatus === 'due' ||
      currentStatus === 'refill_due' ||
      currentStatus === 'renewal_required' ||
      (rx?.refillsRemaining > 0 && currentStatus === 'completed')
    );
  }, [rx, currentStatus]);

  if (!isPatientView) return null;

  // Handle CTA click
  const handleAction = () => {
    triggerHaptic('selection');
    if (!isAuthenticated && onRequireAuth) {
      onRequireAuth('action');
      return;
    }
    if (onOpenInquiry) {
      onOpenInquiry();
    }
  };

  /* ───────────────────────────────────────────────────────────────────────────
   * CASE 1: REFILL IS ACTUALLY DUE
   * ─────────────────────────────────────────────────────────────────────────── */
  if (isActuallyRefillDue) {
    return (
      <div 
        className="rx-card patient-action-banner-card"
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #fed7aa',
          borderLeft: '4px solid #ea580c',
          padding: '1rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 260 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '6px',
              background: '#fff7ed',
              color: '#ea580c',
              border: '1px solid #ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <RotateCcw size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: '#ffedd5',
                  color: '#9a3412',
                  border: '1px solid #fed7aa'
                }}>
                  {isEs ? 'Acción Requerida · Reposición' : 'Action Required · Refill Due'}
                </span>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontFamily: 'monospace' }}>
                  Ref: #{rxId}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
                {isEs ? 'Renovación de Prescripción Disponible' : 'Prescription Renewal Due'}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45, maxWidth: 620 }}>
                {isEs 
                  ? 'Su ciclo de formulación actual ha concluido o se aproxima a la fecha de reposición autorizada. Puede solicitar la renovación con el laboratorio para mantener la continuidad terapéutica.'
                  : 'Your current compounding supply is concluding or approaching its authorized refill date. You can request your refill with the laboratory to maintain treatment continuity.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'center' }}>
            <button
              type="button"
              onClick={handleAction}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#ea580c',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(234, 88, 12, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              {!isAuthenticated ? <Lock size={14} color="#fef08a" /> : <RotateCcw size={14} />}
              <span>{isEs ? (!isAuthenticated ? 'Solicitar Reposición (Login)' : 'Solicitar Reposición') : (!isAuthenticated ? 'Request Refill (Login)' : 'Request Refill')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────────────────────
   * CASE 2: DISPENSED & REGIMEN ACTIVE ON SCHEDULE (Calm GCP Status)
   * ─────────────────────────────────────────────────────────────────────────── */
  if (isDispensed) {
    return (
      <div 
        className="rx-card patient-action-banner-card"
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #16a34a',
          padding: '0.9rem 1.15rem',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          marginBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 240, flex: 1 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '6px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0'
                }}>
                  {isEs ? 'Pauta Activa en Seguimiento' : 'Active Regimen on Schedule'}
                </span>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontFamily: 'monospace' }}>
                  #{rxId}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                {isEs 
                  ? 'Tratamiento verificado y activo. Siga la pauta de administración diaria indicada en este expediente.'
                  : 'Treatment verified and in active administration. Follow the daily posology schedule outlined in this dossier.'}
              </div>
            </div>
          </div>

          {/* Pending Actions Checklist (Google Cloud style) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.72rem',
            color: '#334155',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '6px 10px',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} color="#16a34a" />
              <span>{isEs ? 'Lote liberado QP' : 'QP Batch Verified'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="#0284c7" />
              <span>{isEs ? 'Pauta al día' : 'Dosing on Schedule'}</span>
            </div>
            <button
              type="button"
              onClick={handleAction}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontWeight: 650,
                fontSize: '0.72rem',
                cursor: 'pointer',
                padding: '0 4px',
                textDecoration: 'underline'
              }}
            >
              {isEs ? 'Contactar Clínica' : 'Contact Clinic'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────────────────────────────────
   * CASE 3: NEW / READY FOR QUOTATION (Pre-dispensing)
   * ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div 
      className="rx-card patient-action-banner-card"
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #bfdbfe',
        borderLeft: '4px solid #1a73e8',
        padding: '1rem 1.25rem',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 260 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '6px',
            background: '#eff6ff',
            color: '#1a73e8',
            border: '1px solid #dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Tag size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 7px',
                borderRadius: '4px',
                background: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe'
              }}>
                {isEs ? 'Prescripción Lista para Cotización' : 'Prescription Ready for Quotation'}
              </span>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontFamily: 'monospace' }}>
                Ref: #{rxId}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
              {isEs ? 'Solicitar Cotización de Formulación Magistral' : 'Request Official Compounding Quotation'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45, maxWidth: 620 }}>
              {isEs
                ? 'Consulte el presupuesto oficial para la preparación en laboratorio especializado de su pauta médica personalizada con envío directo a su domicilio o clínica.'
                : 'Request the formal compounding quotation for the preparation and direct delivery of your physician-prescribed clinical formula.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'center' }}>
          {resolvedPrice?.formatted && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                {isEs ? 'Estimación' : 'Estimate'}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {resolvedPrice.formatted}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#003666',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 54, 102, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            {!isAuthenticated ? <Lock size={14} color="#fef08a" /> : <Tag size={14} />}
            <span>{isEs ? (!isAuthenticated ? 'Pedir Cotización (Login)' : 'Pedir Cotización') : (!isAuthenticated ? 'Request Quotation (Login)' : 'Request Quotation')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
