import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import { sanitizeForClient } from '@/utils/sanitizeForClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import BloodoPriceListClient from './BloodoPriceListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BLOODO_IDS = new Set([
  'bloodo-nad-level-test',
  'testosterone-test',
  'cortisol-test',
  'omega-ratio-test',
  'hemoglobin-a1c-hba1c-test',
  'vitamin-d-test',
]);

const BLOODO_ORDER = [
  'bloodo-nad-level-test',
  'testosterone-test',
  'cortisol-test',
  'omega-ratio-test',
  'hemoglobin-a1c-hba1c-test',
  'vitamin-d-test',
];

const BLOODO_ENRICHMENT = {
  'bloodo-nad-level-test': {
    sku: 'BLD-NAD-01',
    category: 'bioenergetics',
    biomarker: 'Intracellular NAD+ / NADH',
    methodology: 'LC-MS/MS Capillary DBS',
    turnaround: '48–72h',
    slug: 'bloodo-nad-level-test',
    wholesalePriceEur: 263.18,
    clinicPriceEur: 288.55,
    retailPriceEur: 298.50,
  },
  'testosterone-test': {
    sku: 'BLD-TST-02',
    category: 'endocrine',
    biomarker: 'Total & Free Testosterone Index',
    methodology: 'LC-MS/MS Capillary DBS',
    turnaround: '48–72h',
    slug: 'testosterone-test',
    wholesalePriceEur: 65.46,
    clinicPriceEur: 74.25,
    retailPriceEur: 99.00,
  },
  'cortisol-test': {
    sku: 'BLD-COR-03',
    category: 'endocrine',
    biomarker: 'Diurnal Cortisol CAR (4-Point)',
    methodology: 'LC-MS/MS Capillary DBS',
    turnaround: '48–72h',
    slug: 'cortisol-test',
    wholesalePriceEur: 52.24,
    clinicPriceEur: 59.25,
    retailPriceEur: 79.00,
  },
  'omega-ratio-test': {
    sku: 'BLD-OMG-04',
    category: 'lipidomics',
    biomarker: 'Omega-3 Index & AA/EPA Ratio',
    methodology: 'GC-MS Fatty Acid Profiling',
    turnaround: '48–72h',
    slug: 'omega-ratio-test',
    wholesalePriceEur: 52.24,
    clinicPriceEur: 59.25,
    retailPriceEur: 79.00,
  },
  'hemoglobin-a1c-hba1c-test': {
    sku: 'BLD-HBA-05',
    category: 'metabolic',
    biomarker: 'HbA1c (90-Day Glycation)',
    methodology: 'HPLC Capillary DBS',
    turnaround: '48–72h',
    slug: 'hemoglobin-a1c-hba1c-test',
    wholesalePriceEur: 39.01,
    clinicPriceEur: 44.25,
    retailPriceEur: 59.00,
  },
  'vitamin-d-test': {
    sku: 'BLD-VTD-06',
    category: 'micronutrients',
    biomarker: '25-OH Vitamin D2 & D3',
    methodology: 'LC-MS/MS Capillary DBS',
    turnaround: '48–72h',
    slug: 'vitamin-d-test',
    wholesalePriceEur: 39.01,
    clinicPriceEur: 44.25,
    retailPriceEur: 59.00,
  },
};

export async function generateMetadata({ searchParams }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const rawCurrency = String(resolvedSearch?.currency || 'EUR').toUpperCase();
  const currency = ['EUR', 'USD', 'AED'].includes(rawCurrency) ? rawCurrency : 'EUR';

  return buildBilingualMetadata({
    lang,
    path: '/pricing/bloodo',
    siteName: 'Atlas Health Services',
    images: [
      {
        url: `${appUrl}/images/products/bloodo/nad.jpg`,
        width: 1200,
        height: 630,
        alt: 'Bloodo™ Capillary Diagnostics B2B Price Schedule',
      },
    ],
    en: {
      title: `Bloodo™ Capillary Blood Diagnostics • Official B2B Price Schedule (${currency})`,
      description:
        'Official B2B wholesale price schedule (15% + 15%) for Bloodo™ CE-IVDR Dried Blood Spot (DBS) test kits: NAD+ Intracellular, Testosterone+, Diurnal Cortisol, HbA1c, Omega-3/6 & Vitamin D3.',
    },
    es: {
      title: `Bloodo™ Diagnóstico Capilar en Sangre • Tarifa Oficial B2B (${currency})`,
      description:
        'Tarifa oficial mayorista B2B (15% + 15%) para los kits diagnósticos Bloodo™ CE-IVDR en sangre capilar (DBS): NAD+ Intracelular, Testosterona+, Cortisol Diurno, HbA1c, Omega-3/6 y Vitamina D3.',
    },
  });
}

export default async function BloodoPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const rawCurrency = String(resolvedSearch?.currency || 'EUR').toUpperCase();
  const initialCurrency = ['EUR', 'USD', 'AED'].includes(rawCurrency) ? rawCurrency : 'EUR';

  let products = [];
  if (adminDb) {
    try {
      const snap = await adminDb.collection('products').get();
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        if (BLOODO_IDS.has(id) || String(data?.name || '').toLowerCase().includes('bloodo')) {
          const meta = BLOODO_ENRICHMENT[id] || {};
          const wholesaleEur = Number(data?.wholesalePrice ?? data?.pricing?.wholesale ?? meta.wholesalePriceEur ?? 0);
          const clinicEur = Number(data?.clinicPrice ?? data?.pricing?.clinic ?? meta.clinicPriceEur ?? 0);
          const retailEur = Number(data?.pricing?.retail ?? meta.retailPriceEur ?? 0);
          products.push({
            id,
            sku: data?.sku || meta.sku || id.toUpperCase(),
            name: data?.name || id,
            nameEs: data?.nameEs || data?.name || id,
            description: data?.description || '',
            descriptionEs: data?.descriptionEs || data?.description || '',
            category: meta.category || 'diagnostics',
            biomarker: meta.biomarker || data?.biomarker || 'Capillary Biomarker',
            methodology: meta.methodology || 'ISO 15189 Capillary DBS',
            turnaround: meta.turnaround || '48–72h',
            slug: data?.slug || meta.slug || id,
            wholesalePriceEur: wholesaleEur,
            clinicPriceEur: clinicEur,
            retailPriceEur: retailEur,
            image: data?.image || `/images/products/bloodo/${id.includes('nad') ? 'nad' : id.includes('testosterone') ? 'testosterone' : id.includes('cortisol') ? 'cortisol' : id.includes('omega') ? 'omega' : id.includes('hba1c') ? 'hba1c' : 'vitamin-d'}.jpg`,
          });
        }
      });
    } catch (err) {
      console.error('[BloodoPricingPage] Firestore fetch error:', err);
    }
  }

  products.sort((a, b) => {
    const ia = BLOODO_ORDER.indexOf(a.id);
    const ib = BLOODO_ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <BloodoPriceListClient
      initialProducts={sanitizeForClient(products)}
      initialLang={lang}
      initialCurrency={initialCurrency}
    />
  );
}
