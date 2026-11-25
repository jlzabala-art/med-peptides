import fs from 'fs';
import path from 'path';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

for (const f of ['.env.local', '.env.production', '.env']) {
  const p = path.resolve(process.cwd(), f);
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'med-peptides-app',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function main() {
  const productId = 'glutathione-600mg-pen';
  const productPayload = {
    id: productId,
    slug: productId,
    name: 'Glutathione 600 mg / 3 mL (Pre-filled Pen)',
    productName: 'Glutathione 600 mg / 3 mL (Pre-filled Pen)',
    canonicalName: 'Glutathione',
    canonicalKey: productId,
    productType: 'finished_product',
    type: 'finished_product',
    isRawApi: false,
    category: 'Prefilled Pens',
    categoryId: 'prefilled_pens',
    presentation: 'Pre-filled Multi-Dose Pen (3 mL)',
    strength: '600 mg / 3 mL (200 mg/mL)',
    volume: '3 mL',
    requiresColdChain: true,
    storage: '2°C – 8°C Refrigerated · Protect from light · Do not freeze',
    route: 'Subcutaneous (Pre-filled Pen)',
    casNumber: '70-18-8',
    molecularFormula: 'C10H17N3O6S',
    molecularWeight: '307.32 g/mol',
    molecular: {
      formula: 'C10H17N3O6S',
      weight: '307.32 g/mol',
      cas: '70-18-8',
      purity: '≥ 99.0%',
    },
    primaryGoal: 'Cellular Antioxidant Defense & Redox Homeostasis',
    goals: [
      'Cellular Redox & Glutathione Replenishment',
      'Hepatic Phase II Detoxification',
      'Mitochondrial Protection',
      'Immune & Skin Clarity Support',
    ],
    description:
      'Ready-to-use multi-dose subcutaneous pre-filled pen delivering reduced L-Glutathione (600 mg / 3 mL, 200 mg/mL) for cellular redox balance, phase II hepatic detoxification, and oxidative stress protection.',
    scientificData: {
      mechanismOfAction:
        'Reduced L-Glutathione (GSH, γ-L-glutamyl-L-cysteinyl-glycine) serves as the primary intracellular thiol antioxidant, neutralizing reactive oxygen species via glutathione peroxidase and conjugating xenobiotics during phase II hepatic detoxification.',
      administration:
        'Subcutaneous pre-filled multi-dose pen (100 clicks = 1.0 mL = 200 mg; 15 clicks = 0.15 mL = 30 mg). Attach a fresh sterile pen needle for each administration.',
      storage: 'Store refrigerated at 2°C – 8°C. Protect from light. Do not freeze.',
    },
    searchTokens: ['glutathione', '600mg', '3ml', 'pen', 'prefilled', 'bioblend', 'antioxidant', 'redox'],
    status: 'published',
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };

  await db.collection('products').doc(productId).set(productPayload, { merge: true });

  // Link finished product to Rx #GEC13450
  const rxSnap = await db.collection('prescriptions').where('code', '==', 'GEC13450').limit(5).get();
  for (const doc of rxSnap.docs) {
    await doc.ref.set(
      {
        productSlug: productId,
        productUrl: `/p/${productId}`,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  const verifiedProd = (await db.collection('products').doc(productId).get()).data();
  console.log('Created Finished Product:', {
    id: verifiedProd?.id,
    name: verifiedProd?.name,
    productType: verifiedProd?.productType,
    status: verifiedProd?.status,
    formula: verifiedProd?.molecularFormula,
  });
  console.log('Linked Rx GEC13450 docs:', rxSnap.size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
