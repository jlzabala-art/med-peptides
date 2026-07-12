"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import BrandingTab from '../../../components/wholesaler/BrandingTab';

export default function BrandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <BrandingTab />;
}
