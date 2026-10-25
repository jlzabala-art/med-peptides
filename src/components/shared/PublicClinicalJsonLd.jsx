'use client';

import React from 'react';

/**
 * PublicClinicalJsonLd
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud & Schema.org Compliant JSON-LD structured data injector.
 * Enables Google Search Rich Snippets for:
 * - MedicalWebPage
 * - MedicalScholarlyArticle
 * - ChemicalSubstance / Drug
 * - MedicalGuideline
 */
export default function PublicClinicalJsonLd({
  type = 'MedicalWebPage',
  name = '',
  description = '',
  url = '',
  category = 'Clinical Peptide',
  casNumber = null,
  purity = null,
  molecularWeight = null,
  sequence = null,
  indications = [],
}) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://regenpept.com');

  const additionalProperties = [
    category ? { '@type': 'PropertyValue', name: 'Clinical Classification', value: category } : null,
    purity ? { '@type': 'PropertyValue', name: 'Batch Purity Threshold', value: purity } : null,
    molecularWeight ? { '@type': 'PropertyValue', name: 'Molecular Weight', value: molecularWeight } : null,
    sequence ? { '@type': 'PropertyValue', name: 'Amino Acid Sequence', value: sequence } : null,
  ].filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: name || 'Atlas Health Clinical Compendium',
    description: description || 'Verified Analytical Specifications and Clinical Compendium by Atlas Health.',
    url: currentUrl,
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: 'Atlas Health & Clinical Sciences',
      url: 'https://regenpept.com',
    },
    mainEntity: {
      '@type': 'MedicalEntity',
      name: name,
      code: casNumber
        ? {
            '@type': 'MedicalCode',
            code: casNumber,
            codingSystem: 'CAS Registry Number',
          }
        : undefined,
      possibleTreatment: indications.length > 0
        ? indications.map((ind) => ({
            '@type': 'MedicalTherapy',
            name: typeof ind === 'string' ? ind : (ind.name || 'Clinical Indication'),
          }))
        : undefined,
      additionalProperty: additionalProperties.length > 0 ? additionalProperties : undefined,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
