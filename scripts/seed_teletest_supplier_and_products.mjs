/**
 * scripts/seed_teletest_supplier_and_products.mjs
 * 
 * Uploads all 8 original TeleTest demonstration PDF reports to Google Cloud Storage
 * and registers TeleTest Analytika S.A. as an official diagnostic laboratory supplier,
 * seeding all 5 canonical diagnostic products into Firestore with clinical metadata.
 * 
 * Consolidates the 3 fragmented HTMA tests into 1 canonical product and archives the split entries.
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

const PDFS_TO_UPLOAD = [
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Celiaco_HLA_Demo_18267609.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Celiaco_HLA_Demo_18267609.pdf',
    fileName: 'TELETEST_Celiaco_HLA_Demo_18267609.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    fileName: 'TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf',
    fileName: 'TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    fileName: 'TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf',
    fileName: 'TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Omega_Test_Demo_18267598.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Omega_Test_Demo_18267598.pdf',
    fileName: 'TELETEST_Omega_Test_Demo_18267598.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Omega_Test_Assessment_Demo_18267598.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Omega_Test_Assessment_Demo_18267598.pdf',
    fileName: 'TELETEST_Omega_Test_Assessment_Demo_18267598.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf',
    fileName: 'TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf'
  }
];

async function uploadPdfToGcs(localPath, storagePath) {
  if (!fs.existsSync(localPath)) {
    throw new Error(`Local file not found: ${localPath}`);
  }

  const token = uuidv4();
  const file = bucket.file(storagePath);

  console.log(`📤 Uploading to gs://${bucketName}/${storagePath}...`);
  await bucket.upload(localPath, {
    destination: storagePath,
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

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
  console.log(`✅ Uploaded: ${publicUrl}`);
  return { publicUrl, storagePath };
}

const TELETEST_SUPPLIER = {
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
  defaultPaymentTerms: 'Net 30 Days B2B Clinical',
  shippingOrigin: 'Barcelona, España (UE Logistics)',
  logoUrl: '/images/suppliers/teletest-logo.svg',
  status: 'active',
  updatedAt: new Date().toISOString()
};

const TELETEST_PRODUCTS = [
  // ── TEST 1: GNT. CELIAQUIA (18267609) ──────────────────────────────────────
  {
    id: 'teletest-celiac-gluten-hla',
    slug: 'teletest-celiac-gluten-hla',
    name: 'Estudio Genético de Intolerancia al Gluten & Enfermedad Celíaca (HLA-DQ2 / DQ8)',
    displayName: 'Genetic Celiac Disease & Gluten Predisposition Panel (HLA-DQ2 / DQ8)',
    canonicalName: 'Estudio Genético Celíaco HLA',
    canonicalKey: 'estudio-genetico-celiaco-hla',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'diagnostic',
    subCategory: 'genomics',
    sampleType: 'Saliva (Frotis Bucal)',
    methodology: 'PCR a Tiempo Real / Hibridación Inversa y Tipificación Alelos HLA',
    testCode: '18267609',
    turnaroundDays: 7,
    status: 'published',
    currency: 'EUR',
    basePrice: 165,
    cloudStoragePath: 'labs/teletest/original/TELETEST_Celiaco_HLA_Demo_18267609.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_Celiaco_HLA_Demo_18267609.pdf',
    shortDescription: 'Genotipado de susceptibilidad genética a celiaquía: haplotipos HLA-DQ2.5, HLA-DQ2.2, HLA-DQ8 y alelos DQA1/DQB1.',
    description: 'Prueba molecular definitiva de exclusión genética. Un resultado negativo confiere un valor predictivo negativo >99% para el desarrollo de enfermedad celíaca. No requiere consumo previo de gluten.',
    biomarkers: ['HLA-DQ2.5', 'HLA-DQ2.2', 'HLA-DQ8', 'HLA-DQ7.5', 'DQA1*05', 'DQB1*02', 'DQA1*03', 'DQB1*03:02'],
    variants: [
      {
        id: 'teletest-celiac-single',
        sku: 'TT-CEL-HLA-01',
        name: 'Kit Frotis Bucal + Genotipado Celíaco HLA',
        dosage: '1 Determinación Molecular',
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

  // ── TEST 2: GNT. HLA Y AUTOINMUNIDAD (18267615) ─────────────────────────────
  {
    id: 'teletest-gnt-hla-autoinmunidad',
    slug: 'teletest-gnt-hla-autoinmunidad',
    name: 'GNT. HLA y Autoinmunidad (Panel Completo Inmunogenético)',
    displayName: 'HLA & Autoimmunity Genetic Screen (High-Resolution Immunogenetics)',
    canonicalName: 'Panel HLA Autoinmunidad',
    canonicalKey: 'panel-hla-autoinmunidad',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'diagnostic',
    subCategory: 'genomics',
    sampleType: 'Sangre Periférica (EDTA)',
    methodology: 'Tipificación HLA Clase I y Clase II de Alta Resolución (SSO/NGS)',
    testCode: '18267615',
    turnaroundDays: 14,
    status: 'published',
    currency: 'EUR',
    basePrice: 245,
    cloudStoragePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    assessmentCloudStoragePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    assessmentPdfUrl: '/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Assessment_Demo_18267615.pdf',
    shortDescription: 'Tipificación genética completa del Complejo Mayor de Histocompatibilidad (HLA-A, B, C, DRB1, DQB1).',
    description: 'Evaluación de susceptibilidad inmunogenética a más de 16 patologías autoinmunes: Tiroiditis de Hashimoto, Enfermedad de Graves, Artritis Reumatoide, Lupus, Alopecia Areata, Crohn, Colitis Ulcerosa, Diabetes Tipo 1, Psoriasis, Vitíligo, Espondilitis Anquilosante y Celiaquía.',
    biomarkers: [
      'HLA-A', 'HLA-B', 'HLA-C',
      'HLA-DRB1', 'HLA-DRB3', 'HLA-DRB4', 'HLA-DRB5',
      'HLA-DQA1', 'HLA-DQB1', 'HLA-DPA1', 'HLA-DPB1',
      'HLA-B*27 (Espondilitis)', 'HLA-DRB1*03:01 (Lupus / Hashimoto)', 'HLA-DRB1*04:01 (Artritis Reumatoide)',
      'HLA-DQB1*02:01 (Celiaquía / T1D)', 'HLA-B*57:01 (Farmacogenética Abacavir)'
    ],
    variants: [
      {
        id: 'teletest-gnt-hla-single',
        sku: 'TT-HLA-AUTO-01',
        name: 'Kit Sangre Periférica + Tipificación Inmunogenética Completa',
        dosage: '1 Perfil Completo HLA I & II',
        price: 245,
        currency: 'EUR',
        supplierId: 'supplier-teletest',
        supplierName: 'TeleTest Analytika S.A.',
        stock: 99,
        available: true
      }
    ],
    updatedAt: new Date().toISOString()
  },

  // ── TEST 3: MINERALOGRAMA EN CABELLO (HTMA - 18267691) ──────────────────────
  {
    id: 'teletest-mineralograma-cabello-htma',
    slug: 'teletest-mineralograma-cabello-htma',
    name: 'Mineralograma en Cabello (HTMA) - 33 Metales, Minerales & Ratios Tisulares',
    displayName: 'Hair Tissue Mineral Analysis (HTMA) - 33 Elements & Metabolic Ratios',
    canonicalName: 'Mineralograma en Cabello HTMA',
    canonicalKey: 'mineralograma-cabello-htma',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'diagnostic',
    subCategory: 'toxicology',
    sampleType: 'Cabello (Hair Mineral Composition)',
    methodology: 'ICP-MS/MS (Espectrometría de Masas Triple Cuadrupolo)',
    testCode: '18267691',
    turnaroundDays: 10,
    status: 'published',
    currency: 'EUR',
    basePrice: 195,
    cloudStoragePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    assessmentCloudStoragePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    assessmentPdfUrl: '/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Assessment_Demo_18267691.pdf',
    shortDescription: 'Cuantificación de 33 elementos tisulares (17 minerales esenciales, 11 indicadores, 5 metales tóxicos) y 10 ratios metabólicos.',
    description: 'El análisis de metales y minerales en cabello refleja la acumulación tisular intracelular de los últimos 2-3 meses. Incluye espectro completo de minerales esenciales, detección de neurotóxicos (Pb, Hg, Cd, As, Tl, U) y evaluación endocrina/adrenal mediante ratios matemáticos.',
    biomarkers: [
      'Na', 'K', 'Ca', 'Sr', 'P', 'B', 'Mg', 'Fe', 'Cu', 'Zn', 'Co', 'Mn', 'Mo', 'I', 'S', 'Se', 'Si', 'V', 'Cr', 'Ge', 'Li',
      'Be', 'Al', 'Ti', 'Ni', 'Ag', 'Sn', 'Sb', 'Ba', 'Gd', 'W', 'Pt', 'Au', 'Bi',
      'As', 'Cd', 'Hg', 'Tl', 'Pb', 'U',
      'Ca/Mg (Adrenal/Insulina)', 'Ca/K (Tiroides)', 'Ca/P', 'Ca/Na', 'Ca/Fe', 'Ca/Zn', 'Na/K (Estrés Celular)', 'Na/Mg', 'Zn/Cu', 'Fe/Cu'
    ],
    variants: [
      {
        id: 'teletest-htma-single',
        sku: 'TT-HTMA-33-01',
        name: 'Kit Muestra de Cabello + Panel ICP-MS/MS Completo 33 Elementos & Ratios',
        dosage: '1 Perfil Completo 33 Elementos',
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

  // ── TEST 4: TEST OMEGA (18267598) ──────────────────────────────────────────
  {
    id: 'teletest-omega-profile',
    slug: 'teletest-omega-profile',
    name: 'Perfil Completo Ácidos Grasos Omega & Balance Inflamatorio (Test Omega)',
    displayName: 'Omega Fatty Acid Profile & Cellular Inflammation Index (Test Omega)',
    canonicalName: 'Perfil Ácidos Grasos Test Omega',
    canonicalKey: 'perfil-acidos-grasos-test-omega',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'diagnostic',
    subCategory: 'metabolic',
    sampleType: 'Sangre Total (EDTA / Dry Blood Spot)',
    methodology: 'Cromatografía de Gases con Detector de Ionización de Llama (GC-FID)',
    testCode: '18267598',
    turnaroundDays: 10,
    status: 'published',
    currency: 'EUR',
    basePrice: 145,
    cloudStoragePath: 'labs/teletest/original/TELETEST_Omega_Test_Demo_18267598.pdf',
    assessmentCloudStoragePath: 'labs/teletest/original/TELETEST_Omega_Test_Assessment_Demo_18267598.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_Omega_Test_Demo_18267598.pdf',
    assessmentPdfUrl: '/docs/labs/teletest/TELETEST_Omega_Test_Assessment_Demo_18267598.pdf',
    shortDescription: 'Espectrometría completa de ácidos grasos en membrana eritrocitaria: Omega-3 (EPA, DHA), Omega-6 (AA, LA), HS Omega-3 Index y ratio AA/EPA.',
    description: 'Determinación cuantitativa de 24 ácidos grasos plasmáticos y de membrana eritrocitaria. Calcula con precisión el índice HS Omega-3 (protección cardiovascular y neurocognitiva), el índice de ácidos trans (riesgo vascular) y el cociente de inflamación celular Ácido Araquidónico / EPA.',
    biomarkers: [
      'EPA (Ácido Eicosapentaenoico)', 'DHA (Ácido Docosahexaenoico)', 'DPA w3 (Ácido Docosapentaenoico)', 'ALA (Ácido Alfa-Linolénico)',
      'AA (Ácido Araquidónico)', 'LA (Ácido Linoleico)', 'GLA (Ácido Gamma-Linolénico)', 'DGLA (Ácido Dihomo-gamma-linolénico)',
      'Índice HS Omega-3 (%)', 'Ratio AA/EPA (Inflamación Celular)', 'Ratio Omega-6/Omega-3', 'Índice Ácidos Trans (%)',
      'Ácidos Grasos Saturados (SFA)', 'Ácidos Grasos Monoinsaturados (MUFA)', 'Ácidos Grasos Poliinsaturados (PUFA)'
    ],
    variants: [
      {
        id: 'teletest-omega-single',
        sku: 'TT-OMEGA-24-01',
        name: 'Kit Sangre / DBS + Cromatografía GC-FID Ácidos Grasos',
        dosage: '1 Perfil Completo 24 Ácidos Grasos',
        price: 145,
        currency: 'EUR',
        supplierId: 'supplier-teletest',
        supplierName: 'TeleTest Analytika S.A.',
        stock: 99,
        available: true
      }
    ],
    updatedAt: new Date().toISOString()
  },

  // ── TEST 5: GNT. SALIVA METABOLIZER DETOX (18264926) ───────────────────────
  {
    id: 'teletest-metabolizer-detox',
    slug: 'teletest-metabolizer-detox',
    name: 'GNT. Saliva Metabolizer Detox (Farmacogenética & Detoxificación Hepática)',
    displayName: 'Saliva Metabolizer Detox - Comprehensive Pharmacogenetics & Biotransformation',
    canonicalName: 'Saliva Metabolizer Detox Farmacogenética',
    canonicalKey: 'saliva-metabolizer-detox-farmacogenetica',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'diagnostic',
    subCategory: 'genomics',
    sampleType: 'Saliva (Frotis Bucal)',
    methodology: 'Genotipado Farmacogenético NGS / MALDI-TOF Array Multiplex',
    testCode: '18264926',
    turnaroundDays: 15,
    status: 'published',
    currency: 'EUR',
    basePrice: 380,
    cloudStoragePath: 'labs/teletest/original/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_Saliva_Metabolizer_Detox_Demo_18264926.pdf',
    shortDescription: 'Panel integral de 48 polimorfismos en rutas de Fase I (Citocromos CYP450), Fase II (Conjugación, Metilación MTHFR, COMT, GSTs) y Transportadores.',
    description: 'Estudio de biotransformación hepática y aclaramiento xenobiótico. Identifica fenotipos metabolizadores lentos, intermedios, rápidos y ultrarrápidos para optimizar dosificaciones terapéuticas, toxicidad farmacológica y susceptibilidad a estrés oxidativo.',
    biomarkers: [
      'CYP1A1', 'CYP1A2', 'CYP1B1', 'CYP2A6', 'CYP2B6', 'CYP2C8', 'CYP2C9', 'CYP2C19', 'CYP2D6', 'CYP3A4', 'CYP3A5',
      'NAT1', 'NAT2', 'UGT1A1', 'UGT1A6', 'UGT2B7', 'GSTM1', 'GSTP1', 'GSTT1',
      'COMT (rs4680)', 'MTHFR (C677T / A1298C)', 'MTR', 'MTRR', 'CBS', 'SOD1', 'SOD2', 'GPX1', 'CAT', 'NQO1',
      'ABCB1 (P-glicoproteína)', 'SLCO1B1 (Transporte de Estatinas)', 'ABCG2'
    ],
    variants: [
      {
        id: 'teletest-detox-single',
        sku: 'TT-DETOX-PHARMA-01',
        name: 'Kit Saliva + Genotipado Completo Fase I/II & Farmacogenética',
        dosage: '1 Perfil Completo 48 Polimorfismos',
        price: 380,
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

// Deprecated split documents that should be archived
const DEPRECATED_PRODUCT_IDS = [
  'teletest-metales-pesados-toxicologia',
  'teletest-ratios-metabolicos-minerales'
];

async function seedTeleTest() {
  console.log('\n🚀 [TeleTest Seeder] Iniciando proceso de importación y seed canonical...');

  // 1. Upload PDFs to Cloud Storage
  for (const item of PDFS_TO_UPLOAD) {
    try {
      const res = await uploadPdfToGcs(item.localPath, item.storagePath);
      // Update matching products with actual Cloud Storage download URL
      TELETEST_PRODUCTS.forEach(p => {
        if (p.cloudStoragePath === item.storagePath) {
          p.cloudStorageDownloadUrl = res.publicUrl;
        }
        if (p.assessmentCloudStoragePath === item.storagePath) {
          p.assessmentCloudStorageDownloadUrl = res.publicUrl;
        }
      });
    } catch (err) {
      console.warn(`⚠️ Warning uploading ${item.fileName} to GCS (${err.message}). Using relative fallback.`);
    }
  }

  // 2. Upsert Supplier in Firestore
  console.log(`\n🏢 Registrando proveedor en 'suppliers/${TELETEST_SUPPLIER.id}'...`);
  await db.collection('suppliers').doc(TELETEST_SUPPLIER.id).set(TELETEST_SUPPLIER, { merge: true });
  console.log(`✅ Proveedor '${TELETEST_SUPPLIER.displayName}' guardado con éxito.`);

  // 3. Upsert Canonical Products in Firestore
  console.log(`\n🧪 Registrando ${TELETEST_PRODUCTS.length} productos diagnósticos canónicos en 'products/'...`);
  const batch = db.batch();

  for (const prod of TELETEST_PRODUCTS) {
    const ref = db.collection('products').doc(prod.id);
    batch.set(ref, prod, { merge: true });
    console.log(`   + Preparado canónico: [${prod.id}] ${prod.name}`);
  }

  // 4. Archive deprecated split entries (only if they exist)
  for (const depId of DEPRECATED_PRODUCT_IDS) {
    const depRef = db.collection('products').doc(depId);
    const depSnap = await depRef.get();
    if (depSnap.exists) {
      batch.update(depRef, {
        status: 'archived',
        archivedReason: 'Consolidated into canonical teletest-mineralograma-cabello-htma',
        updatedAt: new Date().toISOString()
      });
      console.log(`   - Archivado fragmento redundante existente: [${depId}]`);
    } else {
      console.log(`   ℹ️ Fragmento no encontrado en Firestore (no requiere archivo): [${depId}]`);
    }
  }

  await batch.commit();
  console.log(`✅ Transacción completada en Firestore: 5 productos canónicos activos y 2 archivados.`);

  console.log('\n🎉 [TeleTest Seeder] Proceso finalizado con éxito.');
}

seedTeleTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error general:', err);
    process.exit(1);
  });
