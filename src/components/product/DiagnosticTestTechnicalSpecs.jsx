"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  Syringe,
  Download,
  Eye,
  X
} from '@/lib/icons';
import './DiagnosticTestTechnicalSpecs.css';

const COMPANION_SLUG_MAP = {
  'kisspeptin-10': 'kisspeptin-10',
  'kisspeptin': 'kisspeptin-10',
  'testagen': 'testagen',
  'dsip': 'dsip',
  'selank': 'selank',
  'semax': 'semax',
  'epithalon': 'epithalon',
  'mots-c': 'mots-c',
  'tirzepatide': 'tirzepatide',
  'semaglutide': 'semaglutide',
  'retatrutide': 'retatrutide',
  'bpc-157': 'bpc-157',
  'tb-500': 'tb-500',
  'thymosin alpha-1': 'thymosin-alpha-1',
  'll-37': 'll-37',
  'ss-31': 'ss-31',
  'elamipretide': 'ss-31',
  'nad+': 'nad-plus',
  'nmn': 'nmn',
  'cjc-1295': 'cjc-1295',
  'ipamorelin': 'ipamorelin',
  'ghk-cu': 'ghk-cu',
  'kpv': 'kpv',
};

function resolveCompanionSlug(name = '') {
  const clean = name.toLowerCase().replace(/[^a-z0-9+-]/g, ' ').trim();
  for (const [key, slug] of Object.entries(COMPANION_SLUG_MAP)) {
    if (clean.includes(key)) return slug;
  }
  return null;
}

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
  lang = 'en',
  activeSection = null
}) {
  const isEs = lang === 'es';
  const slug = (product?.slug || product?.id || '').toLowerCase();
  
  const isCollectionOnly = activeSection === 'collection-protocol' || activeSection === 'pre-analytical-prep' || activeSection === 'kit-contents';
  const isSpecsOnly = activeSection === 'diagnostic-specs' || activeSection === 'biomarker-simulator';
  
  // Identify specific Bloodo test type
  const isNad = slug.includes('nad');
  const isHba1c = slug.includes('hba1c') || slug.includes('hemoglobin');
  const isOmega = slug.includes('omega') && !slug.includes('teletest');
  const isVitD = slug.includes('vitamin-d') || slug.includes('vit-d');
  const isCortisol = slug.includes('cortisol');
  const isTestosterone = slug.includes('testosterone');

  // Identify specific TeleTest (Analytika / Advanced Diagnostics) test type
  const isTeletest = slug.startsWith('teletest-');
  const isTeletestHTMA = slug === 'teletest-mineralograma-cabello-htma';
  const isTeletestOmega = slug === 'teletest-test-omega';
  const isTeletestMetabolizer = slug === 'teletest-saliva-metabolizer-detox';
  const isTeletestHLA = slug === 'teletest-gnt-hla-autoinmunidad';
  const isTeletestCeliac = slug === 'teletest-estudio-genetico-celiaca';
  const isHairSample = isTeletestHTMA;
  const isSalivaSample = isTeletestMetabolizer || isTeletestHLA || isTeletestCeliac;

  // Official Kit Packaging Image
  const kitImage = isTeletestHTMA
    ? '/images/products/teletest/mineralograma-cabello.svg'
    : isTeletestOmega
    ? '/images/products/teletest/omega-test.svg'
    : isTeletestMetabolizer
    ? '/images/products/teletest/metabolizer-detox.svg'
    : isTeletestHLA
    ? '/images/products/teletest/hla-autoinmunidad.svg'
    : isTeletestCeliac
    ? '/images/products/teletest/celiac-genetics.svg'
    : isNad 
    ? '/images/products/bloodo/nad.jpg'
    : isCortisol
    ? '/images/products/bloodo/cortisol.jpg'
    : isHba1c
    ? '/images/products/bloodo/hba1c.jpg'
    : isOmega
    ? (slug.includes('index') ? '/images/products/bloodo/omega-index.jpg' : '/images/products/bloodo/omega.jpg')
    : isTestosterone
    ? '/images/products/bloodo/testosterone.jpg'
    : '/images/products/bloodo/vitamin-d.jpg';

  // Interactive biomarker level simulator state
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(2); // Default to optimal/target
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [testosteroneGender, setTestosteroneGender] = useState('male'); // 'male' | 'female'

  // Biomarker ranges configuration
  const biomarkerData = (() => {
    if (isNad) {
      return {
        name: isEs ? 'NAD Total Intracelular (NAD⁺ + NADH)' : 'Total Intracellular NAD (NAD+ & NADH)',
        unit: 'µmol/L',
        method: isEs ? 'Ensayo Enzimático Cíclico (Código: XLT01690-0)' : 'Enzymatic Cyclic Assay (Test Code: XLT01690-0)',
        lab: 'LifeLab1 (Vilnius, Lithuania) · Lic. 4864',
        lod: '0.23 µmol/L',
        range: '5.0 – 60.0 µmol/L (Cohorte 1.068 Sujetos)',
        precision: 'RSD 6.6%',
        officialReportPdf: '/docs/bloodo-report-nad.pdf',
        officialReportDocName: 'bloodo-report-nad.pdf',
        ranges: [
          {
            label: isEs ? 'Depleción Severa / Déficit' : 'Severe Depletion / Deficit',
            value: '< 10.3 µmol/L',
            status: 'critical',
            badge: isEs ? 'Déficit Mitocondrial Severo' : 'High Cellular Deficit',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs 
              ? 'Niveles críticamente bajos según la cohorte poblacional de LifeLab1 (1.068 participantes sanos). Asociados a agotamiento mitocondrial, senescencia celular acelerada y baja actividad de enzimas reparadoras de ADN dependientes de NAD⁺ (PARP1 y sirtuinas).'
              : 'Critically depressed levels below 10.3 µmol/L (LifeLab1 healthy cohort baseline of 1,068 participants). Correlated with severe mitochondrial ATP depletion, accelerated cellular senescence, and impaired PARP1/sirtuin DNA repair capacity.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=severe&nad_level=8.5&tier=critical&modality=intravenous&retest=4w',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Estrategia de Rescate Parenteral IV' 
                : 'Master NAD+ Protocol: Parenteral IV Rescue Pathway',
              tierTitle: isEs ? 'TIER 1 · RESCATE MITOCONDRIAL PARENTERAL' : 'TIER 1 · PARENTERAL MITOCHONDRIAL RESCUE',
              targetGoal: isEs ? 'Elevar NAD⁺ al rango fisiológico óptimo (15.4 – 20.6 µmol/L)' : 'Restore intracellular NAD+ to optimal target (15.4 – 20.6 µmol/L)',
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
                ? '¿Cuál es el algoritmo clínico de infusión IV de NAD+ y cofactores de metilación cuando el nivel es inferior a 10.3 µmol/L?'
                : 'What is the recommended clinical NAD+ IV infusion and methylation cofactor protocol when levels are below 10.3 µmol/L?'
            }
          },
          {
            label: isEs ? 'Rango Moderado / Subóptimo' : 'Suboptimal / Moderate Decline',
            value: '10.3 – 15.4 µmol/L',
            status: 'warning',
            badge: isEs ? 'Margen de Optimización' : 'Room for Optimization',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Nivel subóptimo característico de declive fisiológico con la edad o alto consumo por estrés oxidativo y CD38. Indicación prioritaria para optimización con precursores subcutáneos u orales (NMN/NR) y ejercicio moderado.'
              : 'Suboptimal adult baseline reflecting age-associated depletion and elevated CD38 consumption. High clinical indication for at-home subcutaneous titration or high-purity oral precursors (NMN/NR) and circadian sleep hygiene.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=suboptimal&nad_level=13.0&tier=warning&modality=subcutaneous&retest=8w',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Titulación Subcutánea y Precursores' 
                : 'Master NAD+ Protocol: Subcutaneous & Precursor Titration',
              tierTitle: isEs ? 'TIER 2 · OPTIMIZACIÓN SUBCUTÁNEA & BIOENERGÉTICA' : 'TIER 2 · SUBCUTANEOUS & BIOENERGETIC OPTIMIZATION',
              targetGoal: isEs ? 'Alcanzar y consolidar rango óptimo de 15.4 – 20.6 µmol/L' : 'Reach and consolidate optimal target 15.4 – 20.6 µmol/L',
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
                ? '¿Qué pauta de dosificación subcutánea de NAD+ y TMG se aconseja para niveles en rango subóptimo de 10.3 a 15.4 µmol/L?'
                : 'What is the recommended SubQ NAD+ and TMG dosing schedule for suboptimal NAD+ levels between 10.3 and 15.4 µmol/L?'
            }
          },
          {
            label: isEs ? 'Rango Óptimo Poblacional Fisiológico' : 'Optimal Healthy Cohort Target',
            value: '15.4 – 20.6 µmol/L',
            status: 'optimal',
            badge: isEs ? 'Objetivo Terapéutico (Norma LifeLab1)' : 'Target Clinical Range (LifeLab1 Standard)',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Rango diana fisiológico óptimo establecido por LifeLab1 sobre 1.068 individuos sanos. Se asocia a equilibrio bioenergético, activación balanceada de sirtuinas SIRT1/3 y preservación de la reserva de donantes de metilo.'
              : 'Ideal physiological target range established across LifeLab1 cohort of 1,068 healthy adults. Reflects youthful cellular bioenergetics, balanced SIRT1/SIRT3 sirtuin activation, and stable methyl pool conservation.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=optimal&nad_level=18.0&tier=optimal&modality=subcutaneous&retest=6m',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Mantenimiento Celular y Longevidad' 
                : 'Master NAD+ Protocol: Circadian Longevity Maintenance',
              tierTitle: isEs ? 'TIER 3 · VIGILANCIA Y MANTENIMIENTO HOMEOSTÁTICO' : 'TIER 3 · SURVEILLANCE & HOMEOSTATIC MAINTENANCE',
              targetGoal: isEs ? 'Sostener homeostasis fisiológica en 15.4 – 20.6 µmol/L' : 'Sustain steady-state homeostasis at 15.4 – 20.6 µmol/L',
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
                ? '¿Cómo estructurar un protocolo de mantenimiento circadiano cuando los niveles de NAD+ ya están en rango óptimo de 15.4 a 20.6 µmol/L?'
                : 'How to structure a circadian maintenance protocol when intracellular NAD+ is already in the optimal 15.4-20.6 µmol/L range?'
            }
          },
          {
            label: isEs ? 'Rango Elevado / Post-Tratamiento' : 'Elevated / Active Treatment Response',
            value: '20.6 – 25.3 µmol/L',
            status: 'warning',
            badge: isEs ? 'Respuesta Activa' : 'Active High Response',
            color: '#ea580c',
            bgColor: '#fff7ed',
            description: isEs
              ? 'Valores alcanzados habitualmente tras protocolos activos de infusión intravenosa de NAD+ o suplementación intensiva. Se encuentra por encima de la media poblacional, indicando respuesta terapéutica favorable con necesidad de iniciar meseta.'
              : 'Levels achieved following active clinical NAD+ IV therapy or intensive precursor supplementation. Indicates positive therapeutic responsiveness; transition to plateau maintenance indicated.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=elevated&nad_level=22.5&tier=warning&modality=maintenance&retest=12w',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Titulación a Dosis de Mantenimiento' 
                : 'Master NAD+ Protocol: Maintenance De-escalation',
              tierTitle: isEs ? 'TIER 4 · TITULACIÓN A MANTENIMIENTO' : 'TIER 4 · MAINTENANCE TITRATION',
              targetGoal: isEs ? 'Estabilizar respuesta sin sobrecargar el aclaramiento de metabolitos' : 'Stabilize response without overloading metabolite clearance',
              recommendedModality: isEs ? 'Espaciamiento de Dosis (1x cada 10-14 días)' : 'Dose Spacing (Every 10-14 Days)',
              dosageGuide: isEs ? 'Reducir frecuencia de infusión o alternar precursores orales' : 'Reduce infusion frequency or alternate oral precursors',
              methylationRx: isEs ? 'TMG 500 mg diario y vigilancia de homocisteína sérica' : 'TMG 500 mg daily & serum homocysteine check',
              retestWindow: isEs ? '12 Semanas (Monitoreo de Estabilidad)' : '12 Weeks (Stability Monitoring)',
              cellularTarget: isEs ? 'Aclaramiento de MeNAM y balance redox NAD/NADH' : 'MeNAM clearance & NAD/NADH redox balance',
              clinicalRationale: isEs
                ? 'Nivel elevado que refleja respuesta clínica activa. Se recomienda espaciar dosis para asegurar que la enzima NNMT no drene donantes de metilo (SAMe).'
                : 'Elevated level reflecting active clinical loading. Spacing doses is recommended to safeguard the hepatic methyl donor pool from NNMT-driven depletion.',
              synergies: [
                { name: 'TMG 500mg', role: isEs ? 'Protector de Metilación' : 'Methyl Safeguard' },
                { name: 'B-Complex', role: isEs ? 'Ciclo de Metionina' : 'Methionine Cycle' },
                { name: 'Monitoreo DBS', role: isEs ? 'Control de Estabilidad' : 'Stability Verification' }
              ],
              aiQuery: isEs
                ? '¿Cómo desescalar a una pauta de mantenimiento cuando el NAD+ se sitúa entre 20.6 y 25.3 µmol/L?'
                : 'How to de-escalate to maintenance when NAD+ is between 20.6 and 25.3 µmol/L?'
            }
          },
          {
            label: isEs ? 'Zona Dark Red (Alerta de Suplementación Excesiva)' : 'Dark Red Zone (Excessive Supplementation Alert)',
            value: '> 25.3 µmol/L',
            status: 'critical',
            badge: isEs ? 'DARK RED ZONE · ALERTA METABÓLICA' : 'DARK RED ZONE · METABOLIC ALERT',
            color: '#991b1b',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Nivel en zona rojo oscuro según LifeLab1. Puede indicar suplementación excesiva con precursores o desequilibrio metabólico. La sobredosificación sostenida puede perturbar la regulación celular basal y se ha vinculado a daño en ADN en modelos experimentales [6], así como a disfunciones metabólicas (lípidos, diabetes, ácido úrico) [7]. Se recomienda revisión médica, suspensión temporal de precursores y ventana de descanso.'
              : 'Dark red zone per LifeLab1 laboratory monograph. May indicate excessive precursor supplementation or underlying metabolic imbalance. Sustained supra-elevations can disrupt normal cellular regulation and are linked to potential genomic stress or metabolic alterations [6,7]. Clinical review, precursor cessation, and washout window advised.',
            clinicalProtocol: {
              slug: 'nad-cellular-restoration-protocol',
              queryParams: '?baseline=peak&nad_level=28.0&tier=super&modality=cycling&retest=12w',
              shortCode: 'REF-NAD-MSTR',
              name: isEs 
                ? 'Protocolo NAD+ Maestro: Fase de Consolidación y Descanso' 
                : 'Master NAD+ Protocol: Plateau Consolidation & Washout',
              tierTitle: isEs ? 'TIER 5 · TITULACIÓN CLÍNICA Y CONTROL DE SEGURIDAD' : 'TIER 5 · CLINICAL TITRATION & SAFETY SURVEILLANCE',
              targetGoal: isEs ? 'Consolidar y monitorizar balance de excreción de metilos' : 'Consolidate and monitor methyl excretion equilibrium',
              recommendedModality: isEs ? 'Ciclado de Precursores (Cycling / Washout de 2–4 Semanas)' : 'Precursor Cycling & Washout Window (2–4 Weeks)',
              dosageGuide: isEs ? 'Pausa temporal de aportes exógenos; evaluar meseta y respuesta celular basal' : 'Temporary pause of exogenous precursors; evaluate plateau retention',
              methylationRx: isEs ? 'Monitorización de homocisteína sérica (objetivo < 8.0 µmol/L) y soporte hepático' : 'Serum homocysteine monitoring (target < 8.0 µmol/L) & hepatic support',
              retestWindow: isEs ? '12 Semanas (Monitoreo post-lavado para evaluar meseta)' : '12 Weeks (Post-washout evaluation)',
              cellularTarget: isEs ? 'Balance de donantes de metilo (SAMe), excreción de MeNAM' : 'Methyl donor pool (SAMe), MeNAM urinary excretion',
              clinicalRationale: isEs
                ? 'Nivel en zona DARK RED característico de infusiones recientes o sobredosificación de precursores. Requiere verificar que la excreción de metabolitos metilados (MeNAM) no agote la reserva de donantes de metilo (SAMe / colina) y aplicar una ventana de ciclado/descanso para preservar la síntesis endógena de NAMPT.'
                : 'DARK RED threshold typical of intensive megadosing or acute IV infusions. Clinical oversight warrants checking that clearance of methylated metabolites (MeNAM) preserves the hepatic methyl donor pool and applying cycling windows to maintain endogenous NAMPT expression.',
              synergies: [
                { name: 'TMG (Betaína)', role: isEs ? 'Soporte de Metilación' : 'Methylation Safeguard' },
                { name: 'Vitamina B12 / Folato', role: isEs ? 'Ciclo de Metionina' : 'Methionine Resynthesis' },
                { name: 'Monitoreo DBS', role: isEs ? 'Control de Meseta' : 'Plateau Verification' },
                { name: 'Cycling / Washout', role: isEs ? 'Pausa Terapéutica' : 'Washout Window' }
              ],
              aiQuery: isEs
                ? '¿Qué precauciones médicas sobre metilación y donantes de metilo (TMG) deben tomarse cuando el NAD+ entra en la zona DARK RED (> 25.3 µmol/L)?'
                : 'What clinical safeguards regarding methylation (TMG) should be observed when NAD+ enters the DARK RED zone (> 25.3 µmol/L)?'
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
        officialReportPdf: '/docs/bloodo-report-hba1c.pdf',
        officialReportDocName: 'bloodo-report-hba1c.pdf',
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
              : 'Optimal insulin sensitivity and stable 90-day glycemic tone. Minimal systemic advanced glycation end-products (AGEs).',
            clinicalProtocol: {
              slug: 'weight-management-structured-12w',
              queryParams: '?baseline=optimal&hba1c_level=5.1&tier=optimal&modality=maintenance&retest=6m',
              shortCode: 'REF-MET-GLP1',
              name: isEs 
                ? 'Protocolo Metabólico Maestro: Mantenimiento y Flexibilidad' 
                : 'Master Metabolic Protocol: Maintenance & Flexibility',
              tierTitle: isEs ? 'TIER 1 · MANTENIMIENTO METABÓLICO' : 'TIER 1 · METABOLIC MAINTENANCE',
              targetGoal: isEs ? 'Sostener HbA1c < 5.4% de manera continua' : 'Sustain continuous HbA1c < 5.4%',
              recommendedModality: isEs ? 'Mantenimiento Domiciliario y Soporte Mitocondrial' : 'At-Home Maintenance & Mitochondrial Support',
              dosageGuide: isEs ? 'Microdosificación o soporte con péptidos mitocondriales' : 'Micro-dosing or mitochondrial peptide support',
              methylationRx: isEs ? 'Dieta de baja carga glucémica y antioxidantes' : 'Low-glycemic nutrition & antioxidant cofactors',
              retestWindow: isEs ? '6 Meses (Vigilancia semestral DBS)' : '6 Months (Biannual DBS Check)',
              cellularTarget: isEs ? 'Sensibilidad GLUT4, autofagia, mitofagia' : 'GLUT4 sensitivity, autophagy, mitophagy',
              clinicalRationale: isEs
                ? 'Excelente homeostasis glucémica. Se aconseja consolidar la flexibilidad metabólica con soporte mitocondrial preventivo.'
                : 'Optimal glycemic control. Maintain metabolic flexibility with preventative lifestyle and mitochondrial resilience.',
              synergies: [
                { name: 'MOTS-c', role: isEs ? 'Sensibilizador AMPK' : 'AMPK Sensitizer' },
                { name: 'Monitoreo DBS', role: isEs ? 'Vigilancia Semestral' : 'Biannual Surveillance' }
              ],
              aiQuery: isEs
                ? '¿Cómo estructurar un protocolo de mantenimiento cuando la HbA1c es óptima (< 5.4%)?'
                : 'How to maintain metabolic flexibility when HbA1c is in the optimal range (< 5.4%)?'
            }
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
              : 'Conventional normoglycemic range compliant with international endocrinology guidelines (ADA / WHO).',
            clinicalProtocol: {
              slug: 'weight-management-structured-12w',
              queryParams: '?baseline=normal&hba1c_level=5.5&tier=optimal&modality=lifestyle&retest=6m',
              shortCode: 'REF-MET-GLP1',
              name: isEs 
                ? 'Protocolo Metabólico Maestro: Optimización Preventiva' 
                : 'Master Metabolic Protocol: Preventative Optimization',
              tierTitle: isEs ? 'TIER 2 · PREVENCIÓN PRIMARIA' : 'TIER 2 · PRIMARY PREVENTION',
              targetGoal: isEs ? 'Optimizar hacia rango funcional < 5.4%' : 'Optimize toward longevity target < 5.4%',
              recommendedModality: isEs ? 'Optimización de Estilo de Vida y Sensibilización' : 'Lifestyle Optimization & Sensitization',
              dosageGuide: isEs ? 'Entrenamiento de fuerza y soporte metabólico suave' : 'Resistance training & mild metabolic support',
              methylationRx: isEs ? 'Cofactores de magnesio y cromo' : 'Magnesium & chromium cofactors',
              retestWindow: isEs ? '6 Meses (Control de Rutina)' : '6 Months (Routine Check)',
              cellularTarget: isEs ? 'Homeostasis de glucosa e insulina basal' : 'Basal glucose & insulin homeostasis',
              clinicalRationale: isEs
                ? 'Valores normales estándar. Margen de mejora para alcanzar la máxima protección cardiovascular y metabólica de longevidad.'
                : 'Standard normal glycemia. Opportunity for functional improvement toward peak metabolic longevity.',
              synergies: [
                { name: 'Ejercicio Resistencia', role: isEs ? 'Captación Glucosa' : 'Glucose Clearance' },
                { name: 'Monitoreo DBS', role: isEs ? 'Control Rutinario' : 'Routine Tracking' }
              ],
              aiQuery: isEs
                ? '¿Qué medidas permiten optimizar una HbA1c de 5.5% hacia el rango de máxima longevidad?'
                : 'What clinical measures help optimize an HbA1c of 5.5% toward peak longevity?'
            }
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
              : 'Signals progressive insulin resistance and chronic glycemic spikes. High-yield window for therapeutic metabolic optimization and GLP-1/GIP therapies.',
            clinicalProtocol: {
              slug: 'weight-management-structured-12w',
              queryParams: '?baseline=warning&hba1c_level=6.0&tier=warning&modality=incretin_sensitization&retest=12w',
              shortCode: 'REF-MET-GLP1',
              name: isEs 
                ? 'Protocolo Incretínico GLP-1/GIP: Sensibilización Temprana' 
                : 'Incretin GLP-1/GIP Protocol: Early Sensitization',
              tierTitle: isEs ? 'TIER 3 · INTERVENCIÓN PREVENTIVA TEMPRANA' : 'TIER 3 · EARLY PREVENTATIVE INTERVENTION',
              targetGoal: isEs ? 'Reducir HbA1c a < 5.5% en 12 semanas' : 'Reduce HbA1c to < 5.5% in 12 weeks',
              recommendedModality: isEs ? 'Titulación Incretínica Inicial (Tirzepatida/Semaglutida)' : 'Initial Incretin Titration (Tirzepatide/Semaglutide)',
              dosageGuide: isEs ? '2.5 mg SC semanal escalando según tolerancia' : '2.5 mg SC weekly escalating per tolerance',
              methylationRx: isEs ? 'Hidratación electrolítica y protección masa magra' : 'Electrolyte hydration & lean mass preservation',
              retestWindow: isEs ? '12 Semanas (Recambio Eritrocitario DBS)' : '12 Weeks (DBS Erythrocyte Turnover)',
              cellularTarget: isEs ? 'Células beta pancreáticas, receptor GLP-1, receptor GIP' : 'Pancreatic beta cells, GLP-1R, GIPR',
              clinicalRationale: isEs
                ? 'Ventana terapéutica crítica para revertir resistencia a la insulina antes del debut diabético franco.'
                : 'Critical clinical window to reverse insulin resistance prior to formal diabetes onset.',
              synergies: [
                { name: 'Tirzepatida SC', role: isEs ? 'Doble Agonista' : 'Dual Agonist' },
                { name: 'BPC-157', role: isEs ? 'Protección Gástrica' : 'Gastric Shield' },
                { name: 'Electrolitos', role: isEs ? 'Hidratación' : 'Hydration' }
              ],
              aiQuery: isEs
                ? '¿Cómo iniciar la titulación con agonistas duales GLP-1/GIP en prediabetes con HbA1c entre 5.7% y 6.4%?'
                : 'How to titrate dual GLP-1/GIP agonists in prediabetes with HbA1c between 5.7% and 6.4%?'
            }
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
              : 'Diagnostic threshold for diabetes mellitus. Demands clinical supervision, lifestyle intervention, and physician follow-up.',
            clinicalProtocol: {
              slug: 'weight-management-structured-12w',
              queryParams: '?baseline=elevated&hba1c_level=6.8&tier=critical&modality=dual_agonist_titration&retest=12w',
              shortCode: 'REF-MET-GLP1',
              name: isEs 
                ? 'Protocolo Incretínico GLP-1/GIP: Titulación Terapéutica Intensiva' 
                : 'Incretin GLP-1/GIP Protocol: Intensive Titration',
              tierTitle: isEs ? 'TIER 4 · TITULACIÓN TERAPÉUTICA INTENSIVA' : 'TIER 4 · INTENSIVE THERAPEUTIC TITRATION',
              targetGoal: isEs ? 'Control glucémico estricto (HbA1c < 6.0%)' : 'Strict glycemic control (HbA1c < 6.0%)',
              recommendedModality: isEs ? 'Agonismo Dual Incretínico con Titulación Gradual' : 'Dual Incretin Agonism with Stepwise Titration',
              dosageGuide: isEs ? 'Titulación mensual 2.5 mg → 5.0 mg → 7.5 mg SC' : 'Monthly titration 2.5 mg → 5.0 mg → 7.5 mg SC',
              methylationRx: isEs ? 'Supervisión médica integral y monitorización continua de glucosa' : 'Full medical supervision & continuous glucose monitoring',
              retestWindow: isEs ? '12 Semanas (Evaluación Trimestral DBS)' : '12 Weeks (Quarterly DBS Review)',
              cellularTarget: isEs ? 'Sensibilidad insulínica periférica y vaciamiento gástrico' : 'Peripheral insulin sensitivity & gastric emptying',
              clinicalRationale: isEs
                ? 'Nivel de glucemia elevada que requiere control riguroso para prevenir complicaciones microvasculares.'
                : 'Elevated HbA1c demanding intensive incretin therapy to mitigate microvascular risks.',
              synergies: [
                { name: 'Tirzepatida SC', role: isEs ? 'Agonista Dual' : 'Dual Agonist' },
                { name: 'Monitoreo CGM', role: isEs ? 'Control Glucosa' : 'Glucose Monitoring' },
                { name: 'Retest DBS', role: isEs ? 'Control Trimestral' : 'Quarterly Audit' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el protocolo escalonado de titulación de incretinas para HbA1c ≥ 6.5%?'
                : 'What is the stepwise incretin titration protocol for HbA1c ≥ 6.5%?'
            }
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
        officialReportPdf: '/docs/bloodo-report-omega-ratio.pdf',
        officialReportDocName: 'bloodo-report-omega-ratio.pdf',
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
              : 'Severe cellular fatty acid imbalance, high eicosanoid inflammation, and elevated cardiovascular risk profile.',
            clinicalProtocol: {
              slug: 'injury-recovery-8w',
              queryParams: '?baseline=critical&omega_ratio=3.2&tier=critical&modality=tissue_bioregulation&retest=12w',
              shortCode: 'REF-RECOV-BPC',
              name: isEs 
                ? 'Protocolo de Rescate Tisular: BPC-157, TB-500 y Resolución Inflamatoria' 
                : 'Tissue Rescue Protocol: BPC-157, TB-500 & Anti-Inflammatory Resolution',
              tierTitle: isEs ? 'TIER 1 · RESCATE TISULAR Y RESOLUCIÓN INFLAMATORIA' : 'TIER 1 · TISSUE RESCUE & RESOLUTION',
              targetGoal: isEs ? 'Elevar Índice Omega-3 a > 8.0% y recuperar fluidez' : 'Elevate Omega-3 Index > 8.0% and restore fluidity',
              recommendedModality: isEs ? 'Biorregulación Tisular SubQ + Dosis de Carga EPA/DHA' : 'SubQ Tissue Bioregulation + High-Dose EPA/DHA Loading',
              dosageGuide: isEs ? 'BPC-157 250 mcg 2x/día + TB-500 2.5 mg 2x/sem + EPA/DHA 3.000 mg' : 'BPC-157 250 mcg 2x/day + TB-500 2.5 mg 2x/wk + EPA/DHA 3,000 mg',
              methylationRx: isEs ? 'Antioxidantes lipídicos (Vitamina E tocoferoles mixtos)' : 'Lipid antioxidants (mixed tocopherols Vitamin E)',
              retestWindow: isEs ? '12 Semanas (Recambio de Membranas DBS)' : '12 Weeks (DBS Membrane Turnover)',
              cellularTarget: isEs ? 'Bicapa lipídica eritrocitaria, cascada COX/LOX, eicosanoides' : 'Erythrocyte lipid bilayer, COX/LOX cascade, eicosanoids',
              clinicalRationale: isEs
                ? 'Rigidez de membrana celular y alta producción de eicosanoides inflamatorios. Se indica rescate con péptidos reparadores tisulares y dosis de carga de ácidos grasos poliinsaturados.'
                : 'Cellular membrane rigidity and pro-inflammatory signaling. Clinical indication for regenerative peptides and high-purity EPA/DHA loading.',
              synergies: [
                { name: 'BPC-157 SubQ', role: isEs ? 'Reparación Endotelial' : 'Endothelial Repair' },
                { name: 'TB-500 SubQ', role: isEs ? 'Migración Celular' : 'Actin Regulation' },
                { name: 'EPA/DHA 3g', role: isEs ? 'Remodelado Membrana' : 'Lipid Remodeling' }
              ],
              aiQuery: isEs
                ? '¿Cómo actúan BPC-157 y TB-500 frente a un índice Omega-3 deprimido (< 4%) con alto riesgo inflamatorio?'
                : 'How do BPC-157 and TB-500 aid tissue repair when the Omega-3 index is depressed (< 4%)?'
            }
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
              : 'Typical Western baseline. Intermediate cardiovascular protection; highly responsive to high-purity EPA/DHA titration.',
            clinicalProtocol: {
              slug: 'injury-recovery-8w',
              queryParams: '?baseline=suboptimal&omega_ratio=6.0&tier=warning&modality=repletion&retest=12w',
              shortCode: 'REF-RECOV-BPC',
              name: isEs 
                ? 'Protocolo de Biorregulación y Optimización Vascular' 
                : 'Bioregulation & Vascular Optimization Protocol',
              tierTitle: isEs ? 'TIER 2 · OPTIMIZACIÓN VASCULAR & CELULAR' : 'TIER 2 · VASCULAR & CELLULAR OPTIMIZATION',
              targetGoal: isEs ? 'Optimizar al rango cardioprotector (> 8.0%)' : 'Optimize to cardioprotective zone (> 8.0%)',
              recommendedModality: isEs ? 'Microdosificación de Péptidos y Repleción Nutracéutica' : 'Peptide Micro-Dosing & Nutraceutical Repletion',
              dosageGuide: isEs ? 'BPC-157 250 mcg diario + EPA/DHA 2.000 mg diario' : 'BPC-157 250 mcg daily + EPA/DHA 2,000 mg daily',
              methylationRx: isEs ? 'Soporte con coenzima Q10 y astaxantina' : 'CoQ10 and astaxanthin antioxidant support',
              retestWindow: isEs ? '12 Semanas (Recambio Membrana DBS)' : '12 Weeks (DBS Membrane Turnover)',
              cellularTarget: isEs ? 'Fluidez de membrana y función mitocondrial' : 'Membrane fluidity & mitochondrial function',
              clinicalRationale: isEs
                ? 'Protección intermedia. La optimización a > 8% reduce marcadamente el riesgo cardiovascular y acelera la recuperación post-ejercicio.'
                : 'Intermediate baseline. Achieving > 8% significantly lowers cardiovascular mortality and accelerates recovery.',
              synergies: [
                { name: 'BPC-157 250mcg', role: isEs ? 'Biorregulación' : 'Bioregulation' },
                { name: 'EPA/DHA 2g', role: isEs ? 'Repleción' : 'Repletion' },
                { name: 'Retest DBS', role: isEs ? 'Control Trimestral' : 'Quarterly Audit' }
              ],
              aiQuery: isEs
                ? '¿Qué pauta combinada de péptidos y ácidos grasos se sugiere para un índice Omega-3 intermedio de 5% a 7%?'
                : 'What peptide and fatty acid schedule is advised for an intermediate Omega-3 index of 5% to 7%?'
            }
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
              : 'Target longevity zone associated with lowest all-cause cardiovascular mortality and maximal anti-inflammatory resolution.',
            clinicalProtocol: {
              slug: 'injury-recovery-8w',
              queryParams: '?baseline=optimal&omega_ratio=9.2&tier=optimal&modality=maintenance&retest=6m',
              shortCode: 'REF-RECOV-BPC',
              name: isEs 
                ? 'Protocolo de Mantenimiento Celular y Longevidad Vascular' 
                : 'Cellular Maintenance & Vascular Longevity Protocol',
              tierTitle: isEs ? 'TIER 3 · MANTENIMIENTO HOMEOSTÁTICO' : 'TIER 3 · HOMEOSTATIC MAINTENANCE',
              targetGoal: isEs ? 'Sostener índice > 8.0% de forma indefinida' : 'Sustain index > 8.0% continuously',
              recommendedModality: isEs ? 'Mantenimiento Domiciliario Fisiológico' : 'Physiological At-Home Maintenance',
              dosageGuide: isEs ? 'EPA/DHA 1.000–1.500 mg diario de mantenimiento' : 'EPA/DHA 1,000–1,500 mg daily maintenance',
              methylationRx: isEs ? 'Aporte dietético de polifenoles y aceite de oliva virgen extra' : 'Dietary polyphenols & EVOO',
              retestWindow: isEs ? '6 Meses (Vigilancia Semestral DBS)' : '6 Months (Biannual DBS Audit)',
              cellularTarget: isEs ? 'Homeostasis de membrana y señalización celular' : 'Membrane homeostasis & cellular signaling',
              clinicalRationale: isEs
                ? 'Zona diana de longevidad celular. Fluidez óptima de membrana y resolución activa de cualquier foco pro-inflamatorio.'
                : 'Target longevity zone. Peak membrane fluidity and efficient cellular resolution.',
              synergies: [
                { name: 'Omega-3 1.5g', role: isEs ? 'Mantenimiento' : 'Maintenance' },
                { name: 'Monitoreo DBS', role: isEs ? 'Control Semestral' : 'Biannual Audit' }
              ],
              aiQuery: isEs
                ? '¿Cómo estructurar el mantenimiento vascular cuando el índice Omega-3 ya se encuentra en rango cardioprotector (> 8%)?'
                : 'How to structure vascular maintenance when the Omega-3 index is already cardioprotective (> 8%)?'
            }
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
        officialReportPdf: '/docs/bloodo-report-cortisol-am-pm.pdf',
        officialReportDocName: 'bloodo-report-cortisol-am-pm.pdf',
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
              : 'Critically depressed morning awakening level indicative of severe HPA axis exhaustion, chronic burnout syndrome, orthostatic hypotension, and impaired stress resilience.',
            clinicalProtocol: {
              slug: 'sleep-restoration-8w',
              queryParams: '?baseline=exhaustion&cortisol_level=110&tier=critical&modality=neurorestoration&retest=8w',
              shortCode: 'REF-CORT-REST',
              name: isEs 
                ? 'Protocolo de Rescate Adrenal y Recuperación Neuroendocrina' 
                : 'Adrenal Burnout & Neuro-Endocrine Recovery Protocol',
              tierTitle: isEs ? 'TIER 1 · RESCATE DEL EJE HPA Y RECUPERACIÓN ADRENAL' : 'TIER 1 · HPA AXIS RESCUE & ADRENAL RECOVERY',
              targetGoal: isEs ? 'Restaurar el pico matutino de cortisol (CAR) a ≥ 250 nmol/L' : 'Restore morning cortisol awakening response (CAR) to ≥ 250 nmol/L',
              recommendedModality: isEs ? 'Biorregulación Pineal Matutina + Soporte Suprarrenal Fisiológico' : 'Morning Pineal Bioregulation + Adrenal Adaptogen Support',
              dosageGuide: isEs ? 'Semax 0.1% gotas intranasales matutinas (200 mcg) + Epithalon 500 mcg SC cada 3 días x 8 semanas' : 'Semax 0.1% intranasal morning drops (200 mcg) + Epithalon 500 mcg SC every 3 days x 8 weeks',
              methylationRx: isEs ? 'Extracto de Regaliz DGL + Pregnenolona 25 mg + Vitamina C 1.000 mg + Sodio marino' : 'DGL Licorice + Pregnenolone 25 mg + Vitamin C 1,000 mg + Sea salt electrolytes',
              retestWindow: isEs ? 'Semana 8 (Curva AM/PM en tratamiento activo)' : 'Week 8 (Diurnal AM/PM slope on treatment)',
              cellularTarget: isEs ? 'Corteza suprarrenal (zona fasciculata), BDNF hipocampal, receptores CRH' : 'Adrenal cortex (zona fasciculata), hippocampal BDNF, CRH receptors',
              clinicalRationale: isEs
                ? 'Agotamiento profundo de la reserva corticosuprarrenal con incapacidad de producir la respuesta de vigilia al despertar (CAR). Se pautan péptidos reguladores neurotróficos (Semax) para revertir la atrofia dendrítica inducida por estrés crónico y Epithalon para resincronizar el reloj pineal, junto con precursores de esteroides suprarrenales.'
                : 'Profound exhaustion of adrenocortical functional reserve with flattened morning awakening response. Indications warrant neurotrophic peptides (Semax) to reverse stress-induced hippocampal dendritic atrophy and Epithalon to resynchronize pineal clockwork, supported by adrenal adaptogens.',
              synergies: [
                { name: 'Semax 200mcg AM', role: isEs ? 'Neuroprotección BDNF' : 'BDNF Neuroprotection' },
                { name: 'Epithalon 500mcg', role: isEs ? 'Sincronía Pineal' : 'Pineal Resync' },
                { name: 'Pregnenolona 25mg', role: isEs ? 'Sustrato Suprarrenal' : 'Adrenal Substrate' },
                { name: 'Electrolitos Sodio', role: isEs ? 'Tono Vascular' : 'Vascular Tone' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el protocolo con Semax y Epithalon para fatiga suprarrenal avanzada con cortisol inferior a 140 nmol/L?'
                : 'What is the protocol with Semax and Epithalon for adrenal burnout with cortisol below 140 nmol/L?'
            }
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
              : 'Healthy cortisol awakening response (CAR). Reflects balanced hypothalamic-pituitary-adrenal (HPA) axis dynamics, robust morning alertness, and balanced diurnal rhythm.',
            clinicalProtocol: {
              slug: 'sleep-restoration-8w',
              queryParams: '?baseline=balanced&cortisol_level=350&tier=optimal&modality=maintenance&retest=6m',
              shortCode: 'REF-CORT-REST',
              name: isEs 
                ? 'Protocolo de Mantenimiento Circadiano y Sueño Profundo' 
                : 'Circadian Longevity & Deep Sleep Maintenance',
              tierTitle: isEs ? 'TIER 2 · HOMEOSTASIS CIRCADIANA Y VIGILANCIA' : 'TIER 2 · CIRCADIAN HOMEOSTASIS & SLEEP MONITORING',
              targetGoal: isEs ? 'Mantener pendiente diurna fisiológica (CAR vigoroso y nadir nocturno)' : 'Sustain physiological diurnal slope (sharp CAR and deep evening nadir)',
              recommendedModality: isEs ? 'Mantenimiento del Ciclo Sueño-Vigilia y Biorregulación' : 'Sleep-Wake Architecture & Bioregulation',
              dosageGuide: isEs ? 'Epithalon 100 mcg SC nocturno o DSIP 100 mcg pre-cama en periodos de sobrecarga de trabajo' : 'Epithalon 100 mcg SC nightly or DSIP 100 mcg pre-bed during high-workload cycles',
              methylationRx: isEs ? 'Magnesio L-Treonato 400 mg nocturno + Apigenina 50 mg' : 'Magnesium L-Threonate 400 mg nightly + Apigenin 50 mg',
              retestWindow: isEs ? '6 Meses (Monitoreo semestral DBS)' : '6 Months (Biannual DBS Surveillance)',
              cellularTarget: isEs ? 'Fase delta de ondas lentas, receptores GABA-A, supresión de cortisol nocturno' : 'Stage-4 slow wave delta sleep, GABA-A receptors, nocturnal nadir',
              clinicalRationale: isEs
                ? 'Respuesta circadiana equilibrada. El objetivo clínico es consolidar la pendiente diurna evitando elevaciones anómalas nocturnas mediante péptidos que favorecen la arquitectura del sueño no REM (DSIP).'
                : 'Balanced circadian dynamics. The clinical endpoint is sustaining the diurnal cortisol slope and protecting the restorative nocturnal nadir through delta sleep modulation (DSIP).',
              synergies: [
                { name: 'DSIP 100mcg pre-cama', role: isEs ? 'Sueño Delta Ondas Lentas' : 'Slow-Wave Sleep' },
                { name: 'Magnesio Treonato', role: isEs ? 'Relajación Sináptica' : 'Synaptic Relaxation' },
                { name: 'Luz Solar Matutina', role: isEs ? 'Anclaje Circadiano' : 'Circadian Anchor' },
                { name: 'Control Semestral', role: isEs ? 'Vigilancia DBS' : 'DBS Surveillance' }
              ],
              aiQuery: isEs
                ? '¿Cómo optimizar la pendiente diurna de cortisol y el sueño profundo cuando los niveles matutinos son normales?'
                : 'How to optimize diurnal cortisol slope and deep sleep when morning cortisol levels are normal?'
            }
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
              : 'Persistent sympathetic nervous drive. Associated with chronic allostatic load, sleep architecture disruption, early insulin resistance, and elevated cardiovascular strain.',
            clinicalProtocol: {
              slug: 'sleep-restoration-8w',
              queryParams: '?baseline=allostatic&cortisol_level=620&tier=warning&modality=anxiolytic&retest=8w',
              shortCode: 'REF-CORT-REST',
              name: isEs 
                ? 'Protocolo de Descompresión del Eje HPA y Modulación GABAérgica' 
                : 'HPA Axis Decompression & GABAergic Modulation Protocol',
              tierTitle: isEs ? 'TIER 3 · DESCOMPRESIÓN ALOSTÁTICA Y FRENO CORTISÓLICO' : 'TIER 3 · ALLOSTATIC DECOMPRESSION & CORTISOL DAMPENING',
              targetGoal: isEs ? 'Atenuar la hiperreactividad simpática y normalizar cortisol matutino < 500 nmol/L' : 'Dampen sympathetic overdrive and normalize morning cortisol < 500 nmol/L',
              recommendedModality: isEs ? 'Neuropéptidos Ansiolíticos No Sedantes + Inhibidores de Cortisol Vespertino' : 'Non-Sedating Anxiolytic Neuropeptides + Evening Cortisol Dampeners',
              dosageGuide: isEs ? 'Selank 0.15% 2–3 gotas intranasales 2x/día + Fosfatidilserina 300 mg antes de la cena' : 'Selank 0.15% 2–3 drops intranasal 2x/day + Phosphatidylserine 300 mg pre-dinner',
              methylationRx: isEs ? 'L-Teanina 200 mg + Ashwagandha Sensoril 250 mg + Magnesio Glicinato 400 mg' : 'L-Theanine 200 mg + Sensoril Ashwagandha 250 mg + Magnesium Glycinate 400 mg',
              retestWindow: isEs ? 'Semana 8 (Evaluación de respuesta alostática)' : 'Week 8 (Allostatic response evaluation)',
              cellularTarget: isEs ? 'Neurotransmisión GABA, receptores IL-6, eje noradrenérgico central' : 'GABA neurotransmission, IL-6 receptors, central noradrenergic drive',
              clinicalRationale: isEs
                ? 'Sobrecarga alostática subaguda con hiperactivación simpática y aumento de citoquinas inflamatorias. El heptapéptido Selank modula la expresión de receptores GABA sin generar dependencia ni embotamiento, reduciendo la secreción de ACTH ante el estrés ocupacional.'
                : 'Subacute allostatic overload with sympathetic hyperactivity. Selank provides precise allosteric GABA receptor modulation without sedation, suppressing stress-induced ACTH secretion and inflammatory signaling.',
              synergies: [
                { name: 'Selank Intranasal', role: isEs ? 'Modulador GABAérgico' : 'GABA Modulator' },
                { name: 'Fosfatidilserina 300mg', role: isEs ? 'Freno Vespertino' : 'Evening Cortisol Brake' },
                { name: 'Ashwagandha Sensoril', role: isEs ? 'Resiliencia Alostática' : 'Stress Resilience' },
                { name: 'L-Teanina', role: isEs ? 'Ondas Alfa Cerebrales' : 'Alpha Brain Waves' }
              ],
              aiQuery: isEs
                ? '¿Cómo utilizar Selank y Fosfatidilserina para rebajar cortisol elevado en rango de estrés de 550 a 690 nmol/L?'
                : 'How to use Selank and Phosphatidylserine to reduce elevated stress cortisol between 550 and 690 nmol/L?'
            }
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
              : 'Marked glucocorticoid excess driving muscle catabolism, visceral adiposity, immune suppression, and hippocampal neurotoxicity. Demands clinical intervention.',
            clinicalProtocol: {
              slug: 'sleep-restoration-8w',
              queryParams: '?baseline=hypercortisol&cortisol_level=750&tier=critical&modality=urgent&retest=6w',
              shortCode: 'REF-CORT-REST',
              name: isEs 
                ? 'Protocolo de Rescate Neuroprotector y Neutralización Catabólica' 
                : 'Neuroprotective Rescue & Anti-Catabolic Protocol',
              tierTitle: isEs ? 'TIER 4 · INTERVENCIÓN CLÍNICA URGENTE Y NEUROPROTECCIÓN' : 'TIER 4 · CLINICAL INTERVENTION & NEUROPROTECTION',
              targetGoal: isEs ? 'Frenar catabolismo proteico y suprimir neurotoxicidad hipocampal' : 'Halt muscle catabolism and suppress hippocampal neurotoxicity',
              recommendedModality: isEs ? 'Terapia Combinada Dual (Selank + Semax) + Fosfatidilserina Dosis Alta' : 'Dual Peptide Therapy (Selank + Semax) + High-Dose Phosphatidylserine',
              dosageGuide: isEs ? 'Selank 300 mcg AM/PM + Fosfatidilserina 600 mg diario (repartido tarde/noche) + DSIP 100 mcg nocturno' : 'Selank 300 mcg AM/PM + Phosphatidylserine 600 mg daily (split PM) + DSIP 100 mcg nightly',
              methylationRx: isEs ? 'Vitamina C 2.000 mg + Magnesio Treonato 600 mg + Taurina 2.000 mg' : 'Vitamin C 2,000 mg + Magnesium Threonate 600 mg + Taurine 2,000 mg',
              retestWindow: isEs ? 'Semana 6 (Control prioritario de pendiente diurna DCS)' : 'Week 6 (Priority DCS diurnal slope check)',
              cellularTarget: isEs ? 'Receptores de glucocorticoides (GR), sinapsis CA1 hipocampal, miocitos' : 'Glucocorticoid receptors (GR), hippocampal CA1 neurons, myocytes',
              clinicalRationale: isEs
                ? 'Hipercortisolemia severa que induce atrofia muscular por ubiquitinación proteica, resistencia a la insulina y neurotoxicidad en células piramidales del hipocampo. Requiere intervención inmediata para amortiguar el tono simpático y proteger la plasticidad sináptica.'
                : 'Severe glucocorticoid excess inducing muscular atrophy via proteasome ubiquitination, insulin resistance, and hippocampal neurotoxicity. Demands immediate neuroprotection and high-dose glucocorticoid dampening.',
              synergies: [
                { name: 'Selank + Semax Dual', role: isEs ? 'Neuroprotección Urgente' : 'Urgent Neuroprotection' },
                { name: 'Fosfatidilserina 600mg', role: isEs ? 'Bloqueo ACTH' : 'ACTH Blocker' },
                { name: 'DSIP 100mcg', role: isEs ? 'Nadir Nocturno' : 'Nocturnal Nadir' },
                { name: 'Re-test a Semana 6', role: isEs ? 'Seguridad Analítica' : 'Safety Check' }
              ],
              aiQuery: isEs
                ? '¿Qué medidas clínicas urgentes y neuropéptidos se recomiendan ante hipercortisolemia grave superior a 690 nmol/L?'
                : 'What urgent clinical measures and peptides are indicated for severe hypercortisolemia exceeding 690 nmol/L?'
            }
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
        officialReportPdf: testosteroneGender === 'female' ? '/docs/bloodo-report-testosterone-female.pdf' : '/docs/bloodo-report-testosterone-male.pdf',
        officialReportDocName: testosteroneGender === 'female' ? 'bloodo-report-testosterone-female.pdf' : 'bloodo-report-testosterone-male.pdf',
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
              : 'Severe androgen deficiency correlated with accelerated sarcopenia, osteopenia, depressive mood, erectile dysfunction, and reduced metabolic clearance.',
            clinicalProtocol: {
              slug: 'hormonal-support-12w',
              queryParams: '?baseline=deficient&testosterone_level=8.5&tier=critical&modality=secretagogues&retest=8w',
              shortCode: 'REF-TEST-HPTA',
              name: isEs 
                ? 'Protocolo de Reinicio Endocrino HPTA: Kisspeptina y Gonadorelina' 
                : 'HPTA Endocrine Restart Protocol: Kisspeptin & Gonadorelin',
              tierTitle: isEs ? 'TIER 1 · RESCATE ENDOCRINO Y REACTIVACIÓN DEL EJE HPTA' : 'TIER 1 · NEURO-ENDOCRINE HPTA AXIS RESCUE',
              targetGoal: isEs ? 'Elevar testosterona total a ≥ 18 nmol/L (≥ 520 ng/dL)' : 'Escalate total testosterone to ≥ 18 nmol/L (≥ 520 ng/dL)',
              recommendedModality: isEs ? 'Microdosificación Subcutánea de Secretagogos (Sin atrofia testicular)' : 'Subcutaneous Neuro-Endocrine Secretagogues (Non-suppressive)',
              dosageGuide: isEs ? 'Kisspeptin-10 100 mcg SC 2–3x/semana + hCG 500 UI 2x/semana alternado x 8–12 semanas' : 'Kisspeptin-10 100 mcg SC 2–3x/week + hCG 500 IU 2x/week alternating x 8–12 weeks',
              methylationRx: isEs ? 'Zinc Bisglicinato 30–50 mg + DIM 150 mg (Protección contra aromatización periférica)' : 'Zinc Bisglycinate 30–50 mg + DIM 150 mg (Peripheral aromatase safeguard)',
              retestWindow: isEs ? 'Semana 8 (Evaluación hormonal en tratamiento activo)' : 'Week 8 (On-treatment biomarker evaluation)',
              cellularTarget: isEs ? 'Neuronas GnRH hipotalámicas, receptores LH en células de Leydig, StAR' : 'Hypothalamic GnRH neurons, Leydig cell LH receptors, StAR protein',
              clinicalRationale: isEs
                ? 'Hipogonadismo con fallo de pulsatilidad hipofisaria. Requiere reactivación pulsátil del eje HPTA mediante agonistas del receptor KISS1 (Kisspeptina-10) y biomiméticos de LH (hCG), estimulando la esteroidogénesis endógena y preservando la fertilidad y el volumen testicular sin retroalimentación negativa.'
                : 'Clinical hypogonadism with impaired pituitary-gonadal signaling. Demands pulsatile reactivation of the hypothalamic-pituitary-gonadal axis using KISS1 receptor agonists (Kisspeptin-10) and LH biomimetics (hCG), stimulating endogenous steroidogenesis while preserving fertility and testicular volume.',
              synergies: [
                { name: 'Kisspeptin-10 100mcg', role: isEs ? 'Pulsatilidad GnRH' : 'GnRH Pulsatility' },
                { name: 'hCG 500 UI', role: isEs ? 'Estímulo Leydig' : 'Leydig Stimulation' },
                { name: 'Testagen', role: isEs ? 'Biorregulador Testicular' : 'Testicular Bioregulator' },
                { name: 'Zinc + DIM', role: isEs ? 'Control Aromatasa' : 'Aromatase Control' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el protocolo de reactivación del eje HPTA con Kisspeptin-10 y hCG cuando la testosterona es inferior a 10 nmol/L?'
                : 'What is the recommended HPTA restart protocol using Kisspeptin-10 and hCG for testosterone below 10 nmol/L?'
            }
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
              : 'Suboptimal androgenic reserve typical in metabolic syndrome or chronic stress. Responds well to lifestyle interventions, enclomiphene, or restorative secretagogues.',
            clinicalProtocol: {
              slug: 'hormonal-support-12w',
              queryParams: '?baseline=suboptimal&testosterone_level=12.5&tier=warning&modality=bioregulators&retest=8w',
              shortCode: 'REF-TEST-HPTA',
              name: isEs 
                ? 'Protocolo de Optimización Androgénica y Biorregulación Testicular' 
                : 'Androgenic Optimization & Testicular Bioregulation',
              tierTitle: isEs ? 'TIER 2 · OPTIMIZACIÓN SECRETAGOGA Y VITALIDAD' : 'TIER 2 · SECRETAGOGUE & VITALITY OPTIMIZATION',
              targetGoal: isEs ? 'Alcanzar el rango diana de vitalidad 18 – 25 nmol/L (520 – 720 ng/dL)' : 'Reach target vitality range 18 – 25 nmol/L (520 – 720 ng/dL)',
              recommendedModality: isEs ? 'Péptidos Biorreguladores Testiculares + Modulación de SHBG' : 'Testicular Bioregulators + SHBG Modulation',
              dosageGuide: isEs ? 'Testagen 2 cápsulas/día matutino en ciclos de 20 días + Sermorelin 200 mcg nocturno' : 'Testagen 2 caps/day morning (20-day cycles) + Sermorelin 200 mcg nightly',
              methylationRx: isEs ? 'Boro 10 mg/día (reducción de SHBG) + Magnesio Bisglicinato 400 mg' : 'Boron 10 mg/day (SHBG reduction) + Magnesium Bisglycinate 400 mg',
              retestWindow: isEs ? 'Semana 8 (Evaluación de respuesta biológica)' : 'Week 8 (Biological response evaluation)',
              cellularTarget: isEs ? 'Síntesis proteica testicular, modulación de SHBG, eje somatotrópico' : 'Testicular protein synthesis, SHBG modulation, somatotropic axis',
              clinicalRationale: isEs
                ? 'Déficit androgénico funcional frecuente por estrés alostático, sobrepeso o descenso de pulsatilidad hipofisaria. Se prioriza la restauración funcional mediante el péptido biorregulador Testagen combinado con secretagogos nocturnos de GH (Sermorelin) y reducción de SHBG para liberar testosterona libre biodisponible.'
                : 'Functional androgenic deficiency driven by allostatic load, visceral adiposity, or reduced pituitary output. Responsive to targeted bioregulator therapy (Testagen) combined with nocturnal GH secretagogues (Sermorelin) and SHBG optimization to expand free bioavailable testosterone.',
              synergies: [
                { name: 'Testagen', role: isEs ? 'Biorregulación Celular' : 'Cellular Bioregulation' },
                { name: 'Sermorelin 200mcg', role: isEs ? 'Sinergia GH/IGF-1' : 'GH/IGF-1 Axis' },
                { name: 'Boro 10mg', role: isEs ? 'Liberación Testo Libre' : 'Free T Liberation' },
                { name: 'Ashwagandha KSM-66', role: isEs ? 'Freno Cortisol' : 'Cortisol Buffer' }
              ],
              aiQuery: isEs
                ? '¿Cómo estructurar un protocolo con Testagen y Sermorelin para optimizar testosterona en rango límite (10–15 nmol/L)?'
                : 'How to structure a protocol with Testagen and Sermorelin for borderline testosterone (10-15 nmol/L)?'
            }
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
              : 'Ideal physiological target supporting lean body mass retention, optimal neurocognitive clarity, robust bone mineral density, and metabolic vigor.',
            clinicalProtocol: {
              slug: 'hormonal-support-12w',
              queryParams: '?baseline=optimal&testosterone_level=22&tier=optimal&modality=maintenance&retest=6m',
              shortCode: 'REF-TEST-HPTA',
              name: isEs 
                ? 'Protocolo de Mantenimiento Androgénico y Homeostasis Circadiana' 
                : 'Androgenic Longevity & Circadian Maintenance',
              tierTitle: isEs ? 'TIER 3 · VIGILANCIA Y MANTENIMIENTO HOMEOSTÁTICO' : 'TIER 3 · SURVEILLANCE & HOMEOSTATIC MAINTENANCE',
              targetGoal: isEs ? 'Sostener homeostasis androgénica juvenil (18 – 25 nmol/L)' : 'Sustain youthful androgenic homeostasis (18 – 25 nmol/L)',
              recommendedModality: isEs ? 'Pulsos Intermitentes de Biorregulación y Sueño Profundo' : 'Intermittent Bioregulation Pulsing & Sleep Architecture',
              dosageGuide: isEs ? 'Ciclos trimestrales de Testagen (10 días) + optimización de fase delta con DSIP' : 'Quarterly Testagen cycles (10 days) + delta-sleep support with DSIP',
              methylationRx: isEs ? 'Vitamina D3 5.000 UI + K2 (MK-7) 100 mcg + Zinc 15 mg' : 'Vitamin D3 5,000 IU + K2 (MK-7) 100 mcg + Zinc 15 mg',
              retestWindow: isEs ? '6 Meses (Monitorización semestral DBS)' : '6 Months (Biannual DBS Surveillance)',
              cellularTarget: isEs ? 'Densidad mineral ósea, masa muscular magra, neurovigor' : 'Bone mineral density, lean muscle mass, neurovascular tone',
              clinicalRationale: isEs
                ? 'Perfil androgénico óptimo asociado a máxima retención de masa magra, vigor psicofísico y salud cardiovascular. Se pautan micro-pulsos intermitentes de biorreguladores peptídicos y vigilancia semestral mediante punción capilar para monitorizar el ratio testosterona/cortisol sin intervención exógena.'
                : 'Optimal androgenic status associated with lean body mass preservation, neurocognitive clarity, and metabolic health. Intermittent bioregulatory pulsing and biannual capillary surveillance maintain physiological equilibrium without exogenous endocrine disruption.',
              synergies: [
                { name: 'Testagen Ciclado', role: isEs ? 'Mantenimiento Testicular' : 'Testicular Maintenance' },
                { name: 'DSIP 100mcg', role: isEs ? 'Pico Nocturno Testo' : 'Nocturnal T Peak' },
                { name: 'Vitamina D3/K2', role: isEs ? 'Regulación Genómica' : 'Genomic VDR Support' },
                { name: 'Monitoreo DBS', role: isEs ? 'Control Semestral' : 'Biannual Surveillance' }
              ],
              aiQuery: isEs
                ? '¿Qué pauta de mantenimiento y estilo de vida preserva niveles de testosterona en rango óptimo de 18 a 28 nmol/L?'
                : 'What maintenance and peptide schedule preserves optimal testosterone between 18 and 28 nmol/L?'
            }
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
              : 'Upper physiological threshold achieved in young athletic baselines or monitored hormone optimization programs. Maximum anabolic support.',
            clinicalProtocol: {
              slug: 'hormonal-support-12w',
              queryParams: '?baseline=peak&testosterone_level=32&tier=super&modality=safety&retest=8w',
              shortCode: 'REF-TEST-HPTA',
              name: isEs 
                ? 'Protocolo de Seguridad Endocrina, Hematocrito y Aromatización' 
                : 'Endocrine Safety, Hematocrit & Aromatase Surveillance',
              tierTitle: isEs ? 'TIER 4 · TITULACIÓN CLÍNICA Y CONTROL DE SEGURIDAD' : 'TIER 4 · CLINICAL TITRATION & SAFETY SURVEILLANCE',
              targetGoal: isEs ? 'Verificar hematocrito (<52%), estradiol (<35 pg/mL) y PSA' : 'Verify hematocrit (<52%), sensitive estradiol, and PSA',
              recommendedModality: isEs ? 'Pausa Terapéutica / Ventana de Lavado de Secretagogos' : 'Therapeutic Washout / Secretagogue Titration Pause',
              dosageGuide: isEs ? 'Reducción de dosis activa; monitorizar panel hematológico y perfil lipídico' : 'Dose de-escalation; monitor complete blood count (CBC) and lipid panel',
              methylationRx: isEs ? 'Hidratación abundante + Omega-3 EPA/DHA 3.000 mg + Citrus Bergamota' : 'Hydration + Omega-3 EPA/DHA 3,000 mg + Citrus Bergamot (Lipid protection)',
              retestWindow: isEs ? 'Semana 8 (Control analítico hematológico)' : 'Week 8 (Hematology safety check)',
              cellularTarget: isEs ? 'Viscosidad sanguínea, eritropoyesis, receptor de estrógeno beta' : 'Blood viscosity, erythropoiesis, estrogen receptor-beta',
              clinicalRationale: isEs
                ? 'Concentración suprafisiológica típica de protocolos activos intensivos o atletas de alta respuesta. Demanda verificación de hematocrito para descartar hiperviscosidad sanguínea, control de estradiol para prevenir ginecomastia o retención hídrica, y aplicación de ventana de descanso de secretagogos.'
                : 'Upper physiological threshold typical of intensive secretagogue therapy. Warrants hematocrit monitoring to rule out polycythemia, sensitive estradiol tracking to prevent aromatization symptoms, and cycling pauses to allow endogenous receptor resensitization.',
              synergies: [
                { name: 'Control Hematocrito', role: isEs ? 'Seguridad Reológica' : 'Rheological Safety' },
                { name: 'DIM / Anastrozol', role: isEs ? 'Modulación Estradiol' : 'Estradiol Control' },
                { name: 'Omega-3 EPA 2g', role: isEs ? 'Fluidez Sanguínea' : 'Vascular Fluidity' },
                { name: 'Cycling / Washout', role: isEs ? 'Ventana de Descanso' : 'Washout Window' }
              ],
              aiQuery: isEs
                ? '¿Qué controles médicos de seguridad (hematocrito, PSA, estradiol) son esenciales cuando la testosterona supera los 28 nmol/L?'
                : 'What medical safety controls (hematocrit, PSA, estradiol) are required when testosterone exceeds 28 nmol/L?'
            }
          }
        ]
      };
    }

    // ═══════════════════════════════════════════════════════════════════
    // TELETEST — HTMA (Hair Tissue Mineral Analysis / Mineralograma Capilar)
    // Methodology: ICP-MS / ICP-OES · Specimen: Proximal 3cm scalp hair
    // Lab: Analytika (EU ISO 17025 accredited)
    // ═══════════════════════════════════════════════════════════════════
    if (isTeletestHTMA) {
      return {
        name: isEs ? 'Mineralograma Capilar (HTMA) — 36+ Elementos' : 'Hair Tissue Mineral Analysis (HTMA) — 36+ Elements',
        unit: isEs ? 'µg/g cabello (ppm)' : 'µg/g hair (ppm)',
        method: isEs
          ? 'Espectrometría de Masas con Plasma Acoplado Inductivamente (ICP-MS / ICP-OES)'
          : 'Inductively Coupled Plasma Mass Spectrometry (ICP-MS / ICP-OES)',
        lab: 'Analytika Laboratory (EU) · ISO 17025 Accredited',
        lod: '0.001 – 0.01 µg/g (element-dependent)',
        range: isEs ? '36+ elementos: minerales esenciales, tóxicos y relaciones inter-elementales' : '36+ elements: essential minerals, toxic metals \u0026 inter-element ratios',
        precision: 'RSD \u003c 5% (certified reference hair materials)',
        officialReportPdf: '/docs/teletest-report-htma.pdf',
        officialReportDocName: 'teletest-report-htma.pdf',
        ranges: [
          {
            label: isEs ? 'Toxicidad por Metales Pesados Detectada' : 'Heavy Metal Toxicity Detected',
            value: isEs ? 'Hg, Pb, As, Cd, Al por encima de referencia' : 'Hg, Pb, As, Cd, Al above reference limits',
            status: 'critical',
            badge: isEs ? 'Carga Tóxica Elevada' : 'Elevated Toxic Burden',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Uno o más metales pesados (mercurio, plomo, arsénico, cadmio, aluminio) se encuentran por encima de los rangos de referencia poblacional. Indica exposición crónica que puede interferir con la función mitocondrial, la metilación hepática y el eje tiroideo. Evaluar fuentes de exposición (amalgamas, agua, pesticidas, cosméticos) y considerar protocolo de quelación supervisado.'
              : 'One or more toxic metals (mercury, lead, arsenic, cadmium, aluminum) exceed population reference ranges. Indicates chronic exposure that may impair mitochondrial function, hepatic methylation, and thyroid axis. Evaluate exposure sources (amalgams, water, pesticides, cosmetics) and consider supervised chelation protocol.',
            clinicalProtocol: {
              slug: 'heavy-metal-detox-protocol',
              queryParams: '?baseline=toxicity\u0026metals=elevated\u0026tier=critical\u0026modality=chelation\u0026retest=12w',
              shortCode: 'REF-HTMA-DETOX',
              name: isEs ? 'Protocolo Quelación de Metales Pesados' : 'Heavy Metal Chelation Protocol',
              recommendedModality: isEs ? 'Quelación IV (EDTA/DMSA) + Soporte Hepático' : 'IV Chelation (EDTA/DMSA) + Hepatic Support',
              dosageGuide: isEs ? 'EDTA 1.5g IV semanal × 10 sesiones; DMSA oral 500mg/8h × 3d/mes (supervisado)' : 'EDTA 1.5g IV weekly × 10 sessions; oral DMSA 500mg q8h × 3d/month (supervised)',
              methylationRx: isEs ? 'NAC 1200mg/d + Glutatión Liposomal 500mg + Chlorella 3g + Cilantro' : 'NAC 1,200mg/d + Liposomal Glutathione 500mg + Chlorella 3g + Cilantro',
              retestWindow: isEs ? 'Semana 12 (Post-ciclo quelación)' : 'Week 12 (Post-chelation cycle)',
              cellularTarget: isEs ? 'Metalotioneínas, glutatión, citocromo P450, SOD mitocondrial' : 'Metallothioneins, glutathione, cytochrome P450, mitochondrial SOD',
              clinicalRationale: isEs
                ? 'Acumulación tisular de metales pesados documentada por HTMA. La quelación reduce la carga corporal total; la suplementación con antioxidantes endógenos restaura la capacidad de biotransformación hepática fase II.'
                : 'Tissue-level heavy metal accumulation documented by HTMA. Chelation reduces total body burden; endogenous antioxidant supplementation restores Phase II hepatic biotransformation capacity.',
              synergies: [
                { name: isEs ? 'Glutatión IV/Liposomal' : 'Glutathione IV/Liposomal', role: isEs ? 'Detox Fase II' : 'Phase II Detox' },
                { name: 'NAC 1200mg', role: isEs ? 'Precursor Glutatión' : 'Glutathione Precursor' },
                { name: isEs ? 'Chlorella + Cilantro' : 'Chlorella + Cilantro', role: isEs ? 'Quelación Natural' : 'Natural Chelation' },
                { name: isEs ? 'Selenio 200µg' : 'Selenium 200µg', role: isEs ? 'Protección contra Hg' : 'Mercury Protection' }
              ],
              aiQuery: isEs
                ? '¿Cuáles son los protocolos seguros de quelación para pacientes con mercurio y plomo elevados en HTMA?'
                : 'What are evidence-based chelation protocols for elevated mercury and lead in HTMA?'
            }
          },
          {
            label: isEs ? 'Desequilibrios Minerales Significativos' : 'Significant Mineral Imbalances',
            value: isEs ? 'Ratios Ca/Mg, Na/K, Cu/Zn alterados' : 'Ca/Mg, Na/K, Cu/Zn ratios disrupted',
            status: 'warning',
            badge: isEs ? 'Desequilibrio Mineral' : 'Mineral Imbalance',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Las relaciones inter-elementales clave (Calcio/Magnesio, Sodio/Potasio, Cobre/Zinc) se desvían de los rangos óptimos. Estos ratios reflejan el estado del sistema nervioso autónomo, la función suprarrenal y la eficiencia tiroidea. Pueden indicar estrés crónico, resistencia a la insulina incipiente o disfunción adrenal.'
              : 'Key inter-element ratios (Calcium/Magnesium, Sodium/Potassium, Copper/Zinc) deviate from optimal ranges. These ratios reflect autonomic nervous system balance, adrenal function, and thyroid efficiency. May indicate chronic stress, incipient insulin resistance, or adrenal dysfunction.',
            clinicalProtocol: {
              slug: 'mineral-rebalancing-protocol',
              queryParams: '?baseline=imbalance\u0026ratios=disrupted\u0026tier=warning\u0026modality=oral\u0026retest=8w',
              shortCode: 'REF-HTMA-BAL',
              name: isEs ? 'Protocolo de Reequilibrio Mineral' : 'Mineral Rebalancing Protocol',
              recommendedModality: isEs ? 'Suplementación Oral Dirigida por Ratios' : 'Ratio-Guided Oral Supplementation',
              dosageGuide: isEs ? 'Mg glicinato 400-600mg/d + Zn picolinato 30mg + K citrato 300mg (ajustar según ratios)' : 'Mg glycinate 400-600mg/d + Zn picolinate 30mg + K citrate 300mg (adjust per ratios)',
              methylationRx: isEs ? 'B6 P-5-P 50mg + Taurina 2g + Ácido Pantoténico 500mg' : 'B6 P-5-P 50mg + Taurine 2g + Pantothenic Acid 500mg',
              retestWindow: isEs ? 'Semana 8-12 (Re-análisis HTMA)' : 'Week 8-12 (HTMA re-analysis)',
              cellularTarget: isEs ? 'Bomba Na/K-ATPasa, conversión T4→T3, corteza adrenal' : 'Na/K-ATPase pump, T4→T3 conversion, adrenal cortex',
              clinicalRationale: isEs
                ? 'Los ratios HTMA reflejan la actividad bioquímica intracelular de los últimos 2-3 meses. La corrección dirigida de ratios restaura la eficiencia del eje HPA y la conversión periférica de hormonas tiroideas.'
                : 'HTMA ratios reflect 2-3 months of intracellular biochemical activity. Targeted ratio correction restores HPA axis efficiency and peripheral thyroid hormone conversion.',
              synergies: [
                { name: isEs ? 'Magnesio Glicinato' : 'Magnesium Glycinate', role: isEs ? 'Ratio Ca/Mg' : 'Ca/Mg Ratio' },
                { name: isEs ? 'Zinc Picolinato' : 'Zinc Picolinate', role: isEs ? 'Ratio Cu/Zn' : 'Cu/Zn Ratio' },
                { name: isEs ? 'Potasio Citrato' : 'Potassium Citrate', role: isEs ? 'Ratio Na/K' : 'Na/K Ratio' },
                { name: isEs ? 'Adaptógenos Adrenales' : 'Adrenal Adaptogens', role: isEs ? 'Soporte HPA' : 'HPA Support' }
              ],
              aiQuery: isEs
                ? '¿Cómo interpretar y corregir los ratios Ca/Mg, Na/K y Cu/Zn en un mineralograma capilar?'
                : 'How to interpret and correct Ca/Mg, Na/K, and Cu/Zn ratios in a hair tissue mineral analysis?'
            }
          },
          {
            label: isEs ? 'Perfil Mineral Óptimo' : 'Optimal Mineral Profile',
            value: isEs ? 'Todos los elementos y ratios en rango' : 'All elements and ratios within range',
            status: 'optimal',
            badge: isEs ? 'Equilibrio Mineral' : 'Mineral Balance',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            description: isEs
              ? 'Todos los minerales esenciales (Ca, Mg, Na, K, Zn, Fe, Se, Cr, Mn) están dentro de rangos poblacionales óptimos. Los ratios inter-elementales indican homeostasis metabólica adecuada, buen funcionamiento del eje HPA y conversión tiroidea eficiente. Los metales tóxicos se encuentran por debajo de los umbrales de preocupación clínica.'
              : 'All essential minerals (Ca, Mg, Na, K, Zn, Fe, Se, Cr, Mn) are within optimal population ranges. Inter-element ratios indicate adequate metabolic homeostasis, healthy HPA axis function, and efficient thyroid conversion. Toxic metals are below clinical concern thresholds.',
            clinicalProtocol: {
              slug: 'mineral-maintenance-protocol',
              queryParams: '?baseline=optimal\u0026ratios=balanced\u0026tier=optimal\u0026modality=maintenance\u0026retest=6m',
              shortCode: 'REF-HTMA-OPT',
              name: isEs ? 'Mantenimiento Mineral Óptimo' : 'Optimal Mineral Maintenance',
              recommendedModality: isEs ? 'Mantenimiento con Alimentos Funcionales' : 'Functional Food Maintenance',
              dosageGuide: isEs ? 'Dieta rica en minerales + multimineral de espectro completo a dosis de mantenimiento' : 'Mineral-rich diet + full-spectrum multimineral at maintenance doses',
              retestWindow: isEs ? 'Semestre (Control periódico)' : 'Biannual (Periodic monitoring)',
              cellularTarget: isEs ? 'Homeostasis metabólica general' : 'General metabolic homeostasis',
              clinicalRationale: isEs
                ? 'Perfil mineral equilibrado que refleja adecuada absorción intestinal, función renal y metabolismo celular. Mantener mediante alimentación funcional y monitoreo periódico.'
                : 'Balanced mineral profile reflecting adequate intestinal absorption, renal function, and cellular metabolism. Maintain through functional nutrition and periodic monitoring.',
              synergies: [
                { name: isEs ? 'Dieta Funcional' : 'Functional Diet', role: isEs ? 'Base Nutricional' : 'Nutritional Base' },
                { name: isEs ? 'Monitoreo Semestral' : 'Biannual Monitoring', role: isEs ? 'Control Preventivo' : 'Preventive Control' }
              ],
              aiQuery: isEs
                ? '¿Cuáles son las mejores estrategias para mantener un perfil mineral óptimo a largo plazo?'
                : 'What are the best strategies to maintain an optimal mineral profile long-term?'
            }
          },
          {
            label: isEs ? 'Deficiencia Mineral Múltiple' : 'Multiple Mineral Deficiency',
            value: isEs ? 'Zn, Se, Mg, Fe, Cr por debajo de referencia' : 'Zn, Se, Mg, Fe, Cr below reference',
            status: 'low',
            badge: isEs ? 'Depleción Mineral' : 'Mineral Depletion',
            color: '#ea580c',
            bgColor: '#fff7ed',
            description: isEs
              ? 'Múltiples minerales esenciales se encuentran por debajo de los rangos de referencia poblacional, indicando depleción tisular crónica. Puede deberse a malabsorción intestinal, dieta restrictiva, estrés oxidativo crónico o uso prolongado de medicamentos que depletan minerales (IBP, diuréticos, metformina).'
              : 'Multiple essential minerals are below population reference ranges, indicating chronic tissue depletion. May result from intestinal malabsorption, restrictive diet, chronic oxidative stress, or prolonged use of mineral-depleting medications (PPIs, diuretics, metformin).',
            clinicalProtocol: {
              slug: 'mineral-repletion-protocol',
              queryParams: '?baseline=depletion\u0026minerals=multiple\u0026tier=low\u0026modality=intensive\u0026retest=8w',
              shortCode: 'REF-HTMA-REPL',
              name: isEs ? 'Protocolo de Repleción Mineral Intensiva' : 'Intensive Mineral Repletion Protocol',
              recommendedModality: isEs ? 'Suplementación Oral Intensiva + Evaluación GI' : 'Intensive Oral Supplementation + GI Evaluation',
              dosageGuide: isEs ? 'Zn 50mg + Se 200µg + Mg 800mg + Fe bisglicinato 25mg + Cr picolinato 400µg × 8 semanas' : 'Zn 50mg + Se 200µg + Mg 800mg + Fe bisglycinate 25mg + Cr picolinate 400µg × 8 weeks',
              retestWindow: isEs ? 'Semana 8 (HTMA + Perfil sérico)' : 'Week 8 (HTMA + Serum panel)',
              cellularTarget: isEs ? 'Cofactores enzimáticos, glutatión peroxidasa, SOD, insulina' : 'Enzymatic cofactors, glutathione peroxidase, SOD, insulin signaling',
              clinicalRationale: isEs
                ? 'Depleción tisular documentada por HTMA. La repleción intensiva restora los cofactores enzimáticos críticos para la función mitocondrial y la defensa antioxidante endógena.'
                : 'Tissue depletion documented by HTMA. Intensive repletion restores critical enzymatic cofactors for mitochondrial function and endogenous antioxidant defense.',
              synergies: [
                { name: isEs ? 'Evaluación GI' : 'GI Evaluation', role: isEs ? 'Descartar Malabsorción' : 'Rule Out Malabsorption' },
                { name: isEs ? 'Ácido Estomacal' : 'Stomach Acid', role: isEs ? 'Optimizar Absorción' : 'Optimize Absorption' },
                { name: isEs ? 'Cofactores B' : 'B Cofactors', role: isEs ? 'Sinergia Enzimática' : 'Enzymatic Synergy' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el protocolo de repleción mineral más eficaz cuando el HTMA muestra deficiencias múltiples?'
                : 'What is the most effective mineral repletion protocol when HTMA shows multiple deficiencies?'
            }
          },
          {
            label: isEs ? 'Exposición a Metales con Depleción Mineral' : 'Toxic Exposure with Mineral Depletion',
            value: isEs ? 'Patrón mixto: tóxicos altos + esenciales bajos' : 'Mixed pattern: high toxics + low essentials',
            status: 'critical',
            badge: isEs ? 'Patrón Mixto Severo' : 'Severe Mixed Pattern',
            color: '#7c2d12',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Patrón más preocupante: metales tóxicos elevados combinados con depleción de minerales protectores (Zn, Se, Mg). Los metales tóxicos desplazan competitivamente a los minerales esenciales de sus sitios de unión enzimáticos. Requiere abordaje dual: quelación + repleción mineral simultánea bajo supervisión médica.'
              : 'Most concerning pattern: elevated toxic metals combined with depletion of protective minerals (Zn, Se, Mg). Toxic metals competitively displace essential minerals from their enzymatic binding sites. Requires dual approach: chelation + simultaneous mineral repletion under medical supervision.',
            clinicalProtocol: {
              slug: 'dual-detox-repletion-protocol',
              queryParams: '?baseline=mixed\u0026pattern=toxic-depleted\u0026tier=critical\u0026modality=dual\u0026retest=12w',
              shortCode: 'REF-HTMA-DUAL',
              name: isEs ? 'Protocolo Dual: Quelación + Repleción' : 'Dual Protocol: Chelation + Repletion',
              recommendedModality: isEs ? 'Quelación Supervisada + Repleción Mineral Secuencial' : 'Supervised Chelation + Sequential Mineral Repletion',
              dosageGuide: isEs ? 'Fase 1: Quelación (4 sem) → Fase 2: Repleción intensiva (8 sem) → Re-test HTMA' : 'Phase 1: Chelation (4 wk) → Phase 2: Intensive repletion (8 wk) → HTMA re-test',
              retestWindow: isEs ? 'Semana 12 (Post-protocolo dual completo)' : 'Week 12 (Post-complete dual protocol)',
              cellularTarget: isEs ? 'Desplazamiento competitivo metales/minerales, metalotioneínas, glutatión' : 'Competitive metal/mineral displacement, metallothioneins, glutathione',
              clinicalRationale: isEs
                ? 'La acumulación tóxica agota los minerales protectores que son precisamente los cofactores necesarios para la biotransformación hepática de los propios metales. Ciclo vicioso que requiere intervención secuencial.'
                : 'Toxic accumulation depletes the protective minerals that are precisely the cofactors needed for hepatic biotransformation of the metals themselves. Vicious cycle requiring sequential intervention.',
              synergies: [
                { name: isEs ? 'Quelación Fase 1' : 'Phase 1 Chelation', role: isEs ? 'Reducir Carga Tóxica' : 'Reduce Toxic Burden' },
                { name: isEs ? 'Repleción Fase 2' : 'Phase 2 Repletion', role: isEs ? 'Restaurar Cofactores' : 'Restore Cofactors' },
                { name: isEs ? 'Glutatión + NAC' : 'Glutathione + NAC', role: isEs ? 'Defensa Antioxidante' : 'Antioxidant Defense' },
                { name: isEs ? 'Supervisión Médica' : 'Medical Supervision', role: isEs ? 'Seguridad del Protocolo' : 'Protocol Safety' }
              ],
              aiQuery: isEs
                ? '¿Cómo abordar un HTMA con patrón mixto de metales pesados elevados y minerales esenciales depletados?'
                : 'How to approach an HTMA showing a mixed pattern of elevated heavy metals and depleted essential minerals?'
            }
          }
        ]
      };
    }

    // ═══════════════════════════════════════════════════════════════════
    // TELETEST — OMEGA (HS-Omega-3 Index + Fatty Acid Profile)
    // Methodology: GC-FID / Gas Chromatography · Specimen: Dried Blood Spot
    // Clinical reference: Harris WS et al. HS-Omega-3 Index®
    // ═══════════════════════════════════════════════════════════════════
    if (isTeletestOmega) {
      return {
        name: isEs ? 'Índice HS-Omega-3 + Perfil Ácidos Grasos' : 'HS-Omega-3 Index + Fatty Acid Profile',
        unit: isEs ? '% de ácidos grasos totales en eritrocitos' : '% of total fatty acids in erythrocytes',
        method: isEs
          ? 'Cromatografía de Gases con Detector de Ionización de Llama (GC-FID)'
          : 'Gas Chromatography with Flame Ionization Detection (GC-FID)',
        lab: 'Analytika Laboratory (EU) · ISO 17025',
        lod: '0.1% total fatty acids',
        range: isEs ? 'EPA + DHA como % del total de AG en membrana eritrocitaria' : 'EPA + DHA as % of total FA in erythrocyte membrane',
        precision: 'RSD \u003c 4.5%',
        officialReportPdf: '/docs/teletest-report-omega.pdf',
        officialReportDocName: 'teletest-report-omega.pdf',
        ranges: [
          {
            label: isEs ? 'Zona de Alto Riesgo Cardiovascular' : 'High Cardiovascular Risk Zone',
            value: 'HS-Omega-3 Index \u003c 4%',
            status: 'critical',
            badge: isEs ? 'Riesgo CV Alto' : 'High CV Risk',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Índice HS-Omega-3 inferior al 4%. Según los estudios de Harris \u0026 von Schacky, este nivel se asocia con un riesgo 10 veces mayor de muerte cardíaca súbita en comparación con índices >8%. La membrana eritrocitaria tiene un contenido críticamente bajo de EPA+DHA, lo que refleja una ingesta deficiente sostenida durante 2-3 meses y un perfil proinflamatorio con ratio AA:EPA marcadamente elevado.'
              : 'HS-Omega-3 Index below 4%. Per Harris \u0026 von Schacky studies, this level is associated with a 10-fold higher risk of sudden cardiac death compared to indices >8%. Erythrocyte membrane has critically low EPA+DHA content, reflecting sustained inadequate intake over 2-3 months and a pro-inflammatory profile with markedly elevated AA:EPA ratio.',
            clinicalProtocol: {
              slug: 'omega3-intensive-repletion',
              queryParams: '?baseline=critical\u0026omega3_index=3.5\u0026tier=critical\u0026modality=oral\u0026retest=12w',
              shortCode: 'REF-OM3-CRIT',
              name: isEs ? 'Protocolo Intensivo de Repleción Omega-3' : 'Intensive Omega-3 Repletion Protocol',
              recommendedModality: isEs ? 'EPA+DHA Alta Dosis Oral (Forma Triglicérido rTG)' : 'High-Dose Oral EPA+DHA (rTG Triglyceride Form)',
              dosageGuide: isEs ? 'EPA+DHA combinado ≥4000 mg/d (forma rTG) con comida grasa × 12 semanas' : 'Combined EPA+DHA ≥4,000 mg/d (rTG form) with fatty meal × 12 weeks',
              methylationRx: isEs ? 'Vitamina E (tocoferoles mixtos) 400 UI para proteger AG del estrés oxidativo' : 'Vitamin E (mixed tocopherols) 400 IU to protect FA from oxidative stress',
              retestWindow: isEs ? 'Semana 12 (HS-Omega-3 Index refleja 120 días de eritrocitos)' : 'Week 12 (HS-Omega-3 Index reflects 120-day RBC lifespan)',
              cellularTarget: isEs ? 'Membrana eritrocitaria, resolución inflamatoria (resolvinas/protectinas), cardioprotección' : 'Erythrocyte membrane, inflammatory resolution (resolvins/protectins), cardioprotection',
              clinicalRationale: isEs
                ? 'El HS-Omega-3 Index es un biomarcador validado de riesgo cardiovascular a largo plazo. La repleción con dosis altas de EPA+DHA en forma rTG (mayor biodisponibilidad que éster etílico) modifica la composición de la membrana celular en 8-12 semanas, reduciendo el ratio AA:EPA y promoviendo la síntesis de mediadores pro-resolutivos (SPMs).'
                : 'The HS-Omega-3 Index is a validated long-term cardiovascular risk biomarker. High-dose EPA+DHA repletion in rTG form (higher bioavailability than ethyl ester) modifies cell membrane composition in 8-12 weeks, reducing the AA:EPA ratio and promoting synthesis of specialized pro-resolving mediators (SPMs).',
              synergies: [
                { name: 'EPA+DHA rTG 4g', role: isEs ? 'Repleción Membrana' : 'Membrane Repletion' },
                { name: isEs ? 'Vitamina E Mixta' : 'Mixed Vitamin E', role: isEs ? 'Protección Peroxidativa' : 'Peroxidative Protection' },
                { name: isEs ? 'Reducir Omega-6' : 'Reduce Omega-6', role: isEs ? 'Mejorar Ratio AA:EPA' : 'Improve AA:EPA Ratio' }
              ],
              aiQuery: isEs
                ? '¿Por qué un índice HS-Omega-3 inferior al 4% multiplica por 10 el riesgo de muerte cardíaca súbita?'
                : 'Why does an HS-Omega-3 Index below 4% confer a 10-fold increase in sudden cardiac death risk?'
            }
          },
          {
            label: isEs ? 'Zona de Riesgo Intermedio' : 'Intermediate Risk Zone',
            value: 'HS-Omega-3 Index 4% – 8%',
            status: 'warning',
            badge: isEs ? 'Subóptimo' : 'Suboptimal',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Índice entre 4% y 8%. Zona intermedia con beneficio parcial. La mayoría de la población occidental se encuentra en este rango. Existe margen significativo de mejora cardiovascular, neurológica y antiinflamatoria al alcanzar la zona cardioprotectora (>8%).'
              : 'Index between 4% and 8%. Intermediate zone with partial benefit. Most of the Western population falls in this range. Significant room for cardiovascular, neurological, and anti-inflammatory improvement by reaching the cardioprotective zone (>8%).',
            clinicalProtocol: {
              slug: 'omega3-optimization-protocol',
              queryParams: '?baseline=intermediate\u0026omega3_index=6\u0026tier=warning\u0026modality=oral\u0026retest=12w',
              shortCode: 'REF-OM3-OPT',
              name: isEs ? 'Protocolo de Optimización Omega-3' : 'Omega-3 Optimization Protocol',
              recommendedModality: isEs ? 'EPA+DHA Moderada Dosis + Dieta Mediterránea' : 'Moderate-Dose EPA+DHA + Mediterranean Diet',
              dosageGuide: isEs ? 'EPA+DHA 2000-3000 mg/d (forma rTG) + 3 raciones pescado azul/semana' : 'EPA+DHA 2,000-3,000 mg/d (rTG form) + 3 servings fatty fish/week',
              retestWindow: isEs ? 'Semana 12' : 'Week 12',
              cellularTarget: isEs ? 'Membrana celular, mediadores lipídicos, función endotelial' : 'Cell membrane, lipid mediators, endothelial function',
              clinicalRationale: isEs
                ? 'Zona de transición donde la suplementación moderada combinada con modificación dietética puede elevar el índice a la zona cardioprotectora en un ciclo eritrocitario.'
                : 'Transition zone where moderate supplementation combined with dietary modification can elevate the index to the cardioprotective zone within one RBC cycle.',
              synergies: [
                { name: 'EPA+DHA rTG 2.5g', role: isEs ? 'Suplementación' : 'Supplementation' },
                { name: isEs ? 'Pescado Azul 3×/sem' : 'Fatty Fish 3×/wk', role: isEs ? 'Fuente Dietética' : 'Dietary Source' },
                { name: isEs ? 'Reducir Aceites Semillas' : 'Reduce Seed Oils', role: isEs ? 'Ratio ω6:ω3' : 'ω6:ω3 Ratio' }
              ],
              aiQuery: isEs
                ? '¿Cuál es la dosis óptima de EPA+DHA para elevar el HS-Omega-3 Index de 6% a >8%?'
                : 'What is the optimal EPA+DHA dose to raise the HS-Omega-3 Index from 6% to >8%?'
            }
          },
          {
            label: isEs ? 'Zona Cardioprotectora Óptima' : 'Optimal Cardioprotective Zone',
            value: 'HS-Omega-3 Index 8% – 12%',
            status: 'optimal',
            badge: isEs ? 'Cardioprotección' : 'Cardioprotective',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            description: isEs
              ? 'Zona objetivo definida por Harris \u0026 von Schacky como "cardioprotectora". El riesgo de muerte cardíaca súbita es 10 veces menor que en índices <4%. Asociado con resolución inflamatoria eficiente (resolvinas, maresinas), función endotelial óptima y neuroprotección. Correlacionado con menor riesgo de deterioro cognitivo y depresión.'
              : 'Target zone defined by Harris \u0026 von Schacky as "cardioprotective." Sudden cardiac death risk is 10-fold lower than indices <4%. Associated with efficient inflammatory resolution (resolvins, maresins), optimal endothelial function, and neuroprotection. Correlated with lower risk of cognitive decline and depression.',
            clinicalProtocol: {
              slug: 'omega3-maintenance-protocol',
              queryParams: '?baseline=optimal\u0026omega3_index=9\u0026tier=optimal\u0026modality=maintenance\u0026retest=6m',
              shortCode: 'REF-OM3-MAINT',
              name: isEs ? 'Mantenimiento Cardioprotector Omega-3' : 'Omega-3 Cardioprotective Maintenance',
              recommendedModality: isEs ? 'Dosis de Mantenimiento + Monitoreo Semestral' : 'Maintenance Dose + Biannual Monitoring',
              dosageGuide: isEs ? 'EPA+DHA 1000-2000 mg/d (mantenimiento) + dieta rica en pescado' : 'EPA+DHA 1,000-2,000 mg/d (maintenance) + fish-rich diet',
              retestWindow: isEs ? 'Semestral (Control HS-Omega-3 Index)' : 'Biannual (HS-Omega-3 Index monitoring)',
              cellularTarget: isEs ? 'Homeostasis membrana eritrocitaria, SPMs, endotelio' : 'RBC membrane homeostasis, SPMs, endothelium',
              clinicalRationale: isEs
                ? 'Nivel óptimo alcanzado. Mantener con dosis moderada y verificar estabilidad semestralmente.'
                : 'Optimal level achieved. Maintain with moderate dose and verify stability biannually.',
              synergies: [
                { name: 'EPA+DHA 1.5g', role: isEs ? 'Mantenimiento' : 'Maintenance' },
                { name: isEs ? 'Dieta Pescado' : 'Fish Diet', role: isEs ? 'Fuente Natural' : 'Natural Source' }
              ],
              aiQuery: isEs
                ? '¿Qué beneficios cardiovasculares y neurológicos se asocian con un HS-Omega-3 Index >8%?'
                : 'What cardiovascular and neurological benefits are associated with an HS-Omega-3 Index >8%?'
            }
          },
          {
            label: isEs ? 'Ratio AA:EPA Elevado (Proinflamatorio)' : 'Elevated AA:EPA Ratio (Pro-inflammatory)',
            value: 'AA:EPA > 15:1',
            status: 'warning',
            badge: isEs ? 'Proinflamatorio' : 'Pro-inflammatory',
            color: '#ea580c',
            bgColor: '#fff7ed',
            description: isEs
              ? 'El ratio Ácido Araquidónico (AA) a EPA excede 15:1 (objetivo <5:1). Indica predominancia de cascadas proinflamatorias (prostaglandinas serie 2, leucotrienos serie 4) sobre las resolutivas. Asociado con inflamación crónica de bajo grado, síndrome metabólico y riesgo cardiovascular incrementado independientemente del índice Omega-3.'
              : 'The Arachidonic Acid (AA) to EPA ratio exceeds 15:1 (target <5:1). Indicates predominance of pro-inflammatory cascades (series 2 prostaglandins, series 4 leukotrienes) over resolving ones. Associated with chronic low-grade inflammation, metabolic syndrome, and increased cardiovascular risk independent of the Omega-3 Index.',
            clinicalProtocol: {
              slug: 'aa-epa-ratio-correction',
              queryParams: '?baseline=elevated_ratio\u0026aa_epa=18\u0026tier=warning\u0026modality=dietary\u0026retest=12w',
              shortCode: 'REF-OM3-RATIO',
              name: isEs ? 'Corrección Ratio AA:EPA' : 'AA:EPA Ratio Correction',
              recommendedModality: isEs ? 'EPA Puro Alta Dosis + Restricción ω-6' : 'High-Dose Pure EPA + ω-6 Restriction',
              dosageGuide: isEs ? 'EPA puro ≥2000 mg/d + eliminar aceites de semillas (girasol, soja, maíz)' : 'Pure EPA ≥2,000 mg/d + eliminate seed oils (sunflower, soy, corn)',
              retestWindow: isEs ? 'Semana 12' : 'Week 12',
              cellularTarget: isEs ? 'Competencia enzimática COX/LOX, desplazamiento AA de fosfolípidos' : 'COX/LOX enzymatic competition, AA displacement from phospholipids',
              clinicalRationale: isEs
                ? 'EPA compite directamente con AA por las enzimas COX y LOX. Una dosis alta de EPA puro (no DHA) desplaza el AA de los fosfolípidos de membrana, reduciendo la síntesis de eicosanoides proinflamatorios.'
                : 'EPA directly competes with AA for COX and LOX enzymes. High-dose pure EPA (not DHA) displaces AA from membrane phospholipids, reducing pro-inflammatory eicosanoid synthesis.',
              synergies: [
                { name: 'EPA puro 2g', role: isEs ? 'Desplazamiento AA' : 'AA Displacement' },
                { name: isEs ? 'Eliminar Aceites ω-6' : 'Eliminate ω-6 Oils', role: isEs ? 'Reducir Sustrato AA' : 'Reduce AA Substrate' },
                { name: isEs ? 'Curcumina + Boswellia' : 'Curcumin + Boswellia', role: isEs ? 'Inhibición COX/LOX Natural' : 'Natural COX/LOX Inhibition' }
              ],
              aiQuery: isEs
                ? '¿Cómo reducir un ratio AA:EPA elevado y qué impacto tiene en la inflamación crónica?'
                : 'How to reduce an elevated AA:EPA ratio and what impact does it have on chronic inflammation?'
            }
          },
          {
            label: isEs ? 'Ácidos Grasos Trans Elevados' : 'Elevated Trans Fatty Acids',
            value: isEs ? 'Trans > 1.5% del total de AG' : 'Trans > 1.5% of total FA',
            status: 'critical',
            badge: isEs ? 'Grasas Trans Altas' : 'High Trans Fats',
            color: '#991b1b',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Los ácidos grasos trans exceden el 1.5% del total de ácidos grasos en membrana eritrocitaria. La OMS recomienda <1% de la ingesta calórica total. Los trans industriales (aceites parcialmente hidrogenados) alteran la fluidez de membrana, elevan el LDL oxidado, reducen el HDL y aumentan marcadores inflamatorios (PCR-us, IL-6). Cada 2% de incremento en trans se asocia con un 23% mayor riesgo de enfermedad coronaria.'
              : 'Trans fatty acids exceed 1.5% of total erythrocyte membrane fatty acids. WHO recommends <1% of total caloric intake. Industrial trans fats (partially hydrogenated oils) disrupt membrane fluidity, elevate oxidized LDL, reduce HDL, and increase inflammatory markers (hs-CRP, IL-6). Each 2% increase in trans is associated with 23% higher coronary heart disease risk.',
            clinicalProtocol: {
              slug: 'trans-fat-elimination-protocol',
              queryParams: '?baseline=elevated_trans\u0026trans_pct=2.1\u0026tier=critical\u0026modality=dietary\u0026retest=16w',
              shortCode: 'REF-OM3-TRANS',
              name: isEs ? 'Protocolo Eliminación de Grasas Trans' : 'Trans Fat Elimination Protocol',
              recommendedModality: isEs ? 'Intervención Dietética Estricta' : 'Strict Dietary Intervention',
              dosageGuide: isEs ? 'Eliminación total de aceites parcialmente hidrogenados + ω-3 EPA 2g/d para restaurar membrana' : 'Total elimination of partially hydrogenated oils + ω-3 EPA 2g/d to restore membrane',
              retestWindow: isEs ? 'Semana 16 (2 ciclos eritrocitarios)' : 'Week 16 (2 RBC cycles)',
              cellularTarget: isEs ? 'Fluidez de membrana, receptores LDL, marcadores inflamatorios' : 'Membrane fluidity, LDL receptors, inflammatory markers',
              clinicalRationale: isEs
                ? 'Los ácidos grasos trans se incorporan en la membrana celular y persisten durante toda la vida del eritrocito (120 días). La eliminación dietética + suplementación con ω-3 permite la sustitución gradual en la membrana durante 2 ciclos eritrocitarios.'
                : 'Trans fatty acids incorporate into cell membranes and persist for the entire RBC lifespan (120 days). Dietary elimination + ω-3 supplementation allows gradual membrane substitution over 2 RBC cycles.',
              synergies: [
                { name: isEs ? 'Dieta Sin Trans' : 'Trans-Free Diet', role: isEs ? 'Eliminación Fuente' : 'Source Elimination' },
                { name: 'EPA+DHA 2g', role: isEs ? 'Restauración Membrana' : 'Membrane Restoration' },
                { name: isEs ? 'AOVE + Aguacate' : 'EVOO + Avocado', role: isEs ? 'Grasas Saludables' : 'Healthy Fats' }
              ],
              aiQuery: isEs
                ? '¿Cuánto tiempo tarda el cuerpo en eliminar las grasas trans de las membranas celulares tras su eliminación dietética?'
                : 'How long does it take for the body to clear trans fats from cell membranes after dietary elimination?'
            }
          }
        ]
      };
    }

    // ═══════════════════════════════════════════════════════════════════
    // TELETEST — METABOLIZER/DETOX (Pharmacogenetics Panel)
    // Methodology: RT-PCR / Microarray · Specimen: Buccal swab (saliva)
    // Clinical reference: CPIC (Clinical Pharmacogenetics Implementation Consortium)
    // ═══════════════════════════════════════════════════════════════════
    if (isTeletestMetabolizer) {
      return {
        name: isEs ? 'Panel Farmacogenético Metabolizer-Detox (CYP450 + Fase II)' : 'Pharmacogenetic Metabolizer-Detox Panel (CYP450 + Phase II)',
        unit: isEs ? 'Fenotipo Metabólico (PM/IM/NM/RM/UM)' : 'Metabolizer Phenotype (PM/IM/NM/RM/UM)',
        method: isEs
          ? 'RT-PCR Multiplex + Microarray de Polimorfismos SNP'
          : 'Multiplex RT-PCR + SNP Polymorphism Microarray',
        lab: 'Analytika Genomics Laboratory (EU) · ISO 15189',
        lod: 'N/A (qualitative genotyping)',
        range: isEs ? 'Genes: CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP1A2, NAT2, COMT, MTHFR, GST, UGT' : 'Genes: CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP1A2, NAT2, COMT, MTHFR, GST, UGT',
        precision: isEs ? 'Concordancia genotípica >99.5%' : 'Genotype concordance >99.5%',
        officialReportPdf: '/docs/teletest-report-metabolizer.pdf',
        officialReportDocName: 'teletest-report-metabolizer.pdf',
        ranges: [
          {
            label: isEs ? 'Metabolizador Pobre (PM) en CYP Críticos' : 'Poor Metabolizer (PM) in Critical CYPs',
            value: isEs ? 'CYP2D6 *4/*4 o CYP2C19 *2/*2' : 'CYP2D6 *4/*4 or CYP2C19 *2/*2',
            status: 'critical',
            badge: isEs ? 'Metabolizador Pobre' : 'Poor Metabolizer',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Actividad enzimática CYP450 ausente o severamente reducida. El paciente no puede metabolizar eficientemente sustratos de estas enzimas, lo que provoca acumulación de fármacos activos (riesgo de toxicidad) o falta de activación de prodrogas (falta de eficacia). CYP2D6 PM afecta ~25% de los fármacos más prescritos (codeína, tamoxifeno, antidepresivos ISRS). CYP2C19 PM impacta clopidogrel, IBPs y benzodiacepinas.'
              : 'Absent or severely reduced CYP450 enzymatic activity. Patient cannot efficiently metabolize substrates for these enzymes, causing active drug accumulation (toxicity risk) or failure to activate prodrugs (lack of efficacy). CYP2D6 PM affects ~25% of most prescribed drugs (codeine, tamoxifen, SSRI antidepressants). CYP2C19 PM impacts clopidogrel, PPIs, and benzodiazepines.',
            clinicalProtocol: {
              slug: 'poor-metabolizer-adjustment',
              queryParams: '?baseline=PM\u0026cyp=2D6_2C19\u0026tier=critical\u0026modality=pharma_adjustment\u0026retest=lifetime',
              shortCode: 'REF-PGX-PM',
              name: isEs ? 'Ajuste Farmacológico para PM' : 'Pharmacological Adjustment for PM',
              recommendedModality: isEs ? 'Revisión Farmacoterapéutica Completa (CPIC Guidelines)' : 'Complete Pharmacotherapy Review (CPIC Guidelines)',
              dosageGuide: isEs ? 'Reducir dosis 50-75% de sustratos CYP afectados o usar fármacos alternativos según guías CPIC/DPWG' : 'Reduce dose 50-75% of affected CYP substrates or use alternative drugs per CPIC/DPWG guidelines',
              retestWindow: isEs ? 'De por vida (genotipo no cambia)' : 'Lifetime (genotype does not change)',
              cellularTarget: isEs ? 'Enzimas CYP450 hepáticas microsomales' : 'Hepatic microsomal CYP450 enzymes',
              clinicalRationale: isEs
                ? 'El genotipo PM es constitutivo y permanente. Toda prescripción futura debe considerar este perfil. Las guías CPIC (cpicpgx.org) proporcionan recomendaciones específicas gen-fármaco con nivel de evidencia A.'
                : 'The PM genotype is constitutive and permanent. All future prescriptions must consider this profile. CPIC guidelines (cpicpgx.org) provide specific gene-drug recommendations with level A evidence.',
              synergies: [
                { name: isEs ? 'Tarjeta PGx Médica' : 'PGx Medical Card', role: isEs ? 'Alerta Prescriptores' : 'Prescriber Alert' },
                { name: isEs ? 'Guías CPIC' : 'CPIC Guidelines', role: isEs ? 'Dosificación Basada en Evidencia' : 'Evidence-Based Dosing' },
                { name: isEs ? 'Farmacia Personalizada' : 'Personalized Pharmacy', role: isEs ? 'Monitoreo Fármacos' : 'Drug Monitoring' }
              ],
              aiQuery: isEs
                ? '¿Qué fármacos deben evitarse o ajustarse en un paciente metabolizador pobre CYP2D6?'
                : 'Which drugs should be avoided or dose-adjusted in a CYP2D6 poor metabolizer patient?'
            }
          },
          {
            label: isEs ? 'Metabolizador Ultrarrápido (UM)' : 'Ultrarapid Metabolizer (UM)',
            value: isEs ? 'CYP2D6 duplicación (*1/*1xN) o CYP2C19 *17/*17' : 'CYP2D6 duplication (*1/*1xN) or CYP2C19 *17/*17',
            status: 'warning',
            badge: isEs ? 'Metabolizador Ultrarrápido' : 'Ultrarapid Metabolizer',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Actividad enzimática CYP450 significativamente aumentada. Los fármacos se metabolizan demasiado rápido: las concentraciones plasmáticas terapéuticas no se alcanzan a dosis estándar (falta de eficacia) o las prodrogas se activan excesivamente (toxicidad del metabolito activo). CYP2D6 UM puede convertir codeína en morfina a velocidad letal en algunos individuos.'
              : 'Significantly increased CYP450 enzymatic activity. Drugs are metabolized too rapidly: therapeutic plasma concentrations are not reached at standard doses (lack of efficacy) or prodrugs are activated excessively (active metabolite toxicity). CYP2D6 UM can convert codeine to morphine at lethal speed in some individuals.',
            clinicalProtocol: {
              slug: 'ultrarapid-metabolizer-adjustment',
              queryParams: '?baseline=UM\u0026cyp=2D6_2C19\u0026tier=warning\u0026modality=pharma_adjustment\u0026retest=lifetime',
              shortCode: 'REF-PGX-UM',
              name: isEs ? 'Ajuste para Metabolizador Ultrarrápido' : 'Ultrarapid Metabolizer Adjustment',
              recommendedModality: isEs ? 'Dosis Elevadas o Fármacos Alternativos (según CPIC)' : 'Elevated Doses or Alternative Drugs (per CPIC)',
              dosageGuide: isEs ? 'Aumentar dosis 150-200% para sustratos directos; EVITAR prodrogas con metabolitos tóxicos (codeína en CYP2D6 UM = contraindicación absoluta)' : 'Increase dose 150-200% for direct substrates; AVOID prodrugs with toxic metabolites (codeine in CYP2D6 UM = absolute contraindication)',
              retestWindow: isEs ? 'De por vida' : 'Lifetime',
              cellularTarget: isEs ? 'Velocidad de biotransformación hepática' : 'Hepatic biotransformation velocity',
              clinicalRationale: isEs
                ? 'El fenotipo UM requiere dosis superiores al estándar para alcanzar concentración terapéutica con sustratos directos, pero la codeína está CONTRAINDICADA (riesgo de intoxicación por morfina). Genotipo permanente con implicaciones para toda la vida.'
                : 'The UM phenotype requires above-standard doses to reach therapeutic concentration with direct substrates, but codeine is CONTRAINDICATED (morphine intoxication risk). Permanent genotype with lifelong implications.',
              synergies: [
                { name: isEs ? 'CONTRAINDICACIÓN: Codeína' : 'CONTRAINDICATED: Codeine', role: isEs ? 'Seguridad Vital' : 'Life Safety' },
                { name: isEs ? 'Monitoreo TDM' : 'TDM Monitoring', role: isEs ? 'Niveles Plasmáticos' : 'Plasma Levels' },
                { name: isEs ? 'Tarjeta PGx' : 'PGx Card', role: isEs ? 'Alerta Urgencias' : 'Emergency Alert' }
              ],
              aiQuery: isEs
                ? '¿Por qué la codeína es potencialmente letal en metabolizadores ultrarrápidos CYP2D6?'
                : 'Why is codeine potentially lethal in CYP2D6 ultrarapid metabolizers?'
            }
          },
          {
            label: isEs ? 'Metabolizador Normal (NM)' : 'Normal Metabolizer (NM)',
            value: isEs ? 'Actividad enzimática estándar en todos los CYP' : 'Standard enzymatic activity across all CYPs',
            status: 'optimal',
            badge: isEs ? 'Metabolizador Normal' : 'Normal Metabolizer',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            description: isEs
              ? 'Actividad enzimática CYP450 dentro de rangos poblacionales normales para todas las enzimas analizadas. Las dosis farmacológicas estándar son apropiadas. No se requieren ajustes de dosis específicos basados en el perfil farmacogenético. El resultado sigue siendo valioso: confirma que las dosis habituales son seguras y eficaces para este paciente.'
              : 'CYP450 enzymatic activity within normal population ranges for all enzymes analyzed. Standard pharmacological doses are appropriate. No specific dose adjustments required based on pharmacogenetic profile. The result remains valuable: confirms that standard doses are safe and effective for this patient.',
            clinicalProtocol: {
              slug: 'normal-metabolizer-baseline',
              queryParams: '?baseline=NM\u0026cyp=all_normal\u0026tier=optimal\u0026modality=standard\u0026retest=lifetime',
              shortCode: 'REF-PGX-NM',
              name: isEs ? 'Perfil Normal — Dosificación Estándar' : 'Normal Profile — Standard Dosing',
              recommendedModality: isEs ? 'Dosificación Estándar según Guías Clínicas' : 'Standard Dosing per Clinical Guidelines',
              dosageGuide: isEs ? 'Dosis estándar de todos los fármacos; no requiere ajuste farmacogenético' : 'Standard doses of all drugs; no pharmacogenetic adjustment required',
              retestWindow: isEs ? 'De por vida (genotipo es permanente)' : 'Lifetime (genotype is permanent)',
              cellularTarget: isEs ? 'Metabolismo hepático estándar' : 'Standard hepatic metabolism',
              clinicalRationale: isEs
                ? 'Resultado tranquilizador: confirma que el metabolismo hepático del paciente procesa fármacos a velocidad normal. Archivar resultado para consultas futuras.'
                : 'Reassuring result: confirms the patient\'s hepatic metabolism processes drugs at normal speed. Archive result for future consultations.',
              synergies: [
                { name: isEs ? 'Archivo PGx' : 'PGx Archive', role: isEs ? 'Historial Médico' : 'Medical History' },
                { name: isEs ? 'Tarjeta PGx' : 'PGx Card', role: isEs ? 'Referencia Futura' : 'Future Reference' }
              ],
              aiQuery: isEs
                ? '¿Por qué es valioso realizar un panel farmacogenético incluso cuando el resultado es metabolizador normal?'
                : 'Why is it valuable to perform a pharmacogenetics panel even when the result is normal metabolizer?'
            }
          },
          {
            label: isEs ? 'MTHFR / COMT Variante Homocigota' : 'MTHFR / COMT Homozygous Variant',
            value: 'MTHFR C677T T/T o COMT Val158Met Met/Met',
            status: 'warning',
            badge: isEs ? 'Variante Metilación' : 'Methylation Variant',
            color: '#ea580c',
            bgColor: '#fff7ed',
            description: isEs
              ? 'Variante homocigota en genes de metilación (MTHFR C677T T/T reduce actividad enzimática al 30%) o catecol-O-metiltransferasa (COMT Met/Met = actividad lenta, mayor sensibilidad a catecolaminas). MTHFR T/T se asocia con homocisteína elevada, mayor necesidad de folato metilado (5-MTHF) y riesgo cardiovascular. COMT Met/Met implica metabolismo lento de dopamina/estradiol.'
              : 'Homozygous variant in methylation genes (MTHFR C677T T/T reduces enzymatic activity to 30%) or catechol-O-methyltransferase (COMT Met/Met = slow activity, increased catecholamine sensitivity). MTHFR T/T is associated with elevated homocysteine, increased need for methylated folate (5-MTHF), and cardiovascular risk. COMT Met/Met implies slow dopamine/estradiol metabolism.',
            clinicalProtocol: {
              slug: 'methylation-support-protocol',
              queryParams: '?baseline=homozygous\u0026gene=MTHFR_COMT\u0026tier=warning\u0026modality=methylation\u0026retest=8w',
              shortCode: 'REF-PGX-METH',
              name: isEs ? 'Protocolo de Soporte a la Metilación' : 'Methylation Support Protocol',
              recommendedModality: isEs ? 'Folato Metilado (5-MTHF) + Metilcobalamina + TMG' : 'Methylated Folate (5-MTHF) + Methylcobalamin + TMG',
              dosageGuide: isEs ? '5-MTHF 800µg-15mg/d (titular desde dosis baja) + Metilcobalamina 1000µg + TMG 500mg; monitorizar homocisteína' : '5-MTHF 800µg-15mg/d (titrate from low dose) + Methylcobalamin 1,000µg + TMG 500mg; monitor homocysteine',
              retestWindow: isEs ? 'Semana 8 (Homocisteína sérica)' : 'Week 8 (Serum homocysteine)',
              cellularTarget: isEs ? 'Ciclo de metilación, SAMe, homocisteína, síntesis de glutatión' : 'Methylation cycle, SAMe, homocysteine, glutathione synthesis',
              clinicalRationale: isEs
                ? 'MTHFR T/T requiere formas ya metiladas de folato (el ácido fólico sintético no se convierte eficientemente). La suplementación con 5-MTHF + B12 metilada reduce la homocisteína y restaura el pool de SAMe necesario para >200 reacciones de metilación celular.'
                : 'MTHFR T/T requires already-methylated forms of folate (synthetic folic acid is not efficiently converted). 5-MTHF + methylated B12 supplementation reduces homocysteine and restores the SAMe pool needed for >200 cellular methylation reactions.',
              synergies: [
                { name: '5-MTHF', role: isEs ? 'Folato Activo' : 'Active Folate' },
                { name: isEs ? 'Metilcobalamina' : 'Methylcobalamin', role: isEs ? 'B12 Activa' : 'Active B12' },
                { name: 'TMG 500mg', role: isEs ? 'Donante de Metilo' : 'Methyl Donor' },
                { name: isEs ? 'Homocisteína Sérica' : 'Serum Homocysteine', role: isEs ? 'Monitoreo' : 'Monitoring' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el protocolo óptimo de suplementación para un paciente con MTHFR C677T homocigoto (T/T)?'
                : 'What is the optimal supplementation protocol for a patient with homozygous MTHFR C677T (T/T)?'
            }
          },
          {
            label: isEs ? 'GST / NAT2 Acetilador Lento' : 'GST / NAT2 Slow Acetylator',
            value: isEs ? 'Detoxificación Fase II Reducida' : 'Reduced Phase II Detoxification',
            status: 'warning',
            badge: isEs ? 'Detox Fase II Lenta' : 'Slow Phase II Detox',
            color: '#b45309',
            bgColor: '#fffbeb',
            description: isEs
              ? 'La glutatión S-transferasa (GST) y/o N-acetiltransferasa 2 (NAT2) muestran actividad reducida. Fase II de biotransformación hepática comprometida: los metabolitos intermedios generados por Fase I (CYP450) se acumulan al no conjugarse eficientemente. Mayor susceptibilidad a xenobióticos, pesticidas, humo de tabaco y metabolitos estrogénicos potencialmente carcinogénicos (4-OH-E1).'
              : 'Glutathione S-transferase (GST) and/or N-acetyltransferase 2 (NAT2) show reduced activity. Phase II hepatic biotransformation is compromised: intermediate metabolites generated by Phase I (CYP450) accumulate when not efficiently conjugated. Increased susceptibility to xenobiotics, pesticides, tobacco smoke, and potentially carcinogenic estrogenic metabolites (4-OH-E1).',
            clinicalProtocol: {
              slug: 'phase-ii-detox-support',
              queryParams: '?baseline=slow\u0026phase2=GST_NAT2\u0026tier=warning\u0026modality=support\u0026retest=12w',
              shortCode: 'REF-PGX-PH2',
              name: isEs ? 'Soporte Detox Fase II' : 'Phase II Detox Support',
              recommendedModality: isEs ? 'Precursores de Glutatión + Sulforafano + NAC' : 'Glutathione Precursors + Sulforaphane + NAC',
              dosageGuide: isEs ? 'NAC 1200mg/d + Sulforafano (brócoli germinado 30mg) + Glutatión Liposomal 500mg + Glicina 3g' : 'NAC 1,200mg/d + Sulforaphane (broccoli sprout 30mg) + Liposomal Glutathione 500mg + Glycine 3g',
              retestWindow: isEs ? 'Semana 12 (Marcadores de detox urinarios)' : 'Week 12 (Urinary detox markers)',
              cellularTarget: isEs ? 'Conjugación GSH, acetilación NAT2, glucuronidación UGT' : 'GSH conjugation, NAT2 acetylation, UGT glucuronidation',
              clinicalRationale: isEs
                ? 'La actividad reducida de Fase II es constitutiva pero compensable mediante suplementación con precursores de glutatión e inductores de Nrf2 (sulforafano). Estos amplifican las vías de conjugación residuales y protegen contra la acumulación de metabolitos reactivos.'
                : 'Reduced Phase II activity is constitutive but compensable through glutathione precursor supplementation and Nrf2 inducers (sulforaphane). These amplify residual conjugation pathways and protect against reactive metabolite accumulation.',
              synergies: [
                { name: 'NAC 1200mg', role: isEs ? 'Precursor Glutatión' : 'Glutathione Precursor' },
                { name: isEs ? 'Sulforafano' : 'Sulforaphane', role: isEs ? 'Inductor Nrf2' : 'Nrf2 Inducer' },
                { name: isEs ? 'Glutatión Liposomal' : 'Liposomal Glutathione', role: isEs ? 'Soporte Directo GSH' : 'Direct GSH Support' },
                { name: isEs ? 'Glicina 3g' : 'Glycine 3g', role: isEs ? 'Conjugación Hepática' : 'Hepatic Conjugation' }
              ],
              aiQuery: isEs
                ? '¿Cómo compensar una actividad GST/NAT2 lenta para mejorar la detoxificación hepática de Fase II?'
                : 'How to compensate slow GST/NAT2 activity to improve Phase II hepatic detoxification?'
            }
          }
        ]
      };
    }

    // ═══════════════════════════════════════════════════════════════════
    // TELETEST — HLA AUTOIMMUNITY (HLA Immunogenetics Panel)
    // Methodology: PCR-SSO / PCR-SSP / NGS · Specimen: Blood / Buccal swab
    // Clinical reference: ASHI (American Society for Histocompatibility)
    // ═══════════════════════════════════════════════════════════════════
    if (isTeletestHLA) {
      return {
        name: isEs ? 'Panel HLA Inmunogenético de Autoinmunidad' : 'HLA Immunogenetics Autoimmunity Panel',
        unit: isEs ? 'Alelos HLA (tipificación molecular)' : 'HLA Alleles (molecular typing)',
        method: isEs
          ? 'PCR-SSO (Sequence-Specific Oligonucleotide) / PCR-SSP / Secuenciación de Próxima Generación (NGS)'
          : 'PCR-SSO (Sequence-Specific Oligonucleotide) / PCR-SSP / Next-Generation Sequencing (NGS)',
        lab: 'Analytika Genomics Laboratory (EU) · ISO 15189 / EFI Accredited',
        lod: 'N/A (qualitative molecular typing)',
        range: isEs ? 'HLA-A, HLA-B, HLA-C (Clase I) + HLA-DRB1, HLA-DQB1, HLA-DPB1 (Clase II)' : 'HLA-A, HLA-B, HLA-C (Class I) + HLA-DRB1, HLA-DQB1, HLA-DPB1 (Class II)',
        precision: isEs ? 'Resolución media-alta (4 dígitos mínimo)' : 'Medium-high resolution (4-digit minimum)',
        officialReportPdf: '/docs/teletest-report-hla-autoimmunity.pdf',
        officialReportDocName: 'teletest-report-hla-autoimmunity.pdf',
        ranges: [
          {
            label: isEs ? 'HLA-B27 Positivo' : 'HLA-B27 Positive',
            value: isEs ? 'Alelo HLA-B*27 detectado' : 'HLA-B*27 allele detected',
            status: 'warning',
            badge: isEs ? 'Riesgo Espondiloartropatía' : 'Spondyloarthropathy Risk',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'El alelo HLA-B*27 está presente. El 90-95% de pacientes con Espondilitis Anquilosante (EA) son HLA-B27 positivos, aunque solo el 5-6% de portadores B27 desarrollan EA. Asociado también con artritis reactiva, uveítis anterior aguda, artritis psoriásica y enfermedad inflamatoria intestinal. La presencia del alelo NO es diagnóstica por sí sola — requiere correlación clínica con síntomas axiales y/o sacroilitis en imagen.'
              : 'The HLA-B*27 allele is present. 90-95% of Ankylosing Spondylitis (AS) patients are HLA-B27 positive, although only 5-6% of B27 carriers develop AS. Also associated with reactive arthritis, acute anterior uveitis, psoriatic arthritis, and inflammatory bowel disease. The presence of the allele is NOT diagnostic on its own — requires clinical correlation with axial symptoms and/or sacroiliitis on imaging.',
            clinicalProtocol: {
              slug: 'hla-b27-surveillance',
              queryParams: '?baseline=B27_positive\u0026allele=B27\u0026tier=warning\u0026modality=surveillance\u0026retest=annual',
              shortCode: 'REF-HLA-B27',
              name: isEs ? 'Vigilancia Clínica HLA-B27+' : 'HLA-B27+ Clinical Surveillance',
              recommendedModality: isEs ? 'Vigilancia Reumatológica + Anti-inflamación Preventiva' : 'Rheumatologic Surveillance + Preventive Anti-inflammation',
              dosageGuide: isEs ? 'Omega-3 EPA 2g/d + Curcumina 1g/d + Vitamina D 5000 UI/d; derivación a Reumatología si lumbalgia inflamatoria >3 meses' : 'Omega-3 EPA 2g/d + Curcumin 1g/d + Vitamin D 5,000 IU/d; Rheumatology referral if inflammatory back pain >3 months',
              retestWindow: isEs ? 'Anual (HLA es permanente; monitorizar clínica)' : 'Annual (HLA is permanent; monitor clinical presentation)',
              cellularTarget: isEs ? 'Presentación antigénica MHC-I, articulaciones sacroilíacas, úvea' : 'MHC-I antigen presentation, sacroiliac joints, uvea',
              clinicalRationale: isEs
                ? 'HLA-B27 es un factor de riesgo genético permanente. La vigilancia preventiva con anti-inflamatorios naturales puede modular la respuesta inmune innata y retrasar o prevenir la manifestación clínica en portadores asintomáticos.'
                : 'HLA-B27 is a permanent genetic risk factor. Preventive surveillance with natural anti-inflammatories can modulate innate immune response and delay or prevent clinical manifestation in asymptomatic carriers.',
              synergies: [
                { name: 'EPA 2g/d', role: isEs ? 'Anti-inflamación' : 'Anti-inflammation' },
                { name: isEs ? 'Curcumina 1g' : 'Curcumin 1g', role: isEs ? 'Modulación NF-κB' : 'NF-κB Modulation' },
                { name: isEs ? 'Vitamina D 5000 UI' : 'Vitamin D 5,000 IU', role: isEs ? 'Inmunomodulación' : 'Immunomodulation' },
                { name: isEs ? 'Reumatología' : 'Rheumatology', role: isEs ? 'Vigilancia Especializada' : 'Specialized Surveillance' }
              ],
              aiQuery: isEs
                ? '¿Qué porcentaje de portadores de HLA-B27 desarrollan espondilitis anquilosante y cómo se puede prevenir?'
                : 'What percentage of HLA-B27 carriers develop ankylosing spondylitis and how can it be prevented?'
            }
          },
          {
            label: isEs ? 'HLA-DRB1 Epítopo Compartido (SE)' : 'HLA-DRB1 Shared Epitope (SE)',
            value: isEs ? 'DRB1*01/*04/*10 (Epítopo Compartido +)' : 'DRB1*01/*04/*10 (Shared Epitope +)',
            status: 'warning',
            badge: isEs ? 'Riesgo Artritis Reumatoide' : 'Rheumatoid Arthritis Risk',
            color: '#ea580c',
            bgColor: '#fff7ed',
            description: isEs
              ? 'Detectados alelos HLA-DRB1 que contienen el "Epítopo Compartido" (secuencia QKRAA/QRRAA/RRRAA en posiciones 70-74 de la cadena DRβ1). El SE está presente en el 80-90% de pacientes con Artritis Reumatoide (AR) seropositiva. Doble copia (homocigoto SE) confiere mayor riesgo y peor pronóstico. Se asocia con producción de anticuerpos anti-CCP (anti-péptidos citrulinados cíclicos).'
              : 'HLA-DRB1 alleles containing the "Shared Epitope" (QKRAA/QRRAA/RRRAA sequence at positions 70-74 of the DRβ1 chain) detected. The SE is present in 80-90% of seropositive Rheumatoid Arthritis (RA) patients. Double copy (SE homozygous) confers higher risk and worse prognosis. Associated with anti-CCP (anti-cyclic citrullinated peptide) antibody production.',
            clinicalProtocol: {
              slug: 'shared-epitope-surveillance',
              queryParams: '?baseline=SE_positive\u0026allele=DRB1_SE\u0026tier=warning\u0026modality=surveillance\u0026retest=annual',
              shortCode: 'REF-HLA-SE',
              name: isEs ? 'Vigilancia Articular Epítopo Compartido' : 'Shared Epitope Joint Surveillance',
              recommendedModality: isEs ? 'Monitoreo Anticuerpos Anti-CCP + Anti-inflamación Preventiva' : 'Anti-CCP Antibody Monitoring + Preventive Anti-inflammation',
              dosageGuide: isEs ? 'Anti-CCP + FR cada 12 meses; Omega-3 3g/d + Curcumina + Vitamina D; derivar a Reumatología si rigidez matutina >30min' : 'Anti-CCP + RF every 12 months; Omega-3 3g/d + Curcumin + Vitamin D; Rheumatology referral if morning stiffness >30min',
              retestWindow: isEs ? 'Anual (Anti-CCP + FR séricos)' : 'Annual (Serum anti-CCP + RF)',
              cellularTarget: isEs ? 'Presentación MHC-II, células T CD4+, membrana sinovial' : 'MHC-II presentation, CD4+ T cells, synovial membrane',
              clinicalRationale: isEs
                ? 'El Epítopo Compartido es el factor genético de riesgo más fuerte para AR seropositiva. La detección de anti-CCP antes de los síntomas permite intervención precoz que puede prevenir el daño articular irreversible.'
                : 'The Shared Epitope is the strongest genetic risk factor for seropositive RA. Detecting anti-CCP before symptoms allows early intervention that can prevent irreversible joint damage.',
              synergies: [
                { name: 'Anti-CCP', role: isEs ? 'Detección Precoz' : 'Early Detection' },
                { name: 'Omega-3 3g', role: isEs ? 'Anti-inflamatorio' : 'Anti-inflammatory' },
                { name: isEs ? 'Vitamina D' : 'Vitamin D', role: isEs ? 'Inmunomodulación' : 'Immunomodulation' }
              ],
              aiQuery: isEs
                ? '¿Cómo el Epítopo Compartido HLA-DRB1 predispone a la Artritis Reumatoide y cuál es la ventana de intervención precoz?'
                : 'How does the HLA-DRB1 Shared Epitope predispose to Rheumatoid Arthritis and what is the early intervention window?'
            }
          },
          {
            label: isEs ? 'Perfil HLA Sin Alelos de Riesgo' : 'HLA Profile Without Risk Alleles',
            value: isEs ? 'Sin alelos HLA de riesgo autoinmune identificados' : 'No autoimmune risk HLA alleles identified',
            status: 'optimal',
            badge: isEs ? 'Bajo Riesgo Genético' : 'Low Genetic Risk',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            description: isEs
              ? 'El panel HLA no ha identificado alelos asociados con alto riesgo de enfermedades autoinmunes. Esto NO excluye el riesgo autoinmune (que también depende de factores ambientales, epigenéticos y de otros genes), pero reduce significativamente la probabilidad genética. Resultado tranquilizador que debe archivarse para referencia futura.'
              : 'The HLA panel has not identified alleles associated with high autoimmune disease risk. This does NOT exclude autoimmune risk (which also depends on environmental, epigenetic, and other gene factors), but significantly reduces genetic probability. Reassuring result that should be archived for future reference.',
            clinicalProtocol: {
              slug: 'hla-low-risk-maintenance',
              queryParams: '?baseline=low_risk\u0026hla=no_risk_alleles\u0026tier=optimal\u0026modality=maintenance\u0026retest=none',
              shortCode: 'REF-HLA-LOW',
              name: isEs ? 'Perfil HLA de Bajo Riesgo — Archivo' : 'Low Risk HLA Profile — Archive',
              recommendedModality: isEs ? 'Archivo de Resultado + Estilo de Vida Anti-inflamatorio' : 'Result Archive + Anti-inflammatory Lifestyle',
              dosageGuide: isEs ? 'Dieta antiinflamatoria + Omega-3 + Vitamina D como base preventiva general' : 'Anti-inflammatory diet + Omega-3 + Vitamin D as general preventive base',
              retestWindow: isEs ? 'No requiere (genotipo permanente)' : 'Not required (permanent genotype)',
              cellularTarget: isEs ? 'Homeostasis inmunológica general' : 'General immunological homeostasis',
              clinicalRationale: isEs
                ? 'Ausencia de alelos HLA de alto riesgo autoinmune. El resultado de tipificación HLA es de por vida y debe conservarse en el historial médico del paciente.'
                : 'Absence of high-risk autoimmune HLA alleles. HLA typing result is lifelong and should be preserved in the patient\'s medical record.',
              synergies: [
                { name: isEs ? 'Archivo Médico' : 'Medical Archive', role: isEs ? 'Referencia Permanente' : 'Permanent Reference' },
                { name: isEs ? 'Estilo de Vida' : 'Lifestyle', role: isEs ? 'Prevención General' : 'General Prevention' }
              ],
              aiQuery: isEs
                ? '¿Tener un perfil HLA sin alelos de riesgo descarta completamente las enfermedades autoinmunes?'
                : 'Does having an HLA profile without risk alleles completely rule out autoimmune diseases?'
            }
          },
          {
            label: isEs ? 'HLA-DQ2.5 / DQ8 Positivo (Celíaca)' : 'HLA-DQ2.5 / DQ8 Positive (Celiac)',
            value: isEs ? 'DQA1*05:01–DQB1*02:01 (DQ2.5) y/o DQ8 detectado' : 'DQA1*05:01–DQB1*02:01 (DQ2.5) and/or DQ8 detected',
            status: 'warning',
            badge: isEs ? 'Riesgo Celíaco' : 'Celiac Risk',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Alelos HLA-DQ2.5 y/o DQ8 detectados en el panel de autoinmunidad. >95% de pacientes celíacos portan DQ2.5 o DQ8, aunque solo el 3-5% de portadores desarrollan la enfermedad. Este hallazgo es necesario pero no suficiente para el diagnóstico. Considerar test serológico específico (anti-tTG IgA) si hay síntomas gastrointestinales o sospecha clínica. Para estudio genético dedicado, el TeleTest Celíaca ofrece mayor profundidad.'
              : 'HLA-DQ2.5 and/or DQ8 alleles detected in the autoimmunity panel. >95% of celiac patients carry DQ2.5 or DQ8, although only 3-5% of carriers develop the disease. This finding is necessary but not sufficient for diagnosis. Consider specific serologic test (anti-tTG IgA) if gastrointestinal symptoms or clinical suspicion. For a dedicated genetic study, the TeleTest Celiac offers greater depth.',
            clinicalProtocol: {
              slug: 'celiac-screening-from-hla',
              queryParams: '?baseline=DQ2_DQ8_positive\u0026source=hla_panel\u0026tier=warning\u0026modality=screening\u0026retest=annual',
              shortCode: 'REF-HLA-CEL',
              name: isEs ? 'Cribado Celíaco por HLA Positivo' : 'Celiac Screening via Positive HLA',
              recommendedModality: isEs ? 'Serología Anti-tTG IgA + Monitoreo Clínico' : 'Anti-tTG IgA Serology + Clinical Monitoring',
              dosageGuide: isEs ? 'Anti-tTG IgA + IgA total anual mientras consuma gluten; si serología positiva → biopsia duodenal (Marsh)' : 'Anti-tTG IgA + total IgA annually while consuming gluten; if serology positive → duodenal biopsy (Marsh)',
              retestWindow: isEs ? 'Anual (mientras consuma gluten)' : 'Annual (while consuming gluten)',
              cellularTarget: isEs ? 'Mucosa duodenal, transglutaminasa tisular, linfocitos intraepiteliales' : 'Duodenal mucosa, tissue transglutaminase, intraepithelial lymphocytes',
              clinicalRationale: isEs
                ? 'HLA-DQ2.5/DQ8 detectado en el panel HLA general de autoinmunidad. Derivar a serología celíaca específica para descartar enfermedad activa.'
                : 'HLA-DQ2.5/DQ8 detected in the general autoimmunity HLA panel. Refer to specific celiac serology to rule out active disease.',
              synergies: [
                { name: 'Anti-tTG IgA', role: isEs ? 'Confirmación Serológica' : 'Serologic Confirmation' },
                { name: isEs ? 'Biopsia Duodenal' : 'Duodenal Biopsy', role: isEs ? 'Gold Standard Diagnóstico' : 'Diagnostic Gold Standard' },
                { name: isEs ? 'TeleTest Celíaca' : 'TeleTest Celiac', role: isEs ? 'Estudio Genético Dedicado' : 'Dedicated Genetic Study' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el algoritmo diagnóstico cuando se detecta HLA-DQ2.5 o DQ8 en un panel de autoinmunidad?'
                : 'What is the diagnostic algorithm when HLA-DQ2.5 or DQ8 is detected in an autoimmunity panel?'
            }
          },
          {
            label: isEs ? 'Múltiples Alelos de Riesgo Autoinmune' : 'Multiple Autoimmune Risk Alleles',
            value: isEs ? 'HLA-B27 + SE + DQ2.5/DQ8 (acumulación de riesgo)' : 'HLA-B27 + SE + DQ2.5/DQ8 (risk accumulation)',
            status: 'critical',
            badge: isEs ? 'Riesgo Autoinmune Múltiple' : 'Multiple Autoimmune Risk',
            color: '#7c2d12',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Se detectan múltiples alelos HLA de riesgo autoinmune simultáneamente. La presencia combinada de B27 + SE + DQ2.5/DQ8 indica una susceptibilidad genética amplia a enfermedades autoinmunes de diferentes ejes (axial, articular, intestinal). Requiere vigilancia inmunológica integral y derivación a Inmunología/Reumatología para establecer un plan de monitoreo personalizado.'
              : 'Multiple autoimmune risk HLA alleles detected simultaneously. The combined presence of B27 + SE + DQ2.5/DQ8 indicates broad genetic susceptibility to autoimmune diseases across different axes (axial, articular, intestinal). Requires comprehensive immunological surveillance and Immunology/Rheumatology referral for a personalized monitoring plan.',
            clinicalProtocol: {
              slug: 'multi-autoimmune-surveillance',
              queryParams: '?baseline=multi_risk\u0026alleles=B27_SE_DQ2\u0026tier=critical\u0026modality=specialist\u0026retest=6m',
              shortCode: 'REF-HLA-MULTI',
              name: isEs ? 'Vigilancia Autoinmune Multiaxial' : 'Multiaxial Autoimmune Surveillance',
              recommendedModality: isEs ? 'Inmunología Especializada + Panel Autoanticuerpos Completo' : 'Specialized Immunology + Complete Autoantibody Panel',
              dosageGuide: isEs ? 'Panel autoanticuerpos completo (ANA, anti-CCP, FR, anti-tTG) + Vitamina D 5000 UI + Omega-3 3g + evaluación reumatológica cada 6 meses' : 'Complete autoantibody panel (ANA, anti-CCP, RF, anti-tTG) + Vitamin D 5,000 IU + Omega-3 3g + rheumatologic evaluation every 6 months',
              retestWindow: isEs ? 'Semestral (Panel autoanticuerpos)' : 'Biannual (Autoantibody panel)',
              cellularTarget: isEs ? 'MHC-I y MHC-II, tolerancia central y periférica, Tregs' : 'MHC-I and MHC-II, central and peripheral tolerance, Tregs',
              clinicalRationale: isEs
                ? 'Susceptibilidad genética multi-eje que requiere monitoreo proactivo. La detección precoz de autoanticuerpos antes de la manifestación clínica permite intervención en la fase "pre-clínica" de las enfermedades autoinmunes.'
                : 'Multi-axis genetic susceptibility requiring proactive monitoring. Early autoantibody detection before clinical manifestation enables intervention in the "pre-clinical" phase of autoimmune diseases.',
              synergies: [
                { name: isEs ? 'Inmunología' : 'Immunology', role: isEs ? 'Evaluación Especializada' : 'Specialized Evaluation' },
                { name: isEs ? 'Panel Autoanticuerpos' : 'Autoantibody Panel', role: isEs ? 'Detección Precoz' : 'Early Detection' },
                { name: isEs ? 'Vitamina D + ω-3' : 'Vitamin D + ω-3', role: isEs ? 'Inmunomodulación' : 'Immunomodulation' },
                { name: isEs ? 'Estilo de Vida' : 'Lifestyle', role: isEs ? 'Reducción Triggers' : 'Trigger Reduction' }
              ],
              aiQuery: isEs
                ? '¿Cómo manejar un paciente con múltiples alelos HLA de riesgo autoinmune (B27 + SE + DQ2.5)?'
                : 'How to manage a patient with multiple autoimmune risk HLA alleles (B27 + SE + DQ2.5)?'
            }
          }
        ]
      };
    }

    // ═══════════════════════════════════════════════════════════════════
    // TELETEST — ESTUDIO GENÉTICO CELÍACA (HLA-DQ2/DQ8 Dedicated)
    // Methodology: PCR-SSP / RT-PCR · Specimen: Blood / Buccal swab
    // Clinical reference: ESPGHAN 2020 (European Society for Paediatric
    //   Gastroenterology, Hepatology and Nutrition)
    // ═══════════════════════════════════════════════════════════════════
    if (isTeletestCeliac) {
      return {
        name: isEs ? 'Estudio Genético Enfermedad Celíaca (HLA-DQ2 / DQ8)' : 'Celiac Disease Genetic Study (HLA-DQ2 / DQ8)',
        unit: isEs ? 'Alelos HLA-DQ (tipificación molecular)' : 'HLA-DQ Alleles (molecular typing)',
        method: isEs
          ? 'PCR-SSP (Sequence-Specific Primers) / RT-PCR con sondas TaqMan'
          : 'PCR-SSP (Sequence-Specific Primers) / RT-PCR with TaqMan probes',
        lab: 'Analytika Genomics Laboratory (EU) · ISO 15189',
        lod: 'N/A (qualitative molecular typing)',
        range: isEs ? 'DQA1*05, DQB1*02 (DQ2.5), DQA1*02:01, DQB1*03:02 (DQ8), DQB1*02:02 (DQ2.2)' : 'DQA1*05, DQB1*02 (DQ2.5), DQA1*02:01, DQB1*03:02 (DQ8), DQB1*02:02 (DQ2.2)',
        precision: isEs ? 'Sensibilidad/Especificidad >99% para DQ2.5 y DQ8' : 'Sensitivity/Specificity >99% for DQ2.5 and DQ8',
        officialReportPdf: '/docs/teletest-report-celiac.pdf',
        officialReportDocName: 'teletest-report-celiac.pdf',
        ranges: [
          {
            label: isEs ? 'HLA-DQ2.5 Homocigoto' : 'HLA-DQ2.5 Homozygous',
            value: 'DQA1*05/DQB1*02 (doble dosis)',
            status: 'critical',
            badge: isEs ? 'Riesgo Máximo Celíaco' : 'Maximum Celiac Risk',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Genotipo de máximo riesgo celíaco: DQ2.5 en doble copia (homocigoto). El riesgo de desarrollar enfermedad celíaca es 5 veces mayor que en heterocigotos DQ2.5. Este genotipo se asocia con mayor densidad de moléculas DQ2.5 en la superficie de las células presentadoras de antígeno, lo que amplifica la respuesta inmune contra péptidos de gliadina desaminados. Presente en ~25% de los celíacos.'
              : 'Maximum celiac risk genotype: DQ2.5 in double copy (homozygous). The risk of developing celiac disease is 5 times higher than in DQ2.5 heterozygotes. This genotype is associated with higher density of DQ2.5 molecules on antigen-presenting cell surfaces, amplifying the immune response against deaminated gliadin peptides. Present in ~25% of celiacs.',
            clinicalProtocol: {
              slug: 'celiac-high-risk-monitoring',
              queryParams: '?baseline=DQ2.5_homozygous\u0026risk=maximum\u0026tier=critical\u0026modality=monitoring\u0026retest=annual',
              shortCode: 'REF-CEL-MAX',
              name: isEs ? 'Monitoreo Celíaco de Alto Riesgo' : 'High-Risk Celiac Monitoring',
              recommendedModality: isEs ? 'Serología Celíaca Anual + Evaluación Gastroenterológica' : 'Annual Celiac Serology + Gastroenterologic Evaluation',
              dosageGuide: isEs ? 'Anti-tTG IgA + IgA total anual; si positivo → biopsia duodenal con clasificación Marsh; considerar GFD proactiva si serología borderline' : 'Anti-tTG IgA + total IgA annually; if positive → duodenal biopsy with Marsh classification; consider proactive GFD if borderline serology',
              retestWindow: isEs ? 'Anual (mientras consuma gluten)' : 'Annual (while consuming gluten)',
              cellularTarget: isEs ? 'Mucosa duodenal, tTG, linfocitos intraepiteliales CD8+, vellosidades intestinales' : 'Duodenal mucosa, tTG, CD8+ intraepithelial lymphocytes, intestinal villi',
              clinicalRationale: isEs
                ? 'Riesgo genético máximo por doble dosis de DQ2.5. Cada molécula DQ2.5 adicional en la membrana de APC incrementa la eficiencia de presentación de péptidos de gliadina, multiplicando la respuesta linfocitaria T. Monitoreo serológico anual obligatorio.'
                : 'Maximum genetic risk from double-dose DQ2.5. Each additional DQ2.5 molecule on APC membrane increases gliadin peptide presentation efficiency, multiplying T lymphocyte response. Annual serologic monitoring mandatory.',
              synergies: [
                { name: 'Anti-tTG IgA', role: isEs ? 'Cribado Serológico' : 'Serologic Screening' },
                { name: isEs ? 'IgA Total' : 'Total IgA', role: isEs ? 'Descartar Déficit IgA' : 'Rule Out IgA Deficiency' },
                { name: isEs ? 'Gastroenterología' : 'Gastroenterology', role: isEs ? 'Biopsia si Positivo' : 'Biopsy if Positive' },
                { name: isEs ? 'Vitamina D + Fe + B12' : 'Vitamin D + Fe + B12', role: isEs ? 'Prevenir Malabsorción' : 'Prevent Malabsorption' }
              ],
              aiQuery: isEs
                ? '¿Por qué los homocigotos HLA-DQ2.5 tienen 5 veces más riesgo de enfermedad celíaca que los heterocigotos?'
                : 'Why do HLA-DQ2.5 homozygotes have 5 times higher celiac disease risk than heterozygotes?'
            }
          },
          {
            label: isEs ? 'HLA-DQ2.5 Heterocigoto' : 'HLA-DQ2.5 Heterozygous',
            value: 'DQA1*05/DQB1*02 (cis o trans)',
            status: 'warning',
            badge: isEs ? 'Riesgo Moderado-Alto' : 'Moderate-High Risk',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Heterodímero HLA-DQ2.5 presente en una sola copia (heterocigoto). Este es el genotipo más frecuente entre celíacos (~60% de los casos). El heterodímero puede formarse en cis (mismo cromosoma: DR3-DQ2 haplotype) o en trans (cromosomas diferentes: DR5/DR7). El riesgo absoluto de celiaquía es del 3-5% para portadores, pero sube al 10-15% si hay familiar de primer grado celíaco.'
              : 'HLA-DQ2.5 heterodimer present in a single copy (heterozygous). This is the most frequent genotype among celiacs (~60% of cases). The heterodimer can be formed in cis (same chromosome: DR3-DQ2 haplotype) or in trans (different chromosomes: DR5/DR7). Absolute celiac risk is 3-5% for carriers, but rises to 10-15% with a first-degree relative who has celiac disease.',
            clinicalProtocol: {
              slug: 'celiac-moderate-risk-screening',
              queryParams: '?baseline=DQ2.5_het\u0026risk=moderate_high\u0026tier=warning\u0026modality=screening\u0026retest=annual',
              shortCode: 'REF-CEL-MOD',
              name: isEs ? 'Cribado Celíaco Riesgo Moderado-Alto' : 'Moderate-High Risk Celiac Screening',
              recommendedModality: isEs ? 'Serología Celíaca Anual' : 'Annual Celiac Serology',
              dosageGuide: isEs ? 'Anti-tTG IgA + IgA total cada 12 meses; DGP IgG si déficit de IgA; ante síntomas GI → derivar a Gastroenterología' : 'Anti-tTG IgA + total IgA every 12 months; DGP IgG if IgA deficiency; for GI symptoms → refer to Gastroenterology',
              retestWindow: isEs ? 'Anual' : 'Annual',
              cellularTarget: isEs ? 'Mucosa duodenal, respuesta Th1 a gliadina' : 'Duodenal mucosa, Th1 response to gliadin',
              clinicalRationale: isEs
                ? 'Riesgo genético moderado-alto. La seroconversión puede ocurrir a cualquier edad, por lo que el monitoreo debe ser continuo mientras se consuma gluten.'
                : 'Moderate-high genetic risk. Seroconversion can occur at any age, so monitoring must be continuous while consuming gluten.',
              synergies: [
                { name: 'Anti-tTG IgA', role: isEs ? 'Cribado Anual' : 'Annual Screening' },
                { name: isEs ? 'Historia Familiar' : 'Family History', role: isEs ? 'Estratificación de Riesgo' : 'Risk Stratification' }
              ],
              aiQuery: isEs
                ? '¿Cuál es la diferencia entre formar el HLA-DQ2.5 en cis vs en trans y cómo afecta al riesgo celíaco?'
                : 'What is the difference between forming HLA-DQ2.5 in cis vs trans and how does it affect celiac risk?'
            }
          },
          {
            label: isEs ? 'HLA-DQ8 Positivo (sin DQ2.5)' : 'HLA-DQ8 Positive (without DQ2.5)',
            value: 'DQA1*03:01/DQB1*03:02 (DQ8)',
            status: 'warning',
            badge: isEs ? 'Riesgo Moderado' : 'Moderate Risk',
            color: '#ca8a04',
            bgColor: '#fefce8',
            description: isEs
              ? 'HLA-DQ8 detectado sin DQ2.5. Aproximadamente el 5-10% de pacientes celíacos son DQ8 positivos sin DQ2.5. El riesgo absoluto es menor que para DQ2.5 pero no despreciable, especialmente en combinación con factores ambientales (infecciones virales tempranas, microbiota intestinal alterada). Se asocia particularmente con celiaquía de presentación tardía (adultos) y con diabetes mellitus tipo 1.'
              : 'HLA-DQ8 detected without DQ2.5. Approximately 5-10% of celiac patients are DQ8 positive without DQ2.5. Absolute risk is lower than for DQ2.5 but not negligible, especially combined with environmental factors (early viral infections, altered gut microbiota). Particularly associated with late-onset celiac disease (adults) and type 1 diabetes mellitus.',
            clinicalProtocol: {
              slug: 'celiac-dq8-screening',
              queryParams: '?baseline=DQ8_positive\u0026risk=moderate\u0026tier=warning\u0026modality=screening\u0026retest=biannual',
              shortCode: 'REF-CEL-DQ8',
              name: isEs ? 'Cribado Celíaco por DQ8' : 'DQ8 Celiac Screening',
              recommendedModality: isEs ? 'Serología Celíaca Bianual' : 'Biannual Celiac Serology',
              dosageGuide: isEs ? 'Anti-tTG IgA cada 2 años si asintomático; anual si síntomas GI o DM1 comórbida' : 'Anti-tTG IgA every 2 years if asymptomatic; annual if GI symptoms or comorbid T1DM',
              retestWindow: isEs ? 'Bianual (o anual si síntomas)' : 'Biannual (or annual if symptoms)',
              cellularTarget: isEs ? 'Mucosa duodenal, presentación a células T CD4+ restringida por DQ8' : 'Duodenal mucosa, DQ8-restricted CD4+ T cell presentation',
              clinicalRationale: isEs
                ? 'Riesgo moderado por DQ8 aislado. Vigilancia menos intensiva que DQ2.5 pero necesaria, especialmente si coexiste con diabetes tipo 1 (asociación genética compartida).'
                : 'Moderate risk from isolated DQ8. Less intensive surveillance than DQ2.5 but necessary, especially if type 1 diabetes coexists (shared genetic association).',
              synergies: [
                { name: 'Anti-tTG IgA', role: isEs ? 'Cribado Bianual' : 'Biannual Screening' },
                { name: isEs ? 'Screening DM1' : 'T1DM Screening', role: isEs ? 'Asociación Genética' : 'Genetic Association' }
              ],
              aiQuery: isEs
                ? '¿Cuál es el riesgo real de celiaquía para portadores de HLA-DQ8 sin DQ2.5?'
                : 'What is the actual celiac risk for HLA-DQ8 carriers without DQ2.5?'
            }
          },
          {
            label: isEs ? 'HLA-DQ2.5 + DQ8 (Doble Positivo)' : 'HLA-DQ2.5 + DQ8 (Double Positive)',
            value: isEs ? 'Ambos heterodímeros DQ2.5 y DQ8 presentes' : 'Both DQ2.5 and DQ8 heterodimers present',
            status: 'critical',
            badge: isEs ? 'Doble Riesgo Genético' : 'Double Genetic Risk',
            color: '#991b1b',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Ambos heterodímeros de riesgo celíaco (DQ2.5 y DQ8) están presentes. Esta combinación amplía el repertorio de péptidos de gliadina que el sistema inmune puede reconocer, ya que cada heterodímero presenta un subconjunto diferente de epítopos. Riesgo acumulativo superior al de cualquiera de los alelos por separado. Requiere monitoreo serológico anual estricto.'
              : 'Both celiac risk heterodimers (DQ2.5 and DQ8) are present. This combination broadens the repertoire of gliadin peptides the immune system can recognize, as each heterodimer presents a different subset of epitopes. Cumulative risk exceeds that of either allele alone. Requires strict annual serologic monitoring.',
            clinicalProtocol: {
              slug: 'celiac-double-positive-monitoring',
              queryParams: '?baseline=DQ2.5_DQ8_double\u0026risk=high\u0026tier=critical\u0026modality=intensive_monitoring\u0026retest=annual',
              shortCode: 'REF-CEL-DBL',
              name: isEs ? 'Monitoreo Intensivo Celíaco Doble Positivo' : 'Intensive Double-Positive Celiac Monitoring',
              recommendedModality: isEs ? 'Serología + Evaluación GI Anual Estricta' : 'Strict Annual Serology + GI Evaluation',
              dosageGuide: isEs ? 'Anti-tTG IgA + DGP IgG + IgA total anual; biopsia ante cualquier elevación serológica; considerar cápsula endoscópica si serología discordante' : 'Anti-tTG IgA + DGP IgG + total IgA annually; biopsy for any serologic elevation; consider video capsule endoscopy if discordant serology',
              retestWindow: isEs ? 'Anual (estricto)' : 'Annual (strict)',
              cellularTarget: isEs ? 'Doble repertorio de presentación antigénica DQ2.5 + DQ8' : 'Double antigen presentation repertoire DQ2.5 + DQ8',
              clinicalRationale: isEs
                ? 'Portador de ambos heterodímeros de riesgo: el espectro inmunogénico cubierto es máximo. Cada molécula HLA presenta un subconjunto diferente de péptidos de gliadina, multiplicando las vías de activación autoinmune.'
                : 'Carrier of both risk heterodimers: the immunogenic spectrum covered is maximum. Each HLA molecule presents a different subset of gliadin peptides, multiplying autoimmune activation pathways.',
              synergies: [
                { name: 'Anti-tTG + DGP', role: isEs ? 'Panel Serológico Completo' : 'Complete Serologic Panel' },
                { name: isEs ? 'Gastroenterología' : 'Gastroenterology', role: isEs ? 'Evaluación Endoscópica' : 'Endoscopic Evaluation' },
                { name: isEs ? 'Nutrición' : 'Nutrition', role: isEs ? 'Preparación GFD' : 'GFD Preparation' }
              ],
              aiQuery: isEs
                ? '¿Por qué la presencia simultánea de HLA-DQ2.5 y DQ8 incrementa el riesgo celíaco de forma sinérgica?'
                : 'Why does the simultaneous presence of HLA-DQ2.5 and DQ8 synergistically increase celiac risk?'
            }
          },
          {
            label: isEs ? 'HLA-DQ2 / DQ8 Negativo' : 'HLA-DQ2 / DQ8 Negative',
            value: isEs ? 'Ni DQ2.5, ni DQ2.2, ni DQ8 detectados' : 'Neither DQ2.5, nor DQ2.2, nor DQ8 detected',
            status: 'optimal',
            badge: isEs ? 'Celíaca Excluida (99%)' : 'Celiac Excluded (99%)',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            description: isEs
              ? 'No se detectan alelos HLA-DQ2.5, DQ2.2 ni DQ8. El valor predictivo negativo es >99%: la enfermedad celíaca queda virtualmente descartada. Según las guías ESPGHAN 2020, un resultado negativo para DQ2 y DQ8 excluye el diagnóstico con un nivel de certeza muy alto. Este resultado es especialmente útil para familiares de celíacos y para pacientes ya en dieta sin gluten donde la serología es poco fiable.'
              : 'No HLA-DQ2.5, DQ2.2, or DQ8 alleles detected. The negative predictive value is >99%: celiac disease is virtually ruled out. Per ESPGHAN 2020 guidelines, a negative result for DQ2 and DQ8 excludes the diagnosis with very high certainty. This result is especially useful for relatives of celiacs and for patients already on a gluten-free diet where serology is unreliable.',
            clinicalProtocol: {
              slug: 'celiac-excluded-by-genetics',
              queryParams: '?baseline=DQ_negative\u0026risk=negligible\u0026tier=optimal\u0026modality=reassurance\u0026retest=none',
              shortCode: 'REF-CEL-NEG',
              name: isEs ? 'Celíaca Excluida Genéticamente — Archivo' : 'Genetically Excluded Celiac — Archive',
              recommendedModality: isEs ? 'Archivo Definitivo — No Requiere Seguimiento Celíaco' : 'Definitive Archive — No Celiac Follow-up Required',
              dosageGuide: isEs ? 'No requiere serología celíaca futura. Si hay síntomas GI, investigar otras causas (SIBO, intolerancia a FODMAPs, sensibilidad al gluten no celíaca)' : 'No future celiac serology required. If GI symptoms persist, investigate other causes (SIBO, FODMAP intolerance, non-celiac gluten sensitivity)',
              retestWindow: isEs ? 'No requiere (resultado genético definitivo)' : 'Not required (definitive genetic result)',
              cellularTarget: isEs ? 'N/A — Enfermedad Celíaca excluida' : 'N/A — Celiac Disease excluded',
              clinicalRationale: isEs
                ? 'VPN >99% según ESPGHAN 2020. Este resultado permite: (1) descartar celiaquía definitivamente, (2) evitar pruebas innecesarias en el futuro, (3) si hay síntomas GI, redirigir la investigación a otras etiologías (SIBO, NCGS, IBS). Resultado de por vida.'
                : 'NPV >99% per ESPGHAN 2020. This result allows: (1) definitive celiac disease exclusion, (2) avoiding unnecessary future testing, (3) if GI symptoms exist, redirecting investigation to other etiologies (SIBO, NCGS, IBS). Lifetime result.',
              synergies: [
                { name: isEs ? 'Archivo Genético' : 'Genetic Archive', role: isEs ? 'Resultado Definitivo' : 'Definitive Result' },
                { name: isEs ? 'Investigación GI' : 'GI Investigation', role: isEs ? 'Otras Causas si Síntomas' : 'Other Causes if Symptoms' }
              ],
              aiQuery: isEs
                ? '¿Un resultado HLA-DQ2/DQ8 negativo descarta definitivamente la enfermedad celíaca?'
                : 'Does a negative HLA-DQ2/DQ8 result definitively rule out celiac disease?'
            }
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
      officialReportPdf: '/docs/bloodo-report-vitamin-d.pdf',
      officialReportDocName: 'bloodo-report-vitamin-d.pdf',
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
            : 'Clinical deficiency linked to bone demineralization, compromised innate immunity, and systemic musculoskeletal weakness.',
          clinicalProtocol: {
            slug: 'immune-modulation-8w',
            queryParams: '?baseline=deficient&vitd_level=14&tier=critical&modality=rescue&retest=8w',
            shortCode: 'REF-IMM-TA1',
            name: isEs 
              ? 'Protocolo de Rescate Inmunológico y Repleción Genómica VDR' 
              : 'Immunological Rescue & VDR Genomic Repletion Protocol',
            tierTitle: isEs ? 'TIER 1 · RESCATE INMUNOLÓGICO Y ESTIMULACIÓN TIMOCÍTICA' : 'TIER 1 · IMMUNOLOGICAL RESCUE & THYMIC ACTIVATION',
            targetGoal: isEs ? 'Elevar 25(OH)D a rango óptimo funcional (50 – 70 ng/mL)' : 'Restore 25(OH)D to optimal functional range (50 – 70 ng/mL)',
            recommendedModality: isEs ? 'Biorregulación con Thymosin Alpha-1 + Megadosis Oral D3/K2' : 'Thymosin Alpha-1 Bioregulation + High-Dose D3/K2 Repletion',
            dosageGuide: isEs ? 'Thymosin Alpha-1 1.6 mg SC 2x/sem x 8 sem + Vitamina D3 10.000 UI/día con K2 (MK-7 200 mcg)' : 'Thymosin Alpha-1 1.6 mg SC 2x/wk x 8 wks + Vitamin D3 10,000 IU/day with K2 (MK-7 200 mcg)',
            methylationRx: isEs ? 'Magnesio Malato/Glicinato 400 mg (Cofactor enzimático VDR obligatorio)' : 'Magnesium Malate/Glycinate 400 mg (Mandatory VDR cofactor)',
            retestWindow: isEs ? 'Semana 8 (Evaluación de respuesta inmuno-endocrina DBS)' : 'Week 8 (DBS immuno-endocrine response check)',
            cellularTarget: isEs ? 'Receptor nuclear VDR, linfocitos Treg, maduración de células T' : 'Nuclear VDR, regulatory T cells (Tregs), T-cell maturation',
            clinicalRationale: isEs
              ? 'Déficit severo de 25(OH)D que deteriora la transcripción de catelicidina y defensinas en macrófagos, favoreciendo hiperreactividad inflamatoria y autoinmunidad. Se asocia Thymosin Alpha-1 para modular la expresión de linfocitos T colaboradores y dosis de carga de colecalciferol con cofactores de fijación ósea.'
              : 'Severe 25(OH)D deficiency crippling antimicrobial peptide transcription and T-cell differentiation. Indication for thymic peptide bioregulation (Thymosin Alpha-1) coupled with high-dose cholecalciferol repletion and critical magnesium cofactors.',
            synergies: [
              { name: 'Thymosin Alpha-1', role: isEs ? 'Inmunomodulación' : 'Immunomodulation' },
              { name: 'Vitamina D3 10.000 UI', role: isEs ? 'Dosis de Carga' : 'Loading Dose' },
              { name: 'Vitamina K2 MK-7', role: isEs ? 'Dirección de Calcio' : 'Calcium Routing' },
              { name: 'Magnesio Glicinato', role: isEs ? 'Activación VDR' : 'VDR Activation' }
            ],
            aiQuery: isEs
              ? '¿Cuál es la pauta de rescate con Thymosin Alpha-1 y Vitamina D3 ante deficiencia analítica inferior a 20 ng/mL?'
              : 'What is the recommended Thymosin Alpha-1 and Vitamin D3 rescue protocol for severe deficiency below 20 ng/mL?'
          }
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
            : 'Suboptimal for endocrine regulation and cellular immunity. Common baseline in temperate latitudes requiring supplementation.',
          clinicalProtocol: {
            slug: 'immune-modulation-8w',
            queryParams: '?baseline=insufficient&vitd_level=24&tier=warning&modality=repletion&retest=10w',
            shortCode: 'REF-IMM-TA1',
            name: isEs 
              ? 'Protocolo de Biorregulación e Inmuno-Optimización Estacional' 
              : 'Seasonal Immune Bioregulation & Repletion Protocol',
            tierTitle: isEs ? 'TIER 2 · OPTIMIZACIÓN INMUNOLÓGICA Y BALANCE VDR' : 'TIER 2 · IMMUNE OPTIMIZATION & VDR HOMEOSTASIS',
            targetGoal: isEs ? 'Alcanzar el umbral óptimo de 50 – 70 ng/mL' : 'Consolidate optimal threshold 50 – 70 ng/mL',
            recommendedModality: isEs ? 'Repleción Fisiológica D3/K2 + Soporte Peptídico Ciclado' : 'Physiological D3/K2 Repletion + Cyclical Peptide Support',
            dosageGuide: isEs ? 'Vitamina D3 5.000 UI/día + K2 100 mcg + Thymosin Alpha-1 1.6 mg SC semanal' : 'Vitamin D3 5,000 IU/day + K2 100 mcg + Thymosin Alpha-1 1.6 mg SC weekly',
            methylationRx: isEs ? 'Magnesio Quelado 300 mg con la cena' : 'Chelated Magnesium 300 mg with dinner',
            retestWindow: isEs ? 'Semana 10 (Evaluación analítica capilar)' : 'Week 10 (Capillary blood spot audit)',
            cellularTarget: isEs ? 'Homeostasis de calcio, respuesta inmunitaria innata' : 'Calcium homeostasis, innate immune resilience',
            clinicalRationale: isEs
              ? 'Insuficiencia moderada común en estilos de vida bajo luz artificial. La suplementación orientada restaura la inmunovigilancia y reduce la fatiga estacional.'
              : 'Moderate insufficiency common with low solar exposure. Target repletion restores immune surveillance and reduces seasonal allostatic fatigue.',
            synergies: [
              { name: 'Vitamina D3 5.000 UI', role: isEs ? 'Optimización' : 'Repletion' },
              { name: 'K2 MK-7 100mcg', role: isEs ? 'Cofactor' : 'Cofactor' },
              { name: 'Thymosin Alpha-1', role: isEs ? 'Vigilancia Inmune' : 'Immune Surveillance' }
            ],
            aiQuery: isEs
              ? '¿Qué estrategia de suplementación se aconseja para insuficiencia de vitamina D entre 20 y 30 ng/mL?'
              : 'What supplementation protocol is advised for vitamin D insufficiency between 20 and 30 ng/mL?'
          }
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
            : 'Standard therapeutic target for calcium homeostasis and baseline endocrine sufficiency.',
          clinicalProtocol: {
            slug: 'immune-modulation-8w',
            queryParams: '?baseline=sufficient&vitd_level=42&tier=optimal&modality=maintenance&retest=6m',
            shortCode: 'REF-IMM-TA1',
            name: isEs 
              ? 'Protocolo de Mantenimiento y Regulación Inmunitaria' 
              : 'Immune Regulation & Homeostatic Maintenance Protocol',
            tierTitle: isEs ? 'TIER 3 · MANTENIMIENTO HOMEOSTÁTICO INMUNOLÓGICO' : 'TIER 3 · HOMEOSTATIC IMMUNE MAINTENANCE',
            targetGoal: isEs ? 'Consolidar en la franja alta de longevidad (50 – 70 ng/mL)' : 'Consolidate within upper longevity zone (50 – 70 ng/mL)',
            recommendedModality: isEs ? 'Mantenimiento Domiciliario Fisiológico' : 'Physiological At-Home Maintenance',
            dosageGuide: isEs ? 'Vitamina D3 3.000 – 4.000 UI/día con K2 (MK-7) 100 mcg' : 'Vitamin D3 3,000 – 4,000 IU/day with K2 (MK-7) 100 mcg',
            methylationRx: isEs ? 'Dieta rica en grasas saludables y exposición solar prudente' : 'Healthy dietary fats & sensible solar exposure',
            retestWindow: isEs ? '6 Meses (Control semestral DBS)' : '6 Months (Biannual DBS check)',
            cellularTarget: isEs ? 'Señalización VDR celular y mineralización ósea' : 'Cellular VDR signaling & bone mineral density',
            clinicalRationale: isEs
              ? 'Nivel suficiente según medicina tradicional, con margen para alcanzar la franja de mayor neuroprotección e inmunoresistencia.'
              : 'Adequate level for bone metabolism, with clinical headroom to reach enhanced anti-inflammatory and longevity levels.',
            synergies: [
              { name: 'D3/K2 Mantenimiento', role: isEs ? 'Homeostasis' : 'Homeostasis' },
              { name: 'Retest DBS', role: isEs ? 'Vigilancia Semestral' : 'Biannual Audit' }
            ],
            aiQuery: isEs
              ? '¿Cómo optimizar de rango suficiente a rango funcional de longevidad en vitamina D (50-70 ng/mL)?'
              : 'How to transition from sufficient to optimal longevity vitamin D range (50-70 ng/mL)?'
          }
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
            : 'Target functional range for enhanced antimicrobial peptide induction, immune regulation, and longevity optimization.',
          clinicalProtocol: {
            slug: 'immune-modulation-8w',
            queryParams: '?baseline=optimal&vitd_level=62&tier=optimal&modality=longevity&retest=6m',
            shortCode: 'REF-IMM-TA1',
            name: isEs 
              ? 'Protocolo de Longevidad Inmuno-Metabólica' 
              : 'Immuno-Metabolic Longevity Protocol',
            tierTitle: isEs ? 'TIER 4 · VIGILANCIA Y LONGEVIDAD GENÓMICA' : 'TIER 4 · SURVEILLANCE & GENOMIC LONGEVITY',
            targetGoal: isEs ? 'Sostener homeostasis genómica de 50 – 70 ng/mL de forma indefinida' : 'Sustain genomic equilibrium at 50 – 70 ng/mL continuously',
            recommendedModality: isEs ? 'Mantenimiento Fisiológico Continuo' : 'Continuous Physiological Maintenance',
            dosageGuide: isEs ? 'Vitamina D3 2.000 – 4.000 UI/día con K2 + pulsos semestrales de biorreguladores' : 'Vitamin D3 2,000 – 4,000 IU/day with K2 + biannual peptide pulses',
            methylationRx: isEs ? 'Magnesio diario + control de calcio sérico' : 'Daily magnesium + serum calcium monitoring',
            retestWindow: isEs ? '6 Meses (Monitorización semestral DBS)' : '6 Months (Biannual DBS Surveillance)',
            cellularTarget: isEs ? 'Transcripción de catelicidinas, inmunovigilancia antitumoral' : 'Cathelicidin transcription, antitumor immune surveillance',
            clinicalRationale: isEs
              ? 'Zona diana de longevidad celular. Máxima inducción de péptidos antimicrobianos endógenos y protección genómica frente a senescencia.'
              : 'Target longevity zone associated with optimal innate immunity and genomic stability.',
            synergies: [
              { name: 'D3/K2 Mantenimiento', role: isEs ? 'Soporte Continuo' : 'Continuous Support' },
              { name: 'Monitoreo DBS', role: isEs ? 'Control Semestral' : 'Biannual Audit' }
            ],
            aiQuery: isEs
              ? '¿Por qué la medicina de longevidad sitúa el rango ideal de vitamina D entre 50 y 70 ng/mL?'
              : 'Why does longevity medicine identify 50-70 ng/mL as the optimal 25(OH)D range?'
          }
        }
      ]
    };
  })();

  const activeRange = biomarkerData.ranges[selectedRangeIndex] || biomarkerData.ranges[0];

  // Dynamically resolve active PDF report based on test and biological sex
  const activeReportPdf = (() => {
    if (product?.gender_variants || isTestosterone) {
      if (testosteroneGender === 'female' && product?.sample_report_url_female) {
        return product.sample_report_url_female;
      }
      if (testosteroneGender !== 'female' && product?.sample_report_url_male) {
        return product.sample_report_url_male;
      }
    }
    if (product?.sample_report_url) {
      return product.sample_report_url;
    }
    if (isTeletestHTMA) return '/docs/teletest-report-htma.pdf';
    if (isTeletestOmega) return '/docs/teletest-report-omega.pdf';
    if (isTeletestMetabolizer) return '/docs/teletest-report-metabolizer.pdf';
    if (isTeletestHLA) return '/docs/teletest-report-hla-autoimmunity.pdf';
    if (isTeletestCeliac) return '/docs/teletest-report-celiac.pdf';
    if (isNad) return '/docs/bloodo-report-nad.pdf';
    if (isTestosterone) {
      return testosteroneGender === 'female' 
        ? '/docs/bloodo-report-testosterone-female.pdf' 
        : '/docs/bloodo-report-testosterone-male.pdf';
    }
    if (isCortisol) return '/docs/bloodo-report-cortisol-am-pm.pdf';
    if (isHba1c) return '/docs/bloodo-report-hba1c.pdf';
    if (isOmega) return '/docs/bloodo-report-omega-ratio.pdf';
    if (isVitD) return '/docs/bloodo-report-vitamin-d.pdf';
    return biomarkerData.officialReportPdf || '/docs/bloodo-report-nad.pdf';
  })();

  const activeReportTitle = (() => {
    if (isTeletestHTMA) return isEs ? 'TeleTest™ Informe Muestra Mineralograma Capilar (HTMA)' : 'TeleTest™ Sample Report Hair Tissue Mineral Analysis (HTMA)';
    if (isTeletestOmega) return isEs ? 'TeleTest™ Informe Muestra Perfil de Ácidos Grasos Omega' : 'TeleTest™ Sample Report Omega Fatty Acid Profile';
    if (isTeletestMetabolizer) return isEs ? 'TeleTest™ Informe Muestra Saliva Metabolizer & Detox Genético' : 'TeleTest™ Sample Report Saliva Metabolizer & Genetic Detox';
    if (isTeletestHLA) return isEs ? 'TeleTest™ Informe Muestra Estudio Genético HLA Autoinmunidad' : 'TeleTest™ Sample Report HLA Autoimmunity Genetic Study';
    if (isTeletestCeliac) return isEs ? 'TeleTest™ Informe Muestra Estudio Genético Enfermedad Celíaca' : 'TeleTest™ Sample Report Celiac Disease Genetic Study';
    if (isNad) return isEs ? 'Bloodo™ Protocolo de Validación Clínica NAD+ (CE-IVDR)' : 'Bloodo™ NAD+ Clinical Validation Protocol (CE-IVDR)';
    if (isTestosterone) {
      return isEs
        ? `Bloodo™ Informe Muestra TESTplus (${testosteroneGender === 'female' ? 'Mujer / Femenino' : 'Hombre / Masculino'})`
        : `Bloodo™ TESTplus Sample Report (${testosteroneGender === 'female' ? 'Female Profile' : 'Male Profile'})`;
    }
    if (isCortisol) return isEs ? 'Bloodo™ Informe Muestra Ritmo Circadiano Cortisol AM/PM' : 'Bloodo™ Cortisol Circadian AM/PM Sample Report';
    if (isHba1c) return isEs ? 'Bloodo™ Protocolo de Validación Clínica HbA1c (HPLC)' : 'Bloodo™ HbA1c Clinical Validation Protocol (HPLC)';
    if (isOmega) return isEs ? 'Bloodo™ Informe Muestra Perfil de Ácidos Grasos Omega-3/6' : 'Bloodo™ Omega-3/6 Fatty Acids Profile Sample Report';
    return isEs ? 'Bloodo™ Informe Muestra Vitamina D [25(OH)D LC-MS/MS]' : 'Bloodo™ Vitamin D [25(OH)D LC-MS/MS] Sample Report';
  })();

  const activeReportSub = (() => {
    if (isTeletestHTMA) return isEs ? 'Analytika Laboratorio · ICP-MS / ICP-OES · 36+ Elementos y Ratios Minerales · PDF de Demostración' : 'Analytika Central Lab · ICP-MS / ICP-OES · 36+ Elements & Mineral Ratios · Sample PDF';
    if (isTeletestOmega) return isEs ? 'Analytika Laboratorio · Cromatografía de Gases (GC-FID) · Índice Omega-3, AA:EPA, Grasas Trans · PDF de Demostración' : 'Analytika Central Lab · Gas Chromatography (GC-FID) · Omega-3 Index, AA:EPA, Trans Fats · Sample PDF';
    if (isTeletestMetabolizer) return isEs ? 'Analytika Laboratorio · Panel Farmacogenético & Detoxificación Hepática Fase I/II · PDF de Demostración' : 'Analytika Central Lab · Pharmacogenetic & Hepatic Phase I/II Detox Panel · Sample PDF';
    if (isTeletestHLA) return isEs ? 'Analytika Laboratorio · Genotipado HLA Clase I y II por PCR Multiplex · PDF de Demostración' : 'Analytika Central Lab · HLA Class I & II Genotyping by Multiplex PCR · Sample PDF';
    if (isTeletestCeliac) return isEs ? 'Analytika Laboratorio · Genotipado HLA-DQ2.5 / DQ2.2 / DQ8 · VPN >99% · PDF de Demostración' : 'Analytika Central Lab · HLA-DQ2.5 / DQ2.2 / DQ8 Genotyping · NPV >99% · Sample PDF';
    if (isNad) return isEs ? 'LifeLab1 Laboratorio Central · Ensayo XLT01690-0 · Cohorte de Validación (n = 1.068) · PDF Técnico' : 'LifeLab1 Central Laboratory Specification · Assay XLT01690-0 · Validation Cohort (n = 1,068) · Technical PDF';
    if (isTestosterone) {
      return isEs
        ? `LifeLab1 · Panel Hormonal LC-MS/MS (${testosteroneGender === 'female' ? '8 Marcadores: Testosterona Libre Vermeulen, 17-OH-P, DHEAS' : '9 Marcadores: Testosterona Total, SHBG, Cortisol/Cortisona'})`
        : `LifeLab1 · LC-MS/MS Hormone Panel (${testosteroneGender === 'female' ? '8 Markers: Vermeulen Free T, 17-OH-P, DHEAS' : '9 Markers: Total T, SHBG, Free T, Cortisol/Cortisone'})`;
    }
    if (isCortisol) return isEs ? 'LifeLab1 · Ritmo Circadiano Salival/DBS · Descenso Matutino-Vespertino y Ratio AM:PM' : 'LifeLab1 · Circadian Salivary/DBS Rhythm · Morning/Evening Curve & AM:PM Ratio';
    if (isHba1c) return isEs ? 'LifeLab1 · Cromatografía Líquida de Alta Resolución (HPLC) · Certificación NGSP / IFCC' : 'LifeLab1 · High-Performance Liquid Chromatography (HPLC) · NGSP / IFCC Certified';
    if (isOmega) return isEs ? 'LifeLab1 · Cromatografía de Gases (GC-FID) · Índice Omega-3, AA:EPA, Grasas Trans' : 'LifeLab1 · Gas Chromatography (GC-FID) · Omega-3 Index, AA:EPA, Trans Fats';
    return isEs ? 'LifeLab1 · Espectrometría de Masas en Tándem LC-MS/MS · Formas D2/D3' : 'LifeLab1 · LC-MS/MS Tandem Mass Spectrometry · D2/D3 Active Fractions';
  })();

  return (
    <div className="dts-wrapper">
      {/* ── SECTION HEADER ── */}
      <div className="pds-section-header">
        <div className="pds-section-header-left">
          <div className="pds-section-header-shield" style={{ background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488' }}>
            {isCollectionOnly ? <Droplets size={22} /> : <Activity size={22} />}
          </div>
          <div className="pds-section-header-titles">
            <div className="pds-section-header-meta-row">
              <span className="pds-section-header-category">
                {isCollectionOnly 
                  ? (isEs ? 'SECCIÓN 4 · PROTOCOLO DE MUESTREO DBS' : 'SECTION 4 · SPECIMEN SAMPLING GUIDE')
                  : (isEs ? 'SECCIÓN 3 · RANGOS Y BIOMARCADORES' : 'SECTION 3 · REFERENCE RANGES & BIOMARKERS')}
              </span>
              <span className="pds-section-badge" style={{ background: '#f0fdfa', color: '#0d9488', borderColor: '#ccfbf1' }}>
                <CheckCircle2 size={11} /> {isHairSample ? (isEs ? 'MÉTODO CERTIFICADO HTMA' : 'CERTIFIED HTMA METHOD') : isSalivaSample ? (isEs ? 'FROTIS BUCAL / ADN GENÉTICO' : 'CERTIFIED BUCCAL DNA') : (isEs ? 'MÉTODO CERTIFICADO DBS' : 'CERTIFIED DBS METHOD')}
              </span>
            </div>
            <h3 className="pds-section-header-title">
              {isCollectionOnly
                ? (isEs ? '4. ¿Cómo se Realiza? (Toma de Muestra DBS)' : '4. How It Works (Sampling Guide)')
                : (isEs ? '3. ¿Qué Dice el Resultado? (Rangos y Biomarcadores)' : '3. Reference Ranges & Biomarkers')}
            </h3>
          </div>
        </div>

        <div className="pds-section-header-right">
          <div className="pds-section-cert-badge" style={{ borderColor: '#0d9488' }}>
            <Award size={14} color="#0d9488" />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>
              {isTeletestHTMA ? 'ISO 17025 (ICP-MS)' : isTeletest ? 'ISO 15189 / ISO 17025' : 'CE-IVDR (EU 2017/746)'}
            </span>
          </div>
        </div>
      </div>

      <div className="dts-body">
        {/* ── 1. ANALYTICAL METRICS GRID & 2. SIMULATOR (Specs Mode) ── */}
        {!isCollectionOnly && (
          <>
            <div id="diagnostic-specs" className="dts-metrics-grid">
          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Método Analítico' : 'Analytical Method'}</span>
            <strong className="dts-metric-value">{biomarkerData.method}</strong>
            <span className="dts-metric-sub">{isEs ? 'Alta especificidad cuantitativa' : 'High quantitative specificity'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Tipo de Muestra' : 'Sample Format'}</span>
            <strong className="dts-metric-value">
              {isHairSample ? (isEs ? 'Cabello Proximal (HTMA)' : 'Proximal Hair (HTMA)') : isSalivaSample ? (isEs ? 'Frotis Bucal (ADN)' : 'Buccal Swab (DNA)') : 'Dried Blood Spot (DBS)'}
            </strong>
            <span className="dts-metric-sub">
              {isHairSample ? (isEs ? 'Zona occipital / nuca (100–150 mg)' : 'Occipital scalp (100–150 mg)') : isSalivaSample ? (isEs ? 'Células epiteliales bucales (60s)' : 'Buccal epithelial cells (60s)') : (isEs ? 'Punción capilar en dedo (2–3 gotas)' : 'Finger-prick capillary blood (2–3 drops)')}
            </span>
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
            <strong className="dts-metric-value">{isTeletest ? 'Analytika (EU Lab)' : 'LifeLab1 (Vilnius, EU)'}</strong>
            <span className="dts-metric-sub">{isTeletest ? (isEs ? 'Acreditación ISO 17025 / ISO 15189' : 'ISO 17025 / ISO 15189 accredited') : (isEs ? 'Alineado con norma ISO 15189' : 'ISO 15189 standard alignment')}</span>
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
          <div 
            className="dts-range-selector" 
            data-range-count={biomarkerData.ranges.length}
            style={{ '--range-count': biomarkerData.ranges.length }}
          >
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
                    {activeRange.clinicalProtocol.synergies.map((syn, synIdx) => {
                      const companionSlug = resolveCompanionSlug(syn.name);
                      if (companionSlug) {
                        return (
                          <Link
                            key={synIdx}
                            href={`/p/${companionSlug}`}
                            prefetch={true}
                            className="dts-syn-pill dts-syn-pill--link"
                            title={isEs ? `Ver ficha técnica de ${syn.name}` : `View clinical monograph for ${syn.name}`}
                          >
                            <span className="dts-syn-name">{syn.name}</span>
                            <span className="dts-syn-role">{syn.role}</span>
                            <ExternalLink size={10} className="dts-syn-link-icon" />
                          </Link>
                        );
                      }
                      return (
                        <div key={synIdx} className="dts-syn-pill">
                          <span className="dts-syn-name">{syn.name}</span>
                          <span className="dts-syn-role">{syn.role}</span>
                        </div>
                      );
                    })}
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
                <Link 
                  href={`/proto/${activeRange.clinicalProtocol.slug}${activeRange.clinicalProtocol.queryParams || ''}`}
                  prefetch={true}
                  className="dts-btn-explore-proto"
                  title={isEs ? `Ver protocolo clínico calibrado ${activeRange.clinicalProtocol.shortCode}` : `Explore calibrated clinical protocol ${activeRange.clinicalProtocol.shortCode}`}
                >
                  <span>{isEs ? 'Ver Protocolo Clínico Calibrado para este Resultado' : 'Review Calibrated Clinical Protocol for this Result'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
          </>
        )}

        {/* ── 3. STANDARDIZED DBS CAPILLARY COLLECTION PROTOCOL & PREP (Collection Mode) ── */}
        {!isSpecsOnly && (
          <>
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

          {/* ── Official Instructions for Use (IFU): How to Collect Your NAD+ Blood Sample ── */}
          <div 
            style={{
              marginTop: '1.25rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
              border: '1.5px solid #99f6e4',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '650px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>
                  {isEs ? 'DOCUMENTO CLÍNICO OFICIAL · CE-IVDR IFU' : 'OFFICIAL CLINICAL DOCUMENT · CE-IVDR IFU'}
                </span>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {isNad 
                    ? (isEs ? 'Cómo Recoger Tu Muestra de Sangre de NAD+' : 'How to Collect Your NAD+ Blood Sample')
                    : (isEs ? `Cómo Recoger Tu Muestra de Sangre (${product?.name || 'Bloodo'})` : `How to Collect Your Blood Sample (${product?.name || 'Bloodo'})`)}
                </h4>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: '1.5' }}>
                  {isEs 
                    ? 'Instrucciones oficiales para la toma de muestra de sangre capilar utilizando el kit de prueba Bloodo NAD+ (Guía de uso CE-IVDR con pasos de punción, secado y envío).' 
                    : 'Official instructions for collecting a blood sample using the Bloodo NAD+ Test Kit (CE-IVDR validated Instructions for Use with puncture, drying, and return protocol).'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={isNad ? '/docs/bloodo-nad-ifu.pdf' : '/docs/bloodo-nad-lab-protocol-dark-red.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: '#0d9488',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 5px rgba(13, 148, 136, 0.25)',
                  transition: 'background 0.15s ease'
                }}
              >
                <Download size={15} />
                <span>
                  {isEs 
                    ? 'Descargar Instrucciones de Toma de Muestra (PDF)' 
                    : 'Download Sample Collection Instructions (PDF)'}
                </span>
              </a>

              <a
                href="https://bloodo.com/wp-content/uploads/2025/08/Bloodo_NAD_IFU.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                title={isEs ? 'Enlace directo al servidor oficial de Bloodo' : 'Direct link to official Bloodo source'}
              >
                <span>bloodo.com</span>
                <ExternalLink size={12} />
              </a>
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

              {/* Bloodo Official AM/PM Ratio Callout */}
              <div style={{ marginTop: '0.85rem', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>{isEs ? 'Interpretación del Ratio Circadiano AM/PM:' : 'Circadian AM/PM Ratio Interpretation:'}</strong>{' '}
                {isEs 
                  ? 'Un ratio AM/PM superior a 2:1 refleja un ritmo circadiano saludable con descenso fisiológico vespertino. Un ratio bajo/aplanado indica estrés crónico, fatiga adrenal y alteración cardiometabólica.'
                  : 'An AM/PM ratio above 2:1 reflects a healthy cortisol rhythm with appropriate evening decline. A low or flattened ratio signals chronic stress, adrenal fatigue, and cardiometabolic dysregulation.'}
              </div>
            </div>
          )}

          {/* ── Testosterone+ Multi-Steroid & Functional Ratios Card (Bloodo Official Catalog) ── */}
          {isTestosterone && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} color="#003666" />
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs ? 'PANEL MULTI-ESTEROIDEO & RATIOS FUNCIONALES (8 BIOMARCADORES)' : 'MULTI-STEROID PANEL & FUNCTIONAL RATIOS (8 BIOMARKERS)'}
                  </strong>
                </div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#003666', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>
                  LC-MS/MS + ELISA
                </span>
              </div>

              <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                {isEs
                  ? 'A diferencia de los inmunoensayos básicos, el test Bloodo Testosterone+ cuantifica por LC-MS/MS un panel completo de 8 esteroides y calcula la testosterona libre mediante la Ecuación de Vermeulen, junto con tres ratios funcionales clave del eje adrenal y androgénico:'
                  : 'Unlike basic single-analyte immunoassays, the Bloodo Testosterone+ test quantifies a full panel of 8 steroid biomarkers via LC-MS/MS and calculates free testosterone using the Vermeulen equation, along with three key functional neuro-endocrine ratios:'}
              </p>

              {/* 3 Functional Ratios Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                    {isEs ? 'Eje de Estrés / Inactivación' : 'Stress Regulation Axis'}
                  </span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Cortisol / Cortisona
                  </strong>
                  <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
                    {isEs ? 'Equilibrio entre la forma activa e inactiva del cortisol (actividad 11β-HSD).' : 'Balance between active and inactive cortisol (11β-HSD activity).'}
                  </span>
                </div>

                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                    {isEs ? 'Eje Anabólico / Alostático' : 'Anabolic / Stress Balance'}
                  </span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Cortisol / DHEAS
                  </strong>
                  <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
                    {isEs ? 'Balance entre la respuesta catabólica de estrés y la reserva anabólica de recuperación.' : 'Balance between catabolic stress response and anabolic recovery reserve.'}
                  </span>
                </div>

                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                    {isEs ? 'Eje Androgénico' : 'Androgen Conversion Axis'}
                  </span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Testosterona / Androstenediona
                  </strong>
                  <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
                    {isEs ? 'Eficiencia en la conversión de precursores androgénicos a testosterona activa.' : 'Efficiency of precursor hormone conversion into active testosterone.'}
                  </span>
                </div>
              </div>

              {/* 8 Biomarkers list */}
              <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.70rem', color: '#1e3a8a' }}>
                <strong>{isEs ? 'Los 8 Biomarcadores Medidos:' : 'All 8 Quantified Biomarkers:'}</strong>{' '}
                Total Testosterone · SHBG · Free Testosterone (Calculated) · DHEAS · Cortisol · Cortisone · Androstenedione · 17-OH Progesterone.
              </div>
            </div>
          )}

          {/* ── Vitamin D C-3 Epimer Exclusion Card (Bloodo Official Catalog) ── */}
          {isVitD && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sun size={16} color="#d97706" />
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs ? 'DESGLOSE D3/D2 Y EXCLUSIÓN DE EPÍMEROS C-3' : 'D3/D2 RESOLUTION & C-3 EPIMER EXCLUSION'}
                  </strong>
                </div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>
                  LC-MS/MS ESPECÍFICO
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {isEs
                  ? 'A diferencia de los inmunoensayos convencionales que sobreestiman la vitamina D al confundirla con epímeros inactivos, el método LC-MS/MS de Bloodo cuantifica por separado la Vitamina D3 (colecalciferol) y Vitamina D2 (ergocalciferol), y excluye selectivamente la forma inactiva 3-epi-25(OH)D3. Esta precisión es crítica para evitar sobredosis o diagnósticos erróneos en personas suplementadas, lactantes y embarazadas.'
                  : 'Unlike standard immunoassays that overestimate Vitamin D by co-measuring inactive epimers, Bloodo LC-MS/MS selectively quantifies Vitamin D3 (cholecalciferol) and Vitamin D2 (ergocalciferol) separately and excludes the biologically inactive 3-epi-25(OH)D3 epimer. This chromatographic separation prevents diagnostic overestimation in supplemented patients, infants, and pregnant women.'}
              </p>
            </div>
          )}

          {/* ── Omega Ratio 26-Fatty Acids Profile Card (Bloodo Official Catalog) ── */}
          {isOmega && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Droplets size={16} color="#0284c7" />
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs ? 'PERFIL EXTENDIDO DE 26 ÁCIDOS GRASOS Y RATIO AA:EPA' : 'EXTENDED 26-FATTY ACID PROFILE & AA:EPA RATIO'}
                  </strong>
                </div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                  GC-FID (10 MIN SECADO)
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {isEs
                  ? 'El test Bloodo Omega Ratio analiza mediante cromatografía de gases (GC-FID) 26 ácidos grasos individuales (saturados, monoinsaturados y poliinsaturados). Cuantifica el Índice Omega-3 en membrana de glóbulos rojos, el ratio inflamatorio AA:EPA (Ácido Araquidónico a EPA), el índice de grasas trans y el ratio Omega-6/Omega-3. La tarjeta contiene un agente estabilizador de ácidos grasos y requiere solo 10 minutos de secado al aire.'
                  : 'The Bloodo Omega Ratio test analyzes 26 distinct fatty acids (SFAs, MUFAs, PUFAs) using gas chromatography (GC-FID). It quantifies the red blood cell equivalent Omega-3 Index, the cellular neuro-inflammatory AA:EPA ratio, the trans fat index, and the Omega-6/Omega-3 balance. The collection paper includes a fatty acid stabilizing agent and requires only 10 minutes of drying time.'}
              </p>
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
                    ? (isNad
                        ? 'Se recomienda realizar la extracción a primera hora de la mañana (08:00–10:00 AM) en ayunas. Para evaluar el nivel basal puro, suspender precursores (NMN, NR, B3) 14 días antes. Para monitorizar tratamiento activo, realizar la toma matutina en valle antes de la dosis del día o 48–72h tras una infusión IV.'
                        : isHba1c
                        ? 'Se recomienda realizar la extracción a primera hora de la mañana tras 8–10 horas de ayuno nocturno para máxima consistencia analítica.'
                        : 'Se recomienda realizar la extracción a primera hora de la mañana, preferiblemente antes del desayuno o de la ingesta calórica principal, garantizando uniformidad en determinaciones evolutivas.')
                    : (isNad
                        ? 'Recommended morning specimen (08:00–10:00 AM) in a fasting state. For unsupplemented baseline, pause precursors (NMN, NR, B3) for 14 days. For in-treatment monitoring, collect morning trough prior to daily dosing or 48–72h post-IV infusion.'
                        : isHba1c
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

        {/* ── 4. OFFICIAL PRODUCT PACKAGING & KIT ACCESSORIES ── */}
        <div id="kit-contents" className="dts-showcase-section">
          <div className="dts-showcase-grid">
            {/* Visual Box Packaging Card */}
            <div className="dts-showcase-image-card">
              <div className="dts-showcase-image-header">
                <span className="dts-showcase-tag">
                  <ShieldCheck size={13} color="#0d9488" /> {isEs ? 'KIT OFICIAL BLOODO™' : 'OFFICIAL BLOODO™ KIT'}
                </span>
                <span className="dts-showcase-ce">CE-IVDR · LifeLab1</span>
              </div>
              <div className="dts-showcase-img-wrap">
                <img 
                  src={kitImage} 
                  alt={product?.canonicalName || product?.name || 'Bloodo Diagnostic Kit'} 
                  className="dts-showcase-img"
                  loading="lazy"
                />
              </div>
              <div className="dts-showcase-caption">
                <strong>{product?.canonicalName || product?.name || 'Bloodo Diagnostic Test'}</strong>
                <p>
                  {isEs 
                    ? 'Empaque exterior oficial y suministros sellados estériles para toma capilar en domicilio.' 
                    : 'Authentic clinical box packaging and sterile at-home capillary collection components.'}
                </p>
              </div>
            </div>

            {/* Included Accessories & Laboratory Document Card */}
            <div className="dts-showcase-details-card">
              <div className="dts-contents-header">
                <h5 className="dts-contents-title">
                  <Layers size={16} color="#003666" />
                  {isEs ? 'Contenido del Kit de Diagnóstico' : 'Diagnostic Kit Included Accessories'}
                </h5>
                <span className="dts-contents-badge">
                  {isEs ? 'Suministros Estériles' : 'Sterile Medical Supplies'}
                </span>
              </div>

              <div className="dts-contents-grid">
                <div className="dts-content-item">
                  <Check size={14} color="#0d9488" />
                  <span>{isEs ? '1x Tarjeta de colección DBS certificada Whatman 903' : '1x Certified Whatman 903 Dried Blood Spot (DBS) card'}</span>
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
                  <span>{isEs ? '1x Bolsa bio-barrier aluminizada con sobre desecante' : '1x Foil bio-barrier pouch with silica desiccant'}</span>
                </div>
                <div className="dts-content-item">
                  <Check size={14} color="#0d9488" />
                  <span>{isEs ? '1x Sobre hermético prepagado directo a LifeLab1 Vilnius' : '1x Prepaid laboratory return mailer to LifeLab1 Vilnius'}</span>
                </div>
              </div>

              {/* Official Laboratory Validation Document (Generic Product Naming & Interactive In-Browser Preview) */}
              <div className="dts-official-pdf-box">
                <div className="dts-pdf-box-left">
                  <div className="dts-pdf-icon-wrap">
                    <FileText size={22} color="#003666" />
                  </div>
                  <div className="dts-pdf-info">
                    {/* Sex Profile Selector for Testosterone Test */}
                    {isTestosterone && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '8px', marginBottom: '6px', width: 'fit-content' }}>
                        <button
                          type="button"
                          onClick={() => setTestosteroneGender('male')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: testosteroneGender === 'male' ? '#003666' : 'transparent',
                            color: testosteroneGender === 'male' ? '#ffffff' : '#475569',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          👨 {isEs ? 'Hombre' : 'Male'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestosteroneGender('female')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: testosteroneGender === 'female' ? '#0d9488' : 'transparent',
                            color: testosteroneGender === 'female' ? '#ffffff' : '#475569',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          👩 {isEs ? 'Mujer' : 'Female'}
                        </button>
                      </div>
                    )}

                    <strong className="dts-pdf-name">
                      {activeReportTitle}
                    </strong>
                    <span className="dts-pdf-meta">
                      {activeReportSub}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="dts-pdf-preview-btn"
                  onClick={() => setIsPdfPreviewOpen(true)}
                  title={isEs ? 'Abrir vista previa del documento clínico' : 'Open clinical document preview'}
                >
                  <Eye size={15} />
                  <span>{isEs ? 'Vista Previa del Documento' : 'Preview Document'}</span>
                </button>
              </div>

              {/* In-Browser Document Preview Modal */}
              {isPdfPreviewOpen && (
                <div className="dts-pdf-modal-backdrop" onClick={() => setIsPdfPreviewOpen(false)}>
                  <div className="dts-pdf-modal-card" onClick={(e) => e.stopPropagation()}>
                    <div className="dts-pdf-modal-header">
                      <div>
                        {/* Gender switcher inside modal for Testosterone */}
                        {isTestosterone && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e2e8f0', padding: '2px', borderRadius: '6px', marginBottom: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setTestosteroneGender('male')}
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                background: testosteroneGender === 'male' ? '#003666' : 'transparent',
                                color: testosteroneGender === 'male' ? '#ffffff' : '#475569'
                              }}
                            >
                              👨 {isEs ? 'Hombre' : 'Male'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setTestosteroneGender('female')}
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                background: testosteroneGender === 'female' ? '#0d9488' : 'transparent',
                                color: testosteroneGender === 'female' ? '#ffffff' : '#475569'
                              }}
                            >
                              👩 {isEs ? 'Mujer' : 'Female'}
                            </button>
                          </div>
                        )}
                        <div className="dts-pdf-modal-title">
                          {activeReportTitle}
                        </div>
                        <div className="dts-pdf-modal-sub">
                          {activeReportSub}
                        </div>
                      </div>
                      <div className="dts-pdf-modal-actions">
                        <a 
                          href={activeReportPdf}
                          download={activeReportPdf.split('/').pop()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dts-pdf-preview-btn"
                          style={{ background: '#f1f5f9', color: '#003666', border: '1px solid #cbd5e1' }}
                        >
                          <Download size={14} />
                          <span>{isEs ? 'Descargar' : 'Download'}</span>
                        </a>
                        <button 
                          type="button" 
                          className="dts-pdf-preview-btn" 
                          onClick={() => setIsPdfPreviewOpen(false)}
                          aria-label="Close"
                          style={{ padding: '8px 12px', background: '#e2e8f0', color: '#0f172a' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="dts-pdf-modal-body">
                      <iframe 
                        src={`${activeReportPdf}#toolbar=1`}
                        className="dts-pdf-modal-frame"
                        title="Bloodo Clinical Validation Document Preview"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. ACCREDITATION & COMMERCIAL INQUIRY FOOTER ── */}
        <div id="lab-certification" className="dts-footer-banner">
          <div className="dts-footer-text">
            <strong className="dts-footer-headline">
              <Building2 size={16} color="#0d9488" />
              LifeLab1 Clinical Laboratory — Vilnius, Lithuania (Lic. NM-334 & NR-4864)
            </strong>
            <p className="dts-footer-sub">
              {isEs 
                ? 'Laboratorio clínico central acreditado según ISO 15189 y regulado bajo la normativa europea CE-IVDR (UE 2017/746). Equipamiento de alta resolución: LC-MS/MS, GC/MS, GC-FID, HPLC de intercambio iónico y ELISA. Informes cuantitativos en 48–72h mediante portal digital encriptado.'
                : 'Licensed European central laboratory (Licenses NM-334 & NR-4864) compliant with ISO 15189 & CE-IVDR (EU 2017/746). Advanced instrumentation: LC-MS/MS, GC/MS, GC-FID, Ion-Exchange HPLC, and ELISA. Turnaround time 48–72h via secure encrypted portal.'}
            </p>
          </div>

          <div className="dts-footer-badges">
            <span className="dts-accreditation-tag">ISO 15189 Certified</span>
            <span className="dts-accreditation-tag">CE-IVDR Certified</span>
            <span className="dts-accreditation-tag">Lic. NM-334 / NR-4864</span>
            <span className="dts-accreditation-tag">Room Temp Stable (15–25°C)</span>
            <a 
              href="/docs/bloodo-product-catalog-2026.pdf" 
              download="bloodo-product-catalog-2026.pdf"
              target="_blank" 
              rel="noopener noreferrer"
              className="dts-accreditation-tag"
              style={{ background: '#003666', color: '#ffffff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
            >
              <Download size={12} />
              <span>{isEs ? 'Catálogo Completo Bloodo 2026 (PDF)' : 'Official 2026 Catalog (PDF)'}</span>
            </a>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
