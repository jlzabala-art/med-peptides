'use client';

import React from 'react';
import { Search, Check, Plus, X, Upload } from '@/lib/icons';

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
  const itemsToRender = searchQuery.trim()
    ? searchResults
    : (recentPrescriptions.length > 0 ? recentPrescriptions : featuredPatients);

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
            ? (isEs ? 'Resultados de Algolia y Portal (Selecciona o añade al lote)' : 'Algolia & Portal Matches (Select or Add to Batch)')
            : (recentPrescriptions.length > 0
                ? (isEs ? '🕒 Últimos 5 consultados' : '🕒 Recently Consulted (Last 5)')
                : (isEs ? 'Prescripciones Destacadas' : 'Featured Prescriptions'))}
        </span>
        {searchQuery ? (
          isSearching ? (
            <span style={{ fontSize: '0.68rem', color: '#1a73e8' }}>Searching...</span>
          ) : (
            <span style={{ fontSize: '0.68rem', color: '#5f6368' }}>
              {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
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

      {/* Items List */}
      {itemsToRender.length === 0 && !isSearching ? (
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
        itemsToRender.map((item, index) => {
          const dateStr = formatResultDate(item.date);
          const isRecent = !searchQuery.trim() && recentPrescriptions.length > 0;
          const isInBatch = patientQueue.some(p => String(p.code) === String(item.code));
          const isHighlighted = highlightedIndex === index;

          return (
            <div
              key={`${item.code}-${item.id || item.timestamp || item.name || index}`}
              className={`pls-search-item ${isHighlighted ? 'highlighted' : ''}`}
              role="option"
              aria-selected={isHighlighted}
              onClick={() => onSelectPatient(item.code, true)}
            >
              <div className="pls-search-item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="pls-search-item-name">
                    {item.patientName || item.name || 'Patient'}
                  </span>
                  {isInBatch && (
                    <span className="pls-batch-tag in-batch">
                      {isEs ? '✓ En Lote' : '✓ In Batch'}
                    </span>
                  )}
                  {dateStr && (
                    <span className="pls-search-item-date" title={isEs ? 'Fecha de Prescripción' : 'Prescription Date'}>
                      📅 {dateStr}
                    </span>
                  )}
                  {isRecent && (
                    <span className="pls-batch-tag recent">
                      {isEs ? 'Reciente' : 'Recent'}
                    </span>
                  )}
                </div>
                <div className="pls-search-item-desc">
                  #{item.code} • {item.title || item.treatmentTitle || 'Compounded Pharmaceutical Protocol'}
                </div>
              </div>
              <div className="pls-search-item-action-wrap">
                <button
                  type="button"
                  className={`pls-search-btn-add-batch ${isInBatch ? 'in-batch' : ''}`}
                  title={isInBatch ? (isEs ? "Ya está en el lote" : "Already in batch") : (isEs ? "Añadir a la cola de lote" : "Add to batch queue")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPatient(item.code, false);
                  }}
                >
                  {isInBatch ? (
                    <>
                      <Check size={12} color="#137333" />
                      <span>{isEs ? 'En Lote' : 'In Batch'}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>{isEs ? 'Añadir' : 'Add'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
