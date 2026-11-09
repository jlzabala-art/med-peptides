'use client';

import React from 'react';
import { Layers, X, CheckCircle, ShieldCheck } from '@/lib/icons';

export default function LabelsBatchBar({
  patientQueue,
  activeQueueIndex,
  activeLabelIndex = 0,
  totalBatchLabelsCount,
  onSwitchActivePatient,
  onRemoveFromQueue,
  onUpdatePatientQueueItem = null,
  onBatchApprove,
  isBatchApproving = false,
  totalLabeledCount = 0,
  isPatientFullyLabeled = null,
  isEs
}) {
  const pendingApprovalCount = patientQueue.filter(p => {
    const st = p.rx?.status || p.rx?.state;
    return st !== 'approved' && !p.rx?.isSigned;
  }).length;

  return (
    <section className="pls-batch-bar" aria-label="Patient Batch Queue">
      <div className="pls-batch-info-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Layers size={16} color="#1a73e8" />
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
            {isEs ? 'Lote de Pacientes:' : 'Patient Batch:'}
          </span>
          <span className="pls-batch-count-badge">
            {patientQueue.length} {patientQueue.length === 1 ? (isEs ? 'paciente' : 'patient') : (isEs ? 'pacientes' : 'patients')} · {totalBatchLabelsCount} {totalBatchLabelsCount === 1 ? (isEs ? 'etiqueta' : 'label') : (isEs ? 'etiquetas' : 'labels')}
          </span>

          {/* Quality Checklist: Count of labeled bottles in queue */}
          <span className="pls-batch-labeled-counter" title={isEs ? 'Progreso de frascos etiquetados y verificados' : 'Progress of labeled & verified bottles'}>
            <CheckCircle size={12} />
            <span>{isEs ? 'Etiquetados:' : 'Labeled:'} {totalLabeledCount}/{totalBatchLabelsCount}</span>
            {totalLabeledCount > 0 && totalLabeledCount === totalBatchLabelsCount && (
              <span style={{ fontWeight: 900, color: '#16a34a' }}>✓</span>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'nowrap' }}>

          {/* 1-Click Batch Approval for all pending prescriptions in queue (Reimi / Kasia Studio) */}
          {pendingApprovalCount > 0 && onBatchApprove && (
            <button
              type="button"
              onClick={onBatchApprove}
              disabled={isBatchApproving}
              className="pls-batch-approve-btn"
              title={isEs ? 'Aprobar y firmar todas las recetas pendientes del lote' : 'Batch approve and sign all pending prescriptions'}
            >
              <ShieldCheck size={13} />
              <span>
                {isBatchApproving
                  ? (isEs ? 'Aprobando lote...' : 'Authorizing...')
                  : (isEs ? `✔ Aprobar ${pendingApprovalCount} pendientes` : `✔ Authorize ${pendingApprovalCount} pending`)}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Fluid multiline list of patient cards */}
      <div className="pls-batch-scroll">
        {patientQueue.map((pItem, qIdx) => {
          const isActive = activeQueueIndex === qIdx;
          const pName = pItem.rx?.patient?.name || pItem.rx?.patientName || 'Patient';
          const labelsCount = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1;
          const partInfo = (pItem.selectedPartIndex === 'all' || pItem.selectedPartIndex == null)
            ? (isEs ? `${labelsCount} ${labelsCount === 1 ? 'parte' : 'partes'}` : `${labelsCount} ${labelsCount === 1 ? 'part' : 'parts'}`)
            : (isEs ? `Parte ${Number(pItem.selectedPartIndex) + 1}/${labelsCount}` : `Part ${Number(pItem.selectedPartIndex) + 1}/${labelsCount}`);
          
          const isFullyLabeled = typeof isPatientFullyLabeled === 'function' ? isPatientFullyLabeled(pItem) : false;

          return (
            <div
              key={`queue-${pItem.code}-${qIdx}`}
              className={`pls-batch-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSwitchActivePatient(qIdx)}
              title={isEs ? `Activar prescripción #${pItem.code} (${pName})` : `Activate prescription #${pItem.code} (${pName})`}
            >
              {isFullyLabeled && (
                <span className="pls-batch-pill-check" title={isEs ? 'Todos los frascos etiquetados y listos' : 'All bottles labeled and ready'}>
                  ✓
                </span>
              )}
              <span className="pls-batch-pill-name">{pName}</span>

              {/* Quick Part Switcher for Multi-Part Prescriptions */}
              {labelsCount > 1 && typeof onUpdatePatientQueueItem === 'function' ? (
                <div
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '2px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onUpdatePatientQueueItem === 'function') {
                        onUpdatePatientQueueItem(qIdx, { selectedPartIndex: 'all' });
                      }
                      if (typeof onSwitchActivePatient === 'function') {
                        onSwitchActivePatient(qIdx, 0);
                      }
                    }}
                    style={{
                      border: 'none',
                      background: (pItem.selectedPartIndex === 'all' || pItem.selectedPartIndex == null) ? '#003666' : '#e2e8f0',
                      color: (pItem.selectedPartIndex === 'all' || pItem.selectedPartIndex == null) ? '#ffffff' : '#475569',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title={isEs ? 'Ver e imprimir todas las partes' : 'View & print all parts'}
                  >
                    {isEs ? 'Todas' : 'All'}
                  </button>
                  {pItem.labels.map((_, pIdx) => {
                    const isPartActive = isActive
                      ? (activeLabelIndex === pIdx)
                      : (pItem.selectedPartIndex === pIdx);
                    return (
                      <button
                        key={`part-btn-${pIdx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onUpdatePatientQueueItem === 'function') {
                            onUpdatePatientQueueItem(qIdx, { selectedPartIndex: pIdx });
                          }
                          if (typeof onSwitchActivePatient === 'function') {
                            onSwitchActivePatient(qIdx, pIdx);
                          }
                        }}
                        style={{
                          border: 'none',
                          background: isPartActive ? '#003666' : '#e2e8f0',
                          color: isPartActive ? '#ffffff' : '#475569',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title={isEs ? `Activar e ir a Parte ${pIdx + 1}` : `Activate & jump to Part ${pIdx + 1}`}
                      >
                        {pIdx + 1}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className={`pls-batch-pill-badge ${labelsCount > 1 ? 'multi' : 'single'}`}>
                  {partInfo}
                </span>
              )}

              {/* Remove button (always enabled, even for single patient) */}
              <button
                type="button"
                className="pls-batch-pill-remove"
                title={isEs ? `Quitar a ${pName} del lote` : `Remove ${pName} from batch`}
                onClick={(e) => onRemoveFromQueue(qIdx, e)}
                aria-label="Remove patient"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
