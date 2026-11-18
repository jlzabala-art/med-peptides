'use client';

import React from 'react';
import {
  Mail,
  FileText,
  Check,
  Share2
} from 'lucide-react';
import PageHeroCard from '@/components/ui/PageHeroCard';

/**
 * PeptidesPageHeader
 * Canonical PageHeroCard wrapper with HPLC purity badges, hero title,
 * subtitle, and verified B2B action toolbar (Inquire, PDF Schedule, Share).
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
        ? 'Catálogo oficial B2B de viales liofilizados estériles (Borosilicato 10R) con pureza analítica ≥99.0% HPLC y descuentos por volumen.'
        : 'Official B2B schedule for certified sterile lyophilized peptide vials (10R Borosilicate) with verified ≥99.0% HPLC purity.')
    : (isEs
        ? 'Tarifa oficial institucional y mayorista para péptidos bioactivos estériles con pureza ≥99.0% HPLC y ahorro por volumen en packs de 10.'
        : 'Official institutional & wholesale price schedule for sterile lyophilized bioactive peptides with manufacturer 10-pack volume savings.');

  return (
    <PageHeroCard
      className="peptides-page-header"
      brandRight={isDistributor ? (isEs ? 'DISTRIBUIDOR B2B' : 'DISTRIBUTOR B2B') : (isEs ? 'MAYORISTA B2B' : 'WHOLESALE B2B')}
      badges={['≥99.0% HPLC', 'cGMP Release']}
      title={title}
      subtitle={subtitle}
      metaItems={[
        { label: 'REF:', value: 'DOC-PEP-B2B-2026', mono: true },
        { label: 'PURITY:', value: '≥99.0% HPLC', mono: true },
      ]}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              if (setInquiryProductContext) setInquiryProductContext(null);
              if (setIsInquiryDrawerOpen) setIsInquiryDrawerOpen(true);
            }}
            className="gcp-btn-primary"
            style={{
              height: '34px',
              padding: '0 14px',
              borderRadius: '6px',
              border: '1px solid #1a73e8',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={isEs ? 'Consultar información técnica o solicitud B2B' : 'Institutional Inquiry & Support'}
          >
            <Mail size={14} color="#ffffff" />
            <span>{isEs ? 'Consultar' : 'Inquire'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfPreviewOpen && setIsPdfPreviewOpen(true)}
            className="gcp-btn-secondary"
            style={{
              height: '34px',
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.80rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={isEs ? 'Ver y descargar tarifa oficial PDF (A4)' : 'View and download official A4 PDF schedule'}
          >
            <FileText size={14} color="#1a73e8" />
            <span>{isEs ? 'Tarifa PDF' : 'PDF Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareSchedule}
            className="gcp-btn-secondary"
            style={{
              height: '34px',
              padding: '0 12px',
              borderRadius: '6px',
              border: copied ? '1px solid #1a73e8' : '1px solid #dadce0',
              background: copied ? '#e8f0fe' : '#ffffff',
              color: copied ? '#1a73e8' : '#3c4043',
              fontSize: '0.80rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={isEs ? 'Copiar enlace verificado de tarifa' : 'Copy verified price list link'}
          >
            {copied ? <Check size={14} color="#1a73e8" /> : <Share2 size={14} color="#5f6368" />}
            <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
          </button>
        </div>
      }
    />
  );
}
