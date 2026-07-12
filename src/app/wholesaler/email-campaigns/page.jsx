"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import EmailCampaignBuilder from '../../../components/wholesaler/EmailCampaignBuilder';

export default function EmailCampaignsPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <EmailCampaignBuilder ownerId={user?.uid} ownerType="wholesaler" onBack={() => router.push('/wholesaler/catalogs')} />;
}
