import React from 'react';
import { BookOpen, Layers, Activity, Microscope, Thermometer } from '@/lib/icons';

/**
 * PeptideResearchAccordions
 * Scientific details, specs, clinical guidelines, mechanism of action, and storage conditions.
 */
export default function PeptideResearchAccordions({ product, presentationClass = 'vial' }) {
  if (!product) return null;

  const descText =
    product.desc || product.description || product.marketingDescription || product.short_description;

  // Specifications items
  const specs = [];
  const formula = product.molecularFormula || product.molecular_formula;
  if (formula) specs.push({ label: 'Molecular Formula', value: formula });
  const rawMw = product.molecularWeight || product.molecular_weight;
  if (rawMw) specs.push({ label: 'Molecular Weight', value: typeof rawMw === 'number' || !isNaN(rawMw) ? `${rawMw} Da` : rawMw });
  const cas = product.casNumber || product.cas;
  if (cas) specs.push({ label: 'CAS Number', value: cas });
  if (product.sequence) specs.push({ label: 'Sequence', value: product.sequence, isSequence: true });
  const targetSys = product.targetSystem || product.target;
  if (targetSys) specs.push({ label: 'Target Receptor / Axis', value: targetSys });
  if (product.typeData?.typicalResearchUse) specs.push({ label: 'Typical Research Use', value: product.typeData.typicalResearchUse });
  const purityVal = product.purity || product.purity_level;
  if (purityVal) specs.push({ label: 'Purity Level', value: purityVal });
  const batch = product.batchNumber || product.lotNumber;
  if (batch) specs.push({ label: 'Batch / Lot Code', value: batch });

  // Clinical Guidelines
  const hasPK = !!product.pharmacokinetics;
  const rawDosage = product.typeData?.dosageRange || product.dosageRange || product.typeData?.dosage;
  const dosage =
    typeof rawDosage === 'object' && rawDosage !== null
      ? `${rawDosage.min ?? ''}${rawDosage.max ? `–${rawDosage.max}` : ''} ${rawDosage.unit ?? ''} ${rawDosage.frequency ? `(${rawDosage.frequency.replace(/_/g, ' ')})` : ''}`.trim()
      : rawDosage;

  const pk = product.pharmacokinetics || {};
  const clinicalRows = [
    dosage && { label: 'Dosage Range', value: dosage },
    pk?.half_life && { label: 'Half-life', value: pk?.half_life },
    pk?.bioavailability && { label: 'Bioavailability', value: pk?.bioavailability },
    pk?.route && { label: 'Route', value: Array.isArray(pk?.route) ? pk?.route.join(', ') : pk?.route },
    pk.onset && { label: 'Onset', value: pk.onset },
    pk.metabolism && { label: 'Metabolism', value: pk.metabolism },
    pk.elimination && { label: 'Elimination', value: pk.elimination },
  ].filter(Boolean);

  // Mechanism of Action
  const sciSummary = product.aiContent?.scientificSummary || product.scientificSummary;
  const moa = product.typeData?.mechanismOfAction || product.mechanismOfAction || product.typeData?.peptide?.mechanismOfAction;
  const mechanisms = product.mechanisms || [];

  // Stability & Storage
  const stability = product.stabilityNote || product.typeData?.stabilityNote;
  const storage = product.storage_conditions || product.typeData?.storage;
  const isVial = presentationClass === 'vial';
  const isLiquid = presentationClass === 'pen' || presentationClass === 'spray' || presentationClass === 'topical';
  const isOral = presentationClass === 'oral';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. Research Background */}
      {descText && (
        <details className="pd-accordion" open>
          <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} color="var(--primary)" />
            Research Background
          </summary>
          <div className="pd-accordion-content">
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              {descText}
            </p>
          </div>
        </details>
      )}

      {/* 2. Specifications */}
      {specs.length > 0 && (
        <details className="pd-accordion">
          <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} color="var(--primary)" />
            Specifications
          </summary>
          <div className="pd-accordion-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {specs.map((spec, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: spec.isSequence ? 'column' : 'row',
                    justifyContent: spec.isSequence ? 'flex-start' : 'space-between',
                    alignItems: spec.isSequence ? 'flex-start' : 'baseline',
                    padding: '0.45rem 0',
                    borderBottom: i < specs.length - 1 ? '1px solid var(--border)' : 'none',
                    gap: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {spec.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      fontWeight: 500,
                      textAlign: spec.isSequence ? 'left' : 'right',
                      wordBreak: 'break-all',
                      fontFamily: spec.isSequence ? 'monospace' : 'inherit',
                      marginTop: spec.isSequence ? '0.25rem' : '0',
                      backgroundColor: spec.isSequence ? 'var(--color-bg-app)' : 'transparent',
                      padding: spec.isSequence ? '0.35rem 0.5rem' : '0',
                      borderRadius: spec.isSequence ? '4px' : '0',
                      border: spec.isSequence ? '1px solid var(--border)' : 'none',
                      width: spec.isSequence ? '100%' : 'auto',
                    }}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* 3. Clinical Guidelines */}
      {clinicalRows.length > 0 && (
        <details className="pd-accordion">
          <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="var(--primary)" />
            Clinical Guidelines
          </summary>
          <div className="pd-accordion-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {clinicalRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '0.45rem 0',
                    borderBottom: i < clinicalRows.length - 1 ? '1px solid var(--border)' : 'none',
                    gap: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {row.label}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, textAlign: 'right' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* 4. Research & Mechanism */}
      {(sciSummary || moa || mechanisms.length > 0) && (
        <details className="pd-accordion">
          <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Microscope size={16} color="var(--primary)" />
            Research &amp; Mechanism
          </summary>
          <div className="pd-accordion-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sciSummary && (
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Scientific Overview
                  </div>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                    {sciSummary}
                  </p>
                </div>
              )}

              {moa?.summary && (
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Mechanism of Action
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {moa.summary}
                  </p>
                </div>
              )}

              {moa?.researchFocus && moa.researchFocus.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Research Focus Areas
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                    {moa.researchFocus.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {mechanisms.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Associated Biological Pathways
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {mechanisms.map((mech, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.6rem',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          fontWeight: 650,
                        }}
                      >
                        {mech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </details>
      )}

      {/* 5. Stability & Storage */}
      {(stability || storage) && (
        <details className="pd-accordion">
          <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Thermometer size={16} color="var(--primary)" />
            Stability &amp; Storage
          </summary>
          <div
            className="pd-accordion-content"
            style={{
              backgroundColor: isVial ? '#fff8f0' : 'rgba(248, 250, 252, 0.5)',
              borderColor: isVial ? '#fed7aa' : 'var(--border)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stability ? (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: isVial ? '#92400e' : 'var(--text-main)',
                    margin: 0,
                    lineHeight: 1.5,
                    fontWeight: isVial ? 600 : 500,
                  }}
                >
                  {stability}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: isVial ? '#92400e' : 'var(--text-main)',
                    margin: 0,
                    lineHeight: 1.5,
                    fontWeight: isVial ? 600 : 500,
                  }}
                >
                  {isVial
                    ? 'Lyophilized peptides remain stable at room temperature during transit. Upon receipt, store in a laboratory freezer.'
                    : 'Store in a cool, dry place away from direct sunlight. Maintain at room temperature (15°C to 25°C).'}
                </p>
              )}

              {storage && (
                <div
                  style={{
                    marginTop: '0.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    borderTop: `1px solid ${isVial ? '#ffedd5' : 'var(--border)'}`,
                    paddingTop: '0.6rem',
                  }}
                >
                  {storage.dry && !isLiquid && !isOral && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: isVial ? '#b45309' : 'var(--text-muted)' }}>Storage (Dry):</span>
                      <span style={{ fontWeight: 600, color: isVial ? '#92400e' : 'var(--text-main)' }}>{storage.dry}</span>
                    </div>
                  )}
                  {storage.reconstituted && !isOral && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: isVial ? '#b45309' : 'var(--text-muted)' }}>
                        {isLiquid ? 'Storage:' : 'Storage (Liquid):'}
                      </span>
                      <span style={{ fontWeight: 600, color: isVial ? '#92400e' : 'var(--text-main)' }}>
                        {storage.reconstituted}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
