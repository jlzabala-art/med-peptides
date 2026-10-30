import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import ColwayPriceListClient from '../colway/ColwayPriceListClient';

export const revalidate = 60;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = 'Colway Clinical Hair & Trichology Line • Official UAE Wholesale Price Schedule';
  const description = 'Official UAE B2B price schedule for Colway Trichology strengthening shampoo and conditioner. Baicapil™ 2%, native biologically active fish tropocollagen, and micronized diosmin for follicular anchoring.';
  const ogImageUrl = `${appUrl}/images/products/colway/colway-dermatology-clinic-hero-v2.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${appUrl}/pricing/colway-hair`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl]
    }
  };
}

const FALLBACK_COLWAY_HAIR_PRODUCTS = [
  {
    id: 'colway-strengthening-shampoo',
    sku: 'SKU-COLWAY-STR-SHAMPOO-250',
    name: 'Colway Strengthening Anti-Hair Loss Shampoo',
    subtitle: 'Follicular Ostium Cleanser & Microcirculation Activator (pH 5.5)',
    volume: '250 mL',
    presentation: 'Dispenser Pump Bottle (250 mL)',
    category: 'Trichology & Scalp',
    image: '/images/products/colway/shampoo.png',
    keyActives: 'Baicapil™ (2%), Native Fish Tropocollagen, Micronized Diosmin, Caffeine, Niacinamide, Zinc PCA',
    clinicalFocus: 'Pre-transplant follicular preparation, shock-loss mitigation, ostium cleansing, post-FUE maintenance (Day 10+).',
    exWorksCostUsd: 32.69,
    landedCostAed: 120,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-strengthening-conditioner',
    sku: 'SKU-COLWAY-STR-COND-200',
    name: 'Colway Strengthening Hair Conditioner',
    subtitle: 'Peribulbar Cuticle Sealer & Dermal Matrix Reinforcement (pH 4.5)',
    volume: '200 mL',
    presentation: 'Flexible Dispenser Tube (200 mL)',
    category: 'Trichology & Scalp',
    image: '/images/products/colway/conditioner.png',
    keyActives: 'Baicapil™, Native Tropocollagen, Hydrolyzed Keratin, Argania Spinosa Oil, D-Panthenol, Cotton Seed Oil',
    clinicalFocus: 'Cuticular barrier restoration, tensile strength enhancement (+24%), hair shaft lipid sealing without greasiness.',
    exWorksCostUsd: 32.69,
    landedCostAed: 120,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-colvita',
    sku: 'SKU-COLWAY-COLVITA-60',
    name: 'Colvita Bioactive Native Collagen & Marine Algae',
    subtitle: 'Lyophilized Native Fish Tropocollagen, Fucus Algae & Natural Vitamin E',
    volume: '60 Capsules',
    presentation: 'Luxury Retail Box (60 Capsules in Blister Packs)',
    category: 'Systemic Nutraceutical',
    image: '/images/products/colway/colvita.png',
    keyActives: 'Lyophilized Native Tropocollagen (Triple Helix), Fucus Vesiculosus Algae, Natural Vitamin E',
    clinicalFocus: 'Systemic neocollagenesis, hair follicle anchoring, cuticular synthesis support from within.',
    landedCostAed: 105,
    wholesalePriceAed: 120.75,
    clinicPriceAed: 160,
    retailPriceAed: 210,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-blue-diamond-cream',
    sku: 'SKU-COLWAY-BLUEDIAMOND-50',
    name: 'Colway Blue Diamond Cream',
    subtitle: 'FGF-1 Recombinant Vector & Native Tropocollagen Cellular Emulsion',
    volume: '50 mL',
    presentation: 'Luxury Frosted Cosmetic Jar',
    category: 'Advanced Cellular Anti-Aging',
    image: '/images/products/colway/blue-diamond-cream.png',
    keyActives: 'sh-Polypeptide-1 (bFGF-1), Native Tropocollagen, Liposomal CoQ10, Ceramides, Kinetin',
    clinicalFocus: 'Deep dermal matrix redensification and barrier reconstruction.',
    landedCostAed: 220,
    wholesalePriceAed: 253,
    clinicPriceAed: 320,
    retailPriceAed: 395,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-blue-diamond-peeling',
    sku: 'SKU-COLWAY-BLUEDIAMOND-PEELING-75',
    name: 'Colway Blue Diamond Peeling',
    subtitle: 'Diamond Powder Micro-Dermabrasion & Enzymatic Exfoliator',
    volume: '75 mL',
    presentation: 'Cosmetic Treatment Tube',
    category: 'Exfoliation & Cellular Renewal',
    image: '/images/products/colway/blue-diamond-peeling.png',
    keyActives: 'Natural Diamond Dust, Papain Enzymes, Native Collagen, Jojoba Esters',
    clinicalFocus: 'Non-abrasive stratum corneum polishing and scalp ostium unclogging before topical treatments.',
    landedCostAed: 115,
    wholesalePriceAed: 132.25,
    clinicPriceAed: 175,
    retailPriceAed: 220,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-collagen-vege',
    sku: 'SKU-COLWAY-VEGE-45',
    name: 'Colway Collagen Vege (100% Plant-Based Bioactive Tropocollagen)',
    subtitle: 'Plant Aminogram Replicating Human Tropocollagen Type I',
    volume: '45 mL',
    presentation: 'Airless Precision Dispenser',
    category: 'Bioactive Barrier Care',
    image: '/images/products/colway/vege-collagen.png',
    keyActives: 'Chlorella Vulgaris Hydroxyproline, Young Coconut Water, Centella Asiatica',
    clinicalFocus: '100% vegan post-procedure recovery, sensitive & rosacea-prone skin soothing.',
    landedCostAed: 85,
    wholesalePriceAed: 97.75,
    clinicPriceAed: 135,
    retailPriceAed: 175,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-collagen-wash-gel',
    sku: 'SKU-COLWAY-WASH-250',
    name: 'Colway Cellular Collagen Hydrolipid Wash Gel',
    subtitle: 'Sulphate-Free Physiologic pH 5.5 Intact Cutaneous Cleanser',
    volume: '250 mL',
    presentation: 'Ergonomic Pump Dispenser',
    category: 'Cellular Cleansing',
    image: '/images/products/colway/washing-gel.png',
    keyActives: 'Native Tropocollagen, Aloe Barbadensis, Noni Extract, D-Panthenol',
    clinicalFocus: 'Hypoallergenic facial and full-body preparation.',
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 185,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-collagen-lip-care',
    sku: 'SKU-COLWAY-LIP-CARE',
    name: 'Colway Bioactive Collagen Lip Care',
    subtitle: 'Lipid-Replenishing Transdermal Labial Barrier Balm',
    volume: '4.5 g',
    presentation: 'Precision Twist Stick',
    category: 'Bioactive Barrier Care',
    image: '/images/products/colway/lip-care.png',
    keyActives: 'Native Collagen, Elastin, Shea Butter, Argan Oil',
    clinicalFocus: 'Perioral vermilion border repair.',
    landedCostAed: 15,
    wholesalePriceAed: 17.25,
    clinicPriceAed: 25,
    retailPriceAed: 35,
    stockStatus: 'In Stock (Dubai)'
  }
];

export default async function ColwayHairPricingPage() {
  let products = [...FALLBACK_COLWAY_HAIR_PRODUCTS];

  if (adminDb) {
    try {
      const ids = FALLBACK_COLWAY_HAIR_PRODUCTS.map(p => p.id);
      const snaps = await Promise.all(ids.map(id => adminDb.collection('products').doc(id).get()));

      const firestoreProducts = snaps.map((docSnap, index) => {
        const fallback = FALLBACK_COLWAY_HAIR_PRODUCTS[index];
        if (!docSnap.exists) return fallback;
        const d = docSnap.data();
        const pricingUae = d.pricing_uae || {};

        return {
          ...fallback,
          name: d.name || d.title || fallback.name,
          subtitle: d.subtitle || fallback.subtitle,
          sku: d.variants?.[0]?.sku || d.sku || fallback.sku,
          volume: d.volume || d.size || fallback.volume,
          presentation: d.presentation || fallback.presentation,
          category: d.category || fallback.category,
          keyActives: d.key_actives_summary || d.keyActives || fallback.keyActives,
          clinicalFocus: d.clinical_focus_dossier || d.clinicalFocus || fallback.clinicalFocus,
          landedCostAed: Number(d.landedCostAed ?? pricingUae.landedCostAed ?? d.cost ?? fallback.landedCostAed),
          wholesalePriceAed: Number(d.wholesalePriceAed ?? pricingUae.wholesalePriceAed ?? d.wholesale_price ?? fallback.wholesalePriceAed),
          clinicPriceAed: Number(d.clinicPriceAed ?? pricingUae.clinicPriceAed ?? fallback.clinicPriceAed),
          retailPriceAed: Number(d.retailPriceAed ?? pricingUae.retailPriceAed ?? d.price ?? fallback.retailPriceAed),
          image: d.heroImage || d.imageUrl || d.image || fallback.image,
          stockStatus: 'In Stock (Dubai Warehouse)'
        };
      });

      if (firestoreProducts.length > 0) {
        products = firestoreProducts;
      }
    } catch (e) {
      console.warn('Colway hair pricing page: Firestore read error, using fallback seed:', e.message);
    }
  }

  return (
    <ColwayPriceListClient
      initialProducts={products}
      initialCategory="Trichology & Scalp"
      isHairLineFocus={true}
    />
  );
}

