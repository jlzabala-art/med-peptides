'use client';

import React, { useState } from 'react';
import {
  Mail,
  FileText,
  Check,
  Share2,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import PageHeroCard from '@/components/ui/PageHeroCard';

/**
 * PeptidesPageHeader
 * Canonical PageHeroCard wrapper with HPLC purity badges, hero title,
 * progressive-disclosure mobile specs (Rule #26), and touch-friendly 40px action toolbar (Rules #23, #40, #57).
 */
export default function PeptidesPageHeader({
  isDistributor = false,
  isEs = false,
  copied = false,
  setInquiryProductContext,
  setIsInquiryDrawerOpen,
  setIsPdfPreviewOpen,
  handleShareSchedule
}) {
  const [showMobileMeta, setShowMobileMeta] = useState(false);

  const title = isDistributor
    ? (isEs ? 'Tarifa Oficial de Péptidos · Distribuidor B2B' : 'Official Peptide Price Schedule · Distributor')
    : (isEs ? 'Tarifa Oficial de Péptidos · Mayoristas y Clínicas' : 'Official Peptide Price Schedule · Wholesaler & Clinic');

  const subtitle = isDistributor
    ? (isEs
        ? 'Catálogo oficial B2B de viales liofilizados estériles (Borosilicato 10R) con pureza analítica ≥99.0% HPLC y descuentos por volumen.'
        : 'Official B2B schedule for certified sterile lyophilized peptide vials (10R Borosilicate) with verified ≥99.0% HPLC purity.')
    : (isEs
        ? 'Tarifa oficial institucional y mayorista para péptidos bioactivos estériles con pureza ≥99.0% HPLC y ahorro por volumen en packs de 10.'
        : 'Official institutional & wholesale price schedule for sterile lyophilized bioactive peptides with manufacturer 10-pack volume savings.');

  return (
    <PageHeroCard
      className={`peptides-page-header ${showMobileMeta ? 'peptides-hero-meta-open' : 'peptides-hero-meta-collapsed'}`}
      brandRight={isDistributor ? (isEs ? 'DISTRIBUIDOR B2B' : 'DISTRIBUTOR B2B') : (isEs ? 'MAYORISTA B2B' : 'WHOLESALE B2B')}
      badges={['≥99.0% HPLC', 'cGMP Release']}
      title={title}
      subtitle={subtitle}
      metaItems={[
        { label: 'REF:', value: 'DOC-PEP-B2B-2026', mono: true },
        { label: 'PURITY:', value: '≥99.0% HPLC', mono: true },
      ]}
      actions={
        <div className="peptides-hero-actions-wrap">
          {/* Mobile-only progressive disclosure toggle for REF / Subtitle */}
          <button
            type="button"
            className="peptides-hero-mobile-meta-toggle"
            onClick={() => setShowMobileMeta((v) => !v)}
            aria-expanded={showMobileMeta}
          >
            <ShieldCheck size={12} color="#16a34a" />
            <span>{isEs ? 'Specs cGMP & Ref.' : 'cGMP Specs & Ref.'}</span>
            <ChevronDown
              size={12}
              style={{ transform: showMobileMeta ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
            />
          </button>

          <div className="peptides-hero-actions-grid">
            <button
              type="button"
              onClick={() => setIsPdfPreviewOpen && setIsPdfPreviewOpen(true)}
              className="gcp-btn-secondary peptides-hero-btn"
              title={isEs ? 'Ver y descargar tarifa oficial PDF (A4)' : 'View and download official A4 PDF schedule'}
            >
              <FileText size={14} color="#5f6368" />
              <span>{isEs ? 'Tarifa PDF' : 'PDF Schedule'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareSchedule}
              className="gcp-btn-secondary peptides-hero-btn"
              style={copied ? { borderColor: '#1a73e8', background: '#e8f0fe', color: '#1a73e8' } : undefined}
              title={isEs ? 'Copiar enlace verificado de tarifa' : 'Copy verified price list link'}
            >
              {copied ? <Check size={14} color="#1a73e8" /> : <Share2 size={14} color="#5f6368" />}
              <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (setInquiryProductContext) setInquiryProductContext(null);
                if (setIsInquiryDrawerOpen) setIsInquiryDrawerOpen(true);
              }}
              className="gcp-btn-primary peptides-hero-btn peptides-hero-btn-primary"
              title={isEs ? 'Consultar información técnica o solicitud B2B' : 'Institutional Inquiry & Support'}
            >
              <Mail size={14} color="#ffffff" />
              <span>{isEs ? 'Consultar' : 'Inquire'}</span>
            </button>
          </div>
        </div>
      }
    />
  );
}
