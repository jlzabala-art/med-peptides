 
/**
 * dosageUtils.js
 * Robust parsing for clinical dosage strings and administration frequencies.
 * Handles mg, mcg, ug, iu, and various formatting anomalies.
 * Handles frequencies like: daily, 2x_week, 3x_week, weekly, monthly, etc.
 */

/**
 * Converts an administration frequency string to number of injections per week.
 * Supports Firestore schema values: "daily", "2x_week", "3x_week", "weekly",
 * "once_weekly", "twice_weekly", "biweekly", "monthly", etc.
 *
 * @param {string} freq - Frequency string from dose_logic.administration_frequency
 * @returns {number} Injections per week (may be fractional for sub-weekly, e.g. 0.5 for bimonthly)
 */
export function parseFrequencyToInjectionsPerWeek(freq = '') {
  // Normalise: lowercase, strip non-alphanumeric except letters/digits
  const f = String(freq).toLowerCase().replace(/[^a-z0-9]/g, '');

  // ── Exact daily / multi-daily ──
  if (f === 'daily' || f === '7x' || f === '7xweek' || f === 'everyday') return 7;
  if (f === '6x' || f === '6xweek') return 6;
  if (f === '5x' || f === '5xweek') return 5;

  // ── 4× / every other day ──
  if (f === '4x' || f === '4xweek') return 4;
  if (f.includes('alternateday') || f.includes('everyotherday')) return 3.5;

  // ── 3× per week ──
  if (
    f === '3x' || f === '3xweek' || f === '3xweekly' ||
    f.includes('thrice') || f.includes('triweekly') ||
    f.includes('threetimes')
  ) return 3;

  // ── 2× per week ──
  if (
    f === '2x' || f === '2xweek' || f === '2xweekly' ||
    f.includes('twice') || f.includes('biweekly') ||
    f.includes('twotimes') || f.includes('twiceweekly')
  ) return 2;

  // ── Once per week ──
  if (
    f === '1x' || f === '1xweek' || f === 'weekly' || f === 'onceweekly' ||
    f === 'once' || f === 'oncepweek' || f.includes('oneperweek')
  ) return 1;

  // ── Sub-weekly (every 2 weeks, monthly) ──
  if (f.includes('bimonth') || f === 'every2weeks' || f === 'fortnightly') return 0.5;
  if (f.includes('monthly') || f === 'oncemonth') return 0.25;

  // ── Fallback for any "Nx_week" pattern not caught above ──
  const nxMatch = f.match(/^(\d+)x/);
  if (nxMatch) return parseInt(nxMatch[1], 10);

  // ── Default: once per week ──
  return 1;
}

export const parseDosageToMg = (dosageStr) => {
  if (dosageStr === undefined || dosageStr === null || dosageStr === '') return 0;
  
  // If it's already a number, assume mg
  if (typeof dosageStr === 'number') return dosageStr;
  
  const s = String(dosageStr).toLowerCase().replace(/,/g, '').trim();
  
  // Extract numeric part and unit part
  // Matches "250mcg", "2.5 mg", "1,250 ug", etc.
  const match = s.match(/(\d+\.?\d*)\s*(mg|mcg|µg|ug|iu|unit)/i);
  
  if (!match) {
    // Fallback: try to just get the number
    const n = parseFloat(s.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  
  let val = parseFloat(match[1]);
  const unit = match[2];
  
  if (unit === 'mcg' || unit === 'µg' || unit === 'ug') {
    return val / 1000;
  }
  
  // For IU or units, we treat them as-is for now, 
  // as the protocol engines use them as base units for calculation.
  // In a more complex engine, we might have conversion rates.
  
  return val;
};

/**
 * Normalizes a dosage string for display.
 */
export const formatDosage = (mg) => {
  if (mg === 0) return '0mg';
  if (mg < 1) return `${(mg * 1000).toFixed(0)}mcg`;
  return `${mg.toFixed(2).replace(/\.00$/, '')}mg`;
};
