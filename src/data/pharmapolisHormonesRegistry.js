/**
 * pharmapolisHormonesRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Official Pharmapolis (Bulgaria EU GMP) Bioidentical Hormones & Pellets
 * Price Schedule (43 Master Preparations across 4 Categories: A. Topical,
 * B. Oral Capsules, C. Pellets, D. Vaginal, covering 235+ individual strengths).
 *
 * Generalized Data Model:
 *   - 1 Master Product per preparation row (No 1..28, 36..50).
 *   - `strengthTiers`: { lowest, middle, highest } reference EUR prices (incl. VAT).
 *   - `allStrengths`: complete array of available strengths.
 *   - `variants[]`: one variant per strength in `allStrengths` with exact or
 *     linearly interpolated EUR cost (`costPriceEur` / `price_eur`) and AED tiers.
 */

const EUR_TO_AED = 3.98;

export const PHARMAPOLIS_HORMONES_RAW = [
  [1, 'A. Topical / transdermal', 'Biest 80:20 (E3:E2) cream', '30 g', '0.625 mg/g', 39, '2 mg/g', 40.7, '5 mg/g', 43.2, '0.625 mg/g, 1 mg/g, 1.25 mg/g, 2 mg/g, 2.5 mg/g, 4 mg/g, 5 mg/g'],
  [2, 'A. Topical / transdermal', 'Biest 50:50 cream', '30 g', '0.5 mg/g', 39, '2 mg/g', 40.3, '12.5 mg/g', 47.3, '0.5 mg/g, 0.75 mg/g, 0.8 mg/g, 1 mg/g, 1.2 mg/g, 1.6 mg/g, 2 mg/g, 2.4 mg/g, 2.5 mg/g, 4 mg/g, 5 mg/g, 10 mg/g, 12.5 mg/g'],
  [3, 'A. Topical / transdermal', 'Triest 80:10:10 (E3:E2:E1) cream/gel', '30 g', '2.5 mg/g', 39, '12.5 mg/g', 50.1, '25 mg/g', 62.3, '2.5 mg/g, 12.5 mg/g, 25 mg/g'],
  [4, 'A. Topical / transdermal', 'Estradiol cream/gel', '30 g', '0.1 mg/g', 26, '1 mg/g', 26.2, '3.6 mg/g', 26.2, '0.1 mg/g, 0.2 mg/g, 0.5 mg/g, 0.625 mg/g, 0.75 mg/g, 1 mg/g, 1.25 mg/g, 1.75 mg/g, 2 mg/g, 2.5 mg/g, 3.6 mg/g'],
  [5, 'A. Topical / transdermal', 'Estriol cream', '30 g', '0.5 mg/g', 36.4, '2 mg/g', 37.6, '6 mg/g', 43.2, '0.5 mg/g, 1 mg/g, 1.5 mg/g, 2 mg/g, 2.5 mg/g, 3 mg/g, 6 mg/g'],
  [6, 'A. Topical / transdermal', 'Progesterone cream', '30 g', '10 mg/g', 31.2, '50 mg/g', 31.9, '250 mg/g', 35, '10 mg/g, 20 mg/g, 25 mg/g, 30 mg/g, 40 mg/g, 50 mg/g, 80 mg/g, 100 mg/g, 120 mg/g, 150 mg/g, 200 mg/g, 250 mg/g'],
  [7, 'A. Topical / transdermal', 'Testosterone cream, women', '30 g', '0.5 mg/g', 36.4, '3 mg/g', 36.4, '10 mg/g', 36.4, '0.5 mg/g, 1 mg/g, 2 mg/g, 2.5 mg/g, 3 mg/g, 4 mg/g, 5 mg/g, 8 mg/g, 10 mg/g'],
  [8, 'A. Topical / transdermal', 'Testosterone cream/gel, men', '30 g', '12 mg/g', 34.6, '40 mg/g', 36.8, '200 mg/g', 49, '12 mg/g, 20 mg/g, 25 mg/g, 30 mg/g, 40 mg/g, 50 mg/g, 75 mg/g, 100 mg/g, 200 mg/g'],
  [9, 'A. Topical / transdermal', 'DHEA cream/gel', '30 g', '10 mg/g', 36.4, '20 mg/g', 36.8, '50 mg/g', 37.7, '10 mg/g, 20 mg/g, 25 mg/g, 50 mg/g'],
  [10, 'A. Topical / transdermal', 'Biest + progesterone cream (E2/E3/P)', '30 g', '0.08/0.32/10 mg/g', 41.6, '0.2/0.8/20 mg/g', 42.6, '1/1/200 mg/g', 46.3, '0.08/0.32/10 mg/g, 0.08/0.32/30 mg/g, 0.2/0.8/20 mg/g, 0.25/0.25/25 mg/g, 0.5/0.5/30 mg/g, 0.5/0.5/40 mg/g, 1/1/50 mg/g, 1/1/100 mg/g, 1/1/200 mg/g, 2.5/2.5/50 mg/g'],
  [11, 'A. Topical / transdermal', 'Biest + testosterone cream (E2/E3/T)', '30 g', '0.25/0.25/2 mg/g', 41.6, '1/1/1 mg/g', 43.9, '2/8/1 mg/g', 52.3, '0.25/0.25/2 mg/g, 0.5/0.5/0.5 mg/g, 0.5/0.5/1 mg/g, 0.5/0.5/1.5 mg/g, 1/1/1 mg/g, 1/1/2 mg/g, 1/1/4 mg/g, 0.3/1.2/1 mg/g, 2/8/1 mg/g'],
  [12, 'A. Topical / transdermal', 'Biest + progesterone + testosterone cream (E2/E3/P/T)', '30 g', '0.08/0.32/20/1 mg/g', 41.6, '0.5/0.5/100/1 mg/g', 43.3, '2/2/200/2 mg/g', 44.7, '0.08/0.32/20/1 mg/g, 0.2/0.8/50/1 mg/g, 0.5/0.5/20/1 mg/g, 0.5/0.5/100/1 mg/g, 0.5/0.5/100/2 mg/g, 1/1/50/1 mg/g, 1/1/100/2 mg/g, 1/1/150/2 mg/g, 2/2/120/4 mg/g, 2/2/200/2 mg/g'],
  [13, 'A. Topical / transdermal', 'Biest + progesterone + testosterone + DHEA cream (E2/E3/P/T/DHEA)', '30 g', '0.06/0.14/40/1/4 mg/g', 41.6, '0.15/0.15/20/4/10 mg/g', 41.6, '0.35/0.35/85/0.35/5 mg/g', 42.7, '0.06/0.14/40/1/4 mg/g, 0.15/0.15/20/4/10 mg/g, 0.25/0.75/20/0.5/5 mg/g, 0.35/0.35/85/0.35/5 mg/g'],
  [14, 'A. Topical / transdermal', 'Estradiol + progesterone cream (E2/P)', '30 g', '0.4/40 mg/g', 41.6, '0.65/125 mg/g', 43.4, '4.2/200 mg/g', 44.8, '0.4/40 mg/g, 0.65/125 mg/g, 1.2/150 mg/g, 4.2/200 mg/g'],
  [15, 'A. Topical / transdermal', 'Estradiol + testosterone cream (E2/T)', '30 g', '0.3/1 mg/g', 41.6, '0.5/0.75 mg/g', 41.7, '0.4/2 mg/g', 41.7, '0.3/1 mg/g, 0.4/2 mg/g, 0.5/0.75 mg/g'],
  [16, 'A. Topical / transdermal', 'Estradiol + progesterone + testosterone cream (E2/P/T)', '30 g', '0.4/85/2.2 mg/g', 41.6, '0.65/125/1.5 mg/g', 43.4, '2/125/0.5 mg/g', 43.4, '0.4/85/2.2 mg/g, 0.55/95/1.5 mg/g, 0.65/125/1.5 mg/g, 0.7/135/1.5 mg/g, 2/125/0.5 mg/g'],
  [17, 'A. Topical / transdermal', 'Progesterone + testosterone cream (P/T)', '30 g', '30/0.25 mg/g', 41.6, '50/4 mg/g', 41.6, '200/4 mg/g', 44.2, '30/0.25 mg/g, 30/2 mg/g, 50/2 mg/g, 100/2 mg/g, 200/2 mg/g, 50/4 mg/g, 70/4 mg/g, 200/4 mg/g'],
  [18, 'A. Topical / transdermal', 'Testosterone + DHEA cream/gel (T/DHEA)', '30 g', '4/15 mg/g', 41.6, null, null, '20/200 mg/g', 49.4, '4/15 mg/g, 20/200 mg/g'],
  [19, 'B. Oral (capsules)', 'Progesterone capsules, immediate release', '30 capsules', '25 mg', 13, '125 mg', 13.8, '300 mg', 15.3, '25 mg, 50 mg, 75 mg, 100 mg, 125 mg, 150 mg, 175 mg, 200 mg, 250 mg, 300 mg'],
  [20, 'B. Oral (capsules)', 'Progesterone capsules, sustained release', '30 capsules', '50 mg', 36.4, '100 mg', 37.5, '200 mg', 39.7, '50 mg, 100 mg, 200 mg'],
  [21, 'B. Oral (capsules)', 'Estradiol capsules', '30 capsules', '0.3 mg', 26, '0.5 mg', 26.1, '2 mg', 26.1, '0.3 mg, 0.5 mg, 1 mg, 2 mg'],
  [22, 'B. Oral (capsules)', 'Estriol capsules', '30 capsules', '0.5 mg', 34.6, '1 mg', 35.5, '2 mg', 36.1, '0.5 mg, 1 mg, 2 mg'],
  [23, 'B. Oral (capsules)', 'Biest capsules', '30 capsules', '0.5 mg (50:50)', 34.6, '1.25 mg (50:50)', 35.4, '5 mg (80:20)', 39.7, '0.45 mg (80:20), 1.25 mg (80:20), 2.5 mg (80:20), 3.75 mg (80:20), 5 mg (80:20), 0.5 mg (50:50), 0.6 mg (50:50), 1 mg (50:50), 1.25 mg (50:50), 3 mg (50:50)'],
  [24, 'B. Oral (capsules)', 'Triest capsules 80:10:10', '30 capsules', '2.5 mg', 34.6, null, null, null, null, '2.5 mg'],
  [25, 'B. Oral (capsules)', 'Biest + progesterone capsules (E2/E3/P)', '30 capsules', '0.1/0.4/70 mg', 51.9, '0.06/0.24/100 mg', 52.4, '1.15/1.15/175 mg', 56.7, '0.06/0.24/100 mg, 0.08/0.32/100 mg, 0.1/0.4/70 mg, 0.16/0.64/50 mg, 0.25/1/50 mg, 0.1/0.1/100 mg, 0.5/0.5/125 mg, 1.15/1.15/175 mg'],
  [26, 'B. Oral (capsules)', 'DHEA capsules', '30 capsules', '5 mg', 32.5, '10 mg', 32.7, '50 mg', 34.1, '5 mg, 10 mg, 25 mg, 50 mg'],
  [27, 'B. Oral (capsules)', 'Pregnenolone capsules', '30 capsules', '10 mg', 34.6, '25 mg', 34.7, '100 mg', 35.7, '10 mg, 25 mg, 50 mg, 100 mg'],
  [28, 'B. Oral (capsules)', 'DHEA + pregnenolone capsules (DHEA/Preg)', '30 capsules', '15/75 mg', 34.6, null, null, null, null, '15/75 mg'],
  [36, 'C. Pellets', 'Testosterone pellets', '1 pellet', '12.5 mg', 50, '62.5 mg', 50.7, '200 mg', 56.8, '12.5 mg, 18 mg, 25 mg, 37.5 mg, 50 mg, 62.5 mg, 75 mg, 87.5 mg, 100 mg, 137.5 mg, 200 mg'],
  [37, 'C. Pellets', 'Estradiol pellets', '1 pellet', '6 mg', 50, '20 mg', 52.2, '75 mg', 58.9, '6 mg, 10 mg, 12.5 mg, 15 mg, 18 mg, 20 mg, 22 mg, 25 mg, 30 mg, 37.5 mg, 50 mg, 75 mg'],
  [38, 'C. Pellets', 'Progesterone pellets', '1 pellet', '25 mg', 50, '75 mg', 50, '200 mg', 50.6, '25 mg, 37.5 mg, 50 mg, 75 mg, 100 mg, 125 mg, 150 mg, 200 mg'],
  [39, 'C. Pellets', 'Testosterone + anastrozole pellets (T/anastrozole)', '1 pellet', '100/4 mg', 50, '200/4 mg', 50.7, '200/20 mg', 56.8, '100/4 mg, 137.5/4 mg, 200/4 mg, 200/8 mg, 200/20 mg'],
  [40, 'C. Pellets', 'Biest 50:50 pellets', '1 pellet', '10 mg', 50, '15 mg', 52, '20 mg', 54.1, '10 mg, 15 mg, 20 mg'],
  [41, 'D. Vaginal', 'Estriol vaginal cream', '30 g', '0.5 mg/g', 36.4, '1 mg/g', 37.2, '2 mg/g', 37.6, '0.5 mg/g, 1 mg/g, 2 mg/g'],
  [42, 'D. Vaginal', 'Estradiol vaginal cream', '30 g', '0.1 mg/g', 30.3, null, null, '0.2 mg/g', 30.3, '0.1 mg/g, 0.2 mg/g'],
  [43, 'D. Vaginal', 'Testosterone vaginal cream', '30 g', '0.3 mg/g', 36.4, null, null, null, null, '0.3 mg/g'],
  [44, 'D. Vaginal', 'Estriol + testosterone vaginal cream (E3/T)', '30 g', '1/0.25 mg/g', 41.6, '1/1 mg/g', 41.7, '4/4 mg/g', 44.3, '1/0.25 mg/g, 1/1 mg/g, 2/0.5 mg/g, 4/4 mg/g'],
  [45, 'D. Vaginal', 'Estradiol + testosterone vaginal cream (E2/T)', '30 g', '0.3/0.1 mg/g', 41.6, '0.1/1 mg/g', 41.6, '1/0.5 mg/g', 41.9, '0.1/1 mg/g, 0.3/0.1 mg/g, 0.3/1 mg/g, 1/0.5 mg/g'],
  [46, 'D. Vaginal', 'DHEA vaginal cream', '30 g', '5 mg/g', 36.4, null, null, null, null, '5 mg/g'],
  [47, 'D. Vaginal', 'DHEA vaginal suppository', '30 suppositories', '13 mg', 36.4, null, null, null, null, '13 mg'],
  [48, 'D. Vaginal', 'DHEA + estradiol vaginal cream (DHEA/E2)', '30 g', '5/0.1 mg/g', 41.6, null, null, null, null, '5/0.1 mg/g'],
  [49, 'D. Vaginal', 'Estriol vaginal suppository', '30 suppositories', '0.5 mg', 36.4, null, null, '1 mg', 37.2, '0.5 mg, 1 mg'],
  [50, 'D. Vaginal', 'Progesterone vaginal suppository', '30 suppositories', '45 mg', 36.4, '50 mg', 36.6, '200 mg', 39.5, '45 mg, 50 mg, 100 mg, 200 mg'],
];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function interpolateStrengthPrice(idx, total, lowP, midIdx, midP, highP) {
  const startP = Number(lowP || 0);
  const endP = Number(highP ?? midP ?? lowP ?? 0);
  if (total <= 1) return startP;
  if (idx === 0) return startP;
  if (idx === total - 1) return endP;

  if (midP != null && midIdx > 0 && midIdx < total - 1) {
    if (idx === midIdx) return Number(midP);
    if (idx < midIdx) {
      const ratio = idx / midIdx;
      return Number((startP + ratio * (Number(midP) - startP)).toFixed(2));
    }
    const ratio = (idx - midIdx) / (total - 1 - midIdx);
    return Number((Number(midP) + ratio * (endP - Number(midP))).toFixed(2));
  }

  const ratio = idx / (total - 1);
  return Number((startP + ratio * (endP - startP)).toFixed(2));
}

export function getPharmapolisHormonesCatalog() {
  return PHARMAPOLIS_HORMONES_RAW.map((row) => {
    const [
      no,
      category,
      preparation,
      pack,
      lowestStrength,
      lowestPriceEur,
      middleStrength,
      middlePriceEur,
      highestStrength,
      highestPriceEur,
      allStrengthsRaw,
    ] = row;

    const allStrengths = String(allStrengthsRaw || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const numStr = String(no).padStart(2, '0');
    const slug = `pharmapolis-hormone-${numStr}-${slugify(preparation)}`.slice(0, 88);
    const masterSku = `SKU-PHARM-HORM-${numStr}`;

    const midIdx = middleStrength
      ? Math.max(
          1,
          allStrengths.findIndex((s) => s.toLowerCase() === String(middleStrength).toLowerCase())
        )
      : Math.floor(allStrengths.length / 2);

    const variants = allStrengths.map((str, idx) => {
      const pEur = interpolateStrengthPrice(
        idx,
        allStrengths.length,
        lowestPriceEur,
        midIdx,
        middlePriceEur,
        highestPriceEur
      );
      const tierRole =
        str === lowestStrength
          ? 'lowest'
          : str === middleStrength
            ? 'middle'
            : str === highestStrength
              ? 'highest'
              : 'interpolated';

      return {
        id: `${slug}-v${idx + 1}`,
        sku: `${masterSku}-S${idx + 1}`,
        strength: str,
        packSize: `${pack} · ${str}`,
        presentation: `${preparation} (${pack})`,
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy (Bulgaria)',
        costCurrency: 'EUR',
        costPriceEur: pEur,
        price_eur: pEur,
        tierRole,
      };
    });

    const baseEur = Number(lowestPriceEur || 0);
    const maxEur = Number(highestPriceEur ?? middlePriceEur ?? lowestPriceEur ?? 0);
    const landedCostAed = Number((baseEur * EUR_TO_AED).toFixed(4));

    const tierSummaryParts = [];
    if (lowestStrength && lowestPriceEur != null) {
      tierSummaryParts.push(`Min (${lowestStrength}): €${Number(lowestPriceEur).toFixed(2)}`);
    }
    if (middleStrength && middlePriceEur != null) {
      tierSummaryParts.push(`Mid (${middleStrength}): €${Number(middlePriceEur).toFixed(2)}`);
    }
    if (highestStrength && highestPriceEur != null) {
      tierSummaryParts.push(`Max (${highestStrength}): €${Number(highestPriceEur).toFixed(2)}`);
    }

    const strengthRangeLabel =
      allStrengths.length > 1
        ? `${allStrengths[0]} → ${allStrengths[allStrengths.length - 1]} (${allStrengths.length} strengths)`
        : allStrengths[0] || lowestStrength;

    return {
      id: slug,
      slug,
      itemNumber: no,
      sku: masterSku,
      name: preparation,
      canonicalName: preparation,
      subtitle: `${pack} · ${tierSummaryParts.join(' · ')}`,
      brand: 'pharmapolis',
      supplierId: 'supplier-pharmapolis',
      supplierIds: ['supplier-pharmapolis', 'supplier-nplabs'],
      supplierName: 'Pharmapolis Compounding Pharmacy (Bulgaria EU GMP)',
      country: 'BG',
      track: 'hormones',
      subTrack: category.startsWith('C.') ? 'pellets' : 'bhrt',
      category,
      dosageForm: category.replace(/^[A-D]\.\s*/, ''),
      packSize: pack,
      volume: `${pack} · ${strengthRangeLabel}`,
      presentation: `${pack} (${allStrengths.length} ${allStrengths.length === 1 ? 'strength' : 'strengths'})`,
      keyActives: `${preparation} — Available strengths: ${allStrengths.join(', ')}`,
      clinicalFocus: `EU GMP compounded ${preparation} (${pack}) manufactured by Pharmapolis (Bulgaria). ${tierSummaryParts.join(' | ')}. Price includes VAT.`,
      applicationTip: `Select any of the ${allStrengths.length} standardized strengths (${allStrengths.join(', ')}) when prescribing.`,
      costCurrency: 'EUR',
      costPriceEur: baseEur,
      minPriceEur: baseEur,
      maxPriceEur: maxEur,
      strengthTiers: {
        lowest: lowestStrength ? { strength: lowestStrength, priceEur: Number(lowestPriceEur) } : null,
        middle: middleStrength && middlePriceEur != null ? { strength: middleStrength, priceEur: Number(middlePriceEur) } : null,
        highest: highestStrength && highestPriceEur != null ? { strength: highestStrength, priceEur: Number(highestPriceEur) } : null,
      },
      allStrengths,
      landedCostAed,
      wholesalePriceAed: Number((landedCostAed * 1.15).toFixed(2)),
      clinicPriceAed: Number((landedCostAed * 1.3225).toFixed(2)),
      retailPriceAed: Number((landedCostAed * 1.55).toFixed(2)),
      variants,
      requiresPrescription: true,
      isProfessional: true,
      status: 'published',
      isActive: true,
      stockStatus: 'Compounded to Order (EU GMP Bulgaria)',
    };
  });
}
