const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { derivePhaseSupply, buildSupplyManifest } = require("../utils/supplyMath");

/**
 * protocolCompute
 * Triggers on updates to protocols. Recalculates vial supply logic.
 * Note: Since prices depend on dynamic user tiers and live product catalogs, 
 * this backend function focuses on raw supply logic (vial counts, half-life math, accessories).
 * Prices should be resolved JIT by the client.
 */
exports.protocolCompute = onDocumentWritten("protocols/{protocolId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const afterData = snapshot.after.exists ? snapshot.after.data() : null;
  const beforeData = snapshot.before.exists ? snapshot.before.data() : null;

  // Don't run on delete
  if (!afterData) return;

  // To prevent infinite loops, check if we've just written the supply_manifest
  // Actually, since phases are in a subcollection, this trigger fires when the parent protocol changes.
  // Wait, if the phases change in the subcollection, this trigger WON'T fire! 
  // We need to trigger on both, or just when the parent updates.
  // The client updates the parent document `updated_at` when phases are updated (in `updateProtocolFull`).
  
  if (beforeData && afterData.updated_at?.isEqual(beforeData.updated_at)) {
      // Nothing changed
      return;
  }

  // To prevent loops, if we only update `supply_manifest`, we check if that was the only change.
  // An easy way is to use a specific timestamp or just rely on the frontend updating `updated_at`.

  const db = getFirestore();
  const protocolId = event.params.protocolId;

  try {
    // 1. Fetch phases from subcollection (or fallback to top-level array)
    let phases = afterData.phases || [];
    if (phases.length === 0) {
      const phasesSnap = await db.collection("protocols").doc(protocolId).collection("phases").get();
      if (!phasesSnap.empty) {
        phases = phasesSnap.docs.map(d => d.data()).sort((a, b) => (a.index || 0) - (b.index || 0));
      }
    }

    if (phases.length === 0) return; // Nothing to compute

    // 2. Run the math logic
    // derivePhaseSupply expects Phase Blueprint objects with `drugs` or `drugs_used`
    const enginePhases = derivePhaseSupply(phases, null); // No daily dose overrides here
    
    // Engine phases need a dummy unitPrice = 0 to run buildSupplyManifest without crashing
    const enrichedPhases = enginePhases.map(ph => ({
        ...ph,
        compounds: ph.compounds.map(c => ({
            ...c,
            unitPrice: 0,
            lineTotal: 0
        }))
    }));

    const manifest = buildSupplyManifest(enrichedPhases);

    // 3. Write back the aggregated totals to the parent document
    // We only save the structural supply data (vials, bac water, accessories). 
    // We do NOT save prices (because prices vary by tier).
    const supplySummary = {
      total_vials: manifest.totals.vialsTotal || 0,
      total_bac_water_ml: manifest.totals.bacWaterMl || 0,
      accessories: manifest.accessories.map(a => ({ id: a.id, qty: a.qty })),
      last_computed_at: new Date().toISOString()
    };

    // Update parent doc silently
    await db.collection("protocols").doc(protocolId).update({
      supply_summary: supplySummary
    });
    
    console.log(`[protocolCompute] Computed supply for ${protocolId}: ${supplySummary.total_vials} vials.`);
  } catch (error) {
    console.error(`[protocolCompute] Error calculating for ${protocolId}:`, error);
  }
});
