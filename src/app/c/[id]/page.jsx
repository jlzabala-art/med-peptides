import React from 'react';
import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
import SharedCatalogPage, { generateMetadata as sharedGenerateMetadata } from '@/app/shared/catalog/[token]/page';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60-second ISR edge cache for shared catalogs

/**
 * OpenGraph Metadata for WhatsApp & Social Unfurling
 * Uses lightweight (<180KB) og-catalog.png with crisp Med-Peptides institutional branding.
 * STRICT: Zero mention of "lotusland" or "regenpept".
 */
export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const id = resolvedParams?.id;

  try {
    if (adminDb && id) {
      const snap = await adminDb.collection('shared_catalog_links').doc(id).get();
      if (snap.exists) {
        const d = snap.data();
        const isProto = d.catalogType === 'protocols' || d.assetType === 'protocols_catalog' || String(id).startsWith('PR-');
        
        if (isProto) {
          const recipientName = d.recipientName && d.recipientName !== 'Valued Partner' ? d.recipientName : null;
          const title = recipientName
            ? `Clinical Protocol Directory • ${recipientName}`
            : 'Clinical Protocol Directory • Evidence-Based Pathways';
          const description = 'Standardized clinical protocol guidelines, dosing schedules, and titration timelines for certified medical practitioners.';
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';
          const ogImageUrl = `${appUrl}/og-catalog.png`;

          return {
            title,
            description,
            openGraph: {
              title,
              description,
              type: 'website',
              siteName: 'Med-Peptides Clinical Directory',
              url: `${appUrl}/c/${id}`,
              locale: 'en_US',
              images: [
                {
                  url: ogImageUrl,
                  width: 1200,
                  height: 630,
                  alt: 'Med-Peptides Clinical Protocol Directory',
                  type: 'image/png'
                }
              ]
            },
            twitter: {
              card: 'summary_large_image',
              title,
              description,
              images: [ogImageUrl]
            },
            other: {
              'whatsapp:title': title,
              'whatsapp:description': description
            }
          };
        }
      }
    }
  } catch (err) {
    console.warn('[c/[id]/generateMetadata] Fallback to sharedGenerateMetadata:', err.message);
  }

  return sharedGenerateMetadata({ params: { token: resolvedParams?.id }, searchParams: resolvedSearch });
}

/**
 * Short URL Entry Point: https://med-peptides.com/c/[id]
 * Renders the verified shared catalog or redirects to protocols directory with visit tracking.
 */
export default async function ShortCatalogRoute({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (adminDb && id) {
    try {
      const snap = await adminDb.collection('shared_catalog_links').doc(id).get();
      if (snap.exists) {
        const d = snap.data();
        const isProto = d.catalogType === 'protocols' || d.assetType === 'protocols_catalog' || String(id).startsWith('PR-');

        const now = new Date().toISOString();
        const visitsCount = (d.visitsCount || 0) + 1;

        // Track visit asynchronously across all collections
        try {
          await snap.ref.update({
            visitsCount,
            lastVisitedAt: now,
            readStatus: 'read',
            status: d.status === 'sent' ? 'viewed' : (d.status || 'viewed')
          });

          // Mirror to central shared_records
          adminDb.collection('shared_records').doc(id).update({
            status: 'read',
            readStatus: 'read',
            viewCount: visitsCount,
            lastViewedAt: now
          }).catch(() => {});

          // Mirror to recipient user profile subcollection
          if (d.recipientUserId) {
            const subcoll = isProto ? 'shared_protocols' : 'shared_assets';
            adminDb.collection('users').doc(d.recipientUserId).collection(subcoll).doc(id).update({
              status: 'read',
              readStatus: 'read',
              viewCount: visitsCount,
              lastViewedAt: now
            }).catch(() => {});
          }

          // Emit proactive read notification to Admin / Commercial desk on first view
          if (!d.lastVisitedAt && adminDb) {
            const recipientName = d.recipientName || 'Un cliente';
            const docTitle = d.assetTitle || (isProto ? 'el catálogo de protocolos clínicos' : 'el catálogo comercial');

            adminDb.collection('notifications').add({
              title: 'Confirmación de Lectura',
              message: `${recipientName} ha abierto ${docTitle}.`,
              type: 'read_receipt',
              link: `/c/${id}`,
              targetRoles: ['admin', 'account_manager'],
              read: false,
              createdAt: now,
              metadata: {
                id,
                recipientUserId: d.recipientUserId || null,
                docTitle,
              }
            }).catch(err => console.warn('[ReadNotification /c] Note:', err.message));
          }
        } catch (updateErr) {
          console.warn('[ShortCatalogRoute] Could not update visit count:', updateErr.message);
        }

        if (isProto) {
          const rawTarget = d.targetUrl || '/proto';
          const sep = rawTarget.includes('?') ? '&' : '?';
          const targetUrl = `${rawTarget}${sep}tc=${encodeURIComponent(id)}`;
          redirect(targetUrl);
        }
      }
    } catch (err) {
      // If error was a Next.js redirect, rethrow it
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err;
      }
      console.warn('[ShortCatalogRoute] Handled error:', err.message);
    }
  }

  return <SharedCatalogPage params={{ token: resolvedParams?.id }} />;
}
