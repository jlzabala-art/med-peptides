/**
 * productTypeResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure, centralized domain resolver for `/p/[slug]` pages & metadata.
 * Eliminates duplicated product classification logic between `generateMetadata`
 * and `PublicProductRoute`.
 */

import { isPharmapolisPelletSlug } from '../../data/pharmapolisPelletsRegistry.js';
import { isKnownInjectableSlug } from '../../data/aestheticInjectablesEnrichment.js';

export function resolveProductDomain(product = {}, slug = '') {
  const slugLower = String(slug || '').toLowerCase().trim();
  const catLower = String(product.category || product.categoryId || '').toLowerCase();
  const typeLower = String(product.type || product.productType || product.primaryType || '').toLowerCase();
  const brandLower = String(product.brand || '').toLowerCase();
  const suppLower = String(product.supplierId || '').toLowerCase();
  const canonLower = String(product.canonicalKey || '').toLowerCase();
  const nameLower = String(product.name || '').toLowerCase();

  const isLabEquipment =
    typeLower === 'lab_equipment' ||
    catLower === 'equipment' ||
    catLower === 'lab_equipment' ||
    slugLower.startsWith('telstar-') ||
    suppLower.includes('telstar') ||
    brandLower.includes('telstar');

  const isPellet =
    !isLabEquipment &&
    (isPharmapolisPelletSlug(slugLower) ||
      catLower.includes('pellet') ||
      product.is_pellet === true ||
      product.isPellet === true ||
      String(product.subcategory || '').toLowerCase().includes('pellet'));

  const isNorma =
    !isLabEquipment &&
    !isPellet &&
    (brandLower.includes('norma') ||
      suppLower.includes('norma') ||
      canonLower.includes('norma') ||
      slugLower.includes('norma') ||
      slugLower === 'testosterone-enanthate-norma-250mg' ||
      slugLower === 'testosterone-enanthate');

  const isTeletest =
    !isLabEquipment &&
    (slugLower.startsWith('teletest-') ||
      suppLower.includes('teletest') ||
      canonLower.includes('teletest') ||
      nameLower.includes('teletest') ||
      brandLower.includes('teletest'));

  const isEterna =
    !isLabEquipment &&
    (slugLower.includes('eterna') ||
      suppLower.includes('eterna') ||
      canonLower.includes('eterna') ||
      nameLower.includes('eterna'));

  const isAesthetic =
    !isLabEquipment &&
    !isPellet &&
    !isNorma &&
    (catLower === 'aesthetic' ||
      catLower === 'aesthetic injectables' ||
      catLower === 'aesthetic injectable' ||
      catLower === 'aesthetic_injectable' ||
      catLower === 'dermal_filler' ||
      catLower === 'skin_booster' ||
      catLower === 'biostimulator' ||
      catLower === 'hybrid_biostimulator' ||
      catLower === 'polynucleotide' ||
      catLower === 'body_contouring' ||
      catLower === 'injectable' ||
      String(product.category_taxonomy || '').toLowerCase() === 'aesthetic injectables' ||
      typeLower === 'aesthetic_injectable' ||
      product.is_aesthetic === true ||
      product.is_aesthetic_injectable === true ||
      isKnownInjectableSlug(slugLower));

  const isCosmetics =
    !isLabEquipment &&
    !isAesthetic &&
    (catLower === 'cosmetic' ||
      catLower === 'cosmetics' ||
      catLower === 'topical' ||
      catLower === 'hair cosmetics' ||
      catLower === 'cosmeceutical' ||
      catLower === 'trichology_hair_care' ||
      catLower === 'nutricosmetics' ||
      product.is_cosmetic === true ||
      slugLower.startsWith('colway-') ||
      slugLower.startsWith('mcg-'));

  const isRawApi =
    !isLabEquipment &&
    (typeLower === 'raw_api' ||
      typeLower === 'raw_material' ||
      catLower === 'raw_material' ||
      catLower === 'compounding_material' ||
      product.is_raw_api === true);

  let domain = 'peptide';
  let typeSuffix = 'Clinical Monograph';
  let sectionLabel = 'Catalog';
  let sectionUrl = '/catalog';

  if (isLabEquipment) {
    domain = 'lab_equipment';
    typeSuffix = 'Telstar Laboratory & GMP Freeze Dryers (2027)';
    sectionLabel = 'Telstar Lyophilizers';
    sectionUrl = '/collection/telstar-lyophilizers';
  } else if (isPellet) {
    domain = 'pellet';
    typeSuffix = 'EU GMP Subcutaneous Pellets';
    sectionLabel = 'Hormone Pellets';
    sectionUrl = '/pricing/pellets';
  } else if (isNorma) {
    domain = 'norma';
    typeSuffix = 'EU GMP Human Pharmaceuticals & TRT';
    sectionLabel = 'Human Pharmaceuticals & TRT';
    sectionUrl = '/catalog';
  } else if (isTeletest) {
    domain = 'teletest';
    typeSuffix = 'Clinical Genomics & Diagnostics';
    sectionLabel = 'TeleTest Analytika®';
    sectionUrl = '/collection/teletest';
  } else if (isEterna) {
    domain = 'eterna';
    typeSuffix = 'Precision Genomics & Epigenetics';
    sectionLabel = 'Genomics & Longevity';
    sectionUrl = '/c/CAT-MU9L9GBN';
  } else if (isCosmetics) {
    domain = 'cosmetics';
    typeSuffix = 'Premium Cosmetic Care';
    sectionLabel = brandLower.includes('mcg') ? 'MCG Trichology' : 'Cosmetics';
    sectionUrl = brandLower.includes('mcg') ? '/collection/mcg' : '/collection/colway';
  } else if (isAesthetic) {
    domain = 'aesthetic';
    typeSuffix = 'Clinical Aesthetics Monograph';
    sectionLabel = 'Aesthetics';
    sectionUrl = '/catalog';
  } else if (isRawApi) {
    domain = 'raw_api';
    typeSuffix = 'Compounding API';
    sectionLabel = 'Compounding APIs';
    sectionUrl = '/catalog';
  }

  return {
    domain,
    typeSuffix,
    sectionLabel,
    sectionUrl,
    isLabEquipment,
    isPellet,
    isNorma,
    isTeletest,
    isEterna,
    isAesthetic,
    isCosmetics,
    isRawApi,
  };
}
