/**
 * reconstitutionBaseline.js
 * ─────────────────────────────────────────────────────────────────────────────
 * High-performance O(1) reconstitution baseline lookup and calculator.
 * Used identically across InteractiveReconstitutionGuide and MonographPreviewModal.
 */

// ⚡ O(1) Pre-computed Lookups for standard catalog vial strengths
export const RECONSTITUTION_LOOKUP = Object.freeze({
  1:  { bacMl: 1.0, concMgMl: 1.0,  concStr: '1.0 mg/mL',  diluentStr: '1.0 mL BAC Water' },
  2:  { bacMl: 1.0, concMgMl: 2.0,  concStr: '2.0 mg/mL',  diluentStr: '1.0 mL BAC Water' },
  5:  { bacMl: 2.0, concMgMl: 2.5,  concStr: '2.5 mg/mL',  diluentStr: '2.0 mL BAC Water' },
  10: { bacMl: 2.0, concMgMl: 5.0,  concStr: '5.0 mg/mL',  diluentStr: '2.0 mL BAC Water' },
  15: { bacMl: 3.0, concMgMl: 5.0,  concStr: '5.0 mg/mL',  diluentStr: '3.0 mL BAC Water' },
  20: { bacMl: 3.0, concMgMl: 6.67, concStr: '6.7 mg/mL',  diluentStr: '3.0 mL BAC Water' },
  30: { bacMl: 4.0, concMgMl: 7.5,  concStr: '7.5 mg/mL',  diluentStr: '4.0 mL BAC Water' },
  40: { bacMl: 5.0, concMgMl: 8.0,  concStr: '8.0 mg/mL',  diluentStr: '5.0 mL BAC Water' },
  50: { bacMl: 5.0, concMgMl: 10.0, concStr: '10.0 mg/mL', diluentStr: '5.0 mL BAC Water' }
});

const DYNAMIC_CACHE = new Map();

/**
 * Fast O(1) baseline solver with micro-caching for non-standard strengths and blends.
 */
export function getReconstitutionBaseline(mgVal, isBlend = false) {
  const numMg = Number(mgVal) || 10;
  const cacheKey = `${numMg}_${isBlend ? 'blend' : 'single'}`;

  // 1. Direct O(1) standard table lookup
  if (!isBlend && RECONSTITUTION_LOOKUP[numMg]) {
    const entry = RECONSTITUTION_LOOKUP[numMg];
    return {
      baseMg: numMg,
      baseBac: entry.bacMl,
      diluent: entry.diluentStr,
      conc: entry.concStr,
      concMgMl: entry.concMgMl
    };
  }

  // 2. Micro-cache check
  if (DYNAMIC_CACHE.has(cacheKey)) {
    return DYNAMIC_CACHE.get(cacheKey);
  }

  // 3. Mathematical calculation for non-standard or blended presentations
  let baseBac = 2.0;
  if (isBlend) {
    const rawVol = numMg / 10.0;
    baseBac = Math.max(2.0, Math.round(rawVol * 2) / 2);
  } else if (numMg <= 2) {
    baseBac = 1.0;
  } else if (numMg <= 10) {
    baseBac = 2.0;
  } else if (numMg <= 20) {
    baseBac = 3.0;
  } else if (numMg <= 30) {
    baseBac = 4.0;
  } else if (numMg <= 50) {
    baseBac = 5.0;
  } else {
    baseBac = Math.max(5.0, Math.round((numMg / 10.0) * 2) / 2);
  }

  const concVal = baseBac > 0 ? numMg / baseBac : numMg;
  const result = {
    baseMg: numMg,
    baseBac,
    diluent: `${baseBac.toFixed(1)} mL BAC Water`,
    conc: `${concVal.toFixed(1)} mg/mL`,
    concMgMl: +concVal.toFixed(2)
  };

  DYNAMIC_CACHE.set(cacheKey, result);
  return result;
}

/**
 * Fast parser for presentation milligram quantities.
 */
export function parseMgFromPresentation(str) {
  const s = String(str || '');
  const mgMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*mg/gi)];
  if (mgMatches.length > 0) {
    return mgMatches.reduce((acc, m) => acc + parseFloat(m[1]), 0);
  }
  if (s.includes('|') || s.includes('+') || s.includes('/')) {
    const parts = s.split(/[|+/]/);
    let total = 0;
    for (const part of parts) {
      const m = part.match(/(\d+(?:\.\d+)?)/);
      if (m) total += parseFloat(m[1]);
    }
    if (total > 0) return total;
  }
  const m = s.match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : 10;
}
