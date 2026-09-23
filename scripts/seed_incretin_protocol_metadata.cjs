const { adminDb } = require('../src/lib/firebaseAdmin');

const INCRETIN_CLINICAL_METADATA = {
  is_reference_standard: true,
  reference_standard_tier: 'gold',
  reference_label_en: 'Primary Clinical Reference Standard',
  reference_label_es: 'Protocolo de Referencia Clínica',
  gi_tolerance_algorithm: {
    delayed_gastric_emptying_kinetics: 'Glucagon-like peptide-1 (GLP-1) agonism transiently slows gastric motility by 35–50%, peaking in days 1–3 post-injection.',
    delayed_gastric_emptying_kinetics_es: 'El agonismo de GLP-1 ralentiza de forma transitoria la motilidad gástrica entre un 35% y un 50%, alcanzando su pico en los días 1 a 3 post-inyección.',
    titration_decision_tree: [
      {
        grade: 'Mild (Grade 1)',
        grade_es: 'Leve (Grado 1)',
        symptoms: 'Transient early satiety, slight postprandial fullness, mild nausea lasting < 24 hours.',
        symptoms_es: 'Saciedad precoz transitoria, plenitud postprandial leve, náuseas pasajeras < 24 horas.',
        clinical_action: 'Maintain current dose. Reduce meal volume by 40%, eliminate high-fat foods, and ensure hydration with oral electrolytes.',
        clinical_action_es: 'Mantener dosis actual. Reducir el volumen de las comidas un 40%, suprimir grasas densas y asegurar hidratación con electrolitos.'
      },
      {
        grade: 'Moderate (Grade 2)',
        grade_es: 'Moderado (Grado 2)',
        symptoms: 'Persistent nausea > 48 hours, intermittent vomiting, gastroesophageal reflux interfering with daily intake.',
        symptoms_es: 'Náuseas persistentes > 48 horas, vómitos intermitentes, pirosis/reflujo que interfiere con la alimentación.',
        clinical_action: 'Step-Down Rule: Pause dose escalation for 2–4 weeks. If symptoms persist at next injection, reduce dose to previous titration step (e.g. 4 mg → 2 mg).',
        clinical_action_es: 'Regla de desescalado: Pausar el escalado 2–4 semanas. Si los síntomas persisten en la siguiente toma, retroceder al escalón anterior (ej. 4 mg → 2 mg).'
      },
      {
        grade: 'Severe (Grade 3/4)',
        grade_es: 'Severo (Grado 3/4)',
        symptoms: 'Intractable vomiting, severe unremitting epigastric abdominal pain radiating to back (suspected acute pancreatitis).',
        symptoms_es: 'Vómitos incoercibles, dolor abdominal epigástrico intenso irradiado a espalda (sospecha de pancreatitis aguda).',
        clinical_action: 'Discontinue incretin therapy immediately. Order stat serum Lipase, Amylase, and complete metabolic panel. Perform abdominal ultrasound.',
        clinical_action_es: 'Suspender de inmediato. Solicitar lipasa y amilasa séricas urgentes, analítica metabólica y ecografía abdominal.'
      }
    ]
  },
  lean_mass_preservation_target: {
    target_fat_loss_ratio: '> 75% Total Fat Mass Reduction (≤ 25% Lean Tissue Loss)',
    target_fat_loss_ratio_es: '> 75% Pérdida de Masa Grasa (≤ 25% Pérdida de Masa Magra)',
    dexa_cadence: 'Baseline (Day 0), Week 12, and Week 24 Dual-Energy X-Ray Absorptiometry (DEXA).',
    dexa_cadence_es: 'Absorciometría de Rayos X de Energía Dual (DEXA) en Día 0 (Basal), Semana 12 y Semana 24.',
    daily_protein_target: '1.6 – 2.2 g per kg of target body weight daily',
    daily_protein_target_es: '1,6 – 2,2 g de proteína por kg de peso objetivo al día',
    muscle_protection_cofactors: [
      {
        name: 'MOTS-c Mitochondrial Derived Peptide',
        name_es: 'Péptido Mitocondrial MOTS-c',
        dosage: '5 – 10 mg 3x weekly',
        dosage_es: '5 – 10 mg 3 veces por semana',
        rationale: 'Directly phosphorylates AMPK in skeletal muscle, driving glucose uptake independently of insulin and preventing catabolic lean mass degradation.',
        rationale_es: 'Fosforila directamente AMPK en músculo esquelético, facilitando la captación de glucosa y protegiendo contra el catabolismo muscular.'
      },
      {
        name: 'Creatine Monohydrate',
        name_es: 'Monohidrato de Creatina',
        dosage: '3 – 5 g daily',
        dosage_es: '3 – 5 g diarios',
        rationale: 'Maintains intramuscular phosphocreatine reserves and intracellular hydration during rapid caloric deficit.',
        rationale_es: 'Mantiene las reservas intracelulares de fosfocreatina e hidratación durante el déficit calórico rápido.'
      }
    ]
  },
  companion_diagnostic: {
    product_slug: 'hemoglobin-a1c-hba1c-test',
    name: 'Bloodo™ Hemoglobin A1c (HbA1c) Test',
    name_es: 'Test de Hemoglobina Glicosilada (HbA1c) Bloodo™',
    lab: 'LifeLab1 (Vilnius, Lithuania) · CE-IVDR Certified',
    matrix: 'Capillary Dried Blood Spot (DBS)',
    biomarkers: ['HbA1c (% Glycated Hemoglobin)', 'Estimated Average Glucose (eAG)'],
    sampling_cadence: [
      {
        id: 'hba1c-01',
        milestone: 'Baseline Glycemic Benchmark (Day 0)',
        milestone_es: 'Línea de Base Glucémica (Día 0)',
        timing: 'Pre-Protocol',
        timing_es: 'Pre-Protocolo',
        objective: 'Establishes precise starting glycated hemoglobin (HbA1c) and baseline insulin sensitivity.',
        objective_es: 'Determina el punto de partida de hemoglobina glicada y sensibilidad a la insulina.',
        guideline: 'Fasting is not required for HbA1c, but sample should be collected in the morning.',
        guideline_es: 'No se requiere ayuno estricto para HbA1c; se recomienda extracción matutina.'
      },
      {
        id: 'hba1c-02',
        milestone: 'Mid-Cycle Therapeutic Verification (Week 12)',
        milestone_es: 'Verificación Terapéutica a Mitad de Ciclo (Semana 12)',
        timing: 'End of Phase 3 / Week 12',
        timing_es: 'Final de Fase 3 / Semana 12',
        objective: 'Measures erythrocyte turnover glycemic optimization (expected ΔHbA1c of -1.5% to -2.1%).',
        objective_es: 'Mide la reducción sostenida del recambio eritrocitario (reducción esperada de -1,5% a -2,1%).',
        guideline: 'Evaluate alongside DEXA body composition scan to verify visceral fat clearance.',
        guideline_es: 'Evaluar junto a escáner DEXA para verificar eliminación de grasa visceral.'
      }
    ]
  },
  biliary_pancreatic_surveillance: {
    required_labs: ['Serum Lipase', 'Serum Amylase', 'Comprehensive Metabolic Panel (CMP)', 'Lipid Profile'],
    required_labs_es: ['Lipasa Sérica', 'Amilasa Sérica', 'Perfil Hepático y Metabólico Completo (CMP)', 'Perfil Lipídico'],
    ultrasound_guideline: 'Baseline abdominal gallbladder ultrasound recommended for patients with rapid weight loss history or pre-existing cholelithiasis.',
    ultrasound_guideline_es: 'Se aconseja ecografía hepatobiliar previa en pacientes con antecedentes de colelitiasis o pérdida ponderal acelerada.'
  }
};

async function seedIncretinAndStandards() {
  console.log('Seeding clinical metadata for Retatrutide PR-MET-011 and pinning reference standards...');
  
  // 1. Update Retatrutide PR-MET-011 (jCIQyrFN3GegMoZeMbyi)
  const retatrutideRef = adminDb.collection('protocols').doc('jCIQyrFN3GegMoZeMbyi');
  await retatrutideRef.update({
    ...INCRETIN_CLINICAL_METADATA,
    _clinicalMetadataUpdated: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  console.log('Updated Retatrutide PR-MET-011 with incretin safety & DEXA metadata.');

  // 2. Pin BPC-157 & TB-500 Wolverine PR-REC-002 as Reference Standard
  const wolverineRef = adminDb.collection('protocols').doc('1QR69jq0QQpu2NjCzpxg');
  await wolverineRef.update({
    is_reference_standard: true,
    reference_standard_tier: 'gold',
    reference_label_en: 'Primary Clinical Reference Standard',
    reference_label_es: 'Protocolo de Referencia Clínica',
    updatedAt: new Date().toISOString()
  });
  console.log('Pinned BPC-157 & TB-500 Wolverine as Primary Clinical Reference Standard.');

  // 3. Pin NAD+ Cellular Restoration Protocol PR-LON-003 as Reference Standard
  const nadRef = adminDb.collection('protocols').doc('Ks2ThxuWoPmWzc3UW06R');
  await nadRef.update({
    is_reference_standard: true,
    reference_standard_tier: 'gold',
    reference_label_en: 'Primary Clinical Reference Standard',
    reference_label_es: 'Protocolo de Referencia Clínica',
    updatedAt: new Date().toISOString()
  });
  console.log('Pinned NAD+ Protocol as Primary Clinical Reference Standard.');
}

seedIncretinAndStandards().catch(err => {
  console.error('Error seeding incretin metadata and reference standards:', err);
  process.exit(1);
});
