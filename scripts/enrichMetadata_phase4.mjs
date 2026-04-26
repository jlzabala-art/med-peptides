/**
 * METADATA ENRICHMENT — PHASE 4: Longevity
 * Protocols: lon_001, lon_002
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PATH  = resolve(__dir, '../src/data/protocolBlueprintsV2.json');

const META = {
  lon_001: {
    scientificName: 'MOTS-c Mitokine AMPK-Activating Longevity Foundation Protocol',
    description:
      '12-week longevity protocol using MOTS-c mitochondria-derived peptide to activate AMPK, improve insulin sensitivity, and support cellular hallmarks of healthy aging.',
    longDescription:
      'MOTS-c (mitochondrial open reading frame of the 12S rRNA-c) is an endogenous mitochondria-derived peptide encoded within the mitochondrial genome — the first peptide shown to be transcribed from mitochondrial rRNA rather than nuclear DNA (Lee C et al., Cell Metab 2015). MOTS-c circulates systemically and translocates to the nucleus under metabolic stress, where it activates AMPK (AMP-activated protein kinase), regulates the folate–methionine cycle, and modulates gene expression related to metabolic homeostasis, antioxidant defense, and insulin sensitivity. Circulating MOTS-c levels decline significantly with age, linking its reduction to age-associated metabolic decline (Reynolds JC et al., Nat Aging 2021). This 12-week foundation protocol delivers sustained MOTS-c supplementation across two phases — activation and maintenance — targeting the mitochondrial and metabolic hallmarks of aging as defined by López-Otín et al. (Cell 2023).',
    primary_goal: 'Longevity',
    references: [
      { pmid: '25738459', citation: 'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015;21:443-454.' },
      { pmid: '34282400', citation: 'Reynolds JC et al. MOTS-c is an exercise-induced mitochondrial-encoded regulator of age-dependent physical decline. Nat Aging 2021;1:147-159.' },
      { pmid: '37832556', citation: 'López-Otín C et al. Hallmarks of aging: An expanding universe. Cell 2023;186:243-278.' },
    ],
    keywords: ['MOTS-c longevity protocol', 'AMPK activator peptide aging', 'mitochondria peptide longevity', 'cellular aging peptide', 'anti-aging mitokine', 'longevity peptide protocol'],
  },

  lon_002: {
    scientificName: 'Epithalon (Epitalon) + MOTS-c Telomere & Mitokine Circadian Longevity Protocol',
    description:
      '12-week longevity protocol combining Epithalon telomerase activation with MOTS-c mitochondrial AMPK signaling to target telomere attrition and metabolic aging hallmarks simultaneously.',
    longDescription:
      'Epithalon (Epitalon; Ala-Glu-Asp-Gly) is a synthetic tetrapeptide bioregulator developed by the St. Petersburg Institute of Bioregulation and Gerontology. It stimulates telomerase (TERT) activity in somatic cells, elongates telomeres in aged cell cultures, and has demonstrated life-extension effects in multiple animal models (Khavinson VKh et al., Bull Exp Biol Med 2003; Anisimov VN et al., Mech Ageing Dev 2003). Epithalon also modulates pineal melatonin secretion and normalises circadian gene expression (BMAL1, CLOCK), improving circadian amplitude — a key driver of healthy aging (Khavinson V et al., Adv Gerontol 2012). Combined with MOTS-c (mitochondrial AMPK activation, metabolic homeostasis, see lon_001), this protocol targets two independent pillars of the hallmarks of aging: replicative senescence/telomere shortening and mitochondrial dysfunction. The dual-phase structure allows maximal combined loading in weeks 1–6, followed by MOTS-c maintenance to sustain metabolic gains through week 12.',
    primary_goal: 'Longevity',
    references: [
      { pmid: '12833276', citation: 'Khavinson VKh et al. Epithalon peptide induces telomerase activity. Bull Exp Biol Med 2003;135:590-592.' },
      { pmid: '12706490', citation: 'Anisimov VN et al. Effect of Epitalon on life-span extension. Mech Ageing Dev 2003;124:721-731.' },
      { pmid: '25738459', citation: 'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015;21:443-454.' },
    ],
    keywords: ['Epithalon telomerase protocol', 'Epitalon longevity peptide', 'telomere elongation peptide', 'MOTS-c Epithalon protocol', 'circadian longevity protocol', 'anti-aging bioregulator peptide'],
  },
};

const protocols = JSON.parse(readFileSync(PATH, 'utf8'));
let updated = 0;
protocols.forEach(p => {
  if (META[p.protocol_id]) { p.metadata = META[p.protocol_id]; updated++; console.log(`✅ ${p.protocol_id}`); }
});
writeFileSync(PATH, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`\n🏁 Phase 4 done — ${updated} protocols.`);
