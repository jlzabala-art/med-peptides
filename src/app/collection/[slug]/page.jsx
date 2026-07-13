import React from 'react';
import { getProductsByCategoryServer } from '../../../repositories/productRepository';
import CollectionClientWrapper from './CollectionClientWrapper';

// export const revalidate = 3600; // Un-comment to enable Incremental Static Regeneration

export async function generateMetadata({ params }) {
  const slug = params?.slug;
  return {
    title: `${slug ? slug.toUpperCase() : 'Catalog'} - RegenPept`,
    description: `Browse our ${slug} catalog.`
  };
}

export default async function NextCollectionPage({ params }) {
  // 1. Fetch only products for this category on the server for SEO and fast LCP
  const catalog = await getProductsByCategoryServer(params?.slug);
  const safeCatalog = JSON.parse(JSON.stringify(catalog));

  // 2. Pass to Client Wrapper for interactivity
  return (
    <CollectionClientWrapper serverParams={params} initialProducts={safeCatalog} />
  );
}
export const revalidate = 3600;
