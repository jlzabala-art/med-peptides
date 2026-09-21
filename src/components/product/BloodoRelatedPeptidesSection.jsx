"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FlaskConical, ArrowUpRight, ShieldCheck, Sparkles, CheckCircle2 } from '@/lib/icons';
import './BloodoRelatedPeptidesSection.css';

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
      slug: 'selank',
      name: 'Selank',
      category: 'peptide',
      target: 'Neuro-Endocrine HPA Axis & Anxiolytic Modulation',
      rationaleEn: 'Modulates central GABAergic neurotransmission and stabilizes dysregulated adrenocortical cortisol rhythms without sedation.',
      rationaleEs: 'Modula la neurotransmisión GABAérgica y estabiliza los picos de cortisol del eje HPA sin generar sedación.'
    },
    {
      slug: 'semax',
      name: 'Semax',
      category: 'peptide',
      target: 'ACTH(4-10) Derived BDNF Enhancer',
      rationaleEn: 'Counteracts stress-induced hippocampal neurodegeneration, elevating central BDNF and neuroplasticity under chronic burnout.',
      rationaleEs: 'Protege el hipocampo contra el estrés crónico, elevando el BDNF y la resiliencia cognitiva ante el agotamiento adrenal.'
    },
    {
      slug: 'dsip',
      name: 'DSIP (Delta Sleep-Inducing Peptide)',
      category: 'peptide',
      target: 'Circadian Slow-Wave Sleep & Nocturnal Cortisol',
      rationaleEn: 'Promotes restorative slow-wave sleep stages (delta sleep), facilitating physiological nocturnal cortisol suppression.',
      rationaleEs: 'Promueve el sueño profundo de ondas lentas delta, favoreciendo el descenso fisiológico del cortisol nocturno.'
    },
    {
      slug: 'pinealon',
      name: 'Pinealon',
      category: 'peptide',
      target: 'Pineal Bioregulation & Chronobiology',
      rationaleEn: 'Short peptide normalizing pineal melatonin synthesis and chronobiological circadian synchronization.',
      rationaleEs: 'Biorregulador de la glándula pineal que normaliza la producción de melatonina y la cronobiología circadiana.'
    },
    {
      slug: 'oxytocin-acetate',
      name: 'Oxytocin Acetate',
      category: 'peptide',
      target: 'Hypothalamic Stress Buffer & Autonomic Tone',
      rationaleEn: 'Downregulates amygdala hyperactivity and dampens autonomic sympathetic stress reactivity and cortisol surges.',
      rationaleEs: 'Atenúa la hiperreactividad de la amígdala reduciendo la descarga simpática y los picos agudos de cortisol.'
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
    if (slug.includes('nad')) return 'bloodo-nad-level-test';
    if (slug.includes('hba1c') || slug.includes('hemoglobin')) return 'hemoglobin-a1c-hba1c-test';
    if (slug.includes('omega')) return 'omega-ratio-test';
    if (slug.includes('vitamin') || slug.includes('vit-d')) return 'vitamin-d-test';
    if (slug.includes('cortisol')) return 'cortisol-test';
    if (slug.includes('testosterone')) return 'testosterone-test';
    return null;
  }, [slug]);

  const peptidesList = useMemo(() => {
    if (!matchedTestKey) return [];
    return DEFAULT_RELATED_PEPTIDES[matchedTestKey] || [];
  }, [matchedTestKey]);

  if (!peptidesList || peptidesList.length === 0) {
    return null;
  }

  const isEs = lang === 'es';

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
                ? 'Péptidos Terapéuticos Relacionados' 
                : 'Targeted Therapeutic Peptides'}
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
        <p className="brp-intro-text">
          {isEs 
            ? 'Compuestos peptídicos con sólida evidencia preclínica y clínica indicados para optimización fisiológica, intervención metabólica o modulación según los biomarcadores evaluados en este panel diagnóstico.' 
            : 'Evidence-based peptide compounds indicated for physiological modulation, clinical optimization, or therapeutic intervention based on this biomarker profile.'}
        </p>

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
