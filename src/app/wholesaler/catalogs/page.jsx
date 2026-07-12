"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import CatalogList from '../../../components/wholesaler/CatalogList';

export default function CatalogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <CatalogList ownerId={user?.uid} ownerType="wholesaler" onOpenBuilder={() => router.push('/wholesaler/catalog-builder')} onSelectCatalogToEdit={(cat) => router.push('/wholesaler/catalog-builder')} />;
}
