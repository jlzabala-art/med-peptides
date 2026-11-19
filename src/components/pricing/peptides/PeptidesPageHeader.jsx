'use client';

import React from 'react';
import {
  Mail,
  FileText,
  Check,
  Share2,
} from 'lucide-react';
import PageHeroCard from '@/components/ui/PageHeroCard';

/**
 * PeptidesPageHeader
 * Canonical Compact GCP PageHeroCard wrapper with HPLC purity badges, hero title,
 * and inline right-aligned action toolbar (≤ 84px on Laptop · ≤ 112px on Mobile).
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
  const title = isDistributor
    ? (isEs ? 'Tarifa Oficial de Péptidos · Distribuidor B2B' : 'Official Peptide Price Schedule · Distributor')
    : (isEs ? 'Tarifa Oficial de Péptidos · Mayoristas y Clínicas' : 'Official Peptide Price Schedule · Wholesaler & Clinic');

  const subtitle = isDistributor
    ? (isEs
        ? 'Catálogo oficial B2B de viales liofilizados estériles (Borosilicato 10R) con pureza ≥99.0% HPLC y descuentos por volumen.'
        : 'Certified sterile lyophilized 10R peptide vials with verified ≥99.0% HPLC analytical purity and volume tier discounts.')
    : (isEs
        ? 'Tarifa oficial mayorista y para clínicas de viales liofilizados estériles (≥99.0% HPLC) con ahorro por volumen en Pack ×10.'
        : 'Certified sterile lyophilized 10R peptide vials with verified ≥99.0% HPLC purity and manufacturer Pack ×10 volume savings.');

  return (
    <PageHeroCard
      className="peptides-page-header"
      brandRight={isDistributor ? (isEs ? 'DISTRIBUIDOR B2B' : 'DISTRIBUTOR B2B') : (isEs ? 'MAYORISTA B2B' : 'WHOLESALE B2B')}
      badges={['≥99.0% HPLC', 'cGMP 10R Vials']}
      title={title}
      subtitle={subtitle}
      metaItems={[
        { label: 'REF:', value: 'DOC-PEP-B2B-2026', mono: true },
      ]}
      actions={
        <>
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
        </>
      }
    />
  );
}
