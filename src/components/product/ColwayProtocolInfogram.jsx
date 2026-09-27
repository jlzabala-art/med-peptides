"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Droplets, Thermometer, Clock, ShieldCheck,
  Activity, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft,
  Layers, Microscope, Zap, ArrowRight, RefreshCw, Scissors, Info, Beaker,
  Compass, Check
} from 'lucide-react';

/**
 * Structured clinical dataset for Shampoo Anatomical Layers
 * Follows Google Cloud Console semantic color architecture
 */
const SHAMPOO_LAYERS = [
  {
    id: 'surface',
    number: '01',
    name: 'Scalp Stratum Corneum',
    shortName: 'Stratum Corneum',
    tag: 'Barrier Integrity',
    target: 'Epidermal Keratinocytes & Intercellular Lipids',
    metric: 'pH 4.8 – 5.2 (Physiological Acid Mantle)',
    title: 'Micro-Cleansing & Acid Mantle Protection',
    activeIng: 'Sodium Cocoyl Isethionate (SCI) + Decyl Glucoside',
    mechanism: 'Sodium Cocoyl Isethionate (SCI) selectively cleanses oxidized sebum and micro-particulates without stripping essential ceramides or disrupting intercellular bilayers.',
    clinicalImpact: 'Prevents transepidermal water loss (TEWL −40% vs. sodium laureth sulfate) and maintains microbiome homeostasis without irritation.',
    depth: '0 – 50 µm (Superficial Scalp Epidermis)',
    color: '#0284c7', // Sky Blue
    bgLight: '#f0f9ff',
    borderLight: '#bae6fd',
    accentText: '#0369a1',
  },
  {
    id: 'sebum',
    number: '02',
    name: 'Infundibulum & Sebaceous Ducts',
    shortName: 'Sebaceous Acini',
    tag: 'Sebostatic Action',
    target: 'Sebaceous Gland Acini & 5α-Reductase Type II',
    metric: '−31% Hyperseborrhea / Sebum Normalization',
    title: 'Zinc PCA 5α-Reductase Enzymatic Blockade',
    activeIng: 'Zinc PCA (Zinc L-Pyrrolidone Carboxylate)',
    mechanism: 'Zinc ions chelate the catalytic active center of intrafollicular 5α-reductase, arresting the local enzymatic conversion of free testosterone into dihydrotestosterone (DHT) directly at the follicular funnel.',
    clinicalImpact: 'Downregulates sebaceous hypersecretion by −31%, eliminating follicular occlusion and peri-infundibular micro-inflammation (erythema).',
    depth: '100 – 400 µm (Upper Follicular Funnel)',
    color: '#d97706', // Amber / Gold
    bgLight: '#fffbeb',
    borderLight: '#fde68a',
    accentText: '#b45309',
  },
  {
    id: 'bulge',
    number: '03',
    name: 'Follicular Bulge (Stem Cells)',
    shortName: 'Stem Cell Bulge',
    tag: 'Anagen Transition',
    target: 'Lgr5+ Epithelial & Melanocyte Stem Cell Reservoir',
    metric: '−60.6% Telogen Shedding Rate (90 Days)',
    title: 'Baicapil™ (Scutellaria Baicalensis) Wnt/β-Catenin Induction',
    activeIng: 'Baicalin Flavonoids + Triticum Vulgare + Glycine Soja',
    mechanism: 'Purified baicalin activates the canonical Wnt/β-catenin signaling cascade in quiescent bulge stem cells, driving early exit from telogen and premature entrance into active anagen growth.',
    clinicalImpact: 'Clinically documented to increase anagen/telogen ratio by +68.3% and increase hair density (+12.5% hairs/cm²) with zero hormonal side effects.',
    depth: '800 – 1,200 µm (Mid-Follicular Sheath)',
    color: '#0d9488', // Teal
    bgLight: '#f0fdfa',
    borderLight: '#99f6e4',
    accentText: '#0f766e',
  },
  {
    id: 'papilla',
    number: '04',
    name: 'Dermal Papilla & Capillary Bed',
    shortName: 'Dermal Papilla Bulb',
    tag: 'Vascular Perfusion',
    target: 'Mesenchymal Dermal Papilla Cells & Endothelial Plexus',
    metric: '120s Rapid Influx / +cAMP / +VEGF Synthesis',
    title: 'Caffeine 120s Rapid Diffusion & Microvascular Angiogenesis',
    activeIng: 'Ultra-Pure Anhydrous Caffeine (194 Da) + Niacinamide (Vitamin B3)',
    mechanism: 'With low molecular weight (194 Da), caffeine traverses transfollicular pathways to reach the dermal papilla within 120 seconds. Inhibits phosphodiesterase (PDE), elevating intracellular cAMP and upregulating IGF-1. Niacinamide stimulates VEGF release to dilate microcapillaries.',
    clinicalImpact: 'Counteracts androgenetic follicular miniaturization, prolongs keratinocyte mitosis, and boosts nutrient perfusion to the hair matrix.',
    depth: '2,500 – 4,000 µm (Deep Subcutaneous Dermis)',
    color: '#dc2626', // Crimson / Red
    bgLight: '#fef2f2',
    borderLight: '#fecaca',
    accentText: '#b91c1c',
  }
];

/**
 * Structured clinical dataset for Conditioner Architectural Zones
 */
const CONDITIONER_ZONES = [
  {
    id: 'cortex',
    number: '01',
    name: 'Cortical Macrofibrils & Core',
    shortName: 'Cortex Tropocollagen Core',
    tag: 'Tensile Scaffolding',
    target: 'Intracortical Keratin Matrix & Disulfide Bonds',
    metric: '+24% Tensile Elasticity & Break Resistance',
    title: 'Native Fish Tropocollagen Triple-Helix Bio-Scaffolding',
    activeIng: 'Hydrated Native Collagen (Tropocollagen Gly-Pro-Hyp) + Low-MW Keratin',
    mechanism: 'Under acidic pH 4.0–4.5, biologically active triple-helix tropocollagen conforms to internal cortical fissures. Micro-hydrolyzed keratin peptides (500–1,500 Da) crosslink with sulfur bonds, replenishing lost protein mass.',
    clinicalImpact: 'Restores flexural modulus, halts fiber brittleness, and reinforces tensile strength against mechanical brushing stress by +24%.',
    depth: 'Core Fiber Architecture (70–85% of hair shaft volume)',
    color: '#7c3aed', // Purple
    bgLight: '#faf5ff',
    borderLight: '#e9d5ff',
    accentText: '#6b21a8',
  },
  {
    id: 'cuticle',
    number: '02',
    name: 'Cuticular Scales (Exocuticle)',
    shortName: 'Cuticle Scale Shingles',
    tag: 'Friction Neutralization',
    target: 'Overlapping Cuticle Scale Shingles (6–8 Tile Layers)',
    metric: '−62% Wet Combing Friction / Ra Smoothing −34%',
    title: 'Cationic Neutralization & Silk β-Sheet Lamellar Sheath',
    activeIng: 'Cationic BTMS-50 (Behentrimonium Methosulfate) + Silk Amino Acids',
    mechanism: 'Electrostatically neutralizes the negative surface zeta-potential (−60 mV) of damaged keratin. Silk amino acids crystallize into an ultra-thin, smooth lamellar β-sheet film that flattens raised cuticle shingles.',
    clinicalImpact: 'Eliminates tangling and cuticle chipping, dramatically reducing combing force by −62% and amplifying light reflectance for high gloss.',
    depth: 'Peripheral Boundary Layer (3–5 µm thickness)',
    color: '#0284c7', // Sky Blue
    bgLight: '#f0f9ff',
    borderLight: '#bae6fd',
    accentText: '#0369a1',
  },
  {
    id: 'flayer',
    number: '03',
    name: '18-MEA Epicuticle Lipid Shield',
    shortName: '18-MEA Lipid Shield',
    tag: 'Hydrophobic Armor',
    target: 'Outer F-Layer Epicuticle & Hydrophobic Lipid Boundary',
    metric: '230°C Thermal Defense / >95° Water Contact Angle',
    title: 'Virgin Argan Oil Lipid Restoration & 18–22°C Cryo-Lock',
    activeIng: 'Cold-Pressed Argania Spinosa Kernel Oil + Tocopherol Matrix',
    mechanism: '18–22°C cool water rinse mechanically contracts cuticular shingles. Argan essential fatty acids (Omega-6 and Omega-9) deposit a protective hydrophobic monomolecular shield mimicking native 18-methyl eicosanoic acid (18-MEA).',
    clinicalImpact: 'Restores natural hydrophobicity (water contact angle >95°), locks moisture deep inside cortex, and shields fiber against thermal styling heat up to 230°C.',
    depth: 'Ultramicroscopic Outermost Surface (<5 nm F-Layer)',
    color: '#16a34a', // Emerald Green
    bgLight: '#f0fdf4',
    borderLight: '#bbf7d0',
    accentText: '#15803d',
  }
];

/**
 * ColwayProtocolInfogram
 * Photorealistic medical trichology infographic & professional application protocol
 * Compliant with Google Cloud UX Console standards:
 * - Full-width responsive phased stepper (laptop & mobile optimized)
 * - Single-layer master-detail inspector (100% space occupancy)
 * - Dynamic color synchronization on diagram clicks
 */
export default function ColwayProtocolInfogram({
  currentProduct = 'shampoo',
  // eslint-disable-next-line no-unused-vars
  lang = 'en'
}) {
  const isDefaultShampoo = currentProduct?.toLowerCase().includes('shampoo');
  const [activeTab, setActiveTab] = useState(isDefaultShampoo ? 'shampoo' : 'conditioner');
  const [activeZone, setActiveZone] = useState('papilla'); // for interactive zone exploration
  const [activeCondZone, setActiveCondZone] = useState('cortex');

  // Navigation helpers for Shampoo layers
  const currentShampooIndex = SHAMPOO_LAYERS.findIndex(l => l.id === activeZone);
  const currentShampooLayer = SHAMPOO_LAYERS[currentShampooIndex >= 0 ? currentShampooIndex : 0];

  const prevShampooLayer = () => {
    const prevIdx = (currentShampooIndex - 1 + SHAMPOO_LAYERS.length) % SHAMPOO_LAYERS.length;
    setActiveZone(SHAMPOO_LAYERS[prevIdx].id);
  };

  const nextShampooLayer = () => {
    const nextIdx = (currentShampooIndex + 1) % SHAMPOO_LAYERS.length;
    setActiveZone(SHAMPOO_LAYERS[nextIdx].id);
  };

  // Navigation helpers for Conditioner zones
  const currentCondIndex = CONDITIONER_ZONES.findIndex(z => z.id === activeCondZone);
  const currentCondZone = CONDITIONER_ZONES[currentCondIndex >= 0 ? currentCondIndex : 0];

  const prevCondZone = () => {
    const prevIdx = (currentCondIndex - 1 + CONDITIONER_ZONES.length) % CONDITIONER_ZONES.length;
    setActiveCondZone(CONDITIONER_ZONES[prevIdx].id);
  };

  const nextCondZone = () => {
    const nextIdx = (currentCondIndex + 1) % CONDITIONER_ZONES.length;
    setActiveCondZone(CONDITIONER_ZONES[nextIdx].id);
  };

  return (
    <div className="cpi-root-container" style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      marginBottom: '1.75rem'
    }}>
      <style>{`
        /* GCP Phased Stepper Cards */
        .cpi-phase-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
        }
        .cpi-phase-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 14px 16px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 86px;
          position: relative;
        }
        .cpi-phase-card:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }
        .cpi-phase-card.active-phase-shampoo {
          border-color: #0d9488;
          background: #f0fdfa;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.15);
        }
        .cpi-phase-card.active-phase-cond {
          border-color: #0284c7;
          background: #f0f9ff;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.15);
        }
        .cpi-phase-card.active-phase-synergy {
          border-color: #7c3aed;
          background: #faf5ff;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.15);
        }
        .cpi-phase-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 6px;
        }
        .cpi-phase-badge {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .cpi-badge-teal {
          background: #ccfbf1;
          color: #0f766e;
        }
        .cpi-badge-blue {
          background: #e0f2fe;
          color: #0369a1;
        }
        .cpi-badge-purple {
          background: #f3e8ff;
          color: #6b21a8;
        }
        .cpi-phase-active-tag {
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #16a34a;
          background: #dcfce7;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .cpi-phase-title {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.88rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
        }
        .cpi-phase-desc {
          font-size: 0.73rem;
          color: #64748b;
          margin-top: 3px;
          line-height: 1.35;
        }

        /* Layer Stepper Pill Bar */
        .cpi-layer-stepper-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 0 10px 0;
          margin-bottom: 12px;
          scrollbar-width: thin;
        }
        .cpi-layer-stepper-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          font-size: 0.78rem;
          border-radius: 99px;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          min-height: 40px;
        }
        .cpi-layer-stepper-pill:hover {
          transform: translateY(-1px);
        }

        /* Inspector Layout & Responsive */
        .cpi-infogram-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
        }
        .cpi-diagram-stage {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
        }
        .cpi-inspector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 1.25rem;
        }

        @media (max-width: 900px) {
          .cpi-phase-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .cpi-inspector-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>

      {/* Top Banner: GCP Cloud Header */}
      <div style={{
        background: 'linear-gradient(135deg, #071e3d 0%, #003666 45%, #0d9488 100%)',
        padding: '1.25rem 1.5rem',
        color: '#ffffff'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(8px)',
            padding: '3px 10px',
            borderRadius: '99px',
            marginBottom: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Microscope size={12} color="#5eead4" />
            <span>Realistic Trichology Anatomy &amp; Cellular Pharmacodynamics</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Colway Hair Strengthening System — Biological Infogram
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#cbd5e1', maxWidth: '820px', lineHeight: 1.45 }}>
            Realistic clinical cross-sections illustrating targeted transfollicular diffusion, 5α-reductase enzymatic blockade, and triple-helix cuticle reconstruction.
          </p>
        </div>
      </div>

      {/* GCP Phased Protocol Stepper (Full-Width Responsive 3-Card Stepper) */}
      <div style={{
        padding: '0.85rem 1.5rem',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="cpi-phase-grid">
          {/* Phase 1: Shampoo */}
          <button
            type="button"
            onClick={() => setActiveTab('shampoo')}
            className={`cpi-phase-card ${activeTab === 'shampoo' ? 'active-phase-shampoo' : ''}`}
          >
            <div className="cpi-phase-header-row">
              <span className="cpi-phase-badge cpi-badge-teal">PHASE 01 · SCALP INFLUX</span>
              {activeTab === 'shampoo' && (
                <span className="cpi-phase-active-tag">Active</span>
              )}
            </div>
            <div className="cpi-phase-title">
              <Droplets size={16} color={activeTab === 'shampoo' ? '#0d9488' : '#64748b'} />
              <span>1. Strengthening Shampoo</span>
            </div>
            <div className="cpi-phase-desc">Scalp &amp; Dermal Papilla Transfollicular Influx</div>
          </button>

          {/* Phase 2: Conditioner */}
          <button
            type="button"
            onClick={() => setActiveTab('conditioner')}
            className={`cpi-phase-card ${activeTab === 'conditioner' ? 'active-phase-cond' : ''}`}
          >
            <div className="cpi-phase-header-row">
              <span className="cpi-phase-badge cpi-badge-blue">PHASE 02 · FIBER BIOSEAL</span>
              {activeTab === 'conditioner' && (
                <span className="cpi-phase-active-tag">Active</span>
              )}
            </div>
            <div className="cpi-phase-title">
              <Sparkles size={16} color={activeTab === 'conditioner' ? '#0284c7' : '#64748b'} />
              <span>2. Strengthening Conditioner</span>
            </div>
            <div className="cpi-phase-desc">Fiber Reconstruction &amp; Cuticle Bioseal</div>
          </button>

          {/* Phase 3: Synergy */}
          <button
            type="button"
            onClick={() => setActiveTab('synergy')}
            className={`cpi-phase-card ${activeTab === 'synergy' ? 'active-phase-synergy' : ''}`}
          >
            <div className="cpi-phase-header-row">
              <span className="cpi-phase-badge cpi-badge-purple">PHASE 03 · INTEGRATION</span>
              {activeTab === 'synergy' && (
                <span className="cpi-phase-active-tag">Active</span>
              )}
            </div>
            <div className="cpi-phase-title">
              <Layers size={16} color={activeTab === 'synergy' ? '#7c3aed' : '#64748b'} />
              <span>3. Dual-Action Synergy System</span>
            </div>
            <div className="cpi-phase-desc">Inside-Out Routine &amp; Mesotherapy Adjunct</div>
          </button>
        </div>
      </div>

      {/* Main Infographic Body */}
      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* ============================================================== */}
        {/* TAB 1: SHAMPOO — SCALP & FOLLICULAR INFUSION INFOGRAM          */}
        {/* ============================================================== */}
        {activeTab === 'shampoo' && (
          <div>
            {/* Clinical Parameter Summary Gauges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ padding: '10px 12px', background: '#f0fdfa', borderRadius: '10px', border: '1px solid #ccfbf1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                  <Compass size={11} /> Primary Target
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Dermal Papilla &amp; Bulge</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Scalp microenvironment</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                  <Thermometer size={11} /> Pre-Wash Water Temp
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>36°C – 38°C (Warm)</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Opens follicular ostia</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                  <Clock size={11} /> Active Contact Dwell
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>3 – 5 Minutes</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Caffeine 120s influx peak</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  <Beaker size={11} /> Physiological pH
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>pH 4.8 – 5.2</div>
                <div style={{ fontSize: '0.67rem', color: '#16a34a', fontWeight: 600 }}>Protects acid mantle</div>
              </div>
            </div>

            {/* Photorealistic Vector Scalp Anatomy + Interactive Clinical Cards (Full-Width Responsive Flow) */}
            <div className="cpi-infogram-layout">
              {/* Photorealistic Vector Scalp Anatomy Stage */}
              <div className="cpi-diagram-stage">
                <div style={{
                  background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                  borderRadius: '16px',
                  border: '1px solid #cbd5e1',
                  padding: '1.25rem',
                  position: 'relative',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Follicular Cross-Section &amp; Active Influx Pathway
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#475569', background: '#ffffff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      Click layers or cards to inspect
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: '100%' }}>
                    <svg
                      viewBox="0 0 540 480"
                      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0' }}
                    >
                      <defs>
                        {/* Realistic tissue and follicle gradients */}
                        <linearGradient id="scalpSurfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="stratumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fed7aa" />
                          <stop offset="100%" stopColor="#fdba74" />
                        </linearGradient>
                        <linearGradient id="dermisTissueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fff7ed" />
                          <stop offset="40%" stopColor="#ffedd5" />
                          <stop offset="100%" stopColor="#fed7aa" />
                        </linearGradient>
                        <linearGradient id="hairShaft3D" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="35%" stopColor="#475569" />
                          <stop offset="70%" stopColor="#334155" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id="follicleSheathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ccfbf1" />
                          <stop offset="50%" stopColor="#f0fdfa" />
                          <stop offset="100%" stopColor="#99f6e4" />
                        </linearGradient>
                        <radialGradient id="bulbRadial" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="70%" stopColor="#0f766e" />
                          <stop offset="100%" stopColor="#115e59" />
                        </radialGradient>
                        <radialGradient id="papillaGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                          <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#991b1b" stopOpacity="0.6" />
                        </radialGradient>
                        <linearGradient id="sebumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="100%" stopColor="#eab308" />
                        </linearGradient>
                        <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Zone 1: Scalp Water Layer & Lather */}
                      <rect x="0" y="0" width="540" height="45" fill="url(#scalpSurfGrad)" />
                      {/* Microbubbles */}
                      <circle cx="160" cy="22" r="7" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                      <circle cx="178" cy="18" r="10" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                      <circle cx="198" cy="25" r="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                      <circle cx="320" cy="22" r="8" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                      <circle cx="338" cy="16" r="11" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />

                      {/* Stratum Corneum & Epidermis Base */}
                      <rect x="0" y="45" width="540" height="24" fill="url(#stratumGrad)" />
                      <line x1="0" y1="45" x2="540" y2="45" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" />

                      {/* Dermis Connective Tissue Base */}
                      <rect x="0" y="69" width="540" height="411" fill="url(#dermisTissueGrad)" opacity="0.6" />

                      {/* Collagen fiber bundles in extracellular matrix */}
                      <g stroke="#fed7aa" strokeWidth="1.5" strokeOpacity="0.5" fill="none">
                        <path d="M 30 110 Q 70 90 120 115" /><path d="M 40 180 Q 90 160 140 190" />
                        <path d="M 380 120 Q 430 100 480 130" /><path d="M 370 210 Q 420 190 490 220" />
                        <path d="M 20 280 Q 80 250 140 290" /><path d="M 390 320 Q 450 300 500 330" />
                      </g>

                      {/* Arrector Pili Muscle */}
                      <path d="M 330 180 C 370 160, 420 120, 450 70" fill="none" stroke="#e11d48" strokeWidth="4.5" strokeLinecap="round" opacity="0.75" />
                      <g transform="translate(365, 96)">
                        <rect x="0" y="0" width="105" height="22" rx="4" fill="#ffe4e6" stroke="#fda4af" strokeWidth="1" />
                        <text x="52" y="15" fill="#be123c" fontSize="12" fontWeight="800" textAnchor="middle">Arrector Pili</text>
                      </g>

                      {/* Sebaceous Gland Multi-acinar Organ */}
                      <g transform="translate(145, 120)" filter="url(#shadowFilter)" onClick={() => setActiveZone('sebum')} style={{ cursor: 'pointer' }}>
                        <ellipse cx="25" cy="20" rx="20" ry="16" fill="url(#sebumGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                        <ellipse cx="10" cy="35" rx="16" ry="14" fill="url(#sebumGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                        <ellipse cx="32" cy="40" rx="15" ry="13" fill="url(#sebumGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                        {/* Lipid droplets inside duct */}
                        <circle cx="22" cy="20" r="3" fill="#ffffff" opacity="0.6" />
                        <circle cx="12" cy="34" r="2.5" fill="#ffffff" opacity="0.6" />
                        <circle cx="32" cy="38" r="2.5" fill="#ffffff" opacity="0.6" />
                        <path d="M 35 25 Q 55 22 75 35" fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeDasharray="2 2" />
                      </g>

                      {/* Hair Follicle Channel (Infundibulum to Bulb) */}
                      <path
                        d="M 210 45 C 210 90, 225 240, 240 340 C 245 375, 240 405, 260 415 C 280 405, 275 375, 280 340 C 295 240, 310 90, 310 45 Z"
                        fill="url(#follicleSheathGrad)"
                        stroke="#0d9488"
                        strokeWidth="2"
                      />

                      {/* Glowing Active Diffusion Wave from Surface down to Bulb */}
                      <path
                        d="M 220 45 C 220 110, 235 250, 245 340 C 250 370, 250 395, 260 405 C 270 395, 270 370, 275 340 C 285 250, 300 110, 300 45 Z"
                        fill="#14b8a6"
                        opacity="0.22"
                      />

                      {/* Emerging Hair Shaft (Shaded 3D Cylinder) */}
                      <rect x="247" y="0" width="26" height="340" rx="4" fill="url(#hairShaft3D)" />
                      {/* Cuticle micro-shingle ridges on shaft */}
                      {[20, 50, 80, 110, 140, 170, 200, 230, 260, 290].map(y => (
                        <line key={y} x1="247" y1={y} x2="273" y2={y + 3} stroke="#64748b" strokeWidth="0.8" opacity="0.6" />
                      ))}

                      {/* Hair Bulb (Cell Matrix & Melanocytes) */}
                      <ellipse cx="260" cy="370" rx="28" ry="32" fill="url(#bulbRadial)" filter="url(#shadowFilter)" onClick={() => setActiveZone('papilla')} style={{ cursor: 'pointer' }} />
                      <ellipse cx="260" cy="385" rx="16" ry="14" fill="#042f2e" opacity="0.4" />

                      {/* Dermal Papilla Invagination */}
                      <path d="M 252 402 C 252 380, 268 380, 268 402 Z" fill="url(#papillaGlow)" />

                      {/* Perifollicular Capillary Loops (Arteriole & Venule) */}
                      {/* Red Arteriole */}
                      <path d="M 235 460 C 240 430, 252 410, 258 392" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                      {/* Blue Venule */}
                      <path d="M 285 460 C 280 430, 268 410, 262 392" fill="none" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
                      {/* Micro-anastomosis loop */}
                      <path d="M 258 392 C 260 388, 260 388, 262 392" fill="none" stroke="#9333ea" strokeWidth="2.5" />

                      {/* Interactive Clickable Hotspot Markers (Dynamic GCP Semantic Color Glow) */}
                      {/* Hotspot 1: Stratum Corneum */}
                      <g transform="translate(25, 32)" onClick={() => setActiveZone('surface')} style={{ cursor: 'pointer' }}>
                        <rect
                          x="0" y="0" width="180" height="28" rx="7"
                          fill={activeZone === 'surface' ? '#0284c7' : '#1e293b'}
                          stroke={activeZone === 'surface' ? '#7dd3fc' : '#475569'}
                          strokeWidth={activeZone === 'surface' ? 2.5 : 1}
                          filter="url(#shadowFilter)"
                        />
                        <circle cx="16" cy="14" r="5" fill={activeZone === 'surface' ? '#38bdf8' : '#94a3b8'} />
                        <text x="28" y="19" fill="#ffffff" fontSize="12" fontWeight="800">1. Stratum Corneum</text>
                      </g>

                      {/* Hotspot 2: Sebaceous Gland */}
                      <g transform="translate(20, 145)" onClick={() => setActiveZone('sebum')} style={{ cursor: 'pointer' }}>
                        <rect
                          x="0" y="0" width="170" height="28" rx="7"
                          fill={activeZone === 'sebum' ? '#d97706' : '#1e293b'}
                          stroke={activeZone === 'sebum' ? '#fde68a' : '#475569'}
                          strokeWidth={activeZone === 'sebum' ? 2.5 : 1}
                          filter="url(#shadowFilter)"
                        />
                        <circle cx="16" cy="14" r="5" fill={activeZone === 'sebum' ? '#f59e0b' : '#94a3b8'} />
                        <text x="28" y="19" fill="#ffffff" fontSize="12" fontWeight="800">2. Sebaceous Acini</text>
                      </g>

                      {/* Hotspot 3: Bulge Stem Cells */}
                      <g transform="translate(330, 225)" onClick={() => setActiveZone('bulge')} style={{ cursor: 'pointer' }}>
                        <rect
                          x="0" y="0" width="175" height="28" rx="7"
                          fill={activeZone === 'bulge' ? '#0d9488' : '#1e293b'}
                          stroke={activeZone === 'bulge' ? '#99f6e4' : '#475569'}
                          strokeWidth={activeZone === 'bulge' ? 2.5 : 1}
                          filter="url(#shadowFilter)"
                        />
                        <circle cx="16" cy="14" r="5" fill={activeZone === 'bulge' ? '#2dd4bf' : '#94a3b8'} />
                        <text x="28" y="19" fill="#ffffff" fontSize="12" fontWeight="800">3. Stem Cell Bulge</text>
                      </g>

                      {/* Hotspot 4: Dermal Papilla */}
                      <g transform="translate(320, 370)" onClick={() => setActiveZone('papilla')} style={{ cursor: 'pointer' }}>
                        <rect
                          x="0" y="0" width="190" height="28" rx="7"
                          fill={activeZone === 'papilla' ? '#dc2626' : '#1e293b'}
                          stroke={activeZone === 'papilla' ? '#fecaca' : '#475569'}
                          strokeWidth={activeZone === 'papilla' ? 2.5 : 1}
                          filter="url(#shadowFilter)"
                        />
                        <circle cx="16" cy="14" r="5" fill={activeZone === 'papilla' ? '#f87171' : '#94a3b8'} />
                        <text x="28" y="19" fill="#ffffff" fontSize="12" fontWeight="800">4. Dermal Papilla Bulb</text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Full-Width Interactive Layer Stepper & GCP Master Detail Inspector */}
              <div style={{ width: '100%' }}>
                {/* Horizontal Stepper Pills */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={17} color={currentShampooLayer.color} />
                    <span>Layer Inspector · Cellular Pharmacodynamics</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Click pills or graphic hotspots to inspect layers
                  </span>
                </div>

                <div className="cpi-layer-stepper-bar">
                  {SHAMPOO_LAYERS.map((layer, idx) => {
                    const isSelected = activeZone === layer.id;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setActiveZone(layer.id)}
                        className="cpi-layer-stepper-pill"
                        style={{
                          background: isSelected ? layer.color : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          borderColor: isSelected ? layer.color : '#cbd5e1',
                          boxShadow: isSelected ? `0 2px 10px ${layer.color}40` : 'none',
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#475569'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: isSelected ? 800 : 600 }}>{layer.shortName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Full-Width GCP Master Detail Inspector Card with Dynamic Color */}
                <div style={{
                  width: '100%',
                  borderRadius: '14px',
                  border: `2px solid ${currentShampooLayer.color}`,
                  background: '#ffffff',
                  boxShadow: `0 8px 24px -6px ${currentShampooLayer.color}25`,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {/* Top Accent Strip */}
                  <div style={{
                    height: '4px',
                    width: '100%',
                    background: `linear-gradient(90deg, ${currentShampooLayer.color} 0%, ${currentShampooLayer.borderLight} 100%)`
                  }} />

                  {/* Header Row */}
                  <div style={{
                    padding: '1.15rem 1.25rem',
                    background: `linear-gradient(135deg, ${currentShampooLayer.bgLight} 0%, #ffffff 85%)`,
                    borderBottom: `1px solid ${currentShampooLayer.borderLight}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '3px 9px',
                          borderRadius: '99px',
                          background: currentShampooLayer.color,
                          color: '#ffffff'
                        }}>
                          Layer {currentShampooLayer.number} of 04 · {currentShampooLayer.tag}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                          Depth: {currentShampooLayer.depth}
                        </span>
                      </div>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: '#0f172a',
                        margin: '2px 0 0 0',
                        letterSpacing: '-0.01em'
                      }}>
                        {currentShampooLayer.title}
                      </h4>
                    </div>

                    {/* Prev / Next Navigation Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={prevShampooLayer}
                        title="Previous Layer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <ChevronLeft size={15} />
                        <span>Prev Layer</span>
                      </button>
                      <button
                        type="button"
                        onClick={nextShampooLayer}
                        title="Next Layer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${currentShampooLayer.color}`,
                          background: currentShampooLayer.color,
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Next Layer</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Body 3-Panel Breakdown */}
                  <div className="cpi-inspector-grid">
                    {/* Panel 1: Target Anatomy & Stat */}
                    <div style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, color: currentShampooLayer.accentText, textTransform: 'uppercase' }}>
                        <Compass size={13} color={currentShampooLayer.color} />
                        <span>Target Anatomy &amp; Key Parameter</span>
                      </div>
                      <div style={{
                        padding: '6px 10px',
                        background: currentShampooLayer.bgLight,
                        border: `1px solid ${currentShampooLayer.borderLight}`,
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: currentShampooLayer.accentText
                      }}>
                        {currentShampooLayer.metric}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                        <strong>Target:</strong> {currentShampooLayer.target}
                      </div>
                    </div>

                    {/* Panel 2: Active Molecules */}
                    <div style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, color: currentShampooLayer.accentText, textTransform: 'uppercase' }}>
                        <Beaker size={13} color={currentShampooLayer.color} />
                        <span>Bioactive Actives &amp; Formula</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                        {currentShampooLayer.activeIng}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                        Precision clinical delivery optimized for cutaneous micro-permeability and high follicle retention.
                      </div>
                    </div>

                    {/* Panel 3: Mechanism */}
                    <div style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, color: currentShampooLayer.accentText, textTransform: 'uppercase' }}>
                        <Activity size={13} color={currentShampooLayer.color} />
                        <span>Pharmacodynamic Mechanism</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#334155', lineHeight: 1.55 }}>
                        {currentShampooLayer.mechanism}
                      </p>
                    </div>
                  </div>

                  {/* Footer Banner: Clinical Impact Takeaway */}
                  <div style={{
                    padding: '10px 1.25rem',
                    background: currentShampooLayer.bgLight,
                    borderTop: `1px solid ${currentShampooLayer.borderLight}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <CheckCircle2 size={16} color={currentShampooLayer.color} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.76rem', color: '#1e293b', lineHeight: 1.45 }}>
                      <strong>Clinical Takeaway:</strong> {currentShampooLayer.clinicalImpact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CONDITIONER — FIBER & CUTICLE BIOSEAL INFOGRAM          */}
        {/* ============================================================== */}
        {activeTab === 'conditioner' && (
          <div>
            {/* Clinical Parameter Summary Gauges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ padding: '10px 12px', background: '#e0f2fe', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  <Compass size={11} /> Primary Target
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Cortex &amp; Cuticle (Lengths)</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Avoid direct scalp contact</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                  <Thermometer size={11} /> Cryo Cuticle Lock Rinse
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>18°C – 22°C (Cool Rinse)</div>
                <div style={{ fontSize: '0.67rem', color: '#16a34a', fontWeight: 600 }}>Mechanical scale closure</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                  <Activity size={11} /> Tensile Strength Gain
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>+24% Fiber Break Resistance</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Fish Tropocollagen matrix</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  <Beaker size={11} /> Acidic Sealing pH
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>pH 4.0 – 4.5</div>
                <div style={{ fontSize: '0.67rem', color: '#0284c7', fontWeight: 600 }}>Tightens cuticular tiles</div>
              </div>
            </div>

            {/* 3D Hair Shaft Microarchitecture + Interactive Clinical Cards (Full-Width Responsive Flow) */}
            <div className="cpi-infogram-layout">
              {/* 3D Hair Fiber Cutaway Vector Illustration Stage */}
              <div className="cpi-diagram-stage">
                <div style={{
                  background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                  borderRadius: '16px',
                  border: '1px solid #cbd5e1',
                  padding: '1.25rem',
                  position: 'relative',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      3D Hair Shaft Microarchitecture &amp; Bioseal
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#475569', background: '#ffffff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      Click zones or cards to inspect
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: '100%' }}>
                    <svg
                      viewBox="0 0 540 480"
                      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0' }}
                    >
                      <defs>
                        {/* Realistic Fiber Gradients */}
                        <linearGradient id="fiberOuterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0f172a" />
                          <stop offset="30%" stopColor="#334155" />
                          <stop offset="60%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id="cortexCutawayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e9d5ff" />
                          <stop offset="60%" stopColor="#d8b4fe" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                        <linearGradient id="cuticleScaleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0284c7" />
                          <stop offset="50%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                        <linearGradient id="lipidShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <radialGradient id="medullaGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#cbd5e1" />
                          <stop offset="100%" stopColor="#64748b" />
                        </radialGradient>
                        <filter id="shadowFilterCond" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Outer Cylindrical Fiber Outline */}
                      {/* Top Elliptical Cross-Section Face */}
                      <ellipse cx="270" cy="110" rx="190" ry="60" fill="url(#fiberOuterGrad)" stroke="#475569" strokeWidth="2" />

                      {/* Concentric Layer 1: Cuticle Ring */}
                      <ellipse cx="270" cy="110" rx="180" ry="55" fill="#0284c7" opacity="0.3" stroke="#0284c7" strokeWidth="1.5" />

                      {/* Concentric Layer 2: Cortex Core */}
                      <ellipse cx="270" cy="110" rx="145" ry="42" fill="url(#cortexCutawayGrad)" stroke="#a855f7" strokeWidth="2" />

                      {/* Keratin Macrofibril Bundles in Cortex face */}
                      <g fill="#7e22ce" opacity="0.5">
                        <circle cx="220" cy="100" r="10" /><circle cx="245" cy="95" r="11" /><circle cx="270" cy="92" r="12" /><circle cx="295" cy="95" r="11" /><circle cx="320" cy="100" r="10" />
                        <circle cx="205" cy="112" r="9" /><circle cx="230" cy="112" r="10" /><circle cx="255" cy="110" r="11" /><circle cx="285" cy="110" r="11" /><circle cx="310" cy="112" r="10" /><circle cx="335" cy="112" r="9" />
                        <circle cx="220" cy="122" r="10" /><circle cx="245" cy="124" r="11" /><circle cx="270" cy="125" r="12" /><circle cx="295" cy="124" r="11" /><circle cx="320" cy="122" r="10" />
                      </g>

                      {/* Concentric Layer 3: Central Medulla */}
                      <ellipse cx="270" cy="110" rx="42" ry="15" fill="url(#medullaGrad)" stroke="#475569" strokeWidth="1.2" />
                      <text x="270" y="114" fill="#0f172a" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="0.08em">MEDULLA</text>

                      {/* Longitudinal Shaft Body Dropping Down */}
                      <path d="M 80 110 L 80 420 C 80 455, 460 455, 460 420 L 460 110" fill="url(#fiberOuterGrad)" opacity="0.95" />

                      {/* Longitudinal Cutaway Window Revealing Cortex & Collagen Spiral */}
                      <path
                        d="M 150 180 Q 270 210 390 180 L 390 390 Q 270 420 150 390 Z"
                        fill="url(#cortexCutawayGrad)"
                        stroke="#9333ea"
                        strokeWidth="2"
                      />

                      {/* Macrofibril lines along vertical cutaway */}
                      <g stroke="#9333ea" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="6 3">
                        <line x1="180" y1="190" x2="180" y2="395" />
                        <line x1="215" y1="196" x2="215" y2="402" />
                        <line x1="250" y1="200" x2="250" y2="406" />
                        <line x1="285" y1="200" x2="285" y2="406" />
                        <line x1="320" y1="196" x2="320" y2="402" />
                        <line x1="355" y1="190" x2="355" y2="395" />
                      </g>

                      {/* 3D Native Tropocollagen Triple-Helix Spring Overlay (Gly-Pro-Hyp) */}
                      <path
                        d="M 245 220 Q 295 240 245 260 T 245 300 T 245 340 T 245 380"
                        fill="none"
                        stroke="#6b21a8"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 265 220 Q 215 240 265 260 T 265 300 T 265 340 T 265 380"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 255 225 Q 275 245 255 265 T 255 305 T 255 345 T 255 385"
                        fill="none"
                        stroke="#e9d5ff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Cuticle Surface Scales on Left and Right flanks */}
                      {[130, 165, 200, 235, 270, 305, 340, 375].map((y, idx) => (
                        <g key={idx}>
                          {/* Left flank scale */}
                          <path
                            d={`M 80 ${y} Q 115 ${y - 8} 150 ${y + 5} L 150 ${y + 24} Q 115 ${y + 16} 80 ${y + 24} Z`}
                            fill="url(#cuticleScaleGrad)"
                            stroke="#0369a1"
                            strokeWidth="1.2"
                            opacity={0.9}
                          />
                          {/* Right flank scale */}
                          <path
                            d={`M 390 ${y + 5} Q 425 ${y - 8} 460 ${y} L 460 ${y + 24} Q 425 ${y + 16} 390 ${y + 24} Z`}
                            fill="url(#cuticleScaleGrad)"
                            stroke="#0369a1"
                            strokeWidth="1.2"
                            opacity={0.9}
                          />
                        </g>
                      ))}

                      {/* Outer 18-MEA Lipid Protective Membrane (Glowing Green Sheen on Outer Cuticle) */}
                      <path d="M 78 115 L 78 420" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
                      <path d="M 462 115 L 462 420" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />

                      {/* Water Droplet Deflecting from 18-MEA Barrier (Hydrophobic Contact Angle > 95°) */}
                      <g transform="translate(25, 230)">
                        <circle cx="20" cy="20" r="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                        <path d="M 20 6 C 20 6 32 18 32 24 C 32 30 26 34 20 34 C 14 34 8 30 8 24 C 8 18 20 6 20 6 Z" fill="#e0f2fe" opacity="0.7" />
                        <line x1="36" y1="20" x2="52" y2="18" stroke="#10b981" strokeWidth="2" strokeDasharray="3 2" />
                        <g transform="translate(-10, 44)">
                          <rect x="0" y="0" width="135" height="20" rx="4" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="1" />
                          <text x="67" y="14" fill="#0369a1" fontSize="10" fontWeight="800" textAnchor="middle">Hydrophobic Rebound</text>
                        </g>
                      </g>

                      {/* Interactive Clickable Hotspots (Dynamic GCP Semantic Color Glow) */}
                      {/* Zone 1: Cortex */}
                      <g transform="translate(150, 20)" onClick={() => setActiveCondZone('cortex')} style={{ cursor: 'pointer' }}>
                        <rect
                          x="0" y="0" width="240" height="30" rx="8"
                          fill={activeCondZone === 'cortex' ? '#7c3aed' : '#1e293b'}
                          stroke={activeCondZone === 'cortex' ? '#d8b4fe' : '#475569'}
                          strokeWidth={activeCondZone === 'cortex' ? 2.5 : 1}
                          filter="url(#shadowFilterCond)"
                        />
                        <circle cx="20" cy="15" r="5" fill={activeCondZone === 'cortex' ? '#c084fc' : '#94a3b8'} />
                        <text x="32" y="20" fill="#ffffff" fontSize="12" fontWeight="800">1. Cortex Tropocollagen Core</text>
                      </g>

                      {/* Zone 2: Cuticle Scales */}
                      <g transform="translate(15, 135)" onClick={() => setActiveCondZone('cuticle')} style={{ cursor: 'pointer' }}>
                        <rect
                          x="0" y="0" width="185" height="28" rx="7"
                          fill={activeCondZone === 'cuticle' ? '#0284c7' : '#1e293b'}
                          stroke={activeCondZone === 'cuticle' ? '#7dd3fc' : '#475569'}
                          strokeWidth={activeCondZone === 'cuticle' ? 2.5 : 1}
                          filter="url(#shadowFilterCond)"
                        />
                        <circle cx="16" cy="14" r="5" fill={activeCondZone === 'cuticle' ? '#38bdf8' : '#94a3b8'} />
                        <text x="28" y="19" fill="#ffffff" fontSize="12" fontWeight="800">2. Cuticle Scale Shingles</text>
                      </g>

                      {/* Zone 3: 18-MEA Epicuticle */}
                      <g transform="translate(340, 245)" onClick={() => setActiveCondZone('flayer')} style={{ cursor: 'pointer' }}>
                        <rect
                          x="0" y="0" width="180" height="28" rx="7"
                          fill={activeCondZone === 'flayer' ? '#16a34a' : '#1e293b'}
                          stroke={activeCondZone === 'flayer' ? '#86efac' : '#475569'}
                          strokeWidth={activeCondZone === 'flayer' ? 2.5 : 1}
                          filter="url(#shadowFilterCond)"
                        />
                        <circle cx="16" cy="14" r="5" fill={activeCondZone === 'flayer' ? '#4ade80' : '#94a3b8'} />
                        <text x="28" y="19" fill="#ffffff" fontSize="12" fontWeight="800">3. 18-MEA Lipid Shield</text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Full-Width Interactive Zone Stepper & GCP Master Detail Inspector for Conditioner */}
              <div style={{ width: '100%' }}>
                {/* Horizontal Stepper Pills */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={17} color={currentCondZone.color} />
                    <span>Zone Inspector · Fiber Microarchitecture</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Click pills or graphic hotspots to inspect zones
                  </span>
                </div>

                <div className="cpi-layer-stepper-bar">
                  {CONDITIONER_ZONES.map((zone, idx) => {
                    const isSelected = activeCondZone === zone.id;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setActiveCondZone(zone.id)}
                        className="cpi-layer-stepper-pill"
                        style={{
                          background: isSelected ? zone.color : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          borderColor: isSelected ? zone.color : '#cbd5e1',
                          boxShadow: isSelected ? `0 2px 10px ${zone.color}40` : 'none',
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#475569'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: isSelected ? 800 : 600 }}>{zone.shortName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Full-Width GCP Master Detail Inspector Card with Dynamic Color */}
                <div style={{
                  width: '100%',
                  borderRadius: '14px',
                  border: `2px solid ${currentCondZone.color}`,
                  background: '#ffffff',
                  boxShadow: `0 8px 24px -6px ${currentCondZone.color}25`,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {/* Top Accent Strip */}
                  <div style={{
                    height: '4px',
                    width: '100%',
                    background: `linear-gradient(90deg, ${currentCondZone.color} 0%, ${currentCondZone.borderLight} 100%)`
                  }} />

                  {/* Header Row */}
                  <div style={{
                    padding: '1.15rem 1.25rem',
                    background: `linear-gradient(135deg, ${currentCondZone.bgLight} 0%, #ffffff 85%)`,
                    borderBottom: `1px solid ${currentCondZone.borderLight}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '3px 9px',
                          borderRadius: '99px',
                          background: currentCondZone.color,
                          color: '#ffffff'
                        }}>
                          Zone {currentCondZone.number} of 03 · {currentCondZone.tag}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                          Depth: {currentCondZone.depth}
                        </span>
                      </div>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: '#0f172a',
                        margin: '2px 0 0 0',
                        letterSpacing: '-0.01em'
                      }}>
                        {currentCondZone.title}
                      </h4>
                    </div>

                    {/* Prev / Next Navigation Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={prevCondZone}
                        title="Previous Zone"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <ChevronLeft size={15} />
                        <span>Prev Zone</span>
                      </button>
                      <button
                        type="button"
                        onClick={nextCondZone}
                        title="Next Zone"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${currentCondZone.color}`,
                          background: currentCondZone.color,
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Next Zone</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Body 3-Panel Breakdown */}
                  <div className="cpi-inspector-grid">
                    {/* Panel 1: Target Architecture & Metric */}
                    <div style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, color: currentCondZone.accentText, textTransform: 'uppercase' }}>
                        <Compass size={13} color={currentCondZone.color} />
                        <span>Target Microstructure &amp; Stat</span>
                      </div>
                      <div style={{
                        padding: '6px 10px',
                        background: currentCondZone.bgLight,
                        border: `1px solid ${currentCondZone.borderLight}`,
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: currentCondZone.accentText
                      }}>
                        {currentCondZone.metric}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                        <strong>Target:</strong> {currentCondZone.target}
                      </div>
                    </div>

                    {/* Panel 2: Active Molecules */}
                    <div style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, color: currentCondZone.accentText, textTransform: 'uppercase' }}>
                        <Beaker size={13} color={currentCondZone.color} />
                        <span>Bio-Active Scaffolding Formula</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                        {currentCondZone.activeIng}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                        Intact triple-helix conformation for optimal cortex bio-adhesion and thermal resistance.
                      </div>
                    </div>

                    {/* Panel 3: Mechanism */}
                    <div style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, color: currentCondZone.accentText, textTransform: 'uppercase' }}>
                        <Activity size={13} color={currentCondZone.color} />
                        <span>Biomechanical Sealing Mechanism</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#334155', lineHeight: 1.55 }}>
                        {currentCondZone.mechanism}
                      </p>
                    </div>
                  </div>

                  {/* Footer Banner: Clinical Impact Takeaway */}
                  <div style={{
                    padding: '10px 1.25rem',
                    background: currentCondZone.bgLight,
                    borderTop: `1px solid ${currentCondZone.borderLight}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <CheckCircle2 size={16} color={currentCondZone.color} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.76rem', color: '#1e293b', lineHeight: 1.45 }}>
                      <strong>Clinical Takeaway:</strong> {currentCondZone.clinicalImpact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DUAL-ACTION SYNERGY — COMBINED ROUTINE & MESOTHERAPY    */}
        {/* ============================================================== */}
        {activeTab === 'synergy' && (
          <div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Layers size={18} color="#7c3aed" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                  The 2-Phase Trichological Synergy System
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.55 }}>
                When applied in sequence, the Shampoo and Conditioner create a complementary inside-out biological cascade: Phase 1 reactivates the dermal root and neutralizes DHT; Phase 2 locks the cortex and coats the fiber against environmental trauma.
              </p>

              {/* Side-by-side Dual Phase Comparison Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {/* Shampoo Phase */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #ccfbf1',
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0d9488', background: '#f0fdfa', padding: '2px 8px', borderRadius: '99px' }}>
                      STEP 1 · SCALP &amp; ROOT INFLUX
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>pH 4.8 – 5.2</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Colway Strengthening Shampoo
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#334155', lineHeight: 1.6 }}>
                    <li><strong>Target:</strong> Scalp epidermis, follicular ostia, dermal papilla.</li>
                    <li><strong>Cleansing:</strong> Sulfate-free SCI surfactant protects scalp acid mantle.</li>
                    <li><strong>DHT Blockade:</strong> Zinc PCA + Baicalin arrest 5α-reductase activity.</li>
                    <li><strong>Follicular Influx:</strong> Caffeine penetrates to root within 120s, elevating cAMP &amp; IGF-1.</li>
                  </ul>
                </div>

                {/* Conditioner Phase */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '99px' }}>
                      STEP 2 · SHAFT &amp; CUTICLE BIOSEAL
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>pH 4.0 – 4.5</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Colway Strengthening Conditioner
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#334155', lineHeight: 1.6 }}>
                    <li><strong>Target:</strong> Cortical macrofibrils, cuticle scales, 18-MEA lipid layer.</li>
                    <li><strong>Cortex Matrix:</strong> Native Fish Tropocollagen deposits triple-helix scaffolding.</li>
                    <li><strong>Cuticle Realignment:</strong> Cationic BTMS-50 + Silk Amino Acids smooth scales.</li>
                    <li><strong>Cold Lock (18–22°C):</strong> Physical closing of cuticular shingles locks moisture in.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mesotherapy / Peptide Adjunct Protocol Guidance */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #eff6ff 100%)',
              border: '1px solid #99f6e4',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f766e', marginBottom: '2px' }}>
                  Adjunct Integration with GHK-Cu &amp; Scalp Mesotherapy Protocols
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#334155', lineHeight: 1.55 }}>
                  The Colway Hair System is clinically formulated as a <strong>topical homecare adjunct</strong> alongside regenerative hair protocols (e.g. GHK-Cu, PTD-DBM, PRP, and exosome mesotherapy). For patients receiving in-clinic scalp microneedling or injections, resume Colway washing <strong>24 to 48 hours post-procedure</strong> once cutaneous microchannels have completely closed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trichology Standards & Regulatory Badges */}
        <div style={{
          marginTop: '1.25rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
              EU Cosmetics Regulation 1223/2009 Compliant · CPNP Registered · 0% Bovine (Fish Tropocollagen)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Frequency:</span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#0d9488',
              background: '#f0fdfa',
              padding: '2px 8px',
              borderRadius: '99px',
              border: '1px solid #ccfbf1'
            }}>
              3–4× Weekly (Min. 8 Weeks)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
