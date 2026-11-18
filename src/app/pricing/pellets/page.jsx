import React from 'react';
import { getAllPharmapolisPellets } from '@/data/pharmapolisPelletsRegistry';
import PelletsPriceListClient from './PelletsPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'EUR').toUpperCase();
  const validCurrency = ['EUR', 'USD', 'AED'].includes(currency) ? currency : 'EUR';

  return buildBilingualMetadata({
    lang,
    path: '/pricing/pellets',
    siteName: 'Atlas Health Services',
    en: {
      title: `Pharmapolis Bulgaria Subcutaneous Hormone Pellets & Trocar Kits • Official B2B Price Schedule (${validCurrency})`,
      description: `Official EU GMP subcutaneous bioidentical hormone pellets (17β-Estradiol, Testosterone) and surgical trocar implantation kits from Pharmapolis Compounding Pharmacy in ${validCurrency}. Zero-order sustained release kinetics, single-dose sterile blisters, and Pack ×10 institutional volume pricing.`,
    },
    es: {
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
      price_eur: 29.50,
      wholesalePriceAed: 135.25,
      retailPriceAed: 182.00,
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
      price_eur: 34.50,
      wholesalePriceAed: 158.00,
      retailPriceAed: 212.00,
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
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';
  const initialLang = normalizeMetaLang(resolvedSearch);

  // Authoritative Pellets from Registry
  const pellets = getAllPharmapolisPellets().map((p, idx) => ({
    ...p,
    itemNumber: `PL-0${idx + 1}`,
    trocarSize: p.hormoneType === 'estrogen' ? '3.2 mm' : p.strengthValue > 50 ? '4.5 mm' : '3.2 mm',
    targetSerum: p.monitoring?.targetSerumWindow || (p.hormoneType === 'estrogen' ? '40 - 110 pg/mL' : '400 - 800 ng/dL'),
    duration: p.galenicSpecs?.releaseDuration || '3.5 to 6 months'
  }));

  const allProducts = [...pellets, ...TROCAR_KITS];

  return (
    <PelletsPriceListClient
      initialProducts={allProducts}
      initialCurrency={initialCurrency}
      initialLang={initialLang}
    />
  );
}
