'use client';

import React from 'react';
import Link from 'next/link';
import { Search, X, Printer, Upload, Share2, Check } from '@/lib/icons';

export default function LabelsHeader({
  searchBoxRef,
  searchInputRef,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  isEs,
  lang,
  setLang,
  isGeneratingBatchPdf,
  batchPdfProgress,
  patientQueue,
  onDownloadA4BatchPdf,
  onOpenImport,
  onShare,
  copiedShareLink,
  onKeyDownSearch,
  children
}) {
  const totalLabelsInBatch = patientQueue.reduce((acc, pItem) => {
    const count = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
      ? 1
      : (Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1);
    return acc + count;
  }, 0);

  const progressPercent = batchPdfProgress && batchPdfProgress.total > 0
    ? Math.min(100, Math.round((batchPdfProgress.current / batchPdfProgress.total) * 100))
    : 0;

  return (
    <>
      {/* Non-Blocking Top Progress Bar for Batch Rendering (Rule #25 / Item #7) */}
      {isGeneratingBatchPdf && (
        <div
          className="pls-progress-bar"
          style={{ width: `${progressPercent || 30}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      )}

      <header className="pls-header">
        {/* Brand */}
        <Link href="/labels" className="pls-brand-link">
          <div className="pls-brand-icon">
            <span>℞</span>
          </div>
          <div className="pls-brand-text">
            <span className="pls-brand-title">Compounding Label Studio</span>
            <span className="pls-brand-subtitle">Pharmapolis • Atlas Health</span>
          </div>
        </Link>

        {/* Instant Search Container */}
        <div className="pls-search-container" ref={searchBoxRef}>
          <div className="pls-search-input-wrap">
            <Search size={15} color="#5f6368" />
            <input
              ref={searchInputRef}
              type="text"
              className="pls-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onKeyDownSearch}
              aria-autocomplete="list"
              aria-expanded={searchOpen}
              aria-controls="pls-search-results-listbox"
              placeholder={isEs
                ? "Buscar paciente o nº historia (Selección múltiple: puedes añadir varios)... (⌘K)"
                : "Search patient or file # (Multi-selection: add multiple to batch)... (⌘K)"}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pls-search-clear-query"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <span className="pls-search-badge" title={isEs ? "Selección múltiple disponible" : "Multi-selection enabled"}>
              ⌘K • {isEs ? 'Múltiple' : 'Multi'}
            </span>
          </div>

          {/* Search Dropdown Slot */}
          {searchOpen && children}
        </div>

        {/* Action Buttons: Print Batch A4, Import, Share, Language */}
        <div className="pls-actions-wrap">
          {/* Global Action: Print All Patients in A4 PDF Sheet */}
          <button
            type="button"
            className="pls-btn-print-batch"
            onClick={onDownloadA4BatchPdf}
            disabled={isGeneratingBatchPdf || patientQueue.length === 0}
            title={isEs ? 'Imprimir todas las etiquetas del lote en un folio A4 en formato PDF' : 'Print all queued labels onto an A4 PDF sheet'}
            aria-label={isEs ? 'Imprimir Lote en A4 (PDF)' : 'Print Batch in A4 (PDF)'}
          >
            <Printer size={14} />
            <span className="pls-btn-print-label">
              {isGeneratingBatchPdf
                ? (batchPdfProgress
                    ? `${isEs ? 'Rasterizando' : 'Rendering'} ${batchPdfProgress.current}/${batchPdfProgress.total}...`
                    : (isEs ? 'Generando...' : 'Generating...'))
                : (isEs ? 'Imprimir Lote A4' : 'Print Batch A4')}
            </span>
            <span className="pls-btn-batch-count">
              {totalLabelsInBatch}
            </span>
          </button>

          {/* Import Data (Rx & Lab Results) */}
          <button
            type="button"
            id="pls-import-rx-btn"
            className="pls-btn-import"
            onClick={onOpenImport}
            title={isEs ? 'Importar datos (Rx y Analíticas Lab)' : 'Import Data (Rx & Lab Results)'}
            aria-label={isEs ? 'Importar datos' : 'Import Data'}
          >
            <Upload size={14} />
            <span className="pls-btn-label">{isEs ? 'Importar Datos' : 'Import Data'}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="pls-btn-share"
            onClick={onShare}
            style={{
              borderColor: copiedShareLink ? '#ceead6' : '#dadce0',
              background: copiedShareLink ? '#e6f4ea' : '#ffffff',
              color: copiedShareLink ? '#137333' : '#3c4043'
            }}
            title={isEs ? 'Compartir enlace público del estudio' : 'Share public studio link'}
          >
            {copiedShareLink ? <Check size={14} color="#137333" /> : <Share2 size={14} />}
            <span>{copiedShareLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Compartir' : 'Share')}</span>
          </button>

          {/* Language Switcher */}
          <div className="pls-lang-toggle" role="group" aria-label="Language selection">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`pls-lang-btn ${!isEs ? 'active' : 'inactive'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`pls-lang-btn ${isEs ? 'active' : 'inactive'}`}
            >
              ES
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
