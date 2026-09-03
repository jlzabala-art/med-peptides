import { Brain, Moon, Shield, Activity, Heart, Clock, Flame, Sparkles, Dna, Scale, Zap, Leaf, FlaskConical } from 'lucide-react';

/**
 * CLINICAL_GOALS — canonical list of goal IDs.
 * IDs MUST match exactly what is stored in Firestore products.goalIds[]
 * as confirmed by full-scan on 2026-08-11.
 *
 * Frequency in catalog (total products):
 *   general_wellness    122
 *   hormonal_optimization 78
 *   anti_aging_longevity  66
 *   skin_hair_aesthetics  53
 *   immune_support        51
 *   recovery_healing      44
 *   metabolic_health      40
 *   cognitive_mood        35
 *   performance_muscle    30
 *   genomics              23
 *   weight_loss_glp1      23
 *   biomarkers             9
 *   fertility              7
 */
export const CLINICAL_GOALS = [
  { id: 'general_wellness',      label: 'General Wellness',         icon: Leaf       },
  { id: 'hormonal_optimization', label: 'Hormonal Optimization',    icon: Activity   },
  { id: 'anti_aging_longevity',  label: 'Anti-Aging & Longevity',   icon: Clock      },
  { id: 'skin_hair_aesthetics',  label: 'Skin, Hair & Aesthetics',  icon: Sparkles   },
  { id: 'immune_support',        label: 'Immune Support',           icon: Shield     },
  { id: 'recovery_healing',      label: 'Recovery & Healing',       icon: Heart      },
  { id: 'metabolic_health',      label: 'Metabolic Health',         icon: Scale      },
  { id: 'cognitive_mood',        label: 'Cognitive & Mood',         icon: Brain      },
  { id: 'performance_muscle',    label: 'Performance & Muscle',     icon: Zap        },
  { id: 'genomics',              label: 'Genomics',                 icon: Dna        },
  { id: 'weight_loss_glp1',      label: 'Weight Loss / GLP-1',      icon: Activity   },
  { id: 'biomarkers',            label: 'Biomarkers',               icon: FlaskConical },
  { id: 'fertility',             label: 'Fertility',                icon: Flame      },
];

export const getGoalById    = (id) => CLINICAL_GOALS.find(g => g.id === id);
export const getGoalLabel   = (id) => getGoalById(id)?.label || id;
