'use client';

import { useState, useEffect, useCallback } from 'react';

export const PATIENT_KPI_CATALOG = [
  {
    id: 'adherence',
    category: 'Treatment',
    title: 'Adherence Rate',
    value: '96%',
    unit: 'on track',
    trend: '+4% this month',
    trendDirection: 'up',
    color: '#10b981',
    icon: 'Pill',
    description: 'Protocol compliance based on daily logged doses.',
  },
  {
    id: 'cycle_progress',
    category: 'Treatment',
    title: 'Cycle Progress',
    value: 'Week 4 of 8',
    unit: '50% complete',
    trend: 'Phase 1 Active',
    trendDirection: 'neutral',
    color: '#0284c7',
    icon: 'Activity',
    description: 'Current duration within your peptide or therapy block.',
  },
  {
    id: 'refill_alert',
    category: 'Prescription',
    title: 'Medication Supply',
    value: '5 Days Left',
    unit: 'vial low',
    trend: 'Refill ready to dispatch',
    trendDirection: 'down',
    color: '#ea580c',
    icon: 'RefreshCw',
    description: 'Current vial buffer before doctor authorization needed.',
  },
  {
    id: 'order_delivery',
    category: 'Logistics',
    title: 'Courier Delivery',
    value: 'Tomorrow',
    unit: 'by 14:00',
    trend: 'DHL Cold-Chain #7740192',
    trendDirection: 'up',
    color: '#0284c7',
    icon: 'Truck',
    description: 'Live refrigerated transit tracking for fresh peptide vial.',
  },
  {
    id: 'bio_age',
    category: 'Longevity',
    title: 'Biological Age Delta',
    value: '-3.2 Yrs',
    unit: 'vs chronological',
    trend: '38.8 vs 42.0 yrs',
    trendDirection: 'up',
    color: '#8b5cf6',
    icon: 'Dna',
    description: 'Epigenetic Horvath clock delta from latest multiomic panel.',
  },
  {
    id: 'pace_aging',
    category: 'Longevity',
    title: 'Pace of Aging',
    value: '0.84x',
    unit: 'DunedinPACE',
    trend: 'Slowing aging velocity',
    trendDirection: 'up',
    color: '#10b981',
    icon: 'Clock',
    description: 'Biological wear per calendar year (below 1.0x indicates slowed senescence).',
  },
  {
    id: 'nad_level',
    category: 'Biomarkers',
    title: 'Cellular NAD+',
    value: '48.2 μM',
    unit: 'optimal range',
    trend: '+12.4 μM vs baseline',
    trendDirection: 'up',
    color: '#06b6d4',
    icon: 'Flame',
    description: 'Intracellular mitochondrial energy cofactor measurement.',
  },
  {
    id: 'hrv_score',
    category: 'Wearables',
    title: 'Autonomic HRV',
    value: '68 ms',
    unit: 'rMSSD 7d avg',
    trend: '+8 ms recovery boost',
    trendDirection: 'up',
    color: '#3b82f6',
    icon: 'HeartPulse',
    description: 'Parasympathetic tone and autonomic nervous system readiness.',
  },
  {
    id: 'sleep_quality',
    category: 'Wearables',
    title: 'Deep Sleep Ratio',
    value: '1h 48m',
    unit: '22% of total sleep',
    trend: '+24m restorative',
    trendDirection: 'up',
    color: '#6366f1',
    icon: 'Moon',
    description: 'Slow-wave sleep essential for GH secretion & cellular repair.',
  },
  {
    id: 'fasting_glucose',
    category: 'Metabolic',
    title: 'Continuous Glucose',
    value: '88 mg/dL',
    unit: 'CGM Mean',
    trend: '94% Time in Range',
    trendDirection: 'up',
    color: '#10b981',
    icon: 'Activity',
    description: '7-day continuous glycemic stability from sensor link.',
  },
  {
    id: 'weight_delta',
    category: 'Metabolic',
    title: 'Body Composition',
    value: '-4.2 kg',
    unit: 'fat mass loss',
    trend: 'Visceral fat down 1.2',
    trendDirection: 'up',
    color: '#0284c7',
    icon: 'Scale',
    description: 'DEXA calibrated visceral and subcutaneous mass evolution.',
  },
  {
    id: 'next_consultation',
    category: 'Care Team',
    title: 'Doctor Check-in',
    value: 'In 3 Days',
    unit: 'Thu 11:30 AM',
    trend: 'Dr. Tariq Al-Mansoor',
    trendDirection: 'neutral',
    color: '#003666',
    icon: 'Calendar',
    description: 'Upcoming telemedicine review to titrate your active protocol.',
  },
];

export const PATIENT_KPI_PRESETS = [
  {
    id: 'longevity',
    name: 'Longevity & Epigenetics',
    icon: 'Dna',
    kpiIds: ['bio_age', 'pace_aging', 'nad_level', 'adherence'],
    description: 'Epigenetic clocks, DunedinPACE, and cellular longevity cofactors.',
  },
  {
    id: 'peptide_recovery',
    name: 'Peptide Recovery & Regimen',
    icon: 'Pill',
    kpiIds: ['adherence', 'cycle_progress', 'refill_alert', 'order_delivery'],
    description: 'Daily dosing compliance, cycle milestone, and cold-chain deliveries.',
  },
  {
    id: 'metabolic_glp',
    name: 'Metabolic & Body Composition',
    icon: 'Scale',
    kpiIds: ['adherence', 'fasting_glucose', 'weight_delta', 'refill_alert'],
    description: 'CGM stability, body composition trend, and continuous treatment.',
  },
  {
    id: 'vitality_wearables',
    name: 'Wearables & Vitality Sync',
    icon: 'HeartPulse',
    kpiIds: ['hrv_score', 'sleep_quality', 'bio_age', 'adherence'],
    description: 'HRV readiness, slow-wave sleep regeneration, and protocol adherence.',
  },
];

const DEFAULT_SELECTED_IDS = ['adherence', 'cycle_progress', 'refill_alert', 'order_delivery'];
const STORAGE_PREFIX = 'regenpept_patient_kpis_';

export function usePatientKpis(userId = null) {
  const storageKey = `${STORAGE_PREFIX}${userId || 'guest'}`;

  const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTED_IDS);
  const [activePreset, setActivePreset] = useState('peptide_recovery');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedIds(parsed.slice(0, 4));
        }
      }
    } catch {
      // Fallback to default
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Persist to localStorage
  const saveSelection = useCallback((newIds, presetId = null) => {
    const sanitized = newIds.slice(0, 4);
    setSelectedIds(sanitized);
    if (presetId) setActivePreset(presetId);
    else setActivePreset(null);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(sanitized));
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  // Toggle single KPI
  const toggleKpi = useCallback((id) => {
    setSelectedIds(prev => {
      let next;
      if (prev.includes(id)) {
        // Minimum 1 selected
        if (prev.length <= 1) return prev;
        next = prev.filter(k => k !== id);
      } else {
        if (prev.length >= 4) {
          // Replace last one if already at 4
          next = [...prev.slice(0, 3), id];
        } else {
          next = [...prev, id];
        }
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore
      }
      setActivePreset(null);
      return next;
    });
  }, [storageKey]);

  // Apply preset
  const applyPreset = useCallback((presetId) => {
    const preset = PATIENT_KPI_PRESETS.find(p => p.id === presetId);
    if (preset) {
      saveSelection(preset.kpiIds, preset.id);
    }
  }, [saveSelection]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    applyPreset('peptide_recovery');
  }, [applyPreset]);

  // Resolved list of active KPI objects
  const activeKpis = selectedIds
    .map(id => PATIENT_KPI_CATALOG.find(k => k.id === id))
    .filter(Boolean);

  return {
    selectedIds,
    activeKpis,
    activePreset,
    isLoaded,
    toggleKpi,
    applyPreset,
    resetToDefault,
    saveSelection,
    maxAllowed: 4,
  };
}
