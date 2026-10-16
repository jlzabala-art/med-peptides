"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Droplets, Leaf, ShieldCheck, ChevronRight,
  CheckCircle2, Sparkles, Package, Info, BookOpen,
  ChevronDown, Layers, Activity, Award, ExternalLink
} from 'lucide-react';
import './ProtocolCosmeticsAdjunctsCard.css';

/**
 * ProtocolCosmeticsAdjunctsCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a "Recommended Cosmeceutical Adjuncts" section inside a protocol page.
 * Used for hair-loss protocols (like GHK-Cu) to surface topical synergy companions
 * (e.g. Colway Strengthening Shampoo & Conditioner) with full clinical justification.
 */
export default function ProtocolCosmeticsAdjunctsCard({
  products = [],
  protocol = null,
  protocolGoal = 'Hair Loss & Scalp Health',
  lang = 'en'
}) {
  const [expanded, setExpanded] = useState(true);
  const [showClinicalDossier, setShowClinicalDossier] = useState(false);
  const [activeTab, setActiveTab] = useState('collagen'); // 'collagen' | 'penetration' | 'igf1' | 'evidence'

  const isEs = lang === 'es';

  const goalStr = `${protocolGoal || ''} ${protocol?.goal || ''} ${protocol?.category || ''} ${protocol?.title || ''} ${protocol?.treatmentTitle || ''}`.toLowerCase();
  const isSkinGoal = goalStr.includes('skin') || goalStr.includes('aging') || goalStr.includes('aesthetic') || goalStr.includes('wrinkle') || goalStr.includes('face') || goalStr.includes('dermal');
  const isRecoveryGoal = !isSkinGoal && (goalStr.includes('recovery') || goalStr.includes('joint') || goalStr.includes('injury') || goalStr.includes('tissue') || goalStr.includes('wound') || goalStr.includes('longevity') || goalStr.includes('bpc'));

  // Normalize products from Firestore or fallback
  const rawProducts = (protocol?.topical_adjuncts && protocol.topical_adjuncts.length > 0)
    ? protocol.topical_adjuncts
    : (products.length > 0 ? products : null);

  let defaultProducts = [];
  if (isSkinGoal) {
    defaultProducts = [
      {
        slug: 'colway-blue-diamond-peeling',
        name: 'Colway Blue Diamond Peeling',
        step: isEs ? 'Paso 1 — Exfoliación Micro-Dermoabrasiva & Enzimática' : 'Step 1 — Diamond Micro-Exfoliation & Peel',
        tagline: 'Gemmological diamond dust, papain, subtilisin & native tropocollagen',
        image_url: '/images/products/colway/blue-diamond-peeling.png',
        key_compounds: ['Diamond Micro-Dust', 'Papain & Subtilisin', 'Native Fish Tropocollagen', 'Almond Oil'],
        synergy_role: isEs
          ? 'Remueve suavemente corneocitos queratinizados senescentes del estrato córneo para multiplicar la absorción y reactividad dérmica de los péptidos bioreguladores (GHK-Cu, Snap-8).'
          : 'Gently clears senescent corneocytes from the stratum corneum to dramatically increase dermal permeability and reactivity to bioregulatory peptides (GHK-Cu, Snap-8).',
        frequency: isEs ? '2× por semana antes de la aplicación del sérum/crema' : '2× weekly prior to evening peptide serum/cream application',
        synergy_score: 96,
        supplier: 'Colway'
      },
      {
        slug: 'colway-blue-diamond-cream',
        name: 'Colway Blue Diamond Cream',
        step: isEs ? 'Paso 2 — Neocolagenogénesis & Matriz Extracelular' : 'Step 2 — VEP-Peptides & Neocollagenesis',
        tagline: 'VEP-endorphin peptides, native tropocollagen, coenzyme Q10 & diamond bio-scaffold',
        image_url: '/images/products/colway/blue-diamond-cream.png',
        key_compounds: ['VEP-Carrier Peptides', 'Native Fish Tropocollagen', 'CoQ10', 'Hyaluronic Acid'],
        synergy_role: isEs
          ? 'Desencadena la transcripción de pro-colágeno I y III en fibroblastos dérmicos mediante vesículas de penetración epidérmica (VEP), potenciando el efecto tensor y la firmeza dérmica.'
          : 'Stimulates pro-collagen I and III transcription in dermal fibroblasts via vesicular epidermal penetration (VEP) carriers, maximizing skin turgor and wrinkle smoothing.',
        frequency: isEs ? 'Diario mañana y noche sobre rostro y cuello' : 'Daily morning and night across facial and neck skin',
        synergy_score: 98,
        supplier: 'Colway'
      },
      {
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen & Marine Algae',
        step: isEs ? 'Paso 3 — Soporte Nutracéutico Sistémico' : 'Step 3 — Oral ECM Systemic Bio-Scaffold',
        tagline: 'Lyophilized freshwater fish tropocollagen (triple-helix preserved), Fucus algae & Vitamin E',
        image_url: '/images/products/colway/colvita.png',
        key_compounds: ['Triple-Helix Tropocollagen', 'Fucus vesiculosus', 'Natural Vitamin E', 'Organic Iodine'],
        synergy_role: isEs
          ? 'Aporta oligopéptidos de colágeno intactos (secuencia Gly-Pro-Hyp) biodisponibles por vía oral, actuando como materia prima sistémica para la biosíntesis de matriz extracelular dérmica.'
          : 'Delivers intact rate-limiting collagen oligopeptides (Gly-Pro-Hyp) with high oral bioavailability, acting as the systemic foundation for dermal fibroblast neo-collagenesis.',
        frequency: isEs ? '2 cápsulas al día con agua durante las comidas' : '2 capsules daily with a glass of water alongside meals',
        synergy_score: 95,
        supplier: 'Colway'
      }
    ];
  } else if (isRecoveryGoal) {
    defaultProducts = [
      {
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen & Marine Algae',
        step: isEs ? 'Soporte Oral — Bio-Andamio de Tropocolágeno Nativo' : 'Oral Support — Systemic Collagen Bio-Scaffold',
        tagline: 'Pure freeze-dried fish tropocollagen (triple-helix preserved) + marine algae & Vitamin E',
        image_url: '/images/products/colway/colvita.png',
        key_compounds: ['Freeze-Dried Tropocollagen', 'Fucus Algae (Trace Minerals)', 'Vitamin E', 'Triple Helix Conformation'],
        synergy_role: isEs
          ? 'Proporciona el andamiaje estructural rate-limiting de oligopéptidos bioactivos necesario para que péptidos tisulares como BPC-157 y TB-500 reparen tendones, ligamentos, cartílago y matriz extracelular con máxima velocidad.'
          : 'Provides the rate-limiting structural bio-scaffolding of bioactive oligopeptides required for regenerative peptides like BPC-157 and TB-500 to accelerate tendon, ligament, joint cartilage, and ECM repair.',
        frequency: isEs ? '2 cápsulas al día con agua durante comidas principales' : '2 capsules daily with a glass of water alongside main meals',
        synergy_score: 98,
        supplier: 'Colway'
      }
    ];
  } else {
    // Default: Hair Loss / Scalp Trichology
    defaultProducts = [
      {
        slug: 'colway-strengthening-shampoo',
        name: 'Colway Strengthening Hair Shampoo',
        step: isEs ? 'Paso 1 — Preparación del Cuero Cabelludo' : 'Step 1 — Scalp Prep',
        tagline: 'DHT inhibition, anagen extension, scalp microbiome support',
        image_url: '/images/products/colway/shampoo.png',
        key_compounds: ['Caffeine (IGF-1)', 'Zinc PCA (DHT↓)', 'Niacinamide (VEGF↑)', 'Native Collagen'],
        synergy_role: isEs
          ? 'Prepara el cuero cabelludo eliminando sebo con DHT, activando microcirculación y fijando un pH 4.5–5.5 ideal para absorción de péptidos.'
          : 'Prepares the scalp by removing DHT-laden sebum, activating microcirculation, and creating an optimal pH environment for peptide absorption.',
        frequency: isEs ? '3–4× por semana, aplicado antes de GHK-Cu' : '3–4× per week, applied before GHK-Cu topical if used',
        synergy_score: 94,
        supplier: 'Colway'
      },
      {
        slug: 'colway-strengthening-conditioner',
        name: 'Colway Strengthening Conditioner',
        step: isEs ? 'Paso 2 — Reparación del Córtex' : 'Step 2 — Cortex Repair',
        tagline: 'Keratin cortex reinforcement, cuticle sealing, moisture retention',
        image_url: '/images/products/colway/conditioner.png',
        key_compounds: ['Argan Oil (barrier)', 'Keratin Hydrolysate', 'Panthenol (B5)', 'Silk Amino Acids'],
        synergy_role: isEs
          ? 'Sella la cutícula y refuerza el córtex. Evita la rotura mecánica durante la fase de rebrote del protocolo.'
          : 'Seals the cuticle and fills cortical micro-fractures after the shampoo phase. Reduces mechanical breakage during the regrowth phase.',
        frequency: isEs ? 'Tras cada champú, dejar 5–10 min' : 'After every shampoo session, leave 5–10 min before rinsing',
        synergy_score: 88,
        supplier: 'Colway'
      }
    ];
  }

  const displayProducts = rawProducts ? rawProducts.map((p, idx) => ({
    slug: p.product_slug || p.slug || (idx === 0 ? 'colway-strengthening-shampoo' : 'colway-strengthening-conditioner'),
    name: p.product_name || p.name,
    step: p.step || (idx === 0 ? (isEs ? 'Paso 1' : 'Step 1') : (isEs ? 'Paso 2' : 'Step 2')),
    tagline: p.tagline || '',
    image_url: p.image_url || '/images/products/colway/shampoo.png',
    key_compounds: p.key_mechanisms || p.key_compounds || ['Active Tropocollagen', 'Bioactive Matrix'],
    synergy_role: p.synergy_role || '',
    clinical_rationale: p.clinical_rationale,
    frequency: p.frequency || (isEs ? 'Según pauta' : 'As indicated'),
    synergy_score: p.synergy_score || 92,
    supplier: p.supplier || 'Colway',
    evidence_citations: p.evidence_citations || []
  })) : defaultProducts;

  const headerLabel = isSkinGoal 
    ? (isEs ? 'COADYUVANTES DERMOCOSMÉTICOS & REGENERACIÓN CELULAR' : 'DERMOCOSMETIC & CELLULAR ECM ADJUNCTS')
    : isRecoveryGoal
      ? (isEs ? 'COADYUVANTES NUTRACÉUTICOS & MATRIZ EXTRACELULAR' : 'NUTRACEUTICAL & SYSTEMIC ECM ADJUNCTS')
      : (isEs ? 'COADYUVANTES TÓPICOS Y TRICOLOGÍA MÉDICA' : 'TOPICAL TRICHOLOGY & SCALP ADJUNCTS');

  const headerSub = isSkinGoal
    ? (isEs ? 'Sinergia clínica de superficie y soporte extracelular con tropocolágeno nativo y péptidos VEP' : 'Surface-level neocollagenesis & extracellular matrix support via native collagen & VEP-peptides')
    : isRecoveryGoal
      ? (isEs ? 'Soporte de bio-andamio de tropocolágeno liofilizado para acelerar la síntesis de colágeno endógeno' : 'Bioactive freeze-dried tropocollagen scaffold to accelerate endogenous connective tissue synthesis')
      : (isEs ? 'Sinergia clínica de superficie para potenciar la permeación y anclaje folicular' : 'Recommended surface-level companions to optimize peptide penetration & follicular yield');

  const contextNote = isSkinGoal
    ? (isEs 
        ? 'Los protocolos de péptidos bioreguladores faciales (como GHK-Cu, Snap-8, Argireline) actúan sobre la señalización celular dérmica. El sistema de micro-dermoabrasión con polvo de diamante y crema VEP de Colway optimiza la permeabilidad cutánea, desobstruye el estrato córneo senescente y aporta tropocolágeno nativo sinérgico para una redensificación profunda.'
        : 'Facial bioregulatory peptides (GHK-Cu, Snap-8, Argireline) operate at the level of cellular signaling. Colway’s diamond micro-exfoliation and VEP-peptide carrier cream prepare the stratum corneum, clear senescent cells, and supply native triple-helix tropocollagen for synergistic dermal redensification.')
    : isRecoveryGoal
      ? (isEs 
          ? 'En protocolos de regeneración musculoesquelética y articular (BPC-157, TB-500), la tasa de curación está limitada por la disponibilidad de aminoácidos estructurales específicos (hidroxiprolina, glicina, prolina). Colvita aporta tropocolágeno liofilizado no desnaturalizado que actúa como bio-andamio sistémico directo para los fibroblastos y condrocitos activados.'
          : 'In musculoskeletal and tissue repair protocols (BPC-157, TB-500), recovery velocity is rate-limited by the bio-availability of specific structural oligopeptides (hydroxyproline, proline, glycine). Colvita provides intact freeze-dried fish tropocollagen that serves as an immediate structural bio-scaffold for activated fibroblasts and chondrocytes.')
      : (isEs 
          ? 'Los péptidos como GHK-Cu operan a nivel celular y dérmico profundo (papila dérmica, bulge folicular). Sin embargo, su bioequivalencia tópica depende críticamente de superar la barrera sebácea con DHT y mantener el pH del cuero cabelludo en 4.5–5.5. El sistema Colway actúa como coadyuvante sinérgico de superficie sin alterar el esquema farmacológico.'
          : 'Peptides like GHK-Cu operate deep at the cellular dermal level (dermal papilla, follicular bulge). However, topical bioavailability critically depends on overcoming the lipophilic DHT sebum barrier and maintaining an acidic scalp pH (4.5–5.5). The Colway system provides mechanistically non-redundant surface support to maximize peptide delivery.');

  return (
    <div className="pca-root" id="cosmeceutical-adjuncts" style={{ scrollMarginTop: '100px' }}>
      {/* ── Header ── */}
      <button
        type="button"
        className="pca-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="pca-header-left">
          <div className="pca-header-icon">
            <Droplets size={16} />
          </div>
          <div>
            <div className="pca-header-label">{headerLabel}</div>
            <div className="pca-header-sub">{headerSub}</div>
          </div>
        </div>
        <div className="pca-header-right">
          <span className="pca-header-count">
            {displayProducts.length} {isEs ? 'productos' : 'products'} · Synergy 96%
          </span>
          <span className="pca-header-chevron" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            <ChevronRight size={14} />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="pca-body">
          {/* Context note */}
          <div className="pca-context-note">
            <Info size={15} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.79rem', color: '#334155', lineHeight: 1.6 }}>
                <strong>{isEs ? 'Fundamento de la Sinergia Clínica:' : 'Clinical Synergy Rationale:'}</strong>{' '}
                {contextNote}
              </p>
            </div>
          </div>

          {/* Product cards */}
          <div className="pca-products-grid">
            {displayProducts.map((p, i) => (
              <div key={p.slug} className="pca-product-card">
                {/* Top status bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div className="pca-step-badge" style={{ background: i === 0 ? '#eff6ff' : '#f0fdfa', color: i === 0 ? '#2563eb' : '#0d9488' }}>
                    {p.step}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '2px 7px', borderRadius: '99px' }}>
                    <Activity size={11} /> {p.synergy_score}% {isEs ? 'SINERGIA' : 'SYNERGY'}
                  </div>
                </div>

                {/* Image + info row */}
                <div className="pca-product-top">
                  <div className="pca-product-img-wrap">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="pca-product-img"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="pca-product-info">
                    <div className="pca-product-supplier">
                      <Leaf size={10} style={{ color: '#16a34a' }} />
                      {p.supplier}
                    </div>
                    <div className="pca-product-name">{p.name}</div>
                    <div className="pca-product-tagline">{p.tagline}</div>
                  </div>
                </div>

                {/* Key compounds */}
                <div className="pca-compounds">
                  {p.key_compounds.map(c => (
                    <span key={c} className="pca-compound-chip">{c}</span>
                  ))}
                </div>

                {/* Synergy role */}
                <div className="pca-synergy-role">
                  <div className="pca-synergy-label">
                    <ShieldCheck size={12} style={{ color: '#0d9488' }} />
                    {isEs ? 'Mecanismo de Sinergia' : 'Protocol Synergy Role'}
                  </div>
                  <p className="pca-synergy-text">{p.synergy_role}</p>
                </div>

                {/* Frequency */}
                <div className="pca-frequency">
                  <CheckCircle2 size={12} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>{isEs ? 'Posología:' : 'Frequency:'}</strong> {p.frequency}</span>
                </div>

                {/* CTA */}
                <div className="pca-cta-row">
                  <Link href={`/p/${p.slug}`} className="pca-view-btn">
                    <Package size={13} /> {isEs ? 'Ver Expediente del Producto' : 'View Product Dossier'} <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── Deep Clinical Rationale Accordion (Google Cloud UX Standard) ── */}
          <div className="pca-clinical-dossier-box">
            <button
              type="button"
              className={`pca-clinical-dossier-toggle ${showClinicalDossier ? 'is-open' : ''}`}
              onClick={() => setShowClinicalDossier(v => !v)}
              aria-expanded={showClinicalDossier}
            >
              <div className="pca-dossier-toggle-left">
                <div className="pca-dossier-toggle-icon">
                  <BookOpen size={16} />
                </div>
                <div className="pca-dossier-toggle-text">
                  <div className="pca-dossier-title-line">
                    <span className="pca-dossier-title">
                      {isEs 
                        ? 'Justificación Clínica y Farmacodinámica de la Sinergia' 
                        : 'Clinical Rationale & Pharmacodynamic Synergy Blueprint'}
                    </span>
                    <span className="pca-dossier-badge">
                      {isEs ? '8 Citas Científicas' : '8 Peer-Reviewed Citations'}
                    </span>
                  </div>
                  <span className="pca-dossier-subtitle">
                    {isEs
                      ? 'Atlas Clinical Engine · Bioequivalencia y evidencia mecanística'
                      : 'Atlas Clinical Engine · Dual-compartment bioequivalence & evidence'}
                  </span>
                </div>
              </div>

              <div className="pca-dossier-toggle-right">
                <ChevronDown
                  size={18}
                  className={`pca-dossier-chevron ${showClinicalDossier ? 'is-open' : ''}`}
                />
              </div>
            </button>

            {showClinicalDossier && (
              <div className="pca-clinical-dossier-content">
                {/* Tabs */}
                <div className="pca-dossier-tabs">
                  <button
                    type="button"
                    className={`pca-dossier-tab ${activeTab === 'collagen' ? 'active' : ''}`}
                    onClick={() => setActiveTab('collagen')}
                  >
                    <Layers size={13} /> {isEs ? 'Colágeno Bi-Compartimental' : 'Dual-Compartment Collagen'}
                  </button>
                  <button
                    type="button"
                    className={`pca-dossier-tab ${activeTab === 'penetration' ? 'active' : ''}`}
                    onClick={() => setActiveTab('penetration')}
                  >
                    <Droplets size={13} /> {isEs ? 'Barrera & pH 4.5–5.5' : 'Penetration Barrier & pH'}
                  </button>
                  <button
                    type="button"
                    className={`pca-dossier-tab ${activeTab === 'igf1' ? 'active' : ''}`}
                    onClick={() => setActiveTab('igf1')}
                  >
                    <Activity size={13} /> {isEs ? 'IGF-1 Paralelo & Fragilidad' : 'Parallel IGF-1 & Fragile Hair'}
                  </button>
                  <button
                    type="button"
                    className={`pca-dossier-tab ${activeTab === 'evidence' ? 'active' : ''}`}
                    onClick={() => setActiveTab('evidence')}
                  >
                    <Award size={13} /> {isEs ? 'Evidencia y Citas' : 'Evidence & Citations'}
                  </button>
                </div>

                {/* Tab 1: Dual-compartment collagen */}
                {activeTab === 'collagen' && (
                  <div className="pca-tab-panel">
                    <h4 className="pca-tab-title">
                      {isEs ? 'Estrategia de Colágeno Bi-Compartimental' : 'Dual-Compartment Collagen Strategy'}
                    </h4>
                    <p className="pca-tab-desc">
                      {isEs
                        ? 'Uno de los mecanismos más conocidos del péptido de cobre GHK-Cu es la estimulación de la síntesis endógena de colágeno tipos I, III y IV en la matriz extracelular dérmica perifolicular (vía señalización TGF-β). Sin embargo, el colágeno dérmico no repara el tallo expuesto. El sistema Colway aporta colágeno nativo hidrolizado en la superficie externa:'
                        : 'GHK-Cu stimulates endogenous Type I, III, and IV collagen synthesis in the dermal extracellular matrix surrounding the hair follicle (via TGF-β signaling). However, dermal ECM collagen does not repair the exposed hair shaft. The Colway system supplies complementary surface collagen:'}
                    </p>
                    <div className="pca-compare-grid">
                      <div className="pca-compare-card" style={{ borderLeft: '3px solid #2563eb' }}>
                        <div className="pca-compare-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                          COMPARTIMENTO 1: DÉRMICO PROFUNDO
                        </div>
                        <div className="pca-compare-name">GHK-Cu (Péptido Activo)</div>
                        <p className="pca-compare-p">
                          Estimula la angiogénesis, aumenta el tamaño del folículo piloso y reconstruye el andamiaje de colágeno alrededor de la papila dérmica.
                        </p>
                      </div>
                      <div className="pca-compare-card" style={{ borderLeft: '3px solid #0d9488' }}>
                        <div className="pca-compare-badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                          COMPARTIMENTO 2: SUPERFICIE DEL TALLO
                        </div>
                        <div className="pca-compare-name">Acondicionador Colway (Coadyuvante)</div>
                        <p className="pca-compare-p">
                          Deposita colágeno nativo y queratina hidrolizada sobre el córtex y la cutícula, rellenando microfracturas y sellando el manto hidrolipídico.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Penetration barrier & pH */}
                {activeTab === 'penetration' && (
                  <div className="pca-tab-panel">
                    <h4 className="pca-tab-title">
                      {isEs ? 'El Problema de la Barrera Sebácea y el Factor Crítico de pH (4.5–5.5)' : 'The Penetration Barrier & Scalp pH Factor (4.5–5.5)'}
                    </h4>
                    <p className="pca-tab-desc">
                      {isEs
                        ? 'En pacientes con alopecia androgenética o efluvio telógeno, el sebo del cuero cabelludo acumula concentraciones elevadas de DHT y 5α-reductasa, creando una película lipófila hidrófoba que impide que formulaciones tópicas de péptidos alcancen el ostium folicular.'
                        : 'In patients with androgenic thinning, scalp sebum forms a lipophilic layer loaded with DHT and 5α-reductase, creating a physical barrier that sequesters hydrophilic peptide molecules and blocks follicular bioavailability.'}
                    </p>
                    <div className="pca-highlight-callout">
                      <strong>{isEs ? 'Estabilidad del Complejo GHK-Cu:' : 'GHK-Cu Coordination Stability:'}</strong>{' '}
                      {isEs
                        ? 'Los champús convencionales alcalinos (pH 7.0–9.0) disocian el ión cobre Cu²⁺ de la cadena tripéptida GHK, inactivando el péptido. El champú Colway, tamponado a pH 4.5–5.5, respeta la acidez biológica del cuero cabelludo, manteniendo la integridad del complejo organometálico y optimizando el gradiente de absorción.'
                        : 'Conventional alkaline shampoos (pH 7.0–9.0) disrupt the Cu²⁺ coordination bond in the GHK tripeptide, inactivating it before it reaches the target. Colway Shampoo is acid-buffered (pH 4.5–5.5), protecting peptide integrity and restoring physiological barrier acidity.'}
                    </div>
                  </div>
                )}

                {/* Tab 3: Parallel IGF-1 & Fragile Hair */}
                {activeTab === 'igf1' && (
                  <div className="pca-tab-panel">
                    <h4 className="pca-tab-title">
                      {isEs ? 'Señalización Paralela de IGF-1 y Protección de Fibras Anágenas Frágiles' : 'Parallel IGF-1 Activation & Anagen Shaft Shielding'}
                    </h4>
                    <p className="pca-tab-desc">
                      {isEs
                        ? 'GHK-Cu estimula la expresión de IGF-1 en papila dérmica vía PI3K/Akt. La cafeína presente en el champú Colway activa IGF-1 por una vía ortogonal (antagonismo de receptores de adenosina → inhibición de fosfodiesterasa → incremento de AMPc intracelular). Ambas rutas confluyen multiplicando el estímulo anágeno sin saturar los mismos receptores.'
                        : 'GHK-Cu stimulates dermal papilla IGF-1 via PI3K/Akt. Caffeine in the Colway shampoo activates IGF-1 via an orthogonal pathway (adenosine receptor antagonism → PDE inhibition → intracellular cAMP surge). Both mechanisms converge additively on the anagen prolongation threshold.'}
                    </p>
                    <div className="pca-highlight-callout" style={{ background: '#fefce8', borderColor: '#fef08a' }}>
                      <strong style={{ color: '#854d0e' }}>
                        {isEs ? 'Protección Mecánica del Cabello Anágeno Joven:' : 'Mechanical Protection of Nascent Regrowth:'}
                      </strong>{' '}
                      <span style={{ color: '#713f12' }}>
                        {isEs
                          ? 'Durante las primeras semanas de tratamiento, los folículos reactivados generan tallos delgados e incompletamente queratinizados propensos a la fractura. El pantenol y aminoácidos de seda del acondicionador aumentan el diámetro y la flexibilidad de la fibra, evitando que la tracción cotidiana arruine el avance biológico alcanzado por el péptido.'
                          : 'Re-activated follicles generate delicate, partially keratinized shafts vulnerable to mechanical breakage. Panthenol, silk amino acids, and keratin hydrolysate reinforce tensile resistance, preventing shaft snap during the protocol.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 4: Evidence & Citations */}
                {activeTab === 'evidence' && (
                  <div className="pca-tab-panel">
                    <h4 className="pca-tab-title">
                      {isEs ? 'Bibliografía Científica Revisada por Pares' : 'Peer-Reviewed Literature & Clinical Backing'}
                    </h4>
                    <div className="pca-citations-list">
                      {[
                        { title: 'Pickart L et al. (2015)', text: 'The human tripeptide GHK-Cu in prevention of oxidative stress and degenerative conditions of aging. Oxidative Medicine and Cellular Longevity.' },
                        { title: 'Pickart L & Margolina A (2018)', text: 'Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data. Int J Mol Sci — ECM collagen synthesis.' },
                        { title: 'Fischer TW et al. (2007)', text: 'Differential effects of caffeine on hair shaft elongation and IGF-1-mediated regulation in human hair follicles. Br J Dermatol.' },
                        { title: 'Buffoli B et al. (2008)', text: 'The human hair: from anatomy to physiology. Int J Dermatol — scalp barrier function and acid mantle stability.' },
                        { title: 'Dias MFRG (2015)', text: 'Hair Cosmetics: An Overview. Int J Trichology — hydrolysed keratin cortex penetration and cuticle restoration.' },
                        { title: 'Almohanna HM et al. (2019)', text: 'The Role of Vitamins and Minerals in Hair Loss: A Review. Dermatol Ther — copper, zinc, and antioxidant interplay.' },
                        { title: 'Trüeb RM (2015)', text: 'The impact of oxidative stress on hair. Int J Cosmet Sci — ROS, lipid peroxides, and follicular damage.' },
                        { title: 'Ozuguz P et al. (2014)', text: 'Evaluation of serum zinc and antioxidant levels in non-scarring alopecia. Cutan Ocul Toxicol.' }
                      ].map((cit, idx) => (
                        <div key={idx} className="pca-citation-item">
                          <span className="pca-citation-num">[{idx + 1}]</span>
                          <span className="pca-citation-text">
                            <strong>{cit.title}</strong> — {cit.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System summary */}
          <div className="pca-system-summary">
            <Sparkles size={15} style={{ color: '#5eead4', flexShrink: 0, marginTop: '2px' }} />
            <p>
              <strong>{isEs ? 'Pauta Clínica Integrada:' : 'Integrated Clinical Routine:'}</strong>{' '}
              {isEs 
                ? 'Aplicar Champú Fortalecedor 3–4× por semana sobre el cuero cabelludo húmedo, masajear 2 minutos y aclarar. Aplicar Acondicionador Fortalecedor de medios a puntas durante 5–10 minutos y aclarar con agua tibia (≤35°C). Secar al aire o con toalla suave antes de aplicar la loción tópica de GHK-Cu para garantizar la máxima permeación.'
                : 'Apply Strengthening Shampoo 3–4× weekly to damp scalp, massage 2 minutes, and rinse. Follow with Strengthening Conditioner on hair lengths and ends for 5–10 minutes, rinsing with lukewarm water (≤35°C). Gently towel dry before applying topical GHK-Cu to ensure uncompromised follicular permeation.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
