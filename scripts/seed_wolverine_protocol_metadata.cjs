const { adminDb } = require('../src/lib/firebaseAdmin');

const WOLVERINE_CLINICAL_METADATA = {
  anatomical_targeting: {
    modes: [
      {
        id: 'perilesional',
        name: 'Peri-Lesional Infiltration (Musculoskeletal Focus)',
        name_es: 'Infiltración Perilesional Subcutánea (Enfoque Musculoesquelético)',
        best_for: 'Tendinopathies (Achilles, Patellar, Rotator Cuff), ligament sprains, and focal muscle tears.',
        best_for_es: 'Tendinopatías (Aquiles, rotuliano, manguito rotador), esguinces ligamentosos y roturas musculares focales.',
        geometry: 'Subcutaneous injection within a 2.0 – 4.0 cm radius of the focal pain epicenter or ultrasound-identified lesion.',
        geometry_es: 'Inyección subcutánea en un radio de 2,0 – 4,0 cm del epicentro del dolor o lesión ecográfica.',
        needle_spec: '31G 8mm Ultra-Fine needle angled at 45° into the subcutaneous fat layer immediately overlying the peritendinous sheath.',
        needle_spec_es: 'Aguja 31G 8mm en ángulo de 45° en el tejido celular subcutáneo adyacente a la vaina peritendinosa.',
        clinical_warning: 'CRITICAL WARNING: NEVER inject directly into the tendon substance (intratendinous injection). Direct intratendinous boluses create focal hydrostatic pressure that risks iatrogenic tendon rupture.',
        clinical_warning_es: 'ADVERTENCIA CLÍNICA CRÍTICA: NUNCA inyectar directamente dentro de la masa intratendinosa. Los bolos intratendinosos generan sobrepresión hidrostática que aumenta el riesgo de rotura tendinosa iatrogénica.'
      },
      {
        id: 'systemic',
        name: 'Systemic Abdominal Subcutaneous Infiltration',
        name_es: 'Infiltración Sistémica Abdominal Subcutánea',
        best_for: 'Intestinal permeability (Leaky Gut), post-surgical recovery, systemic vascular repair, and needle-apprehensive patients.',
        best_for_es: 'Permeabilidad intestinal (Leaky Gut), recuperación postquirúrgica sistémica y pacientes con aprensión a la punción local.',
        geometry: 'Subcutaneous adipose pinch 4.0 – 6.0 cm lateral to the umbilicus (alternating left and right quadrants).',
        geometry_es: 'Pliegue graso subcutáneo a 4,0 – 6,0 cm lateral al ombligo (alternando cuadrantes izquierdo y derecho).',
        needle_spec: '31G 8mm needle at 90° into clean abdominal subcutaneous adipose tissue.',
        needle_spec_es: 'Aguja 31G 8mm a 90° en tejido adiposo subcutáneo abdominal limpio.',
        clinical_warning: 'BPC-157 and TB-500 exhibit systemic biodistribution through microvascular circulation; systemic injection achieves ~80% of local efficacy for deeper joints.',
        clinical_warning_es: 'BPC-157 y TB-500 exhiben biodistribución sistémica vía microcirculación; la inyección abdominal alcanza ~80% de eficacia frente a la infiltración perilesional en articulaciones profundas.'
      }
    ]
  },
  mechanotherapy_phases: [
    {
      phase: 1,
      weeks: 'Weeks 1 – 2',
      weeks_es: 'Semanas 1 – 2',
      title: 'Fibroblastic Induction & Fibrin Stabilization',
      title_es: 'Inducción Fibroblástica y Estabilización de Fibrina',
      biological_target: 'BPC-157 upregulation of early growth response gene-1 (egr-1) and TB-500 G-actin sequestration for rapid cell migration.',
      biological_target_es: 'Activación del gen de respuesta temprana egr-1 por BPC-157 y secuestro de G-actina por TB-500 para migración celular.',
      rehab_guideline: 'Relative rest. Protected range of motion. Low-intensity isometric contractions (45s hold at 50% MVC, 4 reps daily) to align initial collagen III fibrils without shear strain.',
      rehab_guideline_es: 'Reposo relativo y rango articular protegido. Contracciones isométricas suaves (mantenimiento 45s al 50% de contracción voluntaria máxima) para alinear fibras iniciales de colágeno III sin estrés de cizallamiento.'
    },
    {
      phase: 2,
      weeks: 'Weeks 3 – 5',
      weeks_es: 'Semanas 3 – 5',
      title: 'Collagen III to I Phenotypic Transition (Davis\' Law)',
      title_es: 'Transición Fenotípica de Colágeno III a Colágeno I (Ley de Davis)',
      biological_target: 'Accelerated enzymatic cross-linking and tenocyte maturation under controlled mechanical stimulation.',
      biological_target_es: 'Entrecruzamiento enzimático acelerado y maduración de tenocitos bajo estimulación mecánica controlada.',
      rehab_guideline: 'Progressive heavy-slow resistance (HSR) and eccentric loading protocol (3 sets of 8-10 reps, 3s concentric / 3s eccentric cadence). Stimulates directional collagen I fascicle realignment.',
      rehab_guideline_es: 'Protocolo de carga excéntrica lenta y resistencia pesada progresiva (3 series de 8-10 reps, cadencia 3s concéntrico / 3s excéntrico). Estimula la reorganización longitudinal del colágeno I.'
    },
    {
      phase: 3,
      weeks: 'Weeks 6 – 8',
      weeks_es: 'Semanas 6 – 8',
      title: 'Tensile Load Shear Consolidation & Return to Play',
      title_es: 'Consolidación de Fuerza Tensil y Retorno Deportivo',
      biological_target: 'Restoration of normal tissue elasticity, microvascular capillary density, and complete scar remodeling.',
      biological_target_es: 'Restauración de elasticidad tisular, densidad capilar microvascular y remodelación completa de la cicatriz.',
      rehab_guideline: 'Dynamic energy storage-and-release drills, plyometrics, and sport-specific biomechanical training. Full return-to-competition clearance once asymptomatic under 100% reactive force.',
      rehab_guideline_es: 'Ejercicios dinámicos de almacenamiento y liberación elástica, pliometría y biomecánica deportiva. Alta médica completa al superar pruebas funcionales sin dolor.'
    }
  ],
  tissue_specific_dosages: [
    {
      tissue: 'Tendinopathy (Achilles, Patellar, Rotator Cuff)',
      tissue_es: 'Tendinopatía (Aquiles, Rotuliano, Manguito Rotador)',
      bpc_dose: '250 mcg 2x daily (SubQ perilesional)',
      tb_dose: '2.5 mg 2x weekly (SubQ)',
      duration: '6 – 8 Weeks',
      clinical_notes: 'Combine with heavy slow eccentric loading in Phase 2.'
    },
    {
      tissue: 'Acute Muscle Tear / Strain (Grade I/II)',
      tissue_es: 'Rotura o Desgarro Muscular Agudo (Grado I/II)',
      bpc_dose: '350 mcg 2x daily (SubQ adjacent to muscle belly)',
      tb_dose: '3.0 mg 2x weekly (Loading 10 days, then 2.0 mg 2x/wk)',
      duration: '4 – 6 Weeks',
      clinical_notes: 'Accelerates myoblast fusion and reduces dense fibrous scar adhesion.'
    },
    {
      tissue: 'Articular Cartilage & Meniscal Degeneration',
      tissue_es: 'Degeneración de Cartílago Articular y Menisco',
      bpc_dose: '250 mcg 2x daily (SubQ periarticular)',
      tb_dose: '2.5 mg 2x weekly (SubQ)',
      duration: '8 – 12 Weeks',
      clinical_notes: 'Pair with oral collagen peptides (15g) and Vitamin C 60 min before rehab sessions.'
    },
    {
      tissue: 'Gastrointestinal Hyperpermeability (Leaky Gut / IBD)',
      tissue_es: 'Permeabilidad Intestinal (Leaky Gut / EII)',
      bpc_dose: '500 mcg oral capsule on empty stomach 1x daily',
      tb_dose: '2.0 mg once weekly (SubQ systemic)',
      duration: '6 – 8 Weeks',
      clinical_notes: 'Direct gastric mucoprotective action and zonula occludens-1 tight junction restoration.'
    }
  ],
  angiogenesis_safety_screen: {
    rule_title: 'Angiogenesis Safety Screening (VEGF & Actin Dynamics)',
    rule_title_es: 'Cribado de Seguridad Angiogénica (Eje VEGF y Dinámica de Actina)',
    contraindications: [
      'Active or undiagnosed malignant neoplasms',
      'Proliferative diabetic retinopathy (neovascularization risk)',
      'Unresolved history of hematological malignancy within 5 years',
      'Pregnancy and lactation'
    ],
    contraindications_es: [
      'Neoplasias malignas activas o no diagnosticadas',
      'Retinopatía diabética proliferativa (riesgo de neovascularización)',
      'Antecedentes de malignidad hematológica no resuelta en los últimos 5 años',
      'Embarazo y lactancia'
    ],
    rationale: 'BPC-157 stimulates the VEGFR2 signaling cascade promoting functional capillary angiogenesis, and TB-500 enhances endothelial cell migration. While beneficial for ischemic musculoskeletal wound repair, these pathways are strictly contraindicated in proliferative vascular or oncological disorders.',
    rationale_es: 'BPC-157 estimula la cascada de señalización VEGFR2 promoviendo angiogénesis capilar funcional, y TB-500 potencia la migración endotelial. Si bien son altamente beneficiosos para la reparación tisular, están contraindicados en trastornos vasculares proliferativos u oncológicos.'
  }
};

async function seedWolverineMetadata() {
  console.log('Seeding clinical metadata for BPC-157 & TB-500 Wolverine protocol 1QR69jq0QQpu2NjCzpxg...');
  const docRef = adminDb.collection('protocols').doc('1QR69jq0QQpu2NjCzpxg');
  const snap = await docRef.get();
  if (!snap.exists) {
    console.error('Protocol 1QR69jq0QQpu2NjCzpxg not found!');
    process.exit(1);
  }

  await docRef.update({
    ...WOLVERINE_CLINICAL_METADATA,
    _clinicalMetadataUpdated: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('Successfully updated Wolverine protocol with anatomical targeting and mechanotherapy metadata.');
}

seedWolverineMetadata().catch(err => {
  console.error('Error seeding Wolverine protocol metadata:', err);
  process.exit(1);
});
