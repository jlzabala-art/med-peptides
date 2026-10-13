"use server";

import { adminDb } from '../lib/firebaseAdmin';
import { normalizeApiName, generateSuggestedSku, scoreApiAgainstZohoItem } from '../lib/zohoApiMatcher';

const ZOHO_ORG_ID = '662274409';
const ZOHO_BOOKS_BASE = 'https://www.zohoapis.com/books/v3';
const ZOHO_BOOKS_BASE_ME = 'https://www.zohoapis.me/books/v3';

/**
 * Retrieves valid Zoho OAuth access token from Firestore cache,
 * auto-refreshing via refresh_token when expired.
 */
async function getZohoAccessToken(forceRefresh = false) {
  if (!adminDb) return null;
  try {
    const now = Date.now();
    const snapV2 = await adminDb.collection('zoho_token_cache').doc('access_token_v2').get();
    const dataV2 = snapV2.exists ? snapV2.data() : null;

    if (!forceRefresh && dataV2?.access_token && (dataV2.expires_at || 0) > now + 300000) {
      const hasFullAccess = !dataV2.scope || dataV2.scope.includes('fullaccess') || dataV2.scope.includes('settings');
      if (hasFullAccess) return dataV2.access_token;
    }

    const snapV1 = await adminDb.collection('zoho_token_cache').doc('access_token').get();
    const dataV1 = snapV1.exists ? snapV1.data() : null;

    const refreshToken = dataV2?.refresh_token || dataV1?.refresh_token || process.env.ZOHO_REFRESH_TOKEN || "1000.92de7a39c249f4560c93ad0b6a0c7108.64db63b339313d85510db1266b7a3c82";
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
        await adminDb.collection('zoho_token_cache').doc('access_token_v2').set(updatePayload, { merge: true });
        return refreshed.access_token;
      }
    }
    return dataV2?.access_token || dataV1?.access_token || null;
  } catch (err) {
    console.warn('[zohoAutoIngestMatcher] Token read error:', err.message);
    return null;
  }
}

/**
 * Searches items in Zoho Books live API
 */
async function searchZohoItemLive(query, token) {
  if (!query || !query.trim() || !token) return null;
  const clean = encodeURIComponent(query.trim());
  const endpoints = [
    `${ZOHO_BOOKS_BASE}/items?organization_id=${ZOHO_ORG_ID}&search_text=${clean}&per_page=5`,
    `${ZOHO_BOOKS_BASE_ME}/items?organization_id=${ZOHO_ORG_ID}&search_text=${clean}&per_page=5`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.items) && json.items.length > 0) {
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
      // try next
    }
  }
  return null;
}

/**
 * Creates an item in Zoho Books, with retry on code 57 and fallback search on duplicate name/sku
 */
async function createZohoItem(payload, token) {
  const url = `${ZOHO_BOOKS_BASE}/items?organization_id=${ZOHO_ORG_ID}`;
  let res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let json = await res.json();
  if (json.code === 57 || res.status === 401) {
    const freshToken = await getZohoAccessToken(true);
    if (freshToken) {
      res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Zoho-oauthtoken ${freshToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      json = await res.json();
    }
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

  // Fallback if item or SKU already exists
  if (json.message?.toLowerCase().includes('already exists')) {
    const existingBySku = await searchZohoItemLive(payload.sku, token);
    if (existingBySku) return { success: true, item: existingBySku, alreadyExisted: true };
    const existingByName = await searchZohoItemLive(payload.name, token);
    if (existingByName) return { success: true, item: existingByName, alreadyExisted: true };
  }

  return { success: false, error: json.message || `HTTP ${res.status}` };
}

/**
 * Extracts and categorizes active APIs/compounds from a prescription object
 */
function extractPrescriptionApis(rx) {
  if (!rx) return [];
  const items = [];

  if (Array.isArray(rx.items) && rx.items.length > 0) {
    items.push(...rx.items);
  } else if (Array.isArray(rx.parts) && rx.parts.length > 0) {
    for (const p of rx.parts) {
      if (Array.isArray(p.apis) && p.apis.length > 0) items.push(...p.apis);
      else if (Array.isArray(p.items) && p.items.length > 0) items.push(...p.items);
      else if (Array.isArray(p.prescriptionLines) && p.prescriptionLines.length > 0) items.push(...p.prescriptionLines);
    }
  } else if (Array.isArray(rx.compounds) && rx.compounds.length > 0) {
    items.push(...rx.compounds);
  } else if (Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0) {
    items.push(...rx.prescriptionLines);
  } else if (Array.isArray(rx.apis) && rx.apis.length > 0) {
    items.push(...rx.apis);
  }

  return items.filter(it => Boolean(it && (it.name || it.drugName || it.productName || it.activeIngredient || it.title || it.zoho_item_id)));
}

/**
 * MAIN IMPORT PIPELINE:
 * Evaluates prescription APIs against Zoho Books during ingestion.
 * 
 * Rules:
 * 1. Matching = 100% -> Auto-links and stamps 'Zoho 100%'
 * 2. Matching Parcial (>0% y <100%) -> Links matched items, leaves unmatched for manual review
 * 3. Matching = 0% -> Auto-creates missing items in Zoho Books, registers dictionary, updates prescription to 100%
 */
export async function processPrescriptionZohoOnImport({
  prescriptionId,
  rxData,
  userEmail = 'system_import'
}) {
  if (!prescriptionId || !adminDb) {
    return { success: false, error: 'Prescription ID and database required' };
  }

  try {
    let rx = rxData;
    if (!rx) {
      const snap = await adminDb.collection('prescriptions').doc(prescriptionId).get();
      if (!snap.exists) return { success: false, error: 'Prescription not found' };
      rx = snap.data();
    }

    const validItems = extractPrescriptionApis(rx);
    if (validItems.length === 0) {
      return { success: true, status: 'no_apis', message: 'No compounded APIs found to match' };
    }

    const token = await getZohoAccessToken();
    const evaluationResults = [];

    // Step 1: Evaluate each item against zoho_api_dictionary and Zoho Books
    for (const it of validItems) {
      const rawName = it.name || it.drugName || it.productName || it.activeIngredient || it.title || '';
      const norm = normalizeApiName(rawName);
      const dose = norm.dose || it.dose || it.concentration || '';
      const canonicalKey = norm.slug || `${norm.coreName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${dose}`.trim();
      const suggestedSku = generateSuggestedSku(norm.coreName, dose);

      // Check if already linked on item
      if (it.zoho_item_id) {
        evaluationResults.push({
          rawItem: it,
          canonicalKey,
          norm,
          dose,
          suggestedSku,
          isMatched: true,
          zohoItem: {
            item_id: String(it.zoho_item_id),
            name: it.zoho_item_name || norm.coreName,
            sku: it.zoho_sku || suggestedSku,
            rate: it.zoho_rate || 0,
            purchase_rate: it.zoho_purchase_rate || 0,
            unit: it.unit || 'g'
          }
        });
        continue;
      }

      // Check zoho_api_dictionary
      let zohoItem = null;
      const dictSnap = await adminDb.collection('zoho_api_dictionary').doc(canonicalKey).get();
      if (dictSnap.exists && dictSnap.data()?.zoho_item_id) {
        const d = dictSnap.data();
        zohoItem = {
          item_id: d.zoho_item_id,
          name: d.zoho_item_name || norm.coreName,
          sku: d.zoho_sku || suggestedSku,
          rate: d.zoho_rate || 0,
          purchase_rate: d.zoho_purchase_rate || 0,
          unit: d.unit || 'g'
        };
      }

      // If not in dictionary, check Zoho Books live
      if (!zohoItem && token) {
        const liveFound = await searchZohoItemLive(norm.coreName, token);
        if (liveFound) {
          const scoreResult = scoreApiAgainstZohoItem(norm, liveFound);
          if (scoreResult.score >= 85) {
            zohoItem = liveFound;
          }
        }
      }

      evaluationResults.push({
        rawItem: it,
        canonicalKey,
        norm,
        dose,
        suggestedSku,
        isMatched: Boolean(zohoItem),
        zohoItem
      });
    }

    const matchedCount = evaluationResults.filter(r => r.isMatched).length;
    const totalCount = evaluationResults.length;
    const percent = Math.round((matchedCount / totalCount) * 100);

    const updatePrescriptionDoc = async (itemMap) => {
      const rxRef = adminDb.collection('prescriptions').doc(prescriptionId);
      const rxSnap = await rxRef.get();
      if (!rxSnap.exists) return;
      const data = rxSnap.data();

      const updateList = (arr) => {
        if (!Array.isArray(arr)) return arr;
        return arr.map(it => {
          const rawName = it.name || it.drugName || it.productName || it.activeIngredient || it.title || '';
          const norm = normalizeApiName(rawName);
          const key = norm.slug || `${norm.coreName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${norm.dose || ''}`.trim();
          const match = itemMap.get(key) || itemMap.get(norm.coreName.toLowerCase());

          if (match && match.item_id) {
            return {
              ...it,
              zoho_item_id: String(match.item_id),
              zoho_item_name: match.name,
              zoho_sku: match.sku,
              zoho_rate: match.rate || 0,
              zoho_purchase_rate: match.purchase_rate || 0,
              zoho_linked_at: new Date().toISOString()
            };
          }
          return it;
        });
      };

      const newItems = updateList(data.items || []);
      const newCompounds = updateList(data.compounds || []);
      const newLines = updateList(data.prescriptionLines || []);
      let newParts = data.parts;

      if (Array.isArray(data.parts)) {
        newParts = data.parts.map(p => ({
          ...p,
          ...(p.apis ? { apis: updateList(p.apis) } : {}),
          ...(p.items ? { items: updateList(p.items) } : {}),
          ...(p.prescriptionLines ? { prescriptionLines: updateList(p.prescriptionLines) } : {})
        }));
      }

      const updates = { updatedAt: new Date() };
      if (data.items) updates.items = newItems;
      if (data.compounds) updates.compounds = newCompounds;
      if (data.prescriptionLines) updates.prescriptionLines = newLines;
      if (data.parts) updates.parts = newParts;

      await rxRef.update(updates);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // CASE 1: MATCHING = 100% (Todos vinculados)
    // ─────────────────────────────────────────────────────────────────────────
    if (matchedCount === totalCount) {
      const itemMap = new Map();
      evaluationResults.forEach(r => {
        itemMap.set(r.canonicalKey, r.zohoItem);
        itemMap.set(r.norm.coreName.toLowerCase(), r.zohoItem);
      });
      await updatePrescriptionDoc(itemMap);

      return {
        success: true,
        status: 'fully_matched',
        percent: 100,
        matched: totalCount,
        total: totalCount,
        message: `Todos los APIs (${totalCount}/${totalCount}) sincronizados con Zoho Books.`
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CASE 2: MATCHING PARCIAL (1% a 99%) -> Dejar para prueba/revisión manual
    // ─────────────────────────────────────────────────────────────────────────
    if (matchedCount > 0 && matchedCount < totalCount) {
      // Link the matched ones to save progress, leave unmatched for manual inspection
      const itemMap = new Map();
      evaluationResults.filter(r => r.isMatched).forEach(r => {
        itemMap.set(r.canonicalKey, r.zohoItem);
        itemMap.set(r.norm.coreName.toLowerCase(), r.zohoItem);
      });
      await updatePrescriptionDoc(itemMap);

      return {
        success: true,
        status: 'partial_match',
        percent,
        matched: matchedCount,
        total: totalCount,
        message: `Matching parcial detectado (${matchedCount}/${totalCount} APIs). Pendiente de revisión manual en Zoho Matcher.`
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CASE 3: MATCHING CERO (0%) -> Auto-crear en Zoho Books
    // ─────────────────────────────────────────────────────────────────────────
    if (matchedCount === 0 && totalCount > 0) {
      if (!token) {
        return {
          success: false,
          status: 'token_error',
          error: 'No se pudo obtener token de Zoho Books para auto-crear ítems.'
        };
      }

      const itemMap = new Map();
      let createdCount = 0;

      for (const res of evaluationResults) {
        const displayName = res.dose ? `${res.norm.coreName} ${res.dose}` : res.norm.coreName;
        const payload = {
          name: displayName.trim(),
          sku: res.suggestedSku.trim(),
          rate: 0,
          purchase_rate: 0,
          unit: res.rawItem.unit || 'g',
          description: `Active Pharmaceutical Ingredient (API): ${displayName}`,
          item_type: 'sales_and_purchases',
          product_type: 'goods',
          is_taxable: true
        };

        const createRes = await createZohoItem(payload, token);
        if (createRes.success && createRes.item) {
          const zohoItem = createRes.item;
          itemMap.set(res.canonicalKey, zohoItem);
          itemMap.set(res.norm.coreName.toLowerCase(), zohoItem);
          createdCount++;

          // Register in dictionary
          await adminDb.collection('zoho_api_dictionary').doc(res.canonicalKey).set({
            api_slug: res.canonicalKey,
            api_raw_name: displayName,
            core_name: res.norm.coreName,
            dose: res.dose,
            zoho_item_id: String(zohoItem.item_id),
            zoho_item_name: zohoItem.name || displayName,
            zoho_sku: zohoItem.sku || res.suggestedSku,
            zoho_rate: 0,
            zoho_purchase_rate: 0,
            unit: zohoItem.unit || 'g',
            linked_by: userEmail,
            updated_at: new Date().toISOString()
          }, { merge: true });
        }
      }

      // Update the prescription document in Firestore
      await updatePrescriptionDoc(itemMap);

      return {
        success: true,
        status: 'auto_created_and_linked',
        percent: 100,
        matched: totalCount,
        total: totalCount,
        createdCount,
        message: `0% matching previo: se auto-crearon y vincularon ${createdCount} APIs en Zoho Books (100% sincronizado).`
      };
    }

    return { success: true, status: 'unknown' };
  } catch (err) {
    console.error('[processPrescriptionZohoOnImport] Error:', err);
    return { success: false, error: err.message };
  }
}
