/**
 * GOAL TYPES — Canonical Taxonomy
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all clinical/wellness goals in the platform.
 * Rule: EVERY product must have at least ONE canonical goal ID in product.goals.
 */

export const GOAL_TYPES = {
  ANTI_AGING:        'anti_aging',         // Longevity, cellular renewal, anti-aging
  FAT_LOSS:          'fat_loss',           // Metabolic, weight loss, fat oxidation
  TISSUE_REPAIR:     'tissue_repair',      // Recovery, injury healing, joint & muscle repair
  COGNITIVE:         'cognitive',          // Neuroprotection, focus, mood, sleep
  MUSCLE_GROWTH:     'muscle_growth',      // Hypertrophy, GH secretagogues, muscle mass
  LIBIDO_WELLNESS:   'libido_wellness',    // Sexual wellness, hormonal balance, vitality
  HAIR_RESTORATION:  'hair_restoration',   // Trichology, follicle stimulation, hair density & scalp health
  SKIN_REGENERATION: 'skin_regeneration',  // Dermal matrix renewal, collagen synthesis, cosmetic skin care
  GENERAL_HEALTH:    'general_health',     // Baseline wellness, vitamins, diagnostics, general research
};

export const VALID_GOALS = new Set(Object.values(GOAL_TYPES));

export const GOAL_LABELS = {
  anti_aging:        'Longevity & Anti-Aging',
  fat_loss:          'Metabolic & Weight Loss',
  tissue_repair:     'Tissue Repair & Recovery',
  cognitive:         'Cognitive & Neuro-Wellness',
  muscle_growth:     'Muscle Growth & Performance',
  libido_wellness:   'Hormonal & Sexual Wellness',
  hair_restoration:  'Trichology & Hair Restoration',
  skin_regeneration: 'Dermal Care & Skin Regeneration',
  general_health:    'General Health & Diagnostics',
};
