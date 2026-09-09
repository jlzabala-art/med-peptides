/**
 * scripts/batch_translate_peptides.mjs
 *
 * Pre-translates clinical peptide descriptions across Spanish (es), French (fr),
 * and German (de) and caches them in Firestore under `doc.aiContent.translations.{lang}`.
 * Features rate-pacing (13s between requests to stay within 5 RPM free tier) and
 * automatic retry with exponential backoff on 429 quota exhaustion.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

if (!getApps().length) {
  try {
    const svc = require(resolve(__dirname, '../serviceAccountKey.json'));
    initializeApp({ credential: cert(svc) });
  } catch {
    initializeApp();
  }
}
const db = getFirestore();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  console.error('❌ Missing GEMINI_API_KEY in environment.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🔍 Querying clinical peptide products from Firestore...');
  const snap = await db.collection('products').get();
  
  const allDocs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));
  
  // Filter for peptide products
  const peptides = allDocs.filter(p => 
    p.productType === 'peptide' || 
    p.category === 'Peptides' || 
    p.supplierId === 'lotusland' || 
    p.supplier === 'lotusland' ||
    (p.sku && p.sku.startsWith('LOT-'))
  );

  // Prioritize Lotusland clinical synthesis items first (the active public monographs)
  peptides.sort((a, b) => {
    const aIsLotus = a.supplierId === 'lotusland' || a.supplier === 'lotusland' || (a.sku && a.sku.startsWith('LOT-'));
    const bIsLotus = b.supplierId === 'lotusland' || b.supplier === 'lotusland' || (b.sku && b.sku.startsWith('LOT-'));
    if (aIsLotus && !bIsLotus) return -1;
    if (!aIsLotus && bIsLotus) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  console.log(`📋 Found ${peptides.length} peptide products in catalog (Lotusland prioritized).`);

  let translatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < peptides.length; i++) {
    const p = peptides[i];
    const name = p.name || p.canonicalName || p.id;
    const rawDesc = p.description || p.desc || p.objective || '';

    if (!rawDesc || rawDesc.trim().length < 10) {
      console.log(`⏭️  [${i + 1}/${peptides.length}] Skipping "${name}" (no substantive description)`);
      skippedCount++;
      continue;
    }

    const existingTranslations = p.aiContent?.translations || p.translations || {};
    const hasEs = !!existingTranslations.es?.description;
    const hasFr = !!existingTranslations.fr?.description;
    const hasDe = !!existingTranslations.de?.description;

    if (hasEs && hasFr && hasDe) {
      console.log(`✅ [${i + 1}/${peptides.length}] "${name}" already translated in all languages.`);
      skippedCount++;
      continue;
    }

    console.log(`🌐 [${i + 1}/${peptides.length}] Translating "${name}" into ES, FR, DE...`);

    const prompt = `You are an expert medical pharmacologist and clinical peptide translator.
Translate the following peptide clinical description into Spanish ("es"), French ("fr"), and German ("de").
Preserve all pharmacological precision, scientific metrics, molecular notation, and receptor nomenclature.
Return ONLY a valid JSON object with the exact structure:
{
  "es": { "description": "..." },
  "fr": { "description": "..." },
  "de": { "description": "..." }
}

English source text:
"""
${rawDesc}
"""`;

    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
      attempts++;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        if (!response.text) {
          throw new Error('Empty response from Gemini');
        }

        const parsed = JSON.parse(response.text);

        const updatePayload = {
          aiContent: {
            translations: {
              ...existingTranslations,
              es: {
                ...(existingTranslations.es || {}),
                description: parsed.es?.description || existingTranslations.es?.description || rawDesc,
              },
              fr: {
                ...(existingTranslations.fr || {}),
                description: parsed.fr?.description || existingTranslations.fr?.description || rawDesc,
              },
              de: {
                ...(existingTranslations.de || {}),
                description: parsed.de?.description || existingTranslations.de?.description || rawDesc,
              },
            },
          },
        };

        await p.ref.set(updatePayload, { merge: true });
        translatedCount++;
        success = true;
        console.log(`   ✨ Saved translations to Firestore for "${name}".`);

        // Pacing delay: 13 seconds between requests ensures we stay within the 5 req/min quota
        console.log(`   ⏳ Pacing pause (13s) to respect API quota...`);
        await sleep(13000);

      } catch (err) {
        const isQuota = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
        if (isQuota && attempts < 3) {
          console.warn(`   ⚠️ Quota limit encountered. Cooling down for 60 seconds before retry ${attempts}/3...`);
          await sleep(60000);
        } else {
          console.error(`   ❌ Failed to translate "${name}":`, err.message);
          failedCount++;
          await sleep(5000);
          break;
        }
      }
    }
  }

  console.log('\n=============================================');
  console.log('🎉 Translation Batch Summary:');
  console.log(`   - Newly Translated & Saved: ${translatedCount}`);
  console.log(`   - Already Cached / Skipped: ${skippedCount}`);
  console.log(`   - Failed: ${failedCount}`);
  console.log('=============================================\n');
}

main().catch(err => {
  console.error('Fatal batch translation error:', err);
  process.exit(1);
});
