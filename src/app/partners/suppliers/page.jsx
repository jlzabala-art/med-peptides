import React from 'react';
import SupplierShowcaseClient from './SupplierShowcaseClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeMetaLang(sp);
  const rawPartner = String(sp?.partner || '').trim().slice(0, 60);
  const rawCur = String(sp?.cur || sp?.currency || 'EUR').toUpperCase();
  const validCur = ['EUR', 'USD', 'AED'].includes(rawCur) ? rawCur : 'EUR';

  const partnerSuffixEn = rawPartner ? ` × ${rawPartner}` : '';
  const partnerSuffixEs = rawPartner ? ` × ${rawPartner}` : '';

  return buildBilingualMetadata({
    lang,
    topic: 'suppliers',
    currency: validCur,
    path: rawPartner
      ? `/partners/suppliers?partner=${encodeURIComponent(rawPartner)}`
      : '/partners/suppliers',
    siteName: 'Atlas Health Services',
    en: {
      title: `Atlas Health Services${partnerSuffixEn} • European & GCC Clinical Distribution Partner Hub`,
      description:
        'Scale your pharmaceutical, BHRT, peptide, aesthetic, or diagnostic line across Europe and UAE/GCC with consolidated B2B POs, EU GMP & MOH traceability, role-gated pricing, and 72-hour onboarding.',
    },
    es: {
      title: `Atlas Health Services${partnerSuffixEs} • Plataforma de Distribución Clínica B2B (Europa y GCC)`,
      description:
        'Escala tu línea farmacéutica, BHRT, péptidos, estética o diagnóstico en Europa y EAU/GCC con POs consolidadas, trazabilidad EU GMP / MOH, protección de canal y onboarding en 72 horas.',
    },
  });
}

export default async function SuppliersPartnerPage({ searchParams }) {
  const sp = await searchParams;
  const initialLang = normalizeMetaLang(sp);
  const initialPartner = String(sp?.partner || '').trim().slice(0, 60);
  const rawCur = String(sp?.cur || sp?.currency || 'EUR').toUpperCase();
  const initialCurrency = ['EUR', 'USD', 'AED'].includes(rawCur) ? rawCur : 'EUR';

  return (
    <SupplierShowcaseClient
      initialLang={initialLang}
      initialPartner={initialPartner}
      initialCurrency={initialCurrency}
    />
  );
}
