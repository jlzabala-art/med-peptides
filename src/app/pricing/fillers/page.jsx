import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import FillersPriceListClient from './FillersPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import { buildPricingPageJsonLd } from '@/lib/seoPricingJsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'EUR').toUpperCase();
  const validCurrency = ['AED', 'USD', 'EUR'].includes(currency) ? currency : 'EUR';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

  return buildBilingualMetadata({
    lang,
    topic: 'fillers',
    currency: validCurrency,
    path: '/pricing/fillers',
    siteName: 'Atlas Health Services',
    en: {
      title: `Dermal Fillers & Skin Boosters • Wholeseller B2B Catalog (${validCurrency})`,
      description: `Direct Wholeseller pricing for 40 CE-marked originals across 8 leading brands (Juvéderm, Restylane, Belotero, Profhilo, Sculptra, Radiesse, PhilArt, Aqualyx). Local stock in Dubai · Fast dispatch & live PDF.`
    },
    es: {
      title: `Fillers Dérmicos y Skin Boosters • Tarifa Wholeseller B2B (${validCurrency})`,
      description: `Precios directos Wholeseller en 40 referencias originales con marcado CE de 8 marcas líderes (Juvéderm, Restylane, Belotero, Profhilo, Sculptra, Radiesse, PhilArt, Aqualyx). Stock local en Dubái · Envío rápido y PDF.`
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

  const jsonLd = buildPricingPageJsonLd({
    path: '/pricing/fillers',
    name: 'Dermal Fillers & Skin Boosters • Wholeseller B2B Catalog',
    description: 'Direct B2B pricing for 40 CE-marked original aesthetic injectables across Juvéderm, Restylane, Belotero, Profhilo, Sculptra, Radiesse, PhilArt, and Aqualyx.',
    currency: initialCurrency,
    category: 'Dermal Fillers & Aesthetic Injectables',
    products,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FillersPriceListClient
        initialProducts={products}
        initialCurrency={initialCurrency}
        initialLang={initialLang}
      />
    </>
  );
}
