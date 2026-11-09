'use client';

import React from 'react';
import { User, FileText, Stethoscope, Search, ExternalLink, Check, Copy, ShieldCheck, Clock, CheckCircle2, Edit3, Repeat } from '@/lib/icons';

export default function LabelsMetaStrip({
  isEs,
  patientName,
  cleanRxCode,
  rxCode,
  copyCodeSuccess,
  onCopyCode,
  doctorSlug,
  docName,
  labels,
  labelIndex,
  onSelectLabelPart,
  onQuickSearchPatient,
  onOpenRefillModal,
  rxStatus = 'approved',
  isApproving = false,
  onApprovePrescription = null,
  isCurrentLabeled = false,
  onToggleLabeled = null
}) {
  const normStatus = String(rxStatus || '').toLowerCase();
  const isApproved = ['approved', 'active', 'completed', 'delivered', 'dispensed'].includes(normStatus);

  return (
    <div className="pls-context-strip">
      <div className="pls-meta-row">
        {/* Patient Item (Hidden on mobile touch screens when active batch chip is visible - Rule #23) */}
        <div className="pls-meta-item pls-patient-meta-item">
          <span className="pls-meta-icon" style={{ background: '#f3e8fd', color: '#8430ce' }}>
            <User size={13} />
          </span>
          <div className="pls-meta-text">
            <span className="pls-meta-k">{isEs ? 'Paciente' : 'Patient'}:</span>
            <span className="pls-meta-v">{patientName}</span>
          </div>
          <button
            type="button"
            className="pls-meta-action-btn"
            onClick={onQuickSearchPatient}
            title={isEs ? `Buscar prescripciones de ${patientName}` : `Search prescriptions for ${patientName}`}
            aria-label={isEs ? 'Buscar paciente' : 'Search patient'}
          >
            <Search size={12} />
          </button>
        </div>

        <span className="pls-meta-divider" aria-hidden="true" />

        {/* Prescription Item */}
        <div className="pls-meta-item">
          <span className="pls-meta-icon" style={{ background: '#e8f0fe', color: '#1a73e8' }}>
            <FileText size={13} />
          </span>
          <div className="pls-meta-text">
            <span className="pls-meta-k">{isEs ? 'Prescripción' : 'Prescription'}:</span>
            <a
              href={`/rx/${encodeURIComponent(cleanRxCode)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pls-meta-v mono pls-meta-link"
              title={isEs ? `Abrir prescripción #${cleanRxCode}` : `Open prescription #${cleanRxCode}`}
            >
              #{cleanRxCode}
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          </div>
          <button
            type="button"
            className="pls-meta-action-btn"
            onClick={onCopyCode}
            title={isEs ? 'Copiar código de prescripción' : 'Copy prescription code'}
            aria-label={isEs ? 'Copiar código' : 'Copy code'}
            style={{ marginLeft: '4px' }}
          >
            {copyCodeSuccess ? <Check size={12} color="#137333" /> : <Copy size={12} />}
          </button>
        </div>

        <span className="pls-meta-divider" aria-hidden="true" />

        {/* Doctor Item */}
        <div className="pls-meta-item">
          <span className="pls-meta-icon" style={{ background: '#e6f4ea', color: '#137333' }}>
            <Stethoscope size={13} />
          </span>
          <div className="pls-meta-text">
            <span className="pls-meta-k">{isEs ? 'Médico' : 'Doctor'}:</span>
            <a
              href={`/dr/${encodeURIComponent(doctorSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pls-meta-v pls-meta-link"
              title={isEs ? `Ir al portal clínico de ${docName}` : `Go to doctor portal of ${docName}`}
            >
              {docName}
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          </div>
        </div>

        <span className="pls-meta-divider" aria-hidden="true" />

        {/* Clinical Approval Status & Quick Action (Reimi / Kasia Studio Empowerment) */}
        <div className="pls-meta-item pls-meta-status" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span className="pls-meta-icon" style={{
            background: isApproved ? '#e6f4ea' : '#fef3c7',
            color: isApproved ? '#137333' : '#b45309'
          }}>
            {isApproved ? <ShieldCheck size={13} /> : <Clock size={13} />}
          </span>
          <div className="pls-meta-text">
            <span className="pls-meta-k">{isEs ? 'Estado' : 'Status'}:</span>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 750,
              color: isApproved ? '#137333' : '#b45309',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isApproved
                ? (isEs ? 'Aprobada ✓' : 'Approved ✓')
                : (isEs ? 'Pendiente' : 'Pending')}
            </span>
          </div>

          {!isApproved && onApprovePrescription && (
            <button
              type="button"
              className="pls-meta-action-btn-approve"
              disabled={isApproving}
              onClick={onApprovePrescription}
              title={isEs ? 'Aprobar y autorizar prescripción para formulación y etiquetado' : 'Approve and authorize prescription for compounding and labels'}
              style={{
                marginLeft: '4px',
                height: '24px',
                padding: '0 8px',
                borderRadius: '4px',
                background: '#1a73e8',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.70rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: isApproving ? 'wait' : 'pointer',
                boxShadow: '0 1px 2px rgba(26,115,232,0.25)'
              }}
            >
              <CheckCircle2 size={11} />
              <span>{isApproving ? (isEs ? 'Aprobando...' : 'Approving...') : (isEs ? 'Aprobar Receta' : 'Approve Rx')}</span>
            </button>
          )}

          {/* Quality Checklist: Toggle Labeled & Verified Status */}
          {onToggleLabeled && (
            <button
              type="button"
              onClick={onToggleLabeled}
              className={`pls-meta-btn-labeled ${isCurrentLabeled ? 'is-labeled' : ''}`}
              title={isEs ? 'Marcar o desmarcar este frasco como etiquetado / verificado (Atajo: L)' : 'Toggle bottle labeled / verified status (Hotkey: L)'}
            >
              <span>{isCurrentLabeled ? '✓' : '○'}</span>
              <span>{isCurrentLabeled ? (isEs ? 'Etiquetado ✓' : 'Labeled ✓') : (isEs ? 'Marcar Etiquetado' : 'Mark Labeled')}</span>
            </button>
          )}

          {/* ── Google Cloud Console Master Resource Operations Toolbar (Rule #9 & #26) ── */}
          <div className="pls-meta-primary-ops" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
            <span style={{ height: '16px', width: '1px', background: '#cbd5e1', display: 'inline-block', margin: '0 2px' }} />

            {/* 1. Edit Current Prescription */}
            <a
              href={`/rx/${encodeURIComponent(cleanRxCode)}?edit=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="pls-gcp-btn-edit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '24px',
                padding: '0 9px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#1a73e8',
                fontWeight: 750,
                fontSize: '0.71rem',
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                transition: 'all 0.15s ease'
              }}
              title={isEs ? `Modificar fórmula, instrucciones o notas de la prescripción actual #${cleanRxCode}` : `Modify formula, posology or instructions for #${cleanRxCode}`}
            >
              <Edit3 size={11} color="#1a73e8" />
              <span>{isEs ? 'Editar Prescripción' : 'Edit Rx'}</span>
            </a>

            {/* 2. Issue Refill / Duplicate Cycle (Preset to active part if multi-part) */}
            {onOpenRefillModal && (
              <button
                type="button"
                onClick={() => onOpenRefillModal(labelIndex)}
                className="pls-gcp-btn-refill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  height: '24px',
                  padding: '0 9px',
                  borderRadius: '4px',
                  background: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: '0.71rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(16,185,129,0.15)',
                  transition: 'all 0.15s ease'
                }}
                title={isEs
                  ? `Renovar ciclo de tratamiento / Duplicar prescripción (Prefijada en Parte ${labelIndex + 1})`
                  : `Issue new refill / Renew treatment cycle (Preset to Part ${labelIndex + 1})`}
              >
                <Repeat size={11} color="#059669" />
                <span>{isEs ? 'Renovar / Refill' : 'Issue Refill'}</span>
                {labels.length > 1 && (
                  <span style={{
                    background: '#d1fae5',
                    color: '#047857',
                    fontSize: '0.62rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}>
                    P{labelIndex + 1}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Formula Parts Switcher (Part 1 / Part 2) with Clean GCP Segmented Layout */}
        {labels.length > 1 && (
          <>
            <span className="pls-meta-divider pls-desktop-only" aria-hidden="true" />
            <div className="pls-meta-item pls-meta-parts" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'stretch' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                {isEs ? 'Parte de Formulación a Dispensar:' : 'Compounding Formula Part:'}
              </div>
              <div className="pls-parts-tabs" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(labels.length, 2)}, 1fr)`, gap: '6px', width: '100%' }}>
                {labels.map((lbl, idx) => {
                  const isActive = labelIndex === idx;
                  const rawTitle = lbl.productTitle || lbl.productName || (lbl.formula ? lbl.formula.slice(0, 24) : `Part ${idx + 1}`);
                  const cleanTitle = rawTitle.replace(/^Part\s*\d+\s*:\s*/i, '').trim();
                  const volTag = lbl.volume ? ` (${lbl.volume})` : '';
                  const labelText = `Parte ${idx + 1}: ${cleanTitle}${volTag}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`pls-part-btn ${isActive ? 'active' : ''}`}
                      style={{
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '0.76rem',
                        padding: '6px 10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        borderRadius: '6px',
                        border: isActive ? '1.5px solid #1a73e8' : '1px solid #dadce0',
                        background: isActive ? '#e8f0fe' : '#ffffff',
                        color: isActive ? '#1a73e8' : '#3c4043',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => onSelectLabelPart(idx)}
                    >
                      {isActive && <span style={{ color: '#1a73e8', fontWeight: 900 }}>✔</span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Bench Laboratory Hotkeys Tip (Reimi & Kasia Quick Guide) - Desktop only (Rule #23) */}
        <div className="pls-desktop-only" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.67rem', color: '#64748b' }}>
          <span style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, color: '#334155' }}>⌨️ A</span>
          <span>{isEs ? 'Aprobar' : 'Approve'}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, color: '#334155' }}>L</span>
          <span>{isEs ? 'Etiquetar' : 'Label'}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, color: '#334155' }}>1-4</span>
          <span>{isEs ? 'Variante' : 'Variant'}</span>
        </div>
      </div>
    </div>
  );
}
