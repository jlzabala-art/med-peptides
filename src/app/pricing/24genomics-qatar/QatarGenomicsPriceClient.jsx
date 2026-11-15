'use client';

import React, { useMemo } from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import { useCommercialSchedule } from '@/hooks/useCommercialSchedule';
import { FALLBACK_AGREEMENTS } from '@/repositories/commercialAgreementsRepository';
import '../colway/ColwayPriceList.css';

const QAR_TO_AED = 3.6725 / 3.64;
const EUR_TO_AED = 3.98;

const QATAR_GENOMICS_PANELS = [
  {
    id: 'nutrigenetics',
    sku: '24G-NUTRIGENETICS',
    name: 'Nutrigenetics Clinical DNA Panel (Nutrigen)',
    subtitle: 'Macro & micronutrient metabolic predisposition, food intolerances, glycemic response & vitamin pathways',
    volume: '1 Saliva Kit',
    presentation: 'CE-IVD Buccal Swab Kit + Madrid Lab Analysis',
    category: 'Clinical Nutrigenomics',
    keyActives: 'MTHFR, FTO, PPARG, TCF7L2, VDR, BCMO1, SLC23A1, MCM6, HLA-DQ2/DQ8 (+50,000 SNPs)',
    clinicalFocus: 'Direct formulation of personalized compounded nutrigenomic multi-nutrient capsules.',
    labCostEur: 104.30,
    distributorPriceQar: 475.00,
    clinicPriceQar: 750.00,
    retailPriceQar: 950.00,
    stockStatus: '3-4 Weeks (Madrid Lab)',
  },
  {
    id: 'all-in-one',
    sku: '24G-ALL-IN-ONE',
    name: 'All-in-One Comprehensive DNA Panel (7 Full Reports)',
    subtitle: 'Complete 7-in-1 clinical genomic suite: Health, Pharmacogenetics, Nutrigenetics, Sport, Skin, Personality & Ancestry',
    volume: '1 Saliva Kit',
    presentation: 'CE-IVD Buccal Swab Kit + 7 Digital Clinical Reports',
    category: 'Complete Genomic Profile',
    keyActives: 'CYP450, MTHFR, COMT, APOE, FTO, VDR, ACTN3, COL1A1, BDNF, SULT1A1 (+700,000 SNPs)',
    clinicalFocus: 'Full longevity, preventive medicine, and precision compounding calibration.',
    labCostEur: 104.30,
    distributorPriceQar: 550.00,
    clinicPriceQar: 890.00,
    retailPriceQar: 1150.00,
    stockStatus: '3-4 Weeks (Madrid Lab)',
  },
  {
    id: 'pharmacogenetics',
    sku: '24G-PHARMACOGENETICS',
    name: 'Pharmacogenetics Plus DNA Panel',
    subtitle: 'CYP450 enzyme metabolism profile for +400 prescription drugs across cardiology, psychiatry & pain management',
    volume: '1 Saliva Kit',
    presentation: 'CE-IVD Buccal Swab Kit + Clinical Drug Response Report',
    category: 'Pharmacogenomics',
    keyActives: 'CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5, VKORC1, SLCO1B1, TPMT, DPYD (+80,000 SNPs)',
    clinicalFocus: 'Adverse drug reaction prevention and precision therapeutic dosing.',
    labCostEur: 104.30,
    distributorPriceQar: 475.00,
    clinicPriceQar: 750.00,
    retailPriceQar: 950.00,
    stockStatus: '3-4 Weeks (Madrid Lab)',
  },
  {
    id: 'tier-1-single',
    sku: '24G-QA-TIER-1',
    name: '24Genetics Nutrigenomics — Single Kit (1 Unit)',
    subtitle: 'Single test sample batch delivered to Doha with full clinical interpretation',
    volume: '1 Kit',
    presentation: 'Single Kit Commercial Tier',
    category: 'Volume Tiers (Qatar)',
    keyActives: 'Full Nutrigenomic Panel + Compounding Protocol Blueprint',
    clinicalFocus: 'On-demand single patient genomic onboarding.',
    labCostEur: 169.00,
    distributorPriceQar: 1048.44,
    clinicPriceQar: 1180.00,
    retailPriceQar: 1350.00,
    stockStatus: 'In Stock (Doha / Madrid)',
  },
  {
    id: 'tier-50-batch',
    sku: '24G-QA-TIER-50',
    name: '24Genetics Nutrigenomics — Commercial Batch (50 Kits)',
    subtitle: '50-kit institutional batch pricing for Doha clinics and hospitals',
    volume: '50 Kits (Unit Rate)',
    presentation: 'Commercial Batch Allocation',
    category: 'Volume Tiers (Qatar)',
    keyActives: '50× CE-IVD Saliva Kits + AI Nutrigenomic Engine Access',
    clinicalFocus: 'Clinic-wide preventive and longevity screening program.',
    labCostEur: 159.00,
    distributorPriceQar: 799.56,
    clinicPriceQar: 950.00,
    retailPriceQar: 1150.00,
    stockStatus: 'Batch Allocation (50×)',
  },
  {
    id: 'tier-100-batch',
    sku: '24G-QA-TIER-100',
    name: '24Genetics Nutrigenomics — Clinic Master Batch (100 Kits)',
    subtitle: '100-kit master distributor tier with maximum unit margin',
    volume: '100 Kits (Unit Rate)',
    presentation: 'Master Clinic Batch Allocation',
    category: 'Volume Tiers (Qatar)',
    keyActives: '100× CE-IVD Saliva Kits + Priority Madrid Sequencing',
    clinicalFocus: 'Enterprise hospital and national wellness deployment.',
    labCostEur: 149.00,
    distributorPriceQar: 750.67,
    clinicPriceQar: 890.00,
    retailPriceQar: 1100.00,
    stockStatus: 'Batch Allocation (100×)',
  },
];

export default function QatarGenomicsPriceClient() {
  const { agreement } = useCommercialSchedule('24genomics-qatar');
  const fallback = FALLBACK_AGREEMENTS['24genomics-qatar'];

  const initialProducts = useMemo(
    () =>
      QATAR_GENOMICS_PANELS.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        subtitle: p.subtitle,
        volume: p.volume,
        presentation: p.presentation,
        category: p.category,
        keyActives: p.keyActives,
        clinicalFocus: p.clinicalFocus,
        landedCostAed: Number((p.labCostEur * EUR_TO_AED).toFixed(2)),
        wholesalePriceAed: Number((p.distributorPriceQar * QAR_TO_AED).toFixed(2)),
        clinicPriceAed: Number((p.clinicPriceQar * QAR_TO_AED).toFixed(2)),
        retailPriceAed: Number((p.retailPriceQar * QAR_TO_AED).toFixed(2)),
        stockStatus: p.stockStatus,
      })),
    []
  );

  const config = {
    sectionLabel: 'B2B Wholesale',
    navCurrentLabel: '24Genomics Qatar Schedule',
    loginRedirect: '/pricing/24genomics-qatar',
    brandLeft: 'ATLAS HEALTH',
    brandRight: '24GENOMICS · RYHANH QATAR',
    documentTitle: agreement?.title || '24GENOMICS CLINICAL DNA & NUTRIGENOMICS SCHEDULE',
    documentSubtitle:
      agreement?.subtitle ||
      'Official Qatar B2B schedule for saliva DNA testing kits, clinical reports & personalized 3-capsule compounding protocols',
    documentRef: agreement?.documentRef || fallback?.documentRef || 'DOC-QA-24G-2026-V1',
    defaultCurrency: 'QAR',
    availableCurrencies: ['QAR', 'USD', 'EUR'],
    defaultMarkupPct: 14.5,
    skuPrefixPattern: /^24G-/i,
    searchPlaceholder: 'Search 24Genomics Qatar panels by name, SKU, genes, or batch tier...',
    storageNamespace: '24genomics_qatar_pricing',
    exportBrandTitle: '24Genomics Qatar (Ryhanh Medical)',
    exportFilePrefix: '24Genomics_Qatar_Price_Schedule',
    whatsappHeader: '*24GENOMICS NUTRITION — OFFICIAL QATAR B2B SCHEDULE*',
    persistInlineEdits: false,
  };

  return <ModularPriceSchedule initialProducts={initialProducts} config={config} />;
}
