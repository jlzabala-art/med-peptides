import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getPeptideScientificData } from './src/utils/knownPeptideData.js';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const adminDb = getFirestore();

// Comprehensive dictionary of authentic CAS numbers for active chemicals, minerals, APIs, and peptides
const AUTHENTIC_CAS_DICTIONARY = {
  'zinc sulfate heptahydrate': '7446-20-0',
  'zinc sulfate monohydrate': '7446-19-7',
  'zinc sulfate': '7733-02-0',
  'zinc citrate': '546-46-3',
  'zinc gluconate': '4468-02-4',
  'zinc acetate': '5970-45-6',
  'zinc pyrithione': '13463-41-7',
  'lidocaine usp': '137-58-6',
  'lidocaine': '137-58-6',
  'alpha lipoic acid': '1077-28-7',
  'ldn (low dose naltrexone)': '16590-41-3',
  'naltrexone': '16590-41-3',
  '5-htp': '4350-09-8',
  '5-amino-1mq': '2250005-77-3',
  '5 amino-1': '2250005-77-3',
  'serrapeptase': '95077-02-4',
  'acetylcystein (n-acetyl l-cystein)': '616-91-1',
  'acetylcystein (n-acetyl l-cysteine)': '616-91-1',
  'n-acetyl l-cysteine': '616-91-1',
  'n-acetylcysteine': '616-91-1',
  'acetyl-carnitine': '14992-62-2',
  'acetyl l-carnitine': '14992-62-2',
  'aicar': '2627-69-2',
  'aicar 50 mg': '2627-69-2',
  'vit. d3': '67-97-0',
  'vitamin d3': '67-97-0',
  'vitamin d3 (cholecalciferol pure api)': '67-97-0',
  'vitamin b12': '68-19-9',
  'vitamin b12 (methylcobalamin / cyanocobalamin)': '68-19-9',
  'vitamin c (ascorbic acid)': '50-81-7',
  'vitamin e (tocopherol)': '59-02-9',
  'vitamin e (tocoferol)': '59-02-9',
  'vitamin k2 (menaquinone-7 / mk-7)': '2124-57-4',
  'zeaxanthin': '144-68-3',
  'white petrolatum': '8009-03-8',
  'virgin olive oil': '8001-25-0',
  'methylene blue': '61-73-4',
  'bac water': '7732-18-5',
  'bacteriostatic water': '7732-18-5',
  '17-a estradiol': '57-91-0',
  '17-alpha estradiol': '57-91-0',
  'alfatradiol': '57-91-0',
  'minoxidil': '38304-91-5',
  'finasteride': '98319-26-7',
  'dutasteride': '164656-23-9',
  'latanoprost': '130209-82-4',
  'bpc-157': '137525-51-0',
  'bpc 157': '137525-51-0',
  'tb-500': '77591-33-4',
  'semaglutide': '910463-68-2',
  'tirzepatide': '2023788-19-2',
  'retatrutide': '2381089-83-2',
  'liraglutide': '204656-20-2',
  'epithalon': '307297-39-8',
  'epitalon': '307297-39-8',
  'ghk-cu': '49557-75-7',
  'ghk cu': '49557-75-7',
  'cjc-1295': '863288-34-0',
  'ipamorelin': '170851-70-4',
  'tesamorelin': '218949-48-5',
  'mot-c': '1627580-64-6',
  'mots-c': '1627580-64-6',
  'nad+': '53-84-9',
  'nad': '53-84-9',
  'nmn': '1094-61-7',
  'resveratrol': '501-36-0',
  'rapamycin': '53123-88-9',
  'quercetin': '117-39-5',
  'coq10': '303-98-0',
  'coenzyme q10': '303-98-0',
  'glutathione': '70-18-8',
  'l-glutathione': '70-18-8',
  'melatonin': '73-31-4',
  'metformin': '657-24-9',
  'metformin hcl': '1115-70-4',
  'tretinoin': '302-79-4',
  'spironolactone': '52-01-7',
  'ketoconazole': '65277-42-1',
  'caffeine': '58-08-2',
  'niacinamide': '98-92-0',
  'salicylic acid': '69-72-7',
  'azelaic acid': '123-99-9',
  'glycolic acid': '79-14-1',
  'hyaluronic acid': '9004-61-9',
  'sodium hyaluronate': '9067-32-7',
  'dHEA': '53-43-0',
  'prasterone (dhea)': '53-43-0',
  'pregnenolone': '145-13-1',
  'progesterone': '57-83-0',
  'progesterona [progesterone]': '57-83-0',
  'testosterone': '58-22-0',
  'oxytocin': '50-56-6',
  'oxytocin acetate': '50-56-6'
};

async function executeCasEnrichment(dryRun = false) {
  console.log(`🚀 Starting Database CAS Enrichment (DryRun: ${dryRun})...`);
  const productsSnap = await adminDb.collection('products').get();
  console.log(`Auditing ${productsSnap.size} products in Firestore...`);

  let updatedCount = 0;
  let batch = adminDb.batch();
  let operationCount = 0;

  for (const pDoc of productsSnap.docs) {
    const pData = pDoc.data();
    const nameNorm = (pData.name || pDoc.id).toLowerCase().trim();

    // Determine current CAS value
    let currentCas = pData.molecular?.casNumber || pData.scientificData?.casNumber || pData.casNumber || pData.cas || pData.cas_number || '';
    if (currentCas === 'Available on Request') currentCas = '';

    let resolvedCas = currentCas;

    // Check existing candidates on doc if not 'Available on Request'
    const docCandidates = [pData.cas, pData.cas_number, pData.casNo, pData.casNumber];
    for (const cand of docCandidates) {
      if (cand && typeof cand === 'string' && cand.trim() !== '' && cand !== 'Available on Request') {
        resolvedCas = cand.trim();
        break;
      }
    }

    // Check knownPeptideData fallback
    if (!resolvedCas) {
      const fallback = getPeptideScientificData(pData.name || pDoc.id);
      if (fallback?.casNumber) {
        resolvedCas = fallback.casNumber;
      }
    }

    // Check AUTHENTIC_CAS_DICTIONARY
    if (!resolvedCas) {
      for (const [key, casVal] of Object.entries(AUTHENTIC_CAS_DICTIONARY)) {
        if (nameNorm === key || nameNorm.includes(key) || key.includes(nameNorm)) {
          resolvedCas = casVal;
          break;
        }
      }
    }

    // If resolved a valid CAS number and it differs from existing molecular.casNumber
    if (resolvedCas && resolvedCas !== pData.molecular?.casNumber) {
      updatedCount++;
      console.log(`  [ENRICH CAS] '${pData.name || pDoc.id}' (${pDoc.id}) -> CAS: ${resolvedCas}`);

      if (!dryRun) {
        const updatedMolecular = {
          ...(pData.molecular || {}),
          casNumber: resolvedCas
        };
        const updatedScientific = {
          ...(pData.scientificData || {}),
          casNumber: resolvedCas
        };

        batch.update(pDoc.ref, {
          cas: resolvedCas,
          casNumber: resolvedCas,
          molecular: updatedMolecular,
          scientificData: updatedScientific,
          updatedAt: new Date().toISOString()
        });

        operationCount++;
        if (operationCount >= 400) {
          await batch.commit();
          batch = adminDb.batch();
          operationCount = 0;
        }
      }
    }
  }

  if (!dryRun && operationCount > 0) {
    await batch.commit();
  }

  console.log(`\n=== CAS ENRICHMENT SUMMARY ===`);
  console.log(`DryRun Mode: ${dryRun}`);
  console.log(`Total Products Updated with Authentic CAS: ${updatedCount}`);
}

executeCasEnrichment(false).catch(console.error);
