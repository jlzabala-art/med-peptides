'use client';

import React, { useMemo } from 'react';
import styles from '../../templates/Catalog.module.css';
import {
  Activity,
  Moon,
  Zap,
  Sparkles,
  Droplets,
  ShieldCheck,
  Beaker,
  FlaskConical,
  Brain,
  CheckCircle2,
  Microscope,
} from '@/lib/icons';
import GcpFilterRail from '@/components/ui/GcpFilterRail';

const ICONS_MAP = {
  'Recovery & Repair': Activity,
  'Cognitive & Mood': Brain,
  'Sleep & Circadian': Moon,
  'Metabolic & Weight': Zap,
  'Longevity & Anti-Aging': Sparkles,
  'Hormonal Optimization': Droplets,
  'Immune Support': ShieldCheck,
  'Research Supplies': Beaker,
  'Other Research Peptides': FlaskConical,
};

const FDA_FILTER_OPTIONS = [
  { id: 'fda_pcac_503a_recommended', label: 'HHS / FDA 503A (6)', icon: ShieldCheck },
  { id: 'fda_approved', label: 'FDA Approved Active', icon: CheckCircle2 },
  { id: 'clinical_investigational', label: 'Phase 3 IND Trials', icon: Microscope },
];

export default function CatalogSidebar({
  categories = [],
  activeCategory,
  onSelectCategory,
  groupedProducts = {},
  isProfessional,
  fdaStatusFilter = null,
  onSelectFdaStatus,
}) {
  const sections = useMemo(() => {
    const pathwayItems = [
      {
        id: 'all-pathways',
        label: 'All Pathways',
        icon: FlaskConical,
        active: activeCategory === null && fdaStatusFilter === null,
        onClick: () => {
          onSelectCategory(null);
          onSelectFdaStatus?.(null);
        },
      },
    ];

    categories.forEach((category) => {
      const productCount = groupedProducts[category]?.length || 0;
      if (productCount === 0 && !isProfessional) return;
      pathwayItems.push({
        id: `cat-${category}`,
        label: category,
        icon: ICONS_MAP[category] || FlaskConical,
        count: productCount,
        active: activeCategory === category && fdaStatusFilter === null,
        onClick: () => {
          onSelectFdaStatus?.(null);
          onSelectCategory(category);
        },
      });
    });

    return [
      {
        id: 'fda-status',
        title: 'FDA Regulatory Status',
        defaultOpen: true,
        items: FDA_FILTER_OPTIONS.map((opt) => ({
          id: opt.id,
          label: opt.label,
          icon: opt.icon,
          active: fdaStatusFilter === opt.id,
          onClick: () => {
            onSelectCategory(null);
            onSelectFdaStatus?.(fdaStatusFilter === opt.id ? null : opt.id);
          },
        })),
      },
      {
        id: 'research-pathways',
        title: 'Research Pathways',
        defaultOpen: true,
        items: pathwayItems,
      },
    ];
  }, [categories, activeCategory, fdaStatusFilter, groupedProducts, isProfessional, onSelectCategory, onSelectFdaStatus]);

  return (
    <>
      {/* Mobile Pills Nav (Zero Emojis — Rule #74) */}
      <nav className={styles.mobileNav} aria-label="Mobile category navigation">
        <button
          type="button"
          className={`${styles.navPill} ${activeCategory === null && fdaStatusFilter === null ? styles.active : ''}`}
          onClick={() => {
            onSelectCategory(null);
            onSelectFdaStatus?.(null);
          }}
        >
          All Pathways
        </button>

        {FDA_FILTER_OPTIONS.map((opt) => {
          const IconComp = opt.icon;
          const isSelected = fdaStatusFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`${styles.navPill} ${isSelected ? styles.active : ''}`}
              onClick={() => {
                onSelectCategory(null);
                onSelectFdaStatus?.(isSelected ? null : opt.id);
              }}
            >
              <IconComp size={14} />
              <span>{opt.label}</span>
            </button>
          );
        })}

        {categories.map((category) => {
          const productCount = groupedProducts[category]?.length || 0;
          if (productCount === 0 && !isProfessional) return null;

          const IconComp = ICONS_MAP[category] || FlaskConical;
          const shortLabel = category.split(' ')[0];

          return (
            <button
              key={category}
              type="button"
              className={`${styles.navPill} ${activeCategory === category && fdaStatusFilter === null ? styles.active : ''}`}
              onClick={() => {
                onSelectFdaStatus?.(null);
                onSelectCategory(category);
              }}
            >
              <IconComp size={15} />
              <span>{shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Unified GCP Rail */}
      <GcpFilterRail sections={sections} />
    </>
  );
}
