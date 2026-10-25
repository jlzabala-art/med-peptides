"use client";

import React from 'react';
import Link from 'next/link';
import { FlaskConical, CheckCircle2, Droplets } from '@/lib/icons';
import { Calculator } from 'lucide-react';
import SpainCompanyResidencyTechnicalSpecs from '../../SpainCompanyResidencyTechnicalSpecs';
import CompoundingServicesTechnicalSpecs from '../../CompoundingServicesTechnicalSpecs';
import PeptideSupplyManagementTechnicalSpecs from '../../PeptideSupplyManagementTechnicalSpecs';
import UaeCompanySetupTechnicalSpecs from '../../UaeCompanySetupTechnicalSpecs';
import SolventTechnicalSpecs from '../../SolventTechnicalSpecs';
import EternaGeneticTechnicalSpecs from '../../EternaGeneticTechnicalSpecs';
import DiagnosticTestTechnicalSpecs from '../../DiagnosticTestTechnicalSpecs';
import IvDripTechnicalSpecs from '../../IvDripTechnicalSpecs';
import CosmeticTechnicalSpecs from '../../CosmeticTechnicalSpecs';
import SupplementTechnicalSpecs from '../../SupplementTechnicalSpecs';
import InteractiveReconstitutionGuide from '../../InteractiveReconstitutionGuide';

export default function ReconstitutionRouterSection({
  product,
  lang,
  t,
  isSpainResidency,
  isCompoundingService,
  isPeptideSupplyService,
  isUaeCorporateService,
  isSolventProduct,
  isEternaDiagnostic,
  isDiagnosticKit,
  isIvDrip,
  isCosmeticProduct,
  isSupplementProduct,
  isPenOrCart,
  isSprayFormat,
  selectedStrength,
  sortedStrengths,
  activeFormatId,
  activeFormat,
  availableFormats,
  setActiveFormatId,
  displaySupplierName,
  primaryProtocol,
  associatedProtocols,
  initialPhase,
  onOpenInquiry
}) {
  if (isSpainResidency) {
    return (
      <SpainCompanyResidencyTechnicalSpecs
        product={product}
        lang={lang}
        onOpenInquiry={onOpenInquiry}
      />
    );
  }

  if (isCompoundingService) {
    return (
      <CompoundingServicesTechnicalSpecs
        product={product}
        lang={lang}
        onOpenInquiry={onOpenInquiry}
      />
    );
  }

  if (isPeptideSupplyService) {
    return (
      <PeptideSupplyManagementTechnicalSpecs
        product={product}
        lang={lang}
        onOpenInquiry={onOpenInquiry}
      />
    );
  }

  return (
    <section id="reconstitution-section" className="pds-section-card">
      {isUaeCorporateService ? (
        <UaeCompanySetupTechnicalSpecs product={product} lang={lang} />
      ) : isSolventProduct ? (
        <SolventTechnicalSpecs product={product} lang={lang} />
      ) : isEternaDiagnostic ? (
        <EternaGeneticTechnicalSpecs product={product} lang={lang} />
      ) : isDiagnosticKit ? (
        <DiagnosticTestTechnicalSpecs
          product={product}
          selectedDose={selectedStrength?.name || 'Standard'}
          supplierName={displaySupplierName}
          lang={lang}
        />
      ) : isIvDrip ? (
        <IvDripTechnicalSpecs
          product={product}
          selectedDose={selectedStrength?.name || '50 mL Infusion'}
          supplierName={displaySupplierName}
          lang={lang}
        />
      ) : isCosmeticProduct ? (
        <CosmeticTechnicalSpecs
          product={product}
          lang={lang}
          onOpenInquiry={onOpenInquiry}
        />
      ) : isSupplementProduct ? (
        <SupplementTechnicalSpecs
          product={product}
          selectedStrength={selectedStrength}
          lang={lang}
          onOpenInquiry={onOpenInquiry}
        />
      ) : (
        <>
          <div className="pds-section-header">
            <div className="pds-section-header-left">
              <div className="pds-section-header-shield">
                <FlaskConical size={22} />
              </div>
              <div className="pds-section-header-titles">
                <div className="pds-section-header-meta-row">
                  <span className="pds-section-header-category">
                    {isPenOrCart
                      ? (lang === 'es' ? 'TITULACIÓN Y CALIBRACIÓN DE DIAL' : 'DOSIMETRY & DIAL TITRATION')
                      : isSprayFormat
                        ? (lang === 'es' ? 'DOSIMETRÍA INTRANASAL TRANSMUCOSA' : 'INTRANASAL DOSIMETRY')
                        : (t?.reconstitutionSection || 'RECONSTITUTION PROTOCOL & DOSIMETRY')}
                  </span>
                  <span className="pds-section-badge">
                    <CheckCircle2 size={11} />{' '}
                    {isPenOrCart
                      ? (lang === 'es' ? 'SIMULADOR MULTIDOSIS' : 'MULTI-DOSE PEN SIMULATOR')
                      : isSprayFormat
                        ? (lang === 'es' ? 'BOMBA DOSIFICADA' : 'METERED MUCOSAL PUMP')
                        : (t?.interactiveCalcBadge || 'PRECISION SIMULATOR')}
                  </span>
                </div>
                <h3 className="pds-section-header-title">
                  {isPenOrCart
                    ? (lang === 'es' ? 'Guía de Calibración de Dial en Bolígrafo Precargado' : 'Pre-filled Pen Dial Titration & Administration Guide')
                    : isSprayFormat
                      ? (lang === 'es' ? 'Guía Clínica de Administración Intranasal Dosificada' : 'Clinical Intranasal Metered Dose Guide')
                      : (t?.interactiveCalcTitle || 'Interactive Reconstitution & U-100 Syringe Simulator')}
                </h3>
              </div>
            </div>

            <div className="pds-section-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                href={`/calculator?mg=${encodeURIComponent(selectedStrength?.numericValue || selectedStrength?.value || 5)}&name=${encodeURIComponent(product?.name || product?.canonicalName || '')}&slug=${encodeURIComponent(product?.slug || product?.id || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title={lang === 'es' ? 'Abrir en Calculadora Completa con visualizador de jeringa' : 'Open in Full Standalone Calculator with syringe visualizer'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Calculator size={13} />
                <span>{lang === 'es' ? 'Calculadora Completa ↗' : 'Full Calculator ↗'}</span>
              </Link>

              <div className="pds-section-cert-badge">
                <Droplets size={14} color="#38bdf8" />
                <span>
                  {isPenOrCart
                    ? 'ISO 11608-2 Micro-Dial (1 Click = 0.01 mL)'
                    : isSprayFormat
                      ? (lang === 'es' ? '0.1 mL por Pulverización' : '0.1 mL Metered Mucosal Actuation')
                      : 'U-100 Standard (1.0 mL = 100 U)'}
                </span>
              </div>
            </div>
          </div>

          <div className="pds-section-card-body" style={{ padding: 0 }}>
            <InteractiveReconstitutionGuide
              product={product}
              selectedStrength={selectedStrength}
              availableStrengths={sortedStrengths}
              activeFormatId={activeFormatId}
              activeFormat={activeFormat}
              availableFormats={availableFormats}
              onFormatChange={setActiveFormatId}
              supplierName={displaySupplierName}
              lang={lang}
              primaryProtocol={primaryProtocol}
              associatedProtocols={associatedProtocols}
              initialPhase={initialPhase}
            />
          </div>
        </>
      )}
    </section>
  );
}
