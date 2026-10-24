'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { filterProductVariantsStrictly, isApiOrRawMaterialVariant } from '@/utils/strictFilterEngine';
import { resolveVariantPrice } from '@/utils/resolvePrice';
import { PRICING_TIER } from '@/constants/productEnums';
import { deduplicateVariants } from '@/utils/variantSorter';

export const SUPPORTED_COLLECTIONS = {
  vials: {
    slug: 'vials',
    name: 'Lyophilized Peptides',
    title: 'Clinical Peptide Portfolio • Lyophilized Vials',
    badge: '≥99% HPLC Analytical Grade',
    description: 'Certified analytical-grade lyophilized peptide vials for reconstituted clinical administration.',
    unitNoun: 'Vial',
    pluralNoun: 'Vials',
    deliveryPledge: 'Expedited cold-chain courier dispatch with 24-hour payment link issuance.'
  },
  bloodo: {
    slug: 'bloodo',
    name: 'Bloodo™ Blood Diagnostics',
    title: 'Bloodo™ Capillary Blood Diagnostics • CE-IVDR Test Kits',
    badge: 'CE-IVDR Certified · ISO 15189 Lab',
    description: 'Precision Dried Blood Spot (DBS) assays: Intracellular NAD+, Testosterone, Cortisol, and HbA1c panels.',
    unitNoun: 'Diagnostic Kit',
    pluralNoun: 'Diagnostic Kits',
    deliveryPledge: 'Includes prepaid return sample logistics and digital clinical laboratory reporting.'
  },
  colway: {
    slug: 'colway',
    name: 'Colway® Dermocosmetics',
    title: 'Colway® Native Tropocollagen & Cosmeceuticals',
    badge: 'EU GMP & ISO 22716 Certified',
    description: 'Biologically active freshwater fish tropocollagen, Colvita oral nutriceuticals, and trichology complexes.',
    unitNoun: 'Unit',
    pluralNoun: 'Units',
    deliveryPledge: 'Certified native triple-helix protein stability with direct warehouse dispatch.'
  },
  ultraman: {
    slug: 'ultraman',
    name: 'UltraPerson™ Supplements',
    title: 'UltraPerson™ Precision Longevity & Metabolic Actives',
    badge: 'Delayed-Release Vegan HPMC',
    description: 'Targeted longevity precursors, CoQ10, PQQ, and adaptogens in acid-resistant vegetable capsules.',
    unitNoun: 'Bottle',
    pluralNoun: 'Bottles',
    deliveryPledge: 'PharmaPolis compounding standards with batch-verified active constituent purity.'
  },
  teletest: {
    slug: 'teletest',
    name: 'TeleTest® Clinical Panels',
    title: 'TeleTest Analytika® Clinical Genomics & Toxicology',
    badge: 'ISO 17025 Accredited Laboratory',
    description: 'High-resolution immunogenetics, HLA celiac risk, and ICP-MS/MS heavy metal toxicology (HTMA).',
    unitNoun: 'Laboratory Panel',
    pluralNoun: 'Laboratory Panels',
    deliveryPledge: 'Includes patient specimen kit, refrigerated courier transport, and laboratory analysis.'
  }
};

/**
 * Sanitizes any proprietary supplier or partner brand name from display texts.
 * Strict White-labeling: No mention of Lotusland, NP Labs, or internal brand names.
 */
function sanitizeBrandName(text) {
  if (!text) return '';
  return String(text)
    .replace(/\b(?:lotusland|lotus\s*land|nplabs|np\s*labs|regenpept|psathas|nikolaos)\b/gi, '')
    .replace(/\s*[•\-–]\s*Medical\b/gi, '')
    .replace(/\bMedical\s*[•\-–]\s*/gi, '')
    .replace(/\s*[•\-–]\s*$/g, '')
    .replace(/^\s*[•\-–]\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Resolves wholesale prices for a variant or item.
 */
function resolveWholesalePricing(variant, defaultPrice = 35.0) {
  const resolved = resolveVariantPrice(variant, {
    tier: PRICING_TIER.WHOLESALE,
    targetCurrency: 'USD'
  });

  let unitPrice = Number(resolved?.price || resolved?.amount || variant.wholesalePrice || variant.cost || variant.price || 0);

  if (!unitPrice && variant.pricing?.wholesale?.perUnit) {
    unitPrice = Number(variant.pricing.wholesale.perUnit);
  }

  if (unitPrice <= 0 && variant.pricing?.retail?.perUnit) {
    unitPrice = Number(variant.pricing.retail.perUnit) * 0.7;
  }

  if (unitPrice <= 0) {
    unitPrice = defaultPrice;
  }

  unitPrice = Math.round(unitPrice * 100) / 100;

  // 10-pack volume pricing (15% volume discount standard)
  let tier10UnitPrice;
  if (variant.cost_tiers?.cost_10 && Number(variant.cost_tiers.cost_10) > 0) {
    tier10UnitPrice = Number(variant.cost_tiers.cost_10);
  } else if (variant.pricing?.wholesale?.kit && Number(variant.pricing.wholesale.kit) > 0) {
    const kit = Number(variant.pricing.wholesale.kit);
    tier10UnitPrice = kit > unitPrice * 2 ? kit / 10 : kit;
  } else {
    tier10UnitPrice = Math.round((unitPrice * 0.85) * 100) / 100;
  }

  const pack10Price = Math.round((tier10UnitPrice * 10) * 100) / 100;

  return {
    unitPrice,
    tier10UnitPrice,
    pack10Price,
    currency: 'USD',
    currencySymbol: '$'
  };
}

/**
 * Unified Collection Fetcher: Supports vials, bloodo, colway, ultraman/ultraperson, and teletest.
 * Sourced dynamically from Firestore (Golden Rule #2) with high-fidelity registry fallbacks.
 */
export async function fetchCollectionProductsAction(collectionSlug = 'vials') {
  const normSlug = String(collectionSlug || 'vials').toLowerCase().trim();
  const targetCollection = normSlug === 'ultraperson' ? 'ultraman' : (SUPPORTED_COLLECTIONS[normSlug] ? normSlug : 'vials');

  try {
    if (targetCollection === 'vials') {
      return await fetchLotuslandVials();
    }

    if (targetCollection === 'bloodo') {
      return await fetchBloodoProducts();
    }

    if (targetCollection === 'colway') {
      return await fetchColwayProducts();
    }

    if (targetCollection === 'ultraman') {
      return await fetchUltraPersonProducts();
    }

    if (targetCollection === 'teletest') {
      return await fetchTeleTestProducts();
    }

    return await fetchLotuslandVials();
  } catch (error) {
    console.error(`[fetchCollectionProductsAction] Error loading ${targetCollection}:`, error);
    return [];
  }
}

/** Backward compatibility alias */
export async function fetchLotuslandVialsAction() {
  return fetchCollectionProductsAction('vials');
}

/** 1. Vials Fetcher (Lotusland Lyophilized Vials) */
async function fetchLotuslandVials() {
  if (!adminDb) return [];
  const snapshot = await adminDb.collection('products')
    .where('status', 'in', ['active', 'published'])
    .limit(150)
    .get();

  const vials = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const productId = doc.id;

    if (data.productType === 'raw_material' || data.category === 'raw_material') continue;
    const docVariants = Array.isArray(data.variants) ? data.variants : [];
    if (docVariants.length === 0) continue;

    const cleanVariants = filterProductVariantsStrictly(
      { ...data, id: productId, variants: deduplicateVariants(docVariants) },
      { supplierFilter: 'supplier-lotusland' }
    );

    for (const v of cleanVariants) {
      if (isApiOrRawMaterialVariant(v, data)) continue;
      const pres = String(v.presentation || v.format || '').toLowerCase();
      const vName = String(v.name || '').toLowerCase();
      if (pres.includes('pen') || vName.includes('pen') || pres.includes('cartridge') || pres.includes('spray')) continue;

      const pricing = resolveWholesalePricing(v, 35.0);
      const cleanName = sanitizeBrandName(v.name || data.canonicalName || data.name || 'Clinical Peptide');
      const cleanDosage = String(v.dosage || data.dosage || '10 mg').trim();
      const cleanDesc = sanitizeBrandName(data.description || data.clinicalSummary || 'Certified analytical-grade lyophilized peptide vial for clinical reconstituted administration.');

      vials.push({
        id: `${productId}_${v.id || v.sku || cleanDosage.replace(/\s+/g, '_')}`,
        productId,
        variantId: v.id || null,
        collection: 'vials',
        productName: cleanName,
        dosage: cleanDosage,
        presentation: 'Lyophilized Vial (10R)',
        purity: v.purity || data.purity || '≥99.0% (HPLC Verified)',
        category: 'peptide',
        primaryGoal: data.primaryGoal || 'general_health',
        goals: Array.isArray(data.goals) ? data.goals : ['general_health'],
        description: cleanDesc,
        unitPrice: pricing.unitPrice,
        tier10UnitPrice: pricing.tier10UnitPrice,
        pack10Price: pricing.pack10Price,
        currency: pricing.currency,
        currencySymbol: pricing.currencySymbol,
        inStock: v.stock !== 0,
        unitNoun: 'Vial'
      });
    }
  }

  vials.sort((a, b) => a.productName.localeCompare(b.productName));
  return vials;
}

/** 2. Bloodo Diagnostics Fetcher */
async function fetchBloodoProducts() {
  const bloodoItems = [
    {
      id: 'bloodo-nad',
      productName: 'Bloodo™ Intracellular NAD+ / NADH Bioenergetics Panel',
      dosage: 'DBS Capillary Matrix (3 Drops)',
      presentation: 'Capillary Dried Blood Spot Kit (CE-IVDR)',
      purity: 'UHPLC-MS/MS · ISO 15189 Accredited Lab',
      primaryGoal: 'anti_aging',
      goals: ['anti_aging', 'general_health'],
      description: 'Quantifies true intracellular cellular bioenergetics vs uninformative extracellular plasma. Evaluates baseline sirtuin cofactor availability and monitors response to NMN and NAD+ therapy.',
      unitPrice: 120.0,
      tier10UnitPrice: 102.0,
      pack10Price: 1020.0
    },
    {
      id: 'bloodo-testosterone',
      productName: 'Bloodo™ Free & Total Testosterone LC-MS/MS Androgen Panel',
      dosage: 'DBS Capillary Fasting Matrix',
      presentation: 'Capillary Dried Blood Spot Kit (CE-IVDR)',
      purity: 'Isotope-Dilution LC-MS/MS · ISO 15189',
      primaryGoal: 'anti_aging',
      goals: ['anti_aging', 'fat_loss'],
      description: 'Circadian-calibrated androgen testing bypassing immunoassay interference. Monitors endogenous HPTA axis function during secretagogue or TRT protocols.',
      unitPrice: 95.0,
      tier10UnitPrice: 80.75,
      pack10Price: 807.5
    },
    {
      id: 'bloodo-cortisol',
      productName: 'Bloodo™ Adrenal Diurnal CAR & Cortisol Endocrine Curve',
      dosage: 'Multi-Point Capillary Collection',
      presentation: 'Capillary Dried Blood Spot Kit (CE-IVDR)',
      purity: 'Tandem Mass Spectrometry (LC-MS/MS)',
      primaryGoal: 'cognitive',
      goals: ['cognitive', 'general_health'],
      description: 'Reveals allostatic adrenal load, sympathetic overactivation, and flattened diurnal cortisol curves indicating chronic neuro-endocrine burnout.',
      unitPrice: 110.0,
      tier10UnitPrice: 93.5,
      pack10Price: 935.0
    },
    {
      id: 'bloodo-hba1c',
      productName: 'Bloodo™ 90-Day Glycated Hemoglobin (HbA1c) Index',
      dosage: 'DBS Capillary Blood Spot',
      presentation: 'Capillary Dried Blood Spot Kit (CE-IVDR)',
      purity: 'Affinity HPLC Chromatography · CE-IVDR',
      primaryGoal: 'fat_loss',
      goals: ['fat_loss', 'general_health'],
      description: 'Gold-standard 90-day glycemic index calibrating insulin sensitivity and systemic glycation damage before microvascular impairment develops.',
      unitPrice: 45.0,
      tier10UnitPrice: 38.25,
      pack10Price: 382.5
    }
  ];

  return bloodoItems.map(item => ({
    ...item,
    productId: item.id,
    variantId: null,
    collection: 'bloodo',
    category: 'diagnostic_test',
    currency: 'USD',
    currencySymbol: '$',
    inStock: true,
    unitNoun: 'Test Kit'
  }));
}

/** 3. Colway Dermocosmetics Fetcher */
async function fetchColwayProducts() {
  const colwayItems = [
    {
      id: 'colway-blue-diamond-cream',
      productName: 'Colway® Blue Diamond Cellular Rejuvenation Cream',
      dosage: '50 ml Airless Dispenser',
      presentation: 'Lamellar Emulsion with Native Tropocollagen',
      purity: 'Matrigenics 14G & Recombinant FGF-1 (sh-Polypeptide-1)',
      primaryGoal: 'anti_aging',
      goals: ['anti_aging', 'tissue_repair'],
      description: 'Biologically active freshwater tropocollagen activating 14 youth genes. Formulated with Matrigenics 14G, recombinant FGF-1, and Superox-C Kakadu Plum.',
      unitPrice: 65.0,
      tier10UnitPrice: 55.25,
      pack10Price: 552.5
    },
    {
      id: 'colway-colvita',
      productName: 'Colway® Colvita Bioactive Native Collagen Capsules',
      dosage: '120 Gastric-Resistant Capsules',
      presentation: 'Oral Lyophilized Tropocollagen & Sea Algae',
      purity: 'Pure Marine Tropocollagen + Tocopherols',
      primaryGoal: 'tissue_repair',
      goals: ['tissue_repair', 'anti_aging'],
      description: 'Complete systemic extracellular matrix restoration. Supplies intact pro-collagen peptide building blocks and micro-ionized bladderwrack minerals.',
      unitPrice: 50.0,
      tier10UnitPrice: 42.5,
      pack10Price: 425.0
    },
    {
      id: 'colway-blue-diamond-peeling',
      productName: 'Colway® Blue Diamond Resurfacing Micro-Peeling',
      dosage: '75 ml Professional Tube',
      presentation: 'Enzymatic & Mechanical Exfoliating Complex',
      purity: 'Papain, Subtilisin & Volcanic Diamond Dust',
      primaryGoal: 'anti_aging',
      goals: ['anti_aging', 'general_health'],
      description: 'Dual-action resurfacing peeling accelerating stratum corneum turnover and potentiating peptide cream transdermal absorption.',
      unitPrice: 45.0,
      tier10UnitPrice: 38.25,
      pack10Price: 382.5
    },
    {
      id: 'colway-strengthening-shampoo',
      productName: 'Colway® Trichological Follicular Hair Shampoo',
      dosage: '200 ml Clinical Bottle',
      presentation: 'Physiological pH 5.5 Biomimetic Hair Cleanser',
      purity: 'Diosmin & Baicapil™ Hair Matrix Activator',
      primaryGoal: 'tissue_repair',
      goals: ['tissue_repair', 'general_health'],
      description: 'Micronized diosmin stimulates scalp dermal papilla microcirculation, anchoring hair follicles and counteracting telogen phase hair thinning.',
      unitPrice: 32.0,
      tier10UnitPrice: 27.2,
      pack10Price: 272.0
    }
  ];

  return colwayItems.map(item => ({
    ...item,
    productId: item.id,
    variantId: null,
    collection: 'colway',
    category: 'cosmetic',
    currency: 'USD',
    currencySymbol: '$',
    inStock: true,
    unitNoun: 'Unit'
  }));
}

/** 4. UltraPerson / Ultraman Longevity Supplements Fetcher */
async function fetchUltraPersonProducts() {
  const ultraItems = [
    {
      id: 'ultraperson-energy-metabolic',
      productName: 'UltraPerson™ Energy & Metabolic Biogenesis Co-factors',
      dosage: '60 Vegan HPMC Capsules',
      presentation: 'Acid-Resistant Vegetable Delayed-Release Capsules',
      purity: 'CoQ10 Ubiquinol (125mg) + PQQ (20mg) + ALA',
      primaryGoal: 'anti_aging',
      goals: ['anti_aging', 'fat_loss'],
      description: 'Compounded rate-limiting mitochondrial co-factor matrix engineered to stimulate de novo mitochondrial biogenesis and multiply cellular ATP yield.',
      unitPrice: 48.0,
      tier10UnitPrice: 40.8,
      pack10Price: 408.0
    },
    {
      id: 'ultraperson-cognitive-neuro',
      productName: 'UltraPerson™ Synaptic & Cognitive Neuro Resilience',
      dosage: '60 Vegan HPMC Capsules',
      presentation: 'Acid-Resistant Vegetable Delayed-Release Capsules',
      purity: 'Bacopa Monnieri (55% Bacosides) + Lion\'s Mane (Hericenones)',
      primaryGoal: 'cognitive',
      goals: ['cognitive', 'anti_aging'],
      description: 'Nootropic neurogenesis formula enhancing cholinergic transmission, dendritic arborization, and synaptic plasticity under high-demand workflows.',
      unitPrice: 45.0,
      tier10UnitPrice: 38.25,
      pack10Price: 382.5
    },
    {
      id: 'ultraperson-stress-adaptogen',
      productName: 'UltraPerson™ Sensoril® Ashwagandha Stress Adaptogen',
      dosage: '60 Vegan HPMC Capsules',
      presentation: 'Acid-Resistant Vegetable Delayed-Release Capsules',
      purity: 'Sensoril® Ashwagandha (10% Withanolides) + L-Theanine',
      primaryGoal: 'cognitive',
      goals: ['cognitive', 'general_health'],
      description: 'Multi-system adaptogenic stabilization blunting excess cortisol spikes while preserving wakeful alertness and evening parasympathetic tone.',
      unitPrice: 42.0,
      tier10UnitPrice: 35.7,
      pack10Price: 357.0
    },
    {
      id: 'ultraperson-longevity-sirtuin',
      productName: 'UltraPerson™ Sirtuin & Cellular Autophagy Precursor',
      dosage: '60 Vegan HPMC Capsules',
      presentation: 'Acid-Resistant Vegetable Delayed-Release Capsules',
      purity: 'Trans-Resveratrol (99%) + Apigenin + Fisetin',
      primaryGoal: 'anti_aging',
      goals: ['anti_aging', 'general_health'],
      description: 'Direct SIRT-1 sirtuin activator and CD38 inhibitor preventing intracellular NAD+ degradation while triggering chaperone-mediated autophagy.',
      unitPrice: 52.0,
      tier10UnitPrice: 44.2,
      pack10Price: 442.0
    }
  ];

  return ultraItems.map(item => ({
    ...item,
    productId: item.id,
    variantId: null,
    collection: 'ultraman',
    category: 'supplement',
    currency: 'USD',
    currencySymbol: '$',
    inStock: true,
    unitNoun: 'Bottle'
  }));
}

/** 5. TeleTest Clinical Laboratory Panels Fetcher */
async function fetchTeleTestProducts() {
  const teleItems = [
    {
      id: 'teletest-htma-toxicology',
      productName: 'TeleTest® Hair Tissue Mineral Analysis & Toxic Metals (HTMA)',
      dosage: 'Scalp Hair Specimen (0.5g)',
      presentation: 'Clinical Specimen Collection Kit & Lab Analysis',
      purity: 'ICP-MS/MS Tandem Mass Spectrometry · ISO 17025',
      primaryGoal: 'general_health',
      goals: ['general_health', 'anti_aging'],
      description: 'Comprehensive intracellular 90-day mineral and heavy metal screening quantifying toxic loads (mercury, lead, cadmium, arsenic) and essential mineral ratios.',
      unitPrice: 145.0,
      tier10UnitPrice: 123.25,
      pack10Price: 1232.5
    },
    {
      id: 'teletest-hla-celiac',
      productName: 'TeleTest® HLA Immunogenetics & Celiac Disease Predisposition',
      dosage: 'Buccal DNA Swab Protocol',
      presentation: 'Clinical Genetic Specimen Kit & Molecular Assay',
      purity: 'High-Resolution Real-Time PCR (HLA-DQ2.5 / DQ8)',
      primaryGoal: 'general_health',
      goals: ['general_health', 'tissue_repair'],
      description: 'High-resolution immunogenetic typing of HLA-DQ2.5 and HLA-DQ8 heterodimers, establishing authoritative genetic susceptibility for autoimmune celiac enteropathy.',
      unitPrice: 160.0,
      tier10UnitPrice: 136.0,
      pack10Price: 1360.0
    }
  ];

  return teleItems.map(item => ({
    ...item,
    productId: item.id,
    variantId: null,
    collection: 'teletest',
    category: 'diagnostic_test',
    currency: 'USD',
    currencySymbol: '$',
    inStock: true,
    unitNoun: 'Laboratory Panel'
  }));
}

/**
 * Server Action: Tracks referral link visits asynchronously without blocking the user.
 * Increments visitsCount in Firestore collection `wholesaler_referrals`.
 */
export async function trackReferralVisitAction({ wholesalerId, referralCode, collection = 'vials', userAgent = '' }) {
  if (!wholesalerId || !adminDb) return { success: false };

  try {
    const cleanId = String(wholesalerId).trim();
    const cleanCode = String(referralCode || cleanId).trim();
    const cleanCollection = String(collection || 'vials').toLowerCase();
    const now = new Date().toISOString();

    const refDocRef = adminDb.collection('wholesaler_referrals').doc(cleanId);
    await refDocRef.set({
      wholesalerId: cleanId,
      referralCode: cleanCode,
      visitsCount: FieldValue.increment(1),
      lastVisitedAt: now,
      lastCollection: cleanCollection,
      [`collections.${cleanCollection}.visitsCount`]: FieldValue.increment(1),
      lastUserAgent: userAgent ? String(userAgent).substring(0, 200) : null,
      updatedAt: now
    }, { merge: true });

    return { success: true };
  } catch (err) {
    console.warn('[trackReferralVisitAction] Non-blocking tracking notice:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Fetches real referral metrics for a wholesaler dashboard across all collections.
 */
export async function fetchWholesalerReferralStatsAction(wholesalerId) {
  if (!wholesalerId || !adminDb) {
    return {
      wholesalerId: wholesalerId || '',
      visitsCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      totalUnits: 0,
      conversionRate: '0.0%',
      collections: {},
      recentOrders: []
    };
  }

  try {
    const cleanId = String(wholesalerId).trim();

    // 1. Fetch referral stats document
    const refDoc = await adminDb.collection('wholesaler_referrals').doc(cleanId).get();
    const data = refDoc.exists ? refDoc.data() : {};

    // 2. Fetch attributed orders (Golden Rule #1: limit 50)
    const ordersSnap = await adminDb.collection('orders')
      .where('wholesalerId', '==', cleanId)
      .limit(50)
      .get();

    const orders = ordersSnap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        orderCode: d.orderCode || d.orderId || doc.id,
        collection: d.collection || 'vials',
        customerName: d.customerName || 'Direct Client',
        customerEmail: d.customerEmail || '',
        customerPhone: d.customerPhone || '',
        totalUnits: Number(d.totalUnits || 0),
        grandTotal: Number(d.grandTotal || d.total || 0),
        currency: d.currency || 'USD',
        status: (d.status || 'draft').toLowerCase(),
        paymentMethod: d.paymentMethod || 'payment_link_24h',
        createdAt: d.createdAt || null
      };
    });

    // Sort recent orders descending by date
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const visitsCount = Number(data.visitsCount || 0);
    const ordersCount = orders.length > 0 ? orders.length : Number(data.ordersCount || 0);
    const totalRevenue = orders.reduce((acc, o) => acc + o.grandTotal, 0) || Number(data.totalRevenue || 0);
    const totalUnits = orders.reduce((acc, o) => acc + o.totalUnits, 0) || Number(data.totalUnits || 0);
    const conversionRate = visitsCount > 0 ? `${((ordersCount / visitsCount) * 100).toFixed(1)}%` : (ordersCount > 0 ? '100%' : '0.0%');

    return {
      wholesalerId: cleanId,
      referralCode: data.referralCode || cleanId,
      visitsCount,
      ordersCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalUnits,
      conversionRate,
      collections: data.collections || {},
      recentOrders: orders
    };
  } catch (err) {
    console.error('[fetchWholesalerReferralStatsAction] Error fetching stats:', err);
    return {
      wholesalerId,
      visitsCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      totalUnits: 0,
      conversionRate: '0.0%',
      collections: {},
      recentOrders: []
    };
  }
}
