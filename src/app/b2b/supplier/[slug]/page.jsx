import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { normalizeMetaLang } from '@/utils/metadataHelper';
import SupplierOrderPortalClient from './SupplierOrderPortalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  return {
    title: 'Private Supplier Order & Documentation Portal | Atlas Health Services',
    description: 'Token-protected B2B order reconciliation and regulatory documentation workspace.',
    robots: { index: false, follow: false },
  };
}

export default async function PrivateSupplierPortalPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const initialLang = normalizeMetaLang(sp);
  const providedToken = String(sp?.token || '').trim();
  const isAdmin = await isAdminServerSession();

  let portalData = null;
  try {
    if (adminDb && slug) {
      const snap = await adminDb.collection('supplier_portals').doc(String(slug)).get();
      if (snap.exists) {
        portalData = JSON.parse(JSON.stringify(snap.data() || {}));
      }
    }
  } catch (err) {
    console.error('[PrivateSupplierPortalPage] Firestore read error:', err);
  }

  const expectedToken = String(portalData?.accessToken || '');
  const isAuthorized = Boolean(
    portalData && (isAdmin || (providedToken && expectedToken && providedToken === expectedToken))
  );

  if (!isAuthorized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Atlas Health Services · Private B2B Workspace
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            {initialLang === 'es' ? 'Enlace privado requerido' : 'Private Access Token Required'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            {initialLang === 'es'
              ? 'Este espacio de documentación y seguimiento de pedidos requiere un enlace seguro emitido por Atlas Health Services.'
              : 'This order tracking and regulatory documentation portal requires a valid private access link issued by Atlas Health Services.'}
          </p>
        </div>
      </div>
    );
  }

  // Strip raw token from client props unless admin
  const safePortal = {
    ...portalData,
    accessToken: isAdmin ? portalData.accessToken : undefined,
  };

  return (
    <SupplierOrderPortalClient
      portal={safePortal}
      slug={String(slug)}
      initialLang={initialLang}
      isAdmin={isAdmin}
      shareToken={providedToken || (isAdmin ? expectedToken : '')}
    />
  );
}
