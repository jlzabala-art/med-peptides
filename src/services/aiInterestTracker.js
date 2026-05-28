/**
 * aiInterestTracker.js
 * 
 * Tracks what peptides, protocols and supplements a patient has consulted
 * via ClinicalAI. This data feeds the personalized PatientHome sections.
 *
 * Firestore path:  users/{uid}/ai_profile (doc)
 * Structure:
 *   {
 *     interests: [{name, slug, category, score, lastMentioned}],
 *     topGoals:  string[],
 *     lastUpdated: ISO string
 *   }
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ── Known peptide/supplement names → slug map ─────────────────────────────────
// Add entries as the catalog grows
const KNOWN_COMPOUNDS = {
  'bpc-157': { name: 'BPC-157', slug: 'bpc-157', category: 'Recovery', emoji: '🩹' },
  'bpc 157':{ name: 'BPC-157', slug: 'bpc-157', category: 'Recovery', emoji: '🩹' },
  'tb-500': { name: 'TB-500',  slug: 'tb-500',  category: 'Recovery', emoji: '🩹' },
  'tb 500': { name: 'TB-500',  slug: 'tb-500',  category: 'Recovery', emoji: '🩹' },
  'semaglutide': { name: 'Semaglutide', slug: 'semaglutide', category: 'Metabolic', emoji: '🔥' },
  'tirzepatide': { name: 'Tirzepatide', slug: 'tirzepatide', category: 'Metabolic', emoji: '🔥' },
  'aod-9604': { name: 'AOD-9604', slug: 'aod-9604', category: 'Metabolic', emoji: '🔥' },
  'aod 9604': { name: 'AOD-9604', slug: 'aod-9604', category: 'Metabolic', emoji: '🔥' },
  'ipamorelin': { name: 'Ipamorelin', slug: 'ipamorelin', category: 'GH Peptides', emoji: '⚡' },
  'cjc-1295': { name: 'CJC-1295', slug: 'cjc-1295', category: 'GH Peptides', emoji: '⚡' },
  'cjc 1295': { name: 'CJC-1295', slug: 'cjc-1295', category: 'GH Peptides', emoji: '⚡' },
  'igf-1': { name: 'IGF-1 LR3', slug: 'igf-1-lr3', category: 'Anabolic', emoji: '💪' },
  'igf 1': { name: 'IGF-1 LR3', slug: 'igf-1-lr3', category: 'Anabolic', emoji: '💪' },
  'epithalon': { name: 'Epithalon', slug: 'epithalon', category: 'Longevity', emoji: '⏳' },
  'epitalon': { name: 'Epithalon', slug: 'epithalon', category: 'Longevity', emoji: '⏳' },
  'ghk-cu': { name: 'GHK-Cu', slug: 'ghk-cu', category: 'Anti-Aging', emoji: '✨' },
  'ghk cu': { name: 'GHK-Cu', slug: 'ghk-cu', category: 'Anti-Aging', emoji: '✨' },
  'semax': { name: 'Semax', slug: 'semax', category: 'Cognitive', emoji: '🧠' },
  'selank': { name: 'Selank', slug: 'selank', category: 'Cognitive', emoji: '🧠' },
  'dihexa': { name: 'Dihexa', slug: 'dihexa', category: 'Cognitive', emoji: '🧠' },
  'thymosin alpha': { name: 'Thymosin Alpha-1', slug: 'thymosin-alpha-1', category: 'Immune', emoji: '🛡️' },
  'thymosin beta': { name: 'Thymosin Beta-4', slug: 'tb-500', category: 'Recovery', emoji: '🩹' },
  'pt-141': { name: 'PT-141', slug: 'pt-141', category: 'Hormonal', emoji: '⚡' },
  'pt 141': { name: 'PT-141', slug: 'pt-141', category: 'Hormonal', emoji: '⚡' },
  'kisspeptin': { name: 'Kisspeptin', slug: 'kisspeptin', category: 'Hormonal', emoji: '⚡' },
  'dsip': { name: 'DSIP', slug: 'dsip', category: 'Sleep', emoji: '🌙' },
  'nad+': { name: 'NAD+', slug: 'nad-plus', category: 'Longevity', emoji: '🧬' },
  'nad ': { name: 'NAD+', slug: 'nad-plus', category: 'Longevity', emoji: '🧬' },
  'ghrp-6': { name: 'GHRP-6', slug: 'ghrp-6', category: 'GH Peptides', emoji: '⚡' },
  'ghrp-2': { name: 'GHRP-2', slug: 'ghrp-2', category: 'GH Peptides', emoji: '⚡' },
  'hexarelin': { name: 'Hexarelin', slug: 'hexarelin', category: 'GH Peptides', emoji: '⚡' },
  'll-37': { name: 'LL-37', slug: 'll-37', category: 'Immune', emoji: '🛡️' },
  'klotho': { name: 'Klotho', slug: 'klotho', category: 'Longevity', emoji: '🧬' },
};

// ── Goal keyword extractor ────────────────────────────────────────────────────
const GOAL_KEYWORDS = {
  'anti-aging':  ['anti-aging', 'aging', 'anti aging', 'wrinkle', 'rejuven'],
  'longevity':   ['longevity', 'lifespan', 'nad', 'rapamycin', 'senescence'],
  'muscle-gain': ['muscle', 'anabolic', 'hypertrophy', 'igf', 'growth hormone'],
  'fat-loss':    ['fat loss', 'weight', 'metabolic', 'semaglutide', 'tirzepatide', 'aod'],
  'recovery':    ['recovery', 'healing', 'injury', 'inflammation', 'bpc', 'tb-500'],
  'cognitive':   ['cognitive', 'brain', 'focus', 'memory', 'nootropic', 'semax', 'selank'],
  'hormones':    ['hormone', 'testosterone', 'estrogen', 'hgh', 'growth hormone'],
  'immune':      ['immune', 'thymosin', 'immunity', 'll-37'],
  'sleep':       ['sleep', 'insomnia', 'dsip', 'rest', 'circadian'],
};

// ── Extract mentions from text ────────────────────────────────────────────────
export function extractMentionedCompounds(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();
  for (const [keyword, compound] of Object.entries(KNOWN_COMPOUNDS)) {
    if (lower.includes(keyword)) {
      found.add(JSON.stringify(compound));
    }
  }
  return [...found].map(s => JSON.parse(s));
}

export function extractGoalSignals(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();
  for (const [goal, keywords] of Object.entries(GOAL_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) found.add(goal);
  }
  return [...found];
}

// ── Also extract from pre-ranked products coming back from the API ────────────
export function extractFromPreRanked(preRankedProducts = []) {
  return preRankedProducts
    .filter(p => p.name || p.slug)
    .map(p => ({
      name: p.displayName || p.name,
      slug: p.slug || p.id,
      category: p.category || 'General',
      emoji: '💊',
    }));
}

// ── Merge + score interests ────────────────────────────────────────────────────
function mergeInterests(existing = [], newItems = []) {
  const map = new Map();
  for (const item of existing) {
    map.set(item.slug, { ...item });
  }
  for (const item of newItems) {
    if (!item.slug) continue;
    const prev = map.get(item.slug);
    if (prev) {
      map.set(item.slug, {
        ...prev,
        score: (prev.score || 1) + 1,
        lastMentioned: new Date().toISOString(),
      });
    } else {
      map.set(item.slug, {
        ...item,
        score: 1,
        lastMentioned: new Date().toISOString(),
      });
    }
  }
  // Sort by score desc, cap at 30
  return [...map.values()]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 30);
}

// ── Main: persist AI interests after each exchange ───────────────────────────
let _pendingWrite = null;   // debounce

export async function trackAIInterests({ uid, userMsg, assistantReply, preRankedProducts }) {
  if (!uid) return;

  // Extract
  const fromMsg    = extractMentionedCompounds(userMsg);
  const fromReply  = extractMentionedCompounds(assistantReply);
  const fromRanked = extractFromPreRanked(preRankedProducts);
  const newGoals   = extractGoalSignals(userMsg + ' ' + assistantReply);
  const allNew     = [...fromMsg, ...fromReply, ...fromRanked];

  if (allNew.length === 0 && newGoals.length === 0) return;

  // Debounce: avoid writing on every typing tick
  if (_pendingWrite) clearTimeout(_pendingWrite);
  _pendingWrite = setTimeout(async () => {
    try {
      const ref  = doc(db, 'users', uid, 'ai_profile', 'interests');
      const snap = await getDoc(ref);
      const current = snap.exists() ? snap.data() : { interests: [], topGoals: [] };

      const merged   = mergeInterests(current.interests || [], allNew);
      const topGoals = [...new Set([...(current.topGoals || []), ...newGoals])].slice(0, 10);

      await setDoc(ref, {
        interests: merged,
        topGoals,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      // Non-blocking, don't surface to user
      console.debug('[aiInterestTracker]', err.message);
    }
  }, 2000);
}
