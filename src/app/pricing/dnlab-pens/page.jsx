import React from 'react';
import dnLabCatalog from '@/data/dnLabPensCatalog.json';
import DnLabPensClient from './DnLabPensClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'USD').toUpperCase();
  const validCurrency = ['EUR', 'USD', 'AED'].includes(currency) ? currency : 'USD';

  return buildBilingualMetadata({
    lang,
    path: '/pricing/dnlab-pens',
    siteName: 'Atlas Health Services',
    en: {
      title: `DN LAB Pre-filled Peptide Pens Official Portfolio • Dosing & Protocols (${validCurrency})`,
      description: `Official B2B portfolio for DN LAB (UAE Peptides) pre-filled multi-dose peptide pens in ${validCurrency}. Complete clinical dosing protocols, dial click-to-mcg equivalences, cold-chain stability, and direct clinic ordering.`,
    },
    es: {
      title: `Catálogo Oficial de Plumas Precargadas DN LAB • Dosificación y Protocolos (${validCurrency})`,
      description: `Catálogo oficial B2B de plumas precargadas de péptidos DN LAB (UAE Peptides) en ${validCurrency}. Protocolos de dosificación clínica, equivalencias de clics a microgramos, estabilidad en cadena de frío y prescripción para clínicas.`,
    },
  });
}

export default async function DnLabPensPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = String(resolvedSearch?.cur || resolvedSearch?.currency || 'USD').toUpperCase();
  const validCurrency = ['EUR', 'USD', 'AED'].includes(currency) ? currency : 'USD';

  return (
    <DnLabPensClient
      initialProducts={dnLabCatalog}
      initialCurrency={validCurrency}
      initialLang={lang}
    />
  );
}
