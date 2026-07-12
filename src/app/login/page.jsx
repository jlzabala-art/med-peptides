"use client";

import React from 'react';
import PortalProviders from '../../components/shared/PortalProviders';
import AuthPage from '../../templates/AuthPage';

export default function AuthPortalPage() {
  return (
    <PortalProviders >
      <AuthPage onBack={() => window.history.back()} />
    </PortalProviders>
  );
}
