import React from 'react';
import CatalogErrorBoundary from '../CatalogErrorBoundary';
import VariantCompetitorComparisonTable from '../VariantCompetitorComparisonTable';
import { getPeptideScientificData } from '../../../../utils/knownPeptideData';
import { getProductAvailableTypes } from '../../../../utils/productNormalizer';
import { getGoalLabel } from '../../../../config/goals';
import { findSynergies } from '../../../../services/clinicalKnowledgeGraph';
import { 
  Dna, 
  Activity, 
  ShieldCheck, 
  Snowflake, 
  FlaskConical, 
  Droplet, 
  Clock, 
  Stethoscope, 
  Sun,
  Layers,
  FileCheck,
  Sparkles
} from 'lucide-react';

/**
 * Intelligent classifier for product categories & archetypes
 */
function detectProductFamily(row) {
  const name = String(row.canonicalName || row.name || row.id || '').toLowerCase();
  const cat = String(row.category || '').toLowerCase();
  const tags = (row.tags || []).map(t => String(t).toLowerCase());
  const types = getProductAvailableTypes(row).map(t => String(t).toLowerCase());

  // 1. Diagnostics & Genomics Tests
  if (
    types.includes('diagnostic') ||
    cat.includes('diagnostic') ||
    cat.includes('genomic') ||
    name.includes('test') ||
    name.includes('telotest') ||
    name.includes('trichotest') ||
    name.includes('nutrigen') ||
    name.includes('dna') ||
    tags.some(t => t.includes('genomics') || t.includes('test'))
  ) {
    return 'genomics_diagnostic';
  }

  // 2. Clinical Supplies, Diluents & Consumables
  if (
    types.includes('clinical_supplies') ||
    cat.includes('supplies') ||
    cat.includes('diluent') ||
    cat.includes('consumable') ||
    name.includes('bacteriostatic') ||
    name.includes('bac water') ||
    name.includes('sterile water') ||
    name.includes('syringe') ||
    name.includes('needle') ||
    name.includes('filter') ||
    name.includes('vial')
  ) {
    return 'clinical_supply';
  }

  // 3. Clinical Services & Consultations
  if (
    types.includes('service') ||
    cat.includes('service') ||
    cat.includes('consultation') ||
    name.includes('consultation') ||
    name.includes('membership') ||
    name.includes('review')
  ) {
    return 'clinical_service';
  }

  // 4. Vehicles, Compounding Bases, Topical Solutions & Excipients (TrichoSol, TrichoSerum, Pentravan, Nourivan, SyrSpend, VersaBase...)
  if (
    cat.includes('vehicle') ||
    cat.includes('base') ||
    cat.includes('compounding') ||
    cat.includes('tricholog') ||
    cat.includes('topical') ||
    name.includes('trichosol') ||
    name.includes('trichoserum') ||
    name.includes('trichotech') ||
    name.includes('pentravan') ||
    name.includes('nourivan') ||
    name.includes('syrspend') ||
    name.includes('versabase') ||
    name.includes('lipoderm') ||
    name.includes('gel base') ||
    name.includes('cream base') ||
    name.includes('shampoo base') ||
    name.includes('foam base')
  ) {
    return 'galenic_vehicle';
  }

  // 5. Default: Synthetic Peptides & Active Pharmaceutical APIs
  return 'peptide_api';
}

export default function CatalogVariantExpander({
  product: row,
  commercialChannel = 'cost',
  onOpenPricingDrawer
}) {
  const pTypes = getProductAvailableTypes(row);
  const pType = row.primaryType || pTypes[0] || 'finished_product';
  const family = detectProductFamily(row);
  const fallbackData = getPeptideScientificData(row.canonicalName || row.name || row.id);

  const molecular = {
    casNumber: row.molecular?.casNumber || row.scientificData?.casNumber || row.casNumber || fallbackData?.casNumber || '',
    molecularFormula: row.molecular?.molecularFormula || row.scientificData?.molecularFormula || row.molecularFormula || row.formula || fallbackData?.molecularFormula || '',
    molecularWeight: row.molecular?.molecularWeight || row.scientificData?.molecularWeight || row.molecularWeight || fallbackData?.molecularWeight || '',
    sequence: row.molecular?.sequence || row.scientificData?.sequence || row.sequence || '',
    pubchemCid: row.molecular?.pubchemCid || row.scientificData?.pubchemCid || row.pubchemCid || fallbackData?.pubchemCid || ''
  };
  const apiSpecs = row.apiSpecs || row.scientificData || {};
  
  const goalsList = Array.isArray(row.goals) && row.goals.length > 0 
    ? row.goals.map(g => getGoalLabel(g) || g).slice(0, 3).join(', ') 
    : (row.primaryGoal || row.goal || (row.category ? row.category.charAt(0).toUpperCase() + row.category.slice(1) : 'Therapeutic Formulation'));

  const gradeLabel = row.grade 
    ? (row.grade === 'finished' ? 'Injectable Ready / Finished' : row.grade === 'raw_api' ? 'Raw Material API' : row.grade === 'clinical_grade' ? 'Clinical Grade' : row.grade) 
    : (pType === 'api_raw_material' ? 'Pharma Raw API' : 'Medical Reference Grade');
  const purityLabel = apiSpecs.purityPercentage ? `≥ ${apiSpecs.purityPercentage}% HPLC` : (row.purity || '≥ 99.0% Reference Spec');
  const targetMechanism = row.targetSystem || row.mechanismOfAction || apiSpecs.targetSystem || apiSpecs.mechanismOfAction || fallbackData?.targetSystem || fallbackData?.mechanismOfAction || 'Selective cellular signaling & metabolic optimization';
  const saltCounterIon = apiSpecs.counterIon || row.salt || 'Acetate';

  // Render cards based on product family
  const renderFamilyMetadataCards = () => {
    switch (family) {
      /* ─────────────────────────────────────────────────────────────
         1. VEHICLES & COMPOUNDING BASES (TrichoSol, TrichoSerum, Pentravan...)
         ───────────────────────────────────────────────────────────── */
      case 'galenic_vehicle': {
        const isTricho = String(row.canonicalName || row.name || '').toLowerCase().includes('tricho');
        const techName = isTricho ? 'TrichoTech™ Phytocomplex Delivery Base' : (row.technology || 'Patented Advanced Vehicle Matrix');
        const compNotes = isTricho 
          ? 'Compatible with: Minoxidil, Finasteride, Dutasteride, Latanoprost & Peptides'
          : 'High compatibility with active APIs, hormones & cosmetic peptides';

        return (
          <>
            {/* Card 1: Galenic Technology */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                  <FlaskConical size={13} />
                </div>
                <span className="meta-card-tag">Galenic Technology & Matrix</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0284c7' }}>
                {techName}
              </div>
              <div className="meta-card-sub">
                Alcohol-Free • Non-Greasy • Liposomal Delivery Vector • Paraben-Free
              </div>
            </div>

            {/* Card 2: Compounding Compatibility */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Activity size={13} />
                </div>
                <span className="meta-card-tag">Compounding Compatibility</span>
              </div>
              <div className="meta-card-title" style={{ color: '#059669' }}>
                {goalsList || 'Hair Follicle & Scalp Delivery'}
              </div>
              <div className="meta-card-sub">
                {compNotes}
              </div>
            </div>

            {/* Card 3: Quality & Compounding Grade */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#faf5ff', color: '#7c3aed' }}>
                  <ShieldCheck size={13} />
                </div>
                <span className="meta-card-tag">Pharmaceutical Grade Excipient</span>
              </div>
              <div className="meta-card-title" style={{ color: '#7c3aed' }}>
                USP / NF Compounding Standards
              </div>
              <div className="meta-card-sub">
                COA Backed • pH Range: 5.0 – 6.0 • Dermal & Scalp Tolerance Verified
              </div>
            </div>

            {/* Card 4: Storage & Handling */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <Sun size={13} />
                </div>
                <span className="meta-card-tag">Storage & Handling Protocol</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0f172a' }}>
                Controlled Room Temp (15°C to 25°C)
              </div>
              <div className="meta-card-sub">
                Protect from excessive heat • Ready to Use Solution • Do NOT Freeze
              </div>
            </div>
          </>
        );
      }

      /* ─────────────────────────────────────────────────────────────
         2. CLINICAL SUPPLIES & DILUENTS (BAC Water, Syringes...)
         ───────────────────────────────────────────────────────────── */
      case 'clinical_supply': {
        const isWater = String(row.canonicalName || row.name || '').toLowerCase().includes('water');
        const specName = isWater ? 'USP Sterile Bacteriostatic Grade Water' : (row.canonicalName || 'Sterile Clinical Supply');
        const presNote = isWater ? '0.9% Benzyl Alcohol Preservative • pH 4.5 – 7.0 • Pyrogen-Free' : 'Medical Grade Sterility • Latex-Free';

        return (
          <>
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                  <Droplet size={13} />
                </div>
                <span className="meta-card-tag">Supply Specification</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0284c7' }}>
                {specName}
              </div>
              <div className="meta-card-sub">
                {presNote}
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Activity size={13} />
                </div>
                <span className="meta-card-tag">Clinical Application</span>
              </div>
              <div className="meta-card-title" style={{ color: '#059669' }}>
                Peptide & Hormone Reconstitution
              </div>
              <div className="meta-card-sub">
                Multi-Dose Diluent for Lyophilized Peptide Formulations
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#faf5ff', color: '#7c3aed' }}>
                  <ShieldCheck size={13} />
                </div>
                <span className="meta-card-tag">Sterility & Compliance</span>
              </div>
              <div className="meta-card-title" style={{ color: '#7c3aed' }}>
                0.22 µm Sterile Filtered • Type I Glass
              </div>
              <div className="meta-card-sub">
                Tamper-Evident Flip-Off Seal • Self-Sealing Medical Septum
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <Clock size={13} />
                </div>
                <span className="meta-card-tag">Usage & Expiration Protocol</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0f172a' }}>
                Room Temp (15°C to 25°C) Sealed
              </div>
              <div className="meta-card-sub">
                Post-Puncture: Discard after 28 days • Refrigerate once pierced (2°C to 8°C)
              </div>
            </div>
          </>
        );
      }

      /* ─────────────────────────────────────────────────────────────
         3. DIAGNOSTICS & GENOMIC TESTING KITS (TrichoTest, TeloTest...)
         ───────────────────────────────────────────────────────────── */
      case 'genomics_diagnostic': {
        return (
          <>
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                  <Dna size={13} />
                </div>
                <span className="meta-card-tag">Genomic Methodology & Sample</span>
              </div>
              <div className="meta-card-title" style={{ color: '#7c3aed' }}>
                Buccal Swab (Saliva DNA Matrix)
              </div>
              <div className="meta-card-sub">
                High-Density DNA Microarray & qPCR Genotyping Technology
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Activity size={13} />
                </div>
                <span className="meta-card-tag">Clinical Genetic Scope</span>
              </div>
              <div className="meta-card-title" style={{ color: '#059669' }}>
                {goalsList || 'Personalized Pharmacogenomics'}
              </div>
              <div className="meta-card-sub">
                Analyzes key single nucleotide polymorphisms (SNPs) for customized dosing
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <ShieldCheck size={13} />
                </div>
                <span className="meta-card-tag">Diagnostic Certification</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0284c7' }}>
                CLIA / CAP / ISO 15189 Accredited Lab
              </div>
              <div className="meta-card-sub">
                Evidence-based clinical decision support algorithm (Grade A/B clinical studies)
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <Clock size={13} />
                </div>
                <span className="meta-card-tag">Turnaround Time & Report</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0f172a' }}>
                10 – 14 Business Days Processing
              </div>
              <div className="meta-card-sub">
                Interactive digital portal report with actionable treatment formulas
              </div>
            </div>
          </>
        );
      }

      /* ─────────────────────────────────────────────────────────────
         4. CLINICAL SERVICES & CONSULTATIONS
         ───────────────────────────────────────────────────────────── */
      case 'clinical_service': {
        return (
          <>
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                  <Stethoscope size={13} />
                </div>
                <span className="meta-card-tag">Service Modality</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0284c7' }}>
                Telemedicine & Clinical Review
              </div>
              <div className="meta-card-sub">
                Conducted by Board-Certified Licensed Physicians
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Activity size={13} />
                </div>
                <span className="meta-card-tag">Clinical Scope</span>
              </div>
              <div className="meta-card-title" style={{ color: '#059669' }}>
                {goalsList || 'Medical Optimization & Protocol Review'}
              </div>
              <div className="meta-card-sub">
                Digital Prescription & Personalized Treatment Regimen
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#faf5ff', color: '#7c3aed' }}>
                  <ShieldCheck size={13} />
                </div>
                <span className="meta-card-tag">Regulatory & Privacy</span>
              </div>
              <div className="meta-card-title" style={{ color: '#7c3aed' }}>
                HIPAA & GDPR Compliant
              </div>
              <div className="meta-card-sub">
                End-to-end encrypted medical record custody
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <Clock size={13} />
                </div>
                <span className="meta-card-tag">Turnaround & SLA</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0f172a' }}>
                24 – 48 Hours Clinical Review
              </div>
              <div className="meta-card-sub">
                Direct physician messaging & progress monitoring
              </div>
            </div>
          </>
        );
      }

      /* ─────────────────────────────────────────────────────────────
         5. PEPTIDES & ACTIVE PHARMACEUTICAL APIs (Default)
         ───────────────────────────────────────────────────────────── */
      default: {
        return (
          <>
            {/* 1. Molecular & CAS Identity */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                  <Dna size={13} />
                </div>
                <span className="meta-card-tag">Molecular Identity</span>
              </div>
              <div className="meta-card-title">
                CAS: <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 800 }}>{molecular.casNumber || 'Available on Request'}</span>
              </div>
              <div className="meta-card-sub">
                {molecular.molecularFormula ? `Formula: ${molecular.molecularFormula}` : 'Standard Reference API'}
                {molecular.molecularWeight ? ` • MW: ${molecular.molecularWeight} g/mol` : ''}
                {molecular.pubchemCid ? ` • CID: ${molecular.pubchemCid}` : ''}
              </div>
            </div>

            {/* 2. Therapeutic Classification & Indications */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Activity size={13} />
                </div>
                <span className="meta-card-tag">Therapeutic Indications</span>
              </div>
              <div className="meta-card-title" style={{ color: '#059669' }}>
                {goalsList}
              </div>
              <div className="meta-card-sub">
                Target / Mechanism: <strong style={{ color: '#334155', fontWeight: 600 }}>{targetMechanism}</strong>
              </div>
            </div>

            {/* 3. Quality & Regulatory Grade */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <ShieldCheck size={13} />
                </div>
                <span className="meta-card-tag">Quality & Regulatory Grade</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0284c7' }}>
                {gradeLabel} • {purityLabel}
              </div>
              <div className="meta-card-sub">
                COA Backed: <strong style={{ color: '#334155', fontWeight: 600 }}>{row.hasCOA !== false ? 'Verified Lab Documentation' : 'On Demand'}</strong> • Salt: <strong style={{ color: '#334155', fontWeight: 600 }}>{saltCounterIon}</strong>
              </div>
            </div>

            {/* 4. Storage & Stability Protocol */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                  <Snowflake size={13} />
                </div>
                <span className="meta-card-tag">Storage & Stability Protocol</span>
              </div>
              <div className="meta-card-title">
                {row.requiresColdChain !== false ? 'Cold Chain Required (2°C to 8°C)' : 'Controlled Room Temp (15°C to 25°C)'}
              </div>
              <div className="meta-card-sub">
                Stability: <strong style={{ color: '#334155', fontWeight: 600 }}>Lyophilized formulation • Protect from direct light</strong>
              </div>
            </div>
          </>
        );
      }
    }
  };

  return (
    <CatalogErrorBoundary>
      <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border)', borderRadius: '0 0 8px 8px', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Canonical Product-Level Metadata Grid (2x2 Balanced Layout) */}
        <div style={{ width: '100%' }}>
          <style>{`
            .scientific-metadata-grid-2x2 {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 0.75rem;
              width: 100%;
            }
            .meta-card {
              background-color: #ffffff;
              padding: 0.85rem 1rem;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 4px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
              transition: all 0.15s ease;
            }
            .meta-card-header {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .meta-card-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 22px;
              height: 22px;
              border-radius: 5px;
              flex-shrink: 0;
            }
            .meta-card-tag {
              font-size: 0.68rem;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta-card-title {
              font-size: 0.85rem;
              font-weight: 700;
              color: #0f172a;
              margin-top: 2px;
            }
            .meta-card-sub {
              font-size: 0.72rem;
              color: #64748b;
              white-space: normal;
              line-height: 1.35;
            }
            @media (max-width: 640px) {
              .scientific-metadata-grid-2x2 {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
          <div className="scientific-metadata-grid-2x2">
            {renderFamilyMetadataCards()}
          </div>
        </div>

        {/* Clinical Knowledge Graph Synergistic Compounding Insight */}
        {(() => {
          const synergies = findSynergies(row);
          if (!synergies || !synergies.synergisticCompanions || synergies.synergisticCompanions.length === 0) return null;
          return (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#7c3aed" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Clinical Knowledge Graph • Synergistic Compounding Matrix
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                  Optimal pH: {synergies.suggestedPh}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                {synergies.synergisticCompanions.map((c, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    color: '#334155'
                  }}>
                    <strong style={{ color: '#0f172a' }}>{c.name}</strong> ({c.suggestedDose}): <span style={{ color: '#64748b' }}>{c.rationale}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Variant-Level Competitor Benchmark Table */}
        <VariantCompetitorComparisonTable
          product={row}
          variants={row.variants}
          channel={commercialChannel}
          onOpenPricingDrawer={(p) => {
            onOpenPricingDrawer?.(p);
          }}
        />
      </div>
    </CatalogErrorBoundary>
  );
}
