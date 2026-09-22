/**
 * src/app/d/[code]/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Short Link Redirection & Read Tracking Engine (Read Receipts).
 * 
 * FEATURES:
 * - Detects every opening and marks readStatus: 'read'.
 * - Records timestamps, viewCount, IP, and UserAgent.
 * - Synchronizes with central CRM shared_records collection.
 * - Handles link revocation securely.
 * - Preserves discreet social preview metadata for WhatsApp/Telegram.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

/**
 * Clean OpenGraph & Twitter Metadata for WhatsApp / Telegram / Social Previews.
 * Guaranteed to be 100% clean without company or product leaks.
 */
export async function generateMetadata({ params }) {
  const cleanTitle = 'Clinical Technical Monograph & Protocol Reference';
  const cleanDesc = 'Verified analytical reference, standardized dosing specifications, and clinical administration guidelines. Confidential medical reference.';
  const previewImage = `${BASE_URL}/og-catalog.png`;

  return {
    title: cleanTitle,
    description: cleanDesc,
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      type: 'article',
      siteName: 'Clinical Technical Reference Library',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: 'Clinical Monograph Reference Documentation'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDesc,
      images: [previewImage]
    },
    robots: { index: false, follow: true }
  };
}

export default async function ShortDatasheetPage({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code;

  let targetUrl = `${BASE_URL}/catalog`;
  let isRevoked = false;

  if (adminDb && code) {
    try {
      const docRef = adminDb.collection('datasheet_short_links').doc(code);
      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data();

        if (data.status === 'revoked') {
          isRevoked = true;
        } else if (data?.targetUrl) {
          targetUrl = data.targetUrl;

          // Extract client request headers for audit logging
          const headersList = await headers();
          const userAgent = headersList.get('user-agent') || 'unknown';
          const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
          const referer = headersList.get('referer') || null;

          const now = new Date().toISOString();
          const viewCount = (data.viewCount || data.hits || 0) + 1;
          const viewEntry = {
            timestamp: now,
            userAgent,
            ip,
            referer
          };

          const updatePayload = {
            hits: viewCount,
            viewCount,
            readStatus: 'read',
            firstViewedAt: data.firstViewedAt || now,
            lastViewedAt: now,
            lastAccessedAt: now,
            views: [...(data.views || []).slice(-49), viewEntry]
          };

          // 1. Update datasheet_short_links record
          docRef.update(updatePayload).catch((err) => {
            console.warn('[ShortDatasheetPage] Failed to update short link tracking:', err.message);
          });

          // 2. Mirror read event to central shared_records collection for CRM visibility
          adminDb.collection('shared_records').doc(code).update({
            status: 'read',
            readStatus: 'read',
            viewCount,
            firstViewedAt: data.firstViewedAt || now,
            lastViewedAt: now,
            views: [...(data.views || []).slice(-49), viewEntry]
          }).catch(() => {});

          // 3. Mirror read event to shared_catalog_links for User360Drawer
          adminDb.collection('shared_catalog_links').doc(code).update({
            status: 'read',
            readStatus: 'read',
            visitsCount: viewCount,
            viewCount,
            lastViewedAt: now,
            lastVisitedAt: now
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('[ShortDatasheetPage] Error fetching short link:', err);
    }
  }

  if (isRevoked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fee2e2',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            fontSize: '24px'
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Datasheet Link Revoked
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
            This technical documentation access link has been revoked or updated by the medical affairs desk. Please contact your account representative to request an updated specification link.
          </p>
        </div>
      </div>
    );
  }

  // Redirect instantly to the complete target URL
  redirect(targetUrl);
}
