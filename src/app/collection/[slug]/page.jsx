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
  mcg: {
    title: 'MCG Cosmetics • Follicular Trichology & 5% Procapil® Anti-Hair Loss | Atlas Clinical Collection',
    description: 'Explore MCG Cosmetics medical cosmeceuticals and intensive trichology treatments. Patented 5% Procapil® peptide formulations, botanical DHT blockers, and hair follicle revitalizers.',
    image: `${BASE_URL}/images/products/colway/colway-dermatology-clinic-hero-v2.jpg`,
    section: 'Medical Cosmeceuticals & Follicular Trichology',
    keywords: ['MCG Cosmetics', 'Kapigen', 'Procapil', 'Anti-Hair Loss', 'Biotinyl-GHK', 'Oleanolic Acid', 'Apigenin', 'Trichology Spray']
  },
  norma: {
    title: 'Norma Hellas® Pharmaceuticals • Testosterone Enanthate & TRT | Atlas Clinical Collection',
    description: 'Explore Norma Hellas S.A. pharmaceutical formulations: Testosterone Enanthate/Norma® 250 mg/ml sterile oily depot solution for intramuscular TRT. EU GMP batch-certified by EVER Pharma Jena GmbH.',
    image: `${BASE_URL}/images/products/norma/testosterone-enanthate-norma-250mg.svg`,
    section: 'Hormone Replacement Therapy (TRT) & Endocrinology',
    keywords: ['Norma Hellas', 'Testosterone Enanthate', 'TRT', 'Hormone Replacement Therapy', 'G03BA03', 'EVER Pharma', 'Hypogonadism']
  },
  hormones: {
    title: 'Hormone Replacement Therapy (TRT & BHRT) & Endocrinology | Atlas Clinical Collection',
    description: 'Prescription endocrine optimization and Testosterone Replacement Therapy (TRT): Norma® Testosterone Enanthate 250 mg/ml, bioidentical hormones, and endocrine blood telemetry.',
    image: `${BASE_URL}/images/products/norma/testosterone-enanthate-norma-250mg.svg`,
    section: 'Clinical Endocrinology & Hormone Optimization',
    keywords: ['Hormone Therapy', 'TRT', 'BHRT', 'Testosterone Enanthate', 'Norma Hellas', 'Endocrinology', 'Hypogonadism']
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
  },
  'hair-treatments': {
    title: 'Hair Treatments & Clinical Trichology | Colway® & Peptide Protocols | Atlas Collection',
    description: 'Explore the integrated clinical hair treatment collection: Colway® Baicapil™ anti-loss shampoo & conditioner, native tropocollagen Colvita, lyophilized GHK-Cu copper peptides, and TeleTest® HTMA trace mineral diagnostics.',
    image: `${BASE_URL}/images/products/colway/colway-trichology-banner.jpg`,
    section: 'Clinical Trichology & Follicular Hair Treatments',
    keywords: ['Hair Treatments', 'Trichology', 'Colway Shampoo', 'Colway Conditioner', 'Baicapil', 'GHK-Cu', 'Copper Peptides', 'HTMA', 'Hair Loss', 'Alopecia']
  },
  'weight-loss': {
    title: 'Weight Loss & Metabolic Health | Incretin Agonists & Glycation Telemetry | Atlas Collection',
    description: 'Evidence-based clinical weight management: Dual/triple incretins (Tirzepatide, Semaglutide, Retatrutide), visceral fat lipolytics (Tesamorelin, AOD-9604), and CE-IVDR Bloodo™ HbA1c 90-day telemetry.',
    image: `${BASE_URL}/images/products/bloodo/nad.jpg`,
    section: 'Clinical Metabolic Health & Weight Optimization',
    keywords: ['Weight Loss', 'Metabolic Health', 'Tirzepatide', 'Semaglutide', 'Retatrutide', 'Tesamorelin', 'AOD-9604', 'HbA1c', 'GLP-1', 'GIP']
  },
  'tissue-repair': {
    title: 'Tissue Repair & Rapid Recovery | BPC-157, TB-500 & Native Tropocollagen | Atlas Collection',
    description: 'Advanced cellular reconstruction and musculoskeletal recovery: BPC-157, TB-500, KPV, Colway biologically active freshwater fish tropocollagen, and TeleTest® mineral balance.',
    image: `${BASE_URL}/images/og-protocols.png`,
    section: 'Cellular Reconstruction & Musculoskeletal Recovery',
    keywords: ['Tissue Repair', 'BPC-157', 'TB-500', 'Tendon Healing', 'Tropocollagen', 'Wound Healing', 'Recovery']
  },
  'longevity-cellular': {
    title: 'Cellular Longevity & Telomeres | Epithalon, MOTS-c & Multi-Omics | Atlas Collection',
    description: 'Biological age reversal and telomerase activation: Epithalon, MOTS-c, FOXO4-DRI senolytics, ETERNA® 700k SNP Multi-Omics, and Bloodo™ intracellular NAD+ test kits.',
    image: `${BASE_URL}/images/products/eterna/eterna-kit-box.png`,
    section: 'Cellular Longevity & Epigenetics',
    keywords: ['Longevity', 'Epithalon', 'MOTS-c', 'Telomeres', 'ETERNA Multi-Omics', 'NAD+ Intracellular', 'Senolytics']
  },
  'neuro-performance': {
    title: 'Neuro-Performance, Focus & Sleep Optimization | Semax, Selank & DSIP | Atlas Collection',
    description: 'Cognitive enhancement and sleep architecture: Semax (BDNF up-regulation), Selank (GABA anxiolysis without sedation), DSIP (delta sleep peptide), and Bloodo™ Diurnal Cortisol CAR.',
    image: `${BASE_URL}/images/longevity_supps.png`,
    section: 'Neuro-Performance & Sleep Architecture',
    keywords: ['Neuro-Performance', 'Semax', 'Selank', 'DSIP', 'Nootropics', 'BDNF', 'Cortisol CAR', 'Sleep Optimization']
  },
  'dermal-aesthetics': {
    title: 'Dermal Aesthetics & Epigenetic Skin Barrier | Blue Diamond & GHK-Cu | Atlas Collection',
    description: 'Clinical dermocosmetics and extracellular matrix neocollagenesis: Colway® Blue Diamond epigenetic VEP peptides, freshwater fish tropocollagen, and GHK-Cu copper peptides.',
    image: `${BASE_URL}/images/products/colway/colway-dermatology-clinic-hero-v2.jpg`,
    section: 'Clinical Dermocosmetics & Skin Barrier',
    keywords: ['Dermal Aesthetics', 'Blue Diamond', 'Colway', 'GHK-Cu', 'Decorin', 'VEP Peptides', 'Tropocollagen']
  }
};

// Aliases for seamless routing and brand discovery
BRAND_METADATA.ultraman = BRAND_METADATA.ultraperson;
BRAND_METADATA['hair-treatment'] = BRAND_METADATA['hair-treatments'];
BRAND_METADATA['trichology'] = BRAND_METADATA['hair-treatments'];
BRAND_METADATA['hair'] = BRAND_METADATA['hair-treatments'];
BRAND_METADATA['weight'] = BRAND_METADATA['weight-loss'];
BRAND_METADATA['metabolic'] = BRAND_METADATA['weight-loss'];
BRAND_METADATA['repair'] = BRAND_METADATA['tissue-repair'];
BRAND_METADATA['recovery'] = BRAND_METADATA['tissue-repair'];
BRAND_METADATA['longevity'] = BRAND_METADATA['longevity-cellular'];
BRAND_METADATA['neuro'] = BRAND_METADATA['neuro-performance'];
BRAND_METADATA['cognitive'] = BRAND_METADATA['neuro-performance'];
BRAND_METADATA['dermal'] = BRAND_METADATA['dermal-aesthetics'];

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

  // Hair Treatments Collection: Colway Trichology + Lotusland Peptides (GHK-Cu, TB-500, BPC-157) + TeleTest HTMA
  if (targetBrand === 'hair-treatments' || targetBrand === 'hair-treatment' || targetBrand === 'trichology' || targetBrand === 'hair') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const id = (d.id || '').toLowerCase();
          const name = (data.name || data.title || '').toLowerCase();
          const str = (id + ' ' + name + ' ' + (data.supplier||'') + ' ' + (data.category||'') + ' ' + JSON.stringify(data.keywords||[])).toLowerCase();

          const isColwayTrich = str.includes('colway') && (str.includes('shampoo') || str.includes('conditioner') || str.includes('trichology') || str.includes('colvita'));
          const isHairPeptide = id.includes('ghk') || name.includes('ghk') || id.includes('tb-500') || id.includes('tb500') || (id.includes('bpc-157') && !id.includes('nasal'));
          const isHtma = id.includes('teletest') && (str.includes('cabello') || str.includes('hair') || str.includes('htma') || str.includes('mineralograma'));

          if (isColwayTrich || isHairPeptide || isHtma) {
            list.push({ id: d.id, ...data });
          }
        });
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('[fetchTargetedBrandProducts] Hair Treatments Firestore error, falling back to registries:', e.message);
    }

    const fallbackList = [];
    try {
      const { COLWAY_PRODUCTS_INCI_REGISTRY } = await import('../../../data/colwayInciRegistry');
      const trichKeys = ['colway-strengthening-shampoo', 'colway-strengthening-conditioner', 'colway-trichology', 'colway-colvita'];
      trichKeys.forEach(k => {
        if (COLWAY_PRODUCTS_INCI_REGISTRY[k]) {
          fallbackList.push({ id: k, ...COLWAY_PRODUCTS_INCI_REGISTRY[k], supplier: 'Colway', brand: 'Colway' });
        }
      });
    } catch (err) {}

    try {
      const { getLotuslandPeptidesCatalog } = await import('../../../data/lotuslandPeptidesRegistry');
      const peps = getLotuslandPeptidesCatalog();
      peps.forEach(p => {
        const pid = (p.id || '').toLowerCase();
        if (pid.includes('ghk') || pid.includes('tb-500') || pid === 'bpc-157-5mg') {
          fallbackList.push(p);
        }
      });
    } catch (err) {}

    try {
      const { getTeletestCatalog } = await import('../../../data/teletestRegistry');
      const tests = getTeletestCatalog();
      tests.forEach(t => {
        const tid = (t.id || '').toLowerCase();
        if (tid.includes('cabello') || tid.includes('htma')) {
          fallbackList.push(t);
        }
      });
    } catch (err) {}

    return fallbackList;
  }

  // Weight Loss & Metabolic Optimization Collection: Incretins + Lipolytics + Bloodo HbA1c
  if (targetBrand === 'weight-loss' || targetBrand === 'weight' || targetBrand === 'metabolic') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const id = (d.id || '').toLowerCase();
          const name = (data.name || data.title || '').toLowerCase();
          const str = (id + ' ' + name + ' ' + (data.category||'') + ' ' + JSON.stringify(data.keywords||[])).toLowerCase();

          const isIncretinOrLipolytic = id.includes('semaglutide') || id.includes('tirzepatide') || id.includes('retatrutide') || id.includes('tesamorelin') || id.includes('aod') || id.includes('cagrilintide') || id.includes('mots');
          const isMetabolicTest = id.includes('bloodo-hba1c') || str.includes('hba1c') || str.includes('glycat');
          const isMetabolicSupp = (id.includes('ultraperson') || id.includes('ultraman')) && (str.includes('coq10') || str.includes('energy') || str.includes('metabolic'));

          if (isIncretinOrLipolytic || isMetabolicTest || isMetabolicSupp) {
            list.push({ id: d.id, ...data });
          }
        });
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('[fetchTargetedBrandProducts] Weight Loss Firestore error:', e.message);
    }

    const fallbackList = [];
    try {
      const { getLotuslandPeptidesCatalog } = await import('../../../data/lotuslandPeptidesRegistry');
      const peps = getLotuslandPeptidesCatalog();
      peps.forEach(p => {
        const pid = (p.id || '').toLowerCase();
        if (pid.includes('semaglutide') || pid.includes('tirzepatide') || pid.includes('retatrutide') || pid.includes('tesamorelin') || pid.includes('aod') || pid.includes('mots')) {
          fallbackList.push(p);
        }
      });
    } catch (err) {}
    return fallbackList;
  }

  // Tissue Repair & Rapid Recovery: BPC-157, TB-500, Tropocollagen
  if (targetBrand === 'tissue-repair' || targetBrand === 'repair' || targetBrand === 'recovery') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const id = (d.id || '').toLowerCase();
          const name = (data.name || data.title || '').toLowerCase();
          const str = (id + ' ' + name + ' ' + (data.category||'')).toLowerCase();

          const isRepairPeptide = id.includes('bpc') || id.includes('tb-500') || id.includes('tb500') || id.includes('kpv');
          const isColwayRepair = str.includes('colway') && (str.includes('colvita') || str.includes('vege') || str.includes('wash'));

          if (isRepairPeptide || isColwayRepair) {
            list.push({ id: d.id, ...data });
          }
        });
        if (list.length > 0) return list;
      }
    } catch (e) {}

    const fallbackList = [];
    try {
      const { getLotuslandPeptidesCatalog } = await import('../../../data/lotuslandPeptidesRegistry');
      const peps = getLotuslandPeptidesCatalog();
      peps.forEach(p => {
        const pid = (p.id || '').toLowerCase();
        if (pid.includes('bpc') || pid.includes('tb-500')) fallbackList.push(p);
      });
    } catch (err) {}
    return fallbackList;
  }

  // Cellular Longevity & Telomeres: Epithalon, MOTS-c, ETERNA, Bloodo NAD+
  if (targetBrand === 'longevity-cellular' || targetBrand === 'longevity') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const id = (d.id || '').toLowerCase();
          const str = (id + ' ' + (data.name||'') + ' ' + (data.title||'')).toLowerCase();

          const isLongevity = id.includes('epithalon') || id.includes('mots') || id.includes('foxo') || id.includes('nad') || id.includes('eterna') || str.includes('longevity');
          if (isLongevity) list.push({ id: d.id, ...data });
        });
        if (list.length > 0) return list;
      }
    } catch (e) {}
  }

  // Neuro-Performance & Sleep: Semax, Selank, DSIP, Cortisol
  if (targetBrand === 'neuro-performance' || targetBrand === 'neuro' || targetBrand === 'cognitive') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const id = (d.id || '').toLowerCase();
          const str = (id + ' ' + (data.name||'') + ' ' + (data.title||'')).toLowerCase();

          const isNeuro = id.includes('semax') || id.includes('selank') || id.includes('dsip') || str.includes('cortisol') || str.includes('focus') || str.includes('sleep');
          if (isNeuro) list.push({ id: d.id, ...data });
        });
        if (list.length > 0) return list;
      }
    } catch (e) {}
  }

  // Dermal Aesthetics: Colway Blue Diamond, GHK-Cu, Colvita
  if (targetBrand === 'dermal-aesthetics' || targetBrand === 'dermal') {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('products').get();
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status === 'archived' || data.status === 'hidden' || data.isActive === false) return;
          const id = (d.id || '').toLowerCase();
          const str = (id + ' ' + (data.name||'') + ' ' + (data.title||'')).toLowerCase();

          const isDermal = id.includes('diamond') || id.includes('ghk') || id.includes('vege') || id.includes('colvita') || str.includes('dermal') || str.includes('peeling');
          if (isDermal) list.push({ id: d.id, ...data });
        });
        if (list.length > 0) return list;
      }
    } catch (e) {}
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

  const ALL_TARGETED_SLUGS = [
    'colway', 'bloodo', 'ultraperson', 'eterna', 'teletest', 'peptides',
    'hair-treatments', 'hair-treatment', 'trichology', 'hair',
    'weight-loss', 'weight', 'metabolic',
    'tissue-repair', 'repair', 'recovery',
    'longevity-cellular', 'longevity',
    'neuro-performance', 'neuro', 'cognitive',
    'dermal-aesthetics', 'dermal'
  ];

  let catalog;
  if (ALL_TARGETED_SLUGS.includes(slug)) {
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
