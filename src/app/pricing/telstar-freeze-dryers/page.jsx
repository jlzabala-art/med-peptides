import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';
import { FX_RATES_FROM_EUR } from '@/constants/fxRates';
import { TELSTAR_SUPPLIER, getAllTelstarEquipment } from '@/data/telstarLyophilizersRegistry';
import TelstarPriceListClient from './TelstarPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const lang = normalizeMetaLang(resolved);

  return buildBilingualMetadata({
    lang,
    topic: 'telstar-freeze-dryers',
    currency: 'EUR',
    path: '/pricing/telstar-freeze-dryers',
    siteName: 'Atlas Health Services',
    en: {
      title: 'Telstar (Syntegon) Laboratory & GMP Freeze Dryers • 2027 Price Schedule',
      description: 'Official 2027 Telstar LyoQuest, LyoAlfa, and LyoBeta laboratory & pilot GMP freeze dryers B2B price schedule (FCA Terrassa, EUR/USD/AED).',
    },
    es: {
      title: 'Liofilizadores Telstar (Syntegon) Laboratorio y GMP • Tarifa 2027',
      description: 'Tarifa oficial B2B 2027 de liofilizadores Telstar LyoQuest, LyoAlfa y LyoBeta para laboratorio y planta piloto GMP (FCA Terrassa).',
    },
  });
}

function toScheduleRow(doc) {
  const listEur = Number(doc.listPriceEur || doc.pricing?.retail?.perUnit || 0);
  const netEur = Number(doc.costPriceEur || doc.cost || Number((listEur * 0.7).toFixed(2)));
  const landedAed = Number((netEur * FX_RATES_FROM_EUR.AED).toFixed(2));
  const specs = doc.equipmentSpecs || {};

  return {
    id: doc.id,
    slug: doc.slug || doc.id,
    sku: doc.sku || doc.id.toUpperCase(),
    name: doc.name,
    subtitle: `${specs.condenserTempC ?? -85} °C · ${specs.shelves || 'Modular'} · ${specs.coolingType || 'Air cooled'}`,
    category: specs.series || doc.subcategory || 'LYOQUEST',
    volume: `${specs.condenserTempC ?? -85}°C`,
    presentation: `${specs.shelfAreaM2 || 0.26} m² · ${specs.incoterm || 'FCA Terrassa'}`,
    keyActives: specs.condenserSpec || doc.shortDesc,
    clinicalFocus: doc.description || doc.shortDesc,
    supplierId: TELSTAR_SUPPLIER.id,
    landedCostAed: landedAed,
    distributorPriceAed: Number((landedAed * 1.15).toFixed(2)),
    wholesalePriceAed: Number((landedAed * 1.3225).toFixed(2)),
    clinicPriceAed: Number((listEur * 0.92 * FX_RATES_FROM_EUR.AED).toFixed(2)),
    retailPriceAed: Number((listEur * FX_RATES_FROM_EUR.AED).toFixed(2)),
    stockStatus: `Lead time ~${specs.leadTimeWeeks || 4}w (${specs.incoterm || 'FCA Terrassa'})`,
  };
}

export default async function TelstarPricingPage({ searchParams }) {
  const resolved = await searchParams;
  const rawCur = String(resolved?.cur || resolved?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'USD', 'AED'].includes(rawCur) ? rawCur : 'EUR';
  const initialCategory = resolved?.category || 'all';
  const isAdmin = await isAdminServerSession();

  let docs = [];
  try {
    if (adminDb) {
      const snap = await adminDb
        .collection('products')
        .where('collectionSlug', '==', 'telstar-lyophilizers')
        .limit(50)
        .get();
      if (!snap.empty) {
        docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    }
  } catch {
    docs = [];
  }

  if (docs.length === 0) {
    docs = getAllTelstarEquipment();
  }

  const rows = docs
    .map(toScheduleRow)
    .map((r) => sanitizePublicProductForViewer(r, { isAdmin }))
    .sort((a, b) => (a.retailPriceAed || 0) - (b.retailPriceAed || 0));

  return (
    <TelstarPriceListClient
      initialProducts={rows}
      initialCategory={initialCategory}
      initialCurrency={initialCurrency}
    />
  );
}
