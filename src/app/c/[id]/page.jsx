import React from 'react';
import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
import SharedCatalogPage, { generateMetadata as sharedGenerateMetadata } from '@/app/shared/catalog/[token]/page';

export const dynamic = 'force-dynamic';

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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
        const isProto = d.catalogType === 'protocols' || d.assetType === 'protocols_catalog' || String(id).startsWith('PR-');
        const isDoctor = d.assetType === 'doctor' || d.recipientRole === 'doctor' || d.recipientType === 'doctor';
        const isPrescription = d.assetType === 'prescription';
        const isWholesaler = d.assetType === 'wholesaler' || d.recipientRole === 'wholesaler' || d.recipientType === 'wholeseller';

        const cleanRecipientName = d.recipientName && d.recipientName !== 'Valued Partner'
          ? String(d.recipientName)
              .replace(/\b(?:lotusland|lotus\s*land|nplabs|np\s*labs|regenpept|psathas|nikolaos)\b/gi, '')
              .replace(/\s*[•\-–]\s*$/g, '')
              .replace(/^\s*[•\-–]\s*/g, '')
              .trim()
          : null;

        let title = 'Atlas Health Services • Clinical & Commercial Platform';
        let description = 'Secure verified portal access. Individualized magistral compounding & regenerative therapies.';
        let ogImageUrl = `${appUrl}/og-catalog.png`;

        if (isDoctor) {
          title = cleanRecipientName
            ? `🩺 Perfil Médico Certificado • Dr. ${cleanRecipientName}`
            : '🩺 Perfil Médico Certificado • Atlas Health Services';
          description = 'Acceso seguro al portal clínico verificado. Formulación magistral individualizada, pautas posológicas y expedientes de pacientes.';
          ogImageUrl = `${appUrl}/og-card.png`;
        } else if (isPrescription) {
          title = `📋 Expediente de Prescripción Digital #${id} • Atlas Health Services`;
          description = 'Expediente clínico verificado con pautas posológicas completas, formulaciones magistrales y trazabilidad de farmacia dispensadora.';
          ogImageUrl = `${appUrl}/og-card.png`;
        } else if (isWholesaler) {
          title = cleanRecipientName 
            ? `📦 Catálogo Comercial Mayorista B2B • ${cleanRecipientName}`
            : '📦 Catálogo Comercial Mayorista B2B • Atlas Solutions';
          description = 'Condiciones comerciales mayoristas, catálogo de viales con márgenes de distribución vinculados y logística internacional verificada.';
          ogImageUrl = `${appUrl}/og-catalog.png`;
        } else if (isProto) {
          title = cleanRecipientName
            ? `Clinical Protocol Directory • ${cleanRecipientName}`
            : 'Clinical Protocol Directory • Evidence-Based Pathways';
          description = 'Standardized clinical protocol guidelines, dosing schedules, and titration timelines for certified medical practitioners.';
          ogImageUrl = `${appUrl}/og-catalog.png`;
        }

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'Atlas Health Services',
            url: `${appUrl}/c/${id}`,
            locale: 'es_ES',
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: title,
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
  } catch (err) {
    console.warn('[c/[id]/generateMetadata] Fallback to sharedGenerateMetadata:', err.message);
  }

  return sharedGenerateMetadata({ params: { token: resolvedParams?.id }, searchParams: resolvedSearch });
}

/**
 * Short URL Entry Point: https://www.atlashealth-services.com/c/[id]
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

          // Mirror to recipient user profile subcollection & root document for instant table queries
          if (d.recipientUserId) {
            const subcoll = isProto ? 'shared_protocols' : 'shared_assets';
            adminDb.collection('users').doc(d.recipientUserId).collection(subcoll).doc(id).update({
              status: 'read',
              readStatus: 'read',
              viewCount: visitsCount,
              lastViewedAt: now
            }).catch(() => {});

            // Update root user profile for real-time table engagement badges
            adminDb.collection('users').doc(d.recipientUserId).set({
              lastAssetViewCount: visitsCount,
              lastAssetViewedAt: now,
              lastAssetReadStatus: 'read',
              lastAssetSharedTitle: d.assetTitle || (isProto ? 'Clinical Protocols' : 'Commercial Catalog'),
              lastSharedCode: id,
            }, { merge: true }).catch(() => {});
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

        // If targetUrl exists (protocols, doctor portal, wholesaler portal, or intake), redirect smoothly
        if (d.targetUrl && (isProto || isDoctor || isWholesaler || d.targetUrl.startsWith('/dr/') || d.targetUrl.startsWith('/wholesaler') || d.targetUrl.startsWith('/rx/'))) {
          const rawTarget = d.targetUrl;
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
