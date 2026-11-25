import React from 'react';
import dnLabCatalog from '@/data/dnLabPensCatalog.json';
import DnLabPensPriceListClient from '@/app/pricing/dnlab-pens/DnLabPensPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'USD').toUpperCase();
  const validCurrency = ['EUR', 'USD', 'AED'].includes(currency) ? currency : 'USD';

  return buildBilingualMetadata({
    lang,
    path: '/pricing/pens',
    siteName: 'Atlas Health Services',
    en: {
      title: `Pre-filled Multi-Dose Peptide Pens Portfolio • Clinical Dosing & Protocols (${validCurrency})`,
      description: `Official Atlas Health Services B2B portfolio for pre-filled 3 mL multi-dose peptide pens in ${validCurrency}. Complete click-dial dosing protocols, HPLC ≥99.2% purity, cold-chain standards, and direct clinic ordering.`,
    },
    es: {
      title: `Catálogo Oficial de Plumas Precargadas de Péptidos • Dosificación y Protocolos (${validCurrency})`,
      description: `Catálogo oficial B2B de Atlas Health Services para plumas precargadas multidosis de 3 mL en ${validCurrency}. Protocolos de dosificación por clics, pureza HPLC ≥99.2%, cadena de frío y solicitud directa para clínicas.`,
    },
  });
}

export default async function AtlasPensPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'USD').toUpperCase();
  const validCurrency = ['EUR', 'USD', 'AED'].includes(currency) ? currency : 'USD';

  const isAdmin = await isAdminServerSession();
  const sanitizedPens = Array.isArray(dnLabCatalog)
    ? dnLabCatalog.map((p) => sanitizePublicProductForViewer(p, { isAdmin }))
    : [];

  return (
    <DnLabPensPriceListClient
      initialProducts={sanitizedPens}
      initialCurrency={validCurrency}
      initialLang={lang}
    />
  );
}
