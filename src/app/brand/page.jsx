import React from 'react';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import BrandbookClient from './BrandbookClient';

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const lang = normalizeMetaLang(resolved);

  return buildBilingualMetadata({
    lang,
    topic: 'brand',
    path: '/brand',
    en: {
      title: 'Brandbook & Visual Identity — Atlas Health Services',
      description: 'Official Atlas Health Services Brand Guidelines: SVG vector logos, primary & secondary color palette (#003666 / #1A73E8), Inter & JetBrains Mono typography, UI standards, and downloadable A4 PDF.',
    },
    es: {
      title: 'Brandbook e Identidad Visual — Atlas Health Services',
      description: 'Manual de Marca oficial de Atlas Health Services: logos vectoriales SVG, paleta principal y secundaria (#003666 / #1A73E8), tipografía Inter y JetBrains Mono, sistema UI y PDF A4 descargable.',
    },
  });
}

export default async function BrandbookPage({ searchParams }) {
  const resolved = await searchParams;
  const initialLang = normalizeMetaLang(resolved);

  return <BrandbookClient initialLang={initialLang} />;
}
