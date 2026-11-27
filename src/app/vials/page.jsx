import React from 'react';
import { redirect } from 'next/navigation';
import { fetchCollectionProductsAction, trackReferralVisitAction } from '@/actions/vialsCatalogActions';
import { SUPPORTED_COLLECTIONS } from '@/constants/supportedCollections';
import VialsCatalogClient from './VialsCatalogClient';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';
import { buildPricingPageJsonLd } from '@/lib/seoPricingJsonLd';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * OpenGraph Metadata for WhatsApp & Social Preview
 * Supports all clinical collections with strict white-label protection.
 */
export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCollection = String(resolvedSearch?.collection || resolvedSearch?.c || 'vials').toLowerCase();
  const collectionKey = rawCollection === 'ultraperson' ? 'ultraman' : (SUPPORTED_COLLECTIONS[rawCollection] ? rawCollection : 'vials');
  const colMeta = SUPPORTED_COLLECTIONS[collectionKey] || SUPPORTED_COLLECTIONS.vials;
  const isPatientView = String(resolvedSearch?.view || '').toLowerCase() === 'patient';
  const specialtyKey = String(resolvedSearch?.specialty || '').toLowerCase();
  const SPECIALTY_META = {
    gynecology: {
      title: "Gynecology & Women's Health Peptide Formulary",
      description: 'Pre-filtered clinical peptide vials for gynecology, reproductive endocrinology, sexual wellness, and post-surgical tissue repair.',
    },
    dermatology: {
      title: 'Dermatology & Trichology Peptide Formulary',
      description: 'Pre-filtered clinical peptide vials for dermal regeneration, collagen synthesis, and follicular restoration.',
    },
    longevity: {
      title: 'Longevity & Cellular Medicine Peptide Formulary',
      description: 'Pre-filtered clinical peptide vials for mitochondrial support, telomere health, and cellular longevity.',
    },
    metabolic: {
      title: 'Metabolic & Endocrinology Peptide Formulary',
      description: 'Pre-filtered clinical peptide vials for GLP-1/GIP metabolic care, insulin sensitivity, and body composition.',
    },
    urology: {
      title: 'Urology & Andrology Peptide Formulary',
      description: 'Pre-filtered clinical peptide vials for neuroendocrine reproductive signaling, vascularity, and tissue recovery.',
    },
  };
  const specMeta = SPECIALTY_META[specialtyKey] || null;
  const lang = normalizeMetaLang(resolvedSearch);
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || 'USD').toUpperCase();
  const validCur = ['EUR', 'USD', 'AED'].includes(rawCur) ? rawCur : 'USD';
  const ogTopic = collectionKey === 'bloodo' ? 'bloodo' : collectionKey === 'colway' ? 'colway' : 'peptides';

  if (isPatientView) {
    return buildBilingualMetadata({
      lang,
      topic: ogTopic,
      path: `/vials?collection=${collectionKey}&view=patient`,
      siteName: 'Atlas Health Services',
      en: {
        title: `${colMeta.name || 'Peptide'} Patient Guide Directory • Reconstitution & Care`,
        description: 'Patient-friendly peptide reconstitution, storage, and administration reference guides.',
      },
      es: {
        title: `Guía para Pacientes (${colMeta.name || 'Péptidos'}) • Reconstitución y Uso`,
        description: 'Guías clínicas paso a paso para pacientes: reconstitución, conservación y administración segura.',
      },
    });
  }

  const resolvedTitleEn = specMeta
    ? `${specMeta.title} • Physician & Clinic Direct Supply (${validCur})`
    : `${colMeta.title} • Physician & Clinic Direct Supply (${validCur})`;
  const resolvedDescEn = specMeta
    ? specMeta.description
    : `${colMeta.description} Direct institutional terms, verified batch quality & expedited dispatch.`;
  const resolvedPath = specMeta
    ? `/vials?specialty=${encodeURIComponent(specialtyKey)}`
    : `/vials?collection=${collectionKey}`;

  return buildBilingualMetadata({
    lang,
    topic: ogTopic,
    currency: validCur,
    path: resolvedPath,
    siteName: 'Atlas Health Services',
    en: {
      title: resolvedTitleEn,
      description: resolvedDescEn,
    },
    es: {
      title: `${colMeta.title} • Catálogo Clínico B2B y Suministro Directo (${validCur})`,
      description: `Catálogo clínico oficial en ${validCur}: viales liofilizados estériles ≥99,0% HPLC, calidad de lote verificada y envío ágil para clínicas y médicos.`,
    },
  });
}

/**
 * Server Component (RSC) for Universal Public Collection Catalog
 * Implements Golden Rule #21 (Promote read-only / prefetch modules to RSC).
 */
export default async function VialsPublicPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCollection = String(resolvedSearch?.collection || resolvedSearch?.c || 'vials').toLowerCase();
  const collection = rawCollection === 'ultraperson' ? 'ultraman' : (SUPPORTED_COLLECTIONS[rawCollection] ? rawCollection : 'vials');
  const isPatientView = String(resolvedSearch?.view || '').toLowerCase() === 'patient';

  // Consolidate B2B price schedule routes into their canonical GCP UX pricing pages
  // while preserving /vials?view=patient (patient reconstitution guides) and collections without dedicated pricing pages.
  if (!isPatientView && (collection === 'vials' || collection === 'bloodo' || collection === 'colway')) {
    const forward = new URLSearchParams();
    const passThroughKeys = ['specialty', 'ref', 'referral', 'code', 'lang', 'dest', 'region', 'q', 'tc', 'track', 'sid', 'margin', 'tier'];
    for (const k of passThroughKeys) {
      if (resolvedSearch?.[k]) forward.set(k, String(resolvedSearch[k]));
    }
    const rawCurParam = resolvedSearch?.currency || resolvedSearch?.cur || resolvedSearch?.curr;
    if (rawCurParam) forward.set('currency', String(rawCurParam).toUpperCase());
    const qs = forward.toString() ? `?${forward.toString()}` : '';
    const targetPath = collection === 'bloodo' ? '/pricing/bloodo' : collection === 'colway' ? '/pricing/colway' : '/pricing/peptides';
    redirect(`${targetPath}${qs}`);
  }

  const initialLang = normalizeMetaLang(resolvedSearch);
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || 'USD').toUpperCase();
  const initialCurrency = ['EUR', 'USD', 'AED'].includes(rawCur) ? rawCur : 'USD';
  
  const rawRef = resolvedSearch?.ref || resolvedSearch?.referral || null;
  const isPartnerAlias = !rawRef || ['np-labs-international', 'nikolaos-psathas', 'nplabs', 'nplab', 'cat-rx-7482', 'nikolas', 'partner-7482'].includes(String(rawRef).toLowerCase());
  const code = resolvedSearch?.code || (isPartnerAlias ? 'CAT-RX-7482' : rawRef);

  // Track referral visit asynchronously on server (never expose wholesaler identity to the client)
  if (collection === 'vials' || rawRef) {
    trackReferralVisitAction({
      wholesalerId: isPartnerAlias ? 'np-labs-international' : rawRef,
      referralCode: code,
      collection
    }).catch(() => {});
  }

  // Pre-fetch collection products directly on server and strip supplier leaks for non-admins
  const isAdmin = await isAdminServerSession();
  const rawProducts = await fetchCollectionProductsAction(collection, code);
  const initialProducts = Array.isArray(rawProducts)
    ? rawProducts.map((p) => sanitizePublicProductForViewer(p, { isAdmin }))
    : [];

  // Pass ONLY opaque reference code to the client — zero mention of wholesaler or supplier names
  const referralInfo = {
    referralCode: code,
    collection
  };

  const jsonLd = buildPricingPageJsonLd({
    path: '/vials',
    name: 'Clinical Peptide Vials & Specialty Formularies',
    description: 'Specialty-filtered clinical peptide vials for longevity, gynecology, dermatology, metabolic endocrinology, and urology clinics.',
    currency: initialCurrency,
    category: 'Clinical Peptide Vials',
    products: initialProducts,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VialsCatalogClient
        initialVials={initialProducts}
        initialCollection={collection}
        initialLang={initialLang}
        initialCurrency={initialCurrency}
        referralInfo={referralInfo}
        isPatientView={isPatientView}
      />
    </>
  );
}
