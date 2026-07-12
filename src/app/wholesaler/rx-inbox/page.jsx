"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { WholesalerRxInboxTab } from '../../../templates/WholesalerHome';

export default function RxInboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <WholesalerRxInboxTab uid={user?.uid} />;
}
