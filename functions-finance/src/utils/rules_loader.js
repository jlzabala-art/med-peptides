const { getFirestore } = require("firebase-admin/firestore");

let _rulesCache = null;
let _rulesCacheExpiry = 0;
const RULES_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function loadClinicalRules() {
  const now = Date.now();
  if (_rulesCache && now < _rulesCacheExpiry) {
    return _rulesCache; // cache HIT — no Firestore read
  }
  try {
    const db = getFirestore();
    const [primarySnap, extSnap] = await Promise.all([
      db.collection("ai_config").doc("clinical_rules").get(),
      db.collection("ai_config").doc("clinical_rules_extended").get(),
    ]);
    const primary = primarySnap.exists ? primarySnap.data() : {};
    const extended = extSnap.exists ? extSnap.data() : {};
    _rulesCache = { ...primary, ...extended };
    _rulesCacheExpiry = now + RULES_CACHE_TTL_MS;
    console.log("[loadClinicalRules] Rules loaded from Firestore. Version:", _rulesCache._version || "unknown");
  } catch (err) {
    console.warn("[loadClinicalRules] Failed to load rules from Firestore:", err.message, "— using empty fallback.");
    _rulesCache = _rulesCache || {}; // keep stale cache if available
  }
  return _rulesCache;
}

module.exports = { loadClinicalRules };
