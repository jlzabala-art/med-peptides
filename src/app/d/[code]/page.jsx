/**
 * src/app/d/[code]/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Short Link Redirection & Discreet WhatsApp Unfurling Endpoint
 * 
 * STRICT COMPLIANCE:
 * - Clean metadata for WhatsApp and social previews.
 * - Zero mention of company name (no RegenPept, Magenta, Lotusland, etc.).
 * - Zero mention of specific product name.
 * - Instant redirection to the full, comprehensive datasheet URL.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
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

  if (adminDb && code) {
    try {
      const docRef = adminDb.collection('datasheet_short_links').doc(code);
      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data();
        if (data?.targetUrl) {
          targetUrl = data.targetUrl;
          // Increment hits asynchronously
          docRef.update({
            hits: (data.hits || 0) + 1,
            lastAccessedAt: new Date().toISOString()
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('[ShortDatasheetPage] Error fetching short link:', err);
    }
  }

  // Redirect instantly to the complete target URL
  redirect(targetUrl);
}
