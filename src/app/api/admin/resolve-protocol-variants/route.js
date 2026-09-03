import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { productId, canonicalName } = await request.json();

    if (!productId && !canonicalName) {
      return NextResponse.json({ error: 'productId or canonicalName is required' }, { status: 400 });
    }

    const docId = productId || canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const prodDoc = await adminDb.collection('products').doc(docId).get();

    if (!prodDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const prodData = prodDoc.data();

    // Fetch variants subcollection on the server
    const variantsSnap = await adminDb.collection('products').doc(docId).collection('variants').get();
    const variants = variantsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Resolve preferred supplier variant (starred or lowest price)
    let preferredVariant = variants.find(v => v.isPreferred || v.starred);
    if (!preferredVariant && variants.length > 0) {
      preferredVariant = [...variants].sort((a, b) => (a.price || 0) - (b.price || 0))[0];
    }

    return NextResponse.json({
      success: true,
      product: {
        id: prodDoc.id,
        canonicalName: prodData.canonicalName || prodData.name,
        category: prodData.category,
        protocolCount: prodData.protocolCount || 0,
        prescriptionCount: prodData.prescriptionCount || 0,
        orderCount: prodData.orderCount || 0,
        reconstitutionGuide: prodData.reconstitutionGuide || 'Reconstitute with Bacteriostatic Water (0.9% Benzyl Alcohol).',
        purity: prodData.purity || '≥ 99% (HPLC Verified)'
      },
      preferredVariant: preferredVariant || null,
      totalVariants: variants.length
    });

  } catch (error) {
    console.error('Server resolve-protocol-variants error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
