 
import React from 'react';

/**
 * Highlights matches in a text string based on a search query.
 * @param {string} text - The full text to search within.
 * @param {string} query - The search query.
 * @returns {Array|string} - React elements with <mark> tags or the original text.
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0 2px', borderRadius: '2px' }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Strips HTML tags from a string.
 */
export function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Parses a string with {gradient:Text} pattern and returns React elements
 * with the gradient part wrapped in a span with 'text-gradient' class.
 */
export const renderWithGradient = (text) => {
  if (!text) return null;
  
  const parts = text.split(/(\{gradient:.*?\})/);
  
  return parts.map((part, index) => {
    if (part.startsWith('{gradient:') && part.endsWith('}')) {
      const content = part.slice(10, -1);
      return <span key={index} className="text-gradient">{content}</span>;
    }
    return part;
  });
};
/**
 * Safe string coercion — prevents React error #31 when data fields are objects.
 * Returns a human-readable string regardless of the value type.
 */
export const safeStr = (v, fallback = '—') => {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') return v || fallback;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(x => safeStr(x, '')).filter(Boolean).join(', ') || fallback;
  if (typeof v === 'object') {
    // Common object shapes: {value, unit} or {amount, unit} or {text} or {label}
    const val = v.value ?? v.amount ?? v.dose ?? v.text ?? v.label ?? v.name;
    const unit = v.unit || v.dose_unit || '';
    if (val != null) return `${safeStr(val, '')}${unit ? ' ' + unit : ''}`.trim() || fallback;
    return fallback;
  }
  return String(v) || fallback;
};

/**
 * Parses a numeric maximum from a range string like "5-15%", "12", "3–8 cm".
 * Returns a number (0–100 scale) usable for a progress bar fill, or null.
 */
export const parseRangeMax = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  // Match the largest numeric token in the string
  const nums = value.match(/[\d.]+/g);
  if (!nums || nums.length === 0) return null;
  return Math.max(...nums.map(Number));
};

/**
 * Humanizes a string by replacing underscores with spaces and capitalizing words.
 */
export function humanize(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Returns a display string for the protocol duration.
 */
export function displayDuration(protocol) {
  if (!protocol) return 'Multi-phase';
  if (protocol.duration_weeks) return `${protocol.duration_weeks} weeks`;
  if (protocol.timeline?.total_duration_weeks)
    return `${protocol.timeline.total_duration_weeks} weeks`;
  const phases = protocol.phases || [];
  if (phases.length) {
    const total = phases.reduce((s, ph) => s + (ph.duration_weeks || 0), 0);
    if (total) return `${total} weeks`;
  }
  return 'Multi-phase';
}

/**
 * Returns a display string for the number of phases in a protocol.
 */
export function displayPhases(protocol) {
  if (!protocol) return null;
  const arr =
    Array.isArray(protocol.phase_blueprints) && protocol.phase_blueprints.length
      ? protocol.phase_blueprints
      : Array.isArray(protocol.phases) && protocol.phases.length
        ? protocol.phases
        : [];
  if (protocol.number_of_phases) return `${protocol.number_of_phases} phases`;
  if (arr.length) return `${arr.length} phase${arr.length === 1 ? '' : 's'}`;
  return null;
}

export const PEP_KEYWORDS = [
  { keys: ['semaglutide', 'ozempic', 'wegovy'],                  color: '#0070C0', dot: '#2196f3' },
  { keys: ['tirzepatide', 'mounjaro', 'zepbound'],               color: '#2563EB', dot: 'var(--color-primary)' },
  { keys: ['bpc', 'bpc-157', 'bpc157'],                          color: 'var(--color-success)', dot: 'var(--color-success)' },
  { keys: ['tb4', 'tb-4', 'thymosin beta'],                      color: '#0891B2', dot: '#06b6d4' },
  { keys: ['ipamorelin'],                                         color: '#7C3AED', dot: '#a78bfa' },
  { keys: ['cjc', 'cjc-1295', 'cjc1295'],                       color: '#6D28D9', dot: '#8b5cf6' },
  { keys: ['hgh', 'growth hormone', 'somatropin'],               color: '#B45309', dot: '#f59e0b' },
  { keys: ['testosterone', 'enanthate', 'cypionate'],            color: '#92400E', dot: 'var(--color-warning)' },
  { keys: ['nad', 'nad+', 'nicotinamide'],                       color: '#0F766E', dot: '#14b8a6' },
  { keys: ['sermorelin', 'tesamorelin'],                         color: '#1D4ED8', dot: '#60a5fa' },
  { keys: ['pt-141', 'pt141', 'bremelanotide'],                  color: '#BE185D', dot: '#f472b6' },
  { keys: ['melanotan'],                                          color: '#9D174D', dot: '#ec4899' },
  { keys: ['epitalon', 'epithalon'],                             color: '#065F46', dot: '#34d399' },
  { keys: ['kisspeptin'],                                        color: '#7E22CE', dot: '#c084fc' },
  { keys: ['selank', 'semax'],                                   color: '#1E40AF', dot: '#93c5fd' },
  { keys: ['dsip', 'delta sleep'],                               color: '#1E3A5F', dot: '#818cf8' },
  { keys: ['mk-677', 'mk677', 'ibutamoren'],                    color: '#78350F', dot: '#fbbf24' },
  { keys: ['hexarelin', 'ghrp-2', 'ghrp2', 'ghrp-6', 'ghrp6'], color: '#4C1D95', dot: '#ddd6fe' },
];

/**
 * Given a compound display name, returns { color, dot } accent pair.
 * color = chip border/text tint, dot = small colored dot.
 */
export function getPepChipColor(name = '') {
  const lower = name.toLowerCase();
  for (const entry of PEP_KEYWORDS) {
    if (entry.keys.some((k) => lower.includes(k))) return entry;
  }
  return { color: 'var(--color-text-secondary)', dot: 'var(--color-text-tertiary)' }; // generic slate
}

/**
 * Maps a Firestore primary_goal string to a list of sibling goal strings that
 * should be treated as the same navigator category.
 * Add new aliases here whenever a new goal string is introduced in Firestore.
 */
export const GOAL_GROUPS = {
  'Metabolic & Weight':      ['Metabolic & Weight', 'Weight Management / Obesity', 'Metabolic Health', 'Energy / Mitochondrial', 'Metabolic Optimization', 'Mitochondrial Energy'],
  'Recovery & Repair':       ['Recovery & Repair', 'Recovery / Injury', 'Immune / Inflammation'],
  'Cognitive & Mood':        ['Cognitive & Mood', 'Cognitive Support', 'Focus & Resilience'],
  'Sleep & Circadian':       ['Sleep & Circadian', 'Sleep Support', 'Longevity & Circadian'],
  'Longevity & Anti-Aging':  ['Longevity & Anti-Aging', 'Longevity', 'Skin / Anti-Aging', 'Anti-Aging & Longevity', 'Longevity Foundation', 'Mitochondrial Resilience'],
  'Hormonal Optimization':   ['Hormonal Optimization', 'Hormonal Support', 'GH Axis Support'],
  'Immune Support':          ['Immune Support', 'Immune Modulation', 'Immune Reset'],
};

/** Returns the sibling goal strings for a given primaryGoal. Falls back to [primaryGoal]. */
export function getSiblingGoals(primaryGoal) {
  return GOAL_GROUPS[primaryGoal] || [primaryGoal];
}

// ── Clinical Outcomes Helpers ──────────────────────────────────────────────

/** Axis meaning subtitles */
export const METRIC_SUBTITLES = {
  'hb_a1c_reduction_percent':  'Expected reduction by week',
  'fat_mass_reduction_percent':'Expected percentage reduction per phase',
  'waist_reduction_cm':        'Expected reduction in centimeters over time',
  'body_weight_reduction':     'Expected total weight loss',
  'visceral_fat_reduction':    'Expected reduction in visceral adipose tissue',
  'muscle_mass_retention':     'Estimated preservation of lean tissue',
  'fasting_glucose_reduction': 'Estimated reduction in fasting serum glucose',
  'igf_1_elevation_percent':   'Expected growth hormone axis response',
  'crp_reduction_percent':     'Estimated systemic inflammation reduction',
  'texture_improvement':       'Expected refinement of skin surface',
  'barrier_recovery':          'Expected strengthening of skin barrier',
};

/** Unit lookup for flat-shape metrics that don't carry an explicit unit field */
export const METRIC_UNITS = {
  'hb_a1c_reduction_percent':  '%',
  'fat_mass_reduction_percent':'%',
  'waist_reduction_cm':        'cm',
  'body_weight_reduction':     '%',
  'visceral_fat_reduction':    '%',
  'muscle_mass_retention':     '%',
  'fasting_glucose_reduction': 'mg/dL',
  'igf_1_elevation_percent':   '%',
  'crp_reduction_percent':     '%',
};

/** Formats metric names with units */
export const formatMetricName = (name, unit) => {
  let display = name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  // Strip bare 'Percent' / 'Cm' suffixes — the unit will be shown in parentheses
  display = display.replace(/\bPercent\b/g, '').replace(/\bCm\b/g, '').trim();
  // Phase 3: Always show unit if available
  const resolvedUnit = unit || METRIC_UNITS[name] || METRIC_UNITS[name.toLowerCase()] || null;
  if (resolvedUnit) return `${display} (${resolvedUnit})`;
  return display;
};

/** Time-period label formatter — converts numeric keys to "Week N" format */
export const formatTimeLabel = (key) => {
  if (!key) return '';
  if (/^\d+$/.test(key)) return `Week ${key}`;
  const display = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (/^\d+$/.test(display.trim())) return `Week ${display.trim()}`;
  if (display.toLowerCase() === 'baseline') return 'Baseline';
  // Convert "Week4", "week_4" style strings
  const weekMatch = display.match(/^[Ww]eek\s*(\d+)/);
  if (weekMatch) return `Week ${weekMatch[1]}`;
  const phaseMatch = display.match(/^[Pp]hase\s*(\d+)/);
  if (phaseMatch) return `Phase ${phaseMatch[1]}`;
  return display;
};
