import { redirect } from 'next/navigation';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LegacyPharmapolisHrtRedirect({ searchParams }) {
  const resolvedSearch = await searchParams;
  const qs = new URLSearchParams();
  if (resolvedSearch?.cur) qs.set('cur', resolvedSearch.cur);
  if (resolvedSearch?.currency) qs.set('currency', resolvedSearch.currency);
  if (resolvedSearch?.category) qs.set('category', resolvedSearch.category);
  const queryStr = qs.toString();
  redirect(queryStr ? `/pricing/bhrt?${queryStr}` : '/pricing/bhrt');
}
