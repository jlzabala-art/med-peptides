'use client';

import React from 'react';
import {
  Mail,
  Eye,
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
    ? (isEs ? 'Viales Clínicos de Péptidos Certificados • Distribuidor B2B' : 'Certified Clinical Peptide Vials • Distributor B2B')
    : (isEs ? 'Viales Clínicos de Péptidos Certificados • Mayoristas y Clínicas' : 'Certified Clinical Peptide Vials • Wholesaler & Clinic');

  const subtitle = isDistributor
    ? (isEs
        ? 'Lista oficial B2B para distribuidores de viales liofilizados certificados (Borosilicato 10R) con pureza verificada y ahorro por volumen.'
        : 'Official B2B distributor price list for certified lyophilized peptide vials (10R Borosilicate) with verified analytical purity and volume tiers.')
    : (isEs
        ? 'Tarifa oficial institucional y mayorista para péptidos bioactivos liofilizados estériles con ahorro por volumen en packs de 10 viales.'
        : 'Official institutional and wholesale price schedule for sterile lyophilized bioactive peptides with manufacturer 10-pack volume savings.');

  return (
    <PageHeroCard
      className="peptides-page-header"
      brandLeft="ATLAS HEALTH"
      brandRight={isDistributor ? (isEs ? 'DISTRIBUIDOR B2B' : 'DISTRIBUTOR B2B') : (isEs ? 'TARIFA MAYORISTA' : 'WHOLESALE SCHEDULE')}
      badges={['≥99.0% HPLC', '10R BOROSILICATE']}
      title={title}
      subtitle={subtitle}
      metaItems={[
        { label: 'DOCUMENT REF:', value: 'DOC-PEP-B2B-2026', mono: true },
        { label: 'PURITY STD:', value: '≥99.0% HPLC', mono: true },
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
            title={isEs ? 'Previsualizar y exportar tarifa oficial PDF' : 'Preview and export official PDF price schedule'}
          >
            <Eye size={14} color="#5f6368" />
            <span>{isEs ? 'PDF' : 'PDF Schedule'}</span>
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
