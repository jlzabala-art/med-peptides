import React from 'react';
import { 
  Activity, TrendingUp, Zap, Brain, Moon, Flame, Waves, Shield, Dna
} from 'lucide-react';

export const PRIMARY_OBJECTIVES = [
  { id: "Longevity", label: "Longevity", icon: <Dna size={22} />, description: "Anti-Aging markers", popular: true },
  { id: "Weight Management / Obesity", label: "Weight Management", icon: <TrendingUp size={22} />, description: "Metabolic optimization", popular: true },
  { id: "Metabolic Health", label: "Metabolic Health", icon: <Activity size={22} />, description: "Insulin & Glucose" },
  { id: "Recovery / Injury", label: "Recovery & Injury", icon: <Zap size={22} />, description: "Tissue Repair" },
  { id: "Cognitive Support", label: "Cognitive Support", icon: <Brain size={22} />, description: "Focus & Brain health" },
  { id: "Sleep Support", label: "Sleep Support", icon: <Moon size={22} />, description: "Restorative Sleep" },
  { id: "Hormonal Support", label: "Hormonal Support", icon: <Flame size={22} />, description: "Endocrine Balance" },
  { id: "Skin / Anti-Aging", label: "Skin & Aesthetics", icon: <Waves size={22} />, description: "Cellular renewal" },
  { id: "Immune / Inflammation", label: "Immune Support", icon: <Shield size={22} />, description: "Defensive Response" },
  { id: "Energy / Mitochondrial", label: "Mitochondrial Energy", icon: <Zap size={22} />, description: "Cellular Vitality" }
];

export const CLINICAL_OBJECTIVE_GROUPS = [
  {
    group: "Weight Management",
    options: [
      { id: "Weight Management / Obesity", label: "Weight Loss & Adiposity" }
    ]
  },
  {
    group: "Metabolic Health",
    options: [
      { id: "Metabolic Health", label: "Glucose & Insulin Resistance" },
      { id: "Energy / Mitochondrial", label: "Mitochondrial Energy & Vitality" }
    ]
  },
  {
    group: "Recovery & Injury",
    options: [
      { id: "Recovery / Injury", label: "Tissue Repair & Healing" }
    ]
  },
  {
    group: "Cognitive Support",
    options: [
      { id: "Cognitive Support", label: "Mental Focus & Neuroprotection" }
    ]
  },
  {
    group: "Hormonal Support",
    options: [
      { id: "Hormonal Support", label: "Endocrine Balance & Optimization" }
    ]
  },
  {
    group: "Longevity",
    options: [
      { id: "Longevity", label: "Cellular Aging & Senescence" }
    ]
  },
  {
    group: "Immune Support",
    options: [
      { id: "Immune / Inflammation", label: "Systemic Inflammation Control" }
    ]
  },
  {
    group: "Sleep Support",
    options: [
      { id: "Sleep Support", label: "Deep Restorative Sleep" }
    ]
  },
  {
    group: "Skin & Aesthetic Support",
    options: [
      { id: "Skin / Anti-Aging", label: "Cellular Renewal & Aesthetics" }
    ]
  }
];

export const CONSTRAINT_GROUPS = {
  format: { 
    label: "Format Constraints", 
    type: "single", 
    options: [
      { id: "no_restriction", label: "No format restriction" },
      { id: "prefer_oral", label: "Prefer oral" },
      { id: "avoid_injectables", label: "Avoid injectables" },
      { id: "oral_only", label: "Oral only" }
    ] 
  },
  complexity: { 
    label: "Workflow Complexity", 
    type: "single", 
    options: [
      { id: "minimal", label: "Minimal" },
      { id: "standard", label: "Standard" },
      { id: "advanced", label: "Advanced" }
    ] 
  },
  clinical: { 
    label: "Clinical Context", 
    type: "multiple", 
    options: [
      { id: "fasting_enabled", label: "Fasting protocol" },
      { id: "circadian_aligned", label: "Circadian alignment" },
      { id: "post_surgical", label: "Post-surgical" },
      { id: "preventative", label: "Preventative focus" }
    ] 
  },
  formulation: { 
    label: "Formulation Preference", 
    type: "single", 
    options: [
      { id: "purity_focused", label: "High purity" },
      { id: "any", label: "No preference" },
      { id: "compounded", label: "Compounded stacks" }
    ] 
  },
  practical: { 
    label: "Practical Constraints", 
    type: "multiple", 
    options: [
      { id: "travel_friendly", label: "Travel friendly" },
      { id: "minimal_supplies", label: "Minimal supplies" },
      { id: "budget_optimized", label: "Budget optimized" }
    ] 
  },
  workflow: { 
    label: "Protocol Tempo", 
    type: "single", 
    options: [
      { id: "standard", label: "Standard" },
      { id: "rapid", label: "Rapid / Aggressive" },
      { id: "conservative", label: "Conservative / Low dose" }
    ] 
  }
};
