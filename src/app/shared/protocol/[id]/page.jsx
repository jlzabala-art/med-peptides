import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import ProtocolExecutiveSummary from '@/components/admin/protocols/ProtocolExecutiveSummary';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  let title = 'Clinical Protocol Specification • Shared Access';
  let description = 'Standardized clinical protocol guidelines, dosing schedules, and titration timelines for certified medical practitioners.';
  let ogImage = `${BASE_URL}/og-catalog.png`;

  if (adminDb && id) {
    try {
      const snap = await adminDb.collection('protocols').doc(id).get();
      if (snap.exists) {
        const d = snap.data();
        title = `${d.name || d.title || 'Clinical Protocol'} — Clinical Protocol Guide`;
        description = (d.summary || d.description || d.clinicalRationale || description).slice(0, 160);
        
        // Map protocol goal/category to high-res clinical image
        const goal = String(d.goal || d.category || '').toLowerCase();
        if (goal.includes('fat') || goal.includes('metabolic') || goal.includes('weight')) {
          ogImage = `${BASE_URL}/images/clinical/goal_metabolic.jpg`;
        } else if (goal.includes('longevity') || goal.includes('aging')) {
          ogImage = `${BASE_URL}/images/clinical/goal_longevity.jpg`;
        } else if (goal.includes('recovery') || goal.includes('tissue') || goal.includes('joint')) {
          ogImage = `${BASE_URL}/images/clinical/goal_recovery.jpg`;
        } else if (goal.includes('cognit') || goal.includes('neuro') || goal.includes('brain')) {
          ogImage = `${BASE_URL}/images/clinical/goal_cognition.jpg`;
        } else if (goal.includes('immune')) {
          ogImage = `${BASE_URL}/images/clinical/goal_immunity.jpg`;
        } else if (goal.includes('hormon') || goal.includes('growth')) {
          ogImage = `${BASE_URL}/images/clinical/goal_hormonal.jpg`;
        }
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
      siteName: 'Med-Peptides Clinical Directory',
      url: `${BASE_URL}/shared/protocol/${id}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          type: isPng ? 'image/png' : 'image/jpeg',
          alt: title
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
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title
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
