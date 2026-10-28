"use client";

import React, { useState, useMemo } from 'react';
import {
  Sparkles, Dna, Brain, Moon, HeartPulse, ShieldCheck,
  Droplets, Sun, Check, ArrowRight, ArrowLeft, X, Layers, Pill,
  CheckCircle2, Compass, Award, Activity
} from '@/lib/icons';
import { CLINICAL_DOSAGE_REGISTRY } from '../../data/clinicalDosageRegistry';
import { resolvePhysicalCapsuleSize } from '../../services/pharmapolisCostEngine.js';
import { triggerHaptic } from '@/utils/haptics';

/* ─── Health Goals Catalog (100% Food Supplements / Nutracéuticos) ───────── */
const GOALS_CATALOG = [
  {
    id: 'longevity',
    icon: Dna,
    color: '#7c3aed',
    title: { es: 'Longevidad & Energía Mitocondrial', en: 'Longevity & Cellular Energy' },
    desc: {
      es: 'Activación de sirtuinas, síntesis de ATP mitocondrial y reciclaje redox celular.',
      en: 'Sirtuin activation, mitochondrial ATP generation, and cellular redox recycling.'
    },
    activesPool: [
      { name: 'Resveratrol', dose: 250, role: { es: 'Activador alostérico de SIRT1 y AMPK', en: 'SIRT1 & AMPK allosteric activator' } },
      { name: 'Coenzyme Q10 (Ubiquinol)', dose: 100, role: { es: 'Transportador de electrones mitocondrial', en: 'Mitochondrial electron transport' } },
      { name: 'Alpha-Lipoic Acid (ALA)', dose: 150, role: { es: 'Antioxidante universal mitocondrial', en: 'Mitochondrial universal antioxidant' } },
      { name: 'Piperine', dose: 5, role: { es: 'Potenciador de biodisponibilidad de polifenoles', en: 'Polyphenol bioavailability enhancer' } },
      { name: 'PQQ', dose: 20, role: { es: 'Biogénesis de nuevas mitocondrias', en: 'Mitochondrial biogenesis promoter' } },
      { name: 'Quercetin', dose: 250, role: { es: 'Flavonoide senolítico y estabilizador redox', en: 'Senolytic flavonoid & redox stabilizer' } }
    ]
  },
  {
    id: 'cognitive',
    icon: Brain,
    color: '#0284c7',
    title: { es: 'Rendimiento Cognitivo, Memoria & Enfoque', en: 'Cognitive Focus & Mental Clarity' },
    desc: {
      es: 'Microcirculación cerebral, neurotransmisores (acetilcolina/dopamina) y adaptógenos.',
      en: 'Cerebral microcirculation, neurotransmitter support and adaptogenic clarity.'
    },
    activesPool: [
      { name: 'Ginkgo Biloba', dose: 120, role: { es: 'Microcirculación y oxigenación cerebral', en: 'Cerebral microcirculation & perfusion' } },
      { name: 'Ginseng', dose: 200, role: { es: 'Adaptógeno tónico y resistencia mental', en: 'Tonic adaptogen & mental endurance' } },
      { name: 'L-Tyrosine', dose: 350, role: { es: 'Precursor de catecolaminas (dopamina/noradrenalina)', en: 'Dopamine & catecholamine precursor' } },
      { name: 'Citicoline (CDP-Choline)', dose: 250, role: { es: 'Síntesis de acetilcolina y fosfolípidos neuronales', en: 'Acetylcholine & neuronal membrane donor' } },
      { name: 'Rhodiola Rosea', dose: 150, role: { es: 'Modular de fatiga cognitiva y estrés agudo', en: 'Cognitive fatigue & stress modulator' } },
      { name: 'Vitamin B Complex Methylated', dose: 50, role: { es: 'Cofactores de metilación y mielinización', en: 'Methylation cofactors & myelin support' } }
    ]
  },
  {
    id: 'sleep_stress',
    icon: Moon,
    color: '#4f46e5',
    title: { es: 'Sueño Profundo, Estrés & Sistema Nervioso', en: 'Deep Sleep & Stress Resilience' },
    desc: {
      es: 'Regulación del eje HPA, modulación GABAérgica y arquitectura del sueño reparador.',
      en: 'HPA axis regulation, GABAergic tone and restorative sleep architecture.'
    },
    activesPool: [
      { name: 'Magnesium (Glycinate)', dose: 300, role: { es: 'Relajación neuromuscular y agonismo GABA', en: 'Neuromuscular relaxation & GABA receptor support' } },
      { name: 'L-Theanine', dose: 200, role: { es: 'Inductor de ondas alfa cerebrales sin sedación', en: 'Alpha brain wave inducer without grogginess' } },
      { name: 'Valerian Root Extract', dose: 200, role: { es: 'Extracto fitoterápico para latencia del sueño', en: 'Botanical extract for sleep latency' } },
      { name: 'Ashwagandha Extract', dose: 250, role: { es: 'Reducción de cortisol y soporte suprarrenal', en: 'Cortisol modulation & adrenal buffer' } },
      { name: 'Melatonin', dose: 1, role: { es: 'Sincronizador circadiano del núcleo supraquiasmático', en: 'Circadian pacemaker synchronization' } }
    ]
  },
  {
    id: 'metabolic',
    icon: HeartPulse,
    color: '#ea580c',
    title: { es: 'Salud Metabólica & Sensibilidad a la Insulina', en: 'Metabolic Balance & Glycemic Control' },
    desc: {
      es: 'Homeostasis glucémica, modulación de AMPK y transporte celular de nutrientes.',
      en: 'Glycemic homeostasis, AMPK modulation and cellular nutrient partitioning.'
    },
    activesPool: [
      { name: 'Alpha-Lipoic Acid (ALA)', dose: 300, role: { es: 'Sensibilización de receptores GLUT4 de glucosa', en: 'GLUT4 glucose transporter sensitizer' } },
      { name: 'Bitter Melon Extract (Momordica charantia)', dose: 250, role: { es: 'Mimético botánico de insulina (charantina)', en: 'Botanical insulin mimetic (charantin)' } },
      { name: 'Green Tea Extract (EGCG)', dose: 150, role: { es: 'Oxidación lipídica y termogénesis mitocondrial', en: 'Lipid oxidation & mitochondrial thermogenesis' } },
      { name: 'Chromium (Picolinate)', dose: 0.2, role: { es: 'Cofactor esencial del factor de tolerancia a glucosa', en: 'Glucose tolerance factor essential cofactor' } },
      { name: 'Cinnamon Bark Extract', dose: 200, role: { es: 'Atenuación de picos glucémicos postprandiales', en: 'Postprandial glycemic spike attenuation' } }
    ]
  },
  {
    id: 'joint_skin',
    icon: Droplets,
    color: '#0d9488',
    title: { es: 'Articulaciones, Colágeno & Piel', en: 'Joint Mobility & Dermal Matrix' },
    desc: {
      es: 'Regeneración de cartílago articular, neocolagénesis y queratina dérmica.',
      en: 'Cartilage rebuilding, connective tissue neocollagenesis and dermal elasticity.'
    },
    activesPool: [
      { name: 'Bioactive Hydrolyzed Collagen Peptides (Types I & III)', dose: 350, role: { es: 'Péptidos bioactivos precursores de matriz extracelular', en: 'Extracellular matrix precursor peptides' } },
      { name: 'Glucosamine Sulfate', dose: 300, role: { es: 'Síntesis de glucosaminoglucanos en cartílago', en: 'Glycosaminoglycan cartilage synthesis' } },
      { name: 'Vitamin C (Ascorbic Acid)', dose: 150, role: { es: 'Cofactor obligatorio en hidroxilación de prolina', en: 'Required proline-lysine hydroxylation cofactor' } },
      { name: 'Hydrolyzed Keratin Peptides (Soluble Keratin)', dose: 150, role: { es: 'Protección y anclaje de queratina folicular/dérmica', en: 'Keratin fiber matrix fortification' } },
      { name: 'Horsetail Extract (Equisetum arvense)', dose: 150, role: { es: 'Aporte de silicio orgánico asimilable', en: 'Bioavailable organic silica provider' } },
      { name: 'Biotin', dose: 5, role: { es: 'Cofactor enzimático de síntesis proteica en anejos', en: 'Keratin structural coenzyme' } }
    ]
  },
  {
    id: 'immune_gut',
    icon: ShieldCheck,
    color: '#16a34a',
    title: { es: 'Inmunidad, Detox & Barrera Intestinal', en: 'Immune Defense & Gut Barrier' },
    desc: {
      es: 'Glutatión endógeno, defensas mucosas e integridad de la barrera epitelial.',
      en: 'Endogenous glutathione, mucosal immunity and gut epithelial barrier integrity.'
    },
    activesPool: [
      { name: 'N-Acetylcysteine (NAC)', dose: 300, role: { es: 'Precursor intracelular directo de glutatión', en: 'Direct intracellular glutathione donor' } },
      { name: 'Vitamin C (Ascorbic Acid)', dose: 250, role: { es: 'Neutralizador de especies reactivas de oxígeno', en: 'Reactive oxygen species neutralizer' } },
      { name: 'Zinc (Gluconate or Chelate)', dose: 30, role: { es: 'Cofactor de timulina e inmunidad celular T', en: 'Thymulin cofactor & cellular T-cell defense' } },
      { name: 'L-Glutamine', dose: 350, role: { es: 'Combustible primario de enterocitos y tight junctions', en: 'Enterocyte primary fuel & tight junction repair' } },
      { name: 'Vitamin D3 (Cholecalciferol)', dose: 20, role: { es: 'Modulador de péptidos antimicrobianos (catelicidina)', en: 'Antimicrobial peptide inducer (cathelicidin)' } }
    ]
  }
];

export default function CompoundingGoalWizard({
  isOpen,
  onClose,
  catalog = [],
  lang = 'en',
  onApplyProposal
}) {
  const isEs = lang === 'es';

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedGoalId, setSelectedGoalId] = useState('longevity');
  const [timing, setTiming] = useState('morning'); // 'morning' | 'evening' | 'biphasic'
  const [routineVolume, setRoutineVolume] = useState('clinical'); // 'minimalist' (1-2 caps) | 'clinical' (3-4 caps)

  const selectedGoal = useMemo(() => {
    return GOALS_CATALOG.find(g => g.id === selectedGoalId) || GOALS_CATALOG[0];
  }, [selectedGoalId]);

  /* ── Generate 3 Tailored Proposals Based on User Answers ────────────────── */
  const proposals = useMemo(() => {
    if (!selectedGoal) return [];

    const pool = selectedGoal.activesPool;

    // Helper to resolve an active with catalog pricing/spec
    const resolveItem = (act) => {
      const match = catalog.find(c => c.name.toLowerCase() === act.name.toLowerCase()) || {
        id: `custom-${act.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: act.name,
        priceEurGram: 0.05
      };
      return {
        apiId: match.id,
        name: match.name,
        doseMg: act.dose,
        role: act.role[lang] || act.role.en,
        priceEurGram: match.priceEurGram || 0.05
      };
    };

    const calculateProposalGalenics = (totalMg, defaultBottleSize = 60) => {
      const capsPerDay = Math.max(1, Math.ceil(totalMg / 750));
      const mgPerCap = totalMg / capsPerDay;
      const sizeObj = resolvePhysicalCapsuleSize([{ amount: mgPerCap }]);
      const supplyDays = Math.floor(defaultBottleSize / capsPerDay);
      return {
        size: sizeObj,
        capsPerDay,
        mgPerCap: Math.round(mgPerCap),
        supplyDays
      };
    };

    // 1. Proposal A: Essential Core (1-2 caps max, targeted top 2-3 actives)
    const coreActives = pool.slice(0, routineVolume === 'minimalist' ? 2 : 3).map(resolveItem);
    const coreLoad = coreActives.reduce((sum, i) => sum + i.doseMg, 0);
    const coreGalenics = calculateProposalGalenics(coreLoad, 60);

    // 2. Proposal B: Clinical Synergy Stack (3-4 caps, 4-5 actives with enhancers like Piperine or cofactors)
    const synergyActives = pool.slice(0, 5).map(resolveItem);
    const synergyLoad = synergyActives.reduce((sum, i) => sum + i.doseMg, 0);
    const synergyGalenics = calculateProposalGalenics(synergyLoad, 90);

    // 3. Proposal C: Day/Night Chronobiology Protocol (Biphasic activation and repair)
    const dayPool = pool.filter(a => !['Melatonin', 'Valerian Root Extract', 'Ashwagandha Extract'].includes(a.name));
    const nightPool = pool.filter(a => ['Magnesium (Glycinate)', 'Valerian Root Extract', 'Melatonin', 'L-Theanine'].includes(a.name));
    const biphasicActives = (dayPool.slice(0, 3).concat(nightPool.length ? nightPool : pool.slice(3, 5))).map(resolveItem);
    const biphasicLoad = biphasicActives.reduce((sum, i) => sum + i.doseMg, 0);
    const biphasicGalenics = calculateProposalGalenics(biphasicLoad, 120);

    return [
      {
        id: 'prop-essential',
        badge: isEs ? '🟢 Esencial Focalizada' : '🟢 Targeted Core',
        badgeColor: '#16a34a',
        title: isEs ? `${selectedGoal.title.es} · Esencial` : `${selectedGoal.title.en} · Core`,
        desc: isEs
          ? 'Formulación compacta de alta tolerancia. Dosis esenciales seleccionadas para máxima adherencia en 1 toma diaria.'
          : 'High-compliance targeted formula. Essential daily doses engineered for maximum convenience.',
        actives: coreActives,
        totalLoad: coreLoad,
        galenics: coreGalenics,
        isSplit: false,
        capsPerBottle: 60,
        highlight: isEs ? '1–2 cápsulas al día' : '1–2 caps per day'
      },
      {
        id: 'prop-synergy',
        badge: isEs ? '⭐ Stack Clínico Avanzado' : '⭐ Advanced Synergy Stack',
        badgeColor: '#7c3aed',
        title: isEs ? `${selectedGoal.title.es} · Sinergia Pro` : `${selectedGoal.title.en} · Synergy Pro`,
        desc: isEs
          ? 'Fórmula integral de máxima biodisponibilidad. Incorpora cofactores y activadores celulares para una respuesta terapéutica amplificada.'
          : 'Comprehensive formula with enhanced bioavailability. Combines primary actives with cellular cofactors for maximum impact.',
        actives: synergyActives,
        totalLoad: synergyLoad,
        galenics: synergyGalenics,
        isSplit: false,
        capsPerBottle: 90,
        highlight: isEs ? 'Máxima cobertura biológica' : 'Maximum biological coverage'
      },
      {
        id: 'prop-biphasic',
        badge: isEs ? '🌗 Protocolo Cronobiológico Día/Noche' : '🌗 Day/Night Biphasic Protocol',
        badgeColor: '#0284c7',
        title: isEs ? `${selectedGoal.title.es} · Ciclo Circadiano` : `${selectedGoal.title.en} · Circadian Cycle`,
        desc: isEs
          ? 'Sincronización con el ritmo biológico humano: estimulación y ATP por la mañana, junto a desactivación del estrés y detoxificación nocturna.'
          : 'Aligned with human circadian biology: morning ATP and vitality coupled with evening nervous system recovery.',
        actives: biphasicActives,
        totalLoad: biphasicLoad,
        galenics: biphasicGalenics,
        isSplit: true,
        capsPerBottle: 120,
        highlight: isEs ? 'Soporte circadiano 24h' : '24h circadian support'
      }
    ];
  }, [selectedGoal, routineVolume, catalog, lang, isEs]);

  if (!isOpen) return null;

  return (
    <div className="cmp-wizard-overlay" role="dialog" aria-modal="true" aria-labelledby="cmp-wizard-title">
      <div className="cmp-wizard-modal">
        {/* Modal Header */}
        <div className="cmp-wizard-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="cmp-wizard-badge">
              <Compass size={14} />
              {isEs ? 'Asistente de Objetivos del Paciente' : 'Patient Goals Advisor'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 650, background: '#f0fdf4', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
              {isEs ? '100% Complementos Alimenticios UE' : '100% EU Food Supplements'}
            </span>
          </div>
          <button
            type="button"
            className="cmp-wizard-close"
            onClick={onClose}
            aria-label={isEs ? 'Cerrar asistente' : 'Close wizard'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="cmp-wizard-steps-bar">
          <div className={`cmp-wizard-step-pill ${step === 1 ? 'is-active' : step > 1 ? 'is-completed' : ''}`}>
            <span>1</span> {isEs ? 'Objetivo de Salud' : 'Health Goal'}
          </div>
          <div className="cmp-wizard-step-divider" />
          <div className={`cmp-wizard-step-pill ${step === 2 ? 'is-active' : step > 2 ? 'is-completed' : ''}`}>
            <span>2</span> {isEs ? 'Cronobiología & Ritmo' : 'Timing & Rhythm'}
          </div>
          <div className="cmp-wizard-step-divider" />
          <div className={`cmp-wizard-step-pill ${step === 3 ? 'is-active' : ''}`}>
            <span>3</span> {isEs ? 'Propuestas a Medida' : 'Tailored Proposals'}
          </div>
        </div>

        {/* Body Content */}
        <div className="cmp-wizard-body">
          {/* ── STEP 1: Select Primary Goal ──────────────────────────────── */}
          {step === 1 && (
            <div>
              <div className="cmp-wizard-intro">
                <h3 id="cmp-wizard-title">{isEs ? '¿Cuál es el objetivo principal de bienestar para este lote?' : 'What is the primary health objective for this custom batch?'}</h3>
                <p>{isEs ? 'Selecciona el área clínica o funcional donde deseas enfocar la fórmula de complementos alimenticios.' : 'Choose the clinical or wellness domain where you want to focus your personalized food supplement formula.'}</p>
              </div>

              <div className="cmp-wizard-goals-grid">
                {GOALS_CATALOG.map(goal => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoalId === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      className={`cmp-wizard-goal-card ${isSelected ? 'is-selected' : ''}`}
                      style={{ '--goal-color': goal.color }}
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedGoalId(goal.id);
                      }}
                    >
                      <div className="cmp-wizard-goal-head">
                        <span className="cmp-wizard-goal-icon" style={{ background: `${goal.color}15`, color: goal.color }}>
                          <Icon size={20} />
                        </span>
                        {isSelected && <CheckCircle2 size={18} style={{ color: goal.color }} />}
                      </div>
                      <div className="cmp-wizard-goal-title">{goal.title[lang] || goal.title.en}</div>
                      <div className="cmp-wizard-goal-desc">{goal.desc[lang] || goal.desc.en}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2: Timing & Routine Preferences ──────────────────────── */}
          {step === 2 && (
            <div>
              <div className="cmp-wizard-intro">
                <h3>{isEs ? 'Cronobiología y Preferencias de Rutina' : 'Chronobiology & Daily Routine Preferences'}</h3>
                <p>{isEs ? 'Calibra cuándo tomar la fórmula y cuántas cápsulas diarias se ajustan mejor a la rutina del paciente.' : 'Calibrate daily intake timing and volume preference to ensure maximum clinical adherence.'}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="cmp-wizard-field-label">
                  <Sun size={14} style={{ color: '#ea580c' }} />
                  {isEs ? '¿En qué momento del día se busca el principal impacto?' : 'What time of day requires the main focus?'}
                </label>
                <div className="cmp-wizard-options-row">
                  {[
                    { id: 'morning', label: isEs ? 'Mañana (Energía & Enfoque)' : 'Morning (Vitality & Focus)', icon: Sun, color: '#ea580c' },
                    { id: 'evening', label: isEs ? 'Noche (Relajación & Reparación)' : 'Evening (Calm & Tissue Repair)', icon: Moon, color: '#4f46e5' },
                    { id: 'biphasic', label: isEs ? 'Ambos (Soporte Día y Noche 24h)' : 'Both (24h Circadian Balance)', icon: Layers, color: '#0284c7' }
                  ].map(opt => {
                    const Icon = opt.icon;
                    const isSel = timing === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`cmp-wizard-opt-btn ${isSel ? 'is-selected' : ''}`}
                        onClick={() => { triggerHaptic('light'); setTiming(opt.id); }}
                      >
                        <Icon size={16} style={{ color: opt.color }} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="cmp-wizard-field-label">
                  <Pill size={14} style={{ color: '#7c3aed' }} />
                  {isEs ? '¿Qué volumen de cápsulas se prefiere en la rutina diaria?' : 'What daily capsule volume is preferred?'}
                </label>
                <div className="cmp-wizard-options-row">
                  {[
                    {
                      id: 'minimalist',
                      label: isEs ? 'Fórmula Mínima (1–2 cápsulas/día)' : 'Minimalist (1–2 caps/day)',
                      sub: isEs ? 'Máxima comodidad y adherencia. Activos clave esenciales.' : 'Maximum convenience. Key targeted ingredients.'
                    },
                    {
                      id: 'clinical',
                      label: isEs ? 'Stack Clínico Completo (3–4 cápsulas/día)' : 'Clinical Stack (3–4 caps/day)',
                      sub: isEs ? 'Dosis terapéuticas integrales con cofactores y potenciadores.' : 'Comprehensive therapeutic load with bioenhancers.'
                    }
                  ].map(opt => {
                    const isSel = routineVolume === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`cmp-wizard-opt-btn is-wide ${isSel ? 'is-selected' : ''}`}
                        onClick={() => { triggerHaptic('light'); setRoutineVolume(opt.id); }}
                      >
                        <div>
                          <strong>{opt.label}</strong>
                          <small>{opt.sub}</small>
                        </div>
                        {isSel && <CheckCircle2 size={18} style={{ color: '#003666' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Smart Proposals ───────────────────────────────────── */}
          {step === 3 && (
            <div>
              <div className="cmp-wizard-intro">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3>{isEs ? 'Propuestas Formuladas a Medida' : 'Custom Formulated Proposals'}</h3>
                    <p>{isEs ? 'Basadas en tu objetivo seleccionado y calibradas conforme a la Farmacopea Europea (Ph.Eur).' : 'Formulated for your specific target and calibrated according to European Pharmacopoeia monographs.'}</p>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#003666', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
                    {selectedGoal.title[lang]}
                  </span>
                </div>
              </div>

              <div className="cmp-wizard-proposals-grid">
                {proposals.map(prop => (
                  <div key={prop.id} className="cmp-wizard-prop-card">
                    <div className="cmp-wizard-prop-head">
                      <span className="cmp-wizard-prop-badge" style={{ color: prop.badgeColor, background: `${prop.badgeColor}12`, borderColor: `${prop.badgeColor}30` }}>
                        {prop.badge}
                      </span>
                      <span className="cmp-wizard-prop-highlight">{prop.highlight}</span>
                    </div>

                    <h4 className="cmp-wizard-prop-title">{prop.title}</h4>
                    <p className="cmp-wizard-prop-desc">{prop.desc}</p>

                    <div className="cmp-wizard-prop-actives-box">
                      <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                        {isEs ? 'Ingredientes Activos (Complementos Alimenticios):' : 'Active Ingredients (Food Supplements):'}
                      </div>
                      <div className="cmp-wizard-prop-actives-list">
                        {prop.actives.map((act, i) => (
                          <div key={i} className="cmp-wizard-prop-active-item">
                            <div>
                              <strong>{act.name}</strong>
                              <span className="cmp-wizard-prop-active-role">{act.role}</span>
                            </div>
                            <span className="cmp-wizard-prop-active-dose">{act.doseMg} mg</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Galenics Footer */}
                    <div className="cmp-wizard-prop-galenics">
                      <div className="cmp-wizard-prop-meta">
                        <span>{isEs ? 'Cápsula' : 'Capsule'}: <strong>{prop.galenics?.size?.size || prop.galenics?.size || 'Size 0'} HPMC</strong></span>
                        <span>{isEs ? 'Toma' : 'Intake'}: <strong>{prop.galenics?.capsPerDay || 1} {isEs ? 'caps/día' : 'caps/day'}</strong></span>
                        <span>{isEs ? 'Duración' : 'Supply'}: <strong>{prop.galenics?.supplyDays ? `${prop.galenics.supplyDays} ${isEs ? 'días' : 'days'}` : '30 days'}</strong> ({prop.capsPerBottle} caps)</span>
                        <span>{isEs ? 'Carga' : 'Load'}: <strong>{prop.totalLoad} mg/día</strong></span>
                      </div>
                      <button
                        type="button"
                        className="cmp-wizard-apply-btn"
                        onClick={() => {
                          triggerHaptic('success');
                          onApplyProposal({
                            name: prop.title,
                            items: prop.actives.map(a => ({ apiId: a.apiId, doseMg: a.doseMg })),
                            isSplit: prop.isSplit,
                            capsPerBottle: prop.capsPerBottle
                          });
                          onClose();
                        }}
                      >
                        <Sparkles size={14} />
                        <span>{isEs ? 'Cargar esta Fórmula en el Laboratorio' : 'Load this Formula into Lab'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="cmp-wizard-foot">
          {step > 1 ? (
            <button
              type="button"
              className="cmp-wizard-back-btn"
              onClick={() => { triggerHaptic('light'); setStep(s => s - 1); }}
            >
              <ArrowLeft size={14} />
              <span>{isEs ? 'Anterior' : 'Back'}</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              className="cmp-wizard-next-btn"
              onClick={() => { triggerHaptic('medium'); setStep(s => s + 1); }}
            >
              <span>{isEs ? 'Siguiente paso' : 'Next step'}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="cmp-wizard-secondary-close"
              onClick={onClose}
            >
              {isEs ? 'Cerrar asistente' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
