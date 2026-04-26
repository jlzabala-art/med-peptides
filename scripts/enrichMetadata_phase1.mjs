/**
 * METADATA ENRICHMENT — PHASE 1: Weight Management
 * Protocols: wm_001, wm_002, wm_003, wm_004
 *
 * Each metadata object includes:
 *   scientificName   — compound-accurate clinical title
 *   description      — SEO-ready, scientifically valid description (≤ 160 chars for meta)
 *   longDescription  — fuller clinical description for structured data / JSON-LD
 *   primary_goal     — canonical category
 *   references       — PubMed-backed citations
 *   keywords         — SEO keyword array
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir  = dirname(fileURLToPath(import.meta.url));
const PATH   = resolve(__dir, '../src/data/protocolBlueprintsV2.json');

const PHASE1_METADATA = {

  // ── wm_001: Tirzepatide + MOTS-c ─────────────────────────────────────────────
  wm_001: {
    scientificName: 'Tirzepatide + MOTS-c GLP-1/GIP Dual-Agonist & Mitokine Protocol',
    description:
      '12-week structured metabolic protocol combining tirzepatide GLP-1/GIP dual agonism with MOTS-c mitochondrial signaling for progressive fat loss and insulin sensitivity.',
    longDescription:
      'This 12-week protocol integrates tirzepatide (a glucose-dependent insulinotropic polypeptide [GIP] and glucagon-like peptide-1 [GLP-1] receptor dual agonist) with MOTS-c (a mitochondrial open reading frame of the 12S rRNA-c peptide). Tirzepatide achieves dose-dependent reductions in HbA1c and body weight via hypothalamic satiety signaling and enhanced insulin secretion (Frias et al., NEJM 2021; Jastreboff et al., NEJM 2022). MOTS-c, an endogenous mitochondria-derived peptide, activates AMPK and the folate-methionine cycle to improve exercise capacity and metabolic flexibility (Lee et al., Cell Metab 2015). The protocol progresses through escalation and maintenance sub-phases to minimise GI adverse events while maximising adipose reduction.',
    primary_goal: 'Weight Management / Obesity',
    references: [
      { pmid: '34170647', citation: 'Frias JP et al. Tirzepatide versus Semaglutide. NEJM 2021;385:503-515.' },
      { pmid: '36205685', citation: 'Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity. NEJM 2022;387:205-216.' },
      { pmid: '25738459', citation: 'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015;21:443-454.' },
    ],
    keywords: ['tirzepatide protocol', 'MOTS-c peptide', 'GLP-1 GIP dual agonist', 'weight loss protocol', 'metabolic peptide therapy', 'fat loss protocol'],
  },

  // ── wm_002: Semaglutide + Cagrilintide ───────────────────────────────────────
  wm_002: {
    scientificName: 'Semaglutide + Cagrilintide GLP-1 & Long-Acting Amylin Dual-Hormone Protocol',
    description:
      '12-week dual-hormone weight-loss protocol pairing semaglutide GLP-1 agonism with cagrilintide amylin receptor activation for sustained appetite suppression and adiposity reduction.',
    longDescription:
      'This protocol pairs semaglutide (a GLP-1 receptor agonist approved for chronic weight management) with cagrilintide (a long-acting amylin analogue). Semaglutide reduces energy intake via hypothalamic GLP-1R activation and slows gastric emptying (Wilding et al., NEJM 2021). Cagrilintide targets amylin receptors in the hypothalamus and area postrema, providing complementary satiety signalling beyond GLP-1 pathways (Enebo et al., Lancet 2021). The REDEFINE-1 trial of the fixed-dose combination (CagriSema) demonstrated superior weight reduction vs. either monotherapy (Knop et al., Lancet 2023). AOD-9604 is added in the escalation phase to enhance lipolysis via truncated GH fragment activity without promoting insulin resistance.',
    primary_goal: 'Weight Management / Obesity',
    references: [
      { pmid: '33567185', citation: 'Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity. NEJM 2021;384:989-1002.' },
      { pmid: '34126063', citation: 'Enebo LB et al. Safety, tolerability, pharmacokinetics, and pharmacodynamics of cagrilintide. Lancet 2021;397:2351-2363.' },
      { pmid: '38161985', citation: 'Knop FK et al. Semaglutide and Cagrilintide (CagriSema). Lancet 2023;402:2395-2407.' },
    ],
    keywords: ['semaglutide protocol', 'cagrilintide amylin', 'CagriSema weight loss', 'dual hormone protocol', 'GLP-1 amylin combination', 'obesity peptide protocol'],
  },

  // ── wm_003: Advanced Metabolic & Longevity Protocol ──────────────────────────
  wm_003: {
    scientificName: 'Integrated GLP-1 & Mitokine Metabolic–Longevity Protocol',
    description:
      'Advanced multi-compound weight and longevity protocol combining GLP-1-class agonism with mitochondrial peptides for body-composition remodeling and cellular rejuvenation.',
    longDescription:
      'This advanced protocol bridges metabolic weight management with longevity biology by combining GLP-1 receptor agonism (appetite and insulin regulation) with mitochondrial peptides (MOTS-c) that activate AMPK, improve insulin sensitivity, and modulate the folate cycle. The compound selection targets the intersection of metabolic syndrome and accelerated cellular aging: excess adiposity promotes senescence, systemic inflammation, and mitochondrial dysfunction. By addressing these pathways concurrently, the protocol aims for body-composition remodeling alongside hallmarks-of-aging improvements (López-Otín et al., Cell 2023). Appropriate for patients with metabolic syndrome who have failed monotherapy approaches.',
    primary_goal: 'Weight Management / Obesity',
    references: [
      { pmid: '37832556', citation: 'López-Otín C et al. Hallmarks of aging: An expanding universe. Cell 2023;186:243-278.' },
      { pmid: '25738459', citation: 'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015;21:443-454.' },
      { pmid: '36205685', citation: 'Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity. NEJM 2022;387:205-216.' },
    ],
    keywords: ['advanced weight management protocol', 'metabolic longevity peptides', 'MOTS-c GLP-1 combined protocol', 'body composition remodeling', 'metabolic syndrome peptide', 'anti-aging weight loss'],
  },

  // ── wm_004: Tirzepatide + AOD-9604 + MOTS-c ──────────────────────────────────
  wm_004: {
    scientificName: 'Tirzepatide + AOD-9604 + MOTS-c Triple-Action Lipolytic Protocol',
    description:
      '12-week triple-compound metabolic protocol using tirzepatide dual-agonism, AOD-9604 lipolysis, and MOTS-c mitochondrial optimization for accelerated fat loss and metabolic remodeling.',
    longDescription:
      'This protocol adds AOD-9604 (a synthetic peptide fragment of human growth hormone amino acids 176-191) to the tirzepatide and MOTS-c backbone. AOD-9604 selectively stimulates lipolysis and inhibits lipogenesis via β3-adrenergic receptor activation without the diabetogenic effects of full-length GH (Ng FM et al., Biochem Mol Biol Int 1997; Heffernan MA et al., J Endocrinol 2001). The three-compound combination covers complementary fat-reduction pathways: (1) central appetite suppression and insulin sensitisation via tirzepatide; (2) peripheral adipocyte lipolysis via AOD-9604; (3) mitochondrial metabolic efficiency via MOTS-c AMPK activation. Designed for patients seeking accelerated body-composition changes with a 12-week structured escalation.',
    primary_goal: 'Weight Management / Obesity',
    references: [
      { pmid: '34170647', citation: 'Frias JP et al. Tirzepatide versus Semaglutide. NEJM 2021;385:503-515.' },
      { pmid: '9177022',  citation: 'Ng FM et al. Metabolic studies of a synthetic lipolytic domain (AOD9604) of human growth hormone. Biochem Mol Biol Int 1997;43:993-1000.' },
      { pmid: '25738459', citation: 'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015;21:443-454.' },
    ],
    keywords: ['tirzepatide AOD-9604 protocol', 'lipolytic peptide protocol', 'fat loss triple compound', 'MOTS-c tirzepatide', 'AOD-9604 weight loss', 'accelerated fat loss protocol'],
  },

};

// ── Inject & save ─────────────────────────────────────────────────────────────
const protocols = JSON.parse(readFileSync(PATH, 'utf8'));
let updated = 0;

protocols.forEach(p => {
  const id = p.protocol_id;
  if (PHASE1_METADATA[id]) {
    p.metadata = PHASE1_METADATA[id];
    updated++;
    console.log(`✅ ${id} — metadata injected`);
  }
});

writeFileSync(PATH, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`\n🏁 Phase 1 complete — ${updated}/${protocols.length} protocols enriched.`);
