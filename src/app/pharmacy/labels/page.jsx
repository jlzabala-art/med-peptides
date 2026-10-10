import { redirect } from 'next/navigation';

export default async function PharmacyLabelsRedirect({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = new URLSearchParams(resolvedSearchParams).toString();
  redirect(`/labels${query ? `?${query}` : ''}`);
}
