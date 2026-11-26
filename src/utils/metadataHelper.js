const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

/**
 * Normalizes `?lang=` from Next.js `searchParams` (supports already-resolved objects).
 */
export function normalizeMetaLang(resolvedSearchParams) {
  const raw = resolvedSearchParams?.lang;
  return String(raw || '').toLowerCase() === 'es' ? 'es' : 'en';
}

/**
 * Builds consistent, neutral, bilingual Next.js Metadata (`title`, `description`,
 * `alternates`, `openGraph`, `twitter`, `robots`) for public & shareable routes.
 */
export function buildBilingualMetadata({
  lang = 'en',
  en,
  es,
  url,
  path,
  topic,
  currency,
  siteName = 'Atlas Health Services',
  images,
  type = 'website',
  robots,
  other,
}) {
  const isEs = lang === 'es';
  const copy = isEs ? (es || en) : (en || es);
  let resolvedUrl = url || (path ? `${DEFAULT_BASE_URL}${path.startsWith('/') ? path : `/${path}`}` : DEFAULT_BASE_URL);
  if (isEs && !/[?&]lang=/i.test(resolvedUrl)) {
    resolvedUrl += resolvedUrl.includes('?') ? '&lang=es' : '?lang=es';
  }
  const title = copy?.title || 'Atlas Health Services';
  const description = copy?.description || 'Institutional clinical intelligence and pharmaceutical reference.';

  const dynamicOgUrl = topic
    ? `${DEFAULT_BASE_URL}/api/og?topic=${encodeURIComponent(topic)}&lang=${isEs ? 'es' : 'en'}${currency ? `&cur=${encodeURIComponent(currency)}` : ''}`
    : `${DEFAULT_BASE_URL}/api/og?topic=pricing&lang=${isEs ? 'es' : 'en'}`;

  const defaultImages = [
    {
      url: dynamicOgUrl,
      width: 1200,
      height: 630,
      alt: title,
    },
  ];
  const normalizedImages = Array.isArray(images) && images.length > 0 ? images : defaultImages;
  const twitterImages = normalizedImages
    ? normalizedImages.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: resolvedUrl,
    },
    openGraph: {
      title,
      description,
      url: resolvedUrl,
      siteName,
      locale: isEs ? 'es_ES' : 'en_US',
      type,
      ...(normalizedImages ? { images: normalizedImages } : {}),
    },
    twitter: {
      card: twitterImages?.length ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(twitterImages?.length ? { images: twitterImages } : {}),
    },
    ...(robots ? { robots } : {}),
    ...(other ? { other } : {}),
  };
}
