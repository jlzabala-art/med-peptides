"use client";

import React, { useMemo } from 'react';
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
  Eye,
  FlaskConical,
  Dna,
  RotateCw,
  FileText,
  ExternalLink
} from '@/lib/icons';
import { Syringe, Snowflake } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import PrescriptionStatusQuickAction from './PrescriptionStatusQuickAction';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import { detectPrescriptionType } from '@/utils/prescriptionTypeDetection';
import COMPOUND_INDEX, { resolveProductId } from '@/data/compoundIndex';

/**
 * PrescriptionMasterHeader
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console style canonical resource header for medical prescriptions.
 * Unified across Doctor View and Patient View:
 * - High-density resource identity (Title, #ID Copy-on-click, Status Badge)
 * - GCP Segmented Switcher (Doctor View ↔ Patient Preview for authorized clinical viewers)
 * - Role-tailored action hierarchy (No button redundancy, clear CTA hierarchy)
 * - GCP Horizontal Resource Tabs Bar (Formulations, Genomics, Roadmap, EU GMP Quality, Synergies, Credentials)
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
  doctorPublicUrl = '',
  handleCopyLink,
  copied = false,
  onOpenPatientShare = null,
  onOpenDoctorValidation = null,
  activeGcpTab = 'treatment',
  setActiveGcpTab = null,
  compoundedFormulations = [],
  genomicsData = null,
  atlasRecs = null
}) {
  const hasRecommendations = Boolean(
    atlasRecs?.peptide ||
    atlasRecs?.supplement ||
    atlasRecs?.diagnostic ||
    atlasRecs?.colway ||
    atlasRecs?.teletestHairMineral
  );

  const gcpTabs = useMemo(() => {
    const tabs = [
      {
        id: 'treatment',
        label: isPatientView
          ? (isEs ? 'Tratamiento' : 'Treatment')
          : (isEs ? 'Fórmulas' : 'Formulations'),
        icon: FlaskConical,
        badge: compoundedFormulations?.length > 0 ? String(compoundedFormulations.length) : null
      }
    ];

    if (genomicsData) {
      tabs.push({
        id: 'genomics',
        label: isEs ? 'Genómica' : 'Genomics',
        icon: Dna
      });
    }

    tabs.push({
      id: 'roadmap',
      label: isEs ? 'Plan 90 Días' : '90-Day Plan',
      icon: Calendar
    });

    tabs.push({
      id: 'traceability',
      label: isEs ? 'Calidad GMP' : 'EU GMP Quality',
      icon: ShieldCheck
    });

    // Medical Ethics & Doctor Autonomy: Recommendations are ONLY visible to the physician.
    // Never expose unprescribed adjuvant peptides or supplements to the patient without doctor sign-off.
    if (hasRecommendations && !isPatientView) {
      tabs.push({
        id: 'recommendations',
        label: isEs ? 'Sinergias' : 'Synergies',
        icon: Sparkles
      });
    }

    if (!isPatientView) {
      tabs.push({
        id: 'credentials',
        label: isEs ? 'Acreditación' : 'Credentials',
        icon: Stethoscope
      });
    }

    if (isPatientView) {
      tabs.push({
        id: 'patientSharing',
        label: isEs ? 'Contactar con mi Médico' : 'Contact My Doctor',
        icon: MessageSquare
      });
    }

    return tabs;
  }, [isEs, compoundedFormulations?.length, genomicsData, hasRecommendations, isPatientView]);

  return (
    <div className="rx-card rx-gcp-header-card" style={{ paddingBottom: setActiveGcpTab ? '0' : undefined }}>
      {/* ── Main GCP Resource Header Row ────────────────────────────────────── */}
      <div className="rx-gcp-header-main-row" style={{ paddingBottom: setActiveGcpTab ? '12px' : undefined, flexWrap: 'wrap', gap: '10px' }}>
        {/* Left: Identity & Metadata */}
        <div className="rx-gcp-header-left" style={{ minWidth: 0, flex: '1 1 280px' }}>
          <div
            className="rx-gcp-header-icon"
            style={{ background: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc' }}
          >
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
                />
              )}
            </div>

            <div style={{ fontSize: '0.74rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>
                {isPatientView
                  ? (isEs ? 'Tu guía personal de tratamiento' : 'Your personal treatment guide')
                  : (isEs
                      ? 'Dossier clínico digital · Pauta posológica · Grado EU GMP'
                      : 'Digital clinical dossier · Posology regimen · EU GMP Standards')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: GCP Segmented Switcher & Role Actions */}
        <div
          className="rx-gcp-header-right"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}
        >
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
            <div className="rx-gcp-header-actions-cluster">
              {/* If Draft, primary CTA is to Validate & Certify */}
              {(currentStatus === 'draft' || currentStatus === 'pending') && onOpenDoctorValidation && (
                <button
                  type="button"
                  onClick={onOpenDoctorValidation}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(5, 150, 105, 0.25)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
                  title={isEs ? 'Revisar, personalizar y certificar la prescripción antes de enviar al paciente' : 'Review, customize and certify prescription before patient release'}
                >
                  <ShieldCheck size={14} />
                  <span>{isEs ? 'Validar y Habilitar Paciente' : 'Validate & Release to Patient'}</span>
                </button>
              )}

              {onOpenPatientShare && (
                <button
                  type="button"
                  onClick={() => {
                    if ((currentStatus === 'draft' || currentStatus === 'pending') && onOpenDoctorValidation) {
                      onOpenDoctorValidation();
                    } else {
                      onOpenPatientShare();
                    }
                  }}
                  className="rx-action-btn-tonal-green rx-action-btn-desktop-only"
                  title={isEs ? 'Compartir pauta segura con el paciente (QR / WhatsApp)' : 'Share safe regimen with patient (QR / WhatsApp)'}
                >
                  <Share2 size={13} />
                  <span>{isEs ? 'Compartir con Paciente' : 'Share with Patient'}</span>
                </button>
              )}

              {doctorPublicUrl && rxId && (
                <Link
                  href={`${doctorPublicUrl}${String(doctorPublicUrl).includes('?') ? '&' : '?'}represcribe=${encodeURIComponent(String(rxId))}`}
                  className="rx-action-btn-primary rx-action-btn-desktop-only"
                  title={isEs ? 'Renovar o modificar esta pauta en el constructor' : 'Renew or adjust regimen in prescription builder'}
                >
                  <RotateCw size={13} />
                  <span>{isEs ? 'Renovar' : 'Renew'}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="rx-action-btn-icon rx-action-btn-desktop-only"
                title={isEs ? 'Copiar enlace permanente' : 'Copy permanent link'}
              >
                {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* PATIENT VIEW ACTIONS: Single Copy Link action (Product Datasheet lives on the formulation card below — zero duplicate CTAs) */}
          {isPatientView && isAuthorizedViewer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="gcp-btn-secondary"
                title={isEs ? 'Copiar enlace de mi prescripción' : 'Copy prescription link'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  minHeight: '34px',
                  width: 'auto',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.75rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                <span>{copied ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar enlace' : 'Copy Link')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Patient Preview segmented control already indicates active mode — no redundant 85px preview banner */}
      {false && isPatientView && isAuthorizedViewer && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: setActiveGcpTab ? '10px' : '0',
          padding: '7px 12px',
          borderRadius: '6px',
          background: '#f8fafc',
          border: '1px solid #dadce0',
          borderLeft: '3px solid #1a73e8',
          color: '#3c4043',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Eye size={13} color="#1a73e8" />
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
              color: '#1a73e8',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.74rem',
              whiteSpace: 'nowrap',
            }}
          >
            {isEs ? 'Volver a Vista Médico →' : 'Return to Doctor View →'}
          </button>
        </div>
      )}

      {/* ── Google Cloud Console Key-Value Attribute Ribbon ──────────────────── */}
      {(() => {
        const rxType = detectPrescriptionType(rx, compoundedFormulations);
        const attrs = rxType.getAttributes(isEs);
        const isMultiPartHeader = Array.isArray(compoundedFormulations) && compoundedFormulations.length > 1;
        const multiRouteSummary = isMultiPartHeader
          ? `${compoundedFormulations.length} ${isEs ? 'Partes' : 'Parts'} (${compoundedFormulations
              .map((f) => {
                const hay = `${f.id || ''} ${f.shortTitle || ''} ${f.title || ''}`.toLowerCase();
                if (f.isOral || hay.includes('oral') || hay.includes('caps')) return isEs ? 'Oral' : 'Oral';
                if (hay.includes('oil') || hay.includes('wash') || hay.includes('hygiene')) return isEs ? 'Cuidado' : 'Care';
                if (hay.includes('nasal')) return 'Nasal';
                if (hay.includes('pen')) return 'Pen';
                return isEs ? 'Tópico' : 'Topical';
              })
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .join(' · ')})`
          : attrs.routeDisplay;
        const multiDeviceSummary = isMultiPartHeader
          ? compoundedFormulations
              .map((f, idx) => {
                const raw = String(f.shortTitle || f.title || `Part ${idx + 1}`).split('(')[0].trim();
                if (!isPatientView) return raw;
                const low = raw.toLowerCase();
                if (low.includes('topical')) return isEs ? 'Loción capilar' : 'Scalp Lotion';
                if (low.includes('oral')) return isEs ? 'Cápsulas diarias' : 'Daily Capsules';
                if (low.includes('scalp care') || low.includes('hygiene')) return isEs ? 'Aceite y lavado' : 'Oil & Wash';
                return raw.replace(/\bHPMC\s+/gi, '');
              })
              .filter((v, i, arr) => v && arr.indexOf(v) === i)
              .slice(0, 3)
              .join(' · ')
          : (isPatientView ? String(attrs.deviceDisplay || '').replace(/\bHPMC\s+/gi, '') : attrs.deviceDisplay);
        const durationDisplay = rx?.durationDays
          ? `${rx.durationDays} ${isEs ? 'Días' : 'Days Supply'}`
          : attrs.cycleDisplay;

        const stripEmoji = (s) =>
          String(s || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '').replace(/\s{2,}/g, ' ').trim();
        const cleanRouteText = stripEmoji(
          isPatientView
            ? String(multiRouteSummary || '').replace(/\bSubQ\b/gi, isEs ? 'Subcutánea' : 'Under the skin')
            : multiRouteSummary
        );
        const cleanDeviceText = stripEmoji(multiDeviceSummary);
        const cleanStorageText = stripEmoji(attrs.storageDisplay);
        const cleanDurationText = stripEmoji(durationDisplay);

        return (
          <>
            <style>{`
              .atlas-rx-attrs-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 10px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 8px 12px;
                margin: 8px 0 10px 0;
              }
              @media (max-width: 640px) {
                .atlas-rx-attrs-grid {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
            `}</style>
            <div className="atlas-rx-attrs-grid" style={{ borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isPatientView ? (isEs ? 'Cómo tomarlo' : 'How to take') : (isEs ? 'Vía & Frecuencia' : 'Route & Frequency')}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Syringe size={13} color="#5f6368" style={{ flexShrink: 0 }} />
                <span>{cleanRouteText}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isPatientView ? (isEs ? 'Formato' : 'Formats') : (isEs ? 'Dispositivo / Formato' : 'Device / Presentation')}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Pill size={13} color="#5f6368" style={{ flexShrink: 0 }} />
                <span>{cleanDeviceText}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isPatientView ? (isEs ? 'Conservación' : 'Storage') : (isEs ? 'Almacenamiento' : 'Storage Standard')}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: (rxType.isPen || rxType.isInjectable) ? '#0284c7' : '#0f172a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Snowflake size={13} color={(rxType.isPen || rxType.isInjectable) ? '#0284c7' : '#5f6368'} style={{ flexShrink: 0 }} />
                <span>{cleanStorageText}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isPatientView ? (isEs ? 'Duración' : 'Duration') : (isEs ? 'Ciclo Clínico' : 'Clinical Duration')}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} color="#5f6368" style={{ flexShrink: 0 }} />
                <span>{cleanDurationText}</span>
              </div>
            </div>
          </div>
          </>
        );
      })()}
      {/* ── GCP Resource Horizontal Tabs Bar ──────────────────────────────────── */}
      {setActiveGcpTab && (
        <div
          className="rx-gcp-tabs-bar"
          role="tablist"
          aria-label={isEs ? 'Secciones de la prescripción' : 'Prescription sections'}
        >
          {gcpTabs.map((tab) => {
            const isActive = activeGcpTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveGcpTab(tab.id);
                }}
                className={`rx-gcp-tab-btn ${isActive ? 'is-active' : ''}`}
              >
                <TabIcon size={14} style={{ flexShrink: 0 }} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`rx-gcp-tab-badge ${isActive ? 'is-active' : ''}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
