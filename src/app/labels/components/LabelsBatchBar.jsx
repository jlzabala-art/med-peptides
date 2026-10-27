'use client';

import React from 'react';
import { Layers, X, CheckCircle, ShieldCheck } from '@/lib/icons';

export default function LabelsBatchBar({
  patientQueue,
  activeQueueIndex,
  totalBatchLabelsCount,
  onSwitchActivePatient,
  onRemoveFromQueue,
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
              <span className={`pls-batch-pill-badge ${labelsCount > 1 ? 'multi' : 'single'}`}>
                {partInfo}
              </span>

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
