import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDataPath = path.resolve(__dirname, '../src/data/blogData.js');

const aiContentMap = {
  'biological-age': `# 🔬 Biological Age & Epigenetics
Biological age measures the functional state of organs and systems, reflecting the true rate of decline, unlike chronological age which is time-based.
- **DunedinPACE:** A third-generation epigenetic clock measuring the current pace of biological decline (aging speed) from a single blood draw.
- **PhenoAge:** Dr. Morgan Levine's clock incorporating clinical biomarkers of dysfunction (hs-CRP, Albumin, Glucose, etc.) to predict healthspan.
- **GrimAge:** Predicts mortality and cellular stress by training on plasma proteins.
- **Biomarkers:** hs-CRP (inflammaging), Cystatin C (kidney health), HbA1c (glycemic glycation), DHEA-S (adrenal androgen).
*Can biological age be reversed?* Yes, clinical trials suggest target-specific therapeutics (metformin, senolytics, peptides like Epitalon) and lifestyle interventions (caloric restriction, high-intensity exercise) can slow or temporarily reverse biological age.`,

  'bpc-157-recovery': `# 🩹 BPC-157 (Body Protective Compound-157)
A synthetic pentadecapeptide derived from gastric juice, researched for tissue-protective and regenerative properties in musculoskeletal and GI systems.
- **Angiogenesis:** Stimulates blood vessel growth by upregulating Vascular Endothelial Growth Factor Receptor 2 (VEGFR2).
- **Fibroblast Migration:** Promotes migration and proliferation of tendon and ligament fibroblasts.
- **WADA Status:** Strictly prohibited at all times by the World Anti-Doping Agency (WADA) under category "S0: Non-Approved Substances".
- **Human Trials:** Currently, there is a lack of large-scale human clinical trials. Most literature relies on animal models, so human dosages/safety remain unestablished.`,

  'epigenetics-lifestyle': `# 🧬 Epigenetics & Gene Expression
Epigenetics is the study of functional modifications to DNA and histones that alter gene expression without changing the primary genetic sequence.
- **DNA Methylation:** Addition of methyl groups to cytosine bases, typically silencing gene transcription in promoter regions. Diet rich in methyl donors (folate, choline, B12) supports healthy cycles.
- **Exercise-Induced Remodeling:** Triggers rapid, tissue-specific DNA methylation changes in metabolic and inflammatory genes.
- **Sirtuins:** NAD+-dependent deacetylases activated by caloric restriction and NAD+ precursors, promoting histone deacetylation and mitochondrial longevity.`,

  'mitochondrial-health': `# ⚡ Mitochondrial Health & Dynamics
Mitochondria regulate ATP production, cell survival, calcium homeostasis, and apoptosis. Age-related decay is marked by low ATP and high ROS.
- **Mitochondrial Dynamics:** Constant fusion (sharing resources) and fission (splitting to isolate damaged parts).
- **Mitophagy:** Selective autophagy of damaged mitochondria to prevent cellular oxidative stress.
- **PQQ (Pyrroloquinoline Quinone):** Stimulates mitochondrial biogenesis by interacting with CREB and PGC-1alpha.
- **NAD+ & Sirtuins:** High NAD+ levels fuel mitochondrial sirtuins (SIRT3, 4, 5) regulating citric acid cycle enzymes.`,

  'gut-microbiome': `# 🦠 Gut Microbiome & SCFAs
A complex ecosystem regulating metabolic homeostasis, synthesizing nutrients, and modulating the gut-brain axis.
- **Short-Chain Fatty Acids (SCFAs):** Acetate, propionate, and butyrate. Butyrate serves as primary fuel for colonocytes, promoting tight junction proteins (occludin, ZO-1) to maintain mucosal barrier integrity.
- **Akkermansia muciniphila:** Mucin-degrading bacterium that strengthens mucosal barrier; growth is promoted by polyphenols (green tea, pomegranate).`,

  'sleep-optimization': `# 🌙 Sleep Optimization & Brain Clearance
Sleep is a highly regulated active metabolic process essential for neuroplasticity, memory consolidation, and waste clearance.
- **Glymphatic System:** During slow-wave sleep (Non-REM N3), astrocytes channel cerebrospinal fluid (CSF) to rinse out toxic protein aggregates (amyloid-beta, tau).
- **Circadian Light Routine:** Bright morning sunlight suppresses melatonin and sets the circadian clock. Avoid blue light at night.
- **Adenosine & Sleep Pressure:** Adenosine builds during waking hours to create sleep pressure. Caffeine blocks adenosine receptors, disrupting sleep depth.`,

  'hormone-balancing': `# ⚖️ Hormone Balancing & Endocrine Health
Endocrine glands secrete hormones that regulate metabolism, growth, stress, and cognition. Feedback loops couple these systems tightly.
- **Pregnenolone Steal:** Chronic stress elevates cortisol, diverting precursor pregnenolone away from progesterone and DHEA toward cortisol production, lowering sex hormones.
- **Cortisol/DHEA Ratio:** An elevated ratio indicates chronic stress and anabolic-catabolic imbalance.
- **Thyroid Conversion:** T4 converts to active T3 via selenium-dependent deiodinase enzymes. Impaired by high cortisol and selenium/zinc deficiencies.`,

  'metabolic-flexibility': `# 🏃 Metabolic Flexibility
The capacity to adapt fuel oxidation to nutrient availability, shifting between glucose and fatty acid oxidation.
- **AMPK vs. mTOR:** AMPK is activated in energy-depleted states, promoting glucose uptake, fatty acid oxidation, and autophagy. mTOR is activated by high energy and amino acids, promoting protein synthesis and cell growth while suppressing autophagy.
- **Zone 2 Training:** Low-intensity training maximizing muscle mitochondrial lipid oxidation capacity and density.
- **Intermittent Fasting:** Depletes glycogen, triggering the metabolic shift toward beta-oxidation and ketone bodies.`,

  'vitamin-d-benefits': `# ☀️ Vitamin D (Calcitriol)
A secosteroid prohormone that binds to Vitamin D Receptors (VDR) across nucleated cells.
- **Innate Immunity:** VDR activation directly upregulates transcription of antimicrobial peptides (cathelicidin and beta-defensin).
- **Adaptive Immunity:** Promotes regulatory T-cell (Treg) differentiation while suppressing pro-inflammatory Th1/Th17 pathways.
- **Optimal Range:** 50-80 ng/mL of 25(OH)D is recommended for functional immune and metabolic health.`,

  'collagen-boost': `# 🧴 Collagen & Tissue Repair
Collagen is the primary structural protein in the extracellular matrix.
- **Plasma Absorption:** Hydrolyzed collagen peptides (Pro-Hyp, Hyp-Gly) are absorbed intact via the PEPT1 transporter, circulating in plasma.
- **Fibroblast Activation:** Bioactive peptides bind to integrin receptors, stimulating fibroblasts to synthesize Type I/III collagen, elastin, and hyaluronic acid.
- **Vitamin C:** Essential cofactor for prolyl and lysyl hydroxylase enzymes that stabilize collagen's triple-helix structure.`,

  'stress-resilience': `# 🧘 Stress Resilience & HRV
Chronic stress impairs hippocampal neuroplasticity, suppresses immunity, and accelerates biological aging.
- **Heart Rate Variability (HRV):** Measures variation in time intervals between consecutive heartbeats. Higher HRV indicates parasympathetic vagal tone activity.
- **Ashwagandha (KSM-66):** Adaptogen regulating HPA axis receptors, clinically shown to lower serum cortisol.
- **L-Theanine:** Boosts GABA and alpha-wave brain activity, inducing calm focus.`,

  'anti-aging-supplements': `# 💊 Longevity Supplements
Longevity interventions target upstream cellular hallmarks of aging (mitochondrial decay, cellular senescence, nutrient-sensing dysregulation).
- **Sirtuins & NAD+:** Sirtuins are NAD+-dependent deacetylases. NAD+ precursors (NR/NMN) raise intracellular NAD+, restoring sirtuin activity.
- **Senolytics:** Quercetin, Dasatinib, or Fisetin selectively target anti-apoptotic pathways (SCAPs) in senescent cells to clear them, stopping pro-inflammatory SASP secretions.`,

  'nad-cellular-decline': `# 🧬 NAD+ Cellular Decline
Nicotinamide Adenine Dinucleotide (NAD+) is an essential redox cofactor and substrate for Sirtuins and PARPs.
- **Decline Drivers:** High CD38 expression (membrane glycohydrolase) driven by low-grade inflammation, and high PARP activity (triggered by DNA damage), consume and deplete cellular NAD+ pools.
- **Mitochondrial Consequences:** Depleted mitochondrial NAD+ impairs electron transport chain activity, reducing ATP synthesis and accelerating cellular senescence.`,

  'nad-test-results': `# 📊 NAD+ Testing & Interpretation
NAD+ levels are quantified in clinical settings using dried blood spot (DBS) testing.
- **Dried Blood Spot Testing:** Stabilizes intracellular NAD+ on high-grade filter cards for mass spectrometry or enzymatic assays.
- **Micromolar (μM) Levels:** Optimal range is 30–50+ μM (typical of young, metabolically healthy cohorts). Deficient range is <15 μM.
- **Interventions:** Sub-optimal results are addressed via NAD+ precursors (NMN, NR), CD38 inhibitors (Apigenin, Quercetin), and HIIT.`,

  'nad-vs-nadh': `# ⚡ NAD+ vs. NADH
The ratio of oxidized (NAD+) to reduced (NADH) Nicotinamide Adenine Dinucleotide is a primary marker of cellular redox state.
- **Biological Difference:** NAD+ accepts electrons during glycolysis and Krebs cycle; NADH donates electrons to the mitochondrial electron transport chain (Complex I) to drive ATP synthesis.
- **Redox Ratio:** A high NAD+/NADH ratio is essential for sirtuin activation and metabolic health. Declining ratios indicate mitochondrial impairment and glycation stress.`,

  'epithalon-pinealon-sleep': `# 🌙 Epithalon & Pinealon (Sleep & Circadian)
Short bioregulatory peptides researched for pineal gland and circadian rhythm optimization.
- **Epithalon (Epitalon):** A tetrapeptide (Ala-Glu-Asp-Gly) shown to stimulate melatonin secretion, restore circadian rhythms, and upregulate telomerase enzyme activity.
- **Pinealon:** A tripeptide (Glu-Asp-Arg) targeting brain tissues to improve cognitive function, circadian sleep-wake cycles, and neuroprotection.
- **Administration & Storage:** Administered subcutaneously or intranasally. Unreconstituted vials stored at -20°C; reconstituted peptide must be refrigerated (2°C-8°C) and used within 30 days.`,

  'growth-hormone-secretagogues': `# ⚖️ Growth Hormone Secretagogues (Ipamorelin & Sermorelin)
Compounds that stimulate endogenous growth hormone (GH) secretion from the pituitary gland.
- **Sermorelin:** A GHRH analog that binds to pituitary GHRH receptors, preserving the natural feedback loop.
- **Ipamorelin:** A selective ghrelin receptor agonist that stimulates pulsatile GH release with high specificity.
- **Pituitary Desensitization:** Using pulsatile dosing (5 days on, 2 days off) and avoiding continuous receptor saturation prevents tachyphylaxis and pituitary desensitization.`,

  'semax-selank-cognition': `# 🧠 Semax & Selank (Cognitive & Mood)
Synthetic peptide analogs developed by the Russian Academy of Sciences.
- **Semax:** ACTH(4-7) analog that stimulates BDNF and NGF expression, improving memory consolidation and focus.
- **Selank:** Tuftsin analog that modulates GABAergic neurotransmission, reducing anxiety without sedation or motor impairment.
- **Reconstitution & Handling:** Reconstituted with bacteriostatic water, stored refrigerated (2°C-8°C), and handled gently to prevent denaturation of the peptide bonds.`,

  'bpc-157-tb-500-synergy': `# 🔗 BPC-157 & TB-500 Synergy
The co-administration of BPC-157 and Thymosin Beta-4 (TB-500) represents a synergistic stack for musculoskeletal repair.
- **Complementary Pathways:** BPC-157 upregulates VEGFR2 receptor expression and recruits local fibroblasts. TB-500 (acting via actin-sequestering) promotes systemic cell migration and tissue elasticity.
- **Musculoskeletal Applications:** Promotes healing of high-tension, low-blood-flow tissues like tendons, ligaments, and cartilage.
- **Protocol Guidelines:** Typical cycles run 6-8 weeks followed by a 4-week washout phase. Vials must be stored at -20°C before reconstitution.`,

  'incretin-mimetics-metabolism': `# ⚡ Incretin Mimetics (Semaglutide & Tirzepatide)
Peptide agonists targeting metabolic pathways, insulin sensitivity, and satiety.
- **Semaglutide:** Selective GLP-1 receptor agonist that delays gastric emptying and reduces hypothalamic appetite signaling.
- **Tirzepatide:** Dual GLP-1 and GIP receptor agonist, providing enhanced glycemic control and metabolic rate amplification.
- **Precautions & Reconstitution:** Reconstituted with sterile bacteriostatic water and stored refrigerated. Potential risks include pancreatitis, gastrointestinal adverse effects, and thyroid C-cell tumor warnings in animal models.`,

  'thymic-peptides-immunity': `# 🛡️ Thymic Peptides (Thymosin Alpha-1 & Thymulin)
Bioregulatory peptides that modulate immune function and reverse immunosenescence.
- **Thymosin Alpha-1:** Binds to TLR-2 and TLR-9 on dendritic cells, promoting T-lymphocyte differentiation and balancing cytokines (IFN-gamma, IL-2).
- **Thymulin:** A nonapeptide that requires a zinc ion co-factor to adopt its active conformation and promote T-cell maturation.
- **Handling & Storage:** Reconstituted with sterile water, stored refrigerated, and used within 30 days (Ta1) or 14-21 days (Thymulin) due to oxidation risk.`
};

let blogDataContent = readFileSync(blogDataPath, 'utf8');

// We will inject the aiContent right inside each post's object.
// We can locate each post object by looking for "slug: 'slug-name'"
// and then finding the "clinicalAIQuestions: [" block. We can insert it
// after the closing "]," of the clinicalAIQuestions array.

for (const [slug, aiContent] of Object.entries(aiContentMap)) {
  // Find where the slug is defined
  const slugIndex = blogDataContent.indexOf(`slug: '${slug}'`);
  if (slugIndex === -1) {
    console.error(`❌ Could not find slug: ${slug}`);
    process.exit(1);
  }
  
  // Find the next clinicalAIQuestions in this object
  const questionsIndex = blogDataContent.indexOf('clinicalAIQuestions: [', slugIndex);
  if (questionsIndex === -1) {
    console.error(`❌ Could not find clinicalAIQuestions for slug: ${slug}`);
    process.exit(1);
  }
  
  // Find the closing bracket of clinicalAIQuestions
  const closingBracketIndex = blogDataContent.indexOf('],', questionsIndex);
  if (closingBracketIndex === -1) {
    console.error(`❌ Could not find closing bracket of clinicalAIQuestions for slug: ${slug}`);
    process.exit(1);
  }
  
  // Format the aiContent string to match the JS template literal notation
  const indent = '    ';
  const aiContentProp = `\n${indent}aiContent: \`${aiContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,`;
  
  // Insert the aiContentProp right after the clinicalAIQuestions closing "],"
  const insertionPoint = closingBracketIndex + 2;
  blogDataContent = 
    blogDataContent.slice(0, insertionPoint) + 
    aiContentProp + 
    blogDataContent.slice(insertionPoint);
  
  console.log(`✅ Injected aiContent for: ${slug}`);
}

// Write the updated file back
writeFileSync(blogDataPath, blogDataContent, 'utf8');
console.log('🎉 Successfully updated blogData.js');
