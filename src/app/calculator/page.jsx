import React from 'react';
import CalculatorClient from './CalculatorClient';

const FORMAT_LABELS = {
  vial: { en: 'Lyophilized Vial (U-100 Syringe)', es: 'Vial Liofilizado (Jeringa U-100)' },
  pen: { en: 'Injector Pen (3 mL)', es: 'Pluma Inyectora (3 mL)' },
  cartridge: { en: 'Refill Cartridge (3 mL)', es: 'Cartucho de Recambio (3 mL)' },
  spray: { en: 'Nasal Spray', es: 'Spray Nasal' },
  capsule: { en: 'Oral Capsules / Troches', es: 'Cápsulas Orales / Troches' },
  topical: { en: 'Topical Serum / Cream', es: 'Sérum / Crema Tópica' },
};

function prettifySlug(slug = '') {
  if (!slug) return '';
  return String(slug)
    .split('-')
    .map((part) => {
      if (/^(bpc|tb|ghk|cu|cjc|nad|kpv|dsip|mots|pt|ll|hcg|igf|mgf|epithalon|semax|selank)$/i.test(part)) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ')
    .replace(/\bBPC 157\b/i, 'BPC-157')
    .replace(/\bTB 500\b/i, 'TB-500')
    .replace(/\bGHK CU\b/i, 'GHK-Cu')
    .replace(/\bPT 141\b/i, 'PT-141')
    .replace(/\bCJC 1295\b/i, 'CJC-1295')
    .replace(/\bMOTS C\b/i, 'MOTS-C');
}

export async function generateMetadata({ searchParams }) {
  const sp = (await searchParams) || {};
  const isEs = String(sp.lang || '').toLowerCase() === 'es';
  const peptideRaw = String(sp.peptide || sp.slug || '').trim();
  const peptideName = prettifySlug(peptideRaw);
  const formatKey = String(sp.format || sp.presentation || '').toLowerCase().trim();
  const formatMeta = FORMAT_LABELS[formatKey];
  const strength = String(sp.strength || sp.dose || '').trim();
  const target = String(sp.target || '').trim();
  const bac = String(sp.bac || '').trim();
  const puffs = String(sp.puffs || '').trim();

  if (!peptideName) {
    const defaultTitle = isEs
      ? 'Guía Visual de Uso y Dosificación de Péptidos | Atlas Health'
      : 'Peptide Administration & Dosing Visual Guide | Atlas Health';
    const defaultDesc = isEs
      ? 'Guía visual interactiva paso a paso para pacientes: viales liofilizados, plumas inyectoras, cartuchos de 3 mL, sprays nasales, cápsulas y tópicos.'
      : 'Interactive step-by-step patient administration guide for lyophilized vials, injector pens, 3 mL cartridges, nasal sprays, oral capsules, and topicals.';
    return {
      title: defaultTitle,
      description: defaultDesc,
      openGraph: { title: defaultTitle, description: defaultDesc, type: 'website' },
      twitter: { card: 'summary_large_image', title: defaultTitle, description: defaultDesc },
    };
  }

  const fmtLabel = formatMeta ? (isEs ? formatMeta.es : formatMeta.en) : '';
  const summaryParts = [peptideName, strength, fmtLabel].filter(Boolean).join(' · ');
  const targetClause = target
    ? (isEs ? ` — Dosis: ${target}` : ` — Dose: ${target}`)
    : puffs
    ? (isEs ? ` — ${puffs} pulverización(es)` : ` — ${puffs} spray(s)`)
    : '';

  const title = isEs
    ? `Cómo usar ${summaryParts}${targetClause} | Atlas Health`
    : `How to Use ${summaryParts}${targetClause} | Atlas Health`;

  const detailBits = [
    strength ? (isEs ? `Presentación: ${strength}` : `Strength: ${strength}`) : '',
    fmtLabel ? (isEs ? `Formato: ${fmtLabel}` : `Format: ${fmtLabel}`) : '',
    formatKey === 'vial' && bac ? (isEs ? `Agua BAC: ${bac}` : `BAC Water: ${bac}`) : '',
    target ? (isEs ? `Dosis objetivo: ${target}` : `Target dose: ${target}`) : '',
    formatKey === 'spray' && puffs ? (isEs ? `Aplicaciones: ${puffs} sprays` : `Application: ${puffs} sprays`) : '',
  ].filter(Boolean).join(' · ');

  const description = isEs
    ? `Guía visual paso a paso para paciente: ${detailBits}. Incluye calibración exacta, conservación y pautas de seguridad.`
    : `Step-by-step visual patient administration guide: ${detailBits}. Includes exact visual dosing calibration, storage & safety instructions.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Atlas Health Services',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function CalculatorRoute() {
  return <CalculatorClient />;
}
