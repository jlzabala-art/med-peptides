import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSEOStore } from '../hooks/usePageMeta';

export default function SEO() {
  const meta = useSEOStore(state => state.meta);

  if (!meta) return null;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={meta.path} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:site_name" content="Atlas Health" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={meta.path} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      {/* Canonical Link */}
      <link rel="canonical" href={meta.path || undefined} />

      {/* Structured Data */}
      {meta.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(meta.structuredData)}
        </script>
      )}
    </Helmet>
  );
}
