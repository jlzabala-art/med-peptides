/**
 * METADATA ENRICHMENT — PHASE 5: Sleep Support
 * Protocols: sleep_001, sleep_002
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PATH  = resolve(__dir, '../src/data/protocolBlueprintsV2.json');

const META = {
  sleep_001: {
    scientificName: 'DSIP & Selank Delta-Sleep-Inducing & GABAergic Anxiolytic Sleep Restoration Protocol',
    description:
      '8-week sleep restoration protocol combining DSIP delta-wave sleep induction with Selank GABAergic anxiolysis to rebuild healthy sleep architecture and reduce cortisol-driven insomnia.',
    longDescription:
      'DSIP (Delta Sleep-Inducing Peptide; Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) is a nonapeptide first isolated from rabbit cerebral venous blood in 1977. It promotes delta (slow-wave) sleep by modulating hypothalamic-pituitary signaling, inhibiting somatostatin release, and modulating the GABA/glutamate balance in thalamic and cortical circuits (Schoenenberger GA & Monnier M, PNAS 1977; Seifritz E et al., Neuropsychopharmacology 1995). DSIP also exhibits anti-stress, antioxidant, and adaptogenic properties, normalising circadian ACTH and cortisol rhythms disrupted in chronic insomnia. Selank (tuftsin analogue) potentiates GABAergic inhibition and reduces CRF-mediated HPA hyperactivation — the dominant driver of sleep-onset insomnia and cortisol-mediated early waking (Semenova TP et al., Bull Exp Biol Med 2010). The 8-week protocol delivers dual-compound induction (weeks 1–4) followed by DSIP-only stabilisation (weeks 5–8), targeting sleep architecture normalisation rather than pharmacological sedation.',
    primary_goal: 'Sleep Support',
    references: [
      { pmid: '267943',   citation: 'Schoenenberger GA, Monnier M. Characterization of DSIP. PNAS 1977;74:1282-1286.' },
      { pmid: '8529972',  citation: 'Seifritz E et al. DSIP effects on nocturnal cortisol. Neuropsychopharmacology 1995;13:327-335.' },
      { pmid: '20737030', citation: 'Semenova TP et al. Selank anxiolytic effects. Bull Exp Biol Med 2010;150:65-67.' },
    ],
    keywords: ['DSIP sleep peptide protocol', 'Selank anxiolytic sleep', 'delta wave sleep peptide', 'cortisol insomnia protocol', 'sleep architecture restoration', 'peptide insomnia treatment'],
  },

  sleep_002: {
    scientificName: 'DSIP & Epithalon Circadian Rhythm & Telomere-Protective Sleep Protocol',
    description:
      '10-week circadian sleep protocol combining DSIP delta-wave induction with Epithalon pineal-melatonin and BMAL1 circadian gene restoration for sleep quality and longevity-oriented benefits.',
    longDescription:
      'This protocol combines DSIP (delta-wave sleep promotion and cortisol normalisation; see sleep_001) with Epithalon (Ala-Glu-Asp-Gly), a tetrapeptide bioregulator with documented effects on pineal melatonin synthesis and circadian gene expression. Epithalon stimulates melatonin secretion by the pineal gland and upregulates BMAL1 and CLOCK circadian transcription factors, which decline with age and are the primary molecular drivers of circadian amplitude loss and age-associated sleep disruption (Khavinson V et al., Adv Gerontol 2012; Anisimov VN et al., Mech Ageing Dev 2003). The combination targets both the neurotransmitter (GABA, delta-sleep) and the chronobiological (melatonin, circadian gene) dimensions of sleep regulation. Suited for age-related sleep disruption, shift workers, and patients with circadian misalignment. The 10-week structure allows Epithalon to produce progressive circadian recalibration while DSIP addresses acute sleep quality.',
    primary_goal: 'Sleep Support',
    references: [
      { pmid: '22497573', citation: 'Khavinson V et al. Epithalon and melatonin in circadian regulation. Adv Gerontol 2012;25:27-33.' },
      { pmid: '12706490', citation: 'Anisimov VN et al. Effect of Epitalon on biomarkers of aging. Mech Ageing Dev 2003;124:721-731.' },
      { pmid: '267943',   citation: 'Schoenenberger GA, Monnier M. Characterization of DSIP. PNAS 1977;74:1282-1286.' },
    ],
    keywords: ['DSIP Epithalon sleep protocol', 'circadian rhythm restoration peptide', 'melatonin peptide protocol', 'BMAL1 circadian peptide', 'sleep longevity protocol', 'Epithalon sleep support'],
  },
};

const protocols = JSON.parse(readFileSync(PATH, 'utf8'));
let updated = 0;
protocols.forEach(p => {
  if (META[p.protocol_id]) { p.metadata = META[p.protocol_id]; updated++; console.log(`✅ ${p.protocol_id}`); }
});
writeFileSync(PATH, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`\n🏁 Phase 5 done — ${updated} protocols.`);
