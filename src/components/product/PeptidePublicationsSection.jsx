"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Loader2,
  ChevronDown,
  ChevronUp
} from '@/lib/icons';
import { getCuratedPeptideLiterature } from '@/data/peptideLiteratureRegistry';
import { getPubMedLiterature } from '@/services/pubmedService';
import './PeptidePublicationsSection.css';

export default function PeptidePublicationsSection({ product, lang = 'en' }) {
  const [dynamicArticles, setDynamicArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState({});

  const productName = product?.canonicalName || product?.name || product?.title || 'This Compound';
  const curatedArticles = useMemo(() => getCuratedPeptideLiterature(product), [product]);

  // If not in curated registry, query dynamic PubMed service
  useEffect(() => {
    if (curatedArticles && curatedArticles.length > 0) return;
    if (!product) return;

    let isMounted = true;
    setIsLoading(true);

    getPubMedLiterature(product)
      .then(data => {
        if (isMounted) {
          setDynamicArticles(data || []);
        }
      })
      .catch(err => {
        console.warn('[PeptidePublicationsSection] PubMed query warning:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [product, curatedArticles]);

  const displayArticles = curatedArticles.length > 0 ? curatedArticles : dynamicArticles;

  if (!isLoading && displayArticles.length === 0) {
    return null;
  }

  const toggleExpand = (id) => {
    setExpandedArticles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="publications-section" className="pds-section-card pds-publications-card">
      {/* ── Section Header ── */}
      <div className="pds-section-header">
        <div className="pds-section-header-left">
          <div className="pds-section-header-shield" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <BookOpen size={22} />
          </div>
          <div className="pds-section-header-titles">
            <div className="pds-section-header-meta-row">
              <span className="pds-section-header-category">
                PEER-REVIEWED SCIENTIFIC LITERATURE & CLINICAL EVIDENCE
              </span>
              <span className="pds-section-badge" style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
                <CheckCircle2 size={11} /> NCBI PUBMED INDEXED
              </span>
            </div>
            <h3 className="pds-section-header-title">
              Peer-Reviewed Clinical Publications & Scientific Trials
            </h3>
          </div>
        </div>

        <div className="pds-section-header-right">
          <div className="pds-section-cert-badge">
            <Activity size={14} color="#0284c7" />
            <span>{displayArticles.length} Verified Publication{displayArticles.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="pds-section-card-body" style={{ padding: '1.5rem' }}>
        <p className="pds-publications-subtitle">
          Authoritative academic studies, preclinical investigations, and randomized clinical trials establishing receptor binding mechanisms, safety profiles, and therapeutic pharmacokinetics for <strong>{productName}</strong>.
        </p>

        {isLoading ? (
          <div className="pds-pub-loading">
            <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite', color: '#0284c7' }} />
            <span>Querying National Library of Medicine (NCBI / PubMed)...</span>
          </div>
        ) : (
          <div className={`pds-publications-grid ${displayArticles.length === 1 ? 'single-item' : ''}`}>
            {displayArticles.map((article, idx) => {
              const articleId = article.id || article.pmid || `pub-${idx}`;
              const isCurated = Boolean(article.clinicalSummary);
              const pubmedUrl = article.pubmedUrl || (article.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/` : null);
              const isSingle = displayArticles.length === 1;

              return (
                <article key={articleId} className={`pds-pub-card ${isSingle ? 'pds-pub-card-horizontal' : ''}`}>
                  {/* Left Column: Metadata, Title, Authors & Action Link */}
                  <div className="pds-pub-card-primary">
                    <div className="pds-pub-card-meta-wrap">
                      {/* Journal Strip */}
                      <div className="pds-pub-meta-bar">
                        <div className="pds-pub-journal-pill">
                          <span className="pds-pub-journal-name">{article.journal}</span>
                          {article.year && (
                            <span className="pds-pub-year">
                              <Clock size={11} /> {article.year}
                            </span>
                          )}
                        </div>
                        {article.evidenceType && (
                          <span className="pds-pub-evidence-tag">
                            {article.evidenceType}
                          </span>
                        )}
                      </div>

                      {/* Article Title */}
                      <h4 className="pds-pub-title">
                        {article.title}
                      </h4>

                      {/* Authors */}
                      {article.authors && (
                        <div className="pds-pub-authors">
                          <span className="pds-pub-authors-label">Investigators:</span> {article.authors}
                        </div>
                      )}
                    </div>

                    {/* Card Action Row: Read full article */}
                    <div className="pds-pub-footer">
                      {pubmedUrl ? (
                        <a
                          href={pubmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pds-pub-action-link"
                          title="Read complete peer-reviewed paper on NCBI PubMed"
                        >
                          <span>Read Full Paper on PubMed</span>
                          {article.pmid && <code className="pds-pub-pmid-tag">PMID: {article.pmid}</code>}
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="pds-pub-academic-cite">
                          Indexed Peer-Reviewed Medical Monograph
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Executive Summary & Key Findings */}
                  <div className="pds-pub-card-secondary">
                    {/* Executive Clinical Summary */}
                    {article.clinicalSummary ? (
                      <div className="pds-pub-summary-box">
                        <div className="pds-pub-summary-header">
                          <FileText size={13} color="#0369a1" />
                          <span>Executive Study Summary & Conclusions:</span>
                        </div>
                        <p className="pds-pub-summary-text">
                          {article.clinicalSummary}
                        </p>
                      </div>
                    ) : article.abstract ? (
                      <div className="pds-pub-summary-box">
                        <div className="pds-pub-summary-header">
                          <FileText size={13} color="#0369a1" />
                          <span>Abstract Preview:</span>
                        </div>
                        <p className="pds-pub-summary-text">
                          {article.abstract}
                        </p>
                      </div>
                    ) : null}

                    {/* Key Scientific Findings */}
                    {article.keyFindings && article.keyFindings.length > 0 && (
                      <div className="pds-pub-findings-box">
                        <span className="pds-pub-findings-label">Key Scientific Findings:</span>
                        <ul className="pds-pub-findings-list">
                          {article.keyFindings.map((finding, fIdx) => (
                            <li key={fIdx}>
                              <CheckCircle2 size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footnote Disclosing Open Access Repository */}
        <div className="pds-pub-disclaimer">
          <ShieldCheck size={14} color="#64748b" style={{ flexShrink: 0 }} />
          <span>
            Scientific citations are indexed from the National Library of Medicine (NLM / PubMed). Med-Peptides maintains complete editorial and academic neutrality. Publications are presented for educational and analytical reference.
          </span>
        </div>
      </div>
    </section>
  );
}
