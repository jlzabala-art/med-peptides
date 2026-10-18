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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

import { resolveSocialImage, resolveSocialContent } from '@/utils/socialImageResolver';
import { KNOWN_DOCTORS_DIRECTORY } from '@/services/doctorDirectoryService';
import { sanitizePrescriptionCode } from '@/lib/prescriptionSanitizer';

/**
 * Dynamic OpenGraph & Twitter Metadata for WhatsApp / Telegram / Social Previews.
 * Resolves exact compound, doctor practice portal, prescription, and related image.
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code;

  let title = 'Clinical Technical Monograph & Protocol Reference';
  let description = 'Verified analytical reference, standardized dosing specifications, and clinical administration guidelines. Confidential medical reference.';
  let previewImage = `${BASE_URL}/og-catalog.png`;
  let siteName = 'Atlas Health Services';
  let ogType = 'article';

  if (adminDb && code) {
    try {
      const snap = await adminDb.collection('datasheet_short_links').doc(code).get();
      if (snap.exists) {
        const linkData = snap.data();
        const targetUrl = linkData.targetUrl || '';
        const isDoctorLink = targetUrl.includes('/dr/') || targetUrl.includes('/doctor/') || linkData.assetType === 'doctor_portal' || Boolean(linkData.doctorName);
        const isRxLink = targetUrl.includes('/rx/') || linkData.assetType === 'prescription';

        if (isDoctorLink) {
          ogType = 'profile';
          title = 'Physician Clinical Practice Portal · Atlas Health Services';
          description = 'Official digital clinical practice portal. Authorized medical practitioners can sign in to view dossiers and compounding formulations.';
          previewImage = linkData.clinicLogo || linkData.logoUrl || `${BASE_URL}/og-card.png`;
          siteName = 'Atlas Health Platform';
        } else if (isRxLink) {
          const rawRxCode = targetUrl.match(/\/rx\/([^/?#]+)/)?.[1] || code;
          const cleanRxCode = sanitizePrescriptionCode(rawRxCode);
          title = `Medical Prescription #${cleanRxCode} · Clinical Treatment Dossier`;
          description = `Verified clinical formulation monograph and pharmaceutical posology protocol. Authorized medical practice access.`;
          previewImage = `${BASE_URL}/og-card.png`;
          siteName = 'Atlas Health Clinical Prescriptions';
        } else {
          // Standard product monograph resolution
          const slug = linkData.slug || linkData.variant?.productId || '';
          let productData = null;

          if (slug) {
            const prodSnap = await adminDb.collection('products').doc(slug).get().catch(() => null);
            if (prodSnap?.exists) {
              productData = { id: prodSnap.id, ...prodSnap.data() };
            }
          }

          const resolved = resolveSocialContent({
            product: productData,
            variant: linkData.variant,
            code,
            recipient: linkData.recipient
          });

          title = resolved.title || title;
          description = resolved.description || description;
          previewImage = resolveSocialImage(productData || slug, linkData.format || linkData.variant?.format);
          siteName = 'Clinical Reference Library';
        }
      }
    } catch (err) {
      console.warn('[d/[code]/generateMetadata] Error resolving short link metadata:', err.message);
    }
  }

  const isPng = previewImage.toLowerCase().endsWith('.png');
  const imageType = isPng ? 'image/png' : 'image/jpeg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: ogType || 'article',
      siteName: siteName || 'Atlas Health Services',
      url: `${BASE_URL}/d/${code}`,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          type: imageType,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImage]
    },
    other: {
      'og:image': previewImage,
      'og:image:secure_url': previewImage,
      'og:image:type': imageType,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title
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

          // 4. Update recipient user profile subcollection if registered
          if (data.recipient?.id) {
            adminDb.collection('users').doc(data.recipient.id).collection('shared_datasheets').doc(code).update({
              status: 'read',
              readStatus: 'read',
              viewCount,
              firstViewedAt: data.firstViewedAt || now,
              lastViewedAt: now,
            }).catch(() => {});
          }

          // 5. Emit proactive read notification to Admin / Commercial desk on first view
          if (!data.firstViewedAt) {
            const recipientName = data.recipient?.name || 'Un cliente';
            const recipientOrg = data.recipient?.company ? ` (${data.recipient.company})` : '';
            const compoundName = data.variant?.productName || data.productName || data.slug || 'la ficha técnica';
            const doseText = data.variant?.dose || data.dose ? ` ${data.variant?.dose || data.dose}` : '';

            adminDb.collection('notifications').add({
              title: 'Confirmación de Lectura',
              message: `${recipientName}${recipientOrg} ha abierto la ficha técnica de ${compoundName}${doseText}.`,
              type: 'read_receipt',
              link: `/d/${code}`,
              targetRoles: ['admin', 'account_manager'],
              read: false,
              createdAt: now,
              metadata: {
                code,
                recipientId: data.recipient?.id || null,
                recipientType: data.recipient?.type || 'client',
                compound: compoundName,
                dose: doseText.trim(),
              }
            }).catch(err => console.warn('[ReadNotification /d] Note:', err.message));
          }
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

  // Check if request is from a social preview crawler (WhatsApp, Telegram, etc.)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isSocialCrawler = /whatsapp|facebookexternalhit|telegrambot|twitterbot|linkedinbot|slackbot|applebot/i.test(userAgent);

  // Modernize legacy URLs: seamlessly route /product/ to /p/ for clinical monograph
  if (targetUrl && targetUrl.includes('/product/')) {
    targetUrl = targetUrl.replace('/product/', '/p/');
  }

  if (isSocialCrawler) {
    return (
      <html lang="en">
        <head>
          <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
        </head>
        <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
          <p style={{ color: '#64748b' }}>Redirecting to clinical technical documentation...</p>
          <a href={targetUrl} style={{ color: '#0d9488', fontWeight: 600 }}>Click here if not redirected automatically</a>
        </body>
      </html>
    );
  }

  let effectiveRedirectUrl = targetUrl;
  if (targetUrl.includes('/rx/')) {
    const rxMatch = targetUrl.match(/\/rx\/([^/?#]+)/);
    if (rxMatch && rxMatch[1]) {
      const clean = sanitizePrescriptionCode(rxMatch[1]);
      effectiveRedirectUrl = targetUrl.replace(`/rx/${rxMatch[1]}`, `/rx/${clean}`);
    }
  }

  if (code && effectiveRedirectUrl) {
    const sep = effectiveRedirectUrl.includes('?') ? '&' : '?';
    effectiveRedirectUrl = `${effectiveRedirectUrl}${sep}tc=${encodeURIComponent(code)}`;
  }

  // Redirect instantly to the complete target URL for regular browser visitors
  redirect(effectiveRedirectUrl);
}
