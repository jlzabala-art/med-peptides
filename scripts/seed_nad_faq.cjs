const { adminDb } = require('../src/lib/firebaseAdmin');

const NAD_CLINICAL_FAQS = [
  {
    id: 'faq-nad-01',
    category: 'clinical',
    tag: 'Overview & Target',
    questionEn: 'What does the NAD test measure?',
    questionEs: '¿Qué mide exactamente la prueba de NAD?',
    answerEn: 'The test measures total cellular NAD (NAD⁺ and NADH) status in blood via capillary dried blood spot (DBS), providing an objective indication of the patient’s current intracellular NAD availability and mitochondrial redox capacity.',
    answerEs: 'La prueba cuantifica el estado celular total de NAD (NAD⁺ y NADH) en sangre mediante mancha de sangre seca capilar (DBS), proporcionando un indicador objetivo de la disponibilidad intracelular de NAD y la capacidad redox mitocondrial.'
  },
  {
    id: 'faq-nad-02',
    category: 'protocol_monitoring',
    tag: 'Clinical Intent & Strategy',
    questionEn: 'Testing Intent: Baseline Level vs. Active Protocol Therapeutic Monitoring',
    questionEs: 'Objetivo de la prueba: Nivel basal vs. Monitorización terapéutica de protocolo activo',
    answerEn: 'Before scheduling the test, clarify the primary clinical objective with the physician:\n• Baseline Assessment: Evaluates unsupplemented native NAD status prior to therapy (requires temporary washout of precursors).\n• Protocol Therapeutic Monitoring: Evaluates cellular response and precursor bioavailability while on an active regimen to assess efficacy and adjust dosage (does NOT require stopping treatment or a long washout).',
    answerEs: 'Antes de realizar la prueba, defina con el médico el objetivo clínico prioritario:\n• Evaluación Basal: Determina el nivel endógeno sin suplementación previo al inicio de una terapia (requiere suspensión previa de precursores).\n• Monitorización de Protocolo Activo: Evalúa la respuesta biológica y biodisponibilidad durante el tratamiento para calibrar dosis y pautas (NO requiere suspender el tratamiento ni períodos de lavado prolongados).'
  },
  {
    id: 'faq-nad-03',
    category: 'protocol_monitoring',
    tag: 'Active Protocol (Recommended)',
    questionEn: 'I am already on an active NAD protocol (oral or IV). Should I stop my treatment?',
    questionEs: 'Ya estoy en un protocolo activo de NAD (oral o intravenoso). ¿Debo suspender el tratamiento?',
    answerEn: 'No. If the objective is to assess therapeutic response to your current protocol and obtain an in-treatment snapshot to guide dosage adjustment, you should NOT stop oral NAD/precursors or introduce a 2–3 week washout period. Stopping would eliminate the active metabolic state the clinician intends to evaluate.',
    answerEs: 'No. Si el objetivo es valorar la respuesta terapéutica al protocolo actual y obtener una medición en tratamiento para ajustar la pauta, NO debe suspender el NAD oral ni introducir un lavado de 2–3 semanas. Suspender el tratamiento eliminaría el estado metabólico activo que el médico busca evaluar.'
  },
  {
    id: 'faq-nad-04',
    category: 'protocol_monitoring',
    tag: 'Clinical Documentation',
    questionEn: 'What clinical information must be documented if testing during an active protocol?',
    questionEs: '¿Qué información clínica debe registrarse si la prueba se realiza durante un tratamiento activo?',
    answerEn: 'Precise clinical documentation is essential for consistent interpretation:\n• Acute therapy details: e.g., "Received 250 mg IV NAD⁺ infusion yesterday at 14:00".\n• Active oral regimen: exact compound (NMN, NR, NAD⁺), daily dosage, and timing of the last dose prior to capillary blood sampling.',
    answerEs: 'Es fundamental documentar de forma precisa:\n• Terapia parenteral reciente: ej. "Recibió infusión IV de 250 mg de NAD⁺ ayer a las 14:00".\n• Pauta oral actual: compuesto exacto (NMN, NR, NAD⁺), dosis diaria y momento de la última toma respecto a la extracción capilar.'
  },
  {
    id: 'faq-nad-05',
    category: 'protocol_monitoring',
    tag: 'Serial Tracking & Comparability',
    questionEn: 'How should sample timing be standardised for serial follow-up tests?',
    questionEs: '¿Cómo debe estandarizarse el momento de toma de muestra para pruebas de seguimiento comparables?',
    answerEn: 'For serial follow-up tests, standardise the timing of blood collection in relation to your IV infusion and oral dose (e.g., consistently 24 hours post-IV infusion, or in the morning before daily oral dosing). This consistency ensures future results are directly comparable and clinically useful for fine-tuning the protocol.',
    answerEs: 'Para monitorizaciones periódicas, estandarice la ventana horaria de toma de muestra respecto a la infusión IV y la toma oral (ej. siempre 24 horas después de la infusión, o por la mañana antes de la dosis oral diaria). Esta uniformidad permite comparar resultados de forma rigurosa para ajustar la pauta médica.'
  },
  {
    id: 'faq-nad-06',
    category: 'baseline',
    tag: 'Baseline Washout Guidelines',
    questionEn: 'What if the objective IS to measure unsupplemented baseline NAD status? (Washout Guidelines)',
    questionEs: '¿Y si el objetivo clínico SÍ es conocer el nivel basal de NAD sin tratamiento? (Pautas de lavado)',
    answerEn: 'If the clinical goal is to assess native baseline NAD status before starting therapy:\n• Oral Precursors (NMN, NR, Niacin, Nicotinamide): Ideally stop NAD-boosting supplements for approximately 2–3 weeks before testing, if clinically appropriate.\n• IV NAD⁺ Therapy: Avoid testing immediately after an infusion. While universal washout consensus is limited, allowing at least several days to a few weeks is a reasonable, prudent practical approach.',
    answerEs: 'Si el objetivo médico es determinar el nivel basal puro antes de iniciar un tratamiento:\n• Suplementos orales (NMN, NR, Niacin, Nicotinamida): Suspender idealmente durante 2–3 semanas previas a la prueba, bajo criterio clínico.\n• Terapia IV de NAD⁺: Evitar la toma de muestra inmediatamente tras una infusión. Aunque no hay un consenso universal de washout, dejar transcurrir varios días o semanas es un criterio clínico prudente y razonable.'
  },
  {
    id: 'faq-nad-07',
    category: 'preparation',
    tag: 'Pre-Test Fasting',
    questionEn: 'Do I need to fast before the test?',
    questionEs: '¿Es necesario acudir en ayunas para la prueba?',
    answerEn: 'Unless otherwise instructed by your physician, fasting is generally not required for the capillary dried blood spot NAD test. However, for follow-up testing and longitudinal monitoring, it is advisable to collect samples under similar dietary and time-of-day conditions each time.',
    answerEs: 'Salvo indicación expresa de su médico, el ayuno estricto generalmente no es obligatorio para el test capilar DBS de NAD. Sin embargo, para monitorización evolutiva, es muy aconsejable tomar la muestra en condiciones similares de hidratación y horario.'
  },
  {
    id: 'faq-nad-08',
    category: 'preparation',
    tag: 'Prescription Medication',
    questionEn: 'Can I take my normal medications?',
    questionEs: '¿Puedo tomar mis medicamentos habituales?',
    answerEn: 'Do not discontinue prescribed chronic medication solely for an NAD test unless explicitly instructed by your physician. Please report all current medications and therapies on the clinical intake form.',
    answerEs: 'No suspenda medicación prescrita únicamente con motivo del test de NAD, salvo indicación expresa de su médico. Por favor reporte todos sus fármacos activos en la ficha clínica previa.'
  },
  {
    id: 'faq-nad-09',
    category: 'preparation',
    tag: 'Vitamins & Cofactors',
    questionEn: 'What about other vitamins and supplements?',
    questionEs: '¿Qué ocurre con otras vitaminas y suplementos?',
    answerEn: 'Please report any supplements that may influence NAD metabolism or salvage pathways, particularly NMN, NR, niacin (vitamin B3), nicotinamide, TMG (trimethylglycine), and CD38 inhibitors (apigenin, quercetin).',
    answerEs: 'Debe comunicar cualquier suplemento que influya en las rutas de salvamento del NAD, especialmente NMN, NR, niacina (vitamina B3), nicotinamida, TMG (trimetilglicina) e inhibidores de CD38 (apigenina, quercetina).'
  },
  {
    id: 'faq-nad-10',
    category: 'preparation',
    tag: 'Circadian Timing',
    questionEn: 'What is the best time of day to take the test?',
    questionEs: '¿Cuál es el mejor momento del día para realizar la prueba?',
    answerEn: 'NAD levels fluctuate following circadian biological rhythms. For serial monitoring over time, consistency is key. Ideally, repeat samples should be collected at approximately the same time of day (preferably morning) under rested conditions.',
    answerEs: 'Los niveles de NAD presentan oscilaciones circadianas. Para monitorización longitudinal, la consistencia horaria es clave: recoja las muestras de seguimiento aproximadamente a la misma hora del día (preferiblemente por la mañana) y en reposo.'
  },
  {
    id: 'faq-nad-11',
    category: 'preparation',
    tag: 'Physical Exercise',
    questionEn: 'Can exercise affect the test result?',
    questionEs: '¿Puede el ejercicio físico alterar el resultado?',
    answerEn: 'Yes. Strenuous exercise influences cellular energy metabolism, mitochondrial ATP demand, and NAD⁺/NADH turnover. For the most comparable measurements, avoid unusually strenuous exercise immediately before testing and keep pre-test physical activity habitual.',
    answerEs: 'Sí. El ejercicio físico intenso altera la demanda bioenergética mitocondrial y el recambio de NAD⁺/NADH. Para obtener mediciones comparables, evite entrenamientos extenuantes no habituales las 24 horas previas a la extracción.'
  },
  {
    id: 'faq-nad-12',
    category: 'clinical',
    tag: 'Pre-Test Clinical Checklist',
    questionEn: 'What clinical information should I provide before testing?',
    questionEs: '¿Qué información clínica debo facilitar antes de realizar la prueba?',
    answerEn: 'Ideally provide: patient age, active prescription medications, dietary supplements, specific NAD/NMN/NR precursor usage, IV NAD⁺ therapy history (including dose, e.g. 250 mg, and timestamp of the last infusion).',
    answerEs: 'Idealmente reporte: edad del paciente, medicación prescrita activa, suplementos nutricionales, uso de precursores NAD/NMN/NR, e historial de infusiones IV de NAD⁺ (incluyendo dosis, ej. 250 mg, y fecha/hora exacta de la última infusión).'
  },
  {
    id: 'faq-nad-13',
    category: 'clinical',
    tag: 'Diagnostic Scope & Regulatory',
    questionEn: 'Is the Bloodo™ NAD test a diagnostic test?',
    questionEs: '¿Es la prueba de NAD de Bloodo™ un test diagnóstico de enfermedades?',
    answerEn: 'The Bloodo™ NAD test is a quantitative cellular biomarker assessment. Results must be interpreted in conjunction with the patient’s full clinical context by a licensed healthcare provider, and should not be used in isolation to diagnose a medical pathology or make unilateral therapeutic changes.',
    answerEs: 'La prueba de NAD de Bloodo™ es una evaluación cuantitativa de biomarcadores celulares. Los resultados deben ser interpretados por un médico cualificado dentro del contexto clínico integral del paciente, y no deben utilizarse de forma aislada para diagnosticar patologías ni modificar tratamientos unilateralmente.'
  }
];

async function seedNadFaqs() {
  console.log('Seeding clinical FAQs for bloodo-nad-level-test in Firestore...');
  const docRef = adminDb.collection('products').doc('bloodo-nad-level-test');
  const snap = await docRef.get();
  if (!snap.exists) {
    console.error('Document bloodo-nad-level-test not found!');
    process.exit(1);
  }

  await docRef.update({
    clinical_faq: NAD_CLINICAL_FAQS,
    faq: NAD_CLINICAL_FAQS,
    'meta.updatedAt': new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log(`Successfully updated bloodo-nad-level-test with ${NAD_CLINICAL_FAQS.length} clinical FAQs.`);
}

seedNadFaqs().catch(err => {
  console.error('Error seeding NAD FAQs:', err);
  process.exit(1);
});
