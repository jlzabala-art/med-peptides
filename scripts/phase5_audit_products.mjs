#!/usr/bin/env node
/**
 * phase5_audit_products.mjs
 * 
 * Comprehensive audit of the unified products collection.
 * Checks: single collection, variants per product, ID quality,
 * pricing, suppliers, categories, duplicates, and data integrity.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ─── Helpers ────────────────────────────────────────────────────────────
const isSlugId = (id) => /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(id) || /^[a-z0-9]+$/.test(id);
const isAutoGenId = (id) => /^[A-Za-z0-9]{20}$/.test(id);

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        AUDITORÍA COMPLETA — Colección products             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── 1. Verify single collection ────────────────────────────────────
  console.log('━━━ 1. VERIFICACIÓN DE COLECCIÓN ÚNICA ━━━\n');
  
  const legacyCollections = ['masterProducts', 'supplierOffers', 'supplierProducts', 'productVariants', 'supplements'];
  for (const col of legacyCollections) {
    const snap = await db.collection(col).limit(1).get();
    const status = snap.empty ? '✅ ELIMINADA' : `❌ EXISTE (${snap.size}+ docs)`;
    console.log(`  ${col}: ${status}`);
  }
  
  const productsSnap = await db.collection('products').get();
  console.log(`\n  products: ✅ ${productsSnap.size} documentos (COLECCIÓN CANÓNICA)`);

  // ── 2. Products analysis ───────────────────────────────────────────
  console.log('\n━━━ 2. ANÁLISIS DE PRODUCTOS ━━━\n');

  const products = [];
  const issues = { critical: [], warning: [], info: [] };
  
  // Counters
  let slugIds = 0, autoGenIds = 0, otherIds = 0;
  const categories = {};
  const types = {};
  const statuses = {};
  const nameMap = new Map(); // name → [ids] for duplicate detection
  const slugMap = new Map(); // slug → [ids]
  
  for (const d of productsSnap.docs) {
    const data = d.data();
    const id = d.id;
    
    // ID quality
    if (isSlugId(id)) slugIds++;
    else if (isAutoGenId(id)) { autoGenIds++; issues.warning.push(`Producto con ID auto-generado: ${id} (name: ${data.name || 'SIN NOMBRE'})`); }
    else otherIds++;
    
    // Category
    const cat = data.category || data.type || 'SIN CATEGORÍA';
    categories[cat] = (categories[cat] || 0) + 1;
    
    // Type
    const type = data.type || 'SIN TYPE';
    types[type] = (types[type] || 0) + 1;
    
    // Status
    const status = data.status || (data.isActive === false ? 'inactive' : data.isActive === true ? 'active' : 'SIN STATUS');
    statuses[status] = (statuses[status] || 0) + 1;
    
    // Name duplicates
    const name = (data.name || '').toLowerCase().trim();
    if (name) {
      if (!nameMap.has(name)) nameMap.set(name, []);
      nameMap.get(name).push(id);
    }
    
    // Slug duplicates
    const slug = (data.slug || '').toLowerCase().trim();
    if (slug) {
      if (!slugMap.has(slug)) slugMap.set(slug, []);
      slugMap.get(slug).push(id);
    }
    
    // Required fields check
    if (!data.name && !data.displayName) issues.critical.push(`${id}: Sin nombre (name/displayName)`);
    if (!data.category && !data.type) issues.warning.push(`${id}: Sin categoría ni type`);
    if (data.isActive === undefined && !data.status) issues.info.push(`${id}: Sin isActive ni status`);
    
    // Denormalized fields check
    if (!data.supplierIds || !Array.isArray(data.supplierIds)) issues.warning.push(`${id}: Sin supplierIds[] denormalizado`);
    if (data.variantCount === undefined) issues.warning.push(`${id}: Sin variantCount denormalizado`);
    
    products.push({ id, ...data });
  }
  
  console.log(`  Total productos: ${productsSnap.size}`);
  console.log(`  IDs slug (bueno): ${slugIds} (${(slugIds/productsSnap.size*100).toFixed(1)}%)`);
  console.log(`  IDs auto-generados: ${autoGenIds} (${(autoGenIds/productsSnap.size*100).toFixed(1)}%)`);
  console.log(`  IDs otros: ${otherIds}`);
  
  console.log('\n  Categorías:');
  Object.entries(categories).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`    ${v}x ${k}`));
  
  console.log('\n  Types:');
  Object.entries(types).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`    ${v}x ${k}`));
  
  console.log('\n  Statuses:');
  Object.entries(statuses).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`    ${v}x ${k}`));

  // ── 3. Duplicate detection ─────────────────────────────────────────
  console.log('\n━━━ 3. DETECCIÓN DE DUPLICADOS ━━━\n');
  
  let dupCount = 0;
  for (const [name, ids] of nameMap) {
    if (ids.length > 1) {
      dupCount++;
      issues.warning.push(`Nombre duplicado "${name}": ${ids.join(', ')}`);
      if (dupCount <= 10) console.log(`  ⚠️ "${name}" → ${ids.length} docs: ${ids.join(', ')}`);
    }
  }
  if (dupCount > 10) console.log(`  ... y ${dupCount - 10} duplicados más`);
  if (dupCount === 0) console.log('  ✅ No se detectaron nombres duplicados');
  console.log(`  Total nombres duplicados: ${dupCount}`);

  // ── 4. Variants analysis ───────────────────────────────────────────
  console.log('\n━━━ 4. ANÁLISIS DE VARIANTES ━━━\n');
  
  let totalVariants = 0;
  let productsWithZeroVariants = [];
  let productsWithOneVariant = 0;
  let productsWithMultipleVariants = 0;
  let maxVariants = { id: '', count: 0 };
  
  // Variant-level checks
  let varSlugIds = 0, varAutoGenIds = 0, varOtherIds = 0;
  let varWithPricing = 0, varWithoutPricing = 0;
  let varWithSupplierId = 0, varWithoutSupplierId = 0;
  let varWithSku = 0, varWithoutSku = 0;
  const supplierIdsInVariants = {};
  const pricingFormats = {};
  
  // Check variants for each product
  let batchCount = 0;
  for (const product of products) {
    const varsSnap = await db.collection('products').doc(product.id).collection('variants').get();
    const varCount = varsSnap.size;
    totalVariants += varCount;
    
    if (varCount === 0) {
      productsWithZeroVariants.push(product.id);
      issues.critical.push(`${product.id}: ❌ SIN VARIANTES (name: ${product.name || product.displayName || 'N/A'})`);
    } else if (varCount === 1) {
      productsWithOneVariant++;
    } else {
      productsWithMultipleVariants++;
    }
    
    if (varCount > maxVariants.count) maxVariants = { id: product.id, count: varCount };
    
    // Check denormalized variantCount accuracy
    if (product.variantCount !== undefined && product.variantCount !== varCount) {
      issues.warning.push(`${product.id}: variantCount (${product.variantCount}) ≠ real count (${varCount})`);
    }
    
    // Analyze each variant
    for (const vd of varsSnap.docs) {
      const vdata = vd.data();
      const vid = vd.id;
      
      // Variant ID quality
      if (isSlugId(vid)) varSlugIds++;
      else if (isAutoGenId(vid)) varAutoGenIds++;
      else varOtherIds++;
      
      // Pricing
      if (vdata.pricing && typeof vdata.pricing === 'object' && Object.keys(vdata.pricing).length > 0) {
        varWithPricing++;
        const keys = Object.keys(vdata.pricing).sort().join(',');
        pricingFormats[keys] = (pricingFormats[keys] || 0) + 1;
      } else {
        varWithoutPricing++;
      }
      
      // Supplier ID
      if (vdata.supplierId) {
        varWithSupplierId++;
        supplierIdsInVariants[vdata.supplierId] = (supplierIdsInVariants[vdata.supplierId] || 0) + 1;
      } else {
        varWithoutSupplierId++;
        issues.warning.push(`${product.id}/variants/${vid}: Sin supplierId`);
      }
      
      // SKU
      if (vdata.sku) varWithSku++;
      else varWithoutSku++;
    }
    
    batchCount++;
    if (batchCount % 100 === 0) process.stdout.write(`  Procesados ${batchCount}/${products.length} productos...\r`);
  }
  
  console.log(`  Total variantes: ${totalVariants}`);
  console.log(`  Productos con 0 variantes: ${productsWithZeroVariants.length} ${productsWithZeroVariants.length > 0 ? '❌' : '✅'}`);
  console.log(`  Productos con 1 variante: ${productsWithOneVariant}`);
  console.log(`  Productos con 2+ variantes: ${productsWithMultipleVariants}`);
  console.log(`  Producto con más variantes: ${maxVariants.id} (${maxVariants.count})`);
  
  if (productsWithZeroVariants.length > 0) {
    console.log('\n  ❌ Productos sin variantes (CRÍTICO):');
    productsWithZeroVariants.slice(0, 20).forEach(id => console.log(`    - ${id}`));
    if (productsWithZeroVariants.length > 20) console.log(`    ... y ${productsWithZeroVariants.length - 20} más`);
  }
  
  console.log('\n  IDs de variantes:');
  console.log(`    Slug: ${varSlugIds} (${(varSlugIds/totalVariants*100).toFixed(1)}%)`);
  console.log(`    Auto-generados: ${varAutoGenIds} (${(varAutoGenIds/totalVariants*100).toFixed(1)}%)`);
  console.log(`    Otros: ${varOtherIds}`);

  // ── 5. Pricing analysis ────────────────────────────────────────────
  console.log('\n━━━ 5. ANÁLISIS DE PRICING ━━━\n');
  
  console.log(`  Con pricing: ${varWithPricing} (${(varWithPricing/totalVariants*100).toFixed(1)}%)`);
  console.log(`  Sin pricing: ${varWithoutPricing} (${(varWithoutPricing/totalVariants*100).toFixed(1)}%)`);
  
  console.log('\n  Formatos de pricing detectados:');
  Object.entries(pricingFormats).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`    ${v}x [${k}]`));

  // ── 6. Supplier analysis ───────────────────────────────────────────
  console.log('\n━━━ 6. ANÁLISIS DE SUPPLIERS EN VARIANTES ━━━\n');
  
  console.log(`  Con supplierId: ${varWithSupplierId} (${(varWithSupplierId/totalVariants*100).toFixed(1)}%)`);
  console.log(`  Sin supplierId: ${varWithoutSupplierId} (${(varWithoutSupplierId/totalVariants*100).toFixed(1)}%)`);
  
  console.log('\n  Supplier IDs usados:');
  const sortedSuppliers = Object.entries(supplierIdsInVariants).sort((a,b)=>b[1]-a[1]);
  sortedSuppliers.forEach(([k,v]) => {
    const isLegacy = isAutoGenId(k) || k === 'unknown';
    const flag = isLegacy ? ' ⚠️ LEGACY/UNKNOWN' : (k.startsWith('supplier-') || k.startsWith('pod-') ? ' ✅' : ' ⚠️ NO-CONVENTION');
    console.log(`    ${v}x ${k}${flag}`);
  });
  
  console.log(`\n  Con SKU: ${varWithSku} (${(varWithSku/totalVariants*100).toFixed(1)}%)`);
  console.log(`  Sin SKU: ${varWithoutSku} (${(varWithoutSku/totalVariants*100).toFixed(1)}%)`);

  // ── 7. Supplier docs vs variant references ─────────────────────────
  console.log('\n━━━ 7. INTEGRIDAD SUPPLIER DOCS vs VARIANTES ━━━\n');
  
  const suppSnap = await db.collection('suppliers').get();
  const supplierDocs = new Set(suppSnap.docs.map(d => d.id));
  const referencedSuppliers = new Set(Object.keys(supplierIdsInVariants));
  
  // Supplier IDs referenced by variants but no doc
  const missingDocs = [...referencedSuppliers].filter(id => !supplierDocs.has(id) && id !== 'unknown');
  if (missingDocs.length > 0) {
    console.log('  ⚠️ Supplier IDs referenciados por variantes SIN documento supplier:');
    missingDocs.forEach(id => console.log(`    - ${id} (${supplierIdsInVariants[id]} variantes)`));
  } else {
    console.log('  ✅ Todos los supplier IDs referenciados tienen documento en suppliers/');
  }
  
  // Supplier docs without any variant references
  const orphanDocs = [...supplierDocs].filter(id => !referencedSuppliers.has(id));
  if (orphanDocs.length > 0) {
    console.log('\n  ℹ️ Docs en suppliers/ sin variantes que los referencien:');
    orphanDocs.forEach(id => console.log(`    - ${id}`));
  }

  // ── 8. Denormalized fields check ───────────────────────────────────
  console.log('\n━━━ 8. CAMPOS DENORMALIZADOS ━━━\n');
  
  let withSupplierIds = 0, withVariantCount = 0, withSkus = 0;
  let mismatchedVariantCount = 0;
  
  for (const p of products) {
    if (p.supplierIds && Array.isArray(p.supplierIds) && p.supplierIds.length > 0) withSupplierIds++;
    if (p.variantCount !== undefined) withVariantCount++;
    if (p.skus && Array.isArray(p.skus) && p.skus.length > 0) withSkus++;
  }
  
  console.log(`  supplierIds[]: ${withSupplierIds}/${productsSnap.size} (${(withSupplierIds/productsSnap.size*100).toFixed(1)}%)`);
  console.log(`  variantCount:  ${withVariantCount}/${productsSnap.size} (${(withVariantCount/productsSnap.size*100).toFixed(1)}%)`);
  console.log(`  skus[]:        ${withSkus}/${productsSnap.size} (${(withSkus/productsSnap.size*100).toFixed(1)}%)`);

  // ── 9. Legacy embedded variants[] check ────────────────────────────
  console.log('\n━━━ 9. LEGACY: ARRAYS variants[] EMBEBIDOS ━━━\n');
  
  let withEmbeddedVariants = 0;
  for (const p of products) {
    if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
      withEmbeddedVariants++;
    }
  }
  console.log(`  Productos con array variants[] embebido: ${withEmbeddedVariants} ${withEmbeddedVariants > 0 ? '⚠️ (LEGACY)' : '✅ LIMPIO'}`);

  // ── 10. Summary ────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(62));
  console.log('                        RESUMEN');
  console.log('═'.repeat(62) + '\n');
  
  console.log(`  ❌ CRÍTICOS: ${issues.critical.length}`);
  if (issues.critical.length > 0) {
    issues.critical.slice(0, 15).forEach(i => console.log(`     ${i}`));
    if (issues.critical.length > 15) console.log(`     ... y ${issues.critical.length - 15} más`);
  }
  
  console.log(`\n  ⚠️ WARNINGS: ${issues.warning.length}`);
  // Group warnings by type
  const warningTypes = {};
  issues.warning.forEach(w => {
    const type = w.includes('auto-generado') ? 'IDs auto-generados' :
                 w.includes('Sin supplierId') ? 'Sin supplierId' :
                 w.includes('Sin supplierIds') ? 'Sin supplierIds[] denormalizado' :
                 w.includes('Sin variantCount') ? 'Sin variantCount denormalizado' :
                 w.includes('Nombre duplicado') ? 'Nombres duplicados' :
                 w.includes('variantCount') ? 'variantCount mismatch' :
                 w.includes('Sin categoría') ? 'Sin categoría/type' :
                 'Otros';
    warningTypes[type] = (warningTypes[type] || 0) + 1;
  });
  Object.entries(warningTypes).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`     ${v}x ${k}`));
  
  console.log(`\n  ℹ️ INFO: ${issues.info.length}`);
  
  // Health score
  const critWeight = issues.critical.length * 10;
  const warnWeight = issues.warning.length * 1;
  const total = productsSnap.size + totalVariants;
  const healthScore = Math.max(0, 100 - (critWeight + warnWeight) / total * 100).toFixed(0);
  
  console.log(`\n  📊 HEALTH SCORE: ${healthScore}/100`);
  console.log(`     Productos: ${productsSnap.size} | Variantes: ${totalVariants} | Issues: ${issues.critical.length + issues.warning.length}`);
  
  console.log('\n' + '═'.repeat(62));
}

main().catch(console.error);
