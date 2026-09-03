import React from 'react';
import { adminDb } from '../../../lib/firebaseAdmin';
import { sanitizePublicBatch } from '../../../repositories/publicDataSanitizer';
import VerifyBatchClient from './VerifyBatchClient';

export const revalidate = 86400; // ⚡ 24h Edge Cache for Batch Certificates
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://regenpept.com';

async function getBatchVerificationData(code) {
  if (!code) return null;
  const cleanCode = decodeURIComponent(code).trim().toUpperCase();

  let matchedProduct = null;
  let batchData = null;

  if (adminDb) {
    // 1. Check if direct batch doc exists in batches or coa collection
    const batchDoc = await adminDb.collection('batches').doc(cleanCode).get().catch(() => null);
    if (batchDoc && batchDoc.exists) {
      batchData = { id: batchDoc.id, ...batchDoc.data() };
    }

    // 2. Search products with matching lotNumber, batchCode, sku or id
    if (!batchData) {
      const pSnap = await adminDb.collection('products').where('batchCode', '==', cleanCode).limit(1).get().catch(() => null);
      if (pSnap && !pSnap.empty) {
        matchedProduct = { id: pSnap.docs[0].id, ...pSnap.docs[0].data() };
      }
    }

    if (!batchData && !matchedProduct) {
      const pById = await adminDb.collection('products').doc(cleanCode.toLowerCase()).get().catch(() => null);
      if (pById && pById.exists) {
        matchedProduct = { id: pById.id, ...pById.data() };
      }
    }
  }

  // 🛡️ Zero-Trust Sanitization
  return sanitizePublicBatch(batchData || { code: cleanCode }, matchedProduct);
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code || '';
  
  // 🎨 Dynamic OpenGraph preview card
  const ogImageUrl = `${BASE_URL}/api/og-card?type=verify&title=${encodeURIComponent(`Batch #${code}`)}&badge=${encodeURIComponent('VERIFIED AUTHENTIC')}&subtitle=${encodeURIComponent('Official Certificate of Analysis & HPLC Assay')}`;

  return {
    title: `Batch Verification #${code} | Atlas Health Quality & Authenticity`,
    description: `Official certificate of analysis and authenticity verification for batch #${code}.`,
    openGraph: {
      title: `Batch #${code} Authenticity Verified | Atlas App`,
      description: `Official analytical CoA and authenticity release standards.`,
      url: `${BASE_URL}/verify/${code}`,
      siteName: 'Atlas Health Quality Assurance',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Batch #${code} Certificate of Analysis`,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Batch #${code} Verified`,
      description: `Official analytical CoA and purity standards.`,
      images: [ogImageUrl],
    },
    robots: { index: false, follow: true },
  };
}

export default async function VerifyPage({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code || '';
  const verification = await getBatchVerificationData(code);

  return (
    <VerifyBatchClient 
      code={code} 
      verification={verification} 
      baseUrl={BASE_URL} 
    />
  );
}
