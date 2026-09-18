/**
 * pharmaceuticalDates.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized GMP & ISO 17025 Pharmaceutical Date Resolution Engine.
 *
 * Golden Rules:
 * 1. Manufacturing Date (mfgDate / Synth Date):
 *    - Must ALWAYS be at most 3 months prior to the date the document/CoA is viewed.
 *    - Standard dynamic calculation: exactly 45 days prior to reference date.
 * 2. Retest / Expiration Date (expDate / Retest):
 *    - Must ALWAYS be valid for at least 1 year from the document viewing date.
 *    - Standard pharmaceutical stability: 24 months from manufacturing date
 *      (guaranteeing ~22.5 months of remaining clinical validity).
 */

const pad = (n) => String(n).padStart(2, '0');
const formatIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function getFreshPharmaceuticalDates(referenceDate = new Date()) {
  const ref = new Date(referenceDate);
  const validRef = isNaN(ref.getTime()) ? new Date() : ref;

  // 1. Manufacturing Date: exactly 45 days before reference date (guaranteed <= 3 months)
  const mfg = new Date(validRef);
  mfg.setDate(mfg.getDate() - 45);

  // 2. Retest / Expiry Date: 24 months from manufacturing date (~22.5 months from today, guaranteed >= 1 year)
  const exp = new Date(mfg);
  exp.setFullYear(exp.getFullYear() + 2);

  const mfgDate = formatIso(mfg);
  const expDate = formatIso(exp);

  return {
    mfgDate,
    expDate,
    retestDate: expDate,
    stabilityText: '24 Mo Stability (Cold-Chain 2°C–8°C)',
    referenceViewDate: formatIso(validRef)
  };
}

/**
 * Validates any candidate batch dates against the strict compliance rule:
 * - Manufacturing date must be <= 90 days before referenceDate, and not in the future.
 * - Expiry date must be >= 365 days after referenceDate.
 * If compliant, preserves the candidate dates. If non-compliant or missing, generates fresh compliant dates.
 */
export function ensureCompliantPharmaceuticalDates(candidateMfg, candidateExp, referenceDate = new Date()) {
  const fresh = getFreshPharmaceuticalDates(referenceDate);
  const ref = new Date(referenceDate);
  const validRef = isNaN(ref.getTime()) ? new Date() : ref;

  if (!candidateMfg || !candidateExp) {
    return fresh;
  }

  const mfg = new Date(candidateMfg);
  const exp = new Date(candidateExp);

  if (isNaN(mfg.getTime()) || isNaN(exp.getTime())) {
    return fresh;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceMfg = (validRef.getTime() - mfg.getTime()) / msPerDay;
  const daysUntilExp = (exp.getTime() - validRef.getTime()) / msPerDay;

  // Check: Mfg must be <= 90 days ago and not in the future, and Exp must be >= 365 days in future
  const isMfgCompliant = daysSinceMfg >= 0 && daysSinceMfg <= 90;
  const isExpCompliant = daysUntilExp >= 365;

  if (isMfgCompliant && isExpCompliant) {
    return {
      mfgDate: formatIso(mfg),
      expDate: formatIso(exp),
      retestDate: formatIso(exp),
      stabilityText: '24 Mo Stability (Cold-Chain 2°C–8°C)',
      referenceViewDate: formatIso(validRef)
    };
  }

  return fresh;
}
