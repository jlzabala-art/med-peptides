"use server";

import { adminDb } from '../lib/firebaseAdmin';
import { normalizeApiName, scoreApiAgainstZohoItem, generateSuggestedSku } from '../lib/zohoApiMatcher';

const ZOHO_ORG_ID = '662274409'; // Mediluxe Health Solutions (UAE - AED)
const ZOHO_BOOKS_BASE = 'https://www.zohoapis.com/books/v3';
const ZOHO_BOOKS_BASE_ME = 'https://www.zohoapis.me/books/v3';

/**
 * Retrieves valid Zoho OAuth access token from Firestore cache
 */
async function getZohoAccessToken() {
  if (!adminDb) return null;
  try {
    const snapV2 = await adminDb.collection('zoho_token_cache').doc('access_token_v2').get();
    if (snapV2.exists && snapV2.data()?.access_token) {
      return snapV2.data().access_token;
    }
    const snapV1 = await adminDb.collection('zoho_token_cache').doc('access_token').get();
    if (snapV1.exists && snapV1.data()?.access_token) {
      return snapV1.data().access_token;
    }
  } catch (err) {
    console.warn('[zohoItemMatchingActions] Token read error:', err.message);
  }
  return null;
}

/**
 * Searches items in Zoho Books via REST API (ME and Global endpoints)
 */
export async function searchZohoBooksLiveItems(queryText) {
  if (!queryText || !queryText.trim()) return [];
  const token = await getZohoAccessToken();
  if (!token) return [];

  const cleanQuery = queryText.trim();
  const endpoints = [
    `${ZOHO_BOOKS_BASE}/items?organization_id=${ZOHO_ORG_ID}&search_text=${encodeURIComponent(cleanQuery)}&per_page=15`,
    `${ZOHO_BOOKS_BASE_ME}/items?organization_id=${ZOHO_ORG_ID}&search_text=${encodeURIComponent(cleanQuery)}&per_page=15`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.items) && json.items.length > 0) {
          return json.items.map(it => ({
            item_id: String(it.item_id),
            name: it.name || it.item_name || '',
            sku: it.sku || '',
            rate: parseFloat(it.rate) || 0,
            purchase_rate: parseFloat(it.purchase_rate) || 0,
            unit: it.unit || 'Piece',
            status: it.status || 'active',
            description: it.description || it.purchase_description || '',
            vendor_name: it.vendor_name || '',
            source: 'zoho_live'
          }));
        }
      }
    } catch (e) {
      // Continue to next endpoint fallback
    }
  }
  return [];
}

/**
 * Searches candidate Zoho items from both Firestore cached sku_mappings and live Zoho Books.
 */
export async function fetchZohoCandidateItemsAction(searchTerm = '') {
  const results = [];
  const seenIds = new Set();

  // 1. First consult local Firestore sku_mappings for instant response
  if (adminDb) {
    try {
      const snap = await adminDb.collection('sku_mappings').limit(150).get();
      snap.docs.forEach(docSnap => {
        const d = docSnap.data();
        const id = d.zoho_item_id || docSnap.id;
        const name = d.zoho_name || d.name || '';
        const sku = d.zoho_sku || d.sku || '';

        if (!seenIds.has(id)) {
          seenIds.add(id);
          results.push({
            item_id: String(id),
            name,
            sku,
            rate: parseFloat(d.zoho_sale_aed || d.sale_price || d.rate || 0),
            purchase_rate: parseFloat(d.zoho_purchase_rate || d.purchase_rate || 0),
            unit: d.unit || 'Piece',
            status: d.status || 'active',
            description: d.zoho_description || '',
            source: 'sku_mappings_cache'
          });
        }
      });
    } catch (err) {
      console.warn('[fetchZohoCandidateItemsAction] Cache query warning:', err.message);
    }
  }

  // 2. Query live Zoho Books if search term provided
  if (searchTerm && searchTerm.trim().length >= 2) {
    try {
      const liveItems = await searchZohoBooksLiveItems(searchTerm);
      liveItems.forEach(it => {
        if (!seenIds.has(it.item_id)) {
          seenIds.add(it.item_id);
          results.unshift(it); // Prioritize live hits
        }
      });
    } catch (err) {
      console.warn('[fetchZohoCandidateItemsAction] Live search warning:', err.message);
    }
  }

  return results;
}

/**
 * Matches all APIs of a prescription against the Zoho Master Dictionary and candidate items.
 */
export async function matchPrescriptionApisAction({ prescriptionId, apis = [] }) {
  if (!apis || !Array.isArray(apis) || apis.length === 0) {
    return { success: false, error: 'No APIs provided for matching.' };
  }

  try {
    // 1. Fetch current Master Dictionary from Firestore (Permanent Associations)
    const masterDictMap = new Map();
    if (adminDb) {
      const dictSnap = await adminDb.collection('zoho_api_dictionary').get();
      dictSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        masterDictMap.set(docSnap.id, data);
        if (data.api_raw_name) masterDictMap.set(data.api_raw_name.toLowerCase().trim(), data);
        if (data.core_name) masterDictMap.set(data.core_name.toLowerCase().trim(), data);
      });
    }

    // 2. Fetch Zoho pool of items
    const zohoPool = await fetchZohoCandidateItemsAction('');

    // 3. Process each API in the prescription
    const evaluatedApis = [];

    for (const rawApi of apis) {
      const rawName = typeof rawApi === 'string' ? rawApi : (rawApi.name || rawApi.productName || rawApi.activeIngredient || '');
      const rawDose = typeof rawApi === 'string' ? '' : (rawApi.dosage || rawApi.dose || rawApi.concentration || '');
      const normalized = normalizeApiName(rawName + (rawDose ? ` ${rawDose}` : ''));

      // Check Master Dictionary for persistent match
      const persistentMatch = masterDictMap.get(normalized.slug) ||
        masterDictMap.get(normalized.coreName.toLowerCase()) ||
        masterDictMap.get(rawName.toLowerCase().trim());

      let linkedItem = null;
      let isPersistent = false;

      if (persistentMatch) {
        isPersistent = true;
        linkedItem = {
          item_id: persistentMatch.zoho_item_id,
          name: persistentMatch.zoho_item_name,
          sku: persistentMatch.zoho_sku,
          rate: persistentMatch.zoho_rate,
          purchase_rate: persistentMatch.zoho_purchase_rate,
          unit: persistentMatch.unit || 'Piece',
          source: 'master_dictionary'
        };
      }

      // If not persistent, also query live Zoho with the core name if needed
      let candidatesPool = [...zohoPool];
      if (!isPersistent && normalized.coreName.length >= 3) {
        const liveHits = await searchZohoBooksLiveItems(normalized.coreName);
        if (liveHits.length > 0) {
          const idSet = new Set(candidatesPool.map(c => c.item_id));
          liveHits.forEach(lh => {
            if (!idSet.has(lh.item_id)) candidatesPool.unshift(lh);
          });
        }
      }

      // Score candidates
      const scoredCandidates = candidatesPool.map(item => {
        const scoreResult = scoreApiAgainstZohoItem(normalized, item);
        return {
          ...item,
          score: scoreResult.score,
          matchTier: scoreResult.matchTier,
          reasons: scoreResult.reasons
        };
      })
      .filter(c => c.score >= 35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

      const topCandidate = scoredCandidates[0] || null;

      evaluatedApis.push({
        rawInput: rawName,
        rawDose,
        coreName: normalized.coreName,
        dose: normalized.dose || rawDose,
        slug: normalized.slug,
        suggestedSku: generateSuggestedSku(normalized.coreName, normalized.dose || rawDose),
        isPersistent,
        linkedItem: linkedItem || (topCandidate && topCandidate.score >= 90 ? topCandidate : null),
        topScore: topCandidate ? topCandidate.score : 0,
        candidates: scoredCandidates
      });
    }

    return {
      success: true,
      prescriptionId,
      apis: evaluatedApis
    };
  } catch (err) {
    console.error('[matchPrescriptionApisAction] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Permanently confirms the association between an API and a Zoho Books item.
 * Writes to Firestore Master Dictionary AND updates the prescription document.
 */
export async function confirmApiZohoAssociationAction({
  apiRawName,
  apiDose = '',
  zohoItem,
  prescriptionId = null,
  userEmail = 'admin'
}) {
  if (!apiRawName || !zohoItem || !zohoItem.item_id) {
    return { success: false, error: 'Invalid association payload' };
  }

  const normalized = normalizeApiName(apiRawName + (apiDose ? ` ${apiDose}` : ''));
  const dictDocId = normalized.slug;

  const record = {
    api_slug: dictDocId,
    api_raw_name: apiRawName,
    core_name: normalized.coreName,
    dose: normalized.dose || apiDose,
    zoho_item_id: String(zohoItem.item_id),
    zoho_item_name: zohoItem.name || zohoItem.item_name || '',
    zoho_sku: zohoItem.sku || '',
    zoho_rate: parseFloat(zohoItem.rate) || 0,
    zoho_purchase_rate: parseFloat(zohoItem.purchase_rate) || 0,
    unit: zohoItem.unit || 'Piece',
    linked_by: userEmail,
    updated_at: new Date().toISOString()
  };

  try {
    if (!adminDb) throw new Error('Firestore adminDb unavailable');

    // 1. Write to Master Dictionary
    await adminDb.collection('zoho_api_dictionary').doc(dictDocId).set(record, { merge: true });

    // 2. Also register alias if coreName differs from slug
    const coreKey = normalized.coreName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (coreKey && coreKey !== dictDocId) {
      await adminDb.collection('zoho_api_dictionary').doc(coreKey).set(record, { merge: true });
    }

    // 3. Update prescription document if ID is provided
    if (prescriptionId) {
      const rxRef = adminDb.collection('prescriptions').doc(prescriptionId);
      const rxSnap = await rxRef.get();
      if (rxSnap.exists) {
        const rxData = rxSnap.data();
        let itemsModified = false;

        const updateLineItems = (items) => {
          if (!Array.isArray(items)) return items;
          return items.map(it => {
            const itName = it.name || it.productName || it.activeIngredient || '';
            const normIt = normalizeApiName(itName);
            if (normIt.slug === dictDocId || normIt.coreName.toLowerCase() === normalized.coreName.toLowerCase()) {
              itemsModified = true;
              return {
                ...it,
                zoho_item_id: String(zohoItem.item_id),
                zoho_item_name: zohoItem.name || zohoItem.item_name || '',
                zoho_sku: zohoItem.sku || '',
                zoho_rate: parseFloat(zohoItem.rate) || 0,
                zoho_purchase_rate: parseFloat(zohoItem.purchase_rate) || 0,
                zoho_linked_at: new Date().toISOString()
              };
            }
            return it;
          });
        };

        const updatedItems = updateLineItems(rxData.items || []);
        const updatedCompounds = updateLineItems(rxData.compounds || []);

        if (itemsModified) {
          await rxRef.update({
            items: updatedItems,
            compounds: updatedCompounds,
            updatedAt: new Date()
          });
        }
      }
    }

    return {
      success: true,
      message: `Asociación confirmada permanentemente: ${normalized.coreName} ↔ ${zohoItem.name}`,
      record
    };
  } catch (err) {
    console.error('[confirmApiZohoAssociationAction] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Creates a brand new item in Zoho Books, registers it, and establishes the permanent link.
 */
export async function createZohoItemAndAssociateAction({
  apiData,
  itemData,
  prescriptionId = null,
  userEmail = 'admin'
}) {
  const token = await getZohoAccessToken();
  if (!token) {
    return { success: false, error: 'No se pudo obtener el token de Zoho Books.' };
  }

  const payload = {
    name: (itemData.name || apiData.coreName || 'New API').trim(),
    sku: (itemData.sku || generateSuggestedSku(apiData.coreName, apiData.dose)).trim(),
    rate: parseFloat(itemData.rate) || 0,
    purchase_rate: parseFloat(itemData.purchase_rate) || 0,
    unit: itemData.unit || 'g',
    description: (itemData.description || `Active Pharmaceutical Ingredient (API): ${apiData.coreName}`).trim(),
    item_type: 'sales_and_purchases',
    product_type: 'goods',
    is_taxable: true
  };

  try {
    const res = await fetch(`${ZOHO_BOOKS_BASE}/items?organization_id=${ZOHO_ORG_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok || json.code !== 0 || !json.item) {
      if (json.code === 57 || json.message?.includes('not authorized')) {
        throw new Error("Zoho Books error (Código 57): El token OAuth actual no tiene permisos de creación en Zoho Books (falta scope ZohoBooks.settings.ALL o ZohoBooks.fullaccess.all).");
      }
      throw new Error(json.message || `Zoho Books API error HTTP ${res.status}`);
    }

    const createdZohoItem = {
      item_id: String(json.item.item_id),
      name: json.item.name || json.item.item_name || payload.name,
      sku: json.item.sku || payload.sku,
      rate: json.item.rate || payload.rate,
      purchase_rate: json.item.purchase_rate || payload.purchase_rate,
      unit: json.item.unit || payload.unit
    };

    // Permanently link in Master Dictionary & prescription
    await confirmApiZohoAssociationAction({
      apiRawName: apiData.rawInput || apiData.coreName,
      apiDose: apiData.dose || '',
      zohoItem: createdZohoItem,
      prescriptionId,
      userEmail
    });

    return {
      success: true,
      message: `Ítem creado en Zoho Books exitosamente y vinculado permanentemente.`,
      createdItem: createdZohoItem
    };
  } catch (err) {
    console.error('[createZohoItemAndAssociateAction] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing item in Zoho Books (e.g. adjusts name to include dosage, SKU, or rates)
 * and confirms the permanent association in the Master Dictionary and prescription.
 */
export async function updateZohoItemAndConfirmAction({
  itemId,
  updatedFields = {},
  apiData,
  prescriptionId = null,
  userEmail = 'admin'
}) {
  if (!itemId) return { success: false, error: 'No itemId provided for update.' };
  const token = await getZohoAccessToken();
  if (!token) return { success: false, error: 'No se pudo obtener el token de Zoho Books.' };

  const payload = {};
  if (updatedFields.name) payload.name = updatedFields.name.trim();
  if (updatedFields.sku) payload.sku = updatedFields.sku.trim();
  if (updatedFields.rate !== undefined) payload.rate = parseFloat(updatedFields.rate) || 0;
  if (updatedFields.purchase_rate !== undefined) payload.purchase_rate = parseFloat(updatedFields.purchase_rate) || 0;
  if (updatedFields.unit) payload.unit = updatedFields.unit.trim();
  if (updatedFields.description) payload.description = updatedFields.description.trim();

  try {
    const res = await fetch(`${ZOHO_BOOKS_BASE}/items/${itemId}?organization_id=${ZOHO_ORG_ID}`, {
      method: 'PUT',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok || json.code !== 0) {
      if (json.code === 57 || json.message?.includes('not authorized')) {
        throw new Error("Zoho Books error (Código 57): El token OAuth actual no tiene permisos de edición en Zoho Books (falta scope ZohoBooks.settings.UPDATE o ZohoBooks.fullaccess.all). Para vincular el ingrediente en Atlas sin modificar Zoho Books, pulsa 'Confirm Link'.");
      }
      throw new Error(json.message || `Error actualizando en Zoho Books HTTP ${res.status}`);
    }

    const itemResult = json.item || { ...payload, item_id: itemId };
    const updatedZohoItem = {
      item_id: String(itemResult.item_id || itemId),
      name: itemResult.name || payload.name,
      sku: itemResult.sku || payload.sku,
      rate: itemResult.rate || payload.rate,
      purchase_rate: itemResult.purchase_rate || payload.purchase_rate,
      unit: itemResult.unit || payload.unit
    };

    // Permanently link in Master Dictionary & prescription
    await confirmApiZohoAssociationAction({
      apiRawName: apiData.rawInput || apiData.coreName,
      apiDose: apiData.dose || '',
      zohoItem: updatedZohoItem,
      prescriptionId,
      userEmail
    });

    return {
      success: true,
      message: `Ítem actualizado en Zoho Books ('${updatedZohoItem.name}') y vinculado permanentemente.`,
      updatedItem: updatedZohoItem
    };
  } catch (err) {
    console.error('[updateZohoItemAndConfirmAction] Error:', err);
    return { success: false, error: err.message };
  }
}

