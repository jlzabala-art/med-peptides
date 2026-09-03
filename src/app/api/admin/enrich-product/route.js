import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { calculateProductCompleteness } from '@/utils/calculateProductCompleteness';
import { enrichProductDocument } from '@/services/clinicalEnrichmentEngine';

export async function POST(request) {
  try {
    const { productId, canonicalName, currentProduct } = await request.json();

    if (!productId && !canonicalName) {
      return NextResponse.json({ error: 'productId or canonicalName required' }, { status: 400 });
    }

    const targetId = String(productId || canonicalName || '').trim();
    let docRef = null;
    let productData = currentProduct || null;

    if (productId) {
      docRef = adminDb.collection('products').doc(productId);
      const snap = await docRef.get();
      if (snap.exists) {
        productData = { ...(currentProduct || {}), id: snap.id, ...snap.data() };
      }
    }

    if (!productData || !docRef) {
      // Find document by canonicalName or name
      const nameQuery = await adminDb.collection('products')
        .where('canonicalName', '==', canonicalName || targetId)
        .limit(1)
        .get();

      if (!nameQuery.empty) {
        const foundDoc = nameQuery.docs[0];
        docRef = foundDoc.ref;
        productData = { ...(currentProduct || {}), id: foundDoc.id, ...foundDoc.data() };
      }
    }

    if (!productData || !docRef) {
      // Fallback lookup by slug
      const slugQuery = await adminDb.collection('products')
        .where('slug', '==', targetId.toLowerCase())
        .limit(1)
        .get();

      if (!slugQuery.empty) {
        const foundDoc = slugQuery.docs[0];
        docRef = foundDoc.ref;
        productData = { ...(currentProduct || {}), id: foundDoc.id, ...foundDoc.data() };
      }
    }

    if (!productData) {
      productData = { id: targetId, name: canonicalName || targetId };
    }

    // Run authoritative clinical & molecular enrichment
    let enriched = await enrichProductDocument(productData);

    // If still missing PubChem CID or AI Description, try to fetch them dynamically
    const nameToFetch = enriched.canonicalName || enriched.name;
    
    // 1. Fetch PubChem CID dynamically if missing
    if (!enriched.scientificData?.pubchemCid && !enriched.pubchemCid) {
      try {
        const pubchemRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(nameToFetch)}/cids/JSON`);
        if (pubchemRes.ok) {
          const pbData = await pubchemRes.json();
          if (pbData.IdentifierList?.CID?.[0]) {
            const cid = String(pbData.IdentifierList.CID[0]);
            enriched.pubchemCid = cid;
            if (enriched.scientificData) enriched.scientificData.pubchemCid = cid;
            if (enriched.molecular) enriched.molecular.pubchemCid = cid;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch PubChem CID:', e.message);
      }
    }

    // 2. Fetch AI Clinical Overview if missing
    if (!enriched.aiDescription && !enriched.summary && !enriched.description) {
      try {
        const baseUrl = request.nextUrl.origin;
        const aiRes = await fetch(`${baseUrl}/api/ai-enrich-product-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName: nameToFetch, category: enriched.category })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData.success && aiData.data) {
            const overview = `${aiData.data.mechanismOfAction || ''} ${aiData.data.therapeuticIndications ? 'Indications: ' + aiData.data.therapeuticIndications.join(', ') : ''}`.trim();
            if (overview) {
              enriched.aiDescription = overview;
              enriched.description = overview;
            }
            if (!enriched.scientificData?.sequence && aiData.data.sequence) {
              enriched.sequence = aiData.data.sequence;
              if (enriched.scientificData) enriched.scientificData.sequence = aiData.data.sequence;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch AI Clinical Overview:', e.message);
      }
    }

    // Ensure canonical taxonomy before write
    enriched.categoryId = enriched.categoryId || enriched.category || 'peptide';
    enriched.category = enriched.categoryId;
    enriched.type = enriched.type || enriched.productType || 'finished_product';
    enriched.productType = enriched.type;

    let enrichedVariants = [];

    // Save to Firestore via Admin SDK
    if (docRef) {
      await docRef.set(enriched, { merge: true });

      // Enrich all variants in the subcollection
      const variantsSnap = await docRef.collection('variants').get();
      if (!variantsSnap.empty) {
        const batch = adminDb.batch();
        const { normalizeProductMeta } = require('@/utils/productNormalizer');
        
        variantsSnap.docs.forEach(vDoc => {
          const vData = vDoc.data();
          const normalized = normalizeProductMeta(vData);
          const vType = normalized.productType === 'raw_material' ? 'raw_material' : (normalized.productType === 'clinical_supplies' ? 'clinical_supplies' : 'finished_product');
          
          const enrichedVariant = {
            ...vData,
            presentation: normalized.presentation || vData.presentation,
            dosage: normalized.dosage || vData.dosage,
            type: vType,
            categoryId: enriched.categoryId,
            category: enriched.categoryId,
            subcategory: normalized.subcategory || vData.subcategory,
            supplier: normalized.supplier || vData.supplier || vData.supplierName,
            updatedAt: new Date().toISOString()
          };

          batch.set(vDoc.ref, enrichedVariant, { merge: true });
          enrichedVariants.push({ id: vDoc.id, ...enrichedVariant });
        });
        
        await batch.commit();
      }
    }

    const newCompleteness = calculateProductCompleteness(enriched);

    return NextResponse.json({
      success: true,
      product: enriched,
      variants: enrichedVariants,
      completeness: newCompleteness
    });

  } catch (error) {
    console.error('Enrich Product API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to enrich product' }, { status: 500 });
  }
}
