"use client";

import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowUpRight, Target, ShieldCheck, Activity, Clock, Syringe, Info, Sparkles, FlaskConical, Microscope } from '@/lib/icons';
import DataTable from '@/components/ui/DataTable';
import { STANDARD_PRESENTATIONS } from './monographCalculationEngine';
import { getFdaPeptideStatus } from '@/data/fdaPeptidesRegistry';
import { triggerHaptic } from '@/utils/haptics';
import { classifyProductDomain } from '@/utils/productNormalizer';

/**
 * OverviewTab
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 3: Overview Workspace
 * Answers: "What is this compound / test and what presentations are available?"
 * Components:
 * A. Clinical Identity (Generic, Target/Receptor, Pharmacological summary, FDA reference)
 * B. Available Presentations (Multi-format segmented matrix with Route badging)
 * C. Key Clinical Considerations (Concise; deep literature deferred to References)
 */
function PresentationStrengthCard({ row, onRowClick }) {
  const isDiagnostic = row.isDiagnostic || String(row.format || '').toLowerCase().includes('kit') || String(row.format || '').toLowerCase().includes('test');
  const r = String(row.route || row.format || '').toLowerCase();
  const isSpray = r.includes('nasal') || r.includes('spray');
  const isPen = r.includes('pen');
  const isOral = r.includes('oral') || r.includes('capsule');

  return (
    <div
      onClick={() => onRowClick && onRowClick(row)}
      style={{
        background: '#ffffff',
        border: row.isCurrentlyActive ? '1.5px solid #003666' : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        marginBottom: '0.65rem',
        boxShadow: row.isCurrentlyActive ? '0 1px 4px rgba(0, 54, 102, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Top Header: Strength + Format on Left, Action/Badge on Right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        marginBottom: '0.6rem',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666' }}>
            {row.strengthMg}
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 650,
            color: '#475569',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {isDiagnostic ? '🔬 Collection Kit' : row.format}
          </span>
        </div>

        <div>
          {row.isCurrentlyActive ? (
            <span style={{
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              Active ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onRowClick) onRowClick(row);
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Set Active
            </button>
          )}
        </div>
      </div>

      {/* Grid Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.5rem',
        fontSize: '0.72rem'
      }}>
        <div style={{ background: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            {isDiagnostic ? 'Specimen Matrix' : 'Diluent / Vehicle'}
          </div>
          <div style={{ color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>{row.recommendedDiluent}</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            {isDiagnostic ? 'Methodology' : 'Concentration'}
          </div>
          <div style={{ color: '#003666', fontWeight: 750, marginTop: '2px' }}>{row.concentrationMgMl}</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            {isDiagnostic ? 'Lab Turnaround' : 'Route'}
          </div>
          <div style={{ marginTop: '2px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 750,
              background: isDiagnostic ? '#eff6ff' : isSpray ? '#fdf4ff' : isPen ? '#eff6ff' : isOral ? '#fffbeb' : '#f0fdf4',
              color: isDiagnostic ? '#1d4ed8' : isSpray ? '#86198f' : isPen ? '#1d4ed8' : isOral ? '#b45309' : '#166534',
              border: isDiagnostic ? '1px solid #bfdbfe' : isSpray ? '1px solid #f0abfc' : isPen ? '1px solid #bfdbfe' : isOral ? '1px solid #fde68a' : '1px solid #bbf7d0'
            }}>
              {isDiagnostic ? '🔬 ' + row.route : isSpray ? '👃 Intranasal' : isPen ? '💉 SubQ Pen' : isOral ? '💊 Oral Solid' : '🧪 SubQ'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab({
  product = {},
  slug = '',
  lang = 'en',
  presentationMatrixRows = [],
  activeFormat = null,
  availableFormats = [],
  onFormatChange,
  onSelectVariant,
  onNavigateToProtocols
}) {
  const currentLang = lang || (typeof window !== 'undefined' ? (new URLSearchParams(window?.location?.search || '').get('lang') || localStorage.getItem('atlas_portal_lang')) : 'en') || 'en';
  const resolvedSlug = slug || product.slug || product.canonicalName || product.id || 'pt-141';
  const isPt141 = (product.slug || product.canonicalName || product.name || '').toLowerCase().includes('pt-141') || (product.slug || '').toLowerCase().includes('pt141');

  // Determine dominant format & diagnostic classification via centralized normalizer
  const { isDiagnostic, isSpray, isSublingual, isPen } = classifyProductDomain(product, {
    slug: resolvedSlug,
    activeFormat
  });

  const genericName = product.scientificName || product.chemical_name || product.genericName || 
    (isDiagnostic ? (product.name || product.canonicalName || 'Diagnostic Laboratory Test Panel') : (isPt141 ? 'Bremelanotide' : (product.canonicalName || product.name || '')));

  const targetReceptor = product.targetSystem || product.mechanism_of_action || 
    (isDiagnostic 
      ? (product.methodology || 'Analytical Gas Chromatography (GC-FID) / 24 Fatty Acid Biomarker Spectrum')
      : (isPt141 ? 'Central Melanocortin MC3R / MC4R Receptors' : 'Target Receptor / Biomolecular Pathway'));

  const pharmacologicalSummary = product.overview_summary || product.summary || product.description || product.desc || 
    (isDiagnostic
      ? 'Clinical laboratory diagnostic kit for comprehensive biomarker quantification and metabolic profiling. Specimen collected via standardized dried blood spot (DBS) or specimen matrix and analyzed under certified ISO 15189 clinical laboratory standards with automated GC-FID/FAME chromatography.'
      : (isPt141 ? 'Synthetic cyclic heptapeptide analogue of alpha-melanocyte-stimulating hormone (α-MSH). Acts centrally across the blood-brain barrier to stimulate hypothalamic melanocortin receptors (primarily MC3R and MC4R), promoting dopamine release in the medial preoptic area to restore sexual desire and arousal without vascular dependency.' : 'Authoritative pharmaceutical technical profile and clinical reference data for therapeutic peptides.'));

  const fdaStatusObj = getFdaPeptideStatus(product.slug || product.canonicalName || product.name || '');
  const rawRef = product.referenceBrand 
    ? `${product.referenceBrand}${product.referenceApprovalYear ? ` (Approved ${product.referenceApprovalYear})` : ''}` 
    : (isDiagnostic ? 'CE-IVD In Vitro Diagnostic Medical Device (EU IVDR 2017/746 Compliant) • ISO 15189:2022 Accredited' : (fdaStatusObj?.referenceBrand || (isPt141 ? 'Vyleesi® (bremelanotide injection 1.75 mg/0.3 mL, NDA 210583, FDA Approved June 2019)' : null)));
  const fdaRefProduct = rawRef && String(rawRef).trim().length > 0 ? String(rawRef).trim() : null;

  // Note: product.category is intentionally excluded — it stores type ('peptide'), not a clinical indication.
  const defaultIndication = isDiagnostic
    ? (product.primaryIndication || product.indication || 'Comprehensive Fatty Acid Profile (Omega-3/6/9, AA/EPA, DGLA/EPA, Trans-Fatty Acids Index)')
    : isPt141
      ? 'Hypoactive Sexual Desire Disorder (HSDD) & Non-vascular Erectile Dysfunction'
      : (product.primaryIndication || product.indication || product.targetSystem || product.clinicalCategory || 'Targeted Physiological & Cellular Optimization');

  const defaultRoute = isDiagnostic
    ? 'Capillary Blood / Dried Blood Spot (Whatman 903 Collection Card)'
    : isSpray
      ? 'Intranasal Mucosal (Metered needle-free spray, 1–2 sprays per nostril)'
      : isSublingual
        ? 'Sublingual (Drops held under tongue for 60–90 seconds prior to swallowing)'
        : isPen
          ? 'Subcutaneous injection via calibrated multi-dose pen (lower abdomen or anterolateral thigh)'
          : 'Subcutaneous injection (lower abdomen or anterolateral thigh)';

  const defaultPk = isDiagnostic
    ? 'Analytical Precision: Gas Chromatography GC-FID (CV < 4.5% CE-IVD) • Turnaround: 5–7 Business Days'
    : isPt141
      ? 'Tmax: 45–60 min • Terminal t½: ~2.7 hours • On-demand duration: 8–12 hours'
      : (product.pharmacokineticsSummary || (product.eliminationHalfLife ? `Elimination t½: ${product.eliminationHalfLife} • Rapid target bioavailability` : 'High bioavailability across mucosal/subcutaneous administration routes'));

  const defaultDosing = isDiagnostic
    ? 'Collect early morning fasting specimen (8–12h water only) prior to therapeutic interventions'
    : isPt141
      ? 'Administer at least 45 minutes prior to anticipated activity (max 1 dose/24h, max 8 doses/month)'
      : (product.clinicalDosingWindow || (isSpray ? 'Daily morning administration or split protocol as directed by physician' : 'Follow physician clinical protocol and titration guidelines'));

  const clinicalConsiderations = [
    {
      label: isDiagnostic ? 'Diagnostic Target / Biomarkers' : 'Primary Indication / Axis',
      value: defaultIndication,
      icon: Target
    },
    {
      label: isDiagnostic ? 'Specimen Collection Matrix' : 'Administration Route',
      value: defaultRoute,
      icon: isDiagnostic ? Microscope : Syringe
    },
    {
      label: isDiagnostic ? 'Analytical Methodology & Precision' : 'Pharmacokinetics',
      value: defaultPk,
      icon: Clock
    },
    {
      label: isDiagnostic ? 'Patient Preparation & Fasting' : 'Clinical Dosing Window',
      value: defaultDosing,
      icon: Activity
    }
  ];

  const [formatFilter, setFormatFilter] = useState('all');

  const handleRowClick = (row) => {
    triggerHaptic('selection');
    if (onSelectVariant) {
      onSelectVariant({
        strengthId: row.strengthId,
        formatId: row.formatId,
        supplierId: row.supplierId,
        strengthName: row.strengthMg
      });
    }
  };

  const presentationColumns = useMemo(() => {
    if (isDiagnostic) {
      return [
        {
          header: 'Panel / Test Variant',
          field: 'strengthMg',
          width: '28%',
          render: (row) => {
            const val = String(row.strengthMg || '');
            return (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.86rem' }}>
                  {val}
                </span>
                {row.isCurrentlyActive ? (
                  <span style={{
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    Active ✓
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(row);
                    }}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Set Active
                  </button>
                )}
              </div>
            );
          }
        },
        {
          header: 'Format',
          field: 'format',
          width: '18%',
          render: (row) => <span style={{ color: '#475569', fontWeight: 600 }}>{row.format || 'Diagnostic Kit'}</span>
        },
        {
          header: 'Specimen Matrix',
          field: 'recommendedDiluent',
          width: '20%',
          render: (row) => <span style={{ color: '#0284c7', fontWeight: 700 }}>{row.recommendedDiluent}</span>
        },
        {
          header: 'Methodology & Tech',
          field: 'concentrationMgMl',
          width: '18%',
          render: (row) => <span style={{ color: '#003666', fontWeight: 750 }}>{row.concentrationMgMl}</span>
        },
        {
          header: 'Lab & Turnaround',
          field: 'route',
          width: '16%',
          render: (row) => (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.70rem',
              fontWeight: 750,
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              whiteSpace: 'nowrap'
            }}>
              🔬 {row.route}
            </span>
          )
        }
      ];
    }

    return [
      {
        header: 'Strength',
        field: 'strengthMg',
        width: '20%',
        render: (row) => {
          const val = String(row.strengthMg || '');
          const displayDose = val.toLowerCase().includes('mg') || val.toLowerCase().includes('mcg') || val.toLowerCase().includes('g') ? val : `${val} mg`;
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 850, color: '#003666', fontFamily: 'monospace', fontSize: '0.90rem' }}>
                {displayDose}
              </span>
              {row.isCurrentlyActive ? (
                <span style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  Active ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(row);
                  }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#003666';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#003666';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  Set Active
                </button>
              )}
            </div>
          );
        }
      },
      {
        header: 'Format',
        field: 'format',
        width: '20%',
        render: (row) => <span style={{ color: '#475569', fontWeight: 600 }}>{row.format}</span>
      },
      {
        header: 'Vehicle / Diluent',
        field: 'recommendedDiluent',
        width: '24%',
        render: (row) => <span style={{ color: '#0284c7', fontWeight: 700 }}>{row.recommendedDiluent}</span>
      },
      {
        header: 'Concentration / Volume',
        field: 'concentrationMgMl',
        width: '18%',
        render: (row) => <span style={{ color: '#003666', fontWeight: 750 }}>{row.concentrationMgMl}</span>
      },
      {
        header: 'Route & Delivery',
        field: 'route',
        width: '18%',
        render: (row) => {
          const r = String(row.route || row.format || '').toLowerCase();
          const isSpray = r.includes('nasal') || r.includes('spray');
          const isPen = r.includes('pen');
          const isOral = r.includes('oral') || r.includes('capsule');
          return (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.70rem',
              fontWeight: 750,
              background: isSpray ? '#fdf4ff' : isPen ? '#eff6ff' : isOral ? '#fffbeb' : '#f0fdf4',
              color: isSpray ? '#86198f' : isPen ? '#1d4ed8' : isOral ? '#b45309' : '#166534',
              border: isSpray ? '1px solid #f0abfc' : isPen ? '1px solid #bfdbfe' : isOral ? '1px solid #fde68a' : '1px solid #bbf7d0',
              whiteSpace: 'nowrap'
            }}>
              {isSpray ? '👃 Intranasal' : isPen ? '💉 SubQ Pen' : isOral ? '💊 Oral Solid' : '🧪 SubQ Injection'}
            </span>
          );
        }
      }
    ];
  }, [isDiagnostic, handleRowClick]);

  const presentationData = (presentationMatrixRows && presentationMatrixRows.length > 0)
    ? presentationMatrixRows.map((row, idx) => ({
        id: row.key || `row-${idx}`,
        formatId: isDiagnostic ? 'diagnostic_kit' : row.formatId,
        strengthId: row.strengthId,
        supplierId: row.supplierId,
        strengthMg: row.strengthName,
        format: isDiagnostic ? 'Diagnostic Specimen Collection Kit' : row.formatName,
        recommendedDiluent: isDiagnostic ? (product.sampleType || 'Capillary Whole Blood (DBS Whatman 903)') : row.diluentText,
        concentrationMgMl: isDiagnostic ? 'GC-FID / FAME Chromatography' : row.concText,
        route: isDiagnostic ? '5–7 Business Days (ISO 15189)' : row.adminText,
        isCurrentlyActive: row.isCurrentlyActive,
        isDiagnostic,
        rawRow: row
      }))
    : (product.variants && product.variants.length > 0)
      ? product.variants.map((v, idx) => {
          const vFmt = String(v.format || v.presentation || '').toLowerCase();
          const isVial = !isDiagnostic && !vFmt.includes('spray') && !vFmt.includes('sublingual') && !vFmt.includes('pen');
          const isVialSpray = !isDiagnostic && (vFmt.includes('spray') || vFmt.includes('nasal'));
          const isVialSublingual = !isDiagnostic && (vFmt.includes('sublingual') || vFmt.includes('drop'));
          const isVialPen = !isDiagnostic && (vFmt.includes('pen') || vFmt.includes('cartridge'));
          const sprayVol = String(v.fill_volume || v.pack_size || v.name || v.id || '').match(/(\d+(?:\.\d+)?)\s*m[lL]/i)?.[1] || (String(v.dosage || v.dose).includes('30') ? '4' : '10');
          const sprayCount = Math.round(Number(sprayVol) / 0.1);
          return {
            id: v.id || `var-${idx}`,
            formatId: isDiagnostic ? 'diagnostic_kit' : (v.format || v.presentation),
            strengthId: v.id || v.strength,
            supplierId: v.supplierId || null,
            strengthMg: v.dosage || v.dose || v.strength || (isDiagnostic ? '1 Perfil Lipídico Analítico + Valoración' : 'Standard'),
            format: isDiagnostic ? 'Diagnostic Specimen Collection Kit' : isVialSpray ? 'Nasal Spray' : isVialSublingual ? 'Sublingual Dropper' : isVialPen ? 'Pre-filled Pen' : (v.format || 'Lyophilized vial'),
            recommendedDiluent: isDiagnostic ? (product.sampleType || 'Capillary Whole Blood (DBS Whatman 903)') : isVialSpray ? 'Pre-metered Intranasal Solution' : isVialSublingual ? 'Sublingual Vehicle' : isVialPen ? 'Pre-filled Solution' : '1.0–2.0 mL BAC Water',
            concentrationMgMl: isDiagnostic ? 'GC-FID / FAME Chromatography' : isVialSpray ? `${sprayVol} mL (~${sprayCount} sprays)` : isVialPen ? '3.0 mL Pen' : '5.0 mg/mL',
            route: isDiagnostic ? '5–7 Business Days (ISO 15189)' : isVialSpray ? 'Intranasal (Needle-Free)' : isVialSublingual ? 'Sublingual' : isVialPen ? 'Subcutaneous Pen' : 'Subcutaneous',
            isCurrentlyActive: false,
            isDiagnostic
          };
        })
      : isDiagnostic
        ? [{
            id: 'test-kit-standard',
            formatId: 'diagnostic_kit',
            strengthMg: 'Complete Diagnostic Panel',
            format: 'Diagnostic Specimen Collection Kit',
            recommendedDiluent: product.sampleType || 'Capillary Whole Blood (DBS Whatman 903)',
            concentrationMgMl: 'GC-FID / FAME Chromatography',
            route: '5–7 Business Days (ISO 15189)',
            isCurrentlyActive: true,
            isDiagnostic: true
          }]
        : STANDARD_PRESENTATIONS.map((row) => ({
            id: `strength-${row.strengthMg}`,
            formatId: 'vial',
            strengthMg: row.strengthMg,
            format: 'Standard Lyophilized Vial',
            recommendedDiluent: row.diluentText,
            concentrationMgMl: row.concText,
            route: 'Subcutaneous Injection',
            isCurrentlyActive: false,
            isDiagnostic: false
          }));

  const hasBulkApi = useMemo(() => {
    if (isDiagnostic) return false;
    return true; // Active peptide substances always provide the cross-navigation B2B bridge to their Bulk API Raw Monograph
  }, [isDiagnostic]);

  const clinicalAvailableFormats = useMemo(() => {
    return (availableFormats || []).filter(f => {
      const fid = String(f.id || f.name || '').toLowerCase();
      return !fid.includes('bulk') && !fid.includes('api');
    });
  }, [availableFormats]);

  const clinicalPresentationData = useMemo(() => {
    return presentationData.filter(r => {
      const fid = String(r.formatId || r.format || '').toLowerCase();
      const st = String(r.strengthMg || '').toLowerCase();
      return !fid.includes('bulk') && !fid.includes('api') && !st.includes('bulk');
    });
  }, [presentationData]);

  const hasVials = useMemo(() => {
    return clinicalPresentationData.some(r => {
      const f = String(r.formatId || r.format || '').toLowerCase();
      return f.includes('vial') || (!f.includes('pen') && !f.includes('spray') && !f.includes('sublingual') && !f.includes('oral'));
    });
  }, [clinicalPresentationData]);
  const allAreReadyToUse = clinicalPresentationData.length > 0 && !hasVials;

  const filteredPresentationData = useMemo(() => {
    if (formatFilter === 'all') return clinicalPresentationData;
    return clinicalPresentationData.filter(row => {
      const fId = String(row.formatId || row.format || '').toLowerCase();
      const target = formatFilter.toLowerCase();
      return fId.includes(target) || target.includes(fId);
    });
  }, [clinicalPresentationData, formatFilter]);

  return (
    <div className="pds-tab-content pds-overview-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── A. Clinical Identity Card ── */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.65rem',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            A. Clinical Identity
          </h2>
          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            background: '#f1f5f9',
            color: '#475569',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            Authoritative Monograph Record
          </span>
        </div>

        <div className="pds-clinical-identity-grid">
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
              Generic / Non-Proprietary Name
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {genericName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
              Target Receptor Axis
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 750, color: '#0284c7' }}>
              {targetReceptor}
            </div>
          </div>

          {fdaRefProduct && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                FDA Reference Formulation
              </div>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1e40af',
                background: '#eff6ff',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe'
              }}>
                {fdaRefProduct}
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            Pharmacological Summary
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: '#334155',
            background: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {pharmacologicalSummary}
          </p>
        </div>
      </section>

      {/* ── B. Available Presentations: ONE Compact Table (GCP Context-Aware Standard) ── */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.65rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#003666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {isDiagnostic
                ? 'B. Diagnostic Specimen Requirements & Laboratory Parameters'
                : allAreReadyToUse ? 'B. Available Formulations & Delivery Dosimetry' : 'B. Available Presentations & Reconstitution Matrix'}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              {isDiagnostic
                ? 'Certified specimen matrix requirements, analytical methodology, and ISO 15189 turnaround times.'
                : allAreReadyToUse 
                  ? 'Pre-formulated ready-to-use clinical presentations with calibrated delivery mechanisms.'
                  : 'Standard reconstitution parameters targeting standard 5.0 mg/mL clinical concentration.'}
            </p>
          </div>

          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            background: isDiagnostic ? '#eff6ff' : allAreReadyToUse ? '#eff6ff' : '#f0fdf4',
            color: isDiagnostic ? '#1e40af' : allAreReadyToUse ? '#1e40af' : '#166534',
            border: isDiagnostic ? '1px solid #bfdbfe' : allAreReadyToUse ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {isDiagnostic ? 'ISO 15189:2022 Certified Lab' : allAreReadyToUse ? 'Pre-Formulated Sterile Solution' : 'ISO 11137 Sterile Lyophilized'}
          </span>
        </div>

        {/* Route / Presentation Fluid Segmented Filter Bar (GCP Standard) */}
        {clinicalAvailableFormats && clinicalAvailableFormats.length > 1 && (
          <div style={{
            marginBottom: '1rem',
            padding: '4px 6px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setFormatFilter('all');
                }}
                style={{
                  flex: '1 1 auto',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                  background: formatFilter === 'all' ? '#003666' : '#ffffff',
                  color: formatFilter === 'all' ? '#ffffff' : '#334155',
                  border: formatFilter === 'all' ? '1px solid #003666' : '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  fontWeight: formatFilter === 'all' ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: formatFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                All Formats ({clinicalPresentationData.length})
              </button>
              {clinicalAvailableFormats.map(fmt => {
                const fId = fmt.id;
                const isSelected = formatFilter === fId;
                const isSpray = fId.includes('spray') || fId.includes('nasal');
                const isPen = fId.includes('pen') || fId.includes('cartridge');
                const isVial = fId.includes('vial');
                const count = clinicalPresentationData.filter(r => {
                  const rf = String(r.formatId || r.format || '').toLowerCase();
                  return rf.includes(fId.toLowerCase()) || fId.toLowerCase().includes(rf);
                }).length;
                return (
                  <button
                    key={fId}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setFormatFilter(fId);
                    }}
                    style={{
                      flex: '1 1 auto',
                      minWidth: 'fit-content',
                      whiteSpace: 'nowrap',
                      background: isSelected ? '#003666' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    <span>{isSpray ? '👃' : isPen ? '💉' : isVial ? '🧪' : '💊'}</span>
                    <span>{fmt.name || fId}</span>
                    {count > 0 && (
                      <span style={{
                        opacity: isSelected ? 0.95 : 0.75,
                        fontSize: '0.68rem',
                        background: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: isSelected ? '#ffffff' : '#475569',
                        padding: '1px 5px',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Unified DataTable Component */}
        <DataTable
          columns={presentationColumns}
          data={filteredPresentationData}
          keyField="id"
          hideExpandColumn
          onRowClick={handleRowClick}
          mobileCardComponent={PresentationStrengthCard}
        />

        {/* B2B Pharmaceutical API / Raw Material Monograph Link */}
        {hasBulkApi && (
          <div style={{
            marginTop: '1rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderLeft: '4px solid #003666',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 260 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '6px',
                background: '#e0e7ff',
                color: '#3730a3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FlaskConical size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
                  {currentLang === 'es' ? 'Materia Prima Grado Farmacéutico (Bulk API)' : 'Pharmaceutical-Grade Bulk API & Raw Material'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {currentLang === 'es'
                    ? 'Disponible en lotes de 10g a 1kg con CoA analítico completo para Farmacias Formuladoras y CDMOs.'
                    : 'Available in 10g to 1kg batches with complete analytical CoA and DMF dossier for Compounding Pharmacies & CDMOs.'}
                </div>
              </div>
            </div>

            <a
              href={`/raw/${resolvedSlug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: '#003666',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'background 0.15s ease'
              }}
            >
              <span>{currentLang === 'es' ? 'Ver Monografía API' : 'View API Monograph'}</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        )}
      </section>

      {/* ── C. Key Clinical Considerations & CTA ── */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.65rem',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            C. Key Clinical Considerations
          </h2>
          <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
            Detailed pharmacopeia & literature available under References
          </span>
        </div>

        {/* Balanced 2x2 Grid (Desktop) and 1-Column (Mobile) */}
        <div className="pds-clinical-considerations-grid">
          {clinicalConsiderations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="pds-consideration-card">
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '7px',
                  borderRadius: '6px',
                  marginTop: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={16} color="#003666" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginBottom: '3px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a', lineHeight: 1.45 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Workspace Handoff CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 850, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#0284c7" />
              <span>{isDiagnostic ? 'Ready to review diagnostic protocols & interpretation guidelines?' : 'Ready to configure treatment protocols?'}</span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.76rem', color: '#475569' }}>
              {isDiagnostic
                ? 'Switch into the clinical protocol workspace to review specimen collection protocols, clinical cutoff ranges, and interpretation algorithms.'
                : 'Switch into the dedicated protocol workspace to select on-demand or multi-week protocols and compute exact requirements.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToProtocols}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#003666',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 750,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 54, 102, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{isDiagnostic ? 'Explore Diagnostic Protocols' : 'Explore Clinical Protocols'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
