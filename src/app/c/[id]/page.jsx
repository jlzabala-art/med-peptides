import React from 'react';
import SharedCatalogPage, { generateMetadata as sharedGenerateMetadata } from '@/app/shared/catalog/[token]/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * OpenGraph Metadata for WhatsApp & Social Unfurling
 * Uses lightweight (<180KB) og-catalog.png with crisp Atlas Services institutional branding.
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return sharedGenerateMetadata({ params: { token: resolvedParams?.id } });
}

/**
 * Short URL Entry Point: https://med-peptides.com/c/[id]
 * Renders the full verified shared catalog matching the short catalogId (e.g. CAT-MU19I0CO).
 */
export default async function ShortCatalogRoute({ params }) {
  const resolvedParams = await params;
  return <SharedCatalogPage params={{ token: resolvedParams?.id }} />;
}
