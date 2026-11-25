import React from 'react';
import { fetchCollectionProductsAction, trackReferralVisitAction } from '@/actions/vialsCatalogActions';
import { SUPPORTED_COLLECTIONS } from '@/constants/supportedCollections';
import VialsCatalogClient from './VialsCatalogClient';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

  if (isPatientView) {
    return {
      title: `${colMeta.name || 'Peptide'} Patient Guide Directory • Reconstitution & Care`,
      description: 'Patient-friendly peptide reconstitution, storage, and administration reference guides.',
      openGraph: {
        title: `${colMeta.name || 'Peptide'} Patient Guide Directory`,
        description: 'Patient-friendly peptide reconstitution, storage, and administration reference guides.',
        type: 'website',
        siteName: 'Patient Peptide Guide',
        url: `${appUrl}/vials?collection=${collectionKey}&view=patient`,
        locale: 'en_US',
        images: [
          {
            url: `${appUrl}/og-catalog.png`,
            width: 1200,
            height: 630,
            alt: `${colMeta.name} Patient Guide`,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${colMeta.name || 'Peptide'} Patient Guide Directory`,
        description: 'Patient-friendly peptide reconstitution, storage, and administration reference guides.',
      },
    };
  }

  const resolvedTitle = specMeta
    ? `${specMeta.title} • Physician & Clinic Direct Supply`
    : `${colMeta.title} • Physician & Clinic Direct Supply`;
  const resolvedDesc = specMeta
    ? specMeta.description
    : `${colMeta.description} Direct institutional terms, verified batch quality & expedited dispatch.`;
  const resolvedUrl = specMeta
    ? `${appUrl}/vials?specialty=${encodeURIComponent(specialtyKey)}`
    : `${appUrl}/vials?collection=${collectionKey}`;

  return {
    title: resolvedTitle,
    description: resolvedDesc,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDesc,
      type: 'website',
      siteName: 'Atlas Physician Clinical Formulations',
      url: resolvedUrl,
      locale: 'en_US',
      images: [
        {
          url: `${appUrl}/og-catalog.png`,
          width: 1200,
          height: 630,
          alt: specMeta ? specMeta.title : colMeta.name,
          type: 'image/png'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDesc
    }
  };
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

  return (
    <VialsCatalogClient
      initialVials={initialProducts}
      initialCollection={collection}
      referralInfo={referralInfo}
      isPatientView={isPatientView}
    />
  );
}
