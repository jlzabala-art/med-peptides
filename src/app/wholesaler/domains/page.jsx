"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import DomainsTab from '../../../components/wholesaler/DomainsTab';

export default function DomainsPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <DomainsTab />;
}
