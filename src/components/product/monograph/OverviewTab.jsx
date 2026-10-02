"use client";

import React, { useState, useMemo } from 'react';
import { ArrowRight, Target, ShieldCheck, Activity, Clock, Syringe, Info, Sparkles } from '@/lib/icons';
import DataTable from '@/components/ui/DataTable';
import { STANDARD_PRESENTATIONS } from './monographCalculationEngine';
import { getFdaPeptideStatus } from '@/data/fdaPeptidesRegistry';
import { triggerHaptic } from '@/utils/haptics';

/**
 * OverviewTab
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 3: Overview Workspace
 * Answers: "What is this peptide and what presentations are available?"
 * Components:
 * A. Clinical Identity (Generic, Target/Receptor, Pharmacological summary, FDA reference)
 * B. Available Presentations (Multi-format segmented matrix with Route badging)
 * C. Key Clinical Considerations (Concise; deep literature deferred to References)
 */
export default function OverviewTab({
  product = {},
  presentationMatrixRows = [],
  activeFormat = null,
  availableFormats = [],
  onFormatChange,
  onSelectVariant,
  onNavigateToProtocols
}) {
  const isPt141 = (product.slug || product.canonicalName || product.name || '').toLowerCase().includes('pt-141') || (product.slug || '').toLowerCase().includes('pt141');
  const genericName = product.scientificName || product.chemical_name || product.genericName || (isPt141 ? 'Bremelanotide' : (product.canonicalName || product.name || ''));
  const targetReceptor = product.targetSystem || product.mechanism_of_action || (isPt141 ? 'Central Melanocortin MC3R / MC4R Receptors' : 'Target Receptor / Biomolecular Pathway');
  const pharmacologicalSummary = product.overview_summary || product.summary || product.description || product.desc || 
    (isPt141 ? 'Synthetic cyclic heptapeptide analogue of alpha-melanocyte-stimulating hormone (α-MSH). Acts centrally across the blood-brain barrier to stimulate hypothalamic melanocortin receptors (primarily MC3R and MC4R), promoting dopamine release in the medial preoptic area to restore sexual desire and arousal without vascular dependency.' : 'Authoritative pharmaceutical technical profile and clinical reference data for therapeutic peptides.');

  const fdaStatusObj = getFdaPeptideStatus(product.slug || product.canonicalName || product.name || '');
  const rawRef = product.referenceBrand 
    ? `${product.referenceBrand}${product.referenceApprovalYear ? ` (Approved ${product.referenceApprovalYear})` : ''}` 
    : (fdaStatusObj?.referenceBrand || (isPt141 ? 'Vyleesi® (bremelanotide injection 1.75 mg/0.3 mL, NDA 210583, FDA Approved June 2019)' : null));
  const fdaRefProduct = rawRef && String(rawRef).trim().length > 0 ? String(rawRef).trim() : null;

  // Determine dominant format
  const rawFmt = String(product.format || product.presentation || product.variants?.[0]?.format || '').toLowerCase();
  const isSpray = rawFmt.includes('spray') || rawFmt.includes('nasal');
  const isSublingual = rawFmt.includes('sublingual') || rawFmt.includes('drop');
  const isPen = rawFmt.includes('pen') || rawFmt.includes('cartridge');

  const defaultIndication = isPt141 
    ? 'Hypoactive Sexual Desire Disorder (HSDD) & Non-vascular Erectile Dysfunction'
    : (product.primaryIndication || product.indication || product.category || product.targetSystem || 'Targeted Physiological & Cellular Optimization');

  const defaultRoute = isSpray
    ? 'Intranasal Mucosal (Metered needle-free spray, 1–2 sprays per nostril)'
    : isSublingual
      ? 'Sublingual (Drops held under tongue for 60–90 seconds prior to swallowing)'
      : isPen
        ? 'Subcutaneous injection via calibrated multi-dose pen (lower abdomen or anterolateral thigh)'
        : 'Subcutaneous injection (lower abdomen or anterolateral thigh)';

  const defaultPk = isPt141
    ? 'Tmax: 45–60 min • Terminal t½: ~2.7 hours • On-demand duration: 8–12 hours'
    : (product.pharmacokineticsSummary || (product.eliminationHalfLife ? `Elimination t½: ${product.eliminationHalfLife} • Rapid target bioavailability` : 'High bioavailability across mucosal/subcutaneous administration routes'));

  const defaultDosing = isPt141
    ? 'Administer at least 45 minutes prior to anticipated activity (max 1 dose/24h, max 8 doses/month)'
    : (product.clinicalDosingWindow || (isSpray ? 'Daily morning administration or split protocol as directed by physician' : 'Follow physician clinical protocol and titration guidelines'));

  const clinicalConsiderations = [
    {
      label: 'Primary Indication / Axis',
      value: defaultIndication,
      icon: Target
    },
    {
      label: 'Administration Route',
      value: defaultRoute,
      icon: Syringe
    },
    {
      label: 'Pharmacokinetics',
      value: defaultPk,
      icon: Clock
    },
    {
      label: 'Clinical Dosing Window',
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

  const presentationColumns = [
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
        const isVial = r.includes('subcutaneous') && !isPen;
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

  const presentationData = (presentationMatrixRows && presentationMatrixRows.length > 0)
    ? presentationMatrixRows.map((row, idx) => ({
        id: row.key || `row-${idx}`,
        formatId: row.formatId,
        strengthId: row.strengthId,
        supplierId: row.supplierId,
        strengthMg: row.strengthName,
        format: row.formatName,
        recommendedDiluent: row.diluentText,
        concentrationMgMl: row.concText,
        route: row.adminText,
        isCurrentlyActive: row.isCurrentlyActive,
        rawRow: row
      }))
    : (product.variants && product.variants.length > 0)
      ? product.variants.map((v, idx) => {
          const vFmt = String(v.format || v.presentation || '').toLowerCase();
          const isVial = !vFmt.includes('spray') && !vFmt.includes('sublingual') && !vFmt.includes('pen');
          const isVialSpray = vFmt.includes('spray') || vFmt.includes('nasal');
          const isVialSublingual = vFmt.includes('sublingual') || vFmt.includes('drop');
          const isVialPen = vFmt.includes('pen') || vFmt.includes('cartridge');
          return {
            id: v.id || `var-${idx}`,
            formatId: v.format || v.presentation,
            strengthId: v.id || v.strength,
            supplierId: v.supplierId || null,
            strengthMg: v.dosage || v.dose || v.strength || 'Standard',
            format: isVialSpray ? 'Nasal Spray' : isVialSublingual ? 'Sublingual Dropper' : isVialPen ? 'Pre-filled Pen' : (v.format || 'Lyophilized vial'),
            recommendedDiluent: isVialSpray ? 'Pre-metered Intranasal Solution' : isVialSublingual ? 'Sublingual Vehicle' : isVialPen ? 'Pre-filled Solution' : '1.0–2.0 mL BAC Water',
            concentrationMgMl: isVialSpray ? '10 mL (~100 sprays)' : isVialPen ? '3.0 mL Pen' : '5.0 mg/mL',
            route: isVialSpray ? 'Intranasal (Needle-Free)' : isVialSublingual ? 'Sublingual' : isVialPen ? 'Subcutaneous Pen' : 'Subcutaneous',
            isCurrentlyActive: false
          };
        })
      : STANDARD_PRESENTATIONS.map((row) => ({
          id: `strength-${row.strengthMg}`,
          formatId: 'vial',
          strengthMg: row.strengthMg,
          format: 'Standard Lyophilized Vial',
          recommendedDiluent: row.diluentText,
          concentrationMgMl: row.concText,
          route: 'Subcutaneous Injection',
          isCurrentlyActive: false
        }));

  const hasVials = useMemo(() => {
    return presentationData.some(r => {
      const f = String(r.formatId || r.format || '').toLowerCase();
      return f.includes('vial') || (!f.includes('pen') && !f.includes('spray') && !f.includes('sublingual') && !f.includes('oral'));
    });
  }, [presentationData]);
  const allAreReadyToUse = presentationData.length > 0 && !hasVials;

  const filteredPresentationData = useMemo(() => {
    if (formatFilter === 'all') return presentationData;
    return presentationData.filter(row => {
      const fId = String(row.formatId || row.format || '').toLowerCase();
      const target = formatFilter.toLowerCase();
      return fId.includes(target) || target.includes(fId);
    });
  }, [presentationData, formatFilter]);

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
              {allAreReadyToUse ? 'B. Available Formulations & Delivery Dosimetry' : 'B. Available Presentations & Reconstitution Matrix'}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              {allAreReadyToUse 
                ? 'Pre-formulated ready-to-use clinical presentations with calibrated delivery mechanisms.'
                : 'Standard reconstitution parameters targeting standard 5.0 mg/mL clinical concentration.'}
            </p>
          </div>

          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            background: allAreReadyToUse ? '#eff6ff' : '#f0fdf4',
            color: allAreReadyToUse ? '#1e40af' : '#166534',
            border: allAreReadyToUse ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {allAreReadyToUse ? 'Pre-Formulated Sterile Solution' : 'ISO 11137 Sterile Lyophilized'}
          </span>
        </div>

        {/* Route / Presentation Fluid Segmented Filter Bar (GCP Standard) */}
        {availableFormats && availableFormats.length > 1 && (
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
                All Formats ({presentationData.length})
              </button>
              {availableFormats.map(fmt => {
                const fId = fmt.id;
                const isSelected = formatFilter === fId;
                const isSpray = fId.includes('spray') || fId.includes('nasal');
                const isPen = fId.includes('pen') || fId.includes('cartridge');
                const isVial = fId.includes('vial');
                const count = presentationData.filter(r => {
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
        />
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
              <span>Ready to configure treatment protocols?</span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.76rem', color: '#475569' }}>
              Switch into the dedicated protocol workspace to select on-demand or multi-week protocols and compute exact vial requirements.
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
            <span>Explore Clinical Protocols</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
