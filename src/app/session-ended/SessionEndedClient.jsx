"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import PortalProviders from '../../components/shared/PortalProviders';
import ExitProfessionalMode from '../../components/auth/ExitProfessionalMode';

export default function SessionEndedClient() {
  const router = useRouter();

  return (
    <PortalProviders>
      <ExitProfessionalMode onBack={() => router.push('/')} onLogin={() => router.push('/login')} />
    </PortalProviders>
  );
}
