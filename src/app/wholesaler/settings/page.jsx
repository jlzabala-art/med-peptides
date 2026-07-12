"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import UserSettings from '../../../templates/UserSettings';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <UserSettings onBack={() => router.push('/wholesaler')} />;
}
