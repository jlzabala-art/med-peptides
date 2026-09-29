"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ChevronRight, Check } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import { FDA_APPROVED_PEPTIDES_NETWORK } from '@/data/fdaPeptidesRegistry';
import './FdaApprovedPeptidesNetworkWidget.css';

/**
 * FdaApprovedPeptidesNetworkWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Specialized Google Cloud Console-inspired sidebar widget for all FDA-approved peptides.
 * When a physician or researcher views an FDA-approved peptide (e.g., Tirzepatide),
 * this widget highlights the current active monograph and renders direct links
 * to all other FDA-approved peers in the catalog, transforming the datasheets
 * into an interconnected clinical ecosystem.
 */
export default function FdaApprovedPeptidesNetworkWidget({
  currentSlug = '',
  currentProduct = {},
  lang = 'en'
}) {
  const isEs = lang === 'es';

  // Deterministic check of active peptide identity
  const activeSlugNormalized = useMemo(() => {
    const raw = (
      currentSlug || 
      currentProduct?.slug || 
      currentProduct?.id || 
      currentProduct?.name || 
      ''
    ).toLowerCase().trim();

    if (raw.includes('tirzepatide')) return 'tirzepatide';
    if (raw.includes('semaglutide')) return 'semaglutide';
    if (raw.includes('liraglutide')) return 'liraglutide';
    if (raw.includes('tesamorelin')) return 'tesamorelin';
    if (raw.includes('pt-141') || raw.includes('pt141') || raw.includes('bremelanotide')) return 'pt-141-bremelanotide';
    if (raw.includes('sermorelin')) return 'sermorelin';
    return raw;
  }, [currentSlug, currentProduct]);

  return (
    <div className="fda-net-widget" aria-label="FDA-Approved Peptides Network">
      <div className="fda-net-header">
        <div className="fda-net-header-left">
          <ShieldCheck size={15} className="fda-net-icon" />
          <span className="fda-net-title">
            {isEs ? 'RED PÉPTIDOS APROBADOS FDA' : 'FDA-APPROVED PEPTIDES NETWORK'}
          </span>
        </div>
        <span className="fda-net-badge">
          FDA CDER ✓
        </span>
      </div>

      <p className="fda-net-intro">
        {isEs 
          ? 'Péptidos bioactivos con aprobación formal de la FDA (NDA/ANDA). Fichas clínicas interconectadas:'
          : 'Bioactive peptides with formal FDA approval (NDA/ANDA). Interconnected clinical datasheets:'}
      </p>

      <div className="fda-net-list" role="list">
        {FDA_APPROVED_PEPTIDES_NETWORK.map((item) => {
          const isCurrent = (
            item.slug === activeSlugNormalized || 
            (item.aliases && item.aliases.includes(activeSlugNormalized))
          );
          const indicationText = item.indication?.[isEs ? 'es' : 'en'] || item.indication?.en || '';

          if (isCurrent) {
            return (
              <div 
                key={item.slug} 
                className="fda-net-item is-current"
                role="listitem"
                aria-current="page"
                title={`${item.name} — ${isEs ? 'Ficha Activa' : 'Current Datasheet'}`}
              >
                <div className="fda-net-content">
                  <div className="fda-net-item-top">
                    <div className="fda-net-name-row">
                      <span className="fda-net-item-name">{item.name}</span>
                      <span className="fda-net-current-tag">
                        {isEs ? 'Ficha Actual' : 'Current'}
                      </span>
                    </div>
                    <span className="fda-net-status-pill">
                      <Check size={10} />
                      FDA {item.fdaApprovalYear.split(' ')[0]}
                    </span>
                  </div>

                  <div className="fda-net-brand-row">
                    <span className="fda-net-brands">{item.brandNames}</span>
                    <span className="fda-net-mech-tag">{item.mechanismTag}</span>
                  </div>

                  <div className="fda-net-indication">
                    {indicationText}
                  </div>
                </div>

                <div className="fda-net-item-right" aria-hidden="true">
                  <CheckCircle2 size={15} />
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.slug}
              href={`/p/${item.slug}`}
              onClick={() => triggerHaptic('selection')}
              className="fda-net-item"
              role="listitem"
              title={`${item.name} (${item.brandNames}) — ${indicationText}`}
            >
              <div className="fda-net-content">
                <div className="fda-net-item-top">
                  <span className="fda-net-item-name">{item.name}</span>
                  <span className="fda-net-status-pill">
                    <Check size={10} />
                    FDA {item.fdaApprovalYear.split(' ')[0]}
                  </span>
                </div>

                <div className="fda-net-brand-row">
                  <span className="fda-net-brands">{item.brandNames}</span>
                  <span className="fda-net-mech-tag">{item.mechanismTag}</span>
                </div>

                <div className="fda-net-indication">
                  {indicationText}
                </div>
              </div>

              <div className="fda-net-item-right" aria-hidden="true">
                <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="fda-net-footer">
        <div className="fda-net-footer-text">
          <span>🛡️</span>
          <span>
            {isEs
              ? 'Monografías terapéuticas contrastadas según resoluciones del Centro de Evaluación e Investigación de Medicamentos de la FDA (CDER).'
              : 'Therapeutic monographs referenced per U.S. FDA Center for Drug Evaluation and Research (CDER) rulings.'}
          </span>
        </div>
      </div>
    </div>
  );
}
