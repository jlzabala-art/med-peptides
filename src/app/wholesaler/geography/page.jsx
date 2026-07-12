"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import GeographyAreasTab from '../../../components/wholesaler/GeographyAreasTab';

export default function GeographyPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <GeographyAreasTab />;
}
