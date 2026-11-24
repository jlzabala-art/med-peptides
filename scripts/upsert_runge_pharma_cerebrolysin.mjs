import fs from 'fs';
import path from 'path';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

for (const envFile of ['.env.local', '.env.production', '.env']) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[m[1]] = val;
      }
    }
  }
}

function getDb() {
  if (!getApps().length) {
    let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
    const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

    if (privateKey && clientEmail && projectId) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } else {
      initializeApp({ credential: applicationDefault(), projectId });
    }
  }
  return getFirestore();
}

async function main() {
  const db = getDb();
  const nowIso = new Date().toISOString();
  const supplierId = 'supplier-runge-pharma';

  const supplierPayload = {
    companyName: 'Runge Pharma GmbH & Co. KG',
    legalName: 'Runge Pharma GmbH & Co. KG',
    displayName: 'Runge Pharma',
    slug: 'runge-pharma',
    type: 'Pharmaceutical Wholesaler',
    category: 'International Pharmaceutical Distributor',
    email: 'info@rungepharma.de',
    website: 'https://www.runge-pharma.com',
    phone: '+49 (0) 7621 16 79 3-0',
    phoneInternational: '+49 (0) 7621 16 79 3-30',
    phoneTollFree: '00800-30313234',
    fax: '+49 (0) 7621 16 79 3-33',
    faxTollFree: '00800-30313233',
    address: 'Georges-Köhler-Straße 4, D-79539 Lörrach, Germany',
    city: 'Lörrach',
    postalCode: 'D-79539',
    country: 'Germany',
    originCountry: 'DE',
    registrationCourt: 'Registergericht Freiburg HRA 705652',
    taxId: 'DE319369849',
    status: 'active',
    statusB2B: 'active',
    contacts: [
      {
        name: 'Alistair Simms',
        role: 'Team Manager - International',
        email: 'info@rungepharma.de',
        phone: '+49 (0) 7621 16 79 3-30',
        isPrimary: true,
      },
    ],
    productsSuppliedCount: 1,
    lastQuotationDate: nowIso,
    internalNotes: 'International Team: Alistair Simms (+49 (0) 7621 16 79 3-30). Toll-free Tel: 00800-30313234, Fax: 00800-30313233. Registergericht Freiburg HRA 705652 | USt-ID Nr. DE319369849.',
    updatedAt: FieldValue.serverTimestamp(),
  };

  const supRef = db.collection('suppliers').doc(supplierId);
  const supSnap = await supRef.get();
  if (!supSnap.exists) {
    supplierPayload.createdAt = FieldValue.serverTimestamp();
  }
  await supRef.set(supplierPayload, { merge: true });

  const rungeOffer = {
    supplierId,
    supplierName: 'Runge Pharma GmbH & Co. KG',
    contactPerson: 'Alistair Simms (Team Manager - International)',
    isActive: true,
    costPrice: 35.35,
    packPrice: 35.35,
    currency: 'EUR',
    priceBasis: 'EUR net',
    presentation: 'AMP',
    strength: '215.2 mg/mL',
    size: '5x5 mL',
    packUnits: 5,
    unitVolumeMl: 5,
    originCountry: 'AT',
    providerManufacturer: 'Ever',
    availability: 'available',
    availablePacks: 200,
    leadTime: '7-11 working days',
    leadTimeDays: 11,
    registrationNumber: '1-21380',
    pharmaCode: 'PZN 0553696',
    pzn: '0553696',
    storageConditions: 'Ambient 15-25°C',
    expiryDate: '03.2029',
    notes: 'Currently 200 packs available. Expiry date 03.2029. Leadtime for remaining packs not confirmed.',
    sku: 'PZN-0553696',
    lastUpdatedAt: nowIso,
  };

  const prodRef = db.collection('products').doc('cerebrolysin');
  await prodRef.set(
    {
      supplierOffers: {
        [supplierId]: rungeOffer,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Verify reads
  const verifiedSup = (await supRef.get()).data();
  const verifiedProd = (await prodRef.get()).data();

  console.log('Verified Supplier:', {
    id: supplierId,
    companyName: verifiedSup?.companyName,
    contact: verifiedSup?.contacts?.[0],
    taxId: verifiedSup?.taxId,
    email: verifiedSup?.email,
  });
  console.log('Verified Cerebrolysin Offers:', Object.keys(verifiedProd?.supplierOffers || {}));
  console.log('Verified Runge Offer:', verifiedProd?.supplierOffers?.[supplierId]);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
