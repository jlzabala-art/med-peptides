"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Droplets, 
  Thermometer, 
  FileText, 
  Check, 
  Building2, 
  Award,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  FlaskConical,
  ExternalLink,
  Sun,
  Moon,
  AlertTriangle,
  Bot,
  Syringe
} from '@/lib/icons';
import './DiagnosticTestTechnicalSpecs.css';

/**
 * DiagnosticTestTechnicalSpecs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Clinical Monograph Component for Diagnostic Kits (Bloodo DBS).
 * Replaces the injectable peptide reconstitution and U-100 syringe calculator
 * with clinical dried blood spot (DBS) methodology, enzymatic/chromatographic
 * assay specifications, interactive biomarker reference range simulator, and
 * illustrated 3-step at-home collection protocol.
 */
export default function DiagnosticTestTechnicalSpecs({ 
  product, 
  selectedDose = '1 test / kit', 
  supplierName = 'Bloodo UAB', 
  lang = 'en' 
}) {
  const isEs = lang === 'es';
  const slug = (product?.slug || product?.id || '').toLowerCase();
  
  // Identify specific Bloodo test type
  const isNad = slug.includes('nad');
  const isHba1c = slug.includes('hba1c') || slug.includes('hemoglobin');
  const isOmega = slug.includes('omega');
  const isVitD = slug.includes('vitamin-d') || slug.includes('vit-d');
  const isCortisol = slug.includes('cortisol');
  const isTestosterone = slug.includes('testosterone');

  // Interactive biomarker level simulator state
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(2); // Default to optimal/target

  // Biomarker ranges configuration
  const biomarkerData = (() => {
    if (isNad) {
      return {
        name: isEs ? 'NAD Total Intracelular (NAD⁺ + NADH)' : 'Total Intracellular NAD (NAD+ & NADH)',
        unit: 'µmol/L',
        method: isEs ? 'Ensayo Enzimático Cíclico (Espectrofotometría)' : 'Enzymatic Cyclic Assay (Colorimetric/Spectrophotometric)',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '0.23 µmol/L',
        range: '5.0 – 60.0 µmol/L',
        precision: 'RSD 6.6%',
        ranges: [
          {
            label: isEs ? 'Depleción Severa' : 'Severe Depletion',
            value: '< 20 µmol/L',
            status: 'critical',
            badge: isEs ? 'Riesgo Energético Alto' : 'High Energy Deficit',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs 
              ? 'Niveles críticamente bajos asociados a fatiga mitocondrial crónica, senescencia celular acelerada y capacidad de reparación de ADN disminuida (baja actividad de PARP1 y sirtuinas).'
              : 'Critically depressed levels correlated with chronic mitochondrial exhaustion, accelerated cellular senescence, and impaired DNA repair (reduced sirtuin & PARP1 activity).',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=severe&nad_level=18&tier=critical&modality=intravenous&retest=4w',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Estrategia de Rescate Parenteral IV' 
                : 'Master NAD+ Protocol: Parenteral IV Rescue Pathway',
              tierTitle: isEs ? 'TIER 1 · RESCATE MITOCONDRIAL PARENTERAL' : 'TIER 1 · PARENTERAL MITOCHONDRIAL RESCUE',
              targetGoal: isEs ? 'Elevar NAD⁺ intracelular a ≥ 35 µmol/L' : 'Escalate intracellular NAD+ to ≥ 35 µmol/L',
              recommendedModality: isEs ? 'Infusión Intravenosa (IV) Clínica Parenteral' : 'Clinical IV Infusion (Parenteral Loading)',
              dosageGuide: isEs ? '250 mg IV lento (goteo ≥ 120 min) semanal x 4 semanas, escalando a 500 mg' : '250 mg slow IV (≥ 120 min) weekly x 4 weeks, titrating to 500 mg',
              methylationRx: isEs ? 'TMG 1.000 mg diario + Complejo B metilado (Obligatorio frente a consumo NNMT)' : 'TMG 1,000 mg daily + Methyl-B Complex (Mandatory vs NNMT consumption)',
              retestWindow: isEs ? 'Semana 4 (Evaluación en tratamiento activo)' : 'Week 4 (On-treatment evaluation)',
              cellularTarget: isEs ? 'Mitocondria, sirtuinas SIRT1/3, homeostasis de ATP' : 'Mitochondria, SIRT1/SIRT3, ATP homeostasis',
              clinicalRationale: isEs
                ? 'Déficit mitocondrial severo con saturación de PARP1 y desregulación de sirtuinas. Requiere rescate parenteral intravenoso con titulación lenta para evitar vasoconstricción/sofoco purinérgico, complementado con altas dosis de donantes de metilo (TMG) para salvaguardar la reserva de SAMe frente a la excreción por NNMT.'
                : 'Severe mitochondrial deficit and PARP1 saturation. Requires intravenous parenteral rescue with slow titration to avoid purinergic flushing, coupled with high-dose methyl donor support (TMG) to protect hepatic SAMe pools from NNMT-mediated clearance.',
              synergies: [
                { name: 'NAD+ IV 250-500mg', role: isEs ? 'Vía Parenteral' : 'Parenteral Route' },
                { name: 'TMG (Betaína) 1000mg', role: isEs ? 'Protector de Metilación' : 'Methyl Safeguard' },
                { name: 'SS-31 (Elamipretide)', role: isEs ? 'Protección Cardiolipina' : 'Cardiolipin Shield' },
                { name: 'B-Complex Metilado', role: isEs ? 'Reciclaje Homocisteína' : 'Homocysteine Clearance' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el algoritmo clínico de infusión IV de NAD+ y cofactores de metilación cuando el nivel es inferior a 20 µmol/L?'
                : 'What is the recommended clinical NAD+ IV infusion and methylation cofactor protocol when levels are below 20 µmol/L?'
            }
          },
          {
            label: isEs ? 'Rango Moderado / Subóptimo' : 'Suboptimal / Moderate',
            value: '20 – 30 µmol/L',
            status: 'warning',
            badge: isEs ? 'Margen de Optimización' : 'Room for Optimization',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Nivel medio poblacional en adultos mayores de 40 años. Pérdida típica del 40-50% respecto a la juventud. Recomendada optimización con precursores (NMN/NR/NAD+ IV) y ejercicio.'
              : 'Standard adult population median (>40 yrs). Typical 40-50% decline from peak youthful levels. High clinical utility for supplementation (NMN/NR/NAD+ therapy) and exercise.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=suboptimal&nad_level=25&tier=warning&modality=subcutaneous&retest=8w',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Titulación Subcutánea y Precursores' 
                : 'Master NAD+ Protocol: Subcutaneous & Precursor Titration',
              tierTitle: isEs ? 'TIER 2 · OPTIMIZACIÓN SUBCUTÁNEA & BIOENERGÉTICA' : 'TIER 2 · SUBCUTANEOUS & BIOENERGETIC OPTIMIZATION',
              targetGoal: isEs ? 'Optimizar al rango diana de 35 – 50 µmol/L' : 'Optimize to clinical target range 35 – 50 µmol/L',
              recommendedModality: isEs ? 'Microdosificación Subcutánea (SC) o NMN Oral' : 'Subcutaneous Micro-Dosing (SC) or Oral NMN',
              dosageGuide: isEs ? '50 – 100 mg SC 2–3 veces por semana o NMN 500–1.000 mg oral matutino' : '50 – 100 mg SC 2–3x/wk or oral NMN 500–1,000 mg morning',
              methylationRx: isEs ? 'TMG 500 mg diario con la primera comida matutina' : 'TMG 500 mg daily with first morning meal',
              retestWindow: isEs ? 'Semana 8 (Evaluación de respuesta biológica)' : 'Week 8 (Biological response evaluation)',
              cellularTarget: isEs ? 'Fosforilación oxidativa, biogénesis mitocondrial, AMPK' : 'Oxidative phosphorylation, mitochondrial biogenesis, AMPK',
              clinicalRationale: isEs
                ? 'Declive fisiológico asociado a la edad con mayor consumo basal por CD38. Indicación prioritaria para titulación domiciliaria subcutánea o precursores orales de alta pureza, con apoyo circadiano matutino y protección moderada de donantes de metilo.'
                : 'Age-associated physiological decline with heightened CD38 enzymatic consumption. High clinical indication for at-home subcutaneous titration or high-purity oral precursors, with morning circadian timing and moderate methyl donor co-administration.',
              synergies: [
                { name: 'NAD+ SubQ 50-100mg', role: isEs ? 'Microdosis Domicilio' : 'At-Home Micro-dose' },
                { name: 'NMN Oral 500mg', role: isEs ? 'Precursor Fisiológico' : 'Oral Precursor' },
                { name: 'TMG 500mg', role: isEs ? 'Soporte SAMe' : 'SAMe Buffer' },
                { name: 'Apigenina / Quercetina', role: isEs ? 'Inhibidor CD38' : 'CD38 Sinks Inhibitor' }
              ],
              aiQuery: isEs
                ? '¿Qué pauta de dosificación subcutánea de NAD+ y TMG se aconseja para niveles en rango subóptimo de 20 a 30 µmol/L?'
                : 'What is the recommended SubQ NAD+ and TMG dosing schedule for suboptimal NAD+ levels between 20 and 30 µmol/L?'
            }
          },
          {
            label: isEs ? 'Rango Óptimo de Longevidad' : 'Optimal Longevity Range',
            value: '30 – 50 µmol/L',
            status: 'optimal',
            badge: isEs ? 'Objetivo Terapéutico' : 'Target Clinical Range',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Nivel celular óptimo asociado a máxima activación de SIRT1 y SIRT3, biogénesis mitocondrial eficiente, alta capacidad física y recuperación celular sostenida.'
              : 'Ideal therapeutic baseline reflecting youthful cellular bioenergetics, peak SIRT1/SIRT3 sirtuin activation, efficient ATP synthesis, and resilient DNA integrity.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=optimal&nad_level=40&tier=optimal&modality=subcutaneous&retest=6m',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Mantenimiento Celular y Longevidad' 
                : 'Master NAD+ Protocol: Circadian Longevity Maintenance',
              tierTitle: isEs ? 'TIER 3 · VIGILANCIA Y MANTENIMIENTO HOMEOSTÁTICO' : 'TIER 3 · SURVEILLANCE & HOMEOSTATIC MAINTENANCE',
              targetGoal: isEs ? 'Sostener homeostasis fisiológica en 30 – 50 µmol/L' : 'Sustain steady-state homeostasis at 30 – 50 µmol/L',
              recommendedModality: isEs ? 'Mantenimiento Domiciliario SubQ / Oral Circadiano' : 'At-Home SubQ / Oral Circadian Maintenance',
              dosageGuide: isEs ? '50 mg SC semanal o ciclos de NMN 250–500 mg en días alternos' : '50 mg SC weekly or alternating-day oral NMN 250–500 mg',
              methylationRx: isEs ? 'TMG 500 mg en días de administración o aporte dietético de colina' : 'TMG 500 mg on administration days or dietary choline',
              retestWindow: isEs ? '6 Meses (Vigilancia semestral DBS)' : '6 Months (Biannual DBS Surveillance)',
              cellularTarget: isEs ? 'Ritmos circadianos de NAMPT, SIRT1 nuclear, integridad de cromatina' : 'Circadian NAMPT oscillations, nuclear SIRT1, chromatin integrity',
              clinicalRationale: isEs
                ? 'Valores en el rango óptimo juvenil de longevidad celular. Se recomienda estrategia de micro-pulsos de mantenimiento sincronizados con el ritmo circadiano matutino (07:00–12:00) para preservar resiliencia biológica sin sobrecargar la maquinaria celular.'
                : 'Optimal youthful longevity baseline. Maintenance micro-pulsing synchronized with circadian morning oscillations (07:00–12:00) is indicated to preserve cellular resilience against age stressors without saturating enzymatic pathways.',
              synergies: [
                { name: 'NAD+ SubQ 50mg', role: isEs ? 'Pulso Semanal' : 'Weekly Pulse' },
                { name: 'NMN 250mg', role: isEs ? 'Ciclado Intermitente' : 'Intermittent Cycling' },
                { name: 'Epithalon', role: isEs ? 'Biorregulación Circadiana' : 'Circadian Bioregulation' },
                { name: 'Espermidina', role: isEs ? 'Autofagia Mitocondrial' : 'Mitophagy Inducer' }
              ],
              aiQuery: isEs
                ? '¿Cómo estructurar un protocolo de mantenimiento circadiano cuando los niveles de NAD+ ya están en rango óptimo de 30 a 50 µmol/L?'
                : 'How to structure a circadian maintenance protocol when intracellular NAD+ is already in the optimal 30-50 µmol/L range?'
            }
          },
          {
            label: isEs ? 'Nivel Máximo Estimulado' : 'Peak Stimulated / Supra-optimal',
            value: '> 50 µmol/L',
            status: 'super',
            badge: isEs ? 'Pico Pos-Tratamiento' : 'Post-Intervention Peak',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: isEs
              ? 'Valores alcanzados habitualmente tras protocolos activos de infusión intravenosa de NAD+, suplementación de alta dosis con activadores de sirtuinas o protocolos regenerativos.'
              : 'Levels achieved following intensive clinical NAD+ IV therapy, high-dose precursor administration, and caloric restriction/longevity protocols.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=peak&nad_level=55&tier=super&modality=cycling&retest=12w',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Fase de Consolidación y Descanso' 
                : 'Master NAD+ Protocol: Plateau Consolidation & Washout',
              tierTitle: isEs ? 'TIER 4 · TITULACIÓN CLÍNICA Y CONTROL DE METILACIÓN' : 'TIER 4 · CLINICAL TITRATION & METHYL RESILIENCY',
              targetGoal: isEs ? 'Consolidar y monitorizar balance de excreción de metilos' : 'Consolidate and monitor methyl excretion equilibrium',
              recommendedModality: isEs ? 'Ciclado de Precursores (Cycling / Washout de 2–4 Semanas)' : 'Precursor Cycling & Washout Window (2–4 Weeks)',
              dosageGuide: isEs ? 'Pausa temporal de aportes exógenos; evaluar meseta y respuesta celular basal' : 'Temporary pause of exogenous precursors; evaluate plateau retention',
              methylationRx: isEs ? 'Monitorización de homocisteína sérica (objetivo < 8.0 µmol/L) y soporte hepático' : 'Serum homocysteine monitoring (target < 8.0 µmol/L) & hepatic support',
              retestWindow: isEs ? '12 Semanas (Monitoreo post-lavado para evaluar meseta)' : '12 Weeks (Post-washout evaluation)',
              cellularTarget: isEs ? 'Balance de donantes de metilo (SAMe), excreción de MeNAM' : 'Methyl donor pool (SAMe), MeNAM urinary excretion',
              clinicalRationale: isEs
                ? 'Nivel elevado característico de infusiones recientes o megadosis de precursores. Requiere verificar que la excreción de metabolitos metilados (MeNAM) no agote la reserva de donantes de metilo (SAMe / colina) y aplicar una ventana de ciclado/descanso para preservar la síntesis endógena de NAMPT.'
                : 'Supra-physiological level typical of active high-dose therapy or recent IV infusions. Clinical oversight warrants checking that clearance of methylated metabolites (MeNAM) preserves the hepatic methyl donor pool and applying cycling windows to maintain endogenous NAMPT expression.',
              synergies: [
                { name: 'TMG (Betaína)', role: isEs ? 'Soporte de Metilación' : 'Methylation Safeguard' },
                { name: 'Vitamina B12 / Folato', role: isEs ? 'Ciclo de Metionina' : 'Methionine Resynthesis' },
                { name: 'Monitoreo DBS', role: isEs ? 'Control de Meseta' : 'Plateau Verification' },
                { name: 'Cycling / Washout', role: isEs ? 'Pausa Terapéutica' : 'Washout Window' }
              ],
              aiQuery: isEs
                ? '¿Qué precauciones sobre metilación y donantes de metilo (TMG) deben tomarse con niveles de NAD+ superiores a 50 µmol/L?'
                : 'What methyl donor safeguards (TMG) should be observed when intracellular NAD+ exceeds 50 µmol/L?'
            }
          }
        ]
      };
    }

    if (isHba1c) {
      return {
        name: isEs ? 'Hemoglobina Glicosilada (HbA1c)' : 'Glycated Hemoglobin (HbA1c)',
        unit: '% / mmol/mol',
        method: isEs ? 'Cromatografía de Afinidad por Boronato / HPLC Certificada NGSP' : 'Boronate Affinity Chromatography / NGSP-Certified DBS Immunoassay',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '3.5% (15 mmol/mol)',
        range: '4.0% – 15.0%',
        precision: 'RSD < 3.2%',
        ranges: [
          {
            label: isEs ? 'Metabolismo Óptimo' : 'Optimal Metabolic Health',
            value: '< 5.4%',
            status: 'optimal',
            badge: isEs ? 'Excelente' : 'Optimal',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Excelente sensibilidad a la insulina y control glucémico estable a lo largo de los últimos 90 días. Bajo riesgo cardiovascular y de glicación tisular.'
              : 'Optimal insulin sensitivity and stable 90-day glycemic tone. Minimal systemic advanced glycation end-products (AGEs).'
          },
          {
            label: isEs ? 'Rango Normal' : 'Standard Normal',
            value: '5.4% – 5.6%',
            status: 'optimal',
            badge: isEs ? 'Normal' : 'Normal',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            description: isEs
              ? 'Parámetro glucémico dentro de límites convencionales según criterios clínicos internacionales (ADA / OMS).'
              : 'Conventional normoglycemic range compliant with international endocrinology guidelines (ADA / WHO).'
          },
          {
            label: isEs ? 'Prediabetes / Resistencia Insulínica' : 'Prediabetes / Insulin Resistance',
            value: '5.7% – 6.4%',
            status: 'warning',
            badge: isEs ? 'Alerta Metabólica' : 'Metabolic Alert',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Indica resistencia a la insulina y variabilidad glucémica crónica. Momento clave para intervención preventiva mediante péptidos GLP-1/GIP o cambios metabólicos.'
              : 'Signals progressive insulin resistance and chronic glycemic spikes. High-yield window for therapeutic metabolic optimization and GLP-1/GIP therapies.'
          },
          {
            label: isEs ? 'Glucemia Elevada' : 'Elevated / Diabetic Range',
            value: '≥ 6.5%',
            status: 'critical',
            badge: isEs ? 'Atención Clínica' : 'Clinical Action Required',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Criterio diagnóstico de diabetes mellitus. Requiere seguimiento médico, ajuste farmacológico y monitorización continua.'
              : 'Diagnostic threshold for diabetes mellitus. Demands clinical supervision, lifestyle intervention, and physician follow-up.'
          }
        ]
      };
    }

    if (isOmega) {
      return {
        name: isEs ? 'Índice Omega-3 y Ratio Omega-6/3' : 'Omega-3 Index & Omega-6/3 Ratio',
        unit: '% membranas eritrocitarias',
        method: isEs ? 'Cromatografía de Gases con Espectrometría (GC-MS / FID)' : 'Gas Chromatography Flame Ionization Detection (GC-FID / GC-MS)',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '0.05% total FA',
        range: '24 Ácidos Grasos (0.1% – 50%)',
        precision: 'RSD < 4.5%',
        ranges: [
          {
            label: isEs ? 'Alto Riesgo Inflamatorio' : 'High Inflammatory Risk',
            value: '< 4% Index | Ratio > 15:1',
            status: 'critical',
            badge: isEs ? 'Inflamación Alta' : 'Pro-inflammatory',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Severo desbalance inflamatorio celular con rigidez de membrana y baja protección cardiovascular.'
              : 'Severe cellular fatty acid imbalance, high eicosanoid inflammation, and elevated cardiovascular risk profile.'
          },
          {
            label: isEs ? 'Rango Moderado' : 'Moderate Protection',
            value: '4% – 8% Index | Ratio 5:1 – 15:1',
            status: 'warning',
            badge: isEs ? 'Mejorable' : 'Intermediate',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Nivel promedio occidental. Protección cardiovascular parcial; se beneficia de suplementación con EPA/DHA de alta biodisponibilidad.'
              : 'Typical Western baseline. Intermediate cardiovascular protection; highly responsive to high-purity EPA/DHA titration.'
          },
          {
            label: isEs ? 'Rango Óptimo de Protección' : 'Cardioprotective Zone',
            value: '> 8% Index | Ratio < 4:1',
            status: 'optimal',
            badge: isEs ? 'Cardioprotegido' : 'Cardioprotective',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Máxima protección cardiovascular, fluidez de membrana celular óptima y resolución activa de procesos inflamatorios.'
              : 'Target longevity zone associated with lowest all-cause cardiovascular mortality and maximal anti-inflammatory resolution.'
          }
        ]
      };
    }

    if (isCortisol) {
      return {
        name: isEs ? 'Cortisol Libre y Total (Línea Basal Matutina)' : 'Free & Total Cortisol (Morning Basal Awakening)',
        unit: 'nmol/L (µg/dL)',
        method: isEs ? 'Inmunoensayo por Electroquimioluminiscencia (ECLIA) / LC-MS' : 'Electrochemiluminescence Immunoassay (ECLIA) / LC-MS',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '1.5 nmol/L (0.05 µg/dL)',
        range: '5.0 – 1750.0 nmol/L',
        precision: 'RSD < 5.2%',
        ranges: [
          {
            label: isEs ? 'Agotamiento Adrenal / Hipocortisolemia' : 'Adrenal Burnout / Hypocortisolemia',
            value: '< 140 nmol/L (< 5.0 µg/dL)',
            status: 'critical',
            badge: isEs ? 'Alerta Agotamiento' : 'Adrenal Exhaustion',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Nivel matutino severamente deprimido compatible con fatiga suprarrenal avanzada, síndrome de burnout crónico, hipotensión e incapacidad de respuesta ante el estrés.'
              : 'Critically depressed morning awakening level indicative of severe HPA axis exhaustion, chronic burnout syndrome, orthostatic hypotension, and impaired stress resilience.'
          },
          {
            label: isEs ? 'Línea Basal Equilibrada' : 'Balanced Circadian Baseline',
            value: '140 – 550 nmol/L (5.0 – 20.0 µg/dL)',
            status: 'optimal',
            badge: isEs ? 'Ritmo Óptimo' : 'Optimal CAR',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Respuesta de despertar de cortisol (CAR) saludable. Indica una función óptima del eje hipotálamo-hipofisario-adrenal (HPA), vigilia matutina vigorosa y modulación inmunitaria armónica.'
              : 'Healthy cortisol awakening response (CAR). Reflects balanced hypothalamic-pituitary-adrenal (HPA) axis dynamics, robust morning alertness, and balanced diurnal rhythm.'
          },
          {
            label: isEs ? 'Carga Alostática Elevada' : 'Subclinical Allostatic Stress',
            value: '551 – 690 nmol/L (20.1 – 25.0 µg/dL)',
            status: 'warning',
            badge: isEs ? 'Estrés Crónico' : 'Elevated Stress',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Activación persistente del sistema nervioso simpático. Suele asociarse a estrés ocupacional, fragmentación del sueño, resistencia a la insulina incipiente y tensión arterial límite.'
              : 'Persistent sympathetic nervous drive. Associated with chronic allostatic load, sleep architecture disruption, early insulin resistance, and elevated cardiovascular strain.'
          },
          {
            label: isEs ? 'Hipercortisolemia Aguda' : 'Hypercortisolemia / Acute Stress',
            value: '> 690 nmol/L (> 25.0 µg/dL)',
            status: 'critical',
            badge: isEs ? 'Catabolismo Alto' : 'Severe Catabolic State',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Exceso glucocorticoide crónico que promueve degradación muscular acelerada (catabolismo proteico), acumulación de grasa visceral, inmunosupresión y disfunción neurocognitiva.'
              : 'Marked glucocorticoid excess driving muscle catabolism, visceral adiposity, immune suppression, and hippocampal neurotoxicity. Demands clinical intervention.'
          }
        ]
      };
    }

    if (isTestosterone) {
      return {
        name: isEs ? 'Testosterona Total y Biodisponible' : 'Total & Bioavailable Testosterone',
        unit: 'nmol/L (ng/dL)',
        method: isEs ? 'Espectrometría de Masas en Tándem LC-MS/MS Certificada CDC' : 'CDC-Standardized LC-MS/MS Tandem Mass Spectrometry',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '0.1 nmol/L (2.8 ng/dL)',
        range: '0.2 – 55.0 nmol/L (5.7 – 1580 ng/dL)',
        precision: 'RSD < 4.9%',
        ranges: [
          {
            label: isEs ? 'Deficiencia / Hipogonadismo' : 'Hypogonadism / Androgen Deficiency',
            value: '< 10.0 nmol/L (< 288 ng/dL)',
            status: 'critical',
            badge: isEs ? 'Déficit Androgénico' : 'Clinically Deficient',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Concentración críticamente disminuida asociada a sarcopenia acelerada, baja densidad mineral ósea, depresión anímica, disfunción eréctil y pérdida de impulso metabólico.'
              : 'Severe androgen deficiency correlated with accelerated sarcopenia, osteopenia, depressive mood, erectile dysfunction, and reduced metabolic clearance.'
          },
          {
            label: isEs ? 'Rango Límite / Subóptimo' : 'Borderline Suboptimal',
            value: '10.0 – 15.0 nmol/L (288 – 432 ng/dL)',
            status: 'warning',
            badge: isEs ? 'Margen Mejora' : 'Suboptimal Vitality',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Nivel androgénico limítrofe habitual en hombres con estrés crónico, obesidad visceral o síndrome metabólico. Se beneficia de secretagogos, optimización de estilo de vida o terapia hormonal.'
              : 'Suboptimal androgenic reserve typical in metabolic syndrome or chronic stress. Responds well to lifestyle interventions, enclomiphene, or restorative secretagogues.'
          },
          {
            label: isEs ? 'Rango Óptimo de Vitalidad' : 'Optimal Vitality & Longevity Target',
            value: '15.1 – 28.0 nmol/L (435 – 807 ng/dL)',
            status: 'optimal',
            badge: isEs ? 'Objetivo Óptimo' : 'Optimal Target',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Rango fisiológico óptimo asociado a composición corporal magra, vigor psicofísico, síntesis proteica muscular máxima y salud cardiovascular protectora.'
              : 'Ideal physiological target supporting lean body mass retention, optimal neurocognitive clarity, robust bone mineral density, and metabolic vigor.'
          },
          {
            label: isEs ? 'Límite Superior Normal' : 'Upper Physiological Normal',
            value: '28.1 – 35.0+ nmol/L (810 – 1000+ ng/dL)',
            status: 'super',
            badge: isEs ? 'Pico Androgénico' : 'Peak Performance',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: isEs
              ? 'Nivel alcanzado comúnmente en hombres jóvenes de alto rendimiento o en protocolos de optimización hormonal bajo supervisión médica especializada.'
              : 'Upper physiological threshold achieved in young athletic baselines or monitored hormone optimization programs. Maximum anabolic support.'
          }
        ]
      };
    }

    // Default: Vitamin D
    return {
      name: isEs ? '25-Hidroxivitamina D [25(OH)D Total]' : 'Total 25-Hydroxyvitamin D [25(OH)D]',
      unit: 'ng/mL (nmol/L)',
      method: isEs ? 'Espectrometría de Masas en Tándem LC-MS/MS' : 'Liquid Chromatography Tandem Mass Spectrometry (LC-MS/MS)',
      lab: 'LifeLab1 (Vilnius, Lithuania)',
      lod: '5.0 ng/mL',
      range: '10.0 – 150.0 ng/mL',
      precision: 'RSD < 5.0%',
      ranges: [
        {
          label: isEs ? 'Deficiencia Severa' : 'Deficiency',
          value: '< 20 ng/mL (< 50 nmol/L)',
          status: 'critical',
          badge: isEs ? 'Deficiente' : 'Deficient',
          color: '#dc2626',
          bgColor: '#fef2f2',
          description: isEs
            ? 'Deficiencia clínica asociada a desmineralización ósea, mayor susceptibilidad a infecciones respiratorias y disfunción inmune.'
            : 'Clinical deficiency linked to bone demineralization, compromised innate immunity, and systemic musculoskeletal weakness.'
        },
        {
          label: isEs ? 'Insuficiencia' : 'Insufficiency',
          value: '20 – 30 ng/mL (50 – 75 nmol/L)',
          status: 'warning',
          badge: isEs ? 'Subóptimo' : 'Insufficient',
          color: '#d97706',
          bgColor: '#fffbeb',
          description: isEs
            ? 'Nivel insuficiente para la optimización metabólica e inmunológica. Muy frecuente durante los meses de baja insolación.'
            : 'Suboptimal for endocrine regulation and cellular immunity. Common baseline in temperate latitudes requiring supplementation.'
        },
        {
          label: isEs ? 'Suficiencia Clínica' : 'Clinical Sufficiency',
          value: '30 – 50 ng/mL (75 – 125 nmol/L)',
          status: 'optimal',
          badge: isEs ? 'Suficiente' : 'Sufficient',
          color: '#16a34a',
          bgColor: '#f0fdf4',
          description: isEs
            ? 'Concentración adecuada para homeostasis de calcio y mantenimiento del sistema musculoesquelético.'
            : 'Standard therapeutic target for calcium homeostasis and baseline endocrine sufficiency.'
        },
        {
          label: isEs ? 'Rango Óptimo de Longevidad' : 'Optimal Longevity & Immune',
          value: '50 – 70 ng/mL (125 – 175 nmol/L)',
          status: 'optimal',
          badge: isEs ? 'Óptimo' : 'Optimal',
          color: '#0d9488',
          bgColor: '#f0fdfa',
          description: isEs
            ? 'Nivel óptimo recomendado en medicina funcional y longevidad para máxima resistencia inmunitaria y regulación genómica.'
            : 'Target functional range for enhanced antimicrobial peptide induction, immune regulation, and longevity optimization.'
        }
      ]
    };
  })();

  const activeRange = biomarkerData.ranges[selectedRangeIndex] || biomarkerData.ranges[0];

  return (
    <div className="dts-wrapper">
      {/* ── SECTION HEADER ── */}
      <div className="pds-section-header">
        <div className="pds-section-header-left">
          <div className="pds-section-header-shield" style={{ background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488' }}>
            <Activity size={22} />
          </div>
          <div className="pds-section-header-titles">
            <div className="pds-section-header-meta-row">
              <span className="pds-section-header-category">
                {isEs ? 'ESPECIFICACIONES ANALÍTICAS & BIOMARCADORES' : 'ANALYTICAL SPECIFICATIONS & BIOMARKERS'}
              </span>
              <span className="pds-section-badge" style={{ background: '#f0fdfa', color: '#0d9488', borderColor: '#ccfbf1' }}>
                <CheckCircle2 size={11} /> {isEs ? 'MÉTODO CERTIFICADO DBS' : 'CERTIFIED DBS METHOD'}
              </span>
            </div>
            <h3 className="pds-section-header-title">
              {isEs 
                ? 'Monografía Analítica y Cuantificación de Biomarcadores' 
                : 'Analytical Monograph & Biomarker Quantification Protocol'}
            </h3>
          </div>
        </div>

        <div className="pds-section-header-right">
          <div className="pds-section-cert-badge" style={{ borderColor: '#0d9488' }}>
            <Award size={14} color="#0d9488" />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>CE-IVDR (EU 2017/746)</span>
          </div>
        </div>
      </div>

      <div className="dts-body">
        {/* ── 1. ANALYTICAL METRICS GRID ── */}
        <div id="diagnostic-specs" className="dts-metrics-grid">
          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Método Analítico' : 'Analytical Method'}</span>
            <strong className="dts-metric-value">{biomarkerData.method}</strong>
            <span className="dts-metric-sub">{isEs ? 'Alta especificidad cuantitativa' : 'High quantitative specificity'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Tipo de Muestra' : 'Sample Format'}</span>
            <strong className="dts-metric-value">Dried Blood Spot (DBS)</strong>
            <span className="dts-metric-sub">{isEs ? 'Punción capilar en dedo (2–3 gotas)' : 'Finger-prick capillary blood (2–3 drops)'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Precisión / Repetibilidad' : 'Analytical Precision'}</span>
            <strong className="dts-metric-value">{biomarkerData.precision}</strong>
            <span className="dts-metric-sub">{isEs ? 'Coeficiente de variación validado' : 'Validated coefficient of variation'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Límite de Detección & Rango' : 'Sensitivity & Range'}</span>
            <strong className="dts-metric-value">{biomarkerData.range}</strong>
            <span className="dts-metric-sub">LoD: {biomarkerData.lod}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Estabilidad de Muestra' : 'Sample Stability'}</span>
            <strong className="dts-metric-value">15 – 25 °C (Ambiente)</strong>
            <span className="dts-metric-sub">{isEs ? 'Bolsa desecante hermética (sin frío)' : 'Hermetic desiccant pack (no cold chain)'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Laboratorio Analítico' : 'Testing Laboratory'}</span>
            <strong className="dts-metric-value">LifeLab1 (Vilnius, EU)</strong>
            <span className="dts-metric-sub">{isEs ? 'Alineado con norma ISO 15189' : 'ISO 15189 standard alignment'}</span>
          </div>
        </div>

        {/* ── 2. INTERACTIVE BIOMARKER CLINICAL RANGE SIMULATOR ── */}
        <div id="biomarker-simulator" className="dts-simulator-card">
          <div className="dts-simulator-header">
            <div>
              <span className="dts-simulator-kicker">
                {isEs ? 'SIMULADOR CLÍNICO DE REFERENCIA' : 'CLINICAL REFERENCE SIMULATOR'}
              </span>
              <h4 className="dts-simulator-title">
                {biomarkerData.name} ({biomarkerData.unit})
              </h4>
            </div>
            <span className="dts-interactive-hint">
              <Sparkles size={13} /> {isEs ? 'Haz clic en un rango para explorar' : 'Click a tier to inspect clinical impact'}
            </span>
          </div>

          {/* Range selection buttons */}
          <div className="dts-range-selector">
            {biomarkerData.ranges.map((rng, idx) => {
              const isSelected = selectedRangeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedRangeIndex(idx)}
                  className={`dts-range-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    borderColor: isSelected ? rng.color : '#e2e8f0',
                    backgroundColor: isSelected ? rng.bgColor : '#ffffff',
                    color: isSelected ? rng.color : 'var(--text-main, #1e293b)'
                  }}
                >
                  <span className="dts-range-btn-value">{rng.value}</span>
                  <span className="dts-range-btn-label">{rng.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Range Detail Panel */}
          <div className="dts-range-detail" style={{ borderColor: activeRange.color, backgroundColor: activeRange.bgColor }}>
            <div className="dts-range-detail-top">
              <span className="dts-range-status-badge" style={{ backgroundColor: activeRange.color, color: '#ffffff' }}>
                {activeRange.badge}
              </span>
              <strong className="dts-range-value-large" style={{ color: activeRange.color }}>
                {activeRange.value}
              </strong>
            </div>
            <p className="dts-range-desc">
              {activeRange.description}
            </p>
          </div>

          {/* Dynamic Clinical Decision Algorithm & Protocol Integration */}
          {activeRange.clinicalProtocol && (
            <div className="dts-clinical-action-card">
              <div className="dts-action-header">
                <div className="dts-action-tag-row">
                  <span 
                    className="dts-action-badge" 
                    style={{ 
                      backgroundColor: activeRange.color + '15', 
                      color: activeRange.color, 
                      borderColor: activeRange.color + '40' 
                    }}
                  >
                    <Activity size={12} /> {activeRange.clinicalProtocol.tierTitle}
                  </span>
                  <span className="dts-evidence-badge">
                    <Award size={12} /> {isEs ? 'Algoritmo de Decisión Clínica' : 'Evidence-Based Clinical Decision Pathway'}
                  </span>
                </div>
                <div className="dts-proto-title-row">
                  <div>
                    <span className="dts-proto-code">{activeRange.clinicalProtocol.shortCode}</span>
                    <h5 className="dts-proto-name">{activeRange.clinicalProtocol.name}</h5>
                  </div>
                  <div className="dts-proto-target-pill">
                    <span className="dts-target-label">{isEs ? 'Diana Terapéutica' : 'Biomarker Target'}</span>
                    <strong className="dts-target-val">{activeRange.clinicalProtocol.targetGoal}</strong>
                  </div>
                </div>
              </div>

              {/* Pathophysiological Rationale */}
              <div className="dts-action-rationale">
                <div className="dts-rationale-label">
                  <FileText size={13} color="#0284c7" />
                  <span>{isEs ? 'Juicio Diagnóstico & Mecanismo Celular' : 'Diagnostic Rationale & Cellular Mechanism'}</span>
                </div>
                <p className="dts-rationale-text">
                  {activeRange.clinicalProtocol.clinicalRationale}
                </p>
              </div>

              {/* Precision Pharmacokinetic Prescription Breakdown (Biomarker Calibration) */}
              {(activeRange.clinicalProtocol.recommendedModality || activeRange.clinicalProtocol.dosageGuide) && (
                <div className="dts-rx-breakdown-card">
                  <div className="dts-rx-header">
                    <span className="dts-rx-title">
                      <Syringe size={14} color="#0d9488" />
                      {isEs ? 'Prescripción y Calibración Farmacocinética Específica' : 'Precision Pharmacokinetic Prescription'}
                    </span>
                    <span className="dts-rx-tag">
                      {isEs ? 'Estratificación Biomarcador DBS' : 'Biomarker-Stratified Route'}
                    </span>
                  </div>
                  <div className="dts-rx-grid">
                    <div className="dts-rx-item">
                      <span className="dts-rx-item-label">{isEs ? 'Vía Recomendada:' : 'Prescribed Route:'}</span>
                      <strong className="dts-rx-item-val">{activeRange.clinicalProtocol.recommendedModality}</strong>
                    </div>
                    <div className="dts-rx-item">
                      <span className="dts-rx-item-label">{isEs ? 'Pauta de Inducción:' : 'Induction Schedule:'}</span>
                      <strong className="dts-rx-item-val">{activeRange.clinicalProtocol.dosageGuide}</strong>
                    </div>
                    <div className="dts-rx-item">
                      <span className="dts-rx-item-label">{isEs ? 'Protección de Metilación:' : 'Methylation Safeguard:'}</span>
                      <strong className="dts-rx-item-val">{activeRange.clinicalProtocol.methylationRx}</strong>
                    </div>
                    <div className="dts-rx-item">
                      <span className="dts-rx-item-label">{isEs ? 'Ventana Re-Test DBS:' : 'DBS Re-Test Window:'}</span>
                      <strong className="dts-rx-item-val">{activeRange.clinicalProtocol.retestWindow}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Synergistic Compounds & Biomarker Surveillance Grid */}
              <div className="dts-action-grid">
                <div className="dts-synergies-col">
                  <span className="dts-grid-heading">
                    <Sparkles size={12} color="#0d9488" />
                    {isEs ? 'Péptidos & Precursores en Sinergia' : 'Synergistic Companion Compounds'}
                  </span>
                  <div className="dts-synergies-pills">
                    {activeRange.clinicalProtocol.synergies.map((syn, synIdx) => (
                      <div key={synIdx} className="dts-syn-pill">
                        <span className="dts-syn-name">{syn.name}</span>
                        <span className="dts-syn-role">{syn.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dts-cadence-col">
                  <span className="dts-grid-heading">
                    <Clock size={12} color="#475569" />
                    {isEs ? 'Monitorización y Re-evaluación' : 'Clinical Monitoring Interval'}
                  </span>
                  <div className="dts-cadence-meta">
                    <div className="dts-meta-line">
                      <span>{isEs ? 'Ventana Re-Test DBS:' : 'DBS Re-Test Window:'}</span>
                      <strong>{activeRange.clinicalProtocol.retestWindow}</strong>
                    </div>
                    <div className="dts-meta-line">
                      <span>{isEs ? 'Objetivo Biológico:' : 'Cellular Target:'}</span>
                      <small>{activeRange.clinicalProtocol.cellularTarget}</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="dts-action-footer">
                <a 
                  href={`/proto/${activeRange.clinicalProtocol.slug}${activeRange.clinicalProtocol.queryParams || ''}`}
                  className="dts-btn-explore-proto"
                  title={isEs ? `Ver protocolo clínico calibrado ${activeRange.clinicalProtocol.shortCode}` : `Explore calibrated clinical protocol ${activeRange.clinicalProtocol.shortCode}`}
                >
                  <span>{isEs ? 'Ver Protocolo Clínico Calibrado para este Resultado' : 'Review Calibrated Clinical Protocol for this Result'}</span>
                  <ArrowRight size={14} />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('open-public-atlas-ai', {
                          detail: {
                            initialQuery: activeRange.clinicalProtocol.aiQuery
                          }
                        })
                      );
                    }
                  }}
                  className="dts-btn-ai-query"
                  title={isEs ? 'Consultar este nivel y protocolo con el Asistente Clínico de IA' : 'Inquire about this biomarker tier with Clinical AI'}
                >
                  <Bot size={14} />
                  <span>{isEs ? 'Consultar con Clinical AI este Nivel' : 'Ask Clinical AI About This Level'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. STANDARDIZED DBS CAPILLARY COLLECTION PROTOCOL (BLOODO.COM METHODOLOGY) ── */}
        <div id="collection-protocol" className="dts-protocol-card">
          <div className="dts-protocol-header-row">
            <div>
              <div className="dts-protocol-tag">
                <CheckCircle2 size={12} /> {isEs ? 'PROCEDIMIENTO ANALÍTICO ESTANDARIZADO' : 'STANDARDIZED ANALYTICAL PROCEDURE'}
              </div>
              <h4 className="dts-protocol-title">
                <Droplets size={20} color="#0d9488" />
                {isEs 
                  ? 'Guía de Extracción Capilar y Recogida de Muestra (Bloodo DBS™)' 
                  : 'Standardized Capillary Blood Spot Collection Protocol (Bloodo DBS™)'}
              </h4>
              <p className="dts-protocol-subtitle">
                {isEs
                  ? 'Procedimiento analítico neutral para la obtención y preservación de gotas de sangre seca en tarjeta de filtro Whatman 903 certificada bajo normativa CE-IVDR.'
                  : 'Neutral analytical procedure for the collection and preservation of dried blood spots on CE-IVDR certified Whatman 903 grade filter cards.'}
              </p>
            </div>
            <div className="dts-protocol-dry-badge">
              <Clock size={15} color="#003666" />
              <div>
                <span className="dts-dry-time-val">{isEs ? '3 Horas de Secado' : '3-Hour Air Drying'}</span>
                <span className="dts-dry-time-sub">{isEs ? 'Temp. ambiente (15–25°C)' : 'Ambient room temp (15–25°C)'}</span>
              </div>
            </div>
          </div>

          {/* Quick Analytical Parameters Bar */}
          <div className="dts-specs-bar">
            <div className="dts-spec-item">
              <span className="dts-spec-label">{isEs ? 'Matriz Biológica' : 'Biological Matrix'}</span>
              <strong className="dts-spec-val">{isEs ? 'Sangre capilar total' : 'Whole capillary blood'}</strong>
            </div>
            <div className="dts-spec-item">
              <span className="dts-spec-label">{isEs ? 'Volumen por Círculo' : 'Volume per Spot'}</span>
              <strong className="dts-spec-val">{isEs ? '2–3 gotas (~50 µL)' : '2–3 drops (~50 µL)'}</strong>
            </div>
            <div className="dts-spec-item">
              <span className="dts-spec-label">{isEs ? 'Soporte Analítico' : 'Collection Substrate'}</span>
              <strong className="dts-spec-val">Whatman 903 (CE-IVDR)</strong>
            </div>
            <div className="dts-spec-item">
              <span className="dts-spec-label">{isEs ? 'Estabilidad en Tránsito' : 'Transit Stability'}</span>
              <strong className="dts-spec-val">{isEs ? '14 días con desecante' : '14 days with desiccant'}</strong>
            </div>
          </div>

          {/* Cortisol Dual-Sample Diurnal Cadence (When isCortisol is true) */}
          {isCortisol && (
            <div className="dts-cortisol-cadence-card">
              <div className="dts-cadence-badge-row">
                <span className="dts-cadence-badge">
                  <Clock size={12} /> {isEs ? 'CRONOBIOLOGÍA DEL EJE HPA' : 'HPA AXIS CHRONOBIOLOGY'}
                </span>
                <span className="dts-cadence-pill">
                  {isEs ? 'Doble Muestra Obligatoria (AM + PM)' : 'Mandatory Dual Sampling (AM + PM)'}
                </span>
              </div>
              <h5 className="dts-cadence-title">
                {isEs 
                  ? 'Protocolo de Muestreo Diurno: Respuesta al Despertar (CAR) y Pendiente Vespertina' 
                  : 'Diurnal Sampling Cadence: Cortisol Awakening Response (CAR) & Evening Slope'}
              </h5>
              <p className="dts-cadence-desc">
                {isEs
                  ? 'El cortisol experimenta una pronunciada fluctuación circadiana. Una toma aislada resulta analíticamente insuficiente para evaluar el eje hipotálamo-hipofisario-adrenal (HPA). La recogida en dos puntos temporales permite calcular la Pendiente Diurna del Cortisol (DCS), diferenciando ritmos fisiológicos sanos de estados de hipercortisolemia alostática o de agotamiento suprarrenal (curva aplanada).'
                  : 'Cortisol secretion follows a steep circadian curve. A single snapshot is clinically insufficient to characterize hypothalamic-pituitary-adrenal (HPA) axis regulation. Two-point diurnal sampling allows accurate determination of the Diurnal Cortisol Slope (DCS), differentiating healthy circadian decline from allostatic evening hypercortisolemia or HPA axis burnout (flattened slope).'}
              </p>

              <div className="dts-cadence-grid">
                <div className="dts-cadence-box dts-cadence-am">
                  <div className="dts-cadence-box-top">
                    <div className="dts-cadence-icon dts-icon-am">
                      <Sun size={20} color="#b45309" />
                    </div>
                    <div>
                      <span className="dts-cadence-step-tag">{isEs ? 'Muestra 1 (Mañana)' : 'Sample 1 (Morning)'}</span>
                      <strong className="dts-cadence-time">07:00 – 09:00 AM</strong>
                    </div>
                  </div>
                  <div className="dts-cadence-specs">
                    <div className="dts-cadence-spec-row">
                      <span>{isEs ? 'Momento de recogida:' : 'Collection window:'}</span>
                      <strong>{isEs ? '30–60 min tras despertar (ayunas)' : '30–60 min post-waking (fasting)'}</strong>
                    </div>
                    <div className="dts-cadence-spec-row">
                      <span>{isEs ? 'Círculos en tarjeta:' : 'Target card spots:'}</span>
                      <strong className="dts-spot-tag-am">{isEs ? 'Círculos marcados AM' : 'Spots marked AM'}</strong>
                    </div>
                    <div className="dts-cadence-spec-row">
                      <span>{isEs ? 'Objetivo analítico:' : 'Analytical target:'}</span>
                      <small>{isEs ? 'Cuantifica el pico circadiano y la respuesta de despertar suprarrenal (CAR).' : 'Quantifies peak circadian activation & adrenal functional reserve (CAR).'}</small>
                    </div>
                  </div>
                </div>

                <div className="dts-cadence-box dts-cadence-pm">
                  <div className="dts-cadence-box-top">
                    <div className="dts-cadence-icon dts-icon-pm">
                      <Moon size={20} color="#4338ca" />
                    </div>
                    <div>
                      <span className="dts-cadence-step-tag">{isEs ? 'Muestra 2 (Tarde/Noche)' : 'Sample 2 (Evening)'}</span>
                      <strong className="dts-cadence-time">17:00 – 19:00 PM</strong>
                    </div>
                  </div>
                  <div className="dts-cadence-specs">
                    <div className="dts-cadence-spec-row">
                      <span>{isEs ? 'Momento de recogida:' : 'Collection window:'}</span>
                      <strong>{isEs ? 'Antes de la cena (mínimo 2h sin comer)' : 'Pre-dinner (min. 2h without food)'}</strong>
                    </div>
                    <div className="dts-cadence-spec-row">
                      <span>{isEs ? 'Círculos en tarjeta:' : 'Target card spots:'}</span>
                      <strong className="dts-spot-tag-pm">{isEs ? 'Círculos marcados PM' : 'Spots marked PM'}</strong>
                    </div>
                    <div className="dts-cadence-spec-row">
                      <span>{isEs ? 'Objetivo analítico:' : 'Analytical target:'}</span>
                      <small>{isEs ? 'Evalúa el nadir circadiano y la capacidad de desconexión parasimpática.' : 'Evaluates evening nadir and parasympathetic down-regulation capacity.'}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Standard Single Morning Cadence Banner (For non-cortisol tests) */}
          {!isCortisol && (
            <div className="dts-standard-timing-banner">
              <div className="dts-timing-icon">
                <Clock size={18} color="#0d9488" />
              </div>
              <div className="dts-timing-text">
                <strong>{isEs ? 'Momento Óptimo de Recogida de Muestra' : 'Optimal Specimen Collection Window'}</strong>
                <p>
                  {isEs
                    ? (isHba1c
                        ? 'Se recomienda realizar la extracción a primera hora de la mañana tras 8–10 horas de ayuno nocturno para máxima consistencia analítica.'
                        : 'Se recomienda realizar la extracción a primera hora de la mañana, preferiblemente antes del desayuno o de la ingesta calórica principal, garantizando uniformidad en determinaciones evolutivas.')
                    : (isHba1c
                        ? 'Recommended morning specimen following 8–10 hours of overnight fasting for peak analytical consistency.'
                        : 'Recommended morning collection, ideally prior to breakfast or heavy caloric intake, ensuring reproducibility across longitudinal measurements.')}
                </p>
              </div>
            </div>
          )}

          {/* 4 Graphic Procedural Steps */}
          <div id="pre-analytical-prep" className="dts-procedural-steps-grid">
            {/* Step 1 */}
            <div className="dts-proc-card">
              <div className="dts-proc-header">
                <span className="dts-proc-num">1</span>
                <span className="dts-proc-phase">{isEs ? 'PRE-ANALÍTICA' : 'PRE-ANALYTICAL'}</span>
              </div>
              <h5 className="dts-proc-title">
                {isEs ? 'Perfusión y Preparación Aséptica' : 'Perfusion & Aseptic Preparation'}
              </h5>
              <ul className="dts-proc-list">
                <li>
                  {isEs 
                    ? 'Ingerir 1–2 vasos de agua 20 minutos antes para asegurar hidratación microvascular y volemia adecuada.' 
                    : 'Drink 1–2 glasses of water 20 minutes prior to ensure adequate microvascular hydration and volume.'}
                </li>
                <li>
                  {isEs 
                    ? 'Lavar minuciosamente las manos con agua tibia durante 2 minutos. El calor favorece la vasodilatación de las arteriolas digitales.' 
                    : 'Wash hands thoroughly with warm water for 2 minutes. Heat stimulates digital arteriole vasodilation.'}
                </li>
                <li>
                  {isEs 
                    ? 'Efectuar movimientos pendulares suaves con el brazo hacia abajo durante 15–20 segundos para concentrar el volumen capilar en las yemas.' 
                    : 'Gently swing the arm downward for 15–20 seconds to pool capillary blood into the fingertips.'}
                </li>
                <li>
                  {isEs 
                    ? 'Desinfectar la cara lateral del dedo anular o medio con la toallita de alcohol IPA 70%. Dejar secar al aire 30 segundos.' 
                    : 'Disinfect the lateral side of the ring or middle finger with the 70% IPA alcohol wipe. Allow to air dry for 30s.'}
                </li>
              </ul>
              <div className="dts-proc-tip">
                <Info size={13} color="#0284c7" />
                <span>{isEs ? 'No usar agua fría para evitar vasoconstricción periférica.' : 'Avoid cold water to prevent reflexive vasoconstriction.'}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="dts-proc-card">
              <div className="dts-proc-header">
                <span className="dts-proc-num">2</span>
                <span className="dts-proc-phase">{isEs ? 'PUNCIÓN' : 'PUNCTURE'}</span>
              </div>
              <h5 className="dts-proc-title">
                {isEs ? 'Punción Lateral y Descarte Inicial' : 'Lateral Puncture & First Drop'}
              </h5>
              <ul className="dts-proc-list">
                <li>
                  {isEs 
                    ? 'Retirar la pestaña de bloqueo de la lanceta de seguridad estéril retráctil.' 
                    : 'Twist and remove the safety tab from the sterile retractable lancet.'}
                </li>
                <li>
                  {isEs 
                    ? 'Apoyar el cabezal firmemente contra la cara lateral del pulpejo (zona con menor inervación nociceptiva y mayor red capilar).' 
                    : 'Press the lancet firmly against the lateral edge of the fingertip (fewer nerve endings, denser capillary bed).'}
                </li>
                <li>
                  {isEs 
                    ? 'Presionar hasta escuchar el clic de disparo automático de la micropunta.' 
                    : 'Press down firmly until hearing the mechanical click triggering the microneedle.'}
                </li>
                <li className="dts-critical-step-item">
                  <AlertTriangle size={13} color="#b45309" />
                  <strong>
                    {isEs 
                      ? 'Punto Crítico: Limpiar y descartar la primera gota con la gasa estéril (contiene líquido intersticial que altera la precisión analítica).' 
                      : 'Critical Step: Wipe away the first blood drop with the sterile gauze (contains interstitial fluid that dilutes analytes).'}
                  </strong>
                </li>
              </ul>
              <div className="dts-proc-tip">
                <Info size={13} color="#0284c7" />
                <span>{isEs ? 'El descarte de la primera gota es estándar obligatorio CE-IVDR.' : 'Wiping the first drop is a mandatory CE-IVDR analytical standard.'}</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="dts-proc-card">
              <div className="dts-proc-header">
                <span className="dts-proc-num">3</span>
                <span className="dts-proc-phase">{isEs ? 'SATURACIÓN' : 'SATURATION'}</span>
              </div>
              <h5 className="dts-proc-title">
                {isEs ? 'Carga y Saturación de la Tarjeta' : 'Spot Loading & Matrix Saturation'}
              </h5>
              <ul className="dts-proc-list">
                <li>
                  {isEs 
                    ? 'Mantener la mano hacia abajo para permitir la formación espontánea de una gota de sangre grande y colgante.' 
                    : 'Keep the hand positioned downward to allow a large hanging drop of blood to form naturally.'}
                </li>
                <li>
                  {isEs 
                    ? 'Aproximar suavemente la gota colgante al centro del círculo de la tarjeta hasta que toque el papel de filtro Whatman.' 
                    : 'Gently bring the hanging drop into contact with the center of the Whatman filter card circle.'}
                </li>
                <li>
                  {isEs 
                    ? 'Permitir que la capilaridad absorba la sangre de forma homogénea sin que la piel toque ni frote el papel.' 
                    : 'Allow capillary action to absorb the blood cleanly without pressing or rubbing skin against the paper.'}
                </li>
                <li>
                  {isEs 
                    ? 'Saturar 2 a 3 círculos por muestra (en Cortisol: círculos AM por la mañana y círculos PM por la tarde).' 
                    : 'Saturate 2–3 circles per specimen (for Cortisol: AM spots in the morning, PM spots in the evening).'}
                </li>
              </ul>
              <div className="dts-proc-tip">
                <Info size={13} color="#0284c7" />
                <span>{isEs ? 'Comprobar que la sangre impregne el reverso de la tarjeta.' : 'Verify blood has penetrated uniformly through the card back.'}</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="dts-proc-card">
              <div className="dts-proc-header">
                <span className="dts-proc-num">4</span>
                <span className="dts-proc-phase">{isEs ? 'DESECACIÓN' : 'DESICCATION'}</span>
              </div>
              <h5 className="dts-proc-title">
                {isEs ? 'Secado Horizontal (3h) y Envío' : 'Horizontal Air-Dry (3h) & Dispatch'}
              </h5>
              <ul className="dts-proc-list">
                <li>
                  {isEs 
                    ? 'Dejar secar la tarjeta abierta en posición horizontal sobre superficie limpia durante 3 horas completas a temperatura ambiente (15–25°C).' 
                    : 'Allow the card to air-dry horizontally on a clean surface for 3 full hours at room temperature (15–25°C).'}
                </li>
                <li>
                  {isEs 
                    ? 'No aplicar calor artificial (secadores o radiadores) ni exponer a luz solar directa para no alterar las biomoléculas.' 
                    : 'Do not apply heat (hairdryers/radiators) or direct sunlight to prevent molecular degradation.'}
                </li>
                <li>
                  {isEs 
                    ? 'Una vez seca (color pardo homogéneo), cerrar la solapa protectora de la tarjeta.' 
                    : 'Once completely dry (uniform dark color), fold the protective cover flap over the card.'}
                </li>
                <li>
                  {isEs 
                    ? 'Introducir en la bolsa bio-barrier aluminizada con el sobre desecante de sílice, sellar herméticamente y depositar en el sobre prepagado.' 
                    : 'Place inside the foil bio-barrier pouch with the silica desiccant, seal hermetically, and insert into the prepaid mailer.'}
                </li>
              </ul>
              <div className="dts-proc-tip">
                <Info size={13} color="#0284c7" />
                <span>{isEs ? 'El desecante garantiza estabilidad analítica durante 14 días.' : 'The silica desiccant preserves analyte stability for up to 14 days.'}</span>
              </div>
            </div>
          </div>

          {/* Quality Acceptance Criteria vs Rejection Causes */}
          <div className="dts-qa-criteria-grid">
            <div className="dts-qa-box dts-qa-valid">
              <div className="dts-qa-box-header">
                <CheckCircle2 size={16} color="#0d9488" />
                <strong className="dts-qa-title">{isEs ? 'Criterios de Muestra Válida' : 'Analytical Acceptance Criteria'}</strong>
              </div>
              <ul className="dts-qa-list">
                <li>{isEs ? 'Círculos de papel de filtro completamente saturados y homogéneos.' : 'Circles completely saturated with even, uniform absorption.'}</li>
                <li>{isEs ? 'Penetración visible y simétrica en la cara posterior de la tarjeta.' : 'Visible, symmetric penetration on the back of the filter card.'}</li>
                <li>{isEs ? 'Descarte inicial riguroso de la 1ª gota de punción.' : 'Strict discard of the first puncture droplet prior to collection.'}</li>
                <li>{isEs ? 'Secado horizontal de 3 horas antes del cierre y envasado aluminizado.' : 'Full 3-hour horizontal air drying prior to foil pouch hermetic sealing.'}</li>
              </ul>
            </div>

            <div className="dts-qa-box dts-qa-invalid">
              <div className="dts-qa-box-header">
                <AlertTriangle size={16} color="#dc2626" />
                <strong className="dts-qa-title">{isEs ? 'Causas de Rechazo Analítico' : 'Causes for Analytical Rejection'}</strong>
              </div>
              <ul className="dts-qa-list">
                <li>{isEs ? 'Ordeñado o compresión digital violenta (produce hemólisis y dilución).' : 'Aggressive digital squeezing/milking (causes hemolysis & tissue dilution).'}</li>
                <li>{isEs ? 'Frotar o raspar el dedo contra la superficie del papel de filtro.' : 'Rubbing or scraping fingertip directly against the filter paper matrix.'}</li>
                <li>{isEs ? 'Superposición de múltiples gotas pequeñas en un mismo círculo.' : 'Layering multiple small droplets on top of an already dried spot.'}</li>
                <li>{isEs ? 'Envasado prematuro con humedad residual (< 3 horas de secado).' : 'Premature packaging with residual moisture (< 3 hours air drying).'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 4. WHAT'S IN THE BOX CHECKLIST ── */}
        <div id="kit-contents" className="dts-contents-card">
          <h5 className="dts-contents-title">
            <Layers size={16} color="#003666" />
            {isEs ? 'Contenido del Kit de Diagnóstico' : 'Diagnostic Kit Included Accessories'}
          </h5>
          <div className="dts-contents-grid">
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Tarjeta de colección DBS certificada con desecante' : '1x Certified Dried Blood Spot (DBS) collection card'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '2x Lancetas retráctiles de seguridad (punción indolora)' : '2x Single-use sterile retractable safety lancets'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '2x Toallitas desinfectantes con alcohol isopropílico 70%' : '2x 70% Isopropyl alcohol antiseptic prep pads'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Apósitos adhesivos y gasa estéril de contención' : '1x Adhesive bandage & sterile cotton gauze pad'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Sobre hermético de transporte con franqueo pagado' : '1x Prepaid laboratory return mailer to LifeLab1'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Guía visual de instrucciones paso a paso' : '1x Step-by-step illustrated patient instructions'}</span>
            </div>
          </div>
        </div>

        {/* ── 5. ACCREDITATION & COMMERCIAL INQUIRY FOOTER ── */}
        <div id="lab-certification" className="dts-footer-banner">
          <div className="dts-footer-text">
            <strong className="dts-footer-headline">
              <Building2 size={16} color="#0d9488" />
              LifeLab1 Clinical Laboratory — Vilnius, Lithuania
            </strong>
            <p className="dts-footer-sub">
              {isEs 
                ? 'Laboratorio clínico homologado bajo regulación europea CE-IVDR (EU 2017/746). Informes cuantitativos generados en 3–5 días laborables mediante portal digital encriptado.'
                : 'Licensed European central laboratory compliant with CE-IVDR (EU 2017/746). Turnaround time 3–5 business days with secure digital portal delivery.'}
            </p>
          </div>

          <div className="dts-footer-badges">
            <span className="dts-accreditation-tag">ISO 15189 Compliant</span>
            <span className="dts-accreditation-tag">CE-IVDR In Vitro Diagnostic</span>
            <span className="dts-accreditation-tag">Room Temp Stable (15–25°C)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
