import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import ColwayPriceListClient from './ColwayPriceListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = 'Colway Medical & Cellular Derma • Official UAE Wholesale Price Schedule';
  const description = 'Official UAE B2B price list and landed cost breakdown for Colway native biologically active collagen, trichology hair strengthening systems, and cellular cosmeceuticals.';
  const ogImageUrl = `${appUrl}/images/products/colway/colway-trichology-banner.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${appUrl}/pricing/colway`,
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

const FALLBACK_COLWAY_PRODUCTS = [
  {
    id: 'colway-strengthening-shampoo',
    sku: 'SKU-COLWAY-STR-SHAMPOO-250',
    name: 'Colway Strengthening Hair Shampoo',
    subtitle: 'Follicular Ostium Cleanser & Microcirculation Activator',
    volume: '250 mL',
    presentation: 'Dispenser Pump Bottle',
    category: 'Trichology & Scalp',
    image: '/images/products/colway/shampoo.png',
    keyActives: 'Native Fish Tropocollagen, Caffeine, Niacinamide, Zinc PCA',
    clinicalFocus: 'Pre-transplant scalp optimization, follicular ostium cleansing, post-FUE maintenance (Day 10+).',
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-strengthening-conditioner',
    sku: 'SKU-COLWAY-STR-COND-200',
    name: 'Colway Strengthening Hair Conditioner',
    subtitle: 'Peribulbar Cuticle Sealer & Dermal Matrix Reinforcement',
    volume: '200 mL',
    presentation: 'Flexible Dispenser Tube',
    category: 'Trichology & Scalp',
    image: '/images/products/colway/conditioner.png',
    keyActives: 'Native Collagen, Hydrolyzed Keratin, D-Panthenol, Argan Oil',
    clinicalFocus: 'Cuticular barrier restoration, tensile strength enhancement (+24%), shock-loss mitigation.',
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-blue-diamond-cream',
    sku: 'SKU-COLWAY-BLUEDIAMOND-50',
    name: 'Colway Blue Diamond Cream (Krem Niebieski Diament)',
    subtitle: 'FGF-1 Recombinant Vector & Native Tropocollagen Cellular Emulsion',
    volume: '50 mL',
    presentation: 'Luxury Frosted Cosmetic Jar',
    category: 'Advanced Cellular Anti-Aging',
    image: '/images/products/colway/blue-diamond-cream.png',
    keyActives: 'sh-Polypeptide-1 (bFGF-1), Native Tropocollagen, Liposomal CoQ10, Ceramides NP/AP/EOP, Kinetin',
    clinicalFocus: 'Post-procedure barrier reconstruction (microneedling, laser, peels), deep dermal matrix redensification.',
    landedCostAed: 220,
    wholesalePriceAed: 253,
    clinicPriceAed: 320,
    retailPriceAed: 395,
    stockStatus: 'In Stock (Dubai)'
  },
  {
    id: 'colway-blue-diamond-peeling',
    sku: 'SKU-COLWAY-BLUEDIAMOND-PEELING-75',
    name: 'Colway Blue Diamond Peeling (Peeling Niebieski Diament)',
    subtitle: 'Diamond Powder Micro-Dermabrasion & Enzymatic Exfoliator',
    volume: '75 mL',
    presentation: 'Cosmetic Treatment Tube',
    category: 'Exfoliation & Cellular Renewal',
    image: '/images/products/colway/blue-diamond-peeling.png',
    keyActives: 'Natural Diamond Dust, Papain Enzymes, Native Collagen, Jojoba Esters',
    clinicalFocus: 'Non-abrasive stratum corneum polishing, transdermal permeability priming before peptide application.',
    landedCostAed: 115,
    wholesalePriceAed: 132.25,
    clinicPriceAed: 175,
    retailPriceAed: 220,
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
    keyActives: 'Native Collagen, Elastin, Shea Butter, Argan Oil, Carnauba Wax',
    clinicalFocus: 'Perioral vermilion border repair, severe cheilitis recovery, post-lip filler hydration and soothing.',
    landedCostAed: 15,
    wholesalePriceAed: 17.25,
    clinicPriceAed: 25,
    retailPriceAed: 35,
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
    clinicalFocus: 'Hypoallergenic facial and full-body preparation, sensitive and compromised post-procedure cutaneous hygiene.',
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 185,
    stockStatus: 'In Stock (Dubai)'
  }
];

export default async function ColwayPricingPage() {
  let products = [...FALLBACK_COLWAY_PRODUCTS];

  if (adminDb) {
    try {
      const ids = FALLBACK_COLWAY_PRODUCTS.map(p => p.id);
      const snaps = await Promise.all(ids.map(id => adminDb.collection('products').doc(id).get()));
      
      const firestoreProducts = snaps.map((docSnap, index) => {
        const fallback = FALLBACK_COLWAY_PRODUCTS[index];
        if (!docSnap.exists) return fallback;
        const d = docSnap.data();
        const pricingUae = d.pricing_uae || {};

        return {
          ...fallback,
          name: d.name || d.title || fallback.name,
          sku: d.variants?.[0]?.sku || fallback.sku,
          volume: d.volume || d.size || fallback.volume,
          category: d.category || fallback.category,
          landedCostAed: Number(pricingUae.landedCostAed ?? d.cost ?? fallback.landedCostAed),
          wholesalePriceAed: Number(pricingUae.wholesalePriceAed ?? d.wholesale_price ?? fallback.wholesalePriceAed),
          clinicPriceAed: Number(pricingUae.clinicPriceAed ?? d.clinicPriceAed ?? fallback.clinicPriceAed),
          retailPriceAed: Number(pricingUae.retailPriceAed ?? d.price ?? fallback.retailPriceAed),
          image: d.heroImage || d.imageUrl || d.image || fallback.image,
          stockStatus: 'In Stock (Dubai Warehouse)'
        };
      });

      if (firestoreProducts.length > 0) {
        products = firestoreProducts;
      }
    } catch (e) {
      console.warn('Colway pricing page: Firestore read error, using fallback seed:', e.message);
    }
  }

  return <ColwayPriceListClient initialProducts={products} />;
}
