import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import { getAllPharmapolisPellets } from '@/data/pharmapolisPelletsRegistry';
import { toProductViewModel } from '@/utils/productViewModel';
import PelletsPriceListClient from './PelletsPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'USD').toUpperCase();
  const validCurrency = ['EUR', 'USD', 'AED'].includes(currency) ? currency : 'USD';
  const profile = String(resolvedSearch?.profile || '').toLowerCase();
  const isFemaleProfile = profile === 'female';
  const isMaleProfile = profile === 'male';

  return buildBilingualMetadata({
    lang,
    path: profile ? `/pricing/pellets?profile=${encodeURIComponent(profile)}` : '/pricing/pellets',
    siteName: 'Atlas Health Services',
    en: isFemaleProfile ? {
      title: `Female Bioidentical Hormone Pellets • Gynecology & Menopause Formulary (${validCurrency})`,
      description: `Pre-filtered EU GMP sterile hormone pellets for gynecology & female BHRT (17β-Estradiol, Bi-Est, Progesterone, female-dosed Testosterone) and 3.2 mm trocar kits in ${validCurrency}.`,
    } : isMaleProfile ? {
      title: `Male TRT Bioidentical Hormone Pellets • Andrology & Urology Formulary (${validCurrency})`,
      description: `Pre-filtered EU GMP sterile Testosterone and Testosterone + Anastrozole pellets for male TRT and 4.5 mm trocar kits in ${validCurrency}.`,
    } : {
      title: `Pharmapolis Bulgaria Subcutaneous Hormone Pellets & Trocar Kits • Official B2B Price Schedule (${validCurrency})`,
      description: `Official EU GMP subcutaneous bioidentical hormone pellets (17β-Estradiol, Testosterone) and surgical trocar implantation kits from Pharmapolis Compounding Pharmacy in ${validCurrency}. Zero-order sustained release kinetics, single-dose sterile blisters, and Pack ×10 institutional volume pricing.`,
    },
    es: isFemaleProfile ? {
      title: `Pellets Hormonales Bioidénticos Femeninos • Ginecología y Menopausia (${validCurrency})`,
      description: `Tarifa EU GMP prefiltrada para ginecología y THS femenina (17β-Estradiol, Bi-Est, Progesterona, Testosterona dosis femenina) y kits trócar 3.2 mm en ${validCurrency}.`,
    } : {
      title: `Pellets Hormonales Subcutáneos y Kits Trócar Pharmapolis • Tarifa Oficial B2B (${validCurrency})`,
      description: `Tarifa oficial EU GMP de pellets hormonales subcutáneos bioidénticos (17β-Estradiol, Testosterona) y kits quirúrgicos de trócar de Pharmapolis Compounding Pharmacy en ${validCurrency}. Liberación continua de orden cero, blísters estériles monodosis y ahorro institucional en Pack ×10.`,
    },
  });
}

// Complete items list including authoritative pellets + official insertion kits
const TROCAR_KITS = [
  {
    id: 'trocar-kit-3-2mm',
    slug: 'trocar-kit-3-2mm',
    sku: 'SKU-PHARM-TROC-32',
    name: 'Disposable Trocar Implantation Kit 3.2 mm',
    canonicalName: 'Surgical Sterile Disposable Trocar Kit 3.2 mm (Estradiol & Low-Dose Testosterone)',
    category: 'Trocar Kits',
    subcategory: 'Surgical Instruments',
    dosageForm: 'Sterile Single-Use Surgical Kit',
    hormoneType: 'instrument',
    strength: '3.2 mm cannula',
    targetGender: 'unisex',
    pricing: {
      costPriceEur: 29.50,
      price_eur: 39.01,
      wholesalePriceEur: 39.01,
      pack10PriceEur: 351.09,
      wholesalePriceAed: 155.73,
      retailPriceAed: 210.23,
      currency: 'EUR'
    },
    shortDescription: 'Sterile, single-use 3.2 mm surgical trocar kit designed for precise subdermal implantation of 17β-Estradiol pellets (12.5mg, 25mg) and female Testosterone pellets (50mg). Includes bevelled cannula, obturator with safety lock, scalpel #11, forceps, and sterile drape.',
    trocarSize: '3.2 mm',
    duration: 'Single Use Sterile',
    targetSerum: 'N/A (Surgical Kit)',
    itemNumber: 'TK-01'
  },
  {
    id: 'trocar-kit-4-5mm',
    slug: 'trocar-kit-4-5mm',
    sku: 'SKU-PHARM-TROC-45',
    name: 'Disposable Trocar Implantation Kit 4.5 mm',
    canonicalName: 'Surgical Sterile Disposable Trocar Kit 4.5 mm (High-Dose Testosterone & Multi-Pellet)',
    category: 'Trocar Kits',
    subcategory: 'Surgical Instruments',
    dosageForm: 'Sterile Single-Use Surgical Kit',
    hormoneType: 'instrument',
    strength: '4.5 mm cannula',
    targetGender: 'unisex',
    pricing: {
      costPriceEur: 34.50,
      price_eur: 45.63,
      wholesalePriceEur: 45.63,
      pack10PriceEur: 410.67,
      wholesalePriceAed: 182.16,
      retailPriceAed: 245.91,
      currency: 'EUR'
    },
    shortDescription: 'Sterile, single-use 4.5 mm surgical trocar kit optimized for multi-pellet subdermal insertion of high-dose Testosterone pellets (100mg) in male TRT and hormone optimization. Engineered with blunt obturator and graduated insertion sheath to minimize tissue trauma.',
    trocarSize: '4.5 mm',
    duration: 'Single Use Sterile',
    targetSerum: 'N/A (Surgical Kit)',
    itemNumber: 'TK-02'
  }
];

export default async function PelletsPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'USD';
  const initialLang = normalizeMetaLang(resolvedSearch);

  // Authoritative Pellets: Firestore Single Source of Truth (Golden Rule #1 & #2) with registry enrichment/fallback
  const staticPellets = getAllPharmapolisPellets();
  const staticByKey = new Map();
  for (const sp of staticPellets) {
    if (sp.slug) staticByKey.set(String(sp.slug).toLowerCase(), sp);
    if (sp.id) staticByKey.set(String(sp.id).toLowerCase(), sp);
    if (sp.sku) staticByKey.set(String(sp.sku).toLowerCase(), sp);
  }

  let mergedPellets = [];
  try {
    if (adminDb) {
      const snap = await adminDb
        .collection('products')
        .where('type', '==', 'pellet')
        .limit(100)
        .get();

      if (!snap.empty) {
        const seenSlugs = new Set();
        const firestorePellets = [];
        for (const doc of snap.docs) {
          const data = doc.data() || {};
          if (data.status === 'archived' || data.status === 'hidden') continue;
          const lookupSlug = String(data.slug || doc.id).toLowerCase();
          const lookupSku = String(data.sku || '').toLowerCase();
          const fallback = staticByKey.get(lookupSlug) || staticByKey.get(String(doc.id).toLowerCase()) || staticByKey.get(lookupSku) || {};

          const merged = {
            ...fallback,
            ...data,
            id: doc.id,
            slug: data.slug || fallback.slug || doc.id,
            pricing: {
              ...(fallback.pricing || {}),
              ...(data.pricing || {}),
            },
          };
          if (merged.slug) seenSlugs.add(String(merged.slug).toLowerCase());
          firestorePellets.push(merged);
        }

        // Preserve any non-archived static entries not yet seeded in Firestore
        const remainingStatic = staticPellets.filter(
          (sp) => !seenSlugs.has(String(sp.slug || sp.id || '').toLowerCase())
        );
        mergedPellets = [...firestorePellets, ...remainingStatic];
      }
    }
  } catch (err) {
    console.error('[PelletsPricingPage] Firestore pellet fetch fallback:', err);
  }

  if (mergedPellets.length === 0) {
    mergedPellets = staticPellets;
  }

  const pellets = JSON.parse(JSON.stringify(mergedPellets)).map((p, idx) => ({
    ...p,
    itemNumber: p.itemNumber || `PL-${String(idx + 1).padStart(2, '0')}`,
    trocarSize: p.trocarSize || (p.hormoneType === 'estrogen' ? '3.2 mm' : (p.strengthValue > 50 ? '4.5 mm' : '3.2 mm')),
    targetSerum: p.targetSerum || p.monitoring?.targetSerumWindow || (p.hormoneType === 'estrogen' ? '40 - 110 pg/mL' : '400 - 800 ng/dL'),
    duration: p.duration || p.galenicSpecs?.releaseDuration || '3.5 to 6 months'
  }));

  const allProducts = [...pellets, ...TROCAR_KITS].map((item) =>
    toProductViewModel(item, { tier: 'wholesale', targetCurrency: initialCurrency })
  );

  return (
    <PelletsPriceListClient
      initialProducts={allProducts}
      initialCurrency={initialCurrency}
      initialLang={initialLang}
    />
  );
}
