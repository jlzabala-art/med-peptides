/**
 * METADATA ENRICHMENT — PHASE 7: Skin/Anti-Aging + Immune/Inflammation
 * Protocols: skin_001, skin_002, immune_001, immune_002
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PATH  = resolve(__dir, '../src/data/protocolBlueprintsV2.json');

const META = {
  skin_001: {
    scientificName: 'GHK-Cu Copper-Peptide Collagen Induction & Skin Rejuvenation Protocol',
    description:
      '12-week skin rejuvenation protocol using GHK-Cu copper tripeptide to stimulate collagen and elastin synthesis, upregulate antioxidant gene expression, and reverse dermal aging markers.',
    longDescription:
      'GHK-Cu (glycyl-L-histidyl-L-lysine copper complex) is an endogenous tripeptide-copper complex that circulates at high levels in young adults (200 ng/mL at age 20) and declines with age. It was discovered in 1973 by Loren Pickart and extensively characterised for its role in wound healing and tissue remodeling (Pickart L & Margolina A, Biomedicines 2018). GHK-Cu activates fibroblast proliferation, upregulates collagen I, III, and VI synthesis, stimulates elastin and glycosaminoglycan production, and inhibits matrix metalloproteinases (MMP-1, MMP-2, MMP-3). Transcriptomic studies show GHK-Cu modulates over 4,000 human genes, significantly affecting pathways of collagen metabolism, antioxidant defense (SOD, catalase upregulation), and anti-inflammatory signaling (Pickart L et al., J Aging Sci 2015). This 12-week protocol delivers daily loading (collagen activation phase, weeks 1–6) transitioning to 3× weekly maintenance (weeks 7–12) for dermal matrix consolidation.',
    primary_goal: 'Skin / Anti-Aging',
    references: [
      { pmid: '29990473', citation: 'Pickart L, Margolina A. Regenerative and Protective Actions of the GHK-Cu Peptide. Biomedicines 2018;6:77.' },
      { pmid: '25984600', citation: 'Pickart L et al. GHK Peptide as a Natural Modulator of Multiple Cellular Pathways. J Aging Sci 2015;3:132.' },
      { pmid: '4583463',  citation: 'Pickart L. The biological effects of the tripeptide-copper complex GHK-Cu. Biochem Biophys Res Commun 1973.' },
    ],
    keywords: ['GHK-Cu collagen protocol', 'copper peptide skin rejuvenation', 'collagen stimulation peptide', 'anti-aging skin peptide', 'GHK-Cu protocol', 'dermal repair peptide protocol'],
  },

  skin_002: {
    scientificName: 'GHK-Cu & Epithalon Collagen–Epigenetic Cellular Skin Repair Protocol',
    description:
      '12-week advanced skin repair protocol combining GHK-Cu collagen induction and antioxidant gene activation with Epithalon telomere protection and pineal anti-aging epigenetic bioregulation.',
    longDescription:
      'This protocol adds Epithalon (Ala-Glu-Asp-Gly) to the GHK-Cu backbone to create a dual-mechanism cellular skin repair strategy. GHK-Cu drives structural dermal matrix remodeling (collagen, elastin, glycosaminoglycans; see skin_001) while Epithalon acts at the epigenetic and telomeric level — stimulating telomerase in fibroblasts, reducing chromosomal instability, and modulating age-related changes in skin stem cell behaviour (Khavinson VKh et al., Bull Exp Biol Med 2003; Anisimov VN et al., Mech Ageing Dev 2003). Telomere shortening in dermal fibroblasts is a key driver of skin aging, leading to senescent fibroblast accumulation that impairs collagen synthesis and promotes MMP upregulation. Epithalon’s telomerase-activating and pineal-modulating effects complement GHK-Cu’s structural repair activity. Together, this protocol targets both the structural (ECM, collagen network) and biological (cellular senescence, telomere integrity) dimensions of skin aging. Suited for patients seeking comprehensive anti-aging skin therapy.',
    primary_goal: 'Skin / Anti-Aging',
    references: [
      { pmid: '29990473', citation: 'Pickart L, Margolina A. Regenerative Actions of GHK-Cu. Biomedicines 2018;6:77.' },
      { pmid: '12833276', citation: 'Khavinson VKh et al. Epithalon peptide induces telomerase activity. Bull Exp Biol Med 2003;135:590-592.' },
      { pmid: '12706490', citation: 'Anisimov VN et al. Effect of Epitalon on life-span extension. Mech Ageing Dev 2003;124:721-731.' },
    ],
    keywords: ['GHK-Cu Epithalon skin protocol', 'telomere skin aging peptide', 'epigenetic skin repair', 'advanced anti-aging peptide', 'skin longevity protocol', 'fibroblast senescence peptide'],
  },

  immune_001: {
    scientificName: 'Thymosin Alpha-1 & Thymosin β4 (TB-500) Thymic T-Cell & Innate Immune Modulation Protocol',
    description:
      '8-week dual-thymosin immunomodulation protocol combining Thymosin Alpha-1 T-cell maturation and toll-like receptor activation with TB-500 anti-inflammatory angiogenesis for comprehensive immune recalibration.',
    longDescription:
      'Thymosin Alpha-1 (Tα1; Zadaxin) is a 28-amino acid peptide endogenously produced by thymic epithelial cells and the first thymic hormone to be fully sequenced. It promotes T-cell differentiation and maturation, augments NK cell activity, stimulates dendritic cell function, activates Toll-like receptors 2 and 9 (innate immunity), and modulates cytokine balance toward Th1-type responses (Goldstein AL & Goldstein A, Expert Opin Biol Ther 2009; King R & Tuthill C, Prog Mol Biol Transl Sci 2014). Tα1 is clinically approved in 35+ countries for hepatitis B, hepatitis C, and oncology supportive care. TB-500 (synthetic Thymosin β4 fragment) provides complementary immune modulation by suppressing pro-inflammatory cytokines (IL-1β, TNF-α), promoting regulatory T-cell function, and accelerating tissue repair via angiogenesis and actin remodeling (Goldstein AL et al., Ann N Y Acad Sci 2012). The 8-week dual-phase protocol delivers combined immunomodulation in weeks 1–4, transitioning to Tα1 maintenance for sustained immune calibration.',
    primary_goal: 'Immune / Inflammation',
    references: [
      { pmid: '19519282', citation: 'Goldstein AL, Goldstein A. From lab to bedside: emerging clinical applications of thymosin alpha 1. Expert Opin Biol Ther 2009;9:593-608.' },
      { pmid: '24411673', citation: 'King R, Tuthill C. Immune Modulation with Thymosin Alpha 1 Treatment. Prog Mol Biol Transl Sci 2014;129:179-208.' },
      { pmid: '22295120', citation: 'Goldstein AL et al. Thymosin β4: A multi-functional regenerative peptide. Ann N Y Acad Sci 2012;1269:1-8.' },
    ],
    keywords: ['Thymosin Alpha-1 immune protocol', 'TB-500 immunomodulation', 'thymic peptide immune support', 'T-cell activation peptide', 'immune inflammation protocol', 'Zadaxin thymosin protocol'],
  },

  immune_002: {
    scientificName: 'Thymosin Alpha-1 & KPV Anti-Inflammatory Mast-Cell & NF-κB Inhibition Protocol',
    description:
      '10-week immune protocol combining Thymosin Alpha-1 T-cell immunomodulation with KPV α-MSH-derived anti-inflammatory NF-κB inhibition for gut inflammation, mast-cell hyperactivation, and autoimmune modulation.',
    longDescription:
      'This protocol pairs Thymosin Alpha-1 (systemic T-cell and innate immune modulation; see immune_001) with KPV (Lys-Pro-Val), a tripeptide derived from the C-terminus of α-melanocyte-stimulating hormone (α-MSH). KPV exerts potent anti-inflammatory effects by inhibiting NF-κB nuclear translocation, reducing production of IL-1β, IL-6, TNF-α, and interferon-γ, and suppressing mast cell degranulation (Dalmasso G et al., Gastroenterology 2008; Catania A et al., Endocr Rev 2004). KPV has demonstrated efficacy in murine models of colitis, intestinal inflammation, and dermatitis, and penetrates epithelial barriers due to its small size, making it especially suitable for gut-associated inflammatory conditions. Combined with Tα1 (which restores Th1/Th2 balance and regulatory T-cell function), this protocol provides both upstream immune calibration and downstream cytokine suppression — a complementary dual strategy for conditions including IBD, systemic inflammation, mast-cell activation syndrome (MCAS), and autoimmune disorders.',
    primary_goal: 'Immune / Inflammation',
    references: [
      { pmid: '18471516', citation: 'Dalmasso G et al. The peptide KPV inhibits NF-κB in intestinal epithelial cells. Gastroenterology 2008;134:1255-1264.' },
      { pmid: '15483236', citation: 'Catania A et al. The melanocortin system in control of inflammation. Endocr Rev 2004;25:956-983.' },
      { pmid: '19519282', citation: 'Goldstein AL, Goldstein A. Thymosin alpha 1 clinical applications. Expert Opin Biol Ther 2009;9:593-608.' },
    ],
    keywords: ['KPV peptide anti-inflammatory', 'Thymosin Alpha-1 autoimmune protocol', 'NF-kB inhibitor peptide', 'alpha-MSH anti-inflammatory peptide', 'mast cell peptide protocol', 'gut inflammation peptide'],
  },
};

const protocols = JSON.parse(readFileSync(PATH, 'utf8'));
let updated = 0;
protocols.forEach(p => {
  if (META[p.protocol_id]) { p.metadata = META[p.protocol_id]; updated++; console.log(`✅ ${p.protocol_id}`); }
});
writeFileSync(PATH, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`\n🏁 Phase 7 done — ${updated} protocols.`);
