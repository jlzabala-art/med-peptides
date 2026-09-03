"use client";

import React, { Suspense } from 'react';
import AuthPage from '../../templates/AuthPage';

export default function AuthPortalPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="global-spinner" /></div>}>
      <AuthPage onBack={() => window.history.back()} />
    </Suspense>
  );
}
