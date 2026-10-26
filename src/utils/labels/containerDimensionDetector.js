/**
 * containerDimensionDetector.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Intelligent packaging & container size detection for pharmaceutical labels.
 * Automatically chooses the optimal label dimensions (width × height mm)
 * based on container volume (100mL vs 30mL vs jar), pharmaceutical form,
 * and capsule count, adhering to EU GMP & USP standards.
 */

export const CONTAINER_SIZE_PRESETS = [
  {
    id: '100x50',
    widthMm: 100,
    heightMm: 50,
    labelEn: '100 × 50 mm (100mL Solution Bottle / 180 Caps Jar)',
    labelEs: '100 × 50 mm (Frasco 100mL / Bote 180 Cáps)',
    tag: '100mL / 180 Caps'
  },
  {
    id: '75x45',
    widthMm: 75,
    heightMm: 45,
    labelEn: '75 × 45 mm (Standard Delivery / 30mL Dropper / 60 Caps)',
    labelEs: '75 × 45 mm (Estándar Clínico / Frasco 30mL / 60 Cáps)',
    tag: '30mL / 60 Caps'
  },
  {
    id: '100x55',
    widthMm: 100,
    heightMm: 55,
    labelEn: '100 × 55 mm (Large Bulk Jar / Hospital Monograph)',
    labelEs: '100 × 55 mm (Frasco Grande / Hospital)',
    tag: 'Large Jar'
  },
  {
    id: '70x35',
    widthMm: 70,
    heightMm: 35,
    labelEn: '70 × 35 mm (Pomade / Cream Jar 30-50g)',
    labelEs: '70 × 35 mm (Pomada / Crema 30-50g)',
    tag: 'Pomade Jar'
  },
  {
    id: '90x38',
    widthMm: 90,
    heightMm: 38,
    labelEn: '90 × 38 mm (Vial / Injectable Ampoule)',
    labelEs: '90 × 38 mm (Vial / Ampolla)',
    tag: 'Vial'
  }
];

/**
 * Inspects a prescription or label object and detects its physical container size.
 *
 * @param {Object} item - Label data or prescription object
 * @returns {{ widthMm: number, heightMm: number, id: string, reason: string, containerTag: string }}
 */
export function detectOptimalLabelDimensions(item) {
  if (!item) {
    return {
      widthMm: 75,
      heightMm: 45,
      id: '75x45',
      reason: 'Standard 75×45mm Delivery',
      containerTag: 'Standard Delivery'
    };
  }

  // Aggregate all relevant clinical fields into a searchable string
  const corpus = [
    item.vehicleName,
    item.volume,
    item.quantity,
    item.packageSize,
    item.form,
    item.formula,
    item.instructions,
    item.directions,
    item.treatmentTitle,
    item.title,
    Array.isArray(item.activeIngredientsList) ? item.activeIngredientsList.join(' ') : '',
    Array.isArray(item.apis) ? item.apis.map(a => `${a.name || ''} ${a.dosage || ''}`).join(' ') : ''
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // 1. Capsules & Oral Jars (Prioritize explicit capsule detection)
  const capMatch = corpus.match(/(\d+)\s*(?:caps|c[aá]psulas?)/i);
  if (capMatch) {
    const count = parseInt(capMatch[1], 10);
    const isLarge = count >= 120;
    return {
      widthMm: isLarge ? 100 : 75,
      heightMm: isLarge ? 50 : 45,
      id: isLarge ? '100x50' : '75x45',
      reason: `Bote ${count} Cápsulas (${isLarge ? '100×50mm' : '75×45mm'})`,
      containerTag: `${count} Caps Jar`
    };
  }

  // 2. Large Solution / Shampoo Bottles: 250 mL, 200 mL, 150 mL, 120 mL, 100 mL
  if (corpus.includes('250 ml') || corpus.includes('250ml') || corpus.includes('trichowash')) {
    return {
      widthMm: 100,
      heightMm: 50,
      id: '100x50',
      reason: 'Frasco Solución / Champú 250mL (100×50mm)',
      containerTag: '250mL Bottle'
    };
  }

  if (corpus.includes('200 ml') || corpus.includes('200ml')) {
    return {
      widthMm: 100,
      heightMm: 50,
      id: '100x50',
      reason: 'Frasco Solución 200mL (100×50mm)',
      containerTag: '200mL Bottle'
    };
  }

  if (corpus.includes('150 ml') || corpus.includes('150ml') || corpus.includes('120 ml') || corpus.includes('120ml')) {
    return {
      widthMm: 100,
      heightMm: 50,
      id: '100x50',
      reason: 'Frasco Solución (100×50mm)',
      containerTag: '120mL-150mL Bottle'
    };
  }

  if (corpus.includes('100 ml') || corpus.includes('100ml') || corpus.includes('trichosol')) {
    return {
      widthMm: 100,
      heightMm: 50,
      id: '100x50',
      reason: 'Frasco Solución 100mL (100×50mm)',
      containerTag: '100mL Bottle'
    };
  }

  // 3. Medium Dispenser / BHRT Cream Jars (e.g. 90 mL transdermal dispenser)
  if (corpus.includes('90 ml') || corpus.includes('90ml') || corpus.includes('pentravan')) {
    return {
      widthMm: 75,
      heightMm: 45,
      id: '75x45',
      reason: 'Dispensador / Bote Crema 90mL (75×45mm)',
      containerTag: '90mL Dispenser'
    };
  }

  // 4. Small Vials, Eye Droppers & 30 mL bottles (e.g. TrichoOil 30 mL)
  if (
    corpus.includes('30 ml') ||
    corpus.includes('30ml') ||
    corpus.includes('trichooil') ||
    corpus.includes('15 ml') ||
    corpus.includes('10 ml') ||
    corpus.includes('5 ml')
  ) {
    return {
      widthMm: 75,
      heightMm: 45,
      id: '75x45',
      reason: 'Gotero / Frasco 30mL (75×45mm)',
      containerTag: '30mL Dropper'
    };
  }

  // 4. Pomades, Ointments & Topical Cream Jars (30g, 50g, 100g)
  if (
    corpus.includes('pomad') ||
    corpus.includes('ointment') ||
    corpus.includes('ungüento') ||
    corpus.includes('crema') ||
    corpus.includes('cream') ||
    corpus.includes('pasta')
  ) {
    return {
      widthMm: 70,
      heightMm: 35,
      id: '70x35',
      reason: 'Tarro Pomada / Crema (70×35mm)',
      containerTag: 'Pomade Jar'
    };
  }

  // 5. Slim Injectable Vials / Ampoules
  if (
    corpus.includes('vial') ||
    corpus.includes('ampoll') ||
    corpus.includes('ampoule') ||
    corpus.includes('cartucho')
  ) {
    return {
      widthMm: 90,
      heightMm: 38,
      id: '90x38',
      reason: 'Vial Inyectable / Ampolla (90×38mm)',
      containerTag: 'Vial'
    };
  }

  // Default Standard Pharmacy Delivery
  return {
    widthMm: 75,
    heightMm: 45,
    id: '75x45',
    reason: 'Estándar Clínico (75×45mm)',
    containerTag: 'Standard Delivery'
  };
}
