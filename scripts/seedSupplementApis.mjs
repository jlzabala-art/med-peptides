import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const serviceAccount = JSON.parse(
  await readFile('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/serviceAccountKey.json')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'med-peptides-app'
  });
}

const db = admin.firestore();

const SUPPLEMENT_APIS = [
  {
    id: 'nmn',
    name: 'NMN (Nicotinamida Mononucleótido)',
    unit: 'mg',
    costPerUnit: 0.02,
    category: 'Longevidad',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Co-factor celular clave en la elevación de los niveles de NAD+ y la función mitocondrial.'
  },
  {
    id: 'resveratrol',
    name: 'Trans-Resveratrol 98%',
    unit: 'mg',
    costPerUnit: 0.015,
    category: 'Antioxidantes',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Polifenol antioxidante activador de las sirtuinas (SIRT1).'
  },
  {
    id: 'zinc_picolinate',
    name: 'Zinc (Picolinato)',
    unit: 'mg',
    costPerUnit: 0.005,
    category: 'Minerales',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Forma altamente absorbible de zinc, mineral esencial para el sistema inmune y enzimático.'
  },
  {
    id: 'nad_pure',
    name: 'NAD+ Puro (Nicotinamida Adenina Dinucleótido)',
    unit: 'mg',
    costPerUnit: 0.05,
    category: 'Longevidad',
    compatibleVehicles: ['cellulose_capsule', 'liposomal_liquid'],
    desc: 'Nucleótido esencial para la producción de energía celular (ATP) y la reparación del ADN.'
  },
  {
    id: 'vitamin_d3',
    name: 'Vitamina D3 (Colecalciferol)',
    unit: 'IU',
    costPerUnit: 0.0001,
    category: 'Vitaminas',
    compatibleVehicles: ['cellulose_capsule', 'vegetable_glycerin', 'liposomal_liquid'],
    desc: 'Vitamina liposoluble crucial para la absorción de calcio, salud ósea e inmunomodulación.'
  },
  {
    id: 'magnesium_glycinate',
    name: 'Glicinato de Magnesio',
    unit: 'mg',
    costPerUnit: 0.004,
    category: 'Minerales',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Magnesio quelado con glicina, promueve la relajación muscular y soporte al sistema nervioso sin efecto laxante.'
  },
  {
    id: 'coq10',
    name: 'Coenzima Q10 (CoQ10)',
    unit: 'mg',
    costPerUnit: 0.025,
    category: 'Antioxidantes',
    compatibleVehicles: ['cellulose_capsule', 'liposomal_liquid'],
    desc: 'Antioxidante mitocondrial indispensable para la cadena de transporte de electrones.'
  },
  {
    id: 'vitamin_c',
    name: 'Vitamina C (Ácido Ascórbico)',
    unit: 'mg',
    costPerUnit: 0.002,
    category: 'Vitaminas',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base', 'liposomal_liquid'],
    desc: 'Antioxidante hidrosoluble fundamental para la síntesis de colágeno y el soporte inmune.'
  },
  {
    id: 'vitamin_b12',
    name: 'Vitamina B12 (Metilcobalamina)',
    unit: 'mcg',
    costPerUnit: 0.0005,
    category: 'Vitaminas',
    compatibleVehicles: ['cellulose_capsule', 'vegetable_glycerin', 'liposomal_liquid'],
    desc: 'Forma activa de la vitamina B12, clave en la síntesis de glóbulos rojos y función neurológica.'
  },
  {
    id: 'quercetin',
    name: 'Quercetina',
    unit: 'mg',
    costPerUnit: 0.018,
    category: 'Antioxidantes',
    compatibleVehicles: ['cellulose_capsule', 'flavored_powder_base'],
    desc: 'Flavonoide senolítico natural que ayuda en la regulación de la respuesta inflamatoria.'
  }
];

async function seed() {
  console.log('Seeding supplement APIs to Firestore...');
  const colRef = db.collection('supplement_apis');
  
  for (const api of SUPPLEMENT_APIS) {
    const docRef = colRef.doc(api.id);
    await docRef.set({
      ...api,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Successfully seeded API: ${api.name}`);
  }
  
  console.log('All supplement APIs successfully seeded!');
}

seed().catch(err => {
  console.error('Error seeding supplement APIs:', err);
}).finally(() => {
  process.exit();
});
