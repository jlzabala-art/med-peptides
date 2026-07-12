"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import CatalogCreatorFlow from '../../../components/wholesaler/CatalogCreatorFlow';

export default function CatalogBuilderPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <CatalogCreatorFlow ownerId={user?.uid} ownerType="wholesaler" onBack={() => router.push('/wholesaler/catalogs')} />;
}
