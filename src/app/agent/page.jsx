import React from 'react';
import DoctorPublicPortalClient from '@/app/dr/[slug]/DoctorPublicPortalClient';
import { getDoctorsWithPrescriptions, getDoctorPortalData } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const requestedDr = params?.dr ? decodeURIComponent(params.dr).trim() : null;

  return {
    title: 'Customer Agent Concierge Portal | Clinical Prescriptions & Patient Care',
    description: 'Concierge Care Management Portal for customer agents to manage physician dossiers, active compounding prescriptions, and patient orders.',
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function CustomerAgentPage({ searchParams }) {
  const params = await searchParams;
  const requestedDr = params?.dr ? decodeURIComponent(params.dr).trim() : null;

  // 1. Fetch all physicians who have active prescriptions in the system
  let doctorsList = [];
  try {
    doctorsList = await getDoctorsWithPrescriptions();
  } catch (err) {
    console.error('Error fetching prescribers for agent portal:', err);
  }

  // 2. Resolve active doctor slug: URL param, or first prescriber, or fallback
  let activeSlug = requestedDr;
  if (!activeSlug && doctorsList.length > 0) {
    activeSlug = doctorsList[0].nameSlug || doctorsList[0].opaqueCode || doctorsList[0].id;
  }
  if (!activeSlug) {
    activeSlug = 'dr-cagatay-sezgin';
  }

  // 3. Preload active physician portal data with Layer 1 RAM cache (0ms FCP)
  let initialData = null;
  try {
    initialData = await getDoctorPortalData(activeSlug);
  } catch (err) {
    console.error('Error preloading doctor portal data for agent:', err);
  }

  return (
    <DoctorPublicPortalClient
      slug={activeSlug}
      initialData={initialData}
      isCustomerAgent={true}
      agentName="Atlas Concierge Care"
      availableDoctors={doctorsList}
    />
  );
}
