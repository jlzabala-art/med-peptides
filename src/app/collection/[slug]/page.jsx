/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import React from 'react';
import { fetchProductsAction } from '../../../actions/productsActions';
import CollectionClientWrapper from './CollectionClientWrapper';
import { sanitizeForClient } from '../../../utils/sanitizeForClient';
import { adminDb } from '../../../lib/firebaseAdmin';

const BASE_URL = 'https://med-peptides.com';

const BRAND_METADATA = {
  colway: {
    title: 'Colway® Native Collagen & Follicular Trichology | Atlas Clinical Collection',
    description: 'Explore Colway® advanced trichology & native biologically active tropocollagen. Formulated with caffeine, Zinc PCA, Biotin, and Baicapil 2% to inhibit DHT, extend anagen phase, and reinforce follicular anchorage.',
    image: `${BASE_URL}/images/products/colway/shampoo.png`,
    section: 'Clinical Cosmeceuticals & Follicular Trichology',
    keywords: ['Colway', 'Native Collagen', 'Hair Strengthening Shampoo', 'Hair Conditioner', 'Baicapil', 'Zinc PCA', 'DHT Blockade']
  },
  bloodo: {
    title: 'Bloodo™ Capillary Blood Diagnostics | CE-IVDR Test Kits | Atlas Collection',
    description: 'Discover Bloodo™ precision Dried Blood Spot (DBS) tests: NAD+ Intracellular, Testosterone+, HbA1c 90-Day, Diurnal Cortisol CAR, Omega-3/6 Ratio & Vitamin D3. ISO 15189 accredited lab analysis.',
    image: `${BASE_URL}/images/products/bloodo/nad.jpg`,
    section: 'Capillary Blood Diagnostics & CE-IVDR Kits',
    keywords: ['Bloodo', 'NAD+ Test', 'DBS Test', 'Capillary Blood Test', 'Cortisol Test', 'Testosterone Test', 'HbA1c', 'Omega Ratio']
  },
  ultraperson: {
    title: 'UltraPerson™ Precision Supplements & Longevity Protocols | Atlas Collection',
    description: 'Medical-grade personalization supplements with CoQ10, PQQ, Ashwagandha, Bacopa monnieri, and Apigenin in acid-resistant vegan HPMC capsules. 3-Month AAA Protocol synergy.',
    image: `${BASE_URL}/assets/vials/eterna-longevity.png`,
    section: 'Precision Personalization & Longevity Supplements',
    keywords: ['UltraPerson', 'PharmaPolis', 'Mitochondrial CoQ10 PQQ', 'Cognitive Focus Bacopa', 'Stress Resilience Ashwagandha', 'Sleep Apigenin', 'Longevity Cellular Renewal']
  },
  eterna: {
    title: 'ETERNA® Multi-Omics Diagnostics & Organ Proteomics | Atlas Collection',
    description: 'Clinical multi-omics integrating high-throughput genomics (+700,000 SNPs), organ-specific biological age proteomics, and longitudinal telemetry for precision longevity medicine.',
    image: `${BASE_URL}/images/products/eterna/eterna-kit-box.png`,
    section: 'Multi-Omics Genomics & Organ Proteomics',
    keywords: ['ETERNA DX', 'Organ Proteomics', 'Epigenetic Age Test', 'Eurofins Longevity', 'Multi-Omics']
  },
  peptides: {
    title: 'Precision Research Peptides Catalog | Atlas Health Platform',
    description: 'Browse our comprehensive catalog of verified analytical peptides (≥99.0% purity). BPC-157, TB-500, GHK-Cu, Epithalon, MOTS-c, and metabolic secretagogues.',
    image: `${BASE_URL}/images/og-peptides.png`,
    section: 'Analytical Research Peptides',
    keywords: ['Research Peptides', 'BPC-157', 'TB-500', 'GHK-Cu', 'Epithalon', 'Peptides Catalog']
  },
  supplements: {
    title: 'Clinical Grade Supplements & Nutraceuticals | Atlas Platform',
    description: 'Explore high-purity therapeutic cofactors, mitochondrial precursors, and targeted nutraceuticals formulated to clinical research standards.',
    image: `${BASE_URL}/images/longevity_supps.png`,
    section: 'Clinical Supplements',
    keywords: ['Supplements', 'NAD Precursors', 'Mitochondrial Support', 'Nutraceuticals']
  },
  protocols: {
    title: 'Clinical Peptide Protocols & Therapeutic Pathways | Atlas Platform',
    description: 'Explore validated clinical protocols for tissue repair, metabolic optimization, neuro-cognitive resilience, and biological longevity.',
    image: `${BASE_URL}/images/og-protocols.png`,
    section: 'Clinical Protocols',
    keywords: ['Peptide Protocols', 'Longevity Protocols', 'Tissue Repair Pathways']
  }
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = (resolvedParams?.slug || '').toLowerCase();

  const meta = BRAND_METADATA[slug] || {
    title: `${slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Catalog'} | Atlas Collection`,
    description: `Explore our specialized ${slug} catalog and clinical formulations at Atlas Health.`,
    image: `${BASE_URL}/images/og-peptides.png`,
    section: 'Clinical Catalog'
  };

  const canonicalUrl = `${BASE_URL}/collection/${slug}`;
  const isPng = meta.image.toLowerCase().endsWith('.png');
  const imageType = isPng ? 'image/png' : 'image/jpeg';

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      siteName: 'Atlas Clinical Healthcare Platform',
      images: [
        {
          url: meta.image,
          width: 1200,
          height: 630,
          type: imageType,
          alt: meta.title,
        },
      ],
      type: 'website',
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [meta.image],
    },
    other: {
      'og:image': meta.image,
      'og:image:secure_url': meta.image,
      'og:image:type': imageType,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': meta.title,
      'article:section': meta.section,
    },
    robots: { index: true, follow: true },
  };
}

// Server-side targeted product fetching for brand collections
async function fetchTargetedBrandProducts(brandSlug) {
  if (!adminDb) return [];
  const s = brandSlug.toLowerCase();
  try {
    const snap = await adminDb.collection('products').get();
    const list = [];
    snap.forEach(d => {
      const data = d.data();
      if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
      const str = (d.id + ' ' + (data.name||'') + ' ' + (data.title||'') + ' ' + (data.supplier||'') + ' ' + (data.brand||'') + ' ' + (data.category||'') + ' ' + JSON.stringify(data.keywords||[])).toLowerCase();

      let matches = false;
      if (s === 'colway') {
        matches = str.includes('colway');
      } else if (s === 'bloodo') {
        matches = str.includes('bloodo') || ((data.category === 'diagnostic_test' || str.includes('dbs')) && (d.id.includes('test') || data.sampleType?.includes('DBS')));
      } else if (s === 'ultraperson') {
        matches = str.includes('ultraperson');
      } else if (s === 'eterna') {
        matches = str.includes('eterna') || str.includes('proteom') || d.id.startsWith('eternadx-') || d.id.startsWith('eterna-');
      }

      if (matches) {
        list.push({ id: d.id, ...data });
      }
    });
    return list;
  } catch (err) {
    console.error(`[fetchTargetedBrandProducts] Error loading ${s}:`, err);
    return [];
  }
}

export default async function NextCollectionPage({ params }) {
  const resolvedParams = await params;
  const slug = (resolvedParams?.slug || '').toLowerCase();

  let catalog;
  if (['colway', 'bloodo', 'ultraperson', 'eterna'].includes(slug)) {
    catalog = await fetchTargetedBrandProducts(slug);
  } else {
    catalog = await fetchProductsAction({ limitCount: 200 });
  }

  const safeCatalog = sanitizeForClient(catalog || []);

  return (
    <CollectionClientWrapper serverParams={resolvedParams} initialProducts={safeCatalog} />
  );
}

export const revalidate = 60;
