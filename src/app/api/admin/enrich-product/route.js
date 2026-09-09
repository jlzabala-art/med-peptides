import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { calculateProductCompleteness } from '@/utils/calculateProductCompleteness';
import { enrichProductDocument } from '@/services/clinicalEnrichmentEngine';
import { resolveCasNumber } from '@/utils/casResolver';
import { verifyAdminAuth } from '@/lib/serverAuth';

export async function POST(request) {
  try {
    const authCheck = await verifyAdminAuth(request);
    if (!authCheck.isAuthorized) {
      return authCheck.response;
    }

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
    const rawNameToFetch = enriched.canonicalName || enriched.name || '';
    const cleanChemName = rawNameToFetch
      .replace(/\b(usp|ep|bp|ph\.?\s*eur|api|bulk|powder|pure|grade|sterile|solution)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // 1. Fetch PubChem CID and chemical properties dynamically if missing
    if (!enriched.scientificData?.pubchemCid && !enriched.pubchemCid) {
      try {
        const pubchemRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanChemName)}/cids/JSON`);
        if (pubchemRes.ok) {
          const pbData = await pubchemRes.json();
          if (pbData.IdentifierList?.CID?.[0]) {
            const cid = String(pbData.IdentifierList.CID[0]);
            enriched.pubchemCid = cid;
            if (!enriched.scientificData) enriched.scientificData = {};
            if (!enriched.molecular) enriched.molecular = {};
            enriched.scientificData.pubchemCid = cid;
            enriched.molecular.pubchemCid = cid;

            try {
              const propsRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularWeight,MolecularFormula,IUPACName/JSON`);
              if (propsRes.ok) {
                const propsData = await propsRes.json();
                const props = propsData?.PropertyTable?.Properties?.[0];
                if (props) {
                  if (props.MolecularWeight) {
                    const mwStr = `${props.MolecularWeight} g/mol`;
                    enriched.molecularWeight = mwStr;
                    enriched.scientificData.molecularWeight = mwStr;
                    enriched.molecular.molecularWeight = mwStr;
                  }
                  if (props.MolecularFormula) {
                    enriched.molecularFormula = props.MolecularFormula;
                    enriched.scientificData.molecularFormula = props.MolecularFormula;
                    enriched.molecular.molecularFormula = props.MolecularFormula;
                  }
                  if (props.IUPACName) {
                    enriched.scientificData.iupacName = props.IUPACName;
                  }
                }
              }

              // Extract CAS Number from PubChem synonyms if missing
              if (!enriched.casNumber || enriched.casNumber === 'Available on Request') {
                const synRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`);
                if (synRes.ok) {
                  const synData = await synRes.json();
                  const syns = synData?.InformationList?.Information?.[0]?.Synonym || [];
                  const foundCas = syns.find(s => /^\d{2,7}-\d{2}-\d$/.test(s.trim()));
                  if (foundCas) {
                    const cleanCas = foundCas.trim();
                    enriched.casNumber = cleanCas;
                    enriched.molecular.casNumber = cleanCas;
                    enriched.scientificData.casNumber = cleanCas;
                  }
                }
              }
            } catch (pErr) {
              console.warn('PubChem properties/synonyms fetch error:', pErr.message);
            }
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
          body: JSON.stringify({ productName: rawNameToFetch, category: enriched.category })
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
            if (aiData.data.casNumber && (!enriched.casNumber || enriched.casNumber === 'Available on Request')) {
              const aiCas = aiData.data.casNumber.trim();
              enriched.casNumber = aiCas;
              if (!enriched.molecular) enriched.molecular = {};
              if (!enriched.scientificData) enriched.scientificData = {};
              enriched.molecular.casNumber = aiCas;
              enriched.scientificData.casNumber = aiCas;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch AI Clinical Overview:', e.message);
      }
    }

    // 3. Fallback CAS resolution via casResolver
    if (!enriched.casNumber || enriched.casNumber === 'Available on Request') {
      const autoCas = await resolveCasNumber(rawNameToFetch, enriched.category || enriched.categoryId);
      if (autoCas) {
        enriched.casNumber = autoCas;
        if (!enriched.molecular) enriched.molecular = {};
        if (!enriched.scientificData) enriched.scientificData = {};
        enriched.molecular.casNumber = autoCas;
        enriched.scientificData.casNumber = autoCas;
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
