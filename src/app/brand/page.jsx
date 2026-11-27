import React from 'react';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import BrandbookClient from './BrandbookClient';

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const lang = normalizeMetaLang(resolved);
  const partner = typeof resolved?.partner === 'string' ? resolved.partner.trim().slice(0, 40) : '';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const ogImages = partner
    ? [
        {
          url: `${baseUrl}/api/og?topic=brand&lang=${lang}&partner=${encodeURIComponent(partner)}`,
          width: 1200,
          height: 630,
          alt: `${partner} × Atlas Health Services Brandbook`,
        },
      ]
    : undefined;

  return buildBilingualMetadata({
    lang,
    topic: 'brand',
    path: partner ? `/brand?partner=${encodeURIComponent(partner)}` : '/brand',
    images: ogImages,
    en: {
      title: partner
        ? `${partner} × Atlas Health Services — Official Brandbook & SVG Kit`
        : 'Brandbook & Visual Identity — Atlas Health Services',
      description: 'Official Atlas Health Services Brand Guidelines: SVG vector logos, primary & secondary color palette (#003666 / #1A73E8, RGB/CMYK/Pantone), Inter & JetBrains Mono typography, 1-click ZIP Brand Kit, and A4 PDF.',
    },
    es: {
      title: partner
        ? `${partner} × Atlas Health Services — Brandbook Oficial y Kit SVG`
        : 'Brandbook e Identidad Visual — Atlas Health Services',
      description: 'Manual de Marca oficial de Atlas Health Services: logos vectoriales SVG, paleta principal y secundaria (#003666 / #1A73E8, RGB/CMYK/Pantone), tipografía Inter y JetBrains Mono, descarga de Kit ZIP y PDF A4.',
    },
  });
}

export default async function BrandbookPage({ searchParams }) {
  const resolved = await searchParams;
  const initialLang = normalizeMetaLang(resolved);
  const partner = typeof resolved?.partner === 'string' ? resolved.partner.trim().slice(0, 40) : '';

  return <BrandbookClient initialLang={initialLang} partnerName={partner} />;
}
