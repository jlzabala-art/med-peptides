/**
 * prescriptionCalculations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Clinical calculation engine for prescription lines.
 * Handles: frequency parsing, duration parsing, unit conversion, vial math.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Frequency Table (doses per week) ─────────────────────────────────────────
// Keys are lowercase normalized aliases → doses per week (as a float)
const FREQUENCY_MAP = {
  // Once daily
  'qd':                   7,
  'q.d.':                 7,
  'once daily':           7,
  'once a day':           7,
  '1x daily':             7,
  '1/day':                7,
  'daily':                7,
  'every day':            7,
  'every 24h':            7,
  'every 24 hours':       7,
  'od':                   7,

  // Twice daily
  'bid':                  14,
  'b.i.d.':               14,
  'twice daily':          14,
  'twice a day':          14,
  '2x daily':             14,
  '2/day':                14,
  'every 12h':            14,
  'every 12 hours':       14,

  // Three times daily
  'tid':                  21,
  't.i.d.':               21,
  'three times daily':    21,
  'three times a day':    21,
  '3x daily':             21,
  '3/day':                21,
  'every 8h':             21,
  'every 8 hours':        21,

  // Four times daily
  'qid':                  28,
  'q.i.d.':               28,
  'four times daily':     28,
  'four times a day':     28,
  '4x daily':             28,
  '4/day':                28,
  'every 6h':             28,
  'every 6 hours':        28,

  // Every other day
  'eod':                  3.5,
  'e.o.d.':               3.5,
  'every other day':      3.5,
  'every 2 days':         3.5,
  'alternate days':       3.5,
  'every 48h':            3.5,
  'every 48 hours':       3.5,

  // Every 3 days
  'every 3 days':         7 / 3,
  'every 72h':            7 / 3,
  'every 72 hours':       7 / 3,

  // Weekly
  'weekly':               1,
  'once a week':          1,
  '1x weekly':            1,
  '1x per week':          1,
  'every week':           1,
  'every 7 days':         1,
  'qw':                   1,

  // Twice weekly
  'twice weekly':         2,
  'twice a week':         2,
  'biweekly':             2,
  '2x weekly':            2,
  '2x per week':          2,
  '2/week':               2,

  // 3x weekly
  'three times a week':   3,
  '3x weekly':            3,
  '3x per week':          3,
  '3/week':               3,
  'tiw':                  3,

  // Monthly / as needed
  'monthly':              7 / 30,
  'once a month':         7 / 30,
  'every month':          7 / 30,
  '1x monthly':           7 / 30,
  'prn':                  0,
  'as needed':            0,
  'on demand':            0,
};

/**
 * Parse a frequency string → doses per week.
 * @param {string} freq
 * @returns {number}
 */
export function parseDosesPerWeek(freq) {
  if (!freq) return 0;
  const normalized = freq.toLowerCase().trim().replace(/\s+/g, ' ');

  if (normalized in FREQUENCY_MAP) return FREQUENCY_MAP[normalized];

  for (const [key, val] of Object.entries(FREQUENCY_MAP)) {
    if (normalized.includes(key)) return val;
  }

  // "5 times a week"
  const timesPerWeekMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(?:x|times?)\s*(?:per|a|\/)\s*week/);
  if (timesPerWeekMatch) return parseFloat(timesPerWeekMatch[1]);

  // "3 times a day"
  const timesPerDayMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(?:x|times?)\s*(?:per|a|\/)\s*day/);
  if (timesPerDayMatch) return parseFloat(timesPerDayMatch[1]) * 7;

  // "every 36 hours"
  const everyHoursMatch = normalized.match(/every\s+(\d+(?:\.\d+)?)\s*h(?:ours?)?/);
  if (everyHoursMatch) return (24 / parseFloat(everyHoursMatch[1])) * 7;

  console.warn(`[prescriptionCalculations] Unknown frequency: "${freq}"`);
  return 0;
}

// ── Duration Parser ───────────────────────────────────────────────────────────
/**
 * Parse a duration string → treatment days.
 * Handles: "3 months", "3 meses", "12 weeks", "12 semanas",
 *          "90 days", "90 días", "90 dias", or bare numbers (days).
 * @param {string|number} duration
 * @returns {number}
 */
export function parseTreatmentDays(duration) {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;

  const d = duration.toString().toLowerCase().trim();

  const monthMatch = d.match(/(\d+(?:\.\d+)?)\s*(?:months?|mes(?:es)?)/);
  if (monthMatch) return Math.round(parseFloat(monthMatch[1]) * 30.44);

  const weekMatch = d.match(/(\d+(?:\.\d+)?)\s*(?:weeks?|semanas?)/);
  if (weekMatch) return Math.round(parseFloat(weekMatch[1]) * 7);

  const dayMatch = d.match(/(\d+(?:\.\d+)?)\s*(?:days?|d[íi]as?)/);
  if (dayMatch) return Math.round(parseFloat(dayMatch[1]));

  const numeric = parseFloat(d);
  if (!isNaN(numeric)) return Math.round(numeric);

  console.warn(`[prescriptionCalculations] Unknown duration format: "${duration}"`);
  return 0;
}

// ── Unit Conversion ───────────────────────────────────────────────────────────
const UNIT_TO_MG = {
  mg:  1,
  mcg: 0.001,
  'µg': 0.001,
  ug:  0.001,
  g:   1000,
  iu:  0.00025,
  ml:  null,
  'ml': null,
};

/**
 * Convert a dose amount to mg for vial calculations.
 * Returns null if the unit is volume-based (mL) and cannot be converted.
 * @param {number} amount
 * @param {string} unit
 * @returns {number|null}
 */
export function toMg(amount, unit) {
  if (!amount || isNaN(amount)) return 0;
  const key = (unit || 'mg').toLowerCase().trim();
  const factor = UNIT_TO_MG[key];
  if (factor === undefined) {
    console.warn(`[prescriptionCalculations] Unknown unit: "${unit}"`);
    return amount;
  }
  if (factor === null) return null;
  return amount * factor;
}

// ── Main Calculation ──────────────────────────────────────────────────────────
/**
 * Calculates all derived fields for a prescription line.
 * @param {Object} line - Partial prescription line with user inputs
 * @returns {Object} Updated line with all calculated fields
 */
export const calculatePrescriptionLine = (line) => {
  const { dose, doseUnit, frequency, duration, vialSizeInMg } = line;

  const treatmentDays   = parseTreatmentDays(duration);
  const dosesPerWeek    = parseDosesPerWeek(frequency);
  const totalDoses      = treatmentDays > 0 && dosesPerWeek > 0
    ? (treatmentDays / 7) * dosesPerWeek
    : 0;

  const numericDose = parseFloat(dose) || 0;
  const doseMg      = toMg(numericDose, doseUnit);

  const totalRequiredQuantity = numericDose * totalDoses;

  let vialsRequired   = 0;
  let calculatedWaste = 0;

  if (vialSizeInMg > 0 && doseMg !== null && totalDoses > 0) {
    const totalMgRequired = doseMg * totalDoses;
    vialsRequired   = Math.ceil(totalMgRequired / vialSizeInMg);
    calculatedWaste = Math.max(0, (vialsRequired * vialSizeInMg) - totalMgRequired);
  }

  return {
    ...line,
    treatmentDays,
    totalRequiredQuantity: Math.round(totalRequiredQuantity * 1000) / 1000,
    vialsRequired,
    calculatedWaste: Math.round(calculatedWaste * 1000) / 1000,
  };
};

/**
 * Sum the total cost of all prescription lines.
 * @param {Object[]} prescriptionLines
 * @returns {number}
 */
export const calculateTotalPrescriptionCost = (prescriptionLines) => {
  if (!Array.isArray(prescriptionLines)) return 0;
  return prescriptionLines.reduce((acc, line) => {
    const price = parseFloat(line.price) || 0;
    const qty   = parseInt(line.vialsRequired) || 1;
    return acc + (price * qty);
  }, 0);
};
