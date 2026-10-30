"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles, Dna, Brain, Moon, HeartPulse, ShieldCheck,
  Droplets, Sun, Check, ArrowRight, ArrowLeft, X, Layers, Pill,
  CheckCircle2, Compass, Award, Activity, TrendingUp, Upload, FileText
} from '@/lib/icons';
import { CLINICAL_DOSAGE_REGISTRY } from '../../data/clinicalDosageRegistry';
import { resolvePhysicalCapsuleSize } from '../../services/pharmapolisCostEngine.js';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import PatientGeneticConsentModal from '@/components/diagnostic/eterna/PatientGeneticConsentModal';

/* ─── Health Goals Catalog (100% Food Supplements / Nutracéuticos) ───────── */
const GOALS_CATALOG = [
  {
    id: 'weight_loss',
    icon: TrendingUp,
    color: '#dc2626',
    title: { es: 'Control de Peso & Grasa Saludable', en: 'Weight Loss & Healthy Fat Metabolism' },
    desc: {
      es: 'Regulación de AMPK, sensibilidad a la insulina, lipólisis mitocondrial y control de apetito hedónico.',
      en: 'AMPK activation, insulin sensitivity, mitochondrial lipolysis and hedonic appetite control.'
    },
    activesPool: [
      { name: 'Berberine HCl', dose: 400, role: { es: 'Activador de AMPK y modulador glucémico', en: 'AMPK activator & glycemic modulator' } },
      { name: 'Green Tea Extract (EGCG)', dose: 200, role: { es: 'Termogénesis y oxidación lipídica mitocondrial', en: 'Thermogenesis & mitochondrial lipid oxidation' } },
      { name: 'Chromium (Picolinate)', dose: 0.2, role: { es: 'Sensibilidad a insulina y control de antojos dulces', en: 'Insulin sensitivity & sweet cravings' } },
      { name: 'L-Carnitine Tartrate', dose: 350, role: { es: 'Transportador mitocondrial de ácidos grasos', en: 'Mitochondrial fatty acid transport' } },
      { name: 'Gymnema Sylvestre', dose: 200, role: { es: 'Inhibición de receptores del sabor dulce y absorción', en: 'Sugar craving inhibition & glucose absorption blocker' } },
      { name: 'Phaseolamin', dose: 250, role: { es: 'Inhibidor natural de alfa-amilasa de carbohidratos', en: 'Natural alpha-amylase carb absorption inhibitor' } },
      { name: 'L-Tyrosine', dose: 250, role: { es: 'Precursor de catecolaminas para saciedad y energía', en: 'Catecholamine precursor for satiety & drive' } },
      { name: 'Piperine', dose: 5, role: { es: 'Termogénico y potenciador de biodisponibilidad', en: 'Bioavailability enhancer & thermonutrient' } },
      { name: 'Vitamin D3 (Cholecalciferol)', dose: 20, role: { es: 'Regulador endocrino y receptor de leptina', en: 'Endocrine regulator & leptin signaling' } }
    ]
  },
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
  const [selectedGoalId, setSelectedGoalId] = useState('weight_loss');
  const [timing, setTiming] = useState('morning'); // 'morning' | 'evening' | 'biphasic'
  const [routineVolume, setRoutineVolume] = useState('clinical'); // 'minimalist' (1-2 caps) | 'clinical' (3-4 caps)

  // 24Genetics DNA Report State (Optional Nutrigenomic Fine-Tuning)
  const [geneticData, setGeneticData] = useState(null);
  const [isUploadingGenetics, setIsUploadingGenetics] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploadingGenetics(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/compounding/parse-24genetics', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setGeneticData(data);
        triggerHaptic('success');
        toast.success(isEs ? `Reporte 24Genetics analizado: ${data.patientName}` : `24Genetics report analyzed: ${data.patientName}`);
      } else {
        setUploadError(data.error || 'Error al procesar el reporte 24Genetics');
        toast.error(data.error || 'Error parsing 24Genetics');
      }
    } catch (err) {
      setUploadError(err.message);
      toast.error(err.message);
    } finally {
      setIsUploadingGenetics(false);
    }
  };

  const handleLoadSample24Genetics = async () => {
    setIsUploadingGenetics(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('sample', 'true');
      const res = await fetch('/api/compounding/parse-24genetics', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setGeneticData(data);
        triggerHaptic('success');
        toast.success(isEs ? `Reporte de muestra 24Genetics cargado: ${data.patientName}` : `Sample 24Genetics report loaded: ${data.patientName}`);
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploadingGenetics(false);
    }
  };

  const selectedGoal = useMemo(() => {
    return GOALS_CATALOG.find(g => g.id === selectedGoalId) || GOALS_CATALOG[0];
  }, [selectedGoalId]);

  /* ── Generate 3 Tailored Proposals Based on User Answers ────────────────── */
  const proposals = useMemo(() => {
    if (!selectedGoal) return [];

    let pool = [...selectedGoal.activesPool];
    let isGeneticallyTuned = false;
    let fineTuningNotes = [];

    // Apply 24Genetics Fine-Tuning Engine
    if (geneticData && selectedGoalId === 'weight_loss') {
      isGeneticallyTuned = true;
      const dw = geneticData.dietAndWeight || {};
      const met = geneticData.metabolism || {};
      const vit = geneticData.vitaminDeficiencies || {};

      // 1. Slow caffeine metabolizer (CYP1A2)
      if (met.caffeineMetabolism === 'slow') {
        fineTuningNotes.push(isEs ? 'Metabolizador lento de cafeína (CYP1A2): Termogénico no adrenérgico descafeinado' : 'Slow caffeine metabolizer (CYP1A2): Decaffeinated non-adrenergic thermogenesis');
        pool = pool.map(act => {
          if (act.name.includes('Green Tea')) {
            return {
              ...act,
              name: 'Green Tea Extract (Decaffeinated EGCG)',
              role: {
                es: 'EGCG descafeinado para termogénesis sin elevación de cortisol',
                en: 'Decaffeinated EGCG for thermogenesis without cortisol spike'
              }
            };
          }
          return act;
        });
      }

      // 2. High Carbohydrate Sensitivity & Sweet Tooth (SLC2A2 / TCF7L2)
      if (dw.carbSensitivity === 'high' || dw.sweetTooth === 'high') {
        fineTuningNotes.push(isEs ? 'Alta sensibilidad a carbohidratos (TCF7L2): Cromo reforzado a 400mcg y Gymnema 250mg' : 'High carb sensitivity (TCF7L2): Enhanced Chromium to 400mcg & Gymnema 250mg');
        pool = pool.map(act => {
          if (act.name.includes('Chromium')) {
            return { ...act, dose: 0.4, role: { es: 'Dosis reforzada (400 mcg) para receptores GLUT4', en: 'Enhanced dose (400 mcg) for GLUT4 receptors' } };
          }
          if (act.name.includes('Gymnema')) {
            return { ...act, dose: 250, role: { es: 'Bloqueo reforzado de sabor dulce y absorción entérica', en: 'Reinforced sweet craving & intestinal glucose block' } };
          }
          return act;
        });
      }

      // 3. Emotional Eating / Snacking (DRD2 / FTO)
      if (dw.emotionalEating === 'high' || dw.snackingTendency === 'high') {
        fineTuningNotes.push(isEs ? 'Tendencia a picoteo/hambre hedónica (DRD2): Dosis saciante dopaminérgica' : 'Emotional eating/snacking (DRD2): Dopaminergic central satiety dosing');
        pool = pool.map(act => {
          if (act.name.includes('Tyrosine')) {
            return { ...act, dose: 300, role: { es: 'Precursor de catecolaminas para saciedad central', en: 'Dopamine & catecholamine precursor for central satiety' } };
          }
          return act;
        });
      }

      // 4. Vitamin D (VDR) & Folate (MTHFR)
      if (vit.vitaminD === 'reduced_assimilation') {
        fineTuningNotes.push(isEs ? 'Asimilación reducida de Vitamina D (VDR): Dosis endocrina adaptada para leptina' : 'Reduced Vitamin D assimilation (VDR): Therapeutic endocrine support for leptin');
        const vitDIndex = pool.findIndex(a => a.name.includes('Vitamin D3'));
        if (vitDIndex > -1) {
          const [vitD] = pool.splice(vitDIndex, 1);
          pool.splice(2, 0, { ...vitD, dose: 25, role: { es: 'Cofactor endocrino de leptina y metabolismo basal', en: 'Leptin endocrine cofactor & basal metabolic rate' } });
        }
      }
    }

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
        badge: isGeneticallyTuned ? (isEs ? '🧬 24Genetics · Esencial' : '🧬 24Genetics · Core') : (isEs ? '🟢 Esencial Focalizada' : '🟢 Targeted Core'),
        badgeColor: isGeneticallyTuned ? '#0d9488' : '#16a34a',
        title: isEs ? `${selectedGoal.title.es} · Esencial` : `${selectedGoal.title.en} · Core`,
        desc: isGeneticallyTuned
          ? (isEs ? `Calibrada según perfil de ADN (${geneticData.patientName} #${geneticData.sampleCode}). Dosis esenciales ajustadas.` : `Calibrated for DNA profile (${geneticData.patientName} #${geneticData.sampleCode}). Targeted adjusted doses.`)
          : (isEs ? 'Formulación compacta de alta tolerancia. Dosis esenciales seleccionadas para máxima adherencia en 1 toma diaria.' : 'High-compliance targeted formula. Essential daily doses engineered for maximum convenience.'),
        actives: coreActives,
        totalLoad: coreLoad,
        galenics: coreGalenics,
        isSplit: false,
        capsPerBottle: 60,
        highlight: isGeneticallyTuned ? (isEs ? '🧬 Ajuste Fino ADN' : '🧬 DNA Fine-Tuned') : (isEs ? '1–2 cápsulas al día' : '1–2 caps per day'),
        geneticProfile: geneticData,
        fineTuningNotes
      },
      {
        id: 'prop-synergy',
        badge: isGeneticallyTuned ? (isEs ? '🧬 24Genetics · Sinergia Pro' : '🧬 24Genetics · Synergy Pro') : (isEs ? '⭐ Stack Clínico Avanzado' : '⭐ Advanced Synergy Stack'),
        badgeColor: isGeneticallyTuned ? '#0284c7' : '#7c3aed',
        title: isEs ? `${selectedGoal.title.es} · Sinergia Pro` : `${selectedGoal.title.en} · Synergy Pro`,
        desc: isGeneticallyTuned
          ? (isEs ? `Cobertura integral con cofactores genéticos para optimizar dieta ${geneticData.dietAndWeight?.effectiveDietType?.toUpperCase()}.` : `Comprehensive coverage with genetic cofactors to optimize ${geneticData.dietAndWeight?.effectiveDietType?.toUpperCase()} diet response.`)
          : (isEs ? 'Fórmula integral de máxima biodisponibilidad. Incorpora cofactores y activadores celulares para una respuesta terapéutica amplificada.' : 'Comprehensive formula with enhanced bioavailability. Combines primary actives with cellular cofactors for maximum impact.'),
        actives: synergyActives,
        totalLoad: synergyLoad,
        galenics: synergyGalenics,
        isSplit: false,
        capsPerBottle: 90,
        highlight: isGeneticallyTuned ? (isEs ? '🧬 Máxima respuesta metabólica' : '🧬 Maximum metabolic response') : (isEs ? 'Máxima cobertura biológica' : 'Maximum biological coverage'),
        geneticProfile: geneticData,
        fineTuningNotes
      },
      {
        id: 'prop-biphasic',
        badge: isGeneticallyTuned ? (isEs ? '🧬 24Genetics · Ciclo 24h' : '🧬 24Genetics · 24h Cycle') : (isEs ? '🌗 Protocolo Cronobiológico Día/Noche' : '🌗 Day/Night Biphasic Protocol'),
        badgeColor: isGeneticallyTuned ? '#7c3aed' : '#0284c7',
        title: isEs ? `${selectedGoal.title.es} · Ciclo Circadiano` : `${selectedGoal.title.en} · Circadian Cycle`,
        desc: isEs
          ? 'Sincronización con el ritmo biológico humano: estimulación y ATP por la mañana, junto a desactivación del estrés y detoxificación nocturna.'
          : 'Aligned with human circadian biology: morning ATP and vitality coupled with evening nervous system recovery.',
        actives: biphasicActives,
        totalLoad: biphasicLoad,
        galenics: biphasicGalenics,
        isSplit: true,
        capsPerBottle: 120,
        highlight: isEs ? 'Soporte circadiano 24h' : '24h circadian support',
        geneticProfile: geneticData,
        fineTuningNotes
      }
    ];
  }, [selectedGoal, selectedGoalId, routineVolume, catalog, lang, isEs, geneticData]);

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

              {/* Optional 24Genetics DNA Report Ingestion for Weight Loss */}
              {selectedGoalId === 'weight_loss' && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px 20px',
                  background: '#f8fafc',
                  border: '1.5px dashed #0284c7',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Dna size={18} color="#0284c7" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {isEs ? 'Calibración Nutrigenómica 24Genetics (Opcional)' : '24Genetics Nutrigenomic Calibration (Optional)'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 650, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                      {isEs ? 'Ajuste Fino por ADN' : 'DNA Fine-Tuning'}
                    </span>
                  </div>

                  {!geneticData ? (
                    <div>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                        {isEs
                          ? 'Si el paciente dispone de un informe de 24Genetics Nutrition, súbelo aquí (PDF) para calibrar automáticamente las dosis según su sensibilidad a carbohidratos, metabolismo de cafeína y déficit de asimilación.'
                          : 'If the patient has a 24Genetics Nutrition DNA report, upload it here (PDF) to automatically calibrate dosages for carb sensitivity, caffeine metabolism and vitamin assimilation.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingGenetics}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 650,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: isUploadingGenetics ? 'wait' : 'pointer'
                          }}
                        >
                          <Upload size={14} />
                          <span>{isUploadingGenetics ? (isEs ? 'Analizando ADN con IA...' : 'Analyzing DNA with AI...') : (isEs ? 'Subir Reporte 24Genetics (PDF)' : 'Upload 24Genetics Report (PDF)')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleLoadSample24Genetics}
                          disabled={isUploadingGenetics}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#ffffff',
                            color: '#0284c7',
                            fontSize: '0.78rem',
                            fontWeight: 650,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            cursor: isUploadingGenetics ? 'wait' : 'pointer'
                          }}
                        >
                          <Sparkles size={14} color="#0284c7" />
                          <span>{isEs ? 'Cargar Muestra 24Genetics (Hossam · G000943554)' : 'Load Sample 24Genetics (Hossam · G000943554)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsConsentModalOpen(true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#f8fafc',
                            color: '#003666',
                            fontSize: '0.78rem',
                            fontWeight: 650,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <FileText size={14} color="#003666" />
                          <span>{isEs ? 'Consentimiento Genético v5.0' : 'Genetic Consent v5.0'}</span>
                        </button>
                      </div>
                      {uploadError && (
                        <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#dc2626' }}>
                          {uploadError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} color="#16a34a" />
                          <strong style={{ fontSize: '0.82rem', color: '#166534' }}>
                            {isEs ? `Reporte 24Genetics Activo: ${geneticData.patientName} (${geneticData.sampleCode})` : `Active 24Genetics Report: ${geneticData.patientName} (${geneticData.sampleCode})`}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGeneticData(null)}
                          style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {isEs ? 'Quitar' : 'Remove'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.70rem', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                          {isEs ? `Dieta más efectiva: ${geneticData.dietAndWeight?.effectiveDietType?.toUpperCase()}` : `Best diet: ${geneticData.dietAndWeight?.effectiveDietType?.toUpperCase()}`}
                        </span>
                        <span style={{ fontSize: '0.70rem', background: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                          {isEs ? `Sensibilidad Carbohidratos: ${geneticData.dietAndWeight?.carbSensitivity?.toUpperCase()}` : `Carb sensitivity: ${geneticData.dietAndWeight?.carbSensitivity?.toUpperCase()}`}
                        </span>
                        <span style={{ fontSize: '0.70rem', background: '#fffbeb', color: '#92400e', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                          {isEs ? `Metabolismo Cafeína: ${geneticData.metabolism?.caffeineMetabolism?.toUpperCase()}` : `Caffeine: ${geneticData.metabolism?.caffeineMetabolism?.toUpperCase()}`}
                        </span>
                        <span style={{ fontSize: '0.70rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                          {isEs ? 'Vitamina D (VDR): Asimilación reducida' : 'Vitamin D (VDR): Reduced'}
                        </span>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setIsConsentModalOpen(true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 11px',
                            background: '#f8fafc',
                            color: '#003666',
                            fontSize: '0.74rem',
                            fontWeight: 650,
                            borderRadius: '5px',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <FileText size={13} color="#003666" />
                          <span>{isEs ? 'Ver / Firmar Consentimiento v5.0 (Atlas · Eterna)' : 'View / Sign Consent v5.0 (Atlas · Eterna)'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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

              {/* Active Genetic Fine-Tuning Banner */}
              {geneticData && selectedGoalId === 'weight_loss' && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Dna size={16} color="#16a34a" />
                    <strong style={{ fontSize: '0.82rem', color: '#166534' }}>
                      {isEs ? `Ajuste Fino Nutrigenómico 24Genetics Aplicado (${geneticData.patientName} · #${geneticData.sampleCode})` : `24Genetics Nutrigenomic Fine-Tuning Active (${geneticData.patientName} · #${geneticData.sampleCode})`}
                    </strong>
                  </div>
                  <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.74rem', color: '#166534', lineHeight: 1.5 }}>
                    {proposals[0]?.fineTuningNotes?.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

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
                            capsPerBottle: prop.capsPerBottle,
                            geneticProfile: prop.geneticProfile,
                            fineTuningNotes: prop.fineTuningNotes
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

      {/* ── Patient Genetic Informed Consent Modal v5.0 (Atlas / Eterna) ── */}
      <PatientGeneticConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        initialPatient={{
          fullName: geneticData?.patientName || '',
          patientId: geneticData?.sampleCode || ''
        }}
        initialTests={['24genetics_nutrigen', 'eterna_proage']}
        lang={lang}
      />
    </div>
  );
}
