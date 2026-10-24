import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  return {
    title: `${slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Product'} - Atlas App`,
    description: `View ${slug} details.`
  };
}

export default async function NextProductPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (slug) {
    redirect(`/p/${slug}`);
  }
  redirect('/collection/peptides');
}
