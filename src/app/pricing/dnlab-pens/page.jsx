import { permanentRedirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Legacy route redirect: /pricing/dnlab-pens → /pricing/pens
 * Keeps all historical links & bookmarks working while presenting the clean
 * 100% Atlas Health white-label URL without exposing external supplier names.
 */
export default async function LegacyDnLabPensRedirect({ searchParams }) {
  const resolvedSearch = await searchParams;
  const params = new URLSearchParams();
  if (resolvedSearch && typeof resolvedSearch === 'object') {
    Object.entries(resolvedSearch).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        params.set(k, Array.isArray(v) ? v[0] : String(v));
      }
    });
  }
  const qs = params.toString();
  permanentRedirect(`/pricing/pens${qs ? `?${qs}` : ''}`);
}
