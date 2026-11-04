import React from 'react';
import LotuslandPublicPortalClient from '../b2b/lotusland/LotuslandPublicPortalClient';

export const metadata = {
  title: 'Lotusland Limited · Sourcing Audit & API Procurement | Atlas Health',
  description: 'Official public procurement ledger and commercial invoice settlement for Lotusland Limited.',
};

export default function LotuslandDirectPage() {
  return <LotuslandPublicPortalClient />;
}

