import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NutriAliasPage({ params, searchParams }) {
  const { slug } = await params;
  const sParams = await searchParams;
  const cleanSlug = decodeURIComponent(slug || '').trim();
  const qs = sParams ? new URLSearchParams(sParams).toString() : '';

  redirect(`/nutritionist/${cleanSlug}${qs ? `?${qs}` : ''}`);
}

