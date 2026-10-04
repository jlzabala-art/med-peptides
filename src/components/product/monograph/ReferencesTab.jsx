"use client";

import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  FileText, 
  ChevronRight, 
  Search,
  CheckCircle2,
  ShieldCheck,
  FlaskConical
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import { getPeptideReferenceDossier } from '@/data/peptideReferenceDossiers';

export default function ReferencesTab({ product = {}, slug = 'tirzepatide' }) {
  const [activeRefCategory, setActiveRefCategory] = useState('regulatory'); // 'regulatory' | 'pharmacology' | 'literature' | 'safety'

  const activeData = getPeptideReferenceDossier(product?.slug || product?.canonicalName || product?.name || slug);

  return (
    <div className="pds-tab-content pds-references-tab">
      
      {/* ── Sub-navigation Filter Bar ── */}
      <div className="pds-ref-filter-bar">
        {[
          { id: 'regulatory', label: '1. Regulatory & Pharmacopoeia' },
          { id: 'pharmacology', label: '2. Receptor Pharmacology & MOA' },
          { id: 'literature', label: '3. Clinical Literature & PubMed' },
          { id: 'safety', label: '4. Contraindications & Precautions' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveRefCategory(cat.id);
            }}
            className={`pds-ref-filter-btn ${activeRefCategory === cat.id ? 'is-active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Section 1: Regulatory & Reference Dossier ── */}
      {(activeRefCategory === 'regulatory' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '0.85rem'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#003666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              1. Official Regulatory & Reference Dossier
            </h2>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={11} /> Verified Government & Clinical Index
            </span>
          </div>

          {/* Dossier Master Card */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Reference Brand</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                {activeData.regulatory.brandUrl ? (
                  <a
                    href={activeData.regulatory.brandUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1e3a8a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="View official prescription label in DailyMed"
                  >
                    <span>{activeData.regulatory.brand}</span>
                    <ExternalLink size={12} color="#2563eb" />
                  </a>
                ) : (
                  activeData.regulatory.brand
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Reference / Reg Number</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px', fontFamily: 'monospace' }}>
                {activeData.pubChemUrl ? (
                  <a
                    href={activeData.pubChemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1e3a8a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="View chemical compound and bioactivity in PubChem"
                  >
                    <span>{activeData.regulatory.appNumber}</span>
                    <ExternalLink size={12} color="#2563eb" />
                  </a>
                ) : (
                  activeData.regulatory.appNumber
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Approval / Status</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                {activeData.regulatory.approvalDate}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Authorizing Body / Holder</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                {activeData.regulatory.holder}
              </div>
            </div>
          </div>

          {/* Official Verification Links Strip */}
          {activeData.regulatory.officialLinks && activeData.regulatory.officialLinks.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '0.85rem',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginRight: '4px' }}>
                Official Databases:
              </span>
              {activeData.regulatory.officialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0284c7',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <span>{link.label}</span>
                  <ExternalLink size={10} />
                </a>
              ))}
            </div>
          )}

          <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
            <strong>Regulatory Guidance:</strong> {activeData.regulatory.guidance}
          </p>
        </section>
      )}

      {/* ── Section 2: Receptor Pharmacology & Mechanism ── */}
      {(activeRefCategory === 'pharmacology' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <h2 style={{
            margin: '0 0 0.85rem 0',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            2. Pharmacodynamics & Receptor Affinity
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#003666' }}>{activeData.pharmacology.title}:</strong>
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                {activeData.pharmacology.affinities.map((aff, i) => (
                  <li key={i}><strong>{aff.name}</strong> {aff.desc}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#003666' }}>Molecular Mechanism of Action:</strong>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                {activeData.pharmacology.moa}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: Peer-Reviewed Clinical Literature ── */}
      {(activeRefCategory === 'literature' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#003666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              3. Peer-Reviewed Clinical Trials (PubMed Indexed)
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                {activeData.literature.length} Primary Citations
              </span>
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(activeData.canonicalName)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  textDecoration: 'none'
                }}
              >
                <span>Search PubMed</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeData.literature.map((study) => (
              <div
                key={study.id}
                className="pds-ref-study-card"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                      {study.title}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '6px' }}>
                      {study.authors} — <em style={{ color: '#003666', fontWeight: 600 }}>{study.journal}</em> ({study.year})
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    {study.pmid && study.pmid !== 'NCBI' ? (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: '#1d4ed8',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          textDecoration: 'none'
                        }}
                        title="Open publication directly in NCBI PubMed"
                      >
                        <span>PMID: {study.pmid}</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(activeData.canonicalName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: '#1d4ed8',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          textDecoration: 'none'
                        }}
                      >
                        <span>NCBI PubMed</span>
                        <ExternalLink size={11} />
                      </a>
                    )}

                    {study.clinicalTrialId && (
                      <a
                        href={`https://clinicaltrials.gov/study/${study.clinicalTrialId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: '#475569',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <span>{study.clinicalTrialId}</span>
                        <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                </div>

                <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                  {study.summary}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 4: Clinical Safety & Contraindications ── */}
      {(activeRefCategory === 'safety' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <h2 style={{
            margin: '0 0 0.85rem 0',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#991b1b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            4. Clinical Contraindications & Safety Warnings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#991b1b' }}>Absolute Contraindications:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                {activeData.contraindications.map((ci, i) => (
                  <li key={i}>{ci}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#92400e' }}>Reported Adverse Reactions Profile:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#78350f', lineHeight: 1.4 }}>
                {activeData.adverseReactions}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
