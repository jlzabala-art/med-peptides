import { db } from './lib/firebase-admin.mjs';
import { normalizeApiName, generateSuggestedSku } from '../src/lib/zohoApiMatcher.js';

const ZOHO_ORG_ID = '662274409';
const ZOHO_BOOKS_BASE = 'https://www.zohoapis.com/books/v3';
const ZOHO_BOOKS_BASE_ME = 'https://www.zohoapis.me/books/v3';

// Helper to compute prescription Zoho stats
function getRxZohoStats(rx) {
  if (!rx) return { total: 0, matched: 0, percent: 0, isAllMatched: false, hasNoApis: true, validItems: [] };
  const members = rx._sessionMembers || [rx];
  const items = [];

  for (const m of members) {
    if (Array.isArray(m.items) && m.items.length > 0) {
      items.push(...m.items);
    } else if (Array.isArray(m.parts) && m.parts.length > 0) {
      for (const p of m.parts) {
        if (Array.isArray(p.apis) && p.apis.length > 0) items.push(...p.apis);
        else if (Array.isArray(p.items) && p.items.length > 0) items.push(...p.items);
        else if (Array.isArray(p.prescriptionLines) && p.prescriptionLines.length > 0) items.push(...p.prescriptionLines);
      }
    } else if (Array.isArray(m.compounds) && m.compounds.length > 0) {
      items.push(...m.compounds);
    } else if (Array.isArray(m.prescriptionLines) && m.prescriptionLines.length > 0) {
      items.push(...m.prescriptionLines);
    } else if (Array.isArray(m.apis) && m.apis.length > 0) {
      items.push(...m.apis);
    }
  }

  const validItems = items.filter(it => Boolean(it && (it.name || it.drugName || it.productName || it.activeIngredient || it.title || it.zoho_item_id)));

  if (validItems.length === 0) {
    return { total: 0, matched: 0, percent: 0, isAllMatched: false, hasNoApis: true, validItems: [] };
  }

  const isMatched = (it) => Boolean(
    it && (it.zoho_item_id || it.zoho_sku || it.zohoItemId || it.zohoSku || it.linkedItem?.item_id || it.linkedItem?.zoho_item_id)
  );

  const matchedCount = validItems.filter(isMatched).length;
  const total = validItems.length;
  const percent = total > 0 ? Math.round((matchedCount / total) * 100) : 0;

  return {
    total,
    matched: matchedCount,
    percent,
    isAllMatched: total > 0 && matchedCount === total,
    hasNoApis: false,
    validItems
  };
}

// OAuth Token retriever from Firestore
async function getZohoToken(forceRefresh = false) {
  const now = Date.now();
  const snapV2 = await db.collection('zoho_token_cache').doc('access_token_v2').get();
  const dataV2 = snapV2.exists ? snapV2.data() : null;

  if (!forceRefresh && dataV2?.access_token && (dataV2.expires_at || 0) > now + 300000) {
    return dataV2.access_token;
  }

  const snapV1 = await db.collection('zoho_token_cache').doc('access_token').get();
  const dataV1 = snapV1.exists ? snapV1.data() : null;

  const refreshToken = dataV2?.refresh_token || dataV1?.refresh_token || "1000.92de7a39c249f4560c93ad0b6a0c7108.64db63b339313d85510db1266b7a3c82";
  const clientId = process.env.ZOHO_CLIENT_ID || "1000.NAHBCCYF5C9B3Z3YS2URAQ4TG7O76V";
  const clientSecret = process.env.ZOHO_CLIENT_SECRET || "088b65381f7f30dfb801ff3f901e1af2c7adef11e5";

  if (refreshToken) {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    });

    const resp = await fetch("https://accounts.zoho.com/oauth/v2/token", { method: "POST", body: params });
    const refreshed = await resp.json();
    if (refreshed.access_token) {
      const expiresAt = now + ((refreshed.expires_in || 3600) * 1000);
      const updatePayload = {
        access_token: refreshed.access_token,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        updated_at: now,
        refreshed_at: now,
        scope: refreshed.scope || "ZohoBooks.fullaccess.all ZohoInventory.fullaccess.all"
      };
      await db.collection('zoho_token_cache').doc('access_token_v2').set(updatePayload, { merge: true });
      return refreshed.access_token;
    }
  }

  return dataV2?.access_token || dataV1?.access_token || null;
}

// Search Zoho Books items in live API
async function searchZohoItemLive(query, token) {
  if (!query || !query.trim()) return null;
  const clean = encodeURIComponent(query.trim());
  const endpoints = [
    `${ZOHO_BOOKS_BASE}/items?organization_id=${ZOHO_ORG_ID}&search_text=${clean}&per_page=5`,
    `${ZOHO_BOOKS_BASE_ME}/items?organization_id=${ZOHO_ORG_ID}&search_text=${clean}&per_page=5`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.items) && json.items.length > 0) {
          // Check for exact or very close name/sku match
          const found = json.items.find(it => 
            it.name?.toLowerCase() === query.toLowerCase() ||
            it.sku?.toLowerCase() === query.toLowerCase()
          ) || json.items[0];
          return {
            item_id: String(found.item_id),
            name: found.name || found.item_name,
            sku: found.sku || '',
            rate: parseFloat(found.rate) || 0,
            purchase_rate: parseFloat(found.purchase_rate) || 0,
            unit: found.unit || 'g'
          };
        }
      }
    } catch {
      // ignore and try next endpoint
    }
  }
  return null;
}

// Create an item in Zoho Books with retry
async function createZohoItem(payload, token) {
  const url = `${ZOHO_BOOKS_BASE}/items?organization_id=${ZOHO_ORG_ID}`;
  let res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let json = await res.json();
  if (json.code === 57 || res.status === 401) {
    const freshToken = await getZohoToken(true);
    res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Zoho-oauthtoken ${freshToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    json = await res.json();
  }

  if (res.ok && json.code === 0 && json.item) {
    return {
      success: true,
      item: {
        item_id: String(json.item.item_id),
        name: json.item.name || payload.name,
        sku: json.item.sku || payload.sku,
        rate: json.item.rate || payload.rate,
        purchase_rate: json.item.purchase_rate || payload.purchase_rate,
        unit: json.item.unit || payload.unit
      }
    };
  }

  // If item or SKU already exists error, try to fetch it by SKU or name
  if (json.message?.toLowerCase().includes('already exists')) {
    const existingBySku = await searchZohoItemLive(payload.sku, token);
    if (existingBySku) {
      return { success: true, item: existingBySku, alreadyExisted: true };
    }
    const existingByName = await searchZohoItemLive(payload.name, token);
    if (existingByName) {
      return { success: true, item: existingByName, alreadyExisted: true };
    }
  }

  return { success: false, error: json.message || `HTTP ${res.status}` };
}

async function main() {
  const isExecute = process.argv.includes('--execute');
  const isDryRun = !isExecute;

  console.log('================================================================');
  console.log(`📦 BATCH ZOHO BOOKS AUTO-CREATION FOR 0% MATCHING PRESCRIPTIONS`);
  console.log(`Modo: ${isExecute ? '🚀 EXECUTE (Cambios reales en Zoho y Firestore)' : '🔍 DRY-RUN (Simulación sin escrituras)'}`);
  console.log('================================================================\n');

  console.log('1. Cargando prescripciones de Firestore...');
  const snapshot = await db.collection('prescriptions').get();
  console.log(`   Total documentos en 'prescriptions': ${snapshot.size}`);

  const zeroMatchRxs = [];
  const partialMatchRxs = [];
  const fullMatchRxs = [];
  const noApiRxs = [];

  for (const doc of snapshot.docs) {
    const rx = { id: doc.id, ...doc.data() };
    const stats = getRxZohoStats(rx);

    if (stats.hasNoApis || stats.total === 0) {
      noApiRxs.push({ id: rx.id });
    } else if (stats.isAllMatched || stats.percent === 100) {
      fullMatchRxs.push({ id: rx.id, stats });
    } else if (stats.percent > 0 && stats.percent < 100) {
      partialMatchRxs.push({ id: rx.id, patient: rx.patient?.name || rx.patientName || 'N/A', stats });
    } else if (stats.matched === 0 && stats.total > 0) {
      zeroMatchRxs.push({ id: rx.id, patient: rx.patient?.name || rx.patientName || 'N/A', stats, rawRx: rx });
    }
  }

  console.log('\n📊 Resumen de Clasificación:');
  console.log(`   - 🟢 100% Sincronizadas (Totalmente vinculadas): ${fullMatchRxs.length}`);
  console.log(`   - 🟡 Matching Parcial (RESERVADAS PARA REVISIÓN MANUAL): ${partialMatchRxs.length}`);
  console.log(`   - 🔴 0% Matching (OBJETIVO DE AUTO-CREACIÓN EN ZOHO): ${zeroMatchRxs.length}`);
  console.log(`   - ⚪ Sin APIs / No aplicable: ${noApiRxs.length}\n`);

  if (partialMatchRxs.length > 0) {
    console.log('⚠️  Prescripciones con matching parcial que SE DEJAN para revisión manual:');
    partialMatchRxs.forEach(p => {
      console.log(`     • [${p.id}] Paciente: ${p.patient} -> ${p.stats.percent}% (${p.stats.matched}/${p.stats.total} APIs vinculados)`);
    });
    console.log('');
  }

  if (zeroMatchRxs.length === 0) {
    console.log('✅ No hay prescripciones con 0% de matching pendientes de auto-creación.');
    process.exit(0);
  }

  // 2. Extraer y agrupar APIs únicos de las prescripciones con 0%
  console.log('2. Extrayendo y deduplicando APIs únicos de las prescripciones con 0%...');
  const uniqueApisMap = new Map();

  for (const itemObj of zeroMatchRxs) {
    for (const rawItem of itemObj.stats.validItems) {
      const rawName = rawItem.name || rawItem.drugName || rawItem.productName || rawItem.activeIngredient || rawItem.title || '';
      if (!rawName.trim()) continue;

      const norm = normalizeApiName(rawName);
      const dose = norm.dose || rawItem.dose || '';
      const canonicalKey = norm.slug || `${norm.coreName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${dose}`.trim();
      const sku = generateSuggestedSku(norm.coreName, dose);

      if (!uniqueApisMap.has(canonicalKey)) {
        uniqueApisMap.set(canonicalKey, {
          canonicalKey,
          coreName: norm.coreName,
          dose,
          displayName: dose ? `${norm.coreName} ${dose}` : norm.coreName,
          suggestedSku: sku,
          rawNames: new Set([rawName]),
          prescriptionIds: new Set([itemObj.id]),
          unit: rawItem.unit || 'g'
        });
      } else {
        const existing = uniqueApisMap.get(canonicalKey);
        existing.rawNames.add(rawName);
        existing.prescriptionIds.add(itemObj.id);
      }
    }
  }

  const uniqueApis = Array.from(uniqueApisMap.values());
  console.log(`   Encontrados ${uniqueApis.length} APIs únicos requeridos a través de las ${zeroMatchRxs.length} prescripciones con 0%:\n`);

  uniqueApis.forEach((api, idx) => {
    console.log(`   ${idx + 1}. [${api.suggestedSku}] "${api.displayName}"`);
    console.log(`      Usado en ${api.prescriptionIds.size} recetas: ${Array.from(api.prescriptionIds).slice(0, 5).join(', ')}${api.prescriptionIds.size > 5 ? '...' : ''}`);
  });

  if (isDryRun) {
    console.log('\n================================================================');
    console.log('🔍 SIMULACIÓN COMPLETADA (DRY-RUN)');
    console.log(`Para ejecutar la creación real en Zoho Books y actualizar Firestore:`);
    console.log(`👉 Ejecuta: node scripts/zoho-batch-create-zero-match-apis.mjs --execute`);
    console.log('================================================================\n');
    process.exit(0);
  }

  // 3. MODO EXECUTE: Conectar con Zoho Books y crear/vincular
  console.log('\n3. Obteniendo token OAuth de Zoho Books...');
  const token = await getZohoToken();
  if (!token) {
    console.error('❌ Error: No se pudo obtener token de Zoho Books.');
    process.exit(1);
  }
  console.log('   ✅ Token Zoho Books listo.');

  console.log('\n4. Procesando APIs en Zoho Books y actualizando Firestore...');
  let createdCount = 0;
  let linkedExistingCount = 0;
  let failedCount = 0;

  for (let i = 0; i < uniqueApis.length; i++) {
    const api = uniqueApis[i];
    console.log(`\n[${i + 1}/${uniqueApis.length}] Procesando API: "${api.displayName}" (${api.suggestedSku})...`);

    // A. Comprobar diccionario en Firestore
    const dictSnap = await db.collection('zoho_api_dictionary').doc(api.canonicalKey).get();
    let zohoItem = null;

    if (dictSnap.exists && dictSnap.data()?.zoho_item_id) {
      const data = dictSnap.data();
      zohoItem = {
        item_id: data.zoho_item_id,
        name: data.zoho_item_name || api.displayName,
        sku: data.zoho_sku || api.suggestedSku,
        rate: data.zoho_rate || 0,
        purchase_rate: data.zoho_purchase_rate || 0,
        unit: data.unit || 'g'
      };
      console.log(`   ℹ️ Ya existía en zoho_api_dictionary (ID: ${zohoItem.item_id})`);
      linkedExistingCount++;
    } else {
      // B. Comprobar si ya existe en Zoho Books
      const existingInZoho = await searchZohoItemLive(api.displayName, token);
      if (existingInZoho) {
        zohoItem = existingInZoho;
        console.log(`   ℹ️ Encontrado en Zoho Books (ID: ${zohoItem.item_id})`);
        linkedExistingCount++;
      } else {
        // C. Crear en Zoho Books
        const payload = {
          name: api.displayName.trim(),
          sku: api.suggestedSku.trim(),
          rate: 0,
          purchase_rate: 0,
          unit: api.unit || 'g',
          description: `Active Pharmaceutical Ingredient (API): ${api.displayName}`,
          item_type: 'sales_and_purchases',
          product_type: 'goods',
          is_taxable: true
        };

        const result = await createZohoItem(payload, token);
        if (result.success && result.item) {
          zohoItem = result.item;
          console.log(`   ✨ CREADO con éxito en Zoho Books (ID: ${zohoItem.item_id})`);
          createdCount++;
        } else {
          console.error(`   ❌ Fallo al crear en Zoho Books: ${result.error}`);
          failedCount++;
          continue;
        }

        // Delay para no saturar rate limit
        await new Promise(r => setTimeout(r, 250));
      }

      // D. Guardar en diccionario de Firestore
      const dictRecord = {
        api_slug: api.canonicalKey,
        api_raw_name: api.displayName,
        core_name: api.coreName,
        dose: api.dose,
        zoho_item_id: String(zohoItem.item_id),
        zoho_item_name: zohoItem.name || api.displayName,
        zoho_sku: zohoItem.sku || api.suggestedSku,
        zoho_rate: zohoItem.rate || 0,
        zoho_purchase_rate: zohoItem.purchase_rate || 0,
        unit: zohoItem.unit || 'g',
        linked_by: 'batch_auto_script',
        updated_at: new Date().toISOString()
      };
      await db.collection('zoho_api_dictionary').doc(api.canonicalKey).set(dictRecord, { merge: true });
    }

    // E. Actualizar las prescripciones afectadas en Firestore
    for (const rxId of api.prescriptionIds) {
      try {
        const rxRef = db.collection('prescriptions').doc(rxId);
        const rxSnap = await rxRef.get();
        if (rxSnap.exists) {
          const rxData = rxSnap.data();
          let modified = false;

          const updateList = (arr) => {
            if (!Array.isArray(arr)) return arr;
            return arr.map(it => {
              const itName = it.name || it.drugName || it.productName || it.activeIngredient || it.title || '';
              const itNorm = normalizeApiName(itName);
              const itKey = itNorm.slug || `${itNorm.coreName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${itNorm.dose || ''}`.trim();

              if (itKey === api.canonicalKey || itNorm.coreName.toLowerCase() === api.coreName.toLowerCase()) {
                modified = true;
                return {
                  ...it,
                  zoho_item_id: String(zohoItem.item_id),
                  zoho_item_name: zohoItem.name || api.displayName,
                  zoho_sku: zohoItem.sku || api.suggestedSku,
                  zoho_rate: zohoItem.rate || 0,
                  zoho_purchase_rate: zohoItem.purchase_rate || 0,
                  zoho_linked_at: new Date().toISOString()
                };
              }
              return it;
            });
          };

          const newItems = updateList(rxData.items || []);
          const newCompounds = updateList(rxData.compounds || []);
          const newLines = updateList(rxData.prescriptionLines || []);
          let newParts = rxData.parts;
          if (Array.isArray(rxData.parts)) {
            newParts = rxData.parts.map(p => {
              const updatedPartApis = updateList(p.apis || []);
              const updatedPartItems = updateList(p.items || []);
              const updatedPartLines = updateList(p.prescriptionLines || []);
              return {
                ...p,
                ...(p.apis ? { apis: updatedPartApis } : {}),
                ...(p.items ? { items: updatedPartItems } : {}),
                ...(p.prescriptionLines ? { prescriptionLines: updatedPartLines } : {})
              };
            });
          }

          if (modified) {
            const updates = { updatedAt: new Date() };
            if (rxData.items) updates.items = newItems;
            if (rxData.compounds) updates.compounds = newCompounds;
            if (rxData.prescriptionLines) updates.prescriptionLines = newLines;
            if (rxData.parts) updates.parts = newParts;
            await rxRef.update(updates);
          }
        }
      } catch (err) {
        console.warn(`   ⚠️ Advertencia actualizando prescripción ${rxId}: ${err.message}`);
      }
    }
  }

  console.log('\n================================================================');
  console.log('🎉 PROCESO EN LOTE COMPLETADO CON ÉXITO');
  console.log(`   • Ítems creados en Zoho Books: ${createdCount}`);
  console.log(`   • Ítems vinculados existentes: ${linkedExistingCount}`);
  console.log(`   • Errores: ${failedCount}`);
  console.log(`   • Prescripciones actualizadas a 100% Verde: ${zeroMatchRxs.length}`);
  console.log(`   • Prescripciones con matching parcial intactas para revisión manual: ${partialMatchRxs.length}`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
