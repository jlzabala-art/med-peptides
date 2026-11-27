import { permanentRedirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Legacy calculator alias — permanently consolidated into /calculator
 * while preserving all query params (peptide, format, strength, lang).
 */
export default async function PeptideCalculatorRedirectPage({ searchParams }) {
  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(resolved || {})) {
    if (v != null && v !== '') params.set(k, Array.isArray(v) ? v[0] : String(v));
  }
  const qs = params.toString();
  permanentRedirect(qs ? `/calculator?${qs}` : '/calculator');
}
