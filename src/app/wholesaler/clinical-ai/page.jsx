"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import ClinicalAIWidget from '../../../components/admin/ClinicalAIWidget';

export default function ClinicalAiPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <ClinicalAIWidget />;
}
