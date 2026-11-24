/**
 * Computes the Atlas purchase/dispense date, tentative refill date, and
 * 2-week (14-day) pre-refill alert window from a prescription record.
 */
export function parseRxDate(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  if (typeof raw === 'object' && typeof raw.toDate === 'function') {
    const d = raw.toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'object' && typeof raw.seconds === 'number') {
    const d = new Date(raw.seconds * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const str = String(raw).trim();
  if (!str) return null;
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function extractDurationDays(rx = {}, formulations = []) {
  const candidates = [
    rx?.refillDays,
    rx?.durationDays,
    rx?.duration,
    rx?.treatmentDuration,
    ...(Array.isArray(formulations) ? formulations.map((f) => f?.duration || f?.refillDays) : []),
  ];

  for (const val of candidates) {
    if (typeof val === 'number' && val > 0) return Math.round(val);
    if (typeof val === 'string') {
      const mDays = val.match(/(\d+)\s*(?:days?|d[ií]as?)/i);
      if (mDays) return Number(mDays[1]);
      const mWeeks = val.match(/(\d+)\s*(?:weeks?|semanas?)/i);
      if (mWeeks) return Number(mWeeks[1]) * 7;
      const mMonths = val.match(/(\d+)\s*(?:months?|mes(?:es)?)/i);
      if (mMonths) return Number(mMonths[1]) * 30;
    }
  }
  return 30;
}

export function computeRefillSchedule(rx = {}, formulations = [], nowDate = new Date()) {
  const purchaseDate =
    parseRxDate(rx?.prescriptionDate) ||
    parseRxDate(rx?.dateIssued) ||
    parseRxDate(rx?.mfgDate) ||
    parseRxDate(rx?.dispensedAt) ||
    parseRxDate(rx?.createdAt);

  const durationDays = extractDurationDays(rx, formulations);
  if (!purchaseDate) {
    return {
      purchaseDate: null,
      tentativeRefillDate: null,
      durationDays,
      daysRemaining: null,
      isTwoWeekWarning: false,
      isOverdue: false,
    };
  }

  const tentativeRefillDate = new Date(purchaseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const diffMs = tentativeRefillDate.getTime() - nowDate.getTime();
  const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  return {
    purchaseDate,
    tentativeRefillDate,
    durationDays,
    daysRemaining,
    isTwoWeekWarning: daysRemaining <= 14,
    isOverdue: daysRemaining <= 0,
  };
}

export function formatShortDate(date, isEs = false) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
