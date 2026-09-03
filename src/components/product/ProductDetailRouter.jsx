"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const PeptideDetail = dynamic(() => import('./layouts/PeptideDetail'));
const ConsumableDetail = dynamic(() => import('./layouts/ConsumableDetail'));
const EternaDiagnosticDetail = dynamic(() => import('./layouts/EternaDiagnosticDetail'));
const BloodDiagnosticDetail = dynamic(() => import('./layouts/BloodDiagnosticDetail'));
export default function ProductDetailRouter(props) {
  const category = (props.product?.category || '').toLowerCase();

  // Peptides, Hormones, and specific therapeutic categories
  const peptideCategories = [
    'peptides',
    'prefilled peptide pens',
    'hormonal optimization',
    'hormones & endocrinology',
    'recovery & repair',
    'longevity & anti-aging',
    'cognitive & mood',
    'metabolic & weight',
    'sleep & circadian',
    'immune support',
    'hair loss & androgenic',
    'dermatology & skin'
  ];

  // Consumables and physical goods
  const consumableCategories = [
    'packaging & devices',
    'capsules & consumables',
    'clinical_supplies',
    'research supplies',
    'supplies',
    'devices'
  ];

  const ingredientCategories = [
    'raw_material',
    'excipient_vehicle',
    'excipients & vehicles',
    'excipients & bases',
    'nutraceutical / functional ingredients',
    'other compounding material'
  ];

  // Eterna is a specific product
  if (props.product?.id === 'eterna-longevity-platform' || props.product?.slug === 'eterna-longevity-platform') {
    return <EternaDiagnosticDetail {...props} />;
  }

  // Blood Biomarkers & Lab Diagnostics
  const diagnosticCategories = [
    'biomarker test', 
    'diagnostics', 
    'diagnostic', 
    'diagnostic_test', 
    'genetic_test', 
    'dna_test', 
    'testing', 
    'blood test', 
    'lab_test'
  ];
  if (diagnosticCategories.includes(category)) {
    return <BloodDiagnosticDetail {...props} />;
  }

  // For physical consumables & raw compounding materials
  if (consumableCategories.includes(category) || ingredientCategories.includes(category)) {
    return <ConsumableDetail {...props} />;
  }

  // Default to PeptideDetail for now, as it contains the original logic
  return <PeptideDetail {...props} />;
}
