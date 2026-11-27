import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Consolidated into /pricing/colway?category=hair to eliminate duplicate server loaders
 * while preserving all shared links and query parameters.
 */
export default async function ColwayHairPricingRedirectPage({ searchParams }) {
  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(resolved || {})) {
    if (v != null && v !== '') params.set(k, Array.isArray(v) ? v[0] : String(v));
  }
  params.set('category', 'hair');
  redirect(`/pricing/colway?${params.toString()}`);
}
