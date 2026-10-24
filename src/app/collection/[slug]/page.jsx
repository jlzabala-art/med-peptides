import React from 'react';
import { redirect } from 'next/navigation';
import { fetchProductsAction } from '../../../actions/productsActions';
import CollectionClientWrapper from './CollectionClientWrapper';
import { sanitizeForClient } from '../../../utils/sanitizeForClient';
import { adminDb } from '../../../lib/firebaseAdmin';
import { trackReferralVisitAction } from '@/actions/vialsCatalogActions';

const BASE_URL = 'https://www.atlashealth-services.com';

const BRAND_METADATA = {
  colway: {
    title: 'Colway® Bioactive Native Collagen, Cosmeceuticals & Trichology | Atlas Clinical Collection',
    description: 'Explore Colway® biologically active freshwater fish tropocollagen (Colvita oral nutriceuticals, Blue Diamond VEP-peptide dermocosmetics, and trichological follicular hair systems). EU GMP and ISO 22716 certified.',
    image: `${BASE_URL}/images/products/colway/colway-dermatology-clinic-hero-v2.jpg`,
    section: 'Clinical Nutriceuticals, Dermocosmetics & Follicular Trichology',
    keywords: ['Colway', 'Native Collagen', 'Colvita', 'Blue Diamond Cream', 'Blue Diamond Peeling', 'Trichology Shampoo', 'Conditioner', 'Baicapil', 'Tropocollagen']
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
  teletest: {
    title: 'TeleTest Analytika® Clinical Genomics & Laboratory Diagnostics | Atlas Collection',
    description: 'Explore TeleTest Analytika® accredited clinical diagnostics: High-resolution HLA Immunogenetics & Celiac Predisposition, plus ICP-MS/MS Hair Tissue Mineral & Heavy Metal Toxicology (HTMA). Generalitat de Catalunya E08750211 & ISO 17025 accredited.',
    image: `${BASE_URL}/images/products/teletest/hla-autoinmunidad.svg`,
    section: 'Clinical Laboratory Diagnostics & Pharmacogenomics',
    keywords: ['TeleTest Analytika', 'Hair Tissue Mineral Analysis', 'HTMA', 'Heavy Metal Toxicology', 'HLA Autoimmunity', 'Celiac Disease Genetics', 'Omega-3 Index', 'ISO 17025 European Reference Laboratory']
  },
  peptides: {
    title: 'Lotusland Clinical Peptides Portfolio & Lyophilized Vials | Atlas Collection',
    description: 'Explore the official Lotusland clinical peptide collection: high-purity lyophilized 10R vials (≥99.0% HPLC purity, certified mass spectrometry, endotoxin-tested). BPC-157, TB-500, GHK-Cu, Epithalon, MOTS-c, GLP-1 analogues, and secretagogues.',
    image: `${BASE_URL}/images/og-peptides.png`,
    section: 'Lyophilized Clinical Peptides & Monographs',
    keywords: ['Lotusland', 'Research Peptides', 'BPC-157', 'TB-500', 'GHK-Cu', 'Epithalon', 'Peptides Catalog', 'Lyophilized Vials']
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

// Aliases for seamless routing and brand discovery
BRAND_METADATA.ultraman = BRAND_METADATA.ultraperson;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = (resolvedParams?.slug || '').toLowerCase();
  const slug = rawSlug === 'ultraman' ? 'ultraperson' : rawSlug;

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
  const s = brandSlug.toLowerCase();
  const targetBrand = (s === 'ultraman') ? 'ultraperson' : s;

  // UltraPerson fallback: if Firestore is empty or unreachable, return official clinical registry items
  if (targetBrand === 'ultraperson') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const id = (d.id || '').toLowerCase();
          const brand = (data.brand || data.brandId || '').toLowerCase();
          // Precise UltraPerson matching without cross-contamination with other products
          if (id.startsWith('ultraperson-') || brand.includes('ultraperson')) {
            list.push({ id: d.id, ...data });
          }
        });
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('[fetchTargetedBrandProducts] Firestore read error, falling back to registry:', e.message);
    }

    const { CLINICAL_SUPPLEMENTS } = await import('../../../data/clinicalSupplementsRegistry');
    return Object.values(CLINICAL_SUPPLEMENTS).filter(p => p.id?.startsWith('ultraperson-') || p.slug?.startsWith('ultraperson-'));
  }

  // TeleTest fallback: if Firestore is empty or unreachable, return official clinical registry items
  if (targetBrand === 'teletest') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const str = (d.id + ' ' + (data.name||'') + ' ' + (data.title||'') + ' ' + (data.supplier||'') + ' ' + (data.brand||'') + ' ' + (data.category||'') + ' ' + JSON.stringify(data.keywords||[])).toLowerCase();
          if (str.includes('teletest') || d.id.startsWith('teletest-') || data.supplierId === 'supplier-teletest') {
            list.push({ id: d.id, ...data });
          }
        });
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('[fetchTargetedBrandProducts] TeleTest Firestore error, falling back to registry:', e.message);
    }

    const { getTeletestCatalog } = await import('../../../data/teletestRegistry');
    return getTeletestCatalog();
  }

  // Lotusland Peptides: strictly filter products & variants supplied by Lotusland
  if (targetBrand === 'peptides') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').limit(300).get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          if (data.productType === 'raw_material' || data.category === 'raw_material') return;

          const str = (d.id + ' ' + (data.name||'') + ' ' + (data.title||'') + ' ' + (data.supplier||'') + ' ' + (data.supplierName||'') + ' ' + (data.supplierId||'') + ' ' + (data.brand||'')).toLowerCase();
          const variants = Array.isArray(data.variants) ? data.variants : [];

          const hasLotusVariant = variants.some(v => {
            const vSupp = String(v.supplierId || v.supplier || v.supplierName || '').toLowerCase();
            return vSupp.includes('lotusland') || vSupp === 'supplier-lotusland' || v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo';
          });

          const isLotusDirect = str.includes('lotusland') || data.supplierId === 'supplier-lotusland' || data.supplierId === 'OLlBbQjgrj6tY7GmM2Jo' || (Array.isArray(data.supplierIds) && data.supplierIds.includes('supplier-lotusland'));

          if (isLotusDirect || hasLotusVariant) {
            const lotusVariants = variants.filter(v => {
              const vSupp = String(v.supplierId || v.supplier || v.supplierName || '').toLowerCase();
              return !vSupp || vSupp.includes('lotusland') || vSupp === 'supplier-lotusland' || v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo';
            });

            list.push({
              id: d.id,
              ...data,
              variants: lotusVariants.length > 0 ? lotusVariants : variants,
              supplierId: 'supplier-lotusland',
              supplierName: 'Lotusland'
            });
          }
        });

        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('[fetchTargetedBrandProducts] Peptides Firestore error, falling back to registry:', e.message);
    }

    const { getLotuslandPeptidesCatalog } = await import('../../../data/lotuslandPeptidesRegistry');
    return getLotuslandPeptidesCatalog();
  }

  if (!adminDb) return [];
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
      } else if (s === 'eterna') {
        matches = str.includes('eterna') || str.includes('proteom') || d.id.startsWith('eternadx-') || d.id.startsWith('eterna-');
      } else if (s === 'teletest') {
        matches = str.includes('teletest') || d.id.startsWith('teletest-') || data.supplierId === 'supplier-teletest';
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

export default async function NextCollectionPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const rawSlug = (resolvedParams?.slug || '').toLowerCase();
  const slug = rawSlug === 'ultraman' ? 'ultraperson' : rawSlug;

  if (slug === 'protocols' || slug === 'protocol' || slug === 'proto') {
    redirect('/proto');
  }

  const ref = resolvedSearch?.ref || resolvedSearch?.referral || null;
  const code = resolvedSearch?.code || ref;

  if (ref) {
    trackReferralVisitAction({
      wholesalerId: ref,
      referralCode: code,
      collection: slug
    }).catch(() => {});
  }

  let catalog;
  if (['colway', 'bloodo', 'ultraperson', 'eterna', 'teletest', 'peptides'].includes(slug)) {
    catalog = await fetchTargetedBrandProducts(slug);
  } else {
    catalog = await fetchProductsAction({ limitCount: 200 });
  }

  const safeCatalog = sanitizeForClient(catalog || []);

  return (
    <CollectionClientWrapper serverParams={{ ...resolvedParams, slug }} referralRef={ref} initialProducts={safeCatalog} />
  );
}

export const revalidate = 60;
