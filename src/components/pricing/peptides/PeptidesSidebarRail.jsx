'use client';

import React, { useMemo } from 'react';
import {
  CATEGORY_ORDER,
  CATEGORY_MAP,
  FDA_FILTERS,
  getCategoryIcon,
} from '@/constants/peptideCategories';
import { ShieldCheck, CheckCircle2, Microscope, FlaskConical, Layers } from '@/lib/icons';
import GcpFilterRail from '@/components/ui/GcpFilterRail';

const FDA_ICON_MAP = {
  all: Layers,
  fda_503a: ShieldCheck,
  fda_approved: CheckCircle2,
  clinical_ind: Microscope,
  research_only: FlaskConical,
};

/**
 * PeptidesSidebarRail
 * Canonical GCP Left Filter Rail wrapper for Peptide & B2B Pricing Schedules.
 */
export default function PeptidesSidebarRail({
  isSidebarOpen = true,
  selectedCategory = 'all',
  setSelectedCategory,
  selectedFdaStatus = 'all',
  setSelectedFdaStatus,
  processedProducts = [],
  isEs = false,
}) {
  const sections = useMemo(() => {
    const categoryItems = [
      {
        id: 'all',
        label: isEs ? 'Todas las Formulaciones' : 'All Formulations',
        count: processedProducts.length,
        active: selectedCategory === 'all',
        onClick: () => setSelectedCategory('all'),
      },
    ];

    CATEGORY_ORDER.forEach((key) => {
      const meta = CATEGORY_MAP[key];
      if (!meta) return;
      const count = processedProducts.filter((p) => p.categoryKey === key).length;
      if (count === 0) return;

      const CategoryIcon = () => getCategoryIcon(key, 14);
      categoryItems.push({
        id: key,
        label: isEs ? meta.labelEs : meta.labelEn,
        icon: CategoryIcon,
        count,
        active: selectedCategory === key,
        onClick: () => setSelectedCategory(key),
      });
    });

    const fdaItems = FDA_FILTERS.map((f) => {
      const count =
        f.id === 'all'
          ? processedProducts.length
          : processedProducts.filter((p) => p.fdaBucket === f.id).length;

      return {
        id: f.id,
        label: isEs ? f.labelEs : f.labelEn,
        tooltip: isEs ? (f.tooltipEs || f.labelEs) : (f.tooltipEn || f.labelEn),
        icon: FDA_ICON_MAP[f.id] || ShieldCheck,
        count,
        active: selectedFdaStatus === f.id,
        onClick: () => setSelectedFdaStatus(f.id),
      };
    });

    return [
      {
        id: 'peptide-categories',
        title: isEs ? 'Categorías de Péptidos' : 'Peptide Categories',
        collapsible: false,
        items: categoryItems,
      },
      {
        id: 'fda-status',
        title: isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status',
        collapsible: false,
        items: fdaItems,
      },
    ];
  }, [isEs, processedProducts, selectedCategory, selectedFdaStatus, setSelectedCategory, setSelectedFdaStatus]);

  if (!isSidebarOpen) return null;

  return <GcpFilterRail className="gcp-pricing-sidebar" sections={sections} />;
}
