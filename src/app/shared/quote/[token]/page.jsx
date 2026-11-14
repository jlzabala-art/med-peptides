import React from 'react';
import { verifySignedQuoteToken } from '@/services/dynamicPricingEngine';
import { AlertTriangle } from 'lucide-react';
import SharedQuoteDocument from './SharedQuoteDocument';
import FocusedCardLayout from '@/components/shared/layouts/FocusedCardLayout';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token;
  const verification = verifySignedQuoteToken(token);
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

  let title = 'Official Medical Quotation • Institutional Reference';
  let description = 'Official verified quotation with locked channel pricing, pharmaceutical packaging, and certificate of analysis verification.';

  if (verification?.valid && verification.payload) {
    const payload = verification.payload;
    const clientName = payload.recipientName || payload.clientName || payload.companyName;
    if (clientName) {
      title = `Official Medical Quotation • ${clientName}`;
    }
    const count = payload.items?.length || 0;
    const currency = payload.currency || 'USD';
    description = `Verified institutional quotation${count > 0 ? ` (${count} items)` : ''} in ${currency}. Priority medical delivery terms, batch traceability, and analytical assays.`;
  }

  const previewImage = `${BASE_URL}/og-catalog.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Clinical Reference Library',
      url: `${BASE_URL}/shared/quote/${token}`,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImage],
    },
    other: {
      'og:image': previewImage,
      'og:image:secure_url': previewImage,
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title,
    },
  };
}

export default async function SharedQuotePage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token;
  const verification = verifySignedQuoteToken(token);

  if (!verification.valid) {
    return (
      <FocusedCardLayout
        icon={AlertTriangle}
        tone="danger"
        whiteLabel={true}
        title={verification.expired ? 'Quotation Expired' : 'Invalid Link'}
        subtitle={
          verification.expired
            ? 'This quotation has exceeded its validity period (48 hours) to protect against cost fluctuations. Please request an updated quotation.'
            : 'The quotation link provided has an invalid digital signature or has been revoked.'
        }
      />
    );
  }

  const quote = verification.payload;
  const expirationDate = new Date(quote.exp).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return <SharedQuoteDocument quote={quote} expirationDate={expirationDate} />;
}
