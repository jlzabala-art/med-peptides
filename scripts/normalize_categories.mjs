import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const DRY_RUN = process.argv.includes('--dry-run');

const CANONICAL_CATEGORIES = [
  {
    id: 'peptide',
    label: 'Péptidos',
    labelEn: 'Peptides',
    icon: '💊',
    group: 'therapeutics',
    sortOrder: 1,
    isActive: true,
    description: 'Péptidos sintéticos y liofilizados para formulación y terapias regenerativas'
  },
  {
    id: 'raw_material',
    label: 'APIs y Materias Primas',
    labelEn: 'Bulk APIs & Raw Materials',
    icon: '⚗️',
    group: 'compounding',
    sortOrder: 2,
    isActive: true,
    description: 'Ingredientes farmacéuticos activos (APIs) a granel y materias primas'
  },
  {
    id: 'aesthetic_injectables',
    label: 'Inyectables Estéticos',
    labelEn: 'Aesthetic Injectables',
    icon: '💉',
    group: 'aesthetics',
    sortOrder: 3,
    isActive: true,
    description: 'Dermal fillers de ácido hialurónico, estimuladores de colágeno PCL y lipolíticos'
  },
  {
    id: 'diagnostic_test',
    label: 'Tests Diagnósticos',
    labelEn: 'Diagnostic Tests',
    icon: '🩸',
    group: 'diagnostics',
    sortOrder: 4,
    isActive: true,
    description: 'Kits de diagnóstico, biomarcadores sanguíneos y tests funcionales'
  },
  {
    id: 'genomics_biomarkers',
    label: 'Genómica y Biomarcadores',
    labelEn: 'Genomics & Biomarkers',
    icon: '🧬',
    group: 'diagnostics',
    sortOrder: 5,
    isActive: true,
    description: 'Tests genéticos, farmacogenómica (TrichoTest, TeloTest, NutriGen) y biomarcadores'
  },
  {
    id: 'nutricosmetics',
    label: 'Nutricosméticos',
    labelEn: 'Nutricosmetics',
    icon: '🌿',
    group: 'therapeutics',
    sortOrder: 6,
    isActive: true,
    description: 'Suplementos nutricosméticos avanzados, antioxidantes y fórmulas complementarias'
  },
  {
    id: 'cosmetics',
    label: 'Cosmética y Cuidado Tópico',
    labelEn: 'Cosmeceuticals & Skincare',
    icon: '🧴',
    group: 'cosmetics',
    sortOrder: 7,
    isActive: true,
    description: 'Cosmecéuticos, champús tricologicos, sérums y productos de cuidado tópico'
  },
  {
    id: 'clinical_supplies',
    label: 'Suministros Clínicos',
    labelEn: 'Clinical Supplies',
    icon: '🩺',
    group: 'clinical',
    sortOrder: 8,
    isActive: true,
    description: 'Material clínico, jeringas, agujas, cánulas y consumibles médicos'
  },
  {
    id: 'iv_drips',
    label: 'Sueros IV y Protocolos',
    labelEn: 'IV Drips & Protocols',
    icon: '💧',
    group: 'therapeutics',
    sortOrder: 9,
    isActive: true,
    description: 'Protocolos de infusión intravenosa y soluciones de micronutrientes'
  },
  {
    id: 'corporate_services',
    label: 'Servicios B2B',
    labelEn: 'B2B Services',
    icon: '💼',
    group: 'services',
    sortOrder: 10,
    isActive: true,
    description: 'Planes corporativos, servicios de consultoría, diagnóstico empresarial y membresías'
  },
  {
    id: 'supplement',
    label: 'Suplementos',
    labelEn: 'Supplements',
    icon: '💎',
    group: 'therapeutics',
    sortOrder: 11,
    isActive: true,
    description: 'Suplementos nutricionales y vitamínicos de grado médico'
  },
  {
    id: 'compounding_material',
    label: 'Material de Formulación',
    labelEn: 'Compounding Materials',
    icon: '🧪',
    group: 'compounding',
    sortOrder: 12,
    isActive: true,
    description: 'Vehículos, bases de formulación, disolventes y excipientes'
  }
];

const CATEGORY_MAPPING = {
  'Aesthetic Injectables': 'aesthetic_injectables',
  'api_raw_materials': 'raw_material',
  'api_raw_material': 'raw_material',
  'skincare': 'cosmetics',
  'medical_supplies': 'clinical_supplies',
  'service': 'corporate_services',
  'logistics_service': 'corporate_services',
  'solvent': 'compounding_material',
  'Bioactive Enzymes & Metabolic': 'peptide'
};

async function main() {
  console.log(`🚀 Iniciando sincronización de categorías en Firebase (DRY_RUN=${DRY_RUN})...\n`);

  // 1. Escribir categorías canónicas en Firestore
  console.log(`📦 Actualizando colección 'categories' (${CANONICAL_CATEGORIES.length} categorías)...`);
  for (const cat of CANONICAL_CATEGORIES) {
    if (!DRY_RUN) {
      await db.collection('categories').doc(cat.id).set({
        ...cat,
        status: 'active',
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
    console.log(`   ✓ [${cat.icon}] ${cat.id} -> ${cat.labelEn} (${cat.label})`);
  }

  // 2. Normalizar productos existentes en Firestore
  console.log(`\n🔍 Verificando normalización de productos en colección 'products'...`);
  const snap = await db.collection('products').get();
  let updatedCount = 0;

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const currentCat = data.category;
    const targetCat = CATEGORY_MAPPING[currentCat];

    if (targetCat && targetCat !== currentCat) {
      console.log(`   🔄 Producto ${doc.id}: category '${currentCat}' -> '${targetCat}'`);
      if (!DRY_RUN) {
        batch.update(doc.ref, {
          category: targetCat,
          categoryId: targetCat,
          updatedAt: FieldValue.serverTimestamp()
        });
        batchCount++;
        if (batchCount >= 400) {
          await batch.commit();
          batchCount = 0;
        }
      }
      updatedCount++;
    }
  }

  if (!DRY_RUN && batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n✨ Total productos actualizados: ${updatedCount}`);
}

main().catch(console.error);
