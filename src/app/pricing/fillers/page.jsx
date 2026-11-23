import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import FillersPriceListClient from './FillersPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'AED').toUpperCase();
  const validCurrency = ['AED', 'USD', 'EUR'].includes(currency) ? currency : 'AED';

  return buildBilingualMetadata({
    lang,
    path: '/pricing/fillers',
    siteName: 'Atlas Health Services',
    en: {
      title: `Aesthetic Injectables, Skin Boosters & Dermal Fillers • Official B2B Price Schedule (${validCurrency})`,
      description: `Official B2B price schedule for Skin Boosters, Dermal Fillers, Biostimulators, and Polynucleotides (PharmaMedic / Lorenzo) in ${validCurrency} with tiered wholesale (+15%) and clinic (+15% + 15%) pricing.`
    },
    es: {
      title: `Inyectables Estéticos, Skin Boosters y Fillers Dérmicos • Tarifa Oficial B2B (${validCurrency})`,
      description: `Tarifa oficial B2B de Skin Boosters, Fillers Dérmicos, Bioestimuladores y Polinucleótidos (PharmaMedic / Lorenzo) en ${validCurrency} con niveles mayorista (+15%) y clínica (+15% + 15%).`
    }
  });
}

function serializeDoc(doc) {
  const data = doc.data() || {};
  return {
    ...JSON.parse(JSON.stringify(data)),
    id: doc.id,
    slug: data.slug || doc.id
  };
}

export default async function FillersPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';
  const initialLang = normalizeMetaLang(resolvedSearch);

  let products = [];
  try {
    if (adminDb) {
      const snap = await adminDb
        .collection('products')
        .where('categoryId', '==', 'dermal-fillers')
        .limit(100)
        .get();

      if (!snap.empty) {
        products = snap.docs
          .map(serializeDoc)
          .filter((p) => p.status !== 'archived' && p.status !== 'hidden' && p.isActive !== false)
          .sort((a, b) => String(a.brand || a.name || '').localeCompare(String(b.brand || b.name || '')));
      }
    }
  } catch (err) {
    console.error('[FillersPricingPage] Firestore query error:', err);
  }

  if (products.length === 0) {
    const { getAestheticInjectablesCatalog } = await import('@/data/aestheticInjectablesRegistry');
    products = getAestheticInjectablesCatalog();
  }

  return (
    <FillersPriceListClient
      initialProducts={products}
      initialCurrency={initialCurrency}
      initialLang={initialLang}
    />
  );
}
