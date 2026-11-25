'use client';

import React from 'react';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import { buildPeptidesPriceSchedulePdfBlob } from '@/lib/pdf/peptidesPriceSchedulePdf';

/**
 * Parses multi-component peptide blends (like GLOW, KLOW, CJC-1295 + Ipamorelin)
 * so neither the formulation name nor the individual milligram concentrations
 * are ever truncated with ellipses (...).
 */
export function parsePeptideBlendDisplay(productName = '', rawDose = '') {
  const nameStr = String(productName || '').trim();
  const doseStr = String(rawDose || '').trim();
  const upperName = nameStr.toUpperCase();

  if (upperName.startsWith('GLOW')) {
    const mainTitle = 'GLOW Blend (3-Peptide Stack)';
    const primaryDose = '70 mg Total';
    return {
      isBlend: true,
      mainTitle,
      titleLine: mainTitle,
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg)',
      primaryDose,
      dosageMain: primaryDose,
      subDose: '10 / 10 / 50 mg'
    };
  }

  if (upperName.startsWith('KLOW')) {
    const mainTitle = 'KLOW Blend (4-Peptide Stack)';
    const primaryDose = '80 mg Total';
    return {
      isBlend: true,
      mainTitle,
      titleLine: mainTitle,
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg) + KPV (10 mg)',
      primaryDose,
      dosageMain: primaryDose,
      subDose: '10 / 10 / 50 / 10 mg'
    };
  }

  const parenMatch = nameStr.match(/^([^(]+)\(([^)]+)\)$/);
  const doseParts = doseStr.split(/[+·/]/).map(s => s.trim()).filter(Boolean);

  if (parenMatch && doseParts.length > 1) {
    const baseTitle = parenMatch[1].trim();
    const innerIngredients = parenMatch[2].split(/[/+]/).map(s => s.trim()).filter(Boolean);
    const paired = innerIngredients.map((ing, i) => (doseParts[i] ? `${ing} (${doseParts[i]})` : ing)).join(' + ');
    const numericSum = doseParts.reduce((acc, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)\s*mg/i);
      return m ? acc + parseFloat(m[1]) : acc;
    }, 0);
    const primaryDose = numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' + ');

    return {
      isBlend: true,
      mainTitle: baseTitle,
      titleLine: baseTitle,
      compositionLine: paired,
      primaryDose,
      dosageMain: primaryDose,
      subDose: doseParts.map(d => d.replace(/\s*mg/i, '')).join(' / ') + ' mg'
    };
  }

  if (doseParts.length > 1) {
    const numericSum = doseParts.reduce((acc, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)\s*mg/i);
      return m ? acc + parseFloat(m[1]) : acc;
    }, 0);
    const primaryDose = numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' · ');

    return {
      isBlend: true,
      mainTitle: nameStr,
      titleLine: nameStr,
      compositionLine: null,
      primaryDose,
      dosageMain: primaryDose,
      subDose: doseParts.join(' + ')
    };
  }

  return {
    isBlend: false,
    mainTitle: nameStr,
    titleLine: nameStr,
    compositionLine: null,
    primaryDose: doseStr || '—',
    dosageMain: doseStr || '—',
    subDose: null
  };
}

export function resolveCasForPdf(productName = '', rowCas = null) {
  if (rowCas) return rowCas;
  const clean = (productName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const found = Object.entries(KNOWN_PEPTIDE_DATA).find(([k]) => {
    const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean.includes(kClean) || kClean.includes(clean);
  });
  return found?.[1]?.casNumber || null;
}

export default function PeptidePricePdfPreviewModal({
  isOpen,
  onClose,
  products = [],
  currency = 'USD',
  currencySymbol = '$',
  formatPrice,
  isDistributor = false,
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const downloadName = isEs
    ? `Atlas_Health_Tarifa_Peptidos_${currency}.pdf`
    : `Atlas_Health_Peptide_Schedule_${currency}.pdf`;

  return (
    <DocumentPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      printable={false}
      getPdfBlob={() =>
        buildPeptidesPriceSchedulePdfBlob({
          products,
          currency,
          currencySymbol,
          formatPrice,
          isDistributor,
          isEs,
          groupByCategory: true,
          documentRef: 'ATLAS-B2B-2026-Q4',
        })
      }
      downloadName={downloadName}
      title={isEs ? 'Péptidos Clínicos Liofilizados — Tarifa Oficial PDF' : 'Clinical Lyophilized Peptides — Official Price Schedule PDF'}
      subtitle={`${products.length} SKUs · ${currency}`}
    />
  );
}
