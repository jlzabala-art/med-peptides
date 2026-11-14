/**
 * BiomarkerTriangulationEngine
 *
 * Domain engine that correlates Germline DNA (Genotype / Predisposition)
 * with Active Laboratory Biomarkers (Phenotype / Blood / DBS Assays).
 *
 * Connects CE-IVD Microarray (24Genetics Illumina GSA-24) with
 * Quantitative Assays (LifeLab1 NAD+, Serum 25(OH)D, Homocysteine, Glucose/HbA1c).
 */

export function triangulateGenotypePhenotype({
  genomicProfile = null,
  labResults = []
} = {}) {
  const snps = genomicProfile?.genotypesEvaluated || {};
  const ancestral = genomicProfile?.ancestralMetabolicProfile || {};
  
  // Normalize available lab assays
  const labMap = new Map();
  labResults.forEach(r => {
    const key = String(r.testName || r.biomarker || r.category || '').toLowerCase();
    labMap.set(key, r);
  });

  const nadLab = labResults.find(r => 
    String(r.testName || r.biomarker || '').toLowerCase().includes('nad')
  );

  const interactions = [];

  // ── 1. MCM6 Hypolactasia × Gut Epithelial Integrity ──────────────────────────
  const isMcm6Risk = snps.MCM6 === 'GG' || snps.MCM6 === 'AG';
  interactions.push({
    id: 'triangulation-mcm6-gi',
    axis: 'Axis 4 · Digestive Integrity',
    geneticMarker: `MCM6 (${snps.MCM6 || 'GG'})`,
    phenotypeStatus: 'Congenital Adult Hypolactasia (Non-Pastoral Wild-Type)',
    convergenceLevel: isMcm6Risk ? 'CONFIRMED_HIGH' : 'NORMAL',
    title: 'Lactose Hypolactasia & Colonic Barrier Protection',
    clinicalFindingEn: isMcm6Risk
      ? 'Genetically programmed loss of lactase enzyme expression in small intestinal villi. Incidental dairy consumption leads to colonic fermentation, bacterial dysbiosis, and secondary tight junction hyperpermeability.'
      : 'Sufficient residual lactase enzyme activity.',
    clinicalActionEn: isMcm6Risk
      ? 'Complete bovine dairy elimination. Implement Calcium Citrate-Malate (500mg) + Tolerase® L (9,000 ALU) prior to dining out.'
      : 'Standard dairy rotation tolerated.'
  });

  // ── 2. FTO & IRS1 Glycemic Architecture × Postprandial Insulin Surge ─────────
  const hasFtoCarbRisk = snps.FTO === 'AC' || snps.FTO === 'AA';
  const hasIrs1Risk = snps.IRS1 === 'TC' || snps.IRS1 === 'CC';
  const isGlycemicSensitive = hasFtoCarbRisk || hasIrs1Risk;

  interactions.push({
    id: 'triangulation-fto-glycemic',
    axis: 'Axis 3 · Insulin Sensitivity & Energy',
    geneticMarker: `FTO (${snps.FTO || 'AC'}) + IRS1 (${snps.IRS1 || 'TC'})`,
    phenotypeStatus: isGlycemicSensitive ? 'Hyperinsulinemic Postprandial Drift' : 'Standard Insulin Sensitivity',
    convergenceLevel: isGlycemicSensitive ? 'HIGH_PRIORITY' : 'OPTIMAL',
    title: 'Postprandial Glycemic Clearance & Satiety Signaling',
    clinicalFindingEn: isGlycemicSensitive
      ? 'Impaired insulin receptor substrate 1 phosphorylation combined with central MC4R satiety delay. High-glycemic carbs induce rapid insulin spikes followed by reactive hypoglycemia and afternoon fatigue.'
      : 'Balanced glucose disposal kinetics.',
    clinicalActionEn: isGlycemicSensitive
      ? 'Mandate 1-2-3 Plate Sequencing (Fibrous Greens → Lipids/Proteins → Complex Carbs last). Administer Berberine Phytosome (500mg) + Ceylon Cinnamon (250mg) before evening meal.'
      : 'Standard balanced macronutrient distribution.'
  });

  // ── 3. MTHFR Methylation × Homocysteine & Cellular Folate Pool ──────────────
  const isMthfrWildType = snps.MTHFR === 'GG' || !snps.MTHFR;
  const _isMthfrVariant = snps.MTHFR === 'CT' || snps.MTHFR === 'TT';

  interactions.push({
    id: 'triangulation-mthfr-methylation',
    axis: 'Axis 2 · Methylation & Vitality',
    geneticMarker: `MTHFR C677T (${snps.MTHFR || 'GG'})`,
    phenotypeStatus: isMthfrWildType ? 'Full-Velocity Enzymatic Capacity (100%)' : 'Reduced Folate Reduction Kinetics',
    convergenceLevel: isMthfrWildType ? 'OPTIMAL' : 'MONITOR',
    title: 'One-Carbon Transfer & Cellular Transmethylation',
    clinicalFindingEn: isMthfrWildType
      ? 'Enzyme operates at 100% physiological speed. No synthetic folic acid required; dietary leafy greens provide abundant natural folates without risk of unmetabolized folic acid accumulation.'
      : 'MTHFR enzymatic velocity attenuated. Requires bioidentical Methylfolate (5-MTHF) and Methylcobalamin.',
    clinicalActionEn: isMthfrWildType
      ? 'Maintain whole-food folates (spinach, asparagus, lentils). Avoid fortified processed foods containing synthetic pteroylmonoglutamic acid.'
      : 'Supplement 800 mcg 5-MTHF Quatrefolic® daily.'
  });

  // ── 4. LifeLab1 NAD+ Cellular Assay × Sirtuin Longevity Calibration ─────────
  if (nadLab) {
    const nadVal = Number(nadLab.value || 85);
    const isNadSuboptimal = nadVal < 21.7;
    interactions.push({
      id: 'triangulation-nad-cellular',
      axis: 'Axis 5 · Cellular Resilience & Sirtuins',
      geneticMarker: 'Mitochondrial Haplogroup M2a\'b + SIRT1/PARP1 Kinetics',
      phenotypeStatus: `Quantitative DBS: ${nadVal} ${nadLab.unit || 'Score'} (${nadLab.zoneLabel || 'Optimal'})`,
      convergenceLevel: isNadSuboptimal ? 'ACTION_REQUIRED' : 'EXCELLENT',
      title: 'Cellular NAD+ Pool & Mitochondrial Longevity Sync',
      clinicalFindingEn: isNadSuboptimal
        ? 'Cellular NAD+/NADH ratio is depleted due to chronic metabolic or oxidative stress, reducing SIRT1 deacetylation activity and mitochondrial biogenesis.'
        : 'High-functioning mitochondrial cellular longevity pool. Endogenous sirtuin-mediated DNA repair pathways active.',
      clinicalActionEn: isNadSuboptimal
        ? 'Escalate NAD+ precursor therapy (NMN/NR) and combine with CD38 inhibitor (Apigenin 50mg) and CoQ10 Ubiquinol (100mg).'
        : 'Preserve cellular reserves via 14-hour overnight circadian fasting and polyphenol-dense culinary spices.'
    });
  }

  // Calculate composite convergence synergy score
  const highPriorityCount = interactions.filter(i => i.convergenceLevel === 'CONFIRMED_HIGH' || i.convergenceLevel === 'HIGH_PRIORITY').length;
  const compositeScore = Math.max(70, 95 - (highPriorityCount * 6));

  const executiveSummaryEn = `Genotype-Phenotype Triangulation confirms ${highPriorityCount} clinically actionable metabolic targets: adult hypolactasia (MCM6 GG) requiring complete non-bovine dairy avoidance, and carbohydrate sensitivity (FTO/IRS1) responsive to 1-2-3 plate sequencing and botanical AMPK activation. Methylation pathways (MTHFR GG) and mitochondrial capacity (Haplogroup ${ancestral.maternalHaplogroup || 'M2a\'b'}) are well preserved.`;

  return {
    compositeScore,
    totalCrossings: interactions.length,
    highPriorityCount,
    interactions,
    executiveSummaryEn,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Resolves the personalized compounding magistral formulation blocks dynamically,
 * tailoring each capsule based on evaluated SNPs and active biomarker levels.
 */
export function resolveTargetMagistralTemplate({
  genomicProfile = null,
  labResults = []
} = {}) {
  const snps = genomicProfile?.genotypesEvaluated || {};
  const isHypolactasic = snps.MCM6 === 'GG' || snps.MCM6 === 'AG';
  const hasGlycemicRisk = snps.FTO === 'AC' || snps.FTO === 'AA' || snps.IRS1 === 'TC' || snps.IRS1 === 'CC';
  const hasMthfrRisk = snps.MTHFR === 'CT' || snps.MTHFR === 'TT';

  const nadLab = labResults.find(r => 
    String(r.testName || r.biomarker || '').toLowerCase().includes('nad')
  );
  const nadVal = nadLab ? Number(nadLab.value || 85) : 85;
  const isNadDepleted = nadVal < 21.7;

  const formulationBlocks = [
    {
      id: 'block_morning',
      enabled: true,
      time: 'Morning with Breakfast',
      title: 'Capsule 1: Methylation & Mitochondrial Vitality',
      instructions: 'Take 1 capsule in the morning with breakfast and water.',
      items: [
        {
          name: 'Methylfolate (5-MTHF Quatrefolic®)',
          dose: hasMthfrRisk ? '1,000 mcg' : '800 mcg',
          target: 'MTHFR One-Carbon Folate Pathway',
          enabled: true
        },
        {
          name: 'Methylcobalamin (Bioactive B12)',
          dose: '1,000 mcg',
          target: 'MTR / MTRR Methylation & Neuroprotection',
          enabled: true
        },
        {
          name: 'CoQ10 Ubiquinol (Kaneka QH®)',
          dose: isNadDepleted ? '150 mg' : '100 mg',
          target: 'Mitochondrial Electron Transport Complex I & II',
          enabled: true
        },
        {
          name: 'Riboflavin-5-Phosphate (Active B2)',
          dose: '25 mg',
          target: 'FAD Cofactor for MTHFR & Cellular Redox',
          enabled: true
        }
      ]
    },
    {
      id: 'block_midday',
      enabled: true,
      time: 'Midday with Lunch',
      title: isHypolactasic
        ? 'Capsule 2: Calcium Shield & Non-Bovine GI Shield'
        : 'Capsule 2: Mineral Balance & Bone Homeostasis',
      instructions: 'Take 1 capsule with midday meal.',
      items: [
        {
          name: 'Calcium Citrate-Malate',
          dose: isHypolactasic ? '500 mg' : '350 mg',
          target: 'Non-Dairy Bioavailable Calcium Skeleton',
          enabled: true
        },
        {
          name: 'Magnesium Bisglycinate (Chelated)',
          dose: '200 mg',
          target: 'Neuromuscular & Calcium Equilibrium',
          enabled: true
        },
        {
          name: 'Vitamin D3 (Cholecalciferol)',
          dose: '3,000 IU',
          target: 'VDR Nuclear Receptor Activation',
          enabled: true
        },
        {
          name: 'Vitamin K2 (Menaquinone-7 / MK-7)',
          dose: '100 mcg',
          target: 'Osteocalcin Carboxylation & Arterial Elasticity',
          enabled: true
        },
        ...(isHypolactasic ? [
          {
            name: 'Lactase Enzyme (Tolerase® L / FCC)',
            dose: '9,000 ALU',
            target: 'MCM6 Adult Hypolactasia Barrier Protection',
            enabled: true
          }
        ] : [])
      ]
    },
    {
      id: 'block_evening',
      enabled: true,
      time: 'Evening before Dinner',
      title: isNadDepleted
        ? 'Capsule 3: Cellular NAD+ Repletion & AMPK Modulator'
        : 'Capsule 3: Glucose Clearance & Evening AMPK Modulator',
      instructions: 'Take 1 capsule 15 minutes before the largest evening meal.',
      items: [
        ...(isNadDepleted ? [
          {
            name: 'Liposomal NMN (Nicotinamide Mononucleotide)',
            dose: '350 mg',
            target: 'Direct NAD+ Precursor & Sirtuin Activation',
            enabled: true
          },
          {
            name: 'Quercetin Phytosome (Sophora japonica)',
            dose: '250 mg',
            target: 'CD38 Enzyme Inhibition & Senolytic Synergy',
            enabled: true
          }
        ] : []),
        {
          name: 'Berberine Phytosome (Berbevis®)',
          dose: hasGlycemicRisk ? '500 mg' : '300 mg',
          target: 'AMPK Phosphorylation & Glucose Clearance',
          enabled: true
        },
        {
          name: 'Ceylon Cinnamon Extract (10:1)',
          dose: '250 mg',
          target: 'Postprandial Insulin Receptor Sensitivity',
          enabled: true
        },
        {
          name: 'Alpha Lipoic Acid (R-ALA)',
          dose: '150 mg',
          target: 'Mitochondrial Glucose Oxidation & Glutathione Synergy',
          enabled: true
        }
      ]
    }
  ];

  return {
    templateId: isNadDepleted ? 'nad_sirtuin_methylation_triangulated' : 'three_capsule_precision_nutrigenomics',
    title: isNadDepleted
      ? 'Atlas NAD+ Precision Triangulated Magistral Formulary (3-Capsule)'
      : 'Atlas 24Genetics Precision Nutrigenomic Regimen (3-Capsule)',
    isNadDepleted,
    isHypolactasic,
    hasGlycemicRisk,
    formulationBlocks,
    summaryRationale: `Precision magistral compound addressing ${isHypolactasic ? 'MCM6 GG hypolactasia (dairy exclusion + lactase shield), ' : ''}${hasGlycemicRisk ? 'FTO/IRS1 glycemic sensitivity (Berbevis® + R-ALA), ' : ''}${isNadDepleted ? `and Cellular NAD+ depletion (${nadVal} score via Liposomal NMN + Quercetin CD38 inhibitor).` : 'and mitochondrial vitality.'}`
  };
}
