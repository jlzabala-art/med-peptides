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
  const explicitImage = product.image_url || product.imageUrl || product.photo_url || null;
  const heroImage = explicitImage 
    ? (explicitImage.startsWith('http') ? explicitImage : `${baseUrl}${explicitImage}`)
    : `${baseUrl}${resolveVariantClinicalImage(product?.variants?.[0] || {}, product)}`;
  const molecularWeight = product?.molecular?.molecularWeight || product?.molecularWeight || null;
  const formula = product?.molecular?.molecularFormula || product?.molecularFormula || product?.molecular?.formula || product?.formula || null;
  const casNumber = product?.molecular?.casNumber || product?.casNumber || product?.cas || null;
  const purity = product?.purity || 99.4;

  const cat = (product.category || product.type || '').toLowerCase();
  const isCosmetic = cat === 'cosmetic' || cat === 'cosmetics' || cat === 'topical';
  const isAesthetic = cat === 'aesthetic' || cat === 'aesthetic_injectable' || cat === 'injectable';

  const schemaTypes = isCosmetic
    ? ['Product']
    : isAesthetic
      ? ['Product', 'MedicalEntity']
      : ['Product', 'MedicalEntity', 'Drug'];

  const categoryName = isCosmetic
    ? 'Cosmetics & Topical Care'
    : isAesthetic
      ? 'Aesthetic Medicine / Injectables'
      : 'Biotechnology / Clinical Peptides';

  const brandName = product.supplierName || product.supplier || (isCosmetic ? 'Colway' : 'RegenPept');

  const additionalProps = [
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
    !isCosmetic && purity ? {
      '@type': 'PropertyValue',
      name: 'Analytical Purity (RP-HPLC)',
      value: typeof purity === 'number' ? `≥ ${purity}%` : String(purity)
    } : null,
    isCosmetic && product.volume ? {
      '@type': 'PropertyValue',
      name: 'Volume / Presentation',
      value: product.volume
    } : null
  ].filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaTypes,
    name,
    alternateName: scientificName !== name ? scientificName : undefined,
    description,
    image: heroImage,
    brand: {
      '@type': 'Brand',
      name: brandName
    },
    category: categoryName,
    activeIngredient: !isCosmetic ? name : undefined,
    code: (!isCosmetic && casNumber) ? {
      '@type': 'MedicalCode',
      code: casNumber,
      codingSystem: 'CAS-RN'
    } : undefined,
    additionalProperty: additionalProps.length > 0 ? additionalProps : undefined,
    ...(product?.price && product?.price !== '0.00' ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: product.price,
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Atlas Services'
        }
      }
    } : {})
  };

  return schema;
}

export function generateBreadcrumbJsonLd(items = [], baseUrl = 'https://regenpept.com') {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
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
      name: 'Atlas Services Clinical Research'
    }
  };
}

