"use client";

import React, { useState, useMemo } from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  BookOpen,
  Filter,
  Microscope,
  Zap,
  ShieldCheck
} from '@/lib/icons';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';
import EmptyState from '../ui/EmptyState';
import { triggerHaptic } from '@/utils/haptics';

export default function ClinicalWorksExplorer({
  works = [],
  title = 'Clinical Research & Evidence Dossiers',
  subtitle = 'Peer-reviewed clinical trials, mechanistic studies, and regulatory monographs',
  isEs = false,
  accentColor = '#0d9488'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedWorkId, setExpandedWorkId] = useState(null);

  const toggleExpand = (id) => {
    triggerHaptic('light');
    setExpandedWorkId(prev => (prev === id ? null : id));
  };

  const evidenceTypes = useMemo(() => {
    return [
      { id: 'all', label: isEs ? 'Todos los Trabajos' : 'All Works' },
      { id: 'rct', label: isEs ? 'Ensayos Clínicos (RCT)' : 'Clinical Trials (RCT)' },
      { id: 'mechanistic', label: isEs ? 'Mecanismos Celulares' : 'Cellular Mechanisms' },
      { id: 'systematic_review', label: isEs ? 'Revisiones Sistemáticas' : 'Systematic Reviews' },
      { id: 'monograph', label: isEs ? 'Monografías CPNP' : 'Regulatory Monographs' },
      { id: 'protocol', label: isEs ? 'Protocolos Clínicos' : 'Clinical Protocols' }
    ];
  }, [isEs]);

  const filteredWorks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return works.filter(w => {
      if (selectedType !== 'all' && w.evidenceType !== selectedType) return false;
      if (!q) return true;

      const haystack = (
        (w.title || '') + ' ' +
        (w.titleEs || '') + ' ' +
        (w.authors || '') + ' ' +
        (w.journal || '') + ' ' +
        (w.executiveSummary || '') + ' ' +
        (w.executiveSummaryEs || '') + ' ' +
        (w.keyFindings || []).join(' ') + ' ' +
        (w.relatedProducts || []).join(' ')
      ).toLowerCase();

      return haystack.includes(q);
    });
  }, [works, searchQuery, selectedType]);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '1.5rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      marginBottom: '2rem'
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: `${accentColor}18`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {title}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: accentColor,
                background: `${accentColor}12`,
                padding: '2px 8px',
                borderRadius: '6px',
                border: `1px solid ${accentColor}25`
              }}>
                {filteredWorks.length} {isEs ? 'Publicaciones' : 'Publications'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0' }}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 280px',
          maxWidth: '460px'
        }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEs ? 'Buscar por activo, autor, endpoint o patología...' : 'Search by active, author, endpoint, or trial...'}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              color: '#0f172a',
              outline: 'none',
              background: '#f8fafc'
            }}
          />
        </div>

        {/* Evidence Type Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {evidenceTypes.map((type) => {
            const isActive = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedType(type.id);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: isActive ? `1px solid ${accentColor}` : '1px solid #e2e8f0',
                  background: isActive ? `${accentColor}12` : '#ffffff',
                  color: isActive ? accentColor : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Works List (Google Cloud Master-Detail Pattern) ── */}
      {filteredWorks.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={isEs ? 'No se encontraron publicaciones' : 'No publications found'}
          subtitle={isEs ? 'Intenta modificar el término de búsqueda o quitar los filtros de evidencia.' : 'Try adjusting your search query or clearing evidence filters.'}
          action={{
            label: isEs ? 'Ver todos los trabajos' : 'View all works',
            onClick: () => { setSearchQuery(''); setSelectedType('all'); }
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredWorks.map((work) => {
            const isExpanded = expandedWorkId === work.id;
            const displayTitle = isEs && work.titleEs ? work.titleEs : work.title;
            const displaySummary = isEs && work.executiveSummaryEs ? work.executiveSummaryEs : work.executiveSummary;

            return (
              <div
                key={work.id}
                style={{
                  border: isExpanded ? `1.5px solid ${accentColor}` : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: isExpanded ? '#fafbfd' : '#ffffff',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isExpanded ? '0 4px 14px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {/* ── Row Header / Collapsed View ── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(work.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    {/* Badges Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: work.badgeColor || '#0d9488',
                        background: `${work.badgeColor || '#0d9488'}14`,
                        border: `1px solid ${work.badgeColor || '#0d9488'}30`,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {work.badgeLabel || work.evidenceLevel}
                      </span>

                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                        {work.journal} • {work.year}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: '0.98rem',
                      fontWeight: 750,
                      color: '#0f172a',
                      margin: '0 0 6px',
                      lineHeight: 1.4
                    }}>
                      {displayTitle}
                    </h3>

                    {/* Authors */}
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>
                      {work.authors}
                    </div>

                    {/* Key Endpoints Chips */}
                    {work.keyEndpoints && work.keyEndpoints.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {work.keyEndpoints.map((ep, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '0.72rem'
                            }}
                          >
                            <span style={{ fontWeight: 800, color: accentColor }}>{ep.stat}</span>
                            <span style={{ color: '#475569', fontWeight: 500 }}>{ep.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand Chevron */}
                  <div style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isExpanded ? `${accentColor}15` : '#f1f5f9',
                    color: isExpanded ? accentColor : '#64748b'
                  }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* ── Expanded Master-Detail Panel ── */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    padding: '1.25rem',
                    background: '#ffffff'
                  }}>
                    {/* Executive Summary */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#003666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '6px'
                      }}>
                        {isEs ? 'Resumen Clínico Ejecutivo' : 'Executive Clinical Summary'}
                      </div>
                      <p style={{
                        fontSize: '0.86rem',
                        lineHeight: 1.6,
                        color: '#334155',
                        margin: 0
                      }}>
                        {displaySummary}
                      </p>
                    </div>

                    {/* Methodology & Context */}
                    {work.methodology && (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginBottom: '1.25rem',
                        fontSize: '0.80rem',
                        color: '#475569',
                        lineHeight: 1.5
                      }}>
                        <strong style={{ color: '#0f172a' }}>{isEs ? 'Metodología: ' : 'Methodology: '}</strong>
                        {work.methodology}
                      </div>
                    )}

                    {/* Key Findings List */}
                    {work.keyFindings && work.keyFindings.length > 0 && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: '#003666',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '8px'
                        }}>
                          {isEs ? 'Conclusiones y Evidencia Demostrada' : 'Key Findings & Documented Outcomes'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {work.keyFindings.map((finding, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                              <CheckCircle2 size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Endpoints Detailed Cards */}
                    {work.keyEndpoints && work.keyEndpoints.length > 0 && work.keyEndpoints.some(e => e.context) && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: '#003666',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '8px'
                        }}>
                          {isEs ? 'Endpoints Primarios Detallados' : 'Detailed Primary Endpoints'}
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '10px'
                        }}>
                          {work.keyEndpoints.map((ep, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '10px 12px'
                              }}
                            >
                              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: accentColor, marginBottom: '2px' }}>
                                {ep.stat}
                              </div>
                              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                                {ep.label}
                              </div>
                              {ep.context && (
                                <div style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.35 }}>
                                  {ep.context}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Links Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {work.pdfDownloadUrl && (
                          <a
                            href={work.pdfDownloadUrl}
                            download={work.pdfFilename || 'Clinical-Monograph.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              background: '#003666',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <Download size={14} />
                            <span>{isEs ? 'Descargar Dossier PDF' : 'Download Monograph PDF'}</span>
                          </a>
                        )}

                        {work.pubmedUrl && (
                          <a
                            href={work.pubmedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              background: '#ffffff',
                              color: '#003666',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <ExternalLink size={14} />
                            <span>{isEs ? 'Ver en PubMed / DOI' : 'View on PubMed / DOI'}</span>
                          </a>
                        )}

                        {work.doi && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            DOI: {work.doi}
                          </span>
                        )}
                      </div>

                      {/* Related Products Indicators */}
                      {work.relatedProducts && work.relatedProducts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                            {isEs ? 'Activos Relacionados:' : 'Related Formulations:'}
                          </span>
                          {work.relatedProducts.map((pId) => (
                            <span
                              key={pId}
                              style={{
                                fontSize: '0.70rem',
                                color: '#003666',
                                background: '#eff6ff',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}
                            >
                              {pId.replace(/^colway-/, '').replace(/^teletest-/, '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
