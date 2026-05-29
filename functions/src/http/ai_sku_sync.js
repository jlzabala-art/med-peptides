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
    `${i + 1}. [ZH-${z.item_id.slice(-6)}] "${z.name}" | SKU: ${z.sku || "—"} | rate: ${z.rate} AED`
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

  await batch.commit();

  const autoConfirmed = results.filter(r => r.status === SYNC_STATUS.CONFIRMED).length;
  const needsReview   = results.filter(r => r.status === SYNC_STATUS.PENDING).length;

  return {
    matched:        results.length,
    auto_confirmed: autoConfirmed,
    needs_review:   needsReview,
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
  });

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
    });
  }

  await batch.commit();
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
      await zoho.setItemCustomField(mapping.zoho_item_id, ZOHO_CF_FIREBASE_SKU, mapping.firebase_sku);
      await zoho.setItemCustomField(mapping.zoho_item_id, ZOHO_CF_FIREBASE_ID, mapping.firebase_product_id);

      await doc.ref.update({
        status:              SYNC_STATUS.SYNCED,
        cf_firebase_sku_set: true,
        last_synced_at:      FieldValue.serverTimestamp(),
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
      await zoho.setItemCustomField(mapping.zoho_item_id, ZOHO_CF_FIREBASE_SKU, mapping.firebase_sku);
      await zoho.setItemCustomField(mapping.zoho_item_id, ZOHO_CF_FIREBASE_ID, mapping.firebase_product_id);

      await docRef.update({
        status:              SYNC_STATUS.SYNCED,
        cf_firebase_sku_set: true,
        last_synced_at:      FieldValue.serverTimestamp(),
      });

      // Also write zoho_item_id back to Firebase product
      if (mapping.firebase_product_id) {
        await db.doc(`products/${mapping.firebase_product_id}`)
          .update({ zoho_item_id: mapping.zoho_item_id, zoho_org_id: "662274409" })
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
  const newRate = item.rate || 0;

  // Update in Firestore sku_mappings
  const updates = {
    zoho_sku: newZohoSku,
    zoho_name: newZohoName,
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
module.exports = createAgent({
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
