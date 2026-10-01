'use client';

import React from 'react';
import {
  Dna,
  Scale,
  ShieldCheck,
  Brain,
  Dumbbell,
  Heart,
  FlaskConical,
  Activity
} from 'lucide-react';

/**
 * Canonical Google Cloud style monochrome icons for clinical goals.
 * Maps all variations of goal IDs to clean, professional outline SVG icons.
 */
export const GOAL_ICON_MAP = {
  // Longevity & Anti-Aging
  anti_aging: Dna,
  anti_aging_longevity: Dna,
  longevity: Dna,
  longevity_anti_aging: Dna,

  // Metabolic & Weight Loss
  fat_loss: Scale,
  metabolic_health: Scale,
  weight_loss_glp1: Scale,
  metabolic: Scale,
  weight_loss: Scale,

  // Tissue Repair & Recovery
  tissue_repair: ShieldCheck,
  recovery_healing: ShieldCheck,
  recovery: ShieldCheck,

  // Cognitive & Neuro-Wellness
  cognitive: Brain,
  cognitive_mood: Brain,
  neuro: Brain,

  // Muscle Growth & Performance
  muscle_growth: Dumbbell,
  performance_muscle: Dumbbell,
  muscle: Dumbbell,

  // Hormonal & Sexual Wellness
  libido_wellness: Heart,
  hormonal_optimization: Heart,
  hormonal: Heart,
  sexual_wellness: Heart,

  // General Health & Diagnostics / Standards
  general_health: FlaskConical,
  general_wellness: FlaskConical,
  general: FlaskConical,
  other: FlaskConical
};

/**
 * Returns the matching Lucide icon component for a clinical goal.
 */
export function getGoalIconComponent(goalId) {
  if (!goalId) return FlaskConical;
  const cleanId = String(goalId).toLowerCase().trim();
  return GOAL_ICON_MAP[cleanId] || FlaskConical;
}

/**
 * Professional Google Cloud-styled monochrome GoalIcon component.
 */
export default function GoalIcon({
  goalId,
  size = 16,
  strokeWidth = 2,
  color = 'currentColor',
  style = {},
  className = ''
}) {
  const IconComponent = getGoalIconComponent(goalId);
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      style={style}
      className={className}
      aria-hidden="true"
    />
  );
}
