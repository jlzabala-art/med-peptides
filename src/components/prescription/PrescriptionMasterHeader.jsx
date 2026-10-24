"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Check, 
  Copy, 
  Pill, 
  Sparkles, 
  Layers, 
  Factory, 
  Share2, 
  FileText,
  Clock,
  ShieldCheck
} from '@/lib/icons';
import { Home, ArrowLeft, RotateCw } from 'lucide-react';
import PrescriptionStatusQuickAction from './PrescriptionStatusQuickAction';
import CopyableId from '@/components/ui/CopyableId';

/**
 * PrescriptionMasterHeader
 * 
 * Google Cloud Console style resource header and sticky sub-tabs strip
 * for medical prescriptions (Doctor and Patient views).
 */
export default function PrescriptionMasterHeader({
  rx,
  rxId,
  isEs = false,
  isPatientView = false,
  currentStatus = 'approved',
  currentStatusMeta = {},
  setCurrentStatus,
  doctorName,
  doctorPublicUrl,
  handleCopyLink,
  copied = false,
  onOpenPatientShare = null,
  activeGcpTab = 'treatment',
  setActiveGcpTab,
  compoundedFormulations = [],
  atlasRecs = null,
  setExpandedPhases,
  setSelectedPhase,
  setExpandedSections
}) {
  return (
    <>
      {/* ── Master Header Card (Google Cloud Console High-Density Resource Header) ─────── */}
      <div className="rx-card gcp-resource-header-card" style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #dadce0',
        padding: '14px 18px',
        boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.08)',
        marginBottom: '0.75rem'
      }}>
        {/* Row 1: Resource Title & Quick Utilities (GCP Header Architecture) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          width: '100%'
        }}>
          {/* Left: Identity & Official Status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '6px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <Stethoscope size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                <h1 style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#202124',
                  lineHeight: 1.25,
                  wordBreak: 'break-word'
                }}>
                  {isEs ? 'Prescripción Médica' : 'Medical Prescription'}{' '}
                  <span style={{ color: '#5f6368', fontWeight: 400, fontSize: '0.92rem' }}>
                    #<CopyableId value={String(rxId || '')} maxLength={40} />
                  </span>
                </h1>

                {/* Right: Quick Utilities Pinned to Top-Right (Google Cloud UX) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {!isPatientView && onOpenPatientShare && (
                    <button
                      type="button"
                      onClick={onOpenPatientShare}
                      className="rx-header-action-btn"
                      title={isEs ? 'Compartir pauta segura con el paciente (QR / WhatsApp)' : 'Share safe regimen with patient (QR / WhatsApp)'}
                      style={{
                        height: 32,
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0',
                        background: '#f0fdf4',
                        color: '#15803d',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 650
                      }}
                    >
                      <Share2 size={13} color="#15803d" />
                      <span>{isEs ? 'Compartir con Paciente' : 'Share with Patient'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rx-header-action-btn rx-btn-icon"
                    title={isEs ? 'Copiar enlace permanente' : 'Copy permanent link'}
                    style={{ minWidth: 32, height: 32, borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} color="#5f6368" />}
                  </button>
                  {!isPatientView && doctorPublicUrl && rxId && (
                    <Link
                      href={`${doctorPublicUrl}${String(doctorPublicUrl).includes('?') ? '&' : '?'}represcribe=${encodeURIComponent(String(rxId))}`}
                      className="rx-header-action-btn"
                      title={isEs ? 'Renovar esta pauta en el constructor de prescripciones' : 'Renew this regimen in the prescription builder'}
                      style={{ height: 32, padding: '0 10px', borderRadius: '6px', border: '1px solid #003666', background: '#003666', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#ffffff', fontSize: '0.74rem', fontWeight: 650 }}
                    >
                      <RotateCw size={13} />
                      <span>{isEs ? 'Renovar' : 'Renew'}</span>
                    </Link>
                  )}
                  {doctorPublicUrl && (
                    <Link
                      href={doctorPublicUrl}
                      className="rx-header-action-btn"
                      title={isEs ? `Volver al portal de ${doctorName || 'Médico'}` : `Return to portal of ${doctorName || 'Doctor'}`}
                      style={{
                        height: 32,
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        textDecoration: 'none',
                        color: '#003666',
                        fontSize: '0.74rem',
                        fontWeight: 650,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ArrowLeft size={13} color="#003666" strokeWidth={2.5} />
                      <span>{doctorName ? (/práctica|practice|portal|verified|verificada/i.test(doctorName) || doctorName.startsWith('Dr') ? doctorName : `Dr. ${doctorName}`) : (isEs ? 'Portal Médico' : 'Doctor Portal')}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Status Badge + Subtitle Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {/* GCP Status Badge / Interactive Quick Action for Doctor */}
                {!isPatientView ? (
                  <PrescriptionStatusQuickAction
                    status={currentStatus}
                    prescriptionId={rx?.id}
                    prescriptionNumber={rx?.prescriptionNumber || rx?.code || rxId}
                    onStatusChange={(newSt) => setCurrentStatus && setCurrentStatus(newSt)}
                    isEs={isEs}
                  />
                ) : (
                  <span
                    role="status"
                    aria-label={`${isEs ? 'Estado' : 'Status'}: ${currentStatusMeta.label || currentStatus}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: currentStatusMeta.bg || '#f0fdf4',
                      color: currentStatusMeta.color || '#16a34a',
                      border: `1px solid ${currentStatusMeta.border || '#bbf7d0'}`,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      lineHeight: 1.2,
                      userSelect: 'none',
                      cursor: 'default'
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: currentStatusMeta.color || '#16a34a',
                        flexShrink: 0
                      }}
                    />
                    <span>{currentStatusMeta.label || currentStatus}</span>
                  </span>
                )}
                <span style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                  {isEs
                    ? 'Dossier clínico digital · Pauta posológica · Certificado GMP EU'
                    : 'Digital clinical dossier · Posology regimen · EU GMP Certified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
