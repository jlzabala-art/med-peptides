import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import ProtocolExecutiveSummary from '@/components/admin/protocols/ProtocolExecutiveSummary';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  let title = 'Clinical Protocol Specification • Atlas Health Services';
  let description = 'Standardized clinical protocol specification, dosing schedules, titration phases, and administration parameters for medical reference. Atlas Health Services.';
  let ogImage = `${BASE_URL}/atlas-health-logo.png`;

  if (adminDb && id) {
    try {
      const snap = await adminDb.collection('protocols').doc(id).get();
      if (snap.exists) {
        const d = snap.data();
        const pName = d.name || d.title || 'Clinical Protocol';
        title = `${pName} — Clinical Protocol | Atlas Health Services`;
        
        // Neutral, objective clinical description without marketing buzzwords
        const rawSummary = d.summary || d.description || d.clinicalRationale;
        if (rawSummary && rawSummary.length > 20) {
          const cleanSummary = rawSummary.replace(/^[#*\s]+/, '').replace(/[*_]/g, '').trim();
          description = cleanSummary.slice(0, 155) + (cleanSummary.length > 155 ? '...' : '');
        } else {
          description = `Standardized clinical protocol specification for ${pName}: titration phases, dosing schedules, and administration parameters. Atlas Health Services.`;
        }
        
        // Always provide official Atlas Health Services logo for crisp WhatsApp preview
        ogImage = `${BASE_URL}/atlas-health-logo.png`;
      }
    } catch (e) {
      console.warn('[shared/protocol/generateMetadata] Error:', e.message);
    }
  }

  const isPng = ogImage.toLowerCase().endsWith('.png');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'Atlas Health Services',
      url: `${BASE_URL}/shared/protocol/${id}`,
      images: [
        {
          url: ogImage,
          width: 1024,
          height: 1024,
          type: isPng ? 'image/png' : 'image/jpeg',
          alt: 'Atlas Health Services — Clinical Protocol Specification'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },
    other: {
      'og:image': ogImage,
      'og:image:secure_url': ogImage,
      'og:image:type': isPng ? 'image/png' : 'image/jpeg',
      'og:image:width': '1024',
      'og:image:height': '1024',
      'og:image:alt': 'Atlas Health Services — Clinical Protocol Specification'
    }
  };
}

export default async function SharedProtocolPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Protocol ID not provided.</div>;
  }

  let protocolData = null;
  try {
    const docRef = await adminDb.collection('protocols').doc(id).get();
    if (docRef.exists) {
      protocolData = { id: docRef.id, ...docRef.data() };
      // Convert timestamps if necessary
      if (protocolData.createdAt && protocolData.createdAt.toDate) {
        protocolData.createdAt = protocolData.createdAt.toDate().toISOString();
      }
      if (protocolData.updatedAt && protocolData.updatedAt.toDate) {
        protocolData.updatedAt = protocolData.updatedAt.toDate().toISOString();
      }
    }
  } catch (error) {
    console.error("Error fetching protocol:", error);
  }

  if (!protocolData) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h2>Protocol Not Found</h2>
        <p>The requested protocol does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        padding: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>
            {protocolData.name || 'Clinical Protocol'}
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Shared Read-Only View
          </p>
        </div>
        
        {/* We reuse the beautiful executive summary but in a read-only context */}
        <ProtocolExecutiveSummary protocol={protocolData} />
      </div>
    </div>
  );
}
