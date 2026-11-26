import React from 'react';
import DoctorShowcaseClient from './DoctorShowcaseClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeMetaLang(sp);
  const rawClinic = String(sp?.clinic || sp?.doctor || '').trim().slice(0, 60);
  const rawCur = String(sp?.cur || sp?.currency || 'EUR').toUpperCase();
  const validCur = ['EUR', 'USD', 'AED'].includes(rawCur) ? rawCur : 'EUR';
  const suffix = rawClinic ? ` × ${rawClinic}` : '';

  return buildBilingualMetadata({
    lang,
    topic: 'doctors',
    currency: validCur,
    path: rawClinic
      ? `/partners/doctors?clinic=${encodeURIComponent(rawClinic)}`
      : '/partners/doctors',
    siteName: 'Atlas Health Services',
    en: {
      title: `Atlas Health Services${suffix} • Physician & Longevity Clinic Operating System`,
      description:
        'EU GMP hormone pellets, clinical peptides, pre-filled pens, genomics, interactive surgical & dosing guides, private patient QR refill reminders, and Atlas AI backed by PubMed.',
    },
    es: {
      title: `Atlas Health Services${suffix} • Plataforma Clínica para Médicos y Clínicas de Longevidad`,
      description:
        'Pellets hormonales EU GMP, péptidos clínicos, plumas precargadas, genómica, guías interactivas de implantación y dosificación, QR privado para pacientes y Atlas AI con respaldo PubMed.',
    },
  });
}

export default async function DoctorsPartnerPage({ searchParams }) {
  const sp = await searchParams;
  const initialLang = normalizeMetaLang(sp);
  const initialClinic = String(sp?.clinic || sp?.doctor || '').trim().slice(0, 60);
  const rawCur = String(sp?.cur || sp?.currency || 'EUR').toUpperCase();
  const initialCurrency = ['EUR', 'USD', 'AED'].includes(rawCur) ? rawCur : 'EUR';

  return (
    <DoctorShowcaseClient
      initialLang={initialLang}
      initialClinic={initialClinic}
      initialCurrency={initialCurrency}
    />
  );
}
