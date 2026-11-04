import React from 'react';
import LotuslandPublicPortalClient from './LotuslandPublicPortalClient';

export const metadata = {
  title: 'Lotusland Limited · Historical API Procurement & Reconciliation | Atlas Health',
  description: 'Official procurement ledger and active principle reconciliation for Lotusland Limited across Hong Kong and UAE licensed compounding facilities.',
};

export default function LotuslandPublicPage() {
  return <LotuslandPublicPortalClient />;
}

