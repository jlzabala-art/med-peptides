"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { PlaceholderTab } from '../../../templates/WholesalerHome';

export default function InventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <PlaceholderTab title="Inventory Manager" description="Real-time stock view, batch expiry tracking, and restock alerts — coming soon." />;
}
