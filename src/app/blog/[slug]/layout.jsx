import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

function formatSlugTitle(slug) {
  if (!slug) return '';
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const slug = resolvedParams?.slug || '';
  const topic = formatSlugTitle(slug);

  return buildBilingualMetadata({
    lang,
    path: `/blog/${slug}`,
    type: 'article',
    siteName: 'Atlas Clinical Journal',
    en: {
      title: topic ? `${topic} — Clinical Research Brief | Atlas Health` : 'Clinical Research Brief | Atlas Health',
      description: topic
        ? `Evidence-based clinical review on ${topic}: pharmacology, safety profile, and institutional compounding standards.`
        : 'Evidence-based clinical research, peptide pharmacology, and regenerative medicine briefs.',
    },
    es: {
      title: topic ? `${topic} — Artículo de Investigación Clínica | Atlas Health` : 'Artículo de Investigación Clínica | Atlas Health',
      description: topic
        ? `Revisión clínica basada en evidencia sobre ${topic}: farmacología, perfil de seguridad y estándares de formulación magistral.`
        : 'Investigación clínica basada en evidencia, farmacología de péptidos y medicina regenerativa.',
    },
  });
}

export default function BlogSlugLayout({ children }) {
  return children;
}
