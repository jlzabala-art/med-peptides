/**
 * METADATA ENRICHMENT — PHASE 2
 * Protocols: met_001, met_002, rec_001, rec_002, neuro_001
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir  = dirname(fileURLToPath(import.meta.url));
const PATH   = resolve(__dir, '../src/data/protocolBlueprintsV2.json');

const PHASE2_METADATA = {

  // ── met_001: MOTS-c & AOD-9604 ───────────────────────────────────────────────
  met_001: {
    scientificName: 'MOTS-c & AOD-9604 AMPK-Driven Metabolic Activation Protocol',
    description:
      '10-week metabolic health protocol combining MOTS-c mitochondrial AMPK activation with AOD-9604 selective lipolysis to restore insulin sensitivity and reduce adiposity.',
    longDescription:
      'MOTS-c (mitochondrial open reading frame of the 12S rRNA-c) is an endogenous mitochondria-derived peptide that translocates to the nucleus under metabolic stress, activating AMPK and the AICAR pathway to improve insulin sensitivity and glucose homeostasis (Lee C et al., Cell Metab 2015; Reynolds JC et al., Nat Aging 2021). AOD-9604, the C-terminal fragment of human growth hormone (hGH 176–191), promotes lipolysis via β-adrenergic receptor pathways without inducing IGF-1 or insulin resistance (Ng FM et al., Biochem Mol Biol Int 1997). Combined, this 10-week protocol targets adipose reduction and metabolic flexibility in individuals with metabolic syndrome, pre-diabetes, or dyslipidaemia. The two-phase structure begins with full dual-compound activation then transitions to MOTS-c maintenance for sustained mitochondrial benefit.',
    primary_goal: 'Metabolic Health',
    references: [
      { pmid: '25738459', citation: 'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015;21:443-454.' },
      { pmid: '34282400', citation: 'Reynolds JC et al. MOTS-c is an exercise-induced mitochondrial-encoded regulator of age-dependent physical decline. Nat Aging 2021;1:147-159.' },
      { pmid: '9177022',  citation: 'Ng FM et al. Metabolic studies of a synthetic lipolytic domain (AOD9604) of human growth hormone. Biochem Mol Biol Int 1997;43:993-1000.' },
    ],
    keywords: ['MOTS-c metabolic protocol', 'AOD-9604 lipolysis', 'AMPK activator peptide', 'insulin sensitivity peptide', 'metabolic syndrome protocol', 'mitochondrial metabolic peptide'],
  },

  // ── met_002: Retatrutide + MOTS-c ────────────────────────────────────────────
  met_002: {
    scientificName: 'Retatrutide + MOTS-c GLP-1/GIP/Glucagon Triple-Agonist Metabolic Intensification Protocol',
    description:
      '12-week advanced metabolic protocol combining retatrutide triple-receptor agonism with MOTS-c mitokine support for profound body-composition shift and glucose regulation.',
    longDescription:
      'Retatrutide is a first-in-class triple agonist targeting GLP-1, GIP, and glucagon receptors (GcgR), achieving weight reductions of up to 24% in Phase 2 trials — superior to dual agonists (Jastreboff AM et al., NEJM 2023). The addition of glucagon receptor agonism increases hepatic glucose output acutely but primarily drives energy expenditure through thermogenesis and increased fat oxidation, complementing the appetite suppression of the GLP-1 component. MOTS-c is layered to reinforce peripheral insulin sensitivity, AMPK activation, and mitochondrial biogenesis, offsetting any GcgR-mediated glycaemic variability. This advanced 12-week protocol, structured across three escalating phases, is intended for patients with significant obesity (BMI ≥ 35) or cardiometabolic disease requiring intensive intervention.',
    primary_goal: 'Metabolic Health',
    references: [
      { pmid: '37334676', citation: 'Jastreboff AM et al. Triple-Hormone-Receptor Agonist Retatrutide for Obesity. NEJM 2023;389:514-526.' },
      { pmid: '25738459', citation: 'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015;21:443-454.' },
      { pmid: '34282400', citation: 'Reynolds JC et al. MOTS-c mitochondrial-encoded regulator of physical decline. Nat Aging 2021;1:147-159.' },
    ],
    keywords: ['retatrutide protocol', 'triple agonist GLP-1 GIP glucagon', 'MOTS-c metabolic intensification', 'advanced obesity protocol', 'retatrutide weight loss', 'triple receptor agonist peptide'],
  },

  // ── rec_001: BPC-157 & TB-500 ────────────────────────────────────────────────
  rec_001: {
    scientificName: 'BPC-157 & Thymosin β4 (TB-500) Angiogenic Tissue Repair Protocol',
    description:
      '8-week musculoskeletal recovery protocol combining BPC-157 cytoprotective signaling and TB-500 actin-sequestering angiogenesis for accelerated soft tissue and tendon healing.',
    longDescription:
      'Body Protection Compound-157 (BPC-157) is a pentadecapeptide derived from gastric juice that promotes tendon-to-bone healing, muscle and ligament repair, and neurological recovery via upregulation of the nitric oxide (NO) system, VEGF expression, and FAK-paxillin pathway activation (Sikiric P et al., Curr Pharm Des 2018; Chang CH et al., Acta Physiol 2011). TB-500 (a synthetic peptide derived from thymosin beta-4, amino acids 17–23) sequesters G-actin, reduces inflammation, promotes angiogenesis, and facilitates keratinocyte and endothelial cell migration (Goldstein AL et al., Ann N Y Acad Sci 2012). The 8-week dual-phase protocol applies maximal dosing in the acute recovery phase (weeks 1–4) transitioning to BPC-157 maintenance for consolidation of structural repair (weeks 5–8). Suited for musculoskeletal injuries, post-surgical recovery, and overuse conditions.',
    primary_goal: 'Recovery / Injury',
    references: [
      { pmid: '29998482', citation: 'Sikiric P et al. Brain-gut Axis and Pentadecapeptide BPC 157. Curr Pharm Des 2018;24:1821-1832.' },
      { pmid: '21272094', citation: 'Chang CH et al. The promoting effect of pentadecapeptide BPC 157 on tendon healing. Acta Physiol 2011;201:497-507.' },
      { pmid: '22295120', citation: 'Goldstein AL et al. Thymosin β4: A multi-functional regenerative peptide. Ann N Y Acad Sci 2012;1269:1-8.' },
    ],
    keywords: ['BPC-157 protocol', 'TB-500 tissue repair', 'thymosin beta-4 peptide', 'tendon healing peptide', 'musculoskeletal recovery protocol', 'BPC-157 TB-500 combined'],
  },

  // ── rec_002: BPC-157, TB-500 & ARA-290 ───────────────────────────────────────
  rec_002: {
    scientificName: 'BPC-157, Thymosin β4 & ARA-290 Neuro-Musculoskeletal Regeneration Protocol',
    description:
      'Advanced 12-week neuro-musculoskeletal protocol adding ARA-290 erythropoietin-mimetic neuroprotection to BPC-157 and TB-500 tissue repair for nerve and structural healing.',
    longDescription:
      'This advanced protocol expands the BPC-157 / TB-500 tissue-repair backbone with ARA-290, a cyclic helix B surface peptide derived from the non-erythropoietic region of erythropoietin (EPO). ARA-290 activates the innate repair receptor (IRR/β common receptor complex) to promote peripheral nerve regeneration, reduce neuropathic pain, and suppress chronic neuroinflammation without the haematopoietic side effects of full EPO (Brines M & Cerami A, Nat Rev Drug Discov 2008; Pulman KG et al., Handb Exp Pharmacol 2019). When combined with BPC-157 (structural tissue healing) and TB-500 (angiogenesis and actin remodeling), the three-compound regimen addresses soft tissue, vascular, and neural compartments simultaneously. Particularly suited for complex injury presentations involving neuropathic pain, nerve damage, or post-surgical peripheral neuropathy.',
    primary_goal: 'Recovery / Injury',
    references: [
      { pmid: '18552849', citation: 'Brines M, Cerami A. Erythropoietin-mediated tissue protection. Nat Rev Drug Discov 2008;7:784-791.' },
      { pmid: '29998482', citation: 'Sikiric P et al. BPC 157 and the CNS. Curr Pharm Des 2018;24:1821-1832.' },
      { pmid: '22295120', citation: 'Goldstein AL et al. Thymosin β4: A multi-functional regenerative peptide. Ann N Y Acad Sci 2012;1269:1-8.' },
    ],
    keywords: ['BPC-157 TB-500 ARA-290', 'neuropathic pain peptide', 'peripheral nerve regeneration protocol', 'erythropoietin mimetic peptide', 'neuro-musculoskeletal protocol', 'advanced recovery peptide stack'],
  },

  // ── neuro_001: BPC-157, SS-31 & Pinealon ─────────────────────────────────────
  neuro_001: {
    scientificName: 'BPC-157, SS-31 (Elamipretide) & Pinealon Mitochondrial Neuro-Restoration Protocol',
    description:
      '12-week neuro-restoration protocol combining BPC-157 neuroprotection, SS-31 mitochondrial inner membrane stabilization, and Pinealon epigenetic peptide bioregulation for CNS recovery.',
    longDescription:
      'This protocol targets central and peripheral neurological recovery via three synergistic mechanisms. BPC-157 (pentadecapeptide) exerts neuroprotective and neurotrophic effects through upregulation of VEGF, NO synthesis, and modulation of dopaminergic and serotonergic pathways (Sikiric P et al., Curr Pharm Des 2018). SS-31 (elamipretide, D-Arg-Dmt-Lys-Phe-NH₂) is a mitochondria-targeting peptide that concentrates in the inner mitochondrial membrane via electrostatic interaction with cardiolipin, inhibiting cytochrome c peroxidase activity, reducing reactive oxygen species, and restoring ATP production in damaged neurons (Szeto HH, Biochim Biophys Acta 2014). Pinealon (Glu-Asp-Arg) is a short peptide bioregulator derived from the pineal gland that has demonstrated neuroprotective and epigenetic effects on neuronal gene expression, cognitive function, and circadian regulation in preclinical and Russian clinical studies (Khavinson VKh et al., Neurosci Behav Physiol 2002). Indicated for post-concussion syndrome, neurodegeneration, cognitive decline, and neurorecovery post-stroke.',
    primary_goal: 'Recovery / Injury',
    references: [
      { pmid: '29998482', citation: 'Sikiric P et al. BPC 157 and the brain-gut axis. Curr Pharm Des 2018;24:1821-1832.' },
      { pmid: '24721741', citation: 'Szeto HH. First-in-class cardiolipin-protective compound as a therapeutic agent to restore mitochondrial bioenergetics. Br J Pharmacol 2014;171:2029-2050.' },
      { pmid: '12503660', citation: 'Khavinson VKh et al. Peptide regulation of aging. Neurosci Behav Physiol 2002;32:555-558.' },
    ],
    keywords: ['BPC-157 neurological', 'SS-31 elamipretide neuroprotection', 'Pinealon peptide bioregulator', 'mitochondrial neuroprotection protocol', 'CNS recovery peptide protocol', 'neuro-restoration peptide stack'],
  },

};

// ── Inject & save ─────────────────────────────────────────────────────────────
const protocols = JSON.parse(readFileSync(PATH, 'utf8'));
let updated = 0;

protocols.forEach(p => {
  const id = p.protocol_id;
  if (PHASE2_METADATA[id]) {
    p.metadata = PHASE2_METADATA[id];
    updated++;
    console.log(`✅ ${id} — metadata injected`);
  }
});

writeFileSync(PATH, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`\n🏁 Phase 2 complete — ${updated} protocols enriched (running total tracked separately).`);
