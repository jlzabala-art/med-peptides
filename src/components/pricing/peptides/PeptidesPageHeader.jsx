'use client';

import React from 'react';
import {
  CheckCircle2,
  Mail,
  Eye,
  Check,
  Share2
} from 'lucide-react';

/**
 * PeptidesPageHeader
 * Google Cloud-inspired Page Header with HPLC purity status strip, hero title,
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
  return (
    <div className="peptides-page-header" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          {/* Consolidated GCP Status Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 750,
              color: isDistributor ? '#137333' : '#1a73e8',
              background: isDistributor ? '#e6f4ea' : '#e8f0fe',
              border: isDistributor ? '1px solid #ceead6' : '1px solid #c2e7ff',
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDistributor ? '#137333' : '#1a73e8', display: 'inline-block' }} />
              <span>{isDistributor ? (isEs ? 'Tarifa Oficial Distribuidor' : 'Official Distributor Schedule') : (isEs ? 'Tarifa Mayorista' : 'Wholesale Schedule')}</span>
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 650,
              color: '#137333',
              background: '#e6f4ea',
              border: '1px solid #ceead6',
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={11} />
              <span>≥99.0% HPLC</span>
            </span>
          </div>

          <h1 className="peptides-hero-title" style={{
            fontSize: 'clamp(1.12rem, 3vw, 1.60rem)',
            fontWeight: 800,
            color: '#202124',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.22,
            textWrap: 'balance',
            maxWidth: '820px',
            paddingRight: '4px',
            wordBreak: 'break-word'
          }}>
            {isDistributor
              ? (isEs ? 'Viales Clínicos de Péptidos Certificados • Distribuidor B2B' : 'Certified Clinical Peptide Vials • Distributor B2B')
              : (isEs ? 'Viales Clínicos de Péptidos Certificados • Mayoristas y Clínicas' : 'Certified Clinical Peptide Vials • Wholesaler & Clinic')
            }
          </h1>

          <p className="peptides-hero-subtitle" style={{ fontSize: '0.84rem', color: '#5f6368', marginTop: '3px', marginBottom: 0, maxWidth: '850px', lineHeight: 1.4 }}>
            {isDistributor
              ? (isEs
                  ? 'Lista oficial B2B para distribuidores de viales liofilizados certificados (Borosilicato 10R) con pureza verificada y ahorro por volumen.'
                  : 'Official B2B distributor price list for certified lyophilized peptide vials (10R Borosilicate) with verified analytical purity and volume tiers.')
              : (isEs
                  ? 'Tarifa oficial institucional y mayorista para péptidos bioactivos liofilizados estériles con ahorro por volumen en packs de 10 viales.'
                  : 'Official institutional and wholesale price schedule for sterile lyophilized bioactive peptides with manufacturer 10-pack volume savings.')
            }
          </p>
        </div>

        {/* Right-Aligned Page Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              if (setInquiryProductContext) setInquiryProductContext(null);
              if (setIsInquiryDrawerOpen) setIsInquiryDrawerOpen(true);
            }}
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
              boxShadow: '0 1px 3px rgba(26,115,232,0.25)',
              transition: 'background 0.15s ease'
            }}
            title={isEs ? 'Consultar información técnica o solicitud B2B' : 'Institutional Inquiry & Support'}
          >
            <Mail size={14} color="#ffffff" />
            <span>{isEs ? 'Consultar' : 'Inquire'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfPreviewOpen && setIsPdfPreviewOpen(true)}
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
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              transition: 'background 0.15s ease'
            }}
            title={isEs ? 'Previsualizar y exportar tarifa oficial PDF' : 'Preview and export official PDF price schedule'}
          >
            <Eye size={14} color="#5f6368" />
            <span>{isEs ? 'PDF' : 'PDF Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareSchedule}
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
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Copiar enlace verificado de tarifa' : 'Copy verified price list link'}
          >
            {copied ? <Check size={14} color="#1a73e8" /> : <Share2 size={14} color="#5f6368" />}
            <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
