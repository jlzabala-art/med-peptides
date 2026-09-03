/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import React from 'react';
import { fetchProductsAction } from '../../../actions/productsActions';
import CollectionClientWrapper from './CollectionClientWrapper';
import { sanitizeForClient } from '../../../utils/sanitizeForClient';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  return {
    title: `${slug ? slug.toUpperCase() : 'Catalog'} - Atlas App`,
    description: `Browse our ${slug} catalog.`
  };
}

export default async function NextCollectionPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const catalog = await fetchProductsAction({ limitCount: 150 });
  const safeCatalog = sanitizeForClient(catalog || []);

  return (
    <CollectionClientWrapper serverParams={resolvedParams} initialProducts={safeCatalog} />
  );
}
export const revalidate = 60;
