import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import ProtocolExecutiveSummary from '@/components/admin/protocols/ProtocolExecutiveSummary';

export default async function SharedProtocolPage({ params }) {
  const { id } = params;

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
