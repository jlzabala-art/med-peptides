import { scrubSupplierText } from '@/lib/supplierSanitizer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

function cleanStr(val) {
  return scrubSupplierText(String(val || '')).trim();
}

function resolveNumericPrice(product) {
  if (!product || typeof product !== 'object') return null;
  const candidates = [
    product.clinicPriceEur,
    product.wholesalePriceEur,
    product.priceEur,
    product.clinicPrice,
    product.wholesalePrice,
    product.price,
    product.pricing?.clinic,
    product.pricing?.wholesale,
    product.pricing?.unit,
    product.pricing?.basePrice,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return Number(n.toFixed(2));
  }
  return null;
}

/**
 * Builds clean Schema.org JSON-LD (@graph: CollectionPage + BreadcrumbList + OfferCatalog + FAQPage)
 * for public pricing catalogs while enforcing Rule #73 supplier confidentiality.
 */
export function buildPricingPageJsonLd({
  path,
  name,
  description,
  currency = 'EUR',
  category = 'Clinical & Longevity B2B Catalog',
  products = [],
  faqs = [],
}) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const pageUrl = `${BASE_URL}${safePath}`;
  const validCurrency = ['EUR', 'USD', 'AED'].includes(String(currency || '').toUpperCase())
    ? String(currency).toUpperCase()
    : 'EUR';

  const safeProducts = Array.isArray(products) ? products.slice(0, 35) : [];

  const itemListElement = safeProducts.map((p, idx) => {
    const prodName = cleanStr(p.name || p.title || p.slug || `Clinical Item ${idx + 1}`);
    const prodSku = cleanStr(p.sku || p.itemNumber || p.id || '');
    const prodDesc = cleanStr(
      p.description || p.subtitle || p.biomarker || p.clinicalUse || `${prodName} clinical specification.`
    ).slice(0, 220);
    const prodSlug = cleanStr(p.slug || '');
    const prodUrl = prodSlug ? `${BASE_URL}/p/${encodeURIComponent(prodSlug)}` : pageUrl;
    const numericPrice = resolveNumericPrice(p);

    const productSchema = {
      '@type': 'Product',
      name: prodName,
      description: prodDesc,
      category: cleanStr(p.category || category),
      url: prodUrl,
      brand: {
        '@type': 'Brand',
        name: 'Atlas Health Services',
      },
      ...(prodSku ? { sku: prodSku } : {}),
    };

    if (numericPrice !== null) {
      productSchema.offers = {
        '@type': 'Offer',
        priceCurrency: validCurrency,
        price: numericPrice,
        availability: 'https://schema.org/InStock',
        url: pageUrl,
        seller: {
          '@type': 'MedicalOrganization',
          name: 'Atlas Health Services',
          url: BASE_URL,
        },
      };
    }

    return {
      '@type': 'ListItem',
      position: idx + 1,
      item: productSchema,
    };
  });

  const graph = [
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: cleanStr(name),
      description: cleanStr(description),
      isPartOf: {
        '@type': 'WebSite',
        name: 'Atlas Health Services',
        url: BASE_URL,
      },
      about: {
        '@type': 'MedicalOrganization',
        name: 'Atlas Health Services',
        url: BASE_URL,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Atlas Health Services',
          item: BASE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: cleanStr(name),
          item: pageUrl,
        },
      ],
    },
    {
      '@type': 'OfferCatalog',
      name: cleanStr(name),
      url: pageUrl,
      numberOfItems: Array.isArray(products) ? products.length : 0,
      itemListElement,
    },
  ];

  if (Array.isArray(faqs) && faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs
        .filter((f) => f && f.q && f.a)
        .map((f) => ({
          '@type': 'Question',
          name: cleanStr(f.q),
          acceptedAnswer: {
            '@type': 'Answer',
            text: cleanStr(f.a),
          },
        })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
