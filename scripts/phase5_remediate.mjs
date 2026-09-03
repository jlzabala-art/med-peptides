#!/usr/bin/env node
/**
 * phase5_remediate.mjs
 * 
 * Fixes ALL issues from the audit:
 * 1. Create variants for products missing them
 * 2. Clean legacy supplier IDs → supplier-lotusland
 * 3. Fix pod-poland → supplier-pod-poland
 * 4. Normalize categories (Peptides → peptide, etc.)
 * 5. Assign type deduced from product context
 * 6. Assign status = active for products without status
 * 7. Migrate pricing to v2 schema (acquisition/retail/clinic/wholesale)
 * 8. Update denormalized supplierIds[]
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

const stats = {
  variantsCreated: 0,
  supplierIdsCleaned: 0,
  podPolandFixed: 0,
  categoriesNormalized: 0,
  typesAssigned: 0,
  statusesAssigned: 0,
  supplierIdsUpdated: 0,
  pricingMigrated: 0,
  pricingCreated: 0,
  errors: []
};

// ═══ 1. Create missing variants ══════════════════════════════════════════
async function fixMissingVariants() {
  console.log('\n━━━ 1. CREAR VARIANTES FALTANTES ━━━\n');
  
  const productsToFix = ['lion-s-mane-mushroom', 'serrapeptase-300-000spu'];
  
  for (const productId of productsToFix) {
    try {
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        console.log(`  ❌ Producto ${productId} no existe`);
        stats.errors.push(`Producto ${productId} no existe`);
        continue;
      }
      
      const product = productDoc.data();
      const variantId = `${productId}-default`;
      
      const existingVariant = await db.collection('products').doc(productId)
        .collection('variants').doc(variantId).get();
      
      if (existingVariant.exists) {
        console.log(`  ⏭️  ${productId} ya tiene variante ${variantId}`);
        continue;
      }
      
      const variantData = {
        productId,
        name: product.name || productId,
        label: product.name || productId,
        isDefault: true,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        _migratedBy: 'phase5_remediate',
        _migratedAt: new Date().toISOString()
      };
      
      if (product.dose) variantData.dose = product.dose;
      if (product.strength) variantData.strength = product.strength;
      if (product.form) variantData.form = product.form;
      if (product.unit) variantData.unit = product.unit;
      if (product.supplierId) variantData.supplierId = product.supplierId;
      if (product.sku) variantData.sku = product.sku;
      
      // Create with empty v2 pricing
      variantData.pricing = {
        acquisition: { currency: 'EUR', tiers: [], lastUpdated: new Date().toISOString() },
        retail: { currency: 'USD', tiers: [], lastUpdated: null },
        clinic: { currency: 'USD', tiers: [], lastUpdated: null },
        wholesale: { currency: 'USD', tiers: [], lastUpdated: null }
      };
      
      await db.collection('products').doc(productId)
        .collection('variants').doc(variantId).set(variantData);
      
      await db.collection('products').doc(productId).update({
        variantCount: 1,
        status: 'active',
        updatedAt: FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Variante creada: ${productId}/variants/${variantId}`);
      stats.variantsCreated++;
    } catch (err) {
      console.log(`  ❌ Error en ${productId}: ${err.message}`);
      stats.errors.push(`fixMissingVariants(${productId}): ${err.message}`);
    }
  }
}

// ═══ 2. Clean legacy supplier IDs ════════════════════════════════════════
async function cleanLegacySupplierIds() {
  console.log('\n━━━ 2. LIMPIAR SUPPLIER IDs LEGACY ━━━\n');
  
  // All legacy IDs → supplier-lotusland (user confirmed they're Lotusland dupes)
  const legacyIds = new Set([
    'lw90ZNykQHeBcUgFLnDs',
    'unknown',
    'DjxWAaZwr8FR02sKVfWl',
    'OLlBbQjgrj6tY7GmM2Jo'
  ]);
  
  const products = await db.collection('products').get();
  let processed = 0;
  
  for (const productDoc of products.docs) {
    const variants = await db.collection('products').doc(productDoc.id)
      .collection('variants').get();
    
    for (const variantDoc of variants.docs) {
      const variant = variantDoc.data();
      const supplierId = variant.supplierId;
      
      if (!supplierId) continue;
      
      if (legacyIds.has(supplierId)) {
        await variantDoc.ref.update({
          supplierId: 'supplier-lotusland',
          _previousSupplierId: supplierId,
          updatedAt: FieldValue.serverTimestamp()
        });
        stats.supplierIdsCleaned++;
      }
      else if (supplierId === 'pod-poland') {
        await variantDoc.ref.update({
          supplierId: 'supplier-pod-poland',
          _previousSupplierId: supplierId,
          updatedAt: FieldValue.serverTimestamp()
        });
        stats.podPolandFixed++;
        stats.supplierIdsCleaned++;
      }
    }
    
    processed++;
    if (processed % 100 === 0) {
      process.stdout.write(`  Procesados ${processed}/${products.size} productos...\r`);
    }
  }
  
  console.log(`  ✅ Supplier IDs limpiados: ${stats.supplierIdsCleaned}`);
  console.log(`     - Legacy IDs → supplier-lotusland: ${stats.supplierIdsCleaned - stats.podPolandFixed}`);
  console.log(`     - pod-poland → supplier-pod-poland: ${stats.podPolandFixed}`);
}

// ═══ 3. Normalize categories ═════════════════════════════════════════════
async function normalizeCategories() {
  console.log('\n━━━ 3. NORMALIZAR CATEGORÍAS ━━━\n');
  
  const categoryMap = {
    'Peptides': 'peptide',
    'Excipients & Vehicles': 'excipients_and_vehicles',
    'Nutraceutical / Functional Ingredients': 'nutraceutical',
    'Capsules & Consumables': 'capsules_and_consumables',
    'Immune Support': 'immune_support',
    'Biomarker Test': 'biomarker_test',
    'Prefilled Peptide Pens': 'prefilled_peptide_pens',
    'Metabolic & Weight': 'metabolic_and_weight',
    'Hormonal Optimization': 'hormonal_optimization',
    'Longevity & Anti-Aging': 'longevity_and_antiaging',
    'Cognitive & Mood': 'cognitive_and_mood',
    'Research Supplies': 'research_supplies',
    'Hair Loss & Androgenic': 'hair_loss_and_androgenic',
    'Recovery & Repair': 'recovery_and_repair',
    'Dermatology & Skin': 'dermatology_and_skin',
    'Sedatives & Anesthetics': 'sedatives_and_anesthetics',
    'Other Compounding Material': 'other_compounding_material',
    'Excipients & Bases': 'excipients_and_bases',
    'Adaptogens & Botanicals': 'adaptogens_and_botanicals',
    'Antimicrobials': 'antimicrobials',
    'Hormones & Endocrinology': 'hormones_and_endocrinology',
    'Metabolic & Blood Sugar': 'metabolic_and_blood_sugar',
    'Vitamins & Antioxidants': 'vitamins_and_antioxidants',
    'Other': 'other'
  };
  
  const products = await db.collection('products').get();
  
  for (const doc of products.docs) {
    const data = doc.data();
    const cat = data.category;
    
    if (cat && categoryMap[cat]) {
      await doc.ref.update({
        category: categoryMap[cat],
        _previousCategory: cat,
        updatedAt: FieldValue.serverTimestamp()
      });
      stats.categoriesNormalized++;
    }
  }
  
  console.log(`  ✅ Categorías normalizadas: ${stats.categoriesNormalized}`);
}

// ═══ 4. Assign type deduced from product ═════════════════════════════════
async function assignMissingTypes() {
  console.log('\n━━━ 4. ASIGNAR TYPES FALTANTES ━━━\n');
  
  const categoryToType = {
    'peptide': 'peptide',
    'api_raw_material': 'api_raw_material',
    'test_kit': 'testing',
    'dna_test': 'testing',
    'biomarker_test': 'testing',
    'blood_analysis': 'testing',
    'proteomics': 'testing',
    'subscription': 'subscription',
    'equipment': 'equipment',
    'immune_support': 'supplement',
    'metabolic_and_weight': 'supplement',
    'hormonal_optimization': 'supplement',
    'longevity_and_antiaging': 'supplement',
    'cognitive_and_mood': 'supplement',
    'hair_loss_and_androgenic': 'supplement',
    'recovery_and_repair': 'supplement',
    'dermatology_and_skin': 'supplement',
    'adaptogens_and_botanicals': 'supplement',
    'vitamins_and_antioxidants': 'supplement',
    'metabolic_and_blood_sugar': 'supplement',
    'nutraceutical': 'supplement',
    'excipients_and_vehicles': 'compounding_material',
    'excipients_and_bases': 'compounding_material',
    'other_compounding_material': 'compounding_material',
    'capsules_and_consumables': 'compounding_material',
    'sedatives_and_anesthetics': 'api_raw_material',
    'antimicrobials': 'api_raw_material',
    'hormones_and_endocrinology': 'api_raw_material',
    'research_supplies': 'compounding_material',
    'prefilled_peptide_pens': 'peptide',
    'other': 'other'
  };
  
  // Also try to infer from product name for products without category
  const namePatterns = [
    { pattern: /peptide|bpc|ghk|cjc|igf|ghrp|ipamorelin|semaglutide|tirzepatide|retatrutide|epithalon|selank|semax|mots-c|ss-31|thymosin|melanotan|pt-?141|dsip|aod-?9604|tesamorelin|sermorelin|foxo4|snap-?8|argireline|cerebrolysin|dihexa|nac|nad/i, type: 'peptide' },
    { pattern: /test|kit|panel|analysis|blood|biomarker|genetics|dna|genomic|proteomic/i, type: 'testing' },
    { pattern: /capsule|tablet|supplement|vitamin|mineral|probiotic|mushroom|ashwagandha|curcumin|berberine|quercetin|resveratrol|nmn|coq10|co-q10|omega|magnesium|zinc|lion.s.mane|serrapeptase/i, type: 'supplement' },
    { pattern: /syringe|needle|vial|bottle|bac.water|bacteriostatic|filter|swab/i, type: 'compounding_material' },
    { pattern: /bundle|pack|combo|kit/i, type: 'bundle' }
  ];
  
  const products = await db.collection('products').get();
  
  for (const doc of products.docs) {
    const data = doc.data();
    
    if (data.type) continue;
    
    const category = data.category;
    let inferredType = category ? categoryToType[category] : null;
    let inferredFrom = inferredType ? `category:${category}` : null;
    
    // If no type from category, try name patterns
    if (!inferredType && data.name) {
      for (const { pattern, type } of namePatterns) {
        if (pattern.test(data.name)) {
          inferredType = type;
          inferredFrom = `name:${data.name}`;
          break;
        }
      }
    }
    
    // If still no type, try the product ID
    if (!inferredType) {
      for (const { pattern, type } of namePatterns) {
        if (pattern.test(doc.id)) {
          inferredType = type;
          inferredFrom = `id:${doc.id}`;
          break;
        }
      }
    }
    
    if (inferredType) {
      await doc.ref.update({
        type: inferredType,
        _typeInferredFrom: inferredFrom,
        updatedAt: FieldValue.serverTimestamp()
      });
      stats.typesAssigned++;
    }
  }
  
  console.log(`  ✅ Types asignados: ${stats.typesAssigned}`);
}

// ═══ 5. Assign status = active ═══════════════════════════════════════════
async function assignMissingStatuses() {
  console.log('\n━━━ 5. ASIGNAR STATUS = active ━━━\n');
  
  const products = await db.collection('products').get();
  
  for (const doc of products.docs) {
    const data = doc.data();
    if (data.status) continue;
    
    await doc.ref.update({
      status: 'active',
      _statusAutoAssigned: true,
      updatedAt: FieldValue.serverTimestamp()
    });
    stats.statusesAssigned++;
  }
  
  console.log(`  ✅ Statuses asignados a 'active': ${stats.statusesAssigned}`);
}

// ═══ 6. Migrate pricing to v2 schema ═════════════════════════════════════
async function migratePricing() {
  console.log('\n━━━ 6. MIGRAR PRICING A SCHEMA V2 ━━━\n');
  
  // Supplier → default currency
  const supplierCurrencyMap = {
    'supplier-lotusland': 'USD',
    'supplier-nplabs': 'EUR',
    'supplier-europeptides': 'EUR',
    'supplier-bioniq': 'EUR',
    'supplier-pod-poland': 'EUR',
    'supplier-magenta': 'AED',
    'supplier-24genetics': 'EUR',
    'supplier-eternadx': 'EUR',
    'supplier-fusion': 'USD',
    'supplier-fagron-genomics': 'EUR',
    'supplier-vallida': 'EUR'
  };
  
  const products = await db.collection('products').get();
  let processed = 0;
  
  for (const productDoc of products.docs) {
    const variants = await db.collection('products').doc(productDoc.id)
      .collection('variants').get();
    
    for (const variantDoc of variants.docs) {
      const variant = variantDoc.data();
      const currentPricing = variant.pricing;
      
      // Case 1: Already has v2 pricing (has acquisition key) → skip
      if (currentPricing && currentPricing.acquisition) continue;
      
      // Case 2: Has v1 pricing (tiers with unitPrice) → migrate
      if (currentPricing && currentPricing.tiers && currentPricing.tiers.length > 0) {
        const supplierId = variant.supplierId || '';
        const supplierCurrency = supplierCurrencyMap[supplierId] || currentPricing.currency || 'USD';
        
        // Convert v1 tiers to acquisition tiers
        const acquisitionTiers = currentPricing.tiers.map(t => ({
          minQty: t.minQty || 1,
          maxQty: t.maxQty || null,
          unitCost: t.unitPrice || t.unitCost || 0
        }));
        
        const v2Pricing = {
          acquisition: {
            currency: supplierCurrency,
            tiers: acquisitionTiers,
            lastUpdated: currentPricing.lastUpdated || new Date().toISOString()
          },
          retail: { currency: 'USD', tiers: [], lastUpdated: null },
          clinic: { currency: 'USD', tiers: [], lastUpdated: null },
          wholesale: { currency: 'USD', tiers: [], lastUpdated: null }
        };
        
        await variantDoc.ref.update({
          pricing: v2Pricing,
          _pricingV1Backup: currentPricing,
          updatedAt: FieldValue.serverTimestamp()
        });
        stats.pricingMigrated++;
      }
      // Case 3: Has legacy pricing (clinic/retail flat) → migrate
      else if (currentPricing && (currentPricing.clinic !== undefined || currentPricing.retail !== undefined)) {
        const supplierId = variant.supplierId || '';
        const supplierCurrency = supplierCurrencyMap[supplierId] || 'USD';
        
        const v2Pricing = {
          acquisition: {
            currency: supplierCurrency,
            tiers: currentPricing.supplierCost ? [{ minQty: 1, maxQty: null, unitCost: currentPricing.supplierCost }] : [],
            lastUpdated: new Date().toISOString()
          },
          retail: {
            currency: 'USD',
            tiers: currentPricing.retail ? [{ minQty: 1, maxQty: null, unitPrice: currentPricing.retail }] : [],
            lastUpdated: currentPricing.retail ? new Date().toISOString() : null
          },
          clinic: {
            currency: 'USD',
            tiers: currentPricing.clinic ? [{ minQty: 1, maxQty: null, unitPrice: currentPricing.clinic }] : [],
            lastUpdated: currentPricing.clinic ? new Date().toISOString() : null
          },
          wholesale: {
            currency: 'USD',
            tiers: currentPricing.wholesale ? [{ minQty: 1, maxQty: null, unitPrice: currentPricing.wholesale }] : [],
            lastUpdated: currentPricing.wholesale ? new Date().toISOString() : null
          }
        };
        
        await variantDoc.ref.update({
          pricing: v2Pricing,
          _pricingLegacyBackup: currentPricing,
          updatedAt: FieldValue.serverTimestamp()
        });
        stats.pricingMigrated++;
      }
      // Case 4: No pricing at all → create empty v2 structure
      else if (!currentPricing || !currentPricing.tiers || currentPricing.tiers.length === 0) {
        // Skip if it already has the structure but empty tiers (already v2)
        if (currentPricing && currentPricing.acquisition) continue;
        
        const supplierId = variant.supplierId || '';
        const supplierCurrency = supplierCurrencyMap[supplierId] || 'USD';
        
        const v2Pricing = {
          acquisition: { currency: supplierCurrency, tiers: [], lastUpdated: null },
          retail: { currency: 'USD', tiers: [], lastUpdated: null },
          clinic: { currency: 'USD', tiers: [], lastUpdated: null },
          wholesale: { currency: 'USD', tiers: [], lastUpdated: null }
        };
        
        await variantDoc.ref.update({
          pricing: v2Pricing,
          updatedAt: FieldValue.serverTimestamp()
        });
        stats.pricingCreated++;
      }
    }
    
    processed++;
    if (processed % 100 === 0) {
      process.stdout.write(`  Procesados ${processed}/${products.size} productos...\r`);
    }
  }
  
  console.log(`  ✅ Pricing migrado a v2: ${stats.pricingMigrated}`);
  console.log(`  ✅ Pricing v2 creado (vacío): ${stats.pricingCreated}`);
}

// ═══ 7. Update denormalized supplierIds[] ═════════════════════════════════
async function updateDenormalizedSupplierIds() {
  console.log('\n━━━ 7. ACTUALIZAR supplierIds[] DENORMALIZADOS ━━━\n');
  
  const products = await db.collection('products').get();
  let updated = 0;
  let processed = 0;
  
  for (const productDoc of products.docs) {
    const variants = await db.collection('products').doc(productDoc.id)
      .collection('variants').get();
    
    const supplierIdSet = new Set();
    for (const v of variants.docs) {
      const sid = v.data().supplierId;
      if (sid) supplierIdSet.add(sid);
    }
    
    const supplierIds = [...supplierIdSet].sort();
    const currentIds = (productDoc.data().supplierIds || []).sort();
    
    if (JSON.stringify(supplierIds) !== JSON.stringify(currentIds)) {
      await productDoc.ref.update({
        supplierIds: supplierIds,
        updatedAt: FieldValue.serverTimestamp()
      });
      updated++;
    }
    
    processed++;
    if (processed % 100 === 0) {
      process.stdout.write(`  Procesados ${processed}/${products.size}...\r`);
    }
  }
  
  stats.supplierIdsUpdated = updated;
  console.log(`  ✅ supplierIds[] actualizados: ${updated}`);
}

// ═══ Main ════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     REMEDIACIÓN COMPLETA — Fase 5                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const start = Date.now();
  
  await fixMissingVariants();
  await cleanLegacySupplierIds();
  await normalizeCategories();
  await assignMissingTypes();
  await assignMissingStatuses();
  await migratePricing();
  await updateDenormalizedSupplierIds();
  
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('                     RESUMEN REMEDIACIÓN');
  console.log('══════════════════════════════════════════════════════════════\n');
  console.log(`  Variantes creadas:          ${stats.variantsCreated}`);
  console.log(`  Supplier IDs limpiados:     ${stats.supplierIdsCleaned}`);
  console.log(`  pod-poland corregidos:      ${stats.podPolandFixed}`);
  console.log(`  Categorías normalizadas:    ${stats.categoriesNormalized}`);
  console.log(`  Types asignados:            ${stats.typesAssigned}`);
  console.log(`  Statuses → active:          ${stats.statusesAssigned}`);
  console.log(`  Pricing migrado a v2:       ${stats.pricingMigrated}`);
  console.log(`  Pricing v2 creado (vacío):  ${stats.pricingCreated}`);
  console.log(`  supplierIds[] actualizados: ${stats.supplierIdsUpdated}`);
  console.log(`  Tiempo total:               ${elapsed}s`);
  
  if (stats.errors.length) {
    console.log(`\n  ❌ ERRORES (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`     - ${e}`));
  }
  
  console.log('\n══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
