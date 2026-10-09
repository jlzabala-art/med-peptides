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

      {/* ── GCP Standard Sub-Tabs Navigation (Laptop & Mobile) ── */}
      <div className="gcp-subtabs-strip" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        border: '1px solid #dadce0',
        background: '#ffffff',
        borderRadius: '8px',
        padding: '4px 6px',
        boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
        position: 'sticky',
        top: '72px',
        zIndex: 30,
        backdropFilter: 'blur(8px)',
        marginBottom: '0.75rem',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          width: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {[
            { id: 'treatment', label: isEs ? 'Prescripción' : 'Prescription', icon: Pill, count: compoundedFormulations.length },
            ...(atlasRecs?.peptide || atlasRecs?.supplement || atlasRecs?.diagnostic || atlasRecs?.colway ? [
              { id: 'recommendations', label: 'Atlas AI', icon: Sparkles }
            ] : []),
            { id: 'roadmap', label: 'Roadmap', icon: Layers },
            { id: 'traceability', label: isEs ? 'Calidad GMP' : 'Quality GMP', icon: Factory },
            { id: 'credentials', label: isEs ? 'Médico' : 'Doctor', icon: Stethoscope },
            { id: 'patientSharing', label: isEs ? 'Soporte' : 'Support', icon: Share2 },
            ...(!isPatientView ? [
              { id: 'quotation', label: isEs ? 'Cotización' : 'Quote', icon: FileText }
            ] : [])
          ].map(tab => {
            const isActive = activeGcpTab === tab.id;
            const IconCmp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (setActiveGcpTab) setActiveGcpTab(tab.id);
                  if (tab.id === 'treatment') {
                    const allOpen = {};
                    compoundedFormulations.forEach(f => { allOpen[f.id] = true; });
                    if (setExpandedPhases) setExpandedPhases(allOpen);
                    if (setSelectedPhase) setSelectedPhase('all');
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, formulations: true, posology: true, genomics: true }));
                  } else if (tab.id === 'recommendations') {
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, recommendations: true }));
                  } else if (tab.id === 'roadmap') {
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, posology: true }));
                  } else if (tab.id === 'traceability') {
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, traceability: true }));
                  } else if (tab.id === 'credentials') {
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, credentials: true }));
                  } else if (tab.id === 'patientSharing') {
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, patientSharing: true }));
                  } else if (tab.id === 'quotation') {
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, quotation: true }));
                  } else {
                    if (setExpandedSections) setExpandedSections(prev => ({ ...prev, [tab.id]: true }));
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#f8fafd';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#e8f0fe' : 'transparent',
                  color: isActive ? '#1a73e8' : '#5f6368',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
              >
                <IconCmp size={14} style={{ color: isActive ? '#1a73e8' : '#5f6368', flexShrink: 0 }} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count !== null && (
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isActive ? '#1a73e8' : '#f1f3f4',
                    color: isActive ? '#ffffff' : '#5f6368'
                  }}>
                    {tab.count}
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
