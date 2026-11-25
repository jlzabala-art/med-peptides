import React from 'react';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import { ADVANCED_MEDICAL_EQUIPMENT_SUPPLIER } from '@/data/advancedMedicalEquipmentData';
import ImportPartnerClient from './ImportPartnerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const lang = normalizeMetaLang(resolved);

  return buildBilingualMetadata({
    lang,
    path: '/import-partner',
    siteName: 'Atlas Health Services',
    en: {
      title: 'Atlas Health Services × UAE Import & Medical Warehouse Partner Dossier',
      description:
        'Official supplier & manufacturer onboarding dossier for Atlas Health Services and our designated UAE import partner Advanced Medical Equipment LLC (EDE #60779 · RAK DED #58057).',
    },
    es: {
      title: 'Atlas Health Services × Dossier de Partner de Importación y Almacén Médico en EAU',
      description:
        'Dossier oficial para fabricantes y proveedores de Atlas Health Services y nuestro partner habitual de importación en Emiratos Árabes Unidos: Advanced Medical Equipment LLC (EDE #60779 · RAK DED #58057).',
    },
  });
}

export default async function ImportPartnerPage({ searchParams }) {
  const resolved = await searchParams;
  const initialLang = normalizeMetaLang(resolved);

  return (
    <ImportPartnerClient
      partner={ADVANCED_MEDICAL_EQUIPMENT_SUPPLIER}
      initialLang={initialLang}
    />
  );
}
