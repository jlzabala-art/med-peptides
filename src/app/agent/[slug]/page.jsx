import React from 'react';
import DoctorPublicPortalClient from '@/app/dr/[slug]/DoctorPublicPortalClient';
import { getDoctorsWithPrescriptions, getDoctorPortalData } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatAgentTitle(slug) {
  if (!slug) return 'Atlas Concierge Care';
  const clean = decodeURIComponent(slug).replace(/[-_]/g, ' ').trim();
  return clean
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const agentTitle = formatAgentTitle(slug);

  return {
    title: `${agentTitle} | Customer Agent Clinical Concierge`,
    description: `Dedicated Customer Care Concierge portal for ${agentTitle}. Manage prescribing physicians, active prescriptions, and patient compounding treatments.`,
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function CustomerAgentNamedPage({ params, searchParams }) {
  const { slug } = await params;
  const sParams = await searchParams;
  const requestedDr = sParams?.dr ? decodeURIComponent(sParams.dr).trim() : null;
  const agentDisplayName = formatAgentTitle(slug);

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
      agentName={agentDisplayName}
      availableDoctors={doctorsList}
    />
  );
}
