/**
 * METADATA ENRICHMENT — PHASE 6: Hormonal Support
 * Protocols: horm_001, horm_002
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PATH  = resolve(__dir, '../src/data/protocolBlueprintsV2.json');

const META = {
  horm_001: {
    scientificName: 'CJC-1295 / Ipamorelin GHRH & Ghrelin-Mimetic GH Secretagogue Optimization Protocol',
    description:
      '12-week GH axis optimization protocol combining CJC-1295 GHRH analogue sustained release with Ipamorelin selective ghrelin-mimetic secretagogue for pulsatile physiological GH restoration.',
    longDescription:
      'CJC-1295 (a synthetic analogue of growth hormone-releasing hormone, GHRH 1-29, with Drug Affinity Complex modification) extends the half-life of endogenous GHRH from minutes to days by binding covalently to serum albumin, producing sustained elevation of GH and IGF-1 without desensitisation of the GHRH receptor (Teichman SL et al., J Clin Endocrinol Metab 2006). Ipamorelin (Aib-His-D-2Nal-D-Phe-Lys-NH₂) is a selective GH secretagogue receptor (GHSR) agonist (ghrelin mimetic) that stimulates pulsatile GH release with high receptor selectivity, causing minimal elevation of cortisol, prolactin, or ACTH compared to earlier secretagogues (Raun K et al., Eur J Endocrinol 1998). The combination produces synergistic GH release: CJC-1295 raises the baseline amplitude of GH secretion while Ipamorelin drives discrete pulsatile peaks, together approximating the physiological GH secretion pattern of younger adults. Tesamorelin is added during the activation phase for its validated visceral fat reduction in GH-deficient patients (Falutz J et al., NEJM 2007).',
    primary_goal: 'Hormonal Support',
    references: [
      { pmid: '17018654', citation: 'Teichman SL et al. CJC-1295 sustained GH release. J Clin Endocrinol Metab 2006;91:799-805.' },
      { pmid: '9625695',  citation: 'Raun K et al. Ipamorelin, a new growth hormone releasing peptide. Eur J Endocrinol 1998;139:552-561.' },
      { pmid: '17715405', citation: 'Falutz J et al. Tesamorelin reduces visceral adiposity in HIV. NEJM 2007;357:2349-2361.' },
    ],
    keywords: ['CJC-1295 Ipamorelin protocol', 'GH secretagogue protocol', 'GHRH analogue peptide', 'growth hormone optimization', 'Ipamorelin ghrelin mimetic', 'hormonal support peptide protocol'],
  },

  horm_002: {
    scientificName: 'Tesamorelin + Ipamorelin GHRH-Axis Visceral Adiposity & GH Restoration Protocol',
    description:
      '12-week GH-axis protocol pairing FDA-approved Tesamorelin GHRH analogue with Ipamorelin ghrelin-mimetic for clinically validated visceral fat reduction and pulsatile GH restoration.',
    longDescription:
      'Tesamorelin (TransCon hGH; Egrifta) is an FDA-approved synthetic GHRH analogue (GHRH 1-44 with trans-3-hexenoic acid modification) validated in Phase 3 RCTs for reducing visceral adipose tissue (VAT) in HIV-associated lipodystrophy and studied for metabolic benefits in non-HIV populations (Falutz J et al., NEJM 2007; Stanley TL et al., J Clin Endocrinol Metab 2012). Tesamorelin acts on pituitary GHRH receptors to amplify endogenous GH pulse amplitude while preserving the physiological feedback regulation of the GH axis — unlike exogenous GH administration, which suppresses endogenous production. Ipamorelin (selective GHSR agonist; see horm_001) is combined to add discrete pulsatile GH peaks beyond the tonic effect of tesamorelin, enhancing total GH bioavailability while maintaining physiological rhythmicity. This protocol is particularly suited for adults with abdominal adiposity, low IGF-1, age-related GH decline (somatopause), or metabolic syndrome with a visceral fat component.',
    primary_goal: 'Hormonal Support',
    references: [
      { pmid: '17715405', citation: 'Falutz J et al. Tesamorelin reduces visceral adiposity in HIV. NEJM 2007;357:2349-2361.' },
      { pmid: '22539587', citation: 'Stanley TL et al. Tesamorelin decreases liver fat and waist circumference. J Clin Endocrinol Metab 2012;97:2212-2221.' },
      { pmid: '9625695',  citation: 'Raun K et al. Ipamorelin, a new GH releasing peptide. Eur J Endocrinol 1998;139:552-561.' },
    ],
    keywords: ['Tesamorelin protocol', 'Ipamorelin GH protocol', 'visceral fat peptide protocol', 'GHRH analogue therapy', 'somatopause treatment peptide', 'GH axis restoration protocol'],
  },
};

const protocols = JSON.parse(readFileSync(PATH, 'utf8'));
let updated = 0;
protocols.forEach(p => {
  if (META[p.protocol_id]) { p.metadata = META[p.protocol_id]; updated++; console.log(`✅ ${p.protocol_id}`); }
});
writeFileSync(PATH, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`\n🏁 Phase 6 done — ${updated} protocols.`);
