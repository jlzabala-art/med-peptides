import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

const centricoData = {
  supplier: "Centrico",
  currency: "AED",
  assumed_dosage_form: "pen",
  products: [
    {
      category: "peptides",
      product_name: "Tesamorelin",
      strength_mg: 60,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 2700,
      patient_price_aed: 3700
    },
    {
      category: "peptides",
      product_name: "HGH Frag 177",
      strength_mg: 5,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 1950,
      patient_price_aed: 3450
    },
    {
      category: "peptides",
      product_name: "TB-500",
      strength_mg: 15,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 900,
      patient_price_aed: 2000
    },
    {
      category: "peptides",
      product_name: "CJC-1295",
      strength_mg: 5,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 900,
      patient_price_aed: 2000
    },
    {
      category: "peptides",
      product_name: "BPC-157",
      strength_mg: 15,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 800,
      patient_price_aed: 1800
    },
    {
      category: "peptides",
      product_name: "MOT-C",
      strength_mg: 30,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 1200,
      patient_price_aed: 2500
    },
    {
      category: "peptides",
      product_name: "GHK-Cu",
      strength_mg: 50,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 700,
      patient_price_aed: 1600
    },
    {
      category: "peptides",
      product_name: "Ipamorelin",
      strength_mg: 5,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 660,
      patient_price_aed: 1600
    },
    {
      category: "peptide_combinations",
      product_name: "BPC-157 + TB-500",
      strength_display: "15 mg + 15 mg",
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 1500,
      patient_price_aed: 3000
    },
    {
      category: "peptide_combinations",
      product_name: "CJC-1295 + Ipamorelin",
      strength_display: "5 mg + 5 mg",
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 1500,
      patient_price_aed: 3000
    },
    {
      category: "weight_loss",
      product_name: "Advanced Weight Loss",
      strength_mg: 50,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 1200,
      patient_price_aed: 1700
    },
    {
      category: "weight_loss",
      product_name: "Advanced Weight Loss",
      strength_mg: 25,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 1000,
      patient_price_aed: 1500
    },
    {
      category: "weight_loss",
      product_name: "Weight Loss",
      strength_mg: 30,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 900,
      patient_price_aed: 1300
    },
    {
      category: "weight_loss",
      product_name: "Weight Loss",
      strength_mg: 20,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 760,
      patient_price_aed: 1200
    },
    {
      category: "weight_loss",
      product_name: "Weight Loss",
      strength_mg: 10,
      dosage_form: "pen",
      pen_volume_ml: 3,
      clinic_price_aed: 660,
      patient_price_aed: 1100
    }
  ]
};

async function importCentrico() {
  console.log('=== STARTING CENTRICO IMPORT ===');
  
  // 1. Ensure Supplier Document exists
  const suppRef = db.collection('suppliers').doc('supplier-centrico');
  const suppSnap = await suppRef.get();
  if (!suppSnap.exists) {
    console.log('Creating supplier document for Centrico...');
    await suppRef.set({
      id: 'supplier-centrico',
      name: 'Centrico',
      canonicalName: 'Centrico',
      country: 'United Arab Emirates',
      currency: 'AED',
      type: 'Finished Formulations (Pens)',
      categoriesSupplied: ['peptides', 'peptide_combinations', 'weight_loss'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastQuotationDate: '2026-08-20',
      agreementNotes: 'Centrico Distribution List (Clinic & Patient Rates in AED)'
    });
  } else {
    await suppRef.update({
      currency: 'AED',
      status: 'active',
      updatedAt: new Date().toISOString(),
      lastQuotationDate: '2026-08-20'
    });
  }

  // 2. Fetch all products to match canonical names
  const prodsSnap = await db.collection('products').get();
  const allProds = prodsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const AED_RATE = 3.67;

  for (const item of centricoData.products) {
    const rawName = item.product_name.trim();
    const doseStr = item.strength_display || `${item.strength_mg}mg`;
    const clinicAed = Number(item.clinic_price_aed);
    const patientAed = Number(item.patient_price_aed);
    const clinicUsd = Number((clinicAed / AED_RATE).toFixed(2));
    const patientUsd = Number((patientAed / AED_RATE).toFixed(2));

    // Normalize matching name
    let searchName = rawName.toLowerCase();
    if (searchName === 'mot-c') searchName = 'mots-c';
    if (searchName === 'hgh frag 177') searchName = 'hgh frag';

    // Find parent product
    let parentProd = allProds.find(p => {
      const pName = (p.canonicalName || p.name || '').toLowerCase();
      const pId = p.id.toLowerCase();
      if (searchName === 'hgh frag' && (pName.includes('frag') || pId.includes('frag'))) return true;
      if (searchName === 'mots-c' && (pName.includes('mot') || pId.includes('mot'))) return true;
      return pName === searchName || pId === searchName || (pName.includes(searchName) && !pName.includes('+') && !searchName.includes('+'));
    });

    let parentId;
    if (!parentProd) {
      // Create new product
      const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      parentId = slug;
      console.log(`Creating NEW parent product: ${rawName} (${parentId})`);
      const newProdData = {
        name: rawName,
        canonicalName: rawName,
        slug: slug,
        category: item.category,
        categoryId: item.category,
        productType: item.category === 'weight_loss' ? 'weight_loss' : 'peptide',
        format: 'pre_filled_pen',
        status: 'active',
        isActive: true,
        currency: 'AED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastQuotationDate: '2026-08-20'
      };
      await db.collection('products').doc(parentId).set(newProdData);
      allProds.push({ id: parentId, ...newProdData });
    } else {
      parentId = parentProd.id;
      console.log(`Matched existing parent product: ${parentProd.canonicalName || parentProd.name} (${parentId})`);
      await db.collection('products').doc(parentId).update({
        updatedAt: new Date().toISOString(),
        status: 'active',
        isActive: true
      });
    }

    // Generate variant ID
    const varSlug = `centrico-${doseStr.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-pen`;
    const varRef = db.collection('products').doc(parentId).collection('variants').doc(varSlug);

    const variantPayload = {
      supplier: 'Centrico',
      supplierId: 'supplier-centrico',
      supplierName: 'Centrico',
      currency: 'AED',
      unitOfMeasure: 'unit',
      presentation: 'pre_filled_pen',
      format: 'pen',
      dosage_form: 'pen',
      pen_volume_ml: item.pen_volume_ml || 3,
      dosage: doseStr,
      dose: doseStr,
      strength_mg: item.strength_mg || null,
      strength_display: item.strength_display || null,
      type: 'finished_product',
      productType: 'peptide',
      
      // Cost NOT set to prevent contaminating cost channel:
      unit_price: null,
      cost_10: null,
      cost_50: null,
      cost_100: null,
      
      // Explicit sales channels:
      clinic_price: clinicUsd,
      retail_price: patientUsd,
      
      pricing: {
        clinic: {
          aed: clinicAed,
          usd: clinicUsd,
          perUnit: clinicUsd
        },
        retail: {
          aed: patientAed,
          usd: patientUsd,
          perUnit: patientUsd
        },
        patient: {
          aed: patientAed,
          usd: patientUsd
        }
      },
      
      supplierPricing: {
        supplierName: 'Centrico',
        supplierId: 'supplier-centrico',
        currency: 'AED',
        clinicPriceAED: clinicAed,
        patientPriceAED: patientAed,
        netCost: null,
        discountPercent: 0,
        unitOfMeasure: 'unit',
        lastQuotationDate: '2026-08-20',
        agreementNotes: 'Centrico Distribution List (Clinic & Patient Rates in AED)'
      },
      
      status: 'active',
      isActive: true,
      updatedAt: new Date().toISOString()
    };

    await varRef.set(variantPayload, { merge: true });
    console.log(`  ✓ Variant saved: ${parentId} / ${varSlug} (Clinic: ${clinicAed} AED | Patient: ${patientAed} AED)`);
  }

  console.log('=== CENTRICO IMPORT COMPLETED SUCCESSFULLY ===');
}

importCentrico().catch(console.error);
