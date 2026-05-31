"use strict";
/**
 * ai_sku_sync.js — AgentSkuSync
 *
 * AI-powered product matching between Firebase (atlas-health) and Zoho Books
 * (MEDILUXE HEALTH SOLUTIONS, org 662274409).
 *
 * Built on createAgent() factory — admin only.
 *
 * Modes:
 *  1. discover   — Fetch both catalogs, run AI matching, write pending sku_mappings
 *  2. confirm    — Admin confirms/rejects a match → status = "confirmed"|"rejected"
 *  3. push       — Push confirmed matches to Zoho Books (set cf_firebase_sku)
 *  4. status     — List current sku_mappings with stats
 */

const createAgent          = require("../agents/createAgent");
const { callGemini, structuredLogger } = require("./ai_utils");
const zoho                 = require("../lib/zoho_client");
const { FieldValue }       = require("firebase-admin/firestore");
const {
  ZOHO_FIRESTORE,
  ZOHO_CF_FIREBASE_SKU,
  ZOHO_CF_FIREBASE_ID,
  SYNC_STATUS,
  MATCH_METHOD,
  usdToAed,
} = require("../lib/zoho_config");
const { matchCatalogs }    = require("../lib/fuzzy_matcher");

const AGENT_ID   = "sku-sync-agent-001";
const AGENT_NAME = "AgentSkuSync";

// ── Firebase catalog loader ───────────────────────────────────────────────────
async function loadFirebaseProducts(db) {
  const productsSnap = await db.collection("products").get();
  const products = [];

  await Promise.all(
    productsSnap.docs.map(async (pdoc) => {
      const p = { id: pdoc.id, ...pdoc.data() };
      try {
        const variantsSnap = await db
          .collection("products").doc(pdoc.id)
          .collection("variants").get();

        if (!variantsSnap.empty) {
          variantsSnap.docs.forEach(vdoc => {
            const v = vdoc.data();
            products.push({
              firebase_product_id: pdoc.id,
              firebase_variant_id: vdoc.id,
              firebase_sku:        v.sku || p.sku || "",
              name:                `${p.displayName || p.name}${v.label ? ` (${v.label})` : ""}`,
              category:            p.category || p.classification?.categories?.[0] || "",
              description:         p.description || p.shortDescription || "",
              guest_usd:           parseFloat(v.price?.guest_usd) || 0,
            });
          });
        } else {
          products.push({
            firebase_product_id: pdoc.id,
            firebase_variant_id: null,
            firebase_sku:        p.sku || "",
            name:                p.displayName || p.name || "",
            category:            p.category || "",
            description:         p.description || p.shortDescription || "",
            guest_usd:           parseFloat(p.guestVialPrice) || 0,
          });
        }
      } catch (_) {
        // Variant read failed — use product-level data
        if (p.name) {
          products.push({
            firebase_product_id: pdoc.id,
            firebase_variant_id: null,
            firebase_sku:        p.sku || "",
            name:                p.displayName || p.name,
            category:            p.category || "",
            description:         "",
            guest_usd:           0,
          });
        }
      }
    })
  );

  return products.filter(p => p.name);
}

// ── AI matching prompt ────────────────────────────────────────────────────────
function buildMatchingPrompt(firebaseProducts, zohoItems) {
  const fbLines = firebaseProducts.map((p, i) =>
    `${i + 1}. [FB-${p.firebase_product_id.slice(-6)}] "${p.name}" | SKU: ${p.firebase_sku || "—"} | cat: ${p.category} | $${p.guest_usd}`
  ).join("\n");

  const zohoLines = zohoItems.map((z, i) =>
    `${i + 1}. [ZH-${z.item_id.slice(-6)}] "${z.name}" | SKU: ${z.sku || "—"} | cat: ${z.category_name || z.group_name || "—"} | rate: ${z.rate} AED`
  ).join("\n");

  return `You are a product catalog matching expert. Match Firebase products to Zoho Books items.

FIREBASE PRODUCTS (${firebaseProducts.length} items):
${fbLines}

ZOHO BOOKS ITEMS (${zohoItems.length} items, MEDILUXE, UAE):
${zohoLines}

TASK:
For each Firebase product that has a likely match in Zoho Books, return a JSON match.
Use product NAME similarity, category, description, and price range as signals.
Be conservative — only match when you're reasonably confident.

Return ONLY a JSON array:
[
  {
    "firebase_product_id": "<full Firebase product ID>",
    "firebase_sku": "<Firebase SKU>",
    "firebase_name": "<Firebase product name>",
    "zoho_item_id": "<full Zoho item_id>",
    "zoho_sku": "<Zoho SKU>",
    "zoho_name": "<Zoho item name>",
    "zoho_category": "<Zoho category name or group name if available, else empty>",
    "confidence": <0-100 integer>,
    "reasoning": "<1-2 sentences explaining the match>"
  }
]

Rules:
- confidence ≥ 85 → strong match
- confidence 60-84 → needs review  
- confidence < 60 → do NOT include
- If no good match exists for a Firebase product, omit it
- Do not invent matches — omit uncertain ones`;
}

// ── Discover mode ─────────────────────────────────────────────────────────────
async function discover(db, aedRate, useAI = true) {
  structuredLogger.info({ event: "sku_sync_discover_start", agentName: AGENT_NAME });

  const [firebaseProducts, zohoItems] = await Promise.all([
    loadFirebaseProducts(db),
    zoho.listAllItems({ filter_by: "Status.All" }),
  ]);

  structuredLogger.info({
    event: "sku_sync_catalogs_loaded",
    firebaseCount: firebaseProducts.length,
    zohoCount: zohoItems.length,
  });

  // ── Phase 1: Algorithmic matching (instant, no quota) ─────────────────────
  const algorithmicMatches = matchCatalogs(firebaseProducts, zohoItems, 55);

  structuredLogger.info({
    event: "sku_sync_algorithmic_done",
    totalMatches: algorithmicMatches.length,
    highConfidence: algorithmicMatches.filter(m => m.confidence >= 85).length,
    midConfidence:  algorithmicMatches.filter(m => m.confidence >= 60 && m.confidence < 85).length,
  });

  // ── Phase 2: Optional Gemini refinement for mid-confidence (60–84%) ───────
  let matches = algorithmicMatches;

  if (useAI) {
    const midMatches = algorithmicMatches.filter(m => m.confidence >= 60 && m.confidence < 85);
    if (midMatches.length > 0 && midMatches.length <= 30) {
      // Only refine small batches to avoid quota exhaustion
      try {
        const prompt = buildMatchingPrompt(
          midMatches.map(m => firebaseProducts.find(p => p.firebase_product_id === m.firebase_product_id)).filter(Boolean),
          zohoItems.filter(z => midMatches.some(m => m.zoho_item_id === z.item_id))
        );
        const raw = await callGemini(
          [{ role: "user", parts: [{ text: prompt }] }],
          "You are a product catalog matching assistant. Return only valid JSON arrays.",
          "gemini-2.0-flash", "text/plain", 2048
        );
        const aiMatches = JSON.parse(raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim());
        if (Array.isArray(aiMatches)) {
          // Merge: AI overrides algorithmic for same firebase_product_id if higher confidence
          const aiMap = Object.fromEntries(aiMatches.map(m => [m.firebase_product_id, m]));
          matches = algorithmicMatches.map(m =>
            aiMap[m.firebase_product_id] && aiMap[m.firebase_product_id].confidence > m.confidence
              ? { ...aiMap[m.firebase_product_id], match_method: "ai_refined" }
              : m
          );
          structuredLogger.info({ event: "sku_sync_ai_refined", refined: aiMatches.length });
        }
      } catch (aiErr) {
        // Gemini unavailable — proceed with algorithmic results only
        structuredLogger.warn({ event: "sku_sync_ai_skipped", reason: aiErr.message.slice(0, 100) });
      }
    }
  }

  // ── Phase 3: Persist matches to Firestore ─────────────────────────────────
  const batch = db.batch();
  const results = [];

  for (const match of matches) {
    const docId  = `${match.firebase_product_id}_${match.zoho_item_id}`;
    const docRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(docId);

    const existingDoc = await docRef.get();
    if (existingDoc.exists && existingDoc.data().status === SYNC_STATUS.CONFIRMED) {
      results.push({ ...match, status: SYNC_STATUS.CONFIRMED, existing: true });
      continue;
    }

    const fbProduct = firebaseProducts.find(p => p.firebase_product_id === match.firebase_product_id);
    const record = {
      firebase_product_id: match.firebase_product_id,
      firebase_variant_id: fbProduct?.firebase_variant_id || null,
      firebase_sku:        match.firebase_sku || "",
      firebase_name:       match.firebase_name,
      zoho_item_id:        match.zoho_item_id,
      zoho_sku:            match.zoho_sku || "",
      zoho_name:           match.zoho_name,
      zoho_category:       match.zoho_category || "",
      zoho_org_id:         "662274409",
      match_confidence:    match.confidence,
      match_reasoning:     match.reasoning,
      match_method:        match.match_method || (match.confidence >= 90 ? MATCH_METHOD.AI_AUTO : "pending_review"),
      status:              match.confidence >= 90 ? SYNC_STATUS.CONFIRMED : SYNC_STATUS.PENDING,
      cf_firebase_sku_set: false,
      guest_usd:           fbProduct?.guest_usd || 0,
      guest_aed:           usdToAed(fbProduct?.guest_usd || 0, aedRate),
      created_at:          FieldValue.serverTimestamp(),
      last_synced_at:      null,
    };

    batch.set(docRef, record, { merge: true });
    results.push({ ...record });
  }

  // ── Phase 4: Persist Unmapped Items ───────────────────────────────────────
  const unmappedZoho = zohoItems.filter(z => !matches.some(m => m.zoho_item_id === z.item_id));
  for (const z of unmappedZoho) {
    const docId = `unmapped_zoho_${z.item_id}`;
    const record = {
      firebase_product_id: null,
      firebase_name: "— Not in Firebase —",
      zoho_item_id: z.item_id,
      zoho_sku: z.sku || "",
      zoho_name: z.name,
      zoho_category: z.category_name || z.group_name || "",
      zoho_org_id: "662274409",
      status: "zoho_only",
      guest_aed: z.rate || 0,
      created_at: FieldValue.serverTimestamp(),
      last_synced_at: null,
    };
    batch.set(db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(docId), record, { merge: true });
    results.push(record);
  }

  const unmappedFirebase = firebaseProducts.filter(fb => !matches.some(m => m.firebase_product_id === fb.firebase_product_id));
  for (const fb of unmappedFirebase) {
    const docId = `unmapped_fb_${fb.firebase_product_id}${fb.firebase_variant_id ? '_' + fb.firebase_variant_id : ''}`;
    const record = {
      firebase_product_id: fb.firebase_product_id,
      firebase_variant_id: fb.firebase_variant_id || null,
      firebase_sku: fb.firebase_sku || fb.sku || "",
      firebase_name: fb.name,
      zoho_item_id: null,
      zoho_name: "— Not in Zoho —",
      status: "firebase_only",
      guest_usd: fb.guest_usd || 0,
      guest_aed: usdToAed(fb.guest_usd || 0, aedRate),
      created_at: FieldValue.serverTimestamp(),
      last_synced_at: null,
    };
    batch.set(db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(docId), record, { merge: true });
    results.push(record);
  }

  await batch.commit(); // Note: if total items > 500, we'll need chunking. Assuming < 500 for now.

  const autoConfirmed = results.filter(r => r.status === SYNC_STATUS.CONFIRMED).length;
  const needsReview   = results.filter(r => r.status === SYNC_STATUS.PENDING).length;

  return {
    matched:        matches.length,
    auto_confirmed: autoConfirmed,
    needs_review:   needsReview,
    unmapped_zoho:  unmappedZoho.length,
    unmapped_fb:    unmappedFirebase.length,
    firebase_total: firebaseProducts.length,
    candidates:    results,
  };
}

// ── Confirm/reject mode ───────────────────────────────────────────────────────
async function confirmMapping(db, { mappingId, action, adminNote }) {
  if (!mappingId || !["confirm", "reject"].includes(action)) {
    throw new Error("confirmMapping requires mappingId and action ('confirm'|'reject')");
  }

  const docRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId);
  const doc    = await docRef.get();
  if (!doc.exists) throw new Error(`Mapping ${mappingId} not found`);

  const newStatus = action === "confirm" ? SYNC_STATUS.CONFIRMED : SYNC_STATUS.REJECTED;
  await docRef.update({
    status:         newStatus,
    match_method:   MATCH_METHOD.ADMIN_CONFIRMED,
    admin_note:     adminNote || null,
    confirmed_at:   FieldValue.serverTimestamp(),
    last_error:     FieldValue.delete()
  });

  if (action === "confirm") {
    await pushBulk(db, { mappingIds: [mappingId] });
    const finalDoc = await docRef.get();
    return { mappingId, status: finalDoc.data().status };
  }

  return { mappingId, status: newStatus };
}

// ── Confirm/reject bulk mode ──────────────────────────────────────────────────
async function confirmBulk(db, { mappingIds, action, adminNote }) {
  if (!Array.isArray(mappingIds) || mappingIds.length === 0 || !["confirm", "reject"].includes(action)) {
    throw new Error("confirmBulk requires mappingIds (array) and action ('confirm'|'reject')");
  }

  const newStatus = action === "confirm" ? SYNC_STATUS.CONFIRMED : SYNC_STATUS.REJECTED;
  const batch = db.batch();

  for (const mappingId of mappingIds) {
    const docRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId);
    batch.update(docRef, {
      status:         newStatus,
      match_method:   MATCH_METHOD.ADMIN_CONFIRMED,
      admin_note:     adminNote || null,
      confirmed_at:   FieldValue.serverTimestamp(),
      last_error:     FieldValue.delete()
    });
  }

  await batch.commit();

  if (action === "confirm") {
    await pushBulk(db, { mappingIds });
    return { mappingIds, status: SYNC_STATUS.SYNCED }; // assuming it goes to synced or error
  }

  return { mappingIds, status: newStatus };
}

// ── Push mode: write Firebase SKU to Zoho custom field ───────────────────────
async function pushToZoho(db, { dryRun = false } = {}) {
  const confirmedSnap = await db
    .collection(ZOHO_FIRESTORE.SKU_MAPPINGS)
    .where("status", "==", SYNC_STATUS.CONFIRMED)
    .where("cf_firebase_sku_set", "==", false)
    .get();

  if (confirmedSnap.empty) {
    return { pushed: 0, message: "No pending confirmed mappings to push." };
  }

  let pushed = 0, failed = 0;
  const errors = [];

  for (const doc of confirmedSnap.docs) {
    const mapping = doc.data();
    if (dryRun) {
      structuredLogger.info({ event: "sku_sync_dry_run", mapping_id: doc.id, firebase_sku: mapping.firebase_sku });
      pushed++;
      continue;
    }

    try {
      await zoho.updateItem(mapping.zoho_item_id, {
        sku: mapping.firebase_sku,
        custom_fields: [
          { label: ZOHO_CF_FIREBASE_SKU, value: mapping.firebase_sku },
          { label: ZOHO_CF_FIREBASE_ID, value: mapping.firebase_product_id }
        ]
      });

      await doc.ref.update({
        status:              SYNC_STATUS.SYNCED,
        cf_firebase_sku_set: true,
        zoho_sku:            mapping.firebase_sku,
        last_synced_at:      FieldValue.serverTimestamp(),
        last_error:          FieldValue.delete()
      });

      // Also write zoho_item_id back to Firebase product
      if (mapping.firebase_product_id) {
        await db.doc(`products/${mapping.firebase_product_id}`)
          .update({ zoho_item_id: mapping.zoho_item_id, zoho_org_id: "662274409" })
          .catch(() => {/* non-fatal — product may not exist */});
      }

      await zoho.logSyncEvent({
        event:     "sku_pushed_to_zoho",
        mapping_id: doc.id,
        firebase_sku: mapping.firebase_sku,
        zoho_item_id: mapping.zoho_item_id,
      });

      pushed++;
    } catch (err) {
      failed++;
      errors.push({ mapping_id: doc.id, error: err.message });
      await doc.ref.update({ status: SYNC_STATUS.ERROR, last_error: err.message });
    }
  }

  return { pushed, failed, errors, dryRun };
}

// ── Push bulk mode: write specific Firebase SKUs to Zoho custom fields ───────
async function pushBulk(db, { mappingIds, dryRun = false }) {
  if (!Array.isArray(mappingIds) || mappingIds.length === 0) {
    throw new Error("pushBulk requires mappingIds (array)");
  }

  let pushed = 0, failed = 0;
  const errors = [];

  for (const mappingId of mappingIds) {
    const docRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) continue;

    const mapping = docSnap.data();
    if (mapping.status !== SYNC_STATUS.CONFIRMED) continue;

    if (dryRun) {
      structuredLogger.info({ event: "sku_sync_bulk_dry_run", mapping_id: mappingId, firebase_sku: mapping.firebase_sku });
      pushed++;
      continue;
    }

    try {
      await zoho.updateItem(mapping.zoho_item_id, {
        sku: mapping.firebase_sku,
        custom_fields: [
          { label: ZOHO_CF_FIREBASE_SKU, value: mapping.firebase_sku },
          { label: ZOHO_CF_FIREBASE_ID, value: mapping.firebase_product_id }
        ]
      });

      await docRef.update({
        status:              SYNC_STATUS.SYNCED,
        cf_firebase_sku_set: true,
        zoho_sku:            mapping.firebase_sku,
        last_synced_at:      FieldValue.serverTimestamp(),
        last_error:          FieldValue.delete()
      });

      // Also write zoho_item_id back to Firebase product
      if (mapping.firebase_product_id) {
        await db.doc(`products/${mapping.firebase_product_id}`)
          .update({ 
            zoho_item_id: mapping.zoho_item_id, 
            zoho_org_id: "662274409",
            ...(mapping.zoho_category ? { zoho_category: mapping.zoho_category } : {})
          })
          .catch(() => {/* non-fatal */});
      }

      await zoho.logSyncEvent({
        event:     "sku_pushed_to_zoho_bulk",
        mapping_id: mappingId,
        firebase_sku: mapping.firebase_sku,
        zoho_item_id: mapping.zoho_item_id,
      });

      pushed++;
    } catch (err) {
      failed++;
      errors.push({ mapping_id: mappingId, error: err.message });
      await docRef.update({ status: SYNC_STATUS.ERROR, last_error: err.message });
    }
  }

  return { pushed, failed, errors, dryRun };
}

// ── Refetch manual edits mode ────────────────────────────────────────────────
async function refetchSingle(db, { mappingId, zoho_item_id, userProfile }) {
  if (!mappingId || !zoho_item_id) {
    throw new Error("refetch requires mappingId and zoho_item_id");
  }

  const docRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) throw new Error(`Mapping ${mappingId} not found`);

  const oldData = docSnap.data();

  // Fetch from Zoho Books API
  structuredLogger.info({ event: "zoho_refetch_item_start", zoho_item_id });
  const item = await zoho.getItem(zoho_item_id);
  if (!item) throw new Error(`Item ${zoho_item_id} not found in Zoho Books`);

  // Extract Zoho SKU and Name
  const newZohoSku = item.sku || "";
  const newZohoName = item.name || "";
  const newZohoCategory = item.category_name || item.group_name || "";
  const newRate = item.rate || 0;

  // Update in Firestore sku_mappings
  const updates = {
    zoho_sku: newZohoSku,
    zoho_name: newZohoName,
    zoho_category: newZohoCategory,
    guest_aed: newRate, // update AED rate
    last_synced_at: FieldValue.serverTimestamp()
  };

  await docRef.update(updates);

  // Write sync audit log
  const adminEmail = userProfile?.email || "admin@regenpept.test";
  const logCollection = db.collection(ZOHO_FIRESTORE.SYNC_LOG);
  await logCollection.add({
    event: "manual_sku_edit_synced",
    mapping_id: mappingId,
    zoho_item_id: zoho_item_id,
    old_sku: oldData.zoho_sku || "",
    new_sku: newZohoSku,
    old_name: oldData.zoho_name || "",
    new_name: newZohoName,
    operator: adminEmail,
    timestamp: FieldValue.serverTimestamp()
  });

  return {
    mappingId,
    zoho_item_id,
    oldSku: oldData.zoho_sku || "",
    newSku: newZohoSku,
    oldName: oldData.zoho_name || "",
    newName: newZohoName,
    updated: (oldData.zoho_sku !== newZohoSku || oldData.zoho_name !== newZohoName)
  };
}

// ── Manual Force Match ───────────────────────────────────────────────────────
async function forceMatch(db, { mappingId, zoho_item_id, userProfile }) {
  if (!mappingId || !zoho_item_id) {
    throw new Error("force_match requires mappingId and zoho_item_id");
  }

  const docRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) throw new Error(`Mapping ${mappingId} not found`);

  structuredLogger.info({ event: "force_match_start", mappingId, zoho_item_id });

  // Fetch the Zoho item to get its details
  const item = await zoho.getItem(zoho_item_id);
  if (!item) throw new Error(`Item ${zoho_item_id} not found in Zoho Books`);

  const updates = {
    zoho_item_id: item.item_id,
    zoho_sku: item.sku || "",
    zoho_name: item.name || "",
    zoho_category: item.category_name || item.group_name || "",
    guest_aed: item.rate || 0,
    status: SYNC_STATUS.CONFIRMED, // Force match automatically confirms it
    match_confidence: 100,
    match_method: MATCH_METHOD.MANUAL,
    match_reasoning: "Manually linked by administrator",
    last_synced_at: FieldValue.serverTimestamp(),
    last_error: FieldValue.delete()
  };

  await docRef.update(updates);

  // Audit log
  const adminEmail = userProfile?.email || "admin@regenpept.test";
  await db.collection(ZOHO_FIRESTORE.SYNC_LOG).add({
    event: "manual_force_match",
    mapping_id: mappingId,
    zoho_item_id: item.item_id,
    admin: adminEmail,
    timestamp: FieldValue.serverTimestamp()
  });

  // Automatically push to Zoho Books
  await pushBulk(db, { mappingIds: [mappingId] });
  
  const finalDoc = await docRef.get();
  
  return {
    mappingId,
    zoho_item_id: item.item_id,
    status: finalDoc.data().status
  };
}

// ── Import from Zoho to Firebase ──────────────────────────────────────────────
async function importZohoItem(db, { zoho_item_id, userProfile, aedRate }) {
  if (!zoho_item_id) throw new Error("zoho_item_id is required");
  
  structuredLogger.info({ event: "zoho_import_start", zoho_item_id });
  
  // Fetch from Zoho Books API
  const item = await zoho.getItem(zoho_item_id);
  if (!item) throw new Error(`Item ${zoho_item_id} not found in Zoho Books`);

  // Create Firebase product ID based on Zoho item ID or just auto-generate
  const firebaseProductId = `zoho_${item.item_id}`;

  const usdPrice = item.rate ? Math.round((item.rate / aedRate) * 100) / 100 : 0;

  // 1. Create Product in Firebase
  const productRef = db.collection("products").doc(firebaseProductId);
  await productRef.set({
    title: item.name || "Imported Product",
    sku: item.sku || "",
    price: usdPrice,
    guest_usd: usdPrice,
    active: false,
    source: "zoho_books",
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });

  // 2. Create Mapping
  const mappingId = `${firebaseProductId}_${item.item_id}`;
  const mappingRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId);
  
  const mappingRecord = {
    firebase_product_id: firebaseProductId,
    firebase_variant_id: null,
    firebase_sku: item.sku || "",
    firebase_name: item.name || "Imported Product",
    zoho_item_id: item.item_id,
    zoho_sku: item.sku || "",
    zoho_name: item.name || "",
    zoho_category: item.category_name || item.group_name || "",
    zoho_org_id: "662274409",
    match_confidence: 100,
    match_reasoning: "Imported from Zoho Books",
    match_method: MATCH_METHOD.MANUAL,
    status: SYNC_STATUS.SYNCED,
    cf_firebase_sku_set: true, // we assume it matches since we created it from Zoho
    guest_usd: usdPrice,
    guest_aed: item.rate || 0,
    created_at: FieldValue.serverTimestamp(),
    last_synced_at: FieldValue.serverTimestamp(),
  };

  await mappingRef.set(mappingRecord);

  // 3. Log it
  const adminEmail = userProfile?.email || "admin@regenpept.test";
  await db.collection(ZOHO_FIRESTORE.SYNC_LOG).add({
    event: "import_zoho_item",
    mapping_id: mappingId,
    zoho_item_id: item.item_id,
    firebase_product_id: firebaseProductId,
    admin: adminEmail,
    timestamp: FieldValue.serverTimestamp()
  });

  return { firebaseProductId, mappingId, status: SYNC_STATUS.SYNCED };
}

// ── Family Alignment ────────────────────────────────────────────────────────
async function getFamilyDetails(db, { firebaseProductId }) {
  // 1. Get Firebase Product
  const productDoc = await db.collection("products").doc(firebaseProductId).get();
  if (!productDoc.exists) throw new Error("Product not found");
  const p = productDoc.data();

  // 2. Get Firebase Variants
  const variantsSnap = await productDoc.ref.collection("variants").get();
  const variants = variantsSnap.docs.map(v => ({ id: v.id, ...v.data() }));

  const fbFamily = [];
  if (variants.length > 0) {
    variants.forEach(v => fbFamily.push({
      firebase_product_id: firebaseProductId,
      firebase_variant_id: v.id,
      name: `${p.displayName || p.name} (${v.label})`,
      sku: v.sku || p.sku || "",
      guest_usd: parseFloat(v.price?.guest_usd) || 0,
      label: v.label
    }));
  } else {
    fbFamily.push({
      firebase_product_id: firebaseProductId,
      firebase_variant_id: null,
      name: p.displayName || p.name,
      sku: p.sku || "",
      guest_usd: parseFloat(p.guestVialPrice) || 0,
      label: "Base"
    });
  }

  // 3. Search Zoho by Product Base Name
  const baseName = p.displayName || p.name || "";
  const zohoItems = await zoho.searchItems(baseName.split(" ")[0]); // simple heuristic, use first word if name is long, or just the whole name if small.
  // Actually, searching by the whole baseName is safer:
  const searchResults = await zoho.searchItems(baseName);
  
  // 4. Return both arrays
  return {
    firebaseVariants: fbFamily,
    zohoItems: searchResults.map(i => ({
      item_id: i.item_id,
      name: i.name,
      sku: i.sku || "",
      rate: i.rate || 0,
      status: i.status
    }))
  };
}

async function createVariantInZoho(db, { firebaseProductId, firebaseVariantId, aedRate }) {
  // Pull from Firebase
  const productDoc = await db.collection("products").doc(firebaseProductId).get();
  if (!productDoc.exists) throw new Error("Product not found");
  const p = productDoc.data();
  
  let v = null;
  if (firebaseVariantId) {
    const vDoc = await productDoc.ref.collection("variants").doc(firebaseVariantId).get();
    if (vDoc.exists) v = vDoc.data();
  }

  const baseName = p.displayName || p.name;
  const label = v?.label ? ` - ${v.label}` : "";
  const zohoName = `${baseName}${label}`;
  const sku = v?.sku || p.sku || "";
  const guestUsd = parseFloat(v?.price?.guest_usd || p.guestVialPrice || 0);
  const aedPrice = Math.round(guestUsd * aedRate * 100) / 100;

  // Create in Zoho
  const itemData = {
    name: zohoName,
    rate: aedPrice,
    sku: sku,
    item_type: "inventory",
    product_type: "goods"
  };
  
  const newItem = await zoho.createItem(itemData);
  
  // Create mapping
  const mappingId = `${firebaseProductId}_${newItem.item_id}`;
  const mappingRecord = {
    firebase_product_id: firebaseProductId,
    firebase_variant_id: firebaseVariantId || null,
    firebase_sku: sku,
    firebase_name: zohoName,
    zoho_item_id: newItem.item_id,
    zoho_sku: sku,
    zoho_name: zohoName,
    zoho_category: "",
    zoho_org_id: "662274409",
    match_confidence: 100,
    match_reasoning: "Created from Firebase Variant via Family Alignment",
    match_method: MATCH_METHOD.MANUAL,
    status: SYNC_STATUS.SYNCED,
    cf_firebase_sku_set: true,
    guest_usd: guestUsd,
    guest_aed: aedPrice,
    created_at: FieldValue.serverTimestamp(),
    last_synced_at: FieldValue.serverTimestamp()
  };

  await db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId).set(mappingRecord);
  
  return { zoho_item_id: newItem.item_id, mappingId };
}

async function createVariantInFirebase(db, { zohoItemId, firebaseProductId, aedRate }) {
  const item = await zoho.getItem(zohoItemId);
  if (!item) throw new Error("Zoho item not found");
  
  const productDoc = await db.collection("products").doc(firebaseProductId).get();
  if (!productDoc.exists) throw new Error("Product not found");
  const p = productDoc.data();

  // Use AI to extract variant label
  const prompt = `
You are a text extractor.
Base Product Name: "${p.displayName || p.name}"
Zoho Item Name: "${item.name}"
Extract just the variant or dosage label from the Zoho Item Name that differentiates it from the Base Product. 
For example, if base is "BPC-157" and Zoho is "BPC-157 10mg vial", return "10mg vial".
If base is "GHK-Cu" and Zoho is "GHK-Cu (Kit)", return "Kit".
Return ONLY the short label, no quotes, no extra text.
`;
  const rawResponse = await callGemini([{ role: "user", parts: [{ text: prompt }] }], "You extract short labels.", "gemini-2.0-flash", "text/plain", 100);
  const label = rawResponse.trim() || "Imported Variant";

  const usdPrice = item.rate ? Math.round((item.rate / aedRate) * 100) / 100 : 0;
  
  // Create variant
  const variantRef = productDoc.ref.collection("variants").doc();
  const sku = item.sku || `FB-VAR-${variantRef.id.slice(0,6)}`;
  
  await variantRef.set({
    label: label,
    sku: sku,
    price: { guest_usd: usdPrice },
    created_at: FieldValue.serverTimestamp()
  });

  // Create mapping
  const mappingId = `${firebaseProductId}_${item.item_id}`;
  const mappingRecord = {
    firebase_product_id: firebaseProductId,
    firebase_variant_id: variantRef.id,
    firebase_sku: sku,
    firebase_name: `${p.displayName || p.name} (${label})`,
    zoho_item_id: item.item_id,
    zoho_sku: item.sku || "",
    zoho_name: item.name,
    zoho_category: item.category_name || item.group_name || "",
    zoho_org_id: "662274409",
    match_confidence: 100,
    match_reasoning: "Created from Zoho Item via Family Alignment",
    match_method: MATCH_METHOD.MANUAL,
    status: SYNC_STATUS.SYNCED,
    cf_firebase_sku_set: false,
    guest_usd: usdPrice,
    guest_aed: item.rate || 0,
    created_at: FieldValue.serverTimestamp(),
    last_synced_at: FieldValue.serverTimestamp()
  };

  await db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId).set(mappingRecord);
  
  return { firebase_variant_id: variantRef.id, mappingId };
}

// ── Sync and Save mode ───────────────────────────────────────────────────────────────
async function syncAndSave(db, body) {
  const { mappingId, firebase_name, zoho_name, firebase_category, zoho_category } = body;
  if (!mappingId) throw new Error("mappingId is required");

  const mappingRef = db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).doc(mappingId);
  const mappingSnap = await mappingRef.get();
  if (!mappingSnap.exists) throw new Error("Mapping not found");

  const currentMapping = mappingSnap.data();

  // 1. Update Firebase Product
  if (currentMapping.firebase_product_id) {
    const productRef = db.collection("products").doc(currentMapping.firebase_product_id);
    const updates = {};
    if (firebase_name !== undefined) updates.title = firebase_name;
    if (firebase_category !== undefined) updates.category = firebase_category;
    
    if (Object.keys(updates).length > 0) {
      updates.updated_at = FieldValue.serverTimestamp();
      await productRef.update(updates);
    }
  }

  // 2. Update Zoho Item
  if (currentMapping.zoho_item_id) {
    const updates = {};
    if (zoho_name !== undefined) updates.name = zoho_name;
    if (zoho_category !== undefined) updates.category_name = zoho_category;
    
    if (Object.keys(updates).length > 0) {
      try {
        await zoho.updateItem(currentMapping.zoho_item_id, updates);
      } catch (err) {
        structuredLogger.error({ event: "zoho_item_update_failed", mappingId, err: err.message });
      }
    }
  }

  // 3. Update Mapping
  const mappingUpdates = {
    status: SYNC_STATUS.SYNCED,
    last_synced_at: FieldValue.serverTimestamp()
  };
  if (firebase_name !== undefined) mappingUpdates.firebase_name = firebase_name;
  if (zoho_name !== undefined) mappingUpdates.zoho_name = zoho_name;
  if (firebase_category !== undefined) mappingUpdates.category = firebase_category;
  if (zoho_category !== undefined) mappingUpdates.zoho_category = zoho_category;

  await mappingRef.update(mappingUpdates);
  return { mappingId, status: SYNC_STATUS.SYNCED };
}

// ── Status mode ───────────────────────────────────────────────────────────────
async function getStatus(db) {
  const allSnap = await db.collection(ZOHO_FIRESTORE.SKU_MAPPINGS).get();
  const statusCounts = { pending: 0, confirmed: 0, rejected: 0, synced: 0, error: 0 };
  const records = [];

  allSnap.docs.forEach(doc => {
    const d = doc.data();
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
    records.push({ id: doc.id, ...d });
  });

  return { total: allSnap.size, statusCounts, records };
}

// ── Agent (factory) ───────────────────────────────────────────────────────────
const agent = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    new Set(["admin"]),
  model:           "gemini-2.0-flash",
  maxOutputTokens: 4096,
  timeout:         180,    // Discovery can take 2-3 min on large catalogs

  handler: async (ctx) => {
    const { body, db } = ctx;
    const mode     = body.mode || "status";     // "discover"|"confirm"|"push"|"status"
    const aedRate  = body.aedRate || 3.67;      // override from settings/global if needed
    const dryRun   = body.dryRun === true;

    switch (mode) {
      case "discover": {
        const result = await discover(db, aedRate);
        return {
          reply: `Discovery complete. ${result.matched} matches found (${result.auto_confirmed} auto-confirmed, ${result.needs_review} need review, ${result.unmatched} unmatched).`,
          extras: result,
        };
      }

      case "confirm": {
        const result = await confirmMapping(db, body);
        return { reply: `Mapping ${result.mappingId} → ${result.status}.`, extras: result };
      }

      case "confirm_bulk": {
        const result = await confirmBulk(db, body);
        return { reply: `Bulk mappings updated to status ${result.status}.`, extras: result };
      }

      case "sync_and_save": {
        const result = await syncAndSave(db, body);
        return { reply: `Mapping ${result.mappingId} updated and synced.`, extras: result };
      }

      case "push": {
        const result = await pushToZoho(db, { dryRun });
        return {
          reply: dryRun
            ? `Dry run: ${result.pushed} mappings would be pushed to Zoho.`
            : `Pushed ${result.pushed} Firebase SKUs to Zoho Books. Failures: ${result.failed}.`,
          extras: result,
        };
      }

      case "push_bulk": {
        const result = await pushBulk(db, { mappingIds: body.mappingIds, dryRun });
        return {
          reply: dryRun
            ? `Dry run: ${result.pushed} bulk mappings would be pushed to Zoho.`
            : `Pushed ${result.pushed} bulk Firebase SKUs to Zoho Books. Failures: ${result.failed}.`,
          extras: result,
        };
      }

      case "refetch": {
        const result = await refetchSingle(db, {
          mappingId: body.mappingId,
          zoho_item_id: body.zoho_item_id,
          userProfile: ctx.userProfile
        });
        return {
          reply: result.updated
            ? `Synced manual edit for Zoho item ${result.zoho_item_id}. Zoho SKU updated from '${result.oldSku}' to '${result.newSku}'.`
            : `Synced manual edit for Zoho item ${result.zoho_item_id}. No changes detected.`,
          extras: result,
        };
      }

      case "force_match": {
        const result = await forceMatch(db, {
          mappingId: body.mappingId,
          zoho_item_id: body.zoho_item_id,
          userProfile: ctx.userProfile
        });
        return {
          reply: `Manually matched and confirmed to Zoho Item ${result.zoho_item_id}.`,
          extras: result,
        };
      }

      case "import_zoho": {
        const result = await importZohoItem(db, {
          zoho_item_id: body.zoho_item_id,
          userProfile: ctx.userProfile,
          aedRate: aedRate
        });
        return {
          reply: `Imported Zoho item ${result.zoho_item_id} into Firebase product ${result.firebaseProductId}.`,
          extras: result,
        };
      }

      case "list_zoho_items": {
        const items = await zoho.listAllItems({ filter_by: "Status.Active" });
        // Return only what's needed for the UI dropdown
        const slimItems = items.map(i => ({
          item_id: i.item_id,
          name: i.name,
          sku: i.sku || "",
          rate: i.rate || 0,
        }));
        return {
          reply: `Fetched ${slimItems.length} active Zoho items.`,
          extras: { items: slimItems },
        };
      }

      case "list_firebase_products": {
        const fbProducts = await loadFirebaseProducts(db);
        return { reply: `Found ${fbProducts.length} Firebase products.`, extras: { products: fbProducts } };
      }

      case "status":
      default: {
        const result = await getStatus(db);
        return {
          reply: `SKU mapping status: ${result.total} total — ${JSON.stringify(result.statusCounts)}`,
          extras: result,
        };
      }
    }
  },

  fallback: async () => ({
    reply: "AgentSkuSync temporarily unavailable. Try again shortly.",
    extras: {},
  }),
});

agent.discover = discover;
module.exports = agent;
