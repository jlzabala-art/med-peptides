import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Consolidated into canonical /b2b/lotusland route.
 */
export default async function LotuslandDirectRedirectPage({ searchParams }) {
  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(resolved || {})) {
    if (v != null && v !== '') params.set(k, Array.isArray(v) ? v[0] : String(v));
  }
  const qs = params.toString();
  redirect(qs ? `/b2b/lotusland?${qs}` : '/b2b/lotusland');
}
