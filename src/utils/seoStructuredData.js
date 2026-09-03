/**
 * seoStructuredData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Schema.org JSON-LD & CWV Preload Generators for Products & Protocols.
 * Generates Google-compliant rich snippets for Drugs, Medical Entities, and Clinical Guidelines.
 */

import { resolveVariantClinicalImage } from './clinicalImageResolver.js';

export function generateProductJsonLd(product, baseUrl = 'https://regenpept.com') {
  if (!product) return null;

  const name = product.canonicalName || product.name || 'Peptide Compound';
  const scientificName = product.scientificName || product.chemicalName || name;
  const description = product.description || product.desc || `${name} clinical specification, purity verification, and administration guidelines.`;
  const heroImage = `${baseUrl}${resolveVariantClinicalImage(product?.variants?.[0] || {}, product)}`;
  const molecularWeight = product?.molecular?.molecularWeight || product?.molecularWeight || null;
  const formula = product?.molecular?.formula || product?.formula || null;
  const casNumber = product?.molecular?.casNumber || product?.cas || null;
  const purity = product?.purity || 99.4;

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'MedicalEntity', 'Drug'],
    name,
    alternateName: scientificName,
    description,
    image: heroImage,
    brand: {
      '@type': 'Brand',
      name: 'RegenPept'
    },
    category: 'Biotechnology / Clinical Peptides',
    activeIngredient: name,
    code: casNumber ? {
      '@type': 'MedicalCode',
      code: casNumber,
      codingSystem: 'CAS-RN'
    } : undefined,
    additionalProperty: [
      molecularWeight ? {
        '@type': 'PropertyValue',
        name: 'Molecular Weight',
        value: `${molecularWeight} g/mol`
      } : null,
      formula ? {
        '@type': 'PropertyValue',
        name: 'Molecular Formula',
        value: formula
      } : null,
      {
        '@type': 'PropertyValue',
        name: 'Analytical Purity (RP-HPLC)',
        value: `≥ ${purity}%`
      }
    ].filter(Boolean),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'RegenPept'
      }
    }
  };

  return schema;
}

export function generateProtocolJsonLd(protocol, baseUrl = 'https://regenpept.com') {
  if (!protocol) return null;

  const title = protocol.title || protocol.name || 'Clinical Protocol';
  const description = protocol.description || `Evidence-based clinical protocol for ${protocol.goal || 'cellular optimization'}.`;
  const targetSystem = protocol.targetSystem || protocol.category || 'Human Longevity';

  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalGuideline', 'MedicalEntity'],
    name: title,
    description,
    targetPopulation: 'Adults under physician supervision',
    medicalSpecialty: 'Endocrinology / Preventive Medicine',
    about: {
      '@type': 'MedicalCondition',
      name: targetSystem
    },
    publisher: {
      '@type': 'Organization',
      name: 'RegenPept Clinical Research'
    }
  };
}
