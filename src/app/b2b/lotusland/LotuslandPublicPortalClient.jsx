"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Download,
  Share2,
  Building2,
  Package,
  Layers,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles
} from 'lucide-react';
import { DataTable, StatusBadge, CopyableId } from '@/components/ui';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import { getLotuslandProcurementReport } from '@/services/lotuslandProcurementService';
import { exportLotuslandProcurementXlsx } from '@/utils/exportLotuslandProcurementXlsx';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';
import { getPeptideReferenceDossier } from '@/data/peptideReferenceDossiers';
import AtlasAiLotuslandDrawer from '@/components/pricing/AtlasAiLotuslandDrawer';
import toast from 'react-hot-toast';

/**
 * Maps any of the 29 micro-therapeutic classes into 6 canonical Google Cloud Macro-Families
 */
function getMacroFamilyKey(therapeuticClass = '') {
  const tc = therapeuticClass.toLowerCase();
  if (
    tc.includes('glp-1') ||
    tc.includes('gip') ||
    tc.includes('triple g') ||
    tc.includes('amylin') ||
    tc.includes('nnmt') ||
    tc.includes('exercise mimetic') ||
    tc.includes('metabolic')
  ) {
    return 'metabolic_incretin';
  }
  if (
    tc.includes('gh secretagogue') ||
    tc.includes('ghrh') ||
    tc.includes('lipolytic') ||
    tc.includes('hypertrophy') ||
    tc.includes('igf')
  ) {
    return 'gh_anabolic';
  }
  if (
    tc.includes('bioregulator')
  ) {
    return 'khavinson_bioregulators';
  }
  if (
    tc.includes('mitochondrial') ||
    tc.includes('senolytic') ||
    tc.includes('telomerase') ||
    tc.includes('coenzyme') ||
    tc.includes('longevity') ||
    tc.includes('copper') ||
    tc.includes('antioxidant')
  ) {
    return 'cellular_longevity';
  }
  if (
    tc.includes('nootropic') ||
    tc.includes('neuro') ||
    tc.includes('sleep') ||
    tc.includes('melanocortin') ||
    tc.includes('oxytocin') ||
    tc.includes('kisspeptin') ||
    tc.includes('libido')
  ) {
    return 'neuro_endocrine';
  }
  return 'tissue_immune';
}

const MACRO_FAMILY_CHIPS = [
  { id: 'all', label: 'All Classes' },
  { id: 'metabolic_incretin', label: 'Metabolic & GLP-1 / GIP' },
  { id: 'gh_anabolic', label: 'GH Secretagogues & IGF' },
  { id: 'cellular_longevity', label: 'Cellular & Mitochondrial' },
  { id: 'khavinson_bioregulators', label: 'Khavinson Bioregulators' },
  { id: 'neuro_endocrine', label: 'Neuro-Cognitive & Endocrine' },
  { id: 'tissue_immune', label: 'Tissue Repair & Immune' }
];

/**
 * Comprehensive 100% English Clinical Pharmacology Dictionary for all 43 Lotusland APIs
 */
const LOTUSLAND_API_PHARMACOLOGY = {
  tirzepatide: {
    targetSystem: 'Dual GLP-1 / GIP Incretin Receptor System & Glycemic Homeostasis',
    moa: 'Co-agonist of glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptors, enhancing first- and second-phase insulin secretion, suppressing glucagon, delaying gastric emptying, and reducing visceral adiposity.'
  },
  retatrutide: {
    targetSystem: 'Triple Hormone Receptor Agonist (GLP-1 / GIP / GCGR)',
    moa: 'Simultaneously activates GLP-1 (central satiety), GIP (adipocyte insulin sensitivity), and hepatic Glucagon receptors (resting energy expenditure & beta-oxidation) for maximal metabolic remodeling.'
  },
  semaglutide: {
    targetSystem: 'Selective GLP-1 Receptor Agonist & Hypothalamic Satiety Center',
    moa: 'Long-acting GLP-1 analog with albumin-binding fatty acid side chain; stimulates glucose-dependent insulin secretion and hypothalamic POMC/CART satiety neurons.'
  },
  cagrilintide: {
    targetSystem: 'Dual Amylin & Calcitonin Receptor Complex (DACRA)',
    moa: 'Long-acting acylated amylin analog acting on area postrema and hypothalamic receptors to slow gastric emptying, suppress postprandial glucagon, and induce non-incretin satiety.'
  },
  survodutide: {
    targetSystem: 'Dual Glucagon (GCGR) & GLP-1 Receptor Agonist · Hepatic Steatosis',
    moa: 'Balanced co-agonism at GCGR and GLP-1R directly stimulates hepatic lipid oxidation and glycogenolysis while preserving glycemic control and central appetite suppression.'
  },
  mazdutide: {
    targetSystem: 'Oxyntomodulin-Analog Dual GLP-1R / GCGR Agonist',
    moa: 'Mammalian oxyntomodulin analog activating both GLP-1 and glucagon receptors to accelerate hepatic fat clearance and systemic thermogenesis.'
  },
  '5amino1mq': {
    targetSystem: 'Nicotinamide N-Methyltransferase (NNMT) Enzymatic Inhibition & NAD+ Salvage',
    moa: 'Small-molecule membrane-permeable inhibitor of NNMT; prevents nicotinamide methylation, elevates intracellular NAD+ and SAMe pools, activates SIRT1, and shrinks white adipocyte volume.'
  },
  slupp332: {
    targetSystem: 'Pan-Estrogen-Related Receptor (ERRα / ERRβ / ERRγ) Agonist · Exercise Mimetic',
    moa: 'Synthetic pan-ERR agonist that activates acute aerobic exercise transcriptional programs, upregulating mitochondrial biogenesis, Type IIa oxidative muscle fibers, and fatty acid oxidation.'
  },
  tesamorelin: {
    targetSystem: 'Pituitary Somatotroph GHRH Receptor & Visceral Adipose Tissue',
    moa: 'Trans-3-hexenoyl-modified 44-amino-acid human GHRH analog resistant to DPP-4 cleavage; restores physiological pulsatile GH secretion and selectively reduces trunk visceral adipose tissue (VAT) without impairing insulin sensitivity.'
  },
  igf1lr3: {
    targetSystem: 'Skeletal Muscle Myoblast Proliferation & Type 1 IGF-1R Signaling',
    moa: '83-amino-acid recombinant analog of human IGF-1 with an Arg3 substitution and 13-amino-acid N-terminal extension; exhibits minimal affinity for IGF-binding proteins (IGFBPs), yielding ~3x potency and a 20–30 hour biological half-life via PI3K/Akt/mTOR activation.'
  },
  cjc1295: {
    targetSystem: 'Anterior Pituitary GHRH Receptor & Pulsatile GH / IGF-1 Axis',
    moa: 'Tetrasubstituted 29-amino-acid GHRH(1-29) peptide (Mod GRF 1-29 / DAC) that amplifies endogenous growth hormone pulse amplitude while preserving somatostatin feedback.'
  },
  ipamorelin: {
    targetSystem: 'Selective Ghrelin / Growth Hormone Secretagogue Receptor (GHS-R1a)',
    moa: 'Pentapeptide GHS-R1a agonist that triggers clean somatotroph GH release with zero off-target elevation of ACTH, cortisol, prolactin, or aldosterone.'
  },
  sermorelin: {
    targetSystem: 'Neuroendocrine GHRH(1-29) Pituitary Somatotroph Axis',
    moa: 'Bio-identical N-terminal 29-amino-acid functional domain of endogenous GHRH; stimulates physiological nocturnal GH pulsatility and pituitary reserve.'
  },
  aod9604: {
    targetSystem: 'Adipocyte Beta-3 Adrenergic & Lipolytic Domain (hGH 177-191)',
    moa: 'C-terminal hexadecapeptide fragment of human Growth Hormone (Tyr-hGH 177-191) that upregulates hormone-sensitive lipase and inhibits lipogenesis without IGF-1 elevation or diabetogenic effects.'
  },
  prostamax: {
    targetSystem: 'Prostate Tissue Chromatin Decondensation & Ribosomal Bioregulation',
    moa: 'Synthetic Khavinson tetrapeptide bioregulator (Lys-Glu-Asp-Pro) that binds specific promoter sequences in prostate acinar and stromal cells, decondensing heterochromatin, normalizing cytokine expression, and reducing chronic prostatic congestion.'
  },
  pinealon: {
    targetSystem: 'Cerebral Cortex & Pineal Neuroprotection (Tripeptide Glu-Asp-Arg)',
    moa: 'Short neuro-bioregulator tripeptide (EDR) that penetrates the blood-brain barrier and nuclear membrane to modulate neuronal gene transcription, suppress NMDA-induced excitotoxic ROS accumulation, and restore MAPK/ERK neuroplasticity.'
  },
  vesugen: {
    targetSystem: 'Vascular Endothelium & Microcirculatory Capillary Bioregulation',
    moa: 'Khavinson vascular tripeptide (Lys-Glu-Asp / KED) that regulates endothelin-1 and connexin expression in vascular wall endothelial cells, improving arterial elasticity and capillary perfusion.'
  },
  cartalax: {
    targetSystem: 'Chondrocyte Extracellular Matrix & Type II Collagen Bioregulation',
    moa: 'Synthetic tripeptide (Ala-Glu-Asp / AED) targeting articular cartilage and spinal disc chondrocytes; downregulates matrix metalloproteinases (MMPs) and stimulates aggrecan and collagen synthesis.'
  },
  chonluten: {
    targetSystem: 'Bronchial Mucosa & Alveolar Epithelial Bioregulation',
    moa: 'Respiratory tripeptide bioregulator (Glu-Asp-Gly / EDG) that normalizes mucociliary clearance, surfactant gene expression, and inflammatory cytokine balance in bronchial epithelium.'
  },
  ovagen: {
    targetSystem: 'Hepatocyte & Gastrointestinal Mucosal Bioregulation',
    moa: 'Tripeptide bioregulator (Glu-Asp-Leu / EDL) that stabilizes hepatocyte lysosomal membranes, normalizes bilirubin/transaminase metabolism, and accelerates hepatic regeneration.'
  },
  pancragen: {
    targetSystem: 'Pancreatic Islet Beta-Cell & Acinar Transcription Bioregulation',
    moa: 'Tetrapeptide bioregulator (Lys-Glu-Asp-Trp) that upregulates PDX1 and insulin gene transcription Factors in pancreatic beta cells, improving glucose tolerance and beta-cell resilience.'
  },
  testagen: {
    targetSystem: 'Hypothalamic-Pituitary-Gonadal (HPG) & Leydig Cell Bioregulation',
    moa: 'Tetrapeptide bioregulator (Lys-Glu-Asp-Gly) that modulates pituitary gonadotropin sensitivity and testicular Leydig steroidogenesis.'
  },
  bronchogen: {
    targetSystem: 'Bronchopulmonary Epithelial Remodeling & Ciliary Defense',
    moa: 'Tetrapeptide bioregulator (Ala-Glu-Asp-Leu) that restores differentiated ciliated bronchial epithelium and suppresses neutrophilic airway inflammation.'
  },
  cardiogen: {
    targetSystem: 'Cardiomyocyte Sarcomere & Myocardial Remodeling Bioregulation',
    moa: 'Tetrapeptide bioregulator (Ala-Glu-Asp-Arg) that inhibits cardiomyocyte apoptosis, reduces myocardial fibrosis, and improves ATP synthesis under ischemic load.'
  },
  cortagen: {
    targetSystem: 'Cerebral Cortex Neuronal Repair & Antioxidant Defense',
    moa: 'Tetrapeptide bioregulator (Ala-Glu-Asp-Pro) that upregulates cortical superoxide dismutase (SOD) and neurotrophic repair transcripts.'
  },
  livagen: {
    targetSystem: 'Lymphocyte & Hepatocyte Chromatin Decondensation (Lys-Glu-Asp-Ala)',
    moa: 'Khavinson tetrapeptide (KEDA) that reactivates silenced ribosomal RNA genes and unfolds senescent pericentromeric heterochromatin in aged lymphocytes and hepatocytes.'
  },
  epithalon: {
    targetSystem: 'Pineal Telomerase Reverse Transcriptase (hTERT) & Circadian Axis',
    moa: 'Synthetic pineal tetrapeptide (Ala-Glu-Asp-Gly) that induces telomerase catalytic subunit expression, elongates telomeres in somatic cells, and restores nocturnal melatonin secretion.'
  },
  foxo4dri: {
    targetSystem: 'Targeted Senolytic Disruption of FOXO4–p53 Nuclear Complex',
    moa: 'D-retro-inverso cell-penetrating peptide that competitively blocks FOXO4 binding to p53 in senescent cells, releasing active p53 to trigger selective intrinsic apoptosis of senescent cells.'
  },
  ss31: {
    targetSystem: 'Inner Mitochondrial Membrane Cardiolipin & Electron Transport Chain',
    moa: 'Mitochondria-targeted tetrapeptide (Elamipretide) that binds selectively to cardiolipin on the inner mitochondrial membrane, stabilizing cristae curvature, optimizing cytochrome c electron transfer, and reducing mitochondrial ROS.'
  },
  motsc: {
    targetSystem: 'Mitochondrial-Derived 12S rRNA Peptide · AICAR / AMPK / GLUT4 Axis',
    moa: '16-amino-acid mitokine that inhibits the folate-methionine cycle, accumulates endogenous AICAR, activates AMPK, and translocates to the nucleus under metabolic stress to enhance skeletal muscle insulin sensitivity.'
  },
  nad: {
    targetSystem: 'Mitochondrial Oxidative Phosphorylation, Sirtuins (SIRT1–7) & PARP1',
    moa: 'Essential pyridine dinucleotide coenzyme driving Complex I electron transport, mitochondrial ATP synthesis, PARP-mediated DNA single-strand break repair, and sirtuin deacetylase longevity pathways.'
  },
  ghkcu: {
    targetSystem: 'Extracellular Matrix Remodeling, TGF-β & Stem Cell Gene Reset',
    moa: 'Naturally occurring human tripeptide-copper(II) complex that modulates over 4,000 human genes, upregulating collagen I/III, elastin, glycosaminoglycans, and nerve outgrowth while suppressing NF-κB.'
  },
  glutathione: {
    targetSystem: 'Master Intracellular Thiol Redox Buffer & Phase II Hepatic Conjugation',
    moa: 'Tripeptide (γ-L-Glu-L-Cys-Gly) cofactor for glutathione peroxidase (GPx) and glutathione S-transferase; neutralizes lipid peroxides, regenerates vitamins C/E, and facilitates xenobiotic detoxification.'
  },
  bpc157: {
    targetSystem: 'FAK-Paxillin Angiogenesis, Tendon Fibroblast & Enteric Mucosal Axis',
    moa: 'Stable pentadecapeptide that upregulates VEGFR2 and growth hormone receptor expression on fibroblasts, accelerating tendon-to-bone healing, microvascular angiogenesis, and nitric oxide (eNOS) homeostasis.'
  },
  tb500: {
    targetSystem: 'Cellular G-Actin Sequestration, Endothelial Migration & Tissue Repair',
    moa: 'Synthetic Thymosin Beta-4 functional domain that binds monomeric G-actin, promoting rapid directional migration of endothelial progenitor cells, keratinocytes, and myoblasts into injured tissue.'
  },
  kpv: {
    targetSystem: 'Melanocortin-1/3 Receptor (MC1R/MC3R) & PepT1 NF-κB Inhibition',
    moa: 'C-terminal tripeptide fragment (Lys-Pro-Val) of α-MSH transported intracellularly via PepT1; blocks IκBα degradation and nuclear translocation of NF-κB without pigmentary activity.'
  },
  ll37: {
    targetSystem: 'Human Cathelicidin Antimicrobial & Innate Immune Modulation',
    moa: '37-amino-acid amphipathic α-helical host defense peptide that disrupts microbial biofilms and bacterial membranes while chemotactically recruiting monocytes and promoting epithelial wound closure.'
  },
  thymosinalpha1: {
    targetSystem: 'Toll-Like Receptor (TLR2/TLR9) Dendritic & T-Cell Maturation',
    moa: '28-amino-acid thymic peptide (Zadaxin) that activates myeloid and plasmacytoid dendritic cells, enhances MHC Class I expression, and restores Th1/CD8+ cytotoxic T-lymphocyte immunity.'
  },
  vip: {
    targetSystem: 'VPAC1 / VPAC2 Receptor Signaling · Pulmonary & Neuro-Immune Homeostasis',
    moa: '28-amino-acid neuropeptide that relaxes vascular and tracheobronchial smooth muscle, inhibits macrophage TNF-α/IL-6 release, and balances Th17/Treg immune responses.'
  },
  semax: {
    targetSystem: 'Hippocampal BDNF / TrkB Neurotrophic & Dopaminergic/Serotonergic Axis',
    moa: 'Met-enkephalin-derived ACTH(4-10) heptapeptide analog (Met-Glu-His-Phe-Pro-Gly-Pro) that rapidly elevates cortical and hippocampal BDNF mRNA and TrkB receptor phosphorylation.'
  },
  selank: {
    targetSystem: 'Allosteric GABA-A Receptor Modulation & Enkephalinase Inhibition',
    moa: 'Synthetic tuftsin heptapeptide analog (Thr-Lys-Pro-Arg-Pro-Gly-Pro) that positively modulates GABA-A receptors and inhibits enkephalin-degrading enzymes for non-sedating anxiolysis.'
  },
  dsip: {
    targetSystem: 'Hypothalamic-Pituitary Circadian & Slow-Wave Delta Sleep Architecture',
    moa: 'Amphiphilic nonapeptide neuromodulator that normalizes slow-wave delta EEG sleep rhythms, attenuates nocturnal CRH/ACTH stress hyperarousal, and supports nocturnal GH secretion.'
  },
  pt141: {
    targetSystem: 'Central Hypothalamic Melanocortin MC4R / MC3R Agonist',
    moa: 'Cyclic heptapeptide (Bremelanotide) that selectively activates central hypothalamic MC4R neurons to stimulate dopaminergic sexual arousal pathways independent of vascular PDE5.'
  }
};

/**
 * Mobile-First Card for Lotusland API Raw Materials
 * (Strict Golden Rule #23 & Google Cloud Mobile UX)
 */
export function LotuslandApiMobileCard({ row, renderDetailRow, valuationMode = 'net' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTransfer = valuationMode === 'transfer';
  const unitDisplay = isTransfer ? row.catalogPrice : row.weightedAvgCost;
  const latestDisplay = isTransfer ? row.latestCost * 1.06 : row.latestCost;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #dadce0',
      borderRadius: '8px',
      padding: '12px 14px',
      marginBottom: '10px',
      boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Top Header: Compound Name & Category */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#003666' }}>
            {row.name}
          </h4>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 750,
            color: '#16a34a',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '1px 6px',
            borderRadius: '4px'
          }}>
            {row.grade}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#64748b', marginTop: '3px' }}>
          <span>CAS: {row.casNumber || 'N/A'}</span>
          <span>·</span>
          <span style={{ color: '#003666', fontWeight: 650 }}>{row.therapeuticClass || 'Specialized Bioactive API'}</span>
        </div>
      </div>

      {/* 2x2 Clean Metric Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '8px 10px'
      }}>
        <div>
          <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Procured
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
            {row.totalGrams.toLocaleString()} g
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            Across {row.invoiceCount} {row.invoiceCount === 1 ? 'order' : 'orders'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Latest Order Date
          </div>
          <div style={{ fontSize: '0.80rem', fontWeight: 750, color: '#003666', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Calendar size={11} color="#003666" />
            <span>{row.latestDate}</span>
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            {row.invoiceCount > 1 ? `${row.firstDate} → ${row.latestDate}` : 'Single release'}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
          <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            {isTransfer ? 'Transfer Price / g (+6%)' : 'Audited Cost / g (Net)'}
          </div>
          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#003666' }}>
            ${unitDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            {row.invoiceCount > 1 ? `Avg · Latest: $${latestDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Single release'}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
          <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Lifetime Spend
          </div>
          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#003666' }}>
            ${row.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 600 }}>
            Reconciled USD
          </div>
        </div>
      </div>

      {/* Expand Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
  display: 'flex',
    alignItems: 'center',
      justifyContent: 'space-between',
        width: '100%',
          padding: '6px 10px',
            background: isExpanded ? '#eff6ff' : '#f8fafc',
              border: isExpanded ? '1px solid #bfdbfe' : '1px solid #dadce0',
                borderRadius: '6px',
                  cursor: 'pointer',
                    fontSize: '0.72rem',
                      fontWeight: 700,
                        color: isExpanded ? '#1d4ed8' : '#334155'
}}
      >
  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <FileText size={12} color={isExpanded ? '#1d4ed8' : '#64748b'} />
    <span>View Receipts & Indications ({row.invoiceCount})</span>
  </span>
{ isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} /> }
      </button >

  {/* Expanded Master-Detail Content */ }
{
  isExpanded && renderDetailRow && (
    <div style={{ marginTop: '2px' }}>
      {renderDetailRow(row)}
    </div>
  )
}
    </div >
  );
}
LotuslandApiMobileCard.displayName = 'LotuslandApiMobileCard';

function LotuslandInvoiceMobileCard({ row }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #dadce0',
      borderRadius: '8px',
      padding: '12px 14px',
      marginBottom: '10px',
      boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.88rem' }}>
          {row.invoiceNumber}
        </span>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#16a34a',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '1px 6px',
          borderRadius: '4px'
        }}>
          RECONCILED
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#64748b' }}>
        <Calendar size={11} color="#64748b" />
        <span>Release Date: <strong style={{ color: '#1e293b' }}>{row.date}</strong></span>
      </div>

      <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '2px' }}>
        <strong>Licensed Entity:</strong> {row.buyer}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '4px',
        borderTop: '1px solid #f1f5f9',
        paddingTop: '6px'
      }}>
        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
          Original: {row.currency === 'EUR' ? '€' : '$'}{row.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {row.currency}
        </span>
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.88rem' }}>
          ${row.grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
        </span>
      </div>
    </div>
  );
}
LotuslandInvoiceMobileCard.displayName = 'LotuslandInvoiceMobileCard';

export default function LotuslandPublicPortalClient() {
  const [activeTab, setActiveTab] = useState('apis'); // 'apis' | 'invoices' | 'corporate'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [valuationMode, setValuationMode] = useState('net'); // 'net' (Audited Cost) | 'transfer' (+6% Magenta Cap)
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);

  const reportData = useMemo(() => {
    return getLotuslandProcurementReport();
  }, []);

  const { summary, apis, invoices, metadata } = reportData;

  const macroFamilyCounts = useMemo(() => {
    const counts = { all: apis.length };
    MACRO_FAMILY_CHIPS.forEach(c => {
      if (c.id !== 'all') counts[c.id] = 0;
    });
    apis.forEach(a => {
      const fam = getMacroFamilyKey(a.therapeuticClass);
      counts[fam] = (counts[fam] || 0) + 1;
    });
    return counts;
  }, [apis]);

  const filteredApis = useMemo(() => {
    return apis.filter(api => {
      const matchesSearch = !searchQuery ||
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.therapeuticClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.casNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.invoiceRefs.some(ref => ref.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesClass =
        selectedClass === 'all' ||
        getMacroFamilyKey(api.therapeuticClass) === selectedClass ||
        api.therapeuticClass === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [apis, searchQuery, selectedClass]);

  const handleExport = () => {
    try {
      const fileName = exportLotuslandProcurementXlsx();
      toast.success(`Exported: ${fileName}`, { icon: '📊' });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to generate Excel export.');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Public link copied to clipboard!', { icon: '🔗' });
    }
  };

  // Helper for 100% English Clinical Info
  const getClinicalInfo = (apiName) => {
    const cleanKey = apiName
      .toLowerCase()
      .replace(/\s*bulk\s*api\s*/g, '')
      .replace(/[^a-z0-9]/g, '');

    const directMatch = Object.entries(LOTUSLAND_API_PHARMACOLOGY).find(([k]) => {
      return cleanKey === k || cleanKey.includes(k) || k.includes(cleanKey);
    });
    if (directMatch) {
      return {
        targetSystem: directMatch[1].targetSystem,
        moa: directMatch[1].moa,
        halfLife: 'Physiological peptide kinetics (protease-regulated clearance)',
        sequence: null
      };
    }

    const knownMatch = Object.entries(KNOWN_PEPTIDE_DATA).find(([k]) => {
      const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanKey.includes(kClean) || kClean.includes(cleanKey);
    });
    const known = knownMatch ? knownMatch[1] : null;
    const dossier = getPeptideReferenceDossier({ name: apiName, canonicalName: apiName });

    return {
      targetSystem: known?.targetSystem || dossier?.pharmacology?.title || 'Targeted Cellular & Metabolic Modulation',
      moa: known?.mechanismOfAction || dossier?.pharmacology?.moa || 'Selective receptor ligand stimulating targeted physiological cascades.',
      halfLife: known?.halfLife || 'Physiological peptide kinetics (protease-regulated clearance)',
      sequence: known?.sequence || null
    };
  };

  const apiColumns = [
    {
      key: 'name',
      accessor: 'name',
      header: 'API Active Principle',
      label: 'API Active Principle',
      width: '27%',
      sortable: true,
      sortValue: (r) => r.name,
      render: (_val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 750, color: '#003666', fontSize: '0.88rem' }}>
              {row.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#64748b' }}>
            <span>CAS: {row.casNumber || 'N/A'}</span>
            <span>·</span>
            <span>{row.grade}</span>
          </div>
        </div>
      )
    },
    {
      key: 'therapeuticClass',
      accessor: 'therapeuticClass',
      header: 'Therapeutic Class',
      label: 'Therapeutic Class',
      width: '18%',
      sortable: true,
      sortValue: (r) => r.therapeuticClass,
      render: (_val, row) => (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          backgroundColor: '#f1f5f9',
          color: '#334155',
          padding: '2px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {row.therapeuticClass}
        </span>
      )
    },
    {
      key: 'totalGrams',
      accessor: 'totalGrams',
      header: 'Total Procured',
      label: 'Total Procured',
      width: '13%',
      sortable: true,
      sortValue: (r) => r.totalGrams,
      render: (_val, row) => (
        <div>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
            {row.totalGrams.toLocaleString()} g
          </span>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            {row.invoiceCount} {row.invoiceCount === 1 ? 'order' : 'orders'}
          </div>
        </div>
      )
    },
    {
      key: 'latestDate',
      accessor: 'latestDate',
      header: 'Latest Invoice Date',
      label: 'Latest Invoice Date',
      width: '14%',
      sortable: true,
      sortValue: (r) => r.latestDate,
      render: (_val, row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} color="#003666" />
            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.80rem' }}>
              {row.latestDate}
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
            {row.invoiceCount > 1 ? `${row.firstDate} → ${row.latestDate}` : 'Single release'}
          </div>
        </div>
      )
    },
    {
      key: 'catalogPrice',
      accessor: 'catalogPrice',
      header: valuationMode === 'transfer' ? 'Transfer Price / g (+6%)' : 'Audited Cost / g (Net)',
      label: valuationMode === 'transfer' ? 'Transfer Price / g (+6%)' : 'Audited Cost / g (Net)',
      width: '16%',
      sortable: true,
      sortValue: (r) => valuationMode === 'transfer' ? r.catalogPrice : r.weightedAvgCost,
      render: (_val, row) => {
        const isTransfer = valuationMode === 'transfer';
        const unitDisplay = isTransfer ? row.catalogPrice : row.weightedAvgCost;
        const latestDisplay = isTransfer ? row.latestCost * 1.06 : row.latestCost;
        return (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                ${unitDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {isTransfer && (
                <span style={{
                  fontSize: '0.60rem',
                  fontWeight: 800,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '0px 4px',
                  borderRadius: '3px'
                }}>
                  +6%
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
              {row.invoiceCount > 1
                ? `Avg (${row.invoiceCount} orders) · Latest: $${latestDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'Single release'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'totalSpendUSD',
      accessor: 'totalSpendUSD',
      header: 'Lifetime Spend',
      label: 'Lifetime Spend',
      width: '12%',
      sortable: true,
      sortValue: (r) => r.totalSpendUSD,
      render: (_val, row) => (
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.90rem', fontFamily: 'monospace' }}>
          ${row.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    }
  ];

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      accessor: 'invoiceNumber',
      header: 'Invoice #',
      label: 'Invoice #',
      width: '16%',
      sortable: true,
      sortValue: (r) => r.invoiceNumber,
      render: (_val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 750, color: '#003666', fontSize: '0.82rem' }}>
            {row.invoiceNumber}
          </span>
        </div>
      )
    },
    {
      key: 'date',
      accessor: 'date',
      header: 'Release Date',
      label: 'Release Date',
      width: '14%',
      sortable: true,
      sortValue: (r) => r.date,
      render: (_val, row) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>
          {row.date}
        </span>
      )
    },
    {
      key: 'buyer',
      accessor: 'buyer',
      header: 'Licensed Buyer Entity',
      label: 'Licensed Buyer Entity',
      width: '32%',
      sortable: true,
      sortValue: (r) => r.buyer,
      render: (_val, row) => (
        <div style={{ fontSize: '0.76rem', color: '#1e293b', fontWeight: 600 }}>
          {row.buyer}
        </div>
      )
    },
    {
      key: 'grandTotal',
      accessor: 'grandTotal',
      header: 'Original Total',
      label: 'Original Total',
      width: '18%',
      sortable: true,
      sortValue: (r) => r.grandTotal,
      render: (_val, row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>
            {row.currency === 'EUR' ? '€' : '$'}{row.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {row.currency}
          </span>
          {row.currency === 'EUR' && (
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              FX Rate: 1.08 USD/EUR
            </div>
          )}
        </div>
      )
    },
    {
      key: 'grandTotalUSD',
      accessor: 'grandTotalUSD',
      header: 'USD Equivalent',
      label: 'USD Equivalent',
      width: '20%',
      sortable: true,
      sortValue: (r) => r.grandTotalUSD,
      render: (_val, row) => (
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.88rem' }}>
          ${row.grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
        </span>
      )
    }
  ];

  // Master-Detail Expandable Row
  const renderDetailRow = (row) => {
    const clinical = getClinicalInfo(row.name);

    return (
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '1.25rem',
        borderLeft: '4px solid #003666',
        borderRadius: '0 0 8px 8px',
        margin: '0.25rem 0 0.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Quick Clinical Indication Accordion */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} color="#003666" />
            <h5 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
              Clinical Indication & Molecular Target
            </h5>
          </div>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
            <strong>Target System:</strong> {clinical.targetSystem}
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
            <strong>Mechanism:</strong> {clinical.moa}
          </p>
        </div>

        {/* Purchase Receipts */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h5 style={{ margin: 0, fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              Reconciled Purchase Orders ({row.receipts.length})
            </h5>
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              First Order: {row.firstDate} · Most Recent: {row.latestDate}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
            {row.receipts.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                    {rec.invoiceNumber}
                  </span>
                  <span style={{
                    fontSize: '0.70rem',
                    color: '#003666',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 650,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Calendar size={11} color="#1d4ed8" />
                    {rec.date}
                  </span>
                </div>
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  {rec.buyer}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.75rem' }}>
                    {rec.quantityGrams} g @ ${rec.unitCostUSD.toFixed(2)}/g
                  </span>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.80rem' }}>
                    ${rec.lineTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#202124' }}>
      {/* Google Cloud Style Header Top Bar */}
      <header style={{
        backgroundColor: '#0b192c',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0.75rem 1.5rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#00a3e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              ATLAS HEALTH SERVICES
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Global Sourcing Network · Public Partner Portal
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Download Audit (.xlsx)
          </button>
          <button
            type="button"
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 4rem 1rem' }}>
        {/* Title & Institutional Eyebrow */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              backgroundColor: '#003666',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              OFFICIAL SUPPLIER PORTAL
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Hong Kong SAR Reg: 71705158 · Corridors: Hong Kong & UAE (Magenta / Mediluxe)
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
            fontWeight: 800,
            color: '#003666',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
            textWrap: 'balance'
          }}>
            Lotusland Limited · Historical API Procurement & Commercial Audit
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', maxWidth: '850px', lineHeight: 1.5 }}>
            Consolidated ledger of active pharmaceutical principles (APIs), per-gram acquisition costs, and reconciled commercial invoices from the beginning of the commercial relationship.
          </p>
        </div>

        {/* 4 GCP Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <MetricCard
            title="Total Sourcing Capital"
            value={`$${summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subtitle={`${invoices.length} Commercial Releases Reconciled`}
            icon={DollarSign}
            color="#003666"
          />
          <MetricCard
            title="Total API Mass Procured"
            value={`${summary.totalGramsProcured.toLocaleString('en-US')} g`}
            subtitle="Pure Lyophilized Bulk Mass"
            icon={Package}
            color="#0284c7"
          />
          <MetricCard
            title="Active Principles (APIs)"
            value={`${summary.uniqueApisCount} APIs`}
            subtitle="Metabolic, Healing & Bioregulators"
            icon={Layers}
            color="#16a34a"
          />
          <MetricCard
            title="Audited Date Range"
            value={summary.dateRange}
            subtitle="100% Traceable to Signed Invoices"
            icon={CheckCircle2}
            color="#7c3aed"
          />
        </div>

        {/* GCP Style Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #cbd5e1',
          marginBottom: '1.25rem',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('apis')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'apis' ? '3px solid #003666' : '3px solid transparent',
              color: activeTab === 'apis' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'apis' ? 800 : 600,
              padding: '10px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> API Raw Materials ({apis.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'invoices' ? '3px solid #003666' : '3px solid transparent',
              color: activeTab === 'invoices' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'invoices' ? 800 : 600,
              padding: '10px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> Commercial Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('corporate')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'corporate' ? '3px solid #003666' : '3px solid transparent',
              color: activeTab === 'corporate' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'corporate' ? 800 : 600,
              padding: '10px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={16} /> Corporate & Banking Registry
          </button>
        </div>

        {/* Tab 1: API Raw Materials */}
        {activeTab === 'apis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <GlobalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search ${apis.length} APIs (e.g. Tirzepatide, BPC-157, Semaglutide, Epithalon, CAS)...`}
              resultCount={filteredApis.length}
              totalCount={apis.length}
            />

            {/* Consolidated GCP Macro-Family Filter Chips + Valuation Mode Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '2px' }}>
                  Filter Class:
                </span>
                {MACRO_FAMILY_CHIPS.map(chip => {
                  const isSel = selectedClass === chip.id;
                  const count = macroFamilyCounts[chip.id] || 0;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setSelectedClass(chip.id)}
                      style={{
                        background: isSel ? '#e8f0fe' : '#ffffff',
                        color: isSel ? '#1967d2' : '#3c4043',
                        border: isSel ? '1.5px solid #1967d2' : '1px solid #dadce0',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: isSel ? 750 : 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{chip.label}</span>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        background: isSel ? '#1967d2' : '#f1f5f9',
                        color: isSel ? '#ffffff' : '#64748b',
                        padding: '0px 6px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
                {(selectedClass !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass('all');
                      setSearchQuery('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.72rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
                  >
                    Reset ×
                  </button>
                )}
              </div>

              {/* Valuation Basis Toggle (Net Audited Cost vs +6% Magenta Transfer Price) */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}>
                <button
                  type="button"
                  onClick={() => setValuationMode('net')}
                  title="Show net audited acquisition cost per gram (matches Lifetime Spend & Purchase Receipts)"
                  style={{
                    border: 'none',
                    background: valuationMode === 'net' ? '#003666' : 'transparent',
                    color: valuationMode === 'net' ? '#ffffff' : '#475569',
                    fontSize: '0.68rem',
                    fontWeight: 750,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Net Audited Cost
                </button>
                <button
                  type="button"
                  onClick={() => setValuationMode('transfer')}
                  title="Show Magenta wholesale transfer price (+6.00% contractual margin cap)"
                  style={{
                    border: 'none',
                    background: valuationMode === 'transfer' ? '#003666' : 'transparent',
                    color: valuationMode === 'transfer' ? '#ffffff' : '#475569',
                    fontSize: '0.68rem',
                    fontWeight: 750,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Magenta Transfer (+6%)
                </button>
              </div>
            </div>

            <DataTable
              data={filteredApis}
              columns={apiColumns}
              keyField="name"
              sortable={true}
              mobileCardComponent={LotuslandApiMobileCard}
              mobileCardProps={{ renderDetailRow, valuationMode }}
              expandableRender={renderDetailRow}
              emptyTitle="No APIs match your filter"
              emptySubtitle="Try adjusting your search or category."
            />
          </div>
        )}

        {/* Tab 2: Commercial Invoices */}
        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              color: '#475569',
              lineHeight: 1.5
            }}>
              Summary of all {invoices.length} certified commercial releases executed between <strong>Lotusland Limited</strong> and licensed receiving pharmacies (<strong>Magenta RX Plus Compounding Pharmacy</strong> &amp; <strong>Mediluxe Health Solutions FZE</strong>).
            </div>

            <DataTable
              data={invoices}
              columns={invoiceColumns}
              keyField="invoiceNumber"
              sortable={true}
              mobileCardComponent={LotuslandInvoiceMobileCard}
              emptyTitle="No invoices found"
              emptySubtitle={`All ${invoices.length} commercial releases are reconciled.`}
            />
          </div>
        )}

        {/* Tab 3: Corporate & Banking Registry */}
        {activeTab === 'corporate' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Supplier Details */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Building2 size={18} color="#003666" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Supplier Legal Entity
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Legal Name</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{metadata.legalName}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Registration Number</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Hong Kong SAR #{metadata.regNumber}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Registered Office</span>
                  <span style={{ color: '#334155' }}>{metadata.address}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Commercial Desk Contact</span>
                  <span style={{ color: '#334155' }}>{metadata.contactPerson} ({metadata.phone}) · {metadata.email}</span>
                </div>
              </div>
            </div>

            {/* Banking Settlement */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <ShieldCheck size={18} color="#16a34a" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Banking &amp; Settlement Corridor
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Beneficiary Bank</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Citibank N.A., Hong Kong Branch</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Beneficiary Name</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Lotusland Limited</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Bank Account Number</span>
                  <span style={{ fontWeight: 700, color: '#003666', fontFamily: 'monospace' }}>395710448</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>SWIFT / BIC Code</span>
                  <span style={{ fontWeight: 700, color: '#003666', fontFamily: 'monospace' }}>CITIHKHX</span>
                </div>
              </div>
            </div>

            {/* Licensed Receiving Facilities */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Package size={18} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Authorized Facilities in UAE
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Magenta Pharma Medicine Trading LLC</span>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem' }}>TRN: 100574948400003 · Dubai Investments Park 2</span>
                  <span style={{ color: '#334155', fontSize: '0.72rem' }}>Magenta RX Plus Compounding Pharmacy (Al Mamzar &amp; Al Jaddaf)</span>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Mediluxe Health Solutions FZE</span>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem' }}>TRN: 104906198700003 (Medical Guild Trading FZC)</span>
                  <span style={{ color: '#334155', fontSize: '0.72rem' }}>Sharjah Publishing City &amp; Dubai Silicon Oasis</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Fixed Bottom Operations & Copilot Bar (Google Cloud Console Pattern) ── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #dadce0',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        zIndex: 50,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Left: Living Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.74rem',
            fontWeight: 750
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
            <span>Sourcing Audit Reconciled</span>
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            <strong style={{ color: '#003666' }}>{summary.uniqueApisCount} APIs</strong> · ${summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} Total Audited Capital
          </div>
        </div>

        {/* Right Actions: Atlas AI + Magenta Quotation + Excel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Atlas AI Copilot Button */}
          <button
            type="button"
            onClick={() => setIsAtlasAiOpen(true)}
            style={{
              backgroundColor: '#003666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0, 54, 102, 0.25)'
            }}
          >
            <Sparkles size={14} color="#38bdf8" />
            <span>Atlas AI Procurement Copilot</span>
            <span style={{
              backgroundColor: '#38bdf8',
              color: '#002244',
              fontSize: '0.62rem',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: 800
            }}>
              Ask
            </span>
          </button>

          {/* Magenta Official Quotation Direct Link */}
          <Link
            href="/b2b/quotes/magenta"
            style={{
              backgroundColor: '#166534',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 13px',
              fontSize: '0.78rem',
              fontWeight: 750,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(22, 101, 52, 0.25)'
            }}
          >
            <FileText size={14} />
            <span>Magenta Quotation ($37,179.50) →</span>
          </Link>

          {/* Download Audit Excel */}
          <button
            type="button"
            onClick={handleExport}
            style={{
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Download size={13} />
            <span>Excel Audit</span>
          </button>
        </div>
      </div>

      {/* Atlas AI Copilot Drawer */}
      <AtlasAiLotuslandDrawer
        isOpen={isAtlasAiOpen}
        onClose={() => setIsAtlasAiOpen(false)}
      />
    </div>
  );
}

