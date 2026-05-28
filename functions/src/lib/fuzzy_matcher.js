"use strict";
/**
 * fuzzy_matcher.js — Algorithmic product matching (no AI quota needed)
 *
 * Matches Firebase products against Zoho Books items using:
 *  1. Normalized string similarity (Dice coefficient on token bigrams)
 *  2. Keyword overlap (shared significant words)
 *  3. Category bonus (collagen/peptide/supplement alignment)
 *  4. SKU exact match (instant 100%)
 *
 * Returns confidence 0–100. Used as primary matcher;
 * Gemini is reserved for "uncertain" cases (40–70%) only.
 */

// ── Tokenizer ─────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "the","a","an","and","or","of","for","in","to","with","by","mg","ml",
  "g","kg","vial","amp","ampoule","capsule","cap","tab","tablet","bottle",
  "pack","set","kit","plus","pro","gold","silver","elite","premium","pure",
  "x","vs","de","la","el","con","para","una","un","los","las",
]);

function tokenize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// ── Bigrams for Dice coefficient ──────────────────────────────────────────────
function bigrams(tokens) {
  const bg = new Set();
  for (let i = 0; i < tokens.length - 1; i++) {
    bg.add(`${tokens[i]}|${tokens[i+1]}`);
  }
  // Also add individual tokens as "unigrams" for short strings
  tokens.forEach(t => bg.add(t));
  return bg;
}

function diceSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  return (2 * intersection) / (setA.size + setB.size);
}

// ── Category classifier ───────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  collagen:   ["collagen","collagen","atelocollagen","atelo","col","dermal"],
  peptide:    ["bpc","tb500","ghk","sema","tirzepatide","cjc","ipamorelin","ghrp","igf","mgf","pt141","sermorelin","humanin","ss31","epitalon","ss","klotho","fgl2","wnt"],
  supplement: ["nmn","nad","resveratrol","spermidine","omega","vitamin","zinc","magnesium","coenzyme"],
  skincare:   ["serum","mask","cream","gel","lotion","moisturizer","hyaluronic","retinol","niacinamide"],
  hair:       ["hair","scalp","follicle","growth","biotin"],
  cbd:        ["cbd","hemp","cannabis","cbg"],
};

function classifyCategory(tokens) {
  const joined = tokens.join(" ");
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => joined.includes(kw))) return cat;
  }
  return "other";
}

// ── Number extractor (e.g. "5mg", "100ml", "60caps") ─────────────────────────
function extractNumbers(str) {
  return (str || "").toLowerCase().match(/\d+\.?\d*(mg|ml|g|kg|mcg|iu|caps?|tabs?)?/g) || [];
}

function numberOverlap(a, b) {
  const numsA = new Set(extractNumbers(a));
  const numsB = new Set(extractNumbers(b));
  if (numsA.size === 0 || numsB.size === 0) return 0;
  let overlap = 0;
  for (const n of numsA) {
    if (numsB.has(n)) overlap++;
  }
  return overlap / Math.max(numsA.size, numsB.size);
}

// ── Main matcher ──────────────────────────────────────────────────────────────

/**
 * Score a Firebase product against a Zoho item.
 * @returns {{ confidence: number, reasoning: string }}
 */
function scoreMatch(fbProduct, zohoItem) {
  const fbName   = fbProduct.name   || "";
  const zohoName = zohoItem.name    || "";
  const fbDesc   = fbProduct.description || "";
  const zohoDesc = zohoItem.description  || "";

  // 1. SKU exact match → instant 100%
  if (fbProduct.firebase_sku && zohoItem.sku &&
      fbProduct.firebase_sku.toLowerCase() === zohoItem.sku.toLowerCase()) {
    return { confidence: 100, reasoning: "Exact SKU match." };
  }

  // 2. Name similarity (primary signal — weight 50%)
  const fbTokens   = tokenize(fbName);
  const zohoTokens = tokenize(zohoName);
  const fbBg       = bigrams(fbTokens);
  const zohoBg     = bigrams(zohoTokens);
  const nameSim    = diceSimilarity(fbBg, zohoBg);

  // 3. Description keyword overlap (secondary — weight 20%)
  const fbDescTokens   = tokenize(fbDesc);
  const zohoDescTokens = tokenize(zohoDesc);
  const allFbTokens    = [...new Set([...fbTokens, ...fbDescTokens])];
  const allZohoTokens  = [...new Set([...zohoTokens, ...zohoDescTokens])];
  const descSim = diceSimilarity(new Set(allFbTokens), new Set(allZohoTokens));

  // 4. Category alignment bonus (10%)
  const fbCat   = classifyCategory(allFbTokens);
  const zohoCat = classifyCategory(allZohoTokens);
  const catBonus = (fbCat !== "other" && fbCat === zohoCat) ? 0.10 : 0;

  // 5. Number/dosage overlap (20% — very important for peptides)
  const numSim = numberOverlap(fbName + " " + fbDesc, zohoName + " " + zohoDesc);

  // Weighted score
  const rawScore = (nameSim * 0.50) + (descSim * 0.20) + (numSim * 0.20) + catBonus;
  const confidence = Math.round(Math.min(rawScore * 100, 100));

  // Build reasoning
  const parts = [];
  if (nameSim > 0.3) parts.push(`name similarity ${Math.round(nameSim * 100)}%`);
  if (numSim > 0)    parts.push(`dosage overlap ${Math.round(numSim * 100)}%`);
  if (catBonus > 0)  parts.push(`same category (${fbCat})`);
  if (descSim > 0.2) parts.push(`description overlap`);
  const reasoning = parts.length
    ? `Algorithmic match: ${parts.join(", ")}.`
    : "Low similarity across all signals.";

  return { confidence, reasoning };
}

/**
 * Match all Firebase products against all Zoho items.
 * Returns best match per Firebase product (only if confidence ≥ minConfidence).
 *
 * @param {Array} firebaseProducts
 * @param {Array} zohoItems
 * @param {number} minConfidence — minimum score to include (default 55)
 * @returns {Array} matches sorted by confidence desc
 */
function matchCatalogs(firebaseProducts, zohoItems, minConfidence = 55) {
  const results = [];

  for (const fbProduct of firebaseProducts) {
    let bestScore = 0;
    let bestItem  = null;
    let bestReason = "";

    for (const zohoItem of zohoItems) {
      const { confidence, reasoning } = scoreMatch(fbProduct, zohoItem);
      if (confidence > bestScore) {
        bestScore  = confidence;
        bestItem   = zohoItem;
        bestReason = reasoning;
      }
    }

    if (bestScore >= minConfidence && bestItem) {
      results.push({
        firebase_product_id: fbProduct.firebase_product_id,
        firebase_sku:        fbProduct.firebase_sku,
        firebase_name:       fbProduct.name,
        zoho_item_id:        bestItem.item_id,
        zoho_sku:            bestItem.sku || "",
        zoho_name:           bestItem.name,
        confidence:          bestScore,
        reasoning:           bestReason,
        match_method:        "algorithmic",
      });
    }
  }

  // Sort by confidence desc
  return results.sort((a, b) => b.confidence - a.confidence);
}

module.exports = { matchCatalogs, scoreMatch };
