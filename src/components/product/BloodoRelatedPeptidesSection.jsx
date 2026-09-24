"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  FlaskConical, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Activity,
  Award,
  ArrowRight,
  Clock,
  FileText
} from '@/lib/icons';
import './BloodoRelatedPeptidesSection.css';

/**
 * Institutional Clinical Protocol recommendations calibrated to each Bloodo diagnostic test.
 */
const DEFAULT_RELATED_PROTOCOLS = {
  'bloodo-nad-level-test': {
    slug: 'nad-cellular-restoration-protocol',
    shortCode: 'REF-NAD-MSTR',
    nameEn: 'Master NAD+ Protocol: Cellular Bioenergetics & Multi-Route Optimization',
    nameEs: 'Protocolo NAD+ Maestro: Bioenergética Celular y Optimización Multivía',
    category: 'Mitochondrial Bioenergetics & Sirtuin Activation',
    duration: '12 – 16 Weeks · Parenteral & SubQ Pathways',
    evidenceGrade: 'Grade A · Evidence-Based',
    summaryEn: 'Comprehensive master clinical protocol calibrated to baseline intracellular NAD+ levels, integrating intravenous loading, subcutaneous micro-dosing, and essential methylation safeguards.',
    summaryEs: 'Protocolo clínico maestro calibrado según los niveles basales de NAD+ intracelular, integrando infusión intravenosa, microdosificación subcutánea y protección obligatoria de metilación.',
    keyCompounds: ['NAD+ (IV / SubQ)', 'NMN', 'SS-31 (Elamipretide)', 'MOTS-c', 'TMG (Betaine)'],
    retestGuideline: 'Capillary DBS follow-up at Week 4 (IV) or Week 8 (SubQ)'
  },
  'hemoglobin-a1c-hba1c-test': {
    slug: 'personalized-metabolic-weight-loss-12w',
    shortCode: 'LXV-PMW-12W',
    nameEn: 'Personalized Incretin & Metabolic Regulation Protocol (12 Weeks)',
    nameEs: 'Protocolo Personalizado Incretínico y Regulación Metabólica (12 Semanas)',
    category: 'Metabolic & Glycemic Tone',
    duration: '12 Weeks · Progressive Titration',
    evidenceGrade: 'Grade A · Evidence-Based',
    summaryEn: 'Multi-target incretin receptor signaling engineered for visceral adiposity reduction, insulin resensitization, and HbA1c normalization.',
    summaryEs: 'Señalización incretínica de diana múltiple para reducción de grasa visceral, resensibilización a la insulina y normalización de HbA1c.',
    keyCompounds: ['Tirzepatide', 'MOTS-c', 'AOD-9604', 'BPC-157'],
    retestGuideline: 'Capillary DBS HbA1c test at Week 12'
  },
  'omega-ratio-test': {
    slug: 'recovery-foundation-bpc-tb',
    shortCode: 'LXV-RCF-8W',
    nameEn: 'Endothelial & Microvascular Restoration Protocol (8 Weeks)',
    nameEs: 'Protocolo de Restauración Endotelial y Microvascular (8 Semanas)',
    category: 'Microvascular & Inflammation Control',
    duration: '8 Weeks · Dual-Peptide Matrix',
    evidenceGrade: 'Grade A · Evidence-Based',
    summaryEn: 'Systemic endothelial and vascular anti-inflammatory protocol resolving chronic microvascular injury and optimizing cell membrane lipid resilience.',
    summaryEs: 'Protocolo sistémico antiinflamatorio vascular y endotelial para resolver el daño microvascular crónico y optimizar la resiliencia lipídica.',
    keyCompounds: ['BPC-157', 'TB-500', 'KPV'],
    retestGuideline: 'DBS Omega-3/6 index follow-up at Week 10'
  },
  'testosterone-test': {
    slug: 'hormonal-support-12w',
    shortCode: 'REF-TEST-HPTA',
    nameEn: 'Kisspeptin & Gonadorelin HPTA Endocrine Restart Protocol (12 Weeks)',
    nameEs: 'Protocolo de Reinicio Endocrino del Eje HPTA con Kisspeptina y Gonadorelina (12 Semanas)',
    category: 'Endocrine Vitality & Androgenic Axis',
    duration: '12 Weeks · Progressive Secretagogue Pulsing',
    evidenceGrade: 'Grade A · Evidence-Based',
    summaryEn: 'Advanced neuro-endocrine protocol activating hypothalamic GnRH pulsatility and Leydig cell steroidogenesis to restore natural testosterone production without testicular atrophy.',
    summaryEs: 'Protocolo neuroendocrino avanzado que activa la pulsatilidad de GnRH hipotalámica y la esteroidogénesis en células de Leydig para restablecer la testosterona natural sin atrofia testicular.',
    keyCompounds: ['Kisspeptin-10', 'Testagen', 'hCG / Gonadorelin', 'CJC-1295 / Ipamorelin', 'Zinc + DIM'],
    retestGuideline: 'Capillary DBS LC-MS/MS Testosterone+ follow-up at Week 8'
  },
  'cortisol-test': {
    slug: 'sleep-restoration-8w',
    shortCode: 'REF-CORT-REST',
    nameEn: 'DSIP & Selank Circadian Neuro-Endocrine Stress Protocol (8 Weeks)',
    nameEs: 'Protocolo Neuroendocrino de Estrés Circadiano con DSIP y Selank (8 Semanas)',
    category: 'HPA Axis & Circadian Adrenal Recovery',
    duration: '8 Weeks · Biphasic Diurnal Harmonization',
    evidenceGrade: 'Grade A · Evidence-Based',
    summaryEn: 'Chronobiological neuro-peptide regimen designed to suppress evening allostatic cortisol surges, promote deep stage-4 delta sleep, and restore healthy morning awakening response (CAR).',
    summaryEs: 'Pauta cronobiológica de neuropéptidos diseñada para modular el cortisol vespertino, promover el sueño profundo delta y restaurar la respuesta matutina saludable al despertar (CAR).',
    keyCompounds: ['Epithalon', 'Selank', 'Semax', 'DSIP', 'Phosphatidylserine'],
    retestGuideline: 'Dual AM/PM capillary DBS Cortisol follow-up at Week 8'
  },
  'vitamin-d-test': {
    slug: 'thymalin-epitalon-synergistic-longevity',
    shortCode: 'REF-VITD-IMMU',
    nameEn: 'Thymic & Innate Immune Bioregulation Protocol (8 Weeks)',
    nameEs: 'Protocolo de Biorregulación Tímica e Inmunidad Innata (8 Semanas)',
    category: 'Innate Immunity & Genomic VDR Axis',
    duration: '8 Weeks · Dual Bioregulator Matrix',
    evidenceGrade: 'Grade A · Evidence-Based',
    summaryEn: 'Synergistic peptide protocol combining thymic bioregulators with 1,25(OH)2D3-VDR axis optimization to restore T-cell maturation, cathelicidin (LL-37) synthesis, and systemic immune resilience.',
    summaryEs: 'Protocolo peptídico sinérgico que combina biorreguladores tímicos con la optimización del eje VDR de vitamina D para restaurar la maduración de linfocitos T y la síntesis de LL-37.',
    keyCompounds: ['Thymosin Alpha-1', 'LL-37', 'Cartalax', 'Vitamin D3/K2', 'CJC-1295 / Ipamorelin'],
    retestGuideline: 'Capillary DBS 25(OH)D follow-up at Week 10'
  }
};

/**
 * Static fallback map of certified Lotusland Limited therapeutic peptides
 * clinically related to each of the 6 Bloodo diagnostic tests.
 */
const DEFAULT_RELATED_PEPTIDES = {
  'bloodo-nad-level-test': [
    {
      slug: 'nad',
      name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
      category: 'peptide',
      target: 'Mitochondrial Bioenergetics & Sirtuin Activation',
      rationaleEn: 'Direct intracellular coenzyme replenishment restoring cellular redox potential and activating SIRT1/SIRT3 longevity enzymes.',
      rationaleEs: 'Reposición directa del coenzima intracelular restaurando el potencial redox y activando sirtuínas SIRT1/SIRT3.'
    },
    {
      slug: 'nmn',
      name: 'NMN (Nicotinamide Mononucleotide)',
      category: 'raw_material',
      target: 'Endogenous NAD+ Salvage Pathway',
      rationaleEn: 'Direct biological precursor rapidly enzymatically converted into NAD+ via NMNAT, boosting physiological cellular levels.',
      rationaleEs: 'Precursor biológico directo convertido enzimáticamente en NAD+ vía NMNAT, elevando niveles celulares endógenos.'
    },
    {
      slug: 'ss-31',
      name: 'SS-31 (Elamipretide)',
      category: 'peptide',
      target: 'Inner Mitochondrial Membrane / Cardiolipin',
      rationaleEn: 'Selectively binds cardiolipin, stabilizing cristae architecture and preventing reactive oxygen species (ROS) leakage.',
      rationaleEs: 'Se une selectivamente a la cardiolipina estabilizando las crestas mitocondriales y frenando la fuga de radicales libres.'
    },
    {
      slug: 'mots-c',
      name: 'MOTS-c',
      category: 'peptide',
      target: 'Mitochondrial-Derived Peptide / Metabolic Flexibility',
      rationaleEn: 'Promotes AMPK phosphorylation, cellular glucose uptake, and metabolic adaptation under metabolic decline.',
      rationaleEs: 'Promueve la fosforilación de AMPK, la captación de glucosa y la resiliencia metabólica ante el declive celular.'
    },
    {
      slug: 'epithalon',
      name: 'Epithalon (Epitalon)',
      category: 'peptide',
      target: 'Telomerase Induction & Pineal Regulation',
      rationaleEn: 'Ultra-short bioregulator stimulating telomerase elongation and harmonizing neuro-endocrine circadian longevity.',
      rationaleEs: 'Biorregulador peptídico que estimula la elongación telomérica y armoniza el eje neuroendocrino y circadiano.'
    }
  ],
  'hemoglobin-a1c-hba1c-test': [
    {
      slug: 'tirzepatide',
      name: 'Tirzepatide',
      category: 'peptide',
      target: 'Dual GIP / GLP-1 Receptor Agonist',
      rationaleEn: 'Synergistic dual incretin receptor signaling providing superior glycemic reduction, insulin sensitivity, and HbA1c normalization.',
      rationaleEs: 'Agonista dual incretínico de alta potencia para normalización glucémica, sensibilidad a la insulina y reducción de HbA1c.'
    },
    {
      slug: 'semaglutide',
      name: 'Semaglutide',
      category: 'peptide',
      target: 'GLP-1 Receptor Agonist',
      rationaleEn: 'Stimulates glucose-dependent insulin secretion, inhibits glucagon output, and regulates postprandial glycemic excursions.',
      rationaleEs: 'Estimula la secreción dependiente de glucosa de insulina, reduce el glucagón y estabiliza picos glucémicos postprandiales.'
    },
    {
      slug: 'retatrutide',
      name: 'Retatrutide',
      category: 'peptide',
      target: 'Triple GGG (GLP-1 / GIP / Glucagon) Agonist',
      rationaleEn: 'Next-generation triple agonist promoting dramatic hepatic fat clearance, energy expenditure, and glycemic control.',
      rationaleEs: 'Agonista triple de última generación con potente acción lipolítica hepática, gasto energético y control glucémico.'
    },
    {
      slug: 'cagrilintide',
      name: 'Cagrilintide',
      category: 'peptide',
      target: 'Long-Acting Amylin Receptor Agonist',
      rationaleEn: 'Delays gastric emptying and promotes central satiety, acting synergistically with incretin therapies.',
      rationaleEs: 'Retarda el vaciado gástrico y promueve la saciedad central actuando de forma sinérgica con terapias incretínicas.'
    },
    {
      slug: 'mots-c',
      name: 'MOTS-c',
      category: 'peptide',
      target: 'Metabolic & Insulin Sensitizer',
      rationaleEn: 'Improves skeletal muscle glucose uptake and systemic insulin sensitivity via folate-purine-AMPK axis.',
      rationaleEs: 'Mejora la captación muscular de glucosa y la sensibilidad a la insulina a través del eje folato-purina-AMPK.'
    }
  ],
  'omega-ratio-test': [
    {
      slug: 'bpc-157',
      name: 'BPC-157',
      category: 'peptide',
      target: 'Endothelial & Mucosal Microvascular Healing',
      rationaleEn: 'Promotes VEGF expression, accelerates tissue remodeling, and counteracts chronic microvascular inflammation.',
      rationaleEs: 'Promueve la angiogénesis, repara tejidos endoteliales y contrarresta la inflamación microvascular sistémica.'
    },
    {
      slug: 'tb-500',
      name: 'TB-500 (Thymosin Beta-4)',
      category: 'peptide',
      target: 'Actin Regulation & Tissue Regeneration',
      rationaleEn: 'Upregulates cell migration, tissue survival, and downregulates pro-inflammatory cytokines in damaged vascular structures.',
      rationaleEs: 'Biorregula la actina, estimula la migración celular y disminuye citoquinas inflamatorias en tejidos vasculares.'
    },
    {
      slug: 'kpv',
      name: 'KPV Tripeptide',
      category: 'peptide',
      target: 'Deep Anti-Inflammatory α-MSH Analogue',
      rationaleEn: 'Translocates to cell nucleus to inhibit NF-κB inflammatory cascade without pigmentary or endocrine side-effects.',
      rationaleEs: 'Inhibe directamente la cascada proinflamatoria NF-κB a nivel nuclear sin efectos secundarios pigmentarios.'
    },
    {
      slug: 'ghk-cu',
      name: 'GHK-Cu (Copper Tripeptide)',
      category: 'peptide',
      target: 'Vascular Remodeling & Antioxidant Defense',
      rationaleEn: 'Modulates collagen matrix synthesis, reduces systemic oxidative stress, and promotes vascular wall integrity.',
      rationaleEs: 'Modula la síntesis de colágeno, neutraliza el estrés oxidativo y refuerza la integridad de paredes vasculares.'
    },
    {
      slug: 'cardiogen',
      name: 'Cardiogen',
      category: 'peptide',
      target: 'Myocardial & Vascular Bioregulation',
      rationaleEn: 'Short peptide sequence stimulating cardiomyocyte protein synthesis and reducing fibrotic progression.',
      rationaleEs: 'Péptido biorregulador que estimula la síntesis proteica en cardiomiocitos y frena la fibrosis vascular.'
    }
  ],
  'vitamin-d-test': [
    {
      slug: 'thymosin-alpha-1',
      name: 'Thymosin Alpha 1 (Ta1)',
      category: 'peptide',
      target: 'Thymic T-Cell & Innate Immune Competence',
      rationaleEn: 'Synergizes with 1,25-dihydroxyvitamin D3 in stimulating dendritic and T-cell maturation and immune homeostasis.',
      rationaleEs: 'Acción sinérgica con la forma activa de la vitamina D estimulando la maduración de linfocitos T y la homeostasis inmune.'
    },
    {
      slug: 'll-37',
      name: 'LL-37 Cathelicidin',
      category: 'peptide',
      target: 'Vitamin D-Dependent Host Defense Peptide',
      rationaleEn: 'Direct transcriptional target of 1,25(OH)2D3-VDR signaling, exerting broad-spectrum antimicrobial and barrier defenses.',
      rationaleEs: 'Péptido de defensa inmune cuya síntesis celular depende directamente del receptor de vitamina D (VDR).'
    },
    {
      slug: 'cartalax',
      name: 'Cartalax',
      category: 'peptide',
      target: 'Osteoarticular & Chondrocyte Bioregulator',
      rationaleEn: 'Restores metabolic balance in osteoarticular chondrocytes and supports bone matrix preservation.',
      rationaleEs: 'Regula el metabolismo celular del tejido osteoarticular y apoya la preservación de la matriz ósea y cartilaginosa.'
    },
    {
      slug: 'cjc-1295-ipamorelin',
      name: 'CJC-1295 + Ipamorelin',
      category: 'peptide',
      target: 'Pulsatile GH Axis & Bone Mineral Density',
      rationaleEn: 'Stimulates physiological growth hormone release, promoting osteoblast activity, calcium retention, and lean tissue preservation.',
      rationaleEs: 'Estimula pulsos de hormona de crecimiento, favoreciendo la retención cálcica, osteoblastos y masa libre de grasa.'
    }
  ],
  'cortisol-test': [
    {
      slug: 'epithalon',
      name: 'Epithalon (Epitalon)',
      category: 'peptide',
      target: 'Pineal Bioregulation & Circadian Rhythm Synchronization',
      rationaleEn: 'Synchronizes the suprachiasmatic nucleus (SCN), restores pineal melatonin-cortisol diurnal rhythm, and normalizes evening cortisol surges.',
      rationaleEs: 'Sincroniza el núcleo supraquiasmático, normaliza el ritmo diurno melatonina-cortisol y amortigua los picos elevados de cortisol vespertino.'
    },
    {
      slug: 'selank',
      name: 'Selank',
      category: 'peptide',
      target: 'Neuro-Endocrine HPA Axis & Anxiolytic Modulation',
      rationaleEn: 'Modulates central GABAergic neurotransmission and downregulates hyperactive CRH/ACTH signaling under chronic stress without sedation.',
      rationaleEs: 'Modula la neurotransmisión GABAérgica y atenúa la hiperreactividad del eje HPA (CRH/ACTH) ante el estrés crónico sin sedación.'
    },
    {
      slug: 'semax',
      name: 'Semax',
      category: 'peptide',
      target: 'ACTH(4-10) Derived BDNF & Hippocampal Neuroprotection',
      rationaleEn: 'Counteracts glucocorticoid-induced hippocampal neurotoxicity, sustaining central BDNF expression and neuroplasticity during burnout.',
      rationaleEs: 'Protege las neuronas hipocampales contra la neurotoxicidad por exceso glucocorticoide, elevando el BDNF y la resiliencia cognitiva.'
    },
    {
      slug: 'dsip',
      name: 'DSIP (Delta Sleep-Inducing Peptide)',
      category: 'peptide',
      target: 'Circadian Slow-Wave Sleep & Nocturnal Cortisol Nadir',
      rationaleEn: 'Promotes restorative stage-3/4 delta sleep and facilitates physiological nocturnal cortisol suppression, enabling adrenal recovery.',
      rationaleEs: 'Promueve el sueño profundo delta de ondas lentas y favorece el descenso fisiológico del cortisol nocturno, facilitando la recuperación adrenal.'
    },
    {
      slug: 'cjc-1295-ipamorelin',
      name: 'CJC-1295 + Ipamorelin',
      category: 'peptide',
      target: 'Nocturnal GH Secretagogue & Cellular Repair Synergist',
      rationaleEn: 'Stimulates physiological pulsatile GH/IGF-1 release during slow-wave sleep without activating cortisol, ACTH, or prolactin.',
      rationaleEs: 'Estimula la secreción pulsátil fisiológica de hormona de crecimiento durante el sueño profundo sin inducir picos de cortisol ni prolactina.'
    }
  ],
  'bloodo-cortisol-test': [
    {
      slug: 'epithalon',
      name: 'Epithalon (Epitalon)',
      category: 'peptide',
      target: 'Pineal Bioregulation & Circadian Rhythm Synchronization',
      rationaleEn: 'Synchronizes the suprachiasmatic nucleus (SCN), restores pineal melatonin-cortisol diurnal rhythm, and normalizes evening cortisol surges.',
      rationaleEs: 'Sincroniza el núcleo supraquiasmático, normaliza el ritmo diurno melatonina-cortisol y amortigua los picos elevados de cortisol vespertino.'
    },
    {
      slug: 'selank',
      name: 'Selank',
      category: 'peptide',
      target: 'Neuro-Endocrine HPA Axis & Anxiolytic Modulation',
      rationaleEn: 'Modulates central GABAergic neurotransmission and downregulates hyperactive CRH/ACTH signaling under chronic stress without sedation.',
      rationaleEs: 'Modula la neurotransmisión GABAérgica y atenúa la hiperreactividad del eje HPA (CRH/ACTH) ante el estrés crónico sin sedación.'
    },
    {
      slug: 'semax',
      name: 'Semax',
      category: 'peptide',
      target: 'ACTH(4-10) Derived BDNF & Hippocampal Neuroprotection',
      rationaleEn: 'Counteracts glucocorticoid-induced hippocampal neurotoxicity, sustaining central BDNF expression and neuroplasticity during burnout.',
      rationaleEs: 'Protege las neuronas hipocampales contra la neurotoxicidad por exceso glucocorticoide, elevando el BDNF y la resiliencia cognitiva.'
    },
    {
      slug: 'dsip',
      name: 'DSIP (Delta Sleep-Inducing Peptide)',
      category: 'peptide',
      target: 'Circadian Slow-Wave Sleep & Nocturnal Cortisol Nadir',
      rationaleEn: 'Promotes restorative stage-3/4 delta sleep and facilitates physiological nocturnal cortisol suppression, enabling adrenal recovery.',
      rationaleEs: 'Promueve el sueño profundo delta de ondas lentas y favorece el descenso fisiológico del cortisol nocturno, facilitando la recuperación adrenal.'
    },
    {
      slug: 'cjc-1295-ipamorelin',
      name: 'CJC-1295 + Ipamorelin',
      category: 'peptide',
      target: 'Nocturnal GH Secretagogue & Cellular Repair Synergist',
      rationaleEn: 'Stimulates physiological pulsatile GH/IGF-1 release during slow-wave sleep without activating cortisol, ACTH, or prolactin.',
      rationaleEs: 'Estimula la secreción pulsátil fisiológica de hormona de crecimiento durante el sueño profundo sin inducir picos de cortisol ni prolactina.'
    }
  ],
  'testosterone-test': [
    {
      slug: 'kisspeptin-10',
      name: 'Kisspeptin-10',
      category: 'peptide',
      target: 'Hypothalamic GnRH Pulse Stimulation',
      rationaleEn: 'Acts upstream on KISS1 receptors in GnRH neurons, triggering endogenous LH and FSH release to stimulate Leydig cells.',
      rationaleEs: 'Estimula receptores hipotalámicos KISS1 activando pulsos de GnRH, LH y FSH para secreción endógena de testosterona.'
    },
    {
      slug: 'hcg',
      name: 'hCG (Human Chorionic Gonadotropin)',
      category: 'peptide',
      target: 'LH Receptor Agonist / Leydig Cell Stimulation',
      rationaleEn: 'Direct LH receptor biomimetic maintaining testicular volume and stimulating intratesticular testosterone synthesis.',
      rationaleEs: 'Biomimético del receptor de LH que mantiene el volumen testicular y estimula la síntesis intratesticular de testosterona.'
    },
    {
      slug: 'testagen',
      name: 'Testagen',
      category: 'peptide',
      target: 'Testicular Bioregulator Peptide',
      rationaleEn: 'Peptide bioregulator supporting functional cellular restoration in testicular tissue and endocrine vitality.',
      rationaleEs: 'Péptido biorregulador que estimula la síntesis proteica y revitalización funcional del tejido testicular.'
    },
    {
      slug: 'cjc-1295-no-dac-ipamorelin',
      name: 'CJC-1295 No DAC + Ipamorelin',
      category: 'peptide',
      target: 'Endocrine Growth Hormone / IGF-1 Synergist',
      rationaleEn: 'Augments systemic IGF-1 and anabolic signaling to preserve androgenic body composition and lean muscle mass.',
      rationaleEs: 'Eleva el IGF-1 sistémico y el anabolismo fisiológico preservando la masa magra y la vitalidad androgénica.'
    },
    {
      slug: 'sermorelin',
      name: 'Sermorelin',
      category: 'peptide',
      target: 'GHRH(1-29) Pituitary Neuro-Endocrine Axis',
      rationaleEn: 'Restores pulsatile pituitary GH release, supporting metabolic vigor and optimizing neuro-endocrine homeostasis.',
      rationaleEs: 'Restaura los pulsos hipofisarios de GH, apoyando el vigor metabólico y optimizando la homeostasis neuroendocrina.'
    }
  ]
};

export default function BloodoRelatedPeptidesSection({ product, lang = 'en' }) {
  const slug = String(product?.slug || product?.id || '').toLowerCase();

  const matchedTestKey = useMemo(() => {
    const s = `${product?.slug || ''} ${product?.id || ''} ${product?.name || ''}`.toLowerCase();
    if (s.includes('testosterone') || s.includes('testosterona')) return 'testosterone-test';
    if (s.includes('cortisol')) return 'cortisol-test';
    if (s.includes('hba1c') || s.includes('hemoglobin') || s.includes('hemoglobina')) return 'hemoglobin-a1c-hba1c-test';
    if (s.includes('omega')) return 'omega-ratio-test';
    if (s.includes('vitamin-d') || s.includes('vitamina-d') || s.includes('vitamin d') || s.includes('vitamina d')) return 'vitamin-d-test';
    if (s.includes('nad')) return 'bloodo-nad-level-test';
    return null;
  }, [product]);

  const peptidesList = useMemo(() => {
    if (!matchedTestKey) return [];
    return DEFAULT_RELATED_PEPTIDES[matchedTestKey] || [];
  }, [matchedTestKey]);

  const matchedProtocol = useMemo(() => {
    if (!matchedTestKey) return null;
    return DEFAULT_RELATED_PROTOCOLS[matchedTestKey] || null;
  }, [matchedTestKey]);

  const isEs = lang === 'es';

  if (!peptidesList || peptidesList.length === 0) {
    return null;
  }

  return (
    <section id="related-peptides-section" className="brp-section-card">
      <div className="brp-section-header">
        <div className="brp-header-left">
          <div className="brp-header-icon">
            <FlaskConical size={22} color="#0d9488" />
          </div>
          <div className="brp-header-titles">
            <div className="brp-header-meta">
              <span className="brp-supplier-pill">
                {isEs ? 'ACOMPAÑAMIENTO TERAPÉUTICO CLÍNICO' : 'CLINICAL THERAPEUTIC COMPANIONS'}
              </span>
              <span className="brp-verified-pill">
                <CheckCircle2 size={11} /> {isEs ? 'CATÁLOGO CLÍNICO CERTIFICADO' : 'VERIFIED CLINICAL CATALOG'}
              </span>
            </div>
            <h3 className="brp-header-title">
              {isEs 
                ? 'Péptidos Terapéuticos & Protocolo Relacionado' 
                : 'Targeted Therapeutic Peptides & Calibrated Protocol'}
            </h3>
          </div>
        </div>

        <div className="brp-header-right">
          <div className="brp-purity-badge">
            <ShieldCheck size={14} color="#38bdf8" />
            <span>Ph. Eur. / USP Standard · Purity ≥ 99%</span>
          </div>
        </div>
      </div>

      <div className="brp-section-body">
        {/* Featured Master Clinical Protocol Card */}
        {matchedProtocol && (
          <div className="brp-protocol-banner">
            <div className="brp-proto-banner-top">
              <div className="brp-proto-badges">
                <span className="brp-proto-tag">
                  <Activity size={12} /> {isEs ? 'PROTOCOLO CLÍNICO CALIBRADO' : 'CALIBRATED CLINICAL PROTOCOL'}
                </span>
                <span className="brp-proto-grade">
                  <Award size={12} /> {matchedProtocol.evidenceGrade}
                </span>
                <span className="brp-proto-duration">
                  <Clock size={12} /> {matchedProtocol.duration}
                </span>
              </div>
              <div className="brp-proto-code-pill">
                {matchedProtocol.shortCode}
              </div>
            </div>

            <div className="brp-proto-banner-content">
              <div className="brp-proto-main">
                <h4 className="brp-proto-title">
                  {isEs ? matchedProtocol.nameEs : matchedProtocol.nameEn}
                </h4>
                <p className="brp-proto-summary">
                  {isEs ? matchedProtocol.summaryEs : matchedProtocol.summaryEn}
                </p>

                <div className="brp-proto-compounds">
                  <span className="brp-compounds-label">
                    {isEs ? 'Compuestos Activos en Sinergia:' : 'Included Synergistic Compounds:'}
                  </span>
                  <div className="brp-compounds-list">
                    {matchedProtocol.keyCompounds.map((comp, cIdx) => (
                      <span key={cIdx} className="brp-compound-chip">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="brp-proto-cta-box">
                <div className="brp-retest-note">
                  <FileText size={13} color="#0d9488" />
                  <span>{matchedProtocol.retestGuideline}</span>
                </div>
                <Link 
                  href={`/proto/${matchedProtocol.slug}`}
                  className="brp-proto-btn"
                  title={isEs ? 'Ver protocolo clínico completo' : 'View full clinical protocol blueprint'}
                >
                  <span>{isEs ? 'Explorar Protocolo Completo' : 'Explore Clinical Protocol'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="brp-peptides-lead-row">
          <h4 className="brp-peptides-subtitle">
            <Sparkles size={14} color="#0284c7" />
            {isEs ? 'Monografías de Compuestos Peptídicos Asociados' : 'Associated Therapeutic Compound Monographs'}
          </h4>
          <p className="brp-intro-text">
            {isEs 
              ? 'Compuestos peptídicos con sólida evidencia preclínica y clínica indicados para optimización fisiológica, intervención metabólica o modulación según los biomarcadores evaluados en este panel diagnóstico.' 
              : 'Evidence-based peptide compounds indicated for physiological modulation, clinical optimization, or therapeutic intervention based on this biomarker profile.'}
          </p>
        </div>

        <div className="brp-rows-list">
          {peptidesList.map((pep) => {
            const peptideUrl = `/p/${encodeURIComponent(pep.slug)}?supplier=supplier-lotusland`;
            const rationale = isEs ? (pep.rationaleEs || pep.rationaleEn) : pep.rationaleEn;

            return (
              <div key={pep.slug} className="brp-row">
                <div className="brp-row-lead">
                  <span className="brp-target-tag">
                    <Sparkles size={11} /> {pep.target}
                  </span>
                  <h4 className="brp-peptide-name">
                    {pep.name}
                  </h4>
                </div>

                <div className="brp-row-description">
                  <p className="brp-rationale">
                    {rationale}
                  </p>
                </div>

                <div className="brp-row-actions">
                  <span className="brp-spec-pill">
                    {isEs ? 'Pureza ≥ 99.0% · RP-HPLC' : 'Purity ≥ 99.0% · RP-HPLC'}
                  </span>
                  <Link 
                    href={peptideUrl}
                    className="brp-view-link"
                    title={isEs ? `Ver ficha técnica de ${pep.name}` : `View clinical monograph for ${pep.name}`}
                  >
                    <span>{isEs ? 'Ver Ficha Técnica' : 'View Monograph'}</span>
                    <ArrowUpRight size={14} className="brp-arrow-icon" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
