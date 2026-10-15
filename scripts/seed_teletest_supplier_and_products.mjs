/**
 * scripts/seed_teletest_supplier_and_products.mjs
 * 
 * Uploads original TeleTest PDF reports to Google Cloud Storage
 * and registers TeleTest Analytika S.A. as an official diagnostic laboratory supplier,
 * seeding all 5 diagnostic products into Firestore with clinical metadata.
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
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    fileName: 'TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf'
  },
  {
    localPath: path.resolve(__dirname, '../public/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf'),
    storagePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    fileName: 'TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf'
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
  status: 'active',
  leadTimeDays: 7,
  logoUrl: '/images/suppliers/teletest-logo.svg',
  descriptionEn: 'European reference clinical laboratory authorized by the Health Department of Catalonia (E08750211) and ISO 17025 accredited. Specializing in high-resolution HLA immunogenetics, autoimmune disease predisposition, and ICP-MS/MS hair tissue mineral and heavy metal toxicology.',
  descriptionEs: 'Laboratorio de análisis clínicos de referencia europeo autorizado por el Departament de Salut de la Generalitat de Catalunya (E08750211) y acreditado bajo norma ISO 17025. Especializado en inmunogenética HLA de alta resolución, celiaquía y toxicología tisular por ICP-MS/MS.',
  productCount: 5,
  updatedAt: new Date().toISOString()
};

const TELETEST_PRODUCTS = [
  {
    id: 'teletest-gnt-hla-autoinmunidad',
    slug: 'teletest-gnt-hla-autoinmunidad',
    name: 'GNT. HLA y Autoinmunidad (Panel Completo Inmunogenético)',
    displayName: 'GNT. HLA & Autoimmunity Complete Panel',
    canonicalName: 'GNT. HLA y Autoinmunidad',
    canonicalKey: 'gnt-hla-autoinmunidad',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'Diagnostic & Laboratory Tests',
    subCategory: 'Genomics & Autoimmunity',
    sampleType: 'Sangre Periférica (Blood Sample)',
    methodology: 'qPCR & Genotipado de Alta Resolución',
    testCode: '18267615',
    turnaroundDays: 7,
    status: 'published',
    currency: 'EUR',
    basePrice: 295,
    cloudStoragePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    shortDescription: 'Tipificación genética completa de HLA Clase I, Clase II y susceptibilidad genética a celiaquía y patologías autoinmunes.',
    description: 'Estudio genómico avanzado de antígenos leucocitarios humanos (HLA). Analiza alelos completos de HLA Clase I (A, B, C) y HLA Clase II (DPA1, DPB1, DQA1, DQB1, DRB1, DRB3, DRB4, DRB5) junto con un panel de celiaquía (DQ8, DQ2.2, DQ2.5, DQ7.5). Esencial para guiar terapias inmunomoduladoras y pautas de nutrición de precisión.',
    biomarkers: [
      'HLA-A', 'HLA-B', 'HLA-C',
      'HLA-DPA1', 'HLA-DPB1', 'HLA-DQA1', 'HLA-DQB1', 'HLA-DRB1', 'HLA-DRB3', 'HLA-DRB4', 'HLA-DRB5',
      'HLA-DQ8', 'HLA-DQ2.2', 'HLA-DQ2.5', 'HLA-DQ7.5', 'HLA-DQX.2', 'HLA-DQX.5'
    ],
    variants: [
      {
        id: 'teletest-gnt-hla-single',
        sku: 'TT-GNT-HLA-01',
        name: 'Kit de Extracción Sanguínea + Análisis Completo HLA',
        dosage: '1 Informe Completo',
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
  {
    id: 'teletest-celiac-gluten-hla',
    slug: 'teletest-celiac-gluten-hla',
    name: 'Estudio Genético de Intolerancia al Gluten & Enfermedad Celíaca (HLA-DQ2 / DQ8)',
    displayName: 'Genetic Celiac & Gluten Intolerance Test (HLA-DQ2 / DQ8)',
    canonicalName: 'Estudio Genético Celiaquía HLA-DQ2/DQ8',
    canonicalKey: 'estudio-genetico-celiaquia-hla-dq2-dq8',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'Diagnostic & Laboratory Tests',
    subCategory: 'Genomics & Autoimmunity',
    sampleType: 'Sangre Periférica o Frotis Bucal',
    methodology: 'qPCR Multiplex Específica',
    testCode: '18267615-CEL',
    turnaroundDays: 5,
    status: 'published',
    currency: 'EUR',
    basePrice: 165,
    cloudStoragePath: 'labs/teletest/original/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_HLA_Autoinmunidad_Demo_18267615.pdf',
    shortDescription: 'Detección de haplotipos HLA-DQ2 y HLA-DQ8 con valor predictivo negativo superior al 99%.',
    description: 'Prueba genética para descartar o confirmar predisposición a enfermedad celíaca y sensibilidad al gluten mediada por inmunidad innata. La ausencia de estos marcadores prácticamente excluye la celiaquía a lo largo de la vida.',
    biomarkers: ['HLA-DQ2.5', 'HLA-DQ2.2', 'HLA-DQ8', 'DQA1*05', 'DQB1*02', 'DQA1*03', 'DQB1*03:02'],
    variants: [
      {
        id: 'teletest-celiac-single',
        sku: 'TT-CEL-HLA-01',
        name: 'Kit Frotis Bucal / Sanguíneo + Genotipado Celíaco',
        dosage: '1 Determinación',
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
  {
    id: 'teletest-mineralograma-cabello-htma',
    slug: 'teletest-mineralograma-cabello-htma',
    name: 'Mineralograma en Cabello (HTMA) - 33 Metales & Ratios Metabólicos',
    displayName: 'Hair Tissue Mineral Analysis (HTMA) - 33 Elements & Ratios',
    canonicalName: 'Mineralograma en Cabello HTMA',
    canonicalKey: 'mineralograma-cabello-htma',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'Diagnostic & Laboratory Tests',
    subCategory: 'Toxicology & Trace Elements',
    sampleType: 'Cabello (Hair Mineral Composition)',
    methodology: 'ICP-MS/MS (Espectrometría de Masas Triple Cuadrupolo)',
    testCode: '18267691',
    turnaroundDays: 10,
    status: 'published',
    currency: 'EUR',
    basePrice: 195,
    cloudStoragePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    shortDescription: 'Cuantificación de 33 elementos tisulares (17 minerales, 11 indicadores, 5 metales tóxicos) y 10 ratios metabólicos.',
    description: 'El análisis de metales y minerales en cabello refleja la acumulación tisular intracelular de los últimos 2-3 meses. Incluye espectro completo de minerales esenciales, detección de tóxicos (Pb, Hg, Cd, As) y evaluación endocrina/adrenal mediante ratios matemáticos.',
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
        name: 'Kit de Recogida de Cabello + Análisis ICP-MS/MS Completo',
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
  {
    id: 'teletest-metales-pesados-toxicologia',
    slug: 'teletest-metales-pesados-toxicologia',
    name: 'Screening Toxicológico de Metales Pesados Tisulares',
    displayName: 'Heavy Metals Toxicology Tissue Screening (ICP-MS/MS)',
    canonicalName: 'Screening Metales Pesados Tisulares',
    canonicalKey: 'screening-metales-pesados-tisulares',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'Diagnostic & Laboratory Tests',
    subCategory: 'Toxicology & Heavy Metals',
    sampleType: 'Cabello (Hair Sample)',
    methodology: 'ICP-MS/MS de Alta Sensibilidad',
    testCode: '18267691-TOX',
    turnaroundDays: 8,
    status: 'published',
    currency: 'EUR',
    basePrice: 145,
    cloudStoragePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    shortDescription: 'Perfil centrado en neurotóxicos y bioacumulación: Plomo, Mercurio, Arsénico, Cadmio, Talio, Uranio y Aluminio.',
    description: 'Permite identificar intoxicaciones subclínicas crónicas que no se detectan en analíticas de sangre convencionales debido a la rápida depuración plasmática hacia los tejidos blandos y hueso.',
    biomarkers: ['Plomo (Pb)', 'Mercurio (Hg)', 'Arsénico (As)', 'Cadmio (Cd)', 'Talio (Tl)', 'Uranio (U)', 'Aluminio (Al)', 'Níquel (Ni)'],
    variants: [
      {
        id: 'teletest-tox-single',
        sku: 'TT-TOX-HEAVY-01',
        name: 'Kit Muestra Cabello + Panel Toxicológico ICP-MS/MS',
        dosage: '1 Panel Toxicológico',
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
  {
    id: 'teletest-ratios-metabolicos-minerales',
    slug: 'teletest-ratios-metabolicos-minerales',
    name: 'Perfil de Minerales Nutricionales & Ratios Metabólicos Tisulares',
    displayName: 'Nutritional Trace Minerals & Metabolic Ratios Profile',
    canonicalName: 'Minerales Nutricionales y Ratios Metabólicos',
    canonicalKey: 'minerales-nutricionales-ratios-metabolicos',
    brand: 'TeleTest Analytika',
    supplierId: 'supplier-teletest',
    supplierName: 'TeleTest Analytika S.A.',
    supplier: 'TeleTest Analytika',
    category: 'Diagnostic & Laboratory Tests',
    subCategory: 'Metabolic Health & Trace Minerals',
    sampleType: 'Cabello (Hair Sample)',
    methodology: 'ICP-MS/MS',
    testCode: '18267691-NUT',
    turnaroundDays: 8,
    status: 'published',
    currency: 'EUR',
    basePrice: 155,
    cloudStoragePath: 'labs/teletest/original/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    pdfUrl: '/docs/labs/teletest/TELETEST_Mineralograma_Cabello_HTMA_Demo_18267691.pdf',
    shortDescription: 'Evaluación del ratio electrolítico intracelular, función tiroidea y respuesta de las glándulas suprarrenales.',
    description: 'Análisis de los 17 minerales esenciales y los 10 ratios fisiológicos que determinan la tasa metabólica del paciente (metabolizador rápido vs lento), el balance oxidativo y la utilización celular de glucosa y ATP.',
    biomarkers: ['Ca', 'Mg', 'Na', 'K', 'P', 'Zn', 'Cu', 'Fe', 'Mn', 'Cr', 'Se', 'Ratio Ca/Mg', 'Ratio Ca/K', 'Ratio Na/K', 'Ratio Na/Mg'],
    variants: [
      {
        id: 'teletest-nut-single',
        sku: 'TT-NUT-RATIOS-01',
        name: 'Kit Muestra Cabello + Evaluación de Ratios Metabólicos',
        dosage: '1 Perfil Nutricional & Metabólico',
        price: 155,
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

async function seedTeleTest() {
  console.log('\n🚀 [TeleTest Seeder] Iniciando proceso de importación y seed...');

  // 1. Upload PDFs to Cloud Storage
  for (const item of PDFS_TO_UPLOAD) {
    try {
      const res = await uploadPdfToGcs(item.localPath, item.storagePath);
      // Update matching products with actual Cloud Storage download URL
      TELETEST_PRODUCTS.forEach(p => {
        if (p.cloudStoragePath === item.storagePath) {
          p.cloudStorageDownloadUrl = res.publicUrl;
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

  // 3. Upsert Products in Firestore
  console.log(`\n🧪 Registrando ${TELETEST_PRODUCTS.length} productos diagnósticos en 'products/'...`);
  const batch = db.batch();

  for (const prod of TELETEST_PRODUCTS) {
    const ref = db.collection('products').doc(prod.id);
    batch.set(ref, prod, { merge: true });
    console.log(`   + Preparado: [${prod.id}] ${prod.name}`);
  }

  await batch.commit();
  console.log(`✅ ${TELETEST_PRODUCTS.length} productos guardados en Firestore correctamente.`);

  console.log('\n🎉 [TeleTest Seeder] Proceso finalizado con éxito.');
}

seedTeleTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error general:', err);
    process.exit(1);
  });
