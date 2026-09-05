import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { resolveCasNumber, isValidCasChecksum } from '@/utils/casResolver';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s max execution

export async function GET(request) {
  return handleBatch(request);
}

export async function POST(request) {
  return handleBatch(request);
}

async function handleBatch(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
    const dryRun = searchParams.get('dryRun') === 'true';

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore Admin SDK not initialized' }, { status: 500 });
    }

    const snap = await adminDb.collection('products').get();
    let candidates = [];

    snap.docs.forEach(doc => {
      const data = doc.data();
      const currentCas = data.casNumber || data.molecular?.casNumber || data.scientificData?.casNumber;
      const isMissing = !currentCas || currentCas === 'Available on Request' || currentCas.trim() === '';

      if (isMissing) {
        candidates.push({
          id: doc.id,
          ref: doc.ref,
          name: data.name || data.canonicalName || doc.id,
          category: data.category || data.categoryId || 'peptide',
          currentCas: currentCas || null
        });
      }
    });

    const totalMissing = candidates.length;
    const batchCandidates = candidates.slice(0, limitCount);
    const results = [];
    const batch = adminDb.batch();
    let updatedCount = 0;

    for (const item of batchCandidates) {
      try {
        const resolved = await resolveCasNumber(item.name, item.category);
        if (resolved) {
          const isValid = resolved.startsWith('N/A') || isValidCasChecksum(resolved);
          if (isValid) {
            results.push({
              id: item.id,
              name: item.name,
              category: item.category,
              casNumber: resolved,
              status: 'resolved'
            });

            if (!dryRun) {
              batch.set(
                item.ref,
                {
                  casNumber: resolved,
                  'molecular.casNumber': resolved,
                  'scientificData.casNumber': resolved,
                  updatedAt: new Date().toISOString()
                },
                { merge: true }
              );
              updatedCount++;
            }
          } else {
            results.push({
              id: item.id,
              name: item.name,
              casNumber: resolved,
              status: 'failed_checksum'
            });
          }
        } else {
          results.push({
            id: item.id,
            name: item.name,
            status: 'unresolved'
          });
        }
      } catch (err) {
        results.push({
          id: item.id,
          name: item.name,
          status: 'error',
          error: err.message
        });
      }
    }

    if (!dryRun && updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      dryRun,
      totalMissingInCatalog: totalMissing,
      processedInBatch: batchCandidates.length,
      updatedCount,
      remainingMissing: totalMissing - updatedCount,
      results
    });
  } catch (error) {
    console.error('[enrich-cas-batch] Error:', error);
    return NextResponse.json({ error: error.message || 'Batch enrichment failed' }, { status: 500 });
  }
}
