import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// Paths to Zoho Books logs
const paths = {
  uaeItems: '/Users/joseluiszabala/.gemini/antigravity/brain/fe479ca6-3520-4166-bbf6-4ae3804a0b0c/.system_generated/steps/2805/output.txt',
  spainItems: '/Users/joseluiszabala/.gemini/antigravity/brain/fe479ca6-3520-4166-bbf6-4ae3804a0b0c/.system_generated/steps/2807/output.txt'
};

// String normalization logic for matching names
function normalizeString(str) {
  if (!str) return '';
  return str
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

// Extract peptide name from variant name
function matchPeptide(name) {
  if (!name) return null;
  const upper = name.toUpperCase();

  // Check if it's a blend/composite (excluding NAD+ which is a single molecule/peptide)
  const isBlend = upper.includes('+') && !upper.includes('NAD+');

  if (isBlend) {
    const hasBPC = upper.includes('BPC');
    const hasTB = upper.includes('TB') || upper.includes('THYMOSIN BETA') || upper.includes('THYMOSIN B4');
    const hasGHK = upper.includes('GHK');
    const hasKPV = upper.includes('KPV');
    const hasCJC = upper.includes('CJC');
    const hasIpamorelin = upper.includes('IPAMORELIN');

    if (hasBPC && hasTB && hasGHK && hasKPV) {
      return 'KLOW (BPC-157/TB-500/GHK-CU/KPV)';
    }
    if (hasBPC && hasTB && hasGHK) {
      return 'GLOW (BPC-157/TB-500/GHK-CU)';
    }
    if (hasBPC && hasTB) {
      return 'BPC-157 + TB-500';
    }
    if (hasCJC && hasIpamorelin && !upper.includes('BPC') && !upper.includes('SERMORELIN')) {
      return 'CJC-1295 WITHOUT DAC + IPAMORELIN';
    }
    return null;
  }

  // Single peptide mappings
  if (upper.includes('THYMOSIN BETA') || upper.includes('TB-500') || upper.includes('TB 500')) {
    return 'TB-500';
  }
  if (upper.includes('THYMOSIN ALPHA-1') || upper.includes('THYMOSIN ALPHA 1') || upper.includes('TA1')) {
    return 'THYMOSIN ALPHA 1';
  }
  if (upper.includes('THYMAGEN') || upper.includes('THYMOGEN')) {
    return 'THYMAGEN';
  }
  if (upper.includes('THYMALIN')) {
    return 'THYMULIN';
  }
  if (upper.includes('OXYTOCIN')) {
    return 'OXYTOCIN ACETATE';
  }
  if (upper.includes('GHK-CU') || upper.includes('GHK CU') || upper.includes('COPPER PEPTIDE')) {
    return 'GHK-CU (COPPER PEPTIDE)';
  }
  if (upper.includes('FOLLISTATIN 344') || upper.includes('FOLLISTATIN-344') || upper.includes('FST-344')) {
    return 'FST-344 (FOLLISTATIN)';
  }
  if (upper.includes('SS-31') || upper.includes('ELAMIPRETIDE')) {
    return 'SS-31';
  }
  if (upper.includes('PT-141') || upper.includes('BREMELANOTIDE')) {
    return 'PT-141 (BREMELANOTIDE)';
  }
  if (upper.includes('5-AMINO-1MQ') || upper.includes('5-AMINO 1MQ') || upper.includes('5AMINO1MQ')) {
    return '5-AMINO 1 MQ';
  }
  if (upper.includes('AOD 9604') || upper.includes('AOD-9604')) {
    return 'AOD-9604';
  }
  if (upper.includes('BPC-157') || upper.includes('BPC 157') || upper.includes('BPC157')) {
    return 'BPC-157';
  }
  if (upper.includes('SLU-PP-332') || upper.includes('SLU PP-332') || upper.includes('SLUPP332')) {
    return 'SLU PP-332';
  }
  if (upper.includes('MELANOTAN II') || upper.includes('MELANOTAN 2') || upper.includes('MELANOTAN-II') || upper.includes('MELANOTAN-2') || upper.includes('MT2') || upper.includes('MT-2')) {
    return 'MT2 (MELANOTAN II)';
  }
  if (upper.includes('MELANOTAN I') || upper.includes('MELANOTAN 1') || upper.includes('MELANOTAN-I') || upper.includes('MELANOTAN-1') || upper.includes('MT1') || upper.includes('MT-1')) {
    return 'MT2 (MELANOTAN II)';
  }
  if (upper.includes('CJC 1295 DAC') || upper.includes('CJC-1295 DAC') || upper.includes('CJC-1295 WITH DAC') || upper.includes('CJC 1295 WITH DAC')) {
    return 'CJC-1295 WITH DAC';
  }
  if (upper.includes('CJC 1295 NO DAC') || upper.includes('CJC-1295 NO DAC') || upper.includes('CJC-1295 WITHOUT DAC') || upper.includes('CJC 1295 WITHOUT DAC')) {
    return 'CJC-1295 WITHOUT DAC (MODIFIED GRF 1-29)';
  }

  // Strip generic suffixes/words to clean name
  let cleanName = upper
    .replace(/[0-9]+\s*(MG|MCG|IU|G|ML|%)/gi, '') // remove dosages
    .replace(/\b(VIAL|TABLET|CAPSULE|CREAM|GEL|PELLET|PUMP|SPRAY|IV|BOTTLE|KIT|AMP|AMPS|SINGLE|PACK|PCS|PIECES|HRT BASE|LIPOSOMAL BASE|NASAL|DROPS|CAPS)\b/gi, '') // remove formats
    .replace(/[^A-Z0-9+\s/()]/g, '') // remove special chars
    .replace(/\s+/g, ' ')
    .trim();

  return cleanName;
}

async function run() {
  console.log('====================================================');
  console.log('LOTUSLAND PRICING TEST BATTERY RUNNING...');
  console.log('====================================================\n');

  // Load Firestore Products
  const snap = await db.collection('products').where('supplier', '==', 'Lotusland').get();
  console.log(`[INIT] Loaded ${snap.size} Lotusland products from Firestore.\n`);

  const report = [];

  // ==========================================
  // TEST 1: FIRESTORE DIRECT PRICE AUDIT
  // ==========================================
  console.log('----------------------------------------------------');
  console.log('TEST 1: auditing active prices directly in Firestore...');
  console.log('----------------------------------------------------');
  let fsPricedCount = 0;
  
  snap.forEach(docSnap => {
    const p = docSnap.data();
    const baseCost = parseFloat(p.costPrice || p.cost_per_gram || p.cost || 0);
    
    const variants = p.variants || [];
    const variantPrices = [];
    
    variants.forEach(v => {
      const vCost = parseFloat(v.costPrice || v.cost || 0);
      if (vCost > 0) {
        variantPrices.push({ sku: v.sku || '', name: v.name || '', cost: vCost });
      }
    });

    const isPriced = baseCost > 0 || variantPrices.length > 0;
    if (isPriced) fsPricedCount++;

    report.push({
      id: docSnap.id,
      name: p.name,
      category: p.category || 'Peptides',
      sku: p.sku || '',
      firestoreCost: baseCost,
      firestoreVariants: variantPrices,
      sourcedCost: baseCost > 0 ? baseCost : (variantPrices.length > 0 ? variantPrices[0].cost : 0),
      sourcedVariants: variantPrices,
      source: baseCost > 0 ? 'Firestore (Base)' : (variantPrices.length > 0 ? 'Firestore (Variant)' : null),
      matchedName: p.name
    });
  });

  console.log(`- Total Lotusland Products: ${report.length}`);
  console.log(`- Products with active cost in Firestore: ${fsPricedCount} / ${report.length}`);
  const unpricedProducts = report.filter(r => !r.source);
  console.log(`- Unpriced Products: ${unpricedProducts.length} / ${report.length}\n`);

  // ==========================================
  // TEST 2: LOCAL v2 CATALOG MATCHING
  // ==========================================
  console.log('----------------------------------------------------');
  console.log('TEST 2: Sourcing from local v2 static catalog...');
  console.log('----------------------------------------------------');
  let v2MatchedCount = 0;
  
  // Load v2 catalogs
  let catalogV2 = [];
  let productsV2 = [];
  try {
    catalogV2 = JSON.parse(readFileSync('./src/data/v2/catalog.v2.json', 'utf8'));
    productsV2 = JSON.parse(readFileSync('./src/data/v2/products.v2.json', 'utf8'));
  } catch (e) {
    console.log('⚠️ Warning: could not read v2 catalog JSON files:', e.message);
  }

  const combinedV2 = [...catalogV2, ...productsV2];
  console.log(`- Loaded ${combinedV2.length} combined v2 catalog items.`);

  report.forEach(item => {
    if (item.source) return; // Already priced from Firestore

    const normalizedItemName = normalizeString(item.name);
    const cleanedItemPeptideName = normalizeString(matchPeptide(item.name));

    // Try to find a match in the v2 catalog
    const matchedV2 = combinedV2.find(v2 => {
      const v2NameNorm = normalizeString(v2.name);
      const v2IdNorm = normalizeString(v2.id);
      
      // Exact name match or exact ID match
      if (v2NameNorm === normalizedItemName || v2IdNorm === normalizedItemName) return true;
      
      // Cleaned peptide name matching
      const v2CleanPeptide = normalizeString(matchPeptide(v2.name));
      if (cleanedItemPeptideName && v2CleanPeptide === cleanedItemPeptideName) {
        // Match dosage/vial if specified
        if (item.name.toLowerCase().includes('vial') && v2.name.toLowerCase().includes('vial')) {
          // check if dosage matches
          const itemDosage = item.name.match(/\d+mg/i)?.[0];
          const v2Dosage = v2.name.match(/\d+mg/i)?.[0];
          return itemDosage === v2Dosage;
        }
        return true;
      }
      return false;
    });

    if (matchedV2 && matchedV2.pricing) {
      // Sourced price
      const wholesaleCost = parseFloat(matchedV2.pricing.wholesale?.perUnit || matchedV2.pricing.wholesale?.kit || 0);
      const masterCost = parseFloat(matchedV2.pricing.master?.perUnit || matchedV2.pricing.master?.kit || 0);
      const cost = wholesaleCost > 0 ? wholesaleCost : (masterCost > 0 ? masterCost : 0);

      if (cost > 0) {
        item.sourcedCost = cost;
        item.source = 'Local v2 Catalog';
        item.matchedName = matchedV2.name;
        item.v2Pricing = matchedV2.pricing;
        v2MatchedCount++;
      }
    }
  });

  console.log(`- Successfully matched and priced from v2 catalog: ${v2MatchedCount} items`);
  const stillUnpriced = report.filter(r => !r.source);
  console.log(`- Remaining Unpriced: ${stillUnpriced.length} / ${report.length}\n`);

  // ==========================================
  // TEST 3: ZOHO BOOKS CATALOG MATCHING
  // ==========================================
  console.log('----------------------------------------------------');
  console.log('TEST 3: Sourcing from Zoho Books active items...');
  console.log('----------------------------------------------------');
  let zohoMatchedCount = 0;
  
  // Load Zoho items
  let zohoItems = [];
  for (const [orgName, path] of Object.entries(paths)) {
    try {
      const data = JSON.parse(readFileSync(path, 'utf8'));
      if (data.items) {
        data.items.forEach(zi => {
          zohoItems.push({ ...zi, org: orgName.toUpperCase() });
        });
      }
    } catch (e) {
      console.log(`⚠️ Warning: could not load Zoho items for ${orgName}:`, e.message);
    }
  }

  console.log(`- Loaded ${zohoItems.length} active items from Zoho Books UAE & Spain logs.`);

  report.forEach(item => {
    if (item.source && item.source !== 'Local v2 Catalog') return; // Firestore takes absolute priority

    const normalizedItemName = normalizeString(item.name);
    const cleanedItemPeptideName = normalizeString(matchPeptide(item.name));

    // Try to find in Zoho items
    const matchedZoho = zohoItems.find(zi => {
      const ziNameNorm = normalizeString(zi.name);
      const ziSkuNorm = normalizeString(zi.sku);
      
      // SKU matching
      if (item.sku && ziSkuNorm === normalizeString(item.sku)) return true;

      // Exact name matching
      if (ziNameNorm === normalizedItemName) return true;

      // Cleaned peptide name matching
      const ziCleanPeptide = normalizeString(matchPeptide(zi.name));
      if (cleanedItemPeptideName && ziCleanPeptide === cleanedItemPeptideName) {
        // match dosage if specified
        const itemDosage = item.name.match(/\d+mg/i)?.[0];
        const ziDosage = zi.name.match(/\d+mg/i)?.[0];
        return itemDosage === ziDosage;
      }
      return false;
    });

    if (matchedZoho) {
      const purchaseRate = parseFloat(matchedZoho.purchase_rate || 0);
      if (purchaseRate > 0) {
        // If we already have a cost from local catalog, but Zoho has a purchase rate, Zoho takes priority
        item.sourcedCost = purchaseRate;
        item.source = `Zoho Books (${matchedZoho.org})`;
        item.matchedName = matchedZoho.name;
        item.zohoItemDetails = {
          item_id: matchedZoho.item_id,
          sku: matchedZoho.sku,
          name: matchedZoho.name,
          purchase_rate: purchaseRate,
          org: matchedZoho.org
        };
        zohoMatchedCount++;
      }
    }
  });

  console.log(`- Successfully matched and priced from Zoho Books: ${zohoMatchedCount} items`);
  const finalUnpriced = report.filter(r => !r.source);
  console.log(`- Final Unpriced: ${finalUnpriced.length} / ${report.length}\n`);

  // ==========================================
  // SUMMARY AND REPORTS COMPILATION
  // ==========================================
  console.log('====================================================');
  console.log('SUMMARY OF PRICING BATTERY');
  console.log('====================================================');
  
  const sourcesBreakdown = {};
  report.forEach(r => {
    const s = r.source || 'UNRESOLVED (GAP)';
    sourcesBreakdown[s] = (sourcesBreakdown[s] || 0) + 1;
  });

  Object.entries(sourcesBreakdown).forEach(([source, count]) => {
    const pct = ((count / report.length) * 100).toFixed(1);
    console.log(`- ${source}: ${count} (${pct}%)`);
  });

  const matchedTotal = report.length - (sourcesBreakdown['UNRESOLVED (GAP)'] || 0);
  const totalCoverage = ((matchedTotal / report.length) * 100).toFixed(1);
  console.log(`\nTotal Pricing Sourcing Coverage: ${totalCoverage}% (${matchedTotal} / ${report.length})`);

  // Save detailed report JSON
  writeFileSync('./scratch/lotusland_prices_report.json', JSON.stringify(report, null, 2));
  console.log('\nSaved full pricing report to: scratch/lotusland_prices_report.json');

  // Let's print unresolved items
  if (finalUnpriced.length > 0) {
    console.log('\n--- UNRESOLVED LOTUSLAND PRODUCTS (NO PRICES SOURCED) ---');
    finalUnpriced.forEach(u => {
      console.log(`* [${u.category}] "${u.name}" (ID: ${u.id})`);
    });
  }

  // Generate markdown report artifact
  const markdownReport = `# Reporte de Batería de Pruebas de Precios (Lotusland)

Este reporte detalla los resultados de la batería de pruebas de precios para conseguir los costos de **API Peptides** y **Peptide Vials** de Lotusland.

## Resumen de Cobertura de Precios

* **Total de Productos Lotusland**: ${report.length}
* **Precios Conseguidos**: ${matchedTotal} (${totalCoverage}%)
* **Gaps (Sin precio)**: ${finalUnpriced.length} (${(100 - totalCoverage).toFixed(1)}%)

### Desglose por Fuentes de Obtención

${Object.entries(sourcesBreakdown).map(([source, count]) => `- **${source}**: ${count} (${((count / report.length) * 100).toFixed(1)}%)`).join('\n')}

---

## Mapeos de Costo Destacados

A continuación se muestran ejemplos representativos de los precios de costo conciliados por categoría:

### API Peptides (Materia Prima a Granel)
${report.filter(r => r.category === 'API Peptide' && r.sourcedCost > 0).slice(0, 8).map(r => `* **${r.name}**: $${r.sourcedCost.toFixed(2)} por gramo (Fuente: ${r.source})`).join('\n')}

### Peptide Vials (Viales Terminados)
${report.filter(r => r.category !== 'API Peptide' && r.sourcedCost > 0).slice(0, 8).map(r => `* **${r.name}**: $${r.sourcedCost.toFixed(2)} por unidad/vial (Fuente: ${r.source})`).join('\n')}

---

## Gaps Identificados (Productos sin Precio)

Los siguientes productos de Lotusland **no** tienen ningún costo de compra en Firestore, en los catálogos v2 ni en Zoho Books. Deben ser cotizados manualmente:

${finalUnpriced.map(u => `* **[${u.category}]** ${u.name} (SKU: ${u.sku || 'N/A'}, ID: ${u.id})`).join('\n')}
`;

  writeFileSync('./scratch/lotusland_prices_report.md', markdownReport);
  console.log('Saved markdown report to: scratch/lotusland_prices_report.md');
}

run().catch(console.error);
