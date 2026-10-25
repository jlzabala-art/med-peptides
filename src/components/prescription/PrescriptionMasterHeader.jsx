"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Check, 
  Copy, 
  Pill, 
  Sparkles, 
  Share2, 
  Calendar,
  MessageSquare,
  ShieldCheck,
  Eye
} from '@/lib/icons';
import { RotateCw } from 'lucide-react';
import PrescriptionStatusQuickAction from './PrescriptionStatusQuickAction';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';

/**
 * PrescriptionMasterHeader
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console style canonical resource header for medical prescriptions.
 * Unified across Doctor View and Patient View:
 * - High-density resource identity (Title, #ID Copy-on-click, Status Badge)
 * - GCP Segmented Switcher (Doctor View ↔ Patient Preview for authorized clinical viewers)
 * - Role-tailored action hierarchy (No button redundancy, clear CTA hierarchy)
 */
export default function PrescriptionMasterHeader({
  rx,
  rxId,
  isEs = false,
  isPatientView = false,
  isAuthorizedViewer = false,
  onSwitchView = null,
  currentStatus = 'approved',
  _currentStatusMeta = {},
  setCurrentStatus,
  doctorName = '',
  doctorPublicUrl = '',
  handleCopyLink,
  copied = false,
  onOpenPatientShare = null,
  onOpenInquiry = null,
  onSyncCalendar = null
}) {
  return (
    <div className="rx-card rx-gcp-header-card">
      {/* ── Main GCP Resource Header Row ────────────────────────────────────── */}
      <div className="rx-gcp-header-main-row">
        {/* Left: Identity & Metadata */}
        <div className="rx-gcp-header-left">
          <div className={`rx-gcp-header-icon ${isPatientView ? 'patient' : ''}`}>
            {isPatientView ? <Pill size={20} /> : <Stethoscope size={20} />}
          </div>

          <div className="rx-gcp-title-wrap">
            <div className="rx-gcp-title-line">
              <h1 className="rx-gcp-resource-title">
                {isEs ? 'Prescripción Médica' : 'Medical Prescription'}{' '}
                <span style={{ color: '#5f6368', fontWeight: 400, fontSize: '0.90rem' }}>
                  #<CopyableId value={String(rxId || '')} maxLength={40} />
                </span>
              </h1>

              {/* Status Badge */}
              {!isPatientView ? (
                <PrescriptionStatusQuickAction
                  status={currentStatus}
                  prescriptionId={rx?.id}
                  prescriptionNumber={rx?.prescriptionNumber || rx?.code || rxId}
                  onStatusChange={(newSt) => setCurrentStatus && setCurrentStatus(newSt)}
                  isEs={isEs}
                />
              ) : (
                <StatusBadge 
                  status={currentStatus || 'active'} 
                  label={isEs ? 'Tratamiento Activo' : 'Active Treatment'} 
                />
              )}
            </div>

            <div style={{ fontSize: '0.74rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>
                {isEs
                  ? 'Dossier clínico digital · Pauta posológica · Grado EU GMP'
                  : 'Digital clinical dossier · Posology regimen · EU GMP Standards'}
              </span>
              {doctorName && (
                <span style={{ color: '#94a3b8' }}>• {doctorName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: GCP Segmented Switcher & Role Actions */}
        <div className="rx-gcp-header-right">
          {/* Segmented Switcher (Doctor View ↔ Patient Preview for Authorized Clinicians) */}
          {isAuthorizedViewer && onSwitchView && (
            <div className="rx-gcp-segmented-switch" role="tablist" aria-label="View Switcher">
              <button
                type="button"
                role="tab"
                aria-selected={!isPatientView}
                onClick={() => onSwitchView('doctor')}
                className={`rx-switch-pill ${!isPatientView ? 'is-active doctor' : ''}`}
                title={isEs ? 'Panel clínico para el médico' : 'Switch to clinical doctor view'}
              >
                <Stethoscope size={13} />
                <span>{isEs ? 'Vista Médico' : 'Doctor View'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isPatientView}
                onClick={() => onSwitchView('patient')}
                className={`rx-switch-pill ${isPatientView ? 'is-active patient' : ''}`}
                title={isEs ? 'Previsualizar dossier tal como lo ve el paciente (0ms switch)' : 'Preview patient view (0ms switch)'}
              >
                <Eye size={13} />
                <span>{isEs ? 'Vista Paciente' : 'Patient Preview'}</span>
              </button>
            </div>
          )}

          {/* DOCTOR VIEW ACTIONS */}
          {!isPatientView && (
            <>
              {onOpenPatientShare && (
                <button
                  type="button"
                  onClick={onOpenPatientShare}
                  className="rx-action-btn-tonal-green"
                  title={isEs ? 'Compartir pauta segura con el paciente (QR / WhatsApp)' : 'Share safe regimen with patient (QR / WhatsApp)'}
                >
                  <Share2 size={13} />
                  <span>{isEs ? 'Compartir con Paciente' : 'Share with Patient'}</span>
                </button>
              )}

              {doctorPublicUrl && rxId && (
                <Link
                  href={`${doctorPublicUrl}${String(doctorPublicUrl).includes('?') ? '&' : '?'}represcribe=${encodeURIComponent(String(rxId))}`}
                  className="rx-action-btn-primary"
                  title={isEs ? 'Renovar o modificar esta pauta en el constructor' : 'Renew or adjust regimen in prescription builder'}
                >
                  <RotateCw size={13} />
                  <span>{isEs ? 'Renovar' : 'Renew'}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="rx-action-btn-icon"
                title={isEs ? 'Copiar enlace permanente' : 'Copy permanent link'}
              >
                {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
              </button>
            </>
          )}

          {/* PATIENT VIEW ACTIONS: Clean GCP copy button without clutter */}
          {isPatientView && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="rx-action-btn-icon"
                title={isEs ? 'Copiar enlace de mi prescripción' : 'Copy prescription link'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                <span>{copied ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Patient Preview Context Banner (Subtle GCP Mode Ribbon) ──────────── */}
      {isPatientView && isAuthorizedViewer && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginTop: '10px',
          padding: '6px 12px',
          borderRadius: '6px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Eye size={13} />
            <span>
              {isEs 
                ? 'Modo Previsualización Paciente: Visualizando el dossier simplificado tal como lo recibe el paciente.' 
                : 'Patient Preview Mode: Viewing the simplified dossier as seen by the patient.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSwitchView && onSwitchView('doctor')}
            style={{
              background: 'none',
              border: 'none',
              color: '#15803d',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.74rem'
            }}
          >
            {isEs ? 'Volver a Vista Médico →' : 'Return to Doctor View →'}
          </button>
        </div>
      )}
    </div>
  );
}
