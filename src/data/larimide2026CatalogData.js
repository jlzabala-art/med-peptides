/**
 * larimide2026CatalogData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Official 2026 B2B Price List (V.260430) for:
 *   Larimide, S.L.U. / Laboratorio Español de Investigación Cosmetológica, S.L.U.
 *   Brands: LARIMIDE · LARIMIDE PRO · LARIMEDICAL
 *   Terms: Prices per unit in EUR · Freight not included (EX-WORKS Alcoy, Spain)
 *
 * Preserves the 4 existing LARIMEDICAL Sterilia products in Firestore untouched.
 */

export const EXISTING_STERILIA_IDS = Object.freeze([
  'larimedical-adipocore-5',
  'larimedical-biogf-331',
  'larimedical-ha-15',
  'larimedical-vitamatrix-115',
]);

export const LARIMIDE_SUPPLIER_UPDATE = Object.freeze({
  id: 'supplier-larimedical',
  name: 'LARIMEDICAL (Larimide S.L.U.)',
  legalName: 'Larimide, S.L.U.',
  parentSupplierId: 'supplier-labesp',
  parentLegalName: 'Laboratorio Español de Investigación Cosmetológica, S.L.U.',
  foundedYear: 2012,
  founders: ['Mauricio Sanchis', 'Sonsoles Albert'],
  address: 'Pol. Ind. Cotes Baixes, Calle G, No. 7, 03804 Alcoy (Alicante), Spain',
  country: 'Spain',
  warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
  website: 'https://www.larimide.com',
  email: 'export@larimide.com',
  phone: '+34 687 168 464',
  currency: 'EUR',
  incoterms: 'EXW Alcoy (Spain)',
  priceListVersion: 'V.260430',
  certifications: [
    'ISO 22716 (SGS)',
    'AEMPS Authorized',
    'Dermatologically Tested',
    'Not Tested on Animals',
    'Vegan',
    '0% CO2 Emissions',
    'Made in Spain',
  ],
  brands: ['LARIMIDE', 'LARIMIDE PRO', 'LARIMEDICAL', 'LARIMEDICAL Sterilia'],
  awards: [
    '2014 CEEI Best Business Project',
    '2015 CEEI Best Trajectory',
    '2017 AEDEPI Best Corporate Image',
    '2020 Health Beauty & Wellness Best Specialist in R&D',
    '2021 Cámara Alicante Best Business Reinvention',
    '2021 Health Beauty & Wellness Best OEM Manufacturer',
    '2021-2022 Corporate Live Wire Best Natural Skincare Products',
    '2022 Cámara Alcoy Best Business Internationalisation',
    '2025 Global Excellence Awards Best Cosmetic Skincare Brand',
  ],
  description:
    'Spanish dermocosmetic R&D laboratory and GMP manufacturer (ISO 22716 SGS, AEMPS authorized) operating Larimide (home care), Larimide Pro (aesthetic cabin protocols), and Larimedical (biochemical medical-aesthetic peels, cellular cocktails & Sterilia vials).',
  status: 'active',
});

// Compact tuple builder to guarantee zero transcription ambiguity:
// [sku, brand, line, parentSlug, parentName, variantLabel, categoryId, retailEur, profEur, d1, d250, d500, d1000, d2500, extraNote]
const RAW_ROWS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // LARIMIDE (48 SKUs)
  // ═══════════════════════════════════════════════════════════════════════════
  // LIMPIADORES / CLEANSERS (5)
  ['LRM0018', 'LARIMIDE', 'Cleansers', 'clarify-micellar-water', 'CLARIFY Micellar Water', '250ml', 'cosmetics', 19.95, 9.98, 3.99, 3.59, 3.39, 3.19, 2.99],
  ['LRM0071', 'LARIMIDE', 'Cleansers', 'clarify-silk-cleansing-milk', 'CLARIFY SILK Cleansing Milk', '250ml', 'cosmetics', 24.00, 12.00, 4.80, 4.32, 4.08, 3.84, 3.60],
  ['LRM0031', 'LARIMIDE', 'Cleansers', 'cellrenew-exfoliating-toner', 'CELLRENEW Exfoliating Toner', '100ml', 'cosmetics', 23.95, 11.98, 4.79, 4.31, 4.07, 3.83, 3.59],
  ['LRM0069', 'LARIMIDE', 'Cleansers', 'enzypeel-enzymatic-peel', 'ENZYPEEL Enzymatic Peel', '50ml', 'cosmetics', 26.00, 13.00, 5.20, 4.68, 4.42, 4.16, 3.90],
  ['LRM0070', 'LARIMIDE', 'Cleansers', 'tonify-hydrating-toner', 'TONIFY Hydrating Toner', '100ml', 'cosmetics', 20.00, 10.00, 4.00, 3.60, 3.40, 3.20, 3.00],

  // OJOS Y LABIOS / EYES & LIPS (5)
  ['LRM0014', 'LARIMIDE', 'Eyes & Lips', 'immediate-lifting-results', 'IMMEDIATE LIFTING RESULTS', '15ml', 'cosmetics', 49.95, 24.98, 9.99, 8.99, 8.49, 7.99, 7.49],
  ['LRM0002', 'LARIMIDE', 'Eyes & Lips', 'immediate-lifting-results', 'IMMEDIATE LIFTING RESULTS', '3ml', 'cosmetics', 18.50, 9.25, 3.70, 3.33, 3.14, 2.96, 2.80],
  ['LRM0017', 'LARIMIDE', 'Eyes & Lips', 'dna-repair-eye-cream', 'DNA REPAIR EYE CREAM', '15ml', 'cosmetics', 39.95, 19.98, 7.99, 7.19, 6.79, 6.39, 5.99],
  ['LRM0067', 'LARIMIDE', 'Eyes & Lips', 'vitaminic-eye-contour', 'VITAMINIC EYE Eye Contour', '15ml', 'cosmetics', 39.95, 19.98, 7.99, 7.19, 6.79, 6.39, 5.99],
  ['LRM0026', 'LARIMIDE', 'Eyes & Lips', 'kiss-me-lip-volumizer', 'KISS ME Moisturizing Lip Volumizer', '8ml', 'cosmetics', 29.95, 14.98, 5.99, 5.39, 5.09, 4.79, 4.49],

  // FACIAL (10)
  ['LRM0025', 'LARIMIDE', 'Facial', 'vitaminic-light-day-cream', 'VITAMINIC Light Day Cream', '50ml', 'cosmetics', 64.95, 32.48, 12.99, 11.69, 11.04, 10.39, 9.74],
  ['LRM0037', 'LARIMIDE', 'Facial', 'vitaminic-pure-serum', 'VITAMINIC PURE Brightening Concentrated Serum', '4u x 8ml', 'cosmetics', 90.00, 63.00, 25.20, 22.68, 21.42, 20.16, 18.00],
  ['LRM0039', 'LARIMIDE', 'Facial', 'cannanour-night-treatment', 'CANNANOUR Anti-Aging Night Treatment', '50ml', 'cosmetics', 49.95, 24.98, 9.99, 8.99, 8.49, 7.99, 7.49],
  ['LRM0028', 'LARIMIDE', 'Facial', 'miracle-facial-oil-serum', 'MIRACLE Facial Oil Serum', '30ml', 'cosmetics', 39.95, 19.98, 7.99, 7.19, 6.79, 6.39, 5.99],
  ['LRM0027', 'LARIMIDE', 'Facial', 'oxystem-cellular-serum', 'OXYSTEM Cellular Serum', '30ml', 'cosmetics', 34.95, 17.48, 6.99, 6.29, 5.94, 5.59, 5.24],
  ['LRM0029', 'LARIMIDE', 'Facial', 'retibak-epigenetic-serum', 'RETIBAK Epigenetic Serum', '30ml', 'cosmetics', 59.95, 29.98, 11.99, 10.79, 10.19, 9.59, 8.99],
  ['LRM0030', 'LARIMIDE', 'Facial', 'mistify-balancing-mist', 'MISTIFY Refreshing Balancing Mist', '50ml', 'cosmetics', 34.95, 17.48, 6.99, 6.29, 5.94, 5.59, 5.24],
  ['LRM0024', 'LARIMIDE', 'Facial', 'fresh-mask-calming-mask', 'FRESH MASK Floral Calming Mask', '50ml', 'cosmetics', 22.00, 11.00, 4.40, 3.96, 3.74, 3.52, 3.30],
  ['LRM0032', 'LARIMIDE', 'Facial', 'ultra-satin-spf50', 'ULTRA SATIN SPF50 Solar Defense', '50ml', 'cosmetics', 39.95, 19.98, 7.99, 7.19, 6.79, 6.39, 5.99],
  ['LRM0068', 'LARIMIDE', 'Facial', 'pulsarytes-anti-aging-booster', 'PULSARYTES Anti-Aging Booster', '30ml', 'cosmetics', 65.00, 32.50, 19.50, 17.55, 16.58, 15.60, 14.63],

  // PROTECCIÓN SOLAR / SUNSCREEN (9)
  ['LRM0015', 'LARIMIDE', 'Sunscreen', 'eclipse-immediate-solar-bronzer', 'ECLIPSE Immediate Solar Bronzer', '200ml', 'cosmetics', 23.65, 11.83, 7.10, 6.39, 6.03, 5.68, 5.32],
  ['LRM0048', 'LARIMIDE', 'Sunscreen', 'eclipse-15-sunscreen', 'ECLIPSE 15 Sunscreen SPF15', '50ml', 'cosmetics', 14.95, 7.48, 4.49, 4.04, 3.81, 3.59, 3.36],
  ['LRM0049', 'LARIMIDE', 'Sunscreen', 'eclipse-25-sunscreen-physical', 'ECLIPSE 25 Sunscreen SPF25 (100% Physical Filters)', '50ml', 'cosmetics', 23.95, 11.98, 7.19, 6.47, 6.11, 5.75, 5.39],
  ['LRM0051', 'LARIMIDE', 'Sunscreen', 'eclipse-30-sunscreen', 'ECLIPSE 30 Sunscreen SPF30', '50ml', 'cosmetics', 23.95, 11.98, 7.19, 6.47, 6.11, 5.75, 5.39],
  ['LRM0050', 'LARIMIDE', 'Sunscreen', 'eclipse-30-oil-protection', 'ECLIPSE 30 Oil Protection Sunscreen SPF30', '250ml', 'cosmetics', 49.95, 24.98, 14.99, 13.49, 12.74, 11.99, 11.24],
  ['LRM0016', 'LARIMIDE', 'Sunscreen', 'eclipse-50-sunscreen', 'ECLIPSE 50 Sunscreen SPF50', '50ml', 'cosmetics', 29.95, 14.98, 8.99, 8.09, 7.64, 7.19, 6.74],
  ['LRM0052', 'LARIMIDE', 'Sunscreen', 'eclipse-50-body-milk', 'ECLIPSE 50 BODY MILK Sunscreen SPF50', '200ml', 'cosmetics', 59.95, 29.98, 17.99, 16.19, 15.29, 14.39, 13.49],
  ['LRM0053', 'LARIMIDE', 'Sunscreen', 'eclipse-50-plus-sunscreen', 'ECLIPSE 50 PLUS Sunscreen SPF50+', '50ml', 'cosmetics', 35.95, 17.98, 10.79, 9.71, 9.17, 8.63, 8.09],
  ['LRM0054', 'LARIMIDE', 'Sunscreen', 'eclipse-after-sun', 'ECLIPSE AFTER SUN Post Solar', '200ml', 'cosmetics', 29.95, 14.98, 8.99, 8.09, 7.64, 7.19, 6.74],

  // CORPORAL / BODY (11)
  ['LRM0072', 'LARIMIDE', 'Body', 'oilessence-body-oil', 'OILESSENCE Body Oil 360º', '250ml', 'cosmetics', 40.00, 20.00, 12.00, 10.80, 10.20, 9.60, 9.00],
  ['LRM0073', 'LARIMIDE', 'Body', 'oilbubble-shower-oil', 'OILBUBBLE Shower Oil', '250ml', 'cosmetics', 40.00, 20.00, 12.00, 10.80, 10.20, 9.60, 9.00],
  ['LRM0075', 'LARIMIDE', 'Body', 'sculpify-body-fit-cream', 'SCULPIFY Body Fit Cream', '200ml', 'cosmetics', 50.00, 25.00, 15.00, 13.50, 12.75, 12.00, 11.25],
  ['LRM0080', 'LARIMIDE', 'Body', 'scrubble-body-scrub', 'SCRUBBLE Body Scrub', '200ml', 'cosmetics', 24.00, 12.00, 7.20, 6.48, 6.12, 5.76, 5.40],
  ['LRM0077', 'LARIMIDE', 'Body', 'stretchperfect-stretch-mark-cream', 'STRETCHPERFECT Stretch Mark Cream', '200ml', 'cosmetics', 35.00, 17.50, 10.50, 9.45, 8.93, 8.40, 7.88],
  ['LRM0076', 'LARIMIDE', 'Body', 'cellufix-anti-cellulite-cream', 'CELLUFIX Anti-Cellulite Cream', '200ml', 'cosmetics', 40.00, 20.00, 12.00, 10.80, 10.20, 9.60, 9.00],
  ['LRM0078', 'LARIMIDE', 'Body', 'glowance-sparkling-body-cream', 'GLOWANCE Immediate Sparkling Body Cream', '200ml', 'cosmetics', 30.00, 15.00, 9.00, 8.10, 7.65, 7.20, 6.75],
  ['LRM0079', 'LARIMIDE', 'Body', 'maxinabliss-body-cream', 'MAXINABLISS Body Cream with Maxinadin', '200ml', 'cosmetics', 35.00, 17.50, 10.50, 9.45, 8.93, 8.40, 7.88],
  ['LRM0074', 'LARIMIDE', 'Body', 'bustlift-bust-firming', 'BUSTLIFT Bust Firming', '200ml', 'cosmetics', 40.00, 20.00, 12.00, 10.80, 10.20, 9.60, 9.00],
  ['LRM0081', 'LARIMIDE', 'Body', 'polaris-body-cooling-gel', 'POLARIS Body Cooling Gel', '200ml', 'cosmetics', 30.00, 15.00, 9.00, 8.10, 7.65, 7.20, 6.75],
  ['LRM0082', 'LARIMIDE', 'Body', 'thermalis-warming-massage-cream', 'THERMALIS Warming Body Massage Cream', '200ml', 'cosmetics', 35.00, 17.50, 10.50, 9.45, 8.93, 8.40, 7.88],

  // SALUD / HEALTH (4)
  ['LRM0033', 'LARIMIDE', 'Health', 'maxinadin-sensitive-skins', 'MAXINADIN Cream for Sensitive Skins', '50ml', 'cosmetics', 39.90, 19.95, 7.98, 7.18, 6.78, 6.38, 5.99],
  ['LRM0035', 'LARIMIDE', 'Health', 'goodwhite-safe-brightener', 'GOODWHITE Safe Brightener', '50ml', 'cosmetics', 39.90, 19.95, 7.98, 7.18, 6.78, 6.38, 5.99],
  ['LRM0034', 'LARIMIDE', 'Health', 'tinellin-oily-skin-control', 'TINELLIN Oily Skin Control Treatment', '50ml', 'cosmetics', 39.90, 19.95, 7.98, 7.18, 6.78, 6.38, 5.99],
  ['LRM0036', 'LARIMIDE', 'Health', 'alessine-long-lasting-deodorant', 'ALESSINE Long-Lasting Deodorant', '15ml', 'cosmetics', 19.90, 9.95, 3.98, 3.58, 3.38, 3.18, 2.99],

  // CAPILAR / HAIR (4) -> Canonical Trichology category
  ['LRM0055', 'LARIMIDE', 'Hair · Kojaxin', 'kojaxin-hair-loss-growth', 'KOJAXIN Hair Treatment Loss & Growth', '15u x 4ml', 'trichology_hair_care', 75.00, 52.50, 21.00, 18.90, 17.85, 16.80, 15.75, 'Hormone-free botanical follicular ampoules (turmeric, microalgae & medicinal mushrooms)'],
  ['LRM0066', 'LARIMIDE', 'Hair · Kojaxin', 'kojaxin-anti-hair-loss-mask', 'KOJAXIN Anti-Hair Loss Mask', '250ml', 'trichology_hair_care', 27.50, 13.75, 5.50, 4.95, 4.68, 4.40, 4.13],
  ['LRM0065', 'LARIMIDE', 'Hair · Kojaxin', 'kojaxin-anti-hair-loss-shampoo', 'KOJAXIN Anti-Hair Loss Shampoo', '250ml', 'trichology_hair_care', 35.00, 17.50, 7.00, 6.30, 5.95, 5.60, 5.25],
  ['LRM0084', 'LARIMIDE', 'Hair · Kojaxin', 'kojaxin-3x1-hair-mist', 'KOJAXIN 3X1 Hair Mist', '50ml', 'trichology_hair_care', 50.00, 25.00, 15.00, 13.50, 12.75, 12.00, 11.25],

  // ═══════════════════════════════════════════════════════════════════════════
  // LARIMIDE PRO (38 SKUs)
  // ═══════════════════════════════════════════════════════════════════════════
  // LIMPIADORES / CLEANSERS (5)
  ['LRPR0001', 'LARIMIDE PRO', 'Pro Cleansers', 'pro-clarify-micellar-water', 'CLARIFY Micellar Water (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 12.10, 6.06, 5.46, 5.15, 4.85, 4.55],
  ['LRPR0002', 'LARIMIDE PRO', 'Pro Cleansers', 'pro-clarify-silk-cleansing-milk', 'CLARIFY SILK Cleansing Milk (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 16.95, 10.17, 9.15, 8.64, 8.14, 7.63],
  ['LRPR0003', 'LARIMIDE PRO', 'Pro Cleansers', 'pro-cellrenew-exfoliating-toner', 'CELLRENEW Exfoliating Toner (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 29.95, 17.97, 16.17, 15.27, 14.38, 13.48],
  ['LRPR0039', 'LARIMIDE PRO', 'Pro Cleansers', 'pro-tonify-hydrating-toner', 'TONIFY Hydrating Toner (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 25.00, 10.00, 9.00, 8.50, 8.00, 7.50],
  ['LRPR0040', 'LARIMIDE PRO', 'Pro Cleansers', 'pro-enzypeel-enzymatic-peel', 'ENZYPEEL Enzymatic Peel (Pro)', '200ml', 'dermatology_cosmeceuticals', null, 30.00, 12.00, 10.80, 10.20, 9.60, 9.00],

  // CREMAS / CREAMS (4)
  ['LRPR0019', 'LARIMIDE PRO', 'Pro Creams', 'pro-vitaminic-light-day-cream', 'VITAMINIC Light Day Cream (Pro)', '200ml', 'dermatology_cosmeceuticals', null, 69.95, 41.97, 37.77, 35.67, 33.58, 31.48],
  ['LRPR0018', 'LARIMIDE PRO', 'Pro Creams', 'pro-cannanour-night-treatment', 'CANNANOUR Anti-aging Night Treatment (Pro)', '200ml', 'dermatology_cosmeceuticals', null, 54.95, 32.97, 29.67, 28.02, 26.38, 24.73],
  ['LRPR0013', 'LARIMIDE PRO', 'Pro Creams', 'pro-24-hour-massage-cream', '24 HOUR Massage Cream', '500ml', 'dermatology_cosmeceuticals', null, 24.95, 14.97, 13.47, 12.72, 11.98, 11.23],
  ['LRPR0041', 'LARIMIDE PRO', 'Pro Creams', 'pro-facial-conductive-gel', 'FACIAL CONDUCTIVE GEL', '500ml', 'dermatology_cosmeceuticals', null, 22.00, 13.20, 11.88, 11.22, 10.56, 9.90],

  // MASCARILLAS / MASKS (1)
  ['LRPR0012', 'LARIMIDE PRO', 'Pro Masks', 'pro-calmant-clay-mask', 'CALMANT MASK Clay Mask', '200ml', 'dermatology_cosmeceuticals', null, 34.95, 20.97, 18.87, 17.82, 16.78, 15.73],

  // AMPOLLAS / AMPOULES (17)
  ['LRPR0020', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-shock-28d', 'BIOPEEL SHOCK 28 Days (Intensive Treatment)', '28u x 2ml', 'dermatology_cosmeceuticals', 79.90, 39.95, 23.97, 21.57, 20.37, 19.18, 17.98],
  ['LRPR0004', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-perfect-ampoules', 'BIOPEEL PERFECT Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 24.00, 12.00, 7.20, 6.48, 6.12, 5.76, 5.40],
  ['LRPR0031', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-perfect-ampoules', 'BIOPEEL PERFECT Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 36.00, 21.60, 19.44, 18.36, 17.28, 16.20],
  ['LRPR0006', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-moist-ampoules', 'BIOPEEL MOIST Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 25.00, 12.50, 7.50, 6.75, 6.38, 6.00, 5.63],
  ['LRPR0032', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-moist-ampoules', 'BIOPEEL MOIST Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 37.50, 22.50, 20.25, 19.14, 18.00, 16.89],
  ['LRPR0008', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-age-ampoules', 'BIOPEEL AGE Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 26.00, 13.00, 7.80, 7.02, 6.63, 6.24, 5.85],
  ['LRPR0033', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-age-ampoules', 'BIOPEEL AGE Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 39.00, 23.40, 21.06, 19.89, 18.72, 17.55],
  ['LRPR0010', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-unify-ampoules', 'BIOPEEL UNIFY Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 28.00, 14.00, 8.40, 7.56, 7.14, 6.72, 6.30],
  ['LRPR0034', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-biopeel-unify-ampoules', 'BIOPEEL UNIFY Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 42.00, 25.20, 22.68, 21.42, 20.16, 18.90],
  ['LRPR0005', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-purify-ampoules', 'SHOCK PURIFY Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 26.00, 13.00, 7.80, 7.02, 6.63, 6.24, 5.85],
  ['LRPR0035', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-purify-ampoules', 'SHOCK PURIFY Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 39.00, 23.40, 21.06, 19.89, 18.72, 17.55],
  ['LRPR0007', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-active-ampoules', 'SHOCK ACTIVE Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 26.00, 13.00, 7.80, 7.02, 6.63, 6.24, 5.85],
  ['LRPR0036', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-active-ampoules', 'SHOCK ACTIVE Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 39.00, 23.40, 21.06, 19.89, 18.72, 17.55],
  ['LRPR0009', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-wrinkle-ampoules', 'SHOCK WRINKLE Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 28.00, 14.00, 8.40, 7.56, 7.14, 6.72, 6.30],
  ['LRPR0037', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-wrinkle-ampoules', 'SHOCK WRINKLE Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 42.00, 25.20, 22.68, 21.42, 20.16, 18.90],
  ['LRPR0011', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-illuminate-ampoules', 'SHOCK ILLUMINATE Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 26.00, 13.00, 7.80, 7.02, 6.63, 6.24, 5.85],
  ['LRPR0038', 'LARIMIDE PRO', 'Pro Ampoules', 'pro-shock-illuminate-ampoules', 'SHOCK ILLUMINATE Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 39.00, 23.40, 21.06, 19.89, 18.72, 17.55],

  // PEEL-OFF MASKS (4)
  ['LRPR0016', 'LARIMIDE PRO', 'Pro Peel-Off Masks', 'pro-alginasine-vivify', 'ALGINASINE VIVIFY Detox Peel-Off Mask', '250g', 'dermatology_cosmeceuticals', null, 12.95, 9.07, 8.16, 7.71, 7.25, 6.80],
  ['LRPR0015', 'LARIMIDE PRO', 'Pro Peel-Off Masks', 'pro-alginasine-b-like', 'ALGINASINE B-LIKE Anti-Wrinkle Peel-Off Mask', '250g', 'dermatology_cosmeceuticals', null, 13.95, 9.77, 8.79, 8.30, 7.81, 7.32],
  ['LRPR0017', 'LARIMIDE PRO', 'Pro Peel-Off Masks', 'pro-alginasine-goodwhite', 'ALGINASINE GOODWHITE Anti-Photoaging Peel-Off Mask', '250g', 'dermatology_cosmeceuticals', null, 14.50, 10.15, 9.14, 8.63, 8.12, 7.61],
  ['LRPR0014', 'LARIMIDE PRO', 'Pro Peel-Off Masks', 'pro-alginasine-calmant', 'ALGINASINE CALMANT Soothing Peel-Off Mask', '250g', 'dermatology_cosmeceuticals', null, 12.95, 9.07, 8.16, 7.71, 7.25, 6.80],

  // BODY (7)
  ['LRPR0046', 'LARIMIDE PRO', 'Pro Body', 'pro-oilessence-body-oil', 'OILESSENCE Body Oil (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 30.00, 18.00, 16.20, 15.30, 14.40, 13.50],
  ['LRPR0048', 'LARIMIDE PRO', 'Pro Body', 'pro-stretchperfect-cream', 'STRETCHPERFECT Stretch Mark Cream (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 33.00, 19.80, 17.82, 16.83, 15.84, 14.85],
  ['LRPR0044', 'LARIMIDE PRO', 'Pro Body', 'pro-cellufix-cream', 'CELLUFIX Anti-cellulite Cream (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 37.00, 22.20, 19.98, 18.87, 17.76, 16.65],
  ['LRPR0047', 'LARIMIDE PRO', 'Pro Body', 'pro-sculpify-cream', 'SCULPIFY Body Fit Cream (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 46.00, 27.60, 24.84, 23.46, 22.08, 20.70],
  ['LRPR0045', 'LARIMIDE PRO', 'Pro Body', 'pro-maxinabliss-cream', 'MAXINABLISS Body Cream with Maxinadin (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 33.00, 19.80, 17.82, 16.83, 15.84, 14.85],
  ['LRPR0043', 'LARIMIDE PRO', 'Pro Body', 'pro-bustlift-firming', 'BUSTLIFT Bust Firming (Pro)', '500ml', 'dermatology_cosmeceuticals', null, 37.00, 22.20, 19.98, 18.87, 17.76, 16.65],
  ['LRPR0042', 'LARIMIDE PRO', 'Pro Body', 'pro-body-conductive-gel', 'BODY CONDUCTIVE GEL', '500ml', 'dermatology_cosmeceuticals', null, 18.00, 10.80, 9.72, 9.18, 8.64, 8.10],

  // ═══════════════════════════════════════════════════════════════════════════
  // LARIMEDICAL (59 SKUs)
  // ═══════════════════════════════════════════════════════════════════════════
  // SETS (1)
  ['LMED072', 'LARIMEDICAL', 'Clinical Sets', 'larimedical-cocktail-set', 'COCKTAIL SET (Larimedical)', '6u x 10ml', 'dermatology_cosmeceuticals', null, 152.50, 61.00, 54.90, 51.85, 48.80, 45.75],

  // COMEDOPEEL — Acné Comedogénico Inflamatorio (10)
  ['LMED001', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel', 'COMEDOPEEL Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 35.00, 14.00, 12.60, 11.90, 11.20, 10.50],
  ['LMED034', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel', 'COMEDOPEEL Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 3.89, 1.56, 1.40, 1.32, 1.24, 1.17],
  ['LMED002', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-plus', 'COMEDOPEEL PLUS Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 50.00, 20.00, 18.00, 17.00, 16.00, 15.00],
  ['LMED035', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-plus', 'COMEDOPEEL PLUS Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 5.56, 2.22, 2.00, 1.89, 1.78, 1.67],
  ['LMED046', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-cocktail', 'COMEDOPEEL COCKTAIL', '5u x 10ml', 'dermatology_cosmeceuticals', null, 162.50, 65.00, 58.50, 55.25, 52.00, 48.75],
  ['LMED060', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-cocktail', 'COMEDOPEEL COCKTAIL', '1ml (monodose)', 'dermatology_cosmeceuticals', null, 5.42, 2.17, 1.95, 1.84, 1.73, 1.63],
  ['LMED014', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-serum', 'COMEDOPEEL SERUM', '15ml', 'dermatology_cosmeceuticals', 50.00, 25.00, 10.00, 9.50, 9.25, 9.00, 8.75],
  ['LMED059', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-purifying-gel', 'COMEDOPEEL PURIFYING GEL', '50ml', 'dermatology_cosmeceuticals', 20.00, 10.00, 4.00, 3.60, 3.40, 3.20, 3.00],
  ['LMED053', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-cleansing-gel', 'COMEDOPEEL CLEANSING GEL', '500ml', 'dermatology_cosmeceuticals', null, 27.90, 11.16, 10.04, 9.49, 8.93, 8.37],
  ['LMED058', 'LARIMEDICAL', 'Comedopeel (Acne)', 'larimedical-comedopeel-cleansing-gel', 'COMEDOPEEL CLEANSING GEL', '250ml', 'dermatology_cosmeceuticals', 39.86, 19.93, 7.97, 7.17, 6.78, 6.38, 5.98],

  // SCARPEEL — Psoriasis, dermatitis atópica, cicatrices del acné (8)
  ['LMED003', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel', 'SCARPEEL Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 40.00, 16.00, 14.40, 13.60, 12.80, 12.00],
  ['LMED036', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel', 'SCARPEEL Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 4.44, 1.78, 1.60, 1.51, 1.42, 1.33],
  ['LMED048', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel-cocktail-1', 'SCARPEEL COCKTAIL 1', '5u x 10ml', 'dermatology_cosmeceuticals', null, 162.50, 65.00, 58.50, 55.25, 52.00, 48.75],
  ['LMED062', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel-cocktail-1', 'SCARPEEL COCKTAIL 1', '1ml (monodose)', 'dermatology_cosmeceuticals', null, 5.42, 2.17, 1.95, 1.84, 1.73, 1.63],
  ['LMED049', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel-cocktail-2', 'SCARPEEL COCKTAIL 2', '5u x 10ml', 'dermatology_cosmeceuticals', null, 137.50, 55.00, 49.50, 46.75, 44.00, 41.25],
  ['LMED063', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel-cocktail-2', 'SCARPEEL COCKTAIL 2', '1ml (monodose)', 'dermatology_cosmeceuticals', null, 4.58, 1.83, 1.65, 1.56, 1.47, 1.38, 'PDF V.260430 printed 138 on FROM 2500u column; normalized to 1.38 EUR'],
  ['LMED054', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel-cream', 'SCARPEEL CREAM', '250ml', 'dermatology_cosmeceuticals', null, 87.50, 35.00, 31.50, 29.75, 28.00, 26.25],
  ['LMED010', 'LARIMEDICAL', 'Scarpeel (Scars & Psoriasis)', 'larimedical-scarpeel-cream', 'SCARPEEL CREAM', '50ml', 'dermatology_cosmeceuticals', 50.00, 25.00, 10.00, 9.50, 9.25, 9.00, 8.75],

  // HYDRAPEEL — Renovación y rehidratación de la epidermis (5)
  ['LMED004', 'LARIMEDICAL', 'Hydrapeel (Renewal & Hydration)', 'larimedical-hydrapeel', 'HYDRAPEEL Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 40.00, 16.00, 14.40, 13.60, 12.80, 12.00],
  ['LMED037', 'LARIMEDICAL', 'Hydrapeel (Renewal & Hydration)', 'larimedical-hydrapeel', 'HYDRAPEEL Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 4.44, 1.78, 1.60, 1.51, 1.42, 1.33],
  ['LMED047', 'LARIMEDICAL', 'Hydrapeel (Renewal & Hydration)', 'larimedical-hydrapeel-cocktail', 'HYDRAPEEL COCKTAIL', '5u x 10ml', 'dermatology_cosmeceuticals', null, 137.50, 55.00, 49.50, 46.75, 44.00, 41.25],
  ['LMED061', 'LARIMEDICAL', 'Hydrapeel (Renewal & Hydration)', 'larimedical-hydrapeel-cocktail', 'HYDRAPEEL COCKTAIL', '1ml (monodose)', 'dermatology_cosmeceuticals', null, 4.58, 1.83, 1.65, 1.56, 1.47, 1.38],
  ['LMED015', 'LARIMEDICAL', 'Hydrapeel (Renewal & Hydration)', 'larimedical-hydrapeel-serum', 'HYDRAPEEL SERUM', '15ml', 'dermatology_cosmeceuticals', 40.00, 20.00, 8.00, 7.60, 7.40, 7.20, 7.00],

  // AGEPEEL — Envejecimiento prematuro (8)
  ['LMED005', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel', 'AGEPEEL Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 32.00, 12.80, 11.52, 10.88, 10.24, 9.60],
  ['LMED038', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel', 'AGEPEEL Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 3.56, 1.42, 1.28, 1.21, 1.14, 1.07],
  ['LMED006', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel-plus', 'AGEPEEL PLUS Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 50.00, 20.00, 18.00, 17.00, 16.00, 15.00],
  ['LMED039', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel-plus', 'AGEPEEL PLUS Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 5.56, 2.22, 2.00, 1.89, 1.78, 1.67],
  ['LMED050', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel-cocktail', 'AGEPEEL COCKTAIL', '5u x 10ml', 'dermatology_cosmeceuticals', null, 162.50, 65.00, 58.50, 55.25, 52.00, 48.75],
  ['LMED064', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel-cocktail', 'AGEPEEL COCKTAIL', '1ml (monodose)', 'dermatology_cosmeceuticals', null, 5.42, 2.17, 1.95, 1.84, 1.73, 1.63],
  ['LMED055', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel-cream', 'AGEPEEL CREAM', '250ml', 'dermatology_cosmeceuticals', null, 112.50, 45.00, 40.50, 38.25, 36.00, 33.75],
  ['LMED011', 'LARIMEDICAL', 'Agepeel (Anti-Aging)', 'larimedical-agepeel-cream', 'AGEPEEL CREAM', '50ml', 'dermatology_cosmeceuticals', 64.00, 32.00, 12.80, 12.16, 11.84, 11.52, 11.20],

  // MELANZE — Hiperpigmentación (12)
  ['LMED007', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze', 'MELANZE Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 40.00, 16.00, 14.40, 13.60, 12.80, 12.00],
  ['LMED040', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze', 'MELANZE Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 4.44, 1.78, 1.60, 1.51, 1.42, 1.33],
  ['LMED008', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-plus', 'MELANZE PLUS Biochemical Peel', '60ml', 'dermatology_cosmeceuticals', null, 50.00, 20.00, 18.00, 17.00, 16.00, 15.00],
  ['LMED041', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-plus', 'MELANZE PLUS Biochemical Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 5.56, 2.22, 2.00, 1.89, 1.78, 1.67],
  ['LMED019', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-tranexamic', 'MELANZE TRANEXAMIC Peel', '60ml', 'dermatology_cosmeceuticals', null, 50.00, 20.00, 18.00, 17.00, 16.00, 15.00],
  ['LMED042', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-tranexamic', 'MELANZE TRANEXAMIC Peel', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 5.56, 2.22, 2.00, 1.89, 1.78, 1.67],
  ['LMED020', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-tranexamic-home', 'MELANZE TRANEXAMIC HOME', '30ml', 'dermatology_cosmeceuticals', 60.00, 30.00, 12.00, 11.40, 11.10, 10.80, 10.50],
  ['LMED043', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-tranexamic-home', 'MELANZE TRANEXAMIC HOME', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 13.33, 2.67, 2.53, 2.47, 2.40, 2.33],
  ['LMED051', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-cocktail', 'MELANZE COCKTAIL', '5u x 10ml', 'dermatology_cosmeceuticals', null, 137.50, 55.00, 49.50, 46.75, 44.00, 41.25],
  ['LMED065', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-cocktail', 'MELANZE COCKTAIL', '1ml (monodose)', 'dermatology_cosmeceuticals', null, 4.58, 1.83, 1.65, 1.56, 1.47, 1.38],
  ['LMED056', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-cream', 'MELANZE CREAM', '250ml', 'dermatology_cosmeceuticals', null, 112.50, 45.00, 40.50, 38.25, 36.00, 33.75],
  ['LMED012', 'LARIMEDICAL', 'Melanze (Hyperpigmentation)', 'larimedical-melanze-cream', 'MELANZE CREAM', '50ml', 'dermatology_cosmeceuticals', 64.00, 32.00, 12.80, 12.16, 11.84, 11.50, 11.20],

  // PUREGLYCOPEEL — Renovación celular (4)
  ['LMED009', 'LARIMEDICAL', 'Pureglycopeel (Cellular Renewal)', 'larimedical-pureglycopeel-10', 'PUREGLYCOPEEL 10%', '60ml', 'dermatology_cosmeceuticals', null, 40.00, 16.00, 14.40, 13.60, 12.80, 12.00],
  ['LMED044', 'LARIMEDICAL', 'Pureglycopeel (Cellular Renewal)', 'larimedical-pureglycopeel-10', 'PUREGLYCOPEEL 10%', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 4.44, 1.78, 1.60, 1.51, 1.42, 1.33],
  ['LMED013', 'LARIMEDICAL', 'Pureglycopeel (Cellular Renewal)', 'larimedical-pureglycopeel-5', 'PUREGLYCOPEEL 5%', '30ml', 'dermatology_cosmeceuticals', 40.00, 20.00, 8.00, 7.60, 7.40, 7.20, 7.00],
  ['LMED045', 'LARIMEDICAL', 'Pureglycopeel (Cellular Renewal)', 'larimedical-pureglycopeel-5', 'PUREGLYCOPEEL 5%', '4ml (monodose)', 'dermatology_cosmeceuticals', null, 8.89, 1.78, 1.69, 1.64, 1.60, 1.56],

  // reNAD+ — Energía celular y reparación (1)
  ['LMED073', 'LARIMEDICAL', 'reNAD+ (Cellular Energy & Repair)', 'larimedical-renad-plus-ampoules', 'reNAD+ Ampoules (NAD+ + Exosomes + Niacinamide)', '7u x 2ml', 'dermatology_cosmeceuticals', 30.00, 15.00, 6.00, 5.70, 5.55, 5.40, 5.25, 'Updated 2026 formula combining NAD+, controlled-release exosomes, and niacinamide for cellular bioenergy & barrier repair'],

  // LIMPIADORES / CLEANSERS (2)
  ['LMED052', 'LARIMEDICAL', 'Medical Cleansers', 'larimedical-premiere-universal-cleansing-gel', 'PREMIÈRE UNIVERSAL CLEANSING GEL', '500ml', 'dermatology_cosmeceuticals', null, 31.50, 12.40, 11.16, 10.54, 9.92, 9.30],
  ['LMED057', 'LARIMEDICAL', 'Medical Cleansers', 'larimedical-premiere-universal-cleansing-gel', 'PREMIÈRE UNIVERSAL CLEANSING GEL', '250ml', 'dermatology_cosmeceuticals', 44.29, 22.15, 8.86, 7.97, 7.53, 7.09, 6.64],

  // PRE-PEEL AND POST-PEEL (5)
  ['LMED016', 'LARIMEDICAL', 'Pre-Peel & Post-Peel', 'larimedical-pre-peel', 'PRE-PEEL Degreasing Solution', '250ml', 'dermatology_cosmeceuticals', null, 25.00, 10.00, 9.00, 8.50, 8.00, 7.50],
  ['LMED017', 'LARIMEDICAL', 'Pre-Peel & Post-Peel', 'larimedical-post-peel', 'POST-PEEL Neutralizing Solution', '250ml', 'dermatology_cosmeceuticals', null, 25.00, 10.00, 9.00, 8.50, 8.00, 7.50],
  ['LMED018', 'LARIMEDICAL', 'Pre-Peel & Post-Peel', 'larimedical-post-peel-plus', 'POST-PEEL PLUS Recovery Ampoules', '7u x 2ml', 'dermatology_cosmeceuticals', 30.00, 15.00, 6.00, 5.70, 5.55, 5.40, 5.25],
  ['LMED033', 'LARIMEDICAL', 'Pre-Peel & Post-Peel', 'larimedical-post-peel-plus', 'POST-PEEL PLUS Recovery Ampoules', '30u x 2ml', 'dermatology_cosmeceuticals', null, 45.00, 16.56, 15.72, 15.33, 14.94, 14.49],
  ['LMED024', 'LARIMEDICAL', 'Pre-Peel & Post-Peel', 'larimedical-post-peel-calming-mask', 'POST-PEEL CALMING MASK', '200ml', 'dermatology_cosmeceuticals', null, 31.50, 12.60, 11.34, 10.71, 10.08, 9.45],

  // SATIN — Fotoprotección (3)
  ['LMED021', 'LARIMEDICAL', 'Satin Photoprotection', 'larimedical-satin-50', 'SATIN 50 Photoprotector SPF50', '50ml', 'dermatology_cosmeceuticals', 19.95, 12.50, 5.52, 5.24, 5.11, 4.98, 4.83],
  ['LMED022', 'LARIMEDICAL', 'Satin Photoprotection', 'larimedical-satin-50-natural', 'SATIN 50 NATURAL Tinted SPF50', '50ml', 'dermatology_cosmeceuticals', 19.95, 12.50, 5.52, 5.24, 5.11, 4.98, 4.83],
  ['LMED023', 'LARIMEDICAL', 'Satin Photoprotection', 'larimedical-satin-50-doree', 'SATIN 50 DORÉE Tinted SPF50', '50ml', 'dermatology_cosmeceuticals', 19.95, 12.50, 5.52, 5.24, 5.11, 4.98, 4.83],
];

const round2 = (n) => (n == null ? null : +Number(n).toFixed(2));

const CATEGORY_META = {
  cosmetics: { label: 'Cosmeceuticals & Skincare', primaryType: 'Cosmetics' },
  dermatology_cosmeceuticals: { label: 'Dermatology & Clinical Peels', primaryType: 'Cosmeceuticals' },
  trichology_hair_care: { label: 'Trichology & Hair Care', primaryType: 'Trichology' },
};

const BRAND_SUMMARY = {
  LARIMIDE: 'Home-care dermocosmetic line formulated in Alcoy, Spain (ISO 22716 · AEMPS · Vegan · Cruelty-Free).',
  'LARIMIDE PRO': 'Professional aesthetic cabin ritual formulation (ISO 22716 · AEMPS · Made in Spain).',
  LARIMEDICAL: 'Medical-aesthetic clinical formulation by Larimide S.L.U. (ISO 22716 · AEMPS · Made in Spain).',
};

function buildVariantRecord(row) {
  const [
    sku, brand, line, parentSlug, parentName, variantLabel, categoryId,
    retailEur, profEur, d1, d250, d500, d1000, d2500, extraNote = '',
  ] = row;

  const costPriceEur = round2(d1);
  const wholesalePriceEur = round2(costPriceEur * 1.3225);
  const clinicPriceEur = round2(profEur);
  const retailPriceEur = retailEur != null ? round2(retailEur) : null;

  const volumeTiers = [
    { minQty: 1, label: 'FROM 1u', unitPriceEur: round2(d1) },
    { minQty: 250, label: 'FROM 250u', unitPriceEur: round2(d250) },
    { minQty: 500, label: 'FROM 500u', unitPriceEur: round2(d500) },
    { minQty: 1000, label: 'FROM 1000u', unitPriceEur: round2(d1000) },
    { minQty: 2500, label: 'FROM 2500u', unitPriceEur: round2(d2500) },
  ];

  const docId = `larimide-${sku.toLowerCase()}`;

  return {
    id: docId,
    docId,
    sku,
    productId: `larimide-${parentSlug}`,
    name: `${parentName} (${variantLabel})`,
    productName: `${parentName} (${variantLabel})`,
    label: variantLabel,
    dosage: variantLabel,
    normalizedDosage: variantLabel.replace(/\s+/g, '').toLowerCase(),
    packSize: variantLabel,
    presentation: /ampoule|ml|g/i.test(variantLabel) ? (variantLabel.includes('x') ? 'ampoules' : 'bottle') : 'unit',
    catalogBrand: brand,
    brand,
    line,
    categoryId,
    subcategory: `${brand} · ${line}`,
    supplierId: 'supplier-larimedical',
    supplier: LARIMIDE_SUPPLIER_UPDATE.name,
    supplierName: brand,
    sourceCatalogue: 'Larimide 2026 Price List (V.260430)',
    currency: 'EUR',
    cost: costPriceEur,
    costPriceEur,
    mediluxePrice: round2(costPriceEur * 1.15),
    wholesalePrice: wholesalePriceEur,
    wholesalePriceEur,
    clinicPrice: clinicPriceEur,
    clinicPriceEur,
    retailPrice: retailPriceEur,
    retailPriceEur,
    unit_price: wholesalePriceEur,
    price: wholesalePriceEur,
    pricing: {
      currency: 'EUR',
      masterPrice: costPriceEur,
      costPriceEur,
      mediluxePrice: round2(costPriceEur * 1.15),
      wholesalePrice: wholesalePriceEur,
      wholesalePriceEur,
      clinicPrice: clinicPriceEur,
      clinicPriceEur,
      retailPrice: retailPriceEur,
      retailPriceEur,
      incoterms: 'EXW Alcoy (Spain)',
      priceListVersion: 'V.260430',
      master: { perUnit: costPriceEur, currency: 'EUR' },
      wholesale: { perUnit: wholesalePriceEur, currency: 'EUR' },
      clinic: { perUnit: clinicPriceEur, currency: 'EUR' },
      ...(retailPriceEur != null ? { retail: { perUnit: retailPriceEur, currency: 'EUR' } } : {}),
    },
    volumeTiers,
    supplierOffers: {
      'supplier-larimedical': {
        supplierId: 'supplier-larimedical',
        supplierName: LARIMIDE_SUPPLIER_UPDATE.name,
        sku,
        costPrice: costPriceEur,
        currency: 'EUR',
        incoterms: 'EXW Alcoy (Spain)',
        volumeTiers,
        professionalRefEur: clinicPriceEur,
        retailRefEur: retailPriceEur,
        isActive: true,
      },
    },
    requiresColdChain: false,
    inStock: true,
    isActive: true,
    status: 'published',
    countryOfOrigin: 'Spain',
    warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
    certifications: ['ISO 22716 (SGS)', 'AEMPS Authorized'],
    ...(extraNote ? { auditNote: extraNote } : {}),
  };
}

/**
 * Returns grouped parent Firestore documents (~96 docs holding all 145 exact SKUs in variants[]).
 */
export function buildGroupedLarimide2026Docs(nowIso = new Date().toISOString()) {
  const groups = new Map();

  for (const row of RAW_ROWS) {
    const [, brand, line, parentSlug, parentName, , categoryId, , , , , , , , extraNote] = row;
    const docId = `larimide-${parentSlug}`;
    if (EXISTING_STERILIA_IDS.includes(docId)) {
      throw new Error(`Safety guard: docId ${docId} collides with existing Sterilia product`);
    }

    const variant = buildVariantRecord(row);
    variant.createdAt = nowIso;
    variant.updatedAt = nowIso;

    if (!groups.has(docId)) {
      const catMeta = CATEGORY_META[categoryId] || CATEGORY_META.cosmetics;
      groups.set(docId, {
        id: docId,
        slug: docId,
        canonicalKey: docId,
        name: parentName,
        canonicalName: parentName,
        catalogBrand: brand,
        brand,
        line,
        category: catMeta.label,
        categoryId,
        subcategory: `${brand} · ${line}`,
        primaryType: catMeta.primaryType,
        availableTypes: [catMeta.primaryType],
        supplierId: 'supplier-larimedical',
        supplier: LARIMIDE_SUPPLIER_UPDATE.name,
        supplierIds: ['supplier-larimedical'],
        suppliers: [LARIMIDE_SUPPLIER_UPDATE.name],
        supplierName: brand,
        sourceCatalogue: 'Larimide 2026 Price List (V.260430)',
        description: extraNote || `${parentName} (${brand} · ${line}). ${BRAND_SUMMARY[brand] || ''}`,
        countryOfOrigin: 'Spain',
        warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
        certifications: LARIMIDE_SUPPLIER_UPDATE.certifications,
        requiresColdChain: false,
        hasCOA: true,
        inStock: true,
        isActive: true,
        status: 'published',
        currency: 'EUR',
        baseCurrency: 'EUR',
        _schemaVersion: 2,
        searchTokens: [
          parentName.toLowerCase(),
          brand.toLowerCase(),
          line.toLowerCase(),
          'larimide',
          'larimedical',
          categoryId,
        ],
        variants: [],
        supplierOffers: {},
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    const parent = groups.get(docId);
    parent.variants.push(variant);
    if (!parent.searchTokens.includes(variant.sku.toLowerCase())) {
      parent.searchTokens.push(variant.sku.toLowerCase());
    }
  }

  // Finalize parent summary fields from primary (largest/first) variant
  return Array.from(groups.values()).map((parent) => {
    const first = parent.variants[0];
    const minWholesale = Math.min(...parent.variants.map((v) => v.wholesalePriceEur));
    const minCost = Math.min(...parent.variants.map((v) => v.costPriceEur));
    return {
      ...parent,
      sku: parent.variants.length === 1 ? first.sku : parent.variants.map((v) => v.sku).join(' / '),
      packSize: parent.variants.map((v) => v.packSize).join(' · '),
      dosage: parent.variants.map((v) => v.dosage).join(' / '),
      variantsCount: parent.variants.length,
      cost: first.costPriceEur,
      costPriceEur: first.costPriceEur,
      min_unit_price: minWholesale,
      wholesalePrice: first.wholesalePriceEur,
      wholesalePriceEur: first.wholesalePriceEur,
      clinicPrice: first.clinicPriceEur,
      clinicPriceEur: first.clinicPriceEur,
      retailPrice: first.retailPriceEur,
      retailPriceEur: first.retailPriceEur,
      pricing: {
        ...first.pricing,
        minWholesalePriceEur: minWholesale,
        minCostPriceEur: minCost,
      },
      supplierOffers: first.supplierOffers,
    };
  });
}

/**
 * Flattened 145-SKU list used as local/pricing-hub view model fallback or direct SKU table.
 */
export function getLarimide2026FlatProducts() {
  return RAW_ROWS.map((row) => buildVariantRecord(row));
}

export const LARIMIDE_2026_STATS = Object.freeze({
  totalSkus: RAW_ROWS.length,
  byBrand: {
    LARIMIDE: RAW_ROWS.filter((r) => r[1] === 'LARIMIDE').length,
    'LARIMIDE PRO': RAW_ROWS.filter((r) => r[1] === 'LARIMIDE PRO').length,
    LARIMEDICAL: RAW_ROWS.filter((r) => r[1] === 'LARIMEDICAL').length,
  },
});
