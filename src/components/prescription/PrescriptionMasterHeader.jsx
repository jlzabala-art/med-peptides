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
  FileText 
} from '@/lib/icons';
import { Home } from 'lucide-react';
import PrescriptionStatusQuickAction from './PrescriptionStatusQuickAction';

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
        {/* Row 1: Resource Title & Quick Utilities */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Identity & Official Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexWrap: 'wrap' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '6px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#202124',
                  lineHeight: 1.3
                }}>
                  {isEs ? 'Prescripción Médica' : 'Medical Prescription'}{' '}
                  <span style={{ color: '#5f6368', fontWeight: 400 }}>#{rxId}</span>
                </h1>

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
              </div>
              <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '2px' }}>
                {isEs
                  ? 'Dossier clínico digital · Pauta posológica · Certificado GMP EU'
                  : 'Digital clinical dossier · Posology regimen · EU GMP Certified'}
              </div>
            </div>
          </div>

          {/* Right: Quick Utilities (Copy permanent link & Doctor Public Portal link) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyLink}
              className="rx-header-action-btn rx-btn-icon"
              title={isEs ? 'Copiar enlace permanente' : 'Copy permanent link'}
              style={{ minWidth: 34, height: 32, borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} color="#5f6368" />}
            </button>
            <Link
              href={doctorPublicUrl || `/dr/haytham-salem`}
              className="rx-header-action-btn rx-btn-icon"
              title={isEs ? `Ir al portal clínico público del Dr/a. ${doctorName}` : `Go to Dr. ${doctorName}'s Public Clinical Portal`}
              style={{ minWidth: 34, height: 32, borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              <Home size={14} color="#5f6368" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
