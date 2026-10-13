'use client';

import React from 'react';
import { User, FileText, Stethoscope, Search, ExternalLink, Check, Copy } from '@/lib/icons';

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
  onQuickSearchPatient
}) {
  return (
    <div className="pls-context-strip">
      <div className="pls-meta-row">
        {/* Patient Item */}
        <div className="pls-meta-item">
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

        {/* Formula Parts Switcher (Part 1 / Part 2) with Full Explicit Titles */}
        {labels.length > 1 && (
          <>
            <span className="pls-meta-divider" aria-hidden="true" />
            <div className="pls-meta-item pls-meta-parts">
              <span className="pls-meta-k">{isEs ? 'Fórmula' : 'Formula'}:</span>
              <div className="pls-parts-tabs" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                        fontSize: '0.78rem',
                        padding: '4px 10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      onClick={() => onSelectLabelPart(idx)}
                    >
                      {isActive && <span style={{ color: '#16a34a', fontWeight: 900 }}>✔</span>}
                      <span>{labelText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
