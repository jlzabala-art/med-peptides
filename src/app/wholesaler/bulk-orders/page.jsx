"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { WholesalerBulkTab } from '../../../templates/WholesalerHome';

export default function BulkOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <WholesalerBulkTab />;
}
