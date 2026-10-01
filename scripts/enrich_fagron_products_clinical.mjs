#!/usr/bin/env node
/**
 * enrich_fagron_products_clinical.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Enriches all Fagron Genomics & Compounding APIs in Firestore with:
 *  - geneTargets
 *  - clinicalIndication
 *  - mechanismOfAction
 *  - pharmacologicalClass
 *  - compatibleVehicles
 *
 * Usage:
 *   node scripts/enrich_fagron_products_clinical.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { FAGRON_CLINICAL_MONOGRAPHS, getFagronClinicalMonograph } from '../src/data/fagronClinicalMonographs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  console.log('🔄 Starting Fagron Clinical Enrichment in Firestore...');

  const snap = await db.collection('products')
    .where('tags', 'array-contains', 'Fagron Genomics')
    .get();

  console.log(`Found ${snap.size} Fagron Genomics products in Firestore.`);
  let updatedCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const docId = doc.id;
    const name = data.name || data.displayName || '';

    const mono = FAGRON_CLINICAL_MONOGRAPHS[docId] || getFagronClinicalMonograph(docId) || getFagronClinicalMonograph(name);

    if (mono) {
      const updates = {
        clinicalDescription: mono.mechanismOfAction,
        mechanismOfAction: mono.mechanismOfAction,
        geneTargets: mono.geneTargets,
        clinicalIndication: mono.clinicalIndication,
        pharmacologicalClass: mono.pharmacologicalClass,
        compatibleVehicles: mono.compatibleVehicles,
        standardDosages: mono.standardDosages,
        updatedAt: new Date()
      };

      await doc.ref.update(updates);
      console.log(`✅ Enriched ${docId} (${name}) -> Genes: ${mono.geneTargets.join(', ')}`);
      updatedCount++;
    } else {
      // Provide standard fallback clinical descriptors if no specific monograph
      const fallbackUpdates = {
        clinicalDescription: data.description || 'Principio activo farmacéutico de grado compendial para formulación magistral individualizada.',
        mechanismOfAction: data.description || 'Modulación de rutas celulares y biológicas adaptadas al perfil clínico del paciente.',
        geneTargets: data.geneTargets || [],
        clinicalIndication: data.clinicalIndication || 'Terapia magistral personalizada según criterio médico.',
        pharmacologicalClass: 'Principio Activo Compounding Farmacogenómico',
        updatedAt: new Date()
      };
      await doc.ref.update(fallbackUpdates);
      console.log(`ℹ️ Standard metadata set for ${docId} (${name})`);
      updatedCount++;
    }
  }

  // Also check specific key products that might not have the tag
  const keyIds = ['finasteride', 'minoxidil', 'cetirizine-hcl', 'd-panthenol', 'latanoprost-fagron', 'dutasteride', 'spironolactone', 'trichosol', 'trichofoam', 'trichooil'];
  for (const id of keyIds) {
    const doc = await db.collection('products').doc(id).get();
    if (doc.exists) {
      const mono = FAGRON_CLINICAL_MONOGRAPHS[id] || getFagronClinicalMonograph(id);
      if (mono) {
        await doc.ref.update({
          clinicalDescription: mono.mechanismOfAction,
          mechanismOfAction: mono.mechanismOfAction,
          geneTargets: mono.geneTargets,
          clinicalIndication: mono.clinicalIndication,
          pharmacologicalClass: mono.pharmacologicalClass,
          compatibleVehicles: mono.compatibleVehicles,
          standardDosages: mono.standardDosages,
          updatedAt: new Date()
        });
        console.log(`🎯 Key API enriched: ${id}`);
      }
    }
  }

  console.log(`\n🎉 Successfully enriched ${updatedCount} Fagron products in Firestore!`);
}

run().catch(console.error);
