import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  return {
    title: `${slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Protocol'} - Atlas Clinical Protocol Directory`,
    description: `View ${slug} clinical protocol details.`
  };
}

export default async function NextProtocolSlugRedirect({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (slug) {
    redirect(`/proto/${slug}`);
  }
  redirect('/proto');
}
