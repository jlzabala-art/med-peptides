/**
 * METADATA ENRICHMENT — PHASE 3: Cognitive Support
 * Protocols: cog_001, cog_002
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PATH  = resolve(__dir, '../src/data/protocolBlueprintsV2.json');

const META = {
  cog_001: {
    scientificName: 'Semax & Selank ACTH/MSH-Derived Nootropic & Anxiolytic Protocol',
    description:
      '6-week intranasal neurocognitive protocol combining Semax BDNF/ACTH analog nootropism with Selank anxiolytic tuftsin-derived GABAergic modulation for focus, memory, and stress resilience.',
    longDescription:
      'Semax (Met-Glu-His-Phe-Pro-Gly-Pro) is a heptapeptide analogue of the ACTH(4-10) fragment developed by the Institute of Molecular Genetics (Russia). It upregulates BDNF and NGF in the hippocampus, enhances dopaminergic and serotonergic neurotransmission, and increases regional cerebral blood flow without stimulant side-effects (Dolotov OV et al., J Neurochem 2006; Eremin KO et al., Bull Exp Biol Med 2005). Selank (Thr-Lys-Pro-Arg-Pro-Gly-Pro) is a synthetic analogue of the immunomodulatory tetrapeptide tuftsin that potentiates GABAergic inhibition, reduces CRF-driven HPA axis hyperactivation, and upregulates BDNF, producing anxiolytic and cognitive-enhancing effects without dependence (Semenova TP et al., Bull Exp Biol Med 2010; Medvedev VE et al., Ther Arch 2015). The combination addresses the anxiety–cognition dyad: Selank reduces stress-induced cognitive interference while Semax directly augments executive function and memory consolidation.',
    primary_goal: 'Cognitive Support',
    references: [
      { pmid: '16805834', citation: 'Dolotov OV et al. Semax stimulates BDNF expression in the mouse brain. J Neurochem 2006;97(Suppl 1):82-86.' },
      { pmid: '16400394', citation: 'Eremin KO et al. Semax activates brain dopaminergic systems. Bull Exp Biol Med 2005;140:274-276.' },
      { pmid: '20737030', citation: 'Semenova TP et al. Selank anxiolytic effects. Bull Exp Biol Med 2010;150:65-67.' },
    ],
    keywords: ['Semax nootropic protocol', 'Selank anxiolytic peptide', 'BDNF peptide protocol', 'cognitive enhancement peptide', 'intranasal nootropic', 'ACTH analog peptide'],
  },

  cog_002: {
    scientificName: 'Semax & Pinealon Prefrontal–Hippocampal Neuro-Executive Protocol',
    description:
      '8-week dual intranasal/injectable protocol combining Semax BDNF induction with Pinealon epigenetic peptide bioregulation for executive function, neuroprotection, and cognitive longevity.',
    longDescription:
      'This protocol pairs Semax (ACTH-derived nootropic; see cog_001) with Pinealon (Glu-Asp-Arg), a tripeptide bioregulator isolated from pineal gland extract. Pinealon penetrates the blood-brain barrier and interacts with neuronal DNA regulatory elements, modulating gene expression involved in antioxidant defense, circadian signaling, and neuronal survival (Khavinson VKh et al., Neurosci Behav Physiol 2002; Khavinson V et al., Adv Gerontol 2013). Preclinical and Russian clinical data demonstrate Pinealon-mediated neuroprotection in hypoxia, ischemia, and age-related neurodegeneration models. By combining Semax (acute BDNF/NGF upregulation, improved cerebral blood flow) with Pinealon (epigenetic neuroprotection, gene-level antioxidant activity), this protocol targets both functional cognitive enhancement and structural neuroprotection — particularly relevant for aging populations, early cognitive decline, and post-ischemic recovery.',
    primary_goal: 'Cognitive Support',
    references: [
      { pmid: '12503660', citation: 'Khavinson VKh et al. Peptide regulation of aging. Neurosci Behav Physiol 2002;32:555-558.' },
      { pmid: '24212892', citation: 'Khavinson V et al. Peptide regulation of neurogenesis. Adv Gerontol 2013;26:27-37.' },
      { pmid: '16805834', citation: 'Dolotov OV et al. Semax stimulates BDNF expression. J Neurochem 2006;97(Suppl 1):82-86.' },
    ],
    keywords: ['Semax Pinealon protocol', 'epigenetic neuroprotection peptide', 'cognitive longevity protocol', 'Pinealon bioregulator', 'executive function peptide', 'neuroprotective peptide stack'],
  },
};

const protocols = JSON.parse(readFileSync(PATH, 'utf8'));
let updated = 0;
protocols.forEach(p => {
  if (META[p.protocol_id]) { p.metadata = META[p.protocol_id]; updated++; console.log(`✅ ${p.protocol_id}`); }
});
writeFileSync(PATH, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`\n🏁 Phase 3 done — ${updated} protocols.`);
