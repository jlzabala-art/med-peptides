"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import ClientsTab from '../../../components/wholesaler/ClientsTab';

export default function ClientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <ClientsTab />;
}
