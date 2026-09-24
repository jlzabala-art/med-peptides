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
  Droplets,
  Clock, 
  Stethoscope, 
  Sun,
  Layers,
  FileCheck,
  Sparkles,
  Building2,
  Share2
} from 'lucide-react';

/**
 * Intelligent classifier for product categories & archetypes
 */
function detectProductFamily(row) {
  const name = String(row.canonicalName || row.name || row.id || '').toLowerCase();
  const cat = String(row.category || '').toLowerCase();
  const tags = (row.tags || []).map(t => String(t).toLowerCase());
  const types = getProductAvailableTypes(row).map(t => String(t).toLowerCase());
  const sample = String(row.sampleType || row.sample || '').toLowerCase();
  const pres = String(row.presentation || row.format || '').toLowerCase();
  const subcat = String(row.subcategory || '').toLowerCase();
  const supp = String(row.supplierId || row.supplierName || row.supplier || '').toLowerCase();

  // 1a. Capillary & Venous Blood Diagnostics (Bloodo DBS, finger-prick biomarker kits)
  const isBloodTest = 
    sample.includes('blood') ||
    sample.includes('dbs') ||
    sample.includes('capillary') ||
    pres.includes('blood_test') ||
    subcat.includes('blood') ||
    tags.some(t => t.includes('blood')) ||
    supp.includes('bloodo') ||
    name.includes('bloodo') ||
    (name.includes('test') && (name.includes('testosterone') || name.includes('hba1c') || name.includes('cortisol') || name.includes('omega') || name.includes('vitamin d') || name.includes('nad')));

  if (isBloodTest) {
    return 'blood_diagnostic';
  }

  // 1b. Saliva, Buccal & Genomics/Epigenetic DNA Tests (Eterna, TrichoTest, TeloTest, NutriGen...)
  if (
    types.includes('diagnostic') ||
    cat.includes('diagnostic') ||
    cat.includes('genomic') ||
    name.includes('test') ||
    name.includes('telotest') ||
    name.includes('trichotest') ||
    name.includes('nutrigen') ||
    name.includes('dna') ||
    name.includes('eterna') ||
    supp.includes('eterna') ||
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

  // 3a. Corporate & Institutional Services (B2B Supply Chain, Compounding Pharmacy, Corporate Legal/Residency)
  if (
    cat === 'corporate_services' ||
    row.isCorporateService === true ||
    row.serviceSubtype ||
    cat.includes('corporate') ||
    name.includes('b2b peptide supply') ||
    name.includes('compounding & custom formulation') ||
    name.includes('compounding service') ||
    name.includes('spanish company') ||
    name.includes('residence')
  ) {
    return 'corporate_service';
  }

  // 3b. Clinical Services & Consultations
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

  const getCleanCas = () => {
    const candidates = [
      row.cas,
      row.casNumber,
      row.cas_number,
      row.casNo,
      row.molecular?.casNumber,
      row.scientificData?.casNumber,
      fallbackData?.casNumber
    ];
    for (const c of candidates) {
      if (c && typeof c === 'string' && c.trim() !== '' && c !== 'Available on Request') {
        return c.trim();
      }
    }
    return '';
  };

  const molecular = {
    casNumber: getCleanCas(),
    molecularFormula: row.molecular?.molecularFormula || row.scientificData?.molecularFormula || row.molecularFormula || row.formula || fallbackData?.molecularFormula || '',
    molecularWeight: row.molecular?.molecularWeight || row.scientificData?.molecularWeight || row.molecularWeight || fallbackData?.molecularWeight || '',
    sequence: row.molecular?.sequence || row.scientificData?.sequence || row.sequence || '',
    pubchemCid: row.molecular?.pubchemCid || row.scientificData?.pubchemCid || row.pubchemCid || fallbackData?.pubchemCid || ''
  };
  const apiSpecs = row.apiSpecs || row.scientificData || {};
  
  const goalsList = Array.isArray(row.goals) && row.goals.length > 0 
    ? row.goals.map(g => getGoalLabel(g)).filter(Boolean).slice(0, 3).join(', ') 
    : (row.primaryGoal ? getGoalLabel(row.primaryGoal) : (row.goal ? getGoalLabel(row.goal) : (row.category ? getGoalLabel(row.category) : 'Therapeutic Formulation')));

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
         3a. BLOOD DIAGNOSTICS & CAPILLARY BIOMARKER KITS (Bloodo DBS)
         ───────────────────────────────────────────────────────────── */
      case 'blood_diagnostic': {
        const sampleText = row.sampleType || 'Capillary Blood (Dried Blood Spot - DBS)';
        const pNameLower = String(row.canonicalName || row.name || row.id || '').toLowerCase();
        
        // Resolve clinical methodology dynamically or per specific blood test
        const isTesto = pNameLower.includes('testosterone');
        const isNad = pNameLower.includes('nad');
        const isHba1c = pNameLower.includes('hba1c') || pNameLower.includes('hemoglobin');
        const isOmega = pNameLower.includes('omega');
        const isVitD = pNameLower.includes('vitamin d') || pNameLower.includes('vit-d');
        const isCortisol = pNameLower.includes('cortisol');

        let defaultMethodTitle = 'Quantitative LC-MS/MS & Immunoassays';
        let defaultMethodSub = 'LifeLab1 (Vilnius, Lithuania) • High Analytical Precision (RSD < 5%)';
        let defaultScopeTitle = goalsList || 'Endocrine & Metabolic Biomarker Profile';
        let defaultScopeSub = 'Quantitative capillary micro-sample analysis for targeted therapy optimization';

        if (isTesto) {
          defaultMethodTitle = 'CDC-Standardized LC-MS/MS & ECLIA';
          defaultMethodSub = 'Quantifies Total & Free Testosterone, SHBG, Albumin & Free Androgen Index';
          defaultScopeTitle = 'Hormonal Balance & Androgenic Health';
          defaultScopeSub = 'Monitors hypogonadism, anabolic/anti-aging therapies and physical vitality';
        } else if (isNad) {
          defaultMethodTitle = 'Enzymatic Cyclic Spectrophotometric Assay';
          defaultMethodSub = 'Measures Total Intracellular NAD (NAD⁺ & NADH) • Limit of Detection: 0.23 µmol/L';
          defaultScopeTitle = 'Mitochondrial Bioenergetics & Longevity';
          defaultScopeSub = 'Evaluates cellular energy depletion, PARP1/sirtuin activation & therapy response';
        } else if (isHba1c) {
          defaultMethodTitle = 'Turbidimetric Inhibition Immunoassay (TINIA)';
          defaultMethodSub = 'Standardized to IFCC & DCCT/NGSP Reference Laboratory Networks';
          defaultScopeTitle = 'Glycemic Regulation & Metabolic Longevity';
          defaultScopeSub = '3-month average glucose homeostasis & cardiometabolic risk monitoring';
        } else if (isOmega) {
          defaultMethodTitle = 'Capillary Gas Chromatography (GC-FID / GC-MS)';
          defaultMethodSub = 'Analyzes 24 fatty acids in erythrocyte membranes • Precision RSD < 4.5%';
          defaultScopeTitle = 'Cellular Inflammation & Cardiovascular Profile';
          defaultScopeSub = 'Omega-3 Index, Omega-6:3 ratio & trans-fatty acid cellular integration';
        } else if (isVitD) {
          defaultMethodTitle = 'Liquid Chromatography Tandem Mass Spectrometry (LC-MS/MS)';
          defaultMethodSub = 'Differentiates 25-OH Vitamin D2 and D3 with zero cross-reactivity';
          defaultScopeTitle = 'Immune, Bone & Endocrine Homeostasis';
          defaultScopeSub = 'Optimizes clinical dosing for osteo-immune resilience and hormonal health';
        } else if (isCortisol) {
          defaultMethodTitle = 'Electrochemiluminescence Immunoassay (ECLIA)';
          defaultMethodSub = 'Morning basal awakening calibration • High sensitivity LOD: 1.5 nmol/L';
          defaultScopeTitle = 'Adrenal Function & HPA Axis Stress Dynamics';
          defaultScopeSub = 'Identifies hypocortisolemia/burnout vs allostatic hypercortisolemic overload';
        }

        const methodTitle = row.methodology || defaultMethodTitle;
        const certTitle = row.labAccreditation || 'CE-IVD Marked (EU 2017/746 IVDR)';
        const tatTitle = row.turnaroundTime || '3 – 5 Business Days Processing';

        return (
          <>
            {/* Card 1: Sample Matrix */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  <Droplets size={13} />
                </div>
                <span className="meta-card-tag">Diagnostic Sample Matrix</span>
              </div>
              <div className="meta-card-title" style={{ color: '#dc2626' }}>
                {sampleText}
              </div>
              <div className="meta-card-sub">
                At-Home Finger-Prick Collection • Micro-sample Matrix Preservation
              </div>
            </div>

            {/* Card 2: Analytical Assay */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Activity size={13} />
                </div>
                <span className="meta-card-tag">Clinical Analytical Assay</span>
              </div>
              <div className="meta-card-title" style={{ color: '#059669' }}>
                {methodTitle}
              </div>
              <div className="meta-card-sub">
                {defaultMethodSub}
              </div>
            </div>

            {/* Card 3: Regulatory & Lab Standards */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <ShieldCheck size={13} />
                </div>
                <span className="meta-card-tag">Regulatory & Lab Standards</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0284c7' }}>
                {certTitle}
              </div>
              <div className="meta-card-sub">
                ISO 13485 & ISO 15189 Certified Clinical Diagnostics Laboratory (LifeLab1)
              </div>
            </div>

            {/* Card 4: Turnaround Time & Report */}
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <Clock size={13} />
                </div>
                <span className="meta-card-tag">Turnaround Time & Report</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0f172a' }}>
                {tatTitle}
              </div>
              <div className="meta-card-sub">
                Prepaid return logistics • Encrypted patient portal with actionable clinical report
              </div>
            </div>
          </>
        );
      }

      /* ─────────────────────────────────────────────────────────────
         3b. SALIVA / BUCCAL GENOMICS & EPIGENETIC KITS (Eterna, TrichoTest...)
         ───────────────────────────────────────────────────────────── */
      case 'genomics_diagnostic': {
        const sampleText = row.sampleType || 'Buccal Swab (Saliva DNA Matrix)';
        const methodText = row.methodology || 'High-Density DNA Microarray & qPCR Genotyping Technology';
        const certText = row.labAccreditation || 'CLIA / CAP / ISO 15189 Accredited Lab';
        const tatText = row.turnaroundTime || '10 – 14 Business Days Processing';

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
                {sampleText}
              </div>
              <div className="meta-card-sub">
                {methodText}
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
                {certText}
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
                {tatText}
              </div>
              <div className="meta-card-sub">
                Interactive digital portal report with actionable treatment formulas
              </div>
            </div>
          </>
        );
      }

      /* ─────────────────────────────────────────────────────────────
         4a. CORPORATE & INSTITUTIONAL B2B SERVICES
         ───────────────────────────────────────────────────────────── */
      case 'corporate_service': {
        const pNameLower = String(row.canonicalName || row.name || '').toLowerCase();
        const isSupplyChain = pNameLower.includes('supply chain') || pNameLower.includes('concierge');
        const isCompounding = pNameLower.includes('compounding') || pNameLower.includes('formulation');
        const isSpain = pNameLower.includes('spanish') || pNameLower.includes('enisa') || pNameLower.includes('residence');

        let scopeTitle = row.targetSystem || 'Institutional Supply & Service Agreement';
        let scopeSub = 'Dedicated corporate execution with SLA guarantees and volume pricing';
        let modalityTitle = 'Dedicated Account Concierge & B2B Desk';
        let modalitySub = 'Direct coordination via mobile app, WhatsApp and clinical liaison';
        let complianceTitle = row.purity || 'EU GMP & Regulatory Standards';
        let complianceSub = row.jurisdiction || 'European Union & International Commercial Distribution';
        let slaTitle = row.turnaroundTime || '24 – 48 Hours Processing SLA';
        let slaSub = 'Validated cold-chain logistics or legal fast-track milestone delivery';

        if (isSupplyChain) {
          scopeTitle = 'B2B Inventory Allocation & Cold-Chain Logistics';
          scopeSub = 'Pre-certified ≥99% lyophilized stock with batch reservation & lot locking';
          modalityTitle = 'Dedicated Account Manager & Concierge';
          modalitySub = 'Dual billing (Clinic Wholesale vs Patient Direct) & dual destination shipping';
          complianceTitle = 'RP-HPLC ≥ 99.0% · Validated Cold Freight';
          complianceSub = 'Calibrated digital data loggers and temperature-monitored air freight';
          slaTitle = '24 – 48 Hours Dispatch SLA';
          slaSub = 'Rapid fulfillment from active EU / UAE regional inventory holdings';
        } else if (isCompounding) {
          scopeTitle = 'Custom Formulation & Sterile Compounding';
          scopeSub = 'Bespoke concentrations, custom peptide blends & specialized delivery formats';
          modalityTitle = 'European Compounding Laboratory Desk';
          modalitySub = 'Physician prescription intake via dedicated mobile app or clinical email desk';
          complianceTitle = 'EU GMP Certified Pharmacy & Ph. Eur.';
          complianceSub = 'Manufactured in licensed European compounding laboratories with verified COA';
          slaTitle = '5 – 7 Working Days Turnaround';
          slaSub = 'Complete compounding, packaging and international cold-chain delivery';
        } else if (isSpain) {
          scopeTitle = '100% Spanish SL Acquisition & Residence';
          scopeSub = 'Turnkey existing corporate entity, Spanish CIF, and registered corporate office';
          modalityTitle = 'Notarial Deed & Legal Concierge';
          modalitySub = 'Full legal representation, NIE procurement & Spanish corporate bank account';
          complianceTitle = 'Law 14/2013 · ENISA Fast-Track Certified';
          complianceSub = '3-year EU renewable entrepreneur residence permit with full work authorization';
          slaTitle = 'Immediate Company Transfer (10-30d Permit)';
          slaSub = 'Priority government processing under Spanish startup & entrepreneurship act';
        }

        return (
          <>
            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#faf5ff', color: '#7e22ce' }}>
                  <Building2 size={13} />
                </div>
                <span className="meta-card-tag">Service Scope & Deliverables</span>
              </div>
              <div className="meta-card-title" style={{ color: '#7e22ce' }}>
                {scopeTitle}
              </div>
              <div className="meta-card-sub">
                {scopeSub}
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                  <Share2 size={13} />
                </div>
                <span className="meta-card-tag">Execution Modality & Channels</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0284c7' }}>
                {modalityTitle}
              </div>
              <div className="meta-card-sub">
                {modalitySub}
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <ShieldCheck size={13} />
                </div>
                <span className="meta-card-tag">Legal & Regulatory Framework</span>
              </div>
              <div className="meta-card-title" style={{ color: '#059669' }}>
                {complianceTitle}
              </div>
              <div className="meta-card-sub">
                {complianceSub}
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-card-header">
                <div className="meta-card-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <Clock size={13} />
                </div>
                <span className="meta-card-tag">Turnaround & Delivery SLA</span>
              </div>
              <div className="meta-card-title" style={{ color: '#0f172a' }}>
                {slaTitle}
              </div>
              <div className="meta-card-sub">
                {slaSub}
              </div>
            </div>
          </>
        );
      }

      /* ─────────────────────────────────────────────────────────────
         4b. CLINICAL SERVICES & CONSULTATIONS
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
                CAS: <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 800 }}>{getCleanCas(row) || 'N/A'}</span>
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
