const { adminDb } = require('../src/lib/firebaseAdmin');

const NAD_PROTOCOL_METADATA = {
  companion_diagnostic: {
    product_slug: 'bloodo-nad-level-test',
    name: 'Bloodo™ NAD Level Test (Capillary Dried Blood Spot)',
    name_es: 'Test de Nivel de NAD Bloodo™ (Mancha de Sangre Seca Capilar)',
    lab: 'LifeLab1 (Vilnius, Lithuania) · CE-IVDR Certified',
    matrix: 'Capillary Dried Blood Spot (DBS)',
    biomarkers: ['Total Cellular NAD (NAD⁺ and NADH)'],
    sampling_cadence: [
      {
        id: 'cadence-01',
        milestone: 'Baseline Assessment (Day 0)',
        milestone_es: 'Evaluación Basal (Día 0)',
        timing: 'Pre-Protocol (prior to first dose)',
        timing_es: 'Pre-Protocolo (previo a la primera dosis)',
        objective: 'Quantifies native unsupplemented intracellular NAD pool',
        objective_es: 'Cuantifica el pool intracelular basal previo al tratamiento',
        guideline: 'If taking oral NMN/NR supplements, 2–3 week washout recommended if clinically appropriate.',
        guideline_es: 'Si toma suplementos orales de NMN/NR, se recomienda lavado de 2–3 semanas bajo criterio clínico.'
      },
      {
        id: 'cadence-02',
        milestone: 'Mid-Protocol Monitoring (Week 4)',
        milestone_es: 'Monitorización Terapéutica (Semana 4)',
        timing: 'On-treatment (4 weeks post-initiation)',
        timing_es: 'En tratamiento activo (4 semanas post-inicio)',
        objective: 'Evaluates therapeutic response and precursor bioavailability to guide dosage calibration',
        objective_es: 'Evalúa la respuesta biológica en tratamiento para calibrar dosis y pautas',
        guideline: 'DO NOT discontinue oral or IV NAD. Document exact doses (e.g. 250 mg IV at 14:00) and standardise blood collection intervals.',
        guideline_es: 'NO suspenda el NAD oral ni IV. Documente dosis exactas (ej. 250 mg IV a las 14:00) y estandarice el intervalo de extracción.'
      },
      {
        id: 'cadence-03',
        milestone: 'Protocol Consolidation (Week 8–12)',
        milestone_es: 'Consolidación de Protocolo (Semana 8–12)',
        timing: 'Completion of active restoration cycle',
        timing_es: 'Finalización del ciclo de restauración activa',
        objective: 'Verifies sustained intracellular NAD+ replenishment and sirtuin activation threshold',
        objective_es: 'Verifica la reposición celular sostenida y el umbral de activación de sirtuínas',
        guideline: 'Compare against Week 4 and Baseline under identical morning rested conditions.',
        guideline_es: 'Comparar con la Semana 4 y el basal bajo condiciones idénticas de reposo matutino.'
      }
    ]
  },
  methylation_support: {
    required: true,
    warning: 'NNMT-Mediated Methyl Donor Depletion Risk',
    warning_es: 'Riesgo de agotamiento de donantes de metilo vía NNMT',
    rationale: 'High-dose NAD+ synthesis and clearance via Nicotinamide N-Methyltransferase (NNMT) consumes S-Adenosylmethionine (SAMe), potentially depleting methyl donor pools and elevating plasma homocysteine.',
    rationale_es: 'La metabolización y aclaramiento del exceso de nicotinamida vía NNMT consume S-adenosilmetionina (SAMe), pudiendo agotar las reservas de metilos y elevar la homocisteína plasmática.',
    recommended_compounds: [
      {
        name: 'TMG (Trimethylglycine / Betaine)',
        name_es: 'TMG (Trimetilglicina / Betaína)',
        dosage: '500 mg – 1,000 mg daily',
        dosage_es: '500 mg – 1.000 mg al día',
        timing: 'Morning with first meal',
        timing_es: 'Por la mañana con la primera comida',
        purpose: 'Direct methyl group donor replenishing SAMe pool and mitigating NNMT-induced methylation stress.',
        purpose_es: 'Donante directo de grupos metilo que repone la reserva de SAMe y previene estrés de metilación.'
      },
      {
        name: 'Active Methyl-B Complex (B6, B12 Methylcobalamin, L-Methylfolate)',
        name_es: 'Complejo B Metilado Activo (B6, B12 Metilcobalamina, L-Metilfolato)',
        dosage: '1 capsule daily',
        dosage_es: '1 cápsula diaria',
        timing: 'Morning',
        timing_es: 'Por la mañana',
        purpose: 'Supports remethylation of homocysteine to methionine; targets serum homocysteine < 8.0 µmol/L.',
        purpose_es: 'Favorece la remetilación de homocisteína a metionina; objetivo homocisteína < 8.0 µmol/L.'
      }
    ]
  },
  administration_modalities: [
    {
      id: 'subcutaneous',
      label: 'Subcutaneous Micro-Dosing (At-Home Maintenance)',
      label_es: 'Microdosificación Subcutánea (Mantenimiento Domiciliario)',
      dose_range: '50 mg – 100 mg 2–3 times weekly',
      dose_range_es: '50 mg – 100 mg 2–3 veces por semana',
      route: 'Subcutaneous (SC)',
      vehicle: 'Reconstituted sterile bacteriostatic formulation',
      infusion_duration: 'N/A (Slow bolus over 30–45 seconds)',
      infusion_duration_es: 'N/A (Inyección lenta en 30–45 segundos)',
      vasomotor_tolerance: 'Excellent. Minimal risk of acute flushing or chest tightness.',
      vasomotor_tolerance_es: 'Excelente. Mínimo riesgo de rubor vasomotor o presión torácica.',
      best_for: 'Steady cellular baseline maintenance, long-term longevity protocols, and needle-tolerant home patients.',
      best_for_es: 'Mantenimiento continuo de niveles celulares basales y protocolos a largo plazo.'
    },
    {
      id: 'intravenous',
      label: 'Clinical IV Infusion Protocol (Parenteral Loading)',
      label_es: 'Infusión Intravenosa Clínica (Carga Parenteral)',
      dose_range: '250 mg (induction) to 500 mg (titration)',
      dose_range_es: '250 mg (inducción) a 500 mg (titulación)',
      route: 'Intravenous (IV) Infusion',
      vehicle: '500 mL 0.9% Sterile Sodium Chloride (NaCl)',
      infusion_duration: 'Minimum 90–120 minutes (250 mg) or 180–240 minutes (500 mg)',
      infusion_duration_es: 'Mínimo 90–120 minutos (250 mg) o 180–240 minutos (500 mg)',
      infusion_rate: 'Max 2.0 – 2.5 mg/min (Slow titration strictly enforced)',
      infusion_rate_es: 'Máximo 2.0 – 2.5 mg/min (titulación lenta estricta)',
      vasomotor_tolerance: 'Moderate. Rapid infusion causes transient chest pressure, flushing, nausea, or cramping due to extracellular purinergic receptor activation. Immediately slow drip rate if symptoms occur.',
      vasomotor_tolerance_es: 'Moderada. El goteo rápido provoca opresión precordial transitoria, náuseas o calor por activación purinérgica. Reduzca la velocidad de infusión si aparecen síntomas.',
      best_for: 'Acute mitochondrial depletion, post-viral fatigue recovery, rapid biological saturation, and clinical setting supervision.',
      best_for_es: 'Agotamiento mitocondrial agudo, fatiga post-viral y saturación biológica rápida supervisada.'
    }
  ],
  chronobiology: {
    optimal_window: '07:00 – 12:00 (Morning)',
    optimal_window_es: '07:00 – 12:00 (Mañana)',
    blackout_window: 'After 15:00 (Afternoon / Evening)',
    blackout_window_es: 'A partir de las 15:00 (Tarde / Noche)',
    circadian_rationale: 'NAD+ directly modulates CLOCK and BMAL1 circadian transcription factors and activates SIRT1 during diurnal metabolic peak. Late administration disrupts nocturnal ATP downregulation, causing insomnia and sleep fragmentation.',
    circadian_rationale_es: 'El NAD+ modula los factores transcripcionales reloj CLOCK y BMAL1 y activa SIRT1 en el pico metabólico diurno. Su administración tardía altera la arquitectura del sueño provocando insomnio.'
  }
};

async function seedNadProtocolMetadata() {
  console.log('Seeding clinical metadata for NAD+ protocol Ks2ThxuWoPmWzc3UW06R...');
  const docRef = adminDb.collection('protocols').doc('Ks2ThxuWoPmWzc3UW06R');
  const snap = await docRef.get();
  if (!snap.exists) {
    console.error('Protocol Ks2ThxuWoPmWzc3UW06R not found!');
    process.exit(1);
  }

  await docRef.update({
    ...NAD_PROTOCOL_METADATA,
    _clinicalMetadataUpdated: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('Successfully updated Ks2ThxuWoPmWzc3UW06R with clinical companion metadata.');
}

seedNadProtocolMetadata().catch(err => {
  console.error('Error seeding NAD protocol metadata:', err);
  process.exit(1);
});
