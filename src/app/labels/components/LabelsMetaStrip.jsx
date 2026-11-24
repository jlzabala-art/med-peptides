'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, FileText, Stethoscope, Search, ExternalLink, Check, Copy, ShieldCheck, Clock, CheckCircle2, Edit3, Repeat } from '@/lib/icons';
import { Trash2, RotateCcw, X, ChevronDown, QrCode } from 'lucide-react';
import { getLabelDisplayTitle } from '@/utils/labels/labelContract';
import RxQuickViewDrawer from '@/components/shared/RxQuickViewDrawer';

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
  onToggleLabeled = null,
  onRemoveLabelPart = null,
  removingPartIndex = null,
  removedParts = [],
  onRestoreRemovedPart = null,
  refillCycle = 1,
  refillAlertDate = '',
  refillAlertStatus = '',
  onSwitchPrescriptionCode = null,
  canApproveRx = true,
  canEditRxParts = true,
  isPartLabeledFn = null,
  hidePrescriptionMeta = false,
}) {
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState(null);
  const [removeReason, setRemoveReason] = useState('');
  const [showPatientRxMenu, setShowPatientRxMenu] = useState(false);
  const [quickDrawerCode, setQuickDrawerCode] = useState('');
  const [patientRxList, setPatientRxList] = useState([]);
  const [loadingPatientRx, setLoadingPatientRx] = useState(false);
  const patientMenuRef = useRef(null);
  const normStatus = String(rxStatus || '').toLowerCase();
  const isApproved = ['approved', 'active', 'completed', 'delivered', 'dispensed'].includes(normStatus);

  useEffect(() => {
    setShowPatientRxMenu(false);
    setPatientRxList([]);
  }, [patientName, cleanRxCode]);

  useEffect(() => {
    if (!showPatientRxMenu) return;
    const handleOutside = (e) => {
      if (patientMenuRef.current && !patientMenuRef.current.contains(e.target)) {
        setShowPatientRxMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showPatientRxMenu]);

  const handleTogglePatientRxMenu = async () => {
    const nextOpen = !showPatientRxMenu;
    setShowPatientRxMenu(nextOpen);
    if (nextOpen && patientName && patientRxList.length === 0) {
      setLoadingPatientRx(true);
      try {
        const res = await fetch(`/api/labels/search?q=${encodeURIComponent(patientName)}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data?.results)) {
          setPatientRxList(data.results);
        }
      } catch {
        // non-fatal
      } finally {
        setLoadingPatientRx(false);
      }
    }
  };

  return (
    <div className="pls-context-strip">
      <div className="pls-meta-row">
        {/* Patient Item + Same-Patient Prescriptions Switcher */}
        <div className="pls-meta-item pls-patient-meta-item" ref={patientMenuRef} style={{ position: 'relative' }}>
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
            onClick={handleTogglePatientRxMenu}
            title={isEs ? `Ver todas las prescripciones de ${patientName}` : `View all prescriptions for ${patientName}`}
            aria-label={isEs ? 'Prescripciones del paciente' : 'Patient prescriptions'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
              width: 'auto',
              fontSize: '0.67rem',
              fontWeight: 700,
              color: '#6b21a8',
              background: '#f3e8fd',
              borderRadius: '4px'
            }}
          >
            <span>{isEs ? 'Sus Rx' : 'All Rx'}</span>
            <ChevronDown size={11} />
          </button>
          <button
            type="button"
            className="pls-meta-action-btn"
            onClick={onQuickSearchPatient}
            title={isEs ? `Buscar ${patientName} en el buscador global` : `Search ${patientName} in global search`}
            aria-label={isEs ? 'Buscar paciente' : 'Search patient'}
          >
            <Search size={12} />
          </button>

          {showPatientRxMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 80,
                width: '320px',
                maxWidth: '90vw',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: '0 14px 30px rgba(15, 23, 42, 0.16)',
                overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '8px 12px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#475569',
                textTransform: 'uppercase'
              }}>
                {isEs ? `Prescripciones de ${patientName}` : `Prescriptions for ${patientName}`}
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {loadingPatientRx ? (
                  <div style={{ padding: '12px', fontSize: '0.76rem', color: '#64748b' }}>
                    {isEs ? 'Buscando prescripciones...' : 'Loading prescriptions...'}
                  </div>
                ) : patientRxList.length === 0 ? (
                  <div style={{ padding: '12px', fontSize: '0.76rem', color: '#64748b' }}>
                    {isEs ? 'No se encontraron otras prescripciones.' : 'No other prescriptions found.'}
                  </div>
                ) : (
                  patientRxList.map((rxItem) => {
                    const itemCode = String(rxItem.code || rxItem.id || '').replace(/^#/, '');
                    const isSame = itemCode.toUpperCase() === String(cleanRxCode || '').toUpperCase();
                    return (
                      <div
                        key={itemCode}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #f1f5f9',
                          background: isSame ? '#eff6ff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                              #{itemCode} {isSame ? (isEs ? '(Actual)' : '(Current)') : ''}
                            </span>
                            {rxItem.date && (
                              <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                                📅 {rxItem.date}
                              </span>
                            )}
                            {rxItem.partsCount > 0 && (
                              <span style={{
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                color: '#0369a1',
                                background: '#e0f2fe',
                                padding: '1px 5px',
                                borderRadius: '4px'
                              }}>
                                📦 {rxItem.partsCount} {rxItem.partsCount === 1 ? (isEs ? 'Parte' : 'Part') : (isEs ? 'Partes' : 'Parts')}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            {rxItem.title || rxItem.treatmentTitle || 'Prescription'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          {!isSame && onSwitchPrescriptionCode && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowPatientRxMenu(false);
                                onSwitchPrescriptionCode(itemCode);
                              }}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '4px',
                                border: '1px solid #bfdbfe',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {isEs ? 'Cargar' : 'Load'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPatientRxMenu(false);
                              setQuickDrawerCode(itemCode);
                            }}
                            style={{
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#334155',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <span>Rx</span>
                            <FileText size={9} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {!hidePrescriptionMeta && (
          <>
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
          </>
        )}

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
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              {isApproved
                ? (isEs ? 'Aprobada ✓' : 'Approved ✓')
                : (isEs ? 'Pendiente' : 'Pending')}
            </span>
          </div>

          {!isApproved && canApproveRx && onApprovePrescription && (
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
          <div className="pls-meta-primary-ops" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '6px', whiteSpace: 'nowrap' }}>
            <span style={{ height: '16px', width: '1px', background: '#cbd5e1', display: 'inline-block', margin: '0 2px' }} />

            {/* 1. Open & Inspect Current Prescription In-App Drawer */}
            <button
              type="button"
              onClick={() => setQuickDrawerCode(cleanRxCode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 9px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.71rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                transition: 'all 0.15s ease'
              }}
              title={isEs ? `Vista rápida de prescripción #${cleanRxCode}` : `Quick-view prescription dossier #${cleanRxCode}`}
            >
              <span>{isEs ? 'Ver Rx' : 'View Rx'}</span>
              <FileText size={10} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-global-qr-modal'));
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 8px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.71rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
              title={isEs ? 'Compartir enlace / código QR de esta prescripción' : 'Share QR code / direct link for this prescription'}
            >
              <QrCode size={11} color="#003666" />
              <span>QR</span>
            </button>

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
                color: '#3c4043',
                fontWeight: 650,
                fontSize: '0.71rem',
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                transition: 'all 0.15s ease'
              }}
              title={isEs ? `Modificar fórmula, instrucciones o notas de la prescripción actual #${cleanRxCode}` : `Modify formula, posology or instructions for #${cleanRxCode}`}
            >
              <Edit3 size={11} color="#5f6368" />
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
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#3c4043',
                  fontWeight: 650,
                  fontSize: '0.71rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                  transition: 'all 0.15s ease'
                }}
                title={isEs
                  ? `Renovar ciclo de tratamiento / Duplicar prescripción (Prefijada en Parte ${labelIndex + 1})`
                  : `Issue new refill / Renew treatment cycle (Preset to Part ${labelIndex + 1})`}
              >
                <Repeat size={11} color="#5f6368" />
                <span>{isEs ? 'Renovar / Refill' : 'Issue Refill'}</span>
                {Number(refillCycle) > 1 && (
                  <span style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}>
                    R{refillCycle}
                  </span>
                )}
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
                {refillAlertDate && (
                  <span className="pls-desktop-only" style={{ fontSize: '0.62rem', color: '#047857', fontWeight: 700 }}>
                    · {refillAlertStatus === 'paused' ? '⏸' : '📅'} {refillAlertDate}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Formula Parts Switcher (Part 1 / Part 2) + Partial Deletion & Restore */}
        {(labels.length > 1 || removedParts.length > 0) && (
          <>
            <span className="pls-meta-divider pls-desktop-only" aria-hidden="true" />
            <div className="pls-meta-item pls-meta-parts" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  {isEs ? 'Parte de Formulación a Dispensar:' : 'Compounding Formula Part:'}
                </div>
                {removedParts.length > 0 && onRestoreRemovedPart && (
                  <button
                    type="button"
                    onClick={() => onRestoreRemovedPart(0)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title={isEs ? `Restaurar "${removedParts[0]?.title || 'parte eliminada'}"` : `Restore "${removedParts[0]?.title || 'removed part'}"`}
                  >
                    <RotateCcw size={11} />
                    <span>
                      {isEs
                        ? `Restaurar omitida (${removedParts.length})`
                        : `Restore omitted (${removedParts.length})`}
                    </span>
                  </button>
                )}
              </div>

              {labels.length > 1 && (
                <div className="pls-parts-tabs" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(labels.length, 2)}, 1fr)`, gap: '6px', width: '100%' }}>
                  {labels.map((lbl, idx) => {
                    if (!lbl || typeof lbl !== 'object') return null;
                    const isActive = labelIndex === idx;
                    const rawTitle = getLabelDisplayTitle(lbl, idx);
                    const cleanTitle = String(rawTitle || '').replace(/^Part\s*\d+\s*:\s*/i, '').trim();
                    const volTag = lbl?.volume ? ` (${lbl.volume})` : '';
                    const labelText = `Parte ${idx + 1}: ${cleanTitle}${volTag}`;
                    const isRemovingThis = removingPartIndex === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                          border: isActive ? '1.5px solid #1a73e8' : '1px solid #dadce0',
                          background: isActive ? '#e8f0fe' : '#ffffff',
                          overflow: 'hidden',
                          minWidth: 0
                        }}
                      >
                        <button
                          type="button"
                          className={`pls-part-btn ${isActive ? 'active' : ''}`}
                          style={{
                            fontWeight: isActive ? 800 : 600,
                            fontSize: '0.76rem',
                            padding: '6px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            flex: 1,
                            minWidth: 0,
                            border: 'none',
                            background: 'transparent',
                            color: isActive ? '#1a73e8' : '#3c4043',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => onSelectLabelPart(idx)}
                        >
                          {isActive && <span style={{ color: '#1a73e8', fontWeight: 900, flexShrink: 0 }}>✔</span>}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelText}</span>
                          {isPartLabeledFn?.(idx) && (
                            <span
                              title={isEs ? 'Parte marcada como etiquetada' : 'Part marked as labeled'}
                              style={{
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                padding: '0 4px',
                                borderRadius: '4px',
                                background: '#dcfce7',
                                color: '#166534',
                                flexShrink: 0
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                        {canEditRxParts && onRemoveLabelPart && (
                          <button
                            type="button"
                            disabled={isRemovingThis}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmRemoveIdx(idx);
                              setRemoveReason('');
                            }}
                            title={isEs ? 'Eliminar esta parte de la prescripción' : 'Remove this part from prescription'}
                            aria-label={isEs ? `Eliminar Parte ${idx + 1}` : `Remove Part ${idx + 1}`}
                            style={{
                              width: '28px',
                              height: '100%',
                              minHeight: '30px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 'none',
                              borderLeft: isActive ? '1px solid rgba(26,115,232,0.2)' : '1px solid #e2e8f0',
                              background: 'transparent',
                              color: '#94a3b8',
                              cursor: isRemovingThis ? 'wait' : 'pointer',
                              flexShrink: 0
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline Non-Blocking Confirmation for Part Removal */}
              {confirmRemoveIdx !== null && labels[confirmRemoveIdx] && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  fontSize: '0.74rem'
                }}>
                  <div style={{ color: '#991b1b', fontWeight: 700, flex: '1 1 200px' }}>
                    {isEs
                      ? `¿Quitar Parte ${confirmRemoveIdx + 1} (${labels[confirmRemoveIdx]?.productTitle || 'fórmula'}) de esta prescripción?`
                      : `Remove Part ${confirmRemoveIdx + 1} (${labels[confirmRemoveIdx]?.productTitle || 'formula'}) from this prescription?`}
                  </div>
                  <input
                    type="text"
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value)}
                    placeholder={isEs ? 'Motivo (ej. Cliente no lo quiere)...' : 'Reason (e.g. Client opted out)...'}
                    style={{
                      flex: '1 1 180px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #fca5a5',
                      fontSize: '0.74rem',
                      background: '#ffffff'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmRemoveIdx(null);
                        setRemoveReason('');
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={11} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                      {isEs ? 'Cancelar' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      disabled={removingPartIndex !== null}
                      onClick={async () => {
                        const target = confirmRemoveIdx;
                        const reason = removeReason;
                        setConfirmRemoveIdx(null);
                        setRemoveReason('');
                        await onRemoveLabelPart(target, reason);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#dc2626',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        cursor: removingPartIndex !== null ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {removingPartIndex !== null
                        ? (isEs ? 'Eliminando...' : 'Removing...')
                        : (isEs ? 'Confirmar Eliminar' : 'Confirm Remove')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      <RxQuickViewDrawer
        isOpen={Boolean(quickDrawerCode)}
        rxCode={quickDrawerCode}
        isEs={isEs}
        onClose={() => setQuickDrawerCode('')}
      />
    </div>
  );
}
