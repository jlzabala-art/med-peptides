/**
 * scripts/remediate_and_ingest_teletest.mjs
 *
 * Full TeleTest Analytika S.A. Integration Execution:
 * 1. Uploads all 8 TeleTest demonstration PDF reports to GCS / Storage.
 * 2. Restructures the product catalog to the canonical 5 tests (eliminates duplicates).
 * 3. Populates structured analytical definitions (elements, units, reference ranges, alleles).
 * 4. Ingests 5 structured test fixtures in `lab_results` (with `isDemoData: true`).
 * 5. Applies medical guardrails to separate genetic susceptibility from confirmed diagnosis.
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let saPath = path.resolve(__dirname, '../serviceAccount-target.json');
if (!fs.existsSync(saPath)) {
  saPath = path.resolve(__dirname, '../serviceAccountKey.json');
}

const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
const projectId = sa.project_id || 'med-peptides-app';
const bucketName = projectId + '.firebasestorage.app';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    storageBucket: bucketName
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const PDFS = [
  {
    key: 'celiac_analytical',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Celiaco_HLA_Demo_18267609.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Celiaco_HLA_Demo_18267609.pdf',
    fileName: 'TELETEST_Celiaco_HLA_Demo_18267609.pdf'
  },
  {
    key: 'hla_analytical',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    fileName: 'TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf'
  },
  {
    key: 'hla_assessment',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf',
    fileName: 'TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf'
  },
  {
    key: 'htma_analytical',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    fileName: 'TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf'
  },
  {
    key: 'htma_assessment',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf',
    fileName: 'TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf'
  },
  {
    key: 'omega_analytical',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Omega_Test_Demo_18267598.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Omega_Test_Demo_18267598.pdf',
    fileName: 'TELETEST_Omega_Test_Demo_18267598.pdf'
  },
  {
    key: 'omega_assessment',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Omega_Test_Assessment_Demo_18267598.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Omega_Test_Assessment_Demo_18267598.pdf',
    fileName: 'TELETEST_Omega_Test_Assessment_Demo_18267598.pdf'
  },
  {
    key: 'detox_analytical',
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf',
    fileName: 'TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf'
  }
];

async function uploadPdf(item) {
  if (!fs.existsSync(item.localPath)) {
    console.warn(`File not found: ${item.localPath}`);
    return null;
  }
  const token = uuidv4();
  const file = bucket.file(item.storagePath);
  console.log(`📤 Uploading ${item.fileName}...`);
  await bucket.upload(item.localPath, {
    destination: item.storagePath,
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        firebaseStorageDownloadTokens: token,
        uploadedAt: new Date().toISOString(),
        laboratory: 'TeleTest Analytika S.A.',
        cif: 'ES A58023326',
        sanitaryAuthorization: 'E08750211'
      }
    }
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(item.storagePath)}?alt=media&token=${token}`;
  console.log(`   ✅ URL: ${url}`);
  return url;
}

async function run() {
  console.log('🚀 [TeleTest Remediation] Starting full execution across all phases...\n');

  // ── Step 1: Upload PDFs ──────────────────────────────────────────────────────
  const uploadedUrls = {};
  for (const item of PDFS) {
    try {
      const url = await uploadPdf(item);
      uploadedUrls[item.key] = url || `/docs/labs/teletest/${item.fileName}`;
    } catch (err) {
      console.warn(`Could not upload ${item.fileName} to bucket, using local fallback.`);
      uploadedUrls[item.key] = `/docs/labs/teletest/${item.fileName}`;
    }
  }

  // ── Step 2: Clean up redundant split products ───────────────────────────────
  console.log('\n🧹 Cleaning up redundant split products...');
  const obsoleteIds = [
    'teletest-metales-pesados-toxicologia',
    'teletest-ratios-metabolicos-minerales'
  ];
  for (const id of obsoleteIds) {
    await db.collection('products').doc(id).delete();
    console.log(`   ❌ Removed redundant split product: ${id}`);
  }

  // ── Step 3: Upsert Supplier ─────────────────────────────────────────────────
  console.log('\n🏢 Updating TeleTest Supplier record...');
  await db.collection('suppliers').doc('supplier-teletest').set({
    id: 'supplier-teletest',
    name: 'TeleTest Analytika',
    displayName: 'TeleTest Analytika S.A.',
    companyName: 'TeleTest Analytika S.A.',
    cif: 'ES A58023326',
    sanitaryAuthorization: 'E08750211',
    category: 'diagnostic_laboratory',
    supplierType: 'diagnostic_laboratory',
    accreditations: [
      'ISO 17025 European Quality Standard',
      'Generalitat de Catalunya Departament de Salut E08750211',
      'Documentación Firmada Electrónicamente FNMT'
    ],
    laboratoryDirectors: [
      'Dra. Carolina García Sabaté (CBC 22319-C)',
      'Dr. José Mª Mestres (COFB 12.195)'
    ],
    address: 'Provenza 169 Local 2, 08036 Barcelona, España',
    contactEmail: 'laboratory@teletest.es',
    phone: '+34 932 123 345',
    portalUrl: 'https://teletest.es',
    currency: 'EUR',
    status: 'active',
    productCount: 5,
    leadTimeDays: 7,
    logoUrl: '/images/suppliers/teletest-logo.svg',
    descriptionEn: 'Accredited European clinical reference laboratory (E08750211, ISO 17025) specializing in high-resolution HLA immunogenetics, celiac disease predisposition, whole-blood omega profiles, and ICP-MS/MS hair tissue mineral toxicology.',
    descriptionEs: 'Laboratorio de referencia europeo autorizado por el Departament de Salut (E08750211) y acreditado ISO 17025. Especializado en inmunogenética HLA, celiaquía, perfil omega de sangre total y mineralograma tisular por ICP-MS/MS.',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('   ✅ Supplier updated.');

  // ── Step 4: Upsert the 5 Canonical Diagnostic Products ─────────────────────
  console.log('\n🧪 Upserting 5 Canonical TeleTest Diagnostic Products in Firestore...');

  const CANONICAL_PRODUCTS = [
    // 1. Genetic Celiac Disease
    {
      id: 'teletest-celiac-gluten-hla',
      slug: 'teletest-celiac-gluten-hla',
      name: 'Estudio Genético de Intolerancia al Gluten & Enfermedad Celíaca (HLA-DQ2 / DQ8)',
      displayName: 'Genetic Celiac Disease & Gluten Predisposition Test (HLA-DQ2 / DQ8)',
      canonicalName: 'GNT. CELIAQUIA',
      originalLaboratoryName: 'GNT. CELIAQUIA',
      testCode: '18267609',
      brand: 'TeleTest Analytika',
      supplierId: 'supplier-teletest',
      supplierName: 'TeleTest Analytika S.A.',
      supplier: 'TeleTest Analytika',
      category: 'diagnostic',
      categoryId: 'diagnostic',
      subCategory: 'genomics_celiac',
      primaryType: 'diagnostic',
      availableTypes: ['diagnostic'],
      sampleType: 'Saliva (Frotis Bucal)',
      methodology: 'qPCR Multiplex Específica & Genotipado de Alta Resolución',
      turnaroundDays: 5,
      status: 'published',
      currency: 'EUR',
      basePrice: 165,
      pricing: {
        retailPrice: { base: 165 },
        clinicPrice: { base: 135 },
        wholesalePrice: { base: 115 },
        masterPrice: { base: 95 }
      },
      cloudStoragePath: 'labs/teletest/original/TELETEST_Celiaco_HLA_Demo_18267609.pdf',
      pdfUrl: '/docs/labs/teletest/TELETEST_Celiaco_HLA_Demo_18267609.pdf',
      cloudStorageDownloadUrl: uploadedUrls.celiac_analytical,
      analyticalReportUrl: uploadedUrls.celiac_analytical,
      shortDescription: 'Detección cualitativa y alélica de haplotipos HLA-DQ2 y HLA-DQ8 con valor predictivo negativo superior al 99%.',
      description: 'Estudio genómico para evaluar la susceptibilidad genética a la enfermedad celíaca y sensibilidad al gluten. La presencia de marcadores HLA-DQ2 o DQ8 confiere susceptibilidad pero no equivale a diagnóstico de enfermedad celíaca activa (requiere confirmación serológica o histológica). Su ausencia excluye la patología con un 99% de certeza.',
      biomarkers: [
        'HLA-DQA1', 'HLA-DQB1',
        'HLA-DQ2.2', 'HLA-DQ2.5', 'HLA-DQ8', 'HLA-DQ7.5', 'HLA-DQX.2', 'HLA-DQX.5', 'HLA-DQ2.X',
        'DQA1*05', 'DQB1*02', 'DQA1*03', 'DQB1*03:02'
      ],
      clinicalGuardrails: {
        findingType: 'genetic_susceptibility',
        isConfirmedDiagnosis: false,
        clinicalDisclaimer: 'La susceptibilidad genética indica predisposición inmunológica, no diagnóstico de enfermedad celíaca activa.'
      },
      variants: [
        {
          id: 'teletest-celiac-single',
          sku: 'TT-CEL-HLA-01',
          name: 'Kit Saliva / Frotis Bucal + Genotipado Celíaco Completo',
          dosage: '1 Determinación Genómica',
          price: 165,
          currency: 'EUR',
          supplierId: 'supplier-teletest',
          supplierName: 'TeleTest Analytika S.A.',
          stock: 99,
          available: true
        }
      ],
      updatedAt: new Date().toISOString()
    },

    // 2. HLA & Autoimmunity
    {
      id: 'teletest-gnt-hla-autoinmunidad',
      slug: 'teletest-gnt-hla-autoinmunidad',
      name: 'GNT. HLA y Autoinmunidad (Panel Completo Inmunogenético)',
      displayName: 'GNT. HLA & Autoimmunity Complete Immunogenetic Panel',
      canonicalName: 'GNT. HLA Y AUTOINMUNIDAD',
      originalLaboratoryName: 'GNT. HLA Y AUTOINMUNIDAD',
      testCode: '18267615',
      brand: 'TeleTest Analytika',
      supplierId: 'supplier-teletest',
      supplierName: 'TeleTest Analytika S.A.',
      supplier: 'TeleTest Analytika',
      category: 'diagnostic',
      categoryId: 'diagnostic',
      subCategory: 'genomics_autoimmunity',
      primaryType: 'diagnostic',
      availableTypes: ['diagnostic'],
      sampleType: 'Sangre Periférica (Whole Blood)',
      methodology: 'qPCR & Genotipado de Alta Resolución HLA',
      turnaroundDays: 7,
      status: 'published',
      currency: 'EUR',
      basePrice: 295,
      pricing: {
        retailPrice: { base: 295 },
        clinicPrice: { base: 245 },
        wholesalePrice: { base: 215 },
        masterPrice: { base: 180 }
      },
      cloudStoragePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
      pdfUrl: '/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
      cloudStorageDownloadUrl: uploadedUrls.hla_analytical,
      analyticalReportUrl: uploadedUrls.hla_analytical,
      assessmentReportUrl: uploadedUrls.hla_assessment,
      shortDescription: 'Tipificación alélica de HLA Clase I y Clase II junto a evaluación de asociaciones genéticas con 16 patologías autoinmunes.',
      description: 'Estudio inmunogenético de alta resolución que analiza antígenos leucocitarios humanos (HLA). Evalúa Clase I (A, B, C) y Clase II (DPA1, DPB1, DQA1, DQB1, DRB1, DRB3, DRB4, DRB5). Incluye informe analítico y reporte de valoración médica estructurada con riesgos relativos para tiroiditis de Hashimoto, celiaquía, artritis reumatoide, lupus, esclerosis múltiple y otras 11 afecciones.',
      biomarkers: [
        'HLA-A', 'HLA-B', 'HLA-C',
        'HLA-DPA1', 'HLA-DPB1', 'HLA-DQA1', 'HLA-DQB1', 'HLA-DRB1', 'HLA-DRB3', 'HLA-DRB4', 'HLA-DRB5',
        'HLA-DQ8', 'HLA-DQ2.2', 'HLA-DQ2.5', 'HLA-DQ7.5', 'HLA-DQX.2', 'HLA-DQX.5'
      ],
      diseaseAssociationsEvaluated: [
        'Celiac Disease', "Hashimoto's Thyroiditis", "Graves' Disease", 'Rheumatoid Arthritis',
        'Systemic Lupus Erythematosus', 'Multiple Sclerosis', 'Alopecia Areata', "Crohn's Disease",
        'Ulcerative Colitis', 'Type 1 Diabetes', 'Psoriasis', 'Vitiligo', "Sjogren's Syndrome",
        'Ankylosing Spondylitis', 'IgA Nephropathy', 'Idiopathic Membranous Nephropathy'
      ],
      clinicalGuardrails: {
        findingType: 'genetic_association',
        isConfirmedDiagnosis: false,
        clinicalDisclaimer: 'Las asociaciones genéticas indican susceptibilidad estadística y riesgo relativo. No deben representarse como diagnóstico patológico confirmado.'
      },
      variants: [
        {
          id: 'teletest-gnt-hla-single',
          sku: 'TT-GNT-HLA-01',
          name: 'Kit Extracción Sanguínea + Tipificación Completa HLA',
          dosage: '1 Informe Analítico + 1 Informe Valoración',
          price: 295,
          currency: 'EUR',
          supplierId: 'supplier-teletest',
          supplierName: 'TeleTest Analytika S.A.',
          stock: 99,
          available: true
        }
      ],
      updatedAt: new Date().toISOString()
    },

    // 3. Hair Mineral Analysis (HTMA) - CONSOLIDATED
    {
      id: 'teletest-mineralograma-cabello-htma',
      slug: 'teletest-mineralograma-cabello-htma',
      name: 'Mineralograma en Cabello (HTMA) - 33 Metales, Minerales & Ratios Metabólicos',
      displayName: 'Hair Tissue Mineral Analysis (HTMA) - 33 Elements & Metabolic Ratios',
      canonicalName: 'MINERALOGRAMA EN CABELLO',
      originalLaboratoryName: 'MINERALOGRAMA EN CABELLO',
      testCode: '18267691',
      brand: 'TeleTest Analytika',
      supplierId: 'supplier-teletest',
      supplierName: 'TeleTest Analytika S.A.',
      supplier: 'TeleTest Analytika',
      category: 'diagnostic',
      categoryId: 'diagnostic',
      subCategory: 'toxicology_trace_elements',
      primaryType: 'diagnostic',
      availableTypes: ['diagnostic'],
      sampleType: 'Cabello (Hair Mineral Composition)',
      methodology: 'ICP-MS/MS (Espectrometría de Masas de Triple Cuadrupolo con Plasma de Acoplamiento Inductivo)',
      turnaroundDays: 10,
      status: 'published',
      currency: 'EUR',
      basePrice: 195,
      pricing: {
        retailPrice: { base: 195 },
        clinicPrice: { base: 165 },
        wholesalePrice: { base: 145 },
        masterPrice: { base: 120 }
      },
      cloudStoragePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
      pdfUrl: '/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
      cloudStorageDownloadUrl: uploadedUrls.htma_analytical,
      analyticalReportUrl: uploadedUrls.htma_analytical,
      assessmentReportUrl: uploadedUrls.htma_assessment,
      shortDescription: 'Cuantificación por ICP-MS/MS de 21 minerales esenciales, 12 metales pesados y 10 ratios metabólicos en cabello.',
      description: 'El análisis de metales y minerales en cabello refleja la acumulación y balance tisular de los últimos 2-3 meses. Mide con precisión de partes por millón (ppm / µg/g) 21 minerales nutricionales, 12 elementos tóxicos/ambientales (incluyendo plomo, mercurio, arsénico y cadmio) y 10 ratios matemáticos que evalúan eje adrenal, función tiroidea y estrés oxidativo. Incluye informe analítico y reporte de valoración funcional con patrones de fatiga, nutrición, salud ósea, neurobiología y detoxificación.',
      biomarkers: [
        'Na', 'K', 'Ca', 'Sr', 'P', 'B', 'Mg', 'Fe', 'Cu', 'Zn', 'Co', 'Mn', 'Mo', 'I', 'S', 'Se', 'Si', 'V', 'Cr', 'Ge', 'Li',
        'Be', 'Al', 'Ti', 'Ni', 'Ag', 'Sn', 'Sb', 'Ba', 'Gd', 'W', 'Pt', 'Au', 'Bi',
        'As', 'Cd', 'Hg', 'Tl', 'Pb', 'U',
        'Ca/Mg (Adrenal/Insulina)', 'Ca/K (Tiroides)', 'Ca/P', 'Ca/Na', 'Ca/Fe', 'Ca/Zn', 'Na/K (Estrés Celular)', 'Na/Mg', 'Zn/Cu', 'Fe/Cu'
      ],
      functionalPatternsEvaluated: [
        'Fatigue Pattern', 'Nutrition Pattern', 'Bone Health Pattern', 'Neurobiology Pattern', 'Detoxification Pattern'
      ],
      clinicalGuardrails: {
        findingType: 'tissue_mineral_accumulation',
        isAcuteToxicityConfirmed: false,
        clinicalDisclaimer: 'Las concentraciones tisulares en cabello reflejan la bioacumulación intracelular de 2 a 3 meses y no deben interpretarse como deficiencia sérica aguda o intoxicación sistémica sin confirmación analítica en sangre/orina.'
      },
      variants: [
        {
          id: 'teletest-htma-single',
          sku: 'TT-HTMA-33-01',
          name: 'Kit Recogida de Cabello + Panel ICP-MS/MS 33 Elementos & Ratios',
          dosage: '1 Perfil Analítico Completo + Valoración',
          price: 195,
          currency: 'EUR',
          supplierId: 'supplier-teletest',
          supplierName: 'TeleTest Analytika S.A.',
          stock: 99,
          available: true
        }
      ],
      updatedAt: new Date().toISOString()
    },

    // 4. Omega Fatty Acid Profile
    {
      id: 'teletest-test-omega',
      slug: 'teletest-test-omega',
      name: 'Perfil Completo de Ácidos Grasos Omega & Balance Inflamatorio (Test Omega)',
      displayName: 'Comprehensive Omega Fatty Acid Profile & Inflammatory Balance (Test Omega)',
      canonicalName: 'TEST OMEGA',
      originalLaboratoryName: 'TEST OMEGA',
      testCode: '18267598',
      brand: 'TeleTest Analytika',
      supplierId: 'supplier-teletest',
      supplierName: 'TeleTest Analytika S.A.',
      supplier: 'TeleTest Analytika',
      category: 'diagnostic',
      categoryId: 'diagnostic',
      subCategory: 'metabolic_fatty_acids',
      primaryType: 'diagnostic',
      availableTypes: ['diagnostic'],
      sampleType: 'Sangre Periférica (Whole Blood)',
      methodology: 'Cromatografía de Gases / Espectrometría de Masas (GC-MS)',
      turnaroundDays: 7,
      status: 'published',
      currency: 'EUR',
      basePrice: 175,
      pricing: {
        retailPrice: { base: 175 },
        clinicPrice: { base: 145 },
        wholesalePrice: { base: 125 },
        masterPrice: { base: 105 }
      },
      cloudStoragePath: 'labs/teletest/original/TELETEST_Omega_Test_Demo_18267598.pdf',
      pdfUrl: '/docs/labs/teletest/TELETEST_Omega_Test_Demo_18267598.pdf',
      cloudStorageDownloadUrl: uploadedUrls.omega_analytical,
      analyticalReportUrl: uploadedUrls.omega_analytical,
      assessmentReportUrl: uploadedUrls.omega_assessment,
      shortDescription: 'Cuantificación de 24 ácidos grasos en sangre, índice HS Omega-3, ratio AA/EPA e índice de inflamación celular.',
      description: 'Estudio de alta precisión de ácidos grasos en eritrocitos y plasma. Mide las series Omega-3 (ALA, EPA, DHA, DPA w3), Omega-6 (LA, GLA, DGLA, AA, DPA w6), Omega-7, Omega-9, saturados, monoinsaturados, poliinsaturados y ácidos trans. Calcula los índices clínicos estandarizados HS Omega-3 Index (objetivo >8.0%), HS Trans Index (<1.0%), ratio AA/EPA (equilibrio eicosanoides) y ratio Omega-6/Omega-3. Acompañado de reporte de recomendaciones terapéuticas nutricionales.',
      biomarkers: [
        'ALA', 'EPA', 'DHA', 'DPA omega-3',
        'LA', 'GLA', 'DGLA', 'AA', 'DPA omega-6',
        'Palmitol', 'Oleic', 'Gondoic', 'Erucic', 'Nervonic', 'Myristic', 'Palmitic', 'Stearic', 'Arachidic', 'Behenic', 'Lignoceric',
        'HS Omega-3 Index', 'HS Trans Index', 'Ratio AA/EPA', 'Ratio Omega-6/Omega-3', 'Ratio LA/GLA'
      ],
      clinicalGuardrails: {
        findingType: 'lipidomic_quantitative',
        isAcuteCardiovascularDiagnosis: false,
        clinicalDisclaimer: 'El perfil de ácidos grasos orienta la modulación dietética y la suplementación lipídica; no constituye por sí solo diagnóstico de enfermedad cardiovascular.'
      },
      variants: [
        {
          id: 'teletest-omega-single',
          sku: 'TT-OMEGA-01',
          name: 'Kit de Extracción Sanguínea + Perfil Completo de Ácidos Grasos',
          dosage: '1 Perfil Lipídico Analítico + Valoración',
          price: 175,
          currency: 'EUR',
          supplierId: 'supplier-teletest',
          supplierName: 'TeleTest Analytika S.A.',
          stock: 99,
          available: true
        }
      ],
      updatedAt: new Date().toISOString()
    },

    // 5. Genetic Detoxification / Metabolizer Test
    {
      id: 'teletest-saliva-metabolizer-detox',
      slug: 'teletest-saliva-metabolizer-detox',
      name: 'Panel Genético de Detoxificación Hepática & Farmacogenética (Metabolizer Detox)',
      displayName: 'Hepatic Biotransformation & Pharmacogenetic Detoxification Panel (Metabolizer Detox)',
      canonicalName: 'GNT. SALIVA METABOLIZER DETOX',
      originalLaboratoryName: 'GNT. SALIVA METABOLIZER DETOX',
      testCode: '18264926',
      brand: 'TeleTest Analytika',
      supplierId: 'supplier-teletest',
      supplierName: 'TeleTest Analytika S.A.',
      supplier: 'TeleTest Analytika',
      category: 'diagnostic',
      categoryId: 'diagnostic',
      subCategory: 'pharmacogenetics_metabolism',
      primaryType: 'diagnostic',
      availableTypes: ['diagnostic'],
      sampleType: 'Saliva (Frotis Bucal)',
      methodology: 'Secuenciación de ADN / Genotipado de Polimorfismos de Alta Resolución (99% Sensibilidad)',
      turnaroundDays: 14,
      status: 'published',
      currency: 'EUR',
      basePrice: 345,
      pricing: {
        retailPrice: { base: 345 },
        clinicPrice: { base: 295 },
        wholesalePrice: { base: 260 },
        masterPrice: { base: 220 }
      },
      cloudStoragePath: 'labs/teletest/original/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf',
      pdfUrl: '/docs/labs/teletest/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf',
      cloudStorageDownloadUrl: uploadedUrls.detox_analytical,
      analyticalReportUrl: uploadedUrls.detox_analytical,
      shortDescription: 'Panel genómico de 16 páginas evaluando enzimas de Fase I (CYP450), Fase II (conjugación), transportadores y estrés oxidativo.',
      description: 'Análisis farmacogenético exhaustivo de la capacidad intrínseca de biotransformación hepática. Examina 16 enzimas citocromo P450 de Fase I (CYP1A1, 1A2, 1B1, 2C9, 2C19, 2D6, 3A4, entre otras), vías de Fase II (metilación MTHFR/MTR, acetilación NAT1/NAT2, glucuronidación UGTs, sulfatación SULTs, glutationización GSTM1/GSTP1), enzimas antioxidantes (SOD1, SOD2, GPX1, CAT, NQO1) y transportadores de eflujo (ABCC2, SLCO1B1, CFTR). Asigna fenotipos de metabolizador (Normal, Intermedio, Lento, Rápido) para guiar la dosificación farmacológica y soporte hepático.',
      biomarkers: [
        'CYP1A1', 'CYP1A2', 'CYP1B1', 'CYP2A6', 'CYP2B6', 'CYP2C8', 'CYP2C9', 'CYP2C19', 'CYP2D6', 'CYP3A4', 'CYP3A5', 'CYP3A7', 'CYP4B1', 'CYP4F2', 'CYP19A1', 'CYP8A1',
        'NAT1', 'NAT2', 'UGT1A1', 'UGT1A6', 'UGT1A9', 'UGT2B7', 'UGT2B15', 'GSTM1', 'GSTP1', 'GSTT1', 'SULT1A1', 'SULT1A2', 'COMT', 'MTHFR', 'MTR', 'MTRR', 'CBS',
        'SOD1', 'SOD2', 'GPX1', 'CAT', 'NQO1', 'CFTR', 'MTRNR1', 'SLC15A2', 'SLCO1B1', 'SLCO2B1', 'ABCC2'
      ],
      clinicalGuardrails: {
        findingType: 'pharmacogenetic_metabolic_phenotype',
        isPhysiologicalLiverImpairment: false,
        clinicalDisclaimer: 'Los polimorfismos evaluados determinan la velocidad enzimática de biotransformación y metabolización de xenobióticos. No indican insuficiencia hepática ni lesión celular activa.'
      },
      variants: [
        {
          id: 'teletest-detox-single',
          sku: 'TT-DETOX-GNT-01',
          name: 'Kit de Saliva + Informe Completo de Biotransformación y Farmacogenética (16 Páginas)',
          dosage: '1 Informe Integral Fase I / II / Transportadores',
          price: 345,
          currency: 'EUR',
          supplierId: 'supplier-teletest',
          supplierName: 'TeleTest Analytika S.A.',
          stock: 99,
          available: true
        }
      ],
      updatedAt: new Date().toISOString()
    }
  ];

  for (const prod of CANONICAL_PRODUCTS) {
    await db.collection('products').doc(prod.id).set(prod, { merge: true });
    console.log(`   ✅ Upserted [${prod.id}] ${prod.name}`);
  }

  // ── Step 5: Ingest 5 Structured Test Fixtures in `lab_results` ──────────────
  console.log('\n📊 Ingesting 5 Structured TeleTest Laboratory Reports into `lab_results` (DEMO data)...');

  const DEMO_PATIENT = {
    id: 'demo-patient-teletest',
    name: 'Demostración TeleTest',
    fullName: 'Paciente Demostración TeleTest S.A.',
    dob: '1985-05-15',
    gender: 'Female',
    age: 41
  };

  const DEMO_DOCTOR = {
    id: 'demo-doctor-teletest',
    name: 'Dr. Atlas Clinical Supervisor',
    title: 'Clinical Intelligence Director',
    clinicName: 'Atlas Reference Clinic'
  };

  const LAB_RESULTS_FIXTURES = [
    // 1. Celiac
    {
      id: 'LAB-TELETEST-18267609-DEMO',
      code: '18267609',
      sampleCode: '18267609v3',
      testCode: '18267609',
      productId: 'teletest-celiac-gluten-hla',
      testName: 'Estudio Genético de Intolerancia al Gluten & Enfermedad Celíaca',
      originalLaboratoryName: 'GNT. CELIAQUIA',
      laboratory: 'TeleTest Analytika S.A.',
      supplierId: 'supplier-teletest',
      isDemoData: true,
      category: 'genomics',
      sampleType: 'Saliva',
      receivedDate: '2026-10-01',
      validationDate: '2026-10-02',
      status: 'reviewed',
      patient: DEMO_PATIENT,
      doctor: DEMO_DOCTOR,
      patientName: DEMO_PATIENT.name,
      patientId: DEMO_PATIENT.id,
      doctorId: DEMO_DOCTOR.id,
      doctorName: DEMO_DOCTOR.name,
      pdfUrl: uploadedUrls.celiac_analytical,
      analyticalReportUrl: uploadedUrls.celiac_analytical,
      results: {
        findingType: 'genetic_susceptibility',
        hlaMarkers: {
          'HLA-DQ2.5': { detected: true, riskProfile: 'High Susceptibility' },
          'HLA-DQ2.2': { detected: false },
          'HLA-DQ8': { detected: false },
          'HLA-DQ7.5': { detected: false },
          'HLA-DQX.2': { detected: false },
          'HLA-DQX.5': { detected: false }
        },
        alleles: {
          'DQA1': '*05:01',
          'DQB1': '*02:01'
        },
        overallSusceptibility: 'High Genetic Susceptibility for Celiac Disease',
        riskPercentage: 'Elevated relative risk (~1:30 vs 1:100 in general population)',
        isConfirmedDiagnosis: false,
        clinicalComment: 'Presencia de heterodímero HLA-DQ2.5 en heterocigosis. Confiere predisposición genética necesaria pero no suficiente para el desarrollo de la enfermedad celíaca. No suspender gluten sin confirmación serológica / biopsia.'
      },
      updatedAt: new Date().toISOString()
    },

    // 2. HLA Autoimmunity
    {
      id: 'LAB-TELETEST-18267615-DEMO',
      code: '18267615',
      sampleCode: '18267615v3',
      testCode: '18267615',
      productId: 'teletest-gnt-hla-autoinmunidad',
      testName: 'GNT. HLA y Autoinmunidad (Panel Completo Inmunogenético)',
      originalLaboratoryName: 'GNT. HLA Y AUTOINMUNIDAD',
      laboratory: 'TeleTest Analytika S.A.',
      supplierId: 'supplier-teletest',
      isDemoData: true,
      category: 'genomics',
      sampleType: 'Sangre Periférica',
      receivedDate: '2026-10-01',
      validationDate: '2026-10-02',
      status: 'reviewed',
      patient: DEMO_PATIENT,
      doctor: DEMO_DOCTOR,
      patientName: DEMO_PATIENT.name,
      patientId: DEMO_PATIENT.id,
      doctorId: DEMO_DOCTOR.id,
      doctorName: DEMO_DOCTOR.name,
      pdfUrl: uploadedUrls.hla_analytical,
      analyticalReportUrl: uploadedUrls.hla_analytical,
      assessmentReportUrl: uploadedUrls.hla_assessment,
      results: {
        findingType: 'genetic_association',
        hlaClassI: {
          'HLA-A': '*02, *24',
          'HLA-B': '*08, *51',
          'HLA-C': '*07, *14'
        },
        hlaClassII: {
          'HLA-DRB1': '*03:01, *04:01',
          'HLA-DQA1': '*05:01, *03:01',
          'HLA-DQB1': '*02:01, *03:02'
        },
        diseaseAssociations: [
          { disease: 'Celiac Disease', riskLevel: 'High', oddsRatio: 8.5 },
          { disease: "Hashimoto's Thyroiditis", riskLevel: 'Moderate', oddsRatio: 3.2 },
          { disease: 'Rheumatoid Arthritis', riskLevel: 'Moderate', oddsRatio: 2.8 },
          { disease: 'Type 1 Diabetes', riskLevel: 'High', oddsRatio: 9.1 },
          { disease: 'Ankylosing Spondylitis', riskLevel: 'Low', oddsRatio: 1.0 }
        ],
        isConfirmedDiagnosis: false,
        clinicalComment: 'Patrón inmunogenético de susceptibilidad compartida para síndrome poliendocrino autoinmune y celiaquía. Requiere monitorización clínica de anticuerpos TPO y TG.'
      },
      updatedAt: new Date().toISOString()
    },

    // 3. Hair Mineral HTMA
    {
      id: 'LAB-TELETEST-18267691-DEMO',
      code: '18267691',
      sampleCode: '18267691v1',
      testCode: '18267691',
      productId: 'teletest-mineralograma-cabello-htma',
      testName: 'Mineralograma en Cabello (HTMA) - 33 Metales & Ratios Metabólicos',
      originalLaboratoryName: 'MINERALOGRAMA EN CABELLO',
      laboratory: 'TeleTest Analytika S.A.',
      supplierId: 'supplier-teletest',
      isDemoData: true,
      category: 'toxicology',
      sampleType: 'Cabello',
      methodology: 'ICP-MS/MS',
      receivedDate: '2026-10-02',
      validationDate: '2026-10-02',
      status: 'reviewed',
      patient: DEMO_PATIENT,
      doctor: DEMO_DOCTOR,
      patientName: DEMO_PATIENT.name,
      patientId: DEMO_PATIENT.id,
      doctorId: DEMO_DOCTOR.id,
      doctorName: DEMO_DOCTOR.name,
      pdfUrl: uploadedUrls.htma_analytical,
      analyticalReportUrl: uploadedUrls.htma_analytical,
      assessmentReportUrl: uploadedUrls.htma_assessment,
      results: {
        findingType: 'tissue_mineral_accumulation',
        method: 'ICP-MS/MS',
        unit: 'µg/g (ppm)',
        essentialMinerals: {
          'Na': { value: 850.4, unit: 'µg/g', refMin: 20.0, refMax: 350.0, status: 'HIGH' },
          'K': { value: 33.8, unit: 'µg/g', refMin: 25.0, refMax: 350.0, status: 'NORMAL' },
          'Ca': { value: 872.0, unit: 'µg/g', refMin: 125.0, refMax: 750.0, status: 'HIGH' },
          'Mg': { value: 93.0, unit: 'µg/g', refMin: 12.0, refMax: 75.0, status: 'HIGH' },
          'P': { value: 163.5, unit: 'µg/g', refMin: 80.0, refMax: 160.0, status: 'HIGH' },
          'Fe': { value: 10.7, unit: 'µg/g', refMin: 7.0, refMax: 18.0, status: 'NORMAL' },
          'Cu': { value: 14.8, unit: 'µg/g', refMin: 10.0, refMax: 30.0, status: 'NORMAL' },
          'Zn': { value: 185.0, unit: 'µg/g', refMin: 130.0, refMax: 220.0, status: 'NORMAL' }
        },
        toxicMetals: {
          'Pb': { value: 0.85, unit: 'µg/g', refMax: 2.0, status: 'NORMAL' },
          'Hg': { value: 0.42, unit: 'µg/g', refMax: 1.0, status: 'NORMAL' },
          'Cd': { value: 0.04, unit: 'µg/g', refMax: 0.1, status: 'NORMAL' },
          'As': { value: 0.08, unit: 'µg/g', refMax: 0.2, status: 'NORMAL' }
        },
        metabolicRatios: {
          'Ca/Mg': { value: 9.38, refRange: '4.0 - 8.0', status: 'ELEVATED', physiologicalAxis: 'Adrenal / Insulin regulation' },
          'Ca/K': { value: 25.8, refRange: '4.0 - 10.0', status: 'ELEVATED', physiologicalAxis: 'Thyroid ratio (Slow metabolizer)' },
          'Na/K': { value: 25.16, refRange: '2.0 - 5.0', status: 'ELEVATED', physiologicalAxis: 'Cellular stress / Adrenal ratio' },
          'Zn/Cu': { value: 12.5, refRange: '6.0 - 10.0', status: 'ELEVATED', physiologicalAxis: 'Neurotransmitter balance' }
        },
        functionalAssessment: {
          fatigue: 'Not suggested',
          nutrition: 'Balanced',
          boneHealth: 'Unbalanced (Altered calcium distribution)',
          neurobiology: 'Altered (Stress symptom correlation)',
          detoxification: 'Altered (Moderate environmental burden)'
        },
        isAcuteToxicityConfirmed: false,
        clinicalComment: 'Mineralograma indicativo de patrón metabolizador lento con sobreactivación del eje adrenal por estrés. No se observan intoxicaciones agudas por metales pesados.'
      },
      updatedAt: new Date().toISOString()
    },

    // 4. Omega Fatty Acids
    {
      id: 'LAB-TELETEST-18267598-DEMO',
      code: '18267598',
      sampleCode: '18267598v1',
      testCode: '18267598',
      productId: 'teletest-test-omega',
      testName: 'Perfil de Ácidos Grasos Omega & Balance Inflamatorio (Test Omega)',
      originalLaboratoryName: 'TEST OMEGA',
      laboratory: 'TeleTest Analytika S.A.',
      supplierId: 'supplier-teletest',
      isDemoData: true,
      category: 'metabolic',
      sampleType: 'Sangre Periférica',
      methodology: 'GC-MS',
      receivedDate: '2026-10-01',
      validationDate: '2026-10-01',
      status: 'reviewed',
      patient: DEMO_PATIENT,
      doctor: DEMO_DOCTOR,
      patientName: DEMO_PATIENT.name,
      patientId: DEMO_PATIENT.id,
      doctorId: DEMO_DOCTOR.id,
      doctorName: DEMO_DOCTOR.name,
      pdfUrl: uploadedUrls.omega_analytical,
      analyticalReportUrl: uploadedUrls.omega_analytical,
      assessmentReportUrl: uploadedUrls.omega_assessment,
      results: {
        findingType: 'lipidomic_quantitative',
        indices: {
          'HS Omega-3 Index': { value: 6.57, unit: '%', target: '> 8.0%', status: 'SUBOPTIMAL' },
          'HS Trans Index': { value: 0.35, unit: '%', target: '< 1.0%', status: 'OPTIMAL' },
          'Ratio AA/EPA': { value: 14.2, unit: 'ratio', target: '< 3.0', status: 'PRO-INFLAMMATORY' },
          'Ratio Omega-6/Omega-3': { value: 6.8, unit: 'ratio', target: '< 4.0', status: 'ELEVATED' }
        },
        fattyAcidsPercentages: {
          'EPA': { value: 0.95, unit: '%' },
          'DHA': { value: 4.85, unit: '%' },
          'ALA': { value: 0.38, unit: '%' },
          'AA': { value: 13.5, unit: '%' },
          'LA': { value: 24.1, unit: '%' }
        },
        isConfirmedDiagnosis: false,
        clinicalComment: 'Índice Omega-3 subóptimo (6.57%) con ratio AA/EPA marcadamente elevado (14.2), favoreciendo eicosanoides proinflamatorios de serie 2 y 4. Se recomienda suplementación específica con EPA/DHA de grado farmacéutico.'
      },
      updatedAt: new Date().toISOString()
    },

    // 5. Metabolizer Detox
    {
      id: 'LAB-TELETEST-18264926-DEMO',
      code: '18264926',
      sampleCode: '18264926v3',
      testCode: '18264926',
      productId: 'teletest-saliva-metabolizer-detox',
      testName: 'Panel Genético de Detoxificación Hepática & Farmacogenética',
      originalLaboratoryName: 'GNT. SALIVA METABOLIZER DETOX',
      laboratory: 'TeleTest Analytika S.A.',
      supplierId: 'supplier-teletest',
      isDemoData: true,
      category: 'genomics',
      sampleType: 'Saliva',
      methodology: 'Secuenciación de ADN',
      receivedDate: '2026-06-30',
      validationDate: '2026-06-30',
      status: 'reviewed',
      patient: DEMO_PATIENT,
      doctor: DEMO_DOCTOR,
      patientName: DEMO_PATIENT.name,
      patientId: DEMO_PATIENT.id,
      doctorId: DEMO_DOCTOR.id,
      doctorName: DEMO_DOCTOR.name,
      pdfUrl: uploadedUrls.detox_analytical,
      analyticalReportUrl: uploadedUrls.detox_analytical,
      results: {
        findingType: 'pharmacogenetic_metabolic_phenotype',
        phaseICytochromeP450: {
          'CYP1A1': { genotype: '*1/*2C', phenotype: 'Normal Metabolizer' },
          'CYP1A2': { genotype: '*1F/*1F', phenotype: 'Normal Metabolizer' },
          'CYP1B1': { genotype: '*1/*4', phenotype: 'Intermediate Metabolizer' },
          'CYP2C19': { genotype: '*1/*17', phenotype: 'Rapid Metabolizer' },
          'CYP2D6': { genotype: '*1/*4', phenotype: 'Intermediate Metabolizer' },
          'CYP3A4': { genotype: '*1/*1', phenotype: 'Normal Metabolizer' }
        },
        phaseIIBiotransformation: {
          'MTHFR rs1801131': { genotype: 'T/G', phenotype: 'Intermediate (Decreased)' },
          'MTHFR rs1801133': { genotype: 'A/G', phenotype: 'Very Decreased (Heterozygous)' },
          'COMT rs4680': { genotype: 'G/A', phenotype: 'Intermediate' },
          'GSTM1': { genotype: 'Present', phenotype: 'Normal' },
          'GSTP1': { genotype: 'Ile/Val', phenotype: 'Intermediate' }
        },
        transporters: {
          'SLC15A2': { genotype: '*1/*2', phenotype: 'Altered Transport' },
          'SLCO1B1': { genotype: '*1A/*1A', phenotype: 'Normal Transport' }
        },
        isPhysiologicalLiverImpairment: false,
        clinicalComment: 'Metabolizador intermedio en CYP2D6 y CYP1B1 con polimorfismos en MTHFR C677T y A1298C. Indica necesidad de soporte de metilación con 5-MTHF y ajuste en fármacos metabolizados por CYP2D6.'
      },
      updatedAt: new Date().toISOString()
    }
  ];

  for (const lab of LAB_RESULTS_FIXTURES) {
    await db.collection('lab_results').doc(lab.id).set(lab, { merge: true });
    console.log(`   ✅ Ingested [${lab.id}] ${lab.testName}`);
  }

  console.log('\n🎉 [TeleTest Remediation] Completed all phases successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error during remediation:', err);
  process.exit(1);
});
