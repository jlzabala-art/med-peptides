import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sanitizeForClient } from '@/utils/sanitizeForClient';
import { calculateProductCompleteness } from '@/utils/calculateProductCompleteness';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60s ISR cache with instant revalidate capability

/**
 * GET /api/catalog/public
 * 
 * Public, secure, high-performance catalog endpoint for clients, patients, clinics, and B2B partners.
 * Query Parameters:
 *   - channel: 'b2c' | 'patient' | 'clinic' | 'wholesale' | 'b2b' (Default: 'b2c')
 *   - category: e.g. 'peptide', 'vehicle', 'supplement', 'diagnostics'
 *   - goal: e.g. 'longevity', 'tissue_repair', 'skin_hair_aesthetics'
 *   - search: text query for product name / active ingredient
 *   - limit: integer (default 100, max 200)
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const channel = (searchParams.get('channel') || 'b2c').toLowerCase();
    const category = (searchParams.get('category') || '').toLowerCase().trim();
    const goal = (searchParams.get('goal') || '').toLowerCase().trim();
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    // Fetch active/published products
    let queryRef = adminDb.collection('products')
      .where('status', 'in', ['active', 'published'])
      .limit(limit);

    if (category && category !== 'all') {
      queryRef = adminDb.collection('products')
        .where('status', 'in', ['active', 'published'])
        .where('categoryId', '==', category)
        .limit(limit);
    }

    let snapshot;
    try {
      snapshot = await queryRef.get();
    } catch {
      // Fallback without status filter if index missing
      snapshot = await adminDb.collection('products').limit(limit).get();
    }

    const products = [];
    const categoryFacets = {};
    const goalFacets = {};

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Filter out draft/archived
      if (data.status === 'draft' || data.status === 'archived' || data.status === 'disabled') {
        continue;
      }

      const canonicalName = data.canonicalName || data.name || 'Product';
      
      // Search filter
      if (search) {
        const matchesName = canonicalName.toLowerCase().includes(search);
        const matchesDesc = (data.description || '').toLowerCase().includes(search);
        const matchesTokens = Array.isArray(data.searchTokens) && data.searchTokens.some(t => String(t).toLowerCase().includes(search));
        if (!matchesName && !matchesDesc && !matchesTokens) continue;
      }

      // Goal filter
      const productGoals = Array.isArray(data.goals) ? data.goals : (data.goalIds || []);
      if (goal && goal !== 'all' && !productGoals.includes(goal) && data.primaryGoal?.toLowerCase() !== goal) {
        continue;
      }

      // Track facets
      const cat = data.categoryId || data.category || 'general';
      categoryFacets[cat] = (categoryFacets[cat] || 0) + 1;
      productGoals.forEach(g => {
        goalFacets[g] = (goalFacets[g] || 0) + 1;
      });

      // Resolve channel pricing securely
      let displayPrice = data.price || data.canonical_price_usd || 0;
      let displayCurrency = data.currency || 'USD';
      
      if (channel === 'wholesale' || channel === 'b2b') {
        displayPrice = data.wholesalePrice || data.trade_price || (displayPrice > 0 ? displayPrice * 0.7 : 0);
      } else if (channel === 'clinic') {
        displayPrice = data.clinicPrice || (displayPrice > 0 ? displayPrice * 0.8 : 0);
      }

      // Sanitize internal admin/supplier fields
      const publicProduct = {
        id: doc.id,
        slug: data.slug || doc.id,
        name: canonicalName,
        canonicalName,
        description: data.aiDescription || data.description || '',
        category: cat,
        categoryId: cat,
        subcategory: data.subcategory || '',
        productType: data.productType || data.type || 'finished_product',
        primaryGoal: data.primaryGoal || '',
        goals: productGoals,
        price: Number(displayPrice) || 0,
        currency: displayCurrency,
        inStock: data.inStock ?? (data.stock > 0 || data.availability === 'on_demand'),
        requiresColdChain: Boolean(data.requiresColdChain),
        hasCOA: Boolean(data.hasCOA),
        coaUrl: data.coaUrl || null,
        imageUrl: data.imageUrl || data.image || null,
        dosage: data.dosage || null,
        technology: data.technology || null,
        ingredients: data.ingredients || null,
        molecular: data.molecular ? {
          molecularFormula: data.molecular.molecularFormula,
          molecularWeight: data.molecular.molecularWeight,
          pubchemCid: data.molecular.pubchemCid,
          halfLife: data.molecular.halfLife
        } : null,
        variantsCount: data.variantsCount || (Array.isArray(data.variants) ? data.variants.length : 1),
        qualityScore: calculateProductCompleteness(data).score
      };

      products.push(publicProduct);
    }

    return NextResponse.json(sanitizeForClient({
      success: true,
      channel,
      total: products.length,
      facets: {
        categories: categoryFacets,
        goals: goalFacets
      },
      products
    }), {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('Public Catalog API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load catalog' }, { status: 500 });
  }
}
