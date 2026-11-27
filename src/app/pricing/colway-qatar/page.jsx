import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Consolidated into unified /pricing/colway?market=qatar screen
 * while preserving all shared links and query parameters.
 */
export default async function QatarColwayPricingRedirectPage({ searchParams }) {
  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(resolved || {})) {
    if (v != null && v !== '') params.set(k, Array.isArray(v) ? v[0] : String(v));
  }
  params.set('market', 'qatar');
  redirect(`/pricing/colway?${params.toString()}`);
}
