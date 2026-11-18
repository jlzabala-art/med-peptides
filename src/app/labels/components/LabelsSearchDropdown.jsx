'use client';

import React from 'react';
import { Search, Check, Plus, X, Upload, ExternalLink } from '@/lib/icons';

export default function LabelsSearchDropdown({
  searchQuery,
  isSearching,
  searchResults,
  recentPrescriptions,
  featuredPatients,
  patientQueue,
  onSelectPatient,
  onClearRecent,
  onOpenImport,
  formatResultDate,
  isEs,
  highlightedIndex = -1
}) {
  const [refillsOnly, setRefillsOnly] = React.useState(false);

  const rawItems = searchQuery.trim()
    ? searchResults
    : (searchResults && searchResults.length > 0 ? searchResults : (recentPrescriptions.length > 0 ? recentPrescriptions : featuredPatients));

  // Group search results by Patient to prevent duplicate patient entries
  const groupedPatients = React.useMemo(() => {
    const groupsMap = new Map();
    const seenCodes = new Set();

    (rawItems || []).forEach(item => {
      if (refillsOnly) {
        const codeStr = String(item.code || '');
        const isRefill = Number(item.refillCycle || 1) > 1 || /-R\d+$/i.test(codeStr) || Boolean(item.refillOf);
        if (!isRefill) return;
      }

      const pName = String(item.patientName || item.name || 'Patient').trim();
      const normName = pName.toLowerCase().replace(/\s+/g, ' ');
      const codeKey = String(item.code || item.id || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      // Avoid adding duplicate code for the same patient
      if (codeKey && seenCodes.has(`${normName}::${codeKey}`)) return;
      if (codeKey) seenCodes.add(`${normName}::${codeKey}`);

      if (!groupsMap.has(normName)) {
        groupsMap.set(normName, {
          patientName: pName,
          prescriptions: []
        });
      }

      const group = groupsMap.get(normName);
      const dateStr = formatResultDate ? formatResultDate(item.date) : (item.date || '');
      const isInBatch = patientQueue.some(p => String(p.code) === String(item.code));

      group.prescriptions.push({
        code: item.code,
        id: item.id,
        title: item.title || item.treatmentTitle || 'Compounded Pharmaceutical Protocol',
        dateStr,
        partsCount: item.partsCount || 1,
        a4PrintCount: item.a4PrintCount || 0,
        status: item.status || 'approved',
        isInBatch,
        rawItem: item
      });
    });

    return Array.from(groupsMap.values());
  }, [rawItems, refillsOnly, patientQueue, formatResultDate]);

  const totalPrescriptions = React.useMemo(() => {
    return groupedPatients.reduce((acc, g) => acc + g.prescriptions.length, 0);
  }, [groupedPatients]);

  return (
    <div className="pls-search-dropdown" role="listbox" id="pls-search-results-listbox">
      {/* Accessible live status for screen readers (P2 Item #10) */}
      <div aria-live="polite" className="sr-only">
        {searchQuery.trim()
          ? (isSearching
              ? (isEs ? 'Buscando...' : 'Searching...')
              : `${searchResults.length} ${isEs ? 'resultados encontrados' : 'results found'}`)
          : ''}
      </div>

      <div className="pls-search-dropdown-header">
        <span className="pls-search-dropdown-title">
          {searchQuery
            ? (isEs ? 'Resultados de Búsqueda (Selecciona o añade al lote)' : 'Search Matches (Select or Add to Batch)')
            : (searchResults && searchResults.length > 0
                ? (isEs ? '📅 Prescripciones Recientes (Ordenadas por Carga)' : '📅 Recent Prescriptions (Ordered by Upload)')
                : (recentPrescriptions.length > 0
                    ? (isEs ? '🕒 Últimos 5 consultados' : '🕒 Recently Consulted (Last 5)')
                    : (isEs ? 'Prescripciones Destacadas' : 'Featured Prescriptions')))}
        </span>
        <button
          type="button"
          onClick={() => setRefillsOnly((v) => !v)}
          style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            border: refillsOnly ? '1px solid #10b981' : '1px solid #cbd5e1',
            background: refillsOnly ? '#ecfdf5' : '#ffffff',
            color: refillsOnly ? '#047857' : '#64748b',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isEs ? 'Solo Refills (-R)' : 'Refills Only (-R)'}
        </button>
        {searchQuery ? (
          isSearching ? (
            <span style={{ fontSize: '0.68rem', color: '#1a73e8' }}>Searching...</span>
          ) : (
            <span style={{ fontSize: '0.68rem', color: '#5f6368' }}>
              {groupedPatients.length} {groupedPatients.length === 1 ? (isEs ? 'paciente' : 'patient') : (isEs ? 'pacientes' : 'patients')} · {totalPrescriptions} Rx
            </span>
          )
        ) : (
          recentPrescriptions.length > 0 && (
            <button
              type="button"
              onClick={onClearRecent}
              className="pls-search-clear-btn"
            >
              {isEs ? 'Borrar Historial' : 'Clear History'}
            </button>
          )
        )}
      </div>

      {/* Items List - Grouped by Patient */}
      {groupedPatients.length === 0 && !isSearching ? (
        <div className="pls-search-empty-state" style={{ padding: '24px 18px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', margin: '8px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
            {isEs ? 'Paciente o prescripción no encontrados' : 'Patient or prescription not found'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, maxWidth: '380px', margin: '0 auto 14px' }}>
            {isEs
              ? 'Para diseñar y generar las etiquetas, es necesario cargar primero la prescripción del paciente (PDF o escaneo). El sistema extraerá automáticamente sus fórmulas.'
              : 'To design and generate labels, please import the patient prescription first (PDF or scan). The system will automatically extract and match their formulas.'}
          </div>
          {onOpenImport && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenImport();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#ffffff',
                background: '#1a73e8',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(26,115,232,0.3)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1557b0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1a73e8'}
            >
              <Upload size={14} />
              <span>{isEs ? 'Cargar Prescripción Primero' : 'Import Prescription First (PDF / Scan)'}</span>
            </button>
          )}
        </div>
      ) : (
        groupedPatients.map((group, groupIdx) => {
          return (
            <div
              key={`patient-group-${group.patientName}-${groupIdx}`}
              className="pls-patient-group-card"
              style={{
                borderBottom: '1px solid #e2e8f0',
                padding: '8px 12px',
                background: '#ffffff'
              }}
            >
              {/* Patient Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>
                    {group.patientName}
                  </span>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                    {group.prescriptions.length} {group.prescriptions.length === 1 ? (isEs ? 'Prescripción' : 'Prescription') : (isEs ? 'Prescripciones' : 'Prescriptions')}
                  </span>
                </div>
              </div>

              {/* Sub-list of Prescriptions for this Patient */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {group.prescriptions.map((rx, rxIdx) => {
                  const isInBatch = rx.isInBatch;
                  return (
                    <div
                      key={`rx-${rx.code}-${rxIdx}`}
                      className="pls-search-item"
                      style={{
                        padding: '6px 10px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #edf2f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                      role="option"
                      onClick={() => onSelectPatient(rx.code, true)}
                    >
                      <div className="pls-search-item-info" style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#1e293b' }}>
                            #{rx.code}
                          </span>
                          {isInBatch && (
                            <span className="pls-batch-tag in-batch" style={{ fontSize: '0.65rem' }}>
                              {isEs ? '✓ En Lote' : '✓ In Batch'}
                            </span>
                          )}
                          {rx.dateStr && (
                            <span className="pls-search-item-date" style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              📅 {rx.dateStr}
                            </span>
                          )}
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            color: '#0369a1',
                            background: '#e0f2fe',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            📦 {rx.partsCount} {rx.partsCount === 1 ? (isEs ? 'Parte' : 'Part') : (isEs ? 'Partes' : 'Parts')}
                          </span>
                          {rx.a4PrintCount > 0 && (
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: '#137333',
                              background: '#e6f4ea',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              🖨️ A4 ({rx.a4PrintCount}×)
                            </span>
                          )}
                        </div>
                        <div className="pls-search-item-desc" style={{ fontSize: '0.71rem', color: '#475569', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rx.title}
                        </div>
                      </div>

                      <div className="pls-search-item-action-wrap" style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(rx.code, true);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: '#1a73e8',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {isEs ? 'Cargar' : 'Load'}
                        </button>
                        <a
                          href={`/rx/${encodeURIComponent(rx.code)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={isEs ? `Abrir ficha de prescripción #${rx.code}` : `Open prescription dossier #${rx.code}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            background: '#ffffff',
                            color: '#1a73e8',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <span>Rx</span>
                          <ExternalLink size={9} />
                        </a>
                        <button
                          type="button"
                          className={`pls-search-btn-add-batch ${isInBatch ? 'in-batch' : ''}`}
                          style={{ padding: '3px 7px', fontSize: '0.68rem' }}
                          title={isInBatch ? (isEs ? "Ya está en el lote" : "Already in batch") : (isEs ? "Añadir a la cola de lote" : "Add to batch queue")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(rx.code, false);
                          }}
                        >
                          {isInBatch ? (
                            <>
                              <Check size={11} color="#137333" />
                              <span>{isEs ? 'En Lote' : 'In Batch'}</span>
                            </>
                          ) : (
                            <>
                              <Plus size={11} />
                              <span>{isEs ? 'Lote' : 'Batch'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
