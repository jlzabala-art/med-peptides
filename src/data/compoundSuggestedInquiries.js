/**
 * Compound & Product Suggested Clinical Inquiries Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides 5 highly clinical, product-specific frequently asked inquiries (FAQ alternative)
 * for each compound monograph, diagnostic test, or clinical service.
 * 
 * Supports both English ('en') and Spanish ('es').
 */

export const COMPOUND_INQUIRIES_REGISTRY = {
  // ── NAD+ (Parenteral Lyophilized) ──
  nad: {
    en: [
      'What is the clinical difference between parenteral NAD+ administration vs oral NMN/NR precursors?',
      'How does intracellular NAD+ activate Sirtuins (SIRT1/SIRT3) and PARP1 for cellular longevity?',
      'How should infusion or injection flow rate be titrated to prevent chest tightness or flushing?',
      'What is the optimal storage and stability timeline once reconstituted with BAC water?',
      'What intracellular baseline level (µmol/L) indicates severe mitochondrial depletion?'
    ],
    es: [
      '¿Cuál es la diferencia clínica entre la administración parenteral de NAD+ y los precursores orales NMN/NR?',
      '¿Cómo activa el NAD+ intracelular a las Sirtuínas (SIRT1/SIRT3) y PARP1 para la longevidad celular?',
      '¿Cómo debe titularse la velocidad de infusión o inyección para prevenir opresión torácica o sofoco?',
      '¿Cuál es el protocolo óptimo de conservación y estabilidad una vez reconstituido con agua BAC?',
      '¿Qué nivel basal intracelular (µmol/L) indica depleción mitocondrial severa?'
    ]
  },

  // ── Bloodo™ Intracellular NAD+ Capillary DBS Blood Test Kit ──
  'bloodo-nad': {
    en: [
      'How does capillary DBS quantify total cellular NAD (NAD+ and NADH) vs extracellular plasma?',
      'What are the pre-test washout rules for baseline assessment vs in-treatment monitoring?',
      'Why are methyl donors (TMG / Betaine) clinically mandatory during active NAD+ restoration?',
      'What clinical protocol is indicated for severe intracellular depletion (< 20 µmol/L)?',
      'When is the ideal re-testing window (4 weeks for IV vs 8–10 weeks for SubQ microdosing)?'
    ],
    es: [
      '¿Cómo cuantifica la micromuestra capilar DBS el NAD celular total (NAD⁺ y NADH) frente al plasma?',
      '¿Cuáles son las pautas de lavado previo para medir nivel basal vs monitorizar tratamiento activo?',
      '¿Por qué es clínicamente obligatorio el aporte de donantes de metilo (TMG) junto al NAD+?',
      '¿Qué protocolo clínico está indicado ante una depleción celular severa (< 20 µmol/L)?',
      '¿Cuál es la ventana de re-evaluación óptima (4 sem. para IV vs 8–10 sem. para SubQ/oral)?'
    ]
  },

  // ── Bloodo™ Testosterone+ LC-MS/MS Capillary DBS Test ──
  'bloodo-testosterone': {
    en: [
      'Why is capillary LC-MS/MS testing superior to automated immunoassays for free testosterone?',
      'What is the mandatory 08:00–10:00 AM circadian sampling window and fasting requirement?',
      'How does heavy resistance training within 24h of sampling distort free androgen measurements?',
      'What secretagogue protocol (Kisspeptin-10, Testagen) restores HPTA axis without testicular atrophy?',
      'How should washout be structured for TRT monitoring vs native baseline endocrine recovery?'
    ],
    es: [
      '¿Por qué la técnica LC-MS/MS en sangre capilar es superior a los inmunoensayos para testosterona libre?',
      '¿Por qué es obligatoria la ventana circadiana matutina (08:00–10:00 AM) y el ayuno previo?',
      '¿Cómo distorsiona el entrenamiento de fuerza intenso en las 24h previas los niveles de andrógenos?',
      '¿Qué protocolo con secretagogos (Kisspeptina-10, Testagen) reactiva el eje HPTA sin atrofia testicular?',
      '¿Cómo debe estructurarse el lavado para monitorización de TRT vs evaluación basal endógena?'
    ]
  },

  // ── Bloodo™ Cortisol Diurnal Rhythm Test ──
  'bloodo-cortisol': {
    en: [
      'What physiological dynamics are revealed by measuring both CAR awakening and evening cortisol?',
      'Why must caffeine, nicotine, and adrenergic pre-workouts be avoided for 8h prior to testing?',
      'How does chronic allostatic hypercortisolemia accelerate intracellular NAD+ depletion?',
      'Which clinical peptides (Selank, Epithalon, DSIP) harmonize the circadian adrenal curve?',
      'How does a flat diurnal cortisol slope indicate secondary HPA axis burnout vs primary fatigue?'
    ],
    es: [
      '¿Qué información fisiológica aporta medir la respuesta al despertar (CAR) y el cortisol vespertino?',
      '¿Por qué deben evitarse el café, nicotina y pre-entrenos estimulantes al menos 8h antes de la prueba?',
      '¿Cómo acelera la hipercortisolemia alostática crónica el consumo celular de NAD⁺?',
      '¿Qué neuropéptidos biorreguladores (Selank, Epithalon, DSIP) modulan la curva suprarrenal?',
      '¿Cómo indica una curva diurna aplanada el agotamiento del eje HPA frente a la fatiga mitocondrial?'
    ]
  },

  // ── Bloodo™ HbA1c Glycation Test ──
  'bloodo-hba1c': {
    en: [
      'How does capillary DBS HbA1c provide a stable 90-day biological index of mean glycemia?',
      'What is the correlation between HbA1c reduction and visceral adiposity during incretin protocols?',
      'How should HbA1c follow-up testing be scheduled during Tirzepatide or Semaglutide titration?',
      'How does MOTS-c enhance cellular glucose uptake independent of insulin receptor signaling?',
      'What target HbA1c threshold indicates transition from active weight loss to metabolic maintenance?'
    ],
    es: [
      '¿Cómo refleja la HbA1c capilar por DBS un índice biológico estable de 90 días de glucemia media?',
      '¿Qué correlación existe entre la reducción de HbA1c y la grasa visceral en protocolos incretínicos?',
      '¿Cuándo deben programarse los tests de seguimiento durante la titulación de Tirzepatida o Semaglutida?',
      '¿Cómo estimula MOTS-c la captación celular de glucosa de forma independiente a la insulina?',
      '¿Qué umbral de HbA1c marca el paso de fase activa de pérdida de peso a mantenimiento metabólico?'
    ]
  },

  // ── Bloodo™ Omega-3/6 Ratio Test ──
  'bloodo-omega': {
    en: [
      'Why is the erythrocyte membrane Omega-3 Index (target ≥ 8%) critical for systemic microvascular health?',
      'How does an elevated AA/EPA ratio impair tissue healing during BPC-157 and TB-500 protocols?',
      'What is the role of specialized pro-resolving mediators (resolvins, protectins) in recovery?',
      'When should follow-up fatty acid profiling be conducted following high-dose EPA/DHA repletion?',
      'How do trans fatty acids in cell membranes impair cellular nutrient transport and peptide signaling?'
    ],
    es: [
      '¿Por qué el Índice Omega-3 en membrana eritrocitaria (objetivo ≥ 8%) es clave para la salud microvascular?',
      '¿Cómo compromete un ratio AA/EPA elevado la cicatrización tisular durante pautas con BPC-157 y TB-500?',
      '¿Qué papel juegan los mediadores pro-resolutivos (resolvinas, protectinas) en la recuperación?',
      '¿Cuándo debe realizarse el perfil lipídico de control tras la suplementación terapéutica con EPA/DHA?',
      '¿Cómo interfieren los ácidos grasos trans en la fluidez de membrana y la señalización de péptidos?'
    ]
  },

  // ── Bloodo™ Vitamin D3 (25-OH) Test ──
  'bloodo-vitamin-d': {
    en: [
      'Why is isotope-dilution LC-MS/MS the reference standard for quantifying 25(OH)D3 and D2?',
      'How does genomic Vitamin D Receptor (VDR) activation transactivate the cathelicidin (LL-37) promoter?',
      'Why is a 25(OH)D level ≥ 50 ng/mL mandatory for optimal Thymosin Alpha-1 immunomodulation?',
      'What is the clinical role of Vitamin K2 (MK-7) co-administration to prevent vascular calcification?',
      'How does seasonal UVB fluctuation dictate longitudinal re-testing and secretagogue dosing?'
    ],
    es: [
      '¿Por qué el método LC-MS/MS con dilución isotópica es el estándar de referencia para 25(OH)D3 y D2?',
      '¿Cómo activa el receptor VDR el promotor genómico del péptido antimicrobiano catelicidina (LL-37)?',
      '¿Por qué se requiere un nivel de 25(OH)D ≥ 50 ng/mL para la máxima eficacia de Timosina Alfa-1?',
      '¿Cuál es la función clínica de la coadministración de Vitamina K2 (MK-7) para evitar calcificación vascular?',
      '¿Cómo influye la oscilación estacional de UVB en la monitorización seriada y dosificación de péptidos?'
    ]
  },

  // ── Tirzepatide (Dual GIP / GLP-1 Co-Agonist) ──
  tirzepatide: {
    en: [
      'How does dual GIP/GLP-1 receptor co-agonism enhance insulin sensitivity and weight reduction?',
      'What is the recommended 4-week dose escalation schedule (2.5 mg to 15 mg)?',
      'What clinical strategies mitigate gastrointestinal side effects during dose escalation?',
      'How should lyophilized Tirzepatide be reconstituted and stored at 2–8°C?',
      'What are the key metabolic endpoints demonstrated in the SURPASS/SURMOUNT clinical trials?'
    ],
    es: [
      '¿Cómo potencia el co-agonismo dual GIP/GLP-1 la sensibilidad a la insulina y la pérdida ponderal?',
      '¿Cuál es la pauta de escalado de dosis recomendada cada 4 semanas (2.5 mg a 15 mg)?',
      '¿Qué estrategias clínicas mitigan los efectos secundarios gastrointestinales durante la titulación?',
      '¿Cómo debe reconstituirse y conservarse el vial liofilizado a 2–8°C?',
      '¿Cuáles son los objetivos metabólicos clave demostrados en los ensayos clínicos SURPASS/SURMOUNT?'
    ]
  },

  // ── Semaglutide (Selective GLP-1 Receptor Agonist) ──
  semaglutide: {
    en: [
      'What is the selective GLP-1 receptor pharmacokinetics and weekly half-life profile (~165h)?',
      'What is the standard dose titration protocol starting from 0.25 mg/week?',
      'How should reconstituted vials be protected from thermal and light degradation?',
      'What cardiovascular and glycemic research benefits are established in clinical literature?',
      'What concurrent lifestyle and dietary adjustments optimize therapeutic efficacy?'
    ],
    es: [
      '¿Cuál es el perfil farmacocinético y la semivida semanal (~165h) del agonista selectivo GLP-1?',
      '¿Cuál es el protocolo estándar de titulación escalonada iniciando en 0.25 mg/semana?',
      '¿Cómo deben protegerse los viales reconstituidos frente a degradación térmica y lumínica?',
      '¿Qué beneficios cardiovasculares y metabólicos avala la literatura clínica publicada?',
      '¿Qué ajustes dietéticos y de hidratación complementan el tratamiento terapéutico?'
    ]
  },

  // ── Retatrutide (Triple GIP / GLP-1 / Glucagon Tri-Agonist) ──
  retatrutide: {
    en: [
      'How does the triple GIP/GLP-1/Glucagon tri-agonist mechanism stimulate hepatic energy expenditure?',
      'What are the clinical trial endpoints observed for hepatic fat clearance and weight loss?',
      'What is the standard titration schedule to preserve cardiovascular stability?',
      'What are the storage requirements for lyophilized vs reconstituted tri-agonist vials?',
      'How does Retatrutide compare to dual co-agonists in glycemic control models?'
    ],
    es: [
      '¿Cómo estimula el gasto energético hepático el mecanismo tri-agonista GIP/GLP-1/Glucagón?',
      '¿Qué resultados clínicos se han observado en reducción de grasa hepática y peso corporal?',
      '¿Cuál es la pauta de titulación escalonada para preservar la estabilidad cardiovascular?',
      '¿Cuáles son las condiciones de conservación para el vial liofilizado frente al reconstituido?',
      '¿Cómo se compara Retatrutide frente a los co-agonistas duales en control glucémico?'
    ]
  },

  // ── BPC-157 (Gastric Pentadecapeptide) ──
  'bpc-157': {
    en: [
      'How does the gastric pentadecapeptide promote VEGF-mediated angiogenesis and tissue repair?',
      'What are the pharmacokinetic differences between subcutaneous vs oral administration?',
      'How does BPC-157 synergize with TB-500 in musculoskeletal and tendon restoration protocols?',
      'What is the recommended dilution volume with bacteriostatic water for precise micro-dosing?',
      'What is the typical clinical cycle duration before a receptor washout period?'
    ],
    es: [
      '¿Cómo promueve este pentadecapéptido gástrico la angiogénesis mediada por VEGF y la cicatrización?',
      '¿Qué diferencias farmacocinéticas existen entre la administración subcutánea y la oral?',
      '¿Cómo sinergiza BPC-157 con TB-500 en protocolos de regeneración articular y tendinosa?',
      '¿Cuál es el volumen de dilución con agua bacteriostática para una dosificación precisa?',
      '¿Cuál es la duración típica de un ciclo antes de programar un descanso de receptores?'
    ]
  },

  // ── TB-500 (Thymosin Beta-4) ──
  'tb-500': {
    en: [
      'What is the actin-sequestering mechanism that accelerates cell migration and tissue regeneration?',
      'What is the recommended loading phase versus maintenance dosing protocol?',
      'How sensitive is the peptide chain to vigorous shaking during reconstitution?',
      'In which cardiovascular and connective tissue research models has it shown highest efficacy?',
      'How does TB-500 complement BPC-157 in acute tendon-to-bone healing?'
    ],
    es: [
      '¿Cuál es el mecanismo de secuestro de actina que acelera la migración celular y reparación tisular?',
      '¿Cuál es el protocolo recomendado para la fase de carga frente a la fase de mantenimiento?',
      '¿Qué precauciones deben tomarse durante la reconstitución para no degradar la cadena peptídica?',
      '¿En qué modelos de investigación cardiovascular y músculo-esquelética muestra mayor eficacia?',
      '¿Cómo complementa TB-500 a BPC-157 en la recuperación acelerada de lesiones de tendón y ligamento?'
    ]
  },

  // ── Epithalon (Telomerase Activator & Pineal Peptide) ──
  epithalon: {
    en: [
      'How does the synthetic tetrapeptide upregulate telomerase activity in human somatic cells?',
      'What is the standard 10–20 day cyclical pulsed administration protocol per year?',
      'How does Epithalon restore pineal melatonin secretion and normalize circadian rhythms?',
      'What are the primary reconstitution and dark refrigeration requirements?',
      'What longevity biomarkers showed significant improvement in Professor Khavinson\'s trials?'
    ],
    es: [
      '¿Cómo estimula este tetrapéptido sintético la actividad de la telomerasa en células somáticas?',
      '¿Cuál es el protocolo estándar de ciclos pulsados de 10 a 20 días al año?',
      '¿Cómo restablece Epithalon la secreción pineal de melatonina y normaliza el ritmo circadiano?',
      '¿Cuáles son los requisitos de conservación en oscuridad y refrigeración a 2–8°C?',
      '¿Qué biomarcadores de longevidad mostraron mejoría en los ensayos del Prof. Khavinson?'
    ]
  },

  // ── CJC-1295 / Ipamorelin (GHRH + GHRP Synergy) ──
  'cjc-1295': {
    en: [
      'How does combining a GHRH analogue with a ghrelin receptor agonist create synergistic GH pulses?',
      'Why does Ipamorelin stimulate growth hormone without significantly elevating prolactin or cortisol?',
      'What is the optimal evening or pre-bed administration timing relative to food intake?',
      'What reconstitution volume and bacteriostatic storage parameters ensure 28-day stability?',
      'What cycle duration and rest periods are recommended to preserve pituitary receptor sensitivity?'
    ],
    es: [
      '¿Cómo crea la combinación de un análogo GHRH y un secretagogo de grelina pulsos sinérgicos de GH?',
      '¿Por qué estimula Ipamorelin la hormona de crecimiento sin elevar prolactina ni cortisol?',
      '¿Cuál es el momento óptimo de administración nocturna respecto a la ingesta de alimentos?',
      '¿Qué volumen de reconstitución y conservación bacteriostática garantizan 28 días de estabilidad?',
      '¿Qué duración de ciclo y descansos se recomiendan para preservar la sensibilidad hipofisaria?'
    ]
  },
  ipamorelin: {
    en: [
      'Why does Ipamorelin provide high GH selectivity without stimulating appetite or cortisol surges?',
      'How does Ipamorelin co-administration with CJC-1295 amplify endogenous IGF-1 secretion?',
      'What is the recommended micro-dosing protocol (100–300 mcg) prior to sleep?',
      'How stable is reconstituted Ipamorelin when stored between 2°C and 8°C?',
      'What are the recommended cycle lengths and washouts to avoid somatotropic tachyphylaxis?'
    ],
    es: [
      '¿Por qué Ipamorelin proporciona alta selectividad de GH sin estimular apetito ni picos de cortisol?',
      '¿Cómo amplifica la coadministración con CJC-1295 la secreción endógena de IGF-1?',
      '¿Cuál es el protocolo recomendado de microdosificación (100–300 mcg) antes de dormir?',
      '¿Qué estabilidad presenta Ipamorelin reconstituido conservado entre 2°C y 8°C?',
      '¿Cuáles son las duraciones de ciclo y descansos para evitar taquifilaxia somatotrópica?'
    ]
  },

  // ── GHK-Cu (Copper Tripeptide-1) ──
  'ghk-cu': {
    en: [
      'How does copper tripeptide-1 stimulate collagen I, III, and elastin synthesis?',
      'What dilution ratio prevents localized stinging or erythema during subcutaneous administration?',
      'What are the differences in systemic vs topical dermatological remodeling protocols?',
      'How does GHK-Cu modulate TGF-beta and suppress pro-inflammatory cytokines?',
      'What are the storage requirements to prevent copper dissociation?'
    ],
    es: [
      '¿Cómo estimula el tripéptido de cobre-1 la síntesis de colágeno I, III y elastina?',
      '¿Qué ratio de dilución previene molestias o eritema local en la administración subcutánea?',
      '¿Qué diferencias existen entre protocolos de remodelación sistémica y aplicaciones tópicas?',
      '¿Cómo modula GHK-Cu el factor TGF-beta para atenuar citoquinas proinflamatorias?',
      '¿Cuáles son las condiciones de almacenamiento para evitar la disociación del ion cobre?'
    ]
  },

  // ── MOTS-c (Mitochondrial-Derived Peptide) ──
  'mots-c': {
    en: [
      'How does this mitochondrial-derived peptide activate the AMPK pathway to regulate metabolism?',
      'What is the timing protocol for administration relative to physical exercise or morning fast?',
      'What is the reconstitution protocol and cold chain sensitivity of MOTS-c?',
      'How does MOTS-c counteract diet-induced insulin resistance and muscle aging?',
      'What is the recommended multi-week cycle duration in longevity research?'
    ],
    es: [
      '¿Cómo activa este péptido de origen mitocondrial la vía AMPK para regular el metabolismo?',
      '¿Cuál es el momento idóneo de administración respecto al ejercicio físico o ayuno matutino?',
      '¿Cuál es el protocolo de reconstitución y qué sensibilidad térmica presenta MOTS-c?',
      '¿Cómo contrarresta MOTS-c la resistencia a la insulina y el envejecimiento muscular?',
      '¿Cuál es la duración recomendada de un ciclo en investigación metabólica y de longevidad?'
    ]
  },

  // ── SS-31 / Elamipretide (Mitochondrial Cardiolipin Stabilizer) ──
  'ss-31': {
    en: [
      'How does SS-31 selectively target and stabilize cardiolipin in the inner mitochondrial membrane?',
      'How does it reduce pathological reactive oxygen species (ROS) without blocking physiological signaling?',
      'What research models support its use in cardiac ischemia and age-related mitochondrial dysfunction?',
      'What are the dilution and reconstitution guidelines with sterile bacteriostatic water?',
      'What dosing frequency and monitoring protocols are standard in clinical investigations?'
    ],
    es: [
      '¿Cómo estabiliza SS-31 la cardiolipina en la membrana mitocondrial interna?',
      '¿Cómo reduce los radicales libres patológicos (ROS) preservando la señalización celular normal?',
      '¿Qué evidencia apoya su investigación en isquemia miocárdica y disfunción mitocondrial?',
      '¿Cuáles son las pautas de dilución y reconstitución con agua bacteriostática estéril?',
      '¿Qué frecuencia de dosificación y biomarcadores de control se emplean en clínica?'
    ]
  },

  // ── Semax (Neuroprotective ACTH 4-10 Analogue) ──
  semax: {
    en: [
      'How does Semax stimulate BDNF and NGF expression in the central nervous system?',
      'What is the bioavailability difference between intranasal spray vs subcutaneous micro-dosing?',
      'What are the established cognitive restoration and neurovascular research applications?',
      'What is the recommended cycling duration to prevent neuro-receptor tolerance?',
      'How should lyophilized and dissolved Semax be stored to maintain peptide stability?'
    ],
    es: [
      '¿Cómo estimula Semax la expresión de BDNF y NGF en el sistema nervioso central?',
      '¿Qué diferencia de biodisponibilidad existe entre la vía intranasal y la subcutánea?',
      '¿Cuáles son las aplicaciones contrastadas en restauración cognitiva y neuroprotección?',
      '¿Cuál es la duración recomendada del ciclo para evitar tolerancia en receptores?',
      '¿Cómo debe almacenarse Semax disuelto para preservar la estabilidad de la cadena?'
    ]
  },

  // ── Selank (Tuftsin Anxiolytic Analogue) ──
  selank: {
    en: [
      'How does Selank modulate GABAergic neurotransmission without sedative or hypnotic side effects?',
      'What is the standard intranasal administration protocol and onset of action?',
      'How does Selank interact with serotonin and dopamine metabolic pathways during chronic stress?',
      'What are the thermal stability guidelines and cold-chain requirements?',
      'How does Selank compare to traditional benzodiazepines in cognitive safety profiles?'
    ],
    es: [
      '¿Cómo modula Selank la neurotransmisión gabaérgica sin efectos sedantes ni dependencia?',
      '¿Cuál es el protocolo de administración intranasal y la rapidez de acción observada?',
      '¿Cómo interactúa Selank con las vías de serotonina y dopamina en situaciones de estrés?',
      '¿Cuáles son las pautas de conservación térmica y estabilidad del vial?',
      '¿Cómo se compara la seguridad de Selank frente a los ansiolíticos farmacológicos habituales?'
    ]
  },

  // ── AOD-9604 (Lipolytic C-Terminal hGH Fragment) ──
  'aod-9604': {
    en: [
      'How does AOD-9604 stimulate lipolysis without altering insulin sensitivity or blood glucose?',
      'Why does this fragment not interact with the systemic hGH growth receptor or raise IGF-1?',
      'What is the optimal morning fasting administration timing for localized/systemic fat reduction?',
      'What reconstitution solvent and dilution ratio are recommended for maximum stability?',
      'What are the findings from published randomized human clinical trials regarding safety?'
    ],
    es: [
      '¿Cómo estimula AOD-9604 la lipólisis sin alterar la sensibilidad a la insulina ni la glucosa?',
      '¿Por qué este fragmento no interactúa con el receptor de crecimiento de hGH ni eleva IGF-1?',
      '¿Cuál es el momento idóneo de administración en ayunas para optimizar la pérdida de grasa?',
      '¿Qué solvente de reconstitución y ratio de dilución garantizan máxima estabilidad?',
      '¿Qué conclusiones arrojan los ensayos clínicos en humanos sobre su perfil de seguridad?'
    ]
  },

  // ── Bacteriostatic Water / Reconstitution Solvent ──
  'bac-water': {
    en: [
      'What is the function of 0.9% benzyl alcohol in preventing microbial growth in multi-dose vials?',
      'How long remains the sterile integrity of the vial after the initial rubber stopper puncture (28 days)?',
      'What is the recommended storage temperature (15–25°C ambient unopened vs 2–8°C refrigerated)?',
      'How should BAC water be gently injected down the vial wall to prevent peptide shear damage?',
      'When should bacteriostatic water NOT be used (e.g. neonates, epidural administration)?'
    ],
    es: [
      '¿Cuál es la función del 0.9% de alcohol bencílico para prevenir proliferación bacteriana en multidosis?',
      '¿Cuánto tiempo se mantiene estéril el vial tras la primera punción del tapón (28 días)?',
      '¿Cuál es la temperatura de almacenamiento recomendada (15–25°C cerrado vs 2–8°C refrigerado)?',
      '¿Cómo debe introducirse el solvente deslizándolo por la pared del vial para no dañar el péptido?',
      '¿En qué casos está contraindicado el uso de agua bacteriostática (ej. neonatos, vía intratecal)?'
    ]
  },

  // ── Spanish Corporate Acquisition & Law 14/2013 Residency ──
  'spain-residency': {
    en: [
      'What are the legal requirements under Law 14/2013 for obtaining the 3-year investor residence permit?',
      'How does the 20-business-day fast-track statutory decision window with UGE-CE work?',
      'Why is 100% ownership of an existing debt-free Spanish S.L. eligible without minimum employee quotas?',
      'Is there an obligation to reside 183 days in Spain to maintain and renew the residence permit?',
      'Can the entire acquisition and residency filing be executed remotely via Consular Power of Attorney?'
    ],
    es: [
      '¿Cuáles son los requisitos legales de la Ley 14/2013 para obtener el permiso de residencia de 3 años?',
      '¿Cómo funciona el plazo legal resolutorio de 20 días hábiles ante la UGE-CE?',
      '¿Por qué la titularidad del 100% de una S.L. sin deudas califica sin cuotas mínimas de empleados?',
      '¿Existe la obligación de residir 183 días en España para mantener y renovar la residencia?',
      '¿Se puede formalizar la compraventa y tramitación completa a distancia mediante poder consular?'
    ]
  },

  // ── European Pharmaceutical Compounding Service ──
  'compounding-service': {
    en: [
      'What EU GMP and European Pharmacopoeia (Ph. Eur.) standards govern custom compounding?',
      'What custom dosage forms and sterile peptide concentrations can be compounded for clinics?',
      'What is the standard 5-to-7 day cold-chain delivery turnaround across the UAE and GCC?',
      'How does the dual billing system work (Clinic Wholesale Invoice vs Direct Patient RRP)?',
      'What temperature-controlled packaging is used to guarantee cold-chain compliance during air freight?'
    ],
    es: [
      '¿Qué estándares EU GMP y Farmacopea Europea (Ph. Eur.) rigen la formulación magistral?',
      '¿Qué formas farmacéuticas y concentraciones personalizadas pueden formularse para clínicas?',
      '¿Cuál es el plazo habitual de entrega bajo cadena de frío (5 a 7 días hábiles) en UAE y GCC?',
      '¿Cómo funciona la facturación flexible (Tarifa B2B Clínica vs Factura RRP Directa al Paciente)?',
      '¿Qué embalaje isotérmico certificado garantiza la cadena de frío durante el transporte aéreo?'
    ]
  },

  // ── B2B Peptide Supply Management & Inventory ──
  'peptide-supply-service': {
    en: [
      'How does pre-certified in-stock HPLC ≥99% inventory eliminate manufacturing lead times?',
      'What is the lot-locking guarantee for continuous patient treatment cycles?',
      'What are the wholesale pricing tiers and minimum order quantities for medical clinics?',
      'How does the direct clinic delivery vs patient home cold-dropship option operate?',
      'What comprehensive analytical documentation (RP-HPLC, LC-MS) accompanies each batch?'
    ],
    es: [
      '¿Cómo elimina el stock precertificado con HPLC ≥99% los tiempos de espera de fabricación?',
      '¿En qué consiste la garantía de reserva de lote (lot-locking) para ciclos continuados de pacientes?',
      '¿Cuáles son las tarifas mayoristas y cantidades mínimas de pedido para centros médicos?',
      '¿Cómo se articula la entrega directa a clínica frente al dropshipping refrigerado al paciente?',
      '¿Qué documentación analítica (RP-HPLC, LC-MS) se entrega con cada partida suministrada?'
    ]
  }
};

/**
 * Normalizes any product or slug name to match registry keys
 */
function resolveRegistryKey(slug, name = '', category = '') {
  const s = String(slug || '').toLowerCase();
  const n = String(name || '').toLowerCase();
  const c = String(category || '').toLowerCase();

  if (s.includes('spain-company') || s.includes('spain-residency') || n.includes('spanish corporate')) return 'spain-residency';
  if (s.includes('compounding') || n.includes('compounding')) return 'compounding-service';
  if (s.includes('testosterone') || s.includes('testosterona') || n.includes('testosterone') || n.includes('testosterona')) return 'bloodo-testosterone';
  if (s.includes('cortisol') || n.includes('cortisol')) return 'bloodo-cortisol';
  if (s.includes('hba1c') || s.includes('hemoglobin') || s.includes('hemoglobina') || n.includes('hba1c')) return 'bloodo-hba1c';
  if (s.includes('omega') || n.includes('omega')) return 'bloodo-omega';
  if (s.includes('vitamin-d') || s.includes('vitamina-d') || n.includes('vitamin d') || n.includes('vitamina d')) return 'bloodo-vitamin-d';
  if (s.includes('bloodo') || s.includes('dbs') || s.includes('capillary') || n.includes('blood test') || n.includes('test kit')) return 'bloodo-nad';
  if (s.includes('bac-water') || s.includes('bacteriostatic') || n.includes('bacteriostatic')) return 'bac-water';
  if (s.includes('tirzepatide') || n.includes('tirzepatide')) return 'tirzepatide';
  if (s.includes('semaglutide') || n.includes('semaglutide')) return 'semaglutide';
  if (s.includes('retatrutide') || n.includes('retatrutide')) return 'retatrutide';
  if (s.includes('bpc-157') || s.includes('bpc157') || n.includes('bpc')) return 'bpc-157';
  if (s.includes('tb-500') || s.includes('tb500') || s.includes('thymosin') || n.includes('tb-500')) return 'tb-500';
  if (s.includes('epithalon') || s.includes('epitalon') || n.includes('epithalon')) return 'epithalon';
  if (s.includes('cjc') || n.includes('cjc')) return 'cjc-1295';
  if (s.includes('ipamorelin') || n.includes('ipamorelin')) return 'ipamorelin';
  if (s.includes('ghk') || n.includes('ghk')) return 'ghk-cu';
  if (s.includes('mots') || n.includes('mots')) return 'mots-c';
  if (s.includes('ss-31') || s.includes('elamipretide') || n.includes('ss-31')) return 'ss-31';
  if (s.includes('semax') || n.includes('semax')) return 'semax';
  if (s.includes('selank') || n.includes('selank')) return 'selank';
  if (s.includes('aod') || n.includes('aod')) return 'aod-9604';
  if (s === 'nad' || s === 'nad-plus' || s.includes('nad+') || n.includes('nad+') || n === 'nad') return 'nad';

  return null;
}

/**
 * Generates 5 high-relevance clinical questions dynamically if the compound
 * is not in the curated registry.
 */
function generateDynamicCompoundInquiries(contextAnchor, lang = 'en') {
  const isEs = lang === 'es';
  const name = contextAnchor?.name || (isEs ? 'este compuesto' : 'this compound');
  const targetAxis = contextAnchor?.targetSystem || contextAnchor?.details?.targetReceptorAxis || (isEs ? 'sus receptores biológicos' : 'its physiological target receptors');

  if (isEs) {
    return [
      `¿Cuál es el mecanismo de acción y afinidad sobre ${targetAxis} de ${name}?`,
      `¿Cuál es el volumen óptimo de dilución y técnica de reconstitución para ${name}?`,
      `¿Cuáles son las pautas de estabilidad térmica y cadena de frío (liofilizado vs reconstituido)?`,
      `¿Qué evidencia avalan las publicaciones clínicas indexadas sobre ${name}?`,
      `¿Cuáles son los estándares analíticos de pureza (RP-HPLC y espectrometría de masas) certificados?`
    ];
  }

  return [
    `What is the primary pharmacological mechanism and receptor affinity of ${name}?`,
    `What is the recommended reconstitution volume and diluent technique for ${name}?`,
    `What are the thermal stability guidelines and cold-chain parameters (lyophilized vs reconstituted)?`,
    `What does peer-reviewed clinical research and published literature report for ${name}?`,
    `What analytical purity standards (RP-HPLC and Mass Spectrometry) verify this monograph?`
  ];
}

/**
 * Main Resolver
 * Returns exactly 5 clinical questions tailored to the given product or context.
 */
export function getSuggestedInquiriesForProduct(contextAnchor, contextType = 'monograph', lang = 'en') {
  const isEs = lang === 'es';

  // 1. If contextType is 'protocol'
  if (contextType === 'protocol') {
    if (isEs) {
      return [
        '¿Cómo se estructura el calendario de titulación y escalado de dosis entre fases?',
        '¿Qué formulaciones activas incluye este protocolo y cuál es su sinergia clínica?',
        '¿Cuáles son los biomarcadores basales y de seguridad requeridos para la monitorización?',
        '¿Existen calculadoras interactivas de reconstitución o monografías asociadas?',
        '¿Cuál es la pauta semanal y hora óptima de administración de las dosis?'
      ];
    }
    return [
      'Explain the phase titration and dose escalation schedule for this protocol',
      'Which active formulations are included and how do they synergize clinically?',
      'What are the baseline laboratory monitoring and safety surveillance biomarkers?',
      'Are there companion peptide monographs and reconstitution calculators available?',
      'What is the optimal weekly administration cadence and timing for each compound?'
    ];
  }

  // 2. Check if contextAnchor contains clinical FAQ items (e.g. from Firestore or Bloodo)
  if (Array.isArray(contextAnchor?.faq) && contextAnchor.faq.length >= 3) {
    const questions = contextAnchor.faq.slice(0, 5).map(item => {
      if (typeof item === 'string') return item;
      if (isEs && item.questionEs) return item.questionEs;
      return item.questionEn || item.question || item.title || '';
    }).filter(Boolean);

    if (questions.length === 5) {
      return questions;
    }
  }

  // 3. Match against curated registry by slug or product name
  const registryKey = resolveRegistryKey(contextAnchor?.slug, contextAnchor?.name, contextAnchor?.category);
  if (registryKey && COMPOUND_INQUIRIES_REGISTRY[registryKey]) {
    const pack = COMPOUND_INQUIRIES_REGISTRY[registryKey];
    return isEs ? pack.es : pack.en;
  }

  // 4. Fallback: Generate 5 tailored clinical questions based on product properties
  return generateDynamicCompoundInquiries(contextAnchor, lang);
}

/**
 * Contextual and Popular Inquiry Suggester (Rule: At least 50% on-topic with previous answer)
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamically resolves 4 suggestion chips:
 * - 2 chips (50%) directly relevant to the specific topic/sub-theme of the previous turn.
 * - 2 chips (50%) from the most popular/habitual inquiries for the active product/monograph.
 */
export function getContextualAndPopularSuggestions({
  messages = [],
  contextAnchor = null,
  contextType = 'monograph',
  lang = 'en',
  activeBotText = ''
}) {
  const isEs = lang === 'es';

  // 1. Gather historical queries to avoid repeating questions the user already asked
  const userQueries = messages
    .filter(m => m.sender === 'user')
    .map(m => (m.text || '').toLowerCase());

  // 2. Identify the active sub-topic from the latest user question + bot response
  const lastUserMsg = messages.filter(m => m.sender === 'user').slice(-1)[0]?.text || '';
  const turnContext = (lastUserMsg + ' ' + (activeBotText || '')).toLowerCase();

  const isAsked = (text) => {
    const tLower = text.toLowerCase();
    return userQueries.some(u => u.includes(tLower) || tLower.includes(u));
  };

  // 3. Define Contextual Topic Clusters
  let contextualCandidates = [];

  if (contextType === 'diagnostic_test') {
    if (turnContext.includes('range') || turnContext.includes('reference') || turnContext.includes('umol') || turnContext.includes('deplet') || turnContext.includes('optimal') || turnContext.includes('level') || turnContext.includes('50') || turnContext.includes('20') || turnContext.includes('30')) {
      contextualCandidates = [
        {
          label: isEs ? 'Pauta para <20 µmol/L' : 'Titration for <20 µmol/L',
          query: isEs ? '¿Cómo se titula el Protocolo de Restauración NAD+ para niveles de depleción severa (<20 µmol/L)?' : 'How is the NAD+ Cellular Restoration Protocol titrated for severe depletion (<20 µmol/L)?'
        },
        {
          label: isEs ? 'Re-Test en Tratamiento' : 'On-Treatment Re-Test',
          query: isEs ? '¿Cuándo debe realizarse el análisis capilar DBS de control durante el tratamiento activo?' : 'When should a follow-up capillary DBS test be scheduled after initiating NAD+ therapy?'
        },
        {
          label: isEs ? 'Enzimas CD38 y PARP1' : 'CD38 & PARP1 Sinks',
          query: isEs ? '¿Qué mecanismos enzimáticos (CD38, PARP1) consumen el NAD+ intracelular con la edad?' : 'What enzymatic mechanisms (CD38, PARP1) drive intracellular NAD+ decline in aging?'
        },
        {
          label: isEs ? 'Pico >50 µmol/L' : 'Peak >50 µmol/L Level',
          query: isEs ? '¿Qué indica un nivel de NAD+ >50 µmol/L tras infusión IV o carga intensiva?' : 'What does an intracellular NAD+ level >50 µmol/L indicate after IV infusion or loading?'
        }
      ];
    } else if (turnContext.includes('collect') || turnContext.includes('whatman') || turnContext.includes('finger') || turnContext.includes('fasting') || turnContext.includes('spot') || turnContext.includes('dry') || turnContext.includes('drop')) {
      contextualCandidates = [
        {
          label: isEs ? 'Secado de 3 Horas' : 'Air-Drying Time (3h)',
          query: isEs ? '¿Por qué debe secarse la tarjeta Whatman 903 al aire durante 3 horas antes de guardarla?' : 'Why must the Whatman 903 card dry for 3 hours before sealing in the foil pouch?'
        },
        {
          label: isEs ? '¿Ayuno Matutino?' : 'Fasting Requirement',
          query: isEs ? '¿Debe realizarse la toma de muestra capilar en ayunas matutinas?' : 'Should capillary blood collection be performed in a morning fasting state?'
        },
        {
          label: isEs ? 'Pausa de Suplementos' : 'Therapy Washout Rules',
          query: isEs ? '¿Debe suspenderse la suplementación oral con NMN/NR antes de la prueba para medir el nivel basal puro?' : 'Should oral NMN/NR precursors or IV infusions be stopped before specimen collection?'
        }
      ];
    } else {
      contextualCandidates = [
        {
          label: isEs ? 'Estabilidad 14 Días' : '14-Day Ambient Transit',
          query: isEs ? '¿Cómo garantiza la bolsa desecante la estabilidad de la gota de sangre seca durante 14 días a temperatura ambiente?' : 'How does the desiccant pouch protect dried blood spots during 14 days of postal transit?'
        },
        {
          label: isEs ? 'Precisión LifeLab1' : 'LifeLab1 Assay (CV ≤6.6%)',
          query: isEs ? '¿Cuál es la precisión analítica y límite de detección del ensayo enzimático de LifeLab1?' : 'What is the analytical precision and detection limit of the LifeLab1 cyclic assay?'
        },
        {
          label: isEs ? 'Concordancia Venosa' : 'Venous Correlation',
          query: isEs ? '¿Qué concordancia clínica existe entre la micromuestra capilar DBS y la sangre venosa tradicional?' : 'What clinical correlation exists between capillary dried blood spots and traditional venous blood?'
        }
      ];
    }
  } else if (contextType === 'protocol') {
    if (turnContext.includes('titrat') || turnContext.includes('phase') || turnContext.includes('schedule') || turnContext.includes('dose') || turnContext.includes('step')) {
      contextualCandidates = [
        {
          label: isEs ? 'Criterios de Escalado' : 'Step-Up Criteria',
          query: isEs ? '¿Qué criterios clínicos indican el momento idóneo para pasar a la siguiente fase de titulación?' : 'What clinical criteria indicate readiness to transition from initial phase to titration step-up?'
        },
        {
          label: isEs ? 'Ajuste por Síntomas' : 'Dose Adjustment',
          query: isEs ? '¿Cómo debe modularse la pauta si se presentan síntomas de tolerancia durante la titulación?' : 'How should dosages be adjusted if transient symptoms occur during dose titration?'
        },
        {
          label: isEs ? 'Cadencia Semanal' : 'Weekly Administration Cadence',
          query: isEs ? '¿Cuál es la cadencia semanal recomendada (días seguidos vs descansos) en cada fase?' : 'What is the recommended administration cadence (daily vs 5-on/2-off) across phases?'
        }
      ];
    } else {
      contextualCandidates = [
        {
          label: isEs ? 'Analíticas Intermedias' : 'Mid-Cycle Labs',
          query: isEs ? '¿Qué biomarcadores analíticos deben verificarse a mitad de ciclo (semanas 4 a 6)?' : 'Which specific laboratory biomarkers should be verified at mid-cycle (week 4–6)?'
        },
        {
          label: isEs ? 'Contraindicaciones' : 'Strict Precautions',
          query: isEs ? '¿Qué antecedentes médicos o fármacos concurrentes requieren precaución en el protocolo?' : 'What pre-existing conditions or concurrent medications require protocol deferral?'
        },
        {
          label: isEs ? 'Delta de Biomarcadores' : 'Biomarker Delta Target',
          query: isEs ? '¿Qué variación en los biomarcadores finales confirma la eficacia de este protocolo?' : 'What objective biomarker delta confirms successful protocol completion?'
        }
      ];
    }
  } else {
    // Monograph sub-topics
    if (turnContext.includes('bac') || turnContext.includes('water') || turnContext.includes('dilut') || turnContext.includes('reconstitut') || turnContext.includes('syringe')) {
      contextualCandidates = [
        {
          label: isEs ? 'Evitar Cizallamiento' : 'Prevent Shearing',
          query: isEs ? '¿Cómo debe deslizarse el solvente por la pared del vial para no romper las cadenas del péptido?' : 'How should bacteriostatic water be injected against the glass wall to avoid shear stress?'
        },
        {
          label: isEs ? 'Estabilidad 28 Días' : '28-Day Stability',
          query: isEs ? '¿Cuál es la curva de degradación química y vida útil una vez disuelto en agua BAC (2–8°C)?' : 'What is the chemical stability and degradation curve once reconstituted in BAC water at 2–8°C?'
        },
        {
          label: isEs ? 'Unidades en Jeringa U-100' : 'U-100 Syringe Math',
          query: isEs ? '¿Cómo se convierten los microgramos prescritos a unidades en una jeringa de insulina U-100?' : 'How do prescribed microgram (mcg) dosages convert to units on a U-100 sterile syringe?'
        }
      ];
    } else if (turnContext.includes('storage') || turnContext.includes('refrigerat') || turnContext.includes('temp') || turnContext.includes('thermal') || turnContext.includes('freeze')) {
      contextualCandidates = [
        {
          label: isEs ? 'Liofilizado vs Disuelto' : 'Lyophilized vs Reconstituted',
          query: isEs ? '¿Qué diferencias de conservación existen entre el polvo liofilizado a -20°C y la solución a 2–8°C?' : 'What are the shelf-life differences between -20°C lyophilized powder and 2–8°C aqueous solution?'
        },
        {
          label: isEs ? 'Protección de Luz UV' : 'Light Protection',
          query: isEs ? '¿Por qué deben conservarse las soluciones peptídicas al resguardo de la luz ultravioleta y ambiental?' : 'Why must peptide solutions be shielded from direct UV and environmental light exposure?'
        },
        {
          label: isEs ? 'Excursión Térmica' : 'Thermal Excursion Impact',
          query: isEs ? '¿Qué impacto tiene en la estabilidad si el vial sufre una interrupción transitoria de cadena de frío?' : 'What happens if the reconstituted vial experiences room temperature exposure during travel?'
        }
      ];
    } else if (turnContext.includes('mechanism') || turnContext.includes('receptor') || turnContext.includes('affinity') || turnContext.includes('pathway') || turnContext.includes('cascade')) {
      contextualCandidates = [
        {
          label: isEs ? 'Cascada Intracelular' : 'Downstream Cascades',
          query: isEs ? '¿Qué rutas metabólicas y enzimáticas intracelulares específicas desencadena este compuesto?' : 'What specific intracellular signaling pathways and enzymatic cascades are activated?'
        },
        {
          label: isEs ? 'Afinidad de Receptores' : 'Receptor Affinity',
          query: isEs ? '¿Cuál es la potencia de afinidad nanomolar y selectividad frente a ligandos naturales?' : 'What is the binding affinity and receptor selectivity compared to natural endogenous ligands?'
        },
        {
          label: isEs ? 'Sinergia Terapéutica' : 'Companion Synergy',
          query: isEs ? '¿Con qué otros compuestos o péptidos sinergiza eficazmente en protocolos clínicos?' : 'Which companion compounds offer complementary physiological synergy with this peptide?'
        }
      ];
    } else {
      contextualCandidates = [
        {
          label: isEs ? 'Endpoints en Ensayos' : 'Human Trial Endpoints',
          query: isEs ? '¿Cuáles fueron los principales objetivos y resultados en los ensayos clínicos en humanos publicados?' : 'What primary clinical endpoints were demonstrated in published peer-reviewed human trials?'
        },
        {
          label: isEs ? 'Mitigación de Efectos' : 'Side-Effect Mitigation',
          query: isEs ? '¿Qué estrategias de manejo clínico se describen para minimizar efectos secundarios en ensayos?' : 'What clinical management strategies are reported to minimize adverse events in trials?'
        },
        {
          label: isEs ? 'Semivida y Farmacocinética' : 'PK & Half-Life Kinetics',
          query: isEs ? '¿Qué datos farmacocinéticos y semivida de eliminación plasmática respaldan las pautas de dosificación?' : 'What pharmacokinetic data and elimination half-life establish the clinical dosing schedule?'
        }
      ];
    }
  }

  // Pick 2 contextual unasked candidates
  const unaskedContextual = contextualCandidates.filter(c => !isAsked(c.label) && !isAsked(c.query));
  const selectedContextual = unaskedContextual.slice(0, 2);

  // 4. Retrieve Popular Inquiries for this product
  const popularPool = getSuggestedInquiriesForProduct(contextAnchor, contextType, lang);
  const unaskedPopular = popularPool
    .filter(p => !isAsked(p))
    .map(p => {
      // Shorten label for clean chip display
      let shortLabel = p.replace(/^(What is the|How to|How does|What does|Explain the|Which|Should|Are there|¿Cuál es|¿Cómo|¿Qué|¿Existen)\s+/i, '');
      shortLabel = shortLabel.replace(/\?$/, '');
      if (shortLabel.length > 28) {
        shortLabel = shortLabel.substring(0, 26).trim() + '...';
      }
      return {
        label: shortLabel,
        query: p
      };
    });

  const selectedPopular = unaskedPopular.slice(0, 2);

  // 5. Combine: Exactly 50% contextual (2 items) and 50% popular (2 items)
  const combined = [...selectedContextual, ...selectedPopular];

  // Fallback if less than 4: fill from remaining candidates
  if (combined.length < 4) {
    const remaining = [...contextualCandidates, ...unaskedPopular].filter(
      item => !combined.some(c => c.label === item.label)
    );
    while (combined.length < 4 && remaining.length > 0) {
      combined.push(remaining.shift());
    }
  }

  return combined.slice(0, 4);
}

