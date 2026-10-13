'use client';

import React from 'react';
import { Layers, X } from '@/lib/icons';

export default function LabelsBatchBar({
  patientQueue,
  activeQueueIndex,
  totalBatchLabelsCount,
  onSwitchActivePatient,
  onRemoveFromQueue,
  isEs
}) {
  return (
    <section className="pls-batch-bar" aria-label="Patient Batch Queue">
      <div className="pls-batch-info-label">
        <Layers size={16} color="#1a73e8" />
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
          {isEs ? 'Lote de Pacientes:' : 'Patient Batch:'}
        </span>
        <span className="pls-batch-count-badge">
          {patientQueue.length} {patientQueue.length === 1 ? (isEs ? 'paciente' : 'patient') : (isEs ? 'pacientes' : 'patients')} · {totalBatchLabelsCount} {totalBatchLabelsCount === 1 ? (isEs ? 'etiqueta' : 'label') : (isEs ? 'etiquetas' : 'labels')}
        </span>
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

          return (
            <div
              key={`queue-${pItem.code}-${qIdx}`}
              className={`pls-batch-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSwitchActivePatient(qIdx)}
              title={isEs ? `Activar prescripción #${pItem.code} (${pName})` : `Activate prescription #${pItem.code} (${pName})`}
            >
              <span className="pls-batch-pill-name">{pName}</span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: labelsCount > 1 ? '#fef3c7' : '#f1f5f9',
                color: labelsCount > 1 ? '#92400e' : '#475569',
                padding: '2px 7px',
                borderRadius: '4px',
                border: labelsCount > 1 ? '1px solid #fde68a' : '1px solid #cbd5e1',
                whiteSpace: 'nowrap'
              }}>
                {partInfo}
              </span>

              {/* Remove button if more than 1 patient */}
              {patientQueue.length > 1 && (
                <button
                  type="button"
                  className="pls-batch-pill-remove"
                  title={isEs ? `Quitar a ${pName} del lote` : `Remove ${pName} from batch`}
                  onClick={(e) => onRemoveFromQueue(qIdx, e)}
                  aria-label="Remove patient"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
