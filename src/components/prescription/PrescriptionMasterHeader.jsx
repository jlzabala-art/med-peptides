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
                  <span style={{ color: '#5f6368', fontWeight: 400, fontSize: '0.92rem' }}>#{rxId}</span>
                </h1>

                {/* Right: Quick Utilities Pinned to Top-Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rx-header-action-btn rx-btn-icon"
                    title={isEs ? 'Copiar enlace permanente' : 'Copy permanent link'}
                    style={{ minWidth: 32, height: 32, borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} color="#5f6368" />}
                  </button>
                  <Link
                    href={doctorPublicUrl || `/dr/haytham-salem`}
                    className="rx-header-action-btn rx-btn-icon"
                    title={isEs ? `Ir al portal clínico público del Dr/a. ${doctorName}` : `Go to Dr. ${doctorName}'s Public Clinical Portal`}
                    style={{ minWidth: 32, height: 32, borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <Home size={14} color="#5f6368" />
                  </Link>
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

        {/* Row 2: Google Cloud Console Horizontal Sub-Tabs Strip (Rule #3, #6, #23) */}
        <div className="gcp-subtabs-strip" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderTop: '1px solid #f1f3f4',
          marginTop: '12px',
          paddingTop: '8px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}>
          {[
            {
              id: 'treatment',
              label: isEs ? 'Formulación & APIs' : 'Formulation & APIs',
              icon: <Pill size={14} />,
              badge: compoundedFormulations?.length > 1 ? `${compoundedFormulations.length} Phases` : null
            },
            {
              id: 'roadmap',
              label: isEs ? 'Pauta & Hitos' : 'Posology & Roadmap',
              icon: <Clock size={14} />
            },
            {
              id: 'traceability',
              label: isEs ? 'Calidad EU GMP' : 'EU GMP & Quality',
              icon: <Factory size={14} />
            },
            ...(atlasRecs && (atlasRecs.peptide || atlasRecs.supplement || atlasRecs.diagnostic || atlasRecs.colway) ? [{
              id: 'recommendations',
              label: isEs ? 'Sinergias' : 'Recommendations',
              icon: <Sparkles size={14} />,
              badge: 'Synergy'
            }] : []),
            {
              id: 'credentials',
              label: isEs ? 'Médico & Paciente' : 'Doctor & Patient',
              icon: <ShieldCheck size={14} />
            }
          ].map(tab => {
            const isActive = activeGcpTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (setActiveGcpTab) setActiveGcpTab(tab.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#e8f0fe' : 'transparent',
                  color: isActive ? '#1a73e8' : '#5f6368',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.66rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: isActive ? '#1a73e8' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#475569',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
